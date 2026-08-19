import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Ban, 
  EyeOff, 
  Crown, 
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getAllUsers, updateUserStatus, toggleUserBadge, updateUserRole, revokeUserSessions } from '../api/adminApi';
import toast from 'react-hot-toast';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [newRole, setNewRole] = useState('user');
  const [suspendReason, setSuspendReason] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers({
        page,
        limit: 15,
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(data.users || []);
      setPagination(data.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, page]);

  const handleToggleVerified = async (user) => {
    try {
      const res = await toggleUserBadge(user._id);
      toast.success(res.message || 'Badge updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle badge');
    }
  };

  const handleToggleShadowban = async (user) => {
    try {
      const res = await updateUserStatus(user._id, {
        action: 'toggleShadowban',
      });
      toast.success(res.message || 'Shadowban updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle shadowban');
    }
  };

  const handleExecuteSuspension = async () => {
    if (!selectedUser) return;
    try {
      const res = await updateUserStatus(selectedUser._id, {
        action: 'toggleSuspend',
        reason: suspendReason,
      });
      toast.success(res.message || 'Suspension state updated');
      setActionModal(null);
      setSuspendReason('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update suspension');
    }
  };

  const handleExecuteRoleChange = async () => {
    if (!selectedUser) return;
    try {
      const res = await updateUserRole(selectedUser._id, newRole);
      toast.success(res.message || 'Role updated');
      setActionModal(null);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRevokeSessions = async (user) => {
    if (!window.confirm(`Are you sure you want to terminate all active mobile & web sessions for ${user.email}?`)) {
      return;
    }
    try {
      const res = await revokeUserSessions(user._id, 'Security token invalidation by Super Admin');
      toast.success(res.message || 'Sessions terminated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke sessions');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0D0D10] p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search developers by name or email..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="verified">Verified Badge</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800/80 text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Developer Account</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Account State</th>
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-zinc-500">
                    <RefreshCw size={18} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
                    Loading developer directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-zinc-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-900/30 transition-colors">
                    {/* Developer Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                          alt={user.name}
                          className="w-7 h-7 rounded-full border border-zinc-700/80 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-zinc-100">
                            {user.name}
                            {user.isVerifiedBadge && (
                              <CheckCircle2 size={13} className="text-[#00F0FF]" title="Verified Blue Checkmark" />
                            )}
                          </div>
                          <span className="text-zinc-500 text-[11px] font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        user.role === 'super_admin'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : user.role === 'admin'
                          ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20'
                          : user.role === 'moderator'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>

                    {/* State */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {user.isSuspended ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                        {user.isShadowBanned && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Shadowbanned
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-zinc-500 text-[11px] font-mono whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* 1-Click Badge */}
                        <button
                          onClick={() => handleToggleVerified(user)}
                          title={user.isVerifiedBadge ? 'Revoke Verified Badge' : 'Grant Verified Checkmark'}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            user.isVerifiedBadge
                              ? 'text-[#00F0FF] hover:bg-[#00F0FF]/10'
                              : 'text-zinc-500 hover:text-[#00F0FF] hover:bg-zinc-800'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                        </button>

                        {/* Shadowban */}
                        <button
                          onClick={() => handleToggleShadowban(user)}
                          title={user.isShadowBanned ? 'Remove Shadowban' : 'Stealth Shadowban'}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            user.isShadowBanned
                              ? 'text-amber-400 hover:bg-amber-500/10'
                              : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-800'
                          }`}
                        >
                          <EyeOff size={14} />
                        </button>

                        {/* Suspend */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionModal('suspend');
                          }}
                          title={user.isSuspended ? 'Unsuspend Account' : 'Suspend / Block Account'}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            user.isSuspended
                              ? 'text-rose-400 hover:bg-rose-500/10'
                              : 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800'
                          }`}
                        >
                          <Ban size={14} />
                        </button>

                        {/* Change Role */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role || 'user');
                            setActionModal('role');
                          }}
                          title="Change RBAC Permission Role"
                          className="p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                        >
                          <Crown size={14} />
                        </button>

                        {/* Revoke Sessions */}
                        <button
                          onClick={() => handleRevokeSessions(user)}
                          title="Revoke all mobile & web sessions"
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Page <strong className="text-zinc-300 font-mono">{page}</strong> of <strong className="text-zinc-300 font-mono">{pagination.totalPages}</strong> ({pagination.total} accounts)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-zinc-400"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-zinc-400"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suspension Modal */}
      {actionModal === 'suspend' && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Ban size={16} className="text-rose-400" />
              {selectedUser.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
            </h4>
            <p className="text-xs text-zinc-400">
              {selectedUser.isSuspended
                ? `Restore platform access for ${selectedUser.name} (${selectedUser.email}).`
                : `Block all access for ${selectedUser.name} (${selectedUser.email}). Active sockets will be disconnected.`}
            </p>

            {!selectedUser.isSuspended && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Reason for Suspension (Logged in Audit Trail):
                </label>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Violation of community guidelines (spam)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedUser(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSuspension}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedUser.isSuspended
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                Confirm {selectedUser.isSuspended ? 'Reactivation' : 'Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {actionModal === 'role' && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Crown size={16} className="text-purple-400" />
              Update RBAC Permission Role
            </h4>
            <p className="text-xs text-zinc-400">
              Assign administrative permissions to {selectedUser.name} ({selectedUser.email}).
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Select New Role:
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
              >
                <option value="user">User (Standard Platform Developer)</option>
                <option value="moderator">Moderator (Content Triage Queue Access)</option>
                <option value="admin">Admin (User Governance & Full Moderation)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedUser(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRoleChange}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00F0FF] hover:bg-[#00D8E6] text-black cursor-pointer"
              >
                Apply Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
