# Debugging Playbook & Incident Response

In a live technical interview or production outage, remaining calm and following a structured **Hypothesis $\to$ Test $\to$ Diagnose $\to$ Fix** loop is what distinguishes senior engineers from junior builders.

This playbook gives you the exact mental model, error patterns, and debugging routines for Positioning Lab.

---

## 1. The 4-Step Live Debugging Routine

When something fails or the interviewer says *"The page is throwing an error, find it"*:

```
1. Observe the Symptom (Console error, HTTP status code, UI banner)
             │
2. Formulate 2 Specific Hypotheses (e.g. "Zod schema mismatch OR unauthorized RBAC session")
             │
3. Inspect the Narrowest Boundary (Check Network tab payload OR run Vitest unit test)
             │
4. Apply the Smallest Clean Fix & Verify (Do not rewrite the whole file; re-test immediately)
```

---

## 2. Common Failure Modes & Stack Trace Guides

### Failure Mode 1: Zod Schema Validation Error (`ZodError`)
- **Symptom:** Server Action returns HTTP 400 or logs `ZodError: [ { code: "invalid_type", expected: "string", received: "undefined", path: ["headline"] } ]`.
- **Root Cause:** The payload sent from the React client does not match the strict schema in [src/lib/schemas.ts](file:///c:/Users/ASUS/Desktop/Positioning%20Lab/src/lib/schemas.ts) (e.g., misspelled field name `header` instead of `headline`, or missing `min(3)` string length).
- **How to Trace:**
  1. Open DevTools Network tab $\to$ find the POST request to `/api/actions/*`.
  2. Inspect the **Payload / Request Body**.
  3. Compare each key against the schema in `src/lib/schemas.ts`.
  4. Fix: Correct the client-side state payload or adjust the Zod schema if the field is optional.

### Failure Mode 2: RBAC Permission Denied (HTTP 401 / 403)
- **Symptom:** UI displays `"Failed to launch experiment: Unauthorized"` or RecordRoom throws an unhandled permission error.
- **Root Cause:**
  - An anonymous visitor attempted to call an admin-only Server Action (e.g., `approveVariant` or `launchExperiment`).
  - Or the user session expired / has the `member` role instead of `admin`.
- **How to Trace:**
  1. In the browser console, check the user session: `window.__DEEPSPACE_USER__`.
  2. In `src/actions/index.ts`, check the guard clause:
     ```typescript
     if (!session || session.role !== 'admin') {
       throw new Error('Unauthorized: Admin access required');
     }
     ```
  3. Ensure that public actions (like `getPublicVariant` and `recordEvent`) do not demand admin auth.

### Failure Mode 3: AI Proxy JSON Schema Failure
- **Symptom:** `JSON.parse` error or LLM outputs markdown backticks around JSON (` ```json ... ``` `) causing parsing to fail.
- **Root Cause:** LLM providers sometimes fail to return raw valid JSON when prompted casually.
- **How to Trace:**
  1. Check `src/actions/index.ts` where the AI response is handled.
  2. Notice how our code uses `ai.generateObject` with a strict Zod schema, or strips markdown fences (`rawText.replace(/^```json/, '').replace(/```$/, '')`) before parsing.
  3. If the LLM generates an invalid enum or omits a required field, Zod catches it cleanly and triggers the deterministic fallback generator.

### Failure Mode 4: Platform Deployment & App ID Mismatch
- **Symptom:** Vitest or `npx deepspace deploy` fails with:
  `Error: DEEPSPACE_APP_ID in wrangler.toml must match /^app_[0-9A-HJKMNP-TV-Z]{26}$/`
- **Root Cause:** The scaffold template ships with a placeholder `__APP_ID__` that fails the regex validator until a real app ID is assigned by the CLI.
- **How to Trace:**
  1. Check `wrangler.toml`.
  2. Ensure `app_id` is populated with a valid ULID-format string (e.g. `app_01J9X4T7B00000000000000000` for local dev/testing, or the real platform ID from `npx deepspace apps list`).

### Failure Mode 5: TypeScript Cast Errors with Durable Object Tools
- **Symptom:** `TS2352: Conversion of type 'T' to type 'U' may be a mistake because neither type sufficiently overlaps with the other.`
- **Root Cause:** When unpacking records from DeepSpace tools (`tools.get()` or `tools.query()`), TypeScript enforces strict type checking.
- **Fix Pattern:** Always cast through `unknown`:
  ```typescript
  const result = (await tools.query(...)) as unknown as { data: ExperimentRecord[] };
  ```

---

## 3. How to Narrate Live Debugging in an Interview

If an interviewer asks you to diagnose a bug live, follow this verbal script:

> *"First, let's look at where the failure occurs in the pipeline. I see the UI is showing a submission failure. Let me open the Network tab in DevTools to inspect the HTTP status code and response payload.*
>
> *The response is a 400 with a validation error on `minSamplePerVariant`. That tells me the client is submitting a value that violated our Zod schema. Let's inspect `src/lib/schemas.ts`.*
>
> *I see the schema requires `min(10)`. The form input allowed the user to type 5. We have two options: either update the schema if 5 is a valid sample size, or add client-side validation to the form input to prevent invalid submissions. Since a sample size of 5 cannot provide statistical power, the right fix is to enforce `min="10"` on the HTML input in `new.tsx`."*
