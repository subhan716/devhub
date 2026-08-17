import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  UserX, 
  RefreshCw,
  Clock,
  FileCode2
} from 'lucide-react';
import { getReportedContent, moderateReport } from '../api/adminApi';
import toast from 'react-hot-toast';

const ModerationQueue = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReportedContent({ status: activeTab, page, limit: 10 });
      setReports(data.reports || []);
      setPagination(data.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      toast.error('Failed to load reported content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, page]);

  const handleAction = async (reportId, action) => {
    try {
      const res = await moderateReport(reportId, { action });
      toast.success(res.message || 'Report action completed');
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to execute moderation action');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Status Filter */}
      <div className="flex items-center justify-between bg-[#111] p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('pending');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Pending Triage Queue
          </button>
          <button
            onClick={() => {
              setActiveTab('resolved');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resolved'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Resolved Cases
          </button>
        </div>

        <button
          onClick={fetchReports}
          className="p-2 bg-[#1a1a1a] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh Queue"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center text-gray-500">
          <RefreshCw size={24} className="animate-spin text-[#00F0FF] mx-auto mb-3" />
          Loading reported content...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center text-gray-500 space-y-2">
          <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
          <h3 className="font-bold text-white text-sm">All Clear!</h3>
          <p className="text-xs text-gray-500">No reported posts in the {activeTab} queue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg space-y-4 hover:border-white/10 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={report.author?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                    alt={report.author?.name || 'Author'}
                    className="w-9 h-9 rounded-full border border-white/10 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs">{report.author?.name || 'Deleted User'}</h4>
                    <span className="text-[11px] text-gray-500">{report.author?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                    <ShieldAlert size={12} />
                    {report.reportsCount || 1} Reports
                  </span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-2.5">
                {report.content && (
                  <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {report.content}
                  </p>
                )}
                {report.image?.url && (
                  <img
                    src={report.image.url}
                    alt="Attachment"
                    className="max-h-48 rounded-lg object-contain bg-black/40 border border-white/5"
                  />
                )}
                {report.codeSnippet?.code && (
                  <div className="p-3 bg-black/60 rounded-lg border border-white/5 font-mono text-[11px] text-cyan-300">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] mb-1">
                      <FileCode2 size={12} />
                      {report.codeSnippet.language || 'Code'}
                    </div>
                    <pre className="overflow-x-auto">{report.codeSnippet.code}</pre>
                  </div>
                )}
              </div>

              {/* Report Reasons */}
              {report.reports && report.reports.length > 0 && (
                <div className="bg-red-500/[0.03] border border-red-500/10 rounded-xl p-3 space-y-1.5">
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    Report Reasons:
                  </div>
                  <div className="space-y-1">
                    {report.reports.map((r, idx) => (
                      <div key={idx} className="text-[11px] text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span className="font-semibold text-gray-300 capitalize">{r.reason || 'Spam'}</span>
                        {r.comment && <span className="text-gray-500 italic">— "{r.comment}"</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions (Only pending) */}
              {activeTab === 'pending' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleAction(report._id, 'dismiss')}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Dismiss Report
                  </button>

                  <button
                    onClick={() => handleAction(report._id, 'delete_post')}
                    className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Delete Post
                  </button>

                  <button
                    onClick={() => handleAction(report._id, 'ban_user')}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all cursor-pointer"
                  >
                    <UserX size={14} />
                    Delete & Ban Author
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
