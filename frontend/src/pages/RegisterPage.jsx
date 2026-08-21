import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const getPasswordStrength = () => {
    const pwd = formData.password || '';
    if (!pwd) return { score: 0, label: '', color: 'bg-zinc-800' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score === 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Strong', color: 'bg-[#00F0FF]' };
    return { score: 100, label: 'Enterprise Grade', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength();

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com'}/api/auth/google`;
  };

  const handleGithubAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com'}/api/auth/github`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrors({
        name: !formData.name ? 'Full name is required' : null,
        email: !formData.email ? 'Email address is required' : null,
        password: !formData.password ? 'Password is required' : null
      });
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(`${apiUrl}/api/auth/register`, formData);
      toast.success('Verification code dispatched to your email!');
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col lg:flex-row font-sans selection:bg-[#00F0FF]/30">
      {/* LEFT COLUMN: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-8 h-8 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            <span className="text-xl font-extrabold tracking-tight text-white">
              Dev<span className="text-[#00F0FF]">Hub</span>
            </span>
          </Link>
          <Link to="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>

        {/* Center Card */}
        <div className="max-w-md w-full mx-auto my-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
              <Sparkles size={13} />
              <span>Join the Global Fleet</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Create your account
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5">
              Showcase projects, connect with founders, and build your digital authority.
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:border-white/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGithubAuth}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:border-white/20"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">or email sign up</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Mercer"
                  className="w-full bg-[#0D0D12] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none transition-colors"
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full bg-[#0D0D12] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none transition-colors"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full bg-[#0D0D12] border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400">Strength:</span>
                    <span className="font-bold text-white">{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                  </div>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-3 shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00F0FF] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-500 flex items-center gap-4 justify-between border-t border-zinc-800/80 pt-4">
          <span>© 2026 DevHub Inc.</span>
          <div className="flex gap-4">
            <Link to="/guidelines" className="hover:text-zinc-300">Privacy</Link>
            <Link to="/guidelines" className="hover:text-zinc-300">Terms</Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Living Social Proof & Testimonials */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B0B10] via-[#08080C] to-[#050507] border-l border-white/10 p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#8A2BE2]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#FF0055]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-400 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Join 50,000+ Innovators</span>
          </div>
        </div>

        {/* Centerpiece Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative z-10 max-w-lg"
        >
          <div className="flex items-center gap-4 mb-6">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt="David Kim"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-400/40 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-base font-bold text-white">David Kim</h4>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Venture Partner
                </span>
              </div>
              <p className="text-xs text-zinc-400">Horizon Capital • Seed Investor</p>
            </div>
          </div>

          <p className="text-base text-zinc-200 leading-relaxed italic mb-6">
            "We backed 3 founder teams from DevHub in our last cohort. The caliber of engineers and creators sharing active projects here is unmatched."
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-purple-400" />
              <span>Verified Venture Capitalist</span>
            </div>
            <span className="font-mono text-zinc-500">Seed Fund $2.4M</span>
          </div>
        </motion.div>

        {/* Bottom Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          <div>
            <p className="text-xl font-extrabold text-white">0%</p>
            <p className="text-xs text-zinc-400 mt-0.5">Recruiter Noise</p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-[#00F0FF]">100%</p>
            <p className="text-xs text-zinc-400 mt-0.5">Verified Proof</p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-purple-400">1-Click</p>
            <p className="text-xs text-zinc-400 mt-0.5">Co-Founder Match</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
