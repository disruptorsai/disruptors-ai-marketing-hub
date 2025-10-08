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
import https from 'https';

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
    michelangeloPrompt: `Renaissance fresco painting in the style of Michelangelo's Sistine Chapel ceiling.
    A classical scene depicting a divine hand from the heavens reaching down to touch an ancient scroll,
    similar to the Creation of Adam composition. The hand writes with golden divine light onto parchment.
    Soft angels hover in clouds holding quills and books. Dramatic chiaroscuro lighting with warm ochre,
    sienna, and umber earth tones. Soft blue sky background reminiscent of Italian fresco skies.
    Cracked aged fresco texture throughout. Classical Renaissance composition, sfumato technique,
    divine inspiration theme. Square format, centered composition, museum quality.`,
  },
  {
    title: 'AI Image Generator',
    name: 'ai-image-generator',
    category: 'AI Tools',
    michelangeloPrompt: `Renaissance fresco painting inspired by Michelangelo. A classical artist figure
    (draped in flowing robes) painting on an easel, while divine light beams illuminate the canvas from above,
    showing multiple ethereal images materializing in the clouds. Sistine Chapel ceiling aesthetic with
    dramatic shadows and highlights. Earth tones of burnt sienna, ochre, umber with touches of lapis blue.
    Classical muscular anatomy, flowing drapery, divine creative energy. Cracked fresco surface texture.
    Mythological creation scene, soft sfumato, golden light rays. Square composition, museum quality.`,
  },
  {
    title: 'AI Chatbot Builder',
    name: 'chatbot-builder',
    category: 'AI Tools',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. Two classical figures in togas engaged in
    profound dialogue, surrounded by floating scrolls with ancient text. One figure gestures philosophically
    like in The School of Athens. Speech bubbles rendered as flowing banners with Latin inscriptions.
    Warm ochre and sienna tones, soft blue sky, dramatic chiaroscuro. Classical Renaissance architecture
    in background. Cracked fresco texture, sfumato technique, humanist philosophy theme. Divine wisdom
    passing between figures through glowing connecting threads. Square format, centered, museum quality.`,
  },
  {
    title: 'AI Video Generator',
    name: 'video-generator',
    category: 'AI Tools',
    michelangeloPrompt: `Renaissance fresco in Michelangelo style. A divine eye in the heavens projects
    beams of golden light downward, creating multiple ethereal scenes playing out like moving frescoes
    in the clouds below. Classical figures gesture dramatically in various frozen moments of action.
    Sistine Chapel aesthetic with earth tones, burnt sienna, ochre, lapis blue accents. Cracked fresco
    surface, dramatic lighting, sfumato clouds. Time and motion captured in Renaissance composition.
    Mythological storytelling, divine creation energy. Square format, centered, museum quality.`,
  },
  {
    title: 'Growth Audit Tool',
    name: 'growth-audit-tool',
    category: 'Marketing',
    michelangeloPrompt: `Michelangelo Renaissance fresco painting. A classical robed figure holds a golden
    compass and measuring tools, examining an architectural blueprint that transforms into flourishing vines
    and vegetation reaching upward. Divine light illuminates growth patterns. Similar to prophets from
    Sistine Chapel with wisdom and foresight. Warm earth tones, ochre, sienna, umber with emerald green
    growth accents. Cracked fresco texture, dramatic chiaroscuro, classical anatomy. Sacred geometry meets
    organic growth. Sfumato technique, square format, museum quality.`,
  },
  {
    title: 'SEO Optimizer',
    name: 'seo-optimizer',
    category: 'Marketing',
    michelangeloPrompt: `Renaissance fresco inspired by Michelangelo. A classical scholar in flowing robes
    studies ancient texts while divine light beams highlight specific words on scrolls, making them glow
    golden. Books float in organized patterns around the figure. Sistine ceiling aesthetic with warm ochre,
    sienna, umber earth tones and lapis blue. Cracked fresco surface, sfumato technique, dramatic lighting.
    Knowledge illuminated by divine wisdom. Classical Renaissance composition, profound contemplation theme.
    Square format, centered, museum quality.`,
  },
  {
    title: 'Social Media Manager',
    name: 'social-media-manager',
    category: 'Marketing',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. Multiple classical figures in togas arranged
    in a circle, each holding scrolls and sending messenger birds (doves) between them. Divine light connects
    all figures in a radiant network pattern. Similar to Sistine Chapel prophets and sibyls composition.
    Warm earth tones, ochre, sienna, soft blue sky. Cracked fresco texture, dramatic chiaroscuro, sfumato
    clouds. Human connection and communication theme. Classical drapery, idealized anatomy. Square format,
    centered, museum quality.`,
  },
  {
    title: 'Email Campaign Builder',
    name: 'email-campaign-builder',
    category: 'Marketing',
    michelangeloPrompt: `Renaissance fresco in Michelangelo style. An angel delivers sealed scrolls from
    the heavens to multiple classical figures below, each receiving divine messages. Sistine Chapel aesthetic
    with flowing robes, dramatic wings, golden wax seals glowing with divine light. Warm ochre, sienna,
    umber tones with lapis blue sky. Cracked fresco surface, sfumato technique, chiaroscuro lighting.
    Divine messenger theme, classical anatomy, flowing drapery. Mass communication as heavenly decree.
    Square composition, museum quality.`,
  },
  {
    title: 'Analytics Dashboard',
    name: 'analytics-dashboard',
    category: 'Analytics',
    michelangeloPrompt: `Michelangelo Renaissance fresco. A classical philosopher examines the celestial
    sphere (armillary sphere) while geometric patterns and charts materialize in divine golden light around
    him. Similar to Pythagoras or Euclid figures in Renaissance art. Warm earth tones, ochre, sienna, umber
    with touches of lapis blue. Cracked fresco texture, dramatic shadows, sfumato technique. Sacred geometry,
    divine mathematics theme. Classical robes, contemplative pose. Ancient wisdom meets cosmic order.
    Square format, centered, museum quality.`,
  },
  {
    title: 'Conversion Tracker',
    name: 'conversion-tracker',
    category: 'Analytics',
    michelangeloPrompt: `Renaissance fresco inspired by Michelangelo. A classical figure with outstretched
    arms transforms base metal into gold through divine alchemy, golden particles flowing in streams.
    Mystical transformation theme similar to Biblical transfiguration scenes. Warm ochre, sienna, umber
    earth tones with metallic gold accents. Cracked fresco surface, dramatic chiaroscuro lighting, sfumato
    technique. Classical anatomy, flowing drapery, divine transmutation energy. Philosophical stone symbolism.
    Square composition, museum quality.`,
  },
  {
    title: 'Performance Monitor',
    name: 'performance-monitor',
    category: 'Analytics',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. A classical figure holds an hourglass and
    sundial, measuring time and celestial movements. Divine light creates a perfect golden ratio spiral
    pattern emanating from the instruments. Sistine Chapel aesthetic with warm ochre, sienna, umber tones
    and soft blue. Cracked fresco texture, dramatic lighting, sfumato clouds. Time, precision, cosmic harmony
    theme. Classical robes, contemplative wisdom. Sacred geometry and divine order. Square format, centered,
    museum quality.`,
  },
  {
    title: 'Audience Intelligence',
    name: 'audience-intelligence',
    category: 'Analytics',
    michelangeloPrompt: `Renaissance fresco in Michelangelo style. A wise classical prophet figure gazes
    into a crystal sphere showing ethereal faces of many people within. Divine light illuminates the sphere
    from above. Similar to prophets from Sistine Chapel ceiling. Warm earth tones, ochre, sienna, umber with
    lapis blue accents. Cracked fresco surface, dramatic chiaroscuro, sfumato technique. Divine wisdom and
    foresight theme. Classical anatomy, flowing robes, profound contemplation. Understanding humanity.
    Square composition, museum quality.`,
  },
  {
    title: 'Workflow Automation',
    name: 'workflow-automation',
    category: 'Automation',
    michelangeloPrompt: `Michelangelo Renaissance fresco. A divine clockwork mechanism in the heavens with
    golden gears and cosmic wheels turning, operated by cherubs and angels. Below, classical figures work
    effortlessly as divine machinery assists them. Sistine ceiling aesthetic with warm ochre, sienna, umber,
    and lapis blue. Cracked fresco texture, dramatic lighting, sfumato clouds. Divine automation theme,
    celestial mechanics. Classical drapery, idealized anatomy. Sacred geometry meets divine engineering.
    Square format, centered, museum quality.`,
  },
  {
    title: 'Lead Scoring Engine',
    name: 'lead-scoring-engine',
    category: 'Automation',
    michelangeloPrompt: `Renaissance fresco inspired by Michelangelo. A classical judge figure holds golden
    scales of justice, weighing souls/scrolls with divine light illuminating the worthy ones. Similar to
    Last Judgment imagery but focused on wisdom and discernment. Warm earth tones, ochre, sienna, umber with
    metallic gold. Cracked fresco surface, dramatic chiaroscuro, sfumato technique. Divine judgment and
    discernment theme. Classical robes, powerful anatomy, celestial balance. Philosophical wisdom.
    Square composition, museum quality.`,
  },
  {
    title: 'Content Calendar',
    name: 'content-calendar',
    category: 'Automation',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. A classical astronomer studies an astrolabe
    and celestial calendar showing the zodiac, seasons, and cosmic cycles. Divine light traces the path of
    the sun and stars. Sistine Chapel aesthetic with warm ochre, sienna, umber earth tones and lapis blue sky.
    Cracked fresco texture, dramatic lighting, sfumato technique. Time, seasons, divine order theme. Classical
    robes, contemplative wisdom. Sacred calendar and cosmic harmony. Square format, centered, museum quality.`,
  },
  {
    title: 'Integration Hub',
    name: 'integration-hub',
    category: 'Automation',
    michelangeloPrompt: `Renaissance fresco in Michelangelo style. Multiple classical hands reach toward a
    central divine light source, each connected by golden threads forming a sacred geometric pattern. Similar
    to Creation of Adam but with multiple hands unified. Warm earth tones, ochre, sienna, umber with lapis
    blue. Cracked fresco surface, dramatic chiaroscuro, sfumato technique. Unity and connection theme.
    Classical anatomy, powerful gesture, divine harmony. All parts connected to divine whole. Square
    composition, museum quality.`,
  },
  {
    title: 'Podcast Studio',
    name: 'podcast-studio',
    category: 'Content',
    michelangeloPrompt: `Michelangelo Renaissance fresco. A classical orator speaks from a podium while
    divine sound waves (rendered as golden musical notation and sacred geometry) emanate outward in concentric
    circles. Angelic figures listen from clouds above. Sistine Chapel aesthetic with warm ochre, sienna, umber
    and lapis blue. Cracked fresco texture, dramatic lighting, sfumato technique. Divine speech and wisdom
    theme. Classical robes, powerful oratory gesture, celestial audience. Voice as divine instrument.
    Square format, museum quality.`,
  },
  {
    title: 'Report Generator',
    name: 'report-generator',
    category: 'Content',
    michelangeloPrompt: `Renaissance fresco inspired by Michelangelo. A classical scribe writes in a large
    tome while divine light flows from heaven onto the pages, making the text glow golden. Angels assist by
    holding additional scrolls. Similar to Sistine Chapel evangelists. Warm earth tones, ochre, sienna, umber
    with lapis blue accents. Cracked fresco surface, dramatic chiaroscuro, sfumato technique. Divine
    documentation theme. Classical drapery, scholarly wisdom, sacred knowledge. Heavenly record keeping.
    Square composition, museum quality.`,
  },
  {
    title: 'Brand Asset Library',
    name: 'brand-asset-library',
    category: 'Content',
    michelangeloPrompt: `Michelangelo-style Renaissance fresco. A magnificent classical library with scrolls,
    books, and treasures organized on celestial shelves that extend into clouds. A wise librarian figure in
    flowing robes guards the sacred knowledge. Divine light illuminates specific volumes. Sistine Chapel
    aesthetic with warm ochre, sienna, umber earth tones and lapis blue. Cracked fresco texture, dramatic
    lighting, sfumato technique. Sacred knowledge preservation theme. Classical architecture, profound wisdom.
    Temple of wisdom. Square format, centered, museum quality.`,
  },
];

/**
 * Download image from URL
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if error
        reject(err);
      });
    }).on('error', reject);
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

    const imageUrl = output;
    const imagePath = path.join(OUTPUT_DIR, `${icon.name}.png`);
    const metadataPath = path.join(OUTPUT_DIR, `${icon.name}-metadata.json`);

    // Download the image
    console.log(`Downloading image...`);
    await downloadImage(imageUrl, imagePath);

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
      imageUrl: imageUrl,
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
    console.error(`✗ Failed to generate ${icon.title}:`, error.message);
    return {
      success: false,
      icon: icon.title,
      error: error.message,
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
