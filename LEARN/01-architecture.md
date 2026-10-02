# LEARN 01: System Architecture & Request Lifecycles

> **Target:** You must be able to sketch the architecture on a whiteboard and narrate the complete request lifecycle for both a public visitor and an authenticated admin.

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph Browser ["Client (Browser)"]
        PublicVisitor["Public Visitor (/t/:slug)"]
        AdminUser["Admin / Teammate (/app/experiments)"]
        LocalStore["localStorage (anon visitorId)"]
    end

    subgraph Edge ["Cloudflare Workers Edge Network"]
        HonoRouter["Hono Worker Router (/worker.ts)"]
        StaticAssets["Vite SPA Static Assets"]
        AuthGateMiddleware["<AuthGate> & JWT Validator"]
    end

    subgraph DO ["Cloudflare Durable Objects"]
        RecordRoom["RecordRoom (SQLite persistence)"]
        PresenceEngine["WebSocket Presence / Ephemeral Channel"]
    end

    subgraph Platform ["DeepSpace Platform Services"]
        DeepSpaceAuth["DeepSpace Auth (OAuth / Session)"]
        AIProxy["DeepSpace AI Proxy (Claude / GPT)"]
        IntegrationProxy["Integration Proxy"]
    end

    %% Visitor Flow
    PublicVisitor -->|1. Generate / Read visitorId| LocalStore
    PublicVisitor -->|2. POST /api/actions/recordEvent| HonoRouter
    
    %% Admin Flow
    AdminUser -->|OAuth Login| DeepSpaceAuth
    AdminUser -->|WebSocket (useQuery / live sync)| RecordRoom
    AdminUser -->|WebSocket (presence)| PresenceEngine
    AdminUser -->|POST /api/actions/draftVariants| HonoRouter
    
    %% Worker Internal Routing
    HonoRouter -->|tools.create / tools.update| RecordRoom
    HonoRouter -->|createDeepSpaceAI()| AIProxy
    HonoRouter -->|Serve frontend| StaticAssets
```

---

## 2. Request Lifecycle: Public Visitor Conversion ("Copy Command")

1. **Visitor Landing:**
   - Visitor navigates to `https://positioning-lab.app.space/t/agent-scale?src=linkedin`.
   - The browser checks `localStorage.getItem('pl_visitor_id')`. If null, generates `crypto.randomUUID()`.
   - The browser parses the query string `?src=linkedin` against an allowed whitelist (`linkedin`, `x`, `reddit`, `hn`, `discord`, `friend`, `other`).
   - The deterministic hashing function runs: `index = fnv1a(experimentId + visitorId) % approvedVariants.length`.
   - The assigned variant is displayed immediately (zero flicker, zero server latency).

2. **Triggering Conversion:**
   - Visitor clicks the primary button: `"Copy: npx deepspace"`.
   - The CLI command is copied to the visitor's clipboard.
   - The client invokes the server action `recordEvent` via `POST /api/actions/recordEvent`:
     ```json
     {
       "slug": "agent-scale",
       "visitorId": "7b8e1a...",
       "type": "copy_command",
       "channel": "linkedin"
     }
     ```

3. **Edge Worker Verification:**
   - The Hono worker receives the request at `/api/actions/recordEvent`.
   - **Bot Check:** Verifies non-empty visitor ID and checks user-agent against known scrapers.
   - **Input Validation:** Zod validates the payload schema and event type enum.
   - **Deduplication:** The server action queries `events` for `(experimentId, visitorId, type)`. If an entry already exists, the action exits idempotently.
   - **Persistence:** Calls `tools.create('events', { ... })` which commits the record to the Durable Object's SQLite database.

4. **Realtime Broadcast:**
   - The `RecordRoom` detects the new row insertion.
   - It broadcasts a delta over open WebSockets to all subscribed clients.
   - The admin's browser receives the update; React re-renders the conversion counter and recalculates the 95% Wilson score interval in real time.

---

## 3. Request Lifecycle: Admin Generates an AI Readout

1. **Admin Trigger:**
   - The admin opens the experiment dashboard and clicks **"Generate Readout"**.
   - The client calls `POST /api/actions/writeReadout` with the user's Bearer JWT.

2. **Server-Side Statistical Pre-Computation:**
   - The worker executes `stats.ts` to compute:
     - Total non-bot visitors per variant ($n_i$).
     - Unique conversions ($x_i$).
     - Conversion rates ($\hat{p}_i = x_i / n_i$).
     - 95% Wilson confidence intervals $[L_i, U_i]$.
     - The **Status Gate**: `Not enough data`, `Directional`, or `Evidence favors X`.

3. **Prompt Construction with Guardrails:**
   - The model is **not** given raw event logs. It is given strictly the computed numbers and the status gate.
   - The system prompt enforces:
     - Every statement must be tagged either `Evidence` (backed by the numbers) or `Assumption` (strategic interpretation).
     - If the status gate is `Not enough data`, the recommendation MUST be `collect_more`. Naming a winner is forbidden.

4. **Model Execution & Schema Validation:**
   - The server calls `createDeepSpaceAI(env, 'anthropic')` using `generateObject` with a strict Zod schema.
   - If the AI returns an invalid recommendation (e.g., claims Variant B won while status is `Not enough data`), code rejects the response and enforces the fallback.
   - The validated readout is stored in `readouts` and returned to the admin.
