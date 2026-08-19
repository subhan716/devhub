import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Ban, 
  CheckCircle2, 
  ShieldAlert, 
  Crown, 
  LogOut, 
  EyeOff, 
  X,
  Lock
} from 'lucide-react';

const ActionConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  impactStatement,
  targetUser,
  actionType = 'suspend', // 'suspend' | 'unsuspend' | 'strike' | 'shadowban' | 'role' | 'revoke_sessions' | 'badge'
  requireReason = true,
  requireTypeToConfirm = false,
  confirmWord = 'CONFIRM',
  loading = false,
  customSelect = null,
}) => {
  const [reason, setReason] = useState('');
  const [typedConfirmation, setTypedConfirmation] = useState('');

  if (!isOpen) return null;

  const colorConfig = {
    suspend: {
      icon: Ban,
      accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    unsuspend: {
      icon: CheckCircle2,
      accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-black',
    },
    strike: {
      icon: ShieldAlert,
      accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      btnBg: 'bg-amber-500 hover:bg-amber-600 text-black',
    },
    shadowban: {
      icon: EyeOff,
      accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      btnBg: 'bg-amber-500 hover:bg-amber-600 text-black',
    },
    role: {
      icon: Crown,
      accentBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    revoke_sessions: {
      icon: LogOut,
      accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    badge: {
      icon: CheckCircle2,
      accentBg: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
      btnBg: 'bg-[#00F0FF] hover:bg-[#00D8E6] text-black',
    },
  };

  const currentTheme = colorConfig[actionType] || colorConfig.suspend;
  const Icon = currentTheme.icon;

  const isConfirmDisabled = 
    loading ||
    (requireReason && !reason.trim()) ||
    (requireTypeToConfirm && typedConfirmation !== confirmWord);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isConfirmDisabled) return;
    onConfirm({ reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#121215] border border-zinc-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden font-sans text-xs">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${currentTheme.accentBg}`}>
              <Icon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
              <p className="text-[11px] text-zinc-400 font-mono">Administrative Governance Guard</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target User Card */}
          {targetUser && (
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-3">
              <img
                src={targetUser.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt={targetUser.name}
                className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-zinc-200 truncate">{targetUser.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">{targetUser.email}</p>
              </div>
            </div>
          )}

          {/* Description & Impact Statement */}
          <div className="space-y-2 text-zinc-300 leading-relaxed">
            <p>{description}</p>
            {impactStatement && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{impactStatement}</span>
              </div>
            )}
          </div>

          {/* Custom Select if provided (e.g. for role picker) */}
          {customSelect}

          {/* Mandatory Reason Input */}
          {requireReason && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Justification Reason <span className="text-rose-400">* (Logged in Audit Forensics)</span>:
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the official administrative justification for this action..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                required
              />
            </div>
          )}

          {/* Type To Confirm (Optional for high severity) */}
          {requireTypeToConfirm && (
            <div className="pt-1">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Type <strong className="text-zinc-200 font-mono">{confirmWord}</strong> to confirm:
              </label>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                placeholder={confirmWord}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConfirmDisabled}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${currentTheme.btnBg}`}
            >
              {loading ? 'Processing...' : 'Confirm & Execute Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionConfirmModal;
