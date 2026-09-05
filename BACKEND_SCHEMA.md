# TrustLayer — Backend Schema (Supabase / Postgres)

## Tables

### `users` (simulated merchant customers)
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  home_geo text, -- e.g. 'Pune, IN' - used to detect geo mismatch
  avg_transaction_amount numeric default 0,
  avg_txn_velocity numeric default 0, -- avg txns/hour, baseline
  refund_count_90d int default 0
);
```

### `devices`
```sql
create table devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  device_fingerprint text not null,
  first_seen_at timestamptz default now(),
  is_trusted boolean default false
);
```

### `transactions`
```sql
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  device_id uuid references devices(id),
  amount numeric not null,
  currency text default 'INR',
  billing_geo text,
  shipping_geo text,
  ip_address text,
  created_at timestamptz default now(),

  -- computed by scoring engine
  risk_score int, -- 0-100
  risk_severity text, -- 'low' | 'medium' | 'high'
  feature_vector jsonb, -- { velocity, amount_deviation, new_device, geo_mismatch, refund_score }

  -- AI-generated
  rationale text,
  top_factors text[], -- e.g. ['high velocity', 'first-time device']

  -- merchant action
  status text default 'pending', -- 'pending' | 'approved' | 'held' | 'blocked'
  actioned_at timestamptz,
  actioned_by text -- demo user identifier
);

create index idx_transactions_score on transactions (risk_score desc);
create index idx_transactions_user on transactions (user_id);
```

### `transaction_actions` (audit log, feeds future feedback loop)
```sql
create table transaction_actions (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  action text not null, -- 'approved' | 'held' | 'blocked'
  actioned_at timestamptz default now(),
  notes text
);
```

## Feature Vector Shape (stored in `transactions.feature_vector`)
```json
{
  "velocity": 4,
  "velocity_baseline": 0.5,
  "amount": 4500,
  "amount_baseline": 1200,
  "amount_deviation_pct": 275,
  "new_device": true,
  "geo_mismatch": false,
  "refund_count_90d": 2
}
```

## Realtime Configuration
- Enable Supabase Realtime on the `transactions` table (Postgres publication) so the dashboard subscribes to `INSERT` and `UPDATE` events without polling.
```sql
alter publication supabase_realtime add table transactions;
```

## Row-Level Security (Demo Simplification)
- For hackathon scope, RLS can be disabled or set to a permissive single-tenant policy — do not spend demo-prep time building multi-tenant auth.
```sql
alter table transactions enable row level security;
create policy "demo_open_access" on transactions
  for all using (true) with check (true);
```
(Note: this is intentionally permissive for demo purposes only — call this out as a known simplification if asked, not a production pattern.)

## Seed Script Considerations (`scripts/seed-transactions.ts`)
- Generate ~15–20 `users` with varied `avg_transaction_amount` and `avg_txn_velocity` baselines.
- Generate 1–2 `devices` per user, mostly `is_trusted = true`.
- Generate ~50 `transactions`:
  - ~80% "normal" — amounts/velocity close to baseline, trusted device, matching geo.
  - ~20% "planted suspicious" — deliberately spike velocity, use a new device, mismatch geo, or combine multiple factors — these are what the scoring engine should reliably flag high, and what you'll trigger live via the "suspicious burst" button.
