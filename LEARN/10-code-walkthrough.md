# Guided Code Walkthrough & Hands-on Exercises

This document is your tour of the Positioning Lab codebase. If an interviewer asks: *"Open the codebase and show me how you solved X,"* use this guide to navigate directly to the right file, explain the key lines, and demonstrate complete mastery of the code.

---

## Part 1: Guided Tour of the 10 Most Critical Files

### 1. [src/lib/stats.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/stats.ts) — The Statistical Gate
- **Lines 10–35 (`calculateWilsonInterval`):** Computes the 95% Wilson score interval using $z = 1.96$. Handles edge cases ($n = 0$, $0$ successes, $100\%$ successes) without division by zero. Notice how the center shifts slightly toward $0.5$ ($\tilde{p}$ adjustment), which protects against overconfidence in small samples.
- **Lines 40–80 (`evaluateStatusGate`):** The 3-state state machine:
  1. If any variant has $n < \text{minSamplePerVariant}$, returns `'not_enough_data'`.
  2. If intervals overlap, returns `'directional'`.
  3. If intervals completely separate and sample size is met, returns `'evidence_favors_x'`.

### 2. [src/lib/assign.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/assign.ts) — Deterministic Variant Assignment
- **Lines 8–24 (`fnv1a32`):** Pure 32-bit FNV-1a hash implementation using bitwise operations (`hash ^= charCode`, `Math.imul`).
- **Lines 26–42 (`assignVariant`):** Hashes `"${experimentId}:${visitorId}"` and applies modulo over active variant count. Guarantees that a visitor always gets the exact same variant across reloads without storing state in a session cookie.
- **Lines 44–60 (`sanitizeChannel`):** Whitelists incoming `?src=` query parameters against `linkedin, x, reddit, hn, discord, friend, other`.

### 3. [src/lib/claimGuard.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/claimGuard.ts) — Factual Grounding & Verification
- **Lines 12–50 (`SEED_FACTS`):** Official verified technical capabilities of DeepSpace extracted from `docs.deep.space`.
- **Lines 52–65 (`SUPERLATIVE_BUZZWORDS`):** List of banned marketing hype terms (`"unlimited"`, `"fastest"`, `"revolutionary"`, `"100% free"`).
- **Lines 70–120 (`verifyClaim`):** Evaluates a candidate headline against ground-truth facts. Returns a structured verdict (`supported`, `unsupported`, or `unclear`) with an audit reason.

### 4. [src/lib/schemas.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/schemas.ts) — Zod Validation Contracts
- Defines runtime schemas for all server action inputs and AI responses:
  - `DraftVariantsInputSchema` and `AiGeneratedVariantsSchema`
  - `RecordEventInputSchema` (ensures `type` is strictly in the enum)
  - `AiReadoutOutputSchema` (ensures the LLM cannot return freeform text; must adhere to structured fields)

### 5. [src/actions/index.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/actions/index.ts) — Server Action Boundary
- **`getPublicVariant`:** Validates experiment slug, runs the bot crawler filter, executes FNV-1a assignment, and registers the anonymous visitor.
- **`recordEvent`:** Verifies the experiment is currently in `'launched'` status before writing a conversion event.
- **`launchExperiment`:** Verifies all variants are approved, sets status to `'launched'`, and locks `lockedAt`.
- **`writeReadout`:** Calls DeepSpace AI Proxy, feeds live Wilson intervals, and writes an AI summary strictly bound to the mathematical gate.

### 6. [src/schemas.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/schemas.ts) — Edge SQLite Schema & RBAC
- Defines the 11 collections on the DeepSpace RecordRoom.
- Specifies access rules: anonymous visitors have zero direct read/write permissions. All writes are mediated by worker actions.

### 7. [src/pages/t/[slug].tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/t/%5Bslug%5D.tsx) — Public Test Landing Page
- Evaluates the visitor UUID from `localStorage`, calls `getPublicVariant`, and renders the assigned variant headline, subhead, and CTA.
- Primary conversion trigger: `copy_command` on the terminal box. Emits real-time feedback with instant toast notification.
- Renders the inline micro-survey with prompt-injection defense.

