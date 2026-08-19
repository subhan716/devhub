import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  Ban, 
  EyeOff, 
  FileCode2, 
  AlertTriangle, 
  User, 
  Calendar, 
  Clock,
  Shield,
  MessageSquare
} from 'lucide-react';
import ActionConfirmModal from '../common/ActionConfirmModal';
import { moderateReport } from '../../api/adminApi';
import toast from 'react-hot-toast';

const ReportDetailsModal = ({ isOpen, onClose, post, onReportResolved }) => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'suspend',
    title: '',
    description: '',
    impactStatement: '',
    actionHandler: null,
  });

  if (!isOpen || !post) return null;

  const author = post.author || {};
  const reports = post.reports || [];
  const hasCode = Boolean(post.codeSnippet?.code);

  const executeModeration = async (action, reason) => {
    try {
      const res = await moderateReport(post._id, { action, reason });
      toast.success(res.message || 'Action executed successfully');
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      onClose();
      if (onReportResolved) onReportResolved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to execute moderation action');
    }
  };

  const promptAction = (actionType) => {
    if (actionType === 'dismiss') {
      setConfirmModal({
        isOpen: true,
        type: 'unsuspend',
        title: 'Dismiss Reports (False Positive)',
        description: 'Clear all reports and restore normal algorithmic standing for this post.',
        impactStatement: 'The post will remain active on feeds and moderation flags will be cleared.',
        actionHandler: ({ reason }) => executeModeration('dismiss', reason),
      });
    } else if (actionType === 'delete') {
      setConfirmModal({
        isOpen: true,
        type: 'suspend',
        title: 'Delete Post for Policy Violation',
        description: 'Permanently remove this post from all platform feeds and comments.',
        impactStatement: 'Author will receive an in-app notice explaining the removal.',
        actionHandler: ({ reason }) => executeModeration('delete', reason),
      });
    } else if (actionType === 'delete_and_strike') {
      setConfirmModal({
        isOpen: true,
        type: 'strike',
        title: `Delete Post & Issue Strike #${(author.strikesCount || 0) + 1}`,
        description: `Permanently remove post and record an official policy violation strike on ${author.name}'s account.`,
        impactStatement: (author.strikesCount || 0) >= 2
          ? '⚠️ THIS WILL TRIGGER AUTOMATIC 3-STRIKE ACCOUNT SUSPENSION.'
          : 'Strike counter will increment and warning will be logged.',
        actionHandler: ({ reason }) => executeModeration('delete_and_strike', reason),
      });
    } else if (actionType === 'delete_and_ban') {
      setConfirmModal({
        isOpen: true,
        type: 'suspend',
        title: 'Delete Post & Suspend Author Account',
        description: `Delete post and immediately block ${author.name} from all platform access.`,
        impactStatement: 'Author active sessions will be terminated and all socket connections severed.',
        actionHandler: ({ reason }) => executeModeration('delete_and_ban', reason),
      });
    } else if (actionType === 'shadow_filter') {
      setConfirmModal({
        isOpen: true,
        type: 'shadowban',
        title: 'Apply Stealth Shadow-Filter',
        description: 'Hide this post from all users while keeping it visible to the author only.',
        impactStatement: 'Author will not be notified of the removal.',
        actionHandler: ({ reason }) => executeModeration('shadow_filter', reason),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans text-xs">
      <div className="bg-[#121215] border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Report Triage & Inspection Desk
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                  {post.reportsCount} Flags
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Post ID: {post._id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Author Scorecard & Reputation */}
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={author.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt={author.name}
                className="w-9 h-9 rounded-full border border-zinc-700 object-cover"
              />
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-zinc-100 text-xs">
                  {author.name}
                  {author.isVerifiedBadge && <CheckCircle2 size={13} className="text-[#00F0FF]" />}
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">{author.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className={`px-2 py-0.5 rounded border ${
                author.strikesCount > 0 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {author.strikesCount || 0}/3 Strikes
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Role: {author.role || 'user'}
              </span>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-200">Flagged Content Text</h4>
            <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {post.content || 'No text content.'}
            </div>
          </div>

          {/* Code Inspection Sandbox */}
          {hasCode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <FileCode2 size={14} className="text-[#00F0FF]" />
                  Code Snippet Inspection ({post.codeSnippet.language || 'Code'})
                </h4>
                <span className="text-[10px] text-zinc-500 font-mono">Sandbox Preview</span>
              </div>
              <pre className="p-3.5 rounded-lg bg-black border border-zinc-800 text-zinc-200 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-48">
                <code>{post.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Media Inspection */}
          {post.image?.url && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-200">Attached Media</h4>
              <div className="rounded-lg overflow-hidden border border-zinc-800 max-h-48 bg-black">
                <img src={post.image.url} alt="Attachment" className="w-full h-auto object-cover" />
              </div>
            </div>
          )}

          {/* Reporters Breakdown List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Shield size={14} className="text-zinc-400" />
              User Reports Log ({reports.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {reports.map((r, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex items-start justify-between gap-3 text-[11px]">
                  <div>
                    <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[10px] text-amber-400">
                      [{r.category || r.reason || 'Spam'}]
                    </span>
                    {r.comment && <p className="text-zinc-300 mt-0.5 italic">"{r.comment}"</p>}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">
                    {r.reportedAt ? new Date(r.reportedAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer (Triage Desk) */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => promptAction('dismiss')}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium transition-colors cursor-pointer text-xs"
          >
            Dismiss (False Positive)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => promptAction('shadow_filter')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-colors cursor-pointer text-xs"
            >
              Stealth Filter
            </button>
            <button
              onClick={() => promptAction('delete')}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium transition-colors cursor-pointer text-xs"
            >
              Delete Post
            </button>
            <button
              onClick={() => promptAction('delete_and_strike')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold transition-colors cursor-pointer text-xs"
            >
              Delete + Strike
            </button>
            <button
              onClick={() => promptAction('delete_and_ban')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer text-xs"
            >
              Delete + Ban Author
            </button>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      <ActionConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.actionHandler}
        title={confirmModal.title}
        description={confirmModal.description}
        impactStatement={confirmModal.impactStatement}
        actionType={confirmModal.type}
      />
    </div>
  );
};

export default ReportDetailsModal;
