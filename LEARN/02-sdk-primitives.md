# LEARN 02: DeepSpace SDK Primitives Reference

> **Target:** You must be able to explain each of the 6+ SDK primitives used in Positioning Lab, why we chose it over building our own, and why certain primitives (like payments) were intentionally omitted.

---

## 1. Summary Matrix of Primitives

| Primitive | Where It Lives in Our Code | Why We Used It (Technical Rationale) | 30-Second Spoken Pitch for Interview |
|---|---|---|---|
| **Scaffold & CLI** (`create-deepspace`, `deepspace dev start`, `deploy`) | `package.json`, `wrangler.toml`, root config | Provides zero-config Vite + React frontend, Hono worker, and instant atomic deployment to `<name>.app.space`. | "We used DeepSpace's CLI to standardize our Cloudflare Workers runtime and deploy our full-stack app with a single command without maintaining separate CI/CD pipelines." |
| **Auth & Protected Routes** (`DeepSpaceAuthProvider`, `<AuthGate>`, `useAuth`) | `src/pages/(app)/_layout.tsx`, `src/pages/(app)/(protected)/_layout.tsx` | Eliminates hand-rolled JWT sessions. Distinguishes authenticated team members from anonymous public visitors. | "We let DeepSpace handle GitHub/Google OAuth and JWT minting, while `<AuthGate>` protects our admin routes. Public visitors remain anonymous." |
| **Role-Based Access Control (RBAC)** | `src/schemas/*-schema.ts` (`permissions` block) | Enforces read/write permissions at the data layer (Durable Object level), preventing security vulnerabilities from UI-only hiding. | "We defined granular RBAC directly on our collection schemas. For example, visitors can write events via server actions, but have zero read access to our admin collections." |
| **Realtime Records (SQLite + DO)** | `RecordRoom`, `RecordProvider`, `useQuery`, `useMutations` | Durable Objects provide low-latency state persistence with SQLite and broadcast real-time updates over WebSockets. | "DeepSpace's RecordRoom combines SQLite storage on Cloudflare with WebSocket synchronization. When a visitor triggers a conversion, the admin's dashboard updates in real time." |
| **Server Actions** (`ActionHandler<Env>`, `tools`) | `src/actions/index.ts`, mounted at `/api/actions/*` | Provides privileged, RBAC-bypassing operations (`tools.create`, `tools.update`) with caller validation and rate limiting. | "Server actions are our trusted execution path. They validate incoming data with Zod, deduplicate visitor clicks, and enforce our statistical gates before writing." |
| **AI Proxy** (`createDeepSpaceAI`) | `src/actions/draftVariants.ts`, `src/actions/writeReadout.ts` | Routes LLM inference through DeepSpace's managed proxy, keeping API keys out of code and tying usage to owner credits. | "We use `createDeepSpaceAI` to call Claude with structured Zod outputs. It eliminates secrets from our repository and provides built-in token accounting." |
| **Presence** (`usePresence`) | `src/pages/(app)/(protected)/experiments/$id.tsx` | Broadcasts active collaborators in an experiment room over WebSockets without touching persistent database storage. | "Presence uses ephemeral WebSocket messages to show which teammates are reviewing an experiment, preventing simultaneous edit conflicts." |
| **Testing Helpers** (`deepspace/testing`) | `tests/e2e/experiment-flow.spec.ts` | Multi-user Playwright fixtures designed specifically for real-time collaborative state verification. | "DeepSpace testing helpers allow us to spin up two simultaneous browser contexts—an admin launching a test and a visitor clicking the landing page—verifying live sync." |

---

## 2. Intentionally Omitted Primitives (And Why)

A key criterion in the build exercise is explaining **why integrations that would not add value were left out**.

### 1. Payments (`deepspace/client/payments` & Stripe Checkout)
- **Why omitted:** Positioning Lab is an internal experimentation and GTM tool used by growth teams. Charging visitors or gating test pages with a paywall would destroy conversion funnels and make zero product sense. Re-implementing a fake checkout just to "check a box" would violate the design principle of *Honesty over Drama*.

### 2. File Storage (`R2` bucket proxy)
- **Why omitted:** All variant copy, factual claims, visitor events, and readouts fit cleanly into structured relational records in SQLite. Adding image/PDF uploads would add unnecessary complexity without improving the core positioning experiment workflow.

### 3. Custom Domains
- **Why omitted:** DeepSpace provides free, fast, automatic SSL provisioning on `*.app.space`. For a rapid positioning test, `<name>.app.space` is perfectly suited and conveys transparency that it is an independent developer test.
