import React, { useState, useEffect } from 'react';
import ThreeDNetwork from '../components/ui/ThreeDNetwork';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Rocket, 
  Sparkles, 
  Globe2, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Code2, 
  Compass,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import AuthModal from '../components/auth/AuthModal';
import axios from 'axios';


const ICON_MAP = {
  Users: Users,
  Briefcase: Briefcase,
  Rocket: Rocket,
  Sparkles: Sparkles,
  Globe2: Globe2,
  Layers: Layers,
  Code2: Code2
};

const DEFAULT_CONFIG = {
  badgeText: 'The Universal Professional & Creator Network 🚀',
  heroTitlePrefix: 'The Network for',
  heroHighlight: 'Those Who Build, Create & Lead.',
  heroDescription: 'Connect with elite creators, tech founders, designers, and innovators. Showcase your work, land high-impact opportunities, and build global partnerships.',
  ctaPrimaryText: 'Start Networking',
  ctaPrimaryLink: '/register',
  ctaSecondaryText: 'Explore Ecosystem',
  ctaSecondaryLink: '#features',
  marqueeKeywords: [
    'Tech & Engineering',
    'Creative & Design',
    'Product & Leadership',
    'Founders & Startups',
    'AI & Data Science',
    'Growth & Marketing',
    'Venture & Capital'
  ],
  stats: {
    members: '50K+',
    projects: '120K+',
    collaborations: '95K+',
    countries: '140+'
  },
  features: [
    {
      icon: 'Users',
      color: '#00F0FF',
      title: 'Verified Professional Identity',
      desc: 'Showcase your real-world achievements, multi-disciplinary portfolio, and verified credentials in an interactive showcase.'
    },
    {
      icon: 'Briefcase',
      color: '#818CF8',
      title: 'Smart Co-Founder & Peer Matching',
      desc: 'Connect with engineers, designers, and marketers based on verified skill graphs and shared venture visions.'
    },
    {
      icon: 'Rocket',
      color: '#34D399',
      title: 'High-Impact Opportunities',
      desc: 'Land top tier remote roles, venture collaborations, and creator partnerships directly without recruitment noise.'
    }
  ]
};

