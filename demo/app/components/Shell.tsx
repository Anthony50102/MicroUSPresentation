"use client";

import { useState } from "react";
import type { TwinType } from "@/lib/simulation/engine";
import TerminalChat from "./TerminalChat";
import StatsSidebar from "./StatsSidebar";
import EdgeAITwin from "./twins/EdgeAITwin";
import RoboticArmTwin from "./twins/RoboticArmTwin";
import ADASTwin from "./twins/ADASTwin";

interface Props {
  activeTwin: TwinType;
}

const twinComponents: Record<TwinType, React.ComponentType> = {
  "edge-ai": EdgeAITwin,
  "robotic-arm": RoboticArmTwin,
  adas: ADASTwin,
};

const twinAccentColors: Record<TwinType, string> = {
  "edge-ai": "border-blue",
  "robotic-arm": "border-purple",
  adas: "border-teal",
};

export default function Shell({ activeTwin }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const TwinVisual = twinComponents[activeTwin];
  const accentBorder = twinAccentColors[activeTwin];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top section: Visual + Sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Twin Visual */}
        <div className="flex-1 relative bg-bg p-3 overflow-auto">
          <TwinVisual />

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-3 right-3 sm:hidden z-10 bg-surface border border-border rounded-lg px-2 py-1 text-sm text-muted shadow-sm"
          >
            {sidebarOpen ? "✕" : "📊"}
          </button>
        </div>

        {/* Stats Sidebar — hidden on mobile unless toggled */}
        <div
          className={`
            ${sidebarOpen ? "block" : "hidden"} sm:block
            w-full sm:w-56 md:w-64
            absolute sm:relative right-0 top-0 sm:top-auto
            h-full sm:h-auto
            z-20 sm:z-auto
            bg-surface border-l border-border
            overflow-y-auto
          `}
        >
          <StatsSidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Terminal Chat — bottom panel */}
      <div className={`h-[45%] sm:h-[40%] shrink-0 border-t-2 ${accentBorder}`}>
        <TerminalChat activeTwin={activeTwin} />
      </div>
    </div>
  );
}
