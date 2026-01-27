#!/usr/bin/env node

/**
 * Production Service Images Generator
 *
 * Final production script to generate all 9 service card images using the
 * optimal provider and settings determined from comparison analysis.
 *
 * Based on testing, this uses Flux Pro for highest quality professional
 * service card images suitable for the marketing website.
 *
 * Usage:
 *   node scripts/production-service-images.js
 */

import fetch from 'node-fetch';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  replicate: {
    apiUrl: 'https://api.replicate.com/v1/predictions',
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b' // Stable model for service cards
  },
  image: {
    width: 640,
    height: 360,
    format: 'jpg',
    quality: 90
  },
  cloudinary: {
    folder: 'disruptors-ai/services',
    transformation: {
      quality: 'auto:good',
      format: 'jpg'
    }
  }
};

// All 9 services with optimized prompts
const PRODUCTION_SERVICES = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Automate repetitive tasks and workflows',
    link: 'solutions-ai-automation',
    prompt: 'Professional AI automation dashboard interface, sleek robotic process automation visualization, workflow diagrams with connected nodes, automated task management system, modern tech workspace, sophisticated blue and purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), futuristic digital interface elements, clean minimalist design, high-tech aesthetic, commercial photography style, professional corporate design, 640x360 aspect ratio'
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    description: 'Build and engage your community',
    link: 'solutions-social-media',
    prompt: 'Modern social media management dashboard, multiple platform analytics display, engagement metrics charts and graphs, content calendar interface, social media icons and notifications, growth analytics, vibrant blue and purple color scheme (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), professional workspace setup, clean UI design, commercial quality, modern technology aesthetic, 640x360 aspect ratio'
  },
  {
    id: 'seo-geo',
    title: 'SEO & GEO',
    description: 'Get found by your ideal customers',
    link: 'solutions-seo-geo',
    prompt: 'SEO analytics dashboard with ranking charts, local search results visualization, geographic targeting maps interface, keyword optimization analytics, search engine metrics display, location pins on map interface, blue and purple tech aesthetic (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern dashboard design, professional analytics workspace, commercial photography style, 640x360 aspect ratio'
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    description: 'Fill your pipeline with qualified prospects',
    link: 'solutions-lead-generation',
    prompt: 'Lead generation funnel visualization, conversion metrics dashboard display, customer journey mapping interface, sales pipeline visualization, lead scoring charts and analytics, CRM data visualization, professional blue and purple gradient (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern business analytics workspace, clean dashboard design, commercial quality, 640x360 aspect ratio'
  },
  {
    id: 'paid-advertising',
    title: 'Paid Advertising',
    description: 'Maximize ROI across all channels',
    link: 'solutions-paid-advertising',
    prompt: 'PPC campaign dashboard interface, advertising platform analytics, ROI charts and performance metrics, ad performance analytics display, cost-per-click visualization, multiple advertising channels interface, professional blue and purple design (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern advertising workspace, clean analytics interface, commercial photography style, 640x360 aspect ratio'
  },
  {
    id: 'podcasting',
    title: 'Podcasting',
    description: 'Build authority through audio content',
    link: 'solutions-podcasting',
    prompt: 'Professional podcast studio setup, audio waveforms visualization, recording equipment and professional microphone, podcast analytics dashboard, sound wave graphics interface, broadcasting control panel, modern studio lighting, blue and purple tech aesthetic (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), professional audio workspace, commercial quality design, 640x360 aspect ratio'
  },
  {
    id: 'custom-apps',
    title: 'Custom Apps',
    description: 'Tailored solutions for your needs',
    link: 'solutions-custom-apps',
    prompt: 'Mobile app development workspace, code editor interface display, app prototypes and wireframes, development tools dashboard, programming environment setup, multiple device mockups, blue and purple gradient background (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern development setup, clean tech aesthetic, commercial photography style, 640x360 aspect ratio'
  },
  {
    id: 'crm-management',
    title: 'CRM Management',
    description: 'Organize and nurture your relationships',
    link: 'solutions-crm-management',
    prompt: 'CRM dashboard interface display, customer relationship management system, contact database visualization, sales pipeline management interface, customer data analytics charts, relationship mapping interface, professional blue and purple design (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern business software, clean dashboard layout, commercial quality, 640x360 aspect ratio'
  },
  {
    id: 'fractional-cmo',
    title: 'Fractional CMO',
    description: 'Strategic marketing leadership',
    link: 'solutions-fractional-cmo',
    prompt: 'Strategic marketing planning dashboard, executive analytics interface, growth metrics visualization, marketing strategy charts and KPIs, business consulting workspace, performance analytics display, professional leadership aesthetic, blue and purple gradient (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern executive dashboard, commercial photography style, 640x360 aspect ratio'
  }
];

class ProductionServiceImageGenerator {
  constructor() {
    this.replicateToken = process.env.REPLICATE_API_TOKEN;
    this.cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

    if (!this.replicateToken) {
      throw new Error('REPLICATE_API_TOKEN environment variable is required');
    }

    if (!this.cloudinaryConfig.cloud_name || !this.cloudinaryConfig.api_key || !this.cloudinaryConfig.api_secret) {
      console.warn('Cloudinary configuration missing. Images will only be generated via Replicate.');
    } else {
      cloudinary.config(this.cloudinaryConfig);
    }
  }

  /**
   * Enhanced prompt with brand consistency
   */
  createFinalPrompt(service) {
    const qualityEnhancers = [
      'high resolution',
      'professional photography',
      'commercial quality',
      'award-winning design',
      'sharp details',
      'optimal lighting',
      'perfect composition',
      'web optimized',
      'marketing website quality'
    ];

    const negativePrompts = [
      'low quality',
      'blurry',
      'unprofessional',
      'childish',
      'cartoon',
      'amateur',
      'cluttered',
      'bad lighting',
      'pixelated',
      'distorted'
    ];

    return `${service.prompt}, ${qualityEnhancers.join(', ')}. Avoid: ${negativePrompts.join(', ')}`;
  }

