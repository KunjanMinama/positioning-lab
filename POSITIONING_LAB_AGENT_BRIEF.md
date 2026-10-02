# POSITIONING LAB — Agent Brief (read this fully before writing any code)

> Audience: a coding agent (Claude Code or similar) that will build this project with a human applicant.
> Owner: the applicant (the "user"). The user must be able to explain every line of this project **without AI** in a live coding session and a GTM interview.
> Deadline: **Monday, October 5, 2026, 11:59 PM Eastern Time** (= Tuesday, October 6, ~9:29 AM IST). Today is Friday, October 2, 2026. Treat the real working window as ~3 days.

---

## 0. How you (the agent) must work

Read this section twice. It matters more than the feature list.

1. **Read before you build.** Before any code: read `docs.deep.space` (SDK overview, quickstart, every primitive listed in §5) and the agent skill at `github.com/deepdotspace/deepspace-skill`. Do **not** invent SDK function names, config shapes, or CLI flags. Where this brief names an SDK API, treat the name as a *hypothesis to verify against the docs*. If the docs differ from this brief, **the docs win**; record the difference in `AGENT_LOG.md`.
2. **Plan, then build in small verified steps.** After each step: run type-check, lint, unit tests, and (when relevant) the app locally. Commit with a clear message after each working step.
3. **Teach as you go.** The user is learning. After each milestone write 5–10 lines in `LEARN/` (see §18) explaining what you did and why, in plain language. Never leave the user with code they cannot explain.
4. **Keep `AGENT_LOG.md`.** Append an entry for every meaningful action: what you did, what you assumed, what you were unsure of, what failed, what the user changed. The submission requires an honest account of "what the agent did and what the applicant verified." This log is the raw material.
5. **Stop and ask the user to verify** at the checkpoints in §15 (manual verification checklist). Do not claim something works if you have not run it.
6. **Never fake evidence.** Seed/demo data must be clearly labeled `DEMO` in the UI and database, and must never be mixed with real traffic in any readout. The writeup will cite real results only.
7. **No secrets in the repo.** Use DeepSpace's AI/integration proxies (no API keys in app code). If any secret is unavoidable, use the platform's secrets mechanism and never commit it. Add `.env*` to `.gitignore`.
8. **Prefer platform primitives over hand-rolled ones.** The grading criteria say primitives should be used "instead of being reimplemented without a reason." If you reimplement something the SDK provides, write the reason in `AGENT_LOG.md` and in `LEARN/08-tradeoffs.md`.
9. **Scope discipline.** A small, finished, honest project beats a large unfinished one. Follow the cut order in §17. If something is unfinished, document it plainly with "what I would do next."
10. **Do not copy other people's projects.** Do not copy DeepSpace's example apps or other applicants' repos. Reading examples to learn platform patterns is fine; reusing their idea or code is not.

---

## 1. Context: the task and the role

### 1.1 The task (from DeepSpace's portal, summarized faithfully)

- **Build exercise: "ship something small."** Build and deploy a full-stack app on DeepSpace. Choose a scope that can be finished well within the five-day submission window. "A focused, finished project is stronger than a large, incomplete one."
- Judgment and explanation matter as much as feature count. If something is unfinished, say what would be done next.
- Build an **interactive app with technical depth**. Use integrations where they improve the product; there is no minimum count in the main text, but the "helpful project bar" says **use at least three DeepSpace integrations**. Explain choices and tradeoffs, **including why integrations that would not add value were left out.**
- A basic habit tracker is not enough unless it adds something meaningfully new.
- A coding agent is allowed. DeepSpace wants to see **how the applicant directs it, verifies its work, and takes over when needed.**
- Start commands: `npx deepspace` (scaffold), `npx deepspace deploy` (ship to `<name>.app.space`). Docs: `docs.deep.space`. Skill: `github.com/deepdotspace/deepspace-skill`.

### 1.2 What must be submitted in the portal

1. **Deployed app URL** (`<name>.app.space`)
2. **Repository URL** (GitHub)
3. **Short writeup** covering: what was built; which DeepSpace integrations were used; the main tradeoff; what the agent did; what the applicant verified themselves.

### 1.3 How it will be judged

- Sensible scope for the window.
- The deployed result works on its **important path**; unfinished edges explained honestly.
- Technical depth shown through **working product flows**; explanation of which integrations were useful, or why more would not help.
- Code is understandable, **secrets protected**, **platform primitives used rather than reimplemented**.
- Writeup explains the main tradeoff, what the agent did, and what the applicant verified or changed.
- Originality and commercial value are **not** scoring criteria. The submission is evaluation-only and remains the applicant's property. Project size and apparent hours spent are not rewarded.

### 1.4 What happens after (the build must prepare for these)

- **Live coding session:** applicant must explain and modify their own submitted work; read errors, form a hypothesis, and test it; think aloud and ask useful questions; direct AI tools deliberately and verify output; respond constructively to review.
- **Final round: a live GTM interview** covering general go-to-market questions.

### 1.5 The role being applied for: AI-Native GTM Engineer (full-time)

Key points from the posting that this project must demonstrate:

