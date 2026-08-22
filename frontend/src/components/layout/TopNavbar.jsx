import { Bell, LayoutDashboard, Users, Briefcase, 
  Mail, 
  LogOut, 
  User as UserIcon, 
  Search, 
  Menu, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Settings, 
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

// Notification ping sound
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

const TopNavbar = ({ setIsMobileMenuOpen, currentUser, isMessagesPage }) => {
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/feed') return 'Feed';
    if (path.startsWith('/network')) return 'My Networks';
    if (path.startsWith('/jobs')) return 'Jobs';
    if (path.startsWith('/messages')) return 'Messaging';
    if (path.startsWith('/saved-posts') || path.startsWith('/bookmarks')) return 'Saved Posts';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/search')) return 'Search';
    return 'DevHub';
  };
  const navTabs = [
    { name: 'Feed', path: '/feed', icon: <LayoutDashboard size={19} /> },
    { name: 'My Networks', path: '/network', icon: <Users size={19} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={19} /> },
    { name: 'Messaging', path: '/messages', icon: <MessageSquare size={19} /> },
  ];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { statusPref, toggleStatusPref } = useSocket() || {};
  const { theme, isDark, toggleTheme } = useTheme();
  
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

  // Fetch notifications and listen to socket
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, { withCredentials: true });
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    if (socket) {
      socket.on('newNotification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        
        const playSoundTypes = ['connection_request', 'follow', 'connection_accepted'];
        if (playSoundTypes.includes(newNotif.type)) {
          notificationSound.play().catch(e => console.log('Audio play failed:', e));
          
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
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (notifId, isAlreadyRead) => {
    if (isAlreadyRead) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/read/${notifId}`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`);
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
    <div className={`h-20 border-b border-black/5 dark:border-white/5 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8 w-full ${isMessagesPage ? 'lg:pr-[352px]' : ''} transition-colors duration-200`}>
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <Menu size={24} />
        </button>

        <Link to="/feed" className="flex items-center gap-3 md:hidden group">
          <img src="/images/logo.png" alt="DevHub Logo" className="w-8 h-8 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight hidden md:block">{getPageTitle()}</h1>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-lg mx-6 lg:mx-8 hidden lg:block">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-[#0A66C2] dark:group-focus-within:text-[#00F0FF] transition-colors" size={17} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search developers, posts, or tags..." 
            className="w-full bg-slate-100 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-full py-2.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0A66C2] dark:focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#0A66C2] dark:focus:ring-[#00F0FF]/50 transition-all"
          />
        </form>
      </div>

      {/* Right Actions: Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group focus:outline-none cursor-pointer"
          >
            <div className="relative">
              <Bell size={20} className="group-hover:text-[#0A66C2] dark:group-hover:text-[#00F0FF] transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#FF0055] rounded-full border-2 border-white dark:border-[#0a0a0a] text-[9px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium hidden sm:block">Notifications</span>
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed top-[70px] left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-4 w-auto sm:w-80 max-w-[360px] mx-auto bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden sm:origin-top-right"
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-xs">Notifications</h3>
                  {unreadCount > 0 && (
                    <span onClick={markAllAsRead} className="text-xs text-[#0A66C2] dark:text-[#00F0FF] cursor-pointer hover:underline">
                      Mark all as read
                    </span>
                  )}
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-xs">No notifications yet.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        onClick={() => markAsRead(notif._id, notif.read)}
                        className={`px-4 py-3 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex gap-3 transition-colors ${!notif.read ? 'bg-blue-50/50 dark:bg-[#00F0FF]/5' : ''}`}
                      >
                        <img 
                          src={notif.sender?.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                          alt="avatar" 
                          className="w-9 h-9 rounded-full object-cover mt-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${!notif.read ? 'text-slate-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                            <strong className="font-bold text-slate-900 dark:text-white">{notif.sender?.name}</strong> {notif.message.startsWith(notif.sender?.name) ? notif.message.substring(notif.sender.name.length).trim() : notif.message}
                          </p>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-[#0A66C2] dark:bg-[#00F0FF] mt-2 flex-shrink-0"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <Link 
                  to="/notifications" 
                  onClick={() => setIsNotifOpen(false)}
                  className="block w-full text-center py-2.5 text-xs text-[#0A66C2] dark:text-[#00F0FF] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/10 font-semibold"
                >
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
          >
            <span className="text-xs font-medium text-slate-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors hidden sm:block">
              {currentUser?.name || 'Loading...'}
            </span>
            <div className="relative">
              <img 
                src={currentUser?.avatar?.url || currentUser?.avatarUrl || (typeof currentUser?.avatar === 'string' ? currentUser?.avatar : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')} 
                alt="Profile" 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 dark:border-white/10 group-hover:border-[#0A66C2] dark:group-hover:border-[#00F0FF]/50 transition-colors bg-slate-100 dark:bg-[#111]"
              />
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0a0a0a] ${statusPref === 'online' ? 'bg-emerald-500 dark:bg-[#00F0FF]' : 'bg-gray-400'}`}></div>
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-[-10px] sm:right-0 mt-3 w-72 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden sm:origin-top-right origin-top"
              >
                {/* 1. User Header Card (LinkedIn / GitHub style) */}
                <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={currentUser?.avatar?.url || currentUser?.avatarUrl || (typeof currentUser?.avatar === 'string' ? currentUser?.avatar : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')} 
                        alt={currentUser?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#111] shadow-xs bg-slate-100 dark:bg-[#1a1a1a]"
                      />
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#111] ${statusPref === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {currentUser?.name || 'Developer'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                        {currentUser?.email || 'dev@devhub.com'}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block w-full py-1.5 px-3 rounded-full text-center text-xs font-bold text-[#0A66C2] dark:text-[#00F0FF] border border-[#0A66C2] dark:border-[#00F0FF]/50 hover:bg-[#0A66C2]/10 dark:hover:bg-[#00F0FF]/10 transition-all cursor-pointer shadow-xs"
                  >
                    View Profile
                  </Link>
                </div>

                {/* 2. Account Section */}
                <div className="py-1.5 px-2">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-gray-500">
                    Account
                  </div>

                  <Link 
                    to="/settings" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group cursor-pointer"
                  >
                    <Settings size={16} className="text-[#0A66C2] dark:text-[#00F0FF]" />
                    <span className="font-semibold text-slate-900 dark:text-white">Settings & Privacy</span>
                  </Link>

                  <Link 
                    to="/guidelines" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group cursor-pointer"
                  >
                    <ShieldCheck size={16} className="text-amber-500" />
                    <span>Trust & Legal Center</span>
                  </Link>
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/5 my-0.5"></div>

                {/* 3. Preferences: Theme Segmented Control & Status */}
                <div className="py-1.5 px-2">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-gray-500">
                    Preferences
                  </div>

                  {/* Theme Toggle (Light / Dark Mode) */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer mb-1"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDark ? <Moon size={15} className="text-[#00F0FF]" /> : <Sun size={15} className="text-amber-500" />}
                      <span className="font-medium">{isDark ? 'Dark Theme' : 'Light Theme'}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400">
                      {isDark ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  {/* Active / Invisible Status Toggle */}
                  {toggleStatusPref && (
                    <button 
                      onClick={toggleStatusPref}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${statusPref === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        <span className="font-medium">{statusPref === 'online' ? 'Online Status' : 'Invisible Status'}</span>
                      </div>
                      <div className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${statusPref === 'online' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-gray-700'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform shadow-xs ${statusPref === 'online' ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/5 my-0.5"></div>

                {/* 4. Sign Out */}
                <div className="p-2">
                  <button 
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
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
