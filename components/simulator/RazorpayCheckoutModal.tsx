'use client';

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { PaymentMethod } from '@/lib/types';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transaction: any) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<'legit' | 'velocity' | 'vpn' | 'rto'>('legit');
  const [amount, setAmount] = useState('2499');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [customerName, setCustomerName] = useState('Aarav Sharma');
  const [phone, setPhone] = useState('+91 98201 44102');
  const [email, setEmail] = useState('aarav.sharma@gmail.com');
  const [billingGeo, setBillingGeo] = useState('Bengaluru, KA');
  const [shippingGeo, setShippingGeo] = useState('Bengaluru, KA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBanner, setResultBanner] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleApplyScenario = (type: 'legit' | 'velocity' | 'vpn' | 'rto') => {
    setSelectedScenario(type);
    setResultBanner(null);

    if (type === 'legit') {
      setAmount('2499');
      setPaymentMethod('upi');
      setCustomerName('Aarav Sharma');
      setEmail('aarav.sharma@gmail.com');
      setPhone('+91 98201 44102');
      setBillingGeo('Bengaluru, KA');
      setShippingGeo('Bengaluru, KA');
    } else if (type === 'velocity') {
      setAmount('18990');
      setPaymentMethod('card');
      setCustomerName('Rohan Verma (Burner)');
      setEmail('rohan.v.promo29@tempmail.com');
      setPhone('+91 81092 33419');
      setBillingGeo('Delhi, DL');
      setShippingGeo('Surat, GJ');
    } else if (type === 'vpn') {
      setAmount('64900');
      setPaymentMethod('card');
      setCustomerName('Vikramaditya Roy');
      setEmail('vikram.roy99@rediffmail.com');
      setPhone('+91 94330 19821');
      setBillingGeo('Kolkata, WB');
      setShippingGeo('Imphal, MN');
    } else if (type === 'rto') {
      setAmount('4800');
      setPaymentMethod('cod');
      setCustomerName('Vikramaditya Roy');
      setEmail('vikram.roy99@rediffmail.com');
      setPhone('+91 94330 19821');
      setBillingGeo('Kolkata, WB');
      setShippingGeo('Howrah, WB');
    }
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setResultBanner(null);

    try {
      const payload = {
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_detail:
          paymentMethod === 'upi'
            ? `${customerName.toLowerCase().replace(/\s+/g, '')}@okaxis`
            : paymentMethod === 'card'
            ? 'Visa Platinum •••• 4112'
            : paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : 'HDFC Corporate NetBanking',
        billing_geo: billingGeo,
        shipping_geo: shippingGeo,
        userId: selectedScenario === 'legit' ? 'user_1' : selectedScenario === 'velocity' ? 'user_5' : 'user_3',
        deviceId:
          selectedScenario === 'legit'
            ? 'dev_trusted_1'
            : selectedScenario === 'velocity'
            ? 'dev_botnet_cluster'
            : 'dev_suspicious_vpn',
        recent_velocity: selectedScenario === 'velocity' ? 8 : selectedScenario === 'vpn' ? 4 : 0,
        is_night_time: selectedScenario === 'vpn' || selectedScenario === 'velocity',
      };

      const res = await fetch('/api/transactions/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        setResultBanner(data.transaction);
        onPaymentSuccess(data.transaction);
      }
    } catch (err) {
      console.error('Payment checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scenario Selection Header (Judge Demo Presets) */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Razorpay Checkout Simulator
              </span>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30">
                Sandbox
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-2">
            Select an attack preset or legit customer to simulate live risk interception:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleApplyScenario('legit')}
              className={`p-2 rounded-lg text-left transition-all border ${
                selectedScenario === 'legit'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-xs font-semibold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Legit Customer</span>
              </div>
              <span className="text-[10px] text-slate-300 block mt-0.5">Known device, normal UPI</span>
            </button>

            <button
              onClick={() => handleApplyScenario('velocity')}
              className={`p-2 rounded-lg text-left transition-all border ${
                selectedScenario === 'velocity'
                  ? 'bg-rose-700 border-rose-400 text-white shadow-xs font-semibold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Velocity Surge</span>
              </div>
              <span className="text-[10px] text-slate-300 block mt-0.5">8 txns/hr botnet spike</span>
            </button>

            <button
              onClick={() => handleApplyScenario('vpn')}
              className={`p-2 rounded-lg text-left transition-all border ${
                selectedScenario === 'vpn'
                  ? 'bg-rose-700 border-rose-400 text-white shadow-xs font-semibold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>VPN / Account Takeover</span>
              </div>
              <span className="text-[10px] text-slate-300 block mt-0.5">High ticket + geo anomaly</span>
            </button>

            <button
              onClick={() => handleApplyScenario('rto')}
              className={`p-2 rounded-lg text-left transition-all border ${
                selectedScenario === 'rto'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-xs font-semibold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center space-x-1">
                <Banknote className="w-3.5 h-3.5 text-amber-300" />
                <span>COD RTO Abuse</span>
              </div>
              <span className="text-[10px] text-slate-300 block mt-0.5">4 prior return disputes</span>
            </button>
          </div>
        </div>

        {/* Razorpay Standard Checkout Form UI */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Merchant Checkout</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">UrbanStyle Direct &bull; Electronics</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Amount to Pay</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                ₹{Number(amount || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Customer & Telemetry Inputs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Order Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Billing City</label>
              <input
                type="text"
                value={billingGeo}
                onChange={(e) => setBillingGeo(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Shipping City</label>
              <input
                type="text"
                value={shippingGeo}
                onChange={(e) => setShippingGeo(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">Payment Method</label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                { id: 'card', label: 'Cards', icon: CreditCard },
                { id: 'netbanking', label: 'NetBanking', icon: Building2 },
                { id: 'cod', label: 'COD', icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === m.id
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Banner if already evaluated */}
          {resultBanner && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed animate-fade-in ${
                resultBanner.risk_severity === 'high'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : resultBanner.risk_severity === 'medium'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span>TrustLayer Interception Result:</span>
                <span className="font-mono">{resultBanner.risk_score}/100 &bull; {resultBanner.risk_severity.toUpperCase()}</span>
              </div>
              <p>{resultBanner.rationale}</p>
            </div>
          )}

          {/* Razorpay Pay Button */}
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>
              {isProcessing
                ? 'Evaluating TrustLayer Telemetry (12ms)...'
                : `Simulate Payment · ₹${Number(amount || 0).toLocaleString('en-IN')}`}
            </span>
          </button>

          <p className="text-[11px] text-center text-slate-400">
            Powered by Razorpay Thirdwatch & TrustLayer XAI Engine
          </p>
        </div>
      </div>
    </div>
  );
};
