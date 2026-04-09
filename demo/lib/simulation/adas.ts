import {
  SimulationEngine,
  SimulationState,
  AnomalyType,
  randomWalk,
  driftToward,
} from "./engine";

interface SensorData {
  id: string;
  label: string;
  online: boolean;
  fps?: number;
  confidence: number;
  range?: number;
  temp: number;
}

interface ADASMetrics {
  sensors: SensorData[];
  fusionConfidence: number;
  fusionLatency: number;
  objectCount: number;
  environment: string;
}

const DEFAULTS: ADASMetrics = {
  sensors: [
    { id: "lidar", label: "LiDAR", online: true, confidence: 97, range: 120, temp: 42 },
    { id: "cam-f", label: "Camera-F", online: true, fps: 30, confidence: 95, temp: 38 },
    { id: "cam-l", label: "Camera-L", online: true, fps: 30, confidence: 94, temp: 36 },
    { id: "cam-r", label: "Camera-R", online: true, fps: 29, confidence: 93, temp: 37 },
    { id: "radar", label: "Radar", online: true, confidence: 96, range: 200, temp: 34 },
  ],
  fusionConfidence: 96.2,
  fusionLatency: 11,
  objectCount: 14,
  environment: "Clear, daylight",
};

export class ADASSimulation implements SimulationEngine {
  private data: ADASMetrics;
  private tickCount = 0;
  private anomaly: AnomalyType | null = null;
  private anomalyTick = 0;

  constructor() {
    this.data = {
      ...DEFAULTS,
      sensors: DEFAULTS.sensors.map((s) => ({ ...s })),
    };
  }

  getState(): SimulationState {
    const m = this.data;
    const metrics: Record<string, number> = {
      fusionConfidence: round(m.fusionConfidence, 1),
      fusionLatency: round(m.fusionLatency),
      objectCount: m.objectCount,
    };
    const statuses: Record<string, "ok" | "warn" | "error"> = {};

    m.sensors.forEach((s) => {
      metrics[`${s.id}Conf`] = round(s.confidence, 1);
      metrics[`${s.id}Temp`] = round(s.temp);
      if (s.fps !== undefined) metrics[`${s.id}Fps`] = round(s.fps);
      if (s.range !== undefined) metrics[`${s.id}Range`] = round(s.range);

      statuses[s.id] = !s.online
        ? "error"
        : s.confidence < 80
          ? "error"
          : s.confidence < 88
            ? "warn"
            : "ok";
    });

    statuses.fusion =
      m.fusionConfidence < 85 ? "error" : m.fusionConfidence < 90 ? "warn" : "ok";
    statuses.overall = this.anomaly ? "warn" : "ok";

    return {
      twin: "adas",
      tick: this.tickCount,
      timestamp: Date.now(),
      metrics,
      statuses,
      anomalyActive: this.anomaly,
    };
  }

  tick(): SimulationState {
    this.tickCount++;
    const m = this.data;
    const elapsed = this.anomaly ? this.tickCount - this.anomalyTick : 0;

    // Normal random walk
    m.fusionConfidence = randomWalk(m.fusionConfidence, 0.3, 93, 98);
    m.fusionLatency = randomWalk(m.fusionLatency, 0.5, 8, 15);
    m.objectCount = Math.max(5, Math.min(25, m.objectCount + Math.round((Math.random() - 0.5) * 3)));

    m.sensors.forEach((s) => {
      s.confidence = randomWalk(s.confidence, 0.3, 90, 98);
      s.temp = randomWalk(s.temp, 0.3, 30, 50);
      if (s.fps !== undefined) s.fps = randomWalk(s.fps, 0.3, 27, 30);
      if (s.range !== undefined) s.range = randomWalk(s.range, 1, 100, s.id === "radar" ? 220 : 140);
    });

    // Anomaly: rain + dusk (degrades cameras and LiDAR)
    if (this.anomaly === "rain-dusk" && elapsed > 0) {
      const severity = Math.min(elapsed / 25, 1);
      m.environment = "Dusk, light rain";
      const camF = m.sensors.find((s) => s.id === "cam-f")!;
      camF.fps = driftToward(camF.fps ?? 30, 18, 0.04 * severity);
      camF.confidence = driftToward(camF.confidence, 78, 0.03 * severity);
      const lidar = m.sensors.find((s) => s.id === "lidar")!;
      lidar.range = driftToward(lidar.range ?? 120, 80, 0.02 * severity);
      lidar.confidence = driftToward(lidar.confidence, 85, 0.02 * severity);
      m.fusionConfidence = driftToward(m.fusionConfidence, 87, 0.02 * severity);
    }

    // Anomaly: lens contamination (front camera only)
    if (this.anomaly === "lens-contamination" && elapsed > 0) {
      const severity = Math.min(elapsed / 20, 1);
      const camF = m.sensors.find((s) => s.id === "cam-f")!;
      camF.fps = driftToward(camF.fps ?? 30, 20, 0.05 * severity);
      camF.confidence = driftToward(camF.confidence, 72, 0.04 * severity);
      camF.temp = driftToward(camF.temp, 68, 0.02 * severity);
      m.fusionConfidence = driftToward(m.fusionConfidence, 89, 0.02 * severity);
    }

    // Anomaly: sensor failure (front camera goes offline)
    if (this.anomaly === "sensor-failure" && elapsed > 5) {
      const camF = m.sensors.find((s) => s.id === "cam-f")!;
      camF.online = false;
      camF.fps = 0;
      camF.confidence = 0;
      m.fusionConfidence = driftToward(m.fusionConfidence, 78, 0.05);
    }

    return this.getState();
  }

  injectAnomaly(type: AnomalyType): void {
    this.anomaly = type;
    this.anomalyTick = this.tickCount;
  }

  reset(): void {
    this.data = {
      ...DEFAULTS,
      sensors: DEFAULTS.sensors.map((s) => ({ ...s })),
    };
    this.anomaly = null;
    this.anomalyTick = 0;
  }
}

function round(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
