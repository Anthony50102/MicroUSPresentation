# Speaker Script — The Next Layer for Digital Twins

**Talk**: The Next Layer for Digital Twins: From Simulation to Autonomous Action
**Speaker**: Anthony Poole · AI Engineer, Microsoft
**Stage**: Embedded Systems US · April 22 · 12:00–12:20
**Venue**: Microelectronics US 2026 · Palmer Events Center, Austin TX

---

## Slide 1 — Title

*[Already up as you walk on]*

> Hey everyone. I'm Anthony Poole, AI engineer at Microsoft. I actually started closer to your world than you'd think — I interned at AMD, did research in quantum photonics, wrote my thesis on digital twins. But then I crossed over to the AI side. And over the last year I've watched something reshape how my team thinks about every system we touch. When I looked back at what's happening with digital twins, I realized the same shift is heading this way. So I want to share what I've seen.

---

## Slide 2 — What Is a Digital Twin?

> So let's make sure we're starting from the same place. A digital twin — at its core — is a virtual model that stays continuously synced with a physical system. Data flows in from sensors. Simulations flow back. Whether you've built one, you're evaluating one, or you just have a really good monitoring dashboard — the concept is the same. It's a mirror of something real.

---

## Slide 3 — The Stakes

> And the stakes for getting this right are not small. In automotive, unplanned downtime costs twenty-two thousand dollars a minute. Across semiconductors, energy, defense — the numbers are just as brutal. But here's the real problem: your systems are generating more data every hour than your teams can act on in a week. The mirror is getting sharper. The response time isn't.

---

## Slide 4 — The Evolution

> Digital twins have been evolving for a while now. Gen one was static — here's what your system looks like. A 3D model, a schematic, a snapshot. Gen two was reactive — something went wrong, here's an alert. Gen three — where a lot of you probably are or are heading — is predictive. Something *will* go wrong. And that's genuinely powerful.

> *[Pause, gesture to the Gen 4 ? box]*

> But notice — every generation gets smarter about what's *happening*. None of them do anything *about* it. The human is still the one who gets the call.

---

## Slide 5 — The Confession

*[Let the text land for a beat]*

> Digital twins can see everything. They can't do anything about what they see. That's not a failure — that's a ceiling. And I think we're about to break through it.

---

## Slide 6 — 2:14 AM

