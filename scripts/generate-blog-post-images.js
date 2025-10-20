#!/usr/bin/env node
/**
 * Generate AI Images for 10 Blog Posts
 * Uses OpenAI gpt-image-1 to create professional marketing images
 *
 * Usage: node scripts/generate-blog-post-images.js
 */

import { openaiGenerate } from '../src/lib/openai-image.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Blog post image specifications
const BLOG_POSTS = [
  {
    id: 1,
    title: "AI Marketing Automation in 2025: Why 51% of Marketers Still Can't Measure ROI",
    slug: "ai-marketing-roi-2025",
    prompt: "Professional business analytics dashboard showing AI marketing ROI metrics and performance graphs. Modern, clean design with blue and purple gradients. Charts showing 51% gap in measurement. High-tech futuristic style with holographic elements. Photorealistic 3D rendering. Corporate professional aesthetic.",
    keywords: ["ROI", "analytics", "metrics", "dashboard"]
  },
  {
    id: 2,
    title: "The Business Brain Revolution: How AI Knowledge Bases Are Replacing Generic Content",
    slug: "business-brain-revolution",
    prompt: "Glowing digital brain made of interconnected nodes and neural networks, floating above a sleek workspace. Vibrant cyan and purple energy flowing through synapses. Futuristic AI visualization with data streams and knowledge graphs. High-tech corporate aesthetic. Photorealistic with volumetric lighting. Represents centralized AI intelligence.",
    keywords: ["brain", "AI", "knowledge", "neural network"]
  },
  {
    id: 3,
    title: "From 37% to 60%: Inside the Daily AI Usage Explosion Among Marketing Teams",
    slug: "ai-usage-explosion-2025",
    prompt: "Dynamic upward trending graph with explosive growth visualization from 37% to 60%. Marketing team silhouettes collaborating with AI holographic interfaces. Modern office environment with digital overlay. Electric blue and orange color scheme. Professional corporate style with motion blur effects suggesting rapid growth.",
    keywords: ["growth", "statistics", "teamwork", "explosion"]
  },
  {
    id: 4,
    title: "90% of Marketers Use AI for Content—But Only 29% Are 'Advanced'",
    slug: "ai-maturity-gap-explained",
    prompt: "Split-screen composition showing novice vs expert AI users. Left side: basic chatbot interface with simple prompts. Right side: advanced multi-model AI orchestration dashboard with sophisticated workflows. Contrast between beginner and expert levels. Modern tech aesthetic with blue-purple gradient. Professional infographic style.",
    keywords: ["maturity", "expert", "beginner", "comparison"]
  },
  {
    id: 5,
    title: "Multi-Tier AI Content Systems: Why Your Marketing Needs Three Access Levels",
    slug: "multi-tier-ai-systems",
    prompt: "Three-tiered pyramid or platform architecture visualization showing internal, client, and public access levels. Each tier glowing with different color (gold/blue/green). Secure padlocks and access control symbols. Isometric 3D design. Professional enterprise architecture style. Clean modern corporate aesthetic.",
    keywords: ["tiers", "architecture", "security", "levels"]
  },
  {
    id: 6,
    title: "Hyper-Personalization Beyond ChatGPT: Building AI That Knows Your Brand Voice",
    slug: "brand-voice-personalization",
    prompt: "Anthropomorphic AI assistant wearing brand colors, surrounded by voice waveforms and personality traits floating in space. Microphone and sound wave visualizations. Vibrant brand elements like logos, colors, and typography orbiting the central figure. Warm professional lighting. Creative advertising style with personality.",
    keywords: ["personalization", "brand", "voice", "character"]
  },
  {
    id: 7,
    title: "The $47.32 Billion AI Marketing Opportunity: 10 Workflows That Drive Revenue",
    slug: "ai-marketing-opportunity-workflows",
    prompt: "Flowing automation workflow diagram with ten connected nodes showing revenue generation paths. Dollar signs and upward revenue graphs integrated into design. Professional financial visualization with green and gold accents. Modern infographic style with 3D elements. Clean corporate aesthetic showing prosperity and growth.",
    keywords: ["revenue", "workflows", "automation", "money"]
  },
  {
    id: 8,
    title: "AI-Powered Growth Audits: Analyze Competitors, SEO, and Performance in 30 Seconds",
    slug: "ai-growth-audits-guide",
    prompt: "High-speed scanning visualization showing website analysis, competitor comparison graphs, and SEO metrics being processed simultaneously. Stopwatch showing 30 seconds. Multiple browser windows and analytics dashboards in holographic display. Fast motion blur effects. Electric blue and cyan color palette. Tech-forward style.",
    keywords: ["audit", "speed", "analysis", "scanning"]
  },
  {
    id: 9,
    title: "Claude Sonnet 4.5 vs ChatGPT for Marketing: The 2025 Model Showdown",
    slug: "claude-vs-chatgpt-marketing-2025",
    prompt: "Side-by-side comparison of two advanced AI models represented as sophisticated robotic interfaces or digital entities facing each other. Left: Claude (purple/blue theme). Right: ChatGPT (green theme). Electric energy between them suggesting competition. Professional tech showdown aesthetic. Sleek corporate design with dramatic lighting.",
    keywords: ["comparison", "models", "AI", "competition"]
  },
  {
    id: 10,
    title: "Zero to Hero: Building an AI-First Marketing System in 30 Days",
    slug: "ai-marketing-system-30-days",
    prompt: "30-day calendar or timeline visualization showing progressive transformation from zero to hero. Starting point showing empty state, ending with fully functional AI marketing system. Rocket launch or growth metaphor. Inspirational corporate design with blue-to-green gradient suggesting growth. Modern professional style with achievement badges.",
    keywords: ["timeline", "transformation", "growth", "achievement"]
  }
];

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'blog-images', 'generated');
const METADATA_FILE = path.join(OUTPUT_DIR, 'generation-metadata.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✅ Created output directory:', OUTPUT_DIR);
}

