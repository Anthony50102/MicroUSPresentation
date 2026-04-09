import type { TwinType, SimulationState } from "./simulation/engine";

interface CachedEntry {
  triggers: string[];
  response: (metrics: Record<string, number>, anomalyActive: string | null) => string;
}

type CacheMap = Record<TwinType, CachedEntry[]>;

function m(metrics: Record<string, number>, key: string): string {
  return metrics[key] !== undefined ? String(metrics[key]) : "—";
}

const CACHE: CacheMap = {
  "edge-ai": [
    {
      triggers: ["health", "status", "how is", "current state", "overview"],
      response: (metrics, anomaly) =>
        `System operating ${anomaly ? "with active anomaly (" + anomaly + ")" : "within normal parameters"}.

Key metrics:
• CPU: ${m(metrics, "cpuTemp")}°C | GPU: ${m(metrics, "gpuTemp")}°C
• Memory: ${m(metrics, "memoryUsage")}%
• Inference: ${m(metrics, "inferenceFps")} FPS at ${m(metrics, "modelAccuracy")}% accuracy
• Drift score: ${m(metrics, "driftScore")}
• Power draw: ${m(metrics, "powerDraw")} W

${anomaly ? "⚠ Active anomaly detected. Recommend running detailed diagnostics." : "All systems nominal. No action required."}`,
    },
    {
      triggers: ["drift", "accuracy", "confidence dropping"],
      response: (metrics, anomaly) =>
        `Drift analysis:
• Model accuracy: ${m(metrics, "modelAccuracy")}%
• Drift score: ${m(metrics, "driftScore")} (threshold: 10 warn, 20 critical)
• Detection confidence — Person: ${m(metrics, "detPerson")}, Forklift: ${m(metrics, "detForklift")}, Pallet: ${m(metrics, "detPallet")}

${Number(metrics.driftScore) > 10 ? "⚠ Drift score elevated. Pallet class confidence is degrading — likely distribution shift in input data. Recommend scheduling model retrain with recent production images." : "Drift within acceptable range. Continue monitoring."}`,
    },
    {
      triggers: ["temperature", "thermal", "hot", "overheat"],
      response: (metrics, anomaly) =>
        `Thermal analysis:
• CPU: ${m(metrics, "cpuTemp")}°C ${Number(metrics.cpuTemp) > 82 ? "🔴 CRITICAL" : Number(metrics.cpuTemp) > 75 ? "🟡 ELEVATED" : "🟢 NORMAL"}
• GPU: ${m(metrics, "gpuTemp")}°C ${Number(metrics.gpuTemp) > 78 ? "🔴 CRITICAL" : Number(metrics.gpuTemp) > 70 ? "🟡 ELEVATED" : "🟢 NORMAL"}
• Power draw: ${m(metrics, "powerDraw")} W

${Number(metrics.cpuTemp) > 82 || Number(metrics.gpuTemp) > 78 ? "⚠ Thermal throttling likely. Inference FPS currently at " + m(metrics, "inferenceFps") + ". Recommend checking fan assembly and ambient conditions." : "Temperatures within operating envelope. No throttling risk."}`,
    },
    {
      triggers: ["memory", "leak", "ram"],
      response: (metrics) =>
        `Memory analysis:
• Current usage: ${m(metrics, "memoryUsage")}% ${Number(metrics.memoryUsage) > 92 ? "🔴 CRITICAL" : Number(metrics.memoryUsage) > 85 ? "🟡 HIGH" : "🟢 NORMAL"}

${Number(metrics.memoryUsage) > 85 ? "Memory pressure detected. If usage continues climbing, inference pipeline will stall. Recommend restarting inference service or investigating for tensor buffer leaks." : "Memory utilization healthy. No leaks detected in current monitoring window."}`,
    },
    {
      triggers: ["fps", "speed", "slow", "inference"],
      response: (metrics) =>
        `Performance analysis:
• Inference: ${m(metrics, "inferenceFps")} FPS ${Number(metrics.inferenceFps) < 15 ? "🔴 DEGRADED" : Number(metrics.inferenceFps) < 22 ? "🟡 BELOW TARGET" : "🟢 NOMINAL"}
• Model accuracy: ${m(metrics, "modelAccuracy")}%
• CPU: ${m(metrics, "cpuTemp")}°C | GPU: ${m(metrics, "gpuTemp")}°C

${Number(metrics.inferenceFps) < 22 ? "FPS below target (25). Check for thermal throttling or memory contention. Current CPU temp: " + m(metrics, "cpuTemp") + "°C." : "Inference throughput nominal. Pipeline running efficiently."}`,
    },
    {
      triggers: ["maintenance", "schedule", "fix"],
      response: (metrics, anomaly) =>
        `Maintenance assessment:
${anomaly ? "⚠ Active anomaly: " + anomaly + ". Immediate attention recommended.\n" : ""}• CPU temp: ${m(metrics, "cpuTemp")}°C — ${Number(metrics.cpuTemp) > 75 ? "schedule thermal paste reapplication" : "OK"}
• Memory: ${m(metrics, "memoryUsage")}% — ${Number(metrics.memoryUsage) > 85 ? "schedule service restart" : "OK"}
• Drift score: ${m(metrics, "driftScore")} — ${Number(metrics.driftScore) > 10 ? "schedule model retrain" : "OK"}
• Inference: ${m(metrics, "inferenceFps")} FPS — ${Number(metrics.inferenceFps) < 22 ? "investigate performance bottleneck" : "OK"}

${anomaly ? "Priority: address " + anomaly + " before next production shift." : "No urgent maintenance required. Next routine check in 72 hours."}`,
    },
    {
      triggers: ["what if", "increase", "decrease", "change"],
      response: (metrics) =>
        `What-if analysis (current baseline):
• Inference: ${m(metrics, "inferenceFps")} FPS at ${m(metrics, "modelAccuracy")}% accuracy
• Thermal: CPU ${m(metrics, "cpuTemp")}°C, GPU ${m(metrics, "gpuTemp")}°C

Scenarios:
↑ Batch size → higher throughput but +5-10°C thermal, risk of throttle
↓ Model precision (FP16→INT8) → +40% FPS but -2-3% accuracy
↑ Input resolution → +5% accuracy but -30% FPS
↓ Confidence threshold → more detections but higher false positive rate

Recommend testing changes during low-traffic window.`,
    },
    {
      triggers: ["anomaly", "wrong", "problem", "issue"],
      response: (metrics, anomaly) =>
        anomaly
          ? `⚠ Active anomaly: ${anomaly}

Current impact:
• Model accuracy: ${m(metrics, "modelAccuracy")}%
• Drift score: ${m(metrics, "driftScore")}
• Inference: ${m(metrics, "inferenceFps")} FPS
• Memory: ${m(metrics, "memoryUsage")}%
• CPU: ${m(metrics, "cpuTemp")}°C | GPU: ${m(metrics, "gpuTemp")}°C

Anomaly is actively affecting system performance. Monitor metrics for further degradation.`
          : `No active anomalies detected.

System health:
• Accuracy: ${m(metrics, "modelAccuracy")}% ✓
• Drift: ${m(metrics, "driftScore")} ✓
• Thermal: CPU ${m(metrics, "cpuTemp")}°C, GPU ${m(metrics, "gpuTemp")}°C ✓
• Memory: ${m(metrics, "memoryUsage")}% ✓

All parameters within normal operating range.`,
    },
    {
      triggers: ["pallet", "detection", "object"],
      response: (metrics) =>
        `Detection confidence breakdown:
• Person: ${m(metrics, "detPerson")} ${Number(metrics.detPerson) < 0.8 ? "⚠ LOW" : "✓"}
• Forklift: ${m(metrics, "detForklift")} ${Number(metrics.detForklift) < 0.8 ? "⚠ LOW" : "✓"}
• Pallet: ${m(metrics, "detPallet")} ${Number(metrics.detPallet) < 0.7 ? "🔴 DEGRADED" : Number(metrics.detPallet) < 0.8 ? "⚠ LOW" : "✓"}

${Number(metrics.detPallet) < 0.7 ? "Pallet detection significantly degraded. Likely cause: model drift from distribution shift. Drift score: " + m(metrics, "driftScore") + ". Recommend retraining on recent pallet images." : "All detection classes within acceptable confidence ranges."}`,
    },
    {
      triggers: ["power", "energy", "watt"],
      response: (metrics) =>
        `Power analysis:
• Current draw: ${m(metrics, "powerDraw")} W ${Number(metrics.powerDraw) > 16 ? "🟡 ELEVATED" : "🟢 NORMAL"}
• CPU temp: ${m(metrics, "cpuTemp")}°C
• GPU temp: ${m(metrics, "gpuTemp")}°C

${Number(metrics.powerDraw) > 16 ? "Power draw elevated — correlates with thermal load. May indicate thermal throttling or intensive workload spike." : "Power consumption within expected range for current inference workload."}`,
    },
    {
      triggers: ["uptime", "running", "how long"],
      response: (metrics) =>
        `Uptime report:
• Running for: ${m(metrics, "uptime")} hours
• Inference cycles: ~${Math.round(Number(metrics.uptime || 0) * 3600 * Number(metrics.inferenceFps || 28))} frames processed
• Current FPS: ${m(metrics, "inferenceFps")}
• Model accuracy: ${m(metrics, "modelAccuracy")}%

System has been stable through current runtime. No restarts required.`,
    },
  ],

  "robotic-arm": [
    {
      triggers: ["health", "status", "how is", "overview"],
      response: (metrics, anomaly) =>
        `Arm system ${anomaly ? "operating with active anomaly (" + anomaly + ")" : "operating normally"}.

Joint temperatures: J1 ${m(metrics, "j1Temp")}°C | J2 ${m(metrics, "j2Temp")}°C | J3 ${m(metrics, "j3Temp")}°C | J4 ${m(metrics, "j4Temp")}°C
Vibration levels: J1 ${m(metrics, "j1Vibration")} | J2 ${m(metrics, "j2Vibration")} | J3 ${m(metrics, "j3Vibration")} | J4 ${m(metrics, "j4Vibration")} mm/s
• Placement accuracy: ${m(metrics, "placementAccuracy")} mm
• Gripper force: ${m(metrics, "gripperForce")} N
• Cycle time: ${m(metrics, "cycleTime")} s (${m(metrics, "cycleCount")} total cycles)

${anomaly ? "⚠ Anomaly active — review affected subsystem." : "All joints within spec. No maintenance required."}`,
    },
    {
      triggers: ["vibration", "shake", "bearing"],
      response: (metrics) =>
        `Vibration analysis (mm/s):
• J1: ${m(metrics, "j1Vibration")} ${Number(metrics.j1Vibration) > 2.0 ? "⚠" : "✓"}
• J2: ${m(metrics, "j2Vibration")} ${Number(metrics.j2Vibration) > 2.0 ? "⚠" : "✓"}
• J3: ${m(metrics, "j3Vibration")} ${Number(metrics.j3Vibration) > 2.0 ? "⚠" : "✓"} ${Number(metrics.j3Vibration) > 3.0 ? "🔴 CRITICAL — bearing wear suspected" : ""}
• J4: ${m(metrics, "j4Vibration")} ${Number(metrics.j4Vibration) > 2.0 ? "⚠" : "✓"}

Thresholds: >2.0 warn, >3.0 critical (bearing replacement required)
${Number(metrics.j3Vibration) > 2.0 ? "Joint 3 showing elevated vibration. Correlate with temperature (" + m(metrics, "j3Temp") + "°C) to confirm bearing wear pattern." : "All joints within normal vibration envelope."}`,
    },
    {
      triggers: ["accuracy", "placement", "precision"],
      response: (metrics) =>
        `Placement accuracy analysis:
• Current: ${m(metrics, "placementAccuracy")} mm ${Number(metrics.placementAccuracy) > 0.08 ? "🔴 OUT OF SPEC" : Number(metrics.placementAccuracy) > 0.04 ? "🟡 DEGRADING" : "🟢 NOMINAL"}
• Target: <0.04 mm
• Critical threshold: 0.08 mm

${Number(metrics.placementAccuracy) > 0.04 ? "Accuracy degrading. Possible causes: calibration drift, mechanical wear, or thermal expansion. Cycle count: " + m(metrics, "cycleCount") + ". Recommend recalibration." : "Placement accuracy excellent. No calibration adjustment needed."}`,
    },
    {
      triggers: ["gripper", "grip", "force", "slip"],
      response: (metrics) =>
        `Gripper force analysis:
• Current force: ${m(metrics, "gripperForce")} N ${Number(metrics.gripperForce) < 8 ? "🔴 INSUFFICIENT" : Number(metrics.gripperForce) < 10 ? "🟡 LOW" : "🟢 NOMINAL"}
• Target range: 10–15 N
• Min safe grip: 8 N

${Number(metrics.gripperForce) < 10 ? "⚠ Gripper force below target. Risk of part slippage during placement. Check gripper pneumatics and contact surfaces for wear." : "Gripper force within operational range. Grip integrity confirmed."}`,
    },
    {
      triggers: ["cycle", "speed", "time"],
      response: (metrics) =>
        `Cycle performance:
• Cycle time: ${m(metrics, "cycleTime")} s ${Number(metrics.cycleTime) > 1.7 ? "🟡 SLOW" : "🟢 NOMINAL"}
• Total cycles: ${m(metrics, "cycleCount")}
• Placement accuracy: ${m(metrics, "placementAccuracy")} mm

${Number(metrics.cycleTime) > 1.7 ? "Cycle time above target. May indicate mechanical resistance or bearing friction. Check joint vibration levels." : "Cycle time nominal. Throughput on track for production target."}`,
    },
    {
      triggers: ["joint 3", "j3"],
      response: (metrics) =>
        `Joint 3 detailed analysis:
• Temperature: ${m(metrics, "j3Temp")}°C ${Number(metrics.j3Temp) > 70 ? "🔴 HIGH" : Number(metrics.j3Temp) > 60 ? "🟡 WARM" : "🟢 NORMAL"}
• Vibration: ${m(metrics, "j3Vibration")} mm/s ${Number(metrics.j3Vibration) > 3.0 ? "🔴 CRITICAL" : Number(metrics.j3Vibration) > 2.0 ? "🟡 ELEVATED" : "🟢 NORMAL"}
• Torque: ${m(metrics, "j3Torque")} Nm

${Number(metrics.j3Vibration) > 2.0 ? "Joint 3 shows signs of bearing wear. Vibration and temperature correlated. Recommend scheduling bearing replacement before next production run." : "Joint 3 operating within all parameters. No concerns."}`,
    },
    {
      triggers: ["maintenance", "fix", "repair"],
      response: (metrics, anomaly) =>
        `Maintenance recommendation:
${anomaly ? "⚠ Active anomaly: " + anomaly + ". Priority servicing required.\n" : ""}• J3 vibration: ${m(metrics, "j3Vibration")} mm/s — ${Number(metrics.j3Vibration) > 2.0 ? "bearing inspection needed" : "OK"}
• Placement: ${m(metrics, "placementAccuracy")} mm — ${Number(metrics.placementAccuracy) > 0.04 ? "recalibration recommended" : "OK"}
• Gripper: ${m(metrics, "gripperForce")} N — ${Number(metrics.gripperForce) < 10 ? "check pneumatics" : "OK"}
• Cycle time: ${m(metrics, "cycleTime")} s — ${Number(metrics.cycleTime) > 1.7 ? "investigate friction" : "OK"}

Total cycles: ${m(metrics, "cycleCount")}. ${Number(metrics.cycleCount) > 150000 ? "Approaching scheduled overhaul interval." : "Within normal service interval."}`,
    },
    {
      triggers: ["temperature", "hot", "warm"],
      response: (metrics) =>
        `Joint temperature overview:
• J1: ${m(metrics, "j1Temp")}°C ${Number(metrics.j1Temp) > 65 ? "🟡" : "🟢"}
• J2: ${m(metrics, "j2Temp")}°C ${Number(metrics.j2Temp) > 65 ? "🟡" : "🟢"}
• J3: ${m(metrics, "j3Temp")}°C ${Number(metrics.j3Temp) > 70 ? "🔴" : Number(metrics.j3Temp) > 60 ? "🟡" : "🟢"}
• J4: ${m(metrics, "j4Temp")}°C ${Number(metrics.j4Temp) > 65 ? "🟡" : "🟢"}

${Number(metrics.j3Temp) > 70 ? "Joint 3 temperature critical — correlates with elevated vibration. Bearing friction likely." : "All joint temperatures within normal operating range."}`,
    },
    {
      triggers: ["torque", "load", "stress"],
      response: (metrics) =>
        `Torque analysis (Nm):
• J1: ${m(metrics, "j1Torque")} (base rotation)
• J2: ${m(metrics, "j2Torque")} (shoulder)
• J3: ${m(metrics, "j3Torque")} (elbow)
• J4: ${m(metrics, "j4Torque")} (wrist)

Torque distribution appears ${Number(metrics.j3Torque) > 75 ? "elevated on J3 — may indicate mechanical resistance from bearing wear" : "normal across all joints"}. Gripper force: ${m(metrics, "gripperForce")} N.`,
    },
    {
      triggers: ["anomaly", "problem", "issue", "wrong"],
      response: (metrics, anomaly) =>
        anomaly
          ? `⚠ Active anomaly: ${anomaly}

Impact assessment:
• J3 vibration: ${m(metrics, "j3Vibration")} mm/s
• Placement accuracy: ${m(metrics, "placementAccuracy")} mm
• Gripper force: ${m(metrics, "gripperForce")} N
• Cycle time: ${m(metrics, "cycleTime")} s

Anomaly is actively affecting arm performance. Recommend stopping production if safety margins are exceeded.`
          : `No active anomalies.

System health summary:
• Vibration: all joints <2.0 mm/s ✓
• Accuracy: ${m(metrics, "placementAccuracy")} mm ✓
• Gripper: ${m(metrics, "gripperForce")} N ✓
• Cycles: ${m(metrics, "cycleCount")} total

All parameters nominal.`,
    },
  ],

  adas: [
    {
      triggers: ["health", "status", "how is", "overview"],
      response: (metrics, anomaly) =>
        `ADAS sensor suite ${anomaly ? "operating with degradation (" + anomaly + ")" : "fully operational"}.

• Fusion confidence: ${m(metrics, "fusionConfidence")}%
• Fusion latency: ${m(metrics, "fusionLatency")} ms
• Objects tracked: ${m(metrics, "objectCount")}

Sensor status:
  LiDAR: ${m(metrics, "lidarConf")}% conf | Camera-F: ${m(metrics, "cam-fConf")}% conf
  Radar: ${m(metrics, "radarConf")}% conf

${anomaly ? "⚠ Active scenario affecting sensor performance. Safety margins reduced." : "All sensors online. Fusion pipeline healthy."}`,
    },
    {
      triggers: ["fusion", "fuse", "combined"],
      response: (metrics) =>
        `Fusion pipeline analysis:
• Confidence: ${m(metrics, "fusionConfidence")}% ${Number(metrics.fusionConfidence) < 85 ? "🔴 CRITICAL" : Number(metrics.fusionConfidence) < 90 ? "🟡 DEGRADED" : "🟢 NOMINAL"}
• Latency: ${m(metrics, "fusionLatency")} ms ${Number(metrics.fusionLatency) > 20 ? "🟡 HIGH" : "🟢 OK"}
• Object count: ${m(metrics, "objectCount")}

Contributing sensors:
  LiDAR: ${m(metrics, "lidarConf")}% | Camera-F: ${m(metrics, "cam-fConf")}% | Radar: ${m(metrics, "radarConf")}%

${Number(metrics.fusionConfidence) < 90 ? "Fusion confidence below threshold. Reduced sensor inputs degrading object classification reliability. Recommend limiting vehicle speed." : "Fusion pipeline operating at full capacity."}`,
    },
    {
      triggers: ["camera", "cam", "lens", "vision"],
      response: (metrics) =>
        `Camera subsystem status:
• Front: ${m(metrics, "cam-fConf")}% conf, ${m(metrics, "cam-fFps")} FPS, ${m(metrics, "cam-fTemp")}°C ${Number(metrics["cam-fConf"]) < 80 ? "🔴" : Number(metrics["cam-fConf"]) < 88 ? "🟡" : "🟢"}
• Left: ${m(metrics, "cam-lConf")}% conf, ${m(metrics, "cam-lFps")} FPS, ${m(metrics, "cam-lTemp")}°C 🟢
• Right: ${m(metrics, "cam-rConf")}% conf, ${m(metrics, "cam-rFps")} FPS, ${m(metrics, "cam-rTemp")}°C 🟢

${Number(metrics["cam-fConf"]) < 80 ? "⚠ Front camera severely degraded. Check lens for contamination or obstruction. Vision-based lane detection and sign recognition compromised." : Number(metrics["cam-fConf"]) < 88 ? "Front camera confidence reduced. Monitor for further degradation." : "All cameras operating nominally."}`,
    },
    {
      triggers: ["lidar", "laser", "range"],
      response: (metrics) =>
        `LiDAR analysis:
• Confidence: ${m(metrics, "lidarConf")}% ${Number(metrics.lidarConf) < 80 ? "🔴 CRITICAL" : Number(metrics.lidarConf) < 88 ? "🟡 DEGRADED" : "🟢 NOMINAL"}
• Range: ${m(metrics, "lidarRange")} m
• Temperature: ${m(metrics, "lidarTemp")}°C

${Number(metrics.lidarConf) < 88 ? "LiDAR performance reduced. Possible causes: precipitation scattering, lens contamination, or environmental particulates. 3D point cloud density affected." : "LiDAR performing at full specification. Point cloud density optimal for object classification."}`,
    },
    {
      triggers: ["radar", "detect"],
      response: (metrics) =>
        `Radar subsystem:
• Confidence: ${m(metrics, "radarConf")}% ${Number(metrics.radarConf) < 80 ? "🔴" : Number(metrics.radarConf) < 88 ? "🟡" : "🟢"}
• Range: ${m(metrics, "radarRange")} m
• Temperature: ${m(metrics, "radarTemp")}°C

Radar is weather-resistant and provides velocity estimation even when optical sensors degrade. Currently tracking ${m(metrics, "objectCount")} objects in the fusion pipeline.`,
    },
    {
      triggers: ["rain", "weather", "dusk", "visibility"],
      response: (metrics, anomaly) =>
        `Environmental impact analysis:
${anomaly === "rain-dusk" ? "⚠ Active weather scenario: rain + dusk conditions\n" : ""}
• Fusion confidence: ${m(metrics, "fusionConfidence")}%
• Camera-F: ${m(metrics, "cam-fConf")}% ${Number(metrics["cam-fConf"]) < 85 ? "— vision degraded by conditions" : ""}
• LiDAR: ${m(metrics, "lidarConf")}% ${Number(metrics.lidarConf) < 90 ? "— range reduced by precipitation" : ""}
• Radar: ${m(metrics, "radarConf")}% — weather-resistant ✓

${anomaly === "rain-dusk" ? "Reduced visibility conditions affecting optical sensors. Radar compensating but fusion confidence impacted. Recommend reducing speed and increasing following distance." : "Current environmental conditions not significantly affecting sensor performance."}`,
    },
    {
      triggers: ["failure", "offline", "down"],
      response: (metrics, anomaly) =>
        `Sensor failure analysis:
• LiDAR: ${Number(metrics.lidarConf) > 0 ? "ONLINE ✓" : "🔴 OFFLINE"}
• Camera-F: ${Number(metrics["cam-fConf"]) > 0 ? (Number(metrics["cam-fConf"]) < 50 ? "🔴 FAILING" : "ONLINE ✓") : "🔴 OFFLINE"}
• Camera-L: ${Number(metrics["cam-lConf"]) > 0 ? "ONLINE ✓" : "🔴 OFFLINE"}
• Camera-R: ${Number(metrics["cam-rConf"]) > 0 ? "ONLINE ✓" : "🔴 OFFLINE"}
• Radar: ${Number(metrics.radarConf) > 0 ? "ONLINE ✓" : "🔴 OFFLINE"}

Fusion confidence: ${m(metrics, "fusionConfidence")}%
${Number(metrics["cam-fConf"]) === 0 ? "⚠ Front camera offline. Fusion pipeline operating in degraded mode using LiDAR and radar only. Forward object classification accuracy reduced." : anomaly ? "Sensor degradation detected. System operating within safety margins but with reduced confidence." : "All sensors online and reporting."}`,
    },
    {
      triggers: ["object", "count", "tracking"],
      response: (metrics) =>
        `Object detection summary:
• Objects tracked: ${m(metrics, "objectCount")}
• Fusion confidence: ${m(metrics, "fusionConfidence")}%
• Fusion latency: ${m(metrics, "fusionLatency")} ms

Sensor contributions to object pipeline:
  LiDAR (${m(metrics, "lidarConf")}%) → 3D position + shape
  Cameras (F:${m(metrics, "cam-fConf")}%, L:${m(metrics, "cam-lConf")}%, R:${m(metrics, "cam-rConf")}%) → classification + color
  Radar (${m(metrics, "radarConf")}%) → velocity + range

${Number(metrics.fusionConfidence) < 90 ? "Reduced sensor confidence may lead to missed or misclassified objects." : "Object pipeline operating at full capacity."}`,
    },
    {
      triggers: ["latency", "delay", "slow"],
      response: (metrics) =>
        `Fusion latency analysis:
• Current latency: ${m(metrics, "fusionLatency")} ms ${Number(metrics.fusionLatency) > 25 ? "🔴 CRITICAL" : Number(metrics.fusionLatency) > 18 ? "🟡 ELEVATED" : "🟢 NOMINAL"}
• Target: <15 ms for real-time decision making
• Safety threshold: 25 ms

${Number(metrics.fusionLatency) > 18 ? "Elevated latency impacts reaction time for emergency braking and obstacle avoidance. At current speed, this adds ~" + (Number(metrics.fusionLatency) * 0.03).toFixed(1) + " m to stopping distance." : "Fusion latency within spec. Real-time decision pipeline healthy."}`,
    },
    {
      triggers: ["maintenance", "fix", "service"],
      response: (metrics, anomaly) =>
        `ADAS maintenance assessment:
${anomaly ? "⚠ Active scenario: " + anomaly + ". Address before continued operation.\n" : ""}• Fusion: ${m(metrics, "fusionConfidence")}% — ${Number(metrics.fusionConfidence) < 90 ? "recalibration recommended" : "OK"}
• Camera-F: ${m(metrics, "cam-fConf")}% — ${Number(metrics["cam-fConf"]) < 88 ? "inspect lens, check alignment" : "OK"}
• LiDAR: ${m(metrics, "lidarConf")}% — ${Number(metrics.lidarConf) < 88 ? "clean emitter window" : "OK"}
• Radar: ${m(metrics, "radarConf")}% — OK

${anomaly ? "Priority: resolve " + anomaly + " scenario and recalibrate affected sensors." : "No urgent maintenance. Recommend routine sensor cleaning at next service interval."}`,
    },
  ],
};

/**
 * Attempt to match user input against pre-cached twin responses.
 * Returns a filled-in response string if matched, or null if no match found.
 */
export function getCachedResponse(
  twin: TwinType,
  userMessage: string,
  simState: SimulationState
): string | null {
  const entries = CACHE[twin];
  if (!entries) return null;

  const lower = userMessage.toLowerCase();

  for (const entry of entries) {
    const matched = entry.triggers.some((trigger) => lower.includes(trigger));
    if (matched) {
      return entry.response(simState.metrics, simState.anomalyActive);
    }
  }

  return null;
}
