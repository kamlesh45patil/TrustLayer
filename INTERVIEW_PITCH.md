# 🎯 Razorpay Interview Pitch & Strategy Guide

This guide gives you the exact narrative, system design talking points, and demo script to turn **TrustLayer** into an interview offer from **Razorpay**.

---

## 1. The 60-Second Elevator Pitch

> *"When a merchant on Razorpay sees a transaction flagged with 'Risk Score: 78/100', their ops team faces an impossible choice: blindly cancel the order and lose genuine GMV, or fulfill it and risk an expensive chargeback or RTO loss. Black-box risk scores hurt merchants."*
>
> *"I built **TrustLayer** to solve this: **Not just a risk score — a reason**. TrustLayer combines a sub-15ms deterministic scoring engine with Explainable AI (XAI) to produce plain-English rationales, SHAP-style factor attributions, and ops playbooks for non-technical merchant teams."*
>
> *"It features a live Razorpay Checkout simulator, an interactive Fraud Ring collusion visualizer (similar to Razorpay Thirdwatch's graph intelligence), and an embedded Risk CoPilot. It connects to Razorpay webhooks via HMAC-SHA256 signature verification."*

---

## 2. Why This Catches Razorpay's Attention

1. **Direct Domain Alignment (Razorpay Thirdwatch & Magic Checkout)**:
   - Razorpay acquired Thirdwatch specifically to solve e-commerce fraud and Return-to-Origin (RTO) loss in India.
   - You are showing that you already understand RTO fraud, bot card testing, COD abuse, and device fingerprint clustering.
2. **FinTech Pragmatism (Explainable AI > Black Boxes)**:
   - FinTech regulations and merchant trust require **explainability**.
   - Your system separates the **score computation** (deterministic, auditable, mathematical) from the **explanation generation** (LLM/NLP). This preempts the #1 objection interviewers have about AI in banking: *"Can you audit the score?"*
3. **High System Design Maturity**:
   - Sub-50ms latency design.
   - Asynchronous AI inference so payment checkout never blocks.
   - Webhook signature security (`X-Razorpay-Signature` HMAC-SHA256).
   - Immutable audit logs for dispute compliance.

---

## 3. The 3-Minute Live Interview Demo Script

Follow these steps when sharing your screen:

### Step 1: The Merchant Dashboard (0:00 - 0:45)
- Open `http://localhost:3000`.
- Point out the metrics bar: Flagged High Risk %, Pending Ops Review, GMV Screened (₹), and False Positive Rate (1.4%).
- Explain: *"This is the merchant operations view for an Indian e-commerce brand processing UPI, Cards, and COD."*

### Step 2: Triggering the Suspicious Attack Burst (0:45 - 1:30)
- Click the **"Trigger Suspicious Burst"** button in the top right.
- Watch 3 high-risk transactions stream in instantly and select the top one.
- Show the right drawer sliding in:
  - *"Notice the score is 99/100, but more importantly, look at the AI Rationale."*
  - Read the rationale aloud: *"Driven primarily by velocity surge of 8 txns/hr combined with anonymized VPN proxy routing and a severe billing vs shipping geography anomaly."*
  - Show the **SHAP-style Feature Risk Contributions** (+35 pts for Velocity, +30 pts for VPN, +15 pts for Geo mismatch).

### Step 3: Interactive Risk CoPilot (1:30 - 2:00)
- Click the **"Ask Risk CoPilot"** tab inside the drawer.
- Click: *"Should our team dispatch this package?"*
- Show the CoPilot respond with grounded, specific advice referencing the customer's phone number and geography.

### Step 4: The Fraud Ring Graph (2:00 - 2:30)
- Click **"Fraud Ring Graph"** in the top navigation.
- Explain: *"In India, carders don't attack from a single account. They spin up 10 burner accounts using different names and phone numbers, but share hardware emulators and Tor exit nodes. TrustLayer maps these entities into a connected graph and lets ops blacklist the entire syndicate with one click."*

### Step 5: Razorpay Checkout Simulator (2:30 - 3:00)
- Click **"Razorpay Checkout"**.
- Toggle between **"Legit Customer"** and **"COD RTO Abuse"** or **"Velocity Surge"**.
- Click **"Simulate Payment"** and show the instantaneous interception banner.

---

## 4. Tough Questions Interviewers Will Ask & How to Answer

### Q1: *"Why not let an LLM calculate the risk score directly?"*
> **Answer**: *"In payments and fintech, safety, auditability, and latency are non-negotiable. An LLM calculating numbers directly is non-deterministic, prone to hallucination, and incurs 800ms+ latency. In TrustLayer, the score is 100% deterministic and auditable, computed in under 10ms. We use LLMs for what they excel at: synthesizing complex multi-dimensional feature vectors into clear, human-readable prose for ops teams."*

### Q2: *"How does this scale to Razorpay's peak throughput (e.g. Big Billion Days / Diwali sales)?"*
> **Answer**: *"We decouple scoring from explanation. The deterministic rule engine evaluates in-memory in <15ms directly inside the payment authorization path. The AI rationale and graph enrichment are offloaded asynchronously via message queues (e.g., Kafka / BullMQ) so payment completion is never delayed. Rationales are cached by transaction ID."*

### Q3: *"How do you handle False Positives where genuine VIP customers travel and get flagged?"*
> **Answer**: *"TrustLayer incorporates KYC status and long-term user baselines. If a customer has a recognized trusted hardware token, KYC verification, and 20+ successful lifetime transactions, the engine applies trust discounts (-20 pts). Furthermore, instead of a binary block, TrustLayer recommends a '3DS Step-Up Challenge'—allowing genuine users to authenticate without cart abandonment."*

---

## 5. LinkedIn / Recruiter Outreach Message Template

**Subject**: Built TrustLayer: Explainable AI Risk Engine inspired by Razorpay Thirdwatch

> Hi [Recruiter/Hiring Manager Name],
>
> I’ve been following Razorpay’s engineering work on **Razorpay Thirdwatch** and **Magic Checkout**.
>
> One of the biggest challenges for merchants is that raw risk scores ("Score: 78/100") are black boxes—forcing ops teams to manually dig through logs or wrongly decline good customers.
>
> To tackle this, I built **TrustLayer**: an Explainable AI (XAI) risk engine that provides:
> 1. Sub-15ms deterministic risk scoring across velocity, device tokens, and RTO signals.
> 2. Grounded plain-English rationales and SHAP-style factor attributions for merchant ops.
> 3. An interactive Fraud Ring collusion visualizer for multi-account syndicates.
> 4. An embedded Razorpay Checkout sandbox and webhook pipeline with HMAC-SHA256 verification.
>
> Live repo & demo: [GitHub Link]
>
> I would love the opportunity to interview for a Software Engineer role on the Risk / Platform / Payments team at Razorpay.
>
> Best regards,  
> [Your Name]
