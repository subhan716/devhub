import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Zap,
  Plus,
  Trash2
} from 'lucide-react';
import { getLandingConfig, updateLandingConfig } from '../api/adminApi';
import toast from 'react-hot-toast';

const DEFAULT_CONFIG = {
  badgeText: 'The Universal Professional & Creator Network 🚀',
  heroTitlePrefix: 'The Network for',
  heroHighlight: 'Those Who Build, Create & Lead.',
  heroDescription: 'Connect with elite creators, tech founders, designers, and innovators. Showcase your work, land high-impact opportunities, and build global partnerships.',
  ctaPrimaryText: 'Start Networking',
  ctaPrimaryLink: '/register',
  ctaSecondaryText: 'Explore Ecosystem',
  ctaSecondaryLink: '#features',
  marqueeKeywords: [
    'Tech & Engineering',
    'Creative & Design',
    'Product & Leadership',
    'Founders & Startups',
    'AI & Data Science',
    'Growth & Marketing',
    'Venture & Capital'
  ],
  stats: {
    members: '50K+',
    projects: '120K+',
    collaborations: '95K+',
    countries: '140+'
  },
  model3DConfig: {
    speed: 1.0,
    coreColor: '#00F0FF',
    secondaryColor: '#8A2BE2'
  }
};

