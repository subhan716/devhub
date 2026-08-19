import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Ban, 
  EyeOff, 
  Crown, 
  RefreshCw, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { 
  getAllUsers, 
  updateUserStatus, 
  toggleUserBadge, 
  updateUserRole, 
  revokeUserSessions 
} from '../api/adminApi';
import ActionConfirmModal from './common/ActionConfirmModal';
import UserForensicsDrawer from './users/UserForensicsDrawer';
import toast from 'react-hot-toast';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Selected User for Forensics Drawer
  const [forensicsUserId, setForensicsUserId] = useState(null);

  // Confirmation Safety Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'suspend',
    title: '',
    description: '',
    impactStatement: '',
    targetUser: null,
    actionHandler: null,
    customSelect: null,
  });

  const [rolePickerValue, setRolePickerValue] = useState('user');

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

  // Confirmation-Guarded Action Triggers
  const triggerSuspendConfirmation = (user) => {
    const isSuspending = !user.isSuspended;
    setConfirmModal({
      isOpen: true,
      type: isSuspending ? 'suspend' : 'unsuspend',
      title: isSuspending ? 'Suspend Developer Account' : 'Reactivate Developer Account',
      description: isSuspending
        ? `Are you sure you want to suspend ${user.name} (${user.email})?`
        : `Restore platform access for ${user.name} (${user.email}).`,
      impactStatement: isSuspending
        ? 'Account access will be immediately blocked and active sessions revoked.'
        : 'User will regain standard platform access.',
      targetUser: user,
      actionHandler: async ({ reason }) => {
        try {
          const res = await updateUserStatus(user._id, {
            action: 'toggleSuspend',
            reason,
          });
          toast.success(res.message || 'Account status updated');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update suspension');
        }
      },
    });
  };

  const triggerBadgeConfirmation = (user) => {
    const isGranting = !user.isVerifiedBadge;
    setConfirmModal({
      isOpen: true,
      type: 'badge',
      title: isGranting ? 'Grant Verified Blue Badge' : 'Revoke Verified Badge',
      description: isGranting
        ? `Grant official blue verification badge to ${user.name} (${user.email}).`
        : `Remove verified checkmark from ${user.name} (${user.email}).`,
      impactStatement: isGranting
        ? 'Blue checkmark badge will be publicly visible next to developer profile.'
        : 'Verification indicator will be removed from all posts and profile.',
      targetUser: user,
      actionHandler: async () => {
        try {
          const res = await toggleUserBadge(user._id);
          toast.success(res.message || 'Badge updated');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to toggle badge');
        }
      },
    });
  };

  const triggerRoleConfirmation = (user) => {
    setRolePickerValue(user.role || 'user');
    setConfirmModal({
      isOpen: true,
      type: 'role',
      title: 'Update RBAC Permission Role',
      description: `Change permission role for ${user.name} (${user.email}).`,
      impactStatement: 'New administrative permissions and API access will apply immediately.',
      targetUser: user,
      customSelect: (
        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">Select New Role:</label>
          <select
            value={rolePickerValue}
            onChange={(e) => setRolePickerValue(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
          >
            <option value="user">User (Standard Developer)</option>
            <option value="moderator">Moderator (Triage Queue Access)</option>
            <option value="admin">Admin (User Governance)</option>
          </select>
        </div>
      ),
      actionHandler: async () => {
        try {
          const res = await updateUserRole(user._id, rolePickerValue);
          toast.success(res.message || 'Role updated');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update role');
        }
      },
    });
  };

  const triggerRevokeSessionsConfirmation = (user) => {
    setConfirmModal({
      isOpen: true,
      type: 'revoke_sessions',
      title: 'Invalidate All Active Sessions',
      description: `Terminate all active sessions for ${user.name} (${user.email}).`,
      impactStatement: 'Cryptographic token version will increment, forcing instant re-authentication across all devices.',
      targetUser: user,
      actionHandler: async ({ reason }) => {
        try {
          const res = await revokeUserSessions(user._id, reason);
          toast.success(res.message || 'All sessions terminated successfully');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to revoke sessions');
        }
      },
    });
  };

  const triggerShadowbanConfirmation = (user) => {
    const isBanning = !user.isShadowBanned;
    setConfirmModal({
      isOpen: true,
      type: 'shadowban',
      title: isBanning ? 'Apply Stealth Shadowban' : 'Remove Stealth Shadowban',
      description: isBanning
        ? `Isolate ${user.name}'s posts silently without notifying them.`
        : `Restore standard public distribution for ${user.name}.`,
      impactStatement: isBanning
        ? 'Developer content will be hidden from public feeds while appearing normal on their client.'
        : 'Developer content will be visible across the entire platform.',
      targetUser: user,
      actionHandler: async ({ reason }) => {
        try {
          const res = await updateUserStatus(user._id, {
            action: 'toggleShadowban',
            reason,
          });
          toast.success(res.message || 'Shadowban updated');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update shadowban');
        }
      },
    });
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Search & Filters Header */}
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
                <th className="px-4 py-3">Strikes</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                    <RefreshCw size={18} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
                    Loading developer directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                  >
                    {/* Developer Info (Click opens 360° Drawer) */}
                    <td 
                      className="px-4 py-3"
                      onClick={() => setForensicsUserId(user._id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                          alt={user.name}
                          className="w-7 h-7 rounded-full border border-zinc-700/80 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-zinc-100 group-hover:text-[#00F0FF] transition-colors">
                            {user.name}
                            {user.isVerifiedBadge && (
                              <CheckCircle2 size={13} className="text-[#00F0FF]" title="Verified Blue Badge" />
                            )}
                          </div>
                          <span className="text-zinc-500 text-[11px] font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3" onClick={() => setForensicsUserId(user._id)}>
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
                    <td className="px-4 py-3" onClick={() => setForensicsUserId(user._id)}>
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

                    {/* Strikes */}
                    <td className="px-4 py-3 font-mono text-[11px]" onClick={() => setForensicsUserId(user._id)}>
                      <span className={user.strikesCount > 0 ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                        {user.strikesCount || 0}/3
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-zinc-500 text-[11px] font-mono whitespace-nowrap" onClick={() => setForensicsUserId(user._id)}>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions with Safety Guard */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* 360 Forensics Drawer Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setForensicsUserId(user._id);
                          }}
                          title="Open 360° Developer Forensics"
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                        >
                          <SlidersHorizontal size={14} />
                        </button>

                        {/* Verified Badge Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerBadgeConfirmation(user);
                          }}
                          title={user.isVerifiedBadge ? 'Revoke Verified Badge' : 'Grant Verified Blue Checkmark'}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            user.isVerifiedBadge
                              ? 'text-[#00F0FF] hover:bg-[#00F0FF]/10'
                              : 'text-zinc-500 hover:text-[#00F0FF] hover:bg-zinc-800'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                        </button>

                        {/* Shadowban Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerShadowbanConfirmation(user);
                          }}
                          title={user.isShadowBanned ? 'Remove Stealth Shadowban' : 'Apply Stealth Shadowban'}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            user.isShadowBanned
                              ? 'text-amber-400 hover:bg-amber-500/10'
                              : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-800'
                          }`}
                        >
                          <EyeOff size={14} />
                        </button>

                        {/* Suspend / Unsuspend */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerSuspendConfirmation(user);
                          }}
                          title={user.isSuspended ? 'Reactivate Account' : 'Suspend / Ban Account'}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerRoleConfirmation(user);
                          }}
                          title="Change RBAC Role"
                          className="p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                        >
                          <Crown size={14} />
                        </button>

                        {/* Revoke Sessions */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerRevokeSessionsConfirmation(user);
                          }}
                          title="Invalidate all active sessions across devices"
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

      {/* 360° User Forensics Slide-Out Drawer */}
      <UserForensicsDrawer
        userId={forensicsUserId}
        isOpen={Boolean(forensicsUserId)}
        onClose={() => setForensicsUserId(null)}
        onUserUpdated={fetchUsers}
      />

      {/* Reusable Action Confirmation Guard Dialog */}
      <ActionConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.actionHandler}
        title={confirmModal.title}
        description={confirmModal.description}
        impactStatement={confirmModal.impactStatement}
        targetUser={confirmModal.targetUser}
        actionType={confirmModal.type}
        customSelect={confirmModal.customSelect}
      />
    </div>
  );
};

export default UserTable;
