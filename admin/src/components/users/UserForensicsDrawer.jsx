import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Ban, 
  EyeOff, 
  ShieldAlert, 
  Crown, 
  LogOut, 
  Download, 
  Send, 
  FileCode2, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Globe, 
  GitBranch, 
  RefreshCw, 
  Clock, 
  Calendar,
  MessageSquare,
  Users,
  AlertTriangle
} from 'lucide-react';
import { 
  getUserForensics, 
  issueUserStrike, 
  sendAdminDirectNotice, 
  exportUserDataPackage, 
  updateUserStatus, 
  toggleUserBadge, 
  updateUserRole, 
  revokeUserSessions 
} from '../../api/adminApi';
import ActionConfirmModal from '../common/ActionConfirmModal';
import toast from 'react-hot-toast';

const UserForensicsDrawer = ({ userId, isOpen, onClose, onUserUpdated }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'telemetry' | 'actions' | 'audit'

  // Safety Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'suspend',
    title: '',
    description: '',
    impactStatement: '',
    actionHandler: null,
    customSelect: null,
  });

  // Direct Admin Notice State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [sendingNotice, setSendingNotice] = useState(false);

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState('user');

  const fetchForensics = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getUserForensics(userId);
      setData(res);
      setSelectedRole(res.user?.role || 'user');
    } catch (err) {
      toast.error('Failed to load user forensics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchForensics();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const user = data?.user;
  const profile = data?.profile;
  const telemetry = data?.telemetry || {};
  const warnings = data?.warnings || [];
  const auditLogs = data?.auditLogs || [];
  const recentPosts = data?.recentPosts || [];

  // Action Handlers with Confirmation Guard
  const promptSuspendAction = () => {
    const isSuspending = !user?.isSuspended;
    setConfirmModal({
      isOpen: true,
      type: isSuspending ? 'suspend' : 'unsuspend',
      title: isSuspending ? 'Suspend Developer Account' : 'Reactivate Developer Account',
      description: isSuspending
        ? `Are you sure you want to suspend ${user?.name}? All access will be blocked immediately.`
        : `Restore full platform login and network access for ${user?.name}.`,
      impactStatement: isSuspending
        ? 'Active WebSocket sessions and JWT tokens will be immediately invalidated.'
        : 'User will be allowed to log in and interact with the developer ecosystem.',
      actionHandler: async ({ reason }) => {
        try {
          const res = await updateUserStatus(user._id, {
            action: 'toggleSuspend',
            reason,
          });
          toast.success(res.message || 'Account state updated');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchForensics();
          if (onUserUpdated) onUserUpdated();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Action failed');
        }
      },
    });
  };

  const promptStrikeAction = () => {
    setConfirmModal({
      isOpen: true,
      type: 'strike',
      title: `Issue Official Strike #${(telemetry.strikesCount || 0) + 1}`,
      description: `Issue a formal strike against ${user?.name} for terms violation.`,
      impactStatement: (telemetry.strikesCount || 0) >= 2
        ? '⚠️ THIS IS THE 3RD STRIKE. Account will be AUTOMATICALLY SUSPENDED upon confirmation.'
        : 'Notification will be injected directly into the user\'s inbox.',
      actionHandler: async ({ reason }) => {
        try {
          const res = await issueUserStrike(user._id, {
            reason,
            autoSuspend: true,
          });
          toast.success(res.message || 'Strike issued successfully');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchForensics();
          if (onUserUpdated) onUserUpdated();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to issue strike');
        }
      },
    });
  };

  const promptShadowbanAction = () => {
    const isBanning = !user?.isShadowBanned;
    setConfirmModal({
      isOpen: true,
      type: 'shadowban',
      title: isBanning ? 'Apply Stealth Shadowban' : 'Remove Stealth Shadowban',
      description: isBanning
        ? `Silently isolate ${user?.name}'s posts from the public feed without alerting them.`
        : `Restore public feed visibility for ${user?.name}.`,
      impactStatement: isBanning
        ? 'User will appear normal on their client, but their content will be filtered for all other developers.'
        : 'User content will rejoin normal algorithmic distribution.',
      actionHandler: async ({ reason }) => {
        try {
          const res = await updateUserStatus(user._id, {
            action: 'toggleShadowban',
            reason,
          });
          toast.success(res.message || 'Shadowban state updated');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchForensics();
          if (onUserUpdated) onUserUpdated();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update shadowban');
        }
      },
    });
  };

  const promptBadgeAction = () => {
    const isGranting = !user?.isVerifiedBadge;
    setConfirmModal({
      isOpen: true,
      type: 'badge',
      title: isGranting ? 'Grant Verified Blue Badge' : 'Revoke Verified Badge',
      description: isGranting
        ? `Grant official verified developer badge to ${user?.name}.`
        : `Remove verified checkmark badge from ${user?.name}.`,
      impactStatement: isGranting
        ? 'Blue checkmark will display next to user name on feeds, comments, and profile.'
        : 'Verification indicator will be removed.',
      actionHandler: async ({ reason }) => {
        try {
          const res = await toggleUserBadge(user._id);
          toast.success(res.message || 'Badge status updated');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchForensics();
          if (onUserUpdated) onUserUpdated();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update badge');
        }
      },
    });
  };

  const promptRoleChange = () => {
    setConfirmModal({
      isOpen: true,
      type: 'role',
      title: 'Update RBAC Permissions Role',
      description: `Assign a new administrative role tier to ${user?.name}.`,
      impactStatement: 'New permissions and scope restrictions will take effect immediately upon next request.',
      customSelect: (
        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">Select New Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
          >
            <option value="user">User (Standard Developer)</option>
            <option value="moderator">Moderator (Triage & Flags)</option>
            <option value="admin">Admin (User Governance)</option>
          </select>
        </div>
      ),
      actionHandler: async () => {
        try {
          const res = await updateUserRole(user._id, selectedRole);
          toast.success(res.message || 'Role updated successfully');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchForensics();
          if (onUserUpdated) onUserUpdated();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update role');
        }
      },
    });
  };

  const promptRevokeSessions = () => {
    setConfirmModal({
      isOpen: true,
      type: 'revoke_sessions',
      title: 'Invalidate All Active Sessions',
      description: `Remotely kick ${user?.name} from all active devices.`,
      impactStatement: 'Cryptographic token version will increment, invalidating all JWTs on iOS, Android, and Web.',
      actionHandler: async ({ reason }) => {
        try {
          const res = await revokeUserSessions(user._id, reason);
          toast.success(res.message || 'All sessions terminated successfully');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchForensics();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to revoke sessions');
        }
      },
    });
  };

  const handleExportData = async () => {
    try {
      toast.loading('Generating GDPR archive...', { id: 'export' });
      const blob = await exportUserDataPackage(user._id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devhub-gdpr-${user.email}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('GDPR package downloaded!', { id: 'export' });
    } catch (err) {
      toast.error('Failed to export data package', { id: 'export' });
    }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!noticeMessage.trim()) return;
    setSendingNotice(true);
    try {
      const res = await sendAdminDirectNotice(user._id, {
        title: noticeTitle.trim() || 'DevHub Trust & Safety Notice',
        message: noticeMessage.trim(),
      });
      toast.success(res.message || 'Notice delivered to user inbox');
      setNoticeTitle('');
      setNoticeMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notice');
    } finally {
      setSendingNotice(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-40 animate-fadeIn font-sans text-xs">
      {/* Slide-out Drawer */}
      <div className="w-full max-w-2xl bg-[#0D0D10] border-l border-zinc-800/80 h-full flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Drawer Top Header */}
        <div className="p-4.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt={user?.name}
                className="w-10 h-10 rounded-full border border-zinc-700 object-cover"
              />
              {user?.isVerifiedBadge && (
                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5" title="Verified Badge">
                  <CheckCircle2 size={13} className="text-[#00F0FF]" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                {user?.name || 'Loading...'}
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {user?.role || 'user'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchForensics}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Refresh User Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-2 border-b border-zinc-800/80 bg-zinc-900/20 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'portfolio'
                ? 'text-[#00F0FF] border-b-2 border-[#00F0FF] font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Portfolio & Profile
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'telemetry'
                ? 'text-[#00F0FF] border-b-2 border-[#00F0FF] font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Activity Telemetry ({telemetry.postsCount || 0} posts)
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'actions'
                ? 'text-[#00F0FF] border-b-2 border-[#00F0FF] font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Governance & Actions
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'text-[#00F0FF] border-b-2 border-[#00F0FF] font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Audit History ({auditLogs.length})
          </button>
        </div>

        {/* Drawer Body Scrollable Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-zinc-500">
              <RefreshCw size={20} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
            </div>
          ) : (
            <>
              {/* Status Alert Banner if Suspended or Shadowbanned */}
              {(user?.isSuspended || user?.isShadowBanned) && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <Ban size={14} />
                    <span>Account Status: {user?.isSuspended ? 'SUSPENDED' : 'SHADOWBANNED'}</span>
                  </div>
                  {user?.suspendedReason && (
                    <p className="text-[11px] text-zinc-400">
                      Reason: <span className="text-zinc-200 font-mono">{user.suspendedReason}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Tab 1: Portfolio & Profile */}
              {activeTab === 'portfolio' && (
                <div className="space-y-4">
                  {/* Bio & Headline Card */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-200">Developer Profile Summary</h4>
                    <p className="text-zinc-300 text-xs font-medium leading-relaxed">
                      {profile?.headline || 'No headline configured.'}
                    </p>
                    <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">
                      {profile?.bio || 'No bio provided yet.'}
                    </p>

                    <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/60 text-zinc-400 text-[11px]">
                      {profile?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-zinc-500" />
                          {profile.location}
                        </span>
                      )}
                      {profile?.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[#00F0FF] hover:underline"
                        >
                          <Globe size={12} />
                          Website
                        </a>
                      )}
                      {profile?.githubUsername && (
                        <a
                          href={`https://github.com/${profile.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-zinc-300 hover:text-white"
                        >
                          <GitBranch size={12} />
                          {profile.githubUsername}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Skills Cloud */}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                      <h4 className="text-xs font-semibold text-zinc-200">Technologies & Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Timeline */}
                  {profile?.experience && profile.experience.length > 0 && (
                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                      <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Briefcase size={13} className="text-zinc-400" />
                        Experience History
                      </h4>
                      <div className="space-y-2 divide-y divide-zinc-800/60">
                        {profile.experience.map((exp, idx) => (
                          <div key={idx} className="pt-2 first:pt-0">
                            <p className="font-semibold text-zinc-200 text-xs">{exp.title} • {exp.company}</p>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              {exp.from ? new Date(exp.from).getFullYear() : 'N/A'} - {exp.current ? 'Present' : (exp.to ? new Date(exp.to).getFullYear() : 'N/A')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Activity Telemetry */}
              {activeTab === 'telemetry' && (
                <div className="space-y-4">
                  {/* 6-Grid Telemetry Matrix */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 font-semibold block">Total Posts</span>
                      <span className="text-base font-bold text-zinc-100 font-mono">{telemetry.postsCount}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 font-semibold block">Comments</span>
                      <span className="text-base font-bold text-zinc-100 font-mono">{telemetry.commentsCount}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 font-semibold block">Connections</span>
                      <span className="text-base font-bold text-zinc-100 font-mono">{telemetry.connectionsCount}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 font-semibold block">Reports Received</span>
                      <span className={`text-base font-bold font-mono ${telemetry.reportsCount > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                        {telemetry.reportsCount}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 font-semibold block">Strikes Accumulated</span>
                      <span className={`text-base font-bold font-mono ${telemetry.strikesCount > 0 ? 'text-amber-400' : 'text-zinc-100'}`}>
                        {telemetry.strikesCount} / 3
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 font-semibold block">Token Version</span>
                      <span className="text-base font-bold text-zinc-100 font-mono">v{telemetry.tokenVersion}</span>
                    </div>
                  </div>

                  {/* Warning Strikes History */}
                  {warnings && warnings.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <h4 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                        <ShieldAlert size={14} />
                        Issued Warning Strikes ({warnings.length})
                      </h4>
                      <div className="space-y-1.5">
                        {warnings.map((w, idx) => (
                          <div key={idx} className="p-2 rounded bg-black/40 border border-amber-500/20 text-[11px] text-amber-200">
                            <p className="font-semibold">Strike #{warnings.length - idx}: {w.reason}</p>
                            <span className="text-[10px] text-amber-400/80 font-mono">
                              Issued: {new Date(w.issuedAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Posts Snippets */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <FileCode2 size={13} className="text-zinc-400" />
                      Recent Published Posts
                    </h4>
                    {recentPosts.length === 0 ? (
                      <p className="text-zinc-500 text-xs py-2">No posts created by this developer yet.</p>
                    ) : (
                      <div className="space-y-2 divide-y divide-zinc-800/60">
                        {recentPosts.map((post) => (
                          <div key={post._id} className="pt-2 first:pt-0 space-y-1">
                            <p className="text-zinc-300 text-xs line-clamp-2 leading-relaxed">{post.content}</p>
                            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                              <span>💬 {post.commentsCount || 0} comments</span>
                              <span>❤️ {post.likesCount || 0} likes</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Governance & Actions */}
              {activeTab === 'actions' && (
                <div className="space-y-4">
                  {/* Action Toolbox Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Verified Badge */}
                    <button
                      onClick={promptBadgeAction}
                      className="p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-[#00F0FF]/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-zinc-200 group-hover:text-[#00F0FF] font-semibold text-xs">
                        <CheckCircle2 size={14} className="text-[#00F0FF]" />
                        <span>{user?.isVerifiedBadge ? 'Revoke Verified Badge' : 'Grant Verified Badge'}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">1-Click blue checkmark toggle</p>
                    </button>

                    {/* Change Role */}
                    <button
                      onClick={promptRoleChange}
                      className="p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-purple-500/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-zinc-200 group-hover:text-purple-400 font-semibold text-xs">
                        <Crown size={14} className="text-purple-400" />
                        <span>Change RBAC Role</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">User / Mod / Admin permissions</p>
                    </button>

                    {/* Issue Strike */}
                    <button
                      onClick={promptStrikeAction}
                      className="p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-amber-500/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-zinc-200 group-hover:text-amber-400 font-semibold text-xs">
                        <ShieldAlert size={14} className="text-amber-400" />
                        <span>Issue Strike Warning</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Strike {(telemetry.strikesCount || 0) + 1}/3 with auto-ban</p>
                    </button>

                    {/* Stealth Shadowban */}
                    <button
                      onClick={promptShadowbanAction}
                      className="p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-amber-500/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-zinc-200 group-hover:text-amber-400 font-semibold text-xs">
                        <EyeOff size={14} className="text-amber-400" />
                        <span>{user?.isShadowBanned ? 'Remove Shadowban' : 'Apply Stealth Shadowban'}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Isolate spam content silently</p>
                    </button>

                    {/* Suspend / Ban */}
                    <button
                      onClick={promptSuspendAction}
                      className="p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-rose-500/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-zinc-200 group-hover:text-rose-400 font-semibold text-xs">
                        <Ban size={14} className="text-rose-400" />
                        <span>{user?.isSuspended ? 'Reactivate Account' : 'Suspend / Ban Account'}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Block all logins & interactions</p>
                    </button>

                    {/* Revoke Sessions */}
                    <button
                      onClick={promptRevokeSessions}
                      className="p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-rose-500/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-zinc-200 group-hover:text-rose-400 font-semibold text-xs">
                        <LogOut size={14} className="text-rose-400" />
                        <span>Revoke All Sessions</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Kick active mobile & web tokens</p>
                    </button>
                  </div>

                  {/* GDPR 1-Click Data Export */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">GDPR / CCPA Data Portability</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Download full JSON archive of posts, comments, & profile</p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer text-xs font-medium"
                    >
                      <Download size={13} />
                      <span>Export JSON</span>
                    </button>
                  </div>

                  {/* Send Direct Admin Message */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Send size={13} className="text-zinc-400" />
                      Send Direct Trust & Safety Message to User
                    </h4>
                    <form onSubmit={handleSendNotice} className="space-y-2">
                      <input
                        type="text"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="Notice subject (e.g. Account Security Recommendation)"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                      />
                      <textarea
                        rows={3}
                        value={noticeMessage}
                        onChange={(e) => setNoticeMessage(e.target.value)}
                        placeholder="Write official administrative notice text..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                        required
                      />
                      <button
                        type="submit"
                        disabled={sendingNotice}
                        className="px-3.5 py-1.5 rounded-lg bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {sendingNotice ? 'Delivering...' : 'Send to In-App Inbox'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 4: Audit History */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-200">Immutable Staff Action History on this Account</h4>
                  {auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
                      <Clock size={24} className="mx-auto text-zinc-600 mb-1" />
                      <p className="text-xs">No prior governance actions recorded.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div key={log._id} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-200 font-mono text-[11px]">{log.action}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Executed by: <strong className="text-zinc-300">{log.actor?.name || 'Admin'}</strong> ({log.actor?.email})
                          </p>
                          {log.details && (
                            <pre className="text-[10px] bg-black/40 p-1.5 rounded text-zinc-400 font-mono overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reusable Action Confirmation Guard Modal */}
      <ActionConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.actionHandler}
        title={confirmModal.title}
        description={confirmModal.description}
        impactStatement={confirmModal.impactStatement}
        targetUser={user}
        actionType={confirmModal.type}
        customSelect={confirmModal.customSelect}
      />
    </div>
  );
};

export default UserForensicsDrawer;
