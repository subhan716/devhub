import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Users, Briefcase, TerminalSquare, Rocket, GitBranch, Quote } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ThreeDNetwork from '../components/ui/ThreeDNetwork';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden font-sans selection:bg-[#00F0FF]/30">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 pt-10 text-center lg:text-left z-20"
          >
            <div className="inline-block px-4 py-1.5 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] text-sm font-semibold mb-6">
              v1.0 is now live 🚀
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
              The Network for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#8A2BE2] to-[#FF0055]">
                Those Who Build.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Connect with elite developers, showcase your code, and build your professional portfolio in an ecosystem designed exclusively for engineers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-white font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_40px_rgba(138,43,226,0.4)]">
                Start Networking
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-md transition-all">
                Explore Features
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }}
            className="w-full lg:w-1/2 h-[400px] lg:h-[600px] mt-12 lg:mt-0 relative"
          >
            <div className="absolute inset-0 bg-[#00F0FF] opacity-20 blur-[120px] rounded-full" />
            <ThreeDNetwork />
          </motion.div>
        </div>
      </section>

      {/* 2. Tech Stack Marquee (Trust Banner) */}
      <section className="py-10 border-y border-white/5 bg-white/[0.01] overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />
        <div className="flex w-[200%] animate-[marquee_20s_linear_infinite]">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="flex justify-around w-1/2 items-center text-gray-500 font-mono text-xl md:text-2xl font-bold opacity-50">
              <span>Engineering</span><span className="text-[#00F0FF]">●</span>
              <span>Business</span><span className="text-[#FF0055]">●</span>
              <span>Design</span><span className="text-[#8A2BE2]">●</span>
              <span>Marketing</span><span className="text-[#00F0FF]">●</span>
              <span>Management</span><span className="text-[#FF0055]">●</span>
              <span>Startups</span><span className="text-[#8A2BE2]">●</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Professionals</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A unified platform for professionals across every field to connect, showcase their best work, and grow their network.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              icon: Users, color: '#00F0FF', title: 'Professional Profiles', desc: 'Showcase your skills, your portfolio, and your best accomplishments in a profile that actually matters.'
            }, {
              icon: Briefcase, color: '#FF0055', title: 'Global Networking', desc: 'Connect with professionals based on their exact expertise. Need a startup founder or a marketing expert? Find them instantly.'
            }, {
              icon: Rocket, color: '#8A2BE2', title: 'Career Growth', desc: 'Discover opportunities or let recruiters find you based on your actual work, not just your resume keywords.'
            }].map((feature, i) => (
              <motion.div key={i} whileHover={{ y: -10 }} className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl transition-all opacity-10 group-hover:opacity-20`} style={{ backgroundColor: feature.color }} />
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 border" style={{ backgroundColor: `${feature.color}20`, borderColor: `${feature.color}30` }}>
                  <feature.icon color={feature.color} size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works (Steps) */}
      <section className="py-24 bg-[#050505] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Three simple steps to elevate your developer presence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-[#00F0FF] via-[#8A2BE2] to-[#FF0055] opacity-20" />

            {[{
              icon: Users, step: "01", title: 'Create Identity', desc: 'Build your professional profile. Add your expertise, bio, and portfolio links.'
            }, {
              icon: Briefcase, step: "02", title: 'Share Work', desc: 'Post your achievements, articles, or discuss industry trends with peers.'
            }, {
              icon: Rocket, step: "03", title: 'Get Discovered', desc: 'Collaborate on new ventures, find co-founders, or land your next big role.'
            }].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <item.icon className="text-gray-300" size={40} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#8A2BE2] flex items-center justify-center text-xs font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00F0FF]/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to elevate your tech career?</h2>
          <p className="text-xl text-gray-400 mb-10">Join thousands of developers building the future.</p>
          <Link to="/register" className="inline-block px-10 py-5 rounded-lg bg-white text-black font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            Create Your Profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold">Dev<span className="text-[#00F0FF]">Hub</span></span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 DevHub. Built for the developer community.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
