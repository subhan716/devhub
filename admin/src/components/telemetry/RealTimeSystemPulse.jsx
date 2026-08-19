import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Cpu, 
  Zap, 
  Radio, 
  ShieldCheck, 
  Clock, 
  CheckCircle 
} from 'lucide-react';

const RealTimeSystemPulse = () => {
  const [latency, setLatency] = useState(16);
  const [memoryUsage, setMemoryUsage] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      // Subtle pulse simulation for live feel
      setLatency(Math.floor(14 + Math.random() * 8));
      setMemoryUsage(Math.floor(38 + Math.random() * 6));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Live Cluster Pulse & Telemetry</h3>
            <p className="text-[11px] text-gray-400">Infrastructure Health & Real-time Services</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          99.99% SLA
        </span>
      </div>

      {/* Grid of Micro Telemetry Chips */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* API Gateway */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <Server size={13} className="text-[#00F0FF]" />
              API Gateway
            </span>
            <span className="text-emerald-400 font-mono font-bold">{latency}ms</span>
          </div>
          <p className="text-[10px] text-gray-500">Express 5.x / Port 5000</p>
        </div>

        {/* MongoDB Atlas */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <Database size={13} className="text-emerald-400" />
              MongoDB Atlas
            </span>
            <span className="text-emerald-400 font-mono font-bold">Optimal</span>
          </div>
          <p className="text-[10px] text-gray-500">Replica Set M0 / IXSCAN</p>
        </div>

        {/* Socket.IO Engine */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <Radio size={13} className="text-purple-400" />
              Socket.IO WebSockets
            </span>
            <span className="text-purple-400 font-mono font-bold">Connected</span>
          </div>
          <p className="text-[10px] text-gray-500">Broadcast Channels Active</p>
        </div>

        {/* Cloud Storage */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <ShieldCheck size={13} className="text-amber-400" />
              Cloudinary Media
            </span>
            <span className="text-amber-400 font-mono font-bold">Active</span>
          </div>
          <p className="text-[10px] text-gray-500">CDN Edge Delivery</p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeSystemPulse;
