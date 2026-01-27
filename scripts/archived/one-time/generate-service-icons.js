/**
 * Generate ANACHRON Lite Service Icons
 * Creates 9 custom icons for Disruptors AI services using OpenAI gpt-image-1
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '../public/generated/anachron-lite');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

const serviceIcons = [
  {
    name: 'ai-automation',
    title: 'AI Automation',
    prompt: 'Minimal ancient-style icon of a Greek key meander pattern styled as circuit traces, 2px lapis (#2C6BAA) stroke with small gold (#C9A53B) circular nodes at pattern corners and intersections, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry grid foundation, flat vector illustration style, subtle ivory paper texture (#F3EFE6), transparent background, clean edges, high contrast, emblematic and timeless, 1:1 aspect ratio. Ancient circuit motif representing technology and automation, geometric precision, no text, professional icon design.'
  },
  {
    name: 'social-media',
    title: 'Social Media Marketing',
    prompt: 'Minimal ancient-style icon combining stylized Greek sea waves with an oracle eye at center, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) accent for waves and lapis (#2C6BAA) iris, drawn on 24px grid with rounded caps and joins, sacred geometry circle foundation, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Waves represent flow of communication, eye represents audience insight, ancient Greco-Roman aesthetic, geometric simplicity, no text.'
  },
  {
    name: 'seo-geo',
    title: 'SEO & GEO',
    prompt: 'Minimal ancient-style icon of an astrolabe with concentric rings and a central compass pointer, 2px ink (#1F1B17) stroke with verdigris (#3C7A6A) rings and gold (#C9A53B) pointer accent, tiny mosaic tessera dots marking cardinal directions, drawn on 24px grid with rounded caps and joins, sacred geometry circle composition, flat vector illustration, subtle paper texture, transparent background, clean edges, 1:1 aspect ratio. Ancient navigation instrument representing discovery and positioning, geometric precision, no text.'
  },
  {
    name: 'lead-generation',
    title: 'Lead Generation',
    prompt: 'Minimal ancient-style icon of an amphora vessel with stylized wave patterns flowing into the opening, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) amphora body and lapis (#2C6BAA) wave accents, drawn on 24px grid with rounded caps and joins, centered composition, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic ancient ceramic style, 1:1 aspect ratio. Amphora represents collection and containment, waves represent prospect flow, geometric simplicity, no text.'
  },
  {
    name: 'paid-advertising',
    title: 'Paid Advertising',
    prompt: 'Minimal ancient-style icon of an oracle eye within a partial laurel wreath frame, 2px ink (#1F1B17) stroke with gold (#C9A53B) iris and terracotta (#C96F4C) laurel leaves, drawn on 24px grid with rounded caps and joins, sacred geometry symmetry, flat vector illustration, subtle paper texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Eye represents targeting and insight, laurel represents achievement and ROI, ancient motif vocabulary, geometric precision, no text.'
  },
  {
    name: 'podcasting',
    title: 'Podcasting',
    prompt: 'Minimal ancient-style icon of an amphora with concentric gilded sound wave ripples emanating from the opening, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) amphora body and gold (#C9A53B) sound wave accents, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry, flat vector illustration, subtle fresco texture, transparent background, clean edges, 1:1 aspect ratio. Ancient ceramic vessel as speaker, sound waves painted as concentric arcs, emblematic style, geometric simplicity, no text.'
  },
  {
    name: 'custom-apps',
    title: 'Custom Apps',
    prompt: 'Minimal ancient-style icon of a rounded rectangle obsidian slab with a Greek key meander border pattern, 2px ink (#1F1B17) stroke with lapis (#2C6BAA) slab fill and verdigris (#3C7A6A) circuit meander border with tiny gold node accents, drawn on 24px grid with rounded caps and joins, sacred geometry rectangular composition, flat vector illustration, subtle paper texture, transparent background, clean edges, 1:1 aspect ratio. Obsidian tablet represents custom interface, meander border represents crafted technology systems, geometric precision, no text.'
  },
  {
    name: 'crm-management',
    title: 'CRM Management',
    prompt: 'Minimal ancient-style circular badge showing a handshake between human hand and stylized automaton hand, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) human hand, lapis (#2C6BAA) automaton hand, and Greek key meander border pattern, drawn on 24px grid with rounded caps and joins, sacred geometry circle composition, flat vector illustration, subtle paper texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Two hands clasping representing human-AI relationship management, ancient motif vocabulary, geometric simplicity, no text.'
  },
  {
    name: 'fractional-cmo',
    title: 'Fractional CMO',
    prompt: 'Minimal ancient-style icon of a papyrus scroll with laurel leaf accents at corners, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) scroll rods and gold (#C9A53B) laurel leaves, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic ancient motif, 1:1 aspect ratio. Scroll represents strategic knowledge and documentation, laurel represents leadership excellence, geometric precision, no text.'
  }
];

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function generateIcon(iconSpec) {
  console.log(`\n🎨 Generating icon: ${iconSpec.title}...`);

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: iconSpec.prompt,
      size: '1024x1024',
      n: 1
    });

    const imageUrl = response.data[0].url;
    const filename = `icon-${iconSpec.name}.png`;
    const filepath = path.join(outputDir, filename);

    // Download and save the image
    await downloadImage(imageUrl, filepath);

    // Save metadata
    const metadata = {
      service: iconSpec.name,
      title: iconSpec.title,
      style: 'anachron-lite',
      prompt: iconSpec.prompt,
      generated_at: new Date().toISOString(),
      provider: 'openai',
      model: 'gpt-image-1',
      url: imageUrl,
      local_path: `/generated/anachron-lite/${filename}`
    };

    const metadataPath = path.join(outputDir, `${iconSpec.name}-metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`✅ Generated ${iconSpec.title}`);
    console.log(`   File: ${filepath}`);
    console.log(`   Metadata: ${metadataPath}`);

    return { success: true, ...metadata };
  } catch (error) {
    console.error(`❌ Failed to generate ${iconSpec.title}:`, error.message);
    return { success: false, service: iconSpec.name, error: error.message };
  }
}

async function generateAllIcons() {
  console.log('🚀 Starting ANACHRON Lite Service Icons Generation');
  console.log(`📁 Output directory: ${outputDir}\n`);

  const results = [];

  for (const iconSpec of serviceIcons) {
    const result = await generateIcon(iconSpec);
    results.push(result);

    // Small delay between generations to avoid rate limits
    if (result.success) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Generate summary report
  const summary = {
    total: serviceIcons.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results: results,
    generated_at: new Date().toISOString()
  };

  const summaryPath = path.join(outputDir, 'generation-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n📊 Generation Summary:');
  console.log(`   Total: ${summary.total}`);
  console.log(`   Successful: ${summary.successful}`);
  console.log(`   Failed: ${summary.failed}`);
  console.log(`\n📄 Summary report: ${summaryPath}`);

  if (summary.failed > 0) {
    console.log('\n❌ Failed icons:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.service}: ${r.error}`);
    });
  }

  return summary;
}

// Run generation
generateAllIcons()
  .then(() => {
    console.log('\n✨ Icon generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });