'use client';

import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Transaction } from '@/lib/types';

interface PolicySimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const PolicySimulator: React.FC<PolicySimulatorProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const [highThreshold, setHighThreshold] = useState(70);
  const [medThreshold, setMedThreshold] = useState(40);
  const [autoBlockVpn, setAutoBlockVpn] = useState(true);
  const [strictCod, setStrictCod] = useState(true);
  const [require3dsHighValue, setRequire3dsHighValue] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  // Run backtesting simulation against current dataset
  let simulatedBlockedCount = 0;
  let simulatedHeldCount = 0;
  let simulatedApprovedCount = 0;
  let gmvProtected = 0;
  let gmvDelayed = 0;

  transactions.forEach((tx) => {
    let score = tx.risk_score;

    if (autoBlockVpn && tx.feature_vector?.is_vpn_or_proxy) score += 15;
    if (strictCod && tx.payment_method === 'cod' && tx.user.refund_count_90d >= 2) score += 20;
    if (require3dsHighValue && tx.amount > 15000 && tx.feature_vector?.new_device) score += 10;

    if (score >= highThreshold) {
      simulatedBlockedCount++;
      gmvProtected += tx.amount;
    } else if (score >= medThreshold) {
      simulatedHeldCount++;
      gmvDelayed += tx.amount;
    } else {
      simulatedApprovedCount++;
    }
  });

  const total = transactions.length || 1;
  const projectedFpr = Math.max(0.6, (simulatedHeldCount / total) * 1.8).toFixed(1);

  const handleReset = () => {
    setHighThreshold(70);
    setMedThreshold(40);
    setAutoBlockVpn(true);
    setStrictCod(true);
    setRequire3dsHighValue(true);
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Risk Policy Backtester & Threshold Simulator
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Simulate threshold sensitivity across historical transactions before pushing live
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realtime Impact Cards */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            Projected Impact on {transactions.length} Screened Transactions
          </span>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">GMV Blocked (Fraud)</span>
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                ₹{gmvProtected.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{simulatedBlockedCount} txns auto-rejected</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Under Ops Hold</span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                ₹{gmvDelayed.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{simulatedHeldCount} txns held for review</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">False Positive Est.</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {projectedFpr}%
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Industry avg: 5.2%</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 space-y-5 text-xs text-slate-900 dark:text-slate-100">
          {/* Slider 1: High Risk Cutoff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Auto-Block Cutoff (High Severity)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Transactions scoring equal or above this are declined immediately.</p>
              </div>
              <span className="font-mono text-sm font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                &ge; {highThreshold} pts
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="1"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Slider 2: Medium Risk Cutoff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Manual Review / 3DS Step-Up Cutoff</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Transactions in this band trigger 3DS challenge or merchant ops review.</p>
              </div>
              <span className="font-mono text-sm font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                &ge; {medThreshold} pts
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              step="1"
              value={medThreshold}
              onChange={(e) => setMedThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Rule Toggles */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Automated Enforcement Heuristics</span>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Strict Data-Center Proxy / Tor Defense</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Add +15 penalty pts if IP is flagged on Razorpay Network Blacklist</span>
              </div>
              <input
                type="checkbox"
                checked={autoBlockVpn}
                onChange={(e) => setAutoBlockVpn(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">COD & RTO Abuse Shield (Thirdwatch Engine)</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Add +20 penalty pts for COD orders with &ge;2 prior customer disputes</span>
              </div>
              <input
                type="checkbox"
                checked={strictCod}
                onChange={(e) => setStrictCod(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">3DS Friction Step-Up on High Value</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Step up orders &gt; ₹15,000 on unrecognized hardware tokens</span>
              </div>
              <input
                type="checkbox"
                checked={require3dsHighValue}
                onChange={(e) => setRequire3dsHighValue(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between transition-colors">
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaved}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Deploying Policy...' : 'Save & Deploy to Live Gateway'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
