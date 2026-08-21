import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Flame, 
  Zap, 
  Code2, 
  Share2, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Briefcase
} from 'lucide-react';

const ThreeDNetwork = ({ onActionClick }) => {
  // Mouse Parallax 3D Spring Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 140 };
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-6, 6]), springConfig);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-[480px] sm:h-[540px] relative flex items-center justify-center select-none perspective-1000 p-2 sm:p-4"
    >
      {/* Background Soft Tech Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/10 via-[#818CF8]/10 to-transparent blur-[130px] rounded-full pointer-events-none" />

      {/* 3D App Window Mockup (Linear / Supabase Style) */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onClick={onActionClick}
        className="w-full max-w-[530px] rounded-2xl bg-[#0C0C11] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden cursor-pointer group transition-all relative z-20 hover:border-white/20"
      >
        {/* ===================================================
            1. TOP WINDOW TITLE BAR (Mac Controls & Tab Pill)
           =================================================== */}
        <div className="px-4 py-3 bg-[#08080C] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]/80 border border-[#E0443E]/40" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]/80 border border-[#DEA123]/40" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]/80 border border-[#1AAB29]/40" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-zinc-400">
            <span className="text-[#00F0FF]">devhub.app</span>
            <span className="text-zinc-600">/</span>
            <span>workspace</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">4.8k live</span>
          </div>
        </div>

        {/* ===================================================
            2. SECONDARY SUB-HEADER (Filters & Search Pill)
           =================================================== */}
        <div className="px-4 py-2.5 bg-[#0A0A0E]/80 border-b border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold text-[11px] flex items-center gap-1">
              <Flame size={12} className="text-[#00F0FF]" />
              <span>Trending</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white text-[11px] font-medium">
              Startups & AI
            </span>
            <span className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white text-[11px] font-medium hidden sm:inline-block">
              Architecture
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
            <Search size={12} />
            <span>Search graph...</span>
          </div>
        </div>

        {/* ===================================================
            3. MAIN FEED PREVIEW (High-Fidelity Verified Content)
           =================================================== */}
        <div className="p-5 space-y-4">
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                alt="Sarah Jenkins" 
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/15 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">Sarah Jenkins</h4>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25">
                    Lead Architect
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Head of Systems at Horizon AI • 2h ago</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white text-zinc-950 shadow-sm flex items-center gap-1 group-hover:bg-zinc-200 transition-colors">
              <span>+ Connect</span>
            </span>
          </div>

          {/* Post Excerpt */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            Just shipped v2.4 of our neural inference engine. Benchmarking <strong className="text-white">10x faster latency</strong> across distributed edge clusters globally.
          </p>

          {/* Embedded Code / Metric Tag Box */}
          <div className="p-3 rounded-xl bg-[#060609] border border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF]">
                <Code2 size={13} />
              </div>
              <span className="font-mono text-zinc-300 text-[11px]">horizon-core/inference.ts</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-emerald-400">● 0.4ms latency</span>
              <span className="text-zinc-500">|</span>
              <span className="text-[#38BDF8]">12.4k stars</span>
            </div>
          </div>

          {/* Post Metric Bar */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400 border-t border-white/[0.06]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <ThumbsUp size={13} className="text-[#00F0FF]" />
                <strong className="text-white">1,428</strong>
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <MessageSquare size={13} />
                <span>245 comments</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Universal Graph</span>
          </div>
        </div>

        {/* ===================================================
            4. FLOATING OPPORTUNITY CARD (Bottom Right Accent)
           =================================================== */}
        <div className="px-4 py-2.5 bg-[#09090D] border-t border-white/[0.08] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#818CF8]" />
            <span className="text-zinc-300 font-medium">
              <strong className="text-white">David Kim</strong> (Partner @ Apex) shared an opportunity
            </span>
          </div>
          <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-0.5">
            <span>Explore</span>
            <ArrowUpRight size={12} />
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default ThreeDNetwork;
