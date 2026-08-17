import React, { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import { broadcastAnnouncement } from '../api/adminApi';
import toast from 'react-hot-toast';

const BroadcastModal = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [isBanner, setIsBanner] = useState(true);
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setSending(true);
    try {
      const res = await broadcastAnnouncement({
        title,
        message,
        type,
        isBanner,
      });
      toast.success(res.message || 'Announcement broadcasted successfully!');
      setTitle('');
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <Megaphone size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">Global Announcement Engine</h3>
          <p className="text-xs text-gray-400">
            Transmit real-time system notifications and top banners across all active users.
          </p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Announcement Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled System Maintenance / Platform Update"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Message Content</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement details here..."
            rows={4}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Severity Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-[#00F0FF]/50 cursor-pointer"
            >
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Amber)</option>
              <option value="alert">Critical Alert (Red)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Delivery Scope</label>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBanner}
                  onChange={(e) => setIsBanner(e.target.checked)}
                  className="accent-[#00F0FF]"
                />
                Top Site Banner
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-[#00F0FF] hover:bg-[#00d8e6] text-black font-extrabold text-xs py-3 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Send size={15} />
          {sending ? 'Broadcasting to Network...' : 'Send Global Broadcast'}
        </button>
      </form>
    </div>
  );
};

export default BroadcastModal;
