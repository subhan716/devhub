import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Users, UserCircle } from 'lucide-react';

const BottomNavbar = ({ currentUser }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Feed', path: '/feed', icon: <LayoutDashboard size={24} /> },
    { name: 'Network', path: '/network', icon: <Users size={24} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={24} /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={24} /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/10 z-50 px-2 py-2 flex justify-between items-center safe-area-pb">
      {navLinks.map((link) => {
        const isActive = location.pathname.startsWith(link.path);
        return (
          <Link
            key={link.name}
            to={link.path}
            className={`flex flex-col items-center justify-center w-1/5 py-1 ${
              isActive ? 'text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'
            } transition-colors`}
          >
            <div className={`${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''} transition-transform`}>
              {link.icon}
            </div>
            <span className="text-[10px] mt-1 font-medium">{link.name}</span>
          </Link>
        );
      })}
      
      {/* Profile Link */}
      <Link
        to={currentUser ? `/profile/${currentUser.user._id}` : '/profile'}
        className={`flex flex-col items-center justify-center w-1/5 py-1 ${
          location.pathname.startsWith('/profile') ? 'text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'
        } transition-colors`}
      >
        <div className={`${location.pathname.startsWith('/profile') ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''} transition-transform`}>
          {currentUser?.user?.avatar?.url ? (
            <img src={currentUser.user.avatar.url} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-white/20" />
          ) : (
            <UserCircle size={24} />
          )}
        </div>
        <span className="text-[10px] mt-1 font-medium">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNavbar;
