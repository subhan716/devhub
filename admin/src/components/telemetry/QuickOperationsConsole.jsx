import React from 'react';
import { Megaphone, Smartphone, ShieldAlert, Users, ArrowRight } from 'lucide-react';

const QuickOperationsConsole = ({ onNavigate, pendingReportsCount = 0 }) => {
  const actions = [
    {
      id: 'broadcast',
      title: 'Push Broadcast',
      description: 'Dispatch alert to Web & Mobile notification streams',
      icon: Megaphone,
    },
    {
      id: 'mobile_app',
      title: 'Mobile Fleet Gate',
      description: 'Configure Flutter app versions & emergency maintenance',
      icon: Smartphone,
    },
    {
      id: 'moderation',
      title: 'Content Moderation',
      description: 'Triage user reports and spam flags',
      icon: ShieldAlert,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} pending` : null,
    },
    {
      id: 'users',
      title: 'User Governance',
      description: 'Manage accounts, verified checkmarks and RBAC',
      icon: Users,
    },
  ];

  return (
    <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">Operational Actions</h3>
        <p className="text-xs text-zinc-500">Quick shortcuts to governance modules</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onNavigate(act.id)}
              className="p-3.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700 transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-zinc-100 transition-colors">
                  <Icon size={14} />
                </div>
                {act.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    {act.badge}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-[#00F0FF] transition-colors flex items-center justify-between">
                  <span>{act.title}</span>
                  <ArrowRight size={12} className="text-zinc-500 group-hover:text-[#00F0FF] group-hover:translate-x-0.5 transition-all" />
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1 leading-normal">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickOperationsConsole;
