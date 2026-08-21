import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  UserPlus, 
  Briefcase, 
  TrendingUp, 
  Eye, 
  Share2, 
  Heart,
  Lightbulb,
  ExternalLink,
  Code2
} from 'lucide-react';

const ThreeDNetwork = () => {
  const [liked, setLiked] = useState(true);
  const [likeCount, setLikeCount] = useState(1428);
  const [connected, setConnected] = useState(false);

  // Mouse Parallax 3D Spring Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-8, 8]), springConfig);

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

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full relative flex items-center justify-center p-2 sm:p-6 perspective-1000 select-none"
    >
      {/* Background Ambient Glow Halo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/15 via-[#0A66C2]/10 to-[#8A2BE2]/15 blur-[120px] rounded-full pointer-events-none" />

      {/* 3D Motion Container */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full max-w-[540px] relative transition-transform duration-150 ease-out"
      >
        {/* 1. TOP FLOATING NOTIFICATION PILL */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ transform: "translateZ(50px)" }}
          className="absolute -top-6 left-6 right-6 sm:left-10 sm:right-10 z-30 flex items-center justify-between px-4 py-2 rounded-2xl bg-[#0D0D12]/90 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-medium">
              <strong className="text-white font-semibold">48 professionals</strong> viewed your profile
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#00F0FF]">
            <TrendingUp size={13} />
            <span>+24% this week</span>
          </div>
        </motion.div>

        {/* 2. MAIN CENTERPIECE: LINKEDIN-STYLE HIGH FIDELITY POST CARD */}
        <div 
          style={{ transform: "translateZ(25px)" }}
          className="bg-[#101015]/95 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-20 mt-4"
        >
          {/* Post Author Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Sarah Jenkins"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00F0FF]/40 shadow-md" 
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">Sarah Jenkins</h4>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20">
                    Lead Architect
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-tight">Head of Product at Horizon AI • 1st</p>
                <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                  <span>2h ago</span> • <span>🌐 Public</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => setConnected(!connected)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                connected 
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' 
                  : 'bg-gradient-to-r from-[#00F0FF] to-[#0A66C2] text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105'
              }`}
            >
              <UserPlus size={13} />
              <span>{connected ? 'Connected' : 'Connect'}</span>
            </button>
          </div>

          {/* Post Content */}
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed mb-4">
            Thrilled to announce that our open-source neural design system reached <strong className="text-white">10,000+ contributors</strong> today! 🚀 Collaborating with top engineers and product leaders globally has never been this seamless.
          </p>

          {/* Embedded Project Showcase Box */}
          <div className="rounded-xl bg-[#09090D] border border-white/10 p-3.5 mb-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F0FF]/10 blur-xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00F0FF]/20 flex items-center justify-center text-[#00F0FF]">
                  <Code2 size={14} />
                </div>
                <span className="text-xs font-bold text-white">horizon-core / v2.4</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Verified Repo
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono line-clamp-2">
              {`export const useGlobalNetwork = () => { return { status: "optimal", latency: "0.4ms" }; }`}
            </p>
          </div>

          {/* Post Reactions Stats */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center text-[8px] text-white">👍</span>
                <span className="w-4 h-4 rounded-full bg-[#8A2BE2] flex items-center justify-center text-[8px] text-white">💡</span>
                <span className="w-4 h-4 rounded-full bg-[#FF0055] flex items-center justify-center text-[8px] text-white">❤️</span>
              </div>
              <span className="font-semibold text-zinc-300">{likeCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>245 comments</span>
              <span>•</span>
              <span>88 reposts</span>
            </div>
          </div>

          {/* Post Action Buttons */}
          <div className="grid grid-cols-4 gap-1 pt-2">
            <button 
              onClick={handleLikeToggle}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                liked ? 'text-[#00F0FF] bg-[#00F0FF]/10' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ThumbsUp size={15} />
              <span>Like</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
              <MessageSquare size={15} />
              <span>Comment</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
              <Repeat2 size={15} />
              <span>Repost</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
              <Send size={15} />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* 3. FLOATING BOTTOM OPPORTUNITY & CHAT CARD */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ transform: "translateZ(60px)" }}
          className="absolute -bottom-8 -right-2 sm:-right-6 z-30 p-4 rounded-2xl bg-[#0B0B0F]/95 border border-[#8A2BE2]/40 backdrop-blur-2xl shadow-[0_15px_40px_rgba(138,43,226,0.25)] max-w-[280px] hidden sm:block"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                alt="David Kim"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-400/50" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0B0B0F]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">David Kim</p>
              <p className="text-[10px] text-purple-400 font-semibold">Venture Partner • Horizon Capital</p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-300 leading-snug bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
            "Loved your scalable systems post! Would you be open to collaborating on our new tech incubator?"
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThreeDNetwork;
