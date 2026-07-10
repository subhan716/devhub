import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Bell, UserPlus, Heart, MessageSquare, Check, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', { withCredentials: true });
      setNotifications(res.data);
      
      // Auto mark all as read when opening the page
      if (res.data.some(n => !n.read)) {
        await axios.put('http://localhost:5000/api/notifications/read-all', {}, { withCredentials: true });
        setNotifications(res.data.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={16} className="text-pink-500" />;
      case 'comment': return <MessageSquare size={16} className="text-[#00F0FF]" />;
      case 'follow': return <UserPlus size={16} className="text-[#8A2BE2]" />;
      case 'connection_request': return <UserPlus size={16} className="text-green-500" />;
      case 'connection_accepted': return <Check size={16} className="text-green-500" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="text-[#00F0FF]" /> 
            Notifications
          </h1>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">You're all caught up!</h2>
            <p className="text-gray-400">No new notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border border-white/5 transition-all flex items-start gap-4 ${
                    !notif.read ? 'bg-[#00F0FF]/5' : 'bg-white/[0.02]'
                  }`}
                >
                  <img 
                    src={notif.sender?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                    alt={notif.sender?.name} 
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex-1">
                    <p className={`text-base ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                      <span className="font-bold text-white hover:text-[#00F0FF] cursor-pointer transition-colors">
                        {notif.sender?.name}
                      </span>{' '}
                      {notif.message}
                    </p>
                    {notif.relatedPost && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1 italic">
                        "{notif.relatedPost.title || 'A post'}"
                      </p>
                    )}
                    <span className="text-xs text-gray-500 mt-2 block">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    {getIcon(notif.type)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