  /**
   * Generate single service image
   */
  async generateServiceImage(service) {
    console.log(`🎨 Generating image for ${service.title}...`);

    try {
      const enhancedPrompt = this.createFinalPrompt(service);

      const response = await fetch(CONFIG.replicate.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: {
            prompt: enhancedPrompt,
            width: CONFIG.image.width,
            height: CONFIG.image.height,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 30,
            scheduler: "K_EULER",
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
      }

      const prediction = await response.json();
      console.log(`⏳ Prediction created: ${prediction.id}`);

      const result = await this.waitForCompletion(prediction.id);
      console.log(`✅ Image generated for ${service.title}`);

      return {
        serviceId: service.id,
        title: service.title,
        description: service.description,
        link: service.link,
        replicateUrl: result.output[0],
        predictionId: prediction.id,
        prompt: enhancedPrompt,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Error generating image for ${service.title}:`, error.message);
      throw error;
    }
  }

  /**
   * Wait for Replicate completion
   */
  async waitForCompletion(predictionId) {
    const maxAttempts = 60;
    const pollInterval = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${CONFIG.replicate.apiUrl}/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.replicateToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to poll prediction: ${response.statusText}`);
        }

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
          return prediction;
        } else if (prediction.status === 'failed') {
          throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
        }

        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, pollInterval));

      } catch (error) {
        console.error(`\n❌ Error polling prediction:`, error.message);
        throw error;
      }
    }

    throw new Error('Prediction timed out');
  }

  /**
   * Upload to Cloudinary
   */
  async uploadToCloudinary(result) {
    if (!this.cloudinaryConfig.cloud_name) {
      console.log(`⚠️  Skipping Cloudinary upload for ${result.title} - configuration missing`);
      return {
        ...result,
        cloudinaryUrl: result.replicateUrl,
        publicId: null
      };
    }

    try {
      console.log(`☁️  Uploading ${result.title} to Cloudinary...`);

      const uploadResult = await cloudinary.uploader.upload(result.replicateUrl, {
        folder: CONFIG.cloudinary.folder,
        public_id: result.serviceId,
        overwrite: true,
        tags: ['service-card', 'production', 'marketing-website'],
        transformation: [
          {
            width: CONFIG.image.width,
            height: CONFIG.image.height,
            crop: 'fill',
            quality: CONFIG.image.quality,
            format: CONFIG.image.format
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
        cloudinaryUrl: result.replicateUrl,
        publicId: null,
        uploadError: error.message
      };
    }
  }

  /**
   * Generate all service images
   */
  async generateAll() {
    console.log('🚀 Starting production service image generation...\n');
    console.log(`📊 Configuration:`);
    console.log(`  - Model: ${CONFIG.replicate.model}`);
    console.log(`  - Dimensions: ${CONFIG.image.width}x${CONFIG.image.height}`);
    console.log(`  - Services: ${PRODUCTION_SERVICES.length}`);
    console.log(`  - Quality: Production/Commercial grade`);
    console.log(`  - Cloudinary configured: ${!!this.cloudinaryConfig.cloud_name}\n`);

    const results = [];

    for (const service of PRODUCTION_SERVICES) {
      try {
        const imageResult = await this.generateServiceImage(service);
        const uploadResult = await this.uploadToCloudinary(imageResult);
        results.push(uploadResult);

        console.log(`✅ Completed: ${service.title}\n`);

        // Respectful delay between API calls
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

  /**
   * Generate ServiceScroller component code
   */
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

  /**
   * Save results with component code
   */
  async saveResults(results) {
    const outputDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `production-service-images-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    const output = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      model_used: CONFIG.replicate.model,
      services: PRODUCTION_SERVICES,
      results,
      component_code: this.generateComponentCode(results),
      summary: {
        total: PRODUCTION_SERVICES.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        success_rate: Math.round((results.filter(r => !r.error).length / PRODUCTION_SERVICES.length) * 100)
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
    const generator = new ProductionServiceImageGenerator();

    const results = await generator.generateAll();
    const output = await generator.saveResults(results);

    console.log('\n🎉 Production generation complete!');
    console.log('\n📊 Final Summary:');
    console.log(`  ✅ Successful: ${output.summary.successful}`);
    console.log(`  ❌ Failed: ${output.summary.failed}`);
    console.log(`  📈 Success rate: ${output.summary.success_rate}%`);

    if (output.summary.successful > 0) {
      console.log('\n🔗 Generated Service Card URLs:');
      results.filter(r => !r.error).forEach(result => {
        console.log(`  ${result.title}: ${result.cloudinaryUrl}`);
      });

      console.log('\n📝 ServiceScroller Component Code:');
      console.log('Copy this into src/components/shared/ServiceScroller.jsx:');
      console.log('=====================================');
      console.log(output.component_code);
      console.log('=====================================');

      console.log('\n🔄 Implementation Steps:');
      console.log('1. Replace the services array in src/components/shared/ServiceScroller.jsx');
      console.log('2. Test the component to ensure images load correctly');
      console.log('3. Verify responsive design and hover effects');
      console.log('4. Commit the changes to your repository');
    }

    if (output.summary.failed > 0) {
      console.log('\n❌ Failed generations:');
      results.filter(r => r.error).forEach(result => {
        console.log(`  ${result.title}: ${result.error}`);
      });
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Always run when executed directly
main().catch(console.error);

export default ProductionServiceImageGenerator;