"use client";

import { useSimulation } from "@/lib/simulation/SimulationContext";
import { motion } from "framer-motion";

export default function RoboticArmTwin() {
  const { state } = useSimulation();

  const joints = [1, 2, 3, 4].map((i) => ({
    temp: state?.metrics[`j${i}Temp`] ?? 50,
    vibration: state?.metrics[`j${i}Vibration`] ?? 1.2,
    status: state?.statuses[`joint${i}`] ?? "ok",
  }));
  const accuracy = state?.metrics.placementAccuracy ?? 0.02;
  const cycles = state?.metrics.cycleCount ?? 142380;
  const isBearingWear = state?.anomalyActive === "bearing-wear";

  const jointColor = (status: string) =>
    status === "error" ? "#DC2626" : status === "warn" ? "#EA580C" : "#16A34A";
  const jointIcon = (status: string) =>
    status === "error" ? "❌" : status === "warn" ? "⚠️" : "✅";

  // Vibration shake amount based on joint status
  const shakeAmount = (status: string) =>
    status === "error" ? 3 : status === "warn" ? 1.5 : 0;
  const shakeDuration = (status: string) =>
    status === "error" ? 0.08 : 0.12;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="w-full h-full max-w-xs">
          {/* Base */}
          <rect x="110" y="260" width="80" height="20" rx="4" fill="#475569" />
          <rect x="130" y="240" width="40" height="25" rx="4" fill="#64748B" />

          {/* Segment 1 (lower arm) */}
          <rect x="140" y="170" width="20" height="75" rx="6" fill="#2563EB" opacity="0.8" />

          {/* Joint 1 — animated */}
          <motion.circle
            cx={150} cy={240} r={8}
            fill={jointColor(joints[0].status)}
            stroke="#FFF" strokeWidth={2}
            animate={shakeAmount(joints[0].status) > 0
              ? { x: [-shakeAmount(joints[0].status), shakeAmount(joints[0].status), -shakeAmount(joints[0].status)] }
              : { x: 0 }
            }
            transition={shakeAmount(joints[0].status) > 0
              ? { repeat: Infinity, duration: shakeDuration(joints[0].status), ease: "easeInOut" }
              : { duration: 0.3 }
            }
          />

          {/* Joint 2 — animated */}
          <motion.circle
            cx={150} cy={170} r={10}
            fill={jointColor(joints[1].status)}
            stroke="#FFF" strokeWidth={2}
            animate={shakeAmount(joints[1].status) > 0
              ? { y: [-shakeAmount(joints[1].status), shakeAmount(joints[1].status), -shakeAmount(joints[1].status)] }
              : { y: 0 }
            }
            transition={shakeAmount(joints[1].status) > 0
              ? { repeat: Infinity, duration: shakeDuration(joints[1].status), ease: "easeInOut" }
              : { duration: 0.3 }
            }
          />
          <text x="170" y="174" fontSize="9" fill="#94A3B8" fontFamily="monospace">
            J2 {jointIcon(joints[1].status)}
          </text>

          {/* Segment 2 (upper arm) — subtle idle oscillation */}
          <motion.rect
            x={140} y={100} width={20} height={75} rx={6}
            fill="#7C3AED" opacity={0.8}
            animate={{ rotate: [-15.5, -14.5, -15.5] }}
            style={{ originX: "150px", originY: "140px" }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />

          {/* Joint 3 — animated, pulse when bearing-wear */}
          <motion.circle
            cx={140} cy={105}
            r={10}
            fill={jointColor(joints[2].status)}
            stroke="#FFF" strokeWidth={2}
            animate={
              isBearingWear
                ? { r: [10, 14, 10], x: [-shakeAmount(joints[2].status), shakeAmount(joints[2].status), -shakeAmount(joints[2].status)] }
                : shakeAmount(joints[2].status) > 0
                  ? { x: [-shakeAmount(joints[2].status), shakeAmount(joints[2].status), -shakeAmount(joints[2].status)] }
                  : { x: 0 }
            }
            transition={
              isBearingWear
                ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
                : shakeAmount(joints[2].status) > 0
                  ? { repeat: Infinity, duration: shakeDuration(joints[2].status), ease: "easeInOut" }
                  : { duration: 0.3 }
            }
          />
          <text x="155" y="109" fontSize="9" fill={jointColor(joints[2].status)} fontFamily="monospace" fontWeight="bold">
            J3 {jointIcon(joints[2].status)}
          </text>

          {/* Joint 4 / Gripper */}
          <rect x="120" y="70" width="12" height="30" rx="3" fill="#64748B" transform="rotate(-20, 126, 85)" />
          <rect x="140" y="70" width="12" height="30" rx="3" fill="#64748B" transform="rotate(5, 146, 85)" />
          <motion.circle
            cx={130} cy={70} r={6}
            fill={jointColor(joints[3].status)}
            stroke="#FFF" strokeWidth={1.5}
            animate={shakeAmount(joints[3].status) > 0
              ? { x: [-shakeAmount(joints[3].status), shakeAmount(joints[3].status), -shakeAmount(joints[3].status)], y: [-shakeAmount(joints[3].status) * 0.5, shakeAmount(joints[3].status) * 0.5, -shakeAmount(joints[3].status) * 0.5] }
              : { x: 0, y: 0 }
            }
            transition={shakeAmount(joints[3].status) > 0
              ? { repeat: Infinity, duration: shakeDuration(joints[3].status), ease: "easeInOut" }
              : { duration: 0.3 }
            }
          />

          {/* Legend */}
          <text x="20" y="30" fontSize="10" fill="#94A3B8" fontFamily="monospace">
            PICK &amp; PLACE ARM
          </text>
          <text x="20" y="48" fontSize="8" fill="#94A3B8" fontFamily="monospace">
            Cycles: {cycles.toLocaleString()}
          </text>
          <text x="20" y="62" fontSize="8" fill="#94A3B8" fontFamily="monospace">
            Accuracy: ±{accuracy}mm
          </text>

          {state?.anomalyActive && (
            <text x="20" y="80" fontSize="9" fill="#EA580C" fontFamily="monospace" fontWeight="bold">
              ⚠ {state.anomalyActive}
            </text>
          )}

          {/* Legend icons */}
          <circle cx="220" cy="25" r="4" fill="#16A34A" />
          <text x="228" y="28" fontSize="8" fill="#94A3B8" fontFamily="monospace">Normal</text>
          <circle cx="220" cy="40" r="4" fill="#EA580C" />
          <text x="228" y="43" fontSize="8" fill="#EA580C" fontFamily="monospace">Warning</text>
          <circle cx="220" cy="55" r="4" fill="#DC2626" />
          <text x="228" y="58" fontSize="8" fill="#DC2626" fontFamily="monospace">Error</text>
        </svg>
      </div>

      <p className="text-xs text-muted text-center max-w-sm">
        Try: &quot;inject bearing-wear&quot;, &quot;inject calibration-drift&quot;, or &quot;show status&quot;.
      </p>
    </div>
  );
}
