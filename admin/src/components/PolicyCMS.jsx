import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Scale, 
  Save, 
  History, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Eye, 
  Code, 
  Sparkles,
  AlertTriangle,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPolicyBySlug, updatePolicy } from '../api/adminApi';
import ActionConfirmModal from './common/ActionConfirmModal';

const POLICY_SLUGS = [
  { slug: 'guidelines', title: 'Community Guidelines', icon: ShieldCheck, color: 'text-amber-400' },
  { slug: 'terms', title: 'Terms of Service', icon: FileText, color: 'text-cyan-400' },
  { slug: 'privacy', title: 'Privacy Policy', icon: Lock, color: 'text-emerald-400' },
];

const PolicyCMS = () => {
  const [activeSlug, setActiveSlug] = useState('guidelines');
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchPolicy = async (slug) => {
    setLoading(true);
    try {
      const data = await getPolicyBySlug(slug);
      setPolicyData(data);
      setTitle(data.title || '');
      setContent(data.content || '');
      setVersion(data.version || '1.0.0');
      setChangeSummary('');
    } catch (err) {
      console.error('Failed to load policy', err);
      toast.error('Failed to load policy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy(activeSlug);
  }, [activeSlug]);

  const handleSaveClick = () => {
    if (!content.trim()) {
      toast.error('Policy content cannot be empty');
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmPublish = async (reason) => {
    setSaving(true);
    try {
      const res = await updatePolicy(activeSlug, {
        title,
        content,
        version,
        changeSummary: reason || changeSummary || 'Published via Admin Policy CMS',
      });
      toast.success(res.message || 'Policy published and broadcasted live!');
      fetchPolicy(activeSlug);
    } catch (err) {
      console.error('Failed to update policy', err);
      toast.error(err.response?.data?.message || 'Failed to update policy');
    } finally {
      setSaving(false);
    }
  };

  // Helper to render Markdown-like text simply
  const renderPreview = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2 pb-2 border-b border-zinc-800">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-zinc-100 mt-4 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-bold text-[#00F0FF] mt-3 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="text-xs text-zinc-300 ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('---')) {
        return <hr key={idx} className="border-zinc-800 my-4" />;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-zinc-400 leading-relaxed mb-2">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Policy Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0D0D10] border border-zinc-800/80 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-semibold">
            <Scale size={12} />
            <span>DYNAMIC POLICY ENGINE & CMS</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Legal & Policy Governance Center</h2>
          <p className="text-xs text-zinc-400">
            Edit, semantic-version, and live-broadcast platform legal agreements across Web & Mobile apps.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchPolicy(activeSlug)}
            disabled={loading}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            title="Refresh from DB"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleSaveClick}
            disabled={saving || loading}
            className="flex-1 sm:flex-initial px-5 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Policy Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {POLICY_SLUGS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSlug === item.slug;
          return (
            <button
              key={item.slug}
              onClick={() => setActiveSlug(item.slug)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                isActive
                  ? 'bg-[#00F0FF]/5 border-[#00F0FF]/40 shadow-lg shadow-[#00F0FF]/5'
                  : 'bg-[#0D0D10] border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-[#00F0FF]/10 text-[#00F0FF]' : 'bg-zinc-900 text-zinc-400'}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>{item.title}</h3>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {policyData && activeSlug === item.slug ? `v${policyData.version}` : 'Active Production'}
                  </span>
                </div>
              </div>
              {isActive && <CheckCircle2 size={16} className="text-[#00F0FF]" />}
            </button>
          );
        })}
      </div>

      {/* Main CMS Editor Layout */}
      {loading ? (
        <div className="h-96 flex items-center justify-center bg-[#0D0D10] border border-zinc-800/80 rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-zinc-500">
            <RefreshCw size={24} className="animate-spin text-[#00F0FF]" />
            <span className="text-xs font-mono">Hydrating live policy document...</span>
          </div>
        </div>
      ) : (
        <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-4 border-b border-zinc-800/80">
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#08080A] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#00F0FF]/50 outline-none font-medium"
                placeholder="Policy Title"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Semantic Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-[#08080A] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-[#00F0FF] font-mono font-bold focus:border-[#00F0FF]/50 outline-none"
                placeholder="e.g. 1.0.0"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">View Mode</label>
              <div className="flex bg-[#08080A] border border-zinc-800 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${
                    viewMode === 'edit' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${
                    viewMode === 'split' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${
                    viewMode === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Editor & Preview Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Editor (Left) */}
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className={viewMode === 'split' ? 'lg:col-span-6 space-y-1.5' : 'lg:col-span-12 space-y-1.5'}>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>MARKDOWN SOURCE EDITOR</span>
                  <span>{content.length} characters</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full bg-[#08080A] border border-zinc-800/90 rounded-xl p-4 text-xs text-zinc-200 font-mono leading-relaxed focus:border-[#00F0FF]/50 outline-none resize-none selection:bg-[#00F0FF]/20"
                  placeholder="Enter policy markdown text..."
                />
              </div>
            )}

            {/* Preview (Right) */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={viewMode === 'split' ? 'lg:col-span-6 space-y-1.5' : 'lg:col-span-12 space-y-1.5'}>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>LIVE RENDERED OUTPUT</span>
                  <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sync Live</span>
                </div>
                <div className="h-[495px] overflow-y-auto bg-[#08080A] border border-zinc-800/90 rounded-xl p-5 scrollbar-thin scrollbar-thumb-zinc-800">
                  {renderPreview(content)}
                </div>
              </div>
            )}
          </div>

          {/* Changelog Accordion */}
          {policyData?.changelog && policyData.changelog.length > 0 && (
            <div className="pt-4 border-t border-zinc-800/80 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <History size={12} />
                <span>Revision History & Audit Changelog</span>
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {policyData.changelog.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/40 text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#00F0FF]">v{log.version}</span>
                      <span className="text-zinc-300">{log.changeSummary}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(log.updatedAt).toLocaleDateString()} by {log.updatedByEmail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Safety Modal */}
      <ActionConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmPublish}
        title={`Publish Live Policy: ${title || activeSlug}`}
        impactStatement="Publishing this update will immediately broadcast the revised legal terms to all active Web and Mobile app users worldwide."
        actionLabel="Publish Policy Live"
        isDestructive={false}
      />
    </div>
  );
};

export default PolicyCMS;
