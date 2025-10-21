/**
 * Carousel Export Utility
 *
 * Exports completed carousels in multiple formats:
 * - Individual PNG downloads
 * - ZIP archive with all slides
 * - Canva-compatible JSON
 * - Instagram caption suggestions
 */

import JSZip from 'jszip';

/**
 * Generate ZIP archive of carousel slides
 *
 * @param {Array} slides - Array of slide objects with image_url
 * @param {string} carouselId - Carousel ID for filename
 * @param {Object} supabaseClient - Supabase client for storage access
 * @returns {Promise<Buffer>} ZIP file as Buffer
 */
export async function exportAsZip(slides, carouselId, supabaseClient) {
  const zip = new JSZip();

  try {
    // Download and add each slide to ZIP
    for (const slide of slides) {
      const imageBuffer = await downloadFromStorage(slide.image_url, supabaseClient);
      const filename = `slide_${String(slide.slide).padStart(2, '0')}.png`;
      zip.file(filename, imageBuffer);
    }

    // Add metadata file
    const metadata = {
      carousel_id: carouselId,
      slide_count: slides.length,
      generated_at: new Date().toISOString(),
      slides: slides.map(s => ({
        slide: s.slide,
        text: s.text,
        filename: `slide_${String(s.slide).padStart(2, '0')}.png`
      }))
    };

    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    return zipBuffer;

  } catch (error) {
    console.error('ZIP export error:', error);
    throw error;
  }
}

/**
 * Generate Canva-compatible JSON
 *
 * @param {Array} slides - Array of slide objects
 * @param {Object} metadata - Carousel metadata
 * @returns {Object} Canva JSON structure
 */
export function exportAsCanvaJSON(slides, metadata = {}) {
  return {
    version: '1.0',
    type: 'instagram_carousel',
    format: 'square',
    dimensions: {
      width: 1080,
      height: 1080
    },
    slide_count: slides.length,
    slides: slides.map(slide => ({
      id: slide.slide,
      order: slide.slide,
      image_url: slide.image_url,
      text: {
        raw: slide.text,
        headline: slide.text.split('\n')[0],
        body: slide.text.split('\n').slice(1).join('\n').trim()
      },
      strategy: slide.image_strategy_used || 'unknown',
      dimensions: { width: 1080, height: 1080 }
    })),
    metadata: {
      topic: metadata.topic,
      style: metadata.style_template,
      generated_at: metadata.created_at || new Date().toISOString(),
      brand: metadata.business_name,
      industry: metadata.industry
    },
    import_instructions: {
      canva: 'Upload these images to Canva and arrange in carousel order',
      instagram: 'Post as carousel in this exact order for optimal engagement'
    }
  };
}

/**
 * Generate Instagram caption suggestions
 *
 * @param {Array} slides - Array of slide objects
 * @param {Object} brainContext - Business Brain context
 * @returns {Object} Caption suggestions
 */
export function generateInstagramCaptions(slides, brainContext = {}) {
  const topic = slides[0]?.text.split('\n')[0] || 'Carousel Post';

  // Extract key points from slides 2-N
  const keyPoints = slides.slice(1).map(slide => {
    const headline = slide.text.split('\n')[0];
    return `• ${headline}`;
  }).join('\n');

  const mainCaption = `${topic}

${keyPoints}

Save this post for later and share with someone who needs to see this! 👆

---
${brainContext.business_name ? `Follow @${brainContext.business_name.toLowerCase().replace(/\s+/g, '')} for more ${brainContext.industry || 'business'} tips!` : ''}

#${brainContext.industry || 'business'} #marketing #socialmedia #contentcreator #smallbusiness`;

  const alternativeCaption = `Swipe to learn about ${topic.toLowerCase()} 👉

This carousel breaks down:
${keyPoints}

Which tip are you implementing first? Drop a comment below! ⬇️

---
${brainContext.business_name ? `Want more content like this? Follow @${brainContext.business_name.toLowerCase().replace(/\s+/g, '')}` : ''}

#${brainContext.industry || 'business'}tips #socialmediatips #contentmarketing`;

  return {
    main: mainCaption,
    alternative: alternativeCaption,
    hashtags: generateHashtags(brainContext.industry, slides.length),
    cta_suggestions: [
      'Save this for later!',
      'Share with someone who needs this',
      'Tag a friend who should see this',
      'Drop a 💯 if you found this helpful',
      'Which tip resonates most with you?'
    ]
  };
}

/**
 * Generate relevant hashtags
 */