const LandingCMS = () => {
  const [formData, setFormData] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await getLandingConfig();
      if (res?.data) {
        setFormData({
          ...DEFAULT_CONFIG,
          ...res.data
        });
      }
    } catch (err) {
      toast.error('Failed to load landing configuration from Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLandingConfig(formData);
      toast.success('Landing Page updated and synced live to Supabase!');
    } catch (err) {
      toast.error('Failed to sync updates to Supabase');
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.marqueeKeywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        marqueeKeywords: [...formData.marqueeKeywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index) => {
    setFormData({
      ...formData,
      marqueeKeywords: formData.marqueeKeywords.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Loading Landing Page CMS from Supabase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-cyan-950/30 via-purple-950/20 to-zinc-900 border border-cyan-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#00F0FF] text-xs font-mono uppercase tracking-wider mb-1 font-semibold">
            <Globe size={15} />
            <span>Live Web App Hero & CMS</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Universal Landing Page Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Customize the public landing page hero headlines, 3D holographic parameters, statistics, and marquee tags with instant real-time Supabase sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchConfig}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-zinc-700 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0A66C2] hover:opacity-90 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Syncing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* 1. Hero Content */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Sparkles size={16} className="text-[#00F0FF]" />
              Hero Section Copy
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Announcement Badge Text
              </label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                placeholder="e.g. The Universal Professional Network 🚀"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Title Prefix
                </label>
                <input
                  type="text"
                  value={formData.heroTitlePrefix}
                  onChange={(e) => setFormData({ ...formData, heroTitlePrefix: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                  placeholder="e.g. The Network for"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Gradient Highlight Text
                </label>
                <input
                  type="text"
                  value={formData.heroHighlight}
                  onChange={(e) => setFormData({ ...formData, heroHighlight: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00F0FF] focus:outline-none font-semibold text-[#00F0FF]"
                  placeholder="e.g. Those Who Build, Create & Lead."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Hero Description Paragraph
              </label>
              <textarea
                rows={3}
                value={formData.heroDescription}
                onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00F0FF] focus:outline-none leading-relaxed"
                placeholder="Describe the platform value proposition..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={formData.ctaPrimaryText}
                  onChange={(e) => setFormData({ ...formData, ctaPrimaryText: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={formData.ctaSecondaryText}
                  onChange={(e) => setFormData({ ...formData, ctaSecondaryText: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. 3D Holographic Visual Parameters */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Sliders size={16} className="text-[#8A2BE2]" />
              3D Holographic Core Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Core Plasma Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.model3DConfig?.coreColor || '#00F0FF'}
                    onChange={(e) => setFormData({
                      ...formData,
                      model3DConfig: { ...formData.model3DConfig, coreColor: e.target.value }
                    })}
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.model3DConfig?.coreColor || '#00F0FF'}
                    onChange={(e) => setFormData({
                      ...formData,
                      model3DConfig: { ...formData.model3DConfig, coreColor: e.target.value }
                    })}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Secondary Glow Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.model3DConfig?.secondaryColor || '#8A2BE2'}
                    onChange={(e) => setFormData({
                      ...formData,
                      model3DConfig: { ...formData.model3DConfig, secondaryColor: e.target.value }
                    })}
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.model3DConfig?.secondaryColor || '#8A2BE2'}
                    onChange={(e) => setFormData({
                      ...formData,
                      model3DConfig: { ...formData.model3DConfig, secondaryColor: e.target.value }
                    })}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-1">
                <span>Rotation & Orbit Speed</span>
                <span className="font-mono text-[#00F0FF]">{formData.model3DConfig?.speed || 1.0}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={formData.model3DConfig?.speed || 1.0}
                onChange={(e) => setFormData({
                  ...formData,
                  model3DConfig: { ...formData.model3DConfig, speed: parseFloat(e.target.value) }
                })}
                className="w-full accent-[#00F0FF] cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Global Statistics */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Zap size={16} className="text-[#FF0055]" />
              Platform Metric Counters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Global Innovators
                </label>
                <input
                  type="text"
                  value={formData.stats?.members || '50K+'}
                  onChange={(e) => setFormData({
                    ...formData,
                    stats: { ...formData.stats, members: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold text-center text-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Projects Published
                </label>
                <input
                  type="text"
                  value={formData.stats?.projects || '120K+'}
                  onChange={(e) => setFormData({
                    ...formData,
                    stats: { ...formData.stats, projects: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold text-center text-[#8A2BE2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Teams & Ventures
                </label>
                <input
                  type="text"
                  value={formData.stats?.collaborations || '95K+'}
                  onChange={(e) => setFormData({
                    ...formData,
                    stats: { ...formData.stats, collaborations: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold text-center text-[#FF0055]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Countries
                </label>
                <input
                  type="text"
                  value={formData.stats?.countries || '140+'}
                  onChange={(e) => setFormData({
                    ...formData,
                    stats: { ...formData.stats, countries: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold text-center text-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* 4. Marquee Keywords */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Layers size={16} className="text-emerald-400" />
              Marquee Industry Tags
            </h3>

            <div className="flex flex-wrap gap-2">
              {(formData.marqueeKeywords || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs border border-zinc-700"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(idx)}
                    className="text-zinc-400 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Add new industry or domain..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#00F0FF] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer border border-zinc-700"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </form>

        {/* Right Live Mockup Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Eye size={15} className="text-[#00F0FF]" />
                <span>Live Hero Preview</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Interactive Preview
              </span>
            </div>

            {/* Mockup Window */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/15 blur-3xl pointer-events-none rounded-full" />

              <div className="inline-block px-2.5 py-0.5 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] font-bold mb-3">
                {formData.badgeText || 'The Universal Professional Network 🚀'}
              </div>

              <h4 className="text-xl font-extrabold text-white leading-tight mb-2">
                {formData.heroTitlePrefix || 'The Network for'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#8A2BE2] to-[#FF0055]">
                  {formData.heroHighlight || 'Those Who Build, Create & Lead.'}
                </span>
              </h4>

              <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-3 mb-4">
                {formData.heroDescription}
              </p>

              <div className="flex items-center gap-2 mb-6">
                <div className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#0A66C2] text-black font-extrabold text-[11px] flex items-center gap-1 shadow-sm">
                  <span>{formData.ctaPrimaryText || 'Start Networking'}</span>
                  <ArrowRight size={12} />
                </div>
                <div className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white font-bold text-[11px]">
                  {formData.ctaSecondaryText || 'Explore'}
                </div>
              </div>

              {/* Stats Mini Banner */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-center">
                <div>
                  <p className="text-xs font-extrabold text-[#00F0FF]">{formData.stats?.members || '50K+'}</p>
                  <p className="text-[8px] text-gray-400 uppercase">Innovators</p>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#8A2BE2]">{formData.stats?.projects || '120K+'}</p>
                  <p className="text-[8px] text-gray-400 uppercase">Projects</p>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#FF0055]">{formData.stats?.collaborations || '95K+'}</p>
                  <p className="text-[8px] text-gray-400 uppercase">Teams</p>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-emerald-400">{formData.stats?.countries || '140+'}</p>
                  <p className="text-[8px] text-gray-400 uppercase">Countries</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Real-Time Database Sync
              </p>
              <p>Saving updates here instantly commits to Supabase and updates the public landing page on next visit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingCMS;
