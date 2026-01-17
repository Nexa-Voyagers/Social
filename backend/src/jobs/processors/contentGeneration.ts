import { Job } from 'bull';
import logger from '../../utils/logger';
import ContentCalendar from '../../models/ContentCalendar';
import { PostStatus, ContentType } from '../../models/ContentCalendar';
import { generateImagePost } from '../../services/ai/imageGenerator';
import { generateVideoReel } from '../../services/video/reelGenerator';

interface ContentGenerationJobData {
  contentCalendarId: string;
}

export async function processContentGeneration(job: Job<ContentGenerationJobData>) {
  const { contentCalendarId } = job.data;

  logger.info(`Processing content generation for ${contentCalendarId}`);

  try {
    // Fetch the content calendar entry
    const contentEntry = await ContentCalendar.findByPk(contentCalendarId, {
      include: ['client']
    });

    if (!contentEntry) {
      throw new Error(`Content calendar entry ${contentCalendarId} not found`);
    }

    // Update status to generating
    await contentEntry.update({
      status: PostStatus.GENERATING,
      generationStartedAt: new Date()
    });

    let generatedContentUrl: string;
    let finalCaption: string = contentEntry.caption;

    // Generate content based on type
    switch (contentEntry.contentType) {
      case ContentType.IMAGE_POST:
        logger.info(`Generating image post for ${contentCalendarId}`);
        const imageResult = await generateImagePost({
          clientId: contentEntry.clientId,
          caption: contentEntry.caption,
          hashtags: contentEntry.hashtags,
          visualInstructions: contentEntry.visualInstructions,
          branding: contentEntry.client.branding
        });
        generatedContentUrl = imageResult.url;
        finalCaption = imageResult.caption || contentEntry.caption;
        break;

      case ContentType.REEL:
      case ContentType.VIDEO_POST:
        logger.info(`Generating video/reel for ${contentCalendarId}`);
        const videoResult = await generateVideoReel({
          clientId: contentEntry.clientId,
          caption: contentEntry.caption,
          hashtags: contentEntry.hashtags,
          visualInstructions: contentEntry.visualInstructions,
          branding: contentEntry.client.branding,
          duration: contentEntry.contentType === ContentType.REEL ? 30 : 60
        });
        generatedContentUrl = videoResult.url;
        finalCaption = videoResult.caption || contentEntry.caption;
        break;

      case ContentType.STORY:
        logger.info(`Generating story for ${contentCalendarId}`);
        // Stories are typically 15 seconds
        const storyResult = await generateImagePost({
          clientId: contentEntry.clientId,
          caption: contentEntry.caption,
          hashtags: contentEntry.hashtags,
          visualInstructions: {
            ...contentEntry.visualInstructions,
            dimensions: { width: 1080, height: 1920 } // Story format
          },
          branding: contentEntry.client.branding
        });
        generatedContentUrl = storyResult.url;
        finalCaption = storyResult.caption || contentEntry.caption;
        break;

      case ContentType.CAROUSEL:
        logger.info(`Generating carousel for ${contentCalendarId}`);
        // For now, treat as image post - can be expanded later
        const carouselResult = await generateImagePost({
          clientId: contentEntry.clientId,
          caption: contentEntry.caption,
          hashtags: contentEntry.hashtags,
          visualInstructions: contentEntry.visualInstructions,
          branding: contentEntry.client.branding
        });
        generatedContentUrl = carouselResult.url;
        finalCaption = carouselResult.caption || contentEntry.caption;
        break;

      default:
        throw new Error(`Unsupported content type: ${contentEntry.contentType}`);
    }

    // Update content entry with generated content
    await contentEntry.update({
      status: PostStatus.READY,
      generatedContentUrl,
      finalCaption,
      generationCompletedAt: new Date()
    });

    logger.info(`Content generation completed for ${contentCalendarId}`);

    return {
      success: true,
      contentCalendarId,
      generatedContentUrl,
      finalCaption
    };
  } catch (error: any) {
    logger.error(`Content generation failed for ${contentCalendarId}:`, error);

    // Update status to failed
    const contentEntry = await ContentCalendar.findByPk(contentCalendarId);
    if (contentEntry) {
      await contentEntry.update({
        status: PostStatus.FAILED,
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
