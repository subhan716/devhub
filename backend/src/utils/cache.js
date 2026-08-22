const memoryCache = new Map();

/**
 * Fast in-memory cache with TTL for read-heavy static & governance endpoints.
 * Provides <1ms sub-millisecond lookups.
 */
const getOrSetCache = async (key, ttlSeconds, fetchFn) => {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
    return cached.data;
  }
  const freshData = await fetchFn();
  memoryCache.set(key, { data: freshData, timestamp: Date.now() });
  return freshData;
};

const invalidateCache = (keyPattern) => {
  if (!keyPattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(keyPattern)) {
      memoryCache.delete(key);
    }
  }
};

module.exports = {
  getOrSetCache,
  invalidateCache
};
