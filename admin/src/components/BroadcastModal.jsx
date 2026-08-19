import React, { useState } from 'react';
import { Megaphone, Send, Radio } from 'lucide-react';
import { broadcastAnnouncement } from '../api/adminApi';
import toast from 'react-hot-toast';

const BroadcastModal = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system_alert');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Broadcast message is required');
      return;
    }

    setSending(true);
    try {
      const res = await broadcastAnnouncement({
        title: title.trim() || 'DevHub System Alert',
        message: message.trim(),
        type,
        link: link.trim() || null,
      });
      toast.success(res.message || 'Announcement broadcasted live to all users!');
      setTitle('');
      setMessage('');
      setLink('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl bg-[#0D0D10] border border-zinc-800/80 rounded-xl p-6 shadow-sm space-y-5 font-sans">
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
          <Megaphone size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Global Notification Broadcast</h3>
          <p className="text-xs text-zinc-400">
            Dispatch real-time WebSocket events and in-app alerts to all connected Web & Mobile devices.
          </p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4 text-xs">
        <div>
          <label className="block text-zinc-400 font-medium mb-1">
            Announcement Title (Optional):
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled Maintenance / Platform Version Update"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div>
          <label className="block text-zinc-400 font-medium mb-1">
            Message Body:
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write the broadcast message that will appear on user screens..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-400 font-medium mb-1">Alert Severity:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              <option value="system_alert">System Notice (Standard)</option>
              <option value="maintenance">Maintenance Alert (Amber)</option>
              <option value="critical">Critical Security Notice (Red)</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-medium mb-1">Action Deep Link (Optional):</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. /settings or /feed"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-semibold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
        >
          <Send size={13} />
          <span>{sending ? 'Transmitting Broadcast...' : 'Dispatch Live Broadcast'}</span>
        </button>
      </form>
    </div>
  );
};

export default BroadcastModal;
