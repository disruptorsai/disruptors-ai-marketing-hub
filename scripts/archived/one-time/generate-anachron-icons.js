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

// Icon specifications with prompts and settings
const ICON_SPECS = [
  {
    id: 'ai-automation',
    service: 'AI Automation',
    filename: 'icon-ai-automation-256px.png',
    prompt: "Minimal ancient-style icon of a Greek key meander pattern styled as circuit traces, 2px lapis (#2C6BAA) stroke with small gold (#C9A53B) circular nodes at pattern corners and intersections, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry grid foundation, flat vector illustration style, subtle ivory paper texture (#F3EFE6), transparent background, clean edges, high contrast, emblematic and timeless, 1:1 aspect ratio. Ancient circuit motif representing technology and automation, geometric precision, no text, professional icon design.",
    negative: "neon, plastic, modern logos, cars, 3D render, gradients, photorealism, cartoon, anime, oversaturation, noisy background, complex scene, multiple figures, text overlays, watermark, signature"
  },
  {
    id: 'social-media',
    service: 'Social Media Marketing',
    filename: 'icon-social-media-256px.png',
    prompt: "Minimal ancient-style icon combining stylized Greek sea waves with an oracle eye at center, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) accent for waves and lapis (#2C6BAA) iris, drawn on 24px grid with rounded caps and joins, sacred geometry circle foundation, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Waves represent flow of communication, eye represents audience insight, ancient Greco-Roman aesthetic, geometric simplicity, no text.",
    negative: "neon, plastic, modern social media logos, 3D render, gradients, photorealism, cartoon, complex details, noisy background, text overlays, watermark"
  },
  {
    id: 'seo-geo',
    service: 'SEO & GEO',
    filename: 'icon-seo-geo-256px.png',
    prompt: "Minimal ancient-style icon of an astrolabe with concentric rings and a central compass pointer, 2px ink (#1F1B17) stroke with verdigris (#3C7A6A) rings and gold (#C9A53B) pointer accent, tiny mosaic tessera dots marking cardinal directions, drawn on 24px grid with rounded caps and joins, sacred geometry circle composition, flat vector illustration, subtle paper texture, transparent background, clean edges, 1:1 aspect ratio. Ancient navigation instrument representing discovery and positioning, geometric precision, no text.",
    negative: "neon, modern GPS icons, plastic, 3D render, gradients, photorealism, cartoon, text labels, watermark, complex scene"
  },
  {
    id: 'lead-generation',
    service: 'Lead Generation',
    filename: 'icon-lead-generation-256px.png',
    prompt: "Minimal ancient-style icon of an amphora vessel with stylized wave patterns flowing into the opening, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) amphora body and lapis (#2C6BAA) wave accents, drawn on 24px grid with rounded caps and joins, centered composition, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic ancient ceramic style, 1:1 aspect ratio. Amphora represents collection and containment, waves represent prospect flow, geometric simplicity, no text.",
    negative: "neon, plastic, modern funnels, 3D render, gradients, photorealism, cartoon, complex details, text overlays, watermark"
  },
  {
    id: 'paid-advertising',
    service: 'Paid Advertising',
    filename: 'icon-paid-advertising-256px.png',
    prompt: "Minimal ancient-style icon of an oracle eye within a partial laurel wreath frame, 2px ink (#1F1B17) stroke with gold (#C9A53B) iris and terracotta (#C96F4C) laurel leaves, drawn on 24px grid with rounded caps and joins, sacred geometry symmetry, flat vector illustration, subtle paper texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Eye represents targeting and insight, laurel represents achievement and ROI, ancient motif vocabulary, geometric precision, no text.",
    negative: "neon, plastic, modern ad platform logos, 3D render, gradients, photorealism, cartoon, text, watermark, complex scene"
  },
  {
    id: 'podcasting',
    service: 'Podcasting',
    filename: 'icon-podcasting-256px.png',
    prompt: "Minimal ancient-style icon of an amphora with concentric gilded sound wave ripples emanating from the opening, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) amphora body and gold (#C9A53B) sound wave accents, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry, flat vector illustration, subtle fresco texture, transparent background, clean edges, 1:1 aspect ratio. Ancient ceramic vessel as speaker, sound waves painted as concentric arcs, emblematic style, geometric simplicity, no text.",
    negative: "neon, plastic, modern microphones, 3D render, gradients, photorealism, cartoon, podcast logos, text, watermark"
  },
  {
    id: 'custom-apps',
    service: 'Custom Apps',
    filename: 'icon-custom-apps-256px.png',
    prompt: "Minimal ancient-style icon of a rounded rectangle obsidian slab with a Greek key meander border pattern, 2px ink (#1F1B17) stroke with lapis (#2C6BAA) slab fill and verdigris (#3C7A6A) circuit meander border with tiny gold node accents, drawn on 24px grid with rounded caps and joins, sacred geometry rectangular composition, flat vector illustration, subtle paper texture, transparent background, clean edges, 1:1 aspect ratio. Obsidian tablet represents custom interface, meander border represents crafted technology systems, geometric precision, no text.",
    negative: "neon, plastic, modern app icons, 3D render, gradients, photorealism, cartoon, text, watermark, complex details"
  },
  {
    id: 'crm-management',
    service: 'CRM Management',
    filename: 'icon-crm-management-256px.png',
    prompt: "Minimal ancient-style circular badge showing a handshake between human hand and stylized automaton hand, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) human hand, lapis (#2C6BAA) automaton hand, and Greek key meander border pattern, drawn on 24px grid with rounded caps and joins, sacred geometry circle composition, flat vector illustration, subtle paper texture, transparent background, clean edges, emblematic style, 1:1 aspect ratio. Two hands clasping representing human-AI relationship management, ancient motif vocabulary, geometric simplicity, no text.",
    negative: "neon, plastic, modern CRM logos, 3D render, photorealistic hands, gradients, cartoon, complex details, text, watermark"
  },
  {
    id: 'fractional-cmo',
    service: 'Fractional CMO',
    filename: 'icon-fractional-cmo-256px.png',
    prompt: "Minimal ancient-style icon of a papyrus scroll with laurel leaf accents at corners, 2px ink (#1F1B17) stroke with terracotta (#C96F4C) scroll rods and gold (#C9A53B) laurel leaves, drawn on 24px grid with rounded caps and joins, centered composition with sacred geometry, flat vector illustration, subtle fresco texture, transparent background, clean edges, emblematic ancient motif, 1:1 aspect ratio. Scroll represents strategic knowledge and documentation, laurel represents leadership excellence, geometric precision, no text.",
    negative: "neon, plastic, modern business icons, 3D render, gradients, photorealism, cartoon, text content on scroll, watermark, complex scene"
  }
];

