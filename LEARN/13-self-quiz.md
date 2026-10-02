# Self-Quiz: 42 Preparation Questions

Test your mastery across the DeepSpace SDK, statistics, AI verification, security, and developer GTM strategy. Try answering each question out loud before expanding the `<details>` block.

---

## Category 1: DeepSpace SDK & Architecture (Questions 1–10)

### 1. Where does RecordRoom data physically live, and how is it queried?
<details>
<summary>Reveal Answer</summary>
Data lives inside a Cloudflare Durable Object at the edge, backed by embedded SQLite. It is queried via the DeepSpace SDK's <code>tools.query()</code> and <code>tools.get()</code> APIs, which provide sub-millisecond edge reads and automatic WebSocket replication.
</details>

### 2. Why does Positioning Lab use Server Actions instead of direct database client queries for event logging?
<details>
<summary>Reveal Answer</summary>
Because anonymous public visitors must not have direct write access to the database. Server Actions validate the payload with Zod schemas, filter bot traffic, verify that the experiment is currently in 'launched' status, and prevent malicious visitors from poisoning conversion counts.
</details>

### 3. What is the difference between DeepSpace Presence and RecordRoom storage?
<details>
<summary>Reveal Answer</summary>
Presence (<code>usePresence</code>) is an ephemeral, in-memory state shared across active WebSocket connections to show who is currently online or viewing a page. RecordRoom is persistent SQLite storage that survives page reloads, server restarts, and browser disconnects.
</details>

### 4. What would happen if you used `__APP_ID__` in `wrangler.toml` in production?
<details>
<summary>Reveal Answer</summary>
The DeepSpace test runner and deployment compiler enforce a regex check: <code>/^app_[0-9A-HJKMNP-TV-Z]{26}$/</code>. Using the placeholder string causes the build to fail immediately on startup.
</details>

### 5. Why are there no OpenAI or Anthropic API keys in this codebase?
<details>
<summary>Reveal Answer</summary>
Positioning Lab uses DeepSpace's platform AI proxy (<code>ai.generateObject</code> / <code>ai.generateText</code>). DeepSpace handles authentication, credentials, and billing at the edge infrastructure layer, so the application code never handles raw secret keys.
</details>

### 6. What does `lockedAt` signify on an experiment record?
<details>
<summary>Reveal Answer</summary>
It is an immutable timestamp sealed when the experiment transitions from <code>draft</code> to <code>launched</code>. Once sealed, the hypothesis, decision rule, and minimum sample size cannot be edited, preventing retroactive goalpost-moving.
</details>

### 7. How does Generouted handle route parameters like `[slug].tsx` and `[id].tsx`?
<details>
<summary>Reveal Answer</summary>
Generouted maps directory brackets to React Router route parameters. In component code, <code>useParams()</code> directly provides <code>{ slug }</code> or <code>{ id }</code> as string values.
</details>

### 8. What would break if a developer wrote a raw SQL `INSERT` on the client?
<details>
<summary>Reveal Answer</summary>
DeepSpace's Durable Object security boundary would immediately throw an HTTP 403 Forbidden. The client SDK does not have permission to execute unauthenticated raw SQL writes.
</details>

### 9. Why was Payments (`@deepspace/payments`) intentionally omitted from this app?
<details>
<summary>Reveal Answer</summary>
Positioning Lab is an internal developer experimentation tool and public landing test harness. No part of the system takes money. Adding Stripe would be vanity integration padding with zero real product value.
</details>

### 10. Why is Presence preferable to live CRDT collaborative text editing for variant copy?
<details>
<summary>Reveal Answer</summary>
Marketing copy requires deliberate formulation, Claim Guard verification, and formal pre-registration. CRDT character merging creates messy race conditions. Presence avatars prevent collision simply and cleanly without document conflicts.
</details>

---

## Category 2: Statistics & The Status Gate (Questions 11–18)

### 11. What is a 95% Wilson score interval in plain English?
<details>
<summary>Reveal Answer</summary>
It is a mathematically rigorous range where the true conversion rate is expected to lie 95% of the time. Unlike naive normal approximations, it remains accurate even with small samples (e.g. n=15) and never dips below 0% or above 100%.
</details>

### 12. What are the three states of our status gate?
<details>
<summary>Reveal Answer</summary>
1. <code>not_enough_data</code>: At least one variant has not reached minimum sample size.<br>
2. <code>directional</code>: Minimum sample size is met, but Wilson confidence intervals overlap.<br>
3. <code>evidence_favors_x</code>: Minimum sample size is met AND Wilson confidence intervals are completely non-overlapping.
</details>