- AI can generate copy and ideas quickly. **The hard part is deciding what matters, understanding the audience, building repeatable systems, running real experiments, and learning honestly from results.**
- The role sits across growth, product, content, partnerships, and engineering. Prior marketing experience is **not** required; **judgment, AI-native working style, building ability, clear writing, and technical curiosity** are.
- Responsibilities include: turning developer/AI-builder insights into clear positioning and campaigns; **designing and running experiments** (launches, creators, communities, partnerships, events, content, outbound); using coding agents and automation to build **internal workflows, prototypes, landing pages, campaign assets, and measurement systems**; keeping **technical claims accurate** with engineering; **measuring attention → visits → signups → activated developers → paid use**, and **distinguishing evidence from assumptions** to recommend expand / change / stop; owning projects end to end: *objective → smallest useful test → execute → document → repeatable playbook.*
- Success looks like: more of the right developers reached; campaigns produce measurable **product learning**, not just impressions; ideas move to live experiments fast **without sacrificing accuracy**; reusable systems and better decisions after every experiment.

---

## 2. Motive: why this project

**One-sentence motive:** *The posting says the hard part of GTM is not generating copy, it is deciding what matters and learning honestly from real experiments, so we are building the smallest honest system that does exactly that, on DeepSpace itself.*

Why this and not a generic app:

- It is a **repeatable system**, not a one-off demo. That is what the role asks for.
- It shows **AI used with judgment**: AI proposes (variants, summaries, theme clusters), humans decide, and code verifies (claim checking, statistical gates).
- It is **built on the SDK being evaluated**, so it demonstrates real understanding of DeepSpace primitives.
- It produces **real evidence** (the applicant shares the live test links with real people) that can be quoted in the writeup.
- It rehearses the exact interview topics: hypotheses, funnels, channels, segments, evidence vs assumption, expand/change/stop decisions, accurate technical claims.

Be honest about limits (these go in the writeup): we cannot see DeepSpace's real signup/paid data, so our funnel measures **proxies** (visits, "copy command" clicks, self-reported attempts). Traffic will be small, so many readouts will correctly say "not enough data."

---

## 3. Product definition

**Name:** Positioning Lab (rename if desired).

**What it is:** a small web app where a GTM person writes a positioning hypothesis, gets AI-drafted message variants (human-approved and fact-checked), serves them on public test landing pages, records anonymous visits and conversions by channel, and gets an honest readout that refuses to name winners without enough evidence. Finished experiments become reusable playbook entries with a logged decision.

### 3.1 The subject of the experiments

Experiments test messages **about DeepSpace** (the product the applicant would market). Every public test page must show a clear footer: *"Independent experiment by [applicant name]. Not an official DeepSpace page."* Do not imply endorsement. Do not use DeepSpace logos without the footer.

### 3.2 Primary conversion metric

**"Copy command"**: the visitor clicks a button that copies `npm create deepspace@latest my-app` (or `npx deepspace`) to the clipboard. This is a measurable, honest proxy for developer intent. Secondary events: page view, scroll past fold (optional), docs link click, self-reported "I tried it", micro-survey response.

### 3.3 User roles

- **Owner/Admin** (the applicant): create/edit/launch/stop experiments, manage facts, see all data.
- **Member** (a teammate): create drafts, comment, view results; cannot publish without admin approval (shows approval flow and RBAC).
- **Visitor** (anonymous, not signed in): sees only public test pages; can send events and answer the micro-survey through server actions. No account needed.

### 3.4 Core user stories (the "important path" that must work live)

1. As an admin, I sign in and create an experiment with: audience segment, hypothesis, metric, minimum sample per variant, and a **decision rule written before launch**.
2. I click "Draft variants" and receive 3 AI-drafted angles (headline, subhead, CTA label, the factual claims each makes).
3. Each variant is auto-checked by **Claim Guard** against the verified-facts registry; unsupported claims are flagged and block publishing until edited or the fact is added with a source.
4. I approve variants and **launch**; this locks the hypothesis, metric, and decision rule (changes are logged, not silent).
5. I get a public URL `/t/<slug>?src=<channel>`; visitors are assigned a variant deterministically and see it.
6. Events (view, copy-command, docs-click, tried-it) and survey answers are recorded safely.
7. The dashboard updates **live** (realtime sync) showing per-variant rates, confidence intervals, channel breakdown, and a **status gate**: Not enough data / Directional / Evidence favors X.
8. I click "Write readout": AI produces a summary where each statement is tagged **Evidence** or **Assumption**, ending in a recommendation (expand / change / stop) that must be consistent with the status gate.
9. I record the **decision** with a reason; the experiment becomes a **playbook entry**.

### 3.5 Non-goals (say these out loud in the writeup)

- Not a replacement for DeepSpace's real analytics or signup/activation data.
- No full statistical engine, no multi-armed bandit, no personal-data tracking, no ad-platform integrations, no real payments flow unless a genuine reason appears (see §5).

---

## 4. Design principles (these constrain every decision)

1. **Honesty over drama.** The tool must be willing to say "we don't know yet."
2. **AI proposes, human decides, code verifies.** AI output is never trusted blindly: structured, validated, fact-checked, and cost-capped.
3. **Pre-register.** Decision rule and minimum sample are fixed before launch; edits after launch are logged and visible.
4. **Evidence ≠ assumption.** Every readout sentence is labeled. Simulated or AI-imagined reactions (if ever added) are labeled hypotheses and **never** counted in evidence numbers.
5. **Privacy by default.** Anonymous IDs only. No IPs, no emails, no fingerprinting. Survey text may contain personal info if the visitor types it, so show a warning ("don't include personal info") and do not display survey text publicly.
6. **Smallest useful test.** Optimize for fast, small, finished experiments.

