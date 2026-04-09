# Interactive Demo: "Ask Your Twin"

> **Goal**: A mobile-friendly web app the audience accesses via QR code during the talk. They interact with a simulated agentic digital twin of a semiconductor etch chamber.

---

## Layout

```
┌──────────────────────────────────┬──────────────┐
│                                  │  📊 Stats    │
│     VISUAL TWIN                  │              │
│     Animated fab schematic —     │  Temp: 342°C │
│     etch chamber, particles,     │  Press: 4.2T │
│     live indicators that react   │  Flow: 87%   │
│     to conversation + anomalies  │  Yield: 94%  │
│                                  │  ─────────── │
│                                  │  [mini chart]│
│                                  │  [mini chart]│
├──────────────────────────────────┴──────────────┤
│ > What's the health of etch chamber 3?          │
│                                                  │
│ Analyzing sensor data...                         │
│ Temperature variance up 12% over 48h.            │
│ Pattern matches heater element degradation (73%) │
│ Recommend scheduling PM within 5 days.           │
│ Confidence: 87%                                  │
│                                                  │
│ > _                                              │
└──────────────────────────────────────────────────┘
```

### Three Zones

1. **Visual Twin (main area)** — Animated SVG/Canvas of an etch chamber. Plasma glow, gas flow particles, temperature gradient visualization. Indicators update in real-time and react when the LLM identifies anomalies or the user asks about specific components.

2. **Stats Sidebar (collapsible on mobile)** — Mini dashboard with live sensor readings and sparkline charts. Temp, pressure, gas flow, vibration, yield. Tap to expand into a fuller view with historical trends.

3. **Terminal Chat (bottom panel)** — Dark background, monospace font, streaming text. Claude Code / terminal aesthetic. The user types questions in natural language; the twin responds with reasoning chains. Streaming responses so it feels alive.

---

## What the User Can Do

**Ask questions:**
- "What's the current health of the etch chamber?"
- "Why is temperature trending up?"
- "What happens if we increase gas flow by 5%?"
- "When should we schedule maintenance?"

**Trigger scenarios:**
- "Inject an anomaly" → temperature starts drifting, twin detects and reasons through it
- "Show me a pressure spike" → pressure anomaly, different reasoning path
- "Reset to normal" → returns to baseline

**Explore stats:**
- Tap sidebar to expand charts
- See historical data the twin references in its answers

---

## The Experience During the Talk

| Moment | What Happens |
|--------|-------------|
| Slide ~11 (after explaining agentic DTs) | QR code appears in corner — "Try it yourself" |
| You keep presenting | Audience starts pulling it up on phones |
| Slides 12-13 (research, multi-agent) | People are exploring while you talk — that's fine |
| Near the end | "By now some of you have been talking to the twin — that's what this looks like in practice" |
| After the talk / lunch | People keep playing with it, share the link, show colleagues |

The app doesn't replace a slide — it runs alongside the presentation as a companion experience.

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Framework** | Next.js 14 (standalone output) | Full-stack React with API routes — single deployment unit |
| **Styling** | Tailwind CSS 4 | Fast to build, responsive, dark terminal styling |
| **Animations** | Framer Motion | Smooth twin visualization animations |
| **Visual Twin** | SVG + CSS animations | Lightweight, works on mobile, no WebGL needed |
| **Charts** | Recharts | Sparklines and mini stat charts |
| **AI / Chat** | Vercel AI SDK (`@ai-sdk/azure`, `ai`) | Streaming chat with tool calling against Azure OpenAI |
| **LLM** | Azure OpenAI (GPT-4o deployment) | Tool calling to "query" simulated sensors; streaming responses |
| **Simulated Data** | TypeScript simulation engine | Three twin simulations (edge-ai, robotic-arm, ADAS) with anomaly injection |
| **Fallback** | Pre-cached response system | Conference WiFi mitigation — common questions cached locally |
| **Hosting** | Azure Static Web Apps | Home court — deployed via GitHub Actions CI/CD |
| **QR Code** | `qrcode.react` | Built-in QR code page for the presentation slide |

### Architecture (As Built)

