/**
 * YouTube API Service
 * Handles uploading videos to YouTube
 */

import { google, youtube_v3 } from 'googleapis';
import axios from 'axios';
import fs from 'fs';
import logger from '../../utils/logger';
import PlatformAccount from '../../models/PlatformAccount';
import { Platform } from '../../models/Post';

interface YouTubePostParams {
  clientId: string;
  videoUrl: string;
  title: string;
  description: string;
  hashtags: string[];
  channelId?: string;
  asShorts?: boolean; // YouTube Shorts
}

interface YouTubePostResult {
  videoId: string;
  videoUrl: string;
  platformSpecificData?: any;
}

/**
 * Upload video to YouTube
 */
export async function postToYouTube(params: YouTubePostParams): Promise<YouTubePostResult> {
  const { clientId, videoUrl, title, description, hashtags, channelId, asShorts = false } = params;

  logger.info(`Uploading to YouTube for client ${clientId} (Shorts: ${asShorts})`);

  try {
    // Get YouTube account credentials
    const account = await PlatformAccount.findOne({
      where: { clientId, platform: Platform.YOUTUBE, isActive: true }
    });

    if (!account) {
      throw new Error(`No active YouTube account found for client ${clientId}`);
    }

    const accessToken = account.tokens.accessToken;

    // Initialize Google Auth
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
      version: 'v3',
      auth
    });

    // Download video temporarily
    const tempVideoPath = `/tmp/youtube-upload-${Date.now()}.mp4`;
    const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(tempVideoPath);

    await new Promise((resolve, reject) => {
      videoResponse.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Prepare video metadata
    const hashtagString = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
    const fullDescription = `${description}\n\n${hashtagString}`;

    const videoMetadata: youtube_v3.Schema$Video = {
      snippet: {
        title: asShorts ? `#Shorts ${title}` : title,
        description: fullDescription,
        categoryId: '22' // Category: People & Blogs (adjust as needed)
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    };

    // Upload video
    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: {
        body: fs.createReadStream(tempVideoPath)
      }
    });

    const videoId = uploadResponse.data.id;

    if (!videoId) {
      throw new Error('No video ID returned from YouTube');
    }

    // Clean up temp file
    fs.unlinkSync(tempVideoPath);

    const videoUrlResult = asShorts
      ? `https://www.youtube.com/shorts/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`;

    logger.info(`Successfully uploaded to YouTube: ${videoId}`);

    return {
      videoId,
      videoUrl: videoUrlResult,
      platformSpecificData: {
        channelId: channelId || account.accountData.channelId,
        isShorts: asShorts,
        uploadedAt: new Date()
      }
    };
  } catch (error: any) {
    logger.error('Failed to upload to YouTube:', error.response?.data || error.message);
    throw new Error(`YouTube upload failed: ${error.message}`);
  }
}

export default {
  postToYouTube
};
