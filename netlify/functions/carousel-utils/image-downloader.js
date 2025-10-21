/**
 * Image Downloader Utility
 *
 * Multi-source image acquisition for carousel generation:
 * - Google Custom Search API (primary)
 * - Unsplash API (high-quality stock photos)
 * - Pexels API (alternative stock photos)
 * - Brand assets from Business Brain
 *
 * Returns image buffers ready for Nano Banana processing or direct use
 */

import fetch from 'node-fetch';

/**
 * Search and download image from best available source
 *
 * @param {Object} params
 * @param {string} params.query - Search query
 * @param {string} params.source - Source preference ('google_image_search', 'unsplash', 'pexels', 'brand_assets')
 * @param {Object} params.filters - Search filters (size, license, etc.)
 * @returns {Promise<Buffer>} Image as Buffer
 */
export async function searchAndDownloadImage({ query, source = 'google_image_search', filters = {} }) {
  // Parse source if it includes query (e.g., "google_image_search:stressed realtor")
  let actualSource = source;
  let actualQuery = query;

  if (source.includes(':')) {
    const parts = source.split(':');
    actualSource = parts[0];
    actualQuery = parts.slice(1).join(':');
  }

  try {
    let imageUrl = null;

    // Try primary source
    switch (actualSource) {
      case 'google_image_search':
        imageUrl = await searchGoogleImages(actualQuery, filters);
        break;

      case 'unsplash':
        imageUrl = await searchUnsplash(actualQuery, filters);
        break;

      case 'pexels':
        imageUrl = await searchPexels(actualQuery, filters);
        break;

      case 'brand_assets':
        // This would fetch from user's uploaded brand assets in Business Brain
        // For now, fallback to Unsplash
        console.warn('Brand assets not yet implemented, falling back to Unsplash');
        imageUrl = await searchUnsplash(actualQuery, filters);
        break;

      default:
        throw new Error(`Unknown image source: ${actualSource}`);
    }

    if (!imageUrl) {
      throw new Error(`No image found for query: ${actualQuery}`);
    }

    // Download the image
    const imageBuffer = await downloadImageFromUrl(imageUrl);

    return imageBuffer;

  } catch (error) {
    console.error(`Image download error (${actualSource}):`, error.message);

    // Fallback chain: Google → Unsplash → Pexels
    if (actualSource !== 'unsplash' && actualSource !== 'pexels') {
      console.log('Trying Unsplash fallback...');
      try {
        const fallbackUrl = await searchUnsplash(actualQuery, filters);
        if (fallbackUrl) {
          return await downloadImageFromUrl(fallbackUrl);
        }
      } catch (fallbackError) {
        console.error('Unsplash fallback failed:', fallbackError.message);
      }

      console.log('Trying Pexels fallback...');
      try {
        const fallbackUrl = await searchPexels(actualQuery, filters);
        if (fallbackUrl) {
          return await downloadImageFromUrl(fallbackUrl);
        }
      } catch (fallbackError) {
        console.error('Pexels fallback failed:', fallbackError.message);
      }
    }

    throw new Error(`Failed to download image from all sources: ${error.message}`);
  }
}

/**
 * Search Google Custom Search API for images
 */
async function searchGoogleImages(query, filters = {}) {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  if (!apiKey || !cx) {
    console.warn('Google Custom Search not configured, skipping');
    return null;
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      cx: cx,
      q: query,
      searchType: 'image',
      num: 5, // Get top 5 results
      safe: 'active',
      imgSize: filters.size === 'large' ? 'LARGE' : 'MEDIUM',
      rights: 'cc_publicdomain,cc_attribute,cc_sharealike' // Commercial use OK
    });

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    // Return first high-quality result
    const image = data.items[0];
    return image.link;

  } catch (error) {
    console.error('Google Image Search error:', error.message);
    return null;
  }
}

/**
 * Search Unsplash API for images
 */
