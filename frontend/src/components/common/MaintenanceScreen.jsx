import React from 'react';
import { Wrench, ShieldAlert, RefreshCw, Terminal, ExternalLink } from 'lucide-react';

const MaintenanceScreen = ({ title, message, onRetry }) => {
  return (
    <div className="fixed inset-0 bg-[#050508] z-[99999] flex items-center justify-center p-6 text-white font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-lg w-full bg-[#0D0D12] border border-red-500/20 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Animated Badge Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg shadow-red-950/50">
          <Wrench size={32} className="animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            SCHEDULED PLATFORM UPGRADE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title || 'System Under Scheduled Maintenance'}
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            {message || 'DevHub infrastructure is currently undergoing scheduled database maintenance. Services will resume shortly.'}
          </p>
        </div>

        {/* System Telemetry Pill */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left text-xs text-gray-400 font-mono space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="text-amber-400 font-semibold">All Fleets Paused</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Security Guard:</span>
            <span className="text-emerald-400">Zero Data Loss Verified</span>
          </div>
        </div>

        {/* Retry Button & Admin Bypass */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Check Status</span>
            </button>
          )}

          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
          >
            <ShieldAlert size={14} />
            <span>Admin Portal</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
