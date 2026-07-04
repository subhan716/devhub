import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Search, Briefcase, MessageSquare, Settings, TerminalSquare, FolderGit2 } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Feed', path: '/feed', icon: <LayoutDashboard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const myProjects = [
    { name: 'DevNet', path: '#' },
    { name: 'SyntaxUI', path: '#' },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-[#0a0a0a] flex flex-col pt-8 pb-6 px-6 z-10 hidden md:flex">
      {/* Logo */}
      <Link to="/feed" className="flex items-center gap-3 mb-10 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#8A2BE2] p-[1px] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 z-0"></div>
          <TerminalSquare className="text-white z-10 w-5 h-5 relative" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">DevHub</span>
      </Link>

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

      {/* My Projects Section */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">My Projects</h3>
        <div className="flex flex-col gap-2">
          {myProjects.map((project) => (
            <Link
              key={project.name}
              to={project.path}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <FolderGit2 size={16} className="text-gray-600" />
              {project.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
