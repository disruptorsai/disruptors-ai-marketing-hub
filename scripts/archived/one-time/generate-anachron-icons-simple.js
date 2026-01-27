import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

const OUTPUT_DIR = path.join(__dirname, '..', 'generated', 'anachron', 'anachron-lite');

// Simplified icon specs - just the essentials
const ICONS = [
  {
    id: 'ai-automation',
    service: 'AI Automation',
    prompt: "Minimal ancient-style icon of a Greek key meander pattern styled as circuit traces, 2px lapis (#2C6BAA) stroke with small gold (#C9A53B) circular nodes at pattern corners and intersections, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry grid foundation, flat vector illustration style, subtle ivory paper texture (#F3EFE6), transparent background, clean edges, high contrast, emblematic and timeless, 1:1 aspect ratio. Ancient circuit motif representing technology and automation, geometric precision, no text, professional icon design."
  },
  {
    id: 'social-media',
    service: 'Social Media Marketing',
    prompt: "Minimal ancient-style icon combining stylized Greek sea waves with an oracle eye at center, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) accent for waves and lapis (#2C6BAA) iris, drawn on 24px grid with rounded caps and joins, sacred geometry circle foundation, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Waves represent flow of communication, eye represents audience insight, ancient Greco-Roman aesthetic, geometric simplicity, no text."
  },
  {
    id: 'seo-geo',
    service: 'SEO & GEO',
    prompt: "Minimal ancient-style icon of an astrolabe with concentric rings and a central compass pointer, 2px ink (#1F1B17) stroke with verdigris (#3C7A6A) rings and gold (#C9A53B) pointer accent, tiny mosaic tessera dots marking cardinal directions, drawn on 24px grid with rounded caps and joins, sacred geometry circle composition, flat vector illustration, subtle paper texture, transparent background, clean edges, 1:1 aspect ratio. Ancient navigation instrument representing discovery and positioning, geometric precision, no text."
  },
  {
    id: 'lead-generation',
    service: 'Lead Generation',
    prompt: "Minimal ancient-style icon of an amphora vessel with stylized wave patterns flowing into the opening, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) amphora body and lapis (#2C6BAA) wave accents, drawn on 24px grid with rounded caps and joins, centered composition, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic ancient ceramic style, 1:1 aspect ratio. Amphora represents collection and containment, waves represent prospect flow, geometric simplicity, no text."
  },
  {
    id: 'paid-advertising',
    service: 'Paid Advertising',
    prompt: "Minimal ancient-style icon of an oracle eye within a partial laurel wreath frame, 2px ink (#1F1B17) stroke with gold (#C9A53B) iris and terracotta (#C96F4C) laurel leaves, drawn on 24px grid with rounded caps and joins, sacred geometry symmetry, flat vector illustration, subtle paper texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Eye represents targeting and insight, laurel represents achievement and ROI, ancient motif vocabulary, geometric precision, no text."
  },
  {
    id: 'podcasting',
    service: 'Podcasting',
    prompt: "Minimal ancient-style icon of an amphora with concentric gilded sound wave ripples emanating from the opening, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) amphora body and gold (#C9A53B) sound wave accents, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry, flat vector illustration, subtle fresco texture, transparent background, clean edges, 1:1 aspect ratio. Ancient ceramic vessel as speaker, sound waves painted as concentric arcs, emblematic style, geometric simplicity, no text."
  },
  {
    id: 'custom-apps',
    service: 'Custom Apps',
    prompt: "Minimal ancient-style icon of a rounded rectangle obsidian slab with a Greek key meander border pattern, 2px ink (#1F1B17) stroke with lapis (#2C6BAA) slab fill and verdigris (#3C7A6A) circuit meander border with tiny gold node accents, drawn on 24px grid with rounded caps and joins, sacred geometry rectangular composition, flat vector illustration, subtle paper texture, transparent background, clean edges, 1:1 aspect ratio. Obsidian tablet represents custom interface, meander border represents crafted technology systems, geometric precision, no text."
  },
  {
    id: 'crm-management',
    service: 'CRM Management',
    prompt: "Minimal ancient-style circular badge showing a handshake between human hand and stylized automaton hand, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) human hand, lapis (#2C6BAA) automaton hand, and Greek key meander border pattern, drawn on 24px grid with rounded caps and joins, sacred geometry circle composition, flat vector illustration, subtle paper texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Two hands clasping representing human-AI relationship management, ancient motif vocabulary, geometric simplicity, no text."
  },
  {
    id: 'fractional-cmo',
    service: 'Fractional CMO',
    prompt: "Minimal ancient-style icon of a papyrus scroll with laurel leaf accents at corners, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) scroll rods and gold (#C9A53B) laurel leaves, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic ancient motif, 1:1 aspect ratio. Scroll represents strategic knowledge and documentation, laurel represents leadership excellence, geometric precision, no text."
  }
];

async function generateOne(icon, index) {
  console.log(`\n[${index + 1}/${ICONS.length}] Generating: ${icon.service}`);

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: icon.prompt,
      size: '1024x1024',
      n: 1
    });

    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error('No URL in response');
    }

    const imageUrl = response.data[0].url;
    console.log(`  URL received, downloading...`);

    // Download
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save
    const filename = `icon-${icon.id}-256px.png`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, buffer);
    console.log(`  ✓ Saved: ${filename}`);

    // Metadata
    const metadata = {
      id: icon.id,
      service: icon.service,
      filename: filename,
      prompt: icon.prompt,
      model: 'gpt-image-1',
      size: '1024x1024',
      generatedAt: new Date().toISOString()
    };

    const metadataPath = path.join(OUTPUT_DIR, `${icon.id}-metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return { success: true, icon, outputPath };
  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    return { success: false, icon, error: error.message };
  }
}

async function main() {
  console.log('ANACHRON Lite Icon Generation');
  console.log('='.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}`);

  // Ensure directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  // Generate one at a time
  for (let i = 0; i < ICONS.length; i++) {
    const result = await generateOne(ICONS[i], i);
    results.push(result);

    // Wait between calls
    if (i < ICONS.length - 1) {
      console.log('  Waiting 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n' + '='.repeat(50));
  console.log(`COMPLETE: ${successful.length}/${ICONS.length} successful`);

  if (successful.length > 0) {
    console.log('\nGenerated:');
    successful.forEach(r => console.log(`  • ${r.icon.service}`));
  }

  if (failed.length > 0) {
    console.log('\nFailed:');
    failed.forEach(r => console.log(`  • ${r.icon.service}: ${r.error}`));
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    total: ICONS.length,
    successful: successful.length,
    failed: failed.length,
    results: results.map(r => ({
      service: r.icon.service,
      success: r.success,
      error: r.error || null
    }))
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'generation-report.json'),
    JSON.stringify(report, null, 2)
  );
}

main().catch(console.error);