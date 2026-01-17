import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import logger from '../../utils/logger';
import { BrandingConfig } from '../../models/Client';
import { VisualInstructions } from '../../models/ContentCalendar';

interface FFmpegGenerationParams {
  assets: {
    images: string[];
    videos: string[];
    logo?: string;
    caption: string;
    branding: BrandingConfig;
  };
  duration: number;
  visualInstructions: VisualInstructions;
  branding: BrandingConfig;
  outputFormat: 'mp4' | 'mov';
}

export async function generateVideoWithFFmpeg(params: FFmpegGenerationParams): Promise<string> {
  const { assets, duration, visualInstructions, branding, outputFormat } = params;
  const outputPath = path.join('/tmp', `video-${uuidv4()}.${outputFormat}`);

  logger.info('Generating video with FFmpeg');

  try {
    // Download all assets locally
    const localImages = await Promise.all(
      assets.images.slice(0, 5).map(url => downloadAsset(url))
    );

    const localVideos = await Promise.all(
      assets.videos.slice(0, 2).map(url => downloadAsset(url))
    );

    // If we have images but no videos, create a slideshow
    if (localImages.length > 0 && localVideos.length === 0) {
      return await createImageSlideshow({
        images: localImages,
        duration,
        outputPath,
        caption: assets.caption,
        logo: assets.logo,
        branding
      });
    }

    // If we have videos, concatenate and trim to duration
    if (localVideos.length > 0) {
      return await concatenateVideos({
        videos: localVideos,
        images: localImages,
        duration,
        outputPath,
        caption: assets.caption,
        logo: assets.logo,
        branding
      });
    }

    throw new Error('No valid assets found for video generation');
  } catch (error: any) {
    logger.error('Failed to generate video with FFmpeg:', error);
    throw error;
  }
}

async function downloadAsset(url: string): Promise<string> {
  try {
    const ext = path.extname(url).split('?')[0] || '.jpg';
    const localPath = path.join('/tmp', `asset-${uuidv4()}${ext}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(localPath, response.data);
    return localPath;
  } catch (error) {
    logger.warn(`Failed to download asset ${url}:`, error);
    throw error;
  }
}

async function createImageSlideshow(params: {
  images: string[];
  duration: number;
  outputPath: string;
  caption: string;
  logo?: string;
  branding: BrandingConfig;
}): Promise<string> {
  const { images, duration, outputPath, caption, logo, branding } = params;

  return new Promise((resolve, reject) => {
    const imageDuration = Math.max(2, duration / images.length); // At least 2 seconds per image

    // Create filter complex for slideshow with transitions
    const inputs = images.map((img, i) => `[${i}:v]`).join('');

    let command = ffmpeg();

    // Add all images as inputs
    images.forEach(img => {
      command = command.input(img);
    });

    // Build filter complex for smooth transitions
    const filterParts: string[] = [];

    // Scale and pad all images to 1080x1920 (vertical video format for reels)
    images.forEach((img, i) => {
      filterParts.push(
        `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,` +
        `pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${branding.primaryColor || 'black'}[v${i}]`
      );
    });

    // Concatenate all scaled images
    const concatInput = images.map((_, i) => `[v${i}]`).join('');
    filterParts.push(
      `${concatInput}concat=n=${images.length}:v=1:a=0,` +
      `format=yuv420p[outv]`
    );

    command
      .complexFilter(filterParts.join(';'))
      .map('[outv]')
      .outputOptions([
        '-r 30', // 30 fps
        '-t ' + duration, // Total duration
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
        '-pix_fmt yuv420p'
      ])
      .output(outputPath)
      .on('end', () => {
        logger.info(`Slideshow created: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error('FFmpeg slideshow error:', err);
        reject(err);
      })
      .run();
  });
}

async function concatenateVideos(params: {
  videos: string[];
  images: string[];
  duration: number;
  outputPath: string;
  caption: string;
  logo?: string;
  branding: BrandingConfig;
}): Promise<string> {
  const { videos, images, duration, outputPath } = params;

  return new Promise((resolve, reject) => {
    // Create a concat file for ffmpeg
    const concatListPath = path.join('/tmp', `concat-${uuidv4()}.txt`);
    const concatContent = videos.map(v => `file '${v}'`).join('\n');

    fs.writeFile(concatListPath, concatContent)
      .then(() => {
        ffmpeg()
          .input(concatListPath)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions([
            '-t ' + duration, // Trim to specified duration
            '-c:v libx264',
            '-preset medium',
            '-crf 23',
            '-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
            '-c:a aac',
            '-b:a 128k',
            '-r 30',
            '-pix_fmt yuv420p'
          ])
          .output(outputPath)
          .on('end', () => {
            logger.info(`Video concatenated: ${outputPath}`);
            fs.unlink(concatListPath).catch(() => {});
            resolve(outputPath);
          })
          .on('error', (err) => {
            logger.error('FFmpeg concatenation error:', err);
            reject(err);
          })
          .run();
      })
      .catch(reject);
  });
}
