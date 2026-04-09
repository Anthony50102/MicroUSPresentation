# V2 — Agentic AI Direction: Overview & Demo Options

> **Presentation**: Microelectronics US 2026 · Embedded Systems US Stage
> **Date**: April 22, 2026 · 12:00–12:20 · Palmer Events Center, Austin, TX
> **Speaker**: Anthony Poole
> **Working Direction**: Direction A — The Journey Approach
>
> **Status**: ✅ Direction locked. Demo 2 ("Ask Your Twin") selected and built as a Next.js app deployed to Azure Static Web Apps. See `interactive-demo-spec.md` for the final spec, `twin-subject-specs.md` for the three twin subjects, and `presentation-outline.md` for the final 20-slide deck.

---

## The Approach

You're the junior speaker in a room of experienced practitioners. That's actually a strength — you're not coming in to tell anyone they're doing it wrong. You're coming in as someone who's been deep in the agentic AI world and can see where digital twins are naturally heading. Your job is to walk the audience through a logical progression and let them connect the dots themselves.

The talk should feel like a conversation, not a lecture. Ground them in what digital twins are today (respect the domain), show them what's happening in AI right now, and then let the combination click in their heads before you even say "agentic digital twin." When that slide lands, they should already be thinking it.

---

## Title

**"The Next Layer for Digital Twins: From Simulation to Autonomous Action"**

Professional, forward-looking. Tells the audience exactly what they're getting. Bridges naturally from the preceding "Autonomous Edge AI" fireside chat.

---

## Direction A Expanded: The Journey

### Core Thesis
> Digital twins are powerful simulation and monitoring tools today. AI agent technology is advancing rapidly in parallel. When these two converge, digital twins gain the ability to reason, decide, and act — and that opens up a genuinely new chapter for virtual prototyping and manufacturing.

### Speaker Posture
- **Not**: "I'm here to tell you what's wrong with your approach"
- **Instead**: "I've been working in the agentic AI space, and I want to show you where these worlds are starting to overlap — because I think you'll see the potential immediately"

### Narrative Arc — Let them arrive at it

```
PART 1: "The Foundation"             PART 2: "The Convergence"            PART 3: "What's Ahead"
(Build shared understanding)         (Connect the dots together)          (Look forward together)

┌─────────────────────┐  ┌────────────────────────────────────┐  ┌──────────────────────┐
│ What are DTs today? │  │ What is agentic AI?                │  │ Digital Triplets     │
│ Why semiconductors? │  │ What if we put these together?     │  │ Challenges & trust   │
│ What's working      │  │ Here's what that looks like        │  │ Where to start       │
│ Industry examples   │  │ Real examples & research           │  │                      │
│                     │  │ LIVE DEMO                          │  │                      │
└─────────────────────┘  └────────────────────────────────────┘  └──────────────────────┘
     ~30% of talk              ~50% of talk                          ~20% of talk
```

### Slide-by-Slide Outline

| # | Slide | Time | Key Message | Audience should be thinking... |
|---|-------|------|-------------|-------------------------------|
| 1 | **Title** | 0:15 | Clean title, your name, conference | "Interesting topic combo" |
| 2 | **Agenda** | 0:30 | Three parts: Foundation → Convergence → What's Ahead | "Clear structure, I know where this is going" |
| 3 | **What is a Digital Twin?** | 1:00 | Quick refresher — virtual model, physics-based, bidirectional, predictive | "Yep, I know this" (builds trust) |
| 4 | **Why Semiconductors Need This** | 1:30 | $300M tape-outs, 800 process steps, 67K worker shortage | "These are real problems I deal with" |
| 5 | **The DT Stack** | 1:00 | Device → Process → Facility levels | "Good overview of the landscape" |
| 6 | **Industry Today** | 1:30 | Samsung, TSMC, Intel — what they're doing now | "Ok these are real deployments" |
| 7 | **Where Things Stand** | 0:45 | DTs are powerful but they still need a human to interpret and act on everything | "Yeah... that is the bottleneck honestly" |
| 8 | **The Evolution So Far** | 1:30 | Static → Reactive → Predictive — and the natural question: what's next? | "Hm, there's a pattern here... what comes after predictive?" |
| 9 | **Enter Agentic AI** | 1:30 | What it is, where it came from. Autonomy, planning, tool use, reflection. | "Oh, this is that AI agent stuff I keep hearing about" |
| 10 | **What If We Combined Them?** | 1:30 | The natural convergence. DTs have the data and models; agents have the reasoning. | "Wait — yeah, that makes a lot of sense" ← THE MOMENT |
| 11 | **The Agentic Digital Twin** | 1:30 | Architecture: Perceive → Reason → Plan → Act → Reflect loop | "Ok so this is how it actually works" |
| 12 | **Research & Real Examples** | 2:00 | IBM AAAI 2025, XMPro MAGS, real results (30-40% downtime reduction) | "This isn't theoretical — people are building this" |
| 13 | **Multi-Agent Systems** | 1:00 | Specialized agents working together like an expert team | "That's clever — each agent has a role" |
| 14 | **LIVE DEMO** | 5:00 | Show agents reasoning about a fab anomaly in real-time | "Oh wow, I can see this working in my environment" |
| 15 | **What's Coming Next** | 1:00 | Digital Triplets — the cognitive layer concept | "This is where the whole industry is headed" |
| 16 | **Challenges to Solve** | 1:30 | Accountability, explainability, security, governance — honestly | "Good — he's not hand-waving the hard parts" |
| 17 | **Key Takeaways** | 1:00 | 4-5 clear takeaways | "I know exactly what I learned" |
| 18 | **Thank You / Q&A** | — | Contact info | |

