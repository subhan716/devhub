import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  LogOut, 
  X, 
  Users, 
  Settings as SettingsIcon, 
  ShieldCheck 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { isDark } = useTheme();

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

  const navLinks = [
    { name: 'Feed', path: '/feed', icon: <LayoutDashboard size={20} /> },
    { name: 'My Networks', path: '/network', icon: <Users size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Messaging', path: '/messages', icon: <MessageSquare size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside className={`w-64 h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col pt-8 pb-6 px-6 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-colors duration-200`}>
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/feed" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 group">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-10 h-10 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">DevHub</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all group cursor-pointer ${
                  isActive 
                    ? isDark
                      ? 'bg-gradient-to-r from-[#00F0FF]/10 to-transparent text-white border-l-2 border-[#00F0FF]' 
                      : 'bg-blue-50 text-[#0A66C2] border-l-2 border-[#0A66C2] font-semibold'
                    : isDark
                      ? 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                      : 'text-gray-600 hover:bg-slate-100 hover:text-black border-l-2 border-transparent'
                }`}
              >
                <div className={`${isActive ? (isDark ? 'text-[#00F0FF]' : 'text-[#0A66C2]') : (isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-700')} transition-colors`}>
                  {link.icon}
                </div>
                <span className="text-sm font-semibold">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area: Trust & Guidelines + Sign Out */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/5 space-y-1">
          <Link
            to="/guidelines"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all group cursor-pointer ${
              isDark
                ? 'text-gray-400 hover:text-[#00F0FF] hover:bg-white/5'
                : 'text-gray-600 hover:text-[#0A66C2] hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={18} className={`${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
            <span>Trust & Legal Center</span>
          </Link>

          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all group cursor-pointer"
          >
            <LogOut size={18} />
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
