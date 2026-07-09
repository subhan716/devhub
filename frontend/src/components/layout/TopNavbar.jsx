import { Bell, Mail, LogOut, User as UserIcon, Search, Menu, Heart, MessageSquare, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import { useSocket } from '../../context/SocketContext';

// Dummy Notifications Data
const DUMMY_NOTIFICATIONS = [
  { id: 1, type: 'like', text: 'Alex liked your post about React 19', time: '5m ago', unread: true },
  { id: 2, type: 'comment', text: 'Sarah commented on your article', time: '1h ago', unread: true },
  { id: 3, type: 'follow', text: 'John started following you', time: '2h ago', unread: false },
  { id: 4, type: 'like', text: 'David liked your project', time: '5h ago', unread: false },
];

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
              {DUMMY_NOTIFICATIONS.some(n => n.unread) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF0055] rounded-full border-2 border-[#0a0a0a]"></span>
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
                  <span className="text-xs text-[#00F0FF] cursor-pointer hover:underline">Mark all as read</span>
                </div>
                
                <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent">
                  {DUMMY_NOTIFICATIONS.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer flex gap-3 ${notif.unread ? 'bg-[#00F0FF]/5' : ''}`}
                    >
                      <div className={`mt-1 rounded-full p-1.5 h-fit ${
                        notif.type === 'like' ? 'bg-pink-500/20 text-pink-500' :
                        notif.type === 'comment' ? 'bg-[#00F0FF]/20 text-[#00F0FF]' :
                        'bg-[#8A2BE2]/20 text-[#8A2BE2]'
                      }`}>
                        {notif.type === 'like' && <Heart size={14} className={notif.unread ? "fill-pink-500" : ""} />}
                        {notif.type === 'comment' && <MessageSquare size={14} className={notif.unread ? "fill-[#00F0FF]" : ""} />}
                        {notif.type === 'follow' && <UserPlus size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.unread ? 'text-white font-medium' : 'text-gray-300'}`}>{notif.text}</p>
                        <span className="text-xs text-gray-500 mt-1 block">{notif.time}</span>
                      </div>
                      {notif.unread && (
                        <div className="w-2 h-2 rounded-full bg-[#00F0FF] mt-1.5 flex-shrink-0"></div>
                      )}
                    </div>
                  ))}
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
            <img 
              src={currentUser?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
              alt="Profile" 
              className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-[#00F0FF]/50 transition-colors bg-[#111]"
            />
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