---

## 5. DeepSpace SDK primitive map (use these; verify each in the docs first)

The user asked that the project use the SDK's tools broadly. The brief also says to **explain why integrations that don't add value are left out**. So: the first group is **mandatory**; the second group is **use if a real reason exists, otherwise document the omission with a reason.** Do not add a primitive just to tick a box.

**Verification step (do this first, before coding):** for every row, open the docs, confirm the primitive exists in the current SDK version, note the real API names in `AGENT_LOG.md`, and update the "How we use it" column if reality differs.

### 5.1 Mandatory (core of the app)

| Primitive | How we use it | Why this is the right tool | What to explain in interview |
|---|---|---|---|
| **Scaffold + CLI** (`npm create deepspace@latest`, `npx deepspace dev start`, `deploy`) | Project creation, local dev, deploy to `<name>.app.space` | Required; one-command deploy | What the scaffold gives: Vite+React frontend, Hono worker, routing, Tailwind, UI kit, Durable Objects |
| **Auth** (GitHub/Google login) + **protected routes** | Admin/member login; visitors stay anonymous | Paid AI and admin screens must not be public | Difference between authentication and authorization |
| **Role-based permissions (RBAC)** | owner/admin, member, visitor rules per collection | Trust rules enforced server-side, not just in UI | Why UI hiding is not security |
| **Records / SQLite-backed data + realtime sync** | experiments, variants, events, facts, playbooks, decisions, etc.; dashboard updates live | Core persistence and live dashboard | What a Durable Object is and why it enables realtime |
| **Server actions** | The *only* path that writes events, calls AI, and spends owner credits; validates input and enforces per-user and per-IP-hash caps | Protects credits, prevents tampering | What is validated and why the client is never trusted |
| **AI proxy** (`createDeepSpaceAI` or current equivalent) | Variant drafting, claim extraction, readout writing, survey clustering | No API key in app; billed through platform | Structured outputs, validation, cost control |
| **Background jobs** | Survey clustering and long AI tasks run outside the request, with progress shown | Work outlives a request | Why not do it inline |
| **Scheduled jobs** | Weekly digest of running experiments + auto-close experiments that hit their end date | Time-based automation | Cron-like behavior on a serverless platform |
| **Presence** | Show which teammates are viewing/editing an experiment (avoid edit collisions) | Cheap, visible realtime feature | How presence differs from stored data |
| **Testing helpers** (`deepspace/testing`, Playwright fixture) | One multi-user e2e test: admin launches an experiment while a second browser visits the public page; dashboard updates | Proves the realtime flow works end to end | How to read a failing e2e test |

### 5.2 Use only with a real reason (otherwise document the omission)

| Primitive | Candidate use | Decision rule |
|---|---|---|
| **Integration proxy** (e.g. `exa/search`) | **Claim Guard grounding:** fetch the current DeepSpace docs pages to help the admin find a source for a claim; also optional "research" tab for what developers say about a problem | Use if the docs can be searched/fetched through the proxy and it clearly improves fact sourcing. Do not use it to scrape communities for outreach. |
| **File storage** | Store exported readouts (PDF/Markdown) or uploaded creative assets for variants | Use if export/upload is implemented and tested; else omit and say why. |
| **Collaborative editing** | Co-edit the playbook entry / readout text live | Use only if time remains after the core path; otherwise omit. |
| **Channel messaging** | Comment thread per experiment | Prefer a simple comments collection; use channels only if it is simpler than building comments. |
| **Payments** | None expected | **Omit.** No part of this app needs to take money. Write this reasoning in the writeup as a deliberate omission. |
| **Custom domain** | None | Omit; `<name>.app.space` is enough. |