```
┌─────────────┐     Streaming (AI SDK)     ┌──────────────────────┐
│  Next.js     │ ◄────────────────────────► │  Next.js API Routes  │
│  React App   │     POST /api/chat          │  (app/api/chat/)     │
│  (browser)   │                             │                      │
└─────────────┘                             │  - Azure OpenAI calls │
                                            │  - Tool execution     │
                                            │  - Simulation engine  │
                                            └──────────┬───────────┘
                                                       │
                                            ┌──────────▼───────────┐
                                            │  Azure OpenAI        │
                                            │  (GPT-4o + tools)    │
                                            └──────────────────────┘
```

Everything runs in a single Next.js app — no separate backend service. The simulation engine and tool definitions live in `lib/simulation/` and `lib/tools/`. The AI SDK handles streaming and tool calling natively.

### LLM Tool Calls

The LLM has access to "tools" that query the simulated twin (defined in `lib/tools/` and `lib/twin-config.ts`):

- `get_sensor_readings(chamber_id)` → current temp, pressure, gas flow, vibration
- `get_historical_data(sensor, timeframe)` → past readings for trend analysis
- `run_what_if(parameter, change)` → simulate a parameter change and return predicted impact
- `get_maintenance_history(chamber_id)` → past maintenance events
- `get_anomaly_status()` → current anomaly state if one has been injected

Each twin type (Edge AI, Robotic Arm, ADAS) has its own system prompt and tool set configured in `lib/twin-config.ts`. This makes the LLM's responses grounded in actual (simulated) data, not hallucinated.

---

## Mobile Considerations

- **Sidebar collapses** to a tab/icon on narrow screens
- **Terminal panel** takes ~40% of screen on mobile (thumb-friendly input)
- **Visual twin** simplifies on small screens (fewer particles, simpler animation)
- **Touch-friendly** — no hover states, large tap targets
- **Fast load** — aim for <3s on conference WiFi. Lazy-load charts.

---

## Conference WiFi Mitigation

| Risk | Mitigation |
|------|-----------|
| WiFi is slow | Keep initial bundle <500KB. Lazy-load everything else. |
| WiFi drops mid-session | Cache the last response. Show "reconnecting..." gracefully. |
| LLM API is slow | Stream tokens so something appears fast. Pre-cache common questions. |
| Total WiFi failure | Have 2-3 screenshots on slides as backup. "Here's what it looks like." |
| Too many concurrent users | Azure auto-scaling. Rate limit per session. |

---

## Scope / Build Status

### MVP ✅ Built
- [x] Next.js app with three-zone layout (Visual Twin + Stats Sidebar + Terminal Chat)
- [x] Animated twin visualizations for all three subjects (Edge AI, Robotic Arm, ADAS)
- [x] Terminal-style chat with streaming responses via Vercel AI SDK
- [x] Azure OpenAI integration (GPT-4o) with tool calling against simulated data
- [x] Stats sidebar with live readings and sparkline charts (Recharts)
- [x] Mobile responsive (Tailwind CSS 4)
- [x] Deployed on Azure Static Web Apps with GitHub Actions CI/CD
- [x] QR code page built in (`/qr` route)
- [x] Pre-cached fallback responses for conference WiFi mitigation

### Nice to Have
- [x] Anomaly injection (per-twin anomaly scenarios)
- [x] Three twin types to explore (Edge AI, Robotic Arm, ADAS)
- [ ] Shareable session links
- [ ] Response caching for additional common questions

### Out of Scope (for now)
- Multi-user real-time sync
- User accounts / persistence
- Full 3D visualization
- Real sensor data integration

---

## Visual Style

**Terminal/chat panel:**
- Dark background (#1E293B)
- Monospace font (JetBrains Mono or Fira Code)
- Green/blue accent for twin responses
- Subtle typing animation for streaming
- Cursor blink on input line

**Visual twin:**
- Clean, technical illustration style
- Soft glow effects for plasma/heat
- Color-coded indicators (green → yellow → red)
- Subtle particle animations for gas flow
- Reacts to anomalies (color shifts, warning pulses)

**Stats sidebar:**
- Light or dark — matches the zone it's in
- Sparkline charts (last 60 data points)
- Color-coded values (green = normal, orange = warning, red = alert)

**Overall vibe:** Technical but polished. Feels like a real engineering tool, not a toy. Think: what if a control room UI met Claude Code.
