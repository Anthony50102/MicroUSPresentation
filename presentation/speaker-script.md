# Speaker Script — The Next Layer for Digital Twins

**Talk**: The Next Layer for Digital Twins: From Simulation to Autonomous Action
**Speaker**: Anthony Poole · Software Engineer, Microsoft
**Stage**: Embedded Systems US · April 22 · 12:00–12:20
**Venue**: Microelectronics US 2026 · Palmer Events Center, Austin TX

---

## Slide 1 — Title

*[Already up as you walk on]*

> Hey everyone. I'm Anthony Poole, software engineer at Microsoft — I build AI systems. But I actually started a bit closer to y'all's world than you'd think — I interned at AMD, did research in photonics, wrote my thesis on digital twins, and I worked on embedded systems for autonomous vehicles. But then I crossed over to the big tech AI side. And over the last year I've watched something reshape how my team thinks about every system we touch. Now when I look back at what's happening with digital twins, I realize the same shift is heading this way. So I want to share with you guys not just what I've seen, but my vision for what you all will see.

---

## Slide 2 — Digital Twins (section title)

*[Click through quickly — this is a signpost, not a beat]*

---

## Slide 3 — What Is a Digital Twin?

> So let's make sure we're starting from the same place. A digital twin — at its core — is a virtual model that stays continuously synced with a physical system. Data flows in from sensors. Simulations flow back. Whether you've built one, you're evaluating one, or you just have a really good monitoring dashboard — the concept is all the same. It's a mirror of something real.

---

## Slide 4 — The Stakes

> And the stakes for getting this right are not small. In the automotive industry, unplanned downtime costs twenty-two thousand dollars a minute. In semiconductor fabs it can hit five million dollars an hour. And at the electric grid level, U.S. power outages cost a hundred and twenty-one billion dollars last year alone. If you guys live here in Austin, I'm sure you're all too familiar with that one. But here's the real problem: these systems are generating more data every minute than teams can act on in a week. The mirror is getting sharper. The ability to respond isn't.

---

## Slide 5 — The Evolution

> Digital twins have been evolving for a while now. Gen one was static — here's what a lot of systems look like. A 3D model, a schematic, a snapshot. Gen two was reactive — something went wrong, here's an alert. Gen three — where a lot of you probably are or are heading — is predictive. Something *will* go wrong. And that's incredibly powerful.

> *[Pause, gesture to the Gen 4 ? box]*

> But notice — every generation gets smarter about what's *happening*. None of them do anything *about* it. The human is still on their own when it comes to diagnosis of issues, performance improvements and validation.

---

## Slide 6 — The Confession

*[Let the text land for a beat]*

> Digital twins can see everything. They can't do anything about what they see. That's not a failure — that's a ceiling. And I think we're about to break through it.

---

## Slide 7 — 2:14 AM

