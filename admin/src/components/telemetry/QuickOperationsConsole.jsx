import React from 'react';
import { 
  Megaphone, 
  Smartphone, 
  ShieldAlert, 
  Users, 
  Shield, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const QuickOperationsConsole = ({ onNavigate, pendingReportsCount = 0 }) => {
  const actions = [
    {
      id: 'broadcast',
      title: 'Global Push Broadcast',
      description: 'Dispatch immediate push alerts & banner notifications across Web & Mobile.',
      icon: Megaphone,
      accent: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
      btnText: 'Send Alert',
    },
    {
      id: 'mobile_app',
      title: 'Mobile Fleet & Version Gate',
      description: 'Enforce minimum Flutter versions, force-update dialogs & killswitches.',
      icon: Smartphone,
      accent: 'from-[#00F0FF]/20 to-[#00F0FF]/5 text-[#00F0FF] border-[#00F0FF]/30',
      btnText: 'Configure Fleet',
    },
    {
      id: 'moderation',
      title: 'Trust & Safety Moderation',
      description: 'Review user flags, spam reports, and take 1-click triage actions.',
      icon: ShieldAlert,
      accent: 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/30',
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} Pending` : null,
      btnText: 'Review Cases',
    },
    {
      id: 'users',
      title: 'User Identity & Verified Badges',
      description: 'Search developers, issue verified checkmarks, and manage RBAC roles.',
      icon: Users,
      accent: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30',
      btnText: 'Open Directory',
    },
  ];

  return (
    <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm lg:text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-[#00F0FF]" />
            Quick Operational Command Actions
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            1-Click shortcuts for high-priority operational workflows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              onClick={() => onNavigate(act.id)}
              className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group shadow-sm hover:-translate-y-0.5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${act.accent} border flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  {act.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                      {act.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors">
                <span>{act.btnText}</span>
                <ArrowRight size={13} className="text-[#00F0FF] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickOperationsConsole;
