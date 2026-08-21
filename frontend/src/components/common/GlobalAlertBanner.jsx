import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Wrench, 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const TIER_STYLES = {
  announcement: {
    icon: Sparkles,
    bg: 'bg-cyan-950/80 border-cyan-500/30 text-cyan-200',
    badge: 'bg-[#0A66C2] dark:bg-[#00F0FF]/20 text-[#0A66C2] dark:text-[#00F0FF] border-[#0A66C2] dark:border-[#00F0FF]/40',
    button: 'bg-[#0A66C2] dark:bg-[#00F0FF] hover:bg-[#00D8E6] text-black',
  },
  maintenance: {
    icon: Wrench,
    bg: 'bg-amber-950/80 border-amber-500/40 text-amber-200',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    button: 'bg-amber-500 hover:bg-amber-400 text-black',
  },
  security_alert: {
    icon: ShieldAlert,
    bg: 'bg-rose-950/80 border-rose-500/40 text-rose-200',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    button: 'bg-rose-500 hover:bg-rose-400 text-white',
  },
  critical_emergency: {
    icon: AlertTriangle,
    bg: 'bg-red-950/90 border-red-500/60 text-red-100 animate-pulse',
    badge: 'bg-red-500/30 text-red-200 border-red-500/50',
    button: 'bg-red-600 hover:bg-red-500 text-white',
  },
};

const GlobalAlertBanner = () => {
  const [activeBanner, setActiveBanner] = useState(null);
  const { socket } = useSocket();

  // Fetch initial active banner from public API
  useEffect(() => {
    const fetchActiveBanner = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/public/broadcasts/active`
        );
        if (data.broadcasts && data.broadcasts.length > 0) {
          const banner = data.broadcasts[0];
          // Check if previously dismissed in this session
          const dismissedId = sessionStorage.getItem('dismissed_broadcast_id');
          if (dismissedId !== banner._id || banner.type === 'critical_emergency') {
            setActiveBanner(banner);
          }
        }
      } catch (err) {
        // Silently ignore if offline or error
      }
    };

    fetchActiveBanner();
  }, []);

  // Listen to live WebSocket broadcast emissions
  useEffect(() => {
    if (!socket) return;

    const handleNewBroadcast = (broadcast) => {
      if (broadcast.isPersistentBanner) {
        setActiveBanner(broadcast);
      }
    };

    const handleDeactivated = ({ broadcastId }) => {
      setActiveBanner((prev) => (prev?._id === broadcastId ? null : prev));
    };

    socket.on('global_broadcast', handleNewBroadcast);
    socket.on('broadcast_deactivated', handleDeactivated);

    return () => {
      socket.off('global_broadcast', handleNewBroadcast);
      socket.off('broadcast_deactivated', handleDeactivated);
    };
  }, [socket]);

  if (!activeBanner) return null;

  const style = TIER_STYLES[activeBanner.type] || TIER_STYLES.announcement;
  const IconComponent = style.icon;

  const handleDismiss = () => {
    sessionStorage.setItem('dismissed_broadcast_id', activeBanner._id);
    setActiveBanner(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full border-b backdrop-blur-md z-40 relative px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-lg ${style.bg}`}
      >
        {/* Left icon and message */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1 max-w-4xl mx-auto">
          <div className={`p-1 rounded-md border flex-shrink-0 ${style.badge}`}>
            <IconComponent size={14} />
          </div>

          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="font-bold tracking-wide uppercase text-[10px] px-1.5 py-0.5 rounded bg-black/30 border border-white/10 flex-shrink-0">
              {activeBanner.type.replace('_', ' ')}
            </span>
            <strong className="font-semibold text-white truncate flex-shrink-0">
              {activeBanner.title}:
            </strong>
            <span className="truncate opacity-90 text-[11px]">{activeBanner.message}</span>
          </div>

          {/* Action CTA Button */}
          {activeBanner.link && (
            <a
              href={activeBanner.link}
              target={activeBanner.link.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex-shrink-0 flex items-center gap-1 shadow cursor-pointer ${style.button}`}
            >
              <span>{activeBanner.linkText || 'Learn More'}</span>
              <ChevronRight size={12} />
            </a>
          )}
        </div>

        {/* Dismiss close button (disabled on critical emergency) */}
        {activeBanner.type !== 'critical_emergency' && (
          <button
            onClick={handleDismiss}
            className="p-1 text-white/60 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
            title="Dismiss Announcement"
          >
            <X size={14} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalAlertBanner;
