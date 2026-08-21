import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Sparkles, 
  Globe, 
  Zap, 
  Cpu, 
  Share2, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Code2
} from 'lucide-react';

const NODES = [
  {
    id: 'node-1',
    name: 'Sarah Jenkins',
    role: 'AI Systems Architect',
    company: 'Horizon AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    color: '#00F0FF',
    x: -160,
    y: -90,
    delay: 0
  },
  {
    id: 'node-2',
    name: 'David Kim',
    role: 'Venture Partner',
    company: 'Apex Capital',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    color: '#818CF8',
    x: 160,
    y: -80,
    delay: 0.2
  },
  {
    id: 'node-3',
    name: 'Elena Rostova',
    role: 'Lead UI/UX Designer',
    company: 'Studio Form',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    color: '#34D399',
    x: 140,
    y: 110,
    delay: 0.4
  },
  {
    id: 'node-4',
    name: 'Marcus Chen',
    role: 'Founding Engineer',
    company: 'NexusDB',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    color: '#38BDF8',
    x: -150,
    y: 100,
    delay: 0.6
  }
];

const ThreeDNetwork = ({ onActionClick }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Mouse Parallax 3D Spring Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 120 };
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
    setHoveredNode(null);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-[460px] sm:h-[520px] relative flex items-center justify-center select-none perspective-1000"
    >
      {/* Background Soft Glow Halos */}
      <div className="absolute w-80 h-80 bg-[#00F0FF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute w-72 h-72 bg-[#818CF8]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* 3D Motion Container */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-[480px] h-[400px] flex items-center justify-center"
      >
        {/* SVG Synapse Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="indigoLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="emeraldLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="skyLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Lines from Center Hub (240, 200) to Outer Nodes */}
          {/* Node 1 (80, 110) */}
          <line 
            x1="240" y1="200" x2="80" y2="110" 
            stroke="url(#cyanLine)" 
            strokeWidth={hoveredNode === 'node-1' ? "2.5" : "1.5"} 
            strokeDasharray="4 4" 
            className="transition-all duration-300"
          />
          {/* Node 2 (400, 120) */}
          <line 
            x1="240" y1="200" x2="400" y2="120" 
            stroke="url(#indigoLine)" 
            strokeWidth={hoveredNode === 'node-2' ? "2.5" : "1.5"} 
            strokeDasharray="4 4" 
            className="transition-all duration-300"
          />
          {/* Node 3 (380, 310) */}
          <line 
            x1="240" y1="200" x2="380" y2="310" 
            stroke="url(#emeraldLine)" 
            strokeWidth={hoveredNode === 'node-3' ? "2.5" : "1.5"} 
            strokeDasharray="4 4" 
            className="transition-all duration-300"
          />
          {/* Node 4 (90, 300) */}
          <line 
            x1="240" y1="200" x2="90" y2="300" 
            stroke="url(#skyLine)" 
            strokeWidth={hoveredNode === 'node-4' ? "2.5" : "1.5"} 
            strokeDasharray="4 4" 
            className="transition-all duration-300"
          />
          {/* Cross Mesh Links */}
          <line x1="80" y1="110" x2="400" y2="120" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="400" y1="120" x2="380" y2="310" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="380" y1="310" x2="90" y2="300" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="90" y1="300" x2="80" y2="110" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* ===================================================
            CENTERPIECE: DEVHUB NEURAL HUB (Central Nexus)
           =================================================== */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(30px)" }}
          onClick={onActionClick}
          className="w-24 h-24 rounded-3xl bg-[#0D0D12] border border-[#00F0FF]/40 shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col items-center justify-center relative cursor-pointer group z-20 hover:border-[#00F0FF] transition-all"
        >
          {/* Concentric Pulse Ring */}
          <div className="absolute -inset-2 rounded-3xl border border-[#00F0FF]/20 animate-ping pointer-events-none" />
          
          <img src="/images/logo.png" alt="DevHub" className="w-10 h-10 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.6)] group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-mono font-bold text-white mt-1">
            Dev<span className="text-[#00F0FF]">Hub</span>
          </span>
        </motion.div>

        {/* ===================================================
            OUTER NODES: VERIFIED PEERS & CREATOR CARDS
           =================================================== */}
        {NODES.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -6, 0]
            }}
            transition={{ 
              opacity: { delay: node.delay, duration: 0.5 },
              scale: { delay: node.delay, duration: 0.5 },
              y: { duration: 3.5 + node.delay, repeat: Infinity, ease: "easeInOut", delay: node.delay }
            }}
            style={{ 
              transform: `translate3d(${node.x}px, ${node.y}px, 40px)`
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={onActionClick}
            className="absolute z-30 cursor-pointer group"
          >
            <div className="p-2.5 rounded-2xl bg-[#0E0E14]/95 border border-white/10 shadow-2xl backdrop-blur-xl flex items-center gap-3 hover:border-white/25 transition-all group-hover:scale-105">
              <div className="relative">
                <img 
                  src={node.avatar} 
                  alt={node.name} 
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20"
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0E0E14]"
                  style={{ backgroundColor: node.color }}
                />
              </div>

              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">{node.name}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/5 text-zinc-300 border border-white/10">
                    ✓
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium truncate max-w-[110px]">{node.role}</p>
                <p className="text-[9px] text-zinc-500 font-mono truncate">{node.company}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* ===================================================
            BOTTOM TELEMETRY PILL (Global Connectivity Live Proof)
           =================================================== */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{ transform: "translateZ(50px)" }}
          onClick={onActionClick}
          className="absolute -bottom-6 z-30 px-4 py-2 rounded-2xl bg-[#0E0E14]/90 border border-white/10 shadow-2xl flex items-center gap-2.5 backdrop-blur-xl cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-300 font-medium">
            <strong className="text-white font-semibold">4,820 live connections</strong> active across 140 countries
          </span>
          <span className="text-xs text-[#00F0FF] font-bold ml-1">Connect →</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThreeDNetwork;
