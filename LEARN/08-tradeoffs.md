# Engineering & Strategic Tradeoffs

Every architectural choice is a tradeoff. In this project, we deliberately prioritized scientific honesty, speed of execution, and zero-secret security over feature sprawl and vanity integrations.

This document details the central tradeoff of Positioning Lab, the explicit reasons behind every omitted DeepSpace primitive, known system limitations, and what we would build next.

---

## 1. The Central Tradeoff: Rigor vs. Vanity

### What We Chose:
**A disciplined, honest developer marketing lab governed by mathematical status gates.**
- If you have 15 visits and 3 copies, the system explicitly prints `not_enough_data` in yellow.
- It refuses to render celebratory confetti or declare a "winner."
- It forces the AI readout writer to acknowledge uncertainty and recommend gathering more data.

### What We Rejected:
**A flashy "growth hacking" dashboard that declares premature winners.**
- Many marketing tools use standard two-proportion z-tests with early peeking, declaring 99% significance after 12 clicks.
- While exciting to non-technical stakeholders, it produces false-positive decisions that cost companies months of wasted engineering effort.
- We deliberately built an interface that respects developers and statistical reality.

---

## 2. Deliberately Omitted DeepSpace Primitives

The DeepSpace evaluation criteria state:
> *"Use integrations where they improve the product or user experience; there is no minimum integration count. Explain your choices and tradeoffs, including why you left out features or integrations that would not add value."*

We evaluated every available DeepSpace SDK primitive against our core mission:

### 1. Payments / Stripe Integration (`@deepspace/payments`)
- **Status:** **Deliberately Omitted.**
- **Reasoning:** Positioning Lab is an internal developer GTM evaluation tool and an experimentation test harness for prospective developers. No part of this system takes payments or charges credit cards.
- Adding Stripe checkout or subscription webhooks would be **vanity integration padding** — bloating the bundle and adding zero product value to an experimentation workflow.

### 2. File / Blob Storage (R2 / S3)
- **Status:** **Deliberately Omitted.**
- **Reasoning:** Variant creative assets in developer marketing are concise: headlines, value propositions, code snippets, and terminal commands. All of these fit naturally into SQLite text columns in our RecordRoom.
- Introducing object storage to store a few paragraphs of text would introduce network overhead, eventual consistency edge cases, and unnecessary complexity. If we later expand to video demos or image banners, R2 storage would be justified.

### 3. Custom Domain Provisioning
- **Status:** **Deliberately Omitted.**
- **Reasoning:** Every DeepSpace app automatically receives an authenticated, SSL-secured edge domain at `<name>.app.space`. For internal GTM experimentation and developer test landing pages, this URL is fast, globally cached, and immediately operational. Configuring DNS records for a custom vanity domain would not alter experimental validity.

### 4. Collaborative Text Streaming (CRDTs / Yjs)
- **Status:** **Deliberately Omitted in favor of Presence.**
- **Reasoning:** We considered live Google-Docs-style co-editing for variant headlines. However, marketing hypotheses are carefully formulated, reviewed against Claim Guard, and pre-registered. Realtime character-by-character merging often creates messy race conditions.
- Instead, we implemented **DeepSpace Presence (`usePresence`)**. Team members can see who is currently viewing or reviewing an experiment, preventing simultaneous overwrite collisions while keeping the architecture lightweight.

---

## 3. Known System Limitations

1. **Proxy Metric Gap:**
   - Our primary conversion event is `copy_command` (`npx create-deepspace app`).
   - A copy click indicates high developer intent, but does not guarantee the developer actually pasted the command into their terminal, installed the CLI, and completed onboarding.
2. **Heuristic Bot Filtering:**
   - Our bot filter in [src/lib/bots.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/bots.ts) checks common crawler signatures (`Googlebot`, `bingbot`, `Twitterbot`, `curl`, `wget`).
   - Stealth crawlers or headless browser scripts mimicking residential Chrome headers could bypass the regex filter.
3. **Keyword-Based Claim Guard Fallback:**
   - When AI proxy calls are simulated or offline, Claim Guard matches against seed facts via token and substring overlap. Sophisticated semantic contradictions (e.g. nuanced architectural differences) are best caught when the AI proxy is online or during human review.

---

## 4. What We Would Build Next

If given another week of development, our roadmap prioritizes:

1. **CLI Telemetry Webhook Integration:**
   - Connect `npx create-deepspace` with an anonymous postback webhook carrying an ephemeral session token.
   - This would bridge the proxy gap: measuring not just `copy_command`, but true `terminal_initialized` conversions.
2. **Automated Live Docs Scraping via Integration Proxy:**
   - Use DeepSpace's integration proxy to scrape `https://docs.deep.space` on a nightly scheduled cron job, refreshing the `facts` collection whenever platform documentation updates.
3. **Slack / Discord Experiment Webhooks:**
   - When an experiment transitions from `directional` to `evidence_favors_x`, automatically dispatch a notification to the company `#gtm-experiments` channel with the Wilson confidence interval and decision recommendation.
4. **Bayesian Experimentation Mode:**
   - In addition to frequentist Wilson score intervals, offer a Bayesian beta-binomial distribution model displaying the posterior probability that Variant B beats Variant A ($P(B > A)$).
