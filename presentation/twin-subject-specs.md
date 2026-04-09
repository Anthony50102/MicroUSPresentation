# Interactive Demo: Twin Subject Options — Detailed Specs

> Three fully spec'd twin subjects for the "Ask Your Twin" interactive demo.
> Same UI shell (visual + terminal chat + stats sidebar). Different simulated systems underneath.

---

## Option 1: Edge AI Device Twin

### What Is an Edge AI Device?

An "edge AI device" is just a small computer that runs machine learning models locally — at the "edge" of the network — instead of sending data to the cloud. Think of it like this:

**A security camera that can tell you "that's a person" without calling home.**

These devices are everywhere:
- **Factory floor**: A camera watching a conveyor belt, running a vision model that detects defective parts in real-time
- **Retail**: A shelf sensor with an ML model that tracks inventory
- **Automotive**: The compute module inside a car that runs object detection on camera feeds
- **Agriculture**: A drone with onboard AI identifying crop disease

The hardware is typically something like:
- **NVIDIA Jetson** (Nano, Orin) — GPU-powered edge AI boards
- **Google Coral** — TPU-based inference accelerator
- **Raspberry Pi + Hailo** — cheap board + AI accelerator chip
- **Custom silicon** — companies like Edge Impulse (3 talks on your stage!) help deploy models to microcontrollers

**The problem**: Once you deploy a model to an edge device, it's out in the wild. The lighting changes. The camera gets dirty. The types of objects shift. The model slowly gets worse and nobody notices until something breaks. This is called **model drift** — and it's one of the biggest unsolved headaches in edge AI.

**This is where the agentic twin comes in.** The digital twin monitors the device's health AND the model's performance. The AI agent layer can:
- Detect that accuracy is dropping
- Figure out *why* (data distribution shifted? hardware degrading? environmental change?)
- Recommend or even initiate a fix (retrain, recalibrate, swap to backup model)

**Why this is perfect for your stage**: The talk right before yours is literally "The Future of Truly Autonomous Edge AI" with the Edge AI Foundation VP. Edge Impulse has 3 sessions. The audience walks into your talk thinking about edge AI — and you hand them an interactive twin of the exact thing they were just discussing.

### What the Audience Sees

```
┌─────────────────────────────────────────┬────────────────┐
│                                         │  📊 Device     │
│   EDGE AI VISION MODULE                 │                │
│   ┌─────────────────────┐               │  CPU: 72°C     │
│   │  📷 Camera Feed     │               │  GPU: 68°C     │
│   │  (simulated frames) │               │  Mem: 84%      │
│   │                     │               │  Power: 12.4W  │
│   │  🟢 Person (0.94)   │               │  ─────────────│
│   │  🟢 Forklift (0.91) │               │  📈 Model      │
│   │  🟡 Pallet (0.67)   │  ← detections │  FPS: 28       │
│   └─────────────────────┘               │  Accuracy: 94% │
│                                         │  Drift: ⚠️ 12% │
│   Model: YOLOv8-nano                    │  Uptime: 47d   │
│   Device: Jetson Orin Nano              │  [sparklines]  │
│   Status: Running ✅  Drift: Warning ⚠️ │                │
├─────────────────────────────────────────┴────────────────┤
│ > Why is detection confidence dropping on pallets?        │
│                                                          │
│ Analyzing inference history...                           │
│                                                          │
│ Pallet detection confidence dropped from 0.89 → 0.67    │
│ over the last 72 hours.                                  │
│                                                          │
│ Root cause analysis:                                     │
│ • Training data had 94% wood pallets, but facility       │
│   switched to black plastic pallets last week            │
│ • Model has only 12 black pallet examples in training set│
│ • Lighting shift (evening shift is 15% dimmer) compounds │
│   the issue                                              │
│                                                          │
│ Recommendation:                                          │
│ 1. Collect 200+ frames of new pallet type (auto-flagged) │
│ 2. Fine-tune model with augmented dataset (~2hr on cloud)│
│ 3. Deploy updated model via OTA to device                │
│ Estimated accuracy recovery: 91-93%                      │
│                                                          │
│ > _                                                      │
└──────────────────────────────────────────────────────────┘
```

### Simulated Data Model

| Sensor / Metric | Normal Range | Anomaly Scenarios |
|----------------|-------------|-------------------|
| CPU Temperature | 55-75°C | Thermal throttling at 85°C → inference slows |
| GPU Temperature | 50-70°C | Correlates with workload |
| Memory Usage | 60-85% | Memory leak causes gradual climb |
| Power Draw | 10-15W | Spikes during high-complexity scenes |
| Inference FPS | 25-30 | Drops when device throttles or scene complexity rises |
| Model Accuracy | 90-96% | Drifts down as data distribution shifts |
| Detection Confidence | 0.7-0.99 per object | Drops for novel/changed objects |
| Uptime | Days counter | Resets on crash/reboot |

