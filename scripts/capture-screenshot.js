#!/usr/bin/env node

/**
 * Screenshot Capture CLI Tool
 *
 * Command-line tool for manual screenshot capture using Playwright
 * Can capture single pages or batch capture all pages
 *
 * Usage:
 *   npm run screenshot:capture -- --page=/home --change="Update hero section"
 *   npm run screenshot:capture -- --all --change="Pre-deployment check"
 *   npm run screenshot:capture -- --page=/about --viewports=desktop,mobile
 *
 * @requires playwright
 * @requires dotenv
 */

import { chromium } from 'playwright';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration
 */
const CONFIG = {
  baseUrl: process.env.VITE_APP_URL || 'http://localhost:5173',
  cloudinaryFolder: 'disruptors-media/screenshots',
  defaultViewports: ['desktop'],
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
    'large-desktop': { width: 2560, height: 1440 }
  }
};

/**
 * All pages in the application (from src/pages/index.jsx)
 */
const ALL_PAGES = [
  '/',
  '/assessment',
  '/calculator',
  '/solutions',
  '/work',
  '/about',
  '/resources',
  '/contact',
  '/blog',
  '/work-saas-content-engine',
  '/work-tradeworx-usa',
  '/work-timber-view-financial',
  '/work-the-wellness-way',
  '/work-sound-corrections',
  '/work-segpro',
  '/work-neuro-mastery',
  '/work-muscle-works',
  '/work-granite-paving',
  '/work-auto-trim-utah',
  '/solutions-ai-automation',
  '/solutions-social-media',
  '/solutions-seo-geo',
  '/solutions-lead-generation',
  '/solutions-paid-advertising',
  '/solutions-podcasting',
  '/solutions-custom-apps',
  '/solutions-crm-management',
  '/solutions-fractional-cmo',
  '/podcast',
  '/gallery',
  '/faq',
  '/demos/growth-audit',
  '/demos/hero-focus',
  '/demos/benefits-driven',
  '/demos/social-proof',
  '/demos/interactive',
  '/demos/conversion',
  '/demos/best-of-all'
];

/**
 * Initialize Cloudinary
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Initialize Supabase client
 */
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    page: null,
    change: 'Manual screenshot capture',
    all: false,
    viewports: CONFIG.defaultViewports,
    before: true,
    changeId: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--page=')) {
      options.page = arg.split('=')[1];
    } else if (arg.startsWith('--change=')) {
      options.change = arg.split('=')[1];
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg.startsWith('--viewports=')) {
      options.viewports = arg.split('=')[1].split(',');
    } else if (arg === '--after') {
      options.before = false;
    } else if (arg.startsWith('--change-id=')) {
      options.changeId = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Capture screenshot of a page
 */
async function capturePageScreenshot(browser, page, viewport, changeDescription, capturedBefore, changeId) {
  try {
    const url = `${CONFIG.baseUrl}${page}`;

    console.log(`📸 Capturing ${page} (${viewport})...`);

    // Create new page context
    const context = await browser.newContext({
      viewport: CONFIG.viewports[viewport]
    });

    const browserPage = await context.newPage();

    // Navigate to page
    await browserPage.goto(url, { waitUntil: 'networkidle' });

    // Wait for any animations to complete
    await browserPage.waitForTimeout(2000);

    // Take screenshot
    const screenshot = await browserPage.screenshot({
      fullPage: true,
      type: 'png'
    });

    await browserPage.close();
    await context.close();

    // Upload to Cloudinary
    const screenshotUrl = await uploadToCloudinary(screenshot, {
      pageRoute: page,
      changeDescription,
      viewport,
      timestamp: new Date()
    });

    // Save metadata to Supabase
    await saveMetadata({
      page_route: page,
      change_description: changeDescription,
      screenshot_url: screenshotUrl,
      viewport_size: viewport,
      captured_at: new Date().toISOString(),
      captured_before_change: capturedBefore,
      related_change_id: changeId
    });

    console.log(`✅ Captured ${page} (${viewport})`);

    return screenshotUrl;
  } catch (error) {
    console.error(`❌ Failed to capture ${page} (${viewport}):`, error.message);
    return null;
  }
}

/**
 * Upload screenshot to Cloudinary
 */
async function uploadToCloudinary(screenshotBuffer, metadata) {
  const { pageRoute, changeDescription, timestamp, viewport } = metadata;

  // Generate organized folder path
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const folderPath = `${CONFIG.cloudinaryFolder}/${year}/${month}/${day}`;

  // Generate filename
  const timestampStr = formatTimestamp(date);
  const pageSlug = pageRoute.replace(/^\//, '').replace(/\//g, '-') || 'home';
  const changeSlug = slugify(changeDescription);
  const filename = `${pageSlug}_${changeSlug}_${timestampStr}_${viewport}`;

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${screenshotBuffer.toString('base64')}`,
    {
      folder: folderPath,
      public_id: filename,
      resource_type: 'image',
      type: 'upload',
      tags: ['screenshot', pageSlug, viewport],
      context: {
        page_route: pageRoute,
        change_description: changeDescription,
        viewport: viewport,
        captured_at: timestamp.toISOString()
      }
    }
  );

  return result.secure_url;
}

/**
 * Save screenshot metadata to Supabase
 */
async function saveMetadata(metadata) {
  const { data, error } = await supabase
    .from('page_screenshots')
    .insert([metadata])
    .select()
    .single();

  if (error) {
    console.error('Failed to save metadata:', error);
    throw error;
  }

  return data;
}

/**
 * Format timestamp for filenames
 */
function formatTimestamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Slugify text
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Generate change ID
 */
function generateChangeId() {
  return `change-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  // Validate options
  if (!options.all && !options.page) {
    console.error('❌ Error: Must specify --page or --all');
    console.log('\nUsage:');
    console.log('  npm run screenshot:capture -- --page=/home --change="Update hero section"');
    console.log('  npm run screenshot:capture -- --all --change="Pre-deployment check"');
    console.log('  npm run screenshot:capture -- --page=/about --viewports=desktop,mobile');
    process.exit(1);
  }

  // Validate environment variables
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Error: Cloudinary credentials not found in environment variables');
    process.exit(1);
  }

  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Supabase credentials not found in environment variables');
    process.exit(1);
  }

  // Generate or use provided change ID
  const changeId = options.changeId || generateChangeId();

  console.log('\n🚀 Screenshot Capture Tool');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📝 Change: ${options.change}`);
  console.log(`🔖 Change ID: ${changeId}`);
  console.log(`📱 Viewports: ${options.viewports.join(', ')}`);
  console.log(`⏱️  Captured: ${options.before ? 'BEFORE' : 'AFTER'} change`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Determine pages to capture
  const pagesToCapture = options.all ? ALL_PAGES : [options.page];

  console.log(`📸 Capturing ${pagesToCapture.length} page(s)...\n`);

  // Launch browser
  const browser = await chromium.launch();

  let totalCaptured = 0;
  let totalFailed = 0;

  // Capture each page
  for (const page of pagesToCapture) {
    for (const viewport of options.viewports) {
      const result = await capturePageScreenshot(
        browser,
        page,
        viewport,
        options.change,
        options.before,
        changeId
      );

      if (result) {
        totalCaptured++;
      } else {
        totalFailed++;
      }
    }
  }

  await browser.close();

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Screenshot Capture Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Captured: ${totalCaptured}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`🔖 Change ID: ${changeId}`);
  console.log('\n💡 To capture AFTER screenshots, run:');
  console.log(`   npm run screenshot:capture -- --after --change-id="${changeId}" ${options.all ? '--all' : `--page=${options.page}`}\n`);
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
