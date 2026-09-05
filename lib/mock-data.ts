// TrustLayer Mock Dataset: High-Fidelity Indian FinTech / Razorpay Transactions
// Includes normal transactions, suspicious anomalies, and connected fraud rings

import { Transaction, UserBaseline, DeviceInfo, FraudRing } from './types';
import { computeRiskScore } from './scoring';
import { generateOfflineRationale } from './ai-engine';

export const MOCK_USERS: Record<string, UserBaseline> = {
  user_1: {
    id: 'user_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    phone: '+91 98201 44102',
    home_geo: 'Bengaluru, KA',
    avg_transaction_amount: 3200,
    avg_txn_velocity: 0.4,
    refund_count_90d: 0,
    total_successful_txns: 24,
    account_created_at: '2023-04-12T10:00:00Z',
    is_verified_kyc: true,
  },
  user_2: {
    id: 'user_2',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@outlook.com',
    phone: '+91 97110 88231',
    home_geo: 'Pune, MH',
    avg_transaction_amount: 1850,
    avg_txn_velocity: 0.3,
    refund_count_90d: 0,
    total_successful_txns: 12,
    account_created_at: '2023-11-20T08:30:00Z',
    is_verified_kyc: true,
  },
  user_3: {
    id: 'user_3',
    name: 'Vikramaditya Roy',
    email: 'vikram.roy99@rediffmail.com',
    phone: '+91 94330 19821',
    home_geo: 'Kolkata, WB',
    avg_transaction_amount: 1200,
    avg_txn_velocity: 0.2,
    refund_count_90d: 4, // High refund history
    total_successful_txns: 3,
    account_created_at: '2024-07-01T14:15:00Z',
    is_verified_kyc: false,
  },
  user_4: {
    id: 'user_4',
    name: 'Kabir Mehta',
    email: 'kabir.mehta@nexuscorp.in',
    phone: '+91 98920 77109',
    home_geo: 'Mumbai, MH',
    avg_transaction_amount: 15400,
    avg_txn_velocity: 0.8,
    refund_count_90d: 0,
    total_successful_txns: 48,
    account_created_at: '2022-09-10T12:00:00Z',
    is_verified_kyc: true,
  },
  user_5: {
    id: 'user_5',
    name: 'Rohan Verma (Burner)',
    email: 'rohan.v.promo29@tempmail.com',
    phone: '+91 81092 33419',
    home_geo: 'Delhi, DL',
    avg_transaction_amount: 650,
    avg_txn_velocity: 0.1,
    refund_count_90d: 3,
    total_successful_txns: 1,
    account_created_at: '2026-09-04T22:10:00Z',
    is_verified_kyc: false,
  },
  user_6: {
    id: 'user_6',
    name: 'Siddharth Rao',
    email: 'siddharth.rao@techindia.org',
    phone: '+91 99002 55198',
    home_geo: 'Hyderabad, TS',
    avg_transaction_amount: 4500,
    avg_txn_velocity: 0.5,
    refund_count_90d: 0,
    total_successful_txns: 19,
    account_created_at: '2023-01-18T16:00:00Z',
    is_verified_kyc: true,
  }
};

