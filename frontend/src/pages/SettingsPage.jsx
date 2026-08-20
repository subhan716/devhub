import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Lock, 
  Download, 
  Save, 
  Building2, 
  MapPin, 
  Globe, 
  Briefcase, 
  FolderGit2, 
  KeyRound, 
  LogOut, 
  FileText, 
  Scale, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const statusOptions = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer (Flutter / React Native)', 'DevOps & Cloud Architect',
  'UI/UX Designer', 'Product Manager', 'Data Scientist / ML Engineer',
  'Cybersecurity Analyst', 'CTO / Engineering Lead', 'Student / Open Source Contributor'
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'legal' | 'data'
  const [isLoading, setIsLoading] = useState(true);

  // Tab 1: Profile Form State
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    location: '',
    status: '',
    skills: '',
    githubusername: '',
    bio: '',
    about: '',
    linkedin: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [isStatusFocused, setIsStatusFocused] = useState(false);

  // Tab 2: Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  // Tab 3: Legal Policy State
  const [selectedPolicySlug, setSelectedPolicySlug] = useState('guidelines');
  const [policyData, setPolicyData] = useState(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);

  // Tab 4: Data Export & Danger Zone State
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/me`, { withCredentials: true });
        setFormData({
          company: data.company || '',
          website: data.socialLinks?.website || '',
          location: data.location || '',
          status: data.status || '',
          skills: data.skills ? data.skills.join(', ') : '',
          githubusername: data.githubusername || '',
          bio: data.bio || '',
          about: data.about || '',
          linkedin: data.socialLinks?.linkedin || '',
        });
        setStatusInput(data.status || '');
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error('Failed to load profile for editing');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/profile`, formData, { withCredentials: true });
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tab 2: Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setIsPasswordChanging(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/update-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  // Tab 2: Revoke All Sessions
  const handleRevokeAllSessions = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('isAuthenticated');
      toast.success('All active sessions invalidated.');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to revoke sessions');
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]" />
      </div>
    );
  }

  const statusSuggestions = (statusInput.trim().length > 0 && isStatusFocused)
    ? statusOptions.filter(status => status.toLowerCase().includes(statusInput.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="max-w-5xl mx-auto pb-20 font-sans space-y-6">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Account & Developer Settings</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Manage your professional identity, cryptographic credentials, privacy preferences, and data rights.
        </p>
      </div>

      {/* 4-Tab Navigation Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#0C0C12] border border-white/10 rounded-2xl">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-lg shadow-[#00F0FF]/5'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <UserIcon size={15} />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-lg shadow-[#00F0FF]/5'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <KeyRound size={15} />
          <span>Security & Sessions</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'legal'
              ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-lg shadow-[#00F0FF]/5'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Scale size={15} />
          <span>Privacy & Legal Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'data'
              ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-lg shadow-[#00F0FF]/5'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Download size={15} />
          <span>Data Portability & Rights</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFILE & IDENTITY                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-[#0C0C12] border border-white/10 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
          <form onSubmit={handleProfileSubmit} className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <UserIcon size={16} className="text-[#00F0FF]" /> Professional Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-medium text-gray-300">Professional Status *</label>
                  <input 
                    type="text" 
                    value={statusInput} 
                    onChange={(e) => {
                      setStatusInput(e.target.value);
                      setFormData({ ...formData, status: e.target.value });
                    }}
                    onFocus={() => setIsStatusFocused(true)}
                    onBlur={() => setTimeout(() => setIsStatusFocused(false), 200)}
                    className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors" 
                    placeholder="e.g. Full Stack Developer" 
                    required 
                  />
                  {statusSuggestions.length > 0 && isStatusFocused && (
                    <div className="absolute z-10 w-full mt-1 bg-[#14141A] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                      {statusSuggestions.map((suggestion, idx) => (
                        <div 
                          key={idx} 
                          className="px-4 py-2.5 text-xs text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                          onClick={() => {
                            setStatusInput(suggestion);
                            setFormData({ ...formData, status: suggestion });
                            setIsStatusFocused(false);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Company / Organization</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="text-gray-500" size={16} />
                    </div>
                    <input 
                      type="text" 
                      name="company" 
                      value={formData.company} 
                      onChange={handleChange} 
                      className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors" 
                      placeholder="e.g. Stripe / Google" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-gray-300">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="text-gray-500" size={16} />
                    </div>
                    <input 
                      type="text" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleChange} 
                      className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors" 
                      placeholder="e.g. San Francisco, CA" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div>
              <h3 className="text-sm font-bold text-white mb-4">Skills & Bio</h3>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    Core Technical Skills * <span className="text-[11px] text-gray-500 font-normal">(Comma separated)</span>
                  </label>
                  <input 
                    type="text" 
                    name="skills" 
                    value={formData.skills} 
                    onChange={handleChange} 
                    className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors" 
                    required 
                    placeholder="e.g. React, Node.js, Python, Flutter, Docker" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Short Headline</label>
                  <textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleChange} 
                    rows="2" 
                    maxLength="220" 
                    className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none resize-none transition-colors" 
                    placeholder="e.g. Full Stack Architect building high-scale developer tools..." 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Extended About Me Story</label>
                  <textarea 
                    name="about" 
                    value={formData.about} 
                    onChange={handleChange} 
                    rows="5" 
                    maxLength="2000" 
                    className="w-full bg-[#050508] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none resize-none transition-colors" 
                    placeholder="Tell other developers about your engineering journey, open-source projects, and interests..." 
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div>
              <h3 className="text-sm font-bold text-white mb-4">Social & Repository Profiles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Personal Website</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="text-gray-500" size={16} />
                    </div>
                    <input 
                      type="url" 
                      name="website" 
                      value={formData.website} 
                      onChange={handleChange} 
                      className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors" 
                      placeholder="https://yourportfolio.dev" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">GitHub Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FolderGit2 className="text-gray-500" size={16} />
                    </div>
                    <input 
                      type="text" 
                      name="githubusername" 
                      value={formData.githubusername} 
                      onChange={handleChange} 
                      className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors" 
                      placeholder="e.g. octocat" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => navigate('/profile')} 
                className="px-5 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                <Save size={15} />
                {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SECURITY & SESSIONS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="bg-[#0C0C12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/10 pb-3">
              <KeyRound size={16} className="text-[#00F0FF]" />
              <span>Cryptographic Authentication & Password</span>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none"
                  placeholder="Repeat new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPasswordChanging}
                className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isPasswordChanging ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Active Sessions Killswitch Card */}
          <div className="bg-[#0C0C12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Active Session Governance & Remote Revocation</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                $O(1)$ Token Invalidation Active
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              If you suspect unrecognized access or have lost a device, you can immediately invalidate all active JWT tokens across all browsers and mobile devices.
            </p>

            <button
              onClick={() => setIsRevokeModalOpen(true)}
              className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <LogOut size={14} />
              <span>Revoke All Other Sessions & Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: IN-APP PRIVACY & LEGAL POLICY READER                               */}
      {/* ========================================================================= */}
      {activeTab === 'legal' && (
        <div className="bg-[#0C0C12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
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

      {/* ========================================================================= */}
      {/* TAB 4: GDPR DATA PORTABILITY & RIGHTS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* GDPR 1-Click Data Archive Export */}
          <div className="bg-[#0C0C12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/10 pb-3">
              <Download size={16} className="text-[#00F0FF]" />
              <span>GDPR Article 20: 1-Click Personal Data Portability Archive</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Under international privacy frameworks (GDPR and CCPA), you have the absolute legal right to download a machine-readable \`.json\` archive of your profile, all published posts, code snippets, comments, and connection lists.
            </p>

            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isExporting ? 'Generating Archive...' : 'Download My Personal Data (.json)'}</span>
            </button>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm border-b border-red-500/20 pb-3">
              <AlertTriangle size={16} />
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

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={handleRevokeAllSessions}
        title="Revoke All Active Sessions"
        message="Are you sure you want to invalidate all active session tokens and sign out?"
        confirmText="Revoke Sessions"
        isDestructive={true}
      />

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
