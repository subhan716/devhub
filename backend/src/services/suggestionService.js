const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const Connection = require('../models/Connection');
const SuggestionCache = require('../models/SuggestionCache');

const calculateSuggestionsForUser = async (userId) => {
  const limit = 15;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. The Limitless Pipeline (Executes entirely inside MongoDB C++ engine)
  const pipelineResult = await Connection.aggregate([
    // Step A: Find all 1st-degree connections
    {
      $match: {
        $or: [{ requester: userObjectId }, { recipient: userObjectId }]
      }
    },
    // Step B: Group them into arrays internally
    {
      $group: {
        _id: null,
        excludeIds: {
          $addToSet: {
            $cond: [{ $eq: ["$requester", userObjectId] }, "$recipient", "$requester"]
          }
        },
        firstDegreeIds: {
          $addToSet: {
            $cond: [
              { $eq: ["$status", "accepted"] },
              { $cond: [{ $eq: ["$requester", userObjectId] }, "$recipient", "$requester"] },
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        excludeIds: 1,
        firstDegreeIds: {
          $filter: { input: "$firstDegreeIds", as: "id", cond: { $ne: ["$$id", null] } }
        }
      }
    },
    // Step C: Massive double-join lookup for 2nd degree connections
    {
      $lookup: {
        from: 'connections',
        let: { fdIds: '$firstDegreeIds', exIds: '$excludeIds' },
        pipeline: [
          {
            $match: {
              status: 'accepted',
              $expr: {
                $or: [
                  { $in: ["$requester", "$$fdIds"] },
                  { $in: ["$recipient", "$$fdIds"] }
                ]
              }
            }
          },
          {
            $project: {
              secondDegreeUser: {
                $cond: [{ $in: ["$requester", "$$fdIds"] }, "$recipient", "$requester"]
              }
            }
          },
          // Step D: Filter out 1st degree network and self
          {
            $match: {
              $expr: {
                $and: [
                  { $not: { $in: ["$secondDegreeUser", "$$exIds"] } },
                  { $ne: ["$secondDegreeUser", userObjectId] }
                ]
              }
            }
          },
          // Step E: Group by user and count mutuals!
          {
            $group: {
              _id: "$secondDegreeUser",
              mutualCount: { $sum: 1 }
            }
          },
          { $sort: { mutualCount: -1 } },
          { $limit: limit }
        ],
        as: 'mutualSuggestions'
      }
    }
  ]);

  let suggestions = [];
  let excludeObjectIds = [userObjectId];

  if (pipelineResult.length > 0) {
    const mutualSuggestions = pipelineResult[0].mutualSuggestions;
    excludeObjectIds = [...excludeObjectIds, ...pipelineResult[0].excludeIds];
    
    if (mutualSuggestions.length > 0) {
      suggestions = mutualSuggestions.map(m => ({
        user: m._id,
        mutualConnections: m.mutualCount
      }));
    }
  }

  // 2. Fallback: If not enough mutual connections, fill the rest with diverse sampling
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
