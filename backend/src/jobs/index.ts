import Queue from 'bull';
import logger from '../utils/logger';
import { processContentGeneration } from './processors/contentGeneration';
import { processPostScheduling } from './processors/postScheduling';
import { processAnalyticsFetch } from './processors/analyticsFetch';

const redisUrl = process.env.QUEUE_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';

// Define queues
export const contentGenerationQueue = new Queue('content-generation', redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

export const postSchedulingQueue = new Queue('post-scheduling', redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

export const analyticsFetchQueue = new Queue('analytics-fetch', redisUrl, {
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 10000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Initialize queues and processors
export async function initQueues(): Promise<void> {
  try {
    // Content Generation Queue
    contentGenerationQueue.process(
      parseInt(process.env.MAX_CONCURRENT_JOBS || '5'),
      processContentGeneration
    );

    contentGenerationQueue.on('completed', (job, result) => {
      logger.info(`Content generation job ${job.id} completed`, { result });
    });

    contentGenerationQueue.on('failed', (job, err) => {
      logger.error(`Content generation job ${job.id} failed`, {
        error: err.message,
        stack: err.stack
      });
    });

    // Post Scheduling Queue
    postSchedulingQueue.process(
      parseInt(process.env.MAX_CONCURRENT_JOBS || '5'),
      processPostScheduling
    );

    postSchedulingQueue.on('completed', (job, result) => {
      logger.info(`Post scheduling job ${job.id} completed`, { result });
    });

    postSchedulingQueue.on('failed', (job, err) => {
      logger.error(`Post scheduling job ${job.id} failed`, {
        error: err.message,
        stack: err.stack
      });
    });

    // Analytics Fetch Queue
    analyticsFetchQueue.process(2, processAnalyticsFetch);

    analyticsFetchQueue.on('completed', (job, result) => {
      logger.info(`Analytics fetch job ${job.id} completed`, { result });
    });

    analyticsFetchQueue.on('failed', (job, err) => {
      logger.error(`Analytics fetch job ${job.id} failed`, {
        error: err.message,
        stack: err.stack
      });
    });

    logger.info('Job queues initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize job queues:', error);
    throw error;
  }
}

// Helper functions to add jobs
export async function addContentGenerationJob(contentCalendarId: string, priority: number = 0) {
  return contentGenerationQueue.add(
    { contentCalendarId },
    { priority, delay: 0 }
  );
}

export async function addPostSchedulingJob(contentCalendarId: string, scheduledAt: Date) {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  return postSchedulingQueue.add(
    { contentCalendarId },
    { delay }
  );
}

export async function addAnalyticsFetchJob(postId: string) {
  return analyticsFetchQueue.add({ postId });
}

export default {
  contentGenerationQueue,
  postSchedulingQueue,
  analyticsFetchQueue,
  initQueues,
  addContentGenerationJob,
  addPostSchedulingJob,
  addAnalyticsFetchJob
};
