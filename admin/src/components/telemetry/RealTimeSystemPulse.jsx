import React, { useState, useEffect } from 'react';
import { Server, Database, Radio, ShieldCheck } from 'lucide-react';

const RealTimeSystemPulse = () => {
  const [latency, setLatency] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(12 + Math.random() * 6));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Infrastructure Health</h3>
          <p className="text-xs text-zinc-500">Core backend services & database status</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Healthy
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={13} className="text-zinc-400" />
            <span className="text-xs text-zinc-300 font-medium">API Gateway</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">{latency}ms</span>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={13} className="text-zinc-400" />
            <span className="text-xs text-zinc-300 font-medium">MongoDB</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Atlas M0</span>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={13} className="text-zinc-400" />
            <span className="text-xs text-zinc-300 font-medium">WebSockets</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">Live</span>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-zinc-400" />
            <span className="text-xs text-zinc-300 font-medium">Media CDN</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Active</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeSystemPulse;
