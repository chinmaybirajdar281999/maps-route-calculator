/**
 * Event Logger — lightweight event-driven analytics pipeline.
 *
 * Emits domain events (route.calculated, toll.avoided, circuit.opened, etc.)
 * and persists them to Redis Streams for later consumption by analytics workers.
 *
 * Why Redis Streams instead of Kafka?
 *   - Already have Redis in stack, zero infra overhead
 *   - Supports consumer groups for horizontal scaling
 *   - Perfect for moderate throughput (our use case)
 *
 * Architecture:
 *   Producer (this module) → Redis Stream "events" → Consumer (analytics worker)
 */

const EventEmitter = require('events');

class EventLogger extends EventEmitter {
  constructor(redis) {
    super();
    this.redis = redis;
    this.streamKey = 'stream:events';
    this.buffer = [];
    this.flushInterval = null;

    // Batch-flush every 5 s to reduce Redis round-trips
    this.flushInterval = setInterval(() => this._flush(), 5000);
  }

  /**
   * Record a domain event.
   * @param {string} event  e.g. 'route.calculated', 'toll.avoided'
   * @param {object} data   arbitrary payload
   */
  emit(event, data = {}) {
    super.emit(event, data); // normal EventEmitter for in-process listeners

    this.buffer.push({
      event,
      data: JSON.stringify(data),
      worker: String(process.pid),
      ts: new Date().toISOString(),
    });

    // Auto-flush when buffer hits 50
    if (this.buffer.length >= 50) this._flush();
  }

  async _flush() {
    if (this.buffer.length === 0 || !this.redis) return;
    const batch = this.buffer.splice(0);
    try {
      const pipeline = this.redis.pipeline();
      for (const entry of batch) {
        pipeline.xadd(
          this.streamKey,
          'MAXLEN', '~', '10000', // cap stream at ~10 K entries
          '*',
          'event', entry.event,
          'data', entry.data,
          'worker', entry.worker,
          'ts', entry.ts
        );
      }
      await pipeline.exec();
    } catch (err) {
      console.error('[EventLogger] flush error:', err.message);
      // Put entries back so they're retried next flush
      this.buffer.unshift(...batch);
    }
  }

  /**
   * Get recent events from the stream (for /admin/events endpoint).
   * @param {number} count
   */
  async getRecent(count = 50) {
    if (!this.redis) return [];
    try {
      const raw = await this.redis.xrevrange(this.streamKey, '+', '-', 'COUNT', count);
      return raw.map(([id, fields]) => {
        const obj = {};
        for (let i = 0; i < fields.length; i += 2) {
          obj[fields[i]] = fields[i + 1];
        }
        obj.id = id;
        if (obj.data) {
          try { obj.data = JSON.parse(obj.data); } catch { /* keep string */ }
        }
        return obj;
      });
    } catch {
      return [];
    }
  }

  /**
   * Get aggregated analytics summary.
   */
  async getAnalytics() {
    const events = await this.getRecent(500);
    const counts = {};
    for (const e of events) {
      counts[e.event] = (counts[e.event] || 0) + 1;
    }
    return {
      totalEvents: events.length,
      eventCounts: counts,
      since: events.length > 0 ? events[events.length - 1].ts : null,
    };
  }

  destroy() {
    if (this.flushInterval) clearInterval(this.flushInterval);
    this._flush(); // final flush
  }
}

module.exports = { EventLogger };
