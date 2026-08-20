import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Wrench, 
  Sparkles, 
  Power, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Users, 
  RefreshCw,
  Bell,
  Sliders,
  Eye
} from 'lucide-react';
import { 
  broadcastAnnouncement, 
  getAllBroadcasts, 
  toggleBroadcastStatus, 
  deleteBroadcast 
} from '../api/adminApi';
import ActionConfirmModal from './common/ActionConfirmModal';
import toast from 'react-hot-toast';

const URGENCY_TYPES = [
  {
    id: 'announcement',
    label: 'Feature Announcement',
    icon: Sparkles,
    badgeColor: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20',
    bannerBg: 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-cyan-200',
  },
  {
    id: 'maintenance',
    label: 'Scheduled Maintenance',
    icon: Wrench,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bannerBg: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
  },
  {
    id: 'security_alert',
    label: 'Security Advisory',
    icon: ShieldAlert,
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    bannerBg: 'bg-rose-500/10 border-rose-500/30 text-rose-200',
  },
  {
    id: 'critical_emergency',
    label: 'Emergency Critical Alert',
    icon: AlertTriangle,
    badgeColor: 'bg-red-600/20 text-red-400 border-red-500/40',
    bannerBg: 'bg-red-600/20 border-red-500/50 text-red-100',
  },
];

