/**
 * Generate Transparent Service Icons
 * Creates 9 transparent Anachronistic-lite style icons for all services
 * Uses OpenAI gpt-image-1 for best quality and consistency
 *
 * Style: Minimalist, futuristic, clean geometric shapes with transparency
 * Output: 1024x1024 PNG files saved to public/generated/
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'generated');

// Service icon specifications with Anachronistic-lite transparent style
const ICONS = [
  {
    id: 'ai-automation',
    service: 'AI Automation',
    prompt: 'A minimalist transparent icon representing AI automation and intelligent workflows. Features clean geometric shapes: interconnected nodes forming a neural network pattern, flowing circuit paths, abstract AI brain symbol with crystalline structures. Anachronistic-lite style with futuristic minimal design, ultra-crisp lines, subtle gradients transitioning from deep blue (#2C6BAA) to gold (#C9A53B). Professional tech aesthetic with sacred geometry foundation. Completely transparent background, PNG format with alpha channel. Clean edges, high contrast, 1:1 aspect ratio, centered composition on invisible 24px grid. No text, no background, pure icon floating in space.'
  },
  {
    id: 'social-media-marketing',
    service: 'Social Media Marketing',
    prompt: 'A minimalist transparent icon representing social media marketing and community engagement. Features clean geometric shapes: abstract social network nodes connected by flowing lines, modern speech bubbles or chat symbols, engagement metrics visualization with orbital patterns. Anachronistic-lite style with modern minimal design, ultra-crisp lines, subtle gradients in blue (#2C6BAA) and gold (#C9A53B). Professional tech aesthetic. Completely transparent background, PNG format with alpha channel. Clean edges, emblematic style, 1:1 aspect ratio, centered composition. No text, no background, pure icon.'
  },
  {
    id: 'seo-geo',
    service: 'SEO & GEO',
    prompt: 'A minimalist transparent icon representing search engine optimization and location-based discovery. Features clean geometric shapes: futuristic magnifying glass merged with a location pin, search result bars or ranking visualization, globe with connection points and orbital rings. Anachronistic-lite style with futuristic minimal design, ultra-crisp lines, subtle gradients in blue (#2C6BAA), verdigris (#3C7A6A), and gold (#C9A53B). Professional tech aesthetic. Completely transparent background, PNG format with alpha channel. Clean edges, 1:1 aspect ratio. No text, no background.'
  },
  {
    id: 'lead-generation',
    service: 'Lead Generation',
    prompt: 'A minimalist transparent icon representing lead generation and sales pipeline. Features clean geometric shapes: modern funnel shape with flowing particles or data points entering at top, abstract prospect profiles or user avatars, conversion path visualization with directional arrows. Anachronistic-lite style with modern minimal design, ultra-crisp lines, subtle gradients in blue (#2C6BAA) and terracotta (#C96F4C). Professional tech aesthetic. Completely transparent background, PNG format with alpha channel. Clean edges, 1:1 aspect ratio. No text, no background.'
  },
  {
    id: 'paid-advertising',
    service: 'Paid Advertising',
    prompt: 'A minimalist transparent icon representing paid advertising and marketing ROI. Features clean geometric shapes: target with precise arrow hitting bullseye center, ascending graph or chart showing exponential growth, abstract ROI metrics visualization with laurel frame. Anachronistic-lite style with futuristic minimal design, ultra-crisp lines, subtle gradients in gold (#C9A53B), blue (#2C6BAA), and terracotta (#C96F4C). Professional tech aesthetic. Completely transparent background, PNG format with alpha channel. Clean edges, 1:1 aspect ratio. No text, no background.'
  },
  {
    id: 'podcasting',
    service: 'Podcasting',
    prompt: 'A minimalist transparent icon representing podcasting and audio broadcasting. Features clean geometric shapes: sleek modern microphone silhouette, concentric sound wave visualization radiating outward, broadcast signal patterns. Anachronistic-lite style with modern minimal design, ultra-crisp lines, subtle gradients in terracotta (#C96F4C), gold (#C9A53B), and blue (#2C6BAA). Professional tech aesthetic. Completely transparent background, PNG format with alpha channel. Clean edges, 1:1 aspect ratio. No text, no background.'
  },
  {
    id: 'custom-apps',
    service: 'Custom Apps',
    prompt: 'A minimalist transparent icon representing custom application development and software solutions. Features clean geometric shapes: abstract app window or interface blocks with rounded corners, code brackets or development symbols, modular building blocks connecting together with circuit patterns. Anachronistic-lite style with futuristic minimal design, ultra-crisp lines, subtle gradients in blue (#2C6BAA), verdigris (#3C7A6A), and gold (#C9A53B). Professional tech aesthetic. Completely transparent background, PNG format with alpha channel. Clean edges, 1:1 aspect ratio. No text, no background.'
  },
  {
    id: 'crm-management',
    service: 'CRM Management',
    prompt: 'A minimalist transparent icon representing customer relationship management and organization. Features clean geometric shapes: interconnected user profiles or contact cards in circular arrangement, database or filing system visualization, relationship mapping network with connection nodes. Anachronistic-lite style with modern minimal design, ultra-crisp lines, subtle gradients in blue (#2C6BAA), terracotta (#C96F4C), and gold accents. Professional tech aesthetic. Completely transparent background, PNG format with alpha channel. Clean edges, 1:1 aspect ratio. No text, no background.'
  },
  {
    id: 'fractional-cmo',
    service: 'Fractional CMO',
    prompt: 'A minimalist transparent icon representing marketing leadership and executive strategy. Features clean geometric shapes: elegant chess piece (king or queen) symbolizing strategic leadership, organizational chart or hierarchy visualization, strategic roadmap or compass with directional markers and laurel accents. Anachronistic-lite style with futuristic minimal design, ultra-crisp lines, subtle gradients in gold (#C9A53B), terracotta (#C96F4C), and blue (#2C6BAA). Professional tech aesthetic. Completely transparent background, PNG format with alpha channel. Clean edges, 1:1 aspect ratio. No text, no background.'
  }
];

async function generateIcon(icon, index) {
  console.log(`\n[${index + 1}/${ICONS.length}] Generating: ${icon.service}`);
  console.log(`  ID: ${icon.id}`);

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: icon.prompt,
      size: '1024x1024',
      n: 1
    });

    if (!response.data || !response.data[0]) {
      throw new Error('No data in response');
    }

    console.log(`  ✓ Generated, processing...`);

    // gpt-image-1 returns base64 encoded images in b64_json field
    let buffer;
    if (response.data[0].b64_json) {
      buffer = Buffer.from(response.data[0].b64_json, 'base64');
    } else if (response.data[0].url) {
      // Fallback to URL if provided
      const imageResponse = await fetch(response.data[0].url);
      const arrayBuffer = await imageResponse.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error('No image data or URL in response');
    }

    // Save with standardized naming
    const filename = `${icon.id}-icon-anachronistic.png`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, buffer);
    console.log(`  ✓ Saved: ${filename}`);

    // Save metadata
    const metadata = {
      id: icon.id,
      service: icon.service,
      filename: filename,
      path: `/generated/${filename}`,
      prompt: icon.prompt,
      model: 'gpt-image-1',
      size: '1024x1024',
      style: 'Anachronistic-lite transparent',
      generatedAt: new Date().toISOString()
    };

    const metadataPath = path.join(OUTPUT_DIR, `${icon.id}-icon-metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return {
      success: true,
      icon,
      outputPath,
      filename
    };
  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    return {
      success: false,
      icon,
      error: error.message
    };
  }
}

async function main() {
  console.log('🎨 TRANSPARENT SERVICE ICON GENERATION');
  console.log('='.repeat(60));
  console.log('Style: Anachronistic-lite (minimalist, futuristic, transparent)');
  console.log('Model: OpenAI gpt-image-1');
  console.log('Size: 1024x1024 PNG with transparency');
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('✓ Created output directory');
  }

  const results = [];

  // Generate icons sequentially with rate limiting
  for (let i = 0; i < ICONS.length; i++) {
    const result = await generateIcon(ICONS[i], i);
    results.push(result);

    // Wait between API calls to avoid rate limits (except for last one)
    if (i < ICONS.length - 1) {
      console.log('  ⏳ Waiting 3 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Generate summary report
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successful.length}/${ICONS.length}`);

  if (successful.length > 0) {
    console.log('\n✓ Successfully Generated:');
    successful.forEach(r => {
      console.log(`  • ${r.icon.service} → ${r.filename}`);
    });
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${ICONS.length}`);
    console.log('\n✗ Failed Icons:');
    failed.forEach(r => {
      console.log(`  • ${r.icon.service}: ${r.error}`);
    });
  }

  // Save comprehensive report
  const report = {
    generatedAt: new Date().toISOString(),
    style: 'Anachronistic-lite transparent',
    model: 'gpt-image-1',
    size: '1024x1024',
    total: ICONS.length,
    successful: successful.length,
    failed: failed.length,
    icons: results.map(r => ({
      id: r.icon.id,
      service: r.icon.service,
      success: r.success,
      filename: r.filename || null,
      error: r.error || null
    }))
  };

  const reportPath = path.join(OUTPUT_DIR, 'service-icons-generation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: service-icons-generation-report.json`);

  console.log('\n' + '='.repeat(60));
  console.log('🎯 NEXT STEPS');
  console.log('='.repeat(60));
  console.log('1. Review generated icons in public/generated/');
  console.log('2. Update ServiceScroller.jsx with new icon paths:');
  console.log('   /generated/{service-id}-icon-anachronistic.png');
  console.log('3. Test icons on both light and dark backgrounds');
  console.log('='.repeat(60));

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});