const LandingPage = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const openAuth = (mode = 'login') => setAuthModal({ isOpen: true, mode });
  const closeAuth = () => setAuthModal({ isOpen: false, mode: 'login' });

  useEffect(() => {
    const fetchLandingConfig = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
        const res = await axios.get(`${apiUrl}/api/config/landing`);
        if (res.data?.success && res.data?.data) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...res.data.data
          });
        }
      } catch (err) {
        console.warn('Using default landing configuration:', err.message);
      }
    };
    fetchLandingConfig();
  }, []);

  return (
    <main className="min-h-screen bg-[#08080A] text-white overflow-x-hidden font-sans selection:bg-[#00F0FF]/20">
      <Navbar onOpenAuth={openAuth} />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Subtle Ambient Tech Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F0FF]/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#818CF8]/10 blur-[140px] rounded-full pointer-events-none" />
        
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 text-center lg:text-left z-20"
          >
            {/* Tasteful Accent Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] text-xs sm:text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(0,240,255,0.12)]">
              <Sparkles size={14} className="animate-spin duration-3000" />
              <span>{config.badgeText || 'The Universal Professional & Creator Network 🚀'}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] text-white">
              {config.heroTitlePrefix || 'The Network for'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#38BDF8] to-[#818CF8]">
                {config.heroHighlight || 'Those Who Build, Create & Lead.'}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {config.heroDescription || 'Connect with elite creators, tech founders, designers, and innovators. Showcase your work and build high-impact partnerships across the digital universe.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                type="button"
                onClick={() => openAuth('register')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm sm:text-base transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{config.ctaPrimaryText || 'Start Networking'}</span>
                <ArrowRight size={17} />
              </button>
              <a 
                href={config.ctaSecondaryLink || '#features'} 
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-colors text-center"
              >
                {config.ctaSecondaryText || 'Explore Ecosystem'}
              </a>
            </div>

            {/* Trust Proof */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#00F0FF]" />
                <span>Verified Identities</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Living High-Fidelity Product Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.2 }}
            className="w-full lg:w-1/2 min-h-[440px] sm:min-h-[520px] relative flex items-center justify-center"
          >
            <ThreeDNetwork />
          </motion.div>
        </div>
      </section>

      {/* 2. Global Metric Statistics Bar with Tasteful Accents */}
      <section className="py-12 border-y border-zinc-800/80 bg-zinc-950/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Global Innovators', value: config.stats?.members || '50K+', color: '#00F0FF' },
              { label: 'Published Projects', value: config.stats?.projects || '120K+', color: '#818CF8' },
              { label: 'Co-Founders & Teams', value: config.stats?.collaborations || '95K+', color: '#34D399' },
              { label: 'Countries Represented', value: config.stats?.countries || '140+', color: '#38BDF8' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: stat.color }}>
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-zinc-400 mt-1 uppercase font-semibold tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Dynamic Marquee Banner */}
      <section className="py-7 bg-[#060608] overflow-hidden relative border-b border-zinc-800/60">
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#08080A] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#08080A] to-transparent z-10" />
        <div className="flex w-[200%] animate-[marquee_28s_linear_infinite]">
          {[...Array(2)].map((_, loopIdx) => (
            <div key={loopIdx} className="flex justify-around w-1/2 items-center text-zinc-300 font-mono text-xs sm:text-sm font-semibold tracking-wide">
              {(config.marqueeKeywords || DEFAULT_CONFIG.marqueeKeywords).map((keyword, kIdx) => (
                <span key={kIdx} className="flex items-center gap-6">
                  <span>{keyword}</span>
                  <span className="text-[#00F0FF]/60">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pillars of the Ecosystem with Tasteful Accent Cards */}
      <section id="features" className="py-24 sm:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-3.5 py-1 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-bold uppercase tracking-widest mb-4">
              Universal Ecosystem
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Designed for Creators, Leaders & Builders
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
              A unified professional network built from the ground up to replace outdated resumes with living, verified portfolios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(config.features || DEFAULT_CONFIG.features).map((feature, i) => {
              const IconComp = ICON_MAP[feature.icon] || Users;
              const cardColor = feature.color || (i === 0 ? '#00F0FF' : i === 1 ? '#818CF8' : '#34D399');
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="p-8 rounded-2xl border border-zinc-800 bg-[#0D0D12] hover:border-zinc-700 transition-all shadow-xl relative overflow-hidden group"
                >
                  {/* Subtle top corner gradient accent */}
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-15 group-hover:opacity-30 transition-opacity rounded-full pointer-events-none"
                    style={{ backgroundColor: cardColor }}
                  />
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 border transition-colors"
                    style={{
                      backgroundColor: `${cardColor}15`,
                      borderColor: `${cardColor}30`,
                      color: cardColor
                    }}
                  >
                    <IconComp size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2.5 text-white group-hover:text-[#00F0FF] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How It Works (Steps) */}
      <section id="how-it-works" className="py-24 bg-[#060608] relative border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">How DevHub Works</h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-base sm:text-lg">
              Three simple steps to establish your authority and connect with top-tier collaborators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                icon: Users,
                step: '01',
                title: 'Build Living Portfolio',
                desc: 'Showcase projects, code snippets, visual designs, and verified accomplishments that prove your skills.'
              },
              {
                icon: Compass,
                step: '02',
                title: 'Engage & Broadcast',
                desc: 'Publish insights, launch co-founder searches, and participate in high-signal discussions.'
              },
              {
                icon: Rocket,
                step: '03',
                title: 'Scale Your Reach',
                desc: 'Collaborate with verified peers worldwide, land funding, or step into leadership roles.'
              }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-[#0A0A0E] border border-zinc-800/80 flex flex-col items-start relative group hover:border-zinc-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-[#00F0FF] mb-6">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final High-Impact CTA */}
      <section className="py-28 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white">
            Ready to build your next breakthrough?
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Join the universal network of digital innovators, founders, engineers, and creators.
          </p>
          <button
            type="button"
            onClick={() => openAuth('register')}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-base transition-all hover:scale-102 shadow-md cursor-pointer"
          >
            <span>Create Your Free Profile</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-10 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-7 h-7 object-contain rounded-lg drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
            <span className="text-lg font-bold text-white">Dev<span className="text-[#00F0FF]">Hub</span></span>
          </div>
          <p className="text-zinc-500 text-xs">© 2026 DevHub Inc. The Universal Professional Network.</p>
          <div className="flex gap-6 text-xs text-zinc-400">
            <Link to="/guidelines" className="hover:text-white transition-colors">Trust & Guidelines</Link>
            <Link to="/guidelines" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/guidelines" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* Interactive In-Context Auth Modal */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={closeAuth} 
        initialMode={authModal.mode} 
      />
    </main>
  );
};

export default LandingPage;
