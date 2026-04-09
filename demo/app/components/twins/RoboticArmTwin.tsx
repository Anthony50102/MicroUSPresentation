"use client";

import { useSimulation } from "@/lib/simulation/SimulationContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// ---- Constants ----
const CONVEYOR_Y = 248;
const CONVEYOR_H = 12;
const PICK_X = 90;
const PLACE_X = 210;
const ARM_BASE_X = 150;
const ARM_BASE_Y = 230;

// Arm pose keyframes: [shoulderAngle, elbowAngle, gripOpen]
// Shoulder rotates the whole upper arm; elbow bends the forearm
type ArmPose = { shoulder: number; elbow: number; grip: number };

const POSES: Record<string, ArmPose> = {
  idle:      { shoulder: -30, elbow: -30, grip: 8 },   // upright, open
  reachDown: { shoulder: -65, elbow: 20,  grip: 8 },   // reaching to pick
  grab:      { shoulder: -65, elbow: 20,  grip: 2 },   // closed grip
  liftUp:    { shoulder: -30, elbow: -30, grip: 2 },   // lifting part
  swingOver: { shoulder: 30,  elbow: -30, grip: 2 },   // swung to place side
  placeDown: { shoulder: 55,  elbow: 15,  grip: 2 },   // lowering to place
  release:   { shoulder: 55,  elbow: 15,  grip: 8 },   // opened, released
  returnUp:  { shoulder: 30,  elbow: -30, grip: 8 },   // swinging back
};

const CYCLE_SEQUENCE: (keyof typeof POSES)[] = [
  "idle", "reachDown", "grab", "liftUp", "swingOver", "placeDown", "release", "returnUp",
];

// Parts on conveyor
interface ConveyorPart {
  id: number;
  x: number;
  picked: boolean;
  placed: boolean;
  color: string;
}

const PART_COLORS = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];

