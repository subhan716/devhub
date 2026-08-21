import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot-email' | 'forgot-otp-reset'
  const [formData, setFormData] = useState({ email: '', password: '', newPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(180);
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (mode === 'forgot-otp-reset' && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode, otpTimer]);

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

  const strength = getPasswordStrength(formData.newPassword);

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com'}/api/auth/google`;
  };

  const handleGithubAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com'}/api/auth/github`;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? 'Email address is required' : null,
        password: !formData.password ? 'Password is required' : null
      });
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(`${apiUrl}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      toast.success('Welcome back to DevHub!');
      localStorage.setItem('isAuthenticated', 'true');

      try {
        await axios.get(`${apiUrl}/api/profile/me`);
        navigate('/feed');
      } catch (err) {
        navigate('/setup-profile');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      if (error.response?.status === 403 && error.response?.data?.isVerified === false) {
        toast('Please verify your email code.', { icon: '✉️' });
        navigate(`/verify-otp?email=${encodeURIComponent(error.response.data.email || formData.email)}`);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateForgotPassword = async () => {
    const cleanEmail = (formData.email || '').trim();
    if (!cleanEmail) {
      setMode('forgot-email');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(`${apiUrl}/api/auth/forgot-password`, { email: cleanEmail });
      toast.success(`3-minute reset code sent to ${cleanEmail}`);
      setMode('forgot-otp-reset');
      setOtpTimer(180);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch reset code');
      setMode('forgot-email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ email: 'Please enter your registered email' });
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(`${apiUrl}/api/auth/forgot-password`, { email: formData.email });
      toast.success(`Reset code sent to ${formData.email}`);
      setMode('forgot-otp-reset');
      setOtpTimer(180);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    if (!formData.newPassword || formData.newPassword.length < 8) {
      setErrors({ newPassword: 'New password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(`${apiUrl}/api/auth/reset-password`, {
        email: formData.email,
        otp: fullOtp,
        newPassword: formData.newPassword,
        logoutOtherDevices
      });

      toast.success('Password updated successfully! Welcome back.');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/feed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col lg:flex-row font-sans selection:bg-[#00F0FF]/30">
      {/* ===================================================
          LEFT COLUMN: AUTH CONSOLE (50% on Desktop)
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

        {/* Center Auth Card */}
        <div className="max-w-md w-full mx-auto my-8 sm:my-12">
          {/* 1. LOGIN MODE */}
          {mode === 'login' && (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
                  <ShieldCheck size={13} className="text-[#0A66C2]" />
                  <span>Verified Identity Access</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                  Welcome back
                </h1>
                <p className="text-sm text-zinc-400">
                  Sign in to your verified professional workspace
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

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">Password</label>
                    <button
                      type="button"
                      onClick={handleInitiateForgotPassword}
                      className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
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
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Primary Solid Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-zinc-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-zinc-200 font-semibold hover:underline">
                  Create one now
                </Link>
              </div>
            </div>
          )}

          {/* 2. FORGOT PASSWORD EMAIL PROMPT */}
          {mode === 'forgot-email' && (
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-3 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </button>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-sm text-zinc-400">
                  Enter your registered email address to receive a 3-minute reset code.
                </p>
              </div>

              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Registered Email</label>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 3. FORGOT PASSWORD 6-DIGIT OTP & NEW PASSWORD */}
          {mode === 'forgot-otp-reset' && (
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-3 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </button>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                  Set New Password
                </h1>
                <p className="text-xs text-zinc-400">
                  Enter the 6-digit code sent to <strong className="text-white">{formData.email}</strong>
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2 text-center">6-Digit Reset Code</label>
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
                        className="w-10 h-12 text-center font-mono text-base font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl focus:border-zinc-500 focus:outline-none transition-colors"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
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

                  {formData.newPassword && (
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
                  {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>}
                </div>

                {/* Remote Logout Toggle */}
                <label className="flex items-start gap-2.5 cursor-pointer py-2 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 select-none">
                  <input
                    type="checkbox"
                    checked={logoutOtherDevices}
                    onChange={(e) => setLogoutOtherDevices(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-zinc-950 border-zinc-700 text-white accent-white cursor-pointer"
                  />
                  <div className="text-[11px] leading-tight">
                    <p className="font-semibold text-zinc-200">Log out of all other devices</p>
                    <p className="text-zinc-500 text-[10px] mt-0.5">Terminates active sessions on mobile apps, tablets & other browsers</p>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6 || !formData.newPassword}
                  className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password & Sign In</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
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
          RIGHT COLUMN: LIVING TESTIMONIAL STAGE (50% Desktop)
         =================================================== */}
      <div className="hidden lg:flex w-1/2 bg-[#0C0C11] border-l border-zinc-800/80 p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* Soft Ambient Halo */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00F0FF]/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Top Metric Badge */}
        <div className="flex justify-end relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>4,820 live builders active</span>
          </div>
        </div>

        {/* Centerpiece Testimonial */}
        <div className="max-w-md my-auto relative z-10 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                alt="Alex Vance" 
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#00F0FF]/30"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">Alex Vance</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25">
                    Founder
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Synthetix AI • Seed Stage</p>
              </div>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed font-normal italic">
              "DevHub connected our team with our founding systems architect and top-tier seed investors in under 2 weeks. The quality of verified talent here is unmatched."
            </p>

            <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500 font-mono border-t border-zinc-800/80">
              <span>Backed by Apex Ventures</span>
              <span className="text-emerald-400">Verified Ecosystem Peer</span>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400">
          <span>Global Developer & Creator Network</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Zero Platform Fees</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
