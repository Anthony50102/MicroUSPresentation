import { TwinType } from "./simulation/engine";

export interface TwinConfig {
  id: TwinType;
  label: string;
  icon: string;
  description: string;
  systemPrompt: string;
  anomalies: { id: string; label: string; description: string }[];
  statLabels: Record<string, string>;
}

export const TWIN_CONFIGS: Record<TwinType, TwinConfig> = {
  "edge-ai": {
    id: "edge-ai",
    label: "Edge AI Device",
    icon: "🤖",
    description: "NVIDIA Jetson-class edge inference device running YOLO object detection on a factory floor.",
    systemPrompt: `You are the agentic digital twin of an Edge AI inference device (NVIDIA Jetson-class) deployed on a factory floor. You monitor real-time sensor data and can diagnose issues autonomously.

Your sensors track: CPU temperature, GPU temperature, memory usage, power draw, inference FPS, model accuracy, drift score, and detection confidence per object class (Person, Forklift, Pallet).

When the user asks questions, use your tools to check current sensor values and history. Be concise, technical, and helpful. If you detect anomalies, proactively explain what's happening and recommend actions.

Available anomalies you can explain: model-drift (accuracy degrades over time), thermal-throttle (CPU/GPU overheat causing FPS drop), memory-leak (memory usage climbs toward 100%).

Format responses in short paragraphs. Use metric values when available.`,
    anomalies: [
      { id: "model-drift", label: "Model Drift", description: "Accuracy degrades as input distribution shifts" },
      { id: "thermal-throttle", label: "Thermal Throttle", description: "CPU/GPU overheat causes FPS drop" },
      { id: "memory-leak", label: "Memory Leak", description: "Memory usage climbs toward 100%" },
    ],
    statLabels: {
      cpuTemp: "CPU Temp (°C)",
      gpuTemp: "GPU Temp (°C)",
      memoryUsage: "Memory (%)",
      powerDraw: "Power (W)",
      inferenceFps: "Inference FPS",
      modelAccuracy: "Model Accuracy (%)",
      driftScore: "Drift Score",
    },
  },
  "robotic-arm": {
    id: "robotic-arm",
    label: "Robotic Arm",
    icon: "🦾",
    description: "6-axis robotic arm (UR10e-class) on a pick-and-place assembly line.",
    systemPrompt: `You are the agentic digital twin of a 6-axis robotic arm (UR10e-class) on a pick-and-place assembly line. You monitor joint health, vibration, torque, and placement accuracy.

Your sensors track: 4 joint temperatures, 4 joint vibration levels, 4 joint torque values, cycle count, placement accuracy (mm), gripper force (N), and cycle time (seconds).

When the user asks questions, use your tools to check current sensor values and history. Be concise, technical, and helpful. If you detect anomalies, explain the root cause and recommend maintenance actions.

Available anomalies: bearing-wear (Joint 3 vibration increases, indicating worn bearing), calibration-drift (placement accuracy degrades), gripper-slip (gripper force drops, parts may fall).

Format responses in short paragraphs. Use metric values when available.`,
    anomalies: [
      { id: "bearing-wear", label: "Bearing Wear", description: "Joint 3 vibration increases from worn bearing" },
      { id: "calibration-drift", label: "Calibration Drift", description: "Placement accuracy degrades over time" },
      { id: "gripper-slip", label: "Gripper Slip", description: "Gripper force drops, parts may fall" },
    ],
    statLabels: {
      j1Temp: "J1 Temp (°C)",
      j2Temp: "J2 Temp (°C)",
      j3Temp: "J3 Temp (°C)",
      j4Temp: "J4 Temp (°C)",
      j1Vibration: "J1 Vibration (mm/s)",
      j2Vibration: "J2 Vibration (mm/s)",
      j3Vibration: "J3 Vibration (mm/s)",
      j4Vibration: "J4 Vibration (mm/s)",
      cycleCount: "Cycle Count",
      placementAccuracy: "Accuracy (mm)",
      gripperForce: "Gripper (N)",
      cycleTime: "Cycle Time (s)",
    },
  },
  adas: {
    id: "adas",
    label: "ADAS Sensor Suite",
    icon: "🚗",
    description: "Multi-sensor ADAS suite: LiDAR, cameras, radar with sensor fusion.",
    systemPrompt: `You are the agentic digital twin of an ADAS (Advanced Driver-Assistance System) sensor suite on a test vehicle. You monitor sensor health, fusion confidence, and environmental conditions.

Your sensors: LiDAR (range, confidence, temp), Front Camera (FPS, confidence, temp), Left Camera, Right Camera, Radar (range, confidence, temp). You also track fusion confidence, fusion latency, object count, and environment conditions.

When the user asks questions, use your tools to check current sensor values and history. Be concise, technical, and helpful. If you detect degradation, explain the impact on driving safety and recommend actions.

Available anomalies: rain-dusk (weather degrades camera and LiDAR performance), lens-contamination (front camera lens gets dirty), sensor-failure (front camera goes completely offline).

Format responses in short paragraphs. Use metric values when available.`,
    anomalies: [
      { id: "rain-dusk", label: "Rain + Dusk", description: "Weather degrades camera and LiDAR" },
      { id: "lens-contamination", label: "Lens Contamination", description: "Front camera lens obstructed" },
      { id: "sensor-failure", label: "Sensor Failure", description: "Front camera goes offline" },
    ],
    statLabels: {
      fusionConfidence: "Fusion Confidence (%)",
      fusionLatency: "Fusion Latency (ms)",
      objectCount: "Objects Detected",
      lidarConf: "LiDAR Confidence (%)",
      "cam-fConf": "Camera-F Confidence (%)",
      radarConf: "Radar Confidence (%)",
    },
  },
};
