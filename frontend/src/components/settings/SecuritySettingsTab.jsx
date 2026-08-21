import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  LogOut, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle, 
  Lock, 
  RefreshCw,
  Info,
  Trash2,
  MailCheck,
  RotateCw,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';

const SecuritySettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [forensics, setForensics] = useState(null);

  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(true);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  // Show/Hide Password Visibility Toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isInSessionForgotMode, setIsInSessionForgotMode] = useState(false);

  // Session & Account Modals
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchSecurityForensics = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/security-forensics`, {
        withCredentials: true,
      });
      setForensics(data);
    } catch (err) {
      console.warn('Failed to load security status:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityForensics();
  }, []);

  // Resend Timer Countdown
  useEffect(() => {
    let timer;
    if (isOtpModalOpen && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpModalOpen, resendCountdown]);

  // Real-Time Password Strength Computation (1 to 4)
  const computePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-800' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-400', width: 'w-2/4' };
      case 3:
        return { score: 3, label: 'Strong', color: 'bg-[#00F0FF]', width: 'w-3/4' };
      case 4:
        return { score: 4, label: 'Very Strong', color: 'bg-emerald-400', width: 'w-full' };
      default:
        return { score: 1, label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    }
  };

  const strength = computePasswordStrength(newPassword);

  // Criteria Checks
  const hasMinLength = newPassword.length >= 8;
  const hasMixedCase = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

  // STEP 1: Request Password Change OTP
  const handlePasswordFormSubmit = async (e) => {
    e.preventDefault();

    if (forensics?.hasPasswordSet && !currentPassword && !isInSessionForgotMode) {
      toast.error('Please enter your current password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsRequestingOtp(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/request-password-otp`,
        { currentPassword, newPassword, logoutOtherDevices },
        { withCredentials: true }
      );
      setMaskedEmail(data.emailMasked || 'your email');
      setIsOtpModalOpen(true);
      setResendCountdown(60);
      setOtp('');
      toast.success(data.message || 'Security verification code sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request security verification code');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // 1-Click "Forgot Current Password?" In-Session Reset (Instagram Style)
  const handleInSessionForgotPassword = async () => {
    setIsRequestingOtp(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/in-session-forgot-password`,
        {},
        { withCredentials: true }
      );
      setMaskedEmail(data.emailMasked || 'your email');
      setIsInSessionForgotMode(true);
      setIsOtpModalOpen(true);
      setResendCountdown(60);
      setOtp('');
      toast.success('Password reset code sent to your registered email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch reset code');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // STEP 2: Verify OTP and Finalize Password Change
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-password-otp`,
        { otp: otp.trim() },
        { withCredentials: true }
      );
      toast.success(data.message || 'Password updated successfully!');
      setIsOtpModalOpen(false);
      setIsInSessionForgotMode(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      fetchSecurityForensics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired security code');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending) return;
    setIsResending(true);
    try {
      const endpoint = isInSessionForgotMode
        ? `${import.meta.env.VITE_API_URL}/api/auth/in-session-forgot-password`
        : `${import.meta.env.VITE_API_URL}/api/auth/resend-password-otp`;

      const { data } = await axios.post(endpoint, {}, { withCredentials: true });
      toast.success(data.message || 'New verification code sent!');
      setResendCountdown(60);
      setOtp('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  // 1-Click Session Revoke
  const handleRevokeAllSessions = async () => {
    setIsRevoking(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/revoke-all-sessions`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message || 'All other device sessions have been signed out.');
      fetchSecurityForensics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sign out other sessions');
    } finally {
      setIsRevoking(false);
      setIsRevokeModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500 text-xs font-mono">
        <RefreshCw size={20} className="animate-spin text-[#00F0FF]" />
        <span>Loading security settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Password Management Form */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <KeyRound size={16} className="text-[#00F0FF]" />
            <span>Change Password</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">
            Email Verification Challenge
          </span>
        </div>

        {forensics && forensics.isOAuthUser && (
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-gray-300 leading-relaxed">
            <Info size={16} className="text-[#00F0FF] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Google / GitHub Account</span>
              You signed in with social login. You can set a dedicated password below. A 6-digit verification code will be sent to your email to confirm.
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordFormSubmit} className="space-y-4 max-w-lg">
          {forensics?.hasPasswordSet && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300">Current Password</label>
                <button
                  type="button"
                  onClick={handleInSessionForgotPassword}
                  className="text-[11px] text-[#00F0FF] hover:underline cursor-pointer font-medium"
                >
                  Forgot your password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                  placeholder="Enter your current password"
                  required={!isInSessionForgotMode}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              {forensics?.hasPasswordSet ? 'New Password' : 'Set Password'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="Minimum 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Strength:</span>
                  <span className={`font-semibold ${
                    strength.score === 4 ? 'text-emerald-400' : strength.score === 3 ? 'text-[#00F0FF]' : strength.score === 2 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-200`} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] text-gray-400">
                  <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {hasMinLength ? <Check size={11} /> : <X size={11} />}
                    <span>8+ Chars</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasMixedCase ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {hasMixedCase ? <Check size={11} /> : <X size={11} />}
                    <span>Mixed Case</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {hasNumber ? <Check size={11} /> : <X size={11} />}
                    <span>Number</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasSymbol ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {hasSymbol ? <Check size={11} /> : <X size={11} />}
                    <span>Symbol</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="Repeat new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <span className="text-[10px] text-red-400 flex items-center gap-1 pt-0.5">
                <AlertTriangle size={11} /> Passwords do not match
              </span>
            )}
          </div>

          {/* Instagram/Meta Style Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={logoutOtherDevices}
                onChange={(e) => setLogoutOtherDevices(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-[#050508] text-[#00F0FF] focus:ring-0 cursor-pointer"
              />
              <span>Sign out of all other browsers and mobile devices after updating</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isRequestingOtp || (newPassword.length > 0 && newPassword !== confirmPassword)}
              className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Lock size={14} />
              <span>{isRequestingOtp ? 'Sending Security Code...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Session Management */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
          <ShieldCheck size={16} className="text-gray-300" />
          <span>Active Sessions</span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
          Lost a device or left your account logged in elsewhere? You can sign out of all other browsers and mobile devices while staying logged in on this device.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsRevokeModalOpen(true)}
            disabled={isRevoking}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <LogOut size={14} />
            <span>{isRevoking ? 'Signing Out...' : 'Sign Out Other Sessions'}</span>
          </button>
        </div>
      </div>

      {/* 3. Delete Account / Danger Zone */}
      <div className="bg-[#111] border border-red-500/20 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm border-b border-red-500/20 pb-3">
          <Trash2 size={16} />
          <span>Delete Account</span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
          Permanently delete your DevHub account, profile, posts, comments, and connections. This action cannot be reversed.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <Trash2 size={14} />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LINKEDIN-GRADE EMAIL OTP VERIFICATION MODAL                            */}
      {/* ========================================================================= */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOtpModalOpen(false);
                setIsInSessionForgotMode(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 flex items-center justify-center mx-auto">
                <MailCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isInSessionForgotMode ? 'Password Reset Verification' : 'Security Verification'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                We sent a 6-digit verification code to <strong className="text-white">{maskedEmail}</strong>. Enter it below to authorize this change.
              </p>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300 block text-center">
                  6-Digit Security Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  autoFocus
                  className="w-full bg-[#050508] border border-white/10 rounded-xl py-3 text-center text-xl tracking-[8px] text-white font-mono focus:border-[#00F0FF]/50 outline-none transition-colors"
                  required
                />
              </div>

              {/* Resend Code Section */}
              <div className="text-center">
                {resendCountdown > 0 ? (
                  <span className="text-xs text-gray-500 font-mono">
                    Resend code in <strong className="text-gray-400">{resendCountdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-xs text-[#00F0FF] hover:underline cursor-pointer inline-flex items-center gap-1 font-medium"
                  >
                    <RotateCw size={12} className={isResending ? 'animate-spin' : ''} />
                    <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpModalOpen(false);
                    setIsInSessionForgotMode(false);
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className="px-5 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Check size={14} />
                  <span>{isVerifyingOtp ? 'Verifying...' : 'Confirm & Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={handleRevokeAllSessions}
        title="Sign Out Other Sessions"
        message="Are you sure you want to sign out of all other devices and browsers?"
        confirmText="Sign Out Other Sessions"
        isDestructive={false}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => toast.error('Account deletion request submitted.')}
        title="Delete Account"
        message="Are you sure you want to permanently delete your DevHub account and remove all your data? This action cannot be undone."
        confirmText="Delete My Account"
        isDestructive={true}
      />
    </div>
  );
};

export default SecuritySettingsTab;
