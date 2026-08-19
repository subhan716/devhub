const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    avatar: {
      url: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
      }
    },
    statusPreference: {
      type: String,
      enum: ['online', 'invisible'],
      default: 'online'
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    passwordHash: {
      type: String,
      // Not strictly required because Google OAuth users won't have a password
      select: false, // Don't return password by default in queries
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values for non-Google users
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin', 'super_admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isVerifiedBadge: {
      type: Boolean,
      default: false,
    },
    badgeType: {
      type: String,
      enum: ['none', 'verified_developer', 'top_creator', 'partner_org'],
      default: 'none',
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isShadowBanned: {
      type: Boolean,
      default: false,
    },
    suspendedReason: String,
    suspendedAt: Date,
    tokenVersion: {
      type: Number,
      default: 0,
    },
    strikesCount: {
      type: Number,
      default: 0,
    },
    warnings: [
      {
        reason: { type: String, required: true },
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
        issuedAt: { type: Date, default: Date.now },
      }
    ],
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
    refreshToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if it was modified
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method to match entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Create text index for highly scalable search
userSchema.index({ name: 'text' });

module.exports = mongoose.model('User', userSchema);
