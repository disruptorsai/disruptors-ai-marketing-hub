#!/usr/bin/env node

/**
 * GPT-Image-1 Service Images Generator
 *
 * Uses OpenAI's GPT-Image-1 model to generate service card images
 *
 * Usage:
 *   node scripts/gpt-image-service-generator.js
 */

import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Same services array as above
const SERVICES = [
  {
    "id": "ai-automation",
    "title": "AI Automation",
    "description": "Automate repetitive tasks and workflows",
    "link": "solutions-ai-automation",
    "prompt": "Professional AI automation dashboard interface, sleek robotic process automation visualization, workflow diagrams with connected nodes, automated task management system, modern tech workspace, sophisticated blue and purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), futuristic digital interface elements, clean minimalist design, high-tech aesthetic, commercial photography style, professional corporate design"
  },
  {
    "id": "social-media-marketing",
    "title": "Social Media Marketing",
    "description": "Build and engage your community",
    "link": "solutions-social-media",
    "prompt": "Modern social media management dashboard, multiple platform analytics display, engagement metrics charts and graphs, content calendar interface, social media icons and notifications, growth analytics, vibrant blue and purple color scheme (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), professional workspace setup, clean UI design, commercial quality, modern technology aesthetic"
  },
  {
    "id": "seo-geo",
    "title": "SEO & GEO",
    "description": "Get found by your ideal customers",
    "link": "solutions-seo-geo",
    "prompt": "SEO analytics dashboard with ranking charts, local search results visualization, geographic targeting maps interface, keyword optimization analytics, search engine metrics display, location pins on map interface, blue and purple tech aesthetic (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern dashboard design, professional analytics workspace, commercial photography style"
  },
  {
    "id": "lead-generation",
    "title": "Lead Generation",
    "description": "Fill your pipeline with qualified prospects",
    "link": "solutions-lead-generation",
    "prompt": "Lead generation funnel visualization, conversion metrics dashboard display, customer journey mapping interface, sales pipeline visualization, lead scoring charts and analytics, CRM data visualization, professional blue and purple gradient (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern business analytics workspace, clean dashboard design, commercial quality"
  },
  {
    "id": "paid-advertising",
    "title": "Paid Advertising",
    "description": "Maximize ROI across all channels",
    "link": "solutions-paid-advertising",
    "prompt": "PPC campaign dashboard interface, advertising platform analytics, ROI charts and performance metrics, ad performance analytics display, cost-per-click visualization, multiple advertising channels interface, professional blue and purple design (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern advertising workspace, clean analytics interface, commercial photography style"
  },
  {
    "id": "podcasting",
    "title": "Podcasting",
    "description": "Build authority through audio content",
    "link": "solutions-podcasting",
    "prompt": "Professional podcast studio setup, audio waveforms visualization, recording equipment and professional microphone, podcast analytics dashboard, sound wave graphics interface, broadcasting control panel, modern studio lighting, blue and purple tech aesthetic (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), professional audio workspace, commercial quality design"
  },
  {
    "id": "custom-apps",
    "title": "Custom Apps",
    "description": "Tailored solutions for your needs",
    "link": "solutions-custom-apps",
    "prompt": "Mobile app development workspace, code editor interface display, app prototypes and wireframes, development tools dashboard, programming environment setup, multiple device mockups, blue and purple gradient background (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern development setup, clean tech aesthetic, commercial photography style"
  },
  {
    "id": "crm-management",
    "title": "CRM Management",
    "description": "Organize and nurture your relationships",
    "link": "solutions-crm-management",
    "prompt": "CRM dashboard interface display, customer relationship management system, contact database visualization, sales pipeline management interface, customer data analytics charts, relationship mapping interface, professional blue and purple design (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern business software, clean dashboard layout, commercial quality"
  },
  {
    "id": "fractional-cmo",
    "title": "Fractional CMO",
    "description": "Strategic marketing leadership",
    "link": "solutions-fractional-cmo",
    "prompt": "Strategic marketing planning dashboard, executive analytics interface, growth metrics visualization, marketing strategy charts and KPIs, business consulting workspace, performance analytics display, professional leadership aesthetic, blue and purple gradient (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern executive dashboard, commercial photography style"
  }
];

class GPTImageServiceGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    });

    this.cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

    if (!this.openai.apiKey) {
      throw new Error('VITE_OPENAI_API_KEY or OPENAI_API_KEY environment variable is required');
    }

    if (this.cloudinaryConfig.cloud_name) {
      cloudinary.config(this.cloudinaryConfig);
    }
  }

  createFinalPrompt(service) {
    return `Professional ${service.prompt}, high resolution, commercial quality, marketing website optimized, 640x360 aspect ratio, corporate design, modern aesthetic`;
  }

  async generateServiceImage(service) {
    console.log(`🎨 Generating image for ${service.title} using GPT-Image-1...`);

    try {
      const enhancedPrompt = this.createFinalPrompt(service);

      const response = await this.openai.images.generate({
        model: "gpt-image-1",  // NEVER use DALL-E 3
        prompt: enhancedPrompt,
        n: 1,
        size: "1792x1024",  // Closest to 640x360 ratio
        quality: "hd"
      });

      const imageUrl = response.data[0].url;
      console.log(`✅ Image generated for ${service.title}`);

      return {
        serviceId: service.id,
        title: service.title,
        description: service.description,
        link: service.link,
        imageUrl: imageUrl,
        prompt: enhancedPrompt,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Error generating image for ${service.title}:`, error.message);
      throw error;
    }
  }

  async uploadToCloudinary(result) {
    if (!this.cloudinaryConfig.cloud_name) {
      console.log(`⚠️  Skipping Cloudinary upload for ${result.title} - configuration missing`);
      return result;
    }

    try {
      console.log(`☁️  Uploading ${result.title} to Cloudinary...`);

      const uploadResult = await cloudinary.uploader.upload(result.imageUrl, {
        folder: 'disruptors-ai/services',
        public_id: result.serviceId,
        overwrite: true,
        tags: ['service-card', 'production', 'marketing-website', 'gpt-image'],
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

      console.log(`✅ Uploaded to Cloudinary: ${uploadResult.secure_url}`);

      return {
        ...result,
        cloudinaryUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };

    } catch (error) {
      console.error(`❌ Error uploading to Cloudinary:`, error.message);
      return {
        ...result,
        cloudinaryUrl: result.imageUrl,
        publicId: null,
        uploadError: error.message
      };
    }
  }

  async generateAll() {
    console.log('🚀 Starting GPT-Image-1 service image generation (DALL-E 3 excluded)...\n');

    const results = [];

    for (const service of SERVICES) {
      try {
        const imageResult = await this.generateServiceImage(service);
        const uploadResult = await this.uploadToCloudinary(imageResult);
        results.push(uploadResult);

        console.log(`✅ Completed: ${service.title}\n`);
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to process ${service.title}:`, error.message);
        results.push({
          serviceId: service.id,
          title: service.title,
          description: service.description,
          link: service.link,
          error: error.message
        });
      }
    }

    return results;
  }

  generateComponentCode(results) {
    const successfulResults = results.filter(result => !result.error);

    const services = successfulResults.map(result => ({
      title: result.title,
      hook: result.description,
      link: result.link,
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

  async saveResults(results) {
    const outputDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `gpt-image-service-images-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    const output = {
      timestamp: new Date().toISOString(),
      provider: 'OpenAI GPT-Image-1 (DALL-E 3 explicitly excluded)',',
      services: SERVICES,
      results,
      component_code: this.generateComponentCode(results),
      summary: {
        total: SERVICES.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        success_rate: Math.round((results.filter(r => !r.error).length / SERVICES.length) * 100)
      }
    };

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`📄 Results saved to: ${filepath}`);

    return output;
  }
}

// Main execution
async function main() {
  try {
    const generator = new GPTImageServiceGenerator();
    const results = await generator.generateAll();
    const output = await generator.saveResults(results);

    console.log('\n🎉 GPT-Image generation complete!');
    console.log(`✅ Successful: ${output.summary.successful}`);
    console.log(`❌ Failed: ${output.summary.failed}`);
    console.log(`📈 Success rate: ${output.summary.success_rate}%`);

    if (output.summary.successful > 0) {
      console.log('\n🔗 Generated Service Card URLs:');
      results.filter(r => !r.error).forEach(result => {
        console.log(`  ${result.title}: ${result.cloudinaryUrl}`);
      });

      console.log('\n📝 ServiceScroller Component Code:');
      console.log(output.component_code);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
