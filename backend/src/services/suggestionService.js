const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const Connection = require('../models/Connection');
const SuggestionCache = require('../models/SuggestionCache');

const calculateSuggestionsForUser = async (userId) => {
  const limit = 15;

  // 1. Get current user's 1st-degree connections (accepted or pending to exclude them)
  const directConnections = await Connection.find({
    $or: [{ requester: userId }, { recipient: userId }]
  });

  const excludeIds = new Set([userId.toString()]);
  const firstDegreeIds = new Set();
  
  directConnections.forEach(conn => {
    const otherId = conn.requester.toString() === userId.toString() ? conn.recipient.toString() : conn.requester.toString();
    excludeIds.add(otherId);
    if (conn.status === 'accepted') {
      firstDegreeIds.add(otherId);
    }
  });

  const excludeObjectIds = Array.from(excludeIds).map(id => new mongoose.Types.ObjectId(id));
  const firstDegreeObjectIds = Array.from(firstDegreeIds).map(id => new mongoose.Types.ObjectId(id));

  let suggestions = [];

  // 2. Intelligent Mutual Connections Algorithm (2nd Degree Network)
  if (firstDegreeObjectIds.length > 0) {
    const mutualSuggestions = await Connection.aggregate([
      {
        $match: {
          status: 'accepted',
          $or: [
            { requester: { $in: firstDegreeObjectIds } },
            { recipient: { $in: firstDegreeObjectIds } }
          ]
        }
      },
      {
        $project: {
          secondDegreeUser: {
            $cond: {
              if: { $in: ["$requester", firstDegreeObjectIds] },
              then: "$recipient",
              else: "$requester"
            }
          }
        }
      },
      {
        $match: {
          secondDegreeUser: { $nin: excludeObjectIds }
        }
      },
      {
        $group: {
          _id: "$secondDegreeUser",
          mutualCount: { $sum: 1 }
        }
      },
      { $sort: { mutualCount: -1 } },
      { $limit: limit }
    ]);

    if (mutualSuggestions.length > 0) {
      const suggestionIds = mutualSuggestions.map(s => s._id);
      const usersInfo = await User.find({ _id: { $in: suggestionIds } }).select('_id'); // Just need IDs for cache array
      
      suggestions = mutualSuggestions.map(m => ({
        user: m._id,
        mutualConnections: m.mutualCount
      }));
    }
  }

  // 3. Fallback: If not enough mutual connections, fill the rest with diverse sampling
  if (suggestions.length < limit) {
    const remainingLimit = limit - suggestions.length;
    
    const currentSuggestionIds = suggestions.map(s => new mongoose.Types.ObjectId(s.user));
    const fullExcludeList = [...excludeObjectIds, ...currentSuggestionIds];

    const fallbackSuggestions = await User.aggregate([
      { $match: { _id: { $nin: fullExcludeList } } },
      { $sample: { size: remainingLimit } },
      { $project: { _id: 1 } }
    ]);

    const formattedFallbacks = fallbackSuggestions.map(u => ({
      user: u._id,
      mutualConnections: 0
    }));

    suggestions = [...suggestions, ...formattedFallbacks];
  }

  // Cache it
  await SuggestionCache.findOneAndUpdate(
    { user: userId },
    { suggestions, lastUpdated: Date.now() },
    { upsert: true, new: true }
  );

  return suggestions;
};

// Background Job to pre-compute suggestions for active users
// Runs every night at 2:00 AM
const startSuggestionCronJob = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Starting Nightly Suggestion Pre-computation Job...');
    try {
      // Find users who have been active recently (e.g., logged in the last 7 days)
      // Since we don't have a lastActive field, let's just do it for all users for now.
      // In production, you would batch process this.
      const users = await User.find({}).select('_id');
      console.log(`[CRON] Processing suggestions for ${users.length} users.`);
      
      let count = 0;
      for (const user of users) {
        await calculateSuggestionsForUser(user._id);
        count++;
        if (count % 100 === 0) console.log(`[CRON] Processed ${count} users...`);
      }
      
      console.log('[CRON] Suggestion computation completed successfully.');
    } catch (error) {
      console.error('[CRON] Error calculating suggestions:', error.message);
    }
  });
  console.log('[CRON] Suggestion Service Background Job initialized.');
};

module.exports = {
  calculateSuggestionsForUser,
  startSuggestionCronJob
};
