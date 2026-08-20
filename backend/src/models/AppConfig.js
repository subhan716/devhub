const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_config',
      unique: true,
    },
    android: {
      minVersion: { type: String, default: '1.0.0' },
      latestVersion: { type: String, default: '1.0.0' },
      forceUpdate: { type: Boolean, default: false },
      storeUrl: { type: String, default: 'https://play.google.com/store/apps/details?id=com.devhub.app' },
      releaseNotes: { type: String, default: 'Latest performance optimizations and developer network improvements.' },
    },
    ios: {
      minVersion: { type: String, default: '1.0.0' },
      latestVersion: { type: String, default: '1.0.0' },
      forceUpdate: { type: Boolean, default: false },
      storeUrl: { type: String, default: 'https://apps.apple.com/app/devhub/id123456789' },
      releaseNotes: { type: String, default: 'iOS stability enhancements and code syntax rendering upgrades.' },
    },
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      title: { type: String, default: 'System Under Scheduled Maintenance' },
      message: {
        type: String,
        default: 'DevHub backend infrastructure is undergoing scheduled database upgrades. All services will resume shortly.',
      },
      estimatedEndTime: { type: Date, default: null },
      allowAdminBypass: { type: Boolean, default: true },
    },
    featureFlags: {
      codeSharing: { type: Boolean, default: true },
      videoUploads: { type: Boolean, default: true },
      directMessaging: { type: Boolean, default: true },
      jobBoard: { type: Boolean, default: true },
      threeDNetwork: { type: Boolean, default: true },
      userRegistration: { type: Boolean, default: true },
      aiAssistant: { type: Boolean, default: false },
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    lastUpdatedEmail: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppConfig', appConfigSchema);
