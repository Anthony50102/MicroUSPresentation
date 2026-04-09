"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { TwinType, SimulationState, SimulationEngine } from "@/lib/simulation/engine";
import { EdgeAISimulation } from "@/lib/simulation/edge-ai";
import { RoboticArmSimulation } from "@/lib/simulation/robotic-arm";
import { ADASSimulation } from "@/lib/simulation/adas";

const TICK_INTERVAL_MS = 1500;
const HISTORY_LENGTH = 60;

interface SimContextValue {
  state: SimulationState | null;
  history: SimulationState[];
  injectAnomaly: (type: string) => void;
  resetSim: () => void;
  activeTwin: TwinType;
}

const SimContext = createContext<SimContextValue>({
  state: null,
  history: [],
  injectAnomaly: () => {},
  resetSim: () => {},
  activeTwin: "edge-ai",
});

export function useSimulation() {
  return useContext(SimContext);
}

function createEngine(twin: TwinType): SimulationEngine {
  switch (twin) {
    case "edge-ai":
      return new EdgeAISimulation();
    case "robotic-arm":
      return new RoboticArmSimulation();
    case "adas":
      return new ADASSimulation();
  }
}

export function SimulationProvider({
  twin,
  children,
}: {
  twin: TwinType;
  children: React.ReactNode;
}) {
  const engineRef = useRef<SimulationEngine>(createEngine(twin));
  const [state, setState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<SimulationState[]>([]);

  // Reset engine when twin changes
  useEffect(() => {
    const engine = createEngine(twin);
    engineRef.current = engine;
    const initial = engine.getState();
    setState(initial);
    setHistory([initial]);
  }, [twin]);

  // Run tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      const next = engineRef.current.tick();
      setState(next);
      setHistory((prev) => {
        const updated = [...prev, next];
        return updated.length > HISTORY_LENGTH
          ? updated.slice(updated.length - HISTORY_LENGTH)
          : updated;
      });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [twin]);

  const injectAnomaly = useCallback((type: string) => {
    engineRef.current.injectAnomaly(type);
  }, []);

  const resetSim = useCallback(() => {
    engineRef.current.reset();
    const fresh = engineRef.current.getState();
    setState(fresh);
    setHistory([fresh]);
  }, []);

  return (
    <SimContext.Provider value={{ state, history, injectAnomaly, resetSim, activeTwin: twin }}>
      {children}
    </SimContext.Provider>
  );
}
