import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  Ban, 
  EyeOff, 
  Crown, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { getAllUsers, updateUserStatus } from '../api/adminApi';
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
        limit: 10,
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(data.users || []);
      setPagination(data.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      toast.error('Failed to load users');
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
      const updated = await updateUserStatus(user._id, {
        action: 'toggle_verified',
      });
      toast.success(updated.message || 'Verification updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleToggleShadowban = async (user) => {
    try {
      const updated = await updateUserStatus(user._id, {
        action: 'toggle_shadowban',
      });
      toast.success(updated.message || 'Shadowban updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleExecuteSuspension = async () => {
    if (!selectedUser) return;
    try {
      const updated = await updateUserStatus(selectedUser._id, {
        action: 'toggle_suspend',
        reason: suspendReason,
      });
      toast.success(updated.message || 'Suspension updated');
      setActionModal(null);
      setSuspendReason('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleExecuteRoleChange = async () => {
    if (!selectedUser) return;
    try {
      const updated = await updateUserStatus(selectedUser._id, {
        action: 'change_role',
        role: newRole,
      });
      toast.success(updated.message || 'Role updated');
      setActionModal(null);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#111] p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#00F0FF]/50 cursor-pointer"
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
            className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#00F0FF]/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="verified">Verified Badge</option>
            <option value="shadowbanned">Shadowbanned</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 bg-[#1a1a1a] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-gray-500">
                    <RefreshCw size={20} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-gray-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border border-white/10 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            {user.name}
                            {user.isVerifiedBadge && (
                              <CheckCircle size={13} className="text-[#00F0FF]" title="Verified Developer Badge" />
                            )}
                          </div>
                          <span className="text-gray-500 text-[11px]">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'super_admin'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : user.role === 'admin'
                          ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20'
                          : user.role === 'moderator'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {user.isSuspended ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                        {user.isShadowBanned && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Shadowbanned
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-gray-400 text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleVerified(user)}
                          title={user.isVerifiedBadge ? 'Remove Verified Badge' : 'Give Verified Badge'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            user.isVerifiedBadge
                              ? 'text-[#00F0FF] hover:bg-[#00F0FF]/10'
                              : 'text-gray-500 hover:text-[#00F0FF] hover:bg-white/5'
                          }`}
                        >
                          <CheckCircle size={15} />
                        </button>

                        <button
                          onClick={() => handleToggleShadowban(user)}
                          title={user.isShadowBanned ? 'Remove Shadowban' : 'Shadowban User'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            user.isShadowBanned
                              ? 'text-amber-400 hover:bg-amber-500/10'
                              : 'text-gray-500 hover:text-amber-400 hover:bg-white/5'
                          }`}
                        >
                          <EyeOff size={15} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionModal('suspend');
                          }}
                          title={user.isSuspended ? 'Unsuspend User' : 'Suspend / Ban User'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            user.isSuspended
                              ? 'text-rose-400 hover:bg-rose-500/10'
                              : 'text-gray-500 hover:text-rose-400 hover:bg-white/5'
                          }`}
                        >
                          <Ban size={15} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role || 'user');
                            setActionModal('role');
                          }}
                          title="Change User Role"
                          className="p-1.5 text-gray-500 hover:text-purple-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Crown size={15} />
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
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
          <span>Total {pagination.total || 0} Registered Users</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="text-gray-400 font-semibold">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
              disabled={page >= (pagination.totalPages || 1)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {actionModal === 'suspend' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-bold text-base">
              <AlertTriangle size={22} />
              {selectedUser.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
            </div>
            <p className="text-xs text-gray-400">
              Are you sure you want to {selectedUser.isSuspended ? 'unsuspend' : 'suspend'}{' '}
              <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email})?
            </p>

            {!selectedUser.isSuspended && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Reason for Suspension (Optional)
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Terms violation, spam activities..."
                  rows={3}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSuspension}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                  selectedUser.isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                }`}
              >
                {selectedUser.isSuspended ? 'Confirm Unsuspend' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {actionModal === 'role' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-400 font-bold text-base">
              <Crown size={22} />
              Change User Role
            </div>
            <p className="text-xs text-gray-400">
              Assign a new administrative role to <strong className="text-white">{selectedUser.name}</strong>:
            </p>

            <div className="space-y-2">
              {[
                { id: 'user', label: 'User (Standard Community Member)' },
                { id: 'moderator', label: 'Moderator (Can review reported content)' },
                { id: 'admin', label: 'Admin (Full User & Content Management)' },
                { id: 'super_admin', label: 'Super Admin (Complete System Ownership)' },
              ].map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    newRole === r.id
                      ? 'bg-purple-500/10 border-purple-500/40 text-white'
                      : 'bg-[#1e1e1e] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="roleOption"
                    value={r.id}
                    checked={newRole === r.id}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="accent-purple-500"
                  />
                  <span className="text-xs font-semibold">{r.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRoleChange}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
