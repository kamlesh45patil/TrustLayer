// TrustLayer Core Type Definitions
// Tailored for Razorpay Payment Gateway & Thirdwatch Risk Architecture

export type RiskSeverity = 'low' | 'medium' | 'high';
export type TransactionStatus = 'approved' | 'held' | 'blocked' | 'challenged_3ds' | 'pending';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'wallet';

export interface UserBaseline {
  id: string;
  name: string;
  email: string;
  phone: string;
  home_geo: string; // e.g. "Bengaluru, KA"
  avg_transaction_amount: number; // in INR
  avg_txn_velocity: number; // txns per hour baseline
  refund_count_90d: number;
  total_successful_txns: number;
  account_created_at: string;
  is_verified_kyc: boolean;
}

export interface DeviceInfo {
  id: string;
  fingerprint: string;
  browser: string;
  os: string;
  ip_address: string;
  ip_reputation_score: number; // 0-100 (high = proxy/tor/bot)
  is_vpn_detected: boolean;
  first_seen_at: string;
  is_trusted: boolean;
  linked_user_ids: string[]; // Used for collusion/fraud-ring detection
}

export interface FeatureContribution {
  feature: string;
  label: string;
  value: string | number;
  baseline: string | number;
  risk_contribution: number; // 0-100 impact
  direction: 'elevates_risk' | 'lowers_risk' | 'neutral';
  explanation: string;
}

export interface FeatureVector {
  velocity_1h: number;
  velocity_baseline: number;
  velocity_ratio: number;
  amount: number;
  amount_baseline: number;
  amount_deviation_pct: number;
  amount_z_score: number;
  new_device: boolean;
  device_trust_score: number; // 0-100
  is_vpn_or_proxy: boolean;
  geo_mismatch: boolean;
  billing_geo: string;
  shipping_geo: string;
  distance_km?: number;
  refund_count_90d: number;
  rto_risk_score: number; // Return-To-Origin risk (Thirdwatch concept)
  payment_method_risk: number;
  night_time_order: boolean; // 1 AM - 5 AM spike
}

export interface Transaction {
  id: string; // e.g. "txn_rzp_9941a8f"
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  user_id: string;
  user: UserBaseline;
  device_id: string;
  device: DeviceInfo;
  amount: number;
  currency: 'INR' | 'USD';
  payment_method: PaymentMethod;
  payment_method_detail: string; // e.g., "HDFC Visa •••• 4021", "rahul@okaxis"
  billing_geo: string;
  shipping_geo: string;
  ip_address: string;
  created_at: string;

  // AI & Scoring Engine
  risk_score: number; // 0 - 100
  risk_severity: RiskSeverity;
  feature_vector: FeatureVector;
  feature_contributions: FeatureContribution[];
  rationale: string;
  top_factors: string[];
  recommended_action: TransactionStatus;
  confidence_score: number; // 0.0 - 1.0

  // Decision & Audit
  status: TransactionStatus;
  actioned_at?: string;
  actioned_by?: string;
  action_note?: string;

  // Fraud Ring Linkage (if any)
  fraud_ring_id?: string;
  fraud_ring_name?: string;
  shared_entities_count?: number;
}

export interface AuditLogEntry {
  id: string;
  transaction_id: string;
  action: TransactionStatus;
  previous_status: TransactionStatus;
  timestamp: string;
  actor: string;
  rationale_summary: string;
  notes?: string;
}

export interface FraudRing {
  id: string;
  name: string;
  pattern: 'credential_stuffing' | 'rto_promo_abuse' | 'card_testing_botnet' | 'synthetic_identity';
  risk_level: RiskSeverity;
  total_gmv_at_risk: number;
  detected_at: string;
  entity_count: number;
  entities: {
    users: { id: string; name: string }[];
    devices: { fingerprint: string; os: string }[];
    ips: string[];
    upi_vpas?: string[];
  };
  transactions: string[]; // Transaction IDs
}

export interface RuleSimulationResult {
  rule_name: string;
  cutoff_score: number;
  total_transactions: number;
  flagged_count: number;
  approved_count: number;
  false_positive_estimate_pct: number;
  gmv_protected_inr: number;
  gmv_delayed_inr: number;
}

export interface WebhookEventPayload {
  entity: 'event';
  account_id: string;
  event: 'payment.authorized' | 'order.paid' | 'payment.failed' | 'risk.flagged';
  contains: ['payment', 'risk'];
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        email: string;
        contact: string;
      };
    };
    risk?: {
      score: number;
      severity: RiskSeverity;
      rationale: string;
      top_factors: string[];
    };
  };
  created_at: number;
  signature_hmac: string;
}
