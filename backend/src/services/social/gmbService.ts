/**
 * Google My Business API Service
 * Handles posting to GMB via Google Business Profile API
 */

import { google } from 'googleapis';
import axios from 'axios';
import logger from '../../utils/logger';
import PlatformAccount from '../../models/PlatformAccount';
import { Platform } from '../../models/Post';

interface GMBPostParams {
  clientId: string;
  contentUrl: string;
  caption: string;
  locationId?: string;
}

interface GMBPostResult {
  postId: string;
  postUrl?: string;
  platformSpecificData?: any;
}

/**
 * Post to Google My Business
 */
export async function postToGMB(params: GMBPostParams): Promise<GMBPostResult> {
  const { clientId, contentUrl, caption, locationId } = params;

  logger.info(`Posting to GMB for client ${clientId}`);

  try {
    // Get GMB account credentials
    const account = await PlatformAccount.findOne({
      where: { clientId, platform: Platform.GMB, isActive: true }
    });

    if (!account) {
      throw new Error(`No active GMB account found for client ${clientId}`);
    }

    const accessToken = account.tokens.accessToken;
    const targetLocationId = locationId || account.accountData.locationId;

    if (!targetLocationId) {
      throw new Error('GMB Location ID not found');
    }

    // Initialize Google Auth
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const mybusiness = google.mybusinessbusinessinformation({
      version: 'v1',
      auth
    });

    // Determine post type
    const isVideo = contentUrl.match(/\.(mp4|mov|avi|webm)$/i);
    const isImage = contentUrl.match(/\.(jpg|jpeg|png|gif)$/i);

    const postData: any = {
      languageCode: 'en-US',
      summary: caption,
      topicType: 'STANDARD'
    };

    // Add media if present
    if (isImage) {
      postData.media = [
        {
          mediaFormat: 'PHOTO',
          sourceUrl: contentUrl
        }
      ];
    } else if (isVideo) {
      postData.media = [
        {
          mediaFormat: 'VIDEO',
          sourceUrl: contentUrl
        }
      ];
    }

    // Create the post
    const response = await axios.post(
      `https://mybusiness.googleapis.com/v4/${targetLocationId}/localPosts`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const postId = response.data.name.split('/').pop();

    logger.info(`Successfully posted to GMB: ${postId}`);

    return {
      postId,
      postUrl: undefined, // GMB doesn't provide direct post URLs
      platformSpecificData: {
        locationId: targetLocationId,
        postName: response.data.name
      }
    };
  } catch (error: any) {
    logger.error('Failed to post to GMB:', error.response?.data || error.message);
    throw new Error(`GMB posting failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

export default {
  postToGMB
};
