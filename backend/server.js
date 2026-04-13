const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const Redis = require('ioredis');
const routeRouter = require('./routes/route');
const { errorHandler } = require('./middleware/errorHandler');
const { EventLogger } = require('./services/eventLogger');
const { initQueue, getQueueMetrics } = require('./services/jobQueue');
const { getBreakerStats } = require('./services/circuitBreaker');
const { processRouteCalculation } = require('./controllers/routeController');

const PORT = process.env.PORT || 3001;
const NUM_WORKERS = parseInt(process.env.WEB_CONCURRENCY || '0', 10) || os.cpus().length;
const USE_CLUSTER = process.env.NODE_ENV === 'production' && NUM_WORKERS > 1 && !process.env.RAILWAY_ENVIRONMENT;

/* ─── Cluster: fork workers (disabled on Railway / single-CPU hosts) ─── */
if (cluster.isPrimary && USE_CLUSTER) {
  console.log(`Primary ${process.pid} forking ${NUM_WORKERS} workers`);
  for (let i = 0; i < NUM_WORKERS; i++) cluster.fork();

  cluster.on('exit', (worker, code) => {
    console.warn(`Worker ${worker.process.pid} exited (code ${code}), respawning`);
    cluster.fork();
  });
} else {
  startServer();
}

function startServer() {
  const app = express();

  // Redis client for caching (optional — app works without it)
  let redis = null;
  const redisUrl = process.env.REDIS_URL;
  try {
    const redisOpts = {
      retryStrategy: (times) => times > 5 ? null : Math.min(times * 200, 3000),
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
    };
    if (redisUrl) {
      // Railway Redis may use rediss:// (TLS)
      if (redisUrl.startsWith('rediss://')) redisOpts.tls = { rejectUnauthorized: false };
      redis = new Redis(redisUrl, redisOpts);
    } else if (process.env.REDIS_HOST) {
      redis = new Redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT || 6379, ...redisOpts });
    } else {
      redis = new Redis({ host: 'localhost', port: 6379, ...redisOpts });
    }
    redis.connect().catch(err => console.warn('Redis not available:', err.message));
    redis.on('error', (err) => console.warn('Redis error:', err.message));
  } catch (err) {
    console.warn('Redis init failed, running without cache:', err.message);
  }

  // ─── Event Logger (Redis Streams) ───
  const eventLogger = new EventLogger(redis);
  app.set('eventLogger', eventLogger);

  // ─── Job Queue (BullMQ) — skip on low-memory or no-Redis environments ───
  if (!process.env.DISABLE_QUEUE && redisUrl) {
    try {
      const redisConnection = redisUrl.startsWith('rediss://')
        ? { url: redisUrl, tls: { rejectUnauthorized: false } }
        : { url: redisUrl };
      initQueue(redisConnection, async (jobData) => {
        return processRouteCalculation(jobData, redis, eventLogger);
      });
    } catch (err) {
      console.warn('Job queue init failed:', err.message);
    }
  }

  // Security middleware
  app.use(helmet());
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(s => s.trim());
  app.use(cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true
  }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api', limiter);

  // Make redis available to routes
  app.set('redis', redis);

  // Routes
  app.use('/api/route', routeRouter);

  // ─── Health check (includes circuit breaker + queue metrics) ───
  app.get('/health', async (req, res) => {
    const redisOk = redis && redis.status === 'ready';
    const queueMetrics = await getQueueMetrics().catch(() => null);
    const breakerStats = getBreakerStats();

    res.status(200).json({
      status: redisOk ? 'ok' : 'degraded',
      worker: process.pid,
      uptime: process.uptime(),
      redis: redis ? redis.status : 'disabled',
      circuitBreaker: breakerStats,
      queue: queueMetrics,
      timestamp: new Date().toISOString(),
    });
  });

  // ─── Admin: recent events ───
  app.get('/admin/events', async (req, res) => {
    const count = Math.min(parseInt(req.query.count) || 50, 200);
    const events = await eventLogger.getRecent(count);
    res.json({ count: events.length, events });
  });

  // ─── Admin: analytics summary ───
  app.get('/admin/analytics', async (req, res) => {
    const analytics = await eventLogger.getAnalytics();
    res.json(analytics);
  });

  // Error handling
  app.use(errorHandler);

  // Graceful shutdown
  const shutdown = () => {
    console.log(`Worker ${process.pid}: shutting down gracefully`);
    eventLogger.destroy();
    if (redis) redis.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}