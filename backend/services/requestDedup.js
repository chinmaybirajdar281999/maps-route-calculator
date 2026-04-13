/**
 * Request Deduplication — coalesces identical in-flight requests.
 *
 * Problem: If 50 users search "Delhi → Jaipur" at the same second, without dedup
 * we'd make 50 Mapbox API calls. With dedup we make 1 and share the result.
 *
 * Implementation: Redis SETNX with short TTL as a distributed lock.
 * First request acquires the lock, computes result, writes to cache.
 * Concurrent duplicates poll until the result appears in cache.
 */

const MAX_WAIT_MS = 15000;   // max time to wait for the first request to finish
const POLL_INTERVAL_MS = 200; // check cache every 200 ms
const LOCK_TTL_S = 20;        // lock auto-expires after 20 s (safety net)

/**
 * Try to acquire a dedup lock for this cache key.
 * @returns {boolean} true if this request should do the work, false if another is already doing it.
 */
async function acquireLock(redis, cacheKey) {
  const lockKey = `lock:${cacheKey}`;
  // SET NX EX — atomic "set if not exists" with expiry
  const result = await redis.set(lockKey, process.pid.toString(), 'EX', LOCK_TTL_S, 'NX');
  return result === 'OK';
}

/**
 * Release the dedup lock after the work is done.
 */
async function releaseLock(redis, cacheKey) {
  const lockKey = `lock:${cacheKey}`;
  await redis.del(lockKey);
}

/**
 * Wait for the result to appear in cache (another request is computing it).
 * @returns {object|null} cached result, or null if timed out.
 */
async function waitForResult(redis, cacheKey) {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return null; // timed out — caller should compute itself
}

module.exports = { acquireLock, releaseLock, waitForResult };
