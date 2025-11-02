/**
 * CHECK CLOUDINARY USAGE
 *
 * This script checks your Cloudinary account usage to identify
 * what's consuming your storage and bandwidth.
 *
 * Usage:
 * node scripts/check-cloudinary-usage.js
 */

import https from 'https';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Validate credentials
if (!API_KEY || !API_SECRET || API_SECRET === 'your_cloudinary_api_secret_here') {
  console.error('❌ ERROR: Cloudinary credentials not configured');
  console.error('\nPlease add to your .env file:');
  console.error('CLOUDINARY_API_KEY=Eueo6sCMjPWxtKiLh5lHlEUNvUA');
  console.error('CLOUDINARY_API_SECRET=<get from cloudinary dashboard>\n');
  process.exit(1);
}

/**
 * Make authenticated request to Cloudinary Admin API
 */
async function cloudinaryRequest(endpoint) {
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}${endpoint}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API request failed: ${response.statusCode} - ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Format bytes to human-readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get usage statistics
 */
async function getUsage() {
  console.log('🔍 CHECKING CLOUDINARY USAGE\n');
  console.log(`Cloud Name: ${CLOUD_NAME}\n`);

  try {
    // Get account usage
    console.log('📊 Fetching account usage...\n');
    const usage = await cloudinaryRequest('/usage');

    console.log('='.repeat(60));
    console.log('📈 ACCOUNT USAGE SUMMARY');
    console.log('='.repeat(60));

    // Plan details
    console.log('\n💳 PLAN DETAILS:');
    console.log(`  Plan: ${usage.plan || 'Free'}`);
    if (usage.credits?.usage !== undefined) {
      console.log(`  Credits Used: ${usage.credits.usage} / ${usage.credits.limit}`);
      const creditPercent = (usage.credits.usage / usage.credits.limit * 100).toFixed(1);
      console.log(`  Credits Remaining: ${usage.credits.limit - usage.credits.usage} (${100 - creditPercent}%)`);
    }

    // Storage
    console.log('\n💾 STORAGE:');
    if (usage.storage) {
      const storageGB = (usage.storage.usage / 1024 / 1024 / 1024).toFixed(2);
      const storageLimitGB = usage.storage.limit ? (usage.storage.limit / 1024 / 1024 / 1024).toFixed(2) : '25';
      console.log(`  Used: ${formatBytes(usage.storage.usage)} (${storageGB} GB)`);
      console.log(`  Limit: ${storageLimitGB} GB`);
      const storagePercent = (storageGB / storageLimitGB * 100).toFixed(1);
      console.log(`  Usage: ${storagePercent}%`);
    }

    // Bandwidth
    console.log('\n📡 BANDWIDTH (This Month):');
    if (usage.bandwidth) {
      const bandwidthGB = (usage.bandwidth.usage / 1024 / 1024 / 1024).toFixed(2);
      const bandwidthLimitGB = usage.bandwidth.limit ? (usage.bandwidth.limit / 1024 / 1024 / 1024).toFixed(2) : '25';
      console.log(`  Used: ${formatBytes(usage.bandwidth.usage)} (${bandwidthGB} GB)`);
      console.log(`  Limit: ${bandwidthLimitGB} GB`);
      const bandwidthPercent = (bandwidthGB / bandwidthLimitGB * 100).toFixed(1);
      console.log(`  Usage: ${bandwidthPercent}%`);
    }

    // Transformations
    console.log('\n🔄 TRANSFORMATIONS (This Month):');
    if (usage.transformations) {
      console.log(`  Used: ${usage.transformations.usage?.toLocaleString() || 0}`);
      console.log(`  Limit: ${usage.transformations.limit?.toLocaleString() || '25,000'}`);
      if (usage.transformations.limit) {
        const transPercent = (usage.transformations.usage / usage.transformations.limit * 100).toFixed(1);
        console.log(`  Usage: ${transPercent}%`);
      }
    }

    // Resources
    console.log('\n📁 RESOURCES:');
    if (usage.resources) {
      console.log(`  Images: ${usage.resources || 'N/A'}`);
    }
    if (usage.derived_resources) {
      console.log(`  Derived: ${usage.derived_resources || 'N/A'}`);
    }

    // Warnings
    console.log('\n⚠️  ALERTS:');
    let hasWarnings = false;

    if (usage.storage && usage.storage.usage / usage.storage.limit > 0.8) {
      console.log('  🔴 Storage: Above 80% - Consider cleanup');
      hasWarnings = true;
    }

    if (usage.bandwidth && usage.bandwidth.usage / usage.bandwidth.limit > 0.8) {
      console.log('  🔴 Bandwidth: Above 80% - High traffic month');
      hasWarnings = true;
    }

    if (usage.credits && usage.credits.usage / usage.credits.limit > 0.9) {
      console.log('  🔴 Credits: Above 90% - URGENT: Account will be limited');
      hasWarnings = true;
    }

    if (!hasWarnings) {
      console.log('  ✅ No alerts - Usage within normal limits');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');

    if (usage.storage?.usage / usage.storage?.limit > 0.8) {
      console.log('  1. Run backup script: node scripts/backup-all-cloudinary-assets.js');
      console.log('  2. Review and delete unused assets in Media Library');
      console.log('  3. Consider migrating to Supabase Storage (FREE)');
    }

    if (usage.bandwidth?.usage / usage.bandwidth?.limit > 0.8) {
      console.log('  1. Enable more aggressive caching (q_auto:low)');
      console.log('  2. Reduce video quality (720p instead of 1080p)');
      console.log('  3. Consider CDN with your own storage');
    }

    if (usage.credits?.usage / usage.credits?.limit > 0.9) {
      console.log('  1. URGENT: Backup all assets immediately');
      console.log('  2. Migrate critical sites to alternative storage');
      console.log('  3. Delete old/unused assets to free up credits');
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Failed to fetch usage:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. CLOUDINARY_API_SECRET is incorrect');
    console.error('2. API credentials expired');
    console.error('3. Network connection issue');
  }
}

// Run usage check
getUsage();
