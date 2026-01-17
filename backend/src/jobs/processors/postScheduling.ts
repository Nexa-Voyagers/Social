import { Job } from 'bull';
import logger from '../../utils/logger';
import ContentCalendar from '../../models/ContentCalendar';
import Post from '../../models/Post';
import { PostStatus } from '../../models/ContentCalendar';
import { Platform } from '../../models/Post';
import { postToFacebook, postToInstagram } from '../../services/social/metaService';
import { postToLinkedIn } from '../../services/social/linkedinService';
import { postToGMB } from '../../services/social/gmbService';
import { postToYouTube } from '../../services/social/youtubeService';

interface PostSchedulingJobData {
  contentCalendarId: string;
}

export async function processPostScheduling(job: Job<PostSchedulingJobData>) {
  const { contentCalendarId } = job.data;

  logger.info(`Processing post scheduling for ${contentCalendarId}`);

  try {
    // Fetch the content calendar entry
    const contentEntry = await ContentCalendar.findByPk(contentCalendarId, {
      include: ['client']
    });

    if (!contentEntry) {
      throw new Error(`Content calendar entry ${contentCalendarId} not found`);
    }

    // Check if content is ready
    if (contentEntry.status !== PostStatus.READY) {
      throw new Error(`Content ${contentCalendarId} is not ready for posting. Status: ${contentEntry.status}`);
    }

    if (!contentEntry.generatedContentUrl) {
      throw new Error(`No generated content URL for ${contentCalendarId}`);
    }

    // Update status to posting
    await contentEntry.update({ status: PostStatus.POSTING });

    const platformConfig = contentEntry.platforms;
    const results: any[] = [];
    const errors: any[] = [];

    // Post to Facebook
    if (platformConfig.facebook?.enabled) {
      try {
        logger.info(`Posting to Facebook for ${contentCalendarId}`);
        const result = await postToFacebook({
          clientId: contentEntry.clientId,
          contentUrl: contentEntry.generatedContentUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          hashtags: contentEntry.hashtags,
          pageId: platformConfig.facebook.pageId
        });

        // Create post record
        await Post.create({
          clientId: contentEntry.clientId,
          contentCalendarId: contentEntry.id,
          platform: Platform.FACEBOOK,
          platformPostId: result.postId,
          postUrl: result.postUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          mediaUrl: contentEntry.generatedContentUrl,
          publishedAt: new Date(),
          platformData: result
        });

        results.push({ platform: 'facebook', success: true, postId: result.postId });
      } catch (error: any) {
        logger.error(`Failed to post to Facebook:`, error);
        errors.push({ platform: 'facebook', error: error.message });
      }
    }

    // Post to Instagram
    if (platformConfig.instagram?.enabled) {
      try {
        logger.info(`Posting to Instagram for ${contentCalendarId}`);
        const result = await postToInstagram({
          clientId: contentEntry.clientId,
          contentUrl: contentEntry.generatedContentUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          hashtags: contentEntry.hashtags,
          accountId: platformConfig.instagram.accountId,
          isReel: contentEntry.contentType === 'reel',
          isStory: contentEntry.contentType === 'story'
        });

        await Post.create({
          clientId: contentEntry.clientId,
          contentCalendarId: contentEntry.id,
          platform: Platform.INSTAGRAM,
          platformPostId: result.postId,
          postUrl: result.postUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          mediaUrl: contentEntry.generatedContentUrl,
          publishedAt: new Date(),
          platformData: result
        });

        results.push({ platform: 'instagram', success: true, postId: result.postId });
      } catch (error: any) {
        logger.error(`Failed to post to Instagram:`, error);
        errors.push({ platform: 'instagram', error: error.message });
      }
    }

    // Post to LinkedIn
    if (platformConfig.linkedin?.enabled) {
      try {
        logger.info(`Posting to LinkedIn for ${contentCalendarId}`);
        const result = await postToLinkedIn({
          clientId: contentEntry.clientId,
          contentUrl: contentEntry.generatedContentUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          hashtags: contentEntry.hashtags,
          pageId: platformConfig.linkedin.pageId
        });

        await Post.create({
          clientId: contentEntry.clientId,
          contentCalendarId: contentEntry.id,
          platform: Platform.LINKEDIN,
          platformPostId: result.postId,
          postUrl: result.postUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          mediaUrl: contentEntry.generatedContentUrl,
          publishedAt: new Date(),
          platformData: result
        });

        results.push({ platform: 'linkedin', success: true, postId: result.postId });
      } catch (error: any) {
        logger.error(`Failed to post to LinkedIn:`, error);
        errors.push({ platform: 'linkedin', error: error.message });
      }
    }

    // Post to GMB
    if (platformConfig.gmb?.enabled) {
      try {
        logger.info(`Posting to GMB for ${contentCalendarId}`);
        const result = await postToGMB({
          clientId: contentEntry.clientId,
          contentUrl: contentEntry.generatedContentUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          locationId: platformConfig.gmb.locationId
        });

        await Post.create({
          clientId: contentEntry.clientId,
          contentCalendarId: contentEntry.id,
          platform: Platform.GMB,
          platformPostId: result.postId,
          postUrl: result.postUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          mediaUrl: contentEntry.generatedContentUrl,
          publishedAt: new Date(),
          platformData: result
        });

        results.push({ platform: 'gmb', success: true, postId: result.postId });
      } catch (error: any) {
        logger.error(`Failed to post to GMB:`, error);
        errors.push({ platform: 'gmb', error: error.message });
      }
    }

    // Post to YouTube (optional)
    if (platformConfig.youtube?.enabled && contentEntry.contentType !== 'image_post') {
      try {
        logger.info(`Posting to YouTube for ${contentCalendarId}`);
        const result = await postToYouTube({
          clientId: contentEntry.clientId,
          videoUrl: contentEntry.generatedContentUrl,
          title: contentEntry.title,
          description: contentEntry.finalCaption || contentEntry.caption,
          hashtags: contentEntry.hashtags,
          channelId: platformConfig.youtube.channelId,
          asShorts: platformConfig.youtube.asShorts
        });

        await Post.create({
          clientId: contentEntry.clientId,
          contentCalendarId: contentEntry.id,
          platform: Platform.YOUTUBE,
          platformPostId: result.videoId,
          postUrl: result.videoUrl,
          caption: contentEntry.finalCaption || contentEntry.caption,
          mediaUrl: contentEntry.generatedContentUrl,
          publishedAt: new Date(),
          platformData: result
        });

        results.push({ platform: 'youtube', success: true, videoId: result.videoId });
      } catch (error: any) {
        logger.error(`Failed to post to YouTube:`, error);
        errors.push({ platform: 'youtube', error: error.message });
      }
    }

    // Update status based on results
    if (results.length > 0) {
      await contentEntry.update({ status: PostStatus.POSTED });
      logger.info(`Successfully posted to ${results.length} platform(s) for ${contentCalendarId}`);
    } else {
      await contentEntry.update({
        status: PostStatus.FAILED,
        errorDetails: {
          message: 'Failed to post to any platform',
          errors,
          timestamp: new Date()
        }
      });
      throw new Error('Failed to post to any platform');
    }

    return {
      success: true,
      contentCalendarId,
      results,
      errors
    };
  } catch (error: any) {
    logger.error(`Post scheduling failed for ${contentCalendarId}:`, error);

    // Update status to failed
    const contentEntry = await ContentCalendar.findByPk(contentCalendarId);
    if (contentEntry) {
      const retryCount = contentEntry.retryCount + 1;
      await contentEntry.update({
        status: PostStatus.FAILED,
        retryCount,
        errorDetails: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date()
        }
      });
    }

    throw error;
  }
}
