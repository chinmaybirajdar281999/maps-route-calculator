/**
 * Circuit Breaker — wraps external API calls (Mapbox) to prevent cascading failures.
 *
 * States:  CLOSED (normal) → OPEN (failing, reject fast) → HALF-OPEN (probe)
 *
 * When Mapbox is down the circuit opens after `errorThresholdPercentage` failures,
 * immediately returning a 503 instead of queuing up hundreds of slow/hanging requests
 * that would exhaust connection pools and memory.
 */
const CircuitBreaker = require('opossum');
const axios = require('axios');

const BREAKER_OPTIONS = {
  timeout: 12000,              // 12 s — if Mapbox doesn't respond, count as failure
  errorThresholdPercentage: 50, // open circuit when 50 % of requests fail
  resetTimeout: 30000,          // try again after 30 s (half-open)
  rollingCountTimeout: 60000,   // sliding window for stats
  rollingCountBuckets: 6,       // 10 s per bucket
  volumeThreshold: 5,           // need at least 5 requests before tripping
};

// The actual HTTP call function that the breaker wraps
async function mapboxRequest(url, params) {
  const response = await axios.get(url, { params, timeout: 10000 });
  return response.data;
}

// Create the breaker instance
const breaker = new CircuitBreaker(mapboxRequest, BREAKER_OPTIONS);

// ─── Event logging (wires into eventLogger if available) ───
breaker.on('open', () =>
  console.warn('[CircuitBreaker] OPEN — Mapbox calls will be rejected')
);
breaker.on('halfOpen', () =>
  console.info('[CircuitBreaker] HALF-OPEN — probing Mapbox')
);
breaker.on('close', () =>
  console.info('[CircuitBreaker] CLOSED — Mapbox recovered')
);
breaker.on('fallback', () =>
  console.info('[CircuitBreaker] Fallback served')
);

/**
 * Fire a request through the circuit breaker.
 * @returns {Promise<object>} Mapbox API response data
 */
async function fireMapboxRequest(url, params) {
  return breaker.fire(url, params);
}

/**
 * Get breaker health stats (for /health endpoint).
 */
function getBreakerStats() {
  const stats = breaker.stats;
  return {
    state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF-OPEN' : 'CLOSED',
    successes: stats.successes,
    failures: stats.failures,
    rejects: stats.rejects,
    timeouts: stats.timeouts,
    fallbacks: stats.fallbacks,
  };
}

module.exports = { fireMapboxRequest, getBreakerStats, breaker };