### 13. What is the "peeking problem" in A/B testing?
<details>
<summary>Reveal Answer</summary>
Checking results repeatedly while a test is running and stopping the test as soon as p < 0.05. Because random noise fluctuates, peeking inflates false-positive rates from 5% to over 30%.
</details>

### 14. What are the Wilson interval bounds for 20 conversions out of 100 visitors ($z = 1.96$)?
<details>
<summary>Reveal Answer</summary>
Lower bound: <strong>13.34%</strong> (0.1334), Upper bound: <strong>28.88%</strong> (0.2888).
</details>

### 15. What would happen if an experiment has 2 conversions out of 2 visitors? What would naive math say vs. Wilson math?
<details>
<summary>Reveal Answer</summary>
Naive math says 100% conversion rate with 0% standard error. Wilson math shifts the center to ~70% and produces a wide interval (e.g. 34% to 99%), reflecting extreme uncertainty.
</details>

### 16. Why does the status gate require non-overlapping confidence intervals rather than a simple p-value?
<details>
<summary>Reveal Answer</summary>
Requiring non-overlapping 95% intervals is a conservative, highly visual heuristic (equivalent to p < 0.01) that non-statisticians can inspect at a glance without misinterpreting p-values.
</details>

### 17. What does the system do if an AI readout attempts to declare a winner while the gate is `not_enough_data`?
<details>
<summary>Reveal Answer</summary>
The Zod schema and prompt constraints strictly forbid declaring a winner. If the model attempts it, the server action rejects the readout or forces the recommendation to <code>collect_more</code>.
</details>

### 18. Why is `isDemo` data separated from real statistical calculations?
<details>
<summary>Reveal Answer</summary>
Demo data is seeded purely for UI demonstration. Mixing artificial demo clicks into live experiment calculations would falsify evidence and deceive stakeholders.
</details>

---

## Category 3: AI Proxy, Structured Outputs & Claim Guard (Questions 19–26)

### 19. What is Claim Guard and why is it needed?
<details>
<summary>Reveal Answer</summary>
Claim Guard is an automated verification system that extracts factual assertions from marketing copy and verifies them against ground-truth technical documentation (<code>docs.deep.space</code>), preventing AI hallucinations or deceptive marketing claims.
</details>

### 20. Name three superlative buzzwords that Claim Guard automatically flags.
<details>
<summary>Reveal Answer</summary>
"unlimited", "revolutionary", "100% free" (or "fastest", "infinitely scalable").
</details>

### 21. What are the three verdicts Claim Guard can assign to a claim?
<details>
<summary>Reveal Answer</summary>
<code>supported</code> (grounded in verified facts), <code>unsupported</code> (contradicted or unverified), and <code>unclear</code> (requires human review).
</details>

### 22. What prevents a public visitor from injecting malicious instructions through the micro-survey into future AI summaries?
<details>
<summary>Reveal Answer</summary>
1. Input clamped to 500 characters.<br>
2. Survey text is isolated inside explicit XML data tags (<code>&lt;user_feedback&gt;</code>) with system instructions treating it as untrusted data.<br>
3. The LLM output is strictly validated against a Zod schema.
</details>

### 23. What score did Claim Guard achieve on its 12 ground-truth benchmark evals?
<details>
<summary>Reveal Answer</summary>
12/12 (100.0% accuracy across both valid technical capabilities and adversarial marketing falsehoods).
</details>

### 24. What happens if the AI Proxy is unavailable or encounters a network error?
<details>
<summary>Reveal Answer</summary>
The system gracefully falls back to deterministic rule-based generators: Claim Guard uses keyword/token overlap against seed facts, and variant drafting uses templated angle blueprints.
</details>

### 25. How does Positioning Lab prevent "Denial-of-Wallet" attacks on AI endpoints?
<details>
<summary>Reveal Answer</summary>
The <code>aiUsage</code> collection tracks calls and estimated tokens per user daily. Once a user exceeds their daily quota (e.g. 20 generations), further requests are blocked.
</details>

### 26. Why do we extract claims as discrete statements before verification?
<details>
<summary>Reveal Answer</summary>
Because full paragraphs mix subjective positioning ("The easiest way to ship") with technical assertions ("Runs SQLite inside Durable Objects"). Isolating claims allows precise ground-truth matching.
</details>

---

## Category 4: Security, RBAC & Privacy (Questions 27–34)

### 27. Why does Positioning Lab never store raw IP addresses?
<details>
<summary>Reveal Answer</summary>
IP addresses are PII under GDPR. We inspect the IP ephemerally in memory to flag bot crawlers, then discard it immediately.
</details>

