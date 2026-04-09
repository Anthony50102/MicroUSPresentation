"use client";

import { useSimulation } from "@/lib/simulation/SimulationContext";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ---- Constants ----
const CONVEYOR_Y = 248;
const CONVEYOR_H = 12;
const PICK_X = 90;
const PLACE_X = 210;
const ARM_BASE_X = 150;
const ARM_BASE_Y = 230;
const UPPER_LEN = 55;
const LOWER_LEN = 50;

// Bin dimensions (open-top container)
const BIN_LEFT = PLACE_X - 20;
const BIN_RIGHT = PLACE_X + 20;
const BIN_TOP = CONVEYOR_Y - 28;
const BIN_BOTTOM = CONVEYOR_Y + 12;

// Conveyor extends just past the pick zone
const CONVEYOR_W = PICK_X + 20;

// Arm pose keyframes: shoulder rotates upper arm from base; elbow is additive
type ArmPose = { shoulder: number; elbow: number; grip: number };

// IK-solved poses — computed via 2-link IK treating upper (55) + lower+prong (50+14=64)
// as effective segments. Prong tips reach (PICK_X, ~254) and (PLACE_X, ~234).
const POSES: Record<string, ArmPose> = {
  idle:      { shoulder: -30,  elbow: -30,  grip: 8 },
  reachDown: { shoulder: -48,  elbow: -115, grip: 8 },
  grab:      { shoulder: -48,  elbow: -115, grip: 2 },
  liftUp:    { shoulder: -30,  elbow: -40,  grip: 2 },
  swingOver: { shoulder: 20,   elbow: -40,  grip: 2 },
  placeDown: { shoulder: 26,   elbow: 120,  grip: 2 },
  release:   { shoulder: 26,   elbow: 120,  grip: 8 },
  returnUp:  { shoulder: 0,    elbow: -30,  grip: 8 },
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

interface FallingPart {
  id: number;
  x: number;
  y: number;
  vy: number;
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

  // Falling parts — missed placements that drop with gravity
  const [fallingParts, setFallingParts] = useState<FallingPart[]>([]);

  // Refs to avoid stale closures in interval callbacks
  const partsRef = useRef(parts);
  partsRef.current = parts;
  const carriedRef = useRef(carriedPartColor);
  carriedRef.current = carriedPartColor;

  // Cycle speed based on simulation cycleTime (slower when bearing-wear)
  const stepDuration = anomaly === "bearing-wear" ? 500 : 320;

  // Advance arm cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setPoseIdx((prev) => {
        const next = (prev + 1) % CYCLE_SEQUENCE.length;
        const poseName = CYCLE_SEQUENCE[next];

        // Wait at idle — don't reach down until a part is centered in the pick zone
        // The arm takes 1 step (~320ms) from reachDown→grab, part moves ~4px in that time
        if (poseName === "reachDown") {
          const nearPick = partsRef.current.some(
            (p) => !p.picked && !p.placed && p.x >= PICK_X - 6 && p.x <= PICK_X + 6
          );
          if (!nearPick) return prev;
        }

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
          setParts((prevParts) => {
            const pickable = prevParts.find((p) => !p.picked && !p.placed && p.x >= PICK_X - 15 && p.x <= PICK_X + 15);
            if (pickable) {
              // Gripper-slip: sometimes fails to pick
              if (anomaly === "gripper-slip" && Math.random() < 0.4) {
                setCarriedPartColor(null);
                return prevParts;
              }
              setCarriedPartColor(pickable.color);
              return prevParts.map((p) => (p.id === pickable.id ? { ...p, picked: true } : p));
            }
            return prevParts;
          });
        }

        // Handle part placing — drop into bin or miss
        if (poseName === "release" && carriedRef.current) {
          const isMiss = anomaly === "calibration-drift" || Math.random() < 0.1;

          if (isMiss) {
            // Compute gripper tip position from the (possibly drifted) release pose
            const sRad = (nextPose.shoulder * Math.PI) / 180;
            const eWorldRad = ((nextPose.shoulder + nextPose.elbow) * Math.PI) / 180;
            const eX = ARM_BASE_X + Math.sin(sRad) * UPPER_LEN;
            const eY = ARM_BASE_Y - Math.cos(sRad) * UPPER_LEN;
            const wX = eX + Math.sin(eWorldRad) * LOWER_LEN;
            const wY = eY - Math.cos(eWorldRad) * LOWER_LEN;
            const tipX = wX + Math.sin(eWorldRad) * 14;
            const tipY = wY - Math.cos(eWorldRad) * 14;

            setFallingParts((fp) => [
              ...fp,
              { id: Date.now(), x: tipX - 5, y: tipY - 3.5, vy: 0, color: carriedRef.current! },
            ]);
          } else {
            const placementOffset = anomaly === "calibration-drift" ? (Math.random() - 0.5) * 10 : 0;
            setBinParts((prevBin) => {
              const newParts = [...prevBin, { id: Date.now(), color: carriedRef.current!, offset: placementOffset, age: 0 }];
              return newParts.slice(-5);
            });
          }
          setCarriedPartColor(null);
        }

        return next;
      });
    }, stepDuration);
    return () => clearInterval(interval);
  }, [anomaly, stepDuration]);

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

  // Gravity tick for falling parts
  useEffect(() => {
    const interval = setInterval(() => {
      setFallingParts((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((p) => ({ ...p, vy: p.vy + 0.5, y: p.y + p.vy }))
          .filter((p) => p.y < 300);
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const jointColor = (status: string) =>
    status === "error" ? "#DC2626" : status === "warn" ? "#EA580C" : "#16A34A";

  // Bearing-wear shake on the whole arm group (subtle)
  const armShake = anomaly === "bearing-wear" ? {
    x: [0, -0.75, 0.75, -0.5, 0.5, 0],
    y: [0, 0.5, -0.5, 0.25, -0.25, 0],
  } : { x: 0, y: 0 };

  // Compute arm segment endpoints from pose angles
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

  const transitionDur = stepDuration / 1000 * 0.8;
  const gripDur = stepDuration / 1000 * 0.6;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      <div className="relative w-full max-w-lg aspect-[5/4] flex items-center justify-center">
        <svg viewBox="0 0 300 290" className="w-full h-full">
          {/* Background grid lines for industrial feel */}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`g${i}`} x1={0} y1={i * 45} x2={300} y2={i * 45} stroke="#94A3B820" strokeWidth={0.5} />
          ))}

          {/* Clip path for conveyor parts */}
          <defs>
            <clipPath id="conveyor-clip">
              <rect x={0} y={CONVEYOR_Y - 1} width={CONVEYOR_W} height={CONVEYOR_H + 6} />
            </clipPath>
          </defs>

          {/* === CONVEYOR BELT === */}
          {/* Belt surface */}
          <rect x={0} y={CONVEYOR_Y} width={CONVEYOR_W} height={CONVEYOR_H} rx={2} fill="#334155" />
          {/* Belt rollers */}
          {Array.from({ length: 6 }, (_, i) => (
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

          {/* === OUTPUT BIN (open-top) === */}
          <path
            d={`M ${BIN_LEFT},${BIN_TOP} V ${BIN_BOTTOM} H ${BIN_RIGHT} V ${BIN_TOP}`}
            fill="none"
            stroke="#16A34A60"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x={PLACE_X - 6} y={BIN_BOTTOM + 10} fontSize="5" fill="#16A34A80" fontFamily="monospace">BIN</text>

          {/* Parts in bin — stack up and fade out */}
          {binParts.map((p, i) => (
            <motion.rect
              key={p.id}
              x={PLACE_X - 5 + p.offset}
              y={BIN_BOTTOM - 6 - i * 5}
              width={10}
              height={4}
              rx={1}
              fill={p.color}
              initial={{ opacity: 0.9, scale: 1 }}
              animate={{ opacity: Math.max(0, 1 - p.age * 0.15), scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}

          {/* === CONVEYOR PARTS (clipped to belt bounds) === */}
          <g clipPath="url(#conveyor-clip)">
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
          </g>

          {/* === FALLING PARTS (missed placements) === */}
          {fallingParts.map((p) => (
            <rect
              key={p.id}
              x={p.x}
              y={p.y}
              width={10}
              height={7}
              rx={1.5}
              fill={p.color}
              opacity={0.85}
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
              transition={{ duration: transitionDur, ease: "easeInOut" }}
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
              transition={{ duration: transitionDur, ease: "easeInOut" }}
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
              transition={{ duration: transitionDur, ease: "easeInOut" }}
            />

            {/* Wrist joint */}
            <motion.circle
              cx={wristX} cy={wristY} r={5}
              fill={jointColor(joints[2].status)}
              stroke="#FFF" strokeWidth={1.5}
              initial={false}
              animate={{ cx: wristX, cy: wristY }}
              transition={{ duration: transitionDur, ease: "easeInOut" }}
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
              transition={{ duration: gripDur, ease: "easeInOut" }}
            />
            <motion.line
              x1={wristX} y1={wristY}
              x2={rightProngX} y2={rightProngY}
              stroke="#94A3B8"
              strokeWidth={3}
              strokeLinecap="round"
              initial={false}
              animate={{ x1: wristX, y1: wristY, x2: rightProngX, y2: rightProngY }}
              transition={{ duration: gripDur, ease: "easeInOut" }}
            />

            {/* Gripper joint */}
            <motion.circle
              cx={wristX} cy={wristY} r={3.5}
              fill={jointColor(joints[3].status)}
              stroke="#FFF" strokeWidth={1}
              initial={false}
              animate={{ cx: wristX, cy: wristY }}
              transition={{ duration: transitionDur, ease: "easeInOut" }}
            />

            {/* Carried part — motion.rect that animates with arm, initial matches animate to prevent fly-in */}
            {carriedPartColor && (() => {
              const tipMidX = (leftProngX + rightProngX) / 2;
              const tipMidY = (leftProngY + rightProngY) / 2;
              return (
                <motion.rect
                  width={10}
                  height={7}
                  rx={1.5}
                  fill={carriedPartColor}
                  opacity={0.95}
                  initial={{ x: tipMidX - 5, y: tipMidY - 3.5 }}
                  animate={{ x: tipMidX - 5, y: tipMidY - 3.5 }}
                  transition={{ duration: transitionDur, ease: "easeInOut" }}
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
