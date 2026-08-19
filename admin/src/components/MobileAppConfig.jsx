import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  ShieldAlert, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink,
  Code,
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
      toast.success('Mobile app configuration & version rules updated live!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update app configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121212] border border-white/5 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Smartphone size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Mobile App Fleet & Version Gatekeeper
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Flutter iOS & Android
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Control minimum supported versions, force-update dialogs, and platform killswitches live.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchConfig}
            className="p-2.5 bg-[#1a1a1a] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Reload Config"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? 'Publishing Rules...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Emergency Maintenance Switch */}
      <div className={`p-5 rounded-2xl border transition-all ${
        config?.maintenanceMode?.enabled 
          ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.15)]' 
          : 'bg-[#121212] border-white/5'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl mt-0.5 ${
              config?.maintenanceMode?.enabled ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400'
            }`}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Emergency Mobile App Maintenance Mode
                {config?.maintenanceMode?.enabled && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded bg-red-500 text-white animate-pulse">
                    ACTIVE
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                When enabled, all Flutter mobile app clients will display a non-dismissible maintenance screen.
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
              config?.maintenanceMode?.enabled
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}
          >
            {config?.maintenanceMode?.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{config?.maintenanceMode?.enabled ? 'Disable Maintenance' : 'Enable Maintenance'}</span>
          </button>
        </div>

        {config?.maintenanceMode?.enabled && (
          <div className="mt-4 pt-4 border-t border-red-500/20">
            <label className="block text-xs font-semibold text-red-300 mb-1.5">
              Custom Maintenance Message (Shown to Mobile Users):
            </label>
            <input
              type="text"
              value={config.maintenanceMode?.message || ''}
              onChange={(e) => setConfig({
                ...config,
                maintenanceMode: { ...config.maintenanceMode, message: e.target.value }
              })}
              placeholder="DevHub is undergoing scheduled infrastructure upgrades. We will be back shortly!"
              className="w-full bg-black/50 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
            />
          </div>
        )}
      </div>

      {/* Grid: Android & iOS Version Gatekeeper */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Android Configuration */}
        <div className="bg-[#121212] border border-white/5 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="text-sm font-bold text-white">Google Play Store (Android)</h4>
                <p className="text-[11px] text-gray-400">Flutter Android Engine Settings</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.android?.forceUpdate || false}
                onChange={(e) => setConfig({
                  ...config,
                  android: { ...config.android, forceUpdate: e.target.checked }
                })}
                className="rounded border-gray-700 text-[#00F0FF] focus:ring-0 focus:ring-offset-0 bg-black"
              />
              <span className="text-xs font-bold text-gray-300">Force Update</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Minimum Supported Version:
              </label>
              <input
                type="text"
                value={config?.android?.minVersion || ''}
                onChange={(e) => setConfig({
                  ...config,
                  android: { ...config.android, minVersion: e.target.value }
                })}
                placeholder="1.0.0"
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
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
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">
              Google Play Store URL:
            </label>
            <input
              type="text"
              value={config?.android?.storeUrl || ''}
              onChange={(e) => setConfig({
                ...config,
                android: { ...config.android, storeUrl: e.target.value }
              })}
              placeholder="https://play.google.com/store/apps/details?id=com.devhub.app"
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">
              Release Notes (Shown on update dialog):
            </label>
            <textarea
              rows={2}
              value={config?.android?.releaseNotes || ''}
              onChange={(e) => setConfig({
                ...config,
                android: { ...config.android, releaseNotes: e.target.value }
              })}
              placeholder="Critical security patches & 60 FPS feed optimization."
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
            />
          </div>
        </div>

        {/* iOS Configuration */}
        <div className="bg-[#121212] border border-white/5 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🍏</span>
              <div>
                <h4 className="text-sm font-bold text-white">Apple App Store (iOS)</h4>
                <p className="text-[11px] text-gray-400">Flutter iOS Engine Settings</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.ios?.forceUpdate || false}
                onChange={(e) => setConfig({
                  ...config,
                  ios: { ...config.ios, forceUpdate: e.target.checked }
                })}
                className="rounded border-gray-700 text-[#00F0FF] focus:ring-0 focus:ring-offset-0 bg-black"
              />
              <span className="text-xs font-bold text-gray-300">Force Update</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Minimum Supported Version:
              </label>
              <input
                type="text"
                value={config?.ios?.minVersion || ''}
                onChange={(e) => setConfig({
                  ...config,
                  ios: { ...config.ios, minVersion: e.target.value }
                })}
                placeholder="1.0.0"
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
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
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">
              Apple App Store URL:
            </label>
            <input
              type="text"
              value={config?.ios?.storeUrl || ''}
              onChange={(e) => setConfig({
                ...config,
                ios: { ...config.ios, storeUrl: e.target.value }
              })}
              placeholder="https://apps.apple.com/app/devhub/id123456789"
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">
              Release Notes (Shown on update dialog):
            </label>
            <textarea
              rows={2}
              value={config?.ios?.releaseNotes || ''}
              onChange={(e) => setConfig({
                ...config,
                ios: { ...config.ios, releaseNotes: e.target.value }
              })}
              placeholder="Support for iOS 18 widgets and biometric login."
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Feature Flags (Over-The-Air) */}
      <div className="bg-[#121212] border border-white/5 p-5 rounded-2xl space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio size={16} className="text-[#00F0FF]" />
            Over-The-Air (OTA) Dynamic Feature Flags
          </h4>
          <p className="text-xs text-gray-400">
            Instantly enable or disable capabilities on mobile clients without waiting for App Store / Play Store reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Code Snippet Sharing</p>
              <p className="text-[10px] text-gray-500">Syntax highlighter & execution</p>
            </div>
            <button
              onClick={() => setConfig({
                ...config,
                featureFlags: { ...config.featureFlags, codeSharing: !config.featureFlags?.codeSharing }
              })}
              className={`p-1 rounded-lg transition-colors ${
                config?.featureFlags?.codeSharing ? 'text-[#00F0FF]' : 'text-gray-600'
              }`}
            >
              {config?.featureFlags?.codeSharing ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
            </button>
          </div>

          <div className="p-3.5 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Media & Video Uploads</p>
              <p className="text-[10px] text-gray-500">Cloudinary mobile video streams</p>
            </div>
            <button
              onClick={() => setConfig({
                ...config,
                featureFlags: { ...config.featureFlags, videoUploads: !config.featureFlags?.videoUploads }
              })}
              className={`p-1 rounded-lg transition-colors ${
                config?.featureFlags?.videoUploads ? 'text-[#00F0FF]' : 'text-gray-600'
              }`}
            >
              {config?.featureFlags?.videoUploads ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
            </button>
          </div>

          <div className="p-3.5 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Direct Messaging</p>
              <p className="text-[10px] text-gray-500">Real-time Socket.IO chat</p>
            </div>
            <button
              onClick={() => setConfig({
                ...config,
                featureFlags: { ...config.featureFlags, directMessaging: !config.featureFlags?.directMessaging }
              })}
              className={`p-1 rounded-lg transition-colors ${
                config?.featureFlags?.directMessaging ? 'text-[#00F0FF]' : 'text-gray-600'
              }`}
            >
              {config?.featureFlags?.directMessaging ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppConfig;