**Target:** at least **six** primitives used for real reasons (the brief's bar is three). Every omission is explained in `LEARN/08-tradeoffs.md` and the writeup.

---

## 6. Architecture and tech stack

| Layer | Choice | Notes |
|---|---|---|
| Platform | DeepSpace SDK on Cloudflare Workers | Required |
| Frontend | React + Vite + Tailwind v4 + the scaffold's UI kit | From scaffold |
| Backend | Hono worker + Durable Objects from the scaffold | From scaffold |
| Language | TypeScript (strict) | Catch errors early |
| Validation | **Zod** | Validates every AI response and every server-action input |
| Stats | Plain TypeScript module `src/lib/stats.ts` | Small, pure, unit-tested, explainable |
| Assignment | Deterministic hash of `(experimentId + visitorId)` | Stable, fair, no personal data |
| Tests | Vitest (or the scaffold's unit setup) + Playwright via `deepspace/testing` | |
| Source control | Git + GitHub | Required for submission |

**Suggested source layout (adapt to the scaffold's file-based routing):**

```
src/
  routes/
    index.tsx                 # public home: what this is + honesty statement
    t/$slug.tsx               # public test landing page (assigns a variant)
    app/
      experiments.tsx         # list
      experiments.new.tsx     # create (hypothesis, rule, segment)
      experiments.$id.tsx     # variants, Claim Guard, launch, live dashboard
      experiments.$id.readout.tsx
      facts.tsx               # verified-facts registry (Claim Guard source)
      playbooks.tsx           # finished experiments + decisions
      backlog.tsx             # idea backlog with ICE scoring
  lib/
    stats.ts                  # Wilson interval, gates, sample checks
    assign.ts                 # deterministic variant assignment
    schemas.ts                # Zod schemas (AI outputs, inputs)
    claimGuard.ts             # claim extraction + matching against facts
    bots.ts                   # simple bot filter
  worker/
    actions/                  # server actions (record event, draft variants, readout...)
    jobs/                     # background + scheduled jobs
tests/
  unit/                       # stats, assign, schemas, claimGuard
  e2e/                        # multi-user flow
LEARN/                        # learning material (see §18)
AGENT_LOG.md
README.md
```

---

## 7. Data model (collections)

Design the schema with the SDK's schema/permission mechanism (verify syntax in docs). Fields below are the intent.

- **experiments**: `id, slug, title, segment, hypothesis, primaryMetric ("copy_command"), minSamplePerVariant (default 50), decisionRule (text), status ("draft"|"launched"|"closed"), launchedAt, endsAt, lockedAt, createdBy, isDemo (bool)`
- **variants**: `id, experimentId, label ("A","B","C"), headline, subhead, ctaLabel, claims[] (extracted factual claims), claimStatus ("unchecked"|"ok"|"flagged"), approved (bool), source ("ai"|"human"), isDemo`
- **visitors**: `id (anon uuid), experimentId, variantId, channel, firstSeenAt, isBot (bool)` — **no IP, no user agent stored raw** (store only a coarse `isBot` flag).
- **events**: `id, experimentId, variantId, visitorId, type ("view"|"copy_command"|"docs_click"|"tried_it"), channel, ts, isDemo`
- **surveyResponses**: `id, experimentId, variantId, visitorId, text, themeId?, ts` (private to admins/members)
- **themes**: `id, experimentId, label, summary, count` (output of clustering job)
- **facts**: `id, statement, source (URL or doc path), verifiedBy, verifiedAt, status ("verified"|"retired")`
- **claimChecks**: `id, variantId, claim, matchedFactId?, verdict ("supported"|"unsupported"|"unclear"), reason`
- **decisions**: `id, experimentId, call ("expand"|"change"|"stop"), reason, statusAtDecision, ts, decidedBy`
- **playbooks**: `id, experimentId, title, hypothesis, result, lesson, nextStep, tags[]`
- **ideas** (backlog): `id, title, hypothesis, impact(1-5), confidence(1-5), effort(1-5), score (derived), status`
- **ruleChanges** (audit): `id, experimentId, field, oldValue, newValue, ts, by`
- **aiUsage**: `id, userId, day, calls, tokensEstimate` (for per-user caps)
- **comments**: `id, experimentId, author, text, ts`

**Permission intent (RBAC):**

| Collection | Admin | Member | Visitor (anon) |
|---|---|---|---|
| experiments, variants | read/write | read, create drafts | no direct access (public page data is served via a server action that returns only approved variant copy) |
| events, visitors | read | read | write **only via server action** |
| surveyResponses | read | read | write **only via server action** |
| facts | read/write | read | none |
| decisions, playbooks | read/write | read | none |
| aiUsage | read | none | none |

Enforce in the platform's permission layer (Durable Object) **and** in server actions. Do not rely on UI hiding.

---

## 8. Server actions (the only write/spend paths)

Every action: authenticate (where required), validate input with Zod, check permission/state, apply rate/cost caps, write, return typed result. Verify exact action syntax in the docs.

1. `createExperiment(input)` — admin/member. Validates required fields incl. decision rule.
2. `draftVariants(experimentId)` — admin/member. Calls AI proxy, returns 3 variants as validated JSON, runs Claim Guard, saves as unapproved. **Cap: e.g. 10 drafts/user/day.**
3. `checkClaims(variantId)` — runs Claim Guard against `facts`; saves `claimChecks`.
4. `approveVariant(variantId)` — admin only; refused if `claimStatus = "flagged"`.
5. `launchExperiment(experimentId)` — admin only; requires ≥2 approved, all claim-OK variants; sets `lockedAt`; from now edits to hypothesis/metric/rule/minSample go through `ruleChange` audit.
6. `getPublicVariant(slug, visitorId, channel)` — anonymous; assigns variant via hash; creates/updates `visitors`; returns **only** headline/subhead/CTA of the assigned approved variant.
7. `recordEvent(slug, visitorId, type, channel)` — anonymous; validates type whitelist; dedupes (one `view` per visitor per variant; one `copy_command` per visitor); rejects bots/unknown slugs; rate-limited per visitorId.
8. `submitSurvey(slug, visitorId, text)` — anonymous; length limit (e.g. 500 chars); strips HTML; rate-limited.
9. `runSurveyClustering(experimentId)` — kicks off a **background job**.
10. `writeReadout(experimentId)` — admin/member. Computes stats **in code first**, passes the numbers + status gate to the AI, validates the AI's tagged output, and **rejects/repairs any readout that contradicts the gate** (e.g. names a winner while status is "Not enough data"). Cap per user/day.
11. `recordDecision(experimentId, call, reason)` — admin only; creates `playbooks` entry.
12. `addFact / retireFact` — admin only.

**Scheduled jobs:**
- `weeklyDigest` — summarizes running/closed experiments (counts, statuses, decisions pending).
- `autoClose` — closes experiments past `endsAt`, flags readout-needed.

---

## 9. AI features (spec each carefully; this is the "AI-native" part)

General rules: all calls through the AI proxy via server actions; **temperature low** for extraction/verification; **Zod-validate** every response; on invalid output retry once with the validation error, then fail gracefully; log token estimates to `aiUsage`; never put visitor survey text into a prompt without delimiting it as untrusted data (**prompt-injection safety**: instruct the model to treat survey text as data, never instructions, and never let it trigger actions).

### 9.1 Variant drafting
- **Input:** segment, hypothesis, list of verified facts (from `facts`).
- **Prompt constraints:** use only the supplied verified facts for factual claims; no superlatives that can't be sourced ("fastest," "best," "#1"); output exactly 3 variants differing in **angle**, not just wording.
- **Output schema (Zod):** `{ variants: [{ label, angle, headline, subhead, ctaLabel, claims: string[] }] }` with length limits on every string.

### 9.2 Claim Guard (the key quality/accuracy feature)
- Extract factual claims from each variant (AI, structured), then match each claim against `facts` (first by a cheap lexical/embedding-free similarity or AI-judged entailment against *only the provided facts*).
- Verdict per claim: `supported` (cites matched fact id), `unsupported`, or `unclear`.
- Any `unsupported`/`unclear` ⇒ variant `claimStatus = "flagged"` and **cannot be approved**. The admin can edit the copy or add a sourced fact.
- Seed `facts` with a **small set of claims the applicant personally verified from docs.deep.space**, each with its source URL. Do not seed facts you have not verified in the docs. Examples of the *kind* of fact (verify wording yourself): one-command deploy to `<app>.app.space`; SDK covers auth, data sync, permissions, payments, AI, deployment.
- **Honesty about limits:** Claim Guard checks claims against our registry only. It does not prove the registry is complete or current. Say this in the UI and writeup.

### 9.3 Survey clustering (background job)
- Input: survey texts for an experiment (treated as untrusted data).
- Output: `{ themes: [{ label, summary, exampleIds: string[] }] }`. Counts computed in code, not by the model.
- Show progress while running; results stored in `themes`.

### 9.4 Readout writer
- Input to the model: **computed numbers + status gate**, not raw logs.
- Output schema: `{ statements: [{ text, kind: "evidence"|"assumption", references: string[] }], recommendation: "expand"|"change"|"stop"|"collect_more", rationale }`.
- **Hard rule enforced in code:** if status is "Not enough data" the only allowed recommendation is `collect_more`; if "Directional" a winner may be mentioned only as *directional*; "Evidence favors X" is the only state where a winner can be stated. Reject and retry otherwise.

### 9.5 Cost and failure control
- Per-user daily caps on `draftVariants` and `writeReadout` (store in `aiUsage`).
- Timeouts, one retry, clear error messages in the UI, and a non-AI fallback (manual variant entry always works; manual readout notes always work). **The app must remain usable if the AI call fails.**

### 9.6 Evals (small but real)
- Create `tests/evals/claimGuard.cases.json` with ~10–15 hand-written cases: claims that are supported, clearly unsupported, and subtly wrong (e.g. wrong number, overclaim). A script reports how many Claim Guard gets right. Report the score honestly in the writeup, including failures. This is the "verification" evidence for an AI feature.

---

## 10. Statistics specification (keep it simple, explainable, correct)

Define for each variant: `n` = unique visitors (non-bot) assigned and viewed; `x` = unique visitors who triggered the primary metric; `p = x/n`.

### 10.1 Wilson score interval (95%)

For z = 1.96:

```
center = (p + z²/(2n)) / (1 + z²/n)
half   = z * sqrt( p(1-p)/n + z²/(4n²) ) / (1 + z²/n)
CI     = [center - half, center + half]
```

Why Wilson and not the simple normal interval: it behaves sensibly for small `n` and for `p` near 0 or 1, which is exactly our situation.

### 10.2 Status gate (per experiment)

- **Not enough data:** any variant has `n < minSamplePerVariant`. No winner may be stated.
- **Directional:** all variants meet the minimum but the 95% Wilson intervals of the top two **overlap**. A leader may be described only as "directionally ahead."
- **Evidence favors X:** minimum met for all variants **and** the leader's interval is entirely above the runner-up's. Still caution: this is a proxy metric on small traffic.

(Optional upgrade if time remains: a two-proportion z-test or a Beta-binomial "probability B beats A" computed with a seeded Monte Carlo. Only add it if you can explain it plainly; otherwise leave it out and note it as a next step.)

### 10.3 Other rules
- Dedupe: one visitor counts once per variant.
- Exclude `isBot` visitors from `n` and `x`.
- Do not "peek and stop early" silently: showing the live dashboard is fine, but the status gate and the pre-registered minimum prevent declaring a winner early. Explain this in the UI ("why we wait").
- **Unit tests are mandatory** for `stats.ts` with hand-checked cases (e.g. 10/100 vs 20/100; 0/0; 0/n; n/n; tiny n). The user must verify at least two by hand (see §15).

### 10.4 Channel breakdown
Show rate per variant per `src` channel with `n` visible. Warn when a channel cell has very small `n` ("too few to read"). Do not average away channel differences.

---

## 11. Visitor assignment, tracking, and bot handling

- **Visitor ID:** random UUID generated client-side on first visit, stored in `localStorage` (and sent to the server action). No cookies needed. Show a short privacy note.
- **Assignment:** `variantIndex = hash(experimentId + visitorId) mod (#approved variants)` using a simple, deterministic hash (e.g. FNV-1a or a Web Crypto SHA-256 prefix). The same visitor always sees the same variant. Document the hash choice and write a unit test for stability and rough uniformity.
- **Channel:** read from `?src=` (whitelist allowed values: `linkedin, x, reddit, hn, discord, friend, other`; unknown → `other`).
- **Bot filtering (simple, honest):** flag when no JS-originated visitor ID arrives, or UA matches a small known-bot pattern list. Store only `isBot`. Say in the writeup that this is basic, not bulletproof.
- **Self-traffic:** add an admin "ignore my traffic" toggle (a flag in localStorage the admin sets) so the applicant's own clicks don't pollute results.

---

## 12. Screens (what the user sees)

1. **Home (`/`)** — what Positioning Lab is, the honesty principles, link to the sign-in. No fake stats.
2. **Public test page (`/t/:slug`)** — the assigned variant's headline, subhead, copy-command button, docs link, optional one-question survey ("What were you hoping to find?"), "I tried it" button, and the **independent-experiment footer** + privacy note. Must be fast and mobile-friendly.
3. **Experiments list** — status badges, DEMO labels, live counts.
4. **New experiment** — fields incl. segment, hypothesis, metric, `minSamplePerVariant`, **decision rule (required)**, end date.
5. **Experiment detail** — tabs: Variants (draft/edit/Claim Guard results/approve), Launch (checklist + lock), Live (dashboard: rates, CIs, status gate, channel table, presence avatars), Survey themes, Comments, Rule-change audit.
6. **Readout** — AI-written tagged statements + the computed numbers side by side; button to record decision.
7. **Facts registry** — add/retire verified facts with sources.
8. **Playbooks** — searchable finished experiments with decisions.
9. **Backlog** — ideas with Impact/Confidence/Effort and an ICE-style score; "promote to experiment."

UI quality matters (the posting says "care about how ideas are presented"): clean typography, clear empty states, loading and error states, accessible contrast. Do not over-build.

---

## 13. Security and privacy checklist

- No API keys in code; AI and search through proxies. `.gitignore` covers env files.
- All writes by anonymous users go through validated, rate-limited server actions.
- RBAC enforced in the data layer, not just the UI.
- Public endpoint returns **only** the assigned approved variant's public copy.
- Survey text and AI prompts: treat as untrusted; strip HTML; length limits; prompt-injection guard.
- No IPs or fingerprints stored. Document exactly what is stored.
- Per-user AI caps protect the owner's credits.
- Demo data is labeled and excluded from real readouts.

---

## 14. Testing plan

**Unit (Vitest or scaffold equivalent):** `stats.ts` (Wilson, gates, edge cases), `assign.ts` (stability, distribution), `schemas.ts` (valid/invalid AI outputs), `claimGuard.ts` (matching logic), `bots.ts`.

**Evals:** Claim Guard cases (see §9.6).

**E2E (Playwright via `deepspace/testing`):** two browser contexts: (1) admin creates, approves, and launches an experiment; (2) anonymous visitor opens `/t/:slug`, clicks copy-command; assert the admin dashboard updates live and counts are correct. Also test: unauthorized user cannot reach admin routes; visitor cannot read events directly.

**Static checks:** `npm run type-check && npm run lint && npm run test:unit` must pass before every deploy.

---

## 15. Manual verification checklist (the USER does these, and records them)

The writeup must say what the applicant verified themselves. Ask the user to do these and record results in `LEARN/09-my-verification.md` (date, what they did, what they saw):

1. Read `docs.deep.space` quickstart and confirm 3 things the agent claimed about the SDK.
2. Run the app locally; create an experiment end to end by hand.
3. Hand-calculate the Wilson interval for one case (e.g. 20/100) and compare with `stats.ts` output.
4. Try to break it: visit the public page in a private window twice (same variant?), clear localStorage (new visitor?), submit empty/very long survey text, try a made-up `src`.
5. Try to access an admin route while signed out; try writing an event with a bad type.
6. Click through the Claim Guard with a deliberately false claim (e.g. "free forever with no limits") and confirm it is flagged.
7. Read one AI-generated readout and **change one thing** the agent got wrong or vague (record it).
8. Check the deployed site on a phone.
9. Confirm no secrets in the repo history (`git log -p | grep -i key` style check).
10. Share test links with real people (friends, communities, social) and record where each link went and the resulting counts.

---

## 16. Deployment and real-traffic plan

1. `npx deepspace auth login` → `npx deepspace dev start` → build → type-check/lint/tests → `npx deepspace deploy`.
2. Pick the final `<name>.app.space` URL early (the user chooses the name).
3. Create **one real experiment** on the deployed app (e.g. "angle: your coding agent ships a full production app" vs "auth, data, permissions, and payments in one SDK" vs a third angle). Write the decision rule first.
4. The user shares tagged links (`?src=linkedin`, `?src=friend`, etc.) as widely and honestly as possible within the time left. **No botting, no fake traffic, no paid inflation.**
5. Before submitting: capture a screenshot/export of the real dashboard and readout. Quote the true result, including "not enough data" if that is the truth.
6. Verify the **deployed** important path (not just local) after final deploy.

---

## 17. Build schedule and cut order

**Day 1 (Fri Oct 2 → Sat):** read docs/skill; scaffold; auth + RBAC; data model; create-experiment flow with required decision rule; `stats.ts` + tests; `LEARN/` skeleton; `AGENT_LOG.md` started. First deploy of a hello-world to confirm the pipeline.

**Day 2 (Sat → Sun):** variants (manual + AI draft), Zod schemas, facts registry + Claim Guard, approval + launch lock, public test page with assignment, event recording, live dashboard with status gate and channel table, presence.

**Day 3 (Sun → Mon):** readout writer with gate enforcement, survey + clustering job, decision + playbook, scheduled digest/auto-close, e2e test, security pass, deploy, launch real experiment, share links, gather data, write README + writeup, finish `LEARN/`.

**Cut order if time runs short (cut from the top first):**
1. Collaborative editing, file storage/export, channel-based comments
2. Backlog ICE scoring
3. Weekly digest (keep autoClose only if trivial)
4. Survey clustering (keep raw survey responses)
5. Presence
6. Evals expansion (keep a minimum of ~10 cases)

**Never cut:** auth + RBAC, create → variants → Claim Guard → launch → public page → events → live dashboard with status gate → readout → decision; stats unit tests; deployment; `AGENT_LOG.md`; `LEARN/`; README/writeup.

---

## 18. Learning deliverable: "the skill file" (REQUIRED)

The user must be able to explain this project **without AI**. Build a `LEARN/` folder as you go, written for a smart beginner, in plain language, with short paragraphs and examples. Also create a **`LEARN/SKILL.md`** — an agent-skill style file (name, description, instructions) that any agent can load to **teach, quiz, and mock-interview the user** about this project.

**Files to create:**

| File | Contents |
|---|---|
| `LEARN/00-overview.md` | The project in 1 minute, 5 minutes, and 15 minutes versions; the motive; the user flow end to end |
| `LEARN/01-architecture.md` | Diagram (ASCII or Mermaid) of frontend → worker → Durable Objects → AI proxy; request lifecycle for a visitor event and for an admin action |
| `LEARN/02-sdk-primitives.md` | For **each** primitive in §5: what it is, where it is in our code (file paths), why we chose it, what the alternative would be, and a 30-second spoken explanation. Include omitted primitives and why |
| `LEARN/03-data-and-permissions.md` | Every collection, who can read/write, and why |
| `LEARN/04-stats-explained.md` | Conversion rate, sample size, confidence interval (Wilson) in plain words, why "peeking" is dangerous, what our status gate means, with a worked example the user can recompute |
| `LEARN/05-ai-and-claim-guard.md` | Structured outputs, Zod, prompt injection, why code verifies the model, Claim Guard, evals and their honest score, cost caps |
| `LEARN/06-security-and-privacy.md` | What is stored/not stored, server-action validation, RBAC, secrets |
| `LEARN/07-gtm-concepts.md` | Positioning, segment, hypothesis, funnel (attention → visit → signup → activation → paid), channel, pre-registration, expand/change/stop, evidence vs assumption — each tied to a concrete screen in our app |
| `LEARN/08-tradeoffs.md` | Main tradeoff, every omitted feature/primitive and why, known limitations, "what I'd do next" |
| `LEARN/09-my-verification.md` | Template for the user to log what they personally verified (§15) |
| `LEARN/10-code-walkthrough.md` | A guided tour: "open this file, read these lines, here's what it does," for the 10 most important files; include 5 "modify this" exercises (e.g. change the min sample default, add a channel, add an event type) with the expected result |
| `LEARN/11-debugging-playbook.md` | How to read a stack trace here; common failure points (permissions, validation, AI schema failure, deploy); a hypothesis → test routine to narrate in the live session |
| `LEARN/12-interview-qa.md` | See §19 |
| `LEARN/13-self-quiz.md` | 40+ questions across SDK, stats, AI, security, GTM, with answers hidden below a `<details>` block; mix recall, "why," and "what would break if…" questions |
| `LEARN/SKILL.md` | Agent-skill file: tells an agent to (a) teach any section on request, (b) quiz the user one question at a time and grade honestly, (c) run a mock live-coding session using this repo, (d) run a mock GTM interview, (e) never reveal answers before the user tries |

**Teaching style rules:** define every term the first time; use analogies; prefer concrete examples from *this* app; no hand-waving ("it just works"); flag anything the agent is not certain about so the user can verify it.

---

## 19. Interview preparation the agent must produce (`LEARN/12-interview-qa.md`)

### 19.1 Live coding session (technical) — prepare answers and drills for:
- Explain the architecture and request flow without notes.
- "Walk me through what happens when a visitor clicks copy-command." (client → server action → validation → dedupe → write → realtime push → dashboard)
- "Where are secrets and why are there none?" (proxies; what would change if you needed one)
- "Why server actions for writes?" "Why RBAC in the data layer?"
- "Why did you use X primitive and not build it yourself?" for each primitive; "Why didn't you use payments?"
- "How does the AI output get validated? What if it returns garbage? What if the survey text contains an injection?"
- "Explain the Wilson interval and the status gate. Why not just compare percentages?"
- "Break something on purpose; I'll ask you to find it." Drills: wrong permission rule, failing Zod schema, off-by-one in stats, duplicate event counting, hash instability. Include a short **"bug bank"** of 6 realistic bugs the user can practice diagnosing (with the diff to reintroduce each and the expected symptom).
- "Add a feature live" drills: new event type, new channel, new field on experiments, a new Claim Guard rule, CSV export of the readout.
- How to **direct an AI tool deliberately**: example prompts the user would give, how they verify (run tests, read diff, reproduce), and when they'd stop using AI and take over.
- How to respond to review feedback constructively (sample phrasing).

### 19.2 GTM interview (general) — prepare short, honest, concrete answers for:
- How would you position DeepSpace to (a) solo builders using coding agents, (b) startup CTOs, (c) agencies? What evidence would change your mind?
- Design an experiment for a product launch / a creator partnership / a developer-community post / an outbound sequence: objective, smallest useful test, metric, sample, decision rule, what you'd do on each outcome.
- Define a funnel for a developer tool and where proxies mislead (clicks ≠ activation).
- How do you tell evidence from assumption? Give an example from the readout this app produced.
- How do you keep technical claims accurate when working with engineering?
- What would you stop doing after a null result? How do you document it as a playbook?
- How would you choose between five ideas in the backlog? (ICE, then smallest test)
- How do you talk to users/partners/communities and handle direct negative feedback?
- How do you use AI in your own workflow, where does it fail, and how do you guard against that?
- 30-60-90-day thinking for this role (learn, run first experiments, build a repeatable system).
- Tell the story of this project in 2 minutes: problem, build, result, limits, next step.

For each question include: a model answer (3–6 sentences), a "use an example from my project" hint, and a "common weak answer to avoid."

---

## 20. Submission deliverables

### 20.1 `README.md` (in repo)
What it is; live URL; screenshot(s); how to run locally; the SDK primitives used (table with *why*) and the ones intentionally omitted (with *why*); architecture overview; data stored and privacy note; tests and how to run them; limitations; next steps.

### 20.2 Writeup (draft in `SUBMISSION_WRITEUP.md`, ~300–450 words; the user edits it in their own voice)

Required sections (map exactly to the portal ask):
1. **What I built** (2–3 sentences, plain).
2. **DeepSpace integrations used** and the specific reason for each; one line on what I left out and why.
3. **Main tradeoff** (suggested: *a small, honest, finished experiment system with proxy metrics and real-but-small traffic, rather than a broad analytics suite; I chose a statistical gate that says "not enough data" over a flashy winner.*)
4. **What the agent did** (from `AGENT_LOG.md`: scaffolding, boilerplate, UI, first drafts of tests, etc.).
5. **What I verified myself / changed** (from `LEARN/09-my-verification.md`: specific checks, bugs found, decisions overridden).
6. **Real result and honest limits** (actual numbers; "not enough data" if true).
7. **What I'd do next.**

### 20.3 `AGENT_LOG.md`
Chronological, honest, specific. Include misses and corrections.

---

## 21. Definition of done (check every box before the user submits)

- [ ] Deployed at `<name>.app.space`; the important path works **on the live site**
- [ ] Auth + RBAC enforced; anonymous users cannot read private data
- [ ] Experiment lifecycle works: create → variants → Claim Guard → approve → launch/lock → public page → events → live dashboard → readout → decision → playbook
- [ ] Status gate prevents premature winners; readout contradictions rejected in code
- [ ] ≥ 6 SDK primitives used with real reasons; omissions explained (payments etc.)
- [ ] No secrets in repo or history; AI/search via proxies; per-user caps
- [ ] Unit tests (stats, assign, schemas, claimGuard) pass; one multi-user e2e test passes; type-check and lint pass
- [ ] Claim Guard eval cases + honest score recorded
- [ ] DEMO data labeled and excluded from real readouts; independent-experiment footer present
- [ ] Real experiment run with real shared links; real numbers captured
- [ ] `README.md`, `SUBMISSION_WRITEUP.md`, `AGENT_LOG.md` complete
- [ ] `LEARN/` complete including `SKILL.md`, interview Q&A, self-quiz, bug bank; user has personally filled `LEARN/09-my-verification.md`
- [ ] The user can explain the architecture, one server action, the stats, and Claim Guard **without looking at anything**

---

## 22. Appendix

### 22.1 Glossary (expand in `LEARN/`)
- **SDK:** a package of ready-made code you add to your app.
- **Durable Object:** a small, stateful server on Cloudflare that holds live data for one unit (e.g. one app's records) and enables realtime sync.
- **RBAC:** role-based access control — what each role may read or write.
- **Server action:** backend function the client calls; the trusted place to validate and spend credits.
- **Proxy (AI/integration):** the platform calls the outside service for you, so the app holds no API key.
- **Zod:** a library that checks data matches an expected shape at runtime.
- **Hypothesis / decision rule / pre-registration:** the belief, the rule for acting on results, and fixing both before seeing data.
- **Wilson interval:** a confidence range for a proportion that behaves well with small samples.
- **Proxy metric:** a measurable stand-in for what you really care about (clicks vs real adoption).
- **Funnel:** the stages from attention to paid use.

### 22.2 Known assumptions to verify (do not trust blindly)
- Exact SDK API names for permissions, server actions, jobs, presence, AI proxy, and testing helpers.
- Whether the integration proxy can fetch/search DeepSpace docs for Claim Guard sourcing.
- Platform limits (job duration, rate limits, storage size, credit costs).
- Whether anonymous server-action calls are supported as described; if not, document the workaround and its tradeoff.

### 22.3 If reality contradicts this brief
Choose the smallest change that preserves: (1) the honest status gate, (2) Claim Guard, (3) the real-experiment path, (4) the learning material. Log the deviation in `AGENT_LOG.md` and explain it in `LEARN/08-tradeoffs.md`.

**End of brief. Begin with §0 and the docs-verification step.**
