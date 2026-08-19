import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, Send, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const REPORT_CATEGORIES = [
  {
    id: 'spam',
    label: 'Spam, Bot or Phishing Link',
    description: 'Unsolicited promotional content, malware links, or suspicious bots.',
  },
  {
    id: 'malicious_code',
    label: 'Malicious Code or Exploit',
    description: 'Dangerous code snippets designed to exploit security vulnerabilities or steal tokens.',
  },
  {
    id: 'harassment',
    label: 'Harassment, Hate Speech or Bullying',
    description: 'Targeted attacks, offensive language, or threatening behaviour.',
  },
  {
    id: 'misinformation',
    label: 'Misleading Information or Impersonation',
    description: 'Fabricated credentials, misleading technical claims, or stolen identities.',
  },
  {
    id: 'copyright',
    label: 'Plagiarism or Copyright Infringement',
    description: 'Code or content copied without attribution or intellectual property violations.',
  },
  {
    id: 'other',
    label: 'Other Policy Violation',
    description: 'Any other violation of DevHub community standards.',
  },
];

const ReportPostModal = ({ isOpen, onClose, post }) => {
  const [selectedCategory, setSelectedCategory] = useState('spam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/report-post/${post._id}`,
        {
          category: selectedCategory,
          reason: selectedCategory,
          comment: details.trim(),
        },
        { withCredentials: true }
      );
      setSubmitted(true);
      toast.success('Report submitted to Trust & Safety moderation team');
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        setSelectedCategory('spam');
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
      <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Report Content</h3>
              <p className="text-[11px] text-gray-400">DevHub Trust & Safety Sentinel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Report Received</h4>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              Our automated moderation filters and human Trust & Safety team are reviewing this content. Thank you for keeping DevHub secure.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Post Summary Preview */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
              <img
                src={post?.author?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt={post?.author?.name}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{post?.author?.name}</p>
                <p className="text-[11px] text-gray-400 truncate line-clamp-1">{post?.content || 'Code snippet post'}</p>
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">
                Why are you reporting this post?
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#00F0FF]/10 border-[#00F0FF]/40 text-white'
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportCategory"
                      value={cat.id}
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(cat.id)}
                      className="mt-1 accent-[#00F0FF]"
                    />
                    <div>
                      <p className="text-xs font-bold">{cat.label}</p>
                      <p className="text-[10px] text-gray-400 leading-normal">{cat.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Additional Context or Explanations (Optional):
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain the violation or reference specific lines of code..."
                className="w-full bg-[#181820] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                <Send size={13} />
                <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportPostModal;