**Total estimated time**: ~25 minutes + Q&A

**The key moment** is slide 10 — by then you've shown them what DTs can do today and what agentic AI can do, and the audience should be putting it together themselves before you even reveal it. That's the feeling you want.

### What Makes This Different from V1

| Aspect | V1 (Current) | V2 (Journey Approach) |
|--------|-------------|----------------------|
| **Tone** | Informational lecture | Guided journey — audience discovers alongside you |
| **Your role** | Reporting facts about DTs | "I work in agentic AI, let me show you where these worlds meet" |
| **Audience feeling** | "Good overview" | "I can see where this is going — and I want in" |
| **Demo** | Process flow dashboard | AI agents reasoning about a live twin |
| **Differentiation** | Solid but standard | Nobody else in the room connects these two worlds |
| **Landing** | "DTs are useful" | "Oh — when you combine these, that's genuinely new" |

---

## Demo Options — Detailed Breakdown

### Demo 1: Multi-Agent Fab Monitor (CrewAI) ⭐ RECOMMENDED

**What the audience sees**: Three AI agents react to a simulated fab anomaly in real-time. You narrate their reasoning chain as it happens.

**Architecture**:
```
┌─────────────────────────────────────────────────────┐
│                  STREAMLIT DASHBOARD                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Sensor Feed  │  │ Agent Chat  │  │ Action Log  │ │
│  │ (live plots) │  │ (reasoning) │  │ (decisions) │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────┤
│                 CREWAI AGENT LAYER                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Monitor  │→ │ Analyst  │→ │ Maint. Planner   │  │
│  │ Agent    │  │ Agent    │  │ Agent            │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────┤
│              SIMULATED FAB DATA LAYER                 │
│  Sensor streams (temp, pressure, gas flow, vibration) │
│  SimPy process simulation engine                      │
└─────────────────────────────────────────────────────┘
```

**Demo script** (5 minutes):
| Time | What Happens | You Say |
|------|-------------|---------|
| 0:00 | Dashboard shows normal fab ops — green indicators, smooth sensor lines | "Here's our digital twin running normally. Sensor data flowing in real-time." |
| 0:30 | You click "Inject Anomaly" — etch chamber temp starts drifting | "Uh oh — etch chamber 3 temperature is drifting up. In a traditional twin, this would be a red alert and a pager going off at 2 AM." |
| 1:00 | **Monitor Agent** activates, highlights the anomaly, classifies severity | "But watch — the Monitor Agent detected the drift, classified it as a medium-severity thermal excursion." |
| 1:30 | **Analyst Agent** pulls historical data, correlates with past events | "Now the Analyst is pulling historical context — 'last time this pattern occurred, it was a failing heater element in 73% of cases.'" |
| 2:30 | **Planner Agent** generates maintenance recommendation with cost/impact analysis | "The Planner just scheduled preventive maintenance for the next shift change — minimal production impact, parts already in inventory." |
| 3:30 | Show the full reasoning chain in the Agent Chat panel | "Here's the key — you can see the entire reasoning chain. Every step is explainable and auditable." |
| 4:30 | Reset and show it handle a DIFFERENT anomaly type | "Let's try a different failure mode... watch how the agents adapt their reasoning." |

**Tech stack**: Python, CrewAI, Streamlit, SimPy, Plotly
**Effort**: 5–7 days
**Risk**: Low — agents run locally, no external API dependency needed if you use a local model (Ollama) or pre-cache responses
**Wow factor**: 🔥🔥🔥🔥

---

### Demo 2: "Ask Your Twin" — Conversational LLM Interface

**What the audience sees**: A chat interface where you talk to a running digital twin in natural language. Ask it questions, get reasoned answers with data.

**Example interaction**:
```
You: "What's the current health of etch chamber 3?"

Twin: "Etch chamber 3 is operating within spec but showing early signs of 
       degradation. Temperature variance increased 12% over the last 48 hours.
       Based on historical patterns, I recommend scheduling PM within 5 days.
       Confidence: 87%. Estimated cost of delay: $240K in potential yield loss."

You: "What if we increase gas flow by 5% instead?"

Twin: "Increasing CF4 flow by 5% would temporarily compensate for the thermal 
       drift, extending safe operation by ~3 days. However, this increases 
       etch rate non-uniformity by 2.1% at wafer edge. Recommend this as a 
       bridge measure only."
```

