/**
 * Generate App Store-Style Icons for Resources Page
 * Creates 1024x1024 icons using OpenAI gpt-image-1
 * FIXED VERSION with proper error handling and retries
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Output directory
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
    prompt: `App store icon, 1024x1024px, rounded square background with subtle rounded corners, centered composition with padding.

Glassmorphism style with frosted glass effect. A glowing modern pen or quill floating in the center, surrounded by floating text particles and sparkles. Translucent frosted glass layers with subtle depth and blur.

Color palette: Deep blue gradient background transitioning from #2563eb to #1e40af, white and light blue translucent glass elements with subtle shadows, gold accent sparkles #d4af37.

Modern, clean, professional SaaS aesthetic. Soft drop shadows, gaussian blur effects, premium polished feel. Icon centered with generous padding on all sides. Professional app store quality.`,
  },
  {
    name: 'growth-audit-tool',
    title: 'Growth Audit Tool',
    style: '3d-clay',
    prompt: `App store icon, 1024x1024px, rounded square background with subtle rounded corners, centered composition with padding.

3D clay aesthetic with soft touchable matte surfaces. An upward trending arrow or growth chart made of smooth 3D clay material. Playful yet professional, minimalist composition.

Color palette: Smooth gradient background from teal #14b8a6 to vibrant green #10b981, 3D clay elements in cream and white tones with matte finish, subtle gold accent highlights #c9a53b.

Soft studio lighting from top-left, gentle drop shadows creating depth but not overwhelming. Notion/Linear style minimalism with premium SaaS polish. Icon centered with padding.`,
  },
  {
    name: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    style: 'advanced-gradient',
    prompt: `App store icon, 1024x1024px, rounded square background with subtle rounded corners, centered composition with padding.

Advanced mesh gradient style with sophisticated multi-color blends. Abstract data visualization featuring flowing gradient lines, bar chart elements, or pie chart segments that blend beautifully into gradient flows.

Color palette: Purple #9333ea blending to blue #3b82f6 flowing to pink #ec4899 in smooth mesh gradient, vibrant but professional. Subtle gold highlight accents #d4af37 on data points.

Modern, dynamic, data-forward aesthetic. Clean geometric shapes with smooth anti-aliased edges, seamless gradient transitions, professional SaaS tool appearance. Icon centered with padding.`,
  }
];

/**
 * Download image from URL with retry logic
 */
function downloadImage(url, filepath, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft) => {
      https.get(url, (response) => {
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(filepath);
          response.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve(filepath);
          });

          fileStream.on('error', (err) => {
            fs.unlink(filepath, () => {});
            if (retriesLeft > 0) {
              console.log(`   Retrying download... (${retriesLeft} attempts left)`);
              setTimeout(() => attempt(retriesLeft - 1), 2000);
            } else {
              reject(err);
            }
          });
        } else {
          reject(new Error(`Download failed with status ${response.statusCode}`));
        }
      }).on('error', (err) => {
        if (retriesLeft > 0) {
          console.log(`   Download error, retrying... (${retriesLeft} attempts left)`);
          setTimeout(() => attempt(retriesLeft - 1), 2000);
        } else {
          reject(err);
        }
      });
    };

    attempt(retries);
  });
}

/**
 * Generate a single icon using OpenAI gpt-image-1 with retry logic
 */
async function generateIcon(config, retries = 2) {
  console.log(`\n🎨 Generating ${config.title} (${config.style} style)...`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`   Retry attempt ${attempt}/${retries}...`);
      }

      const response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt: config.prompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium' // Valid values: 'low', 'medium', 'high'
      });

      const imageUrl = response.data[0].url;
      console.log(`   ✅ Generated successfully`);
      console.log(`   Downloading from: ${imageUrl.substring(0, 50)}...`);

      const filename = `${config.name}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      // Download the image with retries
      await downloadImage(imageUrl, filepath);

      const stats = fs.statSync(filepath);
      console.log(`   ✅ Saved: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

      return filepath;

    } catch (error) {
      console.error(`   ❌ Attempt ${attempt + 1} failed:`, error.message);

      if (attempt === retries) {
        // Last attempt failed
        console.error(`   Error type: ${error.constructor.name}`);
        if (error.code) console.error(`   Error code: ${error.code}`);
        if (error.response) {
          console.error(`   API Response status: ${error.response.status}`);
          console.error(`   API Response:`, error.response.data);
        }
        throw error;
      }

      // Wait before retry
      console.log(`   Waiting 5 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Generate all sample icons
 */
async function generateSamples() {
  console.log('🚀 Starting Resource Icon Generation');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🎨 Using OpenAI gpt-image-1`);
  console.log(`📊 Generating ${SAMPLE_ICONS.length} sample icons...\n`);

  // Check API key
  if (!process.env.VITE_OPENAI_API_KEY) {
    console.error('❌ VITE_OPENAI_API_KEY environment variable not set!');
    console.log('Please set it in your .env file or environment.');
    process.exit(1);
  }

  const results = [];

  for (const config of SAMPLE_ICONS) {
    try {
      const filepath = await generateIcon(config);
      results.push({
        success: true,
        name: config.name,
        title: config.title,
        style: config.style,
        filepath
      });

      // Wait between requests to avoid rate limits (OpenAI has generous limits but good practice)
      console.log('   Waiting 3 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      results.push({
        success: false,
        name: config.name,
        title: config.title,
        style: config.style,
        error: error.message
      });
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
      console.log(`   - ${r.title} (${r.style})`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Icons:');
    failed.forEach(r => {
      console.log(`   - ${r.title}: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));

  // Troubleshooting tips if any failed
  if (failed.length > 0) {
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Check your OpenAI API key is valid and has credits');
    console.log('   2. Verify network connectivity to api.openai.com');
    console.log('   3. Check if firewall/VPN is blocking the connection');
    console.log('   4. Try running: node scripts/test-openai-connection.js');
    console.log('   5. Check OpenAI API status: https://status.openai.com/');
  }
}

// Run the generator
generateSamples().catch(console.error);
