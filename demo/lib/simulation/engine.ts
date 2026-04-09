export type TwinType = "edge-ai" | "robotic-arm" | "adas";

export interface SimulationState {
  twin: TwinType;
  tick: number;
  timestamp: number;
  metrics: Record<string, number>;
  statuses: Record<string, "ok" | "warn" | "error">;
  anomalyActive: string | null;
}

export type AnomalyType = string;

export interface SimulationEngine {
  getState(): SimulationState;
  tick(): SimulationState;
  injectAnomaly(type: AnomalyType): void;
  reset(): void;
}

// Utility: random walk with bounds
export function randomWalk(
  current: number,
  step: number,
  min: number,
  max: number
): number {
  const delta = (Math.random() - 0.5) * 2 * step;
  return Math.max(min, Math.min(max, current + delta));
}

// Utility: gradual drift toward a target
export function driftToward(
  current: number,
  target: number,
  rate: number
): number {
  return current + (target - current) * rate;
}
