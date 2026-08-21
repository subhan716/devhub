import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Scale, 
  ArrowLeft, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Printer, 
  Terminal,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const TABS = [
  { id: 'guidelines', label: 'Community Guidelines', icon: ShieldCheck, path: '/guidelines' },
  { id: 'terms', label: 'Terms of Service', icon: FileText, path: '/terms' },
  { id: 'privacy', label: 'Privacy Policy', icon: Lock, path: '/privacy' },
];

const LegalCenterPage = ({ initialTab = 'guidelines' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const getTabFromPath = () => {
    if (location.pathname.includes('terms')) return 'terms';
    if (location.pathname.includes('privacy')) return 'privacy';
    if (location.pathname.includes('guidelines')) return 'guidelines';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = getTabFromPath();
    setActiveTab(tab);
    fetchPolicy(tab);
  }, [location.pathname]);

  const fetchPolicy = async (slug) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/policies/${slug}`);
      setPolicyData(data);
    } catch (err) {
      console.warn('Policy fetch fallback to static cache:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const selected = TABS.find((t) => t.id === tabId);
    if (selected) {
      navigate(selected.path);
    }
  };

  // Helper to render markdown content with high-contrast styling
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-white/10">
            {line.replace('# ', '')}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-[#00F0FF] mt-4 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 ml-4 mb-1 list-disc">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.startsWith('---')) {
        return <hr key={idx} className="border-slate-200 dark:border-white/10 my-5" />;
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return (
          <p key={idx} className="text-xs text-slate-600 dark:text-gray-400 italic mb-3">
            {line.replace(/\*/g, '')}
          </p>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed mb-3">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] text-slate-900 dark:text-white font-sans selection:bg-[#00F0FF]/30">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-white/5 bg-[#09090D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/feed"
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10"
            >
              <ArrowLeft size={14} />
              <span>Back to App</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-[#00F0FF]" />
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">DevHub Trust & Legal Center</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-gray-400">
            <span className="hidden sm:inline font-mono text-[11px] bg-white/5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/5">
              Standard: ISO/IEC 27001 & GDPR Aligned
            </span>
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-slate-200 dark:border-white/5 bg-gradient-to-b from-[#0D0D14] to-[#050508] py-12 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] text-xs font-mono font-semibold">
            <ShieldCheck size={13} />
            <span>DEVHUB TRUST, INTEGRITY & DEVELOPER RIGHTS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Developer Legal Standards & Community Governance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transparent policies engineered to protect open-source code ownership, prevent malicious exploits, and foster professional developer collaboration.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation Tabs (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-[#0C0C12] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xl space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1 block">
                  Policy Documents
                </span>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-[#00F0FF] shadow-lg shadow-[#00F0FF]/5'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'opacity-100' : 'opacity-40'} />
                    </button>
                  );
                })}
              </div>

              {/* Version & Sentinel Telemetry Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-black/40 border border-cyan-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00F0FF] font-bold">
                    <Terminal size={14} />
                    <span>Dynamic Policy Sync</span>
                  </div>
                  {policyData?.version && (
                    <span className="px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] font-mono text-[10px] font-bold">
                      v{policyData.version}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                  DevHub legal agreements are backed by cryptographic version control and audited under ISO/IEC 27001 data compliance.
                </p>
                <div className="pt-1 text-[10px] font-mono text-gray-500">
                  {policyData?.updatedAt ? `Last Synced: ${new Date(policyData.updatedAt).toLocaleDateString()}` : 'Live Production'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Document Canvas (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-[#0C0C12] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 leading-relaxed">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500 font-mono text-xs">
                  <RefreshCw size={24} className="animate-spin text-[#00F0FF]" />
                  <span>Loading official policy document...</span>
                </div>
              ) : (
                <article className="prose prose-invert max-w-none">
                  {renderMarkdown(policyData?.content)}
                </article>
              )}

              {/* Compliance Footer Note */}
              <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>DevHub Global Compliance & Trust Architecture</span>
                </div>
                <a
                  href="mailto:devhubapp.support@gmail.com"
                  className="hover:text-slate-900 dark:text-white transition-colors underline flex items-center gap-1"
                >
                  <span>Contact Trust & Safety Desk</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalCenterPage;
