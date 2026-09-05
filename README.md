# TrustLayer 🛡️ — AI Risk & Decisioning Engine (Razorpay Edition)

> **"Not just a risk score — a reason."**  
> An explainable AI transaction risk-scoring layer & fraud intelligence command center built for Razorpay merchants, inspired by **Razorpay Thirdwatch** & **Razorpay Magic Checkout**.

---

## 🚀 Live Demo Walkthrough (What Interviewers See in 3 Minutes)

1. **Merchant Command Center (`/`)**: Real-time transaction feed featuring Indian payment modalities (UPI VPAs `@okaxis`, RuPay/Visa/Mastercard, NetBanking, COD).
2. **Deterministic Risk Scoring Core**: Every transaction is evaluated deterministically (0–100) based on velocity, ticket deviation Z-scores, device trust, VPN/proxy detection, and RTO history.
3. **Neuro-Symbolic Explainable AI (XAI)**:
   - Instant 2–3 sentence plain-English rationale for non-technical merchant ops teams.
   - SHAP-style factor attribution bars showing exact points contributed by each feature.
4. **Interactive Razorpay Checkout Sandbox**: Embedded checkout modal mimicking `checkout.razorpay.com`. Test 4 live presets:
   - ⚡ **Legitimate Customer**: Verified KYC, trusted hardware token, low-risk auto-approval.
   - 🚨 **Botnet Velocity Surge**: 8 cycling transactions/hr on cloned emulator.
   - 🕵️ **Account Takeover & Geo Mismatch**: Foreign Tor/VPN proxy with 4x average ticket size.
   - 📦 **COD RTO Exploit**: Cash-on-Delivery with chronic return dispute history.
5. **Interactive Risk CoPilot**: An embedded AI analyst in the drawer. Ops teams can ask: *"Should we ship this?"* or *"Does this customer have chargeback history?"* and get instant grounded answers.
6. **Syndicate / Fraud Ring Visualizer**: Interactive network graph uncovering multi-account collusion sharing device fingerprints, Tor exit nodes, and UPI handles.
7. **Policy Simulator**: Backtest threshold tweaks (e.g. adjust high-risk cutoff from 70 to 65) to evaluate GMV protected vs. False Positive Rate (FPR).

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RAZORPAY CHECKOUT / API                         │
│   (Simulated Checkout Modal / Live Webhook Ingestion with HMAC SHA256) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              HYBRID RISK ENGINE (Deterministic + AI)                   │
│  ┌───────────────────────────────┐  ┌────────────────────────────────┐ │
│  │    Deterministic Rule Core    │  │   Explainable AI Engine (LLM)  │ │
│  │ • Velocity (txns/hr)          │  │ • Plain-English Rationale      │ │
│  │ • Amount Deviation & Z-score  │  │ • SHAP-style Factor Breakdown  │ │
│  │ • Device Fingerprint & Trust  │  │ • Recommended Playbook         │ │
│  │ • Geo/IP Anomaly (Tier-3 / VPN│  │ • Fallback Heuristic Engine    │ │
│  │ • RTO & Refund History Score  │  │   (Works with/without API key) │ │
│  └───────────────┬───────────────┘  └────────────────┬───────────────┘ │
│                  └────────────────┬──────────────────┘                 │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            TRUSTLAYER MERCHANT RISK COMMAND CENTER (Next.js)           │
│  ┌───────────────────────────────┐  ┌────────────────────────────────┐ │
│  │ Live Realtime Risk Feed       │  │ Transaction Detail & Audit     │ │
│  │ • Low / Med / High Badges     │  │ • Factor Attribution Bars      │ │
│  │ • Live Ticker & Quick Filters │  │ • Approve / Hold / Block / 3DS │ │
│  ├───────────────────────────────┤  ├────────────────────────────────┤ │
│  │ Fraud Ring / Collusion Graph  │  │ Interactive Risk CoPilot       │ │
│  │ • Shared IP / Device / UPI    │  │ • Conversational Query Agent   │ │
│  │ • Sybil / Ring Detection      │  │ • "Why was this order held?"   │ │
│  ├───────────────────────────────┤  ├────────────────────────────────┤ │
│  │ What-If Rule Simulator        │  │ Razorpay Webhook Inspector     │ │
│  │ • Backtest threshold changes  │  │ • Event replay & signature log │ │
│  └───────────────────────────────┘  └────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
# Optional: Add keys for live Claude / Gemini inference.
# If omitted, TrustLayer automatically runs its high-fidelity deterministic XAI engine.
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | Fetch all transactions, summary statistics, and GMV counters. |
| `POST` | `/api/transactions/score` | Ingest transaction, run deterministic scoring + AI rationale. |
| `POST` | `/api/transactions/[id]/action` | Record merchant override (`approved`, `held`, `blocked`, `challenged_3ds`). |
| `POST` | `/api/copilot` | Conversational risk analyst answering natural language inquiries. |
| `POST` | `/api/webhook/razorpay` | Razorpay webhook receiver with HMAC-SHA256 signature verification. |
| `POST` | `/api/simulate-burst` | Injects a live attack burst for judge demonstrations. |

---

## 💡 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Banking ops aesthetic: slate neutrals, emerald/amber/rose risk tokens, Razorpay blue)
- **Icons**: Lucide React
- **AI / Explainability**: Claude 3.5 Sonnet / Gemini 1.5 Flash + Hybrid Neuro-Symbolic XAI Fallback
