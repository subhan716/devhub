import { useState, useEffect } from 'react';
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

  const mainNavLinks = [
    { name: 'Feed', path: '/feed', icon: <LayoutDashboard size={19} /> },
    { name: 'My Networks', path: '/network', icon: <Users size={19} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={19} /> },
    { name: 'Messaging', path: '/messages', icon: <MessageSquare size={19} /> },
    { name: 'Saved Posts', path: '/saved-posts', icon: <Bookmark size={19} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={19} /> },
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

      <aside className={`w-64 h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col pt-5 pb-5 px-3.5 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-200 overflow-y-auto scrollbar-none`}>
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between mb-4 px-2">
          <Link to="/feed" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 group cursor-pointer">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-8 h-8 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">DevHub</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mini Profile Card (LinkedIn Style) */}
        <div className="bg-slate-50 dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xs mb-4">
          <div className="h-11 bg-gradient-to-r from-[#0A66C2]/40 via-purple-600/30 to-[#00F0FF]/40 relative"></div>
          <div className="px-3 pb-3 pt-0 text-center relative -mt-6">
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <img
                src={avatarUrl}
                alt={name}
                className="w-12 h-12 rounded-full object-cover mx-auto border-2 border-white dark:border-[#111] shadow-md hover:scale-105 transition-transform"
              />
            </Link>
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block mt-1 font-bold text-xs text-slate-900 dark:text-white hover:text-[#0A66C2] dark:hover:text-[#00F0FF] transition-colors truncate">
              {name}
            </Link>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate mt-0.5">{status}</p>

            <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-200 dark:border-white/5 text-left text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 dark:text-gray-500 block">Views</span>
                <span className="font-bold text-slate-800 dark:text-white">{profileData?.views || 0}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 dark:text-gray-500 block">Followers</span>
                <span className="font-bold text-slate-800 dark:text-white">{profileData?.followers?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Pages (All Tabs Visible) */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 px-3 mb-1">
            Navigation
          </span>
          {mainNavLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/feed' && location.pathname === '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#00F0FF]/10 dark:text-[#00F0FF] font-bold shadow-xs'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
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
        <div className="pt-3 border-t border-slate-200 dark:border-white/5 mt-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-gray-300 px-3 mb-1.5">
            <ShieldCheck size={13} className="text-[#0A66C2] dark:text-[#00F0FF]" />
            Trust & Legal Center
          </div>
          <div className="space-y-0.5 mb-3">
            {legalLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-1 text-[10px] text-slate-500 dark:text-gray-400 hover:text-[#0A66C2] dark:hover:text-[#00F0FF] transition-colors"
              >
                <span>{item.name}</span>
                <ExternalLink size={9} className="opacity-40" />
              </Link>
            ))}
          </div>

          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={15} />
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