*[Slow. Conversational. Like you're telling a friend.]*

> Consider this for a second. You're a process engineer at a fab. It's two fourteen in the morning. Something shifts — temperature drift, vibration spike, pressure drop. Your monitoring system catches it instantly. Seconds. It's been watching every signal, every cycle, twenty-four seven, without blinking.

> *[Pause]*

> You? You're asleep. The last time someone manually reviewed those logs — maybe two months ago. By the time you wake up, understand what happened, dig through maintenance history, track down the part — five, six hours have passed.

> *[Pause]*

> The system detected it in seconds. It took us the better part of a shift. Not because anyone failed. Because detection and action are two completely different problems. And right now, we've only solved one of them.

---

## Slide 8 — Agents (section title)

> That was digital twins. Now let's talk about agents.

> I know. You've heard the word. It's been on all these keynote slides, vendor pitches, and certainly every LinkedIn post for the last year. And if I'm being honest? I was skeptical too. I work in AI — I see what's hype and what's real every day. But I've spent the last year building these systems, and they work — they aren't curing cancer, but they make engineering fundamentally different. They've changed how my team solves problems, how we diagnose failures, how we make decisions. And importantly, how we think and plan for the future. So — let me show you what an agent actually is.

---

## Slide 9 — Four Capabilities

> Four things make an agent different from just the ChatGPT webpage that you're all familiar with. Autonomy — it operates within boundaries you define, without waiting for anyone to ask. Planning — it breaks complex problems into multi-step workflows. Tool use — it connects to real systems, APIs, databases. And reflection — it evaluates what it did and adjusts its approach.

> That last one is the one people often underestimate. And this is where we see a significant amount of gains.

---

## Slide 10 — Convergence

> So now we have two circles. On one side, digital twins — the data, the models, the simulation. On the other, agentic AI — the reasoning, the planning, the action. And if you're looking at this thinking "why aren't these connected yet?" — that's exactly the right question.

---

## Slide 11 — The Reveal

*[Let the slide breathe. A beat of silence before you speak.]*

> What if the twin could think? That's the idea. A digital twin that doesn't just mirror a system — it reasons about it. It plans. It acts. Not replacing the engineer. Giving the engineer a partner that never sleeps and never loses context. Think back to that engineer at 2 AM. Instead of having to open your laptop and dig through dashboards, logs, and databases — you might just get a report from the twin saying: here's what went wrong, here's your actual data, and here are three options to act on it. Paged to resolved in minutes, not hours. And maybe in the future the engineer might not have to be woken up at all...

---

## Slide 12 — The Loop

> So let's talk about what this actually looks like in practice. It's a control loop! Something every engineer in this room already thinks in. Perceive — the system ingests data from sensors, logs, models. Reason — it identifies what's happening and why. Plan — it builds a response. Act — it executes through connected systems. Reflect — it evaluates the outcome and feeds that back in.

> This isn't me telling you what might work for y'all — this is how real-world agentic AI is running right now. It's continuous, closed-loop, autonomous within boundaries.

---

## Slide 13 — Architecture

> And architecturally, it's simpler than you'd think. You have the physical system at the bottom — your equipment, your sensors, your floor. In the middle, the digital twin — your models, your simulation, your data layer. And on top, a new cognitive layer — the reasoning, the orchestration, the decision-making.

> *[Pause]*

> Two of those three layers? You already have them. Or you're building them. The whole idea here is one new layer on top of what you've already invested in.

---

## Slide 14 — The Evidence

> Now — I wouldn't be up here telling you about something that only exists in a pitch deck. I'm not a thought leader or visionary — I'm an engineer, just like y'all. This might not have hit industry yet, but it's coming. IBM published a paper at AAAI 2025 — one of the top AI conferences — on agentic digital twins for shipping fleet management. LLM agents that autonomously plan, execute, and reflect. XMPro has a multi-agent system in production right now for manufacturing — they're reporting potential thirty to forty percent reductions in unplanned downtime. And Nature Computational Science published a piece this year mapping the full evolution of digital twins — from reactive to agentic. Six capability levels: standalone, descriptive, diagnostic, predictive, prescriptive, autonomous. That's a real maturity model in a top journal. This field is getting its foundations.

> This went from idea to research to production faster than most people realize.

---

## Slide 15 — Multi-Agent

> And the architecture that's emerging isn't one giant AI doing everything. It's specialized agents working together. A monitor that detects anomalies. An analyst that finds root causes. A planner that schedules the response. They collaborate — and critically — they check each other's work. The agent that proposes is never the one that approves.

> If that sounds like how a good engineering team works — it is. And that's not a coincidence.

---

## Slide 16 — Three Worlds, One Pattern

> And here's what gets me excited. This isn't a solution for one industry or one use case. The same pattern — the same loop, the same architecture — applies everywhere. An edge AI device drifts from its training data? The agentic twin diagnoses it and triggers a retrain. A robotic arm shows bearing wear? The agentic twin predicts the failure and schedules maintenance before anything happens. An ADAS sensor suite gets conflicting data? The agentic twin runs safety checks and adapts in real time.

> Different worlds. Same idea. That's how you know it's an engineering tool rather than a fragile gimmick.

---

## Slide 17 — Challenges

> Now — I'd be lying if I told you this was all figured out. It's not. When an agent makes a bad decision, who owns it? Can you trace why it made that call? These systems create attack surfaces we haven't fully mapped yet. And governance frameworks weren't built for tools that act on their own.

> These are real problems. They aren't fatal, but they are critical. They're solvable. But this is the forefront — it's mixing engineering best practices and domain expertise to push the envelope and build better systems. It's happening right now in my world, and I believe it's coming to y'all's very soon.

---

## Slide 18 — Demo CTA

> So — I built something. I wanted to show this idea, not just talk about it. If you take out your phone and scan that QR code, you can talk to an agentic digital twin right now. There are three of them — I wanted to build something for each of our audience types, so there's an edge AI device, a robotic arm, and an ADAS sensor suite. Ask it what's wrong. Inject some issues. Watch it reason. Tell it to fix something and see what it does.

> *[Give them 10–15 seconds to scan]*

> The URL is also at the bottom if you'd rather type it in. And it'll be live after this talk too — so no rush.

---

## Slide 19 — Questions

> To put this simply: Digital twins already have the data and models. Agentic AI gives them the ability to act on it. That's it. That's the whole idea. One new layer.

> *[Pause]*

> Thank you for listening. I'm Anthony — I'd love to talk to anyone who's thinking about or interested in this. Come find me, or scan that code for my personal site and contact info. And if anyone has any questions, I'd love to take them.

*[This slide stays up during Q&A — contact info and QR visible the whole time]*

---

## Slide 20 — Close

*[Click to this after Q&A wraps, as your final word]*

> Thanks everyone.

---

## Delivery Notes

- **Pacing**: 20 slides in 20 minutes. You have room. Don't rush the pauses.
- **Slide 7 is the emotional peak of Part 1.** Slow down. Let silence do the work.
- **Slide 11 is the reveal.** Let the slide appear, wait a full beat, then speak.
- **Slide 18**: Give them real time to scan. 10–15 seconds feels long on stage but it's fine.
- **Slide 19**: This stays up during Q&A. No rush — people scan the QR while you talk.
- **Slide 20**: Click to this as the last thing. Your thesis on screen as people leave.
- **Posture**: Visionary guide. You're not lecturing — you're showing them something you found and inviting them to look at it with you.
- **Karen Willcox card**: Hold in reserve. If the Q&A gets into "what qualifies you to talk about twins?" territory, that's when you play it.
