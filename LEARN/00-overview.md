# LEARN 00: Overview of Positioning Lab

> **Purpose:** A plain-language guide for the applicant to master and explain Positioning Lab without looking at notes during technical and GTM interviews.

---

## 1. Positioning Lab in 60 Seconds (The Elevator Pitch)

"Most GTM tools focus on generating copy fast with AI. But in developer marketing, generating copy is cheap and easy—the hard part is deciding what actually matters, keeping technical claims 100% accurate, running real experiments, and learning honestly from results.

**Positioning Lab** is a full-stack experimentation system built on the DeepSpace platform (Cloudflare Workers, Durable Objects, and AI proxy). An admin pre-registers a positioning hypothesis and an explicit decision rule before launch. AI drafts message variants, which are automatically fact-checked by our **Claim Guard** engine against verified DeepSpace documentation before anything can be published. 

Public visitors receive deterministic variant assignments via a stable hash. Real actions—specifically clicking to copy the CLI command `npx deepspace`—are recorded as high-intent conversion proxies. The dashboard updates live via Durable Object sync, displaying 95% Wilson confidence intervals and enforcing a strict **status gate** (`Not enough data`, `Directional`, or `Evidence favors X`). When an AI readout is generated, code enforces that the AI cannot declare a winner if the sample size is insufficient. Finally, the team records a logged decision, converting test results into an enduring playbook."

---

## 2. Positioning Lab in 5 Minutes (The Core Architecture & Principles)

### Why Build This Instead of a Generic App?
1. **Directly addresses the role:** The job is an AI-Native GTM Engineer. The job description highlights: *designing and running experiments*, *turning developer insights into clear positioning*, *keeping technical claims accurate with engineering*, *measuring attention → visits → signups → activation*, and *distinguishing evidence from assumptions*.
2. **Honesty over drama:** Real-world traffic for early tests is small. A tool that prematurely crowns a winner because 3 out of 5 people clicked is dangerous. Positioning Lab refuses to claim a winner unless the 95% Wilson score confidence intervals cleanly separate after meeting the minimum sample size threshold.
3. **AI proposes, Human decides, Code verifies:**
   - **AI proposes:** Generates message angles and extracts claims.
   - **Human decides:** Approves variants, launches the test, and makes the final expand/change/stop call.
   - **Code verifies:** Claim Guard validates statements against verified facts; the status gate rejects invalid readout conclusions.

### The Request Lifecycle
1. **Creation:** Admin writes an experiment with a target segment, hypothesis, minimum sample per variant (e.g., 50), and a pre-registered decision rule.
2. **Drafting & Claim Guard:** Claude drafts 3 variants. Claim Guard checks every extracted claim against `facts` verified directly from `docs.deep.space`. If any claim is unverified, the variant is flagged and cannot be published until fixed.
3. **Launch & Lock:** Once launched, the hypothesis, metric, and decision rule are immutable (or changes are logged in an audit trail).
4. **Public Visitor Flow:** A visitor opens `/t/<slug>?src=linkedin`. The browser generates an anonymous UUID (no IP, no fingerprinting). A deterministic hash (`FNV-1a(experimentId + visitorId) % variantCount`) assigns the variant.
5. **Event Recording:** When the visitor clicks "Copy Command", a validated server action deduplicates the event and commits it to the SQLite-backed `RecordRoom`.
6. **Realtime Dashboard:** Subscribed admins see the live counter update instantly over WebSockets.
7. **Readout & Playbook:** The admin requests a readout. The server pre-computes Wilson intervals and the status gate, passes them to the AI, and validates with Zod that all output statements are tagged `Evidence` or `Assumption`.

---

## 3. Positioning Lab in 15 Minutes (Deep Dive & Walkthrough)

### Mathematical Integrity: The Wilson Score Interval
Standard normal approximation intervals ($\hat{p} \pm 1.96 \sqrt{\hat{p}(1-\hat{p})/n}$) fail dramatically when $n$ is small or $\hat{p}$ is near 0 or 1. Positioning Lab uses the Wilson score interval:

$$\text{center} = \frac{\hat{p} + \frac{z^2}{2n}}{1 + \frac{z^2}{n}}, \quad \text{margin} = \frac{z \sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}$$

With $z = 1.96$ for a 95% confidence level.

### Three-State Status Gate
1. **Not Enough Data:** If any variant has $n < \text{minSamplePerVariant}$, the status gate forbids declaring any winner. The only valid recommendation is `collect_more`.
2. **Directional:** Both variants exceed minimum $n$, but their 95% confidence intervals overlap. The leader is marked as "directionally ahead" only.
3. **Evidence Favors X:** Both variants exceed minimum $n$, and the lower bound of the leading variant's Wilson interval is strictly greater than the upper bound of the runner-up's interval.
