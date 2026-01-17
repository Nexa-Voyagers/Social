import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
import logger from './logger';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const bucket = process.env.AWS_S3_BUCKET || 'autoupload-assets';
const baseUrl = process.env.AWS_S3_URL || `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;

/**
 * Upload a file to S3
 * @param filePath Local file path
 * @param s3Key S3 key (path in bucket)
 * @param contentType Optional content type
 * @returns Public URL of uploaded file
 */
export async function uploadToS3(
  filePath: string,
  s3Key: string,
  contentType?: string
): Promise<string> {
  try {
    logger.info(`Uploading ${filePath} to S3 as ${s3Key}`);

    const fileStream = fs.createReadStream(filePath);
    const fileStats = fs.statSync(filePath);

    // Auto-detect content type if not provided
    if (!contentType) {
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.webm': 'video/webm'
      };
      contentType = contentTypes[ext] || 'application/octet-stream';
    }

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: s3Key,
        Body: fileStream,
        ContentType: contentType,
        ACL: 'public-read' // Make files publicly accessible
      }
    });

    await upload.done();

    const publicUrl = `${baseUrl}/${s3Key}`;
    logger.info(`File uploaded successfully: ${publicUrl}`);

    return publicUrl;
  } catch (error: any) {
    logger.error(`Failed to upload ${filePath} to S3:`, error);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

/**
 * Upload a buffer to S3
 * @param buffer File buffer
 * @param s3Key S3 key (path in bucket)
 * @param contentType Content type
 * @returns Public URL of uploaded file
 */
export async function uploadBufferToS3(
  buffer: Buffer,
  s3Key: string,
  contentType: string
): Promise<string> {
  try {
    logger.info(`Uploading buffer to S3 as ${s3Key}`);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    });

    await s3Client.send(command);

    const publicUrl = `${baseUrl}/${s3Key}`;
    logger.info(`Buffer uploaded successfully: ${publicUrl}`);

    return publicUrl;
  } catch (error: any) {
    logger.error(`Failed to upload buffer to S3:`, error);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

export default {
  uploadToS3,
  uploadBufferToS3
};
