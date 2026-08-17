const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      maxlength: [2000, 'Post cannot exceed 2000 characters'],
    },
    image: {
      public_id: String,
      url: String,
    },
    codeSnippet: {
      code: String,
      language: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Denormalized for performance (avoids counting array length on every read)
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    reposts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    repostsCount: {
      type: Number,
      default: 0,
    },
    isRepost: {
      type: Boolean,
      default: false,
    },
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reports: [
      {
        reporter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          enum: ['spam', 'harassment', 'inappropriate', 'hate_speech', 'scam', 'other'],
          default: 'spam',
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reportsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for highly scalable search
postSchema.index({ content: 'text' });

module.exports = mongoose.model('Post', postSchema);
