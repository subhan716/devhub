const mongoose = require('mongoose');

const suggestionCacheSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cache entry per user
    },
    suggestions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        mutualConnections: {
          type: Number,
          default: 0,
        },
      }
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    }
  }
);

// Expire the cache automatically after 24 hours (TTL Index)
suggestionCacheSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('SuggestionCache', suggestionCacheSchema);
