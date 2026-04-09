import {
  SimulationEngine,
  SimulationState,
  AnomalyType,
  randomWalk,
  driftToward,
} from "./engine";

interface JointData {
  temp: number;
  vibration: number;
  torque: number;
}

interface ArmMetrics {
  joints: JointData[];
  cycleCount: number;
  placementAccuracy: number;
  gripperForce: number;
  cycleTime: number;
}

const DEFAULTS: ArmMetrics = {
  joints: [
    { temp: 52, vibration: 1.2, torque: 55 },
    { temp: 48, vibration: 1.0, torque: 62 },
    { temp: 55, vibration: 1.4, torque: 70 },
    { temp: 44, vibration: 0.8, torque: 40 },
  ],
  cycleCount: 142380,
  placementAccuracy: 0.02,
  gripperForce: 12,
  cycleTime: 1.4,
};

export class RoboticArmSimulation implements SimulationEngine {
  private data: ArmMetrics;
  private tickCount = 0;
  private anomaly: AnomalyType | null = null;
  private anomalyTick = 0;

  constructor() {
    this.data = {
      ...DEFAULTS,
      joints: DEFAULTS.joints.map((j) => ({ ...j })),
    };
  }

  getState(): SimulationState {
    const m = this.data;
    const metrics: Record<string, number> = {
      cycleCount: m.cycleCount,
      placementAccuracy: round(m.placementAccuracy, 3),
      gripperForce: round(m.gripperForce, 1),
      cycleTime: round(m.cycleTime, 2),
    };
    const statuses: Record<string, "ok" | "warn" | "error"> = {};

    m.joints.forEach((j, i) => {
      metrics[`j${i + 1}Temp`] = round(j.temp);
      metrics[`j${i + 1}Vibration`] = round(j.vibration, 1);
      metrics[`j${i + 1}Torque`] = round(j.torque);
      statuses[`joint${i + 1}`] =
        j.vibration > 3.0 ? "error" : j.vibration > 2.0 ? "warn" : "ok";
    });

    statuses.placementAccuracy =
      m.placementAccuracy > 0.08 ? "error" : m.placementAccuracy > 0.04 ? "warn" : "ok";
    statuses.overall = this.anomaly ? "warn" : "ok";

    return {
      twin: "robotic-arm",
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

    m.cycleCount += 1;
    m.cycleTime = randomWalk(m.cycleTime, 0.02, 1.2, 1.6);
    m.gripperForce = randomWalk(m.gripperForce, 0.3, 10, 15);
    m.placementAccuracy = randomWalk(m.placementAccuracy, 0.002, 0.01, 0.04);

    m.joints.forEach((j) => {
      j.temp = randomWalk(j.temp, 0.5, 38, 62);
      j.vibration = randomWalk(j.vibration, 0.05, 0.5, 1.8);
      j.torque = randomWalk(j.torque, 1, 30, 80);
    });

    // Anomaly: bearing wear on joint 3
    if (this.anomaly === "bearing-wear" && elapsed > 0) {
      const severity = Math.min(elapsed / 30, 1);
      m.joints[2].vibration = driftToward(m.joints[2].vibration, 4.2, 0.03 * severity);
      m.joints[2].temp = driftToward(m.joints[2].temp, 82, 0.02 * severity);
      m.cycleTime = driftToward(m.cycleTime, 1.9, 0.01 * severity);
    }

    // Anomaly: calibration drift
    if (this.anomaly === "calibration-drift" && elapsed > 0) {
      const severity = Math.min(elapsed / 25, 1);
      m.placementAccuracy = driftToward(m.placementAccuracy, 0.1, 0.03 * severity);
    }

    // Anomaly: gripper slip
    if (this.anomaly === "gripper-slip" && elapsed > 0) {
      m.gripperForce = driftToward(m.gripperForce, 5, 0.02);
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
      joints: DEFAULTS.joints.map((j) => ({ ...j })),
    };
    this.anomaly = null;
    this.anomalyTick = 0;
  }
}

function round(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