/**
 * Generate a single blog post image
 */
async function generateBlogImage(post, index, total) {
  console.log(`\n📸 Generating Image ${index + 1}/${total}`);
  console.log(`   Title: ${post.title}`);
  console.log(`   Slug: ${post.slug}`);
  console.log('-'.repeat(70));

  try {
    console.log('   🎨 Prompt:', post.prompt.substring(0, 100) + '...');
    console.log('   🔄 Calling OpenAI gpt-image-1...');

    const buffer = await openaiGenerate({
      prompt: post.prompt,
      size: '1536x1024', // Wide format perfect for blog headers
      quality: 'high',
      inputFidelity: 'high'
    });

    const filename = `${post.slug}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, buffer);

    console.log('   ✅ Generated successfully!');
    console.log('   💾 Saved to:', filepath);
    console.log('   📊 Size:', (buffer.length / 1024).toFixed(2), 'KB');

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      filename,
      filepath,
      prompt: post.prompt,
      keywords: post.keywords,
      size: buffer.length,
      generatedAt: new Date().toISOString(),
      model: 'gpt-image-1',
      dimensions: '1536x1024',
      quality: 'high',
      success: true
    };
  } catch (error) {
    console.error('   ❌ Generation failed:', error.message);
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      error: error.message,
      success: false
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AI Blog Post Image Generation');
  console.log('=' .repeat(70));
  console.log(`📝 Generating ${BLOG_POSTS.length} images`);
  console.log(`🎨 Provider: OpenAI gpt-image-1`);
  console.log(`📐 Dimensions: 1536x1024 (blog header format)`);
  console.log(`✨ Quality: High`);
  console.log('=' .repeat(70));

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const result = await generateBlogImage(BLOG_POSTS[i], i, BLOG_POSTS.length);
    results.push(result);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limit protection: wait 2 seconds between requests
    if (i < BLOG_POSTS.length - 1) {
      console.log('   ⏳ Waiting 2 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Save metadata
  const metadata = {
    generatedAt: new Date().toISOString(),
    totalImages: BLOG_POSTS.length,
    successCount,
    failCount,
    model: 'gpt-image-1',
    provider: 'OpenAI',
    dimensions: '1536x1024',
    quality: 'high',
    results
  };

  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Generation Complete!');
  console.log('=' .repeat(70));
  console.log(`✅ Success: ${successCount}/${BLOG_POSTS.length}`);
  console.log(`❌ Failed: ${failCount}/${BLOG_POSTS.length}`);
  console.log(`💾 Images saved to: ${OUTPUT_DIR}`);
  console.log(`📄 Metadata saved to: ${METADATA_FILE}`);

  if (successCount > 0) {
    console.log('\n🎉 Successfully generated images:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   ✓ ${r.filename}`);
    });
  }

  if (failCount > 0) {
    console.log('\n⚠️  Failed generations:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ✗ ${r.slug}: ${r.error}`);
    });
  }

  console.log('\n✨ Blog post images are ready to use!');
  console.log(`📂 Location: public/blog-images/generated/`);
  console.log('\n🔗 Integration:');
  console.log('   Use these images in your blog posts by referencing:');
  console.log('   /blog-images/generated/[slug].png');

  process.exit(failCount > 0 ? 1 : 0);
}

// Execute
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
