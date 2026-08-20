import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Building2, 
  MapPin, 
  Globe, 
  FolderGit2, 
  Link2, 
  Camera, 
  Upload, 
  X, 
  Plus, 
  CheckCircle2, 
  Briefcase, 
  Sparkles, 
  Save, 
  Eye, 
  ShieldCheck,
  RefreshCw,
  Layers
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
  'Cybersecurity & Pen-Tester',
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
  const [uploadingCover, setUploadingCover] = useState(false);

  // Profile Form State
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
  const [coverUrl, setCoverUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Hiring & Services Flags
  const [isOpenToWork, setIsOpenToWork] = useState(false);
  const [isProvidingServices, setIsProvidingServices] = useState(false);
  const [servicesDetails, setServicesDetails] = useState('');

  // Dropdown helper
  const [isStatusFocused, setIsStatusFocused] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

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
          setCoverUrl(data.coverImage?.url || '');
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

  // Cover Banner Upload Handler
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover banner file size cannot exceed 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingCover(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload/cover`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCoverUrl(data.url);
      toast.success('Cover banner updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload cover banner');
    } finally {
      setUploadingCover(false);
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
        coverImage: coverUrl ? { url: coverUrl } : undefined,
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
      toast.success('Profile details saved & synchronized live!');
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
        <span>Hydrating developer profile...</span>
      </div>
    );
  }

  const filteredSuggestions = status.trim()
    ? STATUS_SUGGESTIONS.filter((s) => s.toLowerCase().includes(status.toLowerCase())).slice(0, 5)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-sans">
      {/* ========================================================================= */}
      {/* 1. VISUAL BRANDING: COVER BANNER & AVATAR (DISCORD + LINKEDIN STYLE)      */}
      {/* ========================================================================= */}
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {/* Cover Image Container */}
        <div className="relative h-40 sm:h-48 w-full bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-black group">
          {coverUrl ? (
            <img src={coverUrl} alt="Profile Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 font-mono">
              <span>Default Obsidian Grid Banner</span>
            </div>
          )}

          {/* Cover Edit Button */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl border border-white/10 text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Camera size={14} className={uploadingCover ? 'animate-spin' : ''} />
            <span>{uploadingCover ? 'Uploading...' : 'Change Cover'}</span>
          </button>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Avatar & Header Meta */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14">
          <div className="flex items-end gap-4">
            {/* Avatar with Open-To-Work Ring */}
            <div className="relative group">
              <div
                className={`w-24 h-24 rounded-full p-1 bg-[#111] ${
                  isOpenToWork ? 'ring-2 ring-emerald-400 ' : 'ring-2 ring-white/10'
                }`}
              >
                <img
                  src={avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                  alt={name || 'Avatar'}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Upload Avatar Overlay Button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                title="Replace Profile Picture"
              >
                <Camera size={20} className={uploadingAvatar ? 'animate-spin' : ''} />
                <span className="text-[10px] font-semibold mt-1">{uploadingAvatar ? '...' : 'Edit'}</span>
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Quick Name Display */}
            <div className="mb-2 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{name || 'Your Full Name'}</h2>
                {isVerified && <CheckCircle2 size={16} className="text-[#00F0FF]" title="Verified Developer" />}
                {isOpenToWork && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                    #OPEN TO WORK
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono">{status || 'Developer Headline'}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mb-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold text-xs rounded-xl transition-all  flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CORE PROFESSIONAL IDENTITY & HEADLINE                                 */}
      {/* ========================================================================= */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
          <UserIcon size={16} className="text-[#00F0FF]" />
          <span>Core Professional Identity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Full Display Name * <span className="text-[10px] text-gray-500">(Syncs to posts & profile)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
              placeholder="e.g. Subhan Shahid"
              required
            />
          </div>

          {/* Professional Status / Headline with Autocomplete */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-gray-300">Professional Status / Headline *</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onFocus={() => setIsStatusFocused(true)}
              onBlur={() => setTimeout(() => setIsStatusFocused(false), 250)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
              placeholder="e.g. Full Stack Engineer (React / Node.js)"
              required
            />

            {/* Suggestions Dropdown */}
            {isStatusFocused && filteredSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-[#16161C] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => {
                      setStatus(suggestion);
                      setIsStatusFocused(false);
                    }}
                    className="px-4 py-2 text-xs text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company / Organization */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Company / Organization</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Building2 size={15} />
              </div>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="e.g. Google / Freelance / Stealth Startup"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <MapPin size={15} />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="e.g. San Francisco, CA (or Remote)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LINKEDIN HIRING & FREELANCE SIGNALS (OPEN TO WORK)                     */}
      {/* ========================================================================= */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
          <Briefcase size={16} className="text-emerald-400" />
          <span>Developer Opportunity & Hiring Signals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Open to Work Switch Card */}
          <div className="p-4 rounded-xl bg-[#050508] border border-white/10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span>Open to Work Signal</span>
                {isOpenToWork && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Displays the emerald green ring on your avatar and highlights you in recruiter searches.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenToWork(!isOpenToWork)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex-shrink-0 ${
                isOpenToWork ? 'bg-emerald-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isOpenToWork ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Providing Services Switch Card */}
          <div className="p-4 rounded-xl bg-[#050508] border border-white/10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span>Providing Freelance Services</span>
                {isProvidingServices && <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />}
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Showcases your consulting and freelance availability to clients across the network.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsProvidingServices(!isProvidingServices)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex-shrink-0 ${
                isProvidingServices ? 'bg-[#00F0FF]' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isProvidingServices ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Services Detail Input if enabled */}
        {isProvidingServices && (
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-gray-300">Services Offered / Pricing Details</label>
            <input
              type="text"
              value={servicesDetails}
              onChange={(e) => setServicesDetails(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none"
              placeholder="e.g. Full-Stack Web Development, API Architecture, Code Audits ($80/hr)"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE TECHNICAL SKILLS MATRIX (TAG CHIPS + QUICK ADD)           */}
      {/* ========================================================================= */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Layers size={16} className="text-[#00F0FF]" />
            <span>Technical Skills Matrix</span>
          </div>
          <span className="text-[11px] font-mono text-gray-500">{skills.length} / 30 skills</span>
        </div>

        {/* Tag Input Box */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="flex-1 bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none"
              placeholder="Type a skill (e.g. React, Docker, Go) and press Enter or comma..."
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* Active Skills Tag Chips */}
          <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-[#050508] border border-white/10 rounded-xl">
            {skills.length > 0 ? (
              skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-semibold group animate-in fade-in duration-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500 py-1">No skills added yet. Add your core tech stack above!</span>
            )}
          </div>

          {/* Quick Suggested Skills Pills */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
              Suggested Quick Add:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((popSkill) => (
                <button
                  key={popSkill}
                  type="button"
                  onClick={() => handleAddSkill(popSkill)}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#00F0FF]/10 text-gray-400 hover:text-[#00F0FF] border border-white/5 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  + {popSkill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DEVELOPER STORYTELLING & BIO (LIVE COUNTERS)                           */}
      {/* ========================================================================= */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
          <Sparkles size={16} className="text-amber-400" />
          <span>Developer Storytelling & Bio</span>
        </div>

        {/* Short Bio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-300">Short Feed Headline / Bio</label>
            <span className={`text-[10px] font-mono ${bio.length > 200 ? 'text-amber-400' : 'text-gray-500'}`}>
              {bio.length} / 220 chars
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={220}
            rows={2}
            className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none resize-none transition-colors"
            placeholder="e.g. Building next-generation developer platforms and open-source infrastructure..."
          />
        </div>

        {/* Extended About Story */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-300">Extended "About Me" Markdown Story</label>
            <span className={`text-[10px] font-mono ${about.length > 1900 ? 'text-amber-400' : 'text-gray-500'}`}>
              {about.length} / 2000 chars
            </span>
          </div>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            maxLength={2000}
            rows={5}
            className="w-full bg-[#050508] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none resize-none transition-colors font-mono leading-relaxed"
            placeholder="Share your engineering journey, architectural principles, favorite stacks, and open-source contributions..."
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SOCIAL & DEVELOPER ECOSYSTEM LINKS                                    */}
      {/* ========================================================================= */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
          <Globe size={16} className="text-[#00F0FF]" />
          <span>Developer Ecosystem & Social Links</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* GitHub Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">GitHub Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <FolderGit2 size={15} />
              </div>
              <input
                type="text"
                value={githubusername}
                onChange={(e) => setGithubusername(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="e.g. octocat"
              />
            </div>
          </div>

          {/* Personal Website */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Personal Portfolio Website</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Globe size={15} />
              </div>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="https://yourportfolio.dev"
              />
            </div>
          </div>

          {/* LinkedIn Profile */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">LinkedIn Profile URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z"/></svg>
              </div>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          {/* Twitter / X */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Twitter / X Profile URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </div>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
                placeholder="https://x.com/username"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black rounded-xl text-xs font-bold transition-all disabled:opacity-50  cursor-pointer"
        >
          <Save size={16} />
          <span>{saving ? 'Saving Profile Changes...' : 'Save Profile Changes'}</span>
        </button>
      </div>
    </form>
  );
};

export default ProfileSettingsTab;
