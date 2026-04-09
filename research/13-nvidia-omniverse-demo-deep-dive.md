# NVIDIA Omniverse Demo — Deep Dive & Implementation Guide

> **Goal**: Run a live, interactive NVIDIA Omniverse digital twin demo during the Microelectronics US 2026 presentation (April 22–23, Austin, TX)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Compute Options — How Do We Run This?](#compute-options)
3. [Azure Cloud Deployment (Recommended)](#azure-cloud-deployment)
4. [Local GPU Workstation Option](#local-gpu-workstation)
5. [Best Demo for This Audience](#best-demo-for-this-audience)
6. [Demo Implementation — Step by Step](#demo-implementation)
7. [Kit App Streaming — The Conference Superpower](#kit-app-streaming)
8. [Backup & Contingency Plan](#backup-plan)
9. [Timeline & Effort Estimate](#timeline)
10. [Key Resources & Links](#resources)

---

## Executive Summary

NVIDIA Omniverse can absolutely be run in the cloud on Azure — there is a **first-party Microsoft + NVIDIA reference architecture** specifically for this (the "Azure Operations Twin"). For the Microelectronics US audience, the best demo is an **interactive factory/fab digital twin** using NVIDIA's "Assembling Digital Twins" learning path content, streamed to the browser via **Kit App Streaming** so no local install is needed. The audience simply sees a photorealistic 3D environment responding to real-time data.

**Three compute paths** are available:
1. **Azure Cloud GPU VM** (recommended for conference reliability) — ~$3.20/hr
2. **Local RTX laptop/workstation** (backup) — requires NVIDIA RTX GPU
3. **NVIDIA Brev** (managed hosting for Kit apps) — simplest but less control

---

## Compute Options

### Option Comparison

| Option | Cost | Setup Effort | Reliability for Live Demo | GPU Access |
|--------|------|-------------|---------------------------|------------|
| **Azure NV36ads A10 v5** | ~$3.20/hr on-demand | Medium-High | ⭐⭐⭐⭐⭐ (cloud, no hardware to carry) | NVIDIA A10 (24GB VRAM) |
| **Azure Spot VM** | ~$0.60/hr | Medium-High | ⭐⭐⭐ (can be evicted) | NVIDIA A10 (24GB VRAM) |
| **Local RTX Workstation** | One-time hardware | Low (install Omniverse locally) | ⭐⭐⭐⭐ (depends on venue WiFi) | RTX 3070+ or better |
| **Local RTX Laptop** | One-time hardware | Low | ⭐⭐⭐ (thermals, power) | RTX 3070+ Laptop |
| **NVIDIA Brev** | Free tier available | Low | ⭐⭐⭐⭐ (managed hosting) | NVIDIA-managed |

### The Bottom Line
**For a conference talk, Azure is the best option** — you don't carry hardware, you have enterprise-grade reliability, and Kit App Streaming lets you demo from a browser on any laptop. Spin the VM up 1 hour before the talk, demo, shut it down. Total cost: ~$5–10.

---

## Azure Cloud Deployment (Recommended)

### Architecture Overview

```
┌──────────────┐         ┌──────────────────────────┐
│  Your Laptop │         │    Azure Cloud            │
│  (Browser)   │◄──WebRTC──►│                          │
│              │         │  ┌──────────────────────┐ │
│  Presentation│         │  │  Azure GPU VM         │ │
│  Display     │         │  │  (NV36ads A10 v5)     │ │
│              │         │  │                        │ │
│              │         │  │  Omniverse Kit App     │ │
│              │         │  │  + WebRTC Streaming    │ │
│              │         │  │  + USD Factory Scene   │ │
│              │         │  └──────────────────────┘ │
│              │         │                            │
│              │         │  ┌──────────────────────┐ │
│              │         │  │  (Optional) IoT Hub    │ │
│              │         │  │  Simulated sensor data │ │
│              │         │  └──────────────────────┘ │
│              │         └──────────────────────────┘
└──────────────┘
```

### Path A: Quick — Azure Marketplace VM (Simplest)

NVIDIA provides a **pre-configured Omniverse Development Workstation** on the Azure Marketplace:

1. Go to [Azure Marketplace — NVIDIA Omniverse Dev Workstation](https://marketplace.microsoft.com/en-us/product/virtual-machines/nvidia.ov-developer-workstation)
2. Deploy a `Standard_NV36ads_A10_v5` VM
   - **36 vCPUs**, **440 GiB RAM**, **1x NVIDIA A10 GPU (24GB VRAM)**
   - Pre-installed with NVIDIA drivers and Omniverse
   - Windows or Linux
3. RDP/SSH into the VM and launch Omniverse
4. Load your USD scene (factory/fab digital twin)
5. Enable Kit App Streaming (WebRTC) to make it accessible via browser
6. Open a browser on your presentation laptop → connect to the streaming URL
7. Demo live!

**Cost**: ~$3.20/hr (East US, on-demand). A 2-hour demo session = ~$6.40.

**Prep time before talk**: Spin up VM 30–60 min before the session, pre-load the scene.

> Source: [Azure Marketplace — NVIDIA Omniverse Workstation](https://marketplace.microsoft.com/en-us/product/virtual-machines/nvidia.ov-developer-workstation?tab=overview)

### Path B: Full Reference Architecture — Azure Operations Twin

Microsoft and NVIDIA co-developed a complete reference architecture called the **"NVIDIA Omniverse Azure Operations Twin"**. This is the enterprise-grade approach:

**Repo**: [microsoft/NVIDIA-Omniverse-Azure-Operations-Twin](https://github.com/microsoft/NVIDIA-Omniverse-Azure-Operations-Twin/)

**What it does**:
- Collects IoT telemetry from edge devices → Azure IoT Operations → Event Hubs → Azure Data Explorer
- Renders an interactive, physically accurate digital twin in a 3D viewport
- Streamed to remote clients via Kit App Streaming + WebRTC
- Includes Power BI dashboards alongside the 3D view
- Uses Azure Kubernetes Service (AKS) for container orchestration + NVIDIA GPU Operator

**Demo scenario included**: "Contoso Hypermarket" — a warehouse where IoT data (inventory, robotics, temperature, energy) is visualized as a real-time 3D digital twin.

**Pros for the presentation**:
- Shows the FULL stack: IoT → Cloud → Digital Twin → Visualization
- Exactly what the Microelectronics US audience wants to see
- Microsoft-backed, open-source code available

**Cons**:
- Significantly more setup complexity (AKS, networking, DNS, certificates)
- Requires Kubernetes, Helm, Azure CLI expertise
- May be overkill for a single demo — better suited for a multi-day workshop

**Prerequisites** (from the repo):
- Azure subscription with Contributor access
- Linux with Bash shell
- kubectl v1.29+, kubelogin, Helm v3.14+, Azure CLI
- NVIDIA NGC account and API token
- A public domain with Azure DNS

> Source: [GitHub — microsoft/NVIDIA-Omniverse-Azure-Operations-Twin](https://github.com/microsoft/NVIDIA-Omniverse-Azure-Operations-Twin/blob/main/README.md)

### Path C: Kit App Streaming on Azure (Middle Ground)

NVIDIA also offers **Kit App Streaming** as a managed Azure application:

- [Azure Marketplace — NVIDIA Omniverse Kit App Streaming](https://marketplace.microsoft.com/en-us/product/azure-applications/nvidia.ov_kit_app_streaming_application)
- Deploys containerized Omniverse Kit apps on AKS with GPU acceleration
- Handles WebRTC streaming infrastructure
- Less complex than the full Operations Twin architecture

**This is probably the sweet spot** for a conference demo — more polished than a raw VM, less complex than the full AKS reference architecture.

---

## Local GPU Workstation Option

If you have (or can borrow) an NVIDIA RTX GPU machine:

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | NVIDIA RTX 2070 (8GB VRAM) | RTX 4080+ or RTX 6000 Ada (24GB+) |
| **CPU** | 8 cores, 3.5GHz | 16+ cores, 4.5GHz |
| **RAM** | 32GB | 64–128GB |
| **Storage** | 500GB SSD | 1TB NVMe + 2TB SSD |
| **OS** | Windows 10/11 or Ubuntu 22+ | Windows 11 Pro |

### Important: What Does NOT Work
- **Apple Silicon Macs** — no NVIDIA GPU, Omniverse will NOT run
- **Intel-only laptops** — need dedicated NVIDIA RTX GPU
- **AI-only GPUs** (A100, H100, V100) — lack RT cores needed for rendering
- **Older NVIDIA GPUs** (GTX series, pre-Turing) — not supported

### Setup Steps (Local)
1. Install NVIDIA Omniverse Launcher from [nvidia.com/omniverse](https://www.nvidia.com/en-us/omniverse/)
2. Install latest NVIDIA Studio or Game Ready drivers
3. Through Omniverse Launcher, install **USD Composer** (for scene setup) and/or your custom Kit app
4. Download sample factory USD assets from NVIDIA's learning path
5. Open the scene, navigate, demonstrate

**Risk for conference**: Depends on venue WiFi/wired connection, power availability, thermal throttling on laptops.

---

## Best Demo for This Audience

### Audience Reminder
- **Microelectronics US 2026** — engineers, architects, and technical leaders from semiconductor, photonics, and embedded systems
- They want **practical, real-world** demonstrations
- They understand manufacturing environments
- They care about yield, efficiency, cost, time-to-market

### Recommended Demo: Interactive Factory Digital Twin

**Use NVIDIA's "Assembling Digital Twins with Omniverse and OpenUSD" learning path content** as the foundation:

#### What the Audience Sees

1. **A photorealistic 3D factory floor** rendered in real-time
   - Equipment models (etch tools, deposition chambers, lithography steppers — or generic manufacturing equipment)
   - Conveyor systems, automated guided vehicles (AGVs), robotic arms
   - Workers, safety zones, utility infrastructure

2. **Real-time data overlays**
   - Temperature readings on equipment (color-coded heat maps)
   - Equipment status indicators (running/idle/fault)
   - Throughput counters
   - Simulated sensor streams

3. **Interactive "what-if" scenarios**
   - Move equipment and see updated traffic flow
   - Trigger a simulated fault and show how the digital twin alerts operators
   - Toggle between "current state" and "optimized layout" views
   - Zoom into a specific tool and show detailed process data

4. **The "wow" transition**
   - Start zoomed out on the full fab layout
   - Fly through the environment
   - Zoom into a specific tool
   - Show sensor data flowing in real-time
   - Toggle to a "thermal view" showing heat distribution

#### Why This Demo Works for Semiconductor People

| Demo Element | Why Semiconductor Engineers Care |
|-------------|----------------------------------|
| Factory floor layout | They live in fabs — this is immediately relatable |
| Real-time sensor data | Mirrors actual fab monitoring systems (MES, SECS/GEM) |
| Thermal visualization | Thermal management is a constant challenge in fabs |
| Equipment status | Uptime/downtime directly impacts yield and $$ |
| "What-if" scenarios | This is the core value prop of digital twins |
| Photorealistic 3D | Shows this isn't a toy — it's production-grade visualization |

### Alternative Demo Options

| Demo | Pros | Cons | Effort |
|------|------|------|--------|
| **Mega Blueprint (multi-robot fleet)** | Visually stunning, autonomous robots | Less semiconductor-specific | High |
| **Contoso Hypermarket (Azure Ops Twin)** | Full IoT → cloud → 3D pipeline | Warehouse, not fab | High |
| **Custom semiconductor-themed scene** | Most relevant possible | Requires 3D modeling | Very High |
| **Pre-recorded Samsung fab video** | Zero risk, shows real production twin | Not interactive | Very Low |

---

## Demo Implementation — Step by Step

### Phase 1: Environment Setup (Days 1–3)

#### Option A: Azure VM (Recommended)
```bash
# 1. Create resource group
az group create --name rg-omniverse-demo --location eastus

# 2. Deploy NVIDIA Omniverse VM from Marketplace
#    Go to: https://marketplace.microsoft.com/en-us/product/virtual-machines/nvidia.ov-developer-workstation
#    Select: Standard_NV36ads_A10_v5
#    OS: Windows 11 (easier for first-time setup)
#    Region: East US (cheapest at ~$3.20/hr)

# 3. After VM deploys, RDP into it
#    The VM comes pre-configured with NVIDIA drivers and Omniverse

# 4. Launch Omniverse Launcher and install USD Composer
```

#### Option B: Local Machine
```bash
# 1. Download Omniverse Launcher
#    https://www.nvidia.com/en-us/omniverse/download/

# 2. Install latest NVIDIA drivers (573.42+ for Windows)

# 3. Launch Omniverse Launcher → Install USD Composer

# 4. Sign in with NVIDIA account (free)
```

### Phase 2: Scene Setup (Days 3–7)

#### Get the Factory Scene
Follow NVIDIA's learning path: [Assembling Digital Twins With Omniverse and OpenUSD](https://docs.nvidia.com/learning/physical-ai/assembling-digital-twins/latest/index.html)

```
Steps:
1. Download the sample Factory.usd environment
2. Open in USD Composer
3. Load the base factory floor (empty environment)
4. Place machinery and equipment from the asset library
5. Configure lighting for photorealistic rendering
6. Add simulated sensor data points
7. Set up camera waypoints for the fly-through
```

#### Customize for Semiconductor Context
- Rename equipment labels to semiconductor-relevant names (e.g., "Etch Tool 1", "CVD Chamber 3", "Litho Stepper")
- Add temperature heat map overlays on equipment
- Create status indicators (green/yellow/red) for equipment
- Add data panels showing process metrics (wafer throughput, defect rate, etc.)

#### Asset Resources
- **NVIDIA sample factory scene**: Included in the learning path
- **SimReady assets**: Available through Omniverse asset library (manufacturing equipment, conveyors, robots)
- **Custom CAD models**: Import via supported CAD formats (STEP, IGES, JT) or Blender (FBX, glTF)
- **GitHub pipeline samples**: [NVIDIA-Omniverse/aif-pipeline-samples](https://github.com/NVIDIA-Omniverse/aif-pipeline-samples) for CAD-to-USD workflows

### Phase 3: Streaming Setup (Days 7–10)

#### Enable Kit App Streaming for Browser Access

This is what makes the demo work at a conference — **the audience sees a browser-based 3D experience**.

```
Architecture:
  Azure GPU VM (rendering) ──WebRTC──► Your Laptop (browser) ──HDMI──► Projector
```

**Key Steps:**
1. Enable the WebRTC streaming extension in your Kit app
2. Configure the streaming server on the Azure VM
3. Test the browser connection from another machine
4. Verify latency is acceptable (<100ms for smooth interaction)

**Resources:**
- [Kit App Streaming Overview](https://docs.omniverse.nvidia.com/ovas/latest/index.html)
- [Kit App Template (GitHub)](https://github.com/NVIDIA-Omniverse/kit-app-template)
- [Web Viewer Sample (GitHub)](https://github.com/NVIDIA-Omniverse/web-viewer-sample)
- [Video Tutorial: Enable Streaming](https://www.youtube.com/watch?v=sHDtxt_eRo4)

### Phase 4: Demo Script & Rehearsal (Days 10–14)

#### Suggested Demo Script (5–7 minutes)

| Time | Action | Talking Point |
|------|--------|--------------|
| 0:00 | Show browser URL | "This digital twin is running on a cloud GPU — I'm accessing it through a browser" |
| 0:30 | Zoomed-out factory view | "This is a virtual replica of a semiconductor fab. Every piece of equipment is modeled." |
| 1:00 | Fly through the environment | "We can navigate freely — this is rendered in real-time with full physics" |
| 1:30 | Zoom into equipment | "Here's an etch tool. See the temperature readings updating in real-time from simulated sensors" |
| 2:30 | Show thermal overlay | "Switch to thermal view — immediately see which tools are running hot" |
| 3:30 | Trigger simulated fault | "Watch what happens when Chamber 3 goes out of spec..." |
| 4:00 | Show alert + root cause | "The digital twin detected the anomaly and suggested root cause before it hit yield" |
| 5:00 | Show "what-if" scenario | "What if we rearrange the layout? Here's the optimized version — 12% better throughput" |
| 6:00 | Zoom back out | "This is what the future of fab management looks like — and it's available today" |

---

## Kit App Streaming — The Conference Superpower

### What It Is
Kit App Streaming lets you run Omniverse on a remote GPU server and stream the rendered output to a **web browser via WebRTC**. The audience sees a photorealistic 3D environment in your browser — no downloads, no installs, no local GPU needed.

### Why It's Perfect for a Conference Talk
- **No hardware to carry** — just bring your laptop and open a browser
- **No install required** — works in Chrome/Edge
- **Enterprise-grade** — this is how Samsung and others deploy their digital twins
- **Impressive** — the audience sees you controlling a cloud-rendered 3D environment from a browser tab
- **Story value** — "I'm running this on an Azure GPU in East US. This is the same infrastructure Samsung uses for their fab digital twin."

### How It Works

```
1. GPU Server (Azure VM) runs Omniverse Kit App
2. Kit App renders the 3D scene on the RTX GPU
3. WebRTC extension encodes frames as H.264 video
4. Video stream sent to client browser via WebRTC
5. Browser receives video + sends mouse/keyboard input back
6. Result: Interactive 3D in a browser tab
```

### Setup Checklist
- [ ] Deploy Azure GPU VM with Omniverse
- [ ] Configure WebRTC extension in Kit app
- [ ] Set up firewall rules (open WebRTC ports)
- [ ] Test from a separate machine/network
- [ ] Verify latency (<100ms for smooth feel)
- [ ] Test with conference venue WiFi (or bring mobile hotspot as backup)

---

## Backup & Contingency Plan

### If Azure/Cloud Fails
1. **Pre-record** a 5-minute screen capture of the full demo flow
2. Have it ready as a local video file on your laptop
3. Transition seamlessly: "Let me show you what this looks like when we put it all together" → play video

### If Internet Fails
1. **Local Omniverse** on an RTX laptop as hot backup
2. Requires bringing an RTX-capable laptop to the venue
3. Pre-load the exact same scene locally

### If Everything Fails
1. **Screenshots + animations** in the PowerPoint deck
2. Still tells the story, just not live

### Pre-Talk Checklist
- [ ] Azure VM spun up and scene loaded (1 hour before)
- [ ] Browser tested from presentation laptop
- [ ] Video backup loaded on laptop
- [ ] Mobile hotspot charged and tested
- [ ] Presentation laptop charged, power adapter ready
- [ ] HDMI/USB-C adapter tested with venue projector

---

## Timeline & Effort Estimate

| Phase | Task | Time Needed |
|-------|------|-------------|
| **Phase 1** | Set up Azure VM or local GPU machine, install Omniverse | 1–2 days |
| **Phase 2** | Build/customize factory scene with NVIDIA learning path | 3–4 days |
| **Phase 3** | Configure Kit App Streaming, test browser access | 2–3 days |
| **Phase 4** | Script the demo, rehearse, prepare backup video | 2–3 days |
| **Total** | | **8–12 days** |

### Critical Path
- Conference is **April 22–23** — 16 days from today (April 6)
- This is tight but achievable if you start immediately
- The Azure Marketplace VM approach (Path A) is the fastest path
- Days 1–3 are most critical — get the environment running

---

## Key Resources & Links

### Official NVIDIA Documentation
| Resource | URL |
|----------|-----|
| Assembling Digital Twins (Learning Path) | [docs.nvidia.com](https://docs.nvidia.com/learning/physical-ai/assembling-digital-twins/latest/index.html) |
| Open the Factory Environment | [docs.nvidia.com](https://docs.nvidia.com/learning/physical-ai/assembling-digital-twins/latest/getting-started/open-factory-environment.html) |
| Kit App Streaming Overview | [docs.nvidia.com](https://docs.omniverse.nvidia.com/ovas/latest/index.html) |
| Technical Requirements | [docs.nvidia.com](https://docs.omniverse.nvidia.com/ov/latest/common/technical-requirements.html) |
| Spatial Streaming Requirements | [docs.nvidia.com](https://docs.omniverse.nvidia.com/avp/latest/requirements.html) |
| Factory DT Reference Architecture | [docs.nvidia.com](https://docs.omniverse.nvidia.com/arch-diagrams/latest/ref-arch-diagrams/factory-dt-diagram.html) |
| Omniverse Blueprint Blog | [developer.nvidia.com](https://developer.nvidia.com/blog/rapidly-create-real-time-physics-digital-twins-with-nvidia-omniverse-blueprints/) |
| NVIDIA Digital Twin Learning Path | [nvidia.com](https://www.nvidia.com/en-us/learn/learning-path/digital-twins/) |
| Industrial Facility DT Use Case | [nvidia.com](https://www.nvidia.com/en-us/use-cases/industrial-facility-digital-twins/) |

### Azure / Cloud
| Resource | URL |
|----------|-----|
| Azure Marketplace — Omniverse Dev Workstation | [marketplace.microsoft.com](https://marketplace.microsoft.com/en-us/product/virtual-machines/nvidia.ov-developer-workstation?tab=overview) |
| Azure Marketplace — Kit App Streaming | [marketplace.microsoft.com](https://marketplace.microsoft.com/en-us/product/azure-applications/nvidia.ov_kit_app_streaming_application) |
| Azure Operations Twin (GitHub) | [github.com/microsoft](https://github.com/microsoft/NVIDIA-Omniverse-Azure-Operations-Twin/) |
| Azure NVadsA10v5 VM Specs | [learn.microsoft.com](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nvadsa10v5-series) |
| NVIDIA Blog — Omniverse on Azure | [blogs.nvidia.com](https://blogs.nvidia.com/blog/omniverse-cloud-services-microsoft-azure/) |

### GitHub Repositories
| Repo | Purpose |
|------|---------|
| [microsoft/NVIDIA-Omniverse-Azure-Operations-Twin](https://github.com/microsoft/NVIDIA-Omniverse-Azure-Operations-Twin/) | Full Azure reference architecture with IoT + Omniverse |
| [NVIDIA-Omniverse/kit-app-template](https://github.com/NVIDIA-Omniverse/kit-app-template) | Template for building Kit streaming apps |
| [NVIDIA-Omniverse/web-viewer-sample](https://github.com/NVIDIA-Omniverse/web-viewer-sample) | Sample web client for Kit streaming |
| [NVIDIA-Omniverse/aif-pipeline-samples](https://github.com/NVIDIA-Omniverse/aif-pipeline-samples) | CAD-to-USD pipeline samples and SimReady assets |
| [NVIDIA-Omniverse-blueprints](https://github.com/NVIDIA-Omniverse-blueprints) | Reference blueprints (Mega, AI Factory, etc.) |

### Video Tutorials
| Video | URL |
|-------|-----|
| Custom DT Applications (Playlist) | [YouTube](https://www.youtube.com/playlist?list=PL3jK4xNnlCVcR4mkKPIUbvdJH7thO_LOJ) |
| Kit App Streaming Setup | [YouTube](https://www.youtube.com/watch?v=sHDtxt_eRo4) |
| Omniverse Cloud APIs on Azure | [YouTube](https://www.youtube.com/watch?v=3hLEj0i7fug) |

### Licensing & Pricing
| Tier | Cost | Notes |
|------|------|-------|
| **Omniverse Individual** | **FREE** | For individual devs, collaboration with 1 other user |
| Omniverse Enterprise | $4,500/GPU/year | Multi-user, enterprise support |
| Azure NV36ads A10 v5 VM | ~$3.20/hr on-demand | Use spot pricing (~$0.60/hr) for dev, on-demand for demo |

---

## Key Takeaways

1. ✅ **YES, you can run Omniverse on Azure** — it's a first-class deployment target with marketplace VMs and reference architectures
2. 💰 **Cost is minimal** — ~$3–6 for a 1–2 hour demo session on Azure
3. 🏭 **Best demo: Interactive factory digital twin** using NVIDIA's learning path content, customized with semiconductor labels/overlays
4. 🌐 **Kit App Streaming is the killer feature** — demo runs on cloud GPU, you just open a browser
5. ⏱️ **Timeline is tight but doable** — 8–12 days of work, conference is in 16 days
6. 🔑 **Start with the Azure Marketplace VM** (Path A) — fastest path to a working demo
7. 📹 **Always have a video backup** — pre-record the demo flow in case of technical issues