### Anomaly Scenarios Users Can Trigger

1. **"Inject model drift"** — Accuracy gradually drops as simulated environment changes (new object types, lighting shift). Agent detects pattern, diagnoses cause, recommends retraining.

2. **"Simulate thermal throttle"** — CPU temp climbs above 85°C, device auto-throttles, FPS drops from 28→15. Agent identifies thermal issue, recommends workload reduction or cooling check.

3. **"Trigger memory leak"** — Memory usage slowly climbs from 70%→95%. Agent notices trend, correlates with firmware version, recommends restart and patch.

4. **"New shift lighting"** — Simulates evening shift with dimmer lighting. Accuracy drops specifically on edge-of-frame detections. Agent recommends exposure compensation or model with low-light augmentation.

### LLM Tool Calls

```python
tools = [
    get_device_health(device_id)        # → CPU temp, GPU temp, memory, power, uptime
    get_inference_metrics(timeframe)     # → FPS, accuracy, latency over time
    get_detection_log(last_n)           # → recent detections with confidence scores
    get_training_data_stats()           # → class distribution in training set
    get_drift_analysis(metric, window)  # → statistical drift detection results
    run_what_if(parameter, change)      # → "what if we adjust exposure +10%?"
    get_environment_conditions()        # → lighting level, temperature, humidity
]
```

### Why the Agentic Layer Matters Here

Without agentic AI, a traditional twin would show you dashboards. An operator looks at the dashboard, sees accuracy dropping, scratches their head, opens a ticket, someone investigates days later.

**With the agentic layer**: The twin notices the drift, pulls historical data, correlates across multiple signals (new pallets + evening lighting + confidence drop on specific class), generates a diagnosis AND an action plan. The loop closes in minutes, not days.

That's the whole point of your talk — embodied in an interactive demo they can touch.

---

## Option 2: Robotic Arm / Pick-and-Place Twin

### What the Audience Sees

```
┌─────────────────────────────────────────┬────────────────┐
│                                         │  📊 Status     │
│   ROBOTIC ARM — PICK & PLACE            │                │
│                                         │  Joint 1: ✅   │
│         ╭─────╮                         │  Joint 2: ✅   │
│         │  J2 │                         │  Joint 3: ⚠️   │
│    ╭────╯     ╰────╮                    │  Joint 4: ✅   │
│    │  Arm Segment   │                   │  ─────────────│
│    ╰────╮     ╭────╯                    │  Temp: 67°C   │
│         │  J3 │  ← animated,           │  Vibration:   │
│         ╰──┬──╯    moves in             │    2.4 mm/s ⚠️│
│            │       real-time            │  Cycles: 142K │
│         ╭──┴──╮                         │  Accuracy:    │
│         │Grip │                         │    ±0.02mm    │
│         ╰──┬──╯                         │  Torque: 82%  │
│        ────┴────                        │  [sparklines] │
│         [Base]                          │                │
├─────────────────────────────────────────┴────────────────┤
│ > Joint 3 vibration is trending up. Is this a problem?   │
│                                                          │
│ Analyzing joint 3 telemetry...                           │
│                                                          │
│ Vibration: 2.4 mm/s (baseline: 1.8 mm/s, +33%)         │
│ Trend: Steadily increasing over 14 days                  │
│ Temperature: Joint 3 running 8°C above nominal           │
│                                                          │
│ Diagnosis:                                               │
│ • Pattern matches bearing wear degradation (84% match)   │
│ • At current rate, bearing failure estimated in 12-18    │
│   days                                                   │
│ • Similar failure occurred on Arm #7 at cycle 148K       │
│   (you're at 142K)                                       │
│                                                          │
│ Recommendation:                                          │
│ 1. Order replacement bearing (part #BR-4420, in stock)   │
│ 2. Schedule PM during next shift change (Thu 6:00 AM)    │
│ 3. Reduce joint 3 max velocity by 15% as interim measure │
│ Estimated downtime for repair: 45 minutes                │
│                                                          │
│ > _                                                      │
└──────────────────────────────────────────────────────────┘
```

### Simulated Data Model

