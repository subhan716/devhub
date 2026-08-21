import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  Briefcase, 
  Layers, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Upload, 
  MapPin, 
  Globe, 
  Plus, 
  X, 
  RefreshCw,
  UserPlus,
  Compass,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
];

const SUGGESTED_SKILLS = [
  'React', 'Next.js', 'Node.js', 'PostgreSQL', 'TypeScript', 
  'Python', 'AI Systems', 'UI/UX Design', 'Product Strategy', 
  'Cloud Architecture', 'GraphQL', 'TailwindCSS', 'Go', 'Web3'
];

const INDUSTRIES = [
  'Tech & Engineering',
  'Founders & Startups',
  'Creative & UI/UX Design',
  'AI & Data Science',
  'Product & Leadership',
  'Venture & Capital'
];

const SetupProfilePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [connectedIds, setConnectedIds] = useState(new Set());

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    avatarUrl: PRESET_AVATARS[0],
    status: '',
    company: '',
    location: '',
    bio: '',
    industry: 'Tech & Engineering',
    skills: ['React', 'TypeScript', 'Node.js'],
    openToWork: true,
    targetRole: 'Full Stack Architect'
  });

  const [skillInput, setSkillInput] = useState('');

  // Fetch initial profile & suggestions
  useEffect(() => {
    const initOnboarding = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
        const { data: user } = await axios.get(`${apiUrl}/api/auth/me`, { withCredentials: true });
        if (user?.name) {
          setFormData((prev) => ({
            ...prev,
            name: user.name,
            avatarUrl: user.avatarUrl || prev.avatarUrl
          }));
        }

        // Fetch recommendations
        const res = await axios.get(`${apiUrl}/api/profile/suggestions/onboarding`, { withCredentials: true });
        if (res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.warn('Onboarding init notice:', err.message);
      }
    };
    initOnboarding();
  }, []);

  const handleAddSkill = (skillToAdd) => {
    const s = (skillToAdd || skillInput).trim();
    if (s && !formData.skills.includes(s) && formData.skills.length < 10) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleConnectToggle = (userId) => {
    setConnectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
      await axios.post(
        `${apiUrl}/api/profile`,
        {
          name: formData.name,
          avatarUrl: formData.avatarUrl,
          status: formData.status || `${formData.industry} Specialist`,
          company: formData.company,
          location: formData.location,
          bio: formData.bio,
          skills: formData.skills,
          openToWork: {
            isLooking: formData.openToWork,
            jobTitles: [formData.targetRole || 'Full Stack Engineer'],
            workplaces: ['Remote', 'Hybrid'],
            locations: ['Worldwide']
          }
        },
        { withCredentials: true }
      );

      toast.success('Your professional identity is ready! Welcome aboard.');
      navigate('/feed', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#00F0FF]/30">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="DevHub Logo" className="w-8 h-8 object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
          <span className="text-xl font-extrabold text-white">
            Dev<span className="text-[#00F0FF]">Hub</span>
          </span>
        </div>

        {/* Progress Step Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${
                currentStep === stepNum
                  ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : currentStep > stepNum
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800'
              }`}
            >
              <span>Step 0{stepNum}</span>
              {currentStep > stepNum && <CheckCircle2 size={12} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Stage */}
      <div className="max-w-3xl mx-auto w-full my-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Visual Identity & Avatar */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-semibold mb-3">
                  <User size={13} />
                  <span>Step 1 of 4: Visual Identity</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Choose Your Profile Avatar</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
                  Select a preset high-resolution avatar or enter an image URL to represent your digital authority.
                </p>
              </div>

              {/* Active Avatar Showcase */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative">
                  <img
                    src={formData.avatarUrl}
                    alt="Preview"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-[#00F0FF]/50 shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#0D0D12]">
                    ✓
                  </div>
                </div>
              </div>

              {/* Preset Selection */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-zinc-400 mb-3 text-center">
                  Quick Select Verified Presets
                </label>
                <div className="flex items-center justify-center gap-4">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: url })}
                      className={`rounded-2xl overflow-hidden p-1 transition-all cursor-pointer ${
                        formData.avatarUrl === url
                          ? 'ring-2 ring-[#00F0FF] scale-105 shadow-md'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={url} alt="Preset" className="w-12 h-12 rounded-xl object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL Input */}
              <div className="max-w-md mx-auto mb-8">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Or Paste Custom Image URL</label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              {/* Action */}
              <div className="flex justify-end pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0A66C2] text-black font-extrabold text-xs flex items-center gap-2 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  <span>Next: Professional Persona</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Professional Persona */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
                  <Briefcase size={13} />
                  <span>Step 2 of 4: Professional Persona</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Headline & Domain Focus</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
                  Define your primary role, company/organization, and industry focus.
                </p>
              </div>

              <div className="space-y-4 max-w-xl mx-auto mb-8">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Professional Headline</label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    placeholder="e.g. Lead AI Architect & Systems Engineer | Ex-Stripe"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Current Company / Organization</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Horizon AI Labs"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA / Remote"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Industry Domain</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INDUSTRIES.map((ind, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, industry: ind })}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                          formData.industry === ind
                            ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF] shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Short Bio</label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Building next-gen distributed systems and developer tooling."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-[#FF0055] text-white font-extrabold text-xs flex items-center gap-2 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(255,0,85,0.3)] cursor-pointer"
                >
                  <span>Next: Skill Matrix</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Skill Matrix & OpenToWork */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
                  <Layers size={13} />
                  <span>Step 3 of 4: Skill Matrix & Opportunities</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Your Skill Graph</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
                  Add up to 10 verified skills to boost smart peer matching and venture recommendations.
                </p>
              </div>

              <div className="max-w-xl mx-auto space-y-6 mb-8">
                {/* Active Skills Chips */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Selected Skills ({formData.skills.length}/10)</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl min-h-[52px]">
                    {formData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-bold"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add Custom Skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Type a skill and press Enter..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer border border-zinc-700"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                {/* Suggested Quick Add */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2">Recommended Suggestions</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SKILLS.filter((s) => !formData.skills.includes(s)).slice(0, 8).map((skill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={10} />
                        <span>{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Open To Opportunities Toggle */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap size={15} className="text-emerald-400" />
                      <span className="text-xs font-bold text-white">Open to High-Impact Opportunities</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Let venture partners and co-founders discover your profile directly.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.openToWork}
                    onChange={(e) => setFormData({ ...formData, openToWork: e.target.checked })}
                    className="w-5 h-5 accent-emerald-400 cursor-pointer rounded"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0A66C2] text-black font-extrabold text-xs flex items-center gap-2 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  <span>Next: Suggested Peers</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Suggested Peer Connections & Launch */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
                  <Users size={13} />
                  <span>Step 4 of 4: Peer Connections</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Connect with Top Innovators</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
                  Follow leading creators and founders to kickstart your personalized DevHub feed.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-8">
                {suggestions.length > 0 ? (
                  suggestions.map((peer) => {
                    const isConnected = connectedIds.has(peer.id);
                    return (
                      <div
                        key={peer.id}
                        className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={peer.avatarUrl || PRESET_AVATARS[0]}
                            alt={peer.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{peer.name}</h4>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {peer.profile?.status || peer.profile?.company || 'Ecosystem Innovator'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleConnectToggle(peer.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer ${
                            isConnected
                              ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                              : 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25'
                          }`}
                        >
                          <UserPlus size={12} />
                          <span>{isConnected ? 'Connected' : 'Connect'}</span>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-6 text-xs text-zinc-500">
                    <Compass className="mx-auto mb-2 text-zinc-600 animate-spin" size={24} />
                    <span>Discovering global peers in your domain...</span>
                  </div>
                )}
              </div>

              {/* Launch Action */}
              <div className="text-center pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full max-w-md mx-auto py-4 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-[#8A2BE2] to-[#FF0055] text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Configuring Your Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch My DevHub Workspace</span>
                      <Sparkles size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-zinc-600 py-4">
        DevHub Universal Identity Framework • Powered by Supabase PostgreSQL
      </div>
    </div>
  );
};

export default SetupProfilePage;