export const MOCK_DEVICES: Record<string, DeviceInfo> = {
  dev_trusted_1: {
    id: 'dev_trusted_1',
    fingerprint: 'fp_a98e1f0082c1b',
    browser: 'Chrome 128.0 (Macintosh)',
    os: 'macOS Sonoma',
    ip_address: '49.207.212.18',
    ip_reputation_score: 5,
    is_vpn_detected: false,
    first_seen_at: '2023-06-10T08:00:00Z',
    is_trusted: true,
    linked_user_ids: ['user_1'],
  },
  dev_trusted_2: {
    id: 'dev_trusted_2',
    fingerprint: 'fp_b4481d99ef87',
    browser: 'Mobile Safari 17.5 (iPhone)',
    os: 'iOS 17.5.1',
    ip_address: '157.34.192.44',
    ip_reputation_score: 12,
    is_vpn_detected: false,
    first_seen_at: '2023-11-20T08:35:00Z',
    is_trusted: true,
    linked_user_ids: ['user_2'],
  },
  dev_suspicious_vpn: {
    id: 'dev_suspicious_vpn',
    fingerprint: 'fp_proxy_999812a',
    browser: 'Firefox 130.0 (Windows)',
    os: 'Windows 11',
    ip_address: '185.220.101.4', // Known Tor exit / VPN node
    ip_reputation_score: 92,
    is_vpn_detected: true,
    first_seen_at: '2026-09-05T14:10:00Z',
    is_trusted: false,
    linked_user_ids: ['user_3', 'user_5'],
  },
  dev_botnet_cluster: {
    id: 'dev_botnet_cluster',
    fingerprint: 'fp_cloned_emulator_88',
    browser: 'Chrome 119.0 (Linux x86_64)',
    os: 'Android 12 (Android Emulator)',
    ip_address: '103.251.167.89',
    ip_reputation_score: 85,
    is_vpn_detected: true,
    first_seen_at: '2026-09-05T15:00:00Z',
    is_trusted: false,
    linked_user_ids: ['user_5'],
  },
  dev_corp_trusted: {
    id: 'dev_corp_trusted',
    fingerprint: 'fp_corp_mac_2299',
    browser: 'Chrome 128.0 (Macintosh)',
    os: 'macOS Sequoia',
    ip_address: '115.114.88.2',
    ip_reputation_score: 4,
    is_vpn_detected: false,
    first_seen_at: '2022-09-10T12:05:00Z',
    is_trusted: true,
    linked_user_ids: ['user_4'],
  }
};

export const MOCK_FRAUD_RINGS: FraudRing[] = [
  {
    id: 'ring_botnet_01',
    name: 'MUM-TOR-Carding-Cluster #402',
    pattern: 'card_testing_botnet',
    risk_level: 'high',
    total_gmv_at_risk: 184500,
    detected_at: '2026-09-05T12:00:00Z',
    entity_count: 4,
    entities: {
      users: [
        { id: 'user_5', name: 'Rohan Verma (Burner)' },
        { id: 'user_3', name: 'Vikramaditya Roy' }
      ],
      devices: [
        { fingerprint: 'fp_proxy_999812a', os: 'Windows 11' },
        { fingerprint: 'fp_cloned_emulator_88', os: 'Android Emulator' }
      ],
      ips: ['185.220.101.4', '103.251.167.89'],
      upi_vpas: ['quickcash29@okhdfcbank', 'promo_cash@ybl']
    },
    transactions: ['txn_rzp_fraud_01', 'txn_rzp_fraud_02']
  }
];

