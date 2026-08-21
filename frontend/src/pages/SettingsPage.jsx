import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  KeyRound, 
  Scale, 
  Sun,
  Moon,
  Check,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Monitor
} from 'lucide-react';
import axios from 'axios';
import ProfileSettingsTab from '../components/settings/ProfileSettingsTab';
import SecuritySettingsTab from '../components/settings/SecuritySettingsTab';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'appearance' | 'legal'
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  // Tab 4: Legal Policy State
  const [selectedPolicySlug, setSelectedPolicySlug] = useState('guidelines');
  const [policyData, setPolicyData] = useState(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);

  // Fetch In-App Policy when Tab 4 is opened or changed
  useEffect(() => {
    if (activeTab === 'legal') {
      const fetchInAppPolicy = async () => {
        setIsPolicyLoading(true);
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/policies/${selectedPolicySlug}`);
          setPolicyData(data);
        } catch (e) {
          console.warn('Failed to load policy:', e);
        } finally {
          setIsPolicyLoading(false);
        }
      };
      fetchInAppPolicy();
    }
  }, [activeTab, selectedPolicySlug]);

  const navTabs = [
    { id: 'profile', label: 'Profile & Identity', icon: UserIcon },
    { id: 'security', label: 'Security & Account', icon: KeyRound },
    { id: 'appearance', label: 'Appearance & Theme', icon: isDark ? Moon : Sun },
    { id: 'legal', label: 'Trust & Policies', icon: Scale },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
          Manage your developer profile, security credentials, appearance, and platform policies.
        </p>
      </div>

      {/* Clean Horizontal Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-white/5 pb-3">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0A66C2] text-white dark:bg-[#00F0FF] dark:text-black font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="pt-1">
        {/* TAB 1: PROFILE & IDENTITY */}
        {activeTab === 'profile' && <ProfileSettingsTab />}

        {/* TAB 2: SECURITY & ACCOUNT */}
        {activeTab === 'security' && <SecuritySettingsTab />}

        {/* TAB 3: APPEARANCE & THEME */}
        {activeTab === 'appearance' && (
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm dark:shadow-none">
            <div className="border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Sparkles size={16} className="text-[#0A66C2] dark:text-[#00F0FF]" />
                <span>Appearance & Interface Theme</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                Customize how DevHub looks on your device. Themes synchronize in real-time across all open tabs.
              </p>
            </div>

            {/* Visual Theme Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {/* Dark Obsidian Option */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative ${
                  isDark
                    ? 'border-[#00F0FF] bg-[#00F0FF]/5 shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#050508] hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                    <Moon size={18} className="text-[#00F0FF]" />
                    <span>Dark Obsidian</span>
                  </div>
                  {isDark && (
                    <div className="w-5 h-5 rounded-full bg-[#00F0FF] text-black flex items-center justify-center">
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                  Deep obsidian blacks with high-tech electric cyan accents. Optimized for coding and low-light environments.
                </p>
                {/* Mini Preview Bar */}
                <div className="h-4 w-full bg-[#0A0A0A] rounded-lg border border-white/10 flex items-center px-2 gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"></div>
                  <div className="w-8 h-1 bg-white/20 rounded"></div>
                  <div className="w-4 h-1 bg-white/10 rounded"></div>
                </div>
              </div>

              {/* Light Studio Option */}
              <div
                onClick={() => setTheme('light')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative ${
                  !isDark
                    ? 'border-[#0A66C2] bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#050508] hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                    <Sun size={18} className="text-amber-500" />
                    <span>Light Studio</span>
                  </div>
                  {!isDark && (
                    <div className="w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center">
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                  Clean pure white cards with LinkedIn deep tech blue buttons and crisp slate typography.
                </p>
                {/* Mini Preview Bar */}
                <div className="h-4 w-full bg-white rounded-lg border border-slate-300 flex items-center px-2 gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0A66C2]"></div>
                  <div className="w-8 h-1 bg-slate-400 rounded"></div>
                  <div className="w-4 h-1 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRUST & POLICIES */}
        {activeTab === 'legal' && (
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Scale size={16} className="text-[#0A66C2] dark:text-[#00F0FF]" />
                  <span>Platform Policies & Guidelines</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Review our community rules, terms of service, and privacy standards.
                </p>
              </div>

              <Link
                to={`/${selectedPolicySlug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A66C2] dark:text-[#00F0FF] hover:underline whitespace-nowrap cursor-pointer"
              >
                <span>Full Legal Portal</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Policy Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { slug: 'guidelines', label: 'Community Guidelines' },
                { slug: 'terms', label: 'Terms of Service' },
                { slug: 'privacy', label: 'Privacy Policy (GDPR)' },
              ].map((p) => (
                <button
                  key={p.slug}
                  onClick={() => setSelectedPolicySlug(p.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedPolicySlug === p.slug
                      ? 'bg-[#0A66C2] text-white dark:bg-[#00F0FF]/15 dark:text-[#00F0FF] dark:border dark:border-[#00F0FF]/30 font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* In-App Policy Viewer */}
            <div className="bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/5 rounded-xl p-5 max-h-[380px] overflow-y-auto custom-scrollbar text-xs text-slate-700 dark:text-gray-300 leading-relaxed space-y-3 font-mono">
              {isPolicyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <RefreshCw size={18} className="animate-spin text-[#0A66C2] dark:text-[#00F0FF]" />
                  <span>Loading policy content...</span>
                </div>
              ) : policyData ? (
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm mb-2 border-b border-slate-200 dark:border-white/5 pb-1 font-sans">
                    {policyData.title} (v{policyData.version})
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
                    {policyData.content}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500 italic">No policy content available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
