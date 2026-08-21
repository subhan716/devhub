import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  KeyRound, 
  Scale, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import ProfileSettingsTab from '../components/settings/ProfileSettingsTab';
import SecuritySettingsTab from '../components/settings/SecuritySettingsTab';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'legal'

  // Tab 3: Legal Policy State
  const [selectedPolicySlug, setSelectedPolicySlug] = useState('guidelines');
  const [policyData, setPolicyData] = useState(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);

  // Fetch In-App Policy when Tab 3 is opened or changed
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
    { id: 'legal', label: 'Trust & Policies', icon: Scale },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your developer profile, security credentials, and platform policies.
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#00F0FF] text-black font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
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

        {/* TAB 3: TRUST & POLICIES */}
        {activeTab === 'legal' && (
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Scale size={16} className="text-[#00F0FF]" />
                  <span>Platform Policies & Guidelines</span>
                </div>
                <p className="text-xs text-gray-400">
                  Review our community rules, terms of service, and privacy standards.
                </p>
              </div>

              <Link
                to="/guidelines"
                target="_blank"
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-medium transition-colors flex items-center gap-1.5 w-fit"
              >
                <span>Full Legal Portal</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Sub-selector pills */}
            <div className="flex gap-2">
              {[
                { slug: 'guidelines', label: 'Community Guidelines' },
                { slug: 'terms', label: 'Terms of Service' },
                { slug: 'privacy', label: 'Privacy Policy' },
              ].map((p) => (
                <button
                  key={p.slug}
                  onClick={() => setSelectedPolicySlug(p.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedPolicySlug === p.slug
                      ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-semibold'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Policy In-App Reader Box */}
            <div className="h-96 overflow-y-auto bg-[#050508] border border-white/10 rounded-xl p-5 text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
              {isPolicyLoading ? (
                <div className="h-full flex items-center justify-center text-gray-500 gap-2">
                  <RefreshCw size={16} className="animate-spin text-[#00F0FF]" />
                  <span>Loading policy content...</span>
                </div>
              ) : (
                policyData?.content || 'Loading official document...'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
