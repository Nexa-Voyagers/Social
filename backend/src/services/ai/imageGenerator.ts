import OpenAI from 'openai';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';
import { uploadToS3 } from '../../utils/s3Upload';
import Client from '../../models/Client';
import Asset from '../../models/Asset';
import { BrandingConfig } from '../../models/Client';
import { VisualInstructions } from '../../models/ContentCalendar';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ImageGenerationParams {
  clientId: string;
  caption: string;
  hashtags: string[];
  visualInstructions: VisualInstructions;
  branding: BrandingConfig;
}

interface ImageGenerationResult {
  url: string;
  caption?: string;
  localPath?: string;
}

export async function generateImagePost(params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const { clientId, caption, hashtags, visualInstructions, branding } = params;

  logger.info(`Generating image post for client ${clientId}`);

  try {
    // Step 1: Get client and assets
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found`);
    }

    // Get client's logo
    const logo = await Asset.findOne({
      where: { clientId, isPrimary: true, type: 'logo' }
    });

    // Step 2: Refine caption with AI if needed
    const refinedCaption = await refineCaption(caption, hashtags, client.name);

    // Step 3: Generate or select base image
    let baseImagePath: string;

    if (visualInstructions.useAssets && visualInstructions.useAssets.length > 0) {
      // Use existing client assets
      const asset = await Asset.findByPk(visualInstructions.useAssets[0]);
      if (asset) {
        baseImagePath = await downloadImage(asset.url);
      } else {
        // Fallback to AI generation
        baseImagePath = await generateAIImage(visualInstructions, caption);
      }
    } else if (visualInstructions.aiPrompt) {
      // Generate image with AI
      baseImagePath = await generateAIImage(visualInstructions, visualInstructions.aiPrompt);
    } else {
      // Generate image based on caption
      baseImagePath = await generateAIImage(visualInstructions, caption);
    }

    // Step 4: Apply branding (overlay logo, add text, colors)
    const brandedImagePath = await applyBranding(baseImagePath, {
      logo: logo?.url,
      caption: visualInstructions.textPlacement ? caption : undefined,
      branding,
      visualInstructions
    });

    // Step 5: Optimize and upload
    const optimizedPath = await optimizeImage(brandedImagePath);
    const uploadedUrl = await uploadToS3(optimizedPath, `posts/${clientId}/${uuidv4()}.jpg`);

    // Cleanup temp files
    await cleanupTempFiles([baseImagePath, brandedImagePath, optimizedPath]);

    logger.info(`Image post generated successfully for client ${clientId}`);

    return {
      url: uploadedUrl,
      caption: refinedCaption
    };
  } catch (error: any) {
    logger.error(`Failed to generate image post:`, error);
    throw error;
  }
}

async function refineCaption(caption: string, hashtags: string[], clientName: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a social media expert helping create engaging posts for ${clientName}.
          Refine the caption to be more engaging while maintaining the core message.
          Keep it concise and impactful. Do not add hashtags - they will be added separately.`
        },
        {
          role: 'user',
          content: `Refine this caption: "${caption}"`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const refinedCaption = response.choices[0].message.content || caption;

    // Add hashtags at the end
    const hashtagString = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
    return `${refinedCaption}\n\n${hashtagString}`;
  } catch (error) {
    logger.warn('Failed to refine caption with AI, using original:', error);
    const hashtagString = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
    return `${caption}\n\n${hashtagString}`;
  }
}

async function generateAIImage(visualInstructions: VisualInstructions, prompt: string): Promise<string> {
  try {
    logger.info(`Generating AI image with prompt: ${prompt}`);

    // Build enhanced prompt with visual instructions
    let enhancedPrompt = prompt;
    if (visualInstructions.style) {
      enhancedPrompt += ` in ${visualInstructions.style} style`;
    }
    if (visualInstructions.imageStyle) {
      enhancedPrompt += `, ${visualInstructions.imageStyle}`;
    }
    enhancedPrompt += ', high quality, professional, social media post';

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    // Download the generated image
    return await downloadImage(imageUrl);
  } catch (error) {
    logger.error('Failed to generate AI image:', error);
    throw error;
  }
}

async function downloadImage(url: string): Promise<string> {
  const tempPath = path.join('/tmp', `download-${uuidv4()}.jpg`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  await fs.writeFile(tempPath, response.data);
  return tempPath;
}

async function applyBranding(
  imagePath: string,
  options: {
    logo?: string;
    caption?: string;
    branding: BrandingConfig;
    visualInstructions: VisualInstructions;
  }
): Promise<string> {
  try {
    const { logo, caption, branding, visualInstructions } = options;
    const outputPath = path.join('/tmp', `branded-${uuidv4()}.jpg`);

    // Load the base image
    let image = sharp(imagePath).resize(1080, 1080, { fit: 'cover' });

    // Create composite layers
    const compositeImages: any[] = [];

    // Add logo if provided
    if (logo && branding.watermark !== false) {
      try {
        const logoPath = await downloadImage(logo);
        const logoBuffer = await sharp(logoPath)
          .resize(150, 150, { fit: 'inside' })
          .toBuffer();

        // Position logo based on config
        let gravity: any = 'southeast'; // default bottom-right
        if (branding.logoPosition === 'top-left') gravity = 'northwest';
        else if (branding.logoPosition === 'top-right') gravity = 'northeast';
        else if (branding.logoPosition === 'bottom-left') gravity = 'southwest';
        else if (branding.logoPosition === 'center') gravity = 'center';

        compositeImages.push({
          input: logoBuffer,
          gravity,
          blend: 'over'
        });

        await fs.unlink(logoPath);
      } catch (error) {
        logger.warn('Failed to add logo:', error);
      }
    }

    // Apply composite
    if (compositeImages.length > 0) {
      image = image.composite(compositeImages);
    }

    // Save the result
    await image.toFile(outputPath);

    return outputPath;
  } catch (error) {
    logger.error('Failed to apply branding:', error);
    // Return original if branding fails
    return imagePath;
  }
}

async function optimizeImage(imagePath: string): Promise<string> {
  const outputPath = path.join('/tmp', `optimized-${uuidv4()}.jpg`);

  await sharp(imagePath)
    .jpeg({ quality: 85, progressive: true })
    .resize(1080, 1080, { fit: 'cover' })
    .toFile(outputPath);

  return outputPath;
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
