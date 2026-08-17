import React from 'react';

const StatsCard = ({ title, value, change, icon: Icon, color = 'cyan' }) => {
  const colorMap = {
    cyan: {
      bg: 'bg-[#00F0FF]/10',
      border: 'border-[#00F0FF]/20',
      text: 'text-[#00F0FF]',
      glow: 'shadow-[0_0_15px_rgba(0,240,255,0.15)]'
    },
    green: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]'
    }
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.border} border ${scheme.glow}`}>
          <Icon className={`w-4 h-4 ${scheme.text}`} />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{value ?? 0}</h2>
        {change && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