export default function RoboticArmTwin() {
  const { state } = useSimulation();

  const joints = [1, 2, 3, 4].map((i) => ({
    temp: state?.metrics[`j${i}Temp`] ?? 50,
    vibration: state?.metrics[`j${i}Vibration`] ?? 1.2,
    status: (state?.statuses[`joint${i}`] ?? "ok") as string,
  }));
  const accuracy = state?.metrics.placementAccuracy ?? 0.02;
  const cycles = state?.metrics.cycleCount ?? 142380;
  const cycleTime = state?.metrics.cycleTime ?? 1.4;
  const gripperForce = state?.metrics.gripperForce ?? 12;
  const anomaly = state?.anomalyActive ?? null;

  // Arm pose state
  const [poseIdx, setPoseIdx] = useState(0);
  const [pose, setPose] = useState<ArmPose>(POSES.idle);

  // Conveyor parts — start with one approaching and one queued
  const [parts, setParts] = useState<ConveyorPart[]>(() => [
    { id: 0, x: 40, picked: false, placed: false, color: PART_COLORS[0] },
    { id: 1, x: -50, picked: false, placed: false, color: PART_COLORS[1] },
  ]);
  const [nextPartId, setNextPartId] = useState(2);
  const [carriedPartColor, setCarriedPartColor] = useState<string | null>(null);

  // Bin parts — fade out after landing
  const [binParts, setBinParts] = useState<{ id: number; color: string; offset: number; age: number }[]>([]);

  // Cycle speed based on simulation cycleTime (slower when bearing-wear)
  const stepDuration = anomaly === "bearing-wear" ? 500 : 320;

  // Advance arm cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setPoseIdx((prev) => {
        const next = (prev + 1) % CYCLE_SEQUENCE.length;
        const poseName = CYCLE_SEQUENCE[next];
        const nextPose = { ...POSES[poseName] };

        // Anomaly: calibration-drift adds random offset to place position
        if (anomaly === "calibration-drift" && (poseName === "placeDown" || poseName === "release")) {
          nextPose.shoulder += (Math.random() - 0.5) * 15;
          nextPose.elbow += (Math.random() - 0.5) * 10;
        }

        // Anomaly: gripper-slip — grip doesn't close fully
        if (anomaly === "gripper-slip" && poseName === "grab") {
          nextPose.grip = 5; // doesn't close all the way
        }

        setPose(nextPose);

        // Handle part picking
        if (poseName === "grab") {
          setParts((prev) => {
            const pickable = prev.find((p) => !p.picked && !p.placed && p.x >= PICK_X - 15 && p.x <= PICK_X + 15);
            if (pickable) {
              setCarriedPartColor(pickable.color);
              // Gripper-slip: sometimes fails to pick
              if (anomaly === "gripper-slip" && Math.random() < 0.4) {
                setCarriedPartColor(null);
                return prev;
              }
              return prev.map((p) => (p.id === pickable.id ? { ...p, picked: true } : p));
            }
            return prev;
          });
        }

        // Handle part placing — drop into bin
        if (poseName === "release" && carriedPartColor) {
          const placementOffset = anomaly === "calibration-drift" ? (Math.random() - 0.5) * 10 : 0;
          setBinParts((prev) => {
            const newParts = [...prev, { id: Date.now(), color: carriedPartColor!, offset: placementOffset, age: 0 }];
            return newParts.slice(-5);
          });
          setCarriedPartColor(null);
        }

        return next;
      });
    }, stepDuration);
    return () => clearInterval(interval);
  }, [anomaly, stepDuration, carriedPartColor]);

  // Advance conveyor — slower, less frequent parts
  useEffect(() => {
    const interval = setInterval(() => {
      setParts((prev) => {
        let updated = prev.map((p) =>
          p.picked ? p : { ...p, x: p.x + 0.6 }
        );
        // Remove parts past pick zone that weren't picked
        updated = updated.filter((p) => p.x < PICK_X + 30 || p.picked);
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Spawn new parts infrequently — one every ~4 arm cycles
  useEffect(() => {
    const interval = setInterval(() => {
      setParts((prev) => {
        const onBelt = prev.filter((p) => !p.picked);
        // Only spawn if fewer than 2 on belt and none near the start
        if (onBelt.length < 2 && onBelt.every((p) => p.x > 30)) {
          const id = nextPartId;
          setNextPartId((n) => n + 1);
          return [...prev, { id, x: -20, picked: false, placed: false, color: PART_COLORS[id % PART_COLORS.length] }];
        }
        return prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [nextPartId]);

  // Age out bin parts (fade then remove)
  useEffect(() => {
    const interval = setInterval(() => {
      setBinParts((prev) =>
        prev.map((p) => ({ ...p, age: p.age + 1 })).filter((p) => p.age < 8)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const jointColor = (status: string) =>
    status === "error" ? "#DC2626" : status === "warn" ? "#EA580C" : "#16A34A";

  // Bearing-wear shake on the whole arm group
  const armShake = anomaly === "bearing-wear" ? {
    x: [0, -1.5, 1.5, -1, 1, 0],
    y: [0, 1, -1, 0.5, -0.5, 0],
  } : { x: 0, y: 0 };

  // Compute arm segment endpoints from pose angles
  const UPPER_LEN = 55;
  const LOWER_LEN = 50;
  const shoulderRad = (pose.shoulder * Math.PI) / 180;
  const elbowWorldAngle = pose.shoulder + pose.elbow;
  const elbowRad = (elbowWorldAngle * Math.PI) / 180;

  const elbowX = ARM_BASE_X + Math.sin(shoulderRad) * UPPER_LEN;
  const elbowY = ARM_BASE_Y - Math.cos(shoulderRad) * UPPER_LEN;
  const wristX = elbowX + Math.sin(elbowRad) * LOWER_LEN;
  const wristY = elbowY - Math.cos(elbowRad) * LOWER_LEN;

  // Gripper prongs
  const gripAngle = elbowWorldAngle;
  const gripRad = (gripAngle * Math.PI) / 180;
  const gripPerp = gripRad + Math.PI / 2;
  const prongLen = 14;
  const leftProngX = wristX + Math.cos(gripPerp) * pose.grip + Math.sin(gripRad) * prongLen;
  const leftProngY = wristY + Math.sin(gripPerp) * pose.grip - Math.cos(gripRad) * prongLen;
  const rightProngX = wristX - Math.cos(gripPerp) * pose.grip + Math.sin(gripRad) * prongLen;
  const rightProngY = wristY - Math.sin(gripPerp) * pose.grip - Math.cos(gripRad) * prongLen;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      <div className="relative w-full max-w-lg aspect-[5/4] flex items-center justify-center">
        <svg viewBox="0 0 300 290" className="w-full h-full">
          {/* Background grid lines for industrial feel */}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`g${i}`} x1={0} y1={i * 45} x2={300} y2={i * 45} stroke="#94A3B820" strokeWidth={0.5} />
          ))}

          {/* === CONVEYOR BELT === */}
          {/* Belt surface */}
          <rect x={0} y={CONVEYOR_Y} width={170} height={CONVEYOR_H} rx={2} fill="#334155" />
          {/* Belt rollers */}
          {Array.from({ length: 9 }, (_, i) => (
            <motion.line
              key={`r${i}`}
              x1={10 + i * 19} y1={CONVEYOR_Y + 1}
              x2={10 + i * 19} y2={CONVEYOR_Y + CONVEYOR_H - 1}
              stroke="#475569"
              strokeWidth={2}
              animate={{ x1: [0, 19], x2: [0, 19] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
          ))}
          {/* Belt label */}
          <text x={5} y={CONVEYOR_Y - 4} fontSize="6" fill="#64748B" fontFamily="monospace">INPUT CONVEYOR</text>

          {/* === OUTPUT BIN === */}
          {/* Bin container */}
          <rect x={PLACE_X - 14} y={CONVEYOR_Y - 20} width={28} height={32} rx={2} fill="none" stroke="#16A34A60" strokeWidth={1.5} />
          <rect x={PLACE_X - 13} y={CONVEYOR_Y + 10} width={26} height={2} rx={1} fill="#16A34A40" />
          <text x={PLACE_X - 10} y={CONVEYOR_Y + CONVEYOR_H + 10} fontSize="5" fill="#16A34A80" fontFamily="monospace">BIN</text>

          {/* Parts in bin — stack up and fade out */}
          {binParts.map((p, i) => (
            <motion.rect
              key={p.id}
              x={PLACE_X - 5 + p.offset}
              y={CONVEYOR_Y + 4 - i * 5}
              width={10}
              height={4}
              rx={1}
              fill={p.color}
              initial={{ opacity: 0.9, scale: 1 }}
              animate={{ opacity: Math.max(0, 1 - p.age * 0.15), scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}

          {/* === CONVEYOR PARTS (incoming) === */}
          {parts.filter((p) => !p.picked).map((p) => (
            <rect
              key={p.id}
              x={p.x}
              y={CONVEYOR_Y + 2}
              width={14}
              height={8}
              rx={2}
              fill={p.color}
              opacity={0.9}
            />
          ))}

          {/* Pick zone indicator */}
          <rect x={PICK_X - 12} y={CONVEYOR_Y - 2} width={24} height={CONVEYOR_H + 4} rx={2} fill="none" stroke="#3B82F640" strokeWidth={1} strokeDasharray="3 2" />
          <text x={PICK_X - 8} y={CONVEYOR_Y + CONVEYOR_H + 10} fontSize="5" fill="#3B82F680" fontFamily="monospace">PICK</text>

          {/* === ARM BASE === */}
          <rect x={ARM_BASE_X - 18} y={ARM_BASE_Y} width={36} height={14} rx={3} fill="#475569" />
          <rect x={ARM_BASE_X - 10} y={ARM_BASE_Y + 10} width={20} height={8} rx={2} fill="#334155" />

          {/* === ROBOTIC ARM (animated group) === */}
          <motion.g
            animate={armShake}
            transition={anomaly === "bearing-wear" ? { repeat: Infinity, duration: 0.15, ease: "easeInOut" } : { duration: 0.3 }}
          >
            {/* Upper arm segment */}
            <motion.line
              x1={ARM_BASE_X} y1={ARM_BASE_Y}
              x2={elbowX} y2={elbowY}
              stroke="#2563EB"
              strokeWidth={8}
              strokeLinecap="round"
              initial={false}
              animate={{ x2: elbowX, y2: elbowY }}
              transition={{ duration: stepDuration / 1000 * 0.8, ease: "easeInOut" }}
            />

            {/* Lower arm segment */}
            <motion.line
              x1={elbowX} y1={elbowY}
              x2={wristX} y2={wristY}
              stroke="#7C3AED"
              strokeWidth={6}
              strokeLinecap="round"
              initial={false}
              animate={{ x1: elbowX, y1: elbowY, x2: wristX, y2: wristY }}
              transition={{ duration: stepDuration / 1000 * 0.8, ease: "easeInOut" }}
            />

            {/* Shoulder joint (base) */}
            <motion.circle
              cx={ARM_BASE_X} cy={ARM_BASE_Y} r={7}
              fill={jointColor(joints[0].status)}
              stroke="#FFF" strokeWidth={1.5}
            />

            {/* Elbow joint */}
            <motion.circle
              cx={elbowX} cy={elbowY} r={6}
              fill={jointColor(joints[1].status)}
              stroke="#FFF" strokeWidth={1.5}
              initial={false}
              animate={{ cx: elbowX, cy: elbowY }}
              transition={{ duration: stepDuration / 1000 * 0.8, ease: "easeInOut" }}
            />

            {/* Wrist joint */}
            <motion.circle
              cx={wristX} cy={wristY} r={5}
              fill={jointColor(joints[2].status)}
              stroke="#FFF" strokeWidth={1.5}
              initial={false}
              animate={{ cx: wristX, cy: wristY }}
              transition={{ duration: stepDuration / 1000 * 0.8, ease: "easeInOut" }}
            />

            {/* Gripper prongs */}
            <motion.line
              x1={wristX} y1={wristY}
              x2={leftProngX} y2={leftProngY}
              stroke="#94A3B8"
              strokeWidth={3}
              strokeLinecap="round"
              initial={false}
              animate={{ x1: wristX, y1: wristY, x2: leftProngX, y2: leftProngY }}
              transition={{ duration: stepDuration / 1000 * 0.6, ease: "easeInOut" }}
            />
            <motion.line
              x1={wristX} y1={wristY}
              x2={rightProngX} y2={rightProngY}
              stroke="#94A3B8"
              strokeWidth={3}
              strokeLinecap="round"
              initial={false}
              animate={{ x1: wristX, y1: wristY, x2: rightProngX, y2: rightProngY }}
              transition={{ duration: stepDuration / 1000 * 0.6, ease: "easeInOut" }}
            />

            {/* Gripper joint */}
            <motion.circle
              cx={wristX} cy={wristY} r={3.5}
              fill={jointColor(joints[3].status)}
              stroke="#FFF" strokeWidth={1}
              initial={false}
              animate={{ cx: wristX, cy: wristY }}
              transition={{ duration: stepDuration / 1000 * 0.8, ease: "easeInOut" }}
            />

            {/* Carried part — positioned between gripper prong tips */}
            {carriedPartColor && (() => {
              const tipMidX = (leftProngX + rightProngX) / 2;
              const tipMidY = (leftProngY + rightProngY) / 2;
              return (
                <motion.rect
                  x={tipMidX - 5}
                  y={tipMidY - 3.5}
                  width={10}
                  height={7}
                  rx={1.5}
                  fill={carriedPartColor}
                  opacity={0.95}
                  initial={false}
                  animate={{ x: tipMidX - 5, y: tipMidY - 3.5 }}
                  transition={{ duration: stepDuration / 1000 * 0.8, ease: "easeInOut" }}
                />
              );
            })()}
          </motion.g>

          {/* === HUD OVERLAY === */}
          {/* Top-left: title + stats */}
          <text x="8" y="14" fontSize="8" fill="#94A3B8" fontFamily="monospace" fontWeight="bold">
            UR10e PICK &amp; PLACE
          </text>
          <text x="8" y="26" fontSize="6.5" fill="#64748B" fontFamily="monospace">
            Cycles: {cycles.toLocaleString()} | ±{accuracy}mm | {cycleTime}s/cycle
          </text>
          <text x="8" y="37" fontSize="6.5" fill="#64748B" fontFamily="monospace">
            Gripper: {gripperForce}N
          </text>

          {/* Joint status row */}
          {joints.map((j, i) => (
            <g key={i}>
              <circle cx={12 + i * 32} cy={52} r={3.5} fill={jointColor(j.status)} />
              <text x={18 + i * 32} y={54} fontSize="6" fill="#94A3B8" fontFamily="monospace">
                J{i + 1}
              </text>
            </g>
          ))}

          {/* Anomaly banner */}
          {anomaly && (
            <motion.g
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <rect x={170} y={6} width={124} height={18} rx={4} fill="#DC262620" stroke="#DC262660" strokeWidth={0.5} />
              <text x={180} y={18} fontSize="7" fill="#DC2626" fontFamily="monospace" fontWeight="bold">
                ⚠ {anomaly.toUpperCase()}
              </text>
            </motion.g>
          )}

          {/* Legend */}
          <g>
            <circle cx={230} cy={42} r={3} fill="#16A34A" />
            <text x={236} y={44} fontSize="5.5" fill="#94A3B8" fontFamily="monospace">OK</text>
            <circle cx={255} cy={42} r={3} fill="#EA580C" />
            <text x={261} y={44} fontSize="5.5" fill="#EA580C" fontFamily="monospace">WARN</text>
            <circle cx={284} cy={42} r={3} fill="#DC2626" />
            <text x={290} y={44} fontSize="5.5" fill="#DC2626" fontFamily="monospace">ERR</text>
          </g>
        </svg>
      </div>

      <p className="text-xs text-muted text-center max-w-sm">
        Pick &amp; place assembly line. Try: &quot;inject bearing-wear&quot;, &quot;inject calibration-drift&quot;, &quot;inject gripper-slip&quot;.
      </p>
    </div>
  );
}
