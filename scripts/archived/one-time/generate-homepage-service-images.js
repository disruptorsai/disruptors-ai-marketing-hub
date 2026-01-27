/**
 * Generate High-Quality Service Images for Homepage
 *
 * Using approved models only:
 * - OpenAI gpt-image-1
 * - Google gemini-2.5-flash-image-preview (Nano Banana)
 *
 * CRITICAL: DALL-E 3 is ABSOLUTELY FORBIDDEN
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openaiGenerate, calculateCost as calculateOpenAICost } from '../src/lib/openai-image.js';
import { geminiGenerate, calculateCost as calculateGeminiCost } from '../src/lib/gemini-image.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ensure output directories exist
const publicImagesDir = path.join(projectRoot, 'public', 'images', 'services');
const generatedDir = path.join(projectRoot, 'generated');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

/**
 * Service image configurations
 */
const serviceConfigs = [
  {
    name: 'AI Automation',
    slug: 'ai-automation',
    model: 'gpt-image-1',
    prompt: `Professional AI automation dashboard interface in a sleek modern tech workspace.

Visual elements:
- Robotic process automation visualization with flowing data streams
- Connected workflow diagram nodes with glowing connections
- Automated task management system with real-time metrics
- Multiple screens showing synchronized processes
- Futuristic command center aesthetic

Color scheme: Deep blue (#1e3a8a), royal blue (#3730a3), vibrant purple (#7c3aed), soft purple (#8b5cf6) gradients

Style: Clean minimalist design, high-tech professional look, commercial photography quality, dramatic lighting, depth of field, ultra-sharp details, modern glass surfaces, holographic interface elements

Technical: 8K resolution quality, cinematic composition, professional color grading, photorealistic rendering`,
    size: '1024x1024',
    quality: 'high',
    inputFidelity: 'medium'
  },
  {
    name: 'Lead Generation',
    slug: 'lead-generation',
    model: 'gpt-image-1',
    prompt: `Advanced lead generation analytics dashboard in a professional business environment.

Visual elements:
- Conversion funnel visualization with cascading metrics
- Customer journey mapping interface with interactive nodes
- Sales pipeline stages with lead flow indicators
- Lead scoring charts with predictive analytics
- CRM data visualization with real-time updates
- Multiple graphs and KPI displays

Color scheme: Deep blue (#1e3a8a), royal blue (#3730a3), vibrant purple (#7c3aed), soft purple (#8b5cf6) with gradient transitions

Style: Modern business analytics workspace, clean dashboard design, professional office environment, commercial quality photography, sleek interface design, contemporary business aesthetic

Technical: High-resolution commercial photography, professional lighting, depth of field, ultra-sharp UI elements, modern glass and metal materials, photorealistic quality, cinematic composition`,
    size: '1024x1024',
    quality: 'high',
    inputFidelity: 'medium'
  }
];

/**
 * Generate image with metadata
 */
