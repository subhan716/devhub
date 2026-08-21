import React, { useState, useEffect, lazy, Suspense } from 'react';
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
  Palette, 
  Code2, 
  Compass,
  ArrowRight,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import axios from 'axios';

// Lazy load the 3D Holographic Core component for optimal performance
const ThreeDNetwork = lazy(() => import('../components/ui/ThreeDNetwork'));

const ICON_MAP = {
  Users: Users,
  Briefcase: Briefcase,
  Rocket: Rocket,
  Sparkles: Sparkles,
  Globe2: Globe2,
  Layers: Layers,
  Palette: Palette,
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
      color: '#FF0055',
      title: 'Smart Co-Founder & Peer Matching',
      desc: 'Connect with engineers, designers, and marketers based on verified skill graphs and shared venture visions.'
    },
    {
      icon: 'Rocket',
      color: '#8A2BE2',
      title: 'High-Impact Opportunities',
      desc: 'Land top tier remote roles, venture collaborations, and creator partnerships directly without recruitment noise.'
    }
  ],
  model3DConfig: {
    speed: 1.0,
    coreColor: '#00F0FF',
    secondaryColor: '#8A2BE2'
  }
};

const LandingPage = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

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
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden font-sans selection:bg-[#00F0FF]/30">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Subtle Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 text-center lg:text-left z-20"
          >
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] text-xs sm:text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <Sparkles size={14} className="animate-spin duration-3000" />
              <span>{config.badgeText || 'The Universal Professional & Creator Network 🚀'}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08]">
              {config.heroTitlePrefix || 'The Network for'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#8A2BE2] to-[#FF0055]">
                {config.heroHighlight || 'Those Who Build, Create & Lead.'}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {config.heroDescription || 'Connect with elite creators, tech founders, designers, and innovators. Showcase your work and build high-impact partnerships across the digital universe.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link 
                to={config.ctaPrimaryLink || '/register'} 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0A66C2] hover:opacity-90 text-black font-extrabold text-base transition-all hover:scale-105 shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
              >
                <span>{config.ctaPrimaryText || 'Start Networking'}</span>
                <ArrowRight size={18} />
              </Link>
              <a 
                href={config.ctaSecondaryLink || '#features'} 
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-base backdrop-blur-md transition-all hover:border-white/30 text-center"
              >
                {config.ctaSecondaryText || 'Explore Ecosystem'}
              </a>
            </div>

            {/* Micro Trust Proof */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#00F0FF]" />
                <span>Verified Identities</span>
              </div>
            </div>
          </motion.div>

          {/* Right: 3D Holographic Core Interactive Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="w-full lg:w-1/2 h-[420px] sm:h-[500px] lg:h-[620px] relative flex items-center justify-center"
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#00F0FF]/20 border-t-[#00F0FF] rounded-full animate-spin" />
              </div>
            }>
              <ThreeDNetwork config={config.model3DConfig} />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* 2. Global Metric Statistics Bar */}
      <section className="py-12 border-y border-white/10 bg-white/[0.02] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Global Innovators', value: config.stats?.members || '50K+', color: '#00F0FF' },
              { label: 'Published Projects', value: config.stats?.projects || '120K+', color: '#8A2BE2' },
              { label: 'Co-Founders & Teams', value: config.stats?.collaborations || '95K+', color: '#FF0055' },
              { label: 'Countries Represented', value: config.stats?.countries || '140+', color: '#10B981' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: stat.color }}>
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 mt-1 uppercase font-semibold tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Dynamic Marquee Banner */}
      <section className="py-8 bg-[#070707] overflow-hidden relative border-b border-white/5">
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />
        <div className="flex w-[200%] animate-[marquee_25s_linear_infinite]">
          {[...Array(2)].map((_, loopIdx) => (
            <div key={loopIdx} className="flex justify-around w-1/2 items-center text-gray-400 font-mono text-sm sm:text-base font-bold tracking-wide">
              {(config.marqueeKeywords || DEFAULT_CONFIG.marqueeKeywords).map((keyword, kIdx) => (
                <span key={kIdx} className="flex items-center gap-6">
                  <span>{keyword}</span>
                  <span className={kIdx % 3 === 0 ? "text-[#00F0FF]" : kIdx % 3 === 1 ? "text-[#FF0055]" : "text-[#8A2BE2]"}>●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pillars of the Ecosystem (Features) */}
      <section id="features" className="py-24 sm:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
              Universal Ecosystem
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Designed for Creators, Leaders & Builders
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
              A unified social ecosystem built from the ground up to replace outdated resumes with living, verified portfolios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(config.features || DEFAULT_CONFIG.features).map((feature, i) => {
              const IconComp = ICON_MAP[feature.icon] || Users;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all shadow-2xl"
                >
                  <div
                    className="absolute -top-10 -right-10 w-36 h-36 blur-3xl opacity-10 group-hover:opacity-25 transition-opacity rounded-full"
                    style={{ backgroundColor: feature.color }}
                  />
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border"
                    style={{
                      backgroundColor: `${feature.color}15`,
                      borderColor: `${feature.color}35`
                    }}
                  >
                    <IconComp color={feature.color} size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#00F0FF] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How It Works (Steps) */}
      <section id="how-it-works" className="py-24 bg-[#050505] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">How DevHub Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base sm:text-lg">
              Three simple steps to establish your authority and connect with top-tier collaborators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-[#00F0FF] via-[#8A2BE2] to-[#FF0055] opacity-20" />

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
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-[#0E0E0E] border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-2xl">
                  <item.icon className="text-gray-300" size={38} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#8A2BE2] flex items-center justify-center text-xs font-extrabold text-black">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final High-Impact CTA */}
      <section className="py-28 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Ready to build your next breakthrough?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the universal network of digital innovators, founders, engineers, and creators.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white hover:bg-gray-100 text-black font-extrabold text-lg transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <span>Create Your Free Profile</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-8 h-8 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            <span className="text-xl font-bold text-white">Dev<span className="text-[#00F0FF]">Hub</span></span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 DevHub Inc. The Universal Professional Network.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/guidelines" className="hover:text-white transition-colors">Trust & Guidelines</Link>
            <Link to="/guidelines" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/guidelines" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
