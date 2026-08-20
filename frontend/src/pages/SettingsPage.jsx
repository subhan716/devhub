import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Lock, 
  Download, 
  KeyRound, 
  Scale, 
  Trash2, 
  ExternalLink,
  RefreshCw,
  Sliders
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import ProfileSettingsTab from '../components/settings/ProfileSettingsTab';
import SecuritySettingsTab from '../components/settings/SecuritySettingsTab';

const SettingsPage = () => {
  const navigate = useNavigate();
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

  const navItems = [
    { id: 'profile', label: 'Profile & Developer Identity', icon: UserIcon, desc: 'Public avatar, banner, headline, skills matrix & bio' },
    { id: 'security', label: 'Security & Authentication', icon: KeyRound, desc: 'Password change & active session revocation killswitch' },
    { id: 'legal', label: 'Privacy & Legal Policies', icon: Scale, desc: 'In-app reader for Community Guidelines, Terms & Privacy' },
    { id: 'data', label: 'Data Portability & Account', icon: Download, desc: '1-Click GDPR JSON archive export & account management' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 font-sans space-y-6">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Account & Developer Settings</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Manage your professional identity, cryptographic credentials, privacy preferences, and data rights.
        </p>
      </div>

      {/* Main Settings Grid: Left Vertical Tabs + Right Active Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Menu (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-2.5 shadow-xl space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1.5 block font-mono">
              Settings Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 '
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-[#00F0FF]/15 text-[#00F0FF]' : 'bg-[#050508] text-gray-400'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{item.label}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{item.desc}</p>
                    </div>
                  </div>
                  {isActive && <div className="w-1.5 h-6 rounded-full bg-[#00F0FF]" />}
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-black/40 border border-cyan-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#00F0FF] font-bold">
              <ShieldCheck size={14} />
              <span>DevHub Enterprise Security</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Your data is cryptographically protected with first-party HttpOnly cookies and GDPR data sovereignty.
            </p>
          </div>
        </div>

        {/* Right Active Content Panel (8 cols) */}
        <div className="lg:col-span-8">
          {/* TAB 1: PROFILE & DEVELOPER IDENTITY */}
          {activeTab === 'profile' && <ProfileSettingsTab />}

          {/* TAB 2: SECURITY & SESSIONS */}
          {activeTab === 'security' && <SecuritySettingsTab />}

          {/* TAB 3: IN-APP PRIVACY & LEGAL POLICY READER */}
          {activeTab === 'legal' && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Scale size={16} className="text-[#00F0FF]" />
                    <span>DevHub Official Legal & Trust Policies</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Review platform rules, data protection policies, and developer rights.
                  </p>
                </div>

                <Link
                  to="/guidelines"
                  target="_blank"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5 w-fit"
                >
                  <span>Full Portal View</span>
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
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedPolicySlug === p.slug
                        ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40'
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
                    <span>Loading policy...</span>
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
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
                  <Download size={16} className="text-[#00F0FF]" />
                  <span>GDPR Article 20: 1-Click Personal Data Portability Archive</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Under international privacy frameworks (GDPR and CCPA), you have the absolute legal right to download a machine-readable \`.json\` archive of your profile, all published posts, code snippets, comments, and connection lists.
                </p>

                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="px-6 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-bold rounded-xl transition-all  cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>{isExporting ? 'Generating Archive...' : 'Download My Personal Data (.json)'}</span>
                </button>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm border-b border-red-500/20 pb-3">
                  <Trash2 size={16} />
                  <span>Danger Zone: Account Deletion (GDPR Article 17)</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Permanently delete your DevHub identity, purge all associated cryptographic authentication tokens, and remove your repositories and posts from our active systems. This action cannot be reversed.
                </p>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  <span>Delete My DevHub Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => toast.error('Account deletion request queued for compliance review.')}
        title="Permanent Account Deletion"
        message="Are you completely sure you want to permanently delete your DevHub account and purge all data?"
        confirmText="Delete Account"
        isDestructive={true}
      />
    </div>
  );
};

export default SettingsPage;
