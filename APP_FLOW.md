# TrustLayer — App Flow

## 1. High-Level Flow

```
Transaction event (real or simulated)
        │
        ▼
Feature extraction (velocity, amount deviation, device, geo, refund history)
        │
        ▼
Deterministic scoring engine → composite score (0–100)
        │
        ▼
Claude API → plain-English rationale + top contributing factors
        │
        ▼
Write scored transaction + rationale to Supabase
        │
        ▼
Realtime push → Merchant Dashboard updates live
        │
        ▼
Merchant views score + rationale → takes action (Approve / Hold / Block)
        │
        ▼
Action logged (feeds future feedback loop, stretch goal)
```

## 2. Screen-by-Screen Flow

### Screen 1 — Dashboard (Transaction List)
- Entry point. Shows a live table of transactions, most recent or highest-risk first (toggle).
- Each row: transaction ID, amount, timestamp, risk badge (green <40, amber 40–70, red >70), one-line rationale preview.
- Top summary bar: "Flagged today: 12 | Avg score: 34 | High-risk: 3".
- "Trigger suspicious burst" button (demo-only) — fires 5 planted high-risk transactions through the pipeline for a live judge-facing moment.

### Screen 2 — Transaction Detail (Drawer/Modal)
- Opens on row click, slides in from the right.
- Top: score as a large number with color, and the recommended action.
- Middle: full rationale text from Claude, formatted as readable prose (not JSON).
- Feature breakdown: small bar/list showing each contributing factor and its value vs. the user's historical baseline (e.g., "Velocity: 4 txns/hr vs avg 0.5/hr").
- Bottom: action buttons — Approve, Hold for Review, Block. Selecting one writes to `transaction_actions` and updates the row's status.

### Screen 3 — (Stretch) Collusion View
- Accessible from a flagged transaction if it shares a device/IP with other accounts.
- Simple node list: "3 other accounts share this device fingerprint" with links to their transaction histories.

## 3. Data Flow Detail (per transaction)

1. Transaction arrives (seed script or simulated live feed) with: `user_id, amount, device_id, ip, billing_geo, shipping_geo, timestamp`.
2. Backend fetches that user's recent history (last 20 transactions, last 90 days refund count) from Supabase.
3. `lib/scoring.ts` computes feature vector + composite score.
4. `lib/rationale.ts` sends feature vector to Claude API, receives structured JSON rationale.
5. Full record (transaction + features + score + rationale) is upserted into `transactions` table.
6. Supabase realtime broadcasts the insert/update to subscribed dashboard clients.
7. Dashboard re-renders the affected row with new score/badge without a page reload.

## 4. Demo Narrative (for judges)

1. Open dashboard — normal, mostly-green transaction feed running live.
2. Click "Trigger suspicious burst" — a few red-flagged transactions appear within seconds.
3. Click into one — show the rationale: *"Flagged due to 4x normal velocity and a first-time device, despite a normal-range amount."*
4. Point out: score is deterministic and auditable (rule-based), only the *explanation* is AI-generated — addresses the "can we trust an AI risk score" objection preemptively.
5. Take an action (Block) — show it logged, ready to feed a future feedback loop.
