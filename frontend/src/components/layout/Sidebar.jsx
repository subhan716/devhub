import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  Briefcase, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  LogOut, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/me`, { withCredentials: true });
        setProfileData(data);
      } catch (err) {}
    };
    fetchProfile();
  }, []);

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

  const shortcutLinks = [
    { name: 'Saved Posts & Snippets', path: '/saved-posts', icon: <Bookmark size={18} /> },
    { name: 'Jobs & Applications', path: '/jobs', icon: <Briefcase size={18} /> },
    { name: 'Settings & Security', path: '/settings', icon: <SettingsIcon size={18} /> },
  ];

  const legalLinks = [
    { name: 'Community Guidelines', path: '/guidelines' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  const user = profileData?.user;
  const avatarUrl = user?.avatar?.url || user?.avatarUrl || profileData?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  const name = user?.name || 'Developer';
  const status = profileData?.status || 'Developer on DevHub';

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside className={`w-64 h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col pt-6 pb-6 px-4 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-200 overflow-y-auto scrollbar-none`}>
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between mb-6 px-2">
          <Link to="/feed" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 group">
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

        {/* Mini Profile Card (LinkedIn Style) */}
        <div className="bg-slate-50 dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xs mb-6">
          <div className="h-14 bg-gradient-to-r from-[#0A66C2]/40 via-purple-600/30 to-[#00F0FF]/40 relative"></div>
          <div className="px-4 pb-4 pt-0 text-center relative -mt-7">
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <img
                src={avatarUrl}
                alt={name}
                className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-white dark:border-[#111] shadow-md hover:scale-105 transition-transform"
              />
            </Link>
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2 font-bold text-sm text-slate-900 dark:text-white hover:text-[#0A66C2] dark:hover:text-[#00F0FF] transition-colors truncate">
              {name}
            </Link>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate mt-0.5">{status}</p>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-white/5 text-left text-xs">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 block">Profile Views</span>
                <span className="font-bold text-slate-800 dark:text-white">{profileData?.views || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 block">Followers</span>
                <span className="font-bold text-slate-800 dark:text-white">{profileData?.followers?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation / Shortcuts Hub */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 px-3 mb-1">
            My Workspace
          </span>
          {shortcutLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-[#0A66C2] dark:bg-[#00F0FF]/10 dark:text-[#00F0FF] font-semibold'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                <ChevronRight size={14} className="opacity-40" />
              </Link>
            );
          })}
        </div>

        {/* Legal & Trust Center Links */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-auto">
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
                className="flex items-center justify-between px-3 py-1 text-[11px] text-slate-500 dark:text-gray-400 hover:text-[#0A66C2] dark:hover:text-[#00F0FF] transition-colors"
              >
                <span>{item.name}</span>
                <ExternalLink size={10} className="opacity-50" />
              </Link>
            ))}
          </div>

          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
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