*[Slow. Conversational. Like you're telling a friend.]*

> Consider this for a second. You're a process engineer at a fab. It's two fourteen in the morning. Something shifts — temperature drift, vibration spike, pressure drop. Your monitoring system catches it instantly. Seconds. It's been watching every signal, every cycle, twenty-four seven, without blinking.

> *[Pause]*

> You? You're asleep. The last time someone reviewed those logs — maybe two weeks ago. By the time you wake up, understand what happened, dig through maintenance history, track down the part — five, six hours have passed.

> *[Pause]*

> The system detected it in seconds. It took us the better part of a shift. Not because anyone failed. Because detection and action are two completely different problems. And right now, we've only solved one of them.

---

## Slide 7 — Agents

> That was digital twins. Now let's talk about agents.

> I know. You've heard the word. It's been on every keynote slide, every vendor pitch, every LinkedIn post for the last year. And honestly? I was skeptical too. I work in AI — I see what's hype and what's real every day. But I've spent the last year building with these systems, and the results aren't hype. They're changing how my team solves problems, how we diagnose failures, how we make decisions. So — let me show you what an agent actually is.

---

## Slide 8 — Four Capabilities

> Four things make an agent different from a model running inference. Autonomy — it operates within boundaries you define, without waiting for a prompt. Planning — it breaks complex problems into multi-step workflows. Tool use — it connects to real systems, APIs, databases. And reflection — it evaluates what it did and adjusts its approach.

> That last one is the one people underestimate. An agent that can't reflect is just automation with extra steps.

---

## Slide 9 — Convergence

> So now we have two circles. On one side, digital twins — the data, the models, the simulation. On the other, agentic AI — the reasoning, the planning, the action. And if you're looking at this thinking "why aren't these connected yet?" — that's exactly the right question.

---

## Slide 10 — The Reveal

*[Let the slide breathe. A beat of silence before you speak.]*

> The twin that thinks. That's the idea. A digital twin that doesn't just mirror a system — it reasons about it. It plans. It acts. Not replacing the engineer. Giving the engineer a partner that never sleeps and never loses context.

---

## Slide 11 — The Loop

> So what does this actually look like in practice? It's a control loop — something every engineer in this room already thinks in. Perceive — the system ingests data from sensors, logs, models. Reason — it identifies what's happening and why. Plan — it builds a response. Act — it executes through connected systems. Reflect — it evaluates the outcome and feeds that back in.

> This isn't theoretical. This is how the best agentic systems are working right now. Continuous, closed-loop, autonomous within boundaries.

---

## Slide 12 — Architecture

> And architecturally, it's simpler than you'd think. You have the physical system at the bottom — your equipment, your sensors, your floor. In the middle, the digital twin — your models, your simulation, your data layer. And on top, a new cognitive layer — the reasoning, the orchestration, the decision-making.

> *[Pause]*

> Two of those three layers? You already have them. Or you're building them. The whole idea here is one new layer on top of what you've already invested in.

---

## Slide 13 — The Evidence

> Now — I wouldn't be up here telling you about something that only exists in a pitch deck. This is happening. IBM published a paper at AAAI 2025 — one of the top AI conferences — on agentic digital twins for shipping fleet management. LLM agents that autonomously plan, execute, and reflect. XMPro has an open-source multi-agent system in production right now for manufacturing — they're reporting thirty to forty percent reductions in unplanned downtime. And Nature Computational Science published a formal evolutionary framework for this field. It has its own taxonomy.

> This went from idea to research to production faster than most people realize.

---

## Slide 14 — Multi-Agent

> And the architecture that's emerging isn't one giant AI doing everything. It's specialized agents working together. A monitor that detects anomalies. An analyst that finds root causes. A planner that schedules the response. They collaborate — and critically — they check each other's work. The agent that proposes is never the one that approves.

> If that sounds like how a good engineering team works, that's not a coincidence.

---

## Slide 15 — Three Worlds, One Pattern

> And here's what gets me excited. This isn't a solution for one industry. The same pattern — the same loop, the same architecture — applies everywhere. An edge AI device drifts from its training data? The twin diagnoses it and triggers a retrain. A robotic arm shows bearing wear? The twin predicts the failure and schedules maintenance before the line stops. An ADAS sensor suite gets conflicting data? The twin runs safety checks and adapts in real time.

> Different worlds. Same idea. That's how you know it's not a gimmick.

---

## Slide 16 — Challenges

> Now — I'd be lying if I told you this was all figured out. It's not. When an agent makes a bad decision, who owns it? Can you trace why it made that call? These systems create attack surfaces we haven't fully mapped yet. And our governance frameworks? They were built for tools that wait for instructions, not tools that act on their own.

> These are real problems. They're solvable problems. But if we pretend they don't exist, someone else will solve them for us — and we might not like their answers.

---

## Slide 17 — Demo CTA

> So — I built something. I wanted to show this idea, not just talk about it. If you take out your phone and scan that QR code, you can talk to an agentic digital twin right now. There are three of them — an edge AI device, a robotic arm, and an ADAS sensor suite. Ask it what's wrong. Watch it reason. Tell it to fix something and see what it does.

> *[Give them 10–15 seconds to scan]*

> The URL is also at the bottom if you'd rather type it in. And it'll be live after this talk too — so no rush.

---

## Slide 18 — Close

> Digital twins already have the data. Agentic AI gives them the ability to act on it. That's it. That's the whole idea. One new layer.

> *[Pause]*

> Thank you. I'm Anthony Poole — I'd love to talk to anyone who's thinking about this. Come find me, or scan that code and we can connect.

---

## Delivery Notes

- **Pacing**: ~18 slides in 20 minutes. You have room. Don't rush the pauses.
- **Slide 6 is the emotional peak of Part 1.** Slow down. Let silence do the work.
- **Slide 10 is the reveal.** Let the slide appear, wait a full beat, then speak.
- **Slide 17**: Give them real time to scan. 10–15 seconds feels long on stage but it's fine.
- **Posture**: Visionary guide. You're not lecturing — you're showing them something you found and inviting them to look at it with you.
- **Karen Willcox card**: Hold in reserve. If the Q&A gets into "what qualifies you to talk about twins?" territory, that's when you play it.
