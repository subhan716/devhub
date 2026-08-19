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
      storeUrl: { type: String, default: 'https://play.google.com/store' },
      releaseNotes: { type: String, default: 'General improvements & bug fixes.' },
    },
    ios: {
      minVersion: { type: String, default: '1.0.0' },
      latestVersion: { type: String, default: '1.0.0' },
      forceUpdate: { type: Boolean, default: false },
      storeUrl: { type: String, default: 'https://apps.apple.com' },
      releaseNotes: { type: String, default: 'Performance enhancements.' },
    },
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'DevHub is currently undergoing scheduled maintenance. We will be back shortly!',
      },
    },
    featureFlags: {
      codeSharing: { type: Boolean, default: true },
      videoUploads: { type: Boolean, default: true },
      directMessaging: { type: Boolean, default: true },
      jobBoard: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppConfig', appConfigSchema);
