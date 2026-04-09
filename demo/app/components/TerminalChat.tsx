"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { TwinType } from "@/lib/simulation/engine";
import { useSimulation } from "@/lib/simulation/SimulationContext";
import { TWIN_CONFIGS } from "@/lib/twin-config";
import { getCachedResponse } from "@/lib/fallback-cache";

interface LocalMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Props {
  activeTwin: TwinType;
}

const twinPromptHints: Record<TwinType, string> = {
  "edge-ai": "Ask about device health, model drift, inference metrics...",
  "robotic-arm": "Ask about joint health, vibration, maintenance schedule...",
  adas: "Ask about sensor status, fusion confidence, safety assessment...",
};

const twinAccentClass: Record<TwinType, string> = {
  "edge-ai": "text-blue",
  "robotic-arm": "text-purple",
  adas: "text-teal",
};

type ConnectionStatus = "connected" | "reconnecting" | "offline";

export default function TerminalChat({ activeTwin }: Props) {
  const { state, injectAnomaly, resetSim } = useSimulation();
  const config = TWIN_CONFIGS[activeTwin];

  // Local-only messages for special commands (system alerts, status, help)
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([
    {
      role: "assistant",
      content: `Digital twin online. Type a question or try "inject anomaly" to see the agentic layer in action.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const lastSentMessage = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use a ref so the transport body closure always reads the latest state
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ twin: activeTwin, simState: stateRef.current }),
      }),
    [activeTwin]
  );

  const {
    messages: chatMessages,
    sendMessage,
    status,
    setMessages: setChatMessages,
    error,
  } = useChat({
    transport,
    onError: () => {
      setConnectionStatus("offline");

      // Try cached response first
      if (state && lastSentMessage.current) {
        const cached = getCachedResponse(activeTwin, lastSentMessage.current, state);
        if (cached) {
          setLocalMessages((prev) => [
            ...prev,
            {
              role: "assistant" as const,
              content: `[cached] ${cached}`,
            },
          ]);
          return;
        }
      }

      const statusSummary = state
        ? Object.entries(config.statLabels)
            .slice(0, 4)
            .map(([key, label]) => `${label}: ${state.metrics[key] ?? "—"}`)
            .join(", ")
        : "No data";

      setLocalMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `[Offline mode — Azure OpenAI not connected]\n\nCurrent readings: ${statusSummary}\n\nTo connect: set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY in .env.local`,
        },
      ]);
    },
    onFinish: () => {
      setConnectionStatus("connected");
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Extract text content from chat messages for display
  const displayMessages: LocalMessage[] = [
    ...localMessages,
    ...chatMessages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") ?? "",
    })),
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [displayMessages.length, chatMessages]);

  // Reset messages when twin changes
  useEffect(() => {
    setLocalMessages([
      {
        role: "assistant",
        content: `${config.icon} ${config.label} twin online.\n${config.description}\n\nTry: "show status", "inject ${config.anomalies[0]?.id}", or ask me anything.`,
      },
    ]);
    setChatMessages([]);
  }, [activeTwin, config, setChatMessages]);

  const handleSpecialCommand = useCallback(
    (text: string): boolean => {
      const lower = text.toLowerCase().trim();

      // Status command
      if (lower === "status" || lower === "show status") {
        if (!state) return true;
        const lines = Object.entries(config.statLabels)
          .map(([key, label]) => {
            const val = state.metrics[key];
            const st = state.statuses[key] || "ok";
            const icon = st === "error" ? "🔴" : st === "warn" ? "🟡" : "🟢";
            return `${icon} ${label}: ${val ?? "—"}`;
          })
          .join("\n");
        setLocalMessages((prev) => [
          ...prev,
          { role: "user" as const, content: text },
          {
            role: "assistant" as const,
            content: `Current sensor readings:\n\n${lines}${state.anomalyActive ? `\n\n⚠ Active anomaly: ${state.anomalyActive}` : ""}`,
          },
        ]);
        return true;
      }

      // Inject anomaly
      const injectMatch = lower.match(/^inject\s+(.+)$/);
      if (injectMatch) {
        const anomalyId = injectMatch[1].replace(/\s+/g, "-");
        const found = config.anomalies.find((a) => a.id === anomalyId);
        if (found) {
          injectAnomaly(found.id);
          setLocalMessages((prev) => [
            ...prev,
            { role: "user" as const, content: text },
            {
              role: "system" as const,
              content: `⚠ Anomaly injected: ${found.label}\n${found.description}\n\nWatch the metrics change in real-time. Ask me what's happening.`,
            },
          ]);
        } else {
          const options = config.anomalies.map((a) => `  • ${a.id} — ${a.label}`).join("\n");
          setLocalMessages((prev) => [
            ...prev,
            { role: "user" as const, content: text },
            {
              role: "assistant" as const,
              content: `Unknown anomaly "${anomalyId}". Available:\n${options}`,
            },
          ]);
        }
        return true;
      }

      // Reset
      if (lower === "reset") {
        resetSim();
        setLocalMessages((prev) => [
          ...prev,
          { role: "user" as const, content: text },
          { role: "system" as const, content: "🔄 Simulation reset to defaults." },
        ]);
        return true;
      }

      // Help
      if (lower === "help") {
        const cmds = [
          "status — show current sensor readings",
          `inject <anomaly> — trigger a scenario`,
          "reset — reset simulation to defaults",
          "help — show this message",
          "",
          "Available anomalies:",
          ...config.anomalies.map((a) => `  • ${a.id}`),
          "",
          "Or just ask a question in natural language!",
        ];
        setLocalMessages((prev) => [
          ...prev,
          { role: "user" as const, content: text },
          { role: "assistant" as const, content: cmds.join("\n") },
        ]);
        return true;
      }

      return false;
    },
    [state, config, injectAnomaly, resetSim]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");

    // Check special commands first — intercept before calling the API
    if (handleSpecialCommand(userMsg)) return;

    // Let useChat handle the API call
    lastSentMessage.current = userMsg;
    sendMessage({ text: userMsg });
  };

  const accent = twinAccentClass[activeTwin];

  const statusConfig = {
    connected:    { icon: "🟢", label: "Connected",       cls: "text-green" },
    reconnecting: { icon: "🟡", label: "Reconnecting...", cls: "text-orange animate-pulse" },
    offline:      { icon: "🔴", label: "Offline",         cls: "text-red" },
  } as const;
  const statusDisplay = statusConfig[connectionStatus];

  return (
    <div className="flex flex-col h-full bg-terminal">
      {/* Connection status indicator */}
      <div className={`flex items-center gap-1.5 px-3 py-0.5 font-mono text-[10px] ${statusDisplay.cls} border-b border-white/5`}>
        <span>{statusDisplay.icon}</span>
        <span>{statusDisplay.label}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 terminal-scroll">
        {displayMessages.map((msg, i) => (
          <div key={i} className="stream-in">
            {msg.role === "user" ? (
              <div className="font-mono text-sm">
                <span className="text-terminal-accent font-bold">{">"} </span>
                <span className="text-terminal-text">{msg.content}</span>
              </div>
            ) : msg.role === "system" ? (
              <div className="font-mono text-sm text-orange whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            ) : (
              <div className="font-mono text-sm text-terminal-text/90 whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="font-mono text-sm text-terminal-accent">
            <span className="cursor-blink">▋</span> Analyzing...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 border-t border-white/10 bg-terminal-input">
        <div className="flex items-center px-3 py-2 gap-2">
          <span className={`font-mono text-sm font-bold ${accent}`}>{">"}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={twinPromptHints[activeTwin]}
            disabled={isLoading}
            className="flex-1 bg-transparent font-mono text-sm text-terminal-text placeholder:text-muted/50 outline-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`font-mono text-sm ${accent} disabled:opacity-30`}
          >
            ⏎
          </button>
        </div>
      </form>
    </div>
  );
}
