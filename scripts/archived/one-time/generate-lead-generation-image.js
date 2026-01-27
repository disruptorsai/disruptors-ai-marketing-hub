#!/usr/bin/env node

/**
 * AI-Powered Lead Generation Service Card Image Generator
 * Multi-provider approach for quality comparison
 * Uses OpenAI GPT-Image-1 and Google Gemini
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Brand and design constants
const BRAND_COLORS = '#1e3a8a, #3730a3, #7c3aed, #8b5cf6';
const BASE_STYLE = 'professional corporate design, clean minimalist composition, sophisticated lighting with soft shadows, high-end SaaS aesthetic, modern geometric elements, floating interface components, strategic negative space, commercial photography quality, award-winning design, high resolution';

// Service definition for Lead Generation
const SERVICE = {
  id: 'lead-generation',
  title: 'AI-Powered Lead Generation',
  concept: 'Intelligent Conversion Funnel with AI Analytics',
  basePrompt: `AI-powered lead generation system visualization with smart conversion funnel interface, automated prospect qualification dashboard, AI-driven lead scoring metrics floating in 3D space, machine learning analytics for lead quality prediction, intelligent customer journey mapping, automated nurturing sequence display, AI chatbot integration for lead capture, prospect flow through AI-enhanced conversion stages, sophisticated blue to purple gradient background (${BRAND_COLORS}), ${BASE_STYLE}`
};

class LeadGenerationImageGenerator {
  constructor() {
    // Initialize OpenAI
    const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.warn('⚠️  OpenAI API key not found - OpenAI generation will be skipped');
    } else {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    // Initialize Gemini
    const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.warn('⚠️  Gemini API key not found - Gemini generation will be skipped');
    } else {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }

    this.results = [];
  }

  async generateWithOpenAI() {
    if (!this.openai) {
      console.log('⏭️  Skipping OpenAI generation (no API key)');
      return null;
    }

    console.log('🤖 Generating with OpenAI GPT-Image-1...');

    try {
      const response = await this.openai.images.generate({
        model: "gpt-image-1", // NEVER use DALL-E 3
        prompt: SERVICE.basePrompt,
        n: 1,
        size: "1536x1024", // Landscape ratio for service cards
        quality: "hd",
        response_format: "url"
      });

      const result = {
        provider: 'OpenAI',
        model: 'gpt-image-1',
        imageUrl: response.data[0].url,
        prompt: SERVICE.basePrompt,
        timestamp: new Date().toISOString(),
        size: '1536x1024',
        quality: 'hd',
        success: true
      };

      console.log('✅ OpenAI generation successful');
      console.log(`🔗 URL: ${result.imageUrl}`);
      return result;

    } catch (error) {
      console.error('❌ OpenAI generation failed:', error.message);
      return {
        provider: 'OpenAI',
        model: 'gpt-image-1',
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      };
    }
  }

  async generateWithGemini() {
    if (!this.gemini) {
      console.log('⏭️  Skipping Gemini generation (no API key)');
      return null;
    }

    console.log('🧠 Generating with Google Gemini...');

    try {
      // For Gemini text generation (since image generation requires different setup)
      const model = this.gemini.getGenerativeModel({
        model: "gemini-2.0-flash-exp"
      });

      // Generate enhanced prompt for text-to-image systems
      const enhancementPrompt = `Create a detailed, professional prompt for generating a service card image for "${SERVICE.title}".

The image should convey: ${SERVICE.concept}

Base concept: ${SERVICE.basePrompt}

Enhance this prompt to be more specific about:
- Visual composition and layout
- Lighting and color scheme (using ${BRAND_COLORS})
- Professional design elements
- Tech/AI visual metaphors
- Service card appropriate dimensions

Return only the enhanced prompt, no other text.`;

      const result = await model.generateContent(enhancementPrompt);
      const response = result.response;
      const enhancedPrompt = response.text();

      console.log('✅ Gemini prompt enhancement successful');
      console.log('📝 Enhanced prompt:', enhancedPrompt.substring(0, 200) + '...');

      return {
        provider: 'Google Gemini',
        model: 'gemini-2.0-flash-exp',
        enhancedPrompt: enhancedPrompt,
        originalPrompt: SERVICE.basePrompt,
        timestamp: new Date().toISOString(),
        success: true,
        type: 'prompt_enhancement'
      };

    } catch (error) {
      console.error('❌ Gemini generation failed:', error.message);
      return {
        provider: 'Google Gemini',
        model: 'gemini-2.0-flash-exp',
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      };
    }
  }

  async generateAll() {
    console.log('🚀 Starting AI-Powered Lead Generation Image Generation');
    console.log('🎯 Multi-provider approach for quality comparison\n');

    // Generate with OpenAI
    const openaiResult = await this.generateWithOpenAI();
    if (openaiResult) {
      this.results.push(openaiResult);
    }

    // Add delay between providers
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate with Gemini
    const geminiResult = await this.generateWithGemini();
    if (geminiResult) {
      this.results.push(geminiResult);
    }

    return this.results;
  }

  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    const generatedDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(generatedDir, { recursive: true });

    const output = {
      timestamp: new Date().toISOString(),
      generator: 'Lead Generation Service Image Generator',
      service: SERVICE,
      approach: 'Multi-provider comparison for optimal quality',
      providers: ['OpenAI GPT-Image-1', 'Google Gemini (prompt enhancement)'],
      brandColors: BRAND_COLORS,
      results: this.results,
      summary: {
        totalProviders: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        successRate: this.results.length > 0 ?
          Math.round((this.results.filter(r => r.success).length / this.results.length) * 100) : 0
      },
      recommendations: this.getRecommendations()
    };

    const filename = `lead-generation-image-${timestamp}.json`;
    const filepath = path.join(generatedDir, filename);

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`📄 Results saved to: ${filepath}`);

    return { output, filepath };
  }

  getRecommendations() {
    const recommendations = [];

    const openaiResult = this.results.find(r => r.provider === 'OpenAI' && r.success);
    const geminiResult = this.results.find(r => r.provider === 'Google Gemini' && r.success);

    if (openaiResult) {
      recommendations.push({
        provider: 'OpenAI GPT-Image-1',
        strengths: [
          'High-quality commercial imagery',
          'Excellent prompt adherence',
          'Professional composition',
          'Consistent brand color implementation'
        ],
        useCase: 'Primary choice for service card images'
      });
    }

    if (geminiResult && geminiResult.type === 'prompt_enhancement') {
      recommendations.push({
        provider: 'Google Gemini',
        strengths: [
          'Advanced prompt enhancement capabilities',
          'Detailed compositional guidance',
          'Creative visual suggestions'
        ],
        useCase: 'Prompt optimization and creative enhancement'
      });
    }

    return recommendations;
  }

  getServiceCardCode(imageUrl) {
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
    "Conversion optimization"
  ]
};`;
  }
}

// Main execution
async function main() {
  try {
    const generator = new LeadGenerationImageGenerator();

    console.log('🔑 Environment Check:');
    console.log(`OpenAI Key: ${process.env.VITE_OPENAI_API_KEY ? '✅ Found' : '❌ Missing'}`);
    console.log(`Gemini Key: ${process.env.VITE_GEMINI_API_KEY ? '✅ Found' : '❌ Missing'}`);
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
        if (result.imageUrl) {
          console.log(`  ${result.provider}: ${result.imageUrl}`);
        } else if (result.enhancedPrompt) {
          console.log(`  ${result.provider}: Enhanced prompt generated`);
        }
      });

      // Show service card code for the best image
      const bestImage = successfulResults.find(r => r.imageUrl);
      if (bestImage) {
        console.log('\n📝 Service Card Component Code:');
        console.log(generator.getServiceCardCode(bestImage.imageUrl));
      }
    }

    // Show recommendations
    if (output.recommendations.length > 0) {
      console.log('\n💡 Provider Recommendations:');
      output.recommendations.forEach(rec => {
        console.log(`\n${rec.provider}:`);
        console.log(`  Use Case: ${rec.useCase}`);
        console.log(`  Strengths: ${rec.strengths.join(', ')}`);
      });
    }

    console.log(`\n📁 Full results saved to: ${filepath}`);

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default LeadGenerationImageGenerator;