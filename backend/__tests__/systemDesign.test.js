describe('Circuit Breaker', () => {
  let circuitBreaker;

  beforeAll(() => {
    circuitBreaker = require('../services/circuitBreaker');
  });

  test('exports fireMapboxRequest function', () => {
    expect(typeof circuitBreaker.fireMapboxRequest).toBe('function');
  });

  test('exports getBreakerStats function', () => {
    expect(typeof circuitBreaker.getBreakerStats).toBe('function');
  });

  test('getBreakerStats returns correct shape', () => {
    const stats = circuitBreaker.getBreakerStats();
    expect(stats).toHaveProperty('state');
    expect(stats).toHaveProperty('successes');
    expect(stats).toHaveProperty('failures');
    expect(stats).toHaveProperty('rejects');
    expect(stats).toHaveProperty('timeouts');
    expect(['CLOSED', 'OPEN', 'HALF-OPEN']).toContain(stats.state);
  });

  test('breaker starts in CLOSED state', () => {
    const stats = circuitBreaker.getBreakerStats();
    expect(stats.state).toBe('CLOSED');
  });
});

describe('Request Deduplication', () => {
  const dedup = require('../services/requestDedup');

  test('exports acquireLock function', () => {
    expect(typeof dedup.acquireLock).toBe('function');
  });

  test('exports releaseLock function', () => {
    expect(typeof dedup.releaseLock).toBe('function');
  });

  test('exports waitForResult function', () => {
    expect(typeof dedup.waitForResult).toBe('function');
  });
});

describe('Event Logger', () => {
  const { EventLogger } = require('../services/eventLogger');

  test('EventLogger is a constructor', () => {
    expect(typeof EventLogger).toBe('function');
  });

  test('creates instance without redis (null-safe)', () => {
    const logger = new EventLogger(null);
    expect(logger).toBeDefined();
    expect(logger.buffer).toEqual([]);
    // emit should not throw even without redis
    expect(() => logger.emit('test.event', { foo: 'bar' })).not.toThrow();
    expect(logger.buffer.length).toBe(1);
    expect(logger.buffer[0].event).toBe('test.event');
    logger.destroy();
  });

  test('getRecent returns empty array without redis', async () => {
    const logger = new EventLogger(null);
    const events = await logger.getRecent();
    expect(events).toEqual([]);
    logger.destroy();
  });

  test('getAnalytics returns correct shape', async () => {
    const logger = new EventLogger(null);
    const analytics = await logger.getAnalytics();
    expect(analytics).toHaveProperty('totalEvents', 0);
    expect(analytics).toHaveProperty('eventCounts');
    logger.destroy();
  });
});

describe('Job Queue', () => {
  const jobQueue = require('../services/jobQueue');

  test('exports initQueue function', () => {
    expect(typeof jobQueue.initQueue).toBe('function');
  });

  test('exports enqueueRouteJob function', () => {
    expect(typeof jobQueue.enqueueRouteJob).toBe('function');
  });

  test('exports getJobStatus function', () => {
    expect(typeof jobQueue.getJobStatus).toBe('function');
  });

  test('exports getQueueMetrics function', () => {
    expect(typeof jobQueue.getQueueMetrics).toBe('function');
  });

  test('enqueueRouteJob throws if queue not initialised', async () => {
    await expect(jobQueue.enqueueRouteJob({})).rejects.toThrow('Queue not initialised');
  });

  test('getQueueMetrics returns null if queue not initialised', async () => {
    const metrics = await jobQueue.getQueueMetrics();
    expect(metrics).toBeNull();
  });
});
