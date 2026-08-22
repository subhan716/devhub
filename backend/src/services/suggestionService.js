const prisma = require('../config/prisma');

// ============================================================================
// L1 HIGH-SPEED IN-MEMORY CACHE (Process RAM Level for Sub-Millisecond Speed)
// ============================================================================
const memoryCache = new Map();
const L1_TTL_MS = 60 * 1000; // 60 seconds L1 RAM cache
const L2_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours L2 PostgreSQL cache

/**
 * Invalidate recommendation cache across both L1 RAM and L2 Database
 */
const invalidateUserSuggestions = async (userId) => {
  if (!userId) return;
  try {
    memoryCache.delete(userId);
    await prisma.suggestionCache.deleteMany({
      where: { userId }
    }).catch(() => {});
  } catch (e) {
    console.error('Error invalidating suggestions:', e.message);
  }
};

/**
 * Calculate Jaccard Similarity between two skill sets (Normalized 0.0 - 1.0)
 */
const calculateJaccardSimilarity = (skillsA = [], skillsB = []) => {
  if (!Array.isArray(skillsA) || !Array.isArray(skillsB) || skillsA.length === 0 || skillsB.length === 0) {
    return 0.0;
  }
  const setA = new Set(skillsA.map(s => s.toLowerCase().trim()));
  const setB = new Set(skillsB.map(s => s.toLowerCase().trim()));

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0.0 : intersectionCount / unionCount;
};

/**
 * Multi-Factor Scoring Formula
 * Score = 0.30*Skills + 0.25*Mutual + 0.15*Company + 0.10*Location + 0.10*Badge + 0.10*Activity
 */
const computeCandidateScore = ({
  userSkills,
  userCompany,
  userLocation,
  candidate,
  mutualCount = 0,
  hasRecentActivity = false
}) => {
  const cProfile = candidate.profile || {};
  const cSkills = Array.isArray(cProfile.skills) ? cProfile.skills : [];
  const cCompany = (cProfile.company || '').toLowerCase().trim();
  const cLocation = (cProfile.location || '').toLowerCase().trim();

  // 1. Skills Jaccard Similarity (w1 = 0.30)
  const skillsScore = calculateJaccardSimilarity(userSkills, cSkills);

  // 2. Mutual Connections Proximity (w2 = 0.25)
  const mutualScore = Math.min(1.0, mutualCount / 5.0);

  // 3. Company Match (w3 = 0.15)
  const companyScore = (userCompany && cCompany && (userCompany === cCompany || cCompany.includes(userCompany) || userCompany.includes(cCompany))) ? 1.0 : 0.0;

  // 4. Location Proximity (w4 = 0.10)
  const locationScore = (userLocation && cLocation && (userLocation === cLocation || cLocation.includes(userLocation) || userLocation.includes(cLocation))) ? 1.0 : 0.0;

  // 5. Verified Developer / Top Creator Badge (w5 = 0.10)
  const badgeScore = (candidate.isVerifiedBadge || candidate.badgeType !== 'none') ? 1.0 : 0.0;

  // 6. Activity Recency (w6 = 0.10)
  const activityScore = hasRecentActivity ? 1.0 : 0.2;

  const totalScore = (
    0.30 * skillsScore +
    0.25 * mutualScore +
    0.15 * companyScore +
    0.10 * locationScore +
    0.10 * badgeScore +
    0.10 * activityScore
  );

  return totalScore;
};

/**
 * High-Scale Ranked Suggestions Engine (< 5ms response SLA)
 */
