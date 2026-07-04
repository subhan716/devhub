import { Bell, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopNavbar = () => {
  return (
    <div className="h-20 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8 w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-white tracking-tight">Feed</h1>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <div className="relative">
            <Bell size={20} className="group-hover:text-[#00F0FF] transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00F0FF] rounded-full"></span>
          </div>
          <span className="text-sm font-medium hidden sm:block">Notifications</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <Mail size={20} className="group-hover:text-[#8A2BE2] transition-colors" />
          <span className="text-sm font-medium hidden sm:block">Messages</span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>

        <Link to="/profile" className="flex items-center gap-3 group">
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors hidden sm:block">Alex Chen</span>
          <img 
            src="https://cdn.pixabay.com/photo/2021/06/11/12/26/man-6328405_1280.jpg" 
            alt="Profile" 
            className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-[#00F0FF]/50 transition-colors"
          />
        </Link>
      </div>
    </div>
  );
};

export default TopNavbar;
