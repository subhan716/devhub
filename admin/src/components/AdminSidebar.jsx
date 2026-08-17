import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Megaphone, 
  LogOut, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, adminUser, onLogout, pendingReportsCount = 0 }) => {
  const navItems = [
    { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
    { id: 'users', label: 'User Governance', icon: Users },
    { 
      id: 'moderation', 
      label: 'Content Moderation', 
      icon: ShieldAlert, 
      badge: pendingReportsCount > 0 ? pendingReportsCount : null 
    },
    { id: 'broadcast', label: 'Global Broadcast', icon: Megaphone },
  ];

  return (
    <aside className="w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Top Brand */}
      <div>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00F0FF]/20 to-[#00F0FF]/5 border border-[#00F0FF]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <ShieldCheck className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                DevHub <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20">HQ</span>
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">Control Center</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Operations Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={isActive ? 'text-[#00F0FF]' : 'text-gray-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Info & Actions */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Public site link */}
        <a
          href={import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:5173'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="flex items-center gap-2">
            <ExternalLink size={14} />
            Public Website
          </span>
          <span className="text-[10px] text-gray-500">Live</span>
        </a>

        {/* User Card */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={adminUser?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt={adminUser?.name || 'Admin'}
              className="w-8 h-8 rounded-full border border-white/10 object-cover flex-shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'Super Admin'}</p>
              <span className="text-[10px] font-semibold text-[#00F0FF] capitalize">
                {adminUser?.role || 'admin'}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
