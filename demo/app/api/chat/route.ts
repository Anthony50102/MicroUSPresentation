import { streamText, tool, stepCountIs } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { z } from "zod";
import { TWIN_CONFIGS } from "@/lib/twin-config";
import type { TwinType, SimulationState } from "@/lib/simulation/engine";

interface ChatRequest {
  messages: { role: string; content: string }[];
  twin: TwinType;
  simState: SimulationState | null;
}

export async function POST(req: Request) {
  const { messages, twin, simState }: ChatRequest = await req.json();

  const config = TWIN_CONFIGS[twin];
  if (!config) {
    return new Response("Unknown twin type", { status: 400 });
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
  const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  if (!endpoint || !apiKey) {
    return new Response(
      "Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY in .env.local",
      { status: 500 }
    );
  }

  const azure = createAzure({
    resourceName: extractResourceName(endpoint),
    apiKey,
  });

  // Build system prompt with live sensor data
  let systemContent = config.systemPrompt;
  if (simState) {
    const metricsStr = Object.entries(simState.metrics)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    const statusesStr = Object.entries(simState.statuses)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    systemContent += `\n\n--- CURRENT SENSOR DATA (tick #${simState.tick}) ---\nMetrics:\n${metricsStr}\n\nStatuses:\n${statusesStr}`;
    if (simState.anomalyActive) {
      systemContent += `\n\nACTIVE ANOMALY: ${simState.anomalyActive}`;
    }
  }

  const result = streamText({
    model: azure(deploymentName),
    system: systemContent,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    maxOutputTokens: 500,
    temperature: 0.7,
    tools: {
      get_sensor_readings: tool({
        description:
          "Get current sensor readings for the digital twin. Returns all metric values and their statuses.",
        inputSchema: z.object({}),
        execute: async () => ({
          metrics: simState?.metrics ?? {},
          statuses: simState?.statuses ?? {},
          tick: simState?.tick ?? 0,
          anomalyActive: simState?.anomalyActive ?? null,
        }),
      }),
      get_historical_trend: tool({
        description:
          "Get the trend direction for a specific metric (increasing, decreasing, or stable).",
        inputSchema: z.object({
          metric: z.string().describe("The metric name to check trend for"),
        }),
        execute: async ({ metric }) => {
          const value = simState?.metrics[metric];
          if (value === undefined) return { error: `Unknown metric: ${metric}` };
          const isAnomaly = simState?.anomalyActive != null;
          const status = simState?.statuses[metric] || "ok";
          return {
            metric,
            currentValue: value,
            status,
            trend: isAnomaly && status !== "ok" ? "increasing concern" : "stable",
            recommendation:
              status === "error"
                ? "Immediate attention required"
                : status === "warn"
                  ? "Monitor closely"
                  : "No action needed",
          };
        },
      }),
      run_what_if: tool({
        description:
          "Simulate a what-if scenario by predicting the impact of changing a parameter.",
        inputSchema: z.object({
          parameter: z
            .string()
            .describe('The parameter to change (e.g., "gas_flow", "cooling", "workload")'),
          change: z
            .string()
            .describe('Description of the change (e.g., "increase by 5%", "reduce to half")'),
        }),
        execute: async ({ parameter, change }) => ({
          parameter,
          change,
          predictedImpact: `Adjusting ${parameter} (${change}) would likely affect related metrics. Based on historical correlation patterns, this change has a moderate probability of improving current conditions within 2-4 hours.`,
          confidence: "73%",
          sideEffects:
            "Minor fluctuation in related metrics expected during adjustment period.",
        }),
      }),
      get_anomaly_status: tool({
        description:
          "Check whether an anomaly is currently active and get details about it.",
        inputSchema: z.object({}),
        execute: async () => ({
          anomalyActive: simState?.anomalyActive ?? null,
          affectedMetrics: simState
            ? Object.entries(simState.statuses)
                .filter(([, v]) => v !== "ok")
                .map(([k, v]) => ({ metric: k, status: v }))
            : [],
          overallStatus: simState?.statuses.overall ?? "ok",
        }),
      }),
      get_maintenance_recommendation: tool({
        description:
          "Get a maintenance recommendation based on current twin state.",
        inputSchema: z.object({}),
        execute: async () => {
          const hasAnomaly = simState?.anomalyActive != null;
          const errorMetrics = simState
            ? Object.entries(simState.statuses).filter(([, v]) => v === "error")
            : [];
          const warnMetrics = simState
            ? Object.entries(simState.statuses).filter(([, v]) => v === "warn")
            : [];
          return {
            urgency:
              errorMetrics.length > 0 ? "high" : warnMetrics.length > 0 ? "medium" : "low",
            recommendation: hasAnomaly
              ? `Schedule preventive maintenance within ${errorMetrics.length > 0 ? "24 hours" : "5 days"}. ${errorMetrics.length} critical and ${warnMetrics.length} warning conditions detected.`
              : "No maintenance action required. All systems operating within normal parameters.",
            estimatedDowntime: hasAnomaly ? "2-4 hours" : "N/A",
            costOfDelay:
              errorMetrics.length > 0 ? "High — potential cascading failure risk" : "Low",
          };
        },
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}

function extractResourceName(endpoint: string): string {
  try {
    const url = new URL(endpoint);
    return url.hostname.split(".")[0];
  } catch {
    return endpoint;
  }
}
