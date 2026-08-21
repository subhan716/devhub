import React, { useState } from 'react';
import { ShieldAlert, X, Send, CheckCircle2, UserX } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const USER_REPORT_CATEGORIES = [
  {
    id: 'impersonation',
    label: 'Fake Profile or Impersonation',
    description: 'Impersonating another developer, company, or public figure.',
  },
  {
    id: 'harassment',
    label: 'Harassment, Bullying or Hate Speech',
    description: 'Sending threatening messages, abusive comments, or targeted harassment.',
  },
  {
    id: 'spam',
    label: 'Spam or Bot Account',
    description: 'Automated spam account, mass follower bot, or commercial advertisement spam.',
  },
  {
    id: 'malicious',
    label: 'Malicious Code or Exploit Distribution',
    description: 'Distributing malware, phishing links, or vulnerable exploit payloads.',
  },
  {
    id: 'scam',
    label: 'Scam, Fraud or Phishing',
    description: 'Financial scams, crypto fraud, or deceptive service offers.',
  },
  {
    id: 'other',
    label: 'Other Community Policy Breach',
    description: 'Any other serious breach of DevHub community standards.',
  },
];

const ReportUserModal = ({ isOpen, onClose, user }) => {
  const [selectedCategory, setSelectedCategory] = useState('impersonation');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const targetId = user._id || user.id;
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/report-user/${targetId}`,
        {
          category: selectedCategory,
          reason: selectedCategory,
          comment: details.trim(),
        },
        { withCredentials: true }
      );
      setSubmitted(true);
      toast.success('Developer profile reported to Trust & Safety team');
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        setSelectedCategory('impersonation');
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-white font-sans">
      <div className="bg-[#141418] border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserX size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Report Developer Account</h3>
              <p className="text-[11px] text-slate-600 dark:text-gray-400">DevHub Trust & Safety Sentinel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Report Received</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
              Our automated filters and Trust & Safety staff have logged this report against the account for investigation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Target User Summary Preview */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center gap-3">
              <img
                src={user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 truncate">{user?.email || 'Developer Member'}</p>
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300">
                What is the reason for reporting this account?
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {USER_REPORT_CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#00F0FF]/10 border-[#00F0FF]/40 text-white'
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userReportCategory"
                      value={cat.id}
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(cat.id)}
                      className="mt-1 accent-[#00F0FF]"
                    />
                    <div>
                      <p className="text-xs font-bold">{cat.label}</p>
                      <p className="text-[10px] text-slate-600 dark:text-gray-400 leading-normal">{cat.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                Additional Details or Evidence (Optional):
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the incident, attach message timestamps or relevant links..."
                className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                <Send size={13} />
                <span>{loading ? 'Submitting...' : 'Submit User Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportUserModal;
