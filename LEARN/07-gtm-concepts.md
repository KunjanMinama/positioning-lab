# Developer Go-To-Market (GTM) Concepts in Practice

Positioning Lab translates developer marketing strategy into disciplined software. In developer GTM, traditional B2B playbooks fail because software engineers have near-zero tolerance for marketing fluff, deceptive claims, and ungrounded hype.

This document breaks down the fundamental GTM concepts implemented in Positioning Lab and connects each concept directly to a screen in the application.

---

## 1. Positioning vs. Messaging

- **Positioning** is the mental shelf space your product occupies in the buyer's mind relative to alternatives. It answers: *"What category are you in, who are you for, and why should anyone care?"*
- **Messaging** is the specific words, headlines, and arguments you use to express that positioning.

### In Positioning Lab:
On the **Create Experiment** screen ([src/pages/(app)/(protected)/experiments/new.tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/%28app%29/%28protected%29/experiments/new.tsx)), you do not start by writing catchy copy. You start by selecting an **Audience Segment** (e.g. *Solo Next.js builders using Claude/Cursor*) and articulating the strategic core.

---

## 2. Segments & ICP (Ideal Customer Profile)

A positioning angle rarely resonates with everyone. Trying to speak to both enterprise security compliance officers and weekend indie hackers in one headline produces watered-down, ineffective copy.

### In Positioning Lab:
Each experiment targets a distinct segment:
1. **Solo Builders & Indie Hackers:** Care about velocity, zero setup, integrated DB/auth, and zero maintenance.
2. **Startup CTOs & Lead Engineers:** Care about edge latency, Cloudflare Workers reliability, vendor lock-in, and zero secrets management.
3. **Agencies & Client Developers:** Care about multi-tenancy, instant scaffolding, rapid previews, and painless client handoffs.

---

## 3. The Developer Funnel & Intent Proxies

Traditional SaaS funnels track:
$$\text{Attention} \longrightarrow \text{Visit} \longrightarrow \text{Email Signup} \longrightarrow \text{Activation} \longrightarrow \text{Paid Subscription}$$

In developer marketing, **email signups are a lagging, noisy metric**. Developers hate filling out lead forms. Instead, high-intent developers immediately copy the CLI install command, inspect the GitHub repository, or read the API reference.

### In Positioning Lab:
On the public test landing page ([src/pages/t/[slug].tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/t/%5Bslug%5D.tsx)), our **Primary Metric** is `copy_command` (`npx create-deepspace app`).
- Clicking `Copy` demonstrates **Developer Intent**: the developer plans to paste the command into their terminal.
- We also measure secondary intent: `docs_click` (visiting technical documentation) and `tried_it` (self-reported trial in the micro-survey).

> **Crucial GTM Note:** We recognize that `copy_command` is an **intent proxy**, not confirmed activation. A developer might copy the command and never run it. Real GTM rigor requires acknowledging this proxy gap rather than pretending a click is a paying customer.

---

## 4. Pre-Registration & The Decision Rule

The most common trap in GTM experimentation is **HARKing** (Hypothesizing After the Results are Known). A marketer runs a test, sees that Variant B got 4 extra clicks on Twitter, and invents a post-hoc story explaining why Variant B is the winner.

### In Positioning Lab:
Before an experiment can be launched, the GTM engineer is **forced** to pre-register a hypothesis and an explicit **Decision Rule**:
- *Hypothesis:* "Framing DeepSpace as a zero-setup Cloudflare Workers backend will yield $\ge 20\%$ higher copy rate than the full-stack SDK angle among Hacker News visitors."
- *Decision Rule:* "If Variant B exceeds Variant A by $> 3\%$ at $n \ge 100$ per variant with non-overlapping Wilson intervals, expand Variant B to the main documentation hero. Otherwise, keep Variant A and stop."

When the experiment launches, the system records `lockedAt` and makes this rule immutable.

---

## 5. Marketing Channels & Attribution Sanitization

A headline that converts at 15% on Hacker News might convert at 1% on LinkedIn. Measuring aggregate conversion without channel segmentation hides where your message actually works.

### In Positioning Lab:
All traffic links support standardized source tags:
- `?src=hn` (Hacker News)
- `?src=reddit` (r/webdev, r/reactjs)
- `?src=x` (Twitter/X)
- `?src=discord` (Developer servers)
- `?src=linkedin` (Professional network)
- `?src=friend` (Direct peer feedback)

The **Live Dashboard** ([src/pages/(app)/(protected)/experiments/[id].tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/%28app%29/%28protected%29/experiments/%5Bid%5D.tsx)) displays a dedicated **Channel Breakdown Table**, allowing the team to see if a positioning angle is channel-specific or universal.

---

## 6. The Three Decisions: Expand, Change, or Stop

When an experiment concludes, GTM engineers must not just look at a chart; they must make an operational business decision:
1. **Expand:** The evidence favors a variant with statistical separation. Roll this angle into product docs, repo READMEs, and landing pages.
2. **Change:** The hypothesis was refuted or gave mixed signals, but qualitative micro-survey feedback identified a new pain point. Pivot the messaging.
3. **Stop:** The angle fell completely flat or both variants performed identically. Archive the experiment and do not waste engineering or marketing cycles on it.

### In Positioning Lab:
On the **Readout & Decision Tab**, the user records their decision (`expand`, `change`, `stop`) along with their business reasoning. This immediately commits a record to the **Playbook Library** ([src/pages/(app)/(protected)/playbooks.tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/%28app%29/%28protected%29/playbooks.tsx)), building institutional knowledge for the entire company.
