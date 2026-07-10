import { Bell, Mail, LogOut, User as UserIcon, Search, Menu, Heart, MessageSquare, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import { useSocket } from '../../context/SocketContext';

import { formatDistanceToNow } from 'date-fns';

// Create an audio instance for the notification ping
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

const TopNavbar = ({ setIsMobileMenuOpen, currentUser, isMessagesPage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { statusPref, toggleStatusPref } = useSocket() || {};
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { socket } = useSocket() || {};

  // Fetch and Socket Logic
  useEffect(() => {
    // Request Desktop Notification Permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications', { withCredentials: true });
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    if (socket) {
      socket.on('newNotification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        
        // Determine if sound and popup should play
        const playSoundTypes = ['connection_request', 'follow', 'connection_accepted'];
        if (playSoundTypes.includes(newNotif.type)) {
          // Play sound
          notificationSound.play().catch(e => console.log('Audio play failed:', e));
          
          // Show Native Desktop Popup
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('DevHub', {
              body: `${newNotif.sender.name} ${newNotif.message}`,
              icon: newNotif.sender.avatar?.url || '/images/logo.png',
            });
          }
        }
      });
    }

    return () => {
      if (socket) socket.off('newNotification');
    };
  }, [socket]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (notifId, isAlreadyRead) => {
    if (isAlreadyRead) return;
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${notifId}`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
      localStorage.removeItem('isAuthenticated');
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className={`h-20 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8 w-full ${isMessagesPage ? 'lg:pr-[352px]' : ''} transition-all duration-300`}>
      {/* Logo & Page Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Mobile/Tablet Logo (Visible when Sidebar is hidden) */}
        <Link to="/feed" className="flex items-center gap-3 md:hidden group">
          <img src="/images/logo.png" alt="DevHub Logo" className="w-8 h-8 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight hidden md:block">Feed</h1>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-lg mx-8 hidden lg:block">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-500 group-focus-within:text-[#00F0FF] transition-colors" size={18} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search developers, posts, or tags..." 
            className="w-full bg-[#111] border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group focus:outline-none"
          >
            <div className="relative">
              <Bell size={20} className="group-hover:text-[#00F0FF] transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#FF0055] rounded-full border-2 border-[#0a0a0a] text-[9px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:block">Notifications</span>
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-4 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden origin-top-right"
              >
                <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span onClick={markAllAsRead} className="text-xs text-[#00F0FF] cursor-pointer hover:underline">Mark all as read</span>
                  )}
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No notifications yet.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        onClick={() => markAsRead(notif._id, notif.read)}
                        className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer flex gap-3 transition-colors ${!notif.read ? 'bg-[#00F0FF]/5' : ''}`}
                      >
                        <img 
                          src={notif.sender?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                          alt="avatar" 
                          className="w-10 h-10 rounded-full object-cover mt-1"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                            <span className="font-bold">{notif.sender?.name}</span> {notif.message}
                          </p>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-[#00F0FF] mt-2 flex-shrink-0"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <Link 
                  to="/notifications" 
                  onClick={() => setIsNotifOpen(false)}
                  className="block w-full text-center py-2.5 text-sm text-[#00F0FF] hover:bg-white/5 transition-colors border-t border-white/10 font-medium"
                >
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors hidden sm:block">
              {currentUser?.name || 'Loading...'}
            </span>
            <div className="relative">
              <img 
                src={currentUser?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-[#00F0FF]/50 transition-colors bg-[#111]"
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${statusPref === 'online' ? 'bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'bg-gray-500'}`}></div>
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden origin-top-right"
              >
                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <UserIcon size={16} /> My Profile
                </Link>
                
                {toggleStatusPref && (
                  <button 
                    onClick={toggleStatusPref}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {statusPref === 'online' ? <Eye size={16} className="text-[#00F0FF]" /> : <EyeOff size={16} className="text-gray-500" />}
                      <span>{statusPref === 'online' ? 'Online Mode' : 'Invisible Mode'}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${statusPref === 'online' ? 'bg-[#00F0FF]' : 'bg-gray-600'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-transform ${statusPref === 'online' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                )}

                <div className="h-px bg-white/10 my-1 w-full"></div>
                <button 
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of DevHub?"
        confirmText="Sign Out"
        isDestructive={true}
      />
    </div>
  );
};

export default TopNavbar;
