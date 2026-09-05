// TrustLayer Deterministic Risk Scoring Engine
// Auditable, low-latency, rule-based feature computation

import {
  FeatureVector,
  FeatureContribution,
  RiskSeverity,
  TransactionStatus,
  UserBaseline,
  DeviceInfo,
  PaymentMethod
} from './types';

export interface ScoringInput {
  amount: number;
  payment_method: PaymentMethod;
  billing_geo: string;
  shipping_geo: string;
  user: UserBaseline;
  device: DeviceInfo;
  recent_txns_1h_count: number;
  is_night_time?: boolean;
}

export interface ScoringOutput {
  risk_score: number; // 0 - 100
  risk_severity: RiskSeverity;
  feature_vector: FeatureVector;
  feature_contributions: FeatureContribution[];
  recommended_action: TransactionStatus;
  confidence_score: number;
  top_factors: string[];
}

export function computeRiskScore(input: ScoringInput): ScoringOutput {
  const {
    amount,
    payment_method,
    billing_geo,
    shipping_geo,
    user,
    device,
    recent_txns_1h_count,
    is_night_time = false,
  } = input;

  // 1. Velocity Analysis
  const velocity_baseline = Math.max(user.avg_txn_velocity, 0.2);
  const velocity_ratio = Number((recent_txns_1h_count / velocity_baseline).toFixed(2));
  
  // 2. Amount Deviation & Z-Score proxy
  const amount_baseline = Math.max(user.avg_transaction_amount, 500);
  const amount_deviation_pct = Math.round(((amount - amount_baseline) / amount_baseline) * 100);
  const amount_z_score = Number(((amount - amount_baseline) / (amount_baseline * 0.5)).toFixed(2));

  // 3. Device & Network Signals
  const is_new_device = !device.is_trusted;
  const is_vpn_or_proxy = device.is_vpn_detected || device.ip_reputation_score > 60;
  const device_trust_score = device.is_trusted ? 90 : Math.max(10, 100 - device.ip_reputation_score);

  // 4. Geo Consistency
  const geo_mismatch = billing_geo.trim().toLowerCase() !== shipping_geo.trim().toLowerCase();

  // 5. RTO / Refund Risk (Razorpay Thirdwatch signature signal)
  let rto_risk_score = 15;
  if (user.refund_count_90d >= 3) rto_risk_score += 40;
  else if (user.refund_count_90d >= 1) rto_risk_score += 20;
  if (payment_method === 'cod') rto_risk_score += 25; // COD has higher RTO in Indian e-commerce

  // 6. Payment Method Risk
  let payment_method_risk = 10;
  if (payment_method === 'cod') payment_method_risk = 35;
  if (payment_method === 'card' && is_new_device && is_vpn_or_proxy) payment_method_risk = 50;

  const feature_vector: FeatureVector = {
    velocity_1h: recent_txns_1h_count,
    velocity_baseline,
    velocity_ratio,
    amount,
    amount_baseline,
    amount_deviation_pct,
    amount_z_score,
    new_device: is_new_device,
    device_trust_score,
    is_vpn_or_proxy,
    geo_mismatch,
    billing_geo,
    shipping_geo,
    refund_count_90d: user.refund_count_90d,
    rto_risk_score,
    payment_method_risk,
    night_time_order: is_night_time,
  };

  // Compute individual weighted factor contributions
  const contributions: FeatureContribution[] = [];

  // --- Factor 1: Velocity ---
  let velocity_points = 0;
  if (velocity_ratio >= 4) {
    velocity_points = 35;
    contributions.push({
      feature: 'velocity_spike',
      label: 'Transaction Velocity Surge',
      value: `${recent_txns_1h_count} txns / hr`,
      baseline: `${velocity_baseline} txns / hr`,
      risk_contribution: 35,
      direction: 'elevates_risk',
      explanation: `Transaction velocity is ${velocity_ratio}x higher than the user's historical 1-hour average.`,
    });
  } else if (velocity_ratio >= 2) {
    velocity_points = 18;
    contributions.push({
      feature: 'velocity_elevated',
      label: 'Elevated Velocity',
      value: `${recent_txns_1h_count} txns / hr`,
      baseline: `${velocity_baseline} txns / hr`,
      risk_contribution: 18,
      direction: 'elevates_risk',
      explanation: `Slight spike in hourly frequency (${velocity_ratio}x baseline).`,
    });
  } else {
    contributions.push({
      feature: 'velocity_normal',
      label: 'Normal Velocity',
      value: `${recent_txns_1h_count} txns / hr`,
      baseline: `${velocity_baseline} txns / hr`,
      risk_contribution: -10,
      direction: 'lowers_risk',
      explanation: `Transaction velocity matches expected user pattern.`,
    });
  }

  // --- Factor 2: Amount Deviation ---
  let amount_points = 0;
  if (amount_deviation_pct > 300) {
    amount_points = 30;
    contributions.push({
      feature: 'amount_anomaly',
      label: 'High Ticket Value Spike',
      value: `₹${amount.toLocaleString('en-IN')}`,
      baseline: `₹${amount_baseline.toLocaleString('en-IN')}`,
      risk_contribution: 30,
      direction: 'elevates_risk',
      explanation: `Order amount is ${amount_deviation_pct}% above average user ticket size (Z-Score: ${amount_z_score}).`,
    });
  } else if (amount_deviation_pct > 100) {
    amount_points = 15;
    contributions.push({
      feature: 'amount_higher',
      label: 'Above Average Amount',
      value: `₹${amount.toLocaleString('en-IN')}`,
      baseline: `₹${amount_baseline.toLocaleString('en-IN')}`,
      risk_contribution: 15,
      direction: 'elevates_risk',
      explanation: `Amount is ${amount_deviation_pct}% higher than user's usual spending.`,
    });
  } else {
    contributions.push({
      feature: 'amount_consistent',
      label: 'Ticket Size Normal',
      value: `₹${amount.toLocaleString('en-IN')}`,
      baseline: `₹${amount_baseline.toLocaleString('en-IN')}`,
      risk_contribution: -10,
      direction: 'lowers_risk',
      explanation: `Amount is within expected spending distribution.`,
    });
  }

  // --- Factor 3: Device Integrity & Proxy ---
  let device_points = 0;
  if (is_vpn_or_proxy && is_new_device) {
    device_points = 30;
    contributions.push({
      feature: 'vpn_untrusted_device',
      label: 'VPN / Proxy on Unrecognized Device',
      value: `IP: ${device.ip_address} (Risk: ${device.ip_reputation_score})`,
      baseline: 'Recognized Residential IP',
      risk_contribution: 30,
      direction: 'elevates_risk',
      explanation: 'Traffic originated via anonymized VPN / Data-center proxy on a brand new device fingerprint.',
    });
  } else if (is_new_device) {
    device_points = 14;
    contributions.push({
      feature: 'new_device_fingerprint',
      label: 'First-time Device Fingerprint',
      value: `${device.browser} on ${device.os}`,
      baseline: 'Trusted Hardware Token',
      risk_contribution: 14,
      direction: 'elevates_risk',
      explanation: 'Device fingerprint has never been associated with this merchant customer profile before.',
    });
  } else {
    contributions.push({
      feature: 'trusted_device',
      label: 'Recognized Hardware Fingerprint',
      value: `${device.browser} on ${device.os}`,
      baseline: 'Trusted Device',
      risk_contribution: -15,
      direction: 'lowers_risk',
      explanation: 'Device fingerprint is verified and has completed previous successful transactions.',
    });
  }

  // --- Factor 4: Geo Mismatch ---
  let geo_points = 0;
  if (geo_mismatch) {
    geo_points = 15;
    contributions.push({
      feature: 'geo_mismatch',
      label: 'Billing vs Shipping Geo Discrepancy',
      value: `Billing: ${billing_geo} | Shipping: ${shipping_geo}`,
      baseline: `User Home: ${user.home_geo}`,
      risk_contribution: 15,
      direction: 'elevates_risk',
      explanation: `Destination shipping address deviates from registered billing territory (${billing_geo} → ${shipping_geo}).`,
    });
  }

  // --- Factor 5: RTO & Dispute History ---
  let rto_points = 0;
  if (user.refund_count_90d >= 3) {
    rto_points = 25;
    contributions.push({
      feature: 'high_dispute_rate',
      label: 'Chronic Refund / RTO History',
      value: `${user.refund_count_90d} disputes in 90d`,
      baseline: '0 disputes',
      risk_contribution: 25,
      direction: 'elevates_risk',
      explanation: `Customer account shows repeat refund abuse pattern (${user.refund_count_90d} instances in past 90 days).`,
    });
  }

  // --- Factor 6: Night-time & Timing ---
  let time_points = 0;
  if (is_night_time) {
    time_points = 8;
    contributions.push({
      feature: 'off_hours_spike',
      label: 'Off-Hours Transaction (01:00 - 05:00)',
      value: 'Late night / Early morning',
      baseline: 'Business hours',
      risk_contribution: 8,
      direction: 'elevates_risk',
      explanation: 'Transaction initiated during high-fraud off-peak hours (1:00 AM - 5:00 AM local time).',
    });
  }

  // Calculate composite score (clamped between 0 and 100)
  let raw_score = 10 + velocity_points + amount_points + device_points + geo_points + rto_points + time_points;
  
  // Bonus trust discount for seasoned KYC-verified users with > 10 txns and trusted device
  if (user.is_verified_kyc && user.total_successful_txns > 10 && device.is_trusted && !geo_mismatch) {
    raw_score -= 20;
  }

  const risk_score = Math.max(3, Math.min(99, raw_score));

  // Determine severity tier
  let risk_severity: RiskSeverity = 'low';
  let recommended_action: TransactionStatus = 'approved';

  if (risk_score >= 70) {
    risk_severity = 'high';
    recommended_action = 'blocked';
  } else if (risk_score >= 40) {
    risk_severity = 'medium';
    recommended_action = is_new_device ? 'challenged_3ds' : 'held';
  } else {
    risk_severity = 'low';
    recommended_action = 'approved';
  }

  // Extract top factors based on contribution
  const top_factors = contributions
    .filter((c) => c.direction === 'elevates_risk')
    .sort((a, b) => b.risk_contribution - a.risk_contribution)
    .slice(0, 3)
    .map((c) => c.label);

  if (top_factors.length === 0) {
    top_factors.push('Consistent purchase patterns', 'Recognized trusted device');
  }

  // Confidence is higher when user has deep transaction history
  const confidence_score = Number(
    Math.min(0.98, 0.7 + (user.total_successful_txns > 5 ? 0.2 : 0.05) + (device.is_trusted ? 0.08 : 0)).toFixed(2)
  );

  return {
    risk_score,
    risk_severity,
    feature_vector,
    feature_contributions: contributions,
    recommended_action,
    confidence_score,
    top_factors,
  };
}