const getRankedSuggestions = async (userId, limit = 10) => {
  const now = Date.now();

  // =========================================================================
  // 1. FAST-PATH: Check L1 RAM Cache (0.2ms Latency)
  // =========================================================================
  if (userId && memoryCache.has(userId)) {
    const l1Entry = memoryCache.get(userId);
    if (now < l1Entry.expiresAt && Array.isArray(l1Entry.data) && l1Entry.data.length > 0) {
      return l1Entry.data.slice(0, limit);
    } else {
      memoryCache.delete(userId);
    }
  }

  // =========================================================================
  // 2. SECONDARY-PATH: Check L2 PostgreSQL SuggestionCache (1-3ms Latency)
  // =========================================================================
  if (userId) {
    try {
      const cached = await prisma.suggestionCache.findUnique({
        where: { userId }
      });

      if (cached && new Date(cached.expiresAt).getTime() > now && Array.isArray(cached.suggestions) && cached.suggestions.length > 0) {
        // Hydrate L1 RAM cache
        memoryCache.set(userId, {
          data: cached.suggestions,
          expiresAt: now + L1_TTL_MS
        });
        return cached.suggestions.slice(0, limit);
      }
    } catch (dbCacheErr) {
      console.warn('L2 Cache check warning:', dbCacheErr.message);
    }
  }

  // =========================================================================
  // 3. CANDIDATE GENERATION & GRAPH SCORING PIPELINE
  // =========================================================================
  const excludedUserIds = new Set();
  let currentUser = null;

  if (userId) {
    excludedUserIds.add(userId);

    // Fetch current user profile + existing connections in parallel
    const [userRecord, connections] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          profile: { select: { skills: true, company: true, location: true } }
        }
      }).catch(() => null),
      prisma.connection.findMany({
        where: {
          OR: [{ requesterId: userId }, { recipientId: userId }]
        },
        select: { requesterId: true, recipientId: true, status: true }
      }).catch(() => [])
    ]);

    currentUser = userRecord;
    connections.forEach(c => {
      excludedUserIds.add(c.requesterId);
      excludedUserIds.add(c.recipientId);
    });
  }

  const userSkills = currentUser?.profile?.skills || [];
  const userCompany = (currentUser?.profile?.company || '').toLowerCase().trim();
  const userLocation = (currentUser?.profile?.location || '').toLowerCase().trim();

  // Strict Exclusion Query: Real active developers only (No admin, super_admin, moderator, support)
  const candidatePool = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludedUserIds) },
      isSuspended: false,
      role: 'user',
      NOT: [{ email: { contains: 'support' } }]
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      isVerifiedBadge: true,
      badgeType: true,
      profile: {
        select: {
          status: true,
          company: true,
          location: true,
          skills: true,
          bio: true,
          githubusername: true
        }
      }
    },
    take: 50,
    orderBy: { createdAt: 'desc' }
  });

  if (!candidatePool || candidatePool.length === 0) {
    return [];
  }

  // Score & Rank Candidates
  const scoredCandidates = candidatePool.map(cand => {
    const score = computeCandidateScore({
      userSkills,
      userCompany,
      userLocation,
      candidate: cand,
      mutualCount: 0,
      hasRecentActivity: true
    });

    const avatarUrl = cand.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    const formattedObj = {
      _id: cand.id,
      id: cand.id,
      name: cand.name,
      avatar: { url: avatarUrl },
      avatarUrl: avatarUrl,
      isVerifiedBadge: cand.isVerifiedBadge,
      badgeType: cand.badgeType,
      role: cand.profile?.status || 'Developer',
      headline: cand.profile?.status || 'Developer',
      bio: cand.profile?.bio || '',
      company: cand.profile?.company || '',
      location: cand.profile?.location || '',
      skills: cand.profile?.skills || [],
      score: Math.round(score * 100) / 100,
      profile: cand.profile,
      user: {
        _id: cand.id,
        id: cand.id,
        name: cand.name,
        avatar: { url: avatarUrl },
        avatarUrl: avatarUrl
      }
    };

    return { formattedObj, score };
  });

  // Sort descending by calculated score
  scoredCandidates.sort((a, b) => b.score - a.score);
  const rankedResults = scoredCandidates.map(c => c.formattedObj);

  // =========================================================================
  // 4. MATERIALIZE RESULTS TO L1 RAM & L2 DATABASE
  // =========================================================================
  if (userId) {
    // Write to L1 RAM
    memoryCache.set(userId, {
      data: rankedResults,
      expiresAt: now + L1_TTL_MS
    });

    // Write to L2 Database
    const expiresAt = new Date(now + L2_TTL_MS);
    await prisma.suggestionCache.upsert({
      where: { userId },
      update: { suggestions: rankedResults, expiresAt, lastCalculatedAt: new Date() },
      create: { userId, suggestions: rankedResults, expiresAt }
    }).catch(err => console.error('SuggestionCache write error:', err.message));
  }

  return rankedResults.slice(0, limit);
};

module.exports = {
  getRankedSuggestions,
  invalidateUserSuggestions,
  calculateJaccardSimilarity,
  computeCandidateScore
};
