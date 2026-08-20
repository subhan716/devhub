const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Broadcast title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    message: {
      type: String,
      required: [true, 'Broadcast message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['announcement', 'maintenance', 'security_alert', 'critical_emergency'],
      default: 'announcement',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'verified_only', 'moderators_only'],
      default: 'all',
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
    linkText: {
      type: String,
      trim: true,
      default: 'Learn More',
    },
    isPersistentBanner: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    authorName: {
      type: String,
      default: 'Security Operations',
    },
    authorEmail: {
      type: String,
      default: '',
    },
    stats: {
      sentCount: { type: Number, default: 0 },
      clickedCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Covered index for active banner queries
broadcastSchema.index({ isActive: 1, isPersistentBanner: 1, expiresAt: 1, createdAt: -1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
