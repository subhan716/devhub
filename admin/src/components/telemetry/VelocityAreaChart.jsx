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
import { TrendingUp, Users, FileText } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    return (
      <div className="bg-[#121215] border border-zinc-700/80 p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="text-[11px] font-medium text-zinc-400">{label}</p>
        <p className="text-sm font-bold text-zinc-100 font-mono">
          {dataPoint.value.toLocaleString()} {dataPoint.name}
        </p>
      </div>
    );
  }
  return null;
};

const VelocityAreaChart = ({ trends }) => {
  const [activeMetric, setActiveMetric] = useState('signups');

  // Build 7-day data
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
    };
  });

  const totalSignups = chartData.reduce((acc, curr) => acc + curr.signups, 0);
  const totalPosts = chartData.reduce((acc, curr) => acc + curr.posts, 0);

  return (
    <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            Activity & Growth Velocity
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daily throughput across registrations and social feed posts
          </p>
        </div>

        {/* Minimalist Tab Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('signups')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeMetric === 'signups'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Signups ({totalSignups})
          </button>
          <button
            onClick={() => setActiveMetric('posts')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeMetric === 'posts'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Feed Posts ({totalPosts})
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f242d" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#52525B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#27272A' }}
            />
            <YAxis
              stroke="#52525B"
              fontSize={11}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              name={activeMetric === 'signups' ? 'Signups' : 'Feed Posts'}
              stroke="#00F0FF"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#metricGradient)"
              dot={{ fill: '#00F0FF', strokeWidth: 1.5, r: 3, stroke: '#0D0D10' }}
              activeDot={{ r: 5, fill: '#00F0FF', stroke: '#fff', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metric Quick Legend */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
          Trailing 7-Day Window
        </span>
        <span className="font-mono text-[11px] text-zinc-400">
          Peak: {Math.max(...chartData.map((d) => d[activeMetric]), 0)} actions/day
        </span>
      </div>
    </div>
  );
};

export default VelocityAreaChart;
