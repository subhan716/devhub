import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Building2, 
  MapPin, 
  Globe, 
  FolderGit2, 
  Camera, 
  X, 
  Plus, 
  CheckCircle2, 
  Briefcase, 
  Sparkles, 
  Save, 
  ShieldCheck,
  RefreshCw,
  Layers,
  Link2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_SUGGESTIONS = [
  'Full Stack Software Engineer',
  'Frontend Engineer (React / Next.js)',
  'Backend Architect (Node.js / Python / Go)',
  'Mobile Developer (Flutter / React Native)',
  'DevOps & Cloud Infrastructure Engineer',
  'AI / Machine Learning Engineer',
  'UI/UX & Product Designer',
  'Cybersecurity Analyst',
  'Open Source Contributor & Student',
  'Engineering Lead / CTO'
];

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 
  'Flutter', 'Next.js', 'Docker', 'MongoDB', 'PostgreSQL', 
  'TailwindCSS', 'AWS', 'GraphQL', 'Git'
];

const ProfileSettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [githubusername, setGithubusername] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Hiring & Services Flags
  const [isOpenToWork, setIsOpenToWork] = useState(false);
  const [isProvidingServices, setIsProvidingServices] = useState(false);
  const [servicesDetails, setServicesDetails] = useState('');

  // Dropdown helper
  const [isStatusFocused, setIsStatusFocused] = useState(false);
  const avatarInputRef = useRef(null);

  // Fetch Current Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/me`, { withCredentials: true });
        if (data) {
          setName(data.user?.name || '');
          setStatus(data.status || '');
          setCompany(data.company || '');
          setLocation(data.location || '');
          setBio(data.bio || '');
          setAbout(data.about || '');
          setSkills(Array.isArray(data.skills) ? data.skills : []);
          setGithubusername(data.githubusername || '');
          setWebsite(data.socialLinks?.website || '');
          setLinkedin(data.socialLinks?.linkedin || '');
          setTwitter(data.socialLinks?.twitter || '');
          setAvatarUrl(data.avatar?.url || data.user?.avatar?.url || '');
          setIsVerified(Boolean(data.user?.isVerifiedBadge));
          setIsOpenToWork(Boolean(data.openToWork?.isLooking));
          setIsProvidingServices(Boolean(data.providingServices?.isProviding));
          setServicesDetails(data.providingServices?.details || '');
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          toast.error('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Avatar Upload Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size cannot exceed 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingAvatar(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload/avatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(data.url);
      toast.success('Avatar updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Interactive Skills Tag Input Handlers
  const handleAddSkill = (skillToAdd) => {
    const clean = (skillToAdd || skillInput).trim();
    if (!clean) return;
    if (skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      toast.error(`"${clean}" is already added.`);
      return;
    }
    if (skills.length >= 30) {
      toast.error('Maximum 30 skills limit reached.');
      return;
    }
    setSkills([...skills, clean]);
    setSkillInput('');
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Profile Save Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        status,
        company,
        location,
        bio,
        about,
        skills,
        githubusername,
        website,
        linkedin,
        twitter,
        avatar: avatarUrl ? { url: avatarUrl } : undefined,
        openToWork: {
          isLooking: isOpenToWork,
          jobTitles: isOpenToWork && status ? [status] : [],
        },
        providingServices: {
          isProviding: isProvidingServices,
          details: servicesDetails,
        },
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/profile`, payload, { withCredentials: true });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500 text-xs font-mono">
        <RefreshCw size={20} className="animate-spin text-[#00F0FF]" />
        <span>Loading profile settings...</span>
      </div>
    );
  }

  const filteredSuggestions = status.trim()
    ? STATUS_SUGGESTIONS.filter((s) => s.toLowerCase().includes(status.toLowerCase())).slice(0, 5)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* 1. Profile Picture Row */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full overflow-hidden border ${isOpenToWork ? 'border-emerald-400' : 'border-slate-200 dark:border-white/10'}`}>
              <img
                src={avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt={name || 'Avatar'}
                className="w-full h-full object-cover"
              />
            </div>
            {isOpenToWork && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111]" title="Open to Work" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{name || 'Your Name'}</h3>
              {isVerified && <CheckCircle2 size={14} className="text-[#00F0FF]" />}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{status || 'Developer'}</p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <Camera size={14} className={uploadingAvatar ? 'animate-spin' : ''} />
            <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
          </button>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* 2. Core Professional Identity */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-200 dark:border-white/5 pb-3">
          <UserIcon size={16} className="text-[#00F0FF]" />
          <span>Professional Identity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Full Display Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
              placeholder="e.g. Subhan Shahid"
              required
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Headline / Role *</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onFocus={() => setIsStatusFocused(true)}
              onBlur={() => setTimeout(() => setIsStatusFocused(false), 250)}
              className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
              placeholder="e.g. Full Stack Developer"
              required
            />
            {isStatusFocused && filteredSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-[#16161C] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                {filteredSuggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => {
                      setStatus(sug);
                      setIsStatusFocused(false);
                    }}
                    className="px-3.5 py-2 text-xs text-slate-700 dark:text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                  >
                    {sug}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Company / Organization</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Building2 size={14} />
              </div>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="e.g. Google / Freelance"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <MapPin size={14} />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="e.g. San Francisco, CA"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hiring & Services Flags */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-200 dark:border-white/5 pb-3">
          <Briefcase size={16} className="text-emerald-400" />
          <span>Opportunity & Availability</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white">Open to Work</div>
              <p className="text-[10px] text-gray-400">Signals recruiters you're looking</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpenToWork(!isOpenToWork)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex-shrink-0 ${
                isOpenToWork ? 'bg-emerald-500' : 'bg-gray-700'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${isOpenToWork ? 'translate-x-4.5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white">Freelance Services</div>
              <p className="text-[10px] text-gray-400">Showcases consulting availability</p>
            </div>
            <button
              type="button"
              onClick={() => setIsProvidingServices(!isProvidingServices)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex-shrink-0 ${
                isProvidingServices ? 'bg-[#00F0FF]' : 'bg-gray-700'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${isProvidingServices ? 'translate-x-4.5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {isProvidingServices && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Services Offered / Rates</label>
            <input
              type="text"
              value={servicesDetails}
              onChange={(e) => setServicesDetails(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none"
              placeholder="e.g. Web Development, Code Audits ($70/hr)"
            />
          </div>
        )}
      </div>

      {/* 4. Skills Matrix */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Layers size={16} className="text-[#00F0FF]" />
            <span>Technical Skills</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">{skills.length} / 30</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="flex-1 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none"
              placeholder="Type skill & press Enter (e.g. React, Docker)..."
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-10 p-2.5 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl">
            {skills.length > 0 ? (
              skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-gray-200 border border-slate-200 dark:border-white/10 text-xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500 py-1">No skills added yet.</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 8).map((pop) => (
              <button
                key={pop}
                type="button"
                onClick={() => handleAddSkill(pop)}
                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-slate-200 dark:border-white/5 text-[11px] font-mono transition-colors cursor-pointer"
              >
                + {pop}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bio & About Story */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-200 dark:border-white/5 pb-3">
          <Sparkles size={16} className="text-amber-400" />
          <span>Bio & About</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Headline Bio</label>
              <span className="text-[10px] font-mono text-gray-500">{bio.length} / 220</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={220}
              rows={2}
              className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none resize-none transition-colors"
              placeholder="Short bio for your feed cards..."
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Extended About Story</label>
              <span className="text-[10px] font-mono text-gray-500">{about.length} / 2000</span>
            </div>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              maxLength={2000}
              rows={4}
              className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none resize-none transition-colors font-mono leading-relaxed"
              placeholder="Detailed summary of your experience and interests..."
            />
          </div>
        </div>
      </div>

      {/* 6. Social & Repo Links */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-200 dark:border-white/5 pb-3">
          <Globe size={16} className="text-[#00F0FF]" />
          <span>Social & Repository Links</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">GitHub Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <FolderGit2 size={14} />
              </div>
              <input
                type="text"
                value={githubusername}
                onChange={(e) => setGithubusername(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="e.g. octocat"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Personal Website</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Globe size={14} />
              </div>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="https://portfolio.dev"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">LinkedIn Profile URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Link2 size={14} />
              </div>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-gray-300">Twitter / X URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Link2 size={14} />
              </div>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="https://x.com/username"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white dark:bg-[#00F0FF] dark:hover:bg-[#00F0FF]/90 dark:text-black shadow-sm font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>
    </form>
  );
};

export default ProfileSettingsTab;
