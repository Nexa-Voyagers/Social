/**
 * LinkedIn API Service
 * Handles posting to LinkedIn via LinkedIn API
 */

import axios from 'axios';
import logger from '../../utils/logger';
import PlatformAccount from '../../models/PlatformAccount';
import { Platform } from '../../models/Post';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

interface LinkedInPostParams {
  clientId: string;
  contentUrl: string;
  caption: string;
  hashtags: string[];
  pageId?: string; // Organization URN
}

interface LinkedInPostResult {
  postId: string;
  postUrl?: string;
  platformSpecificData?: any;
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(params: LinkedInPostParams): Promise<LinkedInPostResult> {
  const { clientId, contentUrl, caption, hashtags, pageId } = params;

  logger.info(`Posting to LinkedIn for client ${clientId}`);

  try {
    // Get LinkedIn account credentials
    const account = await PlatformAccount.findOne({
      where: { clientId, platform: Platform.LINKEDIN, isActive: true }
    });

    if (!account) {
      throw new Error(`No active LinkedIn account found for client ${clientId}`);
    }

    const accessToken = account.tokens.accessToken;
    const authorUrn = pageId || account.accountData.pageId || account.accountData.accountId;

    if (!authorUrn) {
      throw new Error('LinkedIn author URN not found');
    }

    // Determine if it's a video or image
    const isVideo = contentUrl.match(/\.(mp4|mov|avi|webm)$/i);
    const isImage = contentUrl.match(/\.(jpg|jpeg|png|gif)$/i);

    let postId: string;
    let shareUrn: string;

    if (isVideo) {
      // Upload video to LinkedIn
      const videoAsset = await uploadVideoToLinkedIn(accessToken, authorUrn, contentUrl);

      // Create video post
      const response = await axios.post(
        `${LINKEDIN_API_BASE}/ugcPosts`,
        {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: caption
              },
              shareMediaCategory: 'VIDEO',
              media: [
                {
                  status: 'READY',
                  media: videoAsset
                }
              ]
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      shareUrn = response.data.id;
      postId = shareUrn.split(':').pop() || shareUrn;
    } else if (isImage) {
      // Upload image to LinkedIn
      const imageAsset = await uploadImageToLinkedIn(accessToken, authorUrn, contentUrl);

      // Create image post
      const response = await axios.post(
        `${LINKEDIN_API_BASE}/ugcPosts`,
        {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: caption
              },
              shareMediaCategory: 'IMAGE',
              media: [
                {
                  status: 'READY',
                  media: imageAsset
                }
              ]
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      shareUrn = response.data.id;
      postId = shareUrn.split(':').pop() || shareUrn;
    } else {
      // Text-only post
      const response = await axios.post(
        `${LINKEDIN_API_BASE}/ugcPosts`,
        {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: caption
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      shareUrn = response.data.id;
      postId = shareUrn.split(':').pop() || shareUrn;
    }

    logger.info(`Successfully posted to LinkedIn: ${postId}`);

    return {
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${shareUrn}`,
      platformSpecificData: {
        shareUrn,
        authorUrn
      }
    };
  } catch (error: any) {
    logger.error('Failed to post to LinkedIn:', error.response?.data || error.message);
    throw new Error(`LinkedIn posting failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Upload image to LinkedIn
 */
async function uploadImageToLinkedIn(accessToken: string, authorUrn: string, imageUrl: string): Promise<string> {
  try {
    // Register upload
    const registerResponse = await axios.post(
      `${LINKEDIN_API_BASE}/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const assetUrn = registerResponse.data.value.asset;

    // Download image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    // Upload image
    await axios.put(uploadUrl, imageResponse.data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg'
      }
    });

    return assetUrn;
  } catch (error: any) {
    logger.error('Failed to upload image to LinkedIn:', error);
    throw error;
  }
}

/**
 * Upload video to LinkedIn
 */
async function uploadVideoToLinkedIn(accessToken: string, authorUrn: string, videoUrl: string): Promise<string> {
  try {
    // Register upload
    const registerResponse = await axios.post(
      `${LINKEDIN_API_BASE}/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const assetUrn = registerResponse.data.value.asset;

    // Download video
    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });

    // Upload video
    await axios.put(uploadUrl, videoResponse.data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'video/mp4'
      }
    });

    return assetUrn;
  } catch (error: any) {
    logger.error('Failed to upload video to LinkedIn:', error);
    throw error;
  }
}

export default {
  postToLinkedIn
};
