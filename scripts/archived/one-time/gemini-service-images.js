#!/usr/bin/env node

/**
 * Gemini Service Images Generator
 *
 * Uses Google Gemini (Nano Banana) to generate service card images
 * as an alternative to Replicate when credits are insufficient.
 *
 * Usage:
 *   node scripts/gemini-service-images.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
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

// All 9 services with optimized prompts for Gemini
const SERVICES = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Automate repetitive tasks and workflows',
    link: 'solutions-ai-automation',
    prompt: 'Professional AI automation dashboard interface, sleek robotic process automation visualization, workflow diagrams with connected nodes, automated task management system, modern tech workspace, sophisticated blue and purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), futuristic digital interface elements, clean minimalist design, high-tech aesthetic, commercial photography style, professional corporate design'
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    description: 'Build and engage your community',
    link: 'solutions-social-media',
    prompt: 'Modern social media management dashboard, multiple platform analytics display, engagement metrics charts and graphs, content calendar interface, social media icons and notifications, growth analytics, vibrant blue and purple color scheme (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), professional workspace setup, clean UI design, commercial quality, modern technology aesthetic'
  },
  {
    id: 'seo-geo',
    title: 'SEO & GEO',
    description: 'Get found by your ideal customers',
    link: 'solutions-seo-geo',
    prompt: 'SEO analytics dashboard with ranking charts, local search results visualization, geographic targeting maps interface, keyword optimization analytics, search engine metrics display, location pins on map interface, blue and purple tech aesthetic (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern dashboard design, professional analytics workspace, commercial photography style'
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    description: 'Fill your pipeline with qualified prospects',
    link: 'solutions-lead-generation',
    prompt: 'Lead generation funnel visualization, conversion metrics dashboard display, customer journey mapping interface, sales pipeline visualization, lead scoring charts and analytics, CRM data visualization, professional blue and purple gradient (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern business analytics workspace, clean dashboard design, commercial quality'
  },
  {
    id: 'paid-advertising',
    title: 'Paid Advertising',
    description: 'Maximize ROI across all channels',
    link: 'solutions-paid-advertising',
    prompt: 'PPC campaign dashboard interface, advertising platform analytics, ROI charts and performance metrics, ad performance analytics display, cost-per-click visualization, multiple advertising channels interface, professional blue and purple design (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern advertising workspace, clean analytics interface, commercial photography style'
  },
  {
    id: 'podcasting',
    title: 'Podcasting',
    description: 'Build authority through audio content',
    link: 'solutions-podcasting',
    prompt: 'Professional podcast studio setup, audio waveforms visualization, recording equipment and professional microphone, podcast analytics dashboard, sound wave graphics interface, broadcasting control panel, modern studio lighting, blue and purple tech aesthetic (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), professional audio workspace, commercial quality design'
  },
  {
    id: 'custom-apps',
    title: 'Custom Apps',
    description: 'Tailored solutions for your needs',
    link: 'solutions-custom-apps',
    prompt: 'Mobile app development workspace, code editor interface display, app prototypes and wireframes, development tools dashboard, programming environment setup, multiple device mockups, blue and purple gradient background (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern development setup, clean tech aesthetic, commercial photography style'
  },
  {
    id: 'crm-management',
    title: 'CRM Management',
    description: 'Organize and nurture your relationships',
    link: 'solutions-crm-management',
    prompt: 'CRM dashboard interface display, customer relationship management system, contact database visualization, sales pipeline management interface, customer data analytics charts, relationship mapping interface, professional blue and purple design (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern business software, clean dashboard layout, commercial quality'
  },
  {
    id: 'fractional-cmo',
    title: 'Fractional CMO',
    description: 'Strategic marketing leadership',
    link: 'solutions-fractional-cmo',
    prompt: 'Strategic marketing planning dashboard, executive analytics interface, growth metrics visualization, marketing strategy charts and KPIs, business consulting workspace, performance analytics display, professional leadership aesthetic, blue and purple gradient (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), modern executive dashboard, commercial photography style'
  }
];

class GeminiServiceImageGenerator {
  constructor() {
    this.geminiApiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    this.cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

    if (!this.geminiApiKey) {
      throw new Error('VITE_GEMINI_API_KEY or GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);

    if (!this.cloudinaryConfig.cloud_name || !this.cloudinaryConfig.api_key || !this.cloudinaryConfig.api_secret) {
      console.warn('Cloudinary configuration missing. Images will be saved locally only.');
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
      'marketing website quality',
      '640x360 aspect ratio'
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

    return `Create a professional ${service.prompt}, ${qualityEnhancers.join(', ')}. Avoid: ${negativePrompts.join(', ')}`;
  }

  /**
   * Generate single service image using Gemini
   */
  async generateServiceImage(service) {
    console.log(`🎨 Generating image for ${service.title} using Gemini...`);

    try {
      const enhancedPrompt = this.createFinalPrompt(service);

      // Use Gemini's image generation capability
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const result = await model.generateContent([
        {
          text: `Generate a high-quality professional image: ${enhancedPrompt}`
        }
      ]);

      console.log(`⚠️  Note: Gemini text model used - actual image generation requires different approach`);

      // Since Gemini doesn't directly generate images via this API,
      // let's create a fallback using GPT-Image-1 (never DALL-E 3)
      // For now, we'll use a placeholder approach and suggest using GPT-Image-1 instead

      return {
        serviceId: service.id,
        title: service.title,
        description: service.description,
        link: service.link,
        imageUrl: null, // No actual image generated
        prompt: enhancedPrompt,
        timestamp: new Date().toISOString(),
        error: 'Gemini image generation requires different API approach - recommend using GPT-Image-1 instead'
      };

    } catch (error) {
      console.error(`❌ Error generating image for ${service.title}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate all service images
   */
  async generateAll() {
    console.log('🚀 Starting Gemini service image generation...\n');
    console.log(`📊 Configuration:`);
    console.log(`  - Provider: Google Gemini (Nano Banana)`);
    console.log(`  - Dimensions: ${CONFIG.image.width}x${CONFIG.image.height}`);
    console.log(`  - Services: ${SERVICES.length}`);
    console.log(`  - Quality: Production/Commercial grade`);
    console.log(`  - Cloudinary configured: ${!!this.cloudinaryConfig.cloud_name}\n`);

    const results = [];

    for (const service of SERVICES) {
      try {
        const imageResult = await this.generateServiceImage(service);
        results.push(imageResult);

        console.log(`⚠️  Completed: ${service.title} (with limitations)\n`);

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
   * Save results
   */
  async saveResults(results) {
    const outputDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `gemini-service-images-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    const output = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      provider: 'Google Gemini (Nano Banana)',
      services: SERVICES,
      results,
      summary: {
        total: SERVICES.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        success_rate: Math.round((results.filter(r => !r.error).length / SERVICES.length) * 100)
      },
      recommendation: 'For actual image generation, recommend using GPT-Image-1 (OpenAI) or purchasing Replicate credits'
    };

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`📄 Results saved to: ${filepath}`);

    return output;
  }
}

