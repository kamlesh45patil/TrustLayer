import { NextResponse } from 'next/server';
import { store } from '@/lib/storage';
import { computeRiskScore } from '@/lib/scoring';
import { getExplainableRationale } from '@/lib/ai-engine';
import { MOCK_USERS, MOCK_DEVICES } from '@/lib/mock-data';
import { Transaction } from '@/lib/types';

export async function POST() {
  const burstScenarios = [
    {
      userKey: 'user_5',
      deviceKey: 'dev_botnet_cluster',
      amount: 72990,
      payment_method: 'card' as const,
      payment_detail: 'HDFC Millennia •••• 8812',
      billing: 'Delhi, DL',
      shipping: 'Coimbatore, TN',
      velocity: 9,
      isNight: true,
      ringId: 'ring_botnet_01',
    },
    {
      userKey: 'user_3',
      deviceKey: 'dev_suspicious_vpn',
      amount: 45000,
      payment_method: 'card' as const,
      payment_detail: 'ICICI Amazon Pay •••• 3041',
      billing: 'Kolkata, WB',
      shipping: 'Jaipur, RJ',
      velocity: 5,
      isNight: true,
      ringId: 'ring_botnet_01',
    },
    {
      userKey: 'user_5',
      deviceKey: 'dev_botnet_cluster',
      amount: 9800,
      payment_method: 'upi' as const,
      payment_detail: 'promo_hacker99@ybl',
      billing: 'Delhi, DL',
      shipping: 'Ludhiana, PB',
      velocity: 7,
      isNight: false,
      ringId: 'ring_botnet_01',
    },
  ];

  const createdTransactions: Transaction[] = [];

  for (const s of burstScenarios) {
    const user = MOCK_USERS[s.userKey];
    const device = MOCK_DEVICES[s.deviceKey];

    const scoring = computeRiskScore({
      amount: s.amount,
      payment_method: s.payment_method,
      billing_geo: s.billing,
      shipping_geo: s.shipping,
      user,
      device,
      recent_txns_1h_count: s.velocity,
      is_night_time: s.isNight,
    });

    const txId = `txn_rzp_burst_${Date.now().toString(36)}_${Math.random().toString(36).substring(7)}`;

    const partialTx: Partial<Transaction> = {
      id: txId,
      amount: s.amount,
      currency: 'INR',
      user,
      device,
      risk_score: scoring.risk_score,
      risk_severity: scoring.risk_severity,
      feature_vector: scoring.feature_vector,
      top_factors: scoring.top_factors,
      billing_geo: s.billing,
      shipping_geo: s.shipping,
    };

    const aiResponse = await getExplainableRationale(partialTx);

    const newTx: Transaction = {
      id: txId,
      razorpay_order_id: `order_burst_${Math.random().toString(36).substring(4, 10)}`,
      razorpay_payment_id: `pay_burst_${Math.random().toString(36).substring(4, 10)}`,
      user_id: user.id,
      user,
      device_id: device.id,
      device,
      amount: s.amount,
      currency: 'INR',
      payment_method: s.payment_method,
      payment_method_detail: s.payment_detail,
      billing_geo: s.billing,
      shipping_geo: s.shipping,
      ip_address: device.ip_address,
      created_at: new Date().toISOString(),
      risk_score: scoring.risk_score,
      risk_severity: scoring.risk_severity,
      feature_vector: scoring.feature_vector,
      feature_contributions: scoring.feature_contributions,
      rationale: aiResponse.rationale,
      top_factors: scoring.top_factors,
      recommended_action: scoring.recommended_action,
      confidence_score: scoring.confidence_score,
      status: 'pending',
      fraud_ring_id: s.ringId,
      fraud_ring_name: 'MUM-TOR-Carding-Cluster #402',
      shared_entities_count: 3,
    };

    store.add(newTx);
    createdTransactions.push(newTx);
  }

  return NextResponse.json({
    success: true,
    message: `Triggered live suspicious burst: ${createdTransactions.length} high-risk transactions injected`,
    transactions: createdTransactions,
  });
}