| Sensor / Metric | Normal Range | Anomaly Scenarios |
|----------------|-------------|-------------------|
| Joint angles (J1-J4) | Varies by motion profile | Drift = calibration issue |
| Joint temperatures | 40-65°C per joint | High = friction, bearing wear |
| Vibration (per joint) | 0.5-2.0 mm/s | Rising = bearing/gear degradation |
| Motor torque | 30-85% capacity | Spikes = obstruction or wear |
| Cycle count | Running total | Correlates with wear patterns |
| Placement accuracy | ±0.01-0.05mm | Degrading = calibration or mechanical |
| Gripper force | 5-20N | Too high = crushing, too low = drops |
| Cycle time | 1.2-2.0s per pick | Increasing = degradation signal |

### Anomaly Scenarios

1. **"Bearing wear"** — Joint 3 vibration climbs over days. Agent correlates with temperature, cycle count, and historical failure data. Predicts remaining life and schedules PM.

2. **"Calibration drift"** — Placement accuracy degrades from ±0.02mm to ±0.08mm. Agent identifies it as a calibration issue (not mechanical), recommends auto-recalibration routine.

3. **"Gripper slip"** — Drop rate increases. Agent analyzes gripper force vs. object weight, identifies worn gripper pads, recommends replacement.

4. **"Obstruction"** — Torque spike on joint 2 during specific motion path. Agent identifies a new object in the workspace and recommends path replanning.

### Visual Implementation

The robotic arm is the most visually compelling option because:
- **It moves** — animated SVG/Canvas shows the arm cycling through pick-and-place motions
- **Intuitive** — everyone understands a robot arm picking things up
- **Color-coded joints** — green/yellow/red based on health, immediately readable
- **The anomaly is visible** — when bearing wear kicks in, you can show a slight jitter in the animation

### LLM Tool Calls

```python
tools = [
    get_joint_status(joint_id)          # → angle, temp, vibration, torque
    get_arm_metrics(timeframe)          # → cycle count, accuracy, cycle time trend
    get_maintenance_history(arm_id)     # → past repairs, parts replaced, MTBF
    get_failure_patterns(symptom)       # → historical correlation database
    get_gripper_status()                # → force, wear level, drop rate
    run_what_if(parameter, change)      # → "what if we reduce J3 speed by 15%?"
    get_production_schedule()           # → when is the next maintenance window?
]
```

---

## Option 3: ADAS Sensor Suite Twin

### What the Audience Sees

```
┌─────────────────────────────────────────┬────────────────┐
│                                         │  📊 Sensors    │
│   VEHICLE SENSOR SUITE — ADAS           │                │
│                                         │  🟢 LiDAR     │
│              [LiDAR]                    │    Range: 120m │
│            ╱    │    ╲                  │    Points: 64K │
│      [Cam-L] [Cam-F] [Cam-R]           │  🟡 Cam-F     │
│            ╲    │    ╱                  │    FPS: 22 ⚠️  │
│              [Radar]                    │    Conf: 89%   │
│                                         │  🟢 Radar     │
│   ┌─── Sensor Fusion Engine ────┐      │    Range: 200m │
│   │  Objects: 14                │      │    Track: 24   │
│   │  Pedestrians: 3  Vehicles: 8│      │  ─────────────│
│   │  Cyclists: 1  Unknown: 2   │      │  Fusion: 94.1% │
│   │  Fusion Confidence: 94.1%   │      │  Latency: 12ms │
│   └─────────────────────────────┘      │  [sparklines]  │
│                                         │                │
│   Environment: Dusk, light rain         │                │
├─────────────────────────────────────────┴────────────────┤
│ > Front camera FPS dropped. Is the sensor suite still     │
│   safe for L2+ autonomy?                                  │
│                                                          │
│ Analyzing sensor health and fusion confidence...          │
│                                                          │
│ Front camera status:                                      │
│ • FPS dropped from 30 → 22 (26% reduction)               │
│ • Detection confidence: 89% (threshold: 85%)              │
│ • Probable cause: lens contamination (rain + road spray)  │
│   OR thermal throttling (sensor temp: 71°C, limit: 80°C) │
│                                                          │
│ Fusion impact assessment:                                 │
│ • LiDAR and radar compensating — fusion still at 94.1%   │
│ • Pedestrian detection redundancy: MAINTAINED (LiDAR      │
│   covers front camera's blind degradation)                │
│ • HOWEVER: If camera drops below 15 FPS or 80% conf,     │
│   fusion confidence falls below L2+ safety threshold      │
│                                                          │
│ Recommendation:                                           │
│ 1. Trigger lens cleaning system (washer nozzle)           │
│ 2. Monitor — if no improvement in 60s, reduce speed       │
│    envelope from 65mph → 45mph                            │
│ 3. If further degradation: alert driver, prepare          │
│    handoff to manual control                              │
│                                                          │
│ Current safety assessment: L2+ CAPABLE with margin ✅     │
│                                                          │
│ > _                                                      │
└──────────────────────────────────────────────────────────┘
```

