import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  ShieldAlert, 
  Save, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight,
  Radio
} from 'lucide-react';
import { getAppConfig, updateAppConfig } from '../api/adminApi';
import toast from 'react-hot-toast';

const MobileAppConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await updateAppConfig(config);
      setConfig(data.config);
      toast.success('Mobile app rules & version gate updated live!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update app configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={18} className="animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0D0D10] border border-zinc-800/80 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Smartphone size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Mobile Fleet Version Gatekeeper
            </h3>
            <p className="text-xs text-zinc-400">
              Configure minimum Flutter client versions, force updates, and maintenance screens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchConfig}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Reload Config"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-semibold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Maintenance Mode Toggle */}
      <div className={`p-4 rounded-xl border transition-all ${
        config?.maintenanceMode?.enabled 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-[#0D0D10] border-zinc-800/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={16} className={config?.maintenanceMode?.enabled ? 'text-red-400 mt-0.5' : 'text-zinc-400 mt-0.5'} />
            <div>
              <h4 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                Emergency Mobile Maintenance Mode
                {config?.maintenanceMode?.enabled && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium rounded bg-red-500 text-white animate-pulse">
                    ACTIVE
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Displays non-dismissible maintenance dialog on all connected mobile clients.
              </p>
            </div>
          </div>

          <button
            onClick={() => setConfig({
              ...config,
              maintenanceMode: {
                ...config.maintenanceMode,
                enabled: !config.maintenanceMode?.enabled
              }
            })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all ${
              config?.maintenanceMode?.enabled
                ? 'bg-red-500 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {config?.maintenanceMode?.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            <span>{config?.maintenanceMode?.enabled ? 'Maintenance Enabled' : 'Maintenance Disabled'}</span>
          </button>
        </div>

        {config?.maintenanceMode?.enabled && (
          <div className="mt-3 pt-3 border-t border-red-500/20">
            <label className="block text-[11px] font-medium text-red-300 mb-1">
              Custom Maintenance Message (Shown on Mobile Screen):
            </label>
            <input
              type="text"
              value={config.maintenanceMode?.message || ''}
              onChange={(e) => setConfig({
                ...config,
                maintenanceMode: { ...config.maintenanceMode, message: e.target.value }
              })}
              placeholder="DevHub is undergoing scheduled infrastructure upgrades. We will be back shortly!"
              className="w-full bg-black/40 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
            />
          </div>
        )}
      </div>

      {/* Grid: Android & iOS Version Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Android Configuration */}
        <div className="bg-[#0D0D10] border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
            <h4 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>🤖</span> Android (Google Play)
            </h4>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={config?.android?.forceUpdate || false}
                onChange={(e) => setConfig({
                  ...config,
                  android: { ...config.android, forceUpdate: e.target.checked }
                })}
                className="rounded border-zinc-700 bg-zinc-900 text-[#00F0FF]"
              />
              <span>Force Update</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Min Supported Version:
              </label>
              <input
                type="text"
                value={config?.android?.minVersion || ''}
                onChange={(e) => setConfig({
                  ...config,
                  android: { ...config.android, minVersion: e.target.value }
                })}
                placeholder="1.0.0"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Latest Store Version:
              </label>
              <input
                type="text"
                value={config?.android?.latestVersion || ''}
                onChange={(e) => setConfig({
                  ...config,
                  android: { ...config.android, latestVersion: e.target.value }
                })}
                placeholder="1.0.2"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Store URL:
            </label>
            <input
              type="text"
              value={config?.android?.storeUrl || ''}
              onChange={(e) => setConfig({
                ...config,
                android: { ...config.android, storeUrl: e.target.value }
              })}
              placeholder="https://play.google.com/store/apps/details?id=com.devhub.app"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        {/* iOS Configuration */}
        <div className="bg-[#0D0D10] border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
            <h4 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>🍏</span> iOS (Apple App Store)
            </h4>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={config?.ios?.forceUpdate || false}
                onChange={(e) => setConfig({
                  ...config,
                  ios: { ...config.ios, forceUpdate: e.target.checked }
                })}
                className="rounded border-zinc-700 bg-zinc-900 text-[#00F0FF]"
              />
              <span>Force Update</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Min Supported Version:
              </label>
              <input
                type="text"
                value={config?.ios?.minVersion || ''}
                onChange={(e) => setConfig({
                  ...config,
                  ios: { ...config.ios, minVersion: e.target.value }
                })}
                placeholder="1.0.0"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Latest Store Version:
              </label>
              <input
                type="text"
                value={config?.ios?.latestVersion || ''}
                onChange={(e) => setConfig({
                  ...config,
                  ios: { ...config.ios, latestVersion: e.target.value }
                })}
                placeholder="1.0.2"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Store URL:
            </label>
            <input
              type="text"
              value={config?.ios?.storeUrl || ''}
              onChange={(e) => setConfig({
                ...config,
                ios: { ...config.ios, storeUrl: e.target.value }
              })}
              placeholder="https://apps.apple.com/app/devhub/id123456789"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-[#0D0D10] border border-zinc-800/80 p-4 rounded-xl space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
            <Radio size={14} className="text-zinc-400" />
            Over-The-Air Dynamic Feature Flags
          </h4>
          <p className="text-[11px] text-zinc-500">
            Instantly toggle capabilities across active Flutter mobile apps without store review.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-200">Code Snippet Sharing</p>
              <p className="text-[10px] text-zinc-500">Syntax highlighter</p>
            </div>
            <button
              onClick={() => setConfig({
                ...config,
                featureFlags: { ...config.featureFlags, codeSharing: !config.featureFlags?.codeSharing }
              })}
              className={`p-1 transition-colors ${
                config?.featureFlags?.codeSharing ? 'text-[#00F0FF]' : 'text-zinc-600'
              }`}
            >
              {config?.featureFlags?.codeSharing ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-200">Media Uploads</p>
              <p className="text-[10px] text-zinc-500">Cloudinary stream</p>
            </div>
            <button
              onClick={() => setConfig({
                ...config,
                featureFlags: { ...config.featureFlags, videoUploads: !config.featureFlags?.videoUploads }
              })}
              className={`p-1 transition-colors ${
                config?.featureFlags?.videoUploads ? 'text-[#00F0FF]' : 'text-zinc-600'
              }`}
            >
              {config?.featureFlags?.videoUploads ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-200">Direct Messaging</p>
              <p className="text-[10px] text-zinc-500">Real-time chat</p>
            </div>
            <button
              onClick={() => setConfig({
                ...config,
                featureFlags: { ...config.featureFlags, directMessaging: !config.featureFlags?.directMessaging }
              })}
              className={`p-1 transition-colors ${
                config?.featureFlags?.directMessaging ? 'text-[#00F0FF]' : 'text-zinc-600'
              }`}
            >
              {config?.featureFlags?.directMessaging ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppConfig;