async function generateIcon(spec) {
  console.log(`\n🎨 Generating ${spec.service} icon...`);

  try {
    // Generate image using gpt-image-1
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: spec.prompt,
      n: 1,
      size: '1024x1024',
      quality: 'high'
    });

    const imageUrl = response.data[0].url;

    // Download image
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save image
    const outputPath = path.join(OUTPUT_DIR, spec.filename);
    fs.writeFileSync(outputPath, buffer);

    // Save metadata
    const metadataPath = path.join(OUTPUT_DIR, `${spec.id}-metadata.json`);
    const metadata = {
      id: spec.id,
      service: spec.service,
      filename: spec.filename,
      prompt: spec.prompt,
      negative: spec.negative,
      model: 'gpt-image-1',
      size: '1024x1024',
      quality: 'standard',
      generatedAt: new Date().toISOString(),
      outputPath: outputPath
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`✅ Generated: ${spec.filename}`);
    console.log(`   Metadata: ${spec.id}-metadata.json`);

    return {
      success: true,
      spec: spec,
      outputPath: outputPath,
      metadataPath: metadataPath
    };

  } catch (error) {
    console.error(`❌ Error generating ${spec.service}:`, error.message);
    return {
      success: false,
      spec: spec,
      error: error.message
    };
  }
}

async function generateAllIcons() {
  console.log('🚀 Starting ANACHRON Lite Icon Generation');
  console.log(`📁 Output Directory: ${OUTPUT_DIR}`);
  console.log(`🎯 Total Icons: ${ICON_SPECS.length}`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  // Generate icons sequentially to avoid rate limits
  for (const spec of ICON_SPECS) {
    const result = await generateIcon(spec);
    results.push(result);

    // Wait 2 seconds between generations to respect rate limits
    if (spec !== ICON_SPECS[ICON_SPECS.length - 1]) {
      console.log('⏳ Waiting 2 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Generate summary report
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  const report = {
    summary: {
      total: ICON_SPECS.length,
      successful: successCount,
      failed: failCount,
      generatedAt: new Date().toISOString()
    },
    results: results.map(r => ({
      service: r.spec.service,
      id: r.spec.id,
      success: r.success,
      filename: r.spec.filename,
      outputPath: r.outputPath || null,
      metadataPath: r.metadataPath || null,
      error: r.error || null
    }))
  };

  const reportPath = path.join(OUTPUT_DIR, 'generation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}/${ICON_SPECS.length}`);
  console.log(`❌ Failed: ${failCount}/${ICON_SPECS.length}`);
  console.log(`📄 Report: ${reportPath}`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n✨ Generated Icons:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   • ${r.spec.service}: ${r.outputPath}`);
    });
  }

  if (failCount > 0) {
    console.log('\n⚠️  Failed Icons:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.spec.service}: ${r.error}`);
    });
  }
}

// Run generation
generateAllIcons().catch(console.error);