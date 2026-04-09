"use client";

import { useState, Suspense } from "react";
import TwinSelector from "./components/TwinSelector";
import Shell from "./components/Shell";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { SimulationProvider } from "@/lib/simulation/SimulationContext";
import type { TwinType } from "@/lib/simulation/engine";

export default function Home() {
  const [activeTwin, setActiveTwin] = useState<TwinType>("edge-ai");

  return (
    <main className="h-dvh w-full flex flex-col overflow-hidden">
      <TwinSelector active={activeTwin} onChange={setActiveTwin} />
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton />}>
          <SimulationProvider twin={activeTwin}>
            <Shell activeTwin={activeTwin} />
          </SimulationProvider>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