### 8. [src/pages/(app)/(protected)/experiments/[id].tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/%28app%29/%28protected%29/experiments/%5Bid%5D.tsx) — Experiment Control Center
- Multi-tab management interface:
  - **Variants Tab:** View drafted angles, trigger Claim Guard checks, and approve variants.
  - **Live Dashboard Tab:** Live conversion bars with 95% Wilson confidence intervals, sample size meter, and channel breakdown table.
  - **Readout & Decision Tab:** AI readout generation and final decision seal (`expand`, `change`, `stop`).
  - **Presence Bar:** Renders live teammate avatars using `usePresence()`.

### 9. [src/pages/(app)/(protected)/experiments/new.tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/%28app%29/%28protected%29/experiments/new.tsx) — Pre-Registration Form
- Enforces GTM discipline: requires the user to declare the audience segment, measurable hypothesis, and decision rule before drafting copy.

### 10. [tests/unit/claimGuard.test.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/tests/unit/claimGuard.test.ts) — Factual Eval Benchmark
- Runs 12 ground truth test cases from `tests/evals/claimGuard.cases.json`.
- Measures Claim Guard precision on both valid technical claims and adversarial marketing falsehoods.

---

## Part 2: Five "Modify This" Exercises (Practice Drills)

Practice making these five quick modifications so you are comfortable editing the code on the fly during a live coding interview:

### Exercise 1: Change the Minimum Sample Size Default
- **Goal:** Increase default minimum sample size from 50 to 100 to require higher statistical power.
- **File to Edit:** [src/lib/schemas.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/schemas.ts) and [src/pages/(app)/(protected)/experiments/new.tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/%28app%29/%28protected%29/experiments/new.tsx)
- **Change:**
  ```typescript
  // In src/lib/schemas.ts:
  minSamplePerVariant: z.number().int().min(10).default(100),
  ```
- **Verification:** Run `npm run validate` and create a new experiment; verify the input field defaults to 100.

### Exercise 2: Add a New Marketing Channel (`youtube`)
- **Goal:** Support tracking traffic from YouTube video descriptions (`?src=youtube`).
- **File to Edit:** [src/lib/assign.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/assign.ts)
- **Change:**
  ```typescript
  export const ALLOWED_CHANNELS = [
    'linkedin', 'x', 'reddit', 'hn', 'discord', 'youtube', 'friend', 'other'
  ] as const;
  ```
- **Verification:** Run `vitest run tests/unit/assign.test.ts`; verify `sanitizeChannel('youtube')` returns `'youtube'`.

### Exercise 3: Add a New Event Type (`star_repo`)
- **Goal:** Track when a visitor clicks a "Star on GitHub" link.
- **File to Edit:** [src/lib/schemas.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/schemas.ts)
- **Change:**
  ```typescript
  export const EventTypeSchema = z.enum([
    'view', 'copy_command', 'docs_click', 'tried_it', 'star_repo'
  ]);
  ```
- **Verification:** In [src/pages/t/[slug].tsx](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/pages/t/%5Bslug%5D.tsx), add a GitHub button calling `recordEvent(..., 'star_repo')`.

### Exercise 4: Add a New Buzzword to Claim Guard
- **Goal:** Flag any variant containing the hype word `"revolutionary"`.
- **File to Edit:** [src/lib/claimGuard.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/claimGuard.ts)
- **Change:** Add `'revolutionary'` to the `SUPERLATIVE_BUZZWORDS` array.
- **Verification:** Run `vitest run tests/unit/claimGuard.test.ts`; test that headlines with "revolutionary" are rejected.

### Exercise 5: Adjust Wilson Score Confidence Level to 90%
- **Goal:** Change confidence level from 95% ($z = 1.96$) to 90% ($z = 1.645$) for faster directional feedback.
- **File to Edit:** [src/lib/stats.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/stats.ts)
- **Change:**
  ```typescript
  export function calculateWilsonInterval(
    successes: number,
    total: number,
    z: number = 1.645 // Changed from 1.96 to 1.645 for 90% CI
  ): WilsonInterval { ... }
  ```
- **Verification:** Run `vitest run tests/unit/stats.test.ts` to inspect the narrower intervals.
