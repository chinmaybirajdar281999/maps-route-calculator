async function getCachedRoute(redis, key) {
  if (!redis) return null;
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
}

async function cacheRoute(redis, key, data, ttl = 3600) {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
    // Don't throw - caching failure shouldn't break the app
  }
}

module.exports = { getCachedRoute, cacheRoute };