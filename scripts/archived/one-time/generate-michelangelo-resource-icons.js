/**
 * MICHELANGELO RESOURCE ICONS GENERATOR
 *
 * Generates all 19 resource page icons in Michelangelo Renaissance painting style
 * using Replicate Flux 1.1 Pro model.
 *
 * Style: Renaissance fresco painting inspired by Michelangelo's masterworks
 * - Sistine Chapel ceiling aesthetic
 * - Dramatic chiaroscuro lighting
 * - Classical composition with soft sfumato
 * - Earth tones: ochres, siennas, umbers, soft blues
 * - Cracked fresco texture
 * - Mythological/Biblical storytelling quality
 *
 * Usage: node scripts/generate-michelangelo-resource-icons.js
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

// Output directory
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'resource-icons');

/**
 * Icon definitions with Michelangelo Renaissance style prompts
 */
const ICONS = [
  {
    title: 'AI Content Writer',
    name: 'ai-content-writer',
    category: 'AI Tools',
    michelangeloPrompt: `Renaissance fresco painting in the style of Michelangelo, dramatic scene with a divine
    hand reaching from golden clouds to touch an ancient scroll with glowing text. Golden quill writing with
    divine light. Dramatic chiaroscuro lighting with warm ochre, sienna, and umber earth tones. Soft blue sky
    background. Cracked aged fresco texture throughout. Classical Renaissance composition, sfumato technique,
    divine inspiration theme. Square format, centered composition, museum quality. No human faces or bodies.`,
  },
  {
    title: 'AI Image Generator',
    name: 'ai-image-generator',
    category: 'AI Tools',
    michelangeloPrompt: `Renaissance fresco painting inspired by Michelangelo. An ornate easel with canvas
    glowing with divine light beams from above, multiple ethereal painted images materializing in golden clouds.
    Dramatic chiaroscuro with earth tones of burnt sienna, ochre, umber and lapis blue. Cracked fresco surface
    texture. Divine creative energy, soft sfumato, golden light rays. Square composition, museum quality.
    No human faces or bodies.`,
  },
  {
    title: 'AI Chatbot Builder',
    name: 'chatbot-builder',
    category: 'AI Tools',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. Floating scrolls with ancient text surrounded
    by flowing banners with elegant inscriptions. Classical Renaissance architecture pillars and arches in
    background. Warm ochre and sienna tones, soft blue sky, dramatic chiaroscuro. Cracked fresco texture,
    sfumato technique. Divine wisdom shown through glowing golden connecting threads between scrolls.
    Square format, centered, museum quality. No human faces or bodies.`,
  },
  {
    title: 'AI Video Generator',
    name: 'video-generator',
    category: 'AI Tools',
    michelangeloPrompt: `Renaissance fresco in Michelangelo style. A divine all-seeing eye in golden clouds
    projects beams of light downward, creating multiple ethereal painted scenes in the clouds below. Sistine
    Chapel aesthetic with earth tones, burnt sienna, ochre, lapis blue accents. Cracked fresco surface,
    dramatic lighting, sfumato clouds. Time and motion captured in Renaissance composition. Divine creation
    energy. Square format, centered, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Growth Audit Tool',
    name: 'growth-audit-tool',
    category: 'Marketing',
    michelangeloPrompt: `Michelangelo Renaissance fresco painting. Golden compass and measuring tools
    examining an architectural blueprint that transforms into flourishing vines and vegetation reaching
    upward. Divine light illuminates growth patterns. Warm earth tones, ochre, sienna, umber with emerald
    green growth accents. Cracked fresco texture, dramatic chiaroscuro. Sacred geometry meets organic growth.
    Sfumato technique, square format, museum quality. No human faces or bodies.`,
  },
  {
    title: 'SEO Optimizer',
    name: 'seo-optimizer',
    category: 'Marketing',
    michelangeloPrompt: `Renaissance fresco inspired by Michelangelo. Ancient texts and scrolls with divine
    light beams highlighting specific glowing golden words. Books float in organized patterns. Sistine ceiling
    aesthetic with warm ochre, sienna, umber earth tones and lapis blue. Cracked fresco surface, sfumato
    technique, dramatic lighting. Knowledge illuminated by divine wisdom. Classical Renaissance composition.
    Square format, centered, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Social Media Manager',
    name: 'social-media-manager',
    category: 'Marketing',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. Multiple scrolls arranged in a circle
    with messenger birds (white doves) flying between them. Divine golden light connects all scrolls in
    a radiant network pattern. Warm earth tones, ochre, sienna, soft blue sky. Cracked fresco texture,
    dramatic chiaroscuro, sfumato clouds. Connection and communication theme. Square format, centered,
    museum quality. No human faces or bodies.`,
  },
  {
    title: 'Email Campaign Builder',
    name: 'email-campaign-builder',
    category: 'Marketing',
    michelangeloPrompt: `Renaissance fresco in Michelangelo style. Sealed scrolls with golden wax seals
    descending from heavenly clouds, divine messenger doves carrying letters. Sistine Chapel aesthetic
    with dramatic wings, seals glowing with divine light. Warm ochre, sienna, umber tones with lapis blue
    sky. Cracked fresco surface, sfumato technique, chiaroscuro lighting. Divine messenger theme.
    Square composition, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Analytics Dashboard',
    name: 'analytics-dashboard',
    category: 'Analytics',
    michelangeloPrompt: `Michelangelo Renaissance fresco. An ornate celestial sphere (armillary sphere)
    with geometric patterns and charts materializing in divine golden light around it. Warm earth tones,
    ochre, sienna, umber with touches of lapis blue. Cracked fresco texture, dramatic shadows, sfumato
    technique. Sacred geometry, divine mathematics theme. Ancient wisdom meets cosmic order. Square format,
    centered, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Conversion Tracker',
    name: 'conversion-tracker',
    category: 'Analytics',
    michelangeloPrompt: `Renaissance fresco inspired by Michelangelo. Base metal transforming into pure
    gold through divine alchemy, golden particles flowing in luminous streams. Mystical transformation
    theme. Warm ochre, sienna, umber earth tones with metallic gold accents. Cracked fresco surface,
    dramatic chiaroscuro lighting, sfumato technique. Divine transmutation energy. Philosophical stone
    symbolism. Square composition, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Performance Monitor',
    name: 'performance-monitor',
    category: 'Analytics',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. An ornate hourglass and sundial measuring
    time and celestial movements. Divine light creates a perfect golden ratio spiral pattern emanating
    from the instruments. Sistine Chapel aesthetic with warm ochre, sienna, umber tones and soft blue.
    Cracked fresco texture, dramatic lighting, sfumato clouds. Time, precision, cosmic harmony theme.
    Sacred geometry and divine order. Square format, centered, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Audience Intelligence',
    name: 'audience-intelligence',
    category: 'Analytics',
    michelangeloPrompt: `Renaissance fresco in Michelangelo style. A glowing crystal sphere with ethereal
    wisps and light patterns within, divine light illuminating from above. Warm earth tones, ochre, sienna,
    umber with lapis blue accents. Cracked fresco surface, dramatic chiaroscuro, sfumato technique. Divine
    wisdom and foresight theme. Understanding and insight. Square composition, museum quality. No human
    faces or bodies.`,
  },
  {
    title: 'Workflow Automation',
    name: 'workflow-automation',
    category: 'Automation',
    michelangeloPrompt: `Michelangelo Renaissance fresco. Divine clockwork mechanism in golden clouds with
    ornate gears and cosmic wheels turning in perfect harmony. Sistine ceiling aesthetic with warm ochre,
    sienna, umber, and lapis blue. Cracked fresco texture, dramatic lighting, sfumato clouds. Divine automation
    theme, celestial mechanics. Sacred geometry meets divine engineering. Square format, centered, museum
    quality. No human faces or bodies.`,
  },
  {
    title: 'Lead Scoring Engine',
    name: 'lead-scoring-engine',
    category: 'Automation',
    michelangeloPrompt: `Renaissance fresco inspired by Michelangelo. Golden scales of justice weighing
    scrolls with divine light illuminating the balanced side. Warm earth tones, ochre, sienna, umber with
    metallic gold. Cracked fresco surface, dramatic chiaroscuro, sfumato technique. Divine judgment and
    discernment theme. Celestial balance and wisdom. Square composition, museum quality. No human faces
    or bodies.`,
  },
  {
    title: 'Content Calendar',
    name: 'content-calendar',
    category: 'Automation',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. An ornate astrolabe and celestial calendar
    showing the zodiac, seasons, and cosmic cycles. Divine light traces the path of the sun and stars.
    Sistine Chapel aesthetic with warm ochre, sienna, umber earth tones and lapis blue sky. Cracked fresco
    texture, dramatic lighting, sfumato technique. Time, seasons, divine order theme. Sacred calendar and
    cosmic harmony. Square format, centered, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Integration Hub',
    name: 'integration-hub',
    category: 'Automation',
    michelangeloPrompt: `Renaissance fresco in Michelangelo style. Multiple ornate keys and scrolls reaching
    toward a central divine light source, connected by golden threads forming sacred geometric pattern.
    Warm earth tones, ochre, sienna, umber with lapis blue. Cracked fresco surface, dramatic chiaroscuro,
    sfumato technique. Unity and connection theme. Divine harmony. All parts connected to divine whole.
    Square composition, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Podcast Studio',
    name: 'podcast-studio',
    category: 'Content',
    michelangeloPrompt: `Michelangelo Renaissance fresco. An ornate microphone or horn with divine sound
    waves (rendered as golden musical notation and sacred geometry) emanating outward in concentric circles
    toward clouds. Sistine Chapel aesthetic with warm ochre, sienna, umber and lapis blue. Cracked fresco
    texture, dramatic lighting, sfumato technique. Divine speech and wisdom theme. Voice as divine instrument.
    Square format, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Report Generator',
    name: 'report-generator',
    category: 'Content',
    michelangeloPrompt: `Renaissance fresco inspired by Michelangelo. A large ornate tome with divine light
    flowing from heaven onto the pages, making the text glow golden. Additional scrolls floating nearby.
    Warm earth tones, ochre, sienna, umber with lapis blue accents. Cracked fresco surface, dramatic
    chiaroscuro, sfumato technique. Divine documentation theme. Sacred knowledge and heavenly record keeping.
    Square composition, museum quality. No human faces or bodies.`,
  },
  {
    title: 'Brand Asset Library',
    name: 'brand-asset-library',
    category: 'Content',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. A magnificent classical library with scrolls,
    books, and treasures organized on celestial shelves extending into clouds. Divine light illuminates
    specific volumes. Sistine Chapel aesthetic with warm ochre, sienna, umber earth tones and lapis blue.
    Cracked fresco texture, dramatic lighting, sfumato technique. Sacred knowledge preservation theme.
    Classical architecture, profound wisdom. Temple of wisdom. Square format, centered, museum quality.
    No human faces or bodies.`,
  },
];

