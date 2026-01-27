#!/usr/bin/env node

/**
 * Simple Service Images Generator using OpenAI GPT-Image-1 (NEVER DALL-E 3)
 * More reliable than the Replicate version, generates directly to Cloudinary
 */

import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service definitions
const SERVICES = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    filename: 'ai-automation-service.jpg',
    prompt: 'Professional AI automation dashboard interface, modern tech workspace, robotic process automation visualization, workflow diagrams with connected nodes, sleek blue and purple gradient background, futuristic digital interface elements, clean minimalist design, high-tech aesthetic, photorealistic, 16:9 aspect ratio'
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    filename: 'social-media-marketing-service.jpg',
    prompt: 'Modern social media management dashboard, multiple platform analytics, engagement metrics charts, content calendar interface, social media icons and notifications, vibrant blue and purple color scheme, clean UI design, professional workspace setup, photorealistic, 16:9 aspect ratio'
  },
  {
    id: 'seo-geo',
    title: 'SEO & GEO',
    filename: 'seo-geo-service.jpg',
    prompt: 'SEO analytics dashboard with ranking charts, local search results visualization, geographic targeting maps, search engine optimization metrics, keyword ranking graphs, location pins on map interface, blue and purple tech aesthetic, modern dashboard design, photorealistic, 16:9 aspect ratio'
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    filename: 'lead-generation-service.jpg',
    prompt: 'Lead generation funnel visualization, conversion metrics dashboard, customer journey mapping, sales pipeline interface, lead scoring charts, CRM data visualization, professional blue and purple gradient, modern business analytics, photorealistic, 16:9 aspect ratio'
  },
  {
    id: 'paid-advertising',
    title: 'Paid Advertising',
    filename: 'paid-advertising-service.jpg',
    prompt: 'PPC campaign dashboard, advertising platform interface, ROI charts and metrics, ad performance analytics, cost-per-click visualization, multiple advertising channels, professional blue and purple design, modern advertising workspace, photorealistic, 16:9 aspect ratio'
  },
  {
    id: 'podcasting',
    title: 'Podcasting',
    filename: 'podcasting-service.jpg',
    prompt: 'Professional podcast studio setup, audio waveforms visualization, recording equipment and microphone, podcast analytics dashboard, sound wave graphics, broadcasting interface, modern studio lighting, blue and purple tech aesthetic, photorealistic, 16:9 aspect ratio'
  },
  {
    id: 'custom-apps',
    title: 'Custom Apps',
    filename: 'custom-apps-service.jpg',
    prompt: 'Mobile app development workspace, code editor interface, app prototypes and wireframes, development tools dashboard, programming environment, multiple device mockups, blue and purple gradient background, modern development setup, photorealistic, 16:9 aspect ratio'
  },
  {
    id: 'crm-management',
    title: 'CRM Management',
    filename: 'crm-management-service.jpg',
    prompt: 'CRM dashboard interface, customer relationship management system, contact database visualization, sales pipeline management, customer data analytics, relationship mapping interface, professional blue and purple design, modern business software, photorealistic, 16:9 aspect ratio'
  },
  {
    id: 'fractional-cmo',
    title: 'Fractional CMO',
    filename: 'fractional-cmo-service.jpg',
    prompt: 'Strategic marketing planning dashboard, executive analytics interface, growth metrics visualization, marketing strategy charts, business consulting workspace, performance KPIs, professional leadership aesthetic, blue and purple gradient, photorealistic, 16:9 aspect ratio'
  }
];

class SimpleServiceGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY
    });

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  async generateImage(service) {
    console.log(`🎨 Generating ${service.title}...`);

    try {
      const response = await this.openai.images.generate({
        model: "gpt-image-1", // NEVER use DALL-E 3
        prompt: service.prompt,
        n: 1,
        size: "1792x1024",  // 16:9 aspect ratio
        quality: "standard"
      });

      const imageUrl = response.data[0].url;
      console.log(`✅ Generated: ${service.title}`);

      return {
        serviceId: service.id,
        title: service.title,
        filename: service.filename,
        imageUrl: imageUrl
      };
    } catch (error) {
      console.error(`❌ Error generating ${service.title}:`, error.message);
      throw error;
    }
  }

  async uploadToCloudinary(result) {
    try {
      console.log(`☁️  Uploading ${result.title} to Cloudinary...`);

      const uploadResult = await cloudinary.uploader.upload(result.imageUrl, {
        folder: 'disruptors-ai/services',
        public_id: result.serviceId,
        overwrite: true,
        transformation: [
          {
            width: 640,
            height: 360,
            crop: 'fill',
            quality: 90,
            format: 'jpg'
          }
        ]
      });

      console.log(`✅ Uploaded: ${result.title}`);

      return {
        ...result,
        cloudinaryUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    } catch (error) {
      console.error(`❌ Upload error for ${result.title}:`, error.message);
      throw error;
    }
  }

  async generateAll() {
    console.log('🚀 Starting service image generation with GPT-Image-1 (DALL-E 3 excluded)...\n');

    const results = [];

    for (const service of SERVICES) {
      try {
        const imageResult = await this.generateImage(service);
        const uploadResult = await this.uploadToCloudinary(imageResult);

        results.push(uploadResult);
        console.log(`✅ Completed: ${service.title}\n`);

        // Small delay to be respectful to APIs
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Failed: ${service.title} - ${error.message}\n`);
        results.push({
          serviceId: service.id,
          title: service.title,
          filename: service.filename,
          error: error.message
        });
      }
    }

    return results;
  }

  generateComponentCode(results) {
    const services = results
      .filter(result => !result.error && result.cloudinaryUrl)
      .map(result => ({
        title: result.title,
        hook: this.getServiceHook(result.serviceId),
        link: `solutions-${result.serviceId}`,
        image: result.cloudinaryUrl
      }));

    return `const services = [
${services.map(service => `  {
    title: "${service.title}",
    hook: "${service.hook}",
    link: "${service.link}",
    image: "${service.image}"
  }`).join(',\n')}
];`;
  }

  getServiceHook(serviceId) {
    const hooks = {
      'ai-automation': 'Automate repetitive tasks and workflows',
      'social-media-marketing': 'Build and engage your community',
      'seo-geo': 'Get found by your ideal customers',
      'lead-generation': 'Fill your pipeline with qualified prospects',
      'paid-advertising': 'Maximize ROI across all channels',
      'podcasting': 'Build authority through audio content',
      'custom-apps': 'Tailored solutions for your needs',
      'crm-management': 'Organize and nurture your relationships',
      'fractional-cmo': 'Strategic marketing leadership'
    };
    return hooks[serviceId] || 'Professional service solutions';
  }
}

// Main execution
async function main() {
  try {
    const generator = new SimpleServiceGenerator();

    console.log('🔧 Configuration:');
    console.log(`  - Model: GPT-Image-1 (DALL-E 3 explicitly excluded)`);
    console.log(`  - Size: 1792x1024 (16:9 aspect ratio)`);
    console.log(`  - Services: ${SERVICES.length}`);
    console.log(`  - Target size: 640x360\n`);

    const results = await generator.generateAll();

    console.log('\n🎉 Generation complete!');

    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Successful: ${successful.length}`);
    console.log(`  ❌ Failed: ${failed.length}`);

    if (successful.length > 0) {
      console.log('\n🔗 Generated URLs:');
      successful.forEach(result => {
        console.log(`  ${result.title}: ${result.cloudinaryUrl}`);
      });

      console.log('\n📝 Updated ServiceScroller code:');
      console.log(generator.generateComponentCode(results));
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed generations:');
      failed.forEach(result => {
        console.log(`  ${result.title}: ${result.error}`);
      });
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);