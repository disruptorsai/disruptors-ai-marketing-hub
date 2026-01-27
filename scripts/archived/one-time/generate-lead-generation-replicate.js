#!/usr/bin/env node

/**
 * AI-Powered Lead Generation Service Card Image Generator
 * Using Replicate API with multiple models for comparison
 * Focus on professional service card design
 */

import Replicate from 'replicate';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Brand and design constants
const BRAND_COLORS = '#1e3a8a, #3730a3, #7c3aed, #8b5cf6';
const BASE_STYLE = 'professional corporate design, clean minimalist composition, sophisticated lighting with soft shadows, high-end SaaS aesthetic, modern geometric elements, floating interface components, strategic negative space, commercial photography quality, award-winning design, high resolution, 8k quality';

// Service definition for Lead Generation
const SERVICE = {
  id: 'lead-generation',
  title: 'AI-Powered Lead Generation',
  concept: 'Intelligent Conversion Funnel with AI Analytics',
  basePrompt: `AI-powered lead generation system visualization with smart conversion funnel interface, automated prospect qualification dashboard, AI-driven lead scoring metrics floating in 3D space, machine learning analytics for lead quality prediction, intelligent customer journey mapping, automated nurturing sequence display, AI chatbot integration for lead capture, prospect flow through AI-enhanced conversion stages, sophisticated blue to purple gradient background using colors ${BRAND_COLORS}, ${BASE_STYLE}, professional business illustration, modern tech aesthetic, suitable for marketing website service card`
};

// Models to test for quality comparison
const MODELS = [
  {
    name: 'Flux Pro',
    model: 'black-forest-labs/flux-pro',
    description: 'High-quality professional imagery'
  },
  {
    name: 'Flux Dev',
    model: 'black-forest-labs/flux-dev',
    description: 'Developer-focused model with good prompt adherence'
  },
  {
    name: 'SDXL',
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    description: 'Stable Diffusion XL for reliable results'
  }
];

class LeadGenerationReplicateGenerator {
  constructor() {
    const replicateToken = process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      throw new Error('VITE_REPLICATE_API_TOKEN or REPLICATE_API_TOKEN environment variable is required');
    }

    this.replicate = new Replicate({
      auth: replicateToken,
    });

