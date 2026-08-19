import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

const MetricGlowCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'positive',
  icon: Icon,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-[#0D0D10] hover:bg-[#121216] border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Header: Title & Minimal Icon */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-400 tracking-normal">
          {title}
        </span>
        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
          <Icon size={14} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-zinc-100 font-mono tabular-nums">
          {value !== undefined ? value.toLocaleString() : '0'}
        </div>
      </div>

      {/* Footer: Trend Delta & Context */}
      <div className="mt-3 flex items-center gap-2 pt-2.5 border-t border-zinc-800/60 text-[11px]">
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 font-mono font-medium px-1.5 py-0.5 rounded text-[10px] ${
              changeType === 'positive'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : changeType === 'negative'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {changeType === 'positive' && <ArrowUpRight size={10} />}
            {change}
          </span>
        )}
        <span className="text-zinc-500 truncate text-[11px]">{subtitle || 'Live telemetry'}</span>
      </div>
    </div>
  );
};

export default MetricGlowCard;
