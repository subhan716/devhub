import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  ShieldAlert, 
  Save, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight,
  Radio,
  Sliders,
  Sparkles,
  Code2,
  Video,
  MessageSquare,
  Briefcase,
  Globe2,
  UserPlus,
  Bot,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getAppConfig, updateAppConfig } from '../api/adminApi';
import ActionConfirmModal from './common/ActionConfirmModal';
import toast from 'react-hot-toast';

const FEATURE_DEFINITIONS = [
  {
    id: 'codeSharing',
    label: 'Code Sharing & Syntax Highlighting',
    description: 'Enables interactive multi-language code snippets & sandbox in posts.',
    icon: Code2,
    color: 'text-cyan-400',
  },
  {
    id: 'videoUploads',
    label: 'Video & High-Res Media Pipeline',
    description: 'Allows developers to upload video demonstrations & multimedia.',
    icon: Video,
    color: 'text-purple-400',
  },
  {
    id: 'directMessaging',
    label: 'Real-Time 1-on-1 Direct Messaging',
    description: 'WebSocket messaging gateway & floating chat console across fleet.',
    icon: MessageSquare,
    color: 'text-blue-400',
  },
  {
    id: 'jobBoard',
    label: 'Developer Jobs & Hiring Marketplace',
    description: 'Tech job board, salary benchmarks & recruiter applicant tracking.',
    icon: Briefcase,
    color: 'text-amber-400',
  },
  {
    id: 'threeDNetwork',
    label: '3D Interactive Developer Graph',
    description: 'Three.js / WebGL hardware-accelerated 3D connections visualizer.',
    icon: Globe2,
    color: 'text-emerald-400',
  },
  {
    id: 'userRegistration',
    label: 'New Developer Registrations',
    description: 'Controls public signup gateway. Toggle off to make platform invite-only.',
    icon: UserPlus,
    color: 'text-pink-400',
  },
  {
    id: 'aiAssistant',
    label: 'AI Code Review Sentinel',
    description: 'Automated static analysis & code recommendations powered by DeepMind.',
    icon: Bot,
    color: 'text-indigo-400',
  },
];

const MobileAppConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'role',
    title: '',
    description: '',
    impactStatement: '',
    actionHandler: null,
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await getAppConfig();
      setConfig(data);
    } catch (err) {
      toast.error('Failed to load mobile app configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handlePromptSave = () => {
    const isMaintenanceOn = config?.maintenanceMode?.enabled;
    setConfirmModal({
      isOpen: true,
      type: isMaintenanceOn ? 'suspend' : 'role',
      title: isMaintenanceOn 
        ? '⚠️ Publish Configuration (MAINTENANCE MODE ACTIVE)' 
        : 'Publish Fleet Configuration Live',
      description: 'You are updating production client rules, OTA feature flags, and version gatekeeper settings.',
      impactStatement: isMaintenanceOn
        ? 'DANGER: Maintenance Mode is ENABLED. Regular web and mobile users will be locked out with the maintenance screen.'
        : 'All active web sessions and mobile apps will receive real-time OTA updates immediately.',
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await updateAppConfig(config);
          setConfig(res.config);
          toast.success(res.message || 'Mobile fleet configuration published live!');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update app configuration');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const toggleFeature = (featureKey) => {
    setConfig((prev) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [featureKey]: !prev.featureFlags?.[featureKey],
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw size={20} className="animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Top Banner Header */}
      <div className="bg-[#0D0D10] border border-zinc-800/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Smartphone size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              Mobile Fleet Governance & OTA Config Engine
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Control Flutter client version requirements, dynamic force-updates, emergency killswitches, and feature flags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchConfig}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Reload Config"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handlePromptSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Emergency Platform Maintenance Mode Card */}
      <div
        className={`p-5 rounded-2xl border transition-all shadow-sm ${
          config?.maintenanceMode?.enabled
            ? 'bg-red-950/40 border-red-500/40 text-red-200 shadow-red-950/30'
            : 'bg-[#0D0D10] border-zinc-800/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              config?.maintenanceMode?.enabled ? 'bg-red-500/20 text-red-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
            }`}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  Platform & Mobile Fleet Maintenance Mode
                </h3>
                {config?.maintenanceMode?.enabled ? (
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-red-600 text-white animate-pulse">
                    ACTIVE LOCKOUT
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-zinc-800 text-zinc-400">
                    OPERATIONAL (NORMAL)
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                When enabled, normal web and mobile visitors are presented with the maintenance screen. Super Admins retain bypass access.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setConfig({
                ...config,
                maintenanceMode: {
                  ...config.maintenanceMode,
                  enabled: !config.maintenanceMode?.enabled,
                },
              })
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
              config?.maintenanceMode?.enabled
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            {config?.maintenanceMode?.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{config?.maintenanceMode?.enabled ? 'Maintenance Enabled' : 'Enable Maintenance'}</span>
          </button>
        </div>

        {config?.maintenanceMode?.enabled && (
          <div className="mt-4 pt-4 border-t border-red-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-red-300 mb-1">
                Advisory Title (Header on Lock Screen):
              </label>
              <input
                type="text"
                value={config.maintenanceMode?.title || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maintenanceMode: { ...config.maintenanceMode, title: e.target.value },
                  })
                }
                placeholder="System Under Scheduled Maintenance"
                className="w-full bg-black/40 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder-red-400/50 focus:outline-none focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-red-300 mb-1">
                Advisory Message (Displayed to users):
              </label>
              <input
                type="text"
                value={config.maintenanceMode?.message || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maintenanceMode: { ...config.maintenanceMode, message: e.target.value },
                  })
                }
                placeholder="Infrastructure upgrades in progress. We will be back shortly!"
                className="w-full bg-black/40 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder-red-400/50 focus:outline-none focus:border-red-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid: Android & iOS Version Gatekeeper */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Android Configuration */}
        <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🤖</span>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Android Fleet Gatekeeper</h4>
                <p className="text-[10px] text-zinc-500 font-mono">Google Play Store Bundle</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
              <input
                type="checkbox"
                checked={config?.android?.forceUpdate || false}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    android: { ...config.android, forceUpdate: e.target.checked },
                  })
                }
                className="accent-[#00F0FF] rounded"
              />
              <span className="font-semibold text-[11px]">Force Update</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Minimum Supported Version:
              </label>
              <input
                type="text"
                value={config?.android?.minVersion || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    android: { ...config.android, minVersion: e.target.value },
                  })
                }
                placeholder="1.0.0"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#00F0FF]/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Latest Store Version:
              </label>
              <input
                type="text"
                value={config?.android?.latestVersion || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    android: { ...config.android, latestVersion: e.target.value },
                  })
                }
                placeholder="1.0.2"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#00F0FF]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Google Play Store URL:
            </label>
            <input
              type="text"
              value={config?.android?.storeUrl || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  android: { ...config.android, storeUrl: e.target.value },
                })
              }
              placeholder="https://play.google.com/store/apps/details?id=com.devhub.app"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Release Notes (Shown on Update Dialog):
            </label>
            <input
              type="text"
              value={config?.android?.releaseNotes || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  android: { ...config.android, releaseNotes: e.target.value },
                })
              }
              placeholder="Latest performance optimizations and developer network improvements."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>
        </div>

        {/* iOS Configuration */}
        <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🍏</span>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">iOS Fleet Gatekeeper</h4>
                <p className="text-[10px] text-zinc-500 font-mono">Apple App Store IPA</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
              <input
                type="checkbox"
                checked={config?.ios?.forceUpdate || false}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    ios: { ...config.ios, forceUpdate: e.target.checked },
                  })
                }
                className="accent-[#00F0FF] rounded"
              />
              <span className="font-semibold text-[11px]">Force Update</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Minimum Supported Version:
              </label>
              <input
                type="text"
                value={config?.ios?.minVersion || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    ios: { ...config.ios, minVersion: e.target.value },
                  })
                }
                placeholder="1.0.0"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#00F0FF]/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Latest Store Version:
              </label>
              <input
                type="text"
                value={config?.ios?.latestVersion || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    ios: { ...config.ios, latestVersion: e.target.value },
                  })
                }
                placeholder="1.0.2"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#00F0FF]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Apple App Store URL:
            </label>
            <input
              type="text"
              value={config?.ios?.storeUrl || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ios: { ...config.ios, storeUrl: e.target.value },
                })
              }
              placeholder="https://apps.apple.com/app/devhub/id123456789"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Release Notes (Shown on Update Dialog):
            </label>
            <input
              type="text"
              value={config?.ios?.releaseNotes || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ios: { ...config.ios, releaseNotes: e.target.value },
                })
              }
              placeholder="iOS stability enhancements and code syntax rendering upgrades."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>
        </div>
      </div>

      {/* Over-The-Air (OTA) Dynamic Feature Flags Grid */}
      <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} className="text-[#00F0FF]" />
              Over-The-Air (OTA) Dynamic Feature Flags Engine
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Instantly toggle capabilities across active Flutter mobile apps and web clients without App Store reviews.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {FEATURE_DEFINITIONS.map((feat) => {
            const FIcon = feat.icon;
            const isEnabled = Boolean(config?.featureFlags?.[feat.id]);
            return (
              <div
                key={feat.id}
                onClick={() => toggleFeature(feat.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'bg-zinc-900/80 border-zinc-700/80 hover:border-zinc-600'
                    : 'bg-zinc-900/30 border-zinc-800/60 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-zinc-800/80 ${feat.color}`}>
                    <FIcon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200">{feat.label}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{feat.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`p-1 transition-colors flex-shrink-0 ${
                    isEnabled ? 'text-[#00F0FF]' : 'text-zinc-600'
                  }`}
                >
                  {isEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Confirmation Guard Modal */}
      <ActionConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.actionHandler}
        title={confirmModal.title}
        description={confirmModal.description}
        impactStatement={confirmModal.impactStatement}
        actionType={confirmModal.type}
      />
    </div>
  );
};

export default MobileAppConfig;
