import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';
import { uploadToS3 } from '../../utils/s3Upload';
import Client from '../../models/Client';
import Asset, { AssetType } from '../../models/Asset';
import { BrandingConfig } from '../../models/Client';
import { VisualInstructions } from '../../models/ContentCalendar';
import { generateVideoWithFFmpeg } from './ffmpegGenerator';

interface VideoGenerationParams {
  clientId: string;
  caption: string;
  hashtags: string[];
  visualInstructions: VisualInstructions;
  branding: BrandingConfig;
  duration: number; // in seconds
}

interface VideoGenerationResult {
  url: string;
  caption?: string;
  thumbnailUrl?: string;
}

export async function generateVideoReel(params: VideoGenerationParams): Promise<VideoGenerationResult> {
  const { clientId, caption, hashtags, visualInstructions, branding, duration } = params;

  logger.info(`Generating video reel for client ${clientId} (${duration}s)`);

  try {
    // Step 1: Get client and assets
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found`);
    }

    // Get client assets
    const logo = await Asset.findOne({
      where: { clientId, isPrimary: true, type: AssetType.LOGO }
    });

    const images = await Asset.findAll({
      where: { clientId, type: AssetType.IMAGE },
      limit: 5
    });

    const videos = await Asset.findAll({
      where: { clientId, type: AssetType.VIDEO },
      limit: 2
    });

    // Step 2: Prepare content for video
    const videoAssets = {
      images: images.map(img => img.url),
      videos: videos.map(vid => vid.url),
      logo: logo?.url,
      caption,
      branding
    };

    // Step 3: Generate video using FFmpeg (Remotion can be added later)
    const videoPath = await generateVideoWithFFmpeg({
      assets: videoAssets,
      duration,
      visualInstructions,
      branding,
      outputFormat: 'mp4'
    });

    // Step 4: Generate thumbnail
    const thumbnailPath = await generateThumbnail(videoPath);

    // Step 5: Upload to S3
    const videoUrl = await uploadToS3(
      videoPath,
      `videos/${clientId}/${uuidv4()}.mp4`
    );

    const thumbnailUrl = await uploadToS3(
      thumbnailPath,
      `thumbnails/${clientId}/${uuidv4()}.jpg`
    );

    // Cleanup temp files
    await cleanupTempFiles([videoPath, thumbnailPath]);

    // Step 6: Refine caption (same as image posts)
    const hashtagString = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
    const finalCaption = `${caption}\n\n${hashtagString}`;

    logger.info(`Video reel generated successfully for client ${clientId}`);

    return {
      url: videoUrl,
      thumbnailUrl,
      caption: finalCaption
    };
  } catch (error: any) {
    logger.error(`Failed to generate video reel:`, error);
    throw error;
  }
}

async function generateThumbnail(videoPath: string): Promise<string> {
  const sharp = require('sharp');
  const ffmpeg = require('fluent-ffmpeg');
  const thumbnailPath = path.join('/tmp', `thumbnail-${uuidv4()}.jpg`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: '/tmp',
        filename: path.basename(thumbnailPath),
        size: '1080x1920'
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', reject);
  });
}

async function cleanupTempFiles(files: string[]): Promise<void> {
  for (const file of files) {
    try {
      if (file && file.startsWith('/tmp/')) {
        await fs.unlink(file);
      }
    } catch (error) {
      logger.warn(`Failed to cleanup temp file ${file}:`, error);
    }
  }
}

// Alternative: Remotion-based video generation (more advanced)
// This would be implemented for more complex, programmatic video creation
export async function generateVideoWithRemotion(params: any): Promise<string> {
  // TODO: Implement Remotion-based video generation
  // This would allow for:
  // - React-based video templates
  // - Complex animations and transitions
  // - Dynamic text overlays
  // - Brand-specific intro/outro sequences
  logger.info('Remotion video generation not yet implemented, using FFmpeg fallback');
  throw new Error('Not implemented');
}
