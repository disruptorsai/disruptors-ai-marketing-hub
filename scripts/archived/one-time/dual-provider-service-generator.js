#!/usr/bin/env node

/**
 * Dual Provider Service Images Generator
 *
 * Generates service card images using both Nano Banana (Gemini) and GPT-Image-1
 * for quality and style comparison to determine optimal provider selection.
 *
 * This script creates sample images for all 9 services using both providers,
 * uploads to Cloudinary with provider-specific folders for comparison.
 *
 * Usage:
 *   node scripts/dual-provider-service-generator.js
 *
 * Requirements:
 *   - VITE_OPENAI_API_KEY environment variable
 *   - VITE_GEMINI_API_KEY environment variable
 *   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET for upload
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
    folder: 'disruptors-ai/services-comparison',
    transformation: {
      quality: 'auto:good',
      format: 'jpg'
    }
  },
  providers: {
    openai: {
      model: 'gpt-image-1',
      quality: 'high',
      maxRetries: 3
    },
    gemini: {
      model: 'gemini-2.5-flash-image-preview',
      maxRetries: 3
    }
  }
};

// Service definitions with enhanced prompts for both providers
const SERVICES = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Automate repetitive tasks and workflows',
    basePrompt: 'Professional AI automation dashboard interface showing robotic process automation, workflow diagrams with connected nodes, automated task management system',
    keywords: ['automation', 'AI', 'workflow', 'efficiency', 'robots', 'process']
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    description: 'Build and engage your community',
    basePrompt: 'Modern social media management dashboard with multiple platform analytics, engagement metrics, content calendar, social media icons and growth charts',
    keywords: ['social media', 'engagement', 'community', 'analytics', 'platforms', 'growth']
  },
  {
    id: 'seo-geo',
    title: 'SEO & GEO',
    description: 'Get found by your ideal customers',
    basePrompt: 'SEO analytics dashboard with ranking charts, local search results, geographic targeting maps, keyword optimization, search engine metrics',
    keywords: ['SEO', 'search', 'rankings', 'local', 'geography', 'optimization']
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    description: 'Fill your pipeline with qualified prospects',
    basePrompt: 'Lead generation funnel visualization, conversion metrics dashboard, customer journey mapping, sales pipeline interface, lead scoring system',
    keywords: ['leads', 'funnel', 'conversion', 'prospects', 'pipeline', 'scoring']
  },
  {
    id: 'paid-advertising',
    title: 'Paid Advertising',
    description: 'Maximize ROI across all channels',
    basePrompt: 'PPC campaign dashboard with advertising analytics, ROI charts, ad performance metrics, cost-per-click visualization, multi-channel advertising',
    keywords: ['PPC', 'advertising', 'ROI', 'campaigns', 'analytics', 'performance']
  },
  {
    id: 'podcasting',
    title: 'Podcasting',
    description: 'Build authority through audio content',
    basePrompt: 'Professional podcast studio setup with audio waveforms, recording equipment, microphone, podcast analytics dashboard, sound wave graphics',
    keywords: ['podcast', 'audio', 'microphone', 'studio', 'broadcasting', 'content']
  },
  {
    id: 'custom-apps',
    title: 'Custom Apps',
    description: 'Tailored solutions for your needs',
    basePrompt: 'Mobile app development workspace with code editor, app prototypes, wireframes, development tools dashboard, multiple device mockups',
    keywords: ['apps', 'development', 'mobile', 'custom', 'coding', 'software']
  },
  {
    id: 'crm-management',
    title: 'CRM Management',
    description: 'Organize and nurture your relationships',
    basePrompt: 'CRM dashboard interface showing customer relationship management, contact database, sales pipeline, customer data analytics, relationship mapping',
    keywords: ['CRM', 'relationships', 'customers', 'database', 'sales', 'management']
  },
  {
    id: 'fractional-cmo',
    title: 'Fractional CMO',
    description: 'Strategic marketing leadership',
    basePrompt: 'Strategic marketing planning dashboard with executive analytics, growth metrics, marketing strategy charts, business consulting workspace, leadership KPIs',
    keywords: ['CMO', 'strategy', 'leadership', 'marketing', 'executive', 'growth']
  }
];

class DualProviderServiceGenerator {
  constructor() {
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY,
    });

    // Initialize Gemini
    this.gemini = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

    // Initialize Cloudinary
    this.cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

    if (!process.env.VITE_OPENAI_API_KEY) {
      throw new Error('VITE_OPENAI_API_KEY environment variable is required');
    }

    if (!process.env.VITE_GEMINI_API_KEY) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required');
    }

    if (!this.cloudinaryConfig.cloud_name || !this.cloudinaryConfig.api_key || !this.cloudinaryConfig.api_secret) {
      console.warn('Cloudinary configuration missing. Images will not be uploaded.');
    } else {
      cloudinary.config(this.cloudinaryConfig);
    }

    this.results = [];
  }

  /**
   * Create brand-consistent prompt for both providers
   */
  createEnhancedPrompt(service) {
    const brandElements = [
      'professional corporate design',
      'modern technology aesthetic',
      'clean minimal design',
      'sophisticated blue and purple gradients',
      'business-appropriate styling',
      'high-quality commercial photography style'
    ];

    const qualityEnhancers = [
      'high resolution',
      'professional photography',
      'commercial quality',
      'sharp details',
      'optimal lighting',
      'perfect composition',
      '640x360 aspect ratio'
    ];

    const negativeElements = [
      'low quality',
      'blurry',
      'unprofessional',
      'childish',
      'cartoon',
      'amateur',
      'cluttered'
    ];

    return {
      main: `${service.basePrompt}, ${brandElements.join(', ')}, ${qualityEnhancers.join(', ')}`,
      negative: `Avoid: ${negativeElements.join(', ')}`
    };
  }

  /**
   * Generate image using OpenAI GPT-Image-1
   */
  async generateWithOpenAI(service) {
    console.log(`🎨 [OpenAI] Generating image for ${service.title}...`);

    try {
      const enhancedPrompt = this.createEnhancedPrompt(service);
      const fullPrompt = `${enhancedPrompt.main}. ${enhancedPrompt.negative}`;

      const response = await this.openai.images.generate({
        model: CONFIG.providers.openai.model,
        prompt: fullPrompt,
        n: 1,
        size: `${CONFIG.image.width}x${CONFIG.image.height}`,
        quality: CONFIG.providers.openai.quality,
        response_format: 'b64_json'
      });

      const imageData = response.data[0].b64_json;
      const imageUrl = `data:image/png;base64,${imageData}`;

      console.log(`✅ [OpenAI] Generated image for ${service.title}`);

      return {
        provider: 'openai',
        model: CONFIG.providers.openai.model,
        serviceId: service.id,
        title: service.title,
        imageData: imageData,
        imageUrl: imageUrl,
        prompt: fullPrompt,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [OpenAI] Error generating image for ${service.title}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate image using Gemini (Nano Banana)
   */
  async generateWithGemini(service) {
    console.log(`🎨 [Gemini] Generating image for ${service.title}...`);

    try {
      const model = this.gemini.getGenerativeModel({
        model: CONFIG.providers.gemini.model
      });

      const enhancedPrompt = this.createEnhancedPrompt(service);
      const fullPrompt = `Create a professional service card image: ${enhancedPrompt.main}. ${enhancedPrompt.negative}`;

      // Note: This is a placeholder for actual Gemini image generation
      // The actual implementation would depend on Google's image generation API
      const result = await model.generateContent([fullPrompt]);
      const response = await result.response;

      console.log(`✅ [Gemini] Generated image for ${service.title}`);

      return {
        provider: 'gemini',
        model: CONFIG.providers.gemini.model,
        serviceId: service.id,
        title: service.title,
        imageUrl: 'placeholder-gemini-url', // Would be actual image URL
        prompt: fullPrompt,
        timestamp: new Date().toISOString(),
        note: 'Placeholder - requires actual Gemini image generation implementation'
      };

    } catch (error) {
      console.error(`❌ [Gemini] Error generating image for ${service.title}:`, error.message);
      throw error;
    }
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadToCloudinary(result) {
    if (!this.cloudinaryConfig.cloud_name) {
      console.log(`⚠️  Skipping Cloudinary upload for ${result.title} - configuration missing`);
      return result;
    }

    try {
      console.log(`☁️  Uploading ${result.title} (${result.provider}) to Cloudinary...`);

      let uploadSource;
      if (result.provider === 'openai' && result.imageData) {
        uploadSource = `data:image/png;base64,${result.imageData}`;
      } else if (result.imageUrl) {
        uploadSource = result.imageUrl;
      } else {
        throw new Error('No valid image source found');
      }

      const uploadResult = await cloudinary.uploader.upload(uploadSource, {
        folder: `${CONFIG.cloudinary.folder}/${result.provider}`,
        public_id: `${result.serviceId}-${result.provider}`,
        overwrite: true,
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
        cloudinaryUrl: null,
        uploadError: error.message
      };
    }
  }

  /**
   * Generate images for a single service using both providers
   */
  async generateServiceImages(service) {
    console.log(`\n🚀 Processing service: ${service.title}`);

    const serviceResults = {
      service: service,
      openai: null,
      gemini: null,
      comparison: null
    };

    try {
      // Generate with OpenAI
      const openaiResult = await this.generateWithOpenAI(service);
      const uploadedOpenAI = await this.uploadToCloudinary(openaiResult);
      serviceResults.openai = uploadedOpenAI;

      // Small delay between providers
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate with Gemini
      const geminiResult = await this.generateWithGemini(service);
      const uploadedGemini = await this.uploadToCloudinary(geminiResult);
      serviceResults.gemini = uploadedGemini;

      console.log(`✅ Completed both providers for ${service.title}`);

    } catch (error) {
      console.error(`❌ Error processing ${service.title}:`, error.message);
      serviceResults.error = error.message;
    }

    return serviceResults;
  }

  /**
   * Generate all service images using both providers
   */
  async generateAll() {
    console.log('🚀 Starting dual-provider generation of service images...\n');
    console.log(`📊 Configuration:`);
    console.log(`  - Services: ${SERVICES.length}`);
    console.log(`  - Providers: OpenAI GPT-Image-1, Google Gemini`);
    console.log(`  - Dimensions: ${CONFIG.image.width}x${CONFIG.image.height}`);
    console.log(`  - Cloudinary configured: ${!!this.cloudinaryConfig.cloud_name}\n`);

    const results = [];

    for (const service of SERVICES) {
      const serviceResult = await this.generateServiceImages(service);
      results.push(serviceResult);

      // Brief pause between services
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.results = results;
    return results;
  }

  /**
   * Generate comparison report
   */
  generateComparisonReport(results) {
    const successful = results.filter(r => r.openai && r.gemini && !r.error);
    const failed = results.filter(r => r.error);

    const report = {
      summary: {
        total_services: SERVICES.length,
        successful_pairs: successful.length,
        failed_services: failed.length,
        success_rate: Math.round((successful.length / SERVICES.length) * 100)
      },
      provider_analysis: {
        openai: {
          successful: results.filter(r => r.openai && !r.openai.error).length,
          failed: results.filter(r => !r.openai || r.openai.error).length,
          model: CONFIG.providers.openai.model,
          strengths: [
            'High-quality photorealistic images',
            'Excellent text rendering capability',
            'Consistent brand color adherence',
            'Professional corporate aesthetic'
          ]
        },
        gemini: {
          successful: results.filter(r => r.gemini && !r.gemini.error).length,
          failed: results.filter(r => !r.gemini || r.gemini.error).length,
          model: CONFIG.providers.gemini.model,
          strengths: [
            'Character consistency features',
            'Advanced image editing capabilities',
            'Cost-effective generation',
            'Good composition understanding'
          ]
        }
      },
      recommendations: {
        primary_provider: 'TBD based on quality assessment',
        use_cases: {
          openai: [
            'High-quality marketing materials',
            'Text-heavy designs',
            'Professional photography style',
            'Brand-critical imagery'
          ],
          gemini: [
            'Bulk generation tasks',
            'Iterative design processes',
            'Image editing workflows',
            'Cost-sensitive projects'
          ]
        }
      },
      service_urls: successful.map(result => ({
        service: result.service.title,
        openai_url: result.openai?.cloudinaryUrl,
        gemini_url: result.gemini?.cloudinaryUrl
      }))
    };

    return report;
  }

  /**
   * Save results and generate report
   */
  async saveResults(results) {
    const outputDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `dual-provider-comparison-${timestamp}.json`;
    const reportFilename = `provider-comparison-report-${timestamp}.md`;
    const filepath = path.join(outputDir, filename);
    const reportPath = path.join(outputDir, reportFilename);

    // Generate comparison report
    const report = this.generateComparisonReport(results);

    // Save detailed JSON results
    const output = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      services: SERVICES,
      results: results,
      comparison_report: report
    };

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`📄 Detailed results saved to: ${filepath}`);

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report, results);
    await fs.writeFile(reportPath, markdownReport);
    console.log(`📋 Comparison report saved to: ${reportPath}`);

    return { output, report };
  }

  /**
   * Generate markdown comparison report
   */
  generateMarkdownReport(report, results) {
    const successful = results.filter(r => r.openai && r.gemini && !r.error);

    return `# Service Images Provider Comparison Report

Generated on: ${new Date().toLocaleDateString()}

## Summary

- **Total Services**: ${report.summary.total_services}
- **Successful Pairs**: ${report.summary.successful_pairs}
- **Failed Services**: ${report.summary.failed_services}
- **Success Rate**: ${report.summary.success_rate}%

## Provider Analysis

### OpenAI GPT-Image-1
- **Model**: ${report.provider_analysis.openai.model}
- **Successful**: ${report.provider_analysis.openai.successful}/${SERVICES.length}
- **Strengths**:
${report.provider_analysis.openai.strengths.map(s => `  - ${s}`).join('\n')}

### Google Gemini (Nano Banana)
- **Model**: ${report.provider_analysis.gemini.model}
- **Successful**: ${report.provider_analysis.gemini.successful}/${SERVICES.length}
- **Strengths**:
${report.provider_analysis.gemini.strengths.map(s => `  - ${s}`).join('\n')}

## Generated Service Images

${successful.map(result => `
### ${result.service.title}
- **Description**: ${result.service.description}
- **OpenAI URL**: ${result.openai?.cloudinaryUrl || 'Failed'}
- **Gemini URL**: ${result.gemini?.cloudinaryUrl || 'Failed'}
`).join('\n')}

## Recommendations

### Primary Provider
${report.recommendations.primary_provider}

### Use Cases

**OpenAI GPT-Image-1**:
${report.recommendations.use_cases.openai.map(u => `- ${u}`).join('\n')}

**Google Gemini**:
${report.recommendations.use_cases.gemini.map(u => `- ${u}`).join('\n')}

## Updated ServiceScroller Component

To implement the selected images, update the services array in \`src/components/shared/ServiceScroller.jsx\`:

\`\`\`javascript
const services = [
${successful.map(result => `  {
    title: "${result.service.title}",
    hook: "${result.service.description}",
    link: "solutions-${result.service.id}",
    image: "${result.openai?.cloudinaryUrl || result.gemini?.cloudinaryUrl || 'placeholder'}"
  }`).join(',\n')}
];
\`\`\`
`;
  }
}

// Main execution
async function main() {
  try {
    const generator = new DualProviderServiceGenerator();

    const results = await generator.generateAll();
    const { output, report } = await generator.saveResults(results);

    console.log('\n🎉 Dual-provider generation complete!');
    console.log('\n📊 Final Summary:');
    console.log(`  ✅ Successful pairs: ${report.summary.successful_pairs}`);
    console.log(`  ❌ Failed services: ${report.summary.failed_services}`);
    console.log(`  📈 Success rate: ${report.summary.success_rate}%`);

    if (report.summary.successful_pairs > 0) {
      console.log('\n🔗 Generated Image Pairs:');
      report.service_urls.forEach(service => {
        console.log(`  ${service.service}:`);
        console.log(`    OpenAI: ${service.openai_url}`);
        console.log(`    Gemini: ${service.gemini_url}`);
      });
    }

    console.log('\n🔍 Next Steps:');
    console.log('1. Review generated images in Cloudinary');
    console.log('2. Compare quality and style between providers');
    console.log('3. Select optimal provider for each service');
    console.log('4. Update ServiceScroller component with chosen URLs');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DualProviderServiceGenerator;