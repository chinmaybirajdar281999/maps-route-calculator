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
const NUM_WORKERS = process.env.WEB_CONCURRENCY || os.cpus().length;

/* ─── Cluster: fork one worker per CPU core ─── */
if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
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

  // Redis client for caching
  const redisOpts = {
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  };
  const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, redisOpts)
    : new Redis({ host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379, ...redisOpts });

  // ─── Event Logger (Redis Streams) ───
  const eventLogger = new EventLogger(redis);
  app.set('eventLogger', eventLogger);

  // ─── Job Queue (BullMQ) ───
  const redisConnection = process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379', 10) };
  initQueue(redisConnection, async (jobData) => {
    // Worker callback — uses the same processRouteCalculation logic
    return processRouteCalculation(jobData, redis, eventLogger);
  });

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
    const redisOk = redis.status === 'ready';
    const queueMetrics = await getQueueMetrics().catch(() => null);
    const breakerStats = getBreakerStats();

    res.status(redisOk ? 200 : 503).json({
      status: redisOk ? 'ok' : 'degraded',
      worker: process.pid,
      uptime: process.uptime(),
      redis: redis.status,
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
    redis.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}