/**
 * Upload Service Videos to Cloudinary
 * Uploads videos, extracts first frames, and updates site_media table
 */

import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET
});

// Configure Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Service definitions
const SERVICES = [
  {
    slug: 'ai-automation',
    title: 'AI Automation',
    filename: 'ai-automation.mp4',
    isVideo: true
  },
  {
    slug: 'social-media-marketing',
    title: 'Social Media Marketing',
    filename: 'social-media-marketing.mp4.mp4',
    isVideo: true
  },
  {
    slug: 'seo-geo',
    title: 'SEO & GEO',
    filename: 'seo-geo.mp4.mp4',
    isVideo: true
  },
  {
    slug: 'lead-generation',
    title: 'Lead Generation',
    filename: 'lead-generation.mp4',
    isVideo: true
  },
  {
    slug: 'paid-advertising',
    title: 'Paid Advertising',
    filename: 'paid-advertising.mp4.mp4',
    isVideo: true
  },
  {
    slug: 'podcasting',
    title: 'Podcasting',
    filename: 'podcasting.mp4.mp4',
    isVideo: true
  },
  {
    slug: 'custom-apps',
    title: 'Custom Apps',
    filename: 'custom-apps.mp4.mp4',
    isVideo: true
  },
  {
    slug: 'crm-management',
    title: 'CRM Management',
    filename: 'crm-management.mp4.mp4',
    isVideo: true
  },
  {
    slug: 'fractional-cmo',
    title: 'Fractional CMO',
    filename: 'fractional-cmo.png',
    isVideo: false
  }
];

const SOURCE_DIR = path.join(__dirname, '..', 'temp', 'new service images');

async function uploadToCloudinary(service) {
  const filePath = path.join(SOURCE_DIR, service.filename);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return null;
  }

  try {
    console.log(`\n📤 Uploading ${service.title}...`);

    const uploadOptions = {
      folder: 'dmsite/services',
      public_id: service.slug,
      resource_type: service.isVideo ? 'video' : 'image',
      overwrite: true,
      invalidate: true
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);

    // For videos, generate first-frame image URL
    let imageUrl;
    if (service.isVideo) {
      // Extract first frame (start offset 0 seconds) as auto-format optimized image
      imageUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        start_offset: '0',
        quality: 'auto:good',
        fetch_format: 'auto'
      });
      console.log(`🖼️  First frame URL: ${imageUrl}`);
    } else {
      // For images, just use optimized URL
      imageUrl = cloudinary.url(result.public_id, {
        resource_type: 'image',
        quality: 'auto:good',
        fetch_format: 'auto'
      });
      console.log(`🖼️  Image URL: ${imageUrl}`);
    }

    return {
      videoUrl: result.secure_url,
      imageUrl: imageUrl,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };

  } catch (error) {
    console.error(`❌ Upload failed for ${service.title}:`, error.message);
    return null;
  }
}

async function addToSiteMedia(service, cloudinaryData) {
  try {
    console.log(`💾 Adding to site_media table...`);

    const mediaData = {
      media_key: `service-icon-${service.slug}`, // Unique key
      media_type: 'image', // Table expects 'image' or 'video', not MIME type
      media_url: cloudinaryData.imageUrl, // Use the image URL (first frame for videos)
      page_slug: 'services',
      section_name: 'service-scroller',
      purpose: 'service icon',
      alt_text: `${service.title} service icon`,
      caption: `${service.title} - Disruptors AI service offering`,
      title: service.title,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
      file_size: cloudinaryData.bytes,
      mime_type: 'image/jpeg',
      cloudinary_public_id: cloudinaryData.publicId,
      cloudinary_folder: 'dmsite/services',
      cloudinary_format: cloudinaryData.format,
      is_active: true,
      metadata: {
        service_slug: service.slug,
        service_title: service.title,
        original_video_url: service.isVideo ? cloudinaryData.videoUrl : null,
        is_video_frame: service.isVideo,
        upload_date: new Date().toISOString()
      }
    };

    // Check if record already exists (by media_key since it's unique)
    const { data: existing } = await supabase
      .from('site_media')
      .select('id')
      .eq('media_key', `service-icon-${service.slug}`)
      .maybeSingle();

    let data, error;

    if (existing) {
      // Update existing record
      const result = await supabase
        .from('site_media')
        .update(mediaData)
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
      console.log(`✅ Updated existing record in site_media (ID: ${data?.id})`);
    } else {
      // Insert new record
      const result = await supabase
        .from('site_media')
        .insert(mediaData)
        .select()
        .single();
      data = result.data;
      error = result.error;
      console.log(`✅ Added new record to site_media (ID: ${data?.id})`);
    }

    if (error) throw error;

    return data;

  } catch (error) {
    console.error(`❌ Failed to add to site_media:`, error.message);
    return null;
  }
}

async function generateServiceImageMap(results) {
  console.log('\n\n📋 SERVICE IMAGE MAP:');
  console.log('='.repeat(80));

  const imageMap = {};

  results.forEach(result => {
    if (result.success) {
      imageMap[result.service.slug] = result.cloudinaryData.imageUrl;
      console.log(`${result.service.title.padEnd(30)} → ${result.cloudinaryData.imageUrl}`);
    }
  });

  console.log('='.repeat(80));

  // Save to file
  const outputPath = path.join(__dirname, '..', 'temp', 'service-image-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(imageMap, null, 2));
  console.log(`\n💾 Image map saved to: ${outputPath}`);

  return imageMap;
}

async function main() {
  console.log('🚀 Starting Cloudinary Upload Process...\n');
  console.log(`Source Directory: ${SOURCE_DIR}\n`);

  // Verify Cloudinary config
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.error('❌ Missing CLOUDINARY_CLOUD_NAME environment variable');
    process.exit(1);
  }

  console.log(`☁️  Cloudinary Cloud: ${cloudName}\n`);

  const results = [];

  for (const service of SERVICES) {
    const cloudinaryData = await uploadToCloudinary(service);

    if (cloudinaryData) {
      const mediaRecord = await addToSiteMedia(service, cloudinaryData);

      results.push({
        service,
        cloudinaryData,
        mediaRecord,
        success: !!mediaRecord
      });
    } else {
      results.push({
        service,
        success: false
      });
    }
  }

  // Generate summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${SERVICES.length}`);
  console.log(`❌ Failed: ${failed}/${SERVICES.length}`);

  if (successful > 0) {
    await generateServiceImageMap(results);
  }

  console.log('\n✨ Upload process complete!\n');

  if (failed > 0) {
    console.log('⚠️  Some uploads failed. Check errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
