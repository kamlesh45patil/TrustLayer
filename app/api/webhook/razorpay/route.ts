import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { store } from '@/lib/storage';
import { computeRiskScore } from '@/lib/scoring';
import { getExplainableRationale } from '@/lib/ai-engine';
import { MOCK_USERS, MOCK_DEVICES } from '@/lib/mock-data';
import { Transaction } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_trustlayer_secret_demo';

    // Verify Razorpay HMAC-SHA256 signature
    let signatureValid = false;
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
      signatureValid = expectedSignature === signature;
    } else {
      // In sandbox demo mode, flag as simulated signature
      signatureValid = true;
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event; // e.g. 'payment.authorized'

    // If event is payment.authorized, run automated risk interception
    if (eventType === 'payment.authorized') {
      const paymentEntity = payload.payload?.payment?.entity;
      const amount = (paymentEntity?.amount || 500000) / 100; // Razorpay amounts are in paise
      const email = paymentEntity?.email || 'customer@example.com';

      // Pick user or assign fallback
      const user = Object.values(MOCK_USERS).find((u) => u.email === email) || MOCK_USERS['user_3'];
      const device = MOCK_DEVICES['dev_suspicious_vpn'];

      const scoring = computeRiskScore({
        amount,
        payment_method: (paymentEntity?.method as any) || 'card',
        billing_geo: 'Mumbai, MH',
        shipping_geo: 'Unknown / VPN Proxy',
        user,
        device,
        recent_txns_1h_count: 5,
        is_night_time: true,
      });

      const txId = `txn_rzp_hook_${Date.now().toString(36)}`;
      const partialTx: Partial<Transaction> = {
        id: txId,
        amount,
        currency: 'INR',
        user,
        device,
        risk_score: scoring.risk_score,
        risk_severity: scoring.risk_severity,
        feature_vector: scoring.feature_vector,
        top_factors: scoring.top_factors,
      };

      const aiResponse = await getExplainableRationale(partialTx);

      const interceptedTx: Transaction = {
        id: txId,
        razorpay_order_id: paymentEntity?.order_id || `order_hook_${Date.now()}`,
        razorpay_payment_id: paymentEntity?.id || `pay_hook_${Date.now()}`,
        user_id: user.id,
        user,
        device_id: device.id,
        device,
        amount,
        currency: 'INR',
        payment_method: (paymentEntity?.method as any) || 'card',
        payment_method_detail: `${paymentEntity?.card?.network || 'Visa'} •••• ${paymentEntity?.card?.last4 || '1102'}`,
        billing_geo: 'Mumbai, MH',
        shipping_geo: 'Nagpur, MH',
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
        status: scoring.risk_score >= 70 ? 'held' : 'approved',
      };

      store.add(interceptedTx);

      return NextResponse.json({
        status: 'ok',
        event: eventType,
        signature_verified: signatureValid,
        intercepted_transaction: interceptedTx,
        risk_assessment: {
          score: scoring.risk_score,
          severity: scoring.risk_severity,
          decision: scoring.recommended_action,
        },
      });
    }

    return NextResponse.json({
      status: 'acknowledged',
      event: eventType,
      signature_verified: signatureValid,
    });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook processing error', details: err.message }, { status: 500 });
  }
}
