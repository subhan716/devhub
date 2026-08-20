import React from 'react';
import { 
  Scale, 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Megaphone, 
  Smartphone,
  Shield,
  LogOut, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, adminUser, onLogout, pendingReportsCount = 0 }) => {
  const navItems = [
    { id: 'overview', label: 'Overview & Telemetry', icon: LayoutDashboard },
    { id: 'users', label: 'User Governance', icon: Users },
    { 
      id: 'moderation', 
      label: 'Content Moderation', 
      icon: ShieldAlert, 
      badge: pendingReportsCount > 0 ? pendingReportsCount : null 
    },
    { id: 'broadcast', label: 'Push Broadcast', icon: Megaphone },
    { id: 'mobile_app', label: 'Mobile Fleet & Version', icon: Smartphone },
    { id: 'policies', label: 'Legal & Policy CMS', icon: Scale },
    { id: 'audit_logs', label: 'Audit Forensics', icon: Shield },
  ];

  return (
    <aside className="w-60 bg-[#0D0D10] border-r border-zinc-800/80 flex flex-col justify-between h-screen sticky top-0 select-none z-30 flex-shrink-0 font-sans">
      {/* Top Brand Header */}
      <div>
        <div className="px-5 py-4.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h1 className="font-bold text-zinc-100 text-sm tracking-tight flex items-center gap-1.5">
                DevHub <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">HQ</span>
              </h1>
              <p className="text-[10px] text-zinc-500">Operations Control</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={isActive ? 'text-[#00F0FF]' : 'text-zinc-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2">
        {/* Public site link */}
        <a
          href={import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:5173'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-[11px]">
            <ExternalLink size={13} />
            Public Website
          </span>
          <span className="text-[10px] font-mono text-zinc-500">5173</span>
        </a>

        {/* User Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 text-[#00F0FF] flex items-center justify-center font-bold text-[11px] flex-shrink-0">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-200 truncate">{adminUser?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-zinc-500 font-mono capitalize truncate">
                {adminUser?.role?.replace('_', ' ') || 'super admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
