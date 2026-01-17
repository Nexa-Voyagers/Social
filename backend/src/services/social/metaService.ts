/**
 * Meta (Facebook + Instagram) API Service
 * Handles posting to Facebook and Instagram via Meta Graph API
 */

import axios from 'axios';
import logger from '../../utils/logger';
import PlatformAccount from '../../models/PlatformAccount';
import { Platform } from '../../models/Post';

const META_API_VERSION = process.env.META_API_VERSION || 'v19.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

interface MetaPostParams {
  clientId: string;
  contentUrl: string;
  caption: string;
  hashtags: string[];
  pageId?: string;
  accountId?: string;
  isReel?: boolean;
  isStory?: boolean;
}

interface MetaPostResult {
  postId: string;
  postUrl?: string;
  platformSpecificData?: any;
}

/**
 * Post to Facebook Page
 */
export async function postToFacebook(params: MetaPostParams): Promise<MetaPostResult> {
  const { clientId, contentUrl, caption, hashtags, pageId } = params;

  logger.info(`Posting to Facebook for client ${clientId}`);

  try {
    // Get Facebook account credentials
    const account = await PlatformAccount.findOne({
      where: { clientId, platform: Platform.FACEBOOK, isActive: true }
    });

    if (!account) {
      throw new Error(`No active Facebook account found for client ${clientId}`);
    }

    const accessToken = account.tokens.accessToken;
    const targetPageId = pageId || account.accountData.pageId;

    if (!targetPageId) {
      throw new Error('Facebook Page ID not found');
    }

    // Determine if it's a photo or video
    const isVideo = contentUrl.match(/\.(mp4|mov|avi|webm)$/i);

    let postId: string;
    let postUrl: string;

    if (isVideo) {
      // Post video to Facebook
      const response = await axios.post(
        `${META_API_BASE}/${targetPageId}/videos`,
        {
          file_url: contentUrl,
          description: caption,
          access_token: accessToken
        }
      );

      postId = response.data.id;
      postUrl = `https://facebook.com/${postId}`;
    } else {
      // Post photo to Facebook
      const response = await axios.post(
        `${META_API_BASE}/${targetPageId}/photos`,
        {
          url: contentUrl,
          caption: caption,
          access_token: accessToken
        }
      );

      postId = response.data.id;
      postUrl = `https://facebook.com/${postId}`;
    }

    logger.info(`Successfully posted to Facebook: ${postId}`);

    return {
      postId,
      postUrl,
      platformSpecificData: {
        pageId: targetPageId,
        isVideo
      }
    };
  } catch (error: any) {
    logger.error('Failed to post to Facebook:', error.response?.data || error.message);
    throw new Error(`Facebook posting failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Post to Instagram
 */
export async function postToInstagram(params: MetaPostParams): Promise<MetaPostResult> {
  const { clientId, contentUrl, caption, hashtags, accountId, isReel = false, isStory = false } = params;

  logger.info(`Posting to Instagram for client ${clientId} (reel: ${isReel}, story: ${isStory})`);

  try {
    // Get Instagram account credentials
    const account = await PlatformAccount.findOne({
      where: { clientId, platform: Platform.INSTAGRAM, isActive: true }
    });

    if (!account) {
      throw new Error(`No active Instagram account found for client ${clientId}`);
    }

    const accessToken = account.tokens.accessToken;
    const igAccountId = accountId || account.accountData.accountId;

    if (!igAccountId) {
      throw new Error('Instagram Account ID not found');
    }

    let containerId: string;
    let postId: string;

    // Determine media type and create container
    if (isReel) {
      // Create Reel container
      const containerResponse = await axios.post(
        `${META_API_BASE}/${igAccountId}/media`,
        {
          media_type: 'REELS',
          video_url: contentUrl,
          caption: caption,
          share_to_feed: true,
          access_token: accessToken
        }
      );

      containerId = containerResponse.data.id;
    } else if (isStory) {
      // Create Story container
      const containerResponse = await axios.post(
        `${META_API_BASE}/${igAccountId}/media`,
        {
          media_type: 'STORIES',
          image_url: contentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? contentUrl : undefined,
          video_url: contentUrl.match(/\.(mp4|mov|webm)$/i) ? contentUrl : undefined,
          access_token: accessToken
        }
      );

      containerId = containerResponse.data.id;
    } else {
      // Create regular post container (photo or video)
      const isVideo = contentUrl.match(/\.(mp4|mov|avi|webm)$/i);

      const containerResponse = await axios.post(
        `${META_API_BASE}/${igAccountId}/media`,
        {
          media_type: isVideo ? 'VIDEO' : 'IMAGE',
          image_url: isVideo ? undefined : contentUrl,
          video_url: isVideo ? contentUrl : undefined,
          caption: caption,
          access_token: accessToken
        }
      );

      containerId = containerResponse.data.id;
    }

    // Wait for media processing (Instagram requires this)
    await waitForMediaProcessing(igAccountId, containerId, accessToken);

    // Publish the container
    const publishResponse = await axios.post(
      `${META_API_BASE}/${igAccountId}/media_publish`,
      {
        creation_id: containerId,
        access_token: accessToken
      }
    );

    postId = publishResponse.data.id;

    const postUrl = `https://www.instagram.com/p/${postId}`;

    logger.info(`Successfully posted to Instagram: ${postId}`);

    return {
      postId,
      postUrl,
      platformSpecificData: {
        accountId: igAccountId,
        containerId,
        isReel,
        isStory
      }
    };
  } catch (error: any) {
    logger.error('Failed to post to Instagram:', error.response?.data || error.message);
    throw new Error(`Instagram posting failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Wait for Instagram media to finish processing
 */
async function waitForMediaProcessing(
  accountId: string,
  containerId: string,
  accessToken: string,
  maxAttempts: number = 30
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(
        `${META_API_BASE}/${containerId}`,
        {
          params: {
            fields: 'status_code',
            access_token: accessToken
          }
        }
      );

      const status = response.data.status_code;

      if (status === 'FINISHED') {
        logger.info('Instagram media processing completed');
        return;
      } else if (status === 'ERROR') {
        throw new Error('Instagram media processing failed');
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      if (i === maxAttempts - 1) {
        throw new Error(`Media processing timeout: ${error.message}`);
      }
    }
  }

  throw new Error('Media processing timeout');
}

/**
 * Refresh Facebook/Instagram access token
 */
export async function refreshMetaToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  try {
    const response = await axios.get(`${META_API_BASE}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: refreshToken
      }
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    };
  } catch (error: any) {
    logger.error('Failed to refresh Meta token:', error);
    throw error;
  }
}

export default {
  postToFacebook,
  postToInstagram,
  refreshMetaToken
};
