# TrustLayer — Frontend Guidelines

## Design Intent
This is a risk/trust tool — it should feel calm, precise, and authoritative, not flashy. Think "banking ops dashboard," not "consumer app." Judges should immediately read it as something a real merchant would trust in production.

## Color System (Tailwind)
- **Base:** neutral grays for structure — `bg-slate-50` (page background), `bg-white` (cards), `text-slate-900` (primary text), `text-slate-500` (secondary text).
- **Risk severity (the only place color should carry meaning):**
  - Low risk (0–39): `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Medium risk (40–69): `bg-amber-50 text-amber-700 border-amber-200`
  - High risk (70–100): `bg-rose-50 text-rose-700 border-rose-200`
- Never use red/green/amber for anything other than risk severity — keep the color language singular and legible at a glance.
- Accent color (buttons, links, active states): a single deliberate accent — `indigo-600` works well against the neutral base and reads as "trustworthy fintech" rather than default blue.

## Typography
- Use a clean system sans (Tailwind default `font-sans` / Inter) — no decorative fonts. This is a data-density tool; legibility beats personality.
- Numbers (scores, amounts) should be visually distinct: `font-mono` or `tabular-nums` for the risk score and transaction amounts so they align in the table and feel precise.
- Rationale text: normal prose weight, `text-sm text-slate-700`, generous line-height (`leading-relaxed`) — it's the one place users actually read sentences, so don't cramp it.

## Layout
- Dashboard: single-column table on desktop, full-width, sticky header row.
- Detail drawer: slides from the right, ~420px wide on desktop, full-screen on mobile — don't build a separate mobile layout from scratch, just let the drawer become the full view.
- Consistent spacing scale: stick to Tailwind's default spacing tokens (4, 6, 8, 12, 16) — don't invent custom pixel values.

## Components
- **Risk badge:** small pill, colored per severity system above, always paired with the numeric score (e.g., "78 · High") — never color alone, since color-blind judges/users must still read severity.
- **Table rows:** hover state `hover:bg-slate-50`, clickable entire row (not just a "view" button) — reduces friction during a live demo.
- **Rationale card:** framed with a subtle left border in the severity color (`border-l-4`) so it visually reinforces the score without repeating the badge.
- **Action buttons:** Approve = neutral/outline, Hold = amber outline, Block = solid rose — button color should also map to the same severity language, not arbitrary brand colors.

## Motion
- Keep animations minimal and fast (150–200ms) — a drawer slide-in, a row highlight flash when a new transaction arrives via realtime. Avoid anything bouncy or playful; this undercuts the "serious risk tool" impression.

## What to avoid
- No gradients, no glassmorphism, no illustrations/mascots — this is not a consumer landing page.
- Don't over-decorate the rationale text with icons per sentence — let the AI-generated explanation read as calm, confident prose.
- Don't show raw JSON or feature-vector variable names to the end user (e.g., never display `geo_mismatch: true` directly — always render it as "Billing and shipping addresses don't match").
