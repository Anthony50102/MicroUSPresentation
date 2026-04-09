# The Next Layer for Digital Twins: From Simulation to Autonomous Action

> **Speaker**: Anthony Poole
> **Event**: Microelectronics US 2026 · Embedded Systems US Stage · April 22, 12:00–12:20
> **Venue**: Palmer Events Center, Austin, TX

Presentation materials, interactive demo, and research for a talk on agentic digital twins at Microelectronics US 2026.

## What's Here

| Directory | Contents |
|-----------|----------|
| `presentation/` | Talk narrative, slide outline, demo spec, twin subject specs, conference brief |
| `demo/` | "Ask Your Twin" — Next.js interactive demo (Azure OpenAI + three agentic twins) |
| `infra/` | Azure infrastructure as code (Bicep + deploy script) |
| `research/` | 15 background research files on digital twins, agentic AI, semiconductors |

## The Demo

Audience scans a QR code and talks to an agentic digital twin in natural language. Three twins available — Edge AI Device, Robotic Arm, ADAS Sensor Suite — each with anomaly injection scenarios.

```
cd demo && npm install && npm run dev
```

Requires Azure OpenAI credentials in `.env.local` (see `.env.example`).

## Deploy

Push to `main` triggers GitHub Actions → Azure Static Web Apps. See `.github/workflows/deploy.yml`.
