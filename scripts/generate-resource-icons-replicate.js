/**
 * Generate App Store-Style Icons for Resources Page
 * Uses Replicate Flux 1.1 Pro for high-quality icon generation
 * Mixed styles: Glassmorphism, 3D Clay, Advanced Gradients
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'resource-icons');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Sample icons to generate (3 different styles)
const SAMPLE_ICONS = [
  {
    name: 'ai-content-writer',
    title: 'AI Content Writer',
    style: 'glassmorphism',
    prompt: `Professional app store icon, 1024x1024px square format, centered composition with padding.

Glassmorphism style with elegant frosted glass effect. A modern glowing pen or quill floating in center, surrounded by floating text particles and soft sparkles. Multiple translucent glass layers creating depth and dimension.

Color palette: Deep blue gradient background transitioning from vibrant #2563eb to deep #1e40af, white and light blue translucent glass elements with subtle shadows, gold accent sparkles #d4af37.

Modern premium SaaS aesthetic. Soft drop shadows, gaussian blur effects on glass, polished professional feel. Generous padding around icon, perfectly centered. High-end app store quality, crisp and sharp.`,
  },
  {
    name: 'growth-audit-tool',
    title: 'Growth Audit Tool',
    style: '3d-clay',
    prompt: `Professional app store icon, 1024x1024px square format, centered composition with padding.

3D clay aesthetic with soft matte touchable surfaces. An upward trending arrow or growth chart made of smooth sculpted 3D clay material. Playful yet professional minimalist composition.

Color palette: Smooth gradient background from bright teal #14b8a6 transitioning to vibrant green #10b981, 3D clay elements in pure white and cream tones with matte finish, subtle gold accent highlights #c9a53b.

Soft studio lighting from top-left corner, gentle drop shadows creating natural depth. Notion and Linear style minimalism with premium SaaS polish. Icon perfectly centered with generous padding.`,
  },
  {
    name: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    style: 'advanced-gradient',
    prompt: `Professional app store icon, 1024x1024px square format, centered composition with padding.

Advanced mesh gradient style with sophisticated multi-color blends. Abstract data visualization featuring flowing gradient lines, smooth bar chart elements, or elegant pie chart segments that blend beautifully into gradient flows.

Color palette: Rich purple #9333ea blending seamlessly to bright blue #3b82f6 flowing into vibrant pink #ec4899 in smooth mesh gradient, vibrant yet professional. Subtle gold highlight accents #d4af37 on key data points.

Modern dynamic data-forward aesthetic. Clean geometric shapes with smooth anti-aliased edges, seamless gradient transitions, professional SaaS dashboard appearance. Icon perfectly centered with padding.`,
  }
];

/**
 * Download image from URL
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * Generate a single icon using Replicate Flux 1.1 Pro
 */
async function generateIcon(config) {
  console.log(`\n🎨 Generating ${config.title} (${config.style} style)...`);
  console.log(`Prompt: ${config.prompt.substring(0, 100)}...`);

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: config.prompt,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 100,
          safety_tolerance: 2,
          prompt_upsampling: true // Enable for better quality
        }
      }
    );

    // Replicate returns a FileOutput object with a url() method
    let imageUrl;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (output && typeof output.url === 'function') {
      imageUrl = await output.url();
    } else if (output && typeof output.url === 'string') {
      imageUrl = output.url;
    }

    if (!imageUrl) {
      throw new Error(`No output URL received from Replicate. Output type: ${typeof output}`);
    }

    const filename = `${config.name}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`📥 Downloading to: ${filename}`);
    await downloadImage(imageUrl, filepath);

    const stats = fs.statSync(filepath);
    console.log(`✅ Saved: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

    // Save metadata
    const metadata = {
      title: config.title,
      name: config.name,
      style: config.style,
      prompt: config.prompt,
      model: 'black-forest-labs/flux-1.1-pro',
      timestamp: new Date().toISOString(),
      filepath: `/images/resource-icons/${filename}`
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${config.name}-metadata.json`),
      JSON.stringify(metadata, null, 2)
    );

    return { success: true, title: config.title, filepath };

  } catch (error) {
    console.error(`❌ Error generating ${config.title}:`);
    console.error('   Error message:', error.message);
    console.error('   Error type:', error.constructor.name);
    if (error.stack) {
      console.error('   Stack trace:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    return { success: false, title: config.title, error: error.message };
  }
}

/**
 * Generate all sample icons
 */
async function generateSamples() {
  console.log('🚀 Starting Resource Icon Generation');
  console.log('=' .repeat(60));
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🎨 Using Replicate Flux 1.1 Pro`);
  console.log(`📊 Generating ${SAMPLE_ICONS.length} sample icons...`);
  console.log('=' .repeat(60));

  const results = [];

  for (let i = 0; i < SAMPLE_ICONS.length; i++) {
    const config = SAMPLE_ICONS[i];
    const result = await generateIcon(config);
    results.push(result);

    // Wait between requests to avoid rate limits
    if (i < SAMPLE_ICONS.length - 1) {
      console.log('⏳ Waiting 3 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${SAMPLE_ICONS.length}`);
  console.log(`❌ Failed: ${failed.length}/${SAMPLE_ICONS.length}`);

  if (successful.length > 0) {
    console.log('\n✅ Generated Icons:');
    successful.forEach(r => {
      console.log(`   - ${r.title}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Icons:');
    failed.forEach(r => {
      console.log(`   - ${r.title}: ${r.error}`);
    });
  }

  // Save generation report
  const report = {
    timestamp: new Date().toISOString(),
    model: 'black-forest-labs/flux-1.1-pro',
    total: SAMPLE_ICONS.length,
    successful: successful.length,
    failed: failed.length,
    results
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'generation-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n' + '='.repeat(60));
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
  console.log(`📄 Report saved: ${path.join(OUTPUT_DIR, 'generation-report.json')}`);
  console.log('='.repeat(60));
}

// Run the generator
generateSamples().catch(console.error);
