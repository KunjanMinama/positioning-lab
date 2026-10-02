# Comprehensive Interview Preparation & Live Drills

This document is your preparation manual for both the **Technical Live Coding Session** and the **Developer GTM Strategy Interview**. Every question includes a high-impact model answer, concrete examples from this codebase, and common weak answers to avoid.

---

# Part 1: Technical Live Coding Drills

## 1. Request Flow Deep Dive
### Question: "Walk me through what happens when a public visitor clicks 'Copy Command' on the test page."
- **Model Answer:** When the user clicks the copy button, the browser writes `npx create-deepspace app` to the system clipboard and immediately dispatches a call to the `recordEvent` Server Action. The worker receives the request, strips untrusted headers, and validates the payload using a Zod schema to ensure `type === 'copy_command'` and the experiment is in `launched` status. Once validated, the worker writes the event to SQLite inside the Durable Object. The Durable Object broadcasts the updated count over WebSocket to connected admin sessions, updating the live dashboard and Wilson interval bars in real time without a page refresh.
- **Project Example:** Look at `copyCommand()` in [src/pages/t/[slug].tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/t/%5Bslug%5D.tsx#L55) calling `recordEvent` in [src/actions/index.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/actions/index.ts).
- **Weak Answer to Avoid:** *"It just sends an API call and saves it to the database."* (Fails to demonstrate understanding of edge runtime, validation, or realtime sync).

---

## 2. Secrets & Proxy Architecture
### Question: "Where are your API keys stored, and why are there none in your repository?"
- **Model Answer:** There are zero API keys in the repository because Positioning Lab uses DeepSpace's platform proxy layer. All LLM calls route through `ai.generateObject` at the edge runtime, where DeepSpace injects provider credentials and enforces rate limiting upstream. The application code never handles, logs, or stores OpenAI or Anthropic tokens. If an external third-party integration were needed, we would route it through DeepSpace's integration proxy rather than introducing raw environment secrets into client or worker bundles.
- **Project Example:** In [src/actions/index.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/actions/index.ts), `writeReadout` calls the AI proxy directly without loading `process.env.OPENAI_API_KEY`.
- **Weak Answer to Avoid:** *"I put them in `.env.local` and added it to `.gitignore`."* (Misses the entire point of the platform proxy).

---

## 3. Statistical Rigor & The Status Gate
### Question: "Why use the Wilson score interval instead of a standard normal approximation or just comparing percentages?"
- **Model Answer:** A normal approximation interval ($p \pm z\sqrt{p(1-p)/n}$) assumes large samples and breaks down near $0$ or $1$, often producing impossible intervals that extend below $0\%$ or above $100\%$. In early developer marketing experiments, sample sizes are small (e.g. 15 to 50 visitors). The Wilson score interval inverts the score test, naturally shifting the center toward $0.5$ ($\tilde{p}$ adjustment) and providing asymmetric, strictly bounded confidence limits even when successes are zero. Our 3-state status gate uses these intervals to prevent premature conclusions until intervals are completely non-overlapping and minimum sample size is met.
- **Project Example:** See [src/lib/stats.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/stats.ts) and the hand-calculated test in `tests/unit/stats.test.ts`.
- **Weak Answer to Avoid:** *"Percentages are enough if one number is bigger than the other."* (Disregards random variance and false discovery).

---

## 4. The Bug Bank (6 Diagnostic Drills)

Practice diagnosing these 6 common bugs during technical interviews:

### Bug 1: Unhandled Anonymous DB Permission
- **Symptom:** Public test landing page fails to render; console shows `403 Forbidden: RecordRoom collection 'variants' denied`.
- **Diagnosis:** A developer bypassed `getPublicVariant` server action and tried to query the `variants` collection directly from the browser SDK.
- **Fix:** Call `getPublicVariant` via Server Action where elevated worker privileges fetch and filter the record.

### Bug 2: Zod Schema Rejecting Valid Marketing Channels
- **Symptom:** Visitors clicking `?src=youtube` always record as `other`.
- **Diagnosis:** `ALLOWED_CHANNELS` in `src/lib/assign.ts` does not include `'youtube'`.
- **Fix:** Add `'youtube'` to `ALLOWED_CHANNELS` array and type definition.

### Bug 3: Bot Traffic Inflating Conversion Rates
- **Symptom:** Sudden spike of 500 views and 0 copies within 10 seconds.
- **Diagnosis:** Headless search crawler visiting the slug page.
- **Fix:** Verify `isBotUserAgent(req.headers.get('user-agent'))` properly flags crawlers and prevents them from incrementing sample totals.

### Bug 4: Wilson Interval Negative Lower Bound
- **Symptom:** UI displays Lower Bound as `-2.4%`.
- **Diagnosis:** Developer used normal approximation $p - 1.96 \cdot \text{SE}$ instead of Wilson formula.
- **Fix:** Clamp bounds with `Math.max(0, ...)` and use Wilson score formula in `src/lib/stats.ts`.

### Bug 5: Hash Instability on Public Refresh
- **Symptom:** Visitor refreshes page and gets Variant B after seeing Variant A.
- **Diagnosis:** `assignVariant` used `Math.random()` or visitorId was regenerated on every page mount.
- **Fix:** Persist `visitorId` in `localStorage` and hash `"${experimentId}:${visitorId}"` deterministically with FNV-1a.

### Bug 6: AI Readout Claiming a Winner on Insufficient Data
- **Symptom:** AI summary says "Variant B is the clear winner!" even when sample size is 12.
- **Diagnosis:** Prompt allowed unconstrained natural language without checking the status gate.
- **Fix:** Enforce `statusGate` in `AiReadoutOutputSchema` and pass prompt constraint: `"Status gate is not_enough_data. You are strictly forbidden from declaring a winner."`

---

# Part 2: GTM Strategy & Behavioral Interview Prep

## 1. Positioning DeepSpace Across 3 Personas
### Question: "How would you position DeepSpace to (a) solo builders, (b) startup CTOs, and (c) software agencies?"
- **Model Answer:**
  - *Solo Builders:* Position DeepSpace as the **"One-Command Edge Stack"** — zero config, instant auth, edge SQLite, and AI proxies so they ship full-stack apps in hours without managing infrastructure.
  - *Startup CTOs:* Position DeepSpace as **"Enterprise Cloudflare Workers without the Platform Overhead"** — zero secrets in client bundles, sub-millisecond edge latency, built-in RBAC, and predictable costs.
  - *Agencies:* Position DeepSpace as **"Client App Factory"** — spin up isolated client backends instantly with zero DevOps handoff friction.
- **Project Example:** These 3 personas are pre-configured as segments in [src/pages/(app)/(protected)/experiments/new.tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/%28app%29/%28protected%29/experiments/new.tsx).
- **Weak Answer to Avoid:** Giving the exact same pitch ("it's fast and easy") to all three groups.

---

## 2. Developer Intent Proxies & The Funnel
### Question: "Define a funnel for a developer tool and explain where proxy metrics can mislead."
- **Model Answer:** A developer funnel runs: **Discovery (HN/X) $\to$ Landing Page Visit $\to$ Copy Install Command $\to$ Local Project Init $\to$ First API Call $\to$ Production Deployment**. In our app, we track `copy_command` as a primary conversion metric. While clicking 'Copy' indicates far higher intent than an email newsletter signup, it is still an intent proxy. A developer may copy the command, paste it into terminal, encounter an npm error, and abandon. True GTM rigor requires validating proxy metrics against backend telemetry before declaring product-market fit.
- **Project Example:** We explicitly document the proxy gap in our UI footer and in [LEARN/07-gtm-concepts.md](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/LEARN/07-gtm-concepts.md).
- **Weak Answer to Avoid:** *"Copying the command means they adopted the tool."*

---

## 3. Handling Null Results & Playbooks
### Question: "What do you do when an experiment yields a flat, inconclusive result?"
- **Model Answer:** A null result is not a failure; it is validated learning that prevents expensive mistakes. If two angles perform identically within overlapping Wilson intervals, we trigger the **`stop`** decision. We record the exact numbers, hypothesis, and learnings into our Playbook collection so future teammates don't re-test the same hypothesis. We then review the qualitative micro-survey feedback to identify unexpected friction points and prioritize the next idea from our ICE backlog.
- **Project Example:** See our Playbook generator and record schema in [src/pages/(app)/(protected)/playbooks.tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/%28app%29/%28protected%29/playbooks.tsx).
- **Weak Answer to Avoid:** *"Keep running the test until one variant starts winning."* (This is the definition of p-hacking).

---

## 4. 30-60-90 Day Plan for AI-Native GTM Engineer
### Question: "What would your first 90 days look like in this role?"
- **Model Answer:**
  - *First 30 Days (Learn & Audit):* Map developer documentation journeys, interview 15 active builders and churned users, audit the existing conversion funnel, and establish baseline Wilson intervals for key developer actions.
  - *First 60 Days (Systematize & Test):* Pre-register and run 4 targeted positioning experiments across top developer channels (Hacker News, Reddit, Twitter), connecting CLI install telemetry to web landing pages.
  - *First 90 Days (Scale & Playbooks):* Package winning angles into company-wide positioning playbooks, automate docs-grounded Claim Guard checks in our marketing pipeline, and train product marketing around rigorous mathematical status gates.
- **Weak Answer to Avoid:** *"I would immediately launch a big ad campaign and redesign the website."* (Lacks hypothesis testing and data discipline).
