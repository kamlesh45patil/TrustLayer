# TrustLayer — Implementation Plan

Assumes a solo build under hackathon time pressure. Ordered so that a demoable version exists as early as possible, with polish layered on after.

## Phase 0 — Setup (30–45 min)
1. `npx create-next-app@latest trustlayer --typescript --tailwind --app`
2. Create Supabase project, grab URL + keys, add to `.env.local`.
3. Install deps: `@supabase/supabase-js`, `@anthropic-ai/sdk`, `recharts`, `zod` (for feature-vector validation), optionally `@google/generative-ai` for Gemini fallback.
4. Set up Supabase tables per `BACKEND_SCHEMA.md`.

## Phase 1 — Core Data Layer (45–60 min)
1. Write `scripts/seed-transactions.ts` — generates ~50 synthetic transactions with realistic distributions, and a controllable set of "planted" suspicious patterns (velocity spike, new device + high value, geo mismatch).
2. Insert seed data into Supabase `transactions` table.
3. Build a small Node module `lib/scoring.ts`:
   - Input: raw transaction + user's recent history (last N transactions).
   - Output: feature vector (velocity, amount_deviation, new_device flag, geo_mismatch flag, refund_history_score) + composite score 0–100.
   - Pure function, unit-testable, no external calls — this is your deterministic scoring core.

## Phase 2 — AI Rationale Generation (45 min)
1. Build `lib/rationale.ts` — takes the feature vector + score, constructs a structured prompt for Claude, requests JSON output: `{ rationale: string, top_factors: string[] }`.
2. Prompt must explicitly inject the actual numeric feature values so the rationale is grounded, not generic. Example prompt skeleton:
   ```
   You are a payments risk analyst. Given this transaction's risk features,
   write a 2-4 sentence plain-English explanation of the risk score for a
   non-technical merchant ops user. Reference only the factors given below.

   Score: {score}/100
   Velocity: {velocity} txns in past hour (user avg: {avg_velocity})
   Amount: ₹{amount} (user avg: ₹{avg_amount})
   Device: {new_device ? "first-time device" : "recognized device"}
   Geo match: {geo_mismatch ? "billing/shipping mismatch" : "match"}
   Refund history: {refund_count} refunds in past 90 days

   Respond ONLY as JSON: {"rationale": "...", "top_factors": ["...", "..."]}
   ```
3. Cache rationale per transaction in the DB (don't regenerate on every dashboard load).

## Phase 3 — API Routes (30–45 min)
1. `POST /api/transactions/score` — accepts a transaction, runs scoring + rationale, writes result to DB. Used by seed script and by the "replay suspicious burst" demo button.
2. `GET /api/transactions` — returns transactions sorted by score/time for the dashboard.
3. `POST /api/transactions/:id/action` — records merchant override (approve/hold/block).

## Phase 4 — Frontend Dashboard (60–90 min)
1. Transaction list page (`/app/dashboard/page.tsx`): server component fetches transactions, renders table with color-coded risk badges.
2. Transaction detail drawer (client component): shows score, rationale, feature breakdown chart, action buttons.
3. Supabase realtime subscription: new transactions appear live without refresh.
4. "Trigger suspicious burst" button: calls a seeded batch of high-risk transactions through `/api/transactions/score` for the live demo moment.

## Phase 5 — Polish for Demo (30–45 min)
1. Add a summary header: total flagged today, avg score, high-risk count — makes the dashboard look production-ready at a glance.
2. Tighten copy on rationale display — no raw JSON visible, clean typography (see FRONTEND_GUIDELINES.md).
3. Rehearse the demo script: seed → normal traffic → trigger burst → click into 2–3 flagged transactions → show rationale → override action.

## Phase 6 — Stretch (only if ahead of schedule)
1. Simple feedback loop: adjust feature weights slightly based on override history.
2. Collusion view: query transactions sharing device/IP fingerprints, render as a simple linked list/graph.
3. Real Razorpay test-mode Payment Link creation to generate one genuinely real transaction live during the demo.

## Suggested Time Budget (for a ~8–10 hr hackathon day)
- Phase 0–1: 1.5 hrs
- Phase 2: 45 min
- Phase 3: 45 min
- Phase 4: 1.5 hrs
- Phase 5: 45 min
- Buffer / debugging: 2+ hrs
- Stretch: remaining time
