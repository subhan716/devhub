import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Users, UserCircle } from 'lucide-react';

const BottomNavbar = ({ currentUser }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Feed', path: '/feed', icon: <LayoutDashboard size={22} /> },
    { name: 'Network', path: '/network', icon: <Users size={22} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={22} /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={22} /> },
  ];

  const user = currentUser?.user || currentUser;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-t border-slate-200 dark:border-white/10 z-40 px-2 py-2 flex justify-between items-center safe-area-pb transition-colors duration-200 shadow-lg dark:shadow-none">
      {navLinks.map((link) => {
        const isActive = location.pathname.startsWith(link.path);
        return (
          <Link
            key={link.name}
            to={link.path}
            className={`flex flex-col items-center justify-center w-1/5 py-1 ${
              isActive ? 'text-[#0A66C2] dark:text-[#00F0FF]' : 'text-gray-500 hover:text-black dark:hover:text-gray-300'
            } transition-colors`}
          >
            <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
              {link.icon}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-bold' : ''}`}>{link.name}</span>
          </Link>
        );
      })}
      
      {/* Profile Link */}
      <Link
        to={user ? `/profile/${user._id}` : '/profile'}
        className={`flex flex-col items-center justify-center w-1/5 py-1 ${
          location.pathname.startsWith('/profile') ? 'text-[#0A66C2] dark:text-[#00F0FF]' : 'text-gray-500 hover:text-black dark:hover:text-gray-300'
        } transition-colors`}
      >
        <div className={`${location.pathname.startsWith('/profile') ? 'scale-110' : ''} transition-transform`}>
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-white/20" />
          ) : (
            <UserCircle size={22} />
          )}
        </div>
        <span className={`text-[10px] mt-0.5 font-medium ${location.pathname.startsWith('/profile') ? 'font-bold' : ''}`}>Profile</span>
      </Link>
    </div>
  );
};

export default BottomNavbar;
