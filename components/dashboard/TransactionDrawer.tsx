'use client';

import React, { useState } from 'react';
import { Transaction, TransactionStatus } from '@/lib/types';
import { 
  X, 
  Bot, 
  Send, 
  Info,
} from 'lucide-react';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onAction: (transactionId: string, action: TransactionStatus, note?: string) => void;
  isActionLoading: boolean;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction,
  onClose,
  onAction,
  isActionLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'copilot' | 'audit'>('overview');
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'copilot'; text: string }>>([]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  if (!transaction) return null;

  const getBorderColor = (severity: string) => {
    if (severity === 'high') return 'border-rose-500';
    if (severity === 'medium') return 'border-amber-500';
    return 'border-emerald-500';
  };

  const handleAskCopilot = async (q?: string) => {
    const question = q || copilotQuestion;
    if (!question.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setCopilotQuestion('');
    setIsCopilotThinking(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          question,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: data.answer || 'Unable to generate copilot rationale at this moment.',
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: 'Error connecting to Risk CoPilot service. Please verify network.',
        },
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs flex justify-end transition-colors">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{transaction.id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                {transaction.payment_method.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Razorpay Order: {transaction.razorpay_order_id} &bull; {new Date(transaction.created_at).toLocaleTimeString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex space-x-6 text-xs font-semibold transition-colors">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Risk Overview & Factors
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'copilot'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ask Risk CoPilot</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Audit History
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* Score & Gauge Hero Card */}
              <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-4 border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Composite Risk Score
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span
                        className={`text-4xl font-extrabold font-mono ${
                          transaction.risk_score >= 70
                            ? 'text-rose-600 dark:text-rose-400'
                            : transaction.risk_score >= 40
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {transaction.risk_score}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-sm">/ 100</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          transaction.risk_severity === 'high'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : transaction.risk_severity === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {transaction.risk_severity} Severity
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Order Amount</span>
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Deterministic rule score (auditable)</span>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Confidence: {(transaction.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Plain-English AI Rationale Box */}
              <div className={`bg-white dark:bg-slate-950/90 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 shadow-xs transition-colors ${getBorderColor(transaction.risk_severity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Explainable AI Rationale</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    SHAP-Grounded
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {transaction.rationale}
                </p>

                {/* Top Factors Chips */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Key Drivers:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {transaction.top_factors.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Playbook */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-900/60 transition-colors">
                <div className="flex items-center space-x-1.5 mb-1 text-blue-900 dark:text-blue-300 font-semibold text-xs">
                  <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Recommended Ops Playbook</span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                  {transaction.recommended_action === 'blocked'
                    ? 'Hard Block: Do not fulfill. Flag payment ID in Razorpay dashboard to prevent repeat cycling.'
                    : transaction.recommended_action === 'challenged_3ds'
                    ? 'Step-up Authentication: Require biometric/OTP step-up, or call recipient to verify high-ticket delivery.'
                    : transaction.recommended_action === 'held'
                    ? 'Manual Review: Verify courier address against customer billing records before handover.'
                    : 'Auto-Approve: Low risk indicators across all dimensions. Proceed with fulfillment.'}
                </p>
              </div>

              {/* Factor Contribution Breakdown (SHAP-style Feature Impact) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Feature Risk Contributions
                </h4>
                <div className="space-y-2.5">
                  {transaction.feature_contributions.map((fc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{fc.label}</span>
                        <span
                          className={`font-mono font-bold ${
                            fc.risk_contribution > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {fc.risk_contribution > 0 ? `+${fc.risk_contribution}` : `${fc.risk_contribution}`} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>Current: <strong className="text-slate-700 dark:text-slate-300">{fc.value}</strong></span>
                        <span>Baseline: <strong className="text-slate-700 dark:text-slate-300">{fc.baseline}</strong></span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                        {fc.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Device Telemetry Grid */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                  Identity & Telemetry Context
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Customer</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{transaction.user.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{transaction.user.phone}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Hardware / OS</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5 truncate">{transaction.device.os}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">{transaction.device.browser}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">IP Network</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{transaction.ip_address}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {transaction.device.is_vpn_detected ? 'VPN / Proxy Flagged' : 'Residential IP'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Route Geo</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5 truncate">
                      {transaction.billing_geo}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                      &rarr; {transaction.shipping_geo}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'copilot' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 transition-colors">
                <p className="font-semibold">Risk CoPilot Assistant</p>
                <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                  Ask real questions about this transaction, customer history, chargeback probabilities, or dispatch safety.
                </p>
              </div>

              {/* Preset Query Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Suggested Questions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Does this user have chargeback history?',
                    'Why was this order flagged?',
                    'Is the device recognized or new?',
                    'Should our team dispatch this package?',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskCopilot(q)}
                      className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 min-h-[220px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-3 overflow-y-auto transition-colors">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs text-center p-4">
                    <Bot className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-600" />
                    Click a suggested question above or type below to analyze risk factors interactively.
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isCopilotThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                      <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                      <span>CoPilot analyzing telemetry...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="Ask Risk CoPilot about this order..."
                  value={copilotQuestion}
                  onChange={(e) => setCopilotQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskCopilot()}
                  className="flex-1 text-xs border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors"
                />
                <button
                  onClick={() => handleAskCopilot()}
                  disabled={!copilotQuestion.trim() || isCopilotThinking}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Immutable Audit Trail</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  All automated evaluations, merchant overrides, and API webhooks are signed and persisted.
                </p>
              </div>

              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-3 py-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">System Risk Ingestion</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{new Date(transaction.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Calculated initial composite score: {transaction.risk_score}/100. Status set to {transaction.status.toUpperCase()}.
                  </p>
                </div>

                {transaction.actioned_at && (
                  <div className="border-l-2 border-emerald-500 pl-3 py-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Merchant Manual Override</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{new Date(transaction.actioned_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Actioned by {transaction.actioned_by || 'Ops Specialist'}. Status updated to {transaction.status.toUpperCase()}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between gap-2 transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current: <strong className="uppercase text-slate-800 dark:text-slate-200">{transaction.status}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAction(transaction.id, 'approved')}
              disabled={isActionLoading || transaction.status === 'approved'}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              Approve
            </button>

            <button
              onClick={() => onAction(transaction.id, 'challenged_3ds')}
              disabled={isActionLoading || transaction.status === 'challenged_3ds'}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              3DS Step-Up
            </button>

            <button
              onClick={() => onAction(transaction.id, 'held')}
              disabled={isActionLoading || transaction.status === 'held'}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              Hold
            </button>

            <button
              onClick={() => onAction(transaction.id, 'blocked')}
              disabled={isActionLoading || transaction.status === 'blocked'}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
