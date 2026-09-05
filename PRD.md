# TrustLayer — Product Requirements Document

**Track:** AI Risk Manager (Razorpay Buildathon)
**Tagline:** Not just a risk score — a reason.

---

## 1. Problem Statement

Merchants using payment gateways get binary or numeric fraud/risk signals ("risk score: 78/100") with no explanation of *why* a transaction was flagged. This forces:
- Non-technical merchant ops teams to either blindly trust/block, or blindly ignore the score.
- Slow manual review of edge cases, since analysts must re-derive the "why" from raw logs themselves.
- Poor false-positive handling — good customers get blocked with no recourse or clarity.

Existing rule engines are static, don't adapt, and produce no human-readable rationale.

## 2. Solution

TrustLayer is an AI-powered transaction risk-scoring layer that:
1. Ingests a transaction + its context (velocity, device/IP signals, refund history, order metadata).
2. Computes a composite risk score (rule-based + heuristic weighting).
3. Uses an LLM (Claude API) to generate a **plain-English rationale** for the score — what specifically drove it, in the language a merchant ops person (not a data scientist) can act on.
4. Surfaces this in a merchant-facing dashboard with clear actions: Approve / Hold / Block / Request additional verification.

## 3. Target User

- Primary: Merchant risk/ops teams (SMB to mid-market) using Razorpay who currently review flagged transactions manually.
- Secondary: Razorpay's own trust & safety team, as an augmentation layer over existing rule engines.

## 4. Core Features (MVP for Hackathon Demo)

### F1 — Transaction Risk Scoring Engine
- Rule-based feature extraction: transaction velocity (txns/hour from same user/device/IP), amount deviation from user's historical average, refund/chargeback history, new-device flag, mismatched billing/shipping geography.
- Weighted composite score (0–100) computed server-side.

### F2 — AI Rationale Generator
- Given the feature vector + score, Claude API generates a 2–4 sentence rationale in plain English.
- Example output: *"Flagged primarily due to 4x normal transaction velocity in the past hour combined with a first-time device. Amount is within normal range, which lowers overall severity."*
- Rationale must reference the actual top 2–3 contributing factors, not generic boilerplate — done via structured prompt with the feature vector injected.

### F3 — Merchant Risk Dashboard
- List view of transactions sorted by risk score, with color-coded severity (green/amber/red).
- Detail drawer per transaction: score, rationale, contributing feature breakdown, recommended action.
- Manual override: merchant can approve/block, which is logged for future model tuning (post-MVP: feedback loop).

### F4 — Simulated Live Feed (Demo Mode)
- Since real Razorpay production data isn't available in a hackathon sandbox, seed a realistic simulated transaction stream (varying velocity, device, geography patterns) to demonstrate the system live.
- A "replay" button to trigger a burst of suspicious transactions on demand for judges.

## 5. Out of Scope (for hackathon MVP)

- Real Razorpay API integration (use Razorpay test-mode APIs or mocked payloads if time allows — stretch goal).
- Model retraining / ML pipeline (use heuristic scoring, not trained classifier, for MVP).
- Multi-tenant merchant accounts / auth beyond a single demo login.
- Automated blocking at the payment gateway level (dashboard only surfaces recommendation).

## 6. Success Metrics (for demo/judging)

- Judges can see: transaction in → score computed → rationale generated → action recommended, all in under 2 seconds end-to-end.
- Rationale text is clearly tied to real feature values shown on screen (no hallucinated reasoning).
- At least 3 distinct risk patterns demonstrable live (velocity abuse, new-device + high-value, geo-mismatch).

## 7. Stretch Goals (if time permits)

- Feedback loop: merchant overrides adjust feature weights over time (simple online learning).
- Collusion detection: graph view of linked accounts (shared device/IP) attempting refund abuse.
- WhatsApp/Slack alert integration for high-risk transactions.
- Actual Razorpay Payment Links test-mode integration for a live, non-simulated transaction.
