/**
 * Netlify Function: Screenshot Capture API
 *
 * Serverless function to capture screenshots using Playwright
 * Uploads to Cloudinary and saves metadata to Supabase
 *
 * POST /api/screenshot/capture
 *
 * @param {Object} body - Request body
 * @param {string} body.pageRoute - Page route to capture
 * @param {string} body.changeDescription - Description of change
 * @param {string} body.viewport - Viewport size
 * @param {boolean} body.capturedBeforeChange - Before/after flag
 * @param {string} body.relatedChangeId - Related change ID
 */

import { chromium } from 'playwright';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

/**
 * Viewport configurations
 */
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
  'large-desktop': { width: 2560, height: 1440 }
};

/**
 * Initialize clients
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Netlify function handler
 */
export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      pageRoute,
      changeDescription,
      viewport = 'desktop',
      capturedBeforeChange = true,
      relatedChangeId
    } = body;

    // Validate required fields
    if (!pageRoute || !changeDescription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: pageRoute, changeDescription' })
      };
    }

    // Validate viewport
    if (!VIEWPORTS[viewport]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Invalid viewport: ${viewport}` })
      };
    }

    // Get base URL (use deployment URL or localhost)
    const baseUrl = process.env.URL || process.env.VITE_APP_URL || 'http://localhost:5173';
    const fullUrl = `${baseUrl}${pageRoute}`;

    console.log(`Capturing screenshot: ${fullUrl} (${viewport})`);

    // Launch browser
    const browser = await chromium.launch();
    const contextOptions = {
      viewport: VIEWPORTS[viewport]
    };
    const browserContext = await browser.newContext(contextOptions);
    const page = await browserContext.newPage();

    // Navigate to page
    await page.goto(fullUrl, { waitUntil: 'networkidle' });

    // Wait for animations to complete
    await page.waitForTimeout(2000);

    // Take screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png'
    });

    // Close browser
    await page.close();
    await browserContext.close();
    await browser.close();

    console.log('Screenshot captured, uploading to Cloudinary...');

    // Upload to Cloudinary
    const screenshotUrl = await uploadToCloudinary(screenshot, {
      pageRoute,
      changeDescription,
      viewport,
      timestamp: new Date()
    });

    console.log('Uploaded to Cloudinary, saving metadata...');

    // Save metadata to Supabase
    const metadata = {
      page_route: pageRoute,
      change_description: changeDescription,
      screenshot_url: screenshotUrl,
      viewport_size: viewport,
      captured_at: new Date().toISOString(),
      captured_before_change: capturedBeforeChange,
      related_change_id: relatedChangeId || generateChangeId()
    };

    const { data, error } = await supabase
      .from('page_screenshots')
      .insert([metadata])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Screenshot capture complete!');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        screenshot: data
      })
    };

  } catch (error) {
    console.error('Screenshot capture error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Screenshot capture failed',
        message: error.message
      })
    };
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

  const folderPath = `disruptors-media/screenshots/${year}/${month}/${day}`;

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
