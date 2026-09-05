'use client';

import React, { useState } from 'react';
import { Transaction, RiskSeverity, TransactionStatus } from '@/lib/types';
import { 
  Search, 
  CheckCircle, 
  Clock, 
  Ban, 
  KeyRound, 
  Network, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  onSelectTransaction: (tx: Transaction) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  selectedTransaction,
  onSelectTransaction,
  onRefresh,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | RiskSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.billing_geo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.razorpay_order_id && tx.razorpay_order_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = severityFilter === 'all' || tx.risk_severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (score: number, severity: RiskSeverity) => {
    if (severity === 'high' || score >= 70) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
          <span className="font-mono">{score}</span> &bull; High Risk
        </span>
      );
    }
    if (severity === 'medium' || score >= 40) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          <span className="font-mono">{score}</span> &bull; Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        <span className="font-mono">{score}</span> &bull; Safe
      </span>
    );
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </span>
        );
      case 'held':
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Ops Hold
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
            <Ban className="w-3 h-3 mr-1" /> Blocked
          </span>
        );
      case 'challenged_3ds':
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            <KeyRound className="w-3 h-3 mr-1" /> 3DS Step-Up
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Pending
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1m ago';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-colors">
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/40 dark:bg-slate-950/40 transition-colors">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Txn ID, customer name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Severity Tabs */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                severityFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setSeverityFilter('high')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                severityFilter === 'high'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              High ({transactions.filter((t) => t.risk_severity === 'high').length})
            </button>
            <button
              onClick={() => setSeverityFilter('medium')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                severityFilter === 'medium'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              Medium ({transactions.filter((t) => t.risk_severity === 'medium').length})
            </button>
            <button
              onClick={() => setSeverityFilter('low')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                severityFilter === 'low'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              Safe ({transactions.filter((t) => t.risk_severity === 'low').length})
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
            title="Refresh transaction stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider transition-colors">
            <tr>
              <th scope="col" className="px-4 py-3">Transaction & Time</th>
              <th scope="col" className="px-4 py-3">Customer Identity</th>
              <th scope="col" className="px-4 py-3 text-right">Amount & Method</th>
              <th scope="col" className="px-4 py-3">Risk Assessment</th>
              <th scope="col" className="px-4 py-3">Primary Risk Driver (AI)</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                  No transactions match the selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isSelected = selectedTransaction?.id === tx.id;
                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-950/60'
                        : tx.risk_severity === 'high' && tx.status === 'pending'
                        ? 'bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/50 dark:hover:bg-rose-950/40'
                        : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Col 1: Transaction ID & Time */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-xs">
                          {tx.id}
                        </span>
                        {tx.fraud_ring_id && (
                          <span
                            className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 p-0.5 rounded border border-purple-200 dark:border-purple-800"
                            title="Linked to Fraud Ring Syndicate"
                          >
                            <Network className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3 inline text-slate-400 dark:text-slate-500" />
                        <span>{formatRelativeTime(tx.created_at)}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{tx.billing_geo.split(',')[0]}</span>
                      </div>
                    </td>

                    {/* Col 2: Customer Identity */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                          {tx.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-1">
                            <span>{tx.user.name}</span>
                            {tx.user.is_verified_kyc && (
                              <span title="KYC Verified">
                                <CheckCircle className="w-3 h-3 text-blue-500 inline" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
                            {tx.user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Col 3: Amount & Method */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                        {tx.payment_method}
                      </div>
                    </td>

                    {/* Col 4: Risk Assessment */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getSeverityBadge(tx.risk_score, tx.risk_severity)}
                    </td>

                    {/* Col 5: Primary Risk Driver */}
                    <td className="px-4 py-3.5">
                      <div className="max-w-xs">
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 font-medium">
                          {tx.top_factors[0] || 'Standard behavior'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                          {tx.rationale}
                        </p>
                      </div>
                    </td>

                    {/* Col 6: Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>

                    {/* Col 7: Action Chevron */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 p-1 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