**Architecture**:
```
┌──────────────────────────────────────────────┐
│              STREAMLIT UI                      │
│  ┌────────────────┐  ┌─────────────────────┐ │
│  │  Chat Window   │  │  Live Twin Dashboard │ │
│  │  (user ↔ LLM)  │  │  (sensor plots)     │ │
│  └────────────────┘  └─────────────────────┘ │
├──────────────────────────────────────────────┤
│     LLM (GPT-4 / Claude / Local Ollama)       │
│     + Tool calling (query sensors, run sims)  │
│     + RAG over equipment manuals/history       │
├──────────────────────────────────────────────┤
│         Simulated Fab Data + SimPy             │
└──────────────────────────────────────────────┘
```

**Effort**: 4–6 days
**Risk**: Medium — depends on LLM API availability and latency during live demo. Mitigate with pre-cached responses as fallback.
**Wow factor**: 🔥🔥🔥🔥🔥 (highest — conversational interfaces are inherently engaging)

---

### Demo 3: Before/After Split-Screen

**What the audience sees**: Two panels side by side. Left shows a traditional digital twin dashboard responding to an anomaly (alerts, manual triage). Right shows an agentic twin autonomously detecting, diagnosing, and acting.

**Layout**:
```
┌──────────────────────────┬──────────────────────────┐
│   TRADITIONAL TWIN       │   AGENTIC TWIN           │
│                          │                          │
│  🟡 ALERT: Temp drift   │  🤖 DETECTED: Temp drift │
│  🔴 ALERT: Pressure     │  🔍 ANALYZING: Pulling   │
│  🔴 ALERT: Gas flow     │     historical data...   │
│                          │  💡 ROOT CAUSE: Heater   │
│  ⏳ Waiting for          │     element degradation  │
│     operator response    │  📋 ACTION: PM scheduled │
│     ...                  │     for shift change     │
│                          │  ✅ RESOLVED             │
│  📊 3 open alerts        │  📊 0 open alerts        │
│  ⏱️ MTTR: 4.2 hours     │  ⏱️ MTTR: 12 minutes    │
└──────────────────────────┴──────────────────────────┘
```

**Effort**: 3–5 days
**Risk**: Low — fully deterministic, no external API dependency
**Wow factor**: 🔥🔥🔥 (clear but less interactive)

---

### Demo 4: Existing DT + Agentic Layer (Full Stack)

**What it is**: Fork the existing `fab-digital-twin` Streamlit app (already has SimPy fab simulation, Gantt charts, bottleneck detection) and add a CrewAI/LangChain agent layer on top.

**What's compelling**: It's a REAL digital twin with a REAL agentic AI layer. The twin is the SimPy simulation; the agents observe it and act.

**Effort**: 8–12 days
**Risk**: Medium — more moving parts, integration complexity
**Wow factor**: 🔥🔥🔥🔥🔥 (most complete, but most effort)

---

## Demo Recommendation Matrix

| Demo | Effort | Wow | Risk | Standalone? | Shows Agentic AI? | Status |
|------|--------|-----|------|-------------|-------------------|--------|
| **1. Multi-Agent Fab Monitor** | 5-7 days | ⭐⭐⭐⭐ | Low | ✅ | ✅✅✅ | Considered |
| **2. Ask Your Twin** | 4-6 days | ⭐⭐⭐⭐⭐ | Medium | ✅ | ✅✅✅ | ✅ **SELECTED & BUILT** |
| **3. Before/After Split** | 3-5 days | ⭐⭐⭐ | Low | ✅ | ✅✅ | Not needed |
| **4. Full Stack DT + Agents** | 8-12 days | ⭐⭐⭐⭐⭐ | Medium | ✅ | ✅✅✅ | Scoped out |

**Decision**: Demo 2 ("Ask Your Twin") was selected for its highest wow factor and conversational engagement. It has been built as a **Next.js app** with Azure OpenAI (GPT-4o), deployed to Azure Static Web Apps. API risk is managed via a pre-cached fallback response system. All three twin subjects (Edge AI, Robotic Arm, ADAS) are implemented.

---

## Final Demo Strategy

The "Ask Your Twin" interactive demo is the centerpiece. The audience accesses it via QR code on their phones during the talk.

```
FINAL STRATEGY:
  Slides 1-14: Build the narrative (DTs today → agentic AI → convergence)
  Slide 15:    Three domains (Edge AI, Robotic Arm, ADAS) — all running the demo
  Slide 19:    QR code — audience scans and talks to the twin themselves
  Throughout:  Demo is live and explorable from slide ~11 onward
```

**Tech stack (as built)**:
- **Frontend**: Next.js 14 + Tailwind CSS 4 + Framer Motion + Recharts
- **AI**: Azure OpenAI (GPT-4o) via Vercel AI SDK (`@ai-sdk/azure`)
- **Simulation**: TypeScript simulation engine (edge-ai, robotic-arm, ADAS)
- **Hosting**: Azure Static Web Apps (standalone output)
- **CI/CD**: GitHub Actions → Azure SWA on push to `main`
- **Fallback**: Pre-cached responses for common questions (conference WiFi mitigation)

The twin has a brain — and the audience can talk to it.
