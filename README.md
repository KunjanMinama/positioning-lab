# Positioning Lab

> **A rigorous developer marketing experimentation engine for DeepSpace.**  
> Pre-register positioning hypotheses and decision rules, ground AI copy against official documentation with **Claim Guard**, deterministically assign public visitors via FNV-1a hashing, and prevent premature victory declarations with a mathematical **3-state Wilson status gate**.

[![Live App](https://img.shields.io/badge/Live_App-positioning--lab.app.space-blueviolet.svg)](https://positioning-lab.app.space)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![DeepSpace SDK](https://img.shields.io/badge/DeepSpace-Edge_Platform-orange.svg)](https://docs.deep.space)
[![Claim Guard Evals](https://img.shields.io/badge/Claim_Guard-12%2F12_(100%25)-green.svg)](tests/evals/claimGuard.cases.json)
[![Tests](https://img.shields.io/badge/Unit_Tests-20_Passed-brightgreen.svg)](tests/)

---

## 1. What is Positioning Lab?

Developer tools fail when their positioning is built on ungrounded marketing hype, buzzwords, and untested assumptions. In developer marketing, software engineers reject superlative claims ("revolutionary", "unlimited") and guard their inboxes against spam.

**Positioning Lab** transforms developer marketing from guesswork into disciplined engineering:
1. **Pre-Registration:** GTM engineers must declare an audience segment, a measurable hypothesis, and an immutable decision rule before an experiment can be launched.
2. **Claim Guard:** An automated verification system grounded in `docs.deep.space` that audits marketing copy against technical reality, flagging unsupported claims and buzzwords before public launch.
3. **Deterministic Assignment:** Visitors to `/t/:slug` are hashed via 32-bit FNV-1a into stable variants without tracking cookies, browser fingerprinting, or raw IP storage.
4. **Developer Intent Telemetry:** Measures high-intent developer actions (`copy_command` for `npx create-deepspace app`, `docs_click`) alongside qualitative micro-surveys.
5. **Mathematical Status Gate:** A 3-state state machine (`not_enough_data`, `directional`, `evidence_favors_x`) powered by 95% Wilson score confidence intervals that mathematically blocks AI readouts and dashboards from declaring premature winners on small sample sizes.

---

## 2. Architecture Overview

Positioning Lab runs entirely at the Cloudflare edge on the **DeepSpace SDK**:

```
[Public Visitor]                [GTM Team Member / Admin]
       │                                     │
       │ (1. Visits /t/:slug?src=hn)         │ (Manage, Draft, Launch, Readout)
       ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 DeepSpace Edge Worker                       │
│  - FNV-1a Deterministic Variant Assignment                  │
│  - Bot Crawler Regex Filter (Ephemeral Headers Only)        │
│  - Zod Input & Output Schema Validation                     │
│  - DeepSpace AI Proxy (Zero secrets / Claude 3.5 / GPT-4o)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Secure internal query)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          RecordRoom Durable Object (Cloudflare Edge)        │
│  - Embedded SQLite Database (11 primary collections)        │
│  - Realtime WebSocket Broadcast to Active Dashboards        │
│  - Ephemeral Presence Channel (Active Teammate Avatars)     │
│  - Strict RBAC: Anonymous Visitors have ZERO direct access  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. DeepSpace SDK Primitives Used

We prioritized technical depth and genuine architectural fit over vanity feature padding:

| Primitive | Where It Lives | Why We Chose It | Alternative Considered |
|---|---|---|---|
| **1. Scaffold & CLI** | Root configuration, `wrangler.toml` | Instant TypeScript + Tailwind + Generouted edge foundation. | Manual Vite + Cloudflare Workers setup (error-prone). |
| **2. Auth & RBAC** | `src/schemas.ts`, `src/actions/index.ts` | Multi-role security: admins manage, members draft, anonymous visitors are strictly barred from direct DB writes. | Custom JWT cookies or third-party Clerk/Auth0. |
| **3. RecordRoom (SQLite)**| `src/schemas.ts` | Edge-hosted SQLite inside Durable Objects for persistent relational experiment telemetry with sub-millisecond latency. | External Postgres (Neon/Supabase) with cross-region network latency. |
| **4. Server Actions** | `src/actions/index.ts` | Trusted backend execution boundary enforcing Zod validation, bot filtering, and status gates. | Unprotected client-side RPC calls. |
| **5. AI Proxy** | `src/actions/index.ts` | LLM inference at edge with **zero API secrets** in codebase, managed billing, and structured outputs. | Raw `openai` package requiring `.env` API keys that risk leaking. |
| **6. Presence** | `src/pages/(app)/(protected)/experiments/[id].tsx` | Real-time teammate presence avatars (`usePresence`) preventing simultaneous edit collisions. | Heavyweight CRDT collaborative text streaming. |
| **7. Testing Helpers** | `tests/experiment-flow.spec.ts` | Multi-user Playwright browser fixtures via `deepspace/testing`. | Fragile custom multi-context browser orchestration. |

### Deliberately Omitted Primitives (With Reasoning)
- **Payments (`@deepspace/payments`):** Positioning Lab is an internal experimentation lab and public developer test harness. No part of the system takes money. Adding Stripe would be vanity integration padding with zero user value.
- **File / Blob Storage (R2 / S3):** Creative copy (headlines, subheads, terminal commands) is text stored directly in SQLite RecordRoom. Storing small text snippets in object storage introduces unnecessary latency and complexity.
- **Custom Domains:** Subdomain routing on `*.app.space` provides full SSL, edge caching, and isolated routing out of the box.

---

## 4. Privacy & Zero-Secrets Guarantee

- **Zero Secrets:** All LLM calls and integrations route through DeepSpace proxies. Running `git log -p | grep -E "(sk-[a-zA-Z0-9]{20,}|ghp_)"` returns **zero matches**.
- **No PII Stored:** We **never** store raw IP addresses or raw User-Agent strings. Headers are evaluated in memory for bot filtering and discarded immediately.
- **Anonymous Session:** Visitors are assigned a random UUID in `localStorage`. Attribution channels (`?src=...`) are sanitized against a strict whitelist (`linkedin, x, reddit, hn, discord, friend, other`).

---

## 5. Mathematical Rigor: The Wilson Score Status Gate

Standard A/B testing dashboards use naive normal approximations that break down on small sample sizes and lead to "peeking" errors.

Positioning Lab implements the **95% Wilson Score Interval** in `src/lib/stats.ts`:

$$\tilde{n} = n + z^2, \quad \tilde{p} = \frac{k + \frac{1}{2}z^2}{\tilde{n}}$$
$$\text{Interval} = \tilde{p} \pm \frac{z}{\tilde{n}} \sqrt{k(n - k)/n + z^2/4}$$

### The 3-State Status Gate:
1. `not_enough_data` (Yellow): Total visitors $< \text{minSamplePerVariant}$ (default 50). Dashboard displays warning; AI readout is forbidden from declaring a winner.
2. `directional` (Blue): Minimum sample size reached, but Wilson intervals overlap. Early signal exists, but variance prevents definitive conclusions.
3. `evidence_favors_x` (Green): Minimum sample size reached **AND** Wilson confidence intervals are completely non-overlapping. Statistical evidence supports adopting the winning angle.

---

## 6. Claim Guard: Grounded Marketing Evals

Developer copy drafted by AI is validated by **Claim Guard** ([src/lib/claimGuard.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/claimGuard.ts)) against official facts from `docs.deep.space`:
- **Banned Superlatives:** Automatically flags hype words (`"unlimited"`, `"revolutionary"`, `"100% free"`).
- **Ground-Truth Matching:** Verifies technical assertions (e.g., edge SQLite, Durable Objects, zero client API keys).
- **Eval Benchmark Suite:** Validated against 12 ground-truth test cases in [tests/evals/claimGuard.cases.json](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/tests/evals/claimGuard.cases.json) with **100% precision (12/12)**.

---

## 7. Local Development & Test Execution

### Prerequisites
- Node.js >= 20.0.0
- npm >= 11.6.0 (verified with `npm -v`)

### Setup & Run Locally
```bash
# Clone the repository
git clone https://github.com/your-username/positioning-lab.git
cd positioning-lab

# Install dependencies
npm install

# Run the full validation suite (TypeScript check + Vitest unit tests)
npm run validate

# Start the local development server
npm run dev
```

Visit `http://localhost:5173` to explore the app.

---

## 8. Project Structure

```
positioning-lab/
├── src/
│   ├── actions/          # Edge Server Actions (mutations, validation, bot filtering)
│   ├── components/       # Reusable UI component library (Tailwind v4)
│   ├── lib/              # Core algorithmic modules
│   │   ├── assign.ts     # 32-bit FNV-1a deterministic hash & channel sanitizer
│   │   ├── bots.ts       # Privacy-preserving bot crawler filter
│   │   ├── claimGuard.ts # Ground-truth fact verification & buzzword guard
│   │   ├── schemas.ts    # Zod schemas for runtime validation
│   │   └── stats.ts      # 95% Wilson score interval & 3-state status gate
│   ├── pages/            # Generouted file-based edge routes
│   │   ├── index.tsx     # Public hero & methodology overview
│   │   ├── t/[slug].tsx  # Public deterministic experiment test page
│   │   └── (app)/        # Authenticated experiment workspaces, facts & playbooks
│   └── schemas/          # SQLite RecordRoom schema definitions (RBAC)
├── tests/
│   ├── evals/            # Ground-truth benchmark datasets (Claim Guard)
│   ├── unit/             # Pure unit tests (stats, assign, bots, claimGuard)
│   └── experiment-flow.spec.ts # Playwright multi-user flow specification
├── wrangler.toml         # Cloudflare Workers edge configuration
└── package.json          # Dependencies & build scripts
```

---

## 9. Production Deployment

The application is deployed globally at the Cloudflare Workers edge via the DeepSpace platform:

- **Live URL:** [https://positioning-lab.app.space](https://positioning-lab.app.space)
- **App ID:** `app_01M43S07A5JMF05YB0JWJK70ZX`

To deploy updates:
```bash
npx deepspace deploy
```

