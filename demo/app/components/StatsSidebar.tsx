"use client";

import { useSimulation } from "@/lib/simulation/SimulationContext";
import { TWIN_CONFIGS } from "@/lib/twin-config";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface Props {
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  ok: "text-green",
  warn: "text-orange",
  error: "text-red",
};

export default function StatsSidebar({ onClose }: Props) {
  const { state, activeTwin, history } = useSimulation();
  const config = TWIN_CONFIGS[activeTwin];

  if (!state) {
    return (
      <div className="p-3 h-full flex items-center justify-center">
        <span className="text-xs text-muted animate-pulse">Loading...</span>
      </div>
    );
  }

  const entries = Object.entries(config.statLabels);

  return (
    <div className="p-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          {config.label}
        </h3>
        <button onClick={onClose} className="sm:hidden text-muted text-xs">
          ✕
        </button>
      </div>

      {/* Anomaly indicator */}
      {state.anomalyActive && (
        <div className="mb-3 px-2 py-1.5 bg-orange/10 border border-orange/30 rounded text-xs font-mono text-orange">
          ⚠ {state.anomalyActive}
        </div>
      )}

      <div className="space-y-1">
        {entries.map(([key, label]) => {
          const value = state.metrics[key];
          const statusKey = Object.keys(state.statuses).find(
            (k) => k.toLowerCase() === key.toLowerCase() || key.startsWith(k)
          );
          const status = statusKey ? state.statuses[statusKey] : "ok";

          return (
            <div
              key={key}
              className="flex items-center justify-between py-1.5 border-b border-border/50"
            >
              <span className="text-xs text-muted">{label}</span>
              <span className={`text-xs font-mono font-medium ${statusColors[status] || "text-fg"}`}>
                {value !== undefined ? formatValue(key, value) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mini sparklines using recent history */}
      <div className="mt-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted">Trends</div>
        {entries.slice(0, 3).map(([key, label]) => {
          const points = history.map((h) => ({ value: h.metrics[key] ?? 0 }));
          const statusKey = Object.keys(state.statuses).find(
            (k) => k.toLowerCase() === key.toLowerCase() || key.startsWith(k)
          );
          const status = statusKey ? state.statuses[statusKey] : "ok";
          return (
            <div key={key} className="space-y-0.5">
              <div className="text-[10px] text-muted">{label}</div>
              <MiniSparkline data={points} status={status} />
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-[10px] text-muted/50 font-mono">
        tick #{state.tick}
      </div>
    </div>
  );
}

const sparklineColors: Record<string, string> = {
  ok: "#16A34A",
  warn: "#EA580C",
  error: "#DC2626",
};

function MiniSparkline({ data, status }: { data: { value: number }[]; status: string }) {
  if (data.length < 2) {
    return <div className="h-8 bg-gray-50 rounded border border-border/50" />;
  }

  const color = sparklineColors[status] || sparklineColors.ok;
  const gradientId = `gradient-${status}-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function formatValue(key: string, value: number): string {
  if (key.includes("Temp")) return `${value}°C`;
  if (key.includes("Conf") || key === "modelAccuracy" || key === "memoryUsage")
    return `${value}%`;
  if (key.includes("Fps") || key === "inferenceFps") return `${value}`;
  if (key === "powerDraw") return `${value}W`;
  if (key === "cycleCount") return value.toLocaleString();
  if (key === "placementAccuracy") return `±${value}mm`;
  if (key === "gripperForce") return `${value}N`;
  if (key === "cycleTime") return `${value}s`;
  if (key === "fusionLatency") return `${value}ms`;
  if (key === "objectCount") return `${value}`;
  if (key.includes("Vibration")) return `${value} mm/s`;
  if (key.includes("Range")) return `${value}m`;
  return `${value}`;
}
