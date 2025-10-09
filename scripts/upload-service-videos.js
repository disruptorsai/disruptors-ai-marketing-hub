import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Service video mapping
const SERVICE_VIDEOS = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    filename: 'ai-automation.mp4',
    slug: 'solutions-ai-automation'
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    filename: 'social-media-marketing.mp4.mp4',
    slug: 'solutions-social-media'
  },
  {
    id: 'seo-geo',
    title: 'SEO & GEO',
    filename: 'seo-geo.mp4.mp4',
    slug: 'solutions-seo-geo'
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    filename: 'lead-generation.mp4',
    slug: 'solutions-lead-generation'
  },
  {
    id: 'paid-advertising',
    title: 'Paid Advertising',
    filename: 'paid-advertising.mp4.mp4',
    slug: 'solutions-paid-advertising'
  },
  {
    id: 'podcasting',
    title: 'Podcasting',
    filename: 'podcasting.mp4.mp4',
    slug: 'solutions-podcasting'
  },
  {
    id: 'custom-apps',
    title: 'Custom Apps',
    filename: 'custom-apps.mp4.mp4',
    slug: 'solutions-custom-apps'
  },
  {
    id: 'crm-management',
    title: 'CRM Management',
    filename: 'crm-management.mp4.mp4',
    slug: 'solutions-crm-management'
  },
  {
    id: 'fractional-cmo',
    title: 'Fractional CMO',
    filename: 'fractional-cmo.png',
    slug: 'solutions-fractional-cmo',
    isImage: true
  }
];

const VIDEO_FOLDER = path.join(__dirname, '..', 'temp', 'new service images');
const CLOUDINARY_FOLDER = 'dmsite/services';

async function uploadServiceMedia() {
  console.log('\n🎬 Starting service media upload to Cloudinary...\n');

  const results = [];

  for (const service of SERVICE_VIDEOS) {
    const filePath = path.join(VIDEO_FOLDER, service.filename);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${service.title}: File not found - ${service.filename}`);
      results.push({
        ...service,
        success: false,
        error: 'File not found'
      });
      continue;
    }

    try {
      console.log(`⏳ Uploading ${service.title}...`);

      // Upload video/image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: service.isImage ? 'image' : 'video',
        public_id: service.id,
        folder: CLOUDINARY_FOLDER,
        overwrite: true,
        type: 'upload'
      });

      console.log(`✅ ${service.title}: Video uploaded - ${uploadResult.secure_url}`);

      // Generate first frame URL (for videos) or use image URL
      let imageUrl;
      if (service.isImage) {
        imageUrl = cloudinary.url(`${CLOUDINARY_FOLDER}/${service.id}`, {
          format: 'jpg',
          quality: 'auto:good'
        });
      } else {
        // Extract first frame from video
        imageUrl = cloudinary.url(`${CLOUDINARY_FOLDER}/${service.id}`, {
          resource_type: 'video',
          format: 'jpg',
          quality: 'auto:good',
          transformation: [
            { start_offset: '0' }
          ]
        });
      }

      console.log(`🖼️  First frame URL: ${imageUrl}`);

      results.push({
        ...service,
        success: true,
        videoUrl: uploadResult.secure_url,
        imageUrl: imageUrl,
        publicId: uploadResult.public_id
      });

      console.log('');

    } catch (error) {
      console.error(`❌ ${service.title}: Upload failed - ${error.message}`);
      results.push({
        ...service,
        success: false,
        error: error.message
      });
      console.log('');
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n📊 Upload Summary:');
  console.log(`   Total: ${results.length}`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);

  // Generate component code
  console.log('\n📝 Generated ServicesScrollingRows image URLs:\n');
  console.log('const SERVICES = [');
  results.filter(r => r.success).forEach((result, index) => {
    console.log(`  {`);
    console.log(`    title: "${result.title}",`);
    console.log(`    slug: "${result.slug}",`);
    console.log(`    image: "${result.imageUrl}"`);
    console.log(`  }${index < successful - 1 ? ',' : ''}`);
  });
  console.log('];\n');

  // Save results to file
  const outputPath = path.join(__dirname, '..', 'generated', `service-videos-upload-${Date.now()}.json`);
  fs.writeFileSync(outputPath, JSON.stringify({ results, successful, failed }, null, 2));
  console.log(`💾 Results saved to: ${outputPath}\n`);

  return results;
}

// Run the upload
uploadServiceMedia().catch(console.error);
