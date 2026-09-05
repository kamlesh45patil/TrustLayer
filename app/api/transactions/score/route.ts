import { NextResponse } from 'next/server';
import { store } from '@/lib/storage';
import { computeRiskScore } from '@/lib/scoring';
import { getExplainableRationale } from '@/lib/ai-engine';
import { MOCK_USERS, MOCK_DEVICES } from '@/lib/mock-data';
import { Transaction, PaymentMethod } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount = 5000,
      payment_method = 'upi',
      payment_detail = 'customer@okhdfcbank',
      billing_geo = 'Bengaluru, KA',
      shipping_geo = 'Bengaluru, KA',
      userId = 'user_1',
      deviceId = 'dev_trusted_1',
      recent_velocity = 1,
      is_night_time = false,
    } = body;

    const user = MOCK_USERS[userId] || MOCK_USERS['user_1'];
    const device = MOCK_DEVICES[deviceId] || MOCK_DEVICES['dev_trusted_1'];

    // 1. Deterministic Scoring
    const scoring = computeRiskScore({
      amount: Number(amount),
      payment_method: payment_method as PaymentMethod,
      billing_geo,
      shipping_geo,
      user,
      device,
      recent_txns_1h_count: Number(recent_velocity),
      is_night_time: Boolean(is_night_time),
    });

    const txId = `txn_rzp_${Date.now().toString(36)}${Math.random().toString(36).substring(6)}`;

    const partialTx: Partial<Transaction> = {
      id: txId,
      amount: Number(amount),
      currency: 'INR',
      user,
      device,
      risk_score: scoring.risk_score,
      risk_severity: scoring.risk_severity,
      feature_vector: scoring.feature_vector,
      top_factors: scoring.top_factors,
      billing_geo,
      shipping_geo,
    };

    // 2. AI Explainability Rationale
    const aiResponse = await getExplainableRationale(partialTx);

    const newTx: Transaction = {
      id: txId,
      razorpay_order_id: `order_${Math.random().toString(36).substring(4, 12)}`,
      razorpay_payment_id: `pay_${Math.random().toString(36).substring(4, 12)}`,
      user_id: user.id,
      user,
      device_id: device.id,
      device,
      amount: Number(amount),
      currency: 'INR',
      payment_method: payment_method as PaymentMethod,
      payment_method_detail: payment_detail,
      billing_geo,
      shipping_geo,
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
      status: scoring.risk_score < 40 ? 'approved' : 'pending',
    };

    store.add(newTx);

    return NextResponse.json({
      success: true,
      transaction: newTx,
      ai_source: aiResponse.source,
      playbook: aiResponse.recommended_playbook,
    });
  } catch (error) {
    console.error('Error in scoring route:', error);
    return NextResponse.json({ success: false, error: 'Scoring failed' }, { status: 500 });
  }
}
