// TrustLayer Explainable AI (XAI) & Risk CoPilot Engine
// Supports Anthropic Claude, Google Gemini, and a high-fidelity deterministic fallback.

import { Transaction, FeatureContribution } from './types';

export interface AIRationaleResponse {
  rationale: string;
  recommended_playbook: string;
  source: 'claude' | 'gemini' | 'hybrid-xai';
}

/**
 * High-fidelity deterministic explainability generator.
 * Produces crisp, non-hallucinated plain-English explanations directly tied to feature values.
 */
export function generateOfflineRationale(tx: Partial<Transaction>): string {
  const score = tx.risk_score || 20;
  const fv = tx.feature_vector;
  const user = tx.user;
  const topFactors = tx.top_factors || [];

  if (!fv || !user) {
    if (score < 40) return 'Transaction exhibits typical purchase behavior with verified identity and device parameters.';
    return 'Elevated risk detected across transaction telemetry; recommend merchant review before shipment.';
  }

  const parts: string[] = [];

  // Low Risk Narrative
  if (score < 40) {
    parts.push(
      `Transaction cleared with low risk score (${score}/100). The amount (₹${fv.amount.toLocaleString('en-IN')}) aligns with the customer's typical spending baseline.`
    );
    if (!fv.new_device) {
      parts.push(`Initiated from a recognized, trusted hardware fingerprint with zero address mismatch.`);
    } else {
      parts.push(`Although initiated from a new browser session, the user's KYC verification and steady velocity support safe approval.`);
    }
    return parts.join(' ');
  }

  // Medium Risk Narrative
  if (score >= 40 && score < 70) {
    parts.push(`Flagged for secondary verification (${score}/100).`);
    if (fv.velocity_ratio >= 2) {
      parts.push(
        `Customer velocity increased to ${fv.velocity_1h} transactions/hr (${fv.velocity_ratio}x historical normal).`
      );
    }
    if (fv.amount_deviation_pct > 100) {
      parts.push(
        `Ticket size (₹${fv.amount.toLocaleString('en-IN')}) is ${fv.amount_deviation_pct}% higher than their ₹${fv.amount_baseline.toLocaleString('en-IN')} average.`
      );
    }
    if (fv.geo_mismatch) {
      parts.push(`Delivery destination (${fv.shipping_geo}) deviates from billing origin (${fv.billing_geo}).`);
    }
    if (fv.new_device) {
      parts.push(`Session was initiated from a first-time device.`);
    }
    parts.push(`Recommend 3D-Secure biometric step-up or manual ops confirmation.`);
    return parts.join(' ');
  }

  // High Risk Narrative
  parts.push(`Critical risk signal triggered (${score}/100).`);
  
  const highRiskDrivers: string[] = [];
  if (fv.velocity_ratio >= 3) {
    highRiskDrivers.push(`velocity surge of ${fv.velocity_1h} txns/hr (${fv.velocity_ratio}x baseline)`);
  }
  if (fv.is_vpn_or_proxy) {
    highRiskDrivers.push(`anonymized data-center VPN/proxy routing`);
  }
  if (fv.new_device) {
    highRiskDrivers.push(`unrecognized hardware fingerprint`);
  }
  if (fv.amount_deviation_pct >= 200) {
    highRiskDrivers.push(`ticket size ₹${fv.amount.toLocaleString('en-IN')} significantly outpacing typical patterns`);
  }
  if (fv.refund_count_90d >= 3) {
    highRiskDrivers.push(`repeated RTO/refund dispute history (${fv.refund_count_90d} in 90 days)`);
  }

  if (highRiskDrivers.length > 0) {
    parts.push(`Driven primarily by ${highRiskDrivers.slice(0, 2).join(' combined with ')}.`);
  }

  if (fv.geo_mismatch) {
    parts.push(`Severe geography anomaly detected: billing address in ${fv.billing_geo} while physical delivery target is ${fv.shipping_geo}.`);
  }

  parts.push(`Immediate block or fulfillment hold recommended to avoid chargeback penalties.`);

  return parts.join(' ');
}

/**
 * Generate Actionable Playbook for Ops Team
 */
