/**
 * Job Queue — offloads heavy route computations to background workers.
 *
 * Flow:
 *   1. POST /api/route/calculate-async  →  enqueue job  →  return { jobId }
 *   2. GET  /api/route/job/:id          →  poll status  →  return result when done
 *
 * Uses BullMQ (Redis-backed) which provides:
 *   - Automatic retries with exponential backoff
 *   - Priority queues
 *   - Job deduplication
 *   - Delayed/scheduled jobs
 *   - Dashboard-ready (Bull Board)
 *
 * In production the worker can run in a separate process for isolation.
 */

const { Queue, Worker } = require('bullmq');

const QUEUE_NAME = 'route-calculations';

let queue = null;
let worker = null;

/**
 * Initialise the queue and worker.
 * @param {object} redisConnection  { host, port }
 * @param {function} processFn      the route calculation logic
 */
function initQueue(redisConnection, processFn) {
  queue = new Queue(QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { count: 200 },   // keep last 200 completed jobs
      removeOnFail: { count: 100 },
    },
  });

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      return processFn(job.data);
    },
    {
      connection: redisConnection,
      concurrency: 2,     // keep low for memory-constrained environments
      limiter: {
        max: 20,           // max 20 jobs per duration window
        duration: 60000,   // 1 minute
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Queue] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job?.id} failed:`, err.message);
  });

  return { queue, worker };
}

/**
 * Add a route calculation job to the queue.
 * @returns {{ jobId: string }}
 */
async function enqueueRouteJob(data, priority = 0) {
  if (!queue) throw new Error('Queue not initialised');
  const job = await queue.add('calculate-route', data, { priority });
  return { jobId: job.id };
}

/**
 * Get the status and result of a job.
 */
async function getJobStatus(jobId) {
  if (!queue) throw new Error('Queue not initialised');
  const job = await queue.getJob(jobId);
  if (!job) return { status: 'not_found' };

  const state = await job.getState();
  const result = state === 'completed' ? job.returnvalue : null;
  const progress = job.progress || 0;

  return { jobId: job.id, status: state, progress, result };
}

/**
 * Get queue health metrics.
 */
async function getQueueMetrics() {
  if (!queue) return null;
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  return { waiting, active, completed, failed, delayed };
}

function getQueue() { return queue; }
function getWorker() { return worker; }

module.exports = {
  initQueue,
  enqueueRouteJob,
  getJobStatus,
  getQueueMetrics,
  getQueue,
  getWorker,
};
