import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const VerifyOtpPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no email is provided
  useEffect(() => {
    if (!email) {
      toast.error('Invalid verification link');
      navigate('/register');
    }
  }, [email, navigate]);

  // Resend Timer Countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Keep last digit
    setOtp(newOtp);

    // Focus next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Focus previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        { email, otp: otpCode },
        { withCredentials: true }
      );
      toast.success('Email verified successfully! Welcome to DevHub.');
      
      // Redirect to profile setup
      navigate('/setup-profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, { email });
      toast.success('Verification code resent to your email!');
      setResendTimer(60); // Reset timer
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const maskEmail = (emailStr) => {
    if (!emailStr) return '';
    const [name, domain] = emailStr.split('@');
    if (!name || !domain) return emailStr;
    if (name.length <= 3) {
      return `${name[0]}***@${domain}`;
    }
    return `${name.substring(0, 3)}${'*'.repeat(Math.max(name.length - 4, 4))}${name[name.length - 1]}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-[#050507] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00F0FF]/5 via-transparent to-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Animated Shield Badge */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#0A66C2] dark:bg-[#00F0FF]/10 text-[#0A66C2] dark:text-[#00F0FF] border border-[#0A66C2] dark:border-[#00F0FF]/20 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
        >
          <ShieldCheck size={32} />
        </motion.div>
        
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Verify your email
        </h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          We have sent a 6-digit activation code to <span className="text-white font-medium">{maskEmail(email)}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white dark:bg-white/[0.02] py-8 px-4 shadow-2xl border border-slate-200 dark:border-white/10 sm:rounded-2xl sm:px-10 backdrop-blur-xl"
        >
          <form className="space-y-6" onSubmit={handleVerify}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 text-center">
                Enter 6-Digit OTP Code
              </label>
              
              {/* Segmented Inputs */}
              <div className="flex justify-between gap-2 max-w-xs mx-auto py-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={el => inputRefs.current[idx] = el}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-11 h-12 text-center text-xl font-bold bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#0A66C2] dark:border-[#00F0FF] focus:ring-1 focus:ring-[#0A66C2] dark:focus:ring-[#00F0FF] transition-all shadow-[0_0_10px_rgba(0,0,0,0.3)] font-mono"
                  />
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-black bg-[#0A66C2] dark:bg-[#00F0FF] hover:bg-[#0A66C2] dark:bg-[#00F0FF]/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Resend Cooldown Option */}
          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isResending}
              className={`text-sm font-medium transition-colors ${
                resendTimer > 0 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-[#0A66C2] dark:text-[#00F0FF] hover:underline cursor-pointer'
              }`}
            >
              {isResending ? (
                <span className="flex items-center justify-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Resending...</span>
              ) : resendTimer > 0 ? (
                `Resend code in ${resendTimer}s`
              ) : (
                'Resend verification code'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