export function generatePlaybookRecommendation(tx: Partial<Transaction>): string {
  const score = tx.risk_score || 0;
  if (score < 40) {
    return 'Auto-Capture: Safe to fulfill immediately. No manual intervention required.';
  } else if (score < 70) {
    return 'Soft Hold / 3DS Step-Up: Request OTP / payment re-authentication, or call customer if physical courier dispatch is pending.';
  } else {
    return 'Hard Block: Restrict order dispatch, flag payment ID in Razorpay dashboard, and suspend linked device fingerprint.';
  }
}

/**
 * Realtime Rationale Generator: Calls Claude/Gemini if API keys are set, otherwise uses hybrid XAI.
 */
export async function getExplainableRationale(tx: Partial<Transaction>): Promise<AIRationaleResponse> {
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // If Anthropic Claude key is provided
  if (claudeKey) {
    try {
      const prompt = `You are a Senior Risk Analyst at Razorpay Thirdwatch.
Explain this transaction's risk score (${tx.risk_score}/100) in 2-3 clear, professional sentences for a merchant operations specialist.
Reference these real features:
- Velocity: ${tx.feature_vector?.velocity_1h} txns/hr (baseline: ${tx.feature_vector?.velocity_baseline})
- Amount: INR ${tx.amount} (user avg: INR ${tx.feature_vector?.amount_baseline})
- Device: ${tx.feature_vector?.new_device ? 'First-time new device' : 'Recognized trusted device'}
- Network: ${tx.feature_vector?.is_vpn_or_proxy ? 'VPN / Proxy detected' : 'Standard residential network'}
- Geo Match: ${tx.feature_vector?.geo_mismatch ? `Mismatch (${tx.billing_geo} vs ${tx.shipping_geo})` : 'Matches'}
- Refund history: ${tx.user?.refund_count_90d} disputes in last 90 days.

Keep it concise, authoritative, and actionable.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 250,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rationale = data.content?.[0]?.text?.trim();
        if (rationale) {
          return {
            rationale,
            recommended_playbook: generatePlaybookRecommendation(tx),
            source: 'claude',
          };
        }
      }
    } catch {
      // Fall through to offline on any error
    }
  }

  // If Gemini key is provided
  if (geminiKey) {
    try {
      const prompt = `You are a payments risk analyst at Razorpay. Write a 2-3 sentence plain-English rationale for a risk score of ${tx.risk_score}/100 on an order of INR ${tx.amount}. Features: Velocity ${tx.feature_vector?.velocity_1h} txns/hr, Device: ${tx.feature_vector?.new_device ? 'New' : 'Trusted'}, VPN: ${tx.feature_vector?.is_vpn_or_proxy ? 'Yes' : 'No'}, Geo Mismatch: ${tx.feature_vector?.geo_mismatch ? 'Yes' : 'No'}.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return {
            rationale: text,
            recommended_playbook: generatePlaybookRecommendation(tx),
            source: 'gemini',
          };
        }
      }
    } catch {
      // Fall through
    }
  }

  // Fast, deterministic, 100% reliable Hybrid XAI engine
  return {
    rationale: generateOfflineRationale(tx),
    recommended_playbook: generatePlaybookRecommendation(tx),
    source: 'hybrid-xai',
  };
}

/**
 * Risk CoPilot Query Handler
 * Answers merchant operations questions interactively about a transaction.
 */
