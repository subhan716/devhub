import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  RefreshCw, 
  Search, 
  Shield, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { getAuditLogs } from '../api/adminApi';
import toast from 'react-hot-toast';

const AuditLogsExplorer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async (targetPage = 1) => {
    try {
      setLoading(true);
      const data = await getAuditLogs({ page: targetPage, limit: 20 });
      setLogs(data.logs || []);
      setPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      toast.error('Failed to load security audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const getActionBadgeColor = (action) => {
    if (action.includes('SUSPEND') || action.includes('BAN') || action.includes('DELETE')) {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
    if (action.includes('BADGE') || action.includes('VERIFIED')) {
      return 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30';
    }
    if (action.includes('ROLE')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
    if (action.includes('CONFIG') || action.includes('BROADCAST')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-white/10 text-gray-300 border-white/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121212] border border-white/5 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Security Audit Forensics & Compliance Stream
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                WORM Immutable
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Cryptographically verified audit trail of all operational clicks, bans, role grants, and broadcasts.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#181818] hover:bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white transition-colors cursor-pointer text-xs font-bold self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-purple-400' : ''} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-purple-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={40} className="mx-auto text-gray-600 mb-3 opacity-50" />
            <p className="text-sm font-bold text-gray-400">No Audit Events Logged Yet</p>
            <p className="text-xs text-gray-600 mt-1">Actions taken across user governance, moderation, or broadcast will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Admin Operator</th>
                  <th className="py-3.5 px-4">Action Type</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Forensic Details</th>
                  <th className="py-3.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-500" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                          {log.actor?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{log.actor?.name || 'Super Admin'}</p>
                          <p className="text-[10px] text-gray-500">{log.actor?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-white">{log.target?.targetName || log.target?.targetEmail || log.target?.entityType}</p>
                        {log.target?.entityId && (
                          <p className="text-[10px] text-gray-500 font-mono">ID: {log.target.entityId}</p>
                        )}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <pre className="text-[10px] bg-black/40 p-2 rounded-lg border border-white/5 text-gray-400 overflow-x-auto font-mono">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>

                    {/* IP */}
                    <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalCount} total audit records)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsExplorer;
