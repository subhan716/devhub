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
  Info
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
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Show/Hide Password Visibility Toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Modal State
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchSecurityForensics = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/security-forensics`, {
        withCredentials: true,
      });
      setForensics(data);
    } catch (err) {
      console.warn('Failed to load security telemetry:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityForensics();
  }, []);

  // Real-Time Password Strength Computation (1 to 4)
  const computePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-zinc-800' };
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
        return { score: 4, label: 'Elite (Zero-Trust)', color: 'bg-emerald-400', width: 'w-full' };
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (forensics?.hasPasswordSet && !currentPassword) {
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

    setIsUpdatingPassword(true);
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/update-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchSecurityForensics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 1-Click Zero-Trust Session Killswitch
  const handleRevokeAllSessions = async () => {
    setIsRevoking(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/revoke-all-sessions`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message || 'All other device sessions have been revoked.');
      fetchSecurityForensics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke sessions');
    } finally {
      setIsRevoking(false);
      setIsRevokeModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500 text-xs font-mono">
        <RefreshCw size={20} className="animate-spin text-[#00F0FF]" />
        <span>Hydrating security telemetry & credentials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* 1. CRYPTOGRAPHIC PASSWORD MANAGEMENT                                      */}
      {/* ========================================================================= */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <KeyRound size={16} className="text-[#00F0FF]" />
            <span>Cryptographic Password & Credentials</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">
            Bcrypt 10 Rounds
          </span>
        </div>

        {/* OAuth Warning / Notification Banner if OAuth user without password */}
        {forensics && !forensics.hasPasswordSet && (
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-gray-300 leading-relaxed">
            <Info size={16} className="text-[#00F0FF] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">OAuth-Linked Developer Account</span>
              You signed up via Google/GitHub OAuth. You can set a dedicated password below to enable direct email & password sign-in.
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
          {/* Current Password (only if password is already set) */}
          {forensics?.hasPasswordSet && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                  placeholder="Enter current password"
                  required
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

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              {forensics?.hasPasswordSet ? 'New Password *' : 'Set Account Password *'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors font-mono"
                placeholder="Enter new password (min 6 characters)"
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

            {/* Interactive Strength Meter */}
            {newPassword.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400">Security Strength:</span>
                  <span className={`font-semibold ${
                    strength.score === 4 ? 'text-emerald-400' : strength.score === 3 ? 'text-[#00F0FF]' : strength.score === 2 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-200`} />
                </div>

                {/* Criteria Chips Checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono">
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Repeat New Password *</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors font-mono"
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
              <span className="text-[10px] text-red-400 flex items-center gap-1 font-mono pt-0.5">
                <AlertTriangle size={11} /> Passwords do not match
              </span>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword || (newPassword.length > 0 && newPassword !== confirmPassword)}
              className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Lock size={14} />
              <span>{isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 2. ZERO-TRUST REMOTE SESSION REVOCATION KILLSWITCH                         */}
      {/* ========================================================================= */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck size={16} className="text-red-400" />
            <span>Active Session Revocation</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">
            $O(1)$ Token Invalidation
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
          Lost a device or accessed DevHub on a public computer? This action invalidates all other active login tokens across all devices without logging you out of this browser.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsRevokeModalOpen(true)}
            disabled={isRevoking}
            className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <LogOut size={14} />
            <span>{isRevoking ? 'Revoking Sessions...' : 'Revoke All Other Sessions'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Safety Modal */}
      <ConfirmModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={handleRevokeAllSessions}
        title="Revoke All Other Sessions"
        message="Are you sure you want to invalidate all active JWT tokens across all other devices? They will be immediately signed out."
        confirmText="Revoke Remote Sessions"
        isDestructive={true}
      />
    </div>
  );
};

export default SecuritySettingsTab;