function createTransaction(
  id: string,
  userKey: keyof typeof MOCK_USERS,
  deviceKey: keyof typeof MOCK_DEVICES,
  amount: number,
  payment_method: 'upi' | 'card' | 'netbanking' | 'cod',
  payment_detail: string,
  billing_geo: string,
  shipping_geo: string,
  recent_velocity: number,
  minutesAgo: number,
  is_night: boolean = false,
  status: Transaction['status'] = 'pending',
  fraud_ring_id?: string
): Transaction {
  const user = MOCK_USERS[userKey];
  const device = MOCK_DEVICES[deviceKey];

  const scoring = computeRiskScore({
    amount,
    payment_method,
    billing_geo,
    shipping_geo,
    user,
    device,
    recent_txns_1h_count: recent_velocity,
    is_night_time: is_night,
  });

  const txDate = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

  const partialTx: Partial<Transaction> = {
    id,
    user,
    device,
    amount,
    currency: 'INR',
    payment_method,
    billing_geo,
    shipping_geo,
    risk_score: scoring.risk_score,
    risk_severity: scoring.risk_severity,
    feature_vector: scoring.feature_vector,
    top_factors: scoring.top_factors,
  };

  const rationale = generateOfflineRationale(partialTx);

  return {
    id,
    razorpay_order_id: `order_${id.replace('txn_rzp_', 'ord_')}`,
    razorpay_payment_id: `pay_${id.replace('txn_rzp_', 'pay_')}`,
    user_id: user.id,
    user,
    device_id: device.id,
    device,
    amount,
    currency: 'INR',
    payment_method,
    payment_method_detail: payment_detail,
    billing_geo,
    shipping_geo,
    ip_address: device.ip_address,
    created_at: txDate,
    risk_score: scoring.risk_score,
    risk_severity: scoring.risk_severity,
    feature_vector: scoring.feature_vector,
    feature_contributions: scoring.feature_contributions,
    rationale,
    top_factors: scoring.top_factors,
    recommended_action: scoring.recommended_action,
    confidence_score: scoring.confidence_score,
    status: status !== 'pending' ? status : (scoring.risk_score < 40 ? 'approved' : 'pending'),
    fraud_ring_id,
    fraud_ring_name: fraud_ring_id ? 'MUM-TOR-Carding-Cluster #402' : undefined,
    shared_entities_count: fraud_ring_id ? 3 : 0,
  };
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 1. High-risk Botnet attack (Carding & Velocity)
  createTransaction(
    'txn_rzp_fraud_01',
    'user_5',
    'dev_botnet_cluster',
    84990,
    'card',
    'SBI Card •••• 9102',
    'Delhi, DL',
    'Surat, GJ',
    8,
    4,
    true,
    'pending',
    'ring_botnet_01'
  ),

  // 2. High-risk Account Takeover / VPN mismatch
  createTransaction(
    'txn_rzp_fraud_02',
    'user_3',
    'dev_suspicious_vpn',
    49500,
    'card',
    'Axis Bank Visa •••• 7714',
    'Kolkata, WB',
    'Imphal, MN',
    4,
    12,
    false,
    'held',
    'ring_botnet_01'
  ),

  // 3. Medium-risk RTO / COD High Value Order
  createTransaction(
    'txn_rzp_med_01',
    'user_3',
    'dev_trusted_2',
    7800,
    'cod',
    'Cash on Delivery',
    'Kolkata, WB',
    'Howrah, WB',
    1,
    28,
    false,
    'pending'
  ),

  // 4. Clean Normal Transaction - UPI
  createTransaction(
    'txn_rzp_legit_01',
    'user_1',
    'dev_trusted_1',
    2850,
    'upi',
    'aarav.sharma@okaxis',
    'Bengaluru, KA',
    'Bengaluru, KA',
    0,
    42,
    false,
    'approved'
  ),

  // 5. Clean Enterprise Purchase - NetBanking
  createTransaction(
    'txn_rzp_legit_02',
    'user_4',
    'dev_corp_trusted',
    34500,
    'netbanking',
    'HDFC Corporate NetBanking',
    'Mumbai, MH',
    'Mumbai, MH',
    1,
    65,
    false,
    'approved'
  ),

  // 6. Medium-risk New Device / Velocity Check
  createTransaction(
    'txn_rzp_med_02',
    'user_2',
    'dev_trusted_1', // Using device from different user!
    5200,
    'upi',
    'ananya.d@okhdfcbank',
    'Pune, MH',
    'Bengaluru, KA',
    2,
    90,
    false,
    'challenged_3ds'
  ),

  // 7. Clean Grocery / Quick Commerce - UPI
  createTransaction(
    'txn_rzp_legit_03',
    'user_6',
    'dev_trusted_2',
    890,
    'upi',
    'siddharth.rao@ybl',
    'Hyderabad, TS',
    'Hyderabad, TS',
    0,
    115,
    false,
    'approved'
  ),

  // 8. Clean Subscription Auto-debit
  createTransaction(
    'txn_rzp_legit_04',
    'user_1',
    'dev_trusted_1',
    1499,
    'card',
    'ICICI Rubyx •••• 1092',
    'Bengaluru, KA',
    'Bengaluru, KA',
    0,
    150,
    false,
    'approved'
  ),
];