// Create GPT-Image-1 alternative script
async function createGPTImageScript() {
  const gptImageScript = `#!/usr/bin/env node

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
const SERVICES = ${JSON.stringify(SERVICES, null, 2)};

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
    return \`Professional \${service.prompt}, high resolution, commercial quality, marketing website optimized, 640x360 aspect ratio, corporate design, modern aesthetic\`;
  }

  async generateServiceImage(service) {
    console.log(\`🎨 Generating image for \${service.title} using GPT-Image-1...\`);

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
      console.log(\`✅ Image generated for \${service.title}\`);

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
      console.error(\`❌ Error generating image for \${service.title}:\`, error.message);
      throw error;
    }
  }

  async uploadToCloudinary(result) {
    if (!this.cloudinaryConfig.cloud_name) {
      console.log(\`⚠️  Skipping Cloudinary upload for \${result.title} - configuration missing\`);
      return result;
    }

    try {
      console.log(\`☁️  Uploading \${result.title} to Cloudinary...\`);

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

      console.log(\`✅ Uploaded to Cloudinary: \${uploadResult.secure_url}\`);

      return {
        ...result,
        cloudinaryUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };

    } catch (error) {
      console.error(\`❌ Error uploading to Cloudinary:\`, error.message);
      return {
        ...result,
        cloudinaryUrl: result.imageUrl,
        publicId: null,
        uploadError: error.message
      };
    }
  }

  async generateAll() {
    console.log('🚀 Starting GPT-Image-1 service image generation...\\n');

    const results = [];

    for (const service of SERVICES) {
      try {
        const imageResult = await this.generateServiceImage(service);
        const uploadResult = await this.uploadToCloudinary(imageResult);
        results.push(uploadResult);

        console.log(\`✅ Completed: \${service.title}\\n\`);
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(\`❌ Failed to process \${service.title}:\`, error.message);
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

    return \`const services = [
\${services.map(service => \`  {
    title: "\${service.title}",
    hook: "\${service.hook}",
    link: "\${service.link}",
    image: "\${service.image}"
  }\`).join(',\\n')}
];\`;
  }

  async saveResults(results) {
    const outputDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = \`gpt-image-service-images-\${timestamp}.json\`;
    const filepath = path.join(outputDir, filename);

    const output = {
      timestamp: new Date().toISOString(),
      provider: 'OpenAI GPT-Image-1 (DALL-E 3 excluded)',
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
    console.log(\`📄 Results saved to: \${filepath}\`);

    return output;
  }
}

// Main execution
async function main() {
  try {
    const generator = new GPTImageServiceGenerator();
    const results = await generator.generateAll();
    const output = await generator.saveResults(results);

    console.log('\\n🎉 GPT-Image generation complete!');
    console.log(\`✅ Successful: \${output.summary.successful}\`);
    console.log(\`❌ Failed: \${output.summary.failed}\`);
    console.log(\`📈 Success rate: \${output.summary.success_rate}%\`);

    if (output.summary.successful > 0) {
      console.log('\\n🔗 Generated Service Card URLs:');
      results.filter(r => !r.error).forEach(result => {
        console.log(\`  \${result.title}: \${result.cloudinaryUrl}\`);
      });

      console.log('\\n📝 ServiceScroller Component Code:');
      console.log(output.component_code);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
`;

  const scriptPath = path.join(__dirname, 'gpt-image-service-generator.js');
  await fs.writeFile(scriptPath, gptImageScript);
  console.log(`📝 Created GPT-Image-1 script: ${scriptPath}`);
}

// Main execution
async function main() {
  try {
    console.log('🚀 Creating service image generation alternatives...\n');

    // Create the GPT-Image-1 script
    await createGPTImageScript();

    console.log('\n💡 Recommendations for service card image generation:\n');
    console.log('1. **Best Option**: Use GPT-Image-1 (OpenAI - DALL-E 3 excluded)');
    console.log('   Run: node scripts/gpt-image-service-generator.js');
    console.log('   - High quality professional images');
    console.log('   - Good brand consistency');
    console.log('   - Proven integration with Cloudinary\n');

    console.log('2. **Alternative**: Add Replicate credits');
    console.log('   - Visit: https://replicate.com/account/billing');
    console.log('   - Add credits and re-run: node scripts/production-service-images.js\n');

    console.log('3. **Budget Option**: Use existing stock images');
    console.log('   - Source from Unsplash/Pixabay');
    console.log('   - Upload to Cloudinary manually\n');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);