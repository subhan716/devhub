import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  Ban, 
  EyeOff, 
  RefreshCw, 
  FileCode2, 
  AlertTriangle, 
  SlidersHorizontal,
  ChevronRight,
  Search
} from 'lucide-react';
import { getReports, moderateReport } from '../api/adminApi';
import ActionConfirmModal from './common/ActionConfirmModal';
import ReportDetailsModal from './moderation/ReportDetailsModal';
import toast from 'react-hot-toast';

const ModerationQueue = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'high_risk' | 'malicious_code' | 'spam'
  const [search, setSearch] = useState('');

  // Inspection Modal State
  const [selectedPost, setSelectedPost] = useState(null);

  // Quick Action Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'suspend',
    title: '',
    description: '',
    impactStatement: '',
    actionHandler: null,
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(data.reportedPosts || []);
    } catch (err) {
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleQuickDismiss = (post) => {
    setConfirmModal({
      isOpen: true,
      type: 'unsuspend',
      title: 'Dismiss Reported Content',
      description: `Clear all ${post.reportsCount} flags on this post.`,
      impactStatement: 'The post will remain active on public feeds.',
      actionHandler: async ({ reason }) => {
        try {
          await moderateReport(post._id, { action: 'dismiss', reason });
          toast.success('Report cleared');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchReports();
        } catch (err) {
          toast.error('Failed to dismiss report');
        }
      },
    });
  };

  const handleQuickDelete = (post) => {
    setConfirmModal({
      isOpen: true,
      type: 'suspend',
      title: 'Delete Reported Post',
      description: 'Remove this post from all platform feeds and notify author.',
      impactStatement: 'Content will be deleted immediately and removed from public view.',
      actionHandler: async ({ reason }) => {
        try {
          await moderateReport(post._id, { action: 'delete', reason });
          toast.success('Post removed');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchReports();
        } catch (err) {
          toast.error('Failed to delete post');
        }
      },
    });
  };

  // Filter Reports
  const filteredReports = reports.filter((post) => {
    const isCode = Boolean(post.codeSnippet?.code);
    const hasMaliciousFlag = post.reports?.some((r) => r.category === 'malicious_code');
    const isSpam = post.reports?.some((r) => r.category === 'spam');

    if (activeFilter === 'high_risk' && post.reportsCount < 2) return false;
    if (activeFilter === 'malicious_code' && !hasMaliciousFlag && !isCode) return false;
    if (activeFilter === 'spam' && !isSpam) return false;

    if (search) {
      const q = search.toLowerCase();
      const contentMatch = post.content?.toLowerCase().includes(q);
      const authorMatch = post.author?.name?.toLowerCase().includes(q) || post.author?.email?.toLowerCase().includes(q);
      if (!contentMatch && !authorMatch) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0D0D10] p-4 rounded-xl border border-zinc-800/80">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flagged content or author..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            All Queue ({reports.length})
          </button>
          <button
            onClick={() => setActiveFilter('high_risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === 'high_risk'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            ⚠️ High Reports (2+)
          </button>
          <button
            onClick={() => setActiveFilter('malicious_code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === 'malicious_code'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            🚨 Code Exploits
          </button>

          <button
            onClick={fetchReports}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer ml-1"
            title="Refresh Moderation Queue"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
          </button>
        </div>
      </div>

      {/* Reports Queue Table */}
      <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800/80 text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Flagged Content Preview</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Reports Count</th>
                <th className="px-4 py-3">Primary Category</th>
                <th className="px-4 py-3">Reported Time</th>
                <th className="px-4 py-3 text-right">Triage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                    <RefreshCw size={18} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
                    Loading Trust & Safety queue...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500/50 mb-1" />
                    <p className="text-zinc-400 font-medium">All Clear! No pending reports in this queue.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((post) => {
                  const author = post.author || {};
                  const isCode = Boolean(post.codeSnippet?.code);
                  const primaryCategory = post.reports?.[0]?.category || post.reports?.[0]?.reason || 'spam';

                  return (
                    <tr
                      key={post._id}
                      onClick={() => setSelectedPost(post)}
                      className="hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                    >
                      {/* Post Content Preview */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="space-y-1">
                          <p className="text-zinc-200 font-medium line-clamp-2 leading-relaxed group-hover:text-[#00F0FF] transition-colors">
                            {post.content || (isCode ? 'Code snippet post' : 'Attachment post')}
                          </p>
                          {isCode && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.2 rounded">
                              <FileCode2 size={11} />
                              {post.codeSnippet.language || 'code'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={author.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                            alt={author.name}
                            className="w-6 h-6 rounded-full border border-zinc-700 object-cover"
                          />
                          <div>
                            <p className="text-zinc-200 font-semibold">{author.name || 'Unknown'}</p>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {author.strikesCount || 0}/3 strikes
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reports Count */}
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          post.reportsCount >= 3
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : post.reportsCount === 2
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          {post.reportsCount} reports
                        </span>
                      </td>

                      {/* Primary Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                          primaryCategory === 'malicious_code'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : primaryCategory === 'harassment'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {primaryCategory.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Reported Time */}
                      <td className="px-4 py-3 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Open Deep Triage Desk"
                          >
                            <SlidersHorizontal size={13} />
                          </button>
                          <button
                            onClick={() => handleQuickDismiss(post)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Dismiss Report"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                          <button
                            onClick={() => handleQuickDelete(post)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Triage & Inspection Modal */}
      <ReportDetailsModal
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        onReportResolved={fetchReports}
      />

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

export default ModerationQueue;
