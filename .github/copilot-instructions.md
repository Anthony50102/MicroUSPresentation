This repo contains the full preparation for Anthony Poole's talk at **Microelectronics US 2026** (April 22–23, Palmer Events Center, Austin, TX).

**Talk**: *The Next Layer for Digital Twins: From Simulation to Autonomous Action*
**Stage**: Embedded Systems US · April 22 · 12:00–12:20
**Core thesis**: Digital twins are powerful simulation tools today. Agentic AI gives them the ability to reason, decide, and act — creating a genuinely new chapter for virtual prototyping and embedded systems.

## Repo Structure

- `presentation/` — The narrative plan for the talk:
  - `direction-overview.md` — V2 agentic direction, demo decision rationale, speaker posture
  - `presentation-outline.md` — Final 20-slide outline with timing budget and speaker notes
  - `interactive-demo-spec.md` — "Ask Your Twin" demo spec (layout, UX, visual style)
  - `twin-subject-specs.md` — Three twin subjects: Edge AI Device, Robotic Arm, ADAS Sensor Suite
  - `conference-brief.md` — Microelectronics US conference context, stage schedule, audience fit
  - `presentation-v2-agentic.pptx` — The PowerPoint slide deck

- `demo/` — The "Ask Your Twin" interactive demo (Next.js 14):
  - Audience accesses via QR code on phones during the talk
  - Three agentic digital twins: Edge AI, Robotic Arm, ADAS
  - Terminal-style chat powered by Azure OpenAI (GPT-4o) with tool calling
  - Animated SVG twin visualizations + live stats sidebar
  - Pre-cached fallback responses for conference WiFi resilience
  - Deployed to Azure Static Web Apps (standalone output)

- `infra/` — Azure infrastructure as code (Bicep + `deploy.sh`) for the Static Web App

- `research/` — 15 research files covering digital twin fundamentals, semiconductor context, agentic AI, market data, case studies, and demo feasibility analysis

- `.github/workflows/deploy.yml` — CI/CD: builds the Next.js app and deploys to Azure Static Web Apps on push to `main` (with PR preview support)

## Demo App Details (`demo/`)

- **Framework**: Next.js 14 with `output: 'standalone'`
- **AI**: Vercel AI SDK (`@ai-sdk/azure`) → Azure OpenAI GPT-4o with tool calling
- **Simulation**: TypeScript engines in `lib/simulation/` (edge-ai.ts, robotic-arm.ts, adas.ts)
- **Twin configs**: `lib/twin-config.ts` — system prompts, anomaly scenarios, stat labels per twin
- **Components**: `app/components/` — Shell, TerminalChat, StatsSidebar, TwinSelector, twin visualizations
- **API**: `app/api/chat/` — streaming chat endpoint
- **Charts**: Recharts sparklines in stats sidebar
- **QR**: `/qr` route for the presentation slide QR code
- **Fallback**: `lib/fallback-cache.ts` for pre-cached responses

### Environment Variables

```
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o
NEXT_PUBLIC_DEMO_URL=https://your-app.azurestaticapps.net
```

These are passed as build-time env vars in the CI/CD pipeline via GitHub Secrets.

## Key Context for AI Assistants

- The talk follows the **Journey Approach**: ground the audience in DTs today → introduce agentic AI → let the convergence click → live demo → look forward
- The speaker posture is "visionary guide" — not lecturing, guiding the audience to discover the idea alongside you
- The demo is the centerpiece — audience scans a QR code and talks to the twin themselves
- The three twin subjects (Edge AI, Robotic Arm, ADAS) map directly to the Embedded Systems US stage themes
- The `presentation/` markdown files are the source of truth for narrative and direction; the `.pptx` is the delivery artifact
- The `research/` files are reference material — comprehensive but from an earlier research phase
