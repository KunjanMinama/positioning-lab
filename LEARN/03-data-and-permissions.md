# DeepSpace Data Model & Permission Architecture (RBAC)

In DeepSpace, your application data lives in a **RecordRoom** — a stateful Durable Object backed by SQLite running at Cloudflare's edge. This document explains the exact data model of Positioning Lab, how Role-Based Access Control (RBAC) is enforced at both the storage layer and the API layer, and why anonymous visitors are strictly barred from direct database writes.

---

## 1. The Core Collections

Positioning Lab defines **11 primary collections** in [src/schemas.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/schemas.ts):

| Collection | Key Fields | Purpose |
|---|---|---|
| **`experiments`** | `id`, `slug`, `title`, `segment`, `hypothesis`, `primaryMetric`, `minSamplePerVariant`, `decisionRule`, `status`, `launchedAt`, `lockedAt`, `isDemo` | The experiment contract. Holds pre-registered hypothesis and the immutable decision rule. |
| **`variants`** | `id`, `experimentId`, `label`, `headline`, `subhead`, `ctaLabel`, `commandText`, `claimStatus`, `approved`, `source`, `isDemo` | Marketing angles being tested against the target developer persona. |
| **`visitors`** | `id`, `experimentId`, `variantId`, `channel`, `firstSeenAt`, `isBot` | Anonymized visitor session record. **Zero personal data (no IP, no raw user-agent).** |
| **`events`** | `id`, `experimentId`, `variantId`, `visitorId`, `type`, `channel`, `ts`, `isDemo` | Behavioral telemetry: `view`, `copy_command`, `docs_click`, `tried_it`. |
| **`surveyResponses`**| `id`, `experimentId`, `variantId`, `visitorId`, `text`, `themeId`, `ts` | Qualitative developer signal collected via the inline micro-survey. |
| **`facts`** | `id`, `statement`, `source`, `category`, `verifiedBy`, `verifiedAt`, `status` | Golden ground-truth registry of verified technical facts from `docs.deep.space`. |
| **`claimChecks`** | `id`, `variantId`, `claim`, `matchedFactId`, `verdict`, `reason` | Audit logs of automated Claim Guard verification passes. |
| **`decisions`** | `id`, `experimentId`, `call`, `reason`, `statusAtDecision`, `ts`, `decidedBy` | The post-experiment call (`expand`, `change`, `stop`) sealed alongside the final numbers. |
| **`playbooks`** | `id`, `experimentId`, `title`, `hypothesis`, `result`, `lesson`, `nextStep`, `tags` | Institutional memory preserving GTM learnings so past errors are never repeated. |
| **`ideas`** | `id`, `title`, `hypothesis`, `impact`, `confidence`, `effort`, `score`, `status` | Backlog of upcoming test candidates ranked by ICE prioritization score. |
| **`aiUsage`** | `id`, `userId`, `day`, `calls`, `tokensEstimate` | Per-user rate-limiting and budget accounting table to prevent AI proxy abuse. |

---

## 2. RBAC Permission Matrix

DeepSpace enforces permissions in the Durable Object layer before any query touches SQLite:

```
[Public Visitor (Anonymous)] 
       │ 
       ├─ Direct DB Read?  ──► DENIED (403)
       ├─ Direct DB Write? ──► DENIED (403)
       └─ Via Server Action ─► ALLOWED (Validated & Sanitized)

[Team Member (Authenticated)]
       │
       ├─ Read Experiments, Variants, Events, Facts, Playbooks ──► ALLOWED
       ├─ Create Draft Experiments, Submit Ideas ───────────────► ALLOWED
       └─ Launch Experiment / Alter Production Facts ──────────► DENIED (Requires Admin)

[Admin (Lead GTM Engineer)]
       │
       └─ Full Read/Write across all 11 collections ────────────► ALLOWED
```

### Detailed Matrix

| Collection | Admin | Team Member | Public Visitor (Anonymous) |
|---|---|---|---|
| **experiments** | Full read / write | Read all, create `draft` | **No direct access**. Served via `getPublicVariant` server action. |
| **variants** | Full read / write | Read all, edit unapproved | **No direct access**. Only active approved variant copy is returned. |
| **visitors** | Full read | Full read | Write **only** via `getPublicVariant` server action. |
| **events** | Full read | Full read | Write **only** via `recordEvent` server action. |
| **surveyResponses** | Full read | Full read | Write **only** via `submitSurvey` server action. |
| **facts** | Full read / write | Read verified facts | None. |
| **claimChecks** | Full read / write | Read audit history | None. |
| **decisions** | Full read / write | Read final calls | None. |
| **playbooks** | Full read / write | Read & contribute | None. |
| **ideas** | Full read / write | Full read / write | None. |
| **aiUsage** | Full read / write | Read own quota | None. |

---

## 3. Why Public Visitors Have Zero Direct Database Access

In many naive web apps, client-side SDKs allow the browser to write directly to Firestore or Supabase with permissive rules like `allow write: if true;`.

In Positioning Lab, **direct client writes are strictly prohibited**:
1. **Metric Poisoning:** If an anonymous visitor could `INSERT INTO events`, a script could flood thousands of `copy_command` events to bias the Wilson score and fabricate a false winner.
2. **Channel Spoofing:** A competitor could write arbitrary attribution tags to distort marketing channel efficiency.
3. **Data Pollution:** Unchecked survey submissions could exhaust database quotas or inject malicious scripts.

### The Server Action Barrier
All public traffic interacts through **Server Actions** ([src/actions/index.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/actions/index.ts)):
1. **`getPublicVariant(slug, channel, visitorId)`**: Validates slug, sanitizes channel against the whitelist (`linkedin, x, reddit, hn, discord, friend, other`), runs the bot filter, executes the deterministic FNV-1a hash, and records the initial visitor record securely.
2. **`recordEvent(experimentId, variantId, visitorId, type, channel)`**: Verifies that the experiment is currently in `launched` status, validates that `type` is in the allowed enum, checks for bot headers, and records the conversion event.
3. **`submitSurvey(experimentId, variantId, visitorId, text)`**: Checks length (3–500 chars), sanitizes input, and writes the response.

---

## 4. Audit Trail & Rule Locking

A major vulnerability in developer marketing is **"moving the goalposts"** — changing the required sample size or switching the primary metric mid-flight when an angle is losing.

To prevent this:
- When an experiment transitions from `draft` to `launched` in `launchExperiment`, the backend seals `lockedAt = new Date().toISOString()`.
- Once `lockedAt` is populated, the `decisionRule`, `hypothesis`, and `minSamplePerVariant` fields cannot be modified by any user, including admins.
- If a team wants to test a different hypothesis or sample target, they are forced to archive the experiment and register a new one. This preserves scientific integrity.
