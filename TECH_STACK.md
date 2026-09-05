# TrustLayer — Tech Stack

## Frontend
- **Next.js (App Router)** — single deployable app, server components for dashboard data fetching, client components for interactive drawer/live feed.
- **Tailwind CSS** — utility-first styling, fast to theme for a "trust/risk" dashboard aesthetic (see FRONTEND_GUIDELINES.md).
- **shadcn/ui** (optional, if time allows) — for table, drawer, badge components; otherwise hand-roll with Tailwind to save setup time.
- **Recharts** — for the risk-score distribution chart / velocity timeline on transaction detail view.

## Backend
- **Next.js API routes** (`/app/api/*`) — no separate backend service needed; keeps the whole app in one repo, fastest to ship for a hackathon.
- **Supabase** — Postgres database + realtime subscriptions.
  - Realtime channel used to push new simulated transactions to the dashboard live (powers the "live feed" demo feature).
  - Row-level security disabled/simplified for demo (single demo tenant).

## AI / Scoring Layer
- **Claude API (Sonnet)** — generates the plain-English rationale from a structured feature vector. Called server-side from the API route that processes each transaction, never from the client.
- **Rule-based scoring engine** — plain TypeScript/Node module, no external ML service. Computes the 0–100 composite score from extracted features before calling Claude for the rationale. This keeps scoring deterministic and auditable (important for a "risk manager" pitch — judges will ask "is the score itself AI-generated or explainable/deterministic?" — answer: deterministic score, AI-generated explanation).
- **Gemini Flash** (optional fallback) — cheap/fast secondary model if you want an A/B or a backup path in case of Claude API rate limits during live demo.

## Data Simulation
- Simple Node script (`/scripts/seed-transactions.ts`) that generates synthetic transaction events with controllable "suspicious pattern" injection (velocity spike, new device, geo mismatch) — used to drive the live demo reliably instead of depending on real traffic.

## Hosting / Deployment
- **Vercel** — deploys Next.js app directly, zero-config for API routes + static frontend.
- **Supabase Cloud** (free tier) — hosted Postgres + realtime, no local DB setup needed on demo day.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY= (optional fallback)
```

## Why this stack
- Matches your existing familiar tooling (Next.js/Tailwind/Supabase/Claude+Gemini) — no new tools to learn under time pressure.
- Everything ships as one repo, one Vercel deploy — minimizes demo-day infra risk.
- Deterministic scoring + AI rationale (rather than an opaque end-to-end ML model) is easier to explain convincingly to judges in a 3-minute pitch.