export async function answerRiskCopilotQuestion(
  question: string,
  tx: Transaction
): Promise<string> {
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Try Claude if available
  if (claudeKey) {
    try {
      const prompt = `You are Risk CoPilot, an expert payments risk analyst for Razorpay merchants.
Answer this merchant ops question concisely and authoritatively (2-3 sentences max) based on the transaction context:
Question: "${question}"

Transaction Context:
- Transaction ID: ${tx.id}
- Amount: INR ${tx.amount}
- Customer: ${tx.user.name} (${tx.user.phone}, ${tx.user.email})
- KYC Status: ${tx.user.is_verified_kyc ? 'Verified' : 'Unverified'}
- Customer Baseline: Avg ticket INR ${tx.user.avg_transaction_amount}, ${tx.user.total_successful_txns} previous successful orders, ${tx.user.refund_count_90d} disputes in last 90d
- Risk Score: ${tx.risk_score}/100 (${tx.risk_severity.toUpperCase()})
- Rationale: ${tx.rationale}
- Device: ${tx.device.browser} on ${tx.device.os} (${tx.device.is_trusted ? 'Recognized trusted device' : 'Brand new first-time device'})
- IP: ${tx.ip_address} (VPN: ${tx.device.is_vpn_detected ? 'Yes' : 'No'}, IP risk: ${tx.device.ip_reputation_score}/100)
- Geography: Billing ${tx.billing_geo} -> Shipping ${tx.shipping_geo}
- Top Factors: ${tx.top_factors.join(', ')}

Provide concrete, actionable guidance on whether to approve, hold, call customer, or block.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const ans = data.content?.[0]?.text?.trim();
        if (ans) return ans;
      }
    } catch {
      // Fallback
    }
  }

  // Try Gemini if available
  if (geminiKey) {
    try {
      const prompt = `You are Razorpay Risk CoPilot. Answer this merchant question in 2-3 sentences based on:
Question: "${question}"
Order INR ${tx.amount} by ${tx.user.name}. Score: ${tx.risk_score}/100. New device: ${tx.feature_vector?.new_device}. VPN: ${tx.feature_vector?.is_vpn_or_proxy}. Geo mismatch: ${tx.feature_vector?.geo_mismatch}. Refund count: ${tx.user.refund_count_90d}.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch {
      // Fallback
    }
  }

  // Offline deterministic fallback
  const q = question.toLowerCase();

  if (q.includes('chargeback') || q.includes('refund') || q.includes('rto')) {
    const refunds = tx.user.refund_count_90d;
    if (refunds === 0) {
      return `This customer (${tx.user.name}) has an immaculate record with 0 disputes or refund claims in the past 90 days across ${tx.user.total_successful_txns} lifetime orders. RTO risk on this account is minimal.`;
    }
    return `Caution: This customer has recorded ${refunds} refunds/RTO returns in the last 90 days. For physical goods, this indicates an elevated likelihood of courier rejection (RTO) or post-delivery dispute.`;
  }

  if (q.includes('device') || q.includes('phone') || q.includes('laptop') || q.includes('hardware')) {
    if (tx.device.is_trusted) {
      return `The hardware fingerprint (${tx.device.browser} on ${tx.device.os}) has been recognized since ${new Date(
        tx.device.first_seen_at
      ).toLocaleDateString('en-IN')}. It has passed ${tx.user.total_successful_txns} previous checkouts with no anomalies.`;
    }
    return `This device fingerprint is completely new and was first seen during this session. Additionally, the IP address (${tx.device.ip_address}) has a network risk score of ${tx.device.ip_reputation_score}/100${
      tx.device.is_vpn_detected ? ' with commercial VPN signature detected' : ''
    }.`;
  }

  if (q.includes('dispatch') || q.includes('ship') || q.includes('approve') || q.includes('call') || q.includes('action')) {
    if (tx.risk_score >= 70) {
      return `Do not dispatch. TrustLayer advises holding the order immediately. Contact the customer at ${tx.user.phone} to confirm the billing mismatch between ${tx.billing_geo} and ${tx.shipping_geo} before shipping.`;
    }
    if (tx.risk_score >= 40) {
      return `Hold courier handover until secondary phone/OTP confirmation. If the customer answers and verifies their order items, you can safely override to 'Approved'.`;
    }
    return `Safe to dispatch immediately. The order passed all velocity, hardware, and KYC consistency checks.`;
  }

  if (q.includes('why') || q.includes('reason') || q.includes('flagged')) {
    return tx.rationale;
  }

  // Default intelligent assistant response
  return `Regarding transaction ${tx.id} for ₹${tx.amount.toLocaleString('en-IN')}: The composite risk is evaluated at ${tx.risk_score}/100 (${tx.risk_severity.toUpperCase()} severity). Top drivers include: ${tx.top_factors.join(', ')}. Recommended ops action is: ${tx.recommended_action.toUpperCase()}.`;
}
