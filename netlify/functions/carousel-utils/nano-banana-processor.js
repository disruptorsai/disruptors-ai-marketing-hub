/**
 * Nano Banana Image Processor
 *
 * Wrapper around Google Gemini 2.5 Flash Image (Nano Banana) for:
 * - Single image editing with natural language
 * - Multi-image composition
 * - Carousel-specific prompt engineering
 *
 * Integrates with existing src/lib/gemini-image.js
 */

import { geminiEdit, geminiCompose } from '../../../src/lib/gemini-image.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process image based on carousel strategy
 *
 * @param {Object} params
 * @param {Object} params.slide - Slide data with text and image_description
 * @param {Object} params.strategy - Image strategy with method, sources, modifications
 * @param {Buffer|Array<Buffer>} params.imageBuffer - Downloaded image(s)
 * @param {Object} params.brainContext - Business Brain data
 * @returns {Promise<Buffer>} Processed image buffer
 */
export async function processCarouselImage({
  slide,
  strategy,
  imageBuffer,
  brainContext
}) {
  const { method, modifications } = strategy;

  try {
    if (method === 'download_modify') {
      return await editCarouselSlide({
        slide,
        imageBuffer,
        modifications,
        brainContext
      });
    }
    else if (method === 'download_combine') {
      return await composeCarouselSlide({
        slide,
        imageBuffers: Array.isArray(imageBuffer) ? imageBuffer : [imageBuffer],
        modifications,
        brainContext
      });
    }
    else {
      // For 'generate' or 'download', return as-is
      return imageBuffer;
    }

  } catch (error) {
    console.error('Nano Banana processing error:', error);
    throw error;
  }
}

/**
 * Edit single image for carousel slide
 */
async function editCarouselSlide({
  slide,
  imageBuffer,
  modifications,
  brainContext
}) {
  // Save buffer to temp file (required by geminiEdit)
  const tempPath = await saveTempImage(imageBuffer, slide.slide);

  try {
    // Build edit prompt
    const editPrompt = buildEditPrompt({
      slide,
      modifications,
      brainContext
    });

    // Call Nano Banana edit
    const editedBuffer = await geminiEdit({
      imagePath: tempPath,
      prompt: editPrompt
    });

    return editedBuffer;

  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(tempPath);
    } catch (error) {
      console.warn('Failed to delete temp file:', tempPath);
    }
  }
}

/**
 * Compose multiple images for carousel slide
 */
async function composeCarouselSlide({
  slide,
  imageBuffers,
  modifications,
  brainContext
}) {
  // Save all buffers to temp files
  const tempPaths = await Promise.all(
    imageBuffers.map((buffer, index) =>
      saveTempImage(buffer, `${slide.slide}_${index}`)
    )
  );

  try {
    // Build compose prompt
    const composePrompt = buildComposePrompt({
      slide,
      modifications,
      brainContext,
      imageCount: imageBuffers.length
    });

    // Call Nano Banana compose
    const composedBuffer = await geminiCompose({
      imagePaths: tempPaths,
      prompt: composePrompt
    });

    return composedBuffer;

  } finally {
    // Clean up temp files
    tempPaths.forEach(tempPath => {
      try {
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.warn('Failed to delete temp file:', tempPath);
      }
    });
  }
}

/**
 * Build edit prompt for Nano Banana
 */
function buildEditPrompt({ slide, modifications, brainContext }) {
  return `Edit this image for Instagram carousel slide ${slide.slide}.

**Modifications:**
${modifications}

**Add Text Overlay:**
${formatTextOverlay(slide.text)}

**Style Requirements:**
- Professional ${brainContext.industry || 'business'} aesthetic
- Instagram-ready 1080x1080px square format
- High contrast for text readability
- ${brainContext.brand_voice || 'Professional'} tone
${brainContext.brand_colors ? `- Brand colors: ${brainContext.brand_colors}` : ''}

**Text Formatting:**
- Use bold, modern sans-serif font (like Montserrat or Inter)
- Headline: 72pt, heavy weight
- Body text (if present): 36pt, regular weight
- Ensure text is clearly readable with proper contrast
- Add semi-transparent overlay behind text if needed

**Brand Context:**
- Business: ${brainContext.business_name || 'Unknown'}
- Target Audience: ${brainContext.target_audience || 'General business owners'}

**Output:**
Polished Instagram carousel slide ${slide.slide}, ready to post, 1080x1080px.`;
}

