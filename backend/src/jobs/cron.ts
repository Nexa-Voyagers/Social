import cron from 'node-cron';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import ContentCalendar from '../models/ContentCalendar';
import { PostStatus, ContentType } from '../models/ContentCalendar';
import { addContentGenerationJob, addPostSchedulingJob } from './index';

export function setupCronJobs() {
  // Check for scheduled posts every 5 minutes
  const scheduleCheckInterval = process.env.CRON_SCHEDULE_POSTS || '*/5 * * * *';

  cron.schedule(scheduleCheckInterval, async () => {
    try {
      logger.info('Running scheduled post check...');

      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      // Find all scheduled posts that need content generation
      const scheduledPosts = await ContentCalendar.findAll({
        where: {
          status: PostStatus.SCHEDULED,
          scheduledAt: {
            [Op.lte]: fiveMinutesFromNow
          }
        }
      });

      logger.info(`Found ${scheduledPosts.length} posts to prepare for posting`);

      for (const post of scheduledPosts) {
        // If content is not generated yet, trigger generation
        if (!post.generatedContentUrl) {
          await addContentGenerationJob(post.id);
          logger.info(`Queued content generation for post ${post.id}`);
        } else if (post.status === PostStatus.READY) {
          // Content is ready, schedule for posting
          await addPostSchedulingJob(post.id, post.scheduledAt);
          logger.info(`Queued posting for post ${post.id} at ${post.scheduledAt}`);
        }
      }
    } catch (error) {
      logger.error('Error in scheduled post check:', error);
    }
  });

  logger.info(`Scheduled post check cron job set up: ${scheduleCheckInterval}`);

  // Fetch analytics every 6 hours (if enabled)
  if (process.env.ENABLE_ANALYTICS === 'true') {
    const analyticsFetchInterval = process.env.CRON_FETCH_ANALYTICS || '0 */6 * * *';

    cron.schedule(analyticsFetchInterval, async () => {
      try {
        logger.info('Running analytics fetch...');
        // This will be implemented when we build the analytics service
        // For now, we'll just log
        logger.info('Analytics fetch scheduled');
      } catch (error) {
        logger.error('Error in analytics fetch:', error);
      }
    });

    logger.info(`Analytics fetch cron job set up: ${analyticsFetchInterval}`);
  }

  // Cleanup old files daily at 2 AM
  const cleanupInterval = process.env.CRON_CLEANUP_OLD_FILES || '0 2 * * *';

  cron.schedule(cleanupInterval, async () => {
    try {
      logger.info('Running cleanup of old files...');
      // This will clean up old generated content, temporary files, etc.
      // To be implemented
      logger.info('Cleanup scheduled');
    } catch (error) {
      logger.error('Error in cleanup:', error);
    }
  });

  logger.info(`Cleanup cron job set up: ${cleanupInterval}`);
}
