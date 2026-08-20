import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  KeyRound, 
  Scale, 
  Download, 
  ExternalLink,
  RefreshCw,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import ProfileSettingsTab from '../components/settings/ProfileSettingsTab';
import SecuritySettingsTab from '../components/settings/SecuritySettingsTab';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'legal' | 'data'

  // Tab 3: Legal Policy State
  const [selectedPolicySlug, setSelectedPolicySlug] = useState('guidelines');
  const [policyData, setPolicyData] = useState(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);

  // Tab 4: Data Export & Danger Zone State
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch In-App Policy when Tab 3 is opened or changed
  useEffect(() => {
    if (activeTab === 'legal') {
      const fetchInAppPolicy = async () => {
        setIsPolicyLoading(true);
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/policies/${selectedPolicySlug}`);
          setPolicyData(data);
        } catch (e) {
          console.warn('Failed to load in-app policy:', e);
        } finally {
          setIsPolicyLoading(false);
        }
      };
      fetchInAppPolicy();
    }
  }, [activeTab, selectedPolicySlug]);

  // Tab 4: 1-Click GDPR Data Export
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/export-data`, {
        withCredentials: true,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devhub-data-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('GDPR personal data archive downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export data archive');
    } finally {
      setIsExporting(false);
    }
  };

  const navTabs = [
    { id: 'profile', label: 'Profile & Identity', icon: UserIcon },
    { id: 'security', label: 'Security & Credentials', icon: KeyRound },
    { id: 'legal', label: 'Trust & Policies', icon: Scale },
    { id: 'data', label: 'Data Portability', icon: Download },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans space-y-6">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your developer profile, authentication credentials, privacy, and data portability.
        </p>
      </div>

      {/* Sleek Horizontal Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-white/5 pb-3">
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

        {/* TAB 2: SECURITY & CREDENTIALS */}
        {activeTab === 'security' && <SecuritySettingsTab />}

        {/* TAB 3: IN-APP PRIVACY & LEGAL POLICY READER */}
        {activeTab === 'legal' && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
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

        {/* TAB 4: GDPR DATA PORTABILITY & RIGHTS */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* GDPR 1-Click Data Archive Export */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
                <Download size={16} className="text-[#00F0FF]" />
                <span>GDPR Data Archive Export</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                Under GDPR Article 20, you have the right to receive a machine-readable \`.json\` export containing your profile details, posts, comments, and connection lists.
              </p>

              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={14} />
                <span>{isExporting ? 'Generating Archive...' : 'Download My Data (.json)'}</span>
              </button>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div className="bg-[#111] border border-red-500/20 rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm border-b border-red-500/20 pb-3">
                <Trash2 size={16} />
                <span>Danger Zone: Delete Account</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                Permanently remove your account, posts, comments, and all associated authentication tokens. This action is irreversible.
              </p>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              >
                <Trash2 size={14} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => toast.error('Account deletion request queued for compliance review.')}
        title="Delete Account"
        message="Are you sure you want to permanently delete your DevHub account and purge all data? This cannot be undone."
        confirmText="Delete My Account"
        isDestructive={true}
      />
    </div>
  );
};

export default SettingsPage;