function generateHashtags(industry, slideCount) {
  const baseHashtags = [
    'socialmediatips',
    'contentcreator',
    'digitalmarketing',
    'smallbusiness',
    'entrepreneurship'
  ];

  const industryHashtags = {
    'real_estate': ['realestate', 'realtor', 'realestateagent', 'realestatemarketing'],
    'saas': ['saas', 'software', 'techstartup', 'b2bmarketing'],
    'coaching': ['businesscoach', 'lifecoach', 'mindset', 'personaldevelopment'],
    'ecommerce': ['ecommerce', 'onlinebusiness', 'shopify', 'dropshipping'],
    'marketing': ['marketingstrategy', 'socialmediamarketing', 'contentmarketing', 'growthhacking']
  };

  const industrySpecific = industryHashtags[industry] || [];

  return [...baseHashtags, ...industrySpecific, 'carousel'].slice(0, 15); // Instagram limit: 30
}

/**
 * Download image from Supabase Storage
 */
async function downloadFromStorage(imageUrl, supabaseClient) {
  try {
    // Extract path from public URL
    // Format: https://{project}.supabase.co/storage/v1/object/public/carousel-images/{path}
    const urlParts = imageUrl.split('/carousel-images/');
    if (urlParts.length < 2) {
      throw new Error('Invalid storage URL format');
    }

    const filePath = urlParts[1];

    // Download from storage
    const { data, error } = await supabaseClient.storage
      .from('carousel-images')
      .download(filePath);

    if (error) {
      throw error;
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);

  } catch (error) {
    console.error('Storage download error:', error);
    throw error;
  }
}

/**
 * Export complete carousel package
 *
 * @param {Object} carousel - Carousel generation record from database
 * @param {Object} supabaseClient - Supabase client
 * @returns {Promise<Object>} Complete export package
 */
export async function exportCompletePackage(carousel, supabaseClient) {
  const slides = carousel.slides_json?.slides || [];

  try {
    // Generate all export formats
    const [zipBuffer, canvaJSON, captions] = await Promise.all([
      exportAsZip(slides, carousel.id, supabaseClient),
      Promise.resolve(exportAsCanvaJSON(slides, {
        topic: carousel.topic,
        style_template: carousel.style_template,
        created_at: carousel.created_at,
        business_name: carousel.business_name,
        industry: carousel.industry
      })),
      Promise.resolve(generateInstagramCaptions(slides, {
        business_name: carousel.business_name,
        industry: carousel.industry
      }))
    ]);

    return {
      success: true,
      exports: {
        zip: {
          buffer: zipBuffer,
          filename: `carousel_${carousel.id}.zip`,
          size: zipBuffer.length
        },
        canva_json: canvaJSON,
        captions: captions,
        individual_slides: slides.map(slide => ({
          slide: slide.slide,
          url: slide.image_url,
          text: slide.text
        }))
      },
      metadata: {
        carousel_id: carousel.id,
        slide_count: slides.length,
        topic: carousel.topic,
        total_cost: carousel.total_cost,
        generation_time_ms: carousel.generation_duration_ms
      }
    };

  } catch (error) {
    console.error('Complete package export error:', error);

    return {
      success: false,
      error: error.message,
      exports: null
    };
  }
}

/**
 * Generate shareable link for carousel
 *
 * @param {string} carouselId - Carousel ID
 * @param {Object} supabaseClient - Supabase client
 * @returns {Promise<string>} Public shareable URL
 */
export async function generateShareableLink(carouselId, supabaseClient) {
  try {
    // Create a shareable metadata file in storage
    const shareData = {
      carousel_id: carouselId,
      shared_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    const shareFilePath = `shared/${carouselId}/share.json`;

    const { error } = await supabaseClient.storage
      .from('carousel-images')
      .upload(shareFilePath, JSON.stringify(shareData), {
        contentType: 'application/json',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data } = supabaseClient.storage
      .from('carousel-images')
      .getPublicUrl(shareFilePath);

    return data.publicUrl;

  } catch (error) {
    console.error('Shareable link generation error:', error);
    throw error;
  }
}

/**
 * Calculate export file sizes
 */
export function calculateExportSizes(slides) {
  // Estimate sizes (actual will vary)
  const avgImageSize = 500 * 1024; // 500KB per image
  const zipOverhead = 1.1; // 10% overhead for ZIP compression

  return {
    individual_pngs: slides.length * avgImageSize,
    zip_archive: Math.floor(slides.length * avgImageSize * zipOverhead),
    canva_json: 5 * 1024, // ~5KB
    total_estimated: Math.floor((slides.length * avgImageSize * zipOverhead) + (5 * 1024))
  };
}
