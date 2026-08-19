import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  RefreshCw, 
  Shield, 
  Clock, 
  ChevronLeft, 
  ChevronRight 
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
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const getActionBadge = (action) => {
    if (action.includes('SUSPEND') || action.includes('BAN') || action.includes('DELETE')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (action.includes('BADGE') || action.includes('VERIFIED')) {
      return 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20';
    }
    if (action.includes('ROLE')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0D0D10] border border-zinc-800/80 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Shield size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Security Audit Forensics & Compliance
            </h3>
            <p className="text-xs text-zinc-400">
              Immutable WORM trail recording all administrative mutations and governance events
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs font-medium self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500">
            <RefreshCw size={18} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <FileText size={32} className="mx-auto text-zinc-600 mb-2 opacity-60" />
            <p className="text-xs font-medium text-zinc-300">No Audit Events Logged</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Actions performed in the admin portal will stream here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-900/60 border-b border-zinc-800/80 text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Operator</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Target Entity</th>
                  <th className="py-2.5 px-4">Details</th>
                  <th className="py-2.5 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-zinc-900/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    {/* Operator */}
                    <td className="py-2.5 px-4">
                      <div>
                        <p className="font-semibold text-zinc-200">{log.actor?.name || 'Super Admin'}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{log.actor?.email}</p>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium border uppercase ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-2.5 px-4">
                      <div>
                        <p className="font-medium text-zinc-200">{log.target?.targetName || log.target?.targetEmail || log.target?.entityType}</p>
                        {log.target?.entityId && (
                          <p className="text-[10px] text-zinc-500 font-mono">ID: {log.target.entityId}</p>
                        )}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-2.5 px-4 max-w-xs">
                      <pre className="text-[10px] bg-black/40 p-1.5 rounded border border-zinc-800 text-zinc-400 overflow-x-auto font-mono">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>

                    {/* IP */}
                    <td className="py-2.5 px-4 text-right text-zinc-500 font-mono text-[11px] whitespace-nowrap">
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
          <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Page <strong className="text-zinc-300 font-mono">{page}</strong> of <strong className="text-zinc-300 font-mono">{totalPages}</strong> ({totalCount} total audit records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-zinc-400"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-zinc-400"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsExplorer;