### Simulated Data Model

| Sensor / Metric | Normal Range | Anomaly Scenarios |
|----------------|-------------|-------------------|
| LiDAR point cloud density | 50K-80K points | Drops in rain/fog/dust |
| LiDAR range | 100-150m | Degrades in weather |
| Camera FPS (×3 cameras) | 28-30 per camera | Drops on throttle or contamination |
| Camera confidence | 85-98% | Weather, lighting, dirt affect it |
| Radar tracks | 15-30 active | Interference or hardware fault |
| Radar range | 150-250m | Stable in most conditions |
| Fusion confidence | 90-99% | Composite of all sensors |
| Fusion latency | 8-15ms | Increases under load |
| Environment | Sun/cloud/rain/night | Affects all optical sensors |
| Sensor temperatures | 30-75°C per unit | Thermal throttling risk |

### Anomaly Scenarios

1. **"Rain + dusk"** — Camera confidence drops, LiDAR point cloud thins. Agent assesses fusion margin, determines system is still safe but with reduced margin. Recommends speed envelope reduction.

2. **"Lens contamination"** — Front camera FPS and confidence drop while LiDAR/radar stay normal. Agent isolates issue to camera, triggers cleaning system, monitors recovery.

3. **"Radar interference"** — Radar tracks become noisy (another vehicle's radar on same frequency). Agent detects increased false positives, increases reliance on LiDAR+camera fusion, flags for next service.

4. **"Sensor failure"** — One camera goes offline entirely. Agent immediately recalculates safety envelope, switches to degraded mode, alerts driver for potential handoff.

### Why ADAS Works for This Audience

The afternoon panel on your stage is literally called "Automotive Applications for Embedded AI/ML" with speakers from Ford, Amazon, and MIPS. NXP is presenting on safety-critical HMIs. The audience understands:
- Sensor fusion
- Safety thresholds
- Functional safety (ISO 26262)
- Real-time decision-making under uncertainty

Showing an AI agent that can reason about multi-sensor health and make safety-aware decisions in natural language — that's exactly the capability they're trying to build.

### LLM Tool Calls

```python
tools = [
    get_sensor_status(sensor_id)         # → health, FPS/range, temp, confidence
    get_fusion_metrics()                 # → overall confidence, latency, object count
    get_environment_conditions()         # → weather, lighting, road surface
    get_safety_assessment(autonomy_lvl)  # → is the system safe for L2+? margin?
    get_sensor_history(sensor, window)   # → trend data for any sensor
    run_what_if(sensor_id, failure_mode) # → "what if front camera fails completely?"
    get_redundancy_map()                 # → which sensors cover which zones
]
```

---

## Side-by-Side Comparison

| Dimension | Edge AI Device | Robotic Arm | ADAS Sensor Suite |
|-----------|---------------|-------------|-------------------|
| **Immediate audience hook** | Follows Edge AI talk | Universal visual | Automotive crowd (~35%) |
| **Visual appeal** | Camera feed + detections | Animated moving arm | Sensor diagram + fusion |
| **Agentic showcase** | Model drift → diagnosis → fix | Bearing wear → predict → schedule | Multi-sensor → safety → action |
| **Complexity to build** | Medium | Medium | Medium-High |
| **Mobile-friendliness** | Good | Great (simple visual) | Good |
| **Conversation depth** | Deep (many what-ifs) | Deep (mechanical + scheduling) | Very deep (safety layers) |
| **"Oh wow" moment** | "It figured out WHY accuracy dropped" | "It predicted the failure 2 weeks out" | "It's making safety-critical decisions" |
| **Build estimate** | 7-9 days | 7-9 days | 8-10 days |

---

## My Ranking for Your Specific Situation

1. **Edge AI Device** — You follow the Edge AI talk. The handoff is seamless. The audience is already thinking about this. And model drift is the #1 pain point nobody's solved well yet — showing an agentic twin that handles it is genuinely novel.

2. **Robotic Arm** — Best visual, most intuitive. If you want the "whoa" factor when people pull it up on their phones, this is it. The animated arm moving + color-coded joints is immediately engaging.

3. **ADAS Sensor Suite** — Deepest domain resonance with the automotive crowd, but slightly harder to build and the visual is more abstract (diagram vs. animation).

**You could also build Edge AI as primary and Robotic Arm as the visual showpiece, sharing the same backend agentic architecture with different simulated data.**
