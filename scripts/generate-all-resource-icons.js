/**
 * Generate ALL Resource Icons (19 total)
 * Uses Replicate Flux 1.1 Pro with mixed styles
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

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// All 19 tools with custom prompts (3 already generated, 16 new)
const ALL_ICONS = [
  // === AI TOOLS (4) ===
  {
    name: 'ai-content-writer',
    title: 'AI Content Writer',
    category: 'AI Tools',
    style: 'glassmorphism',
    skip: true, // Already generated
  },
  {
    name: 'ai-image-generator',
    title: 'AI Image Generator',
    category: 'AI Tools',
    style: 'advanced-gradient',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Advanced mesh gradient style. A magical artist's palette with vibrant paint swatches transforming into glowing particles and flowing into abstract artistic shapes.

Color palette: Vibrant orange #ff6b35 blending to purple #9333ea flowing to cyan #06b6d4 in smooth mesh gradient, creative and energetic. Gold sparkle accents #d4af37.

Modern creative aesthetic. Flowing brush strokes, abstract art elements, seamless gradient transitions. Centered with padding.`,
  },
  {
    name: 'chatbot-builder',
    title: 'AI Chatbot Builder',
    category: 'AI Tools',
    style: '3d-clay',
    prompt: `Professional app store icon, 1024x1024px square, centered.

3D clay aesthetic. A friendly chat bubble with small animated sparkles around it, made of smooth sculpted clay material. Minimalist and approachable.

Color palette: Gradient from vibrant blue #3b82f6 to cyan #06b6d4, clay chat bubble in white with matte finish, gold accent sparkles #c9a53b.

Soft studio lighting, gentle shadows. Modern messaging app aesthetic. Centered with padding.`,
  },
  {
    name: 'video-generator',
    title: 'AI Video Generator',
    category: 'AI Tools',
    style: 'glassmorphism',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Glassmorphism style. A translucent play button with film strip elements floating around it, frosted glass layers creating depth.

Color palette: Deep purple gradient #7c3aed to magenta #db2777, white/light purple glass elements, gold frame accents #d4af37.

Modern video app aesthetic. Soft shadows, blur effects, premium feel. Centered with padding.`,
  },

  // === MARKETING & GROWTH (4) ===
  {
    name: 'growth-audit-tool',
    title: 'Growth Audit Tool',
    category: 'Marketing & Growth',
    style: '3d-clay',
    skip: true, // Already generated
  },
  {
    name: 'seo-optimizer',
    title: 'SEO Optimizer',
    category: 'Marketing & Growth',
    style: 'glassmorphism',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Glassmorphism style. A magnifying glass with search graph trending upward inside the lens, translucent glass layers.

Color palette: Emerald green gradient #10b981 to teal #14b8a6, white/light green glass elements, gold highlight accents #d4af37.

Modern SEO tool aesthetic. Soft shadows, glass blur, professional. Centered with padding.`,
  },
  {
    name: 'social-media-manager',
    title: 'Social Media Manager',
    category: 'Marketing & Growth',
    style: 'advanced-gradient',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Advanced mesh gradient. Multiple connected nodes or circles representing social networks, flowing together with gradient connections.

Color palette: Pink #ec4899 to orange #f97316 to blue #3b82f6 mesh gradient, vibrant social aesthetic. Gold connection points #d4af37.

Modern social media aesthetic. Connected network visualization, smooth gradients. Centered with padding.`,
  },
  {
    name: 'email-campaign-builder',
    title: 'Email Campaign Builder',
    category: 'Marketing & Growth',
    style: '3d-clay',
    prompt: `Professional app store icon, 1024x1024px square, centered.

3D clay aesthetic. An envelope opening with small stars or sparkles emerging from it, sculpted clay material.

Color palette: Gradient from blue #2563eb to indigo #4f46e5, clay envelope in white with matte finish, gold stars #c9a53b.

Soft studio lighting, gentle shadows. Email marketing aesthetic. Centered with padding.`,
  },

  // === ANALYTICS & INSIGHTS (4) ===
  {
    name: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    category: 'Analytics & Insights',
    style: 'advanced-gradient',
    skip: true, // Already generated
  },
  {
    name: 'conversion-tracker',
    title: 'Conversion Tracker',
    category: 'Analytics & Insights',
    style: 'glassmorphism',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Glassmorphism style. A target bullseye with glowing center and translucent rings, frosted glass effect.

Color palette: Orange gradient #f97316 to red #ef4444, white/light orange glass rings, gold center glow #d4af37.

Modern conversion optimization aesthetic. Glass layers, soft glow, professional. Centered with padding.`,
  },
  {
    name: 'performance-monitor',
    title: 'Performance Monitor',
    category: 'Analytics & Insights',
    style: '3d-clay',
    prompt: `Professional app store icon, 1024x1024px square, centered.

3D clay aesthetic. A speedometer or gauge with needle pointing to high performance zone, sculpted clay.

Color palette: Gradient from cyan #06b6d4 to blue #3b82f6, clay gauge in white with matte finish, gold needle #c9a53b.

Soft lighting, minimal shadows. Performance monitoring aesthetic. Centered with padding.`,
  },
  {
    name: 'audience-intelligence',
    title: 'Audience Intelligence',
    category: 'Analytics & Insights',
    style: 'advanced-gradient',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Advanced mesh gradient. Abstract human silhouettes or head profiles with glowing neural network patterns inside.

Color palette: Purple #a855f7 to blue #3b82f6 to teal #14b8a6 mesh gradient, intelligent aesthetic. Gold neural highlights #d4af37.

Modern AI intelligence aesthetic. Flowing gradients, abstract data viz. Centered with padding.`,
  },

  // === AUTOMATION & WORKFLOW (4) ===
  {
    name: 'workflow-automation',
    title: 'Workflow Automation',
    category: 'Automation & Workflow',
    style: 'glassmorphism',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Glassmorphism style. Connected workflow nodes with arrows showing automation flow, translucent glass connectors.

Color palette: Indigo gradient #6366f1 to purple #9333ea, white/light purple glass nodes, gold flow indicators #d4af37.

Modern automation aesthetic. Glass layers, connection flow, professional. Centered with padding.`,
  },
  {
    name: 'lead-scoring-engine',
    title: 'Lead Scoring Engine',
    category: 'Automation & Workflow',
    style: '3d-clay',
    prompt: `Professional app store icon, 1024x1024px square, centered.

3D clay aesthetic. A star or trophy with small scoring indicators around it, sculpted clay material.

Color palette: Gradient from gold #eab308 to orange #f97316, clay trophy in white with matte finish, gold accents #c9a53b.

Soft lighting, subtle shadows. Lead scoring aesthetic. Centered with padding.`,
  },
  {
    name: 'content-calendar',
    title: 'Content Calendar',
    category: 'Automation & Workflow',
    style: 'advanced-gradient',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Advanced mesh gradient. A calendar grid with glowing scheduled posts or events, flowing gradient fills.

Color palette: Coral #fb7185 to purple #a855f7 to blue #60a5fa mesh gradient, organized aesthetic. Gold event markers #d4af37.

Modern calendar app aesthetic. Grid structure, gradient fills, clean. Centered with padding.`,
  },
  {
    name: 'integration-hub',
    title: 'Integration Hub',
    category: 'Automation & Workflow',
    style: 'glassmorphism',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Glassmorphism style. A central hub with multiple connection points radiating outward, translucent glass connectors.

Color palette: Cyan gradient #06b6d4 to blue #3b82f6, white/light blue glass hub, gold connection points #d4af37.

Modern integration aesthetic. Radial connections, glass layers, professional. Centered with padding.`,
  },

  // === CONTENT CREATION (3) ===
  {
    name: 'podcast-studio',
    title: 'Podcast Studio',
    category: 'Content Creation',
    style: '3d-clay',
    prompt: `Professional app store icon, 1024x1024px square, centered.

3D clay aesthetic. A professional microphone with audio waveforms emanating from it, sculpted clay material.

Color palette: Gradient from red #ef4444 to pink #ec4899, clay microphone in white with matte finish, gold waveforms #c9a53b.

Soft studio lighting, gentle shadows. Podcast aesthetic. Centered with padding.`,
  },
  {
    name: 'report-generator',
    title: 'Report Generator',
    category: 'Content Creation',
    style: 'advanced-gradient',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Advanced mesh gradient. A document or report with flowing data visualizations, charts, and graphs blending into gradients.

Color palette: Blue #3b82f6 to green #10b981 to yellow #eab308 mesh gradient, professional data aesthetic. Gold highlights #d4af37.

Modern reporting aesthetic. Data visualization, gradient flows, clean. Centered with padding.`,
  },
  {
    name: 'brand-asset-library',
    title: 'Brand Asset Library',
    category: 'Content Creation',
    style: 'glassmorphism',
    prompt: `Professional app store icon, 1024x1024px square, centered.

Glassmorphism style. A grid of asset tiles (images, colors, fonts) with translucent glass overlay showing brand elements.

Color palette: Rose gradient #f43f5e to purple #a855f7, white/light pink glass tiles, gold frame accents #d4af37.

Modern brand management aesthetic. Asset grid, glass layers, professional. Centered with padding.`,
  },
];

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

async function generateIcon(config, index, total) {
  if (config.skip) {
    console.log(`\n[${index + 1}/${total}] ⏭️  Skipping ${config.title} (already generated)`);
    return { success: true, title: config.title, skipped: true };
  }

  console.log(`\n[${index + 1}/${total}] 🎨 Generating ${config.title} (${config.style} style)...`);

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
          prompt_upsampling: true
        }
      }
    );

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
      throw new Error(`No output URL received from Replicate`);
    }

    const filename = `${config.name}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`📥 Downloading to: ${filename}`);
    await downloadImage(imageUrl, filepath);

    const stats = fs.statSync(filepath);
    console.log(`✅ Saved: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

    const metadata = {
      title: config.title,
      name: config.name,
      category: config.category,
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
    console.error(`❌ Error generating ${config.title}: ${error.message}`);
    return { success: false, title: config.title, error: error.message };
  }
}

async function generateAll() {
  console.log('🚀 Resource Icon Generation - FULL SET');
  console.log('=' .repeat(60));
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🎨 Using Replicate Flux 1.1 Pro`);
  console.log(`📊 Total icons: ${ALL_ICONS.length} (${ALL_ICONS.filter(i => !i.skip).length} to generate)`);
  console.log('=' .repeat(60));

  const results = [];

  for (let i = 0; i < ALL_ICONS.length; i++) {
    const result = await generateIcon(ALL_ICONS[i], i, ALL_ICONS.length);
    results.push(result);

    // Wait between API requests (skip if skipped)
    if (i < ALL_ICONS.length - 1 && !ALL_ICONS[i].skip) {
      console.log('⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Generated: ${successful}/${ALL_ICONS.length}`);
  console.log(`⏭️  Skipped: ${skipped}/${ALL_ICONS.length}`);
  console.log(`❌ Failed: ${failed}/${ALL_ICONS.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed icons:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.title}: ${r.error}`);
    });
  }

  const report = {
    timestamp: new Date().toISOString(),
    model: 'black-forest-labs/flux-1.1-pro',
    total: ALL_ICONS.length,
    generated: successful,
    skipped,
    failed,
    results
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'full-generation-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n' + '='.repeat(60));
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
  console.log(`📄 Report: ${path.join(OUTPUT_DIR, 'full-generation-report.json')}`);
  console.log('='.repeat(60));
  console.log('\n✨ Icon generation complete!');
}

generateAll().catch(console.error);