    this.results = [];
  }

  async generateWithModel(modelConfig) {
    console.log(`🎨 Generating with ${modelConfig.name}...`);
    console.log(`📝 Description: ${modelConfig.description}`);

    try {
      let input;

      // Configure input based on model
      if (modelConfig.model.includes('flux')) {
        input = {
          prompt: SERVICE.basePrompt,
          width: 1536,
          height: 1024,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50
        };
      } else if (modelConfig.model.includes('sdxl')) {
        input = {
          prompt: SERVICE.basePrompt,
          width: 1536,
          height: 1024,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
          scheduler: "K_EULER"
        };
      } else {
        // Generic input for other models
        input = {
          prompt: SERVICE.basePrompt,
          width: 1536,
          height: 1024
        };
      }

      console.log(`⚙️  Input config: ${JSON.stringify(input, null, 2)}`);

      const output = await this.replicate.run(modelConfig.model, { input });

      const imageUrl = Array.isArray(output) ? output[0] : output;

      const result = {
        provider: 'Replicate',
        model: modelConfig.name,
        modelId: modelConfig.model,
        imageUrl: imageUrl,
        prompt: SERVICE.basePrompt,
        input: input,
        timestamp: new Date().toISOString(),
        size: '1536x1024',
        success: true,
        description: modelConfig.description
      };

      console.log(`✅ ${modelConfig.name} generation successful`);
      console.log(`🔗 URL: ${imageUrl}`);
      return result;

    } catch (error) {
      console.error(`❌ ${modelConfig.name} generation failed:`, error.message);
      return {
        provider: 'Replicate',
        model: modelConfig.name,
        modelId: modelConfig.model,
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false,
        description: modelConfig.description
      };
    }
  }

  async generateAll() {
    console.log('🚀 Starting AI-Powered Lead Generation Image Generation');
    console.log('🎯 Multi-model Replicate approach for quality comparison');
    console.log(`🔧 Testing ${MODELS.length} different models\n`);

    for (const modelConfig of MODELS) {
      try {
        const result = await this.generateWithModel(modelConfig);
        this.results.push(result);

        console.log(`✅ Completed: ${modelConfig.name}\n`);

        // Add delay between models to be respectful to API
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.error(`❌ Failed to process ${modelConfig.name}:`, error.message);
        this.results.push({
          provider: 'Replicate',
          model: modelConfig.name,
          modelId: modelConfig.model,
          error: error.message,
          timestamp: new Date().toISOString(),
          success: false
        });
      }
    }

    return this.results;
  }

  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    const generatedDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(generatedDir, { recursive: true });

    const output = {
      timestamp: new Date().toISOString(),
      generator: 'Lead Generation Replicate Multi-Model Generator',
      service: SERVICE,
      approach: 'Multi-model Replicate comparison for optimal quality',
      models: MODELS,
      brandColors: BRAND_COLORS,
      results: this.results,
      summary: {
        totalModels: MODELS.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        successRate: MODELS.length > 0 ?
          Math.round((this.results.filter(r => r.success).length / MODELS.length) * 100) : 0
      },
      recommendations: this.getRecommendations(),
      serviceCardCode: this.getServiceCardCode()
    };

    const filename = `lead-generation-replicate-${timestamp}.json`;
    const filepath = path.join(generatedDir, filename);

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`📄 Results saved to: ${filepath}`);

    return { output, filepath };
  }

  getRecommendations() {
    const successfulResults = this.results.filter(r => r.success);

    if (successfulResults.length === 0) {
      return [{
        note: 'No successful generations to analyze',
        suggestion: 'Check API credentials and model availability'
      }];
    }

    return successfulResults.map(result => ({
      model: result.model,
      strengths: this.getModelStrengths(result.model),
      useCase: this.getModelUseCase(result.model),
      imageUrl: result.imageUrl
    }));
  }

  getModelStrengths(modelName) {
    const strengths = {
      'Flux Pro': ['Premium quality output', 'Excellent prompt adherence', 'Professional composition'],
      'Flux Dev': ['Good balance of quality and speed', 'Developer-friendly', 'Consistent results'],
      'SDXL': ['Stable and reliable', 'Good for corporate imagery', 'Predictable results']
    };
    return strengths[modelName] || ['Quality image generation'];
  }

  getModelUseCase(modelName) {
    const useCases = {
      'Flux Pro': 'Primary choice for high-end service cards',
      'Flux Dev': 'Good alternative with faster generation',
      'SDXL': 'Reliable fallback option'
    };
    return useCases[modelName] || 'General image generation';
  }

  getServiceCardCode() {
    const bestResult = this.results.find(r => r.success);
    const imageUrl = bestResult ? bestResult.imageUrl : 'YOUR_GENERATED_IMAGE_URL';

    return `// Service card data for AI-Powered Lead Generation
const leadGenerationService = {
  title: "${SERVICE.title}",
  hook: "Transform prospects into qualified leads with AI",
  description: "Intelligent lead scoring, automated nurturing sequences, and AI-powered qualification systems that maximize conversion rates.",
  link: "solutions-lead-generation",
  image: "${imageUrl}",
  features: [
    "AI-powered lead scoring",
    "Automated qualification systems",
    "Smart nurturing sequences",
    "Conversion rate optimization",
    "Intelligent prospect routing",
    "Predictive analytics"
  ],
  cta: "Start Generating Leads"
};

// ServiceScroller integration
const services = [
  // ... other services
  {
    title: "${SERVICE.title}",
    hook: "Transform prospects into qualified leads with AI",
    link: "solutions-lead-generation",
    image: "${imageUrl}"
  }
  // ... other services
];`;
  }

  getBestResult() {
    // Prioritize Flux Pro, then Flux Dev, then SDXL
    const priority = ['Flux Pro', 'Flux Dev', 'SDXL'];

    for (const modelName of priority) {
      const result = this.results.find(r => r.success && r.model === modelName);
      if (result) return result;
    }

    // Return any successful result
    return this.results.find(r => r.success);
  }
}

// Main execution
async function main() {
  try {
    const generator = new LeadGenerationReplicateGenerator();

    console.log('🔑 Environment Check:');
    console.log(`Replicate Token: ${process.env.VITE_REPLICATE_API_TOKEN ? '✅ Found' : '❌ Missing'}`);
    console.log('');

    const results = await generator.generateAll();
    const { output, filepath } = await generator.saveResults();

    console.log('\n🎉 Lead Generation Image Generation Complete!');
    console.log(`✅ Successful: ${output.summary.successful}`);
    console.log(`❌ Failed: ${output.summary.failed}`);
    console.log(`📈 Success rate: ${output.summary.successRate}%`);

    // Show successful results
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      console.log('\n🖼️  Generated Images:');
      successfulResults.forEach(result => {
        console.log(`  ${result.model}: ${result.imageUrl}`);
      });

      // Show the best result
      const bestResult = generator.getBestResult();
      if (bestResult) {
        console.log(`\n🏆 Recommended Result: ${bestResult.model}`);
        console.log(`🔗 Best URL: ${bestResult.imageUrl}`);
      }

      console.log('\n📝 Service Card Component Code:');
      console.log(output.serviceCardCode);
    }

    // Show failed results
    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log('\n❌ Failed Generations:');
      failedResults.forEach(result => {
        console.log(`  ${result.model}: ${result.error}`);
      });
    }

    // Show recommendations
    if (output.recommendations.length > 0) {
      console.log('\n💡 Model Recommendations:');
      output.recommendations.forEach(rec => {
        if (rec.model) {
          console.log(`\n${rec.model}:`);
          console.log(`  Use Case: ${rec.useCase}`);
          console.log(`  Strengths: ${rec.strengths.join(', ')}`);
        }
      });
    }

    console.log(`\n📁 Full results saved to: ${filepath}`);

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Auto-execute when run directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
} else if (process.argv[1] && process.argv[1].includes('generate-lead-generation-replicate.js')) {
  main().catch(console.error);
}

export default LeadGenerationReplicateGenerator;