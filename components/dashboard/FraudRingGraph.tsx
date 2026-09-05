'use client';

import React, { useState } from 'react';
import { 
  X, 
  Network, 
  ShieldAlert, 
  AlertTriangle, 
  Users, 
  Smartphone, 
  Globe, 
  CreditCard, 
  Ban, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { MOCK_FRAUD_RINGS } from '@/lib/mock-data';

interface FraudRingGraphProps {
  isOpen: boolean;
  onClose: () => void;
  onBlockRing?: (ringId: string) => void;
}

export const FraudRingGraph: React.FC<FraudRingGraphProps> = ({
  isOpen,
  onClose,
  onBlockRing,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  if (!isOpen) return null;

  const ring = MOCK_FRAUD_RINGS[0];

  const handleBlock = () => {
    setIsBlocked(true);
    if (onBlockRing) onBlockRing(ring.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">{ring.name}</h3>
                <span className="bg-rose-500/20 text-rose-300 text-xs px-2 py-0.5 rounded font-mono font-semibold border border-rose-500/30">
                  HIGH SEVERITY SYNDICATE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Multi-Account Collusion & Botnet Card Cycling Detected across 4 Entities
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

        {/* Ring Metrics Banner */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 p-4 grid grid-cols-3 gap-3 text-xs transition-colors">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">GMV at Direct Risk</span>
            <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
              ₹{ring.total_gmv_at_risk.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Linked Entities</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {ring.entity_count} Nodes (2 Users, 2 Hardware FP)
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Syndicate Pattern</span>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-400 block truncate">
              Card Testing & RTO Botnet
            </span>
          </div>
        </div>

        {/* Interactive Visual Network Canvas */}
        <div className="p-6 bg-slate-950 relative min-h-[300px] flex items-center justify-center overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {/* SVG Connection Vectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-purple-500/50 stroke-2">
            {/* Center to User 1 */}
            <line x1="50%" y1="50%" x2="22%" y2="28%" strokeDasharray="4 4" className="animate-pulse" />
            {/* Center to User 2 */}
            <line x1="50%" y1="50%" x2="78%" y2="28%" strokeDasharray="4 4" className="animate-pulse" />
            {/* Center to Device 1 */}
            <line x1="50%" y1="50%" x2="22%" y2="72%" strokeDasharray="4 4" className="animate-pulse" />
            {/* Center to Device 2 */}
            <line x1="50%" y1="50%" x2="78%" y2="72%" strokeDasharray="4 4" className="animate-pulse" />
          </svg>

          {/* Center Hub: Shared Tor Exit Node & IP */}
          <div className="relative z-10 flex flex-col items-center">
            <div 
              onClick={() => setSelectedEntity('tor_hub')}
              className="w-16 h-16 rounded-2xl bg-purple-600/90 hover:bg-purple-600 text-white flex flex-col items-center justify-center shadow-lg border-2 border-purple-400 cursor-pointer transition-transform hover:scale-105"
            >
              <Globe className="w-6 h-6" />
              <span className="text-[10px] font-bold mt-0.5">Tor IP</span>
            </div>
            <span className="text-[11px] font-mono text-purple-300 font-semibold mt-1">185.220.101.4</span>
          </div>

          {/* Node Top Left: Rohan Verma (Burner) */}
          <div 
            onClick={() => setSelectedEntity('user_burner')}
            className="absolute top-6 left-8 flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-rose-400 border border-rose-500/50 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 mt-1">Rohan Verma</span>
            <span className="text-[10px] text-rose-400 font-mono">Burner (1d old)</span>
          </div>

          {/* Node Top Right: Vikramaditya Roy */}
          <div 
            onClick={() => setSelectedEntity('user_vikram')}
            className="absolute top-6 right-8 flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-amber-400 border border-amber-500/50 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 mt-1">Vikramaditya Roy</span>
            <span className="text-[10px] text-amber-400 font-mono">4 RTO Disputes</span>
          </div>

          {/* Node Bottom Left: Android Emulator */}
          <div 
            onClick={() => setSelectedEntity('device_emulator')}
            className="absolute bottom-6 left-8 flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-blue-400 border border-blue-500/50 flex items-center justify-center shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 mt-1">Android Emulator</span>
            <span className="text-[10px] text-slate-400 font-mono">fp_cloned_88</span>
          </div>

          {/* Node Bottom Right: Shared UPI Handle */}
          <div 
            onClick={() => setSelectedEntity('upi_vpa')}
            className="absolute bottom-6 right-8 flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/50 flex items-center justify-center shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 mt-1">Shared UPI VPA</span>
            <span className="text-[10px] text-emerald-400 font-mono">quickcash29@okhdfc</span>
          </div>
        </div>

        {/* Entity Deep-Dive Card */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-1">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Thirdwatch Graph Intelligence Insight:</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            These accounts use distinct customer names and phone numbers, but converge on identical hardware fingerprints and Tor exit relays within an 18-minute window. This indicates an organized carding bot attempting credential cycling.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isBlocked ? (
              <span className="text-rose-600 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-rose-600 inline" />
                <span>Ring Blacklisted & Synced with Razorpay Risk Shield</span>
              </span>
            ) : (
              <span>Status: Active Syndicate Under Monitoring</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Close Graph
            </button>
            <button
              onClick={handleBlock}
              disabled={isBlocked}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{isBlocked ? 'Ring Blacklisted' : 'Block Entire Fraud Ring'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
