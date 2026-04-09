"use client";

import { useSimulation } from "@/lib/simulation/SimulationContext";
import { motion } from "framer-motion";

export default function EdgeAITwin() {
  const { state } = useSimulation();

  const fps = state?.metrics.inferenceFps ?? 28;
  const accuracy = state?.metrics.modelAccuracy ?? 94.2;
  const drift = state?.metrics.driftScore ?? 3;
  const detPerson = state?.metrics.detPerson ?? 0.94;
  const detForklift = state?.metrics.detForklift ?? 0.91;
  const detPallet = state?.metrics.detPallet ?? 0.88;

  const driftStatus = drift > 20 ? "error" : drift > 10 ? "warn" : "ok";
  const palletStatus = detPallet < 0.7 ? "warn" : "ok";
  const anomalyActive = !!state?.anomalyActive;

  // Pulse duration inversely proportional to FPS (faster FPS = faster pulse)
  const pulseDuration = fps > 0 ? Math.max(0.4, 2.5 - (fps / 30) * 1.8) : 3;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <motion.div
        className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-br from-blue/5 to-blue/10 rounded-2xl border-2 border-blue/20 p-4 flex flex-col"
        animate={
          anomalyActive
            ? { boxShadow: ["0 0 0px rgba(234,88,12,0)", "0 0 18px rgba(234,88,12,0.35)", "0 0 0px rgba(234,88,12,0)"] }
            : { boxShadow: "0 0 0px rgba(234,88,12,0)" }
        }
        transition={anomalyActive ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${anomalyActive ? "bg-orange animate-pulse" : "bg-green animate-pulse"}`} />
          <span className="text-xs font-mono text-muted">JETSON ORIN NANO — YOLOv8</span>
          {state?.anomalyActive && (
            <span className="text-[10px] font-mono text-orange ml-auto">⚠ {state.anomalyActive}</span>
          )}
        </div>

        <div className="flex-1 bg-charcoal/5 rounded-lg border border-border flex items-center justify-center relative overflow-hidden">
          {/* Camera icon with inference pulse ring */}
          <div className="text-center space-y-2 relative">
            <div className="relative inline-block">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue"
                style={{ margin: "-8px" }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: pulseDuration, ease: "easeInOut" }}
              />
              <div className="text-4xl">📷</div>
            </div>
            <div className="text-xs text-muted">Live Inference Feed</div>
          </div>

          <div className="absolute top-3 left-3 space-y-1">
            <DetectionBadge label="Person" conf={detPerson} status="ok" />
            <DetectionBadge label="Forklift" conf={detForklift} status="ok" />
            <DetectionBadge label="Pallet" conf={detPallet} status={palletStatus} />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs font-mono text-muted">
          <span className={fps < 15 ? "text-red" : fps < 22 ? "text-orange" : ""}>{fps} FPS</span>
          <span className={accuracy < 85 ? "text-red" : accuracy < 90 ? "text-orange" : ""}>{accuracy}% accuracy</span>
          <span className={driftStatus === "error" ? "text-red" : driftStatus === "warn" ? "text-orange" : "text-muted"}>
            {driftStatus !== "ok" ? "⚠️" : "✅"} drift: {drift}
          </span>
          {/* Pulsing drift warning indicator */}
          {driftStatus !== "ok" && (
            <motion.span
              className={`text-xs font-bold ${driftStatus === "error" ? "text-red" : "text-orange"}`}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              ● DRIFT
            </motion.span>
          )}
        </div>
      </motion.div>

      <p className="text-xs text-muted text-center max-w-sm">
        Edge AI vision module. Try: &quot;inject model-drift&quot;, &quot;inject thermal-throttle&quot;, or &quot;show status&quot;.
      </p>
    </div>
  );
}

function DetectionBadge({ label, conf, status }: { label: string; conf: number; status: string }) {
  const isWarn = status === "warn" || conf < 0.7;
  const isError = conf < 0.5;
  const bgColor = isError ? "red" : isWarn ? "orange" : "green";
  return (
    <motion.div
      className={`bg-${bgColor}/20 border border-${bgColor}/50 rounded px-2 py-0.5 text-xs font-mono text-${bgColor}`}
      animate={{ backgroundColor: isError ? "rgba(220,38,38,0.15)" : isWarn ? "rgba(234,88,12,0.15)" : "rgba(22,163,74,0.15)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {isError ? "🔴" : isWarn ? "🟡" : "🟢"} {label} — {conf.toFixed(2)}
    </motion.div>
  );
}
