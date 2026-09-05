'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { TransactionDrawer } from '@/components/dashboard/TransactionDrawer';
import { RazorpayCheckoutModal } from '@/components/simulator/RazorpayCheckoutModal';
import { FraudRingGraph } from '@/components/dashboard/FraudRingGraph';
import { PolicySimulator } from '@/components/dashboard/PolicySimulator';
import { Transaction, TransactionStatus } from '@/lib/types';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    medRisk: 0,
    lowRisk: 0,
    heldCount: 0,
    blockedCount: 0,
    totalGMV: 0,
    avgScore: 0,
    falsePositiveRateEst: '1.4%',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBursting, setIsBursting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFraudRingOpen, setIsFraudRingOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTriggerBurst = async () => {
    try {
      setIsBursting(true);
      const res = await fetch('/api/simulate-burst', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.transactions) {
        setTransactions((prev) => [...data.transactions, ...prev]);
        showToast(`Triggered live attack burst: ${data.transactions.length} high-risk transactions intercepted!`, 'warning');
        
        // Auto-select the first newly created transaction to show the drawer immediately
        if (data.transactions.length > 0) {
          setSelectedTransaction(data.transactions[0]);
        }
        fetchTransactions();
      }
    } catch (err) {
      console.error('Failed to trigger burst:', err);
    } finally {
      setIsBursting(false);
    }
  };

  const handleAction = async (transactionId: string, action: TransactionStatus, note?: string) => {
    try {
      setIsActionLoading(true);
      const res = await fetch(`/api/transactions/${transactionId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actor: 'Merchant Ops (Admin)',
          notes: note || `Manual ${action} decision confirmed.`,
        }),
      });
      const data = await res.json();
      if (data.success && data.transaction) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? data.transaction : t))
        );
        if (selectedTransaction?.id === transactionId) {
          setSelectedTransaction(data.transaction);
        }
        showToast(`Transaction marked as ${action.toUpperCase()}`, 'success');
        fetchTransactions();
      }
    } catch (err) {
      console.error('Failed to record action:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePaymentSuccess = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setSelectedTransaction(newTx);
    showToast(`Razorpay payment processed & scored: ${newTx.risk_score}/100`, newTx.risk_severity === 'high' ? 'warning' : 'success');
    fetchTransactions();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Notification Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 ${
              toast.type === 'warning'
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                : toast.type === 'info'
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header with Navigation and Metrics */}
      <Header
        stats={stats}
        onTriggerBurst={handleTriggerBurst}
        isBursting={isBursting}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenFraudRing={() => setIsFraudRingOpen(true)}
        onOpenPolicy={() => setIsPolicyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Banner Alert for Pending Actions */}
        {stats.heldCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 transition-colors">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span className="font-semibold">
                Attention: {stats.heldCount} transactions require merchant ops review before dispatch.
              </span>
            </div>
            <button
              onClick={() => {
                const heldTx = transactions.find((t) => t.status === 'held' || t.status === 'pending');
                if (heldTx) setSelectedTransaction(heldTx);
              }}
              className="text-amber-800 dark:text-amber-300 font-bold hover:underline"
            >
              Review Flagged Order &rarr;
            </button>
          </div>
        )}

        {/* Transaction Table */}
        <TransactionTable
          transactions={transactions}
          selectedTransaction={selectedTransaction}
          onSelectTransaction={(tx) => setSelectedTransaction(tx)}
          onRefresh={fetchTransactions}
          isLoading={isLoading}
        />
      </main>

      {/* Slide-in Transaction Detail Drawer */}
      <TransactionDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onAction={handleAction}
        isActionLoading={isActionLoading}
      />

      {/* Razorpay Standard Checkout Simulator Modal */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Fraud Ring Collusion Graph Modal */}
      <FraudRingGraph
        isOpen={isFraudRingOpen}
        onClose={() => setIsFraudRingOpen(false)}
        onBlockRing={(ringId) => {
          showToast(`Syndicate ${ringId} permanently blacklisted across Razorpay Network`, 'warning');
        }}
      />

      {/* Policy Threshold Simulator Modal */}
      <PolicySimulator
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        transactions={transactions}
      />
    </div>
  );
}