const BroadcastConsole = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [priority, setPriority] = useState('medium');
  const [targetAudience, setTargetAudience] = useState('all');
  const [link, setLink] = useState('');
  const [linkText, setLinkText] = useState('Learn More');
  const [isPersistentBanner, setIsPersistentBanner] = useState(true);
  const [sendInboxNotification, setSendInboxNotification] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'suspend',
    title: '',
    description: '',
    impactStatement: '',
    actionHandler: null,
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getAllBroadcasts();
      setBroadcasts(data.broadcasts || []);
    } catch (err) {
      toast.error('Failed to load broadcast history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePromptDispatch = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both title and message');
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: type === 'critical_emergency' || type === 'security_alert' ? 'suspend' : 'unsuspend',
      title: `Dispatch Network Broadcast: "${title}"`,
      description: `You are about to transmit a platform-wide ${type.replace('_', ' ')} alert.`,
      impactStatement: `Target Audience: ${targetAudience.toUpperCase()}. This will push live WebSockets to all connected clients and save a persistent top banner.`,
      actionHandler: async () => {
        setSending(true);
        try {
          const res = await broadcastAnnouncement({
            title: title.trim(),
            message: message.trim(),
            type,
            priority,
            targetAudience,
            link: link.trim() || null,
            linkText: linkText.trim() || 'Learn More',
            isPersistentBanner,
            sendInboxNotification,
            expiresAt: expiresAt || null,
          });

          toast.success(res.message || 'Broadcast transmitted successfully!');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setTitle('');
          setMessage('');
          setLink('');
          fetchHistory();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to dispatch broadcast');
        } finally {
          setSending(false);
        }
      },
    });
  };

  const handleToggleStatus = async (broadcast) => {
    try {
      const res = await toggleBroadcastStatus(broadcast._id);
      toast.success(res.message);
      fetchHistory();
    } catch (err) {
      toast.error('Failed to toggle broadcast status');
    }
  };

  const handleDelete = async (broadcastId) => {
    if (!window.confirm('Permanently delete this broadcast record?')) return;
    try {
      await deleteBroadcast(broadcastId);
      toast.success('Broadcast deleted');
      fetchHistory();
    } catch (err) {
      toast.error('Failed to delete broadcast');
    }
  };

  const currentTypeConfig = URGENCY_TYPES.find((u) => u.id === type) || URGENCY_TYPES[0];
  const IconComponent = currentTypeConfig.icon;

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Top Banner Header */}
      <div className="bg-[#0D0D10] border border-zinc-800/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              Network Broadcast & Emergency Alert Sentinel
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Transmit system advisories, maintenance banners, and real-time alerts across web and mobile fleets.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-[#00F0FF]' : ''} />
          <span>Refresh History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Composer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} className="text-[#00F0FF]" />
              Broadcast Composer
            </h3>

            <form onSubmit={handlePromptDispatch} className="space-y-4">
              {/* Urgency Type Radio Group */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2">Urgency Tier & Visual Styling</label>
                <div className="grid grid-cols-2 gap-2">
                  {URGENCY_TYPES.map((u) => {
                    const UIcon = u.icon;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setType(u.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          type === u.id
                            ? `${u.badgeColor} border-current bg-white/[0.04]`
                            : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <UIcon size={16} />
                        <span className="font-semibold text-xs">{u.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Announcement Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scheduled Maintenance Notice: Aug 21"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00F0FF]/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#00F0FF]/50 cursor-pointer"
                  >
                    <option value="all">All Developers (100%)</option>
                    <option value="verified_only">Verified Only (Blue Badges)</option>
                    <option value="moderators_only">Staff & Moderators</option>
                  </select>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Message Content (Markdown supported)</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide concise operational guidance or advisory details..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00F0FF]/50 leading-relaxed"
                  required
                />
              </div>

              {/* Action CTA Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">CTA Link (Optional)</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. /settings/security or https://status.devhub.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00F0FF]/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">CTA Button Label</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="e.g. View Status / Read Docs"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00F0FF]/50"
                  />
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                <span className="text-[11px] font-bold text-zinc-300 block">Dispatch Options</span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={isPersistentBanner}
                      onChange={(e) => setIsPersistentBanner(e.target.checked)}
                      className="accent-[#00F0FF] rounded"
                    />
                    <span>🚨 Display Persistent Top Header Banner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={sendInboxNotification}
                      onChange={(e) => setSendInboxNotification(e.target.checked)}
                      className="accent-[#00F0FF] rounded"
                    />
                    <span>📥 Ingest into User Notification Feeds</span>
                  </label>
                </div>
              </div>

              {/* Submit Dispatch */}
              <button
                type="submit"
                disabled={sending || !title || !message}
                className="w-full py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                <span>{sending ? 'Transmitting Broadcast...' : 'Review & Transmit Network Broadcast'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Live Preview Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Eye size={14} className="text-purple-400" />
              Live Client Preview
            </h3>

            {/* Live Banner Mock */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 font-mono">1. Public Top Alert Banner:</span>
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 shadow-md ${currentTypeConfig.bannerBg}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <IconComponent size={16} className="flex-shrink-0" />
                  <div className="truncate">
                    <strong className="font-bold text-xs">{title || 'Your Announcement Title'}</strong>
                    <span className="mx-2 opacity-60">•</span>
                    <span className="text-xs opacity-90">{message || 'Your broadcast message preview...'}</span>
                  </div>
                </div>
                {link && (
                  <span className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold whitespace-nowrap cursor-pointer">
                    {linkText || 'Learn More'}
                  </span>
                )}
              </div>
            </div>

            {/* In-App Toast Mock */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] text-zinc-500 font-mono">2. Real-Time Socket Toast Popup:</span>
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3 shadow-xl">
                <div className={`p-2 rounded-lg ${currentTypeConfig.badgeColor}`}>
                  <IconComponent size={16} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-zinc-100 text-xs">{title || 'System Notification'}</p>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                    {message || 'Broadcast message will appear here in real-time on all active user devices.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History & Killswitch Console */}
      <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Clock size={14} className="text-zinc-400" />
            Broadcast Transmissions & Killswitch Console ({broadcasts.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800/80 text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Broadcast Title & Message</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Delivered</th>
                <th className="px-4 py-3">Banner State</th>
                <th className="px-4 py-3">Dispatched At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-zinc-500">
                    <RefreshCw size={18} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
                    Loading broadcast history...
                  </td>
                </tr>
              ) : broadcasts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-zinc-500">
                    No past broadcasts recorded.
                  </td>
                </tr>
              ) : (
                broadcasts.map((b) => {
                  const typeConf = URGENCY_TYPES.find((u) => u.id === b.type) || URGENCY_TYPES[0];
                  return (
                    <tr key={b._id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Title & Preview */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-zinc-200">{b.title}</p>
                        <p className="text-zinc-500 text-[11px] truncate">{b.message}</p>
                      </td>

                      {/* Tier Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${typeConf.badgeColor}`}>
                          {b.type.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Audience */}
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {b.targetAudience}
                      </td>

                      {/* Delivered */}
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">
                        {b.stats?.sentCount || 0} users
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {b.isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Live Banner
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Dispatched At */}
                      <td className="px-4 py-3 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleString()}
                      </td>

                      {/* Killswitch & Delete Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(b)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                              b.isActive
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                            title={b.isActive ? 'Kill / Deactivate live banner' : 'Reactivate banner'}
                          >
                            <Power size={13} />
                            <span>{b.isActive ? 'Kill Banner' : 'Reactivate'}</span>
                          </button>

                          <button
                            onClick={() => handleDelete(b._id)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Broadcast"
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

      {/* Safety Confirmation Guard Modal */}
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

export default BroadcastConsole;