/**
 * Save binary stream data to file
 */
async function saveBinaryStream(stream, filepath) {
  const fileStream = fs.createWriteStream(filepath);

  for await (const chunk of stream) {
    fileStream.write(chunk);
  }

  return new Promise((resolve, reject) => {
    fileStream.end(() => {
      fileStream.close();
      resolve();
    });

    fileStream.on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Generate a single icon using Replicate Flux 1.1 Pro
 */
async function generateIcon(icon, index, total) {
  console.log(`\n[${ index + 1}/${total}] Generating: ${icon.title}`);
  console.log(`Style: Michelangelo Renaissance Fresco`);

  const fullPrompt = `Professional app icon, 1024x1024px square format, perfectly centered composition.

${icon.michelangeloPrompt}

Technical requirements:
- 1024x1024px resolution
- Square 1:1 aspect ratio
- Centered composition with balanced padding
- Professional app store quality
- Museum-quality Renaissance fresco painting
- Authentic Michelangelo artistic style
- Cracked aged fresco surface texture throughout
- Dramatic chiaroscuro lighting (strong contrast between light and dark)
- Soft sfumato technique (subtle gradations)
- Classical Renaissance color palette: warm ochres, siennas, umbers, lapis blue
- No modern elements, no text, no UI elements
- Timeless masterpiece quality`;

  try {
    console.log(`Calling Replicate API...`);
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: fullPrompt,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 100,
          safety_tolerance: 2,
          prompt_upsampling: true,
        }
      }
    );

    console.log(`API response received (stream):`, typeof output);

    const imagePath = path.join(OUTPUT_DIR, `${icon.name}.png`);
    const metadataPath = path.join(OUTPUT_DIR, `${icon.name}-metadata.json`);

    // Save the binary stream directly to file
    console.log(`Saving binary stream to file...`);
    await saveBinaryStream(output, imagePath);

    // Save metadata
    const metadata = {
      title: icon.title,
      name: icon.name,
      category: icon.category,
      style: "Michelangelo Renaissance Fresco",
      artisticStyle: "Renaissance fresco painting inspired by Michelangelo's masterworks (Sistine Chapel, Creation of Adam, Last Judgment)",
      technique: "Chiaroscuro, sfumato, classical composition, cracked fresco texture",
      colorPalette: "Earth tones: ochre, sienna, umber, lapis blue, metallic gold",
      prompt: fullPrompt,
      model: "black-forest-labs/flux-1.1-pro",
      timestamp: new Date().toISOString(),
      filepath: `/images/resource-icons/${icon.name}.png`,
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Get file size
    const stats = fs.statSync(imagePath);
    const fileSizeKB = Math.round(stats.size / 1024);

    console.log(`✓ Generated successfully`);
    console.log(`  Path: ${imagePath}`);
    console.log(`  Size: ${fileSizeKB} KB`);

    return {
      success: true,
      icon: icon.title,
      path: imagePath,
      size: fileSizeKB,
    };

  } catch (error) {
    console.error(`✗ Failed to generate ${icon.title}`);
    console.error(`Error details:`, error);
    console.error(`Error message:`, error.message);
    console.error(`Error stack:`, error.stack);
    return {
      success: false,
      icon: icon.title,
      error: error.message || error.toString(),
    };
  }
}

/**
 * Main generation function
 */
async function generateAllIcons() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  MICHELANGELO RENAISSANCE RESOURCE ICONS GENERATOR              ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Total icons to generate: ${ICONS.length}`);
  console.log(`Style: Renaissance Fresco (Michelangelo)`);
  console.log(`Model: Replicate Flux 1.1 Pro`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];
  const startTime = Date.now();

  // Generate each icon sequentially (to avoid rate limits)
  for (let i = 0; i < ICONS.length; i++) {
    const result = await generateIcon(ICONS[i], i, ICONS.length);
    results.push(result);

    // Add a small delay between generations
    if (i < ICONS.length - 1) {
      console.log('Waiting 2 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const endTime = Date.now();
  const totalTime = Math.round((endTime - startTime) / 1000);

  // Summary report
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  GENERATION COMPLETE                                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total icons: ${ICONS.length}`);
  console.log(`✓ Successful: ${successful}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total time: ${totalTime} seconds`);
  console.log('');

  if (failed > 0) {
    console.log('Failed icons:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.icon}: ${r.error}`);
    });
  }

  // Save full generation report
  const reportPath = path.join(OUTPUT_DIR, 'michelangelo-generation-report.json');
  const report = {
    style: 'Michelangelo Renaissance Fresco',
    timestamp: new Date().toISOString(),
    totalIcons: ICONS.length,
    successful,
    failed,
    totalTimeSeconds: totalTime,
    results,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\nFull report saved to: ${reportPath}`);
  console.log('\n🎨 All Michelangelo Renaissance icons generated! 🎨\n');
}

// Run the generator
generateAllIcons().catch(console.error);
