import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Search, Briefcase, MessageSquare, Settings, TerminalSquare, LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const navLinks = [
    { name: 'Feed', path: '/feed', icon: <LayoutDashboard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
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
      <div className={`w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-[#0a0a0a] flex flex-col pt-8 pb-6 px-6 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300`}>
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/feed" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 group">
            <img src="/images/logo.png" alt="DevHub Logo" className="w-10 h-10 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            <span className="text-xl font-bold text-white tracking-tight">DevHub</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-2 flex-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path === '/feed' && location.pathname === '/');
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-[#00F0FF]/10 to-transparent text-[#00F0FF] border border-[#00F0FF]/20 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`${isActive ? 'text-[#00F0FF]' : 'text-gray-500 group-hover:text-white'} transition-colors`}>
                {link.icon}
              </div>
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="mt-auto pt-8 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-4 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors group"
        >
          <LogOut size={20} className="text-red-400/70 group-hover:text-red-500 transition-colors" />
          Sign Out
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