async function searchUnsplash(query, filters = {}) {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    console.warn('Unsplash API not configured, skipping');
    return null;
  }

  try {
    const params = new URLSearchParams({
      query: query,
      per_page: 5,
      orientation: 'squarish', // Best for Instagram 1:1
      content_filter: 'high'
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Return first result's regular size (suitable for Instagram)
    const photo = data.results[0];

    // Trigger download endpoint (Unsplash requirement)
    if (photo.links?.download_location) {
      fetch(photo.links.download_location, {
        headers: { 'Authorization': `Client-ID ${apiKey}` }
      }).catch(() => {}); // Fire and forget
    }

    return photo.urls.regular; // 1080px width

  } catch (error) {
    console.error('Unsplash search error:', error.message);
    return null;
  }
}

/**
 * Search Pexels API for images
 */
async function searchPexels(query, filters = {}) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    console.warn('Pexels API not configured, skipping');
    return null;
  }

  try {
    const params = new URLSearchParams({
      query: query,
      per_page: 5,
      orientation: 'square'
    });

    const response = await fetch(
      `https://api.pexels.com/v1/search?${params.toString()}`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      return null;
    }

    // Return first result's large size
    const photo = data.photos[0];
    return photo.src.large; // ~940px width

  } catch (error) {
    console.error('Pexels search error:', error.message);
    return null;
  }
}

/**
 * Download image from URL and return as Buffer
 */
async function downloadImageFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Disruptors-AI-Carousel-Generator/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Image download failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);

  } catch (error) {
    console.error('Image download error:', error.message);
    throw error;
  }
}

/**
 * Download multiple images in parallel
 *
 * @param {Array<string>} sources - Array of source strings
 * @returns {Promise<Array<Buffer>>} Array of image buffers
 */
export async function downloadMultipleImages(sources) {
  const downloadPromises = sources.map(source => {
    // Parse source format: "google_image_search:query" or "unsplash:query"
    if (source.includes(':')) {
      const [sourceType, query] = source.split(':');
      return searchAndDownloadImage({
        query: query.trim(),
        source: sourceType
      });
    } else {
      // If no source specified, use default
      return searchAndDownloadImage({
        query: source,
        source: 'google_image_search'
      });
    }
  });

  try {
    const results = await Promise.allSettled(downloadPromises);

    // Extract successful downloads
    const images = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    if (images.length === 0) {
      throw new Error('All image downloads failed');
    }

    // If some failed but some succeeded, log warning
    if (images.length < sources.length) {
      console.warn(`Only ${images.length}/${sources.length} images downloaded successfully`);
    }

    return images;

  } catch (error) {
    console.error('Multiple image download error:', error);
    throw error;
  }
}

/**
 * Get image metadata without downloading
 *
 * @param {string} url - Image URL
 * @returns {Promise<Object>} Metadata (width, height, format, size)
 */
export async function getImageMetadata(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Disruptors-AI-Carousel-Generator/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Metadata fetch failed: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    return {
      format: contentType?.split('/')[1] || 'unknown',
      size: parseInt(contentLength) || 0,
      url
    };

  } catch (error) {
    console.error('Metadata fetch error:', error.message);
    return null;
  }
}

/**
 * Validate image buffer (check format, size, dimensions)
 *
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Object} Validation result
 */
export function validateImageBuffer(imageBuffer) {
  // Check minimum size (avoid tiny/broken images)
  const minSize = 10 * 1024; // 10KB
  if (imageBuffer.length < minSize) {
    return {
      valid: false,
      error: `Image too small (${imageBuffer.length} bytes, min ${minSize})`
    };
  }

  // Check maximum size (avoid huge files)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (imageBuffer.length > maxSize) {
    return {
      valid: false,
      error: `Image too large (${imageBuffer.length} bytes, max ${maxSize})`
    };
  }

  // Check if it's a valid image (basic magic number check)
  const isPNG = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;
  const isJPEG = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8;
  const isWebP = imageBuffer[8] === 0x57 && imageBuffer[9] === 0x45;

  if (!isPNG && !isJPEG && !isWebP) {
    return {
      valid: false,
      error: 'Invalid image format (not PNG, JPEG, or WebP)'
    };
  }

  return {
    valid: true,
    format: isPNG ? 'png' : isJPEG ? 'jpeg' : 'webp',
    size: imageBuffer.length
  };
}

/**
 * Fetch brand asset from Business Brain
 * (Placeholder for future implementation)
 */
async function fetchBrandAsset(brainId, assetName, supabaseClient) {
  // Future: Query business_brain_assets table
  // For now, return null to trigger fallback
  console.warn(`Brand assets not yet implemented (brain: ${brainId}, asset: ${assetName})`);
  return null;
}