### 28. How does the system remember a visitor's assigned variant without a session cookie or user account?
<details>
<summary>Reveal Answer</summary>
A random UUID (<code>visitorId</code>) is stored in the browser's <code>localStorage</code>. On every page load, <code>(experimentId + visitorId)</code> is hashed via FNV-1a to produce a deterministic index.
</details>

### 29. What happens if a visitor visits with `?src=<script>alert('hack')</script>`?
<details>
<summary>Reveal Answer</summary>
The channel sanitizer strips HTML tags and compares against the whitelist (<code>linkedin, x, reddit, hn, discord, friend, other</code>). The invalid string safely defaults to <code>other</code>.
</details>

### 30. Who is permitted to call the `launchExperiment` Server Action?
<details>
<summary>Reveal Answer</summary>
Only authenticated users with the <code>admin</code> role. Unauthenticated visitors or team members receive an unauthorized error.
</details>

### 31. Can an unauthenticated visitor query the `visitors` collection?
<details>
<summary>Reveal Answer</summary>
No. The collection has no public read permission. Public visitors only receive their assigned variant copy through the <code>getPublicVariant</code> Server Action.
</details>

### 32. What command proves that no API secrets exist in the git repository?
<details>
<summary>Reveal Answer</summary>
<code>git log -p | grep -E "(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AIzaSy)"</code>, returning 0 matches.
</details>

### 33. Why are event types constrained to a Zod enum rather than accepting any string?
<details>
<summary>Reveal Answer</summary>
To prevent attackers or bots from polluting the database with arbitrary event names that would corrupt analytics and consume storage quotas.
</details>

### 34. What is the security advantage of Cloudflare Workers and Durable Objects for this architecture?
<details>
<summary>Reveal Answer</summary>
Isolation: code runs in lightweight V8 isolates at the edge with zero persistent server attack surface, no open ports, and no OS-level vulnerabilities to patch.
</details>

---

## Category 5: Developer GTM Strategy (Questions 35–42)

### 35. Why is "copy CLI command" a better developer conversion metric than "email newsletter signup"?
<details>
<summary>Reveal Answer</summary>
Developers guard their inboxes and rarely sign up for marketing emails. Clicking 'Copy' on an install command demonstrates active intent to run the code in their local terminal environment.
</details>

### 36. What is the fundamental difference between an assumption and evidence?
<details>
<summary>Reveal Answer</summary>
An assumption is an unproven belief (e.g. "Indie hackers prefer Cloudflare Workers"). Evidence is measured behavioral data collected under controlled conditions with pre-registered decision rules and statistical significance.
</details>

### 37. What is HARKing and how does Positioning Lab eliminate it?
<details>
<summary>Reveal Answer</summary>
HARKing means "Hypothesizing After the Results are Known" — changing your theory to fit random fluctuations in data. Positioning Lab forces engineers to pre-register their hypothesis and decision rule, locking them with <code>lockedAt</code> at launch.
</details>

### 38. What are the three post-experiment decisions in Positioning Lab?
<details>
<summary>Reveal Answer</summary>
<strong>Expand</strong> (roll the winning angle into documentation and landing pages), <strong>Change</strong> (pivot messaging based on qualitative feedback), and <strong>Stop</strong> (archive the angle and do not waste further resources).
</details>

### 39. What is an ICE score and how is it calculated in our Backlog?
<details>
<summary>Reveal Answer</summary>
ICE stands for <strong>Impact</strong> (1–5) × <strong>Confidence</strong> (1–5) × <strong>Ease/Effort</strong> (1–5). In our backlog, it ranks upcoming experiment ideas so teams test the highest-leverage concepts first.
</details>

### 40. Why must developer marketing copy avoid claims like "The fastest edge database on earth"?
<details>
<summary>Reveal Answer</summary>
Developers demand benchmarks, reproducible methodology, and technical proof. Unsubstantiated superlatives destroy developer credibility and trigger immediate skepticism.
</details>

### 41. If an experiment ends with `not_enough_data` at the deadline, what should the GTM engineer write in their report?
<details>
<summary>Reveal Answer</summary>
They should honestly report that the sample size was insufficient to draw a statistically valid conclusion, present the observed numbers transparently with confidence intervals, and recommend either extending data collection or stopping.
</details>

### 42. How does the Playbook collection build institutional memory?
<details>
<summary>Reveal Answer</summary>
Every completed experiment is sealed with its hypothesis, final numbers, lesson, and next step. This prevents future team members from re-running failed angles and provides a playbook of validated messaging that works.
</details>
