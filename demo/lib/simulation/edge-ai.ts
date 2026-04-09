import {
  SimulationEngine,
  SimulationState,
  AnomalyType,
  randomWalk,
  driftToward,
} from "./engine";

interface EdgeAIMetrics {
  cpuTemp: number;
  gpuTemp: number;
  memoryUsage: number;
  powerDraw: number;
  inferenceFps: number;
  modelAccuracy: number;
  driftScore: number;
  uptime: number;
  detections: { label: string; confidence: number; status: "ok" | "warn" }[];
}

const DEFAULTS: EdgeAIMetrics = {
  cpuTemp: 68,
  gpuTemp: 64,
  memoryUsage: 72,
  powerDraw: 11.8,
  inferenceFps: 28,
  modelAccuracy: 95.1,
  driftScore: 3,
  uptime: 47,
  detections: [
    { label: "Person", confidence: 0.94, status: "ok" },
    { label: "Forklift", confidence: 0.91, status: "ok" },
    { label: "Pallet", confidence: 0.88, status: "ok" },
  ],
};

export class EdgeAISimulation implements SimulationEngine {
  private data: EdgeAIMetrics;
  private tickCount = 0;
  private anomaly: AnomalyType | null = null;
  private anomalyTick = 0;

  constructor() {
    this.data = { ...DEFAULTS, detections: DEFAULTS.detections.map((d) => ({ ...d })) };
  }

  getState(): SimulationState {
    const m = this.data;
    return {
      twin: "edge-ai",
      tick: this.tickCount,
      timestamp: Date.now(),
      metrics: {
        cpuTemp: round(m.cpuTemp),
        gpuTemp: round(m.gpuTemp),
        memoryUsage: round(m.memoryUsage),
        powerDraw: round(m.powerDraw, 1),
        inferenceFps: round(m.inferenceFps),
        modelAccuracy: round(m.modelAccuracy, 1),
        driftScore: round(m.driftScore),
        uptime: m.uptime,
        detPerson: round(m.detections[0].confidence, 2),
        detForklift: round(m.detections[1].confidence, 2),
        detPallet: round(m.detections[2].confidence, 2),
      },
      statuses: {
        cpuTemp: m.cpuTemp > 82 ? "error" : m.cpuTemp > 75 ? "warn" : "ok",
        gpuTemp: m.gpuTemp > 78 ? "error" : m.gpuTemp > 70 ? "warn" : "ok",
        memoryUsage: m.memoryUsage > 92 ? "error" : m.memoryUsage > 85 ? "warn" : "ok",
        inferenceFps: m.inferenceFps < 15 ? "error" : m.inferenceFps < 22 ? "warn" : "ok",
        modelAccuracy: m.modelAccuracy < 85 ? "error" : m.modelAccuracy < 90 ? "warn" : "ok",
        driftScore: m.driftScore > 20 ? "error" : m.driftScore > 10 ? "warn" : "ok",
        overall: this.anomaly ? "warn" : "ok",
      },
      anomalyActive: this.anomaly,
    };
  }

  tick(): SimulationState {
    this.tickCount++;
    const m = this.data;
    const elapsed = this.anomaly ? this.tickCount - this.anomalyTick : 0;

    // Normal random walk
    m.cpuTemp = randomWalk(m.cpuTemp, 0.8, 55, 78);
    m.gpuTemp = randomWalk(m.gpuTemp, 0.6, 50, 72);
    m.memoryUsage = randomWalk(m.memoryUsage, 0.3, 60, 82);
    m.powerDraw = randomWalk(m.powerDraw, 0.2, 10, 14);
    m.inferenceFps = randomWalk(m.inferenceFps, 0.5, 25, 30);
    m.modelAccuracy = randomWalk(m.modelAccuracy, 0.1, 93, 96);
    m.driftScore = randomWalk(m.driftScore, 0.5, 1, 8);
    m.detections[0].confidence = randomWalk(m.detections[0].confidence, 0.01, 0.88, 0.97);
    m.detections[1].confidence = randomWalk(m.detections[1].confidence, 0.01, 0.85, 0.95);
    m.detections[2].confidence = randomWalk(m.detections[2].confidence, 0.01, 0.82, 0.93);

    // Anomaly: model drift
    if (this.anomaly === "model-drift" && elapsed > 0) {
      const severity = Math.min(elapsed / 30, 1); // ramp over 30 ticks
      m.modelAccuracy = driftToward(m.modelAccuracy, 82, 0.03 * severity);
      m.driftScore = driftToward(m.driftScore, 28, 0.04 * severity);
      m.detections[2].confidence = driftToward(m.detections[2].confidence, 0.45, 0.03 * severity);
      m.detections[2].status = m.detections[2].confidence < 0.7 ? "warn" : "ok";
    }

    // Anomaly: thermal throttle
    if (this.anomaly === "thermal-throttle" && elapsed > 0) {
      const severity = Math.min(elapsed / 20, 1);
      m.cpuTemp = driftToward(m.cpuTemp, 92, 0.05 * severity);
      m.gpuTemp = driftToward(m.gpuTemp, 88, 0.04 * severity);
      m.inferenceFps = driftToward(m.inferenceFps, 12, 0.04 * severity);
      m.powerDraw = driftToward(m.powerDraw, 18, 0.03 * severity);
    }

    // Anomaly: memory leak
    if (this.anomaly === "memory-leak" && elapsed > 0) {
      m.memoryUsage = driftToward(m.memoryUsage, 98, 0.02);
    }

    return this.getState();
  }

  injectAnomaly(type: AnomalyType): void {
    this.anomaly = type;
    this.anomalyTick = this.tickCount;
  }

  reset(): void {
    this.data = { ...DEFAULTS, detections: DEFAULTS.detections.map((d) => ({ ...d })) };
    this.anomaly = null;
    this.anomalyTick = 0;
  }
}

function round(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
