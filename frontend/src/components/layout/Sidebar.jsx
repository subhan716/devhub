import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Bookmark, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  LogOut, 
  X,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const mainNavLinks = [
    { name: 'Feed', path: '/feed', icon: <LayoutDashboard size={20} /> },
    { name: 'My Networks', path: '/network', icon: <Users size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Messaging', path: '/messages', icon: <MessageSquare size={20} /> },
    { name: 'Saved Posts', path: '/saved-posts', icon: <Bookmark size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  const legalLinks = [
    { name: 'Community Guidelines', path: '/guidelines' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside className={`w-64 h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col pt-8 pb-6 px-4 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-200 overflow-y-auto scrollbar-none`}>
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between mb-8 px-3">
          <Link to="/feed" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 group cursor-pointer">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-9 h-9 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">DevHub</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Navigation Pages */}
        <div className="flex-1 flex flex-col gap-1.5 px-1">
          {mainNavLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/feed' && location.pathname === '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#00F0FF]/10 dark:text-[#00F0FF] shadow-xs'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={isActive ? 'text-[#0A66C2] dark:text-[#00F0FF]' : 'opacity-80'}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A66C2] dark:bg-[#00F0FF]"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Legal & Trust Center Links */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-auto px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-gray-300 px-3 mb-2">
            <ShieldCheck size={14} className="text-[#0A66C2] dark:text-[#00F0FF]" />
            Trust & Legal Center
          </div>
          <div className="space-y-1 mb-4">
            {legalLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-1 text-xs text-slate-500 dark:text-gray-400 hover:text-[#0A66C2] dark:hover:text-[#00F0FF] transition-colors"
              >
                <span>{item.name}</span>
                <ExternalLink size={10} className="opacity-40" />
              </Link>
            ))}
          </div>

          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of DevHub?"
        confirmText="Sign Out"
        isDestructive={true}
      />
    </>
  );
};

export default Sidebar;
