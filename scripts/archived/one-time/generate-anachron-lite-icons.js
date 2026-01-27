/**
 * Generate ANACHRON Lite Service Icons
 *
 * Generates all 9 service icons using OpenAI gpt-image-1
 * Following ANACHRON Lite style system: Greco-Roman, solemn, emblematic
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI with gpt-image-1 model ONLY
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

const MODEL = 'gpt-image-1'; // HARD-PINNED

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
 * Download image from URL and save to file
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

/**
 * Generate a single service icon
 */
async function generateIcon(service, index, total) {
  console.log(`\n[${index + 1}/${total}] Generating: ${service.title}`);
  console.log(`Slug: ${service.slug}`);
  console.log(`Model: ${MODEL}`);

  try {
    // Generate image with OpenAI gpt-image-1
    // Note: gpt-image-1 only accepts model, prompt, size, and n parameters
    const response = await openai.images.generate({
      model: MODEL,
      prompt: service.prompt,
      size: '1024x1024',
      n: 1
    });

    const imageUrl = response.data[0].url;
    console.log(`Generated image URL: ${imageUrl}`);

    // Download and save image
    const filename = `${service.slug}-icon-anachron-lite.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    await downloadImage(imageUrl, filepath);
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
      provider: 'openai',
      size: '1024x1024',
      style: 'ANACHRON Lite',
      generatedAt: new Date().toISOString(),
      cost: 0.02 // gpt-image-1 standard cost
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
  console.log('=================================================');
  console.log(`Model: ${MODEL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Total Services: ${services.length}`);
  console.log('=================================================\n');

  const startTime = Date.now();
  const results = [];

  // Generate icons sequentially to avoid rate limits
  for (let i = 0; i < services.length; i++) {
    const result = await generateIcon(services[i], i, services.length);
    results.push(result);

    // Wait 2 seconds between generations to avoid rate limiting
    if (i < services.length - 1) {
      console.log('\nWaiting 2 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
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
  const totalCost = successful * 0.02; // $0.02 per image standard

  console.log(`Total Time: ${duration}s`);
  console.log(`Successful: ${successful}/${services.length}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Cost: $${totalCost.toFixed(2)}`);
  console.log('=================================================\n');

  // Save generation report
  const report = {
    generatedAt: new Date().toISOString(),
    duration: `${duration}s`,
    model: MODEL,
    provider: 'openai',
    style: 'ANACHRON Lite',
    outputDirectory: OUTPUT_DIR,
    total: services.length,
    successful: successful,
    failed: failed,
    totalCost: `$${totalCost.toFixed(2)}`,
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