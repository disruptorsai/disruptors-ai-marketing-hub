/**
 * Generate ANACHRON Lite Service Icons with Google Gemini
 * Using gemini-2.5-flash-image-preview (Nano Banana) - APPROVED MODEL
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini with approved model
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const MODEL = 'gemini-2.5-flash-image-preview'; // APPROVED - Nano Banana

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'generated', 'anachron-lite');

// Service icon configurations with ANACHRON Lite prompts
const services = [
  {
    slug: 'ai-automation',
    title: 'AI Automation',
    prompt: "Minimal ancient-style icon of an astrolabe merged with circuit meander, 2px ink stroke (#1F1B17), lapis accent (#2C6BAA), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  },
  {
    slug: 'social-media-marketing',
    title: 'Social Media Marketing',
    prompt: "Minimal ancient-style icon of connected oracle eyes in a network pattern, 2px ink stroke (#1F1B17), terracotta accent (#C96F4C), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  },
  {
    slug: 'seo-geo',
    title: 'SEO & GEO',
    prompt: "Minimal ancient-style icon of an oracle eye within a sun disk and compass points, 2px ink stroke (#1F1B17), verdigris accent (#3C7A6A), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  },
  {
    slug: 'lead-generation',
    title: 'Lead Generation',
    prompt: "Minimal ancient-style icon of an amphora pouring geometric water into a basin, 2px ink stroke (#1F1B17), lapis accent (#2C6BAA), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  },
  {
    slug: 'paid-advertising',
    title: 'Paid Advertising',
    prompt: "Minimal ancient-style icon of a target sun disk with laurel wreath border, 2px ink stroke (#1F1B17), muted gold accent (#C9A53B), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  },
  {
    slug: 'podcasting',
    title: 'Podcasting',
    prompt: "Minimal ancient-style icon of an amphora with wave sound patterns emerging, 2px ink stroke (#1F1B17), terracotta accent (#C96F4C), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  },
  {
    slug: 'custom-apps',
    title: 'Custom Apps',
    prompt: "Minimal ancient-style icon of mosaic tesserae forming a modular grid pattern, 2px ink stroke (#1F1B17), verdigris accent (#3C7A6A), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  },
  {
    slug: 'crm-management',
    title: 'CRM Management',
    prompt: "Minimal ancient-style icon of multiple scrolls interconnected with handshake symbol, 2px ink stroke (#1F1B17), lapis accent (#2C6BAA), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  },
  {
    slug: 'fractional-cmo',
    title: 'Fractional CMO',
    prompt: "Minimal ancient-style icon of a column capital with laurel wreath and strategic arrows, 2px ink stroke (#1F1B17), muted gold accent (#C9A53B), transparent background, flat vector illustration, subtle fresco texture, Greco-Roman emblematic style"
  }
];

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a single service icon using Gemini
 */
async function generateIcon(service, index, total) {
  console.log(`\n[${index + 1}/${total}] Generating: ${service.title}`);
  console.log(`Slug: ${service.slug}`);
  console.log(`Model: ${MODEL}`);

  try {
    const model = genAI.getGenerativeModel({ model: MODEL });

    // Generate image
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: service.prompt
        }]
      }]
    });

    const response = await result.response;

    // Extract image data from response
    let imageData = null;
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }
      if (imageData) break;
    }

    if (!imageData) {
      throw new Error('No image data in response');
    }

    // Save image
    const filename = `${service.slug}-icon-anachron-lite.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filepath, buffer);
    console.log(`Saved to: ${filepath}`);

    // Save metadata
    const metadataFilename = `${service.slug}-icon-metadata.json`;
    const metadataPath = path.join(OUTPUT_DIR, metadataFilename);

    const metadata = {
      service: service.title,
      slug: service.slug,
      filename: filename,
      prompt: service.prompt,
      model: MODEL,
      provider: 'google',
      style: 'ANACHRON Lite',
      capabilities: ['editing', 'composition', 'character_consistency', 'text_rendering'],
      features: ['synthid_watermark', 'conversational_refinement'],
      generatedAt: new Date().toISOString(),
      cost: 0.039 // Gemini 2.5 Flash Image cost
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`Metadata saved to: ${metadataPath}`);

    return {
      success: true,
      service: service.title,
      slug: service.slug,
      filename: filename,
      filepath: filepath,
      metadata: metadata
    };

  } catch (error) {
    console.error(`Error generating ${service.title}:`, error.message);
    return {
      success: false,
      service: service.title,
      slug: service.slug,
      error: error.message
    };
  }
}

/**
 * Generate all icons
 */
async function generateAllIcons() {
  console.log('=================================================');
  console.log('ANACHRON Lite Service Icons Generation');
  console.log('Using Google Gemini (Nano Banana) - APPROVED MODEL');
  console.log('=================================================');
  console.log(`Model: ${MODEL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Total Services: ${services.length}`);
  console.log('=================================================\n');

  const startTime = Date.now();
  const results = [];

  // Generate icons sequentially
  for (let i = 0; i < services.length; i++) {
    const result = await generateIcon(services[i], i, services.length);
    results.push(result);

    // Wait 3 seconds between generations to avoid rate limiting
    if (i < services.length - 1) {
      console.log('\nWaiting 3 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Generate summary report
  console.log('\n=================================================');
  console.log('Generation Complete!');
  console.log('=================================================');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalCost = successful * 0.039;

  console.log(`Total Time: ${duration}s`);
  console.log(`Successful: ${successful}/${services.length}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Cost: $${totalCost.toFixed(3)}`);
  console.log('=================================================\n');

  // Save generation report
  const report = {
    generatedAt: new Date().toISOString(),
    duration: `${duration}s`,
    model: MODEL,
    provider: 'google',
    style: 'ANACHRON Lite',
    outputDirectory: OUTPUT_DIR,
    total: services.length,
    successful: successful,
    failed: failed,
    totalCost: `$${totalCost.toFixed(3)}`,
    results: results
  };

  const reportPath = path.join(OUTPUT_DIR, 'generation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Generation report saved to: ${reportPath}\n`);

  // Print successful generations
  if (successful > 0) {
    console.log('Successfully Generated:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  - ${r.service} (${r.filename})`);
    });
    console.log('');
  }

  // Print failed generations
  if (failed > 0) {
    console.log('Failed Generations:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.service}: ${r.error}`);
    });
    console.log('');
  }

  console.log('Next Steps:');
  console.log('1. Review generated icons in public/generated/anachron-lite/');
  console.log('2. Update ServiceScroller.jsx with new file paths');
  console.log('3. Replace old icon references throughout the codebase\n');

  return report;
}

// Run generation
generateAllIcons()
  .then(() => {
    console.log('Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });