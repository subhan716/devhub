import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  UserX, 
  RefreshCw,
  Clock,
  FileCode2,
  AlertTriangle
} from 'lucide-react';
import { getReportedContent, moderateReport } from '../api/adminApi';
import toast from 'react-hot-toast';

const ModerationQueue = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReportedContent();
      setReportedPosts(data.reportedPosts || []);
    } catch (err) {
      toast.error('Failed to load reported content queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (postId, action, reason = '') => {
    try {
      const res = await moderateReport(postId, { action, reason });
      toast.success(res.message || 'Action executed successfully');
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to execute moderation action');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#0D0D10] p-4 rounded-xl border border-zinc-800/80">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Trust & Safety Moderation Queue
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">
            ({reportedPosts.length} cases flagged)
          </span>
        </div>

        <button
          onClick={fetchReports}
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Refresh Queue"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl p-12 text-center text-zinc-500">
          <RefreshCw size={18} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
          Loading moderation queue...
        </div>
      ) : reportedPosts.length === 0 ? (
        <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl p-12 text-center text-zinc-500 space-y-2">
          <CheckCircle2 size={28} className="text-emerald-400 mx-auto" />
          <h4 className="font-semibold text-zinc-200 text-sm">All Clear</h4>
          <p className="text-xs text-zinc-500">No reported content pending review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportedPosts.map((post) => (
            <div key={post._id} className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl p-4 space-y-3 shadow-sm">
              {/* Post Author & Flag Info */}
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                    alt={post.author?.name || 'Author'}
                    className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{post.author?.name || 'Anonymous'}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{post.author?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    {post.reportsCount || 1} Reports
                  </span>
                  <span className="text-zinc-500 text-[11px] font-mono">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Content Snippet */}
              <div className="text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-800/60 p-3 rounded-lg space-y-2">
                <p className="leading-relaxed whitespace-pre-wrap">{post.content || 'No text content.'}</p>
                {post.codeSnippet?.code && (
                  <pre className="p-2.5 rounded bg-black/50 border border-zinc-800 text-[11px] font-mono text-[#00F0FF] overflow-x-auto">
                    {post.codeSnippet.code}
                  </pre>
                )}
              </div>

              {/* Triage Actions Row */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => handleAction(post._id, 'dismiss')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 transition-colors cursor-pointer"
                >
                  Dismiss Reports
                </button>
                <button
                  onClick={() => handleAction(post._id, 'delete', 'Violation of guidelines')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Delete Post
                </button>
                <button
                  onClick={() => handleAction(post._id, 'delete_and_ban', 'Severe content violation')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserX size={13} />
                  Delete & Suspend Author
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
