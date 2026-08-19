import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricGlowCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'positive', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  accentColor = 'cyan', // 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose'
  sparklineData = [10, 15, 12, 18, 24, 22, 28],
  onClick,
}) => {
  const colorMap = {
    cyan: {
      border: 'border-[#00F0FF]/20 hover:border-[#00F0FF]/40',
      glow: 'group-hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]',
      topLine: 'from-[#00F0FF] via-[#00F0FF]/40 to-transparent',
      iconBg: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
      stroke: '#00F0FF',
      gradientId: 'cyanGrad',
      badge: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      topLine: 'from-purple-500 via-purple-500/40 to-transparent',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      stroke: '#A855F7',
      gradientId: 'purpleGrad',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      topLine: 'from-emerald-500 via-emerald-500/40 to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      stroke: '#10B981',
      gradientId: 'emeraldGrad',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      topLine: 'from-amber-500 via-amber-500/40 to-transparent',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      stroke: '#F59E0B',
      gradientId: 'amberGrad',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      topLine: 'from-rose-500 via-rose-500/40 to-transparent',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      stroke: '#F43F5E',
      gradientId: 'roseGrad',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  };

  const scheme = colorMap[accentColor] || colorMap.cyan;

  // Generate SVG path for mini sparkline
  const minVal = Math.min(...sparklineData, 0);
  const maxVal = Math.max(...sparklineData, 1);
  const range = maxVal - minVal || 1;
  const width = 100;
  const height = 32;
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-[#111114] border ${scheme.border} rounded-2xl p-5 transition-all duration-300 ${scheme.glow} ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } overflow-hidden shadow-lg`}
    >
      {/* Top Ambient Glow Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${scheme.topLine}`} />

      {/* Header with Title & Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-xl border ${scheme.iconBg} flex items-center justify-center shadow-sm`}>
          <Icon size={16} />
        </div>
      </div>

      {/* Main Counter & Sparkline Row */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
            {value !== undefined ? value.toLocaleString() : '0'}
          </div>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Mini Sparkline Chart */}
        <div className="w-24 h-9 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={scheme.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={scheme.stroke} stopOpacity="0.3" />
                <stop offset="100%" stopColor={scheme.stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#${scheme.gradientId})`} />
            <polyline
              points={points}
              fill="none"
              stroke={scheme.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Change Pill Footer */}
      {change && (
        <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${scheme.badge}`}>
              {changeType === 'positive' && <TrendingUp size={11} />}
              {changeType === 'negative' && <TrendingDown size={11} />}
              {changeType === 'neutral' && <Minus size={11} />}
              {change}
            </span>
            <span className="text-[10px] text-gray-400">vs 7-day baseline</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricGlowCard;
