import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Heart, MessageSquare, UserPlus, CheckCircle2, Settings } from 'lucide-react';

const DUMMY_NOTIFICATIONS = [
  { id: 1, type: 'like', text: 'Alex Chen liked your post "Why React 19 is a game changer"', time: '5m ago', unread: true },
  { id: 2, type: 'comment', text: 'Sarah Smith commented on your article "Deploying with Vercel"', time: '1h ago', unread: true },
  { id: 3, type: 'follow', text: 'John Doe started following you', time: '2h ago', unread: false },
  { id: 4, type: 'like', text: 'David Miller liked your project "DevHub"', time: '5h ago', unread: false },
  { id: 5, type: 'comment', text: 'Emily Davis replied to your comment on "Understanding GraphQL"', time: '1d ago', unread: false },
  { id: 6, type: 'follow', text: 'Michael Wilson started following you', time: '2d ago', unread: false },
  { id: 7, type: 'like', text: 'Sophia Taylor liked your post "My remote work setup"', time: '3d ago', unread: false },
];

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  const filteredNotifications = activeTab === 'all' 
    ? DUMMY_NOTIFICATIONS 
    : DUMMY_NOTIFICATIONS.filter(n => n.unread);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bell className="text-[#00F0FF]" size={28} />
          Notifications
        </h1>
        <div className="flex items-center gap-4">
          <button className="text-sm text-gray-400 hover:text-[#00F0FF] transition-colors flex items-center gap-1">
            <CheckCircle2 size={16} /> Mark all as read
          </button>
          <button className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-6">
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-3 font-medium transition-colors relative ${activeTab === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          All
          {activeTab === 'all' && (
            <motion.div layoutId="notifTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00F0FF]" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('unread')}
          className={`pb-3 font-medium transition-colors relative ${activeTab === 'unread' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Unread
          {DUMMY_NOTIFICATIONS.some(n => n.unread) && (
            <span className="ml-2 bg-[#FF0055] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {DUMMY_NOTIFICATIONS.filter(n => n.unread).length}
            </span>
          )}
          {activeTab === 'unread' && (
            <motion.div layoutId="notifTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00F0FF]" />
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-[#111] rounded-2xl border border-white/5">
            <Bell size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No notifications yet</h3>
            <p className="text-gray-500">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          filteredNotifications.map((notif, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={notif.id} 
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                notif.unread 
                  ? 'bg-gradient-to-r from-[#00F0FF]/5 to-transparent border-[#00F0FF]/20 hover:border-[#00F0FF]/40' 
                  : 'bg-[#111] border-white/5 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <div className={`mt-1 rounded-full p-2 h-fit ${
                notif.type === 'like' ? 'bg-pink-500/20 text-pink-500' :
                notif.type === 'comment' ? 'bg-[#00F0FF]/20 text-[#00F0FF]' :
                'bg-[#8A2BE2]/20 text-[#8A2BE2]'
              }`}>
                {notif.type === 'like' && <Heart size={18} className={notif.unread ? "fill-pink-500" : ""} />}
                {notif.type === 'comment' && <MessageSquare size={18} className={notif.unread ? "fill-[#00F0FF]" : ""} />}
                {notif.type === 'follow' && <UserPlus size={18} />}
              </div>
              
              <div className="flex-1">
                <p className={`text-[15px] leading-relaxed ${notif.unread ? 'text-white font-medium' : 'text-gray-300'}`}>
                  {notif.text}
                </p>
                <span className="text-sm text-gray-500 mt-1 block">{notif.time}</span>
              </div>
              
              {notif.unread && (
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]"></div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