/**
 * Build compose prompt for Nano Banana multi-image
 */
function buildComposePrompt({ slide, modifications, brainContext, imageCount }) {
  return `Compose these ${imageCount} images into Instagram carousel slide ${slide.slide}.

**Composition Instructions:**
${modifications}

**Add Text Overlay:**
${formatTextOverlay(slide.text)}

**Composition Requirements:**
- Blend images seamlessly into cohesive design
- Ensure all elements are balanced and readable
- Professional ${brainContext.industry || 'business'} aesthetic
- Instagram 1080x1080px square format
- High visual impact

**Text Formatting:**
- Bold, modern sans-serif font
- Headline: 72pt, positioned for maximum visibility
- Body text (if present): 36pt, easy to read
- Semi-transparent background behind text for contrast

**Brand Context:**
- Business: ${brainContext.business_name || 'Unknown'}
- Voice: ${brainContext.brand_voice || 'Professional'}
${brainContext.brand_colors ? `- Colors: ${brainContext.brand_colors}` : ''}

**Output:**
Instagram-ready carousel slide ${slide.slide} with all images compositied, 1080x1080px.`;
}

/**
 * Format slide text for prompt (handle multi-line text)
 */
function formatTextOverlay(text) {
  const lines = text.split('\n').filter(line => line.trim());

  if (lines.length === 1) {
    // Single headline
    return `Headline (72pt, bold): "${lines[0]}"`;
  } else {
    // Headline + paragraph
    const headline = lines[0];
    const paragraph = lines.slice(1).join(' ').trim();

    return `Headline (72pt, bold): "${headline}"

Body paragraph (36pt, regular):
"${paragraph}"

Layout: Headline at top, paragraph below with adequate spacing.`;
  }
}

/**
 * Save image buffer to temp file
 */
async function saveTempImage(buffer, identifier) {
  const tempDir = path.join(__dirname, '../../../temp/carousel-processing');

  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filename = `slide_${identifier}_${Date.now()}.png`;
  const filepath = path.join(tempDir, filename);

  fs.writeFileSync(filepath, buffer);

  return filepath;
}

/**
 * Retry wrapper for Nano Banana operations
 * (Nano Banana can be inconsistent, retry helps)
 */
export async function processWithRetry({
  slide,
  strategy,
  imageBuffer,
  brainContext,
  maxRetries = 2
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await processCarouselImage({
        slide,
        strategy,
        imageBuffer,
        brainContext
      });

      // Success!
      return {
        success: true,
        buffer: result,
        attempts: attempt
      };

    } catch (error) {
      console.error(`Nano Banana attempt ${attempt}/${maxRetries} failed:`, error.message);
      lastError = error;

      // Don't retry on final attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // All attempts failed
  return {
    success: false,
    error: lastError.message,
    attempts: maxRetries
  };
}

/**
 * Batch process multiple slides (with concurrency limit)
 */
export async function batchProcessSlides({
  slides,
  strategies,
  imageBuffers,
  brainContext,
  concurrency = 2
}) {
  const results = [];
  const queue = slides.map((slide, index) => ({
    slide,
    strategy: strategies[index],
    imageBuffer: imageBuffers[index]
  }));

  // Process in batches
  for (let i = 0; i < queue.length; i += concurrency) {
    const batch = queue.slice(i, i + concurrency);

    const batchResults = await Promise.allSettled(
      batch.map(item =>
        processWithRetry({
          slide: item.slide,
          strategy: item.strategy,
          imageBuffer: item.imageBuffer,
          brainContext
        })
      )
    );

    results.push(...batchResults.map(r => r.value));
  }

  return results;
}

/**
 * Clean up old temp files (run periodically)
 */
export function cleanupTempFiles(maxAgeMinutes = 60) {
  const tempDir = path.join(__dirname, '../../../temp/carousel-processing');

  if (!fs.existsSync(tempDir)) {
    return;
  }

  const files = fs.readdirSync(tempDir);
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000;

  let cleanedCount = 0;

  files.forEach(file => {
    const filepath = path.join(tempDir, file);
    const stats = fs.statSync(filepath);
    const age = now - stats.mtimeMs;

    if (age > maxAge) {
      try {
        fs.unlinkSync(filepath);
        cleanedCount++;
      } catch (error) {
        console.warn(`Failed to delete old temp file: ${filepath}`);
      }
    }
  });

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} old temp files from carousel processing`);
  }
}
