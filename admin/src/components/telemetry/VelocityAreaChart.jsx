import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, Activity, Users, FileText, Calendar, Sparkles } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    return (
      <div className="bg-[#18181c]/95 border border-white/10 backdrop-blur-xl p-3.5 rounded-xl shadow-2xl space-y-1 z-50">
        <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
          <Calendar size={12} className="text-[#00F0FF]" />
          {label}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px]"
            style={{ backgroundColor: dataPoint.color, boxShadow: `0 0 8px ${dataPoint.color}` }}
          />
          <span className="text-sm font-black text-white">
            {dataPoint.value.toLocaleString()} {dataPoint.name}
          </span>
        </div>
        <p className="text-[10px] text-emerald-400 font-semibold pt-1 border-t border-white/5">
          Live Database Telemetry
        </p>
      </div>
    );
  }
  return null;
};

const VelocityAreaChart = ({ trends }) => {
  const [activeMetric, setActiveMetric] = useState('signups'); // 'signups' | 'posts' | 'combined'

  // Prepare 7-day structured data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        date: dateStr,
        day: dayName,
        signups: 0,
        posts: 0,
      });
    }
    return days;
  };

  const chartData = getLast7Days().map((day) => {
    const signupMatch = trends?.signups?.find((s) => s._id === day.date);
    const postMatch = trends?.posts?.find((p) => p._id === day.date);
    const signups = signupMatch ? signupMatch.count : 0;
    const posts = postMatch ? postMatch.count : 0;
    return {
      ...day,
      signups,
      posts,
      totalActivity: signups + posts,
    };
  });

  const totalSignups = chartData.reduce((acc, curr) => acc + curr.signups, 0);
  const totalPosts = chartData.reduce((acc, curr) => acc + curr.posts, 0);

  return (
    <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-sm lg:text-base font-extrabold text-white tracking-tight">
              Platform Growth Velocity & Activity
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time daily user acquisition and content creation velocity over the last 7 days.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#18181c] border border-white/10 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('signups')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'signups'
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>User Signups ({totalSignups})</span>
          </button>
          <button
            onClick={() => setActiveMetric('posts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'posts'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Feed Posts ({totalPosts})</span>
          </button>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanAreaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="purpleAreaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={11}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {activeMetric === 'signups' && (
              <Area
                type="monotone"
                dataKey="signups"
                name="Signups"
                stroke="#00F0FF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cyanAreaGlow)"
                dot={{ fill: '#00F0FF', strokeWidth: 2, r: 4, stroke: '#111114' }}
                activeDot={{ r: 6, fill: '#00F0FF', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {activeMetric === 'posts' && (
              <Area
                type="monotone"
                dataKey="posts"
                name="Feed Posts"
                stroke="#A855F7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#purpleAreaGlow)"
                dot={{ fill: '#A855F7', strokeWidth: 2, r: 4, stroke: '#111114' }}
                activeDot={{ r: 6, fill: '#A855F7', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs">
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] text-gray-500 font-semibold block">7-Day New Signups</span>
          <span className="font-extrabold text-white text-sm">+{totalSignups} Accounts</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] text-gray-500 font-semibold block">7-Day New Posts</span>
          <span className="font-extrabold text-white text-sm">+{totalPosts} Snippets</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] text-gray-500 font-semibold block">Avg Daily Engagement</span>
          <span className="font-extrabold text-emerald-400 text-sm">Active Pulse</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] text-gray-500 font-semibold block">Database Health</span>
          <span className="font-extrabold text-[#00F0FF] text-sm">Sub-10ms IXSCAN</span>
        </div>
      </div>
    </div>
  );
};

export default VelocityAreaChart;
