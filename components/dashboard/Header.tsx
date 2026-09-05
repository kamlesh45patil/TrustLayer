'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Zap, 
  CreditCard, 
  Network, 
  SlidersHorizontal, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  IndianRupee 
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  stats: {
    total: number;
    highRisk: number;
    medRisk: number;
    lowRisk: number;
    heldCount: number;
    blockedCount: number;
    totalGMV: number;
    avgScore: number;
    falsePositiveRateEst: string;
  };
  onTriggerBurst: () => void;
  isBursting: boolean;
  onOpenCheckout: () => void;
  onOpenFraudRing: () => void;
  onOpenPolicy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onTriggerBurst,
  isBursting,
  onOpenCheckout,
  onOpenFraudRing,
  onOpenPolicy,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-bold shadow-sm">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  TrustLayer
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Razorpay Thirdwatch AI
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  LIVE PIPELINE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Merchant Ops: UrbanStyle Direct &bull; MID: <span className="font-mono text-slate-700 dark:text-slate-300">rzp_live_891xLa8</span>
              </p>
            </div>
          </div>

          {/* Action Buttons for Demo, Theme Switcher & Judges */}
          <div className="flex items-center space-x-2">
            {/* Light / Dark / System Theme Toggle */}
            <ThemeToggle />

            <button
              onClick={onOpenCheckout}
              className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
              title="Test real-time payment interception with Razorpay Standard Checkout"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Razorpay Checkout</span>
              <span className="md:hidden">Checkout</span>
            </button>

            <button
              onClick={onOpenFraudRing}
              className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
              title="View interconnected fraud ring network graph"
            >
              <Network className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">Fraud Ring Graph</span>
              <span className="md:hidden">Rings</span>
            </button>

            <button
              onClick={onOpenPolicy}
              className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
              title="Simulate policy changes and impact on GMV"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-400" />
              <span className="hidden md:inline">Policy Simulator</span>
              <span className="md:hidden">Policy</span>
            </button>

            {/* Live Judge Demo Burst Trigger */}
            <button
              onClick={onTriggerBurst}
              disabled={isBursting}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold text-white transition-all shadow-sm ${
                isBursting
                  ? 'bg-rose-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 active:scale-95'
              }`}
              title="Simulate high-risk bot attack burst for live demo"
            >
              <Zap className={`w-3.5 h-3.5 mr-1.5 ${isBursting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isBursting ? 'Injecting Attack...' : 'Trigger Burst'}</span>
              <span className="sm:hidden">{isBursting ? 'Injecting...' : 'Burst'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/60 py-3 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Metric 1: Flagged Today */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Flagged (High Risk)</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{stats.highRisk}</span>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/40">
                  {stats.total > 0 ? Math.round((stats.highRisk / stats.total) * 100) : 0}% of traffic
                </span>
              </div>
            </div>

            {/* Metric 2: Under Review */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Pending Ops Review</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{stats.heldCount}</span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/40">
                  Held / Challenge
                </span>
              </div>
            </div>

            {/* Metric 3: Avg Risk Score */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Avg Risk Score</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {stats.avgScore} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/100</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {stats.total} total txns
                </span>
              </div>
            </div>

            {/* Metric 4: GMV Protected */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>GMV Screened</span>
                <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  ₹{(stats.totalGMV / 1000).toFixed(1)}k
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40">
                  Protected
                </span>
              </div>
            </div>

            {/* Metric 5: False Positive Rate */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 md:col-span-1 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Model FPR</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats.falsePositiveRateEst}</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Benchmark: 5.2%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
