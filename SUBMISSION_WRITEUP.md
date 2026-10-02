# DeepSpace Build Exercise: Submission Writeup

### 1. What I Built
I built **Positioning Lab**, a full-stack developer marketing experimentation platform on DeepSpace. It allows GTM engineers to pre-register positioning hypotheses and decision rules, ground AI-drafted messaging against official documentation (`docs.deep.space`) via **Claim Guard**, deterministically assign public visitors to variants without collecting personal data, and evaluate developer intent conversions using an honest 3-state statistical status gate.

### 2. DeepSpace Integrations Used
I leveraged seven DeepSpace platform capabilities for explicit product needs:
- **CLI & Scaffolding:** Initialized our TypeScript, Tailwind v4, and Generouted edge foundation.
- **Auth & RBAC:** Enforced multi-role security across 11 collections, strictly barring anonymous visitors from direct database queries.
- **SQLite RecordRoom (Durable Objects):** Provided edge-hosted persistent storage for experiments, events, and ground-truth facts with sub-millisecond edge latency and automatic WebSocket updates.
- **Server Actions:** Established a secure mutation boundary handling Zod validation, bot crawler filtering, and state locking.
- **AI Proxy:** Generated variant copy and readouts through edge inference with zero API keys or secrets in the repository.
- **Presence:** Rendered live teammate avatars on experiment workspaces to prevent simultaneous edit collisions.
- **Testing Helpers (`deepspace/testing`):** Enabled multi-user browser testing in Playwright.

*Deliberately Omitted:* Payments (Stripe) and Blob Storage (R2) were omitted because this internal experimentation lab takes no customer money and all creative copy naturally fits within edge SQLite text columns.

### 3. Main Tradeoff
I chose a small, finished experiment system with proxy metrics and real-but-small traffic over a bloated analytics suite. Rather than building a vanity dashboard that prematurely declares statistical winners after 10 clicks, I implemented a strict **95% Wilson score interval status gate** that outputs `not_enough_data` whenever sample sizes are too small to draw valid conclusions.

### 4. What the Agent Did
The agent assisted with initial scaffolding, generated repetitive Zod validation schemas, drafted the base Tailwind UI components, wrote the 12 ground-truth Claim Guard evaluation cases, and created the first drafts of the unit test suites and `LEARN/` educational guides.

### 5. What I Verified Myself & Changed
I independently verified the DeepSpace SDK documentation, hand-calculated the Wilson score interval for $20/100$ ($13.34\%$ to $28.88\%$) to verify `stats.ts`, tested hash stability across private browser sessions, confirmed that Claim Guard correctly flagged the false assertion *"unlimited free compute forever"*, conducted a git history audit to confirm zero committed secrets, and overrode the AI readout generator to strictly enforce `collect_more` when the status gate is `not_enough_data`.

### 6. Real Results & Honest Limits
In real link distribution across Hacker News, Reddit, Twitter, and developer peers, the deployed experiment collected 63 visits and 10 terminal command copies across 2 variants. Because neither variant met the pre-registered threshold ($n \ge 50$), the status gate correctly sealed as **`not_enough_data`**, appropriately deferring any production decision. A key limitation is that terminal command copying is an intent proxy, not guaranteed CLI execution.

### 7. What I'd Do Next
I would connect `create-deepspace` with an anonymous postback webhook to measure true terminal initialization, and integrate a nightly cron job via DeepSpace's integration proxy to sync Claim Guard against live updates on `docs.deep.space`.
