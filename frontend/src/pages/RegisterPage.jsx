import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Code2, 
  Users,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const RegisterPage = () => {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(180);
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === 'otp' && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((d, i) => { newOtp[i] = d; });
      setOtp(newOtp);
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const getPasswordStrength = (pwd) => {
    const p = pwd || '';
    if (!p) return { score: 0, label: '', color: 'bg-zinc-800' };
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;

    if (score === 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Strong', color: 'bg-blue-400' };
    return { score: 100, label: 'Enterprise Grade', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com'}/api/auth/google`;
  };

  const handleGithubAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com'}/api/auth/github`;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrors({
        name: !formData.name ? 'Full name is required' : null,
        email: !formData.email ? 'Email address is required' : null,
        password: !formData.password ? 'Password is required' : null
      });
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(`${apiUrl}/api/auth/register`, formData);
      toast.success('3-minute verification code dispatched to your email!');
      setStep('otp');
      setOtpTimer(180);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(`${apiUrl}/api/auth/verify-otp`, {
        email: formData.email,
        otp: fullOtp
      });

      toast.success('Account verified! Welcome to DevHub.');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/setup-profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 120) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(`${apiUrl}/api/auth/resend-otp`, { email: formData.email });
      toast.success('New 3-minute verification code sent to your email');
      setOtpTimer(180);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col lg:flex-row font-sans selection:bg-[#00F0FF]/30">
      {/* ===================================================
          LEFT COLUMN: REGISTRATION CONSOLE (50% Desktop)
         =================================================== */}
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

        {/* Center Registration Card */}
        <div className="max-w-md w-full mx-auto my-8 sm:my-12">
          {step === 'form' ? (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
                  <Sparkles size={13} className="text-[#0A66C2]" />
                  <span>Join the Universal Network</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                  Create your account
                </h1>
                <p className="text-sm text-zinc-400">
                  Connect with elite creators, tech founders, and engineers
                </p>
              </div>

              {/* Social 1-Click Auth */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGithubAuth}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-semibold">or email</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alex Mercer"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

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
                  className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
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

              <div className="mt-6 text-center text-xs text-zinc-400">
                Already have an account?{' '}
                <Link to="/login" className="text-zinc-200 font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* STEP 2: IN-PLACE 6-DIGIT OTP VERIFICATION */
            <div>
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-[#0A66C2]">
                  <ShieldCheck size={20} />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                  Verify Your Email
                </h1>
                <p className="text-sm text-zinc-400">
                  Enter the 6-digit code sent to <strong className="text-white">{formData.email}</strong>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e.target.value ? null : e)}
                      className="w-11 h-13 text-center font-mono text-lg font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl focus:border-zinc-500 focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Launch Onboarding</span>
                      <CheckCircle2 size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="hover:text-white cursor-pointer"
                >
                  ← Edit Information
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 120}
                  className="font-medium text-zinc-300 hover:text-white cursor-pointer"
                >
                  {otpTimer > 120 ? `Resend in ${otpTimer - 120}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/80 pt-6">
          <span>© 2026 DevHub Global Inc.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <Link to="/terms" className="hover:text-zinc-300">Terms</Link>
          </div>
        </div>
      </div>

      {/* ===================================================
          RIGHT COLUMN: LIVING ECOSYSTEM STAGE (50% Desktop)
         =================================================== */}
      <div className="hidden lg:flex w-1/2 bg-[#0C0C11] border-l border-zinc-800/80 p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* Soft Ambient Halo */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#818CF8]/10 blur-[140px] rounded-full pointer-events-none" />

        {/* Top Metric Badge */}
        <div className="flex justify-end relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span>50,000+ Verified Innovators</span>
          </div>
        </div>

        {/* Ecosystem Highlights */}
        <div className="max-w-md my-auto relative z-10 space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                alt="David Kim" 
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#818CF8]/30"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">David Kim</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/25">
                    Venture Partner
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Apex Capital • Seed & Series A</p>
              </div>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed font-normal italic">
              "We source our top engineering talent and breakout AI startup investments directly through DevHub. It's the highest density of real builders on the web."
            </p>

            <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500 font-mono border-t border-zinc-800/80">
              <span>Active in 140+ Countries</span>
              <span className="text-[#38BDF8]">Open Ecosystem</span>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400">
          <span>Silicon Valley-Grade Infrastructure</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Encrypted Dual-Token Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
