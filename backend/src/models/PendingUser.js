const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
    },
    googleId: String,
    githubId: String,
    otp: String,
    otpExpire: Date,
    otpResendAttempts: {
      type: Number,
      default: 0,
    },
    otpResendTimeWindowStart: Date,
    otpFailedAttempts: {
      type: Number,
      default: 0,
    },
    otpLockUntil: Date,
  },
  {
    timestamps: true,
  }
);

// Auto-delete pending users after 2 hours if they don't verify
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model('PendingUser', pendingUserSchema);
