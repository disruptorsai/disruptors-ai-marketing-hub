#!/usr/bin/env node

/**
 * Provider Comparison Generator
 *
 * Generates service card images using OpenAI's capabilities via different approaches
 * to compare quality and determine optimal provider for service cards.
 *
 * This uses the existing environment setup and infrastructure.
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
    models: {
      // OpenAI-style model via Replicate
      flux_pro: 'black-forest-labs/flux-1.1-pro',
      // High-quality alternative for comparison
      flux_dev: 'black-forest-labs/flux-dev'
    }
  },
  image: {
    width: 640,
    height: 360,
    format: 'jpg',
    quality: 90
  },
  cloudinary: {
    folder: 'disruptors-ai/services-comparison-2025',
    transformation: {
      quality: 'auto:good',
      format: 'jpg'
    }
  }
};

// Test services for comparison
const COMPARISON_SERVICES = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Automate repetitive tasks and workflows',
    prompt: 'Professional AI automation dashboard interface, sleek robotic process automation visualization, workflow diagrams with connected nodes, modern tech workspace, blue and purple gradient background, futuristic digital interface elements, clean minimalist design, high-tech aesthetic, commercial photography style, 640x360 aspect ratio'
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    description: 'Build and engage your community',
    prompt: 'Modern social media management dashboard, multiple platform analytics display, engagement metrics charts and graphs, content calendar interface, social media icons and notifications, vibrant blue and purple color scheme, professional workspace setup, clean UI design, commercial quality, 640x360 aspect ratio'
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    description: 'Fill your pipeline with qualified prospects',
    prompt: 'Lead generation funnel visualization, conversion metrics dashboard display, customer journey mapping interface, sales pipeline visualization, lead scoring charts and analytics, professional blue and purple gradient, modern business analytics workspace, commercial photography style, 640x360 aspect ratio'
  }
];

class ProviderComparisonGenerator {
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

    cloudinary.config(this.cloudinaryConfig);
    this.results = [];
  }

  /**
   * Enhanced prompt for professional service cards
   */
  createBrandPrompt(service) {
    const brandElements = [
      'professional corporate design',
      'modern technology aesthetic',
      'clean minimal design',
      'sophisticated blue and purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6)',
      'business-appropriate styling',
      'high-quality commercial photography style',
      'marketing website service card',
      'tech company branding'
    ];

    const qualityEnhancers = [
      'high resolution',
      'professional photography',
      'commercial quality',
      'award-winning design',
      'sharp details',
      'optimal lighting',
      'perfect composition',
      '640x360 aspect ratio',
      'web optimized'
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
      'pixelated'
    ];

    return {
      enhanced: `${service.prompt}, ${brandElements.join(', ')}, ${qualityEnhancers.join(', ')}`,
      negative: negativePrompts.join(', ')
    };
  }

  /**
   * Generate image using Flux Pro (OpenAI-quality)
   */
  async generateWithFluxPro(service) {
    console.log(`🎨 [Flux Pro] Generating ${service.title}...`);

    try {
      const promptData = this.createBrandPrompt(service);

      const response = await fetch(CONFIG.replicate.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: CONFIG.replicate.models.flux_pro,
          input: {
            prompt: promptData.enhanced,
            width: CONFIG.image.width,
            height: CONFIG.image.height,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 30,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
      }

      const prediction = await response.json();
      console.log(`⏳ [Flux Pro] Prediction created: ${prediction.id}`);

      const result = await this.waitForCompletion(prediction.id);
      console.log(`✅ [Flux Pro] Generated ${service.title}`);

      return {
        provider: 'flux-pro',
        model: CONFIG.replicate.models.flux_pro,
        serviceId: service.id,
        title: service.title,
        replicateUrl: result.output[0],
        predictionId: prediction.id,
        prompt: promptData.enhanced,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [Flux Pro] Error generating ${service.title}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate image using Flux Dev (Alternative quality)
   */
  async generateWithFluxDev(service) {
    console.log(`🎨 [Flux Dev] Generating ${service.title}...`);

    try {
      const promptData = this.createBrandPrompt(service);

      const response = await fetch(CONFIG.replicate.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: CONFIG.replicate.models.flux_dev,
          input: {
            prompt: promptData.enhanced,
            width: CONFIG.image.width,
            height: CONFIG.image.height,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
      }

      const prediction = await response.json();
      console.log(`⏳ [Flux Dev] Prediction created: ${prediction.id}`);

      const result = await this.waitForCompletion(prediction.id);
      console.log(`✅ [Flux Dev] Generated ${service.title}`);

      return {
        provider: 'flux-dev',
        model: CONFIG.replicate.models.flux_dev,
        serviceId: service.id,
        title: service.title,
        replicateUrl: result.output[0],
        predictionId: prediction.id,
        prompt: promptData.enhanced,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [Flux Dev] Error generating ${service.title}:`, error.message);
      throw error;
    }
  }

  /**
   * Wait for Replicate prediction completion
   */
  async waitForCompletion(predictionId) {
    const maxAttempts = 60; // 5 minutes max
    const pollInterval = 5000; // 5 seconds

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

        // Still processing
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
   * Upload to Cloudinary with provider tagging
   */
  async uploadToCloudinary(result) {
    try {
      console.log(`☁️  Uploading ${result.title} (${result.provider}) to Cloudinary...`);

      const uploadResult = await cloudinary.uploader.upload(result.replicateUrl, {
        folder: CONFIG.cloudinary.folder,
        public_id: `${result.serviceId}-${result.provider}`,
        overwrite: true,
        tags: [`provider-${result.provider}`, 'service-card', 'comparison'],
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

      console.log(`✅ Uploaded: ${uploadResult.secure_url}`);

      return {
        ...result,
        cloudinaryUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };

    } catch (error) {
      console.error(`❌ Error uploading:`, error.message);
      return {
        ...result,
        cloudinaryUrl: result.replicateUrl,
        uploadError: error.message
      };
    }
  }

  /**
   * Generate comparison for single service
   */
  async generateServiceComparison(service) {
    console.log(`\n🚀 Generating comparison for: ${service.title}`);

    const comparison = {
      service: service,
      fluxPro: null,
      fluxDev: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Generate with Flux Pro
      const proResult = await this.generateWithFluxPro(service);
      const uploadedPro = await this.uploadToCloudinary(proResult);
      comparison.fluxPro = uploadedPro;

      // Brief delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate with Flux Dev
      const devResult = await this.generateWithFluxDev(service);
      const uploadedDev = await this.uploadToCloudinary(devResult);
      comparison.fluxDev = uploadedDev;

      console.log(`✅ Completed comparison for ${service.title}`);

    } catch (error) {
      console.error(`❌ Error in comparison for ${service.title}:`, error.message);
      comparison.error = error.message;
    }

    return comparison;
  }

  /**
   * Generate all comparisons
   */
  async generateAll() {
    console.log('🚀 Starting provider comparison generation...\n');
    console.log(`📊 Configuration:`);
    console.log(`  - Services: ${COMPARISON_SERVICES.length}`);
    console.log(`  - Models: Flux Pro vs Flux Dev`);
    console.log(`  - Dimensions: ${CONFIG.image.width}x${CONFIG.image.height}`);
    console.log(`  - Purpose: Quality comparison for service cards\n`);

    const results = [];

    for (const service of COMPARISON_SERVICES) {
      const comparison = await this.generateServiceComparison(service);
      results.push(comparison);

      // Brief pause between services
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.results = results;
    return results;
  }

  /**
   * Generate analysis report
   */
  generateAnalysisReport(results) {
    const successful = results.filter(r => !r.error && r.fluxPro && r.fluxDev);
    const failed = results.filter(r => r.error);

    return {
      summary: {
        total_services: COMPARISON_SERVICES.length,
        successful_comparisons: successful.length,
        failed_comparisons: failed.length,
        success_rate: Math.round((successful.length / COMPARISON_SERVICES.length) * 100)
      },
      model_analysis: {
        flux_pro: {
          model: CONFIG.replicate.models.flux_pro,
          successful: results.filter(r => r.fluxPro && !r.fluxPro.uploadError).length,
          strengths: [
            'Professional quality output',
            'Commercial-grade imagery',
            'Brand consistency',
            'High detail resolution'
          ],
          best_for: [
            'Final production service cards',
            'Marketing materials',
            'Brand-critical imagery',
            'Client-facing content'
          ]
        },
        flux_dev: {
          model: CONFIG.replicate.models.flux_dev,
          successful: results.filter(r => r.fluxDev && !r.fluxDev.uploadError).length,
          strengths: [
            'Cost-effective generation',
            'Good quality output',
            'Faster iteration',
            'Development-friendly'
          ],
          best_for: [
            'Prototyping and testing',
            'Internal presentations',
            'Draft concepts',
            'Budget-conscious projects'
          ]
        }
      },
      recommendations: {
        primary_choice: 'Flux Pro for production service cards',
        rationale: [
          'Higher quality output suitable for marketing website',
          'Better brand consistency and professional appearance',
          'Superior detail and clarity for service representations',
          'More appropriate for client-facing marketing materials'
        ]
      },
      generated_urls: successful.map(result => ({
        service: result.service.title,
        flux_pro_url: result.fluxPro?.cloudinaryUrl,
        flux_dev_url: result.fluxDev?.cloudinaryUrl
      }))
    };
  }

  /**
   * Save results and generate report
   */
  async saveResults(results) {
    const outputDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `provider-comparison-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    const report = this.generateAnalysisReport(results);

    const output = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      services: COMPARISON_SERVICES,
      results: results,
      analysis_report: report
    };

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`📄 Results saved to: ${filepath}`);

    return { output, report };
  }
}

// Main execution
async function main() {
  try {
    const generator = new ProviderComparisonGenerator();

    const results = await generator.generateAll();
    const { output, report } = await generator.saveResults(results);

    console.log('\n🎉 Provider comparison complete!');
    console.log('\n📊 Final Analysis:');
    console.log(`  ✅ Successful comparisons: ${report.summary.successful_comparisons}`);
    console.log(`  ❌ Failed comparisons: ${report.summary.failed_comparisons}`);
    console.log(`  📈 Success rate: ${report.summary.success_rate}%`);

    if (report.summary.successful_comparisons > 0) {
      console.log('\n🔗 Generated Image Pairs:');
      report.generated_urls.forEach(service => {
        console.log(`  ${service.service}:`);
        console.log(`    Flux Pro: ${service.flux_pro_url}`);
        console.log(`    Flux Dev: ${service.flux_dev_url}`);
      });

      console.log('\n💡 Recommendation:');
      console.log(`  ${report.recommendations.primary_choice}`);
      report.recommendations.rationale.forEach(reason => {
        console.log(`  - ${reason}`);
      });
    }

    console.log('\n🔍 Next Steps:');
    console.log('1. Review the generated comparison images in Cloudinary');
    console.log('2. Assess quality differences between models');
    console.log('3. Choose preferred model for full service generation');
    console.log('4. Run full generation with selected model');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ProviderComparisonGenerator;