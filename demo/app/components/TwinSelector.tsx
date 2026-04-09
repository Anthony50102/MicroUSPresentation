"use client";

import type { TwinType } from "@/lib/simulation/engine";
export type { TwinType };

interface TwinOption {
  id: TwinType;
  icon: string;
  label: string;
  color: string;
  activeColor: string;
}

const twins: TwinOption[] = [
  {
    id: "edge-ai",
    icon: "🤖",
    label: "Edge AI",
    color: "text-blue",
    activeColor: "bg-blue",
  },
  {
    id: "robotic-arm",
    icon: "🦾",
    label: "Robotic Arm",
    color: "text-purple",
    activeColor: "bg-purple",
  },
  {
    id: "adas",
    icon: "🚗",
    label: "ADAS",
    color: "text-teal",
    activeColor: "bg-teal",
  },
];

interface Props {
  active: TwinType;
  onChange: (twin: TwinType) => void;
}

export default function TwinSelector({ active, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 px-3 py-2 bg-surface border-b border-border shrink-0">
      {twins.map((twin) => {
        const isActive = active === twin.id;
        return (
          <button
            key={twin.id}
            onClick={() => onChange(twin.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200 select-none
              ${
                isActive
                  ? `${twin.activeColor} text-white shadow-sm`
                  : "text-muted hover:bg-gray-100"
              }
            `}
          >
            <span className="text-base">{twin.icon}</span>
            <span className="hidden sm:inline">{twin.label}</span>
          </button>
        );
      })}
    </div>
  );
}
