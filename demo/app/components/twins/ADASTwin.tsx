"use client";

import { useSimulation } from "@/lib/simulation/SimulationContext";
import { motion } from "framer-motion";

export default function ADASTwin() {
  const { state } = useSimulation();

  const fusion = state?.metrics.fusionConfidence ?? 96.2;
  const lidarConf = state?.metrics.lidarConf ?? 97;
  const camFConf = state?.metrics["cam-fConf"] ?? 95;
  const camLConf = state?.metrics["cam-lConf"] ?? 94;
  const camRConf = state?.metrics["cam-rConf"] ?? 93;
  const radarConf = state?.metrics.radarConf ?? 96;
  const objects = state?.metrics.objectCount ?? 14;

  const isRainDusk = state?.anomalyActive === "rain-dusk";
  const isSensorFailure = state?.anomalyActive === "sensor-failure";
  const camFOffline = isSensorFailure && state?.statuses["cam-f"] === "error";

  const sensorStatus = (conf: number, id?: string) => {
    if (id && state?.statuses[id] === "error") return { color: "#DC2626", icon: "❌" };
    if (conf < 80) return { color: "#DC2626", icon: "❌" };
    if (conf < 88) return { color: "#EA580C", icon: "⚠️" };
    return { color: "#16A34A", icon: "✅" };
  };

  const lidar = sensorStatus(lidarConf, "lidar");
  const camF = sensorStatus(camFConf, "cam-f");
  const camL = sensorStatus(camLConf, "cam-l");
  const camR = sensorStatus(camRConf, "cam-r");
  const radar = sensorStatus(radarConf, "radar");
  const fusionS = sensorStatus(fusion, "fusion");

  // Rain drop positions (deterministic to avoid hydration mismatch)
  const rainDrops = [
    { x: 160, y: 20, d: 0.0 }, { x: 180, y: 15, d: 0.2 }, { x: 210, y: 12, d: 0.4 },
    { x: 240, y: 18, d: 0.1 }, { x: 155, y: 35, d: 0.3 }, { x: 230, y: 30, d: 0.5 },
    { x: 170, y: 225, d: 0.15 }, { x: 200, y: 230, d: 0.35 }, { x: 220, y: 240, d: 0.25 },
    { x: 190, y: 245, d: 0.45 },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center">
        <svg viewBox="0 0 400 280" className="w-full h-full max-w-sm">
          {/* Vehicle body */}
          <rect x="120" y="80" width="160" height="100" rx="20" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 2" />
          <text x="160" y="135" fontSize="10" fill="#94A3B8" fontFamily="monospace">VEHICLE</text>
          <text x="160" y="148" fontSize="8" fill="#94A3B8" fontFamily="monospace">Objects: {objects}</text>

          {/* LiDAR */}
          <circle cx="200" cy="60" r="18" fill={`${lidar.color}10`} stroke={lidar.color} strokeWidth="2" />
          <text x="188" y="64" fontSize="9" fill={lidar.color} fontFamily="monospace" fontWeight="bold">LiDAR</text>
          <circle cx="200" cy="40" r="3" fill={lidar.color} />

          {/* Camera Front — fade to gray when offline */}
          <motion.g
            animate={camFOffline
              ? { opacity: [1, 0.3, 1] }
              : { opacity: 1 }
            }
            transition={camFOffline
              ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              : { duration: 0.4 }
            }
          >
            <rect
              x="180" y="70" width="40" height="14" rx="4"
              fill={camFOffline ? "#6B728020" : `${camF.color}10`}
              stroke={camFOffline ? "#6B7280" : camF.color}
              strokeWidth="1.5"
            />
            <text x="183" y="80" fontSize="7" fill={camFOffline ? "#6B7280" : camF.color} fontFamily="monospace">
              CAM-F {camFOffline ? "⛔" : camF.icon}
            </text>
            {/* Strikethrough line when offline */}
            {camFOffline && (
              <motion.line
                x1={180} y1={77} x2={220} y2={77}
                stroke="#DC2626" strokeWidth={1.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.g>

          {/* Camera Left */}
          <rect x="90" y="115" width="35" height="14" rx="4" fill={`${camL.color}10`} stroke={camL.color} strokeWidth="1.5" />
          <text x="93" y="125" fontSize="7" fill={camL.color} fontFamily="monospace">CAM-L {camL.icon}</text>

          {/* Camera Right */}
          <rect x="275" y="115" width="35" height="14" rx="4" fill={`${camR.color}10`} stroke={camR.color} strokeWidth="1.5" />
          <text x="278" y="125" fontSize="7" fill={camR.color} fontFamily="monospace">CAM-R {camR.icon}</text>

          {/* Radar */}
          <rect x="170" y="185" width="60" height="18" rx="6" fill={`${radar.color}10`} stroke={radar.color} strokeWidth="1.5" />
          <text x="176" y="197" fontSize="8" fill={radar.color} fontFamily="monospace">RADAR {radar.icon}</text>

          {/* LiDAR detection zone — sweep/pulse animation */}
          <motion.path
            d="M200,60 L140,10 L260,10 Z"
            fill="#0D948808" stroke="#0D948830" strokeWidth={1}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />

          {/* Radar detection zone with sonar-style expanding ring */}
          <path d="M200,200 L140,250 L260,250 Z" fill="#7C3AED08" stroke="#7C3AED30" strokeWidth="1" />
          <motion.circle
            cx={200} cy={225} r={10}
            fill="none" stroke="#7C3AED" strokeWidth={1}
            animate={{ r: [10, 35, 10], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
          <motion.circle
            cx={200} cy={225} r={10}
            fill="none" stroke="#7C3AED" strokeWidth={0.8}
            animate={{ r: [8, 30, 8], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.8 }}
          />

          {/* Rain effect — animated streaks in detection zones */}
          {isRainDusk && rainDrops.map((drop, i) => (
            <motion.line
              key={i}
              x1={drop.x} y1={drop.y}
              x2={drop.x - 2} y2={drop.y + 8}
              stroke="#94A3B8" strokeWidth={0.8}
              animate={{ opacity: [0, 0.6, 0], y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 0.7, ease: "linear", delay: drop.d }}
            />
          ))}

          {/* Fusion box */}
          <rect x="145" y="220" width="110" height="28" rx="8" fill={`${fusionS.color}10`} stroke={fusionS.color} strokeWidth="1.5" />
          <text x="152" y="237" fontSize="8" fill={fusionS.color} fontFamily="monospace" fontWeight="bold">
            FUSION: {fusion}% {fusionS.icon}
          </text>

          {/* Connection lines */}
          <line x1="200" y1="78" x2="200" y2="84" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="125" y1="122" x2="120" y2="130" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="275" y1="122" x2="280" y2="130" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="200" y1="180" x2="200" y2="185" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />

          {/* Environment badge */}
          <rect x="10" y="10" width="100" height="20" rx="4" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
          <text x="16" y="24" fontSize="8" fill="#94A3B8" fontFamily="monospace">
            {isRainDusk ? "🌧 Dusk, rain" : "☀ Clear, daylight"}
          </text>

          {state?.anomalyActive && (
            <text x="10" y="270" fontSize="9" fill="#EA580C" fontFamily="monospace" fontWeight="bold">
              ⚠ {state.anomalyActive}
            </text>
          )}
        </svg>
      </div>

      <p className="text-xs text-muted text-center max-w-sm">
        Try: &quot;inject rain-dusk&quot;, &quot;inject sensor-failure&quot;, or &quot;show status&quot;.
      </p>
    </div>
  );
}