async function generateServiceImage(config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating: ${config.name}`);
  console.log(`Model: ${config.model}`);
  console.log(`${'='.repeat(60)}\n`);

  const startTime = Date.now();
  let imageBuffer;
  let cost;
  let metadata;

  try {
    // Generate based on model
    if (config.model === 'gpt-image-1') {
      console.log('Using OpenAI gpt-image-1...');
      imageBuffer = await openaiGenerate({
        prompt: config.prompt,
        size: config.size,
        quality: config.quality,
        inputFidelity: config.inputFidelity
      });
      cost = calculateOpenAICost({
        size: config.size,
        quality: config.quality,
        inputFidelity: config.inputFidelity
      });

      metadata = {
        service: config.name,
        slug: config.slug,
        model: 'gpt-image-1',
        provider: 'openai',
        prompt: config.prompt,
        parameters: {
          size: config.size,
          quality: config.quality,
          inputFidelity: config.inputFidelity
        },
        cost: cost,
        generatedAt: new Date().toISOString(),
        generationTime: Date.now() - startTime,
        notes: [
          'Generated with OpenAI gpt-image-1',
          'Includes C2PA metadata for authenticity',
          'Optimized for commercial use'
        ]
      };
    } else if (config.model === 'gemini-2.5-flash-image-preview') {
      console.log('Using Google Gemini 2.5 Flash Image (Nano Banana)...');
      imageBuffer = await geminiGenerate({
        prompt: config.prompt
      });
      cost = calculateGeminiCost();

      metadata = {
        service: config.name,
        slug: config.slug,
        model: 'gemini-2.5-flash-image-preview',
        provider: 'google',
        nickname: 'Nano Banana',
        prompt: config.prompt,
        parameters: {
          tokensPerImage: 1290
        },
        cost: cost,
        generatedAt: new Date().toISOString(),
        generationTime: Date.now() - startTime,
        notes: [
          'Generated with Google Gemini 2.5 Flash Image',
          'Includes SynthID invisible watermark',
          'Optimized for commercial use'
        ]
      };
    } else {
      throw new Error(`Unknown model: ${config.model}`);
    }

    // Save image
    const imagePath = path.join(publicImagesDir, `${config.slug}-${config.model.split('-')[0]}-${Date.now()}.png`);
    fs.writeFileSync(imagePath, imageBuffer);
    console.log(`✅ Image saved: ${imagePath}`);

    // Save metadata
    const metadataPath = path.join(generatedDir, `${config.slug}-metadata-${Date.now()}.json`);
    metadata.imagePath = imagePath;
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📝 Metadata saved: ${metadataPath}`);

    console.log(`💰 Cost: $${cost.toFixed(4)}`);
    console.log(`⏱️  Generation time: ${(Date.now() - startTime) / 1000}s`);

    return {
      success: true,
      config,
      metadata,
      imagePath
    };

  } catch (error) {
    console.error(`❌ Error generating ${config.name}:`, error.message);
    return {
      success: false,
      config,
      error: error.message
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🎨 HOMEPAGE SERVICE IMAGE GENERATION');
  console.log('Using approved models: gpt-image-1 and gemini-2.5-flash-image-preview');
  console.log('DALL-E 3 is ABSOLUTELY FORBIDDEN\n');

  const results = [];

  // Generate all images sequentially
  for (const config of serviceConfigs) {
    const result = await generateServiceImage(config);
    results.push(result);

    // Wait a bit between generations to avoid rate limits
    if (serviceConfigs.indexOf(config) < serviceConfigs.length - 1) {
      console.log('\nWaiting 2 seconds before next generation...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('GENERATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log('\n📊 Generated Images:');
    successful.forEach(result => {
      console.log(`\n  ${result.config.name}:`);
      console.log(`    Model: ${result.metadata.model}`);
      console.log(`    Cost: $${result.metadata.cost.toFixed(4)}`);
      console.log(`    Path: ${result.imagePath}`);
      console.log(`    Time: ${(result.metadata.generationTime / 1000).toFixed(2)}s`);
    });

    const totalCost = successful.reduce((sum, r) => sum + r.metadata.cost, 0);
    console.log(`\n💰 Total Cost: $${totalCost.toFixed(4)}`);
  }

  if (failed.length > 0) {
    console.log('\n⚠️  Failed Generations:');
    failed.forEach(result => {
      console.log(`\n  ${result.config.name}:`);
      console.log(`    Error: ${result.error}`);
    });
  }

  // Save complete report
  const reportPath = path.join(generatedDir, `homepage-service-images-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    successful: successful.length,
    failed: failed.length,
    total: results.length,
    totalCost: successful.reduce((sum, r) => sum + r.metadata.cost, 0),
    results: results.map(r => ({
      service: r.config.name,
      success: r.success,
      model: r.config.model,
      cost: r.success ? r.metadata.cost : 0,
      imagePath: r.imagePath || null,
      error: r.error || null
    }))
  }, null, 2));

  console.log(`\n📄 Full report saved: ${reportPath}`);
  console.log('\n✨ Generation complete!\n');

  return results;
}

// Execute
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});