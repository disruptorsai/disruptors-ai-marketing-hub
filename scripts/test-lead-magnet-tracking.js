/**
 * Lead Magnet Tracking Test Script
 *
 * Demonstrates how to use the lead magnet tracking system with sample data.
 * This script:
 * 1. Creates sample lead captures (signups)
 * 2. Simulates content accesses
 * 3. Queries analytics views
 * 4. Tests conversion funnel function
 *
 * Usage: node scripts/test-lead-magnet-tracking.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80));
}

// Sample data generators
const leadMagnets = [
  'keyword-research-tool',
  'ai-content-writer',
  'seo-checklist',
  'social-media-planner'
];

const utmSources = ['linkedin', 'twitter', 'facebook', 'email', 'organic'];
const utmMediums = ['social', 'email', 'referral', 'organic'];
const utmCampaigns = ['q1-launch', 'product-demo', 'webinar-promo', 'newsletter'];
const signupMethods = ['one_tap', 'oauth_button', 'email_password'];

function generateRandomEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-user-${timestamp}-${random}@example.com`;
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Track a lead capture (signup)
 */
async function trackLeadCapture(data) {
  const { data: capture, error } = await supabase
    .from('lead_captures')
    .insert({
      email: data.email,
      lead_magnet_slug: data.leadMagnetSlug,
      utm_source: data.utmSource,
      utm_medium: data.utmMedium,
      utm_campaign: data.utmCampaign,
      signup_method: data.signupMethod
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to track lead capture: ${error.message}`);
  }

  return capture;
}

/**
 * Track a lead access (content download/view)
 */
async function trackLeadAccess(data) {
  // Insert access record
  const { data: access, error: accessError } = await supabase
    .from('lead_accesses')
    .insert({
      email: data.email,
      user_id: data.userId,
      lead_magnet_slug: data.leadMagnetSlug,
      utm_source: data.utmSource,
      utm_medium: data.utmMedium,
      utm_campaign: data.utmCampaign
    })
    .select()
    .single();

  if (accessError) {
    throw new Error(`Failed to track lead access: ${accessError.message}`);
  }

  // Update lead_captures to mark as accessed
  const { error: updateError } = await supabase
    .from('lead_captures')
    .update({
      accessed: true,
      accessed_at: new Date().toISOString()
    })
    .eq('email', data.email)
    .eq('lead_magnet_slug', data.leadMagnetSlug);

  if (updateError) {
    console.warn(`Warning: Failed to update lead capture: ${updateError.message}`);
  }

  return access;
}

/**
 * Create sample lead captures
 */
async function createSampleLeads(count = 10) {
  section('📝 CREATING SAMPLE LEADS');

  const leads = [];

  for (let i = 0; i < count; i++) {
    const email = generateRandomEmail();
    const leadMagnetSlug = getRandomItem(leadMagnets);
    const utmSource = getRandomItem(utmSources);
    const utmMedium = getRandomItem(utmMediums);
    const utmCampaign = getRandomItem(utmCampaigns);
    const signupMethod = getRandomItem(signupMethods);

    try {
      const capture = await trackLeadCapture({
        email,
        leadMagnetSlug,
        utmSource,
        utmMedium,
        utmCampaign,
        signupMethod
      });

      leads.push(capture);
      log(`✅ Lead ${i + 1}/${count}: ${email} → ${leadMagnetSlug} (${utmSource})`, 'green');

      // Simulate 70% access rate
      if (Math.random() > 0.3) {
        await trackLeadAccess({
          email,
          leadMagnetSlug,
          userId: null, // Could be null if not authenticated
          utmSource,
          utmMedium,
          utmCampaign
        });
        log(`   ↳ Content accessed`, 'cyan');
      }

    } catch (error) {
      log(`❌ Failed to create lead ${i + 1}: ${error.message}`, 'red');
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  log(`\n✅ Created ${leads.length} sample leads`, 'green');
  return leads;
}

/**
 * Query lead magnet stats
 */
async function queryLeadMagnetStats() {
  section('📊 LEAD MAGNET STATS');

  const { data, error } = await supabase
    .from('lead_magnet_stats')
    .select('*')
    .order('total_signups', { ascending: false });

  if (error) {
    log(`❌ Failed to query stats: ${error.message}`, 'red');
    return;
  }

  if (!data || data.length === 0) {
    log('No stats available yet', 'yellow');
    return;
  }

  console.log('\n┌─────────────────────────┬─────────┬──────────┬──────────────┬──────────┬────────────┐');
  console.log('│ Lead Magnet             │ Signups │ Accessed │ Access Rate  │ Sources  │ Campaigns  │');
  console.log('├─────────────────────────┼─────────┼──────────┼──────────────┼──────────┼────────────┤');

  for (const stat of data) {
    const slug = stat.lead_magnet_slug.padEnd(23);
    const signups = stat.total_signups.toString().padStart(7);
    const accessed = stat.total_accessed.toString().padStart(8);
    const accessRate = (stat.access_rate_percent ? `${stat.access_rate_percent}%` : 'N/A').padStart(12);
    const sources = stat.unique_sources.toString().padStart(8);
    const campaigns = stat.unique_campaigns.toString().padStart(10);

    console.log(`│ ${slug} │ ${signups} │ ${accessed} │ ${accessRate} │ ${sources} │ ${campaigns} │`);
  }

  console.log('└─────────────────────────┴─────────┴──────────┴──────────────┴──────────┴────────────┘');
}

/**
 * Query recent activity
 */
async function queryRecentActivity() {
  section('🕒 RECENT ACTIVITY');

  const { data, error } = await supabase
    .from('recent_lead_activity')
    .select('*')
    .limit(10);

  if (error) {
    log(`❌ Failed to query activity: ${error.message}`, 'red');
    return;
  }

  if (!data || data.length === 0) {
    log('No recent activity', 'yellow');
    return;
  }

  console.log('\n┌──────────────────────────────┬─────────────────────────┬────────────┬────────────┐');
  console.log('│ Email                        │ Lead Magnet             │ Source     │ Status     │');
  console.log('├──────────────────────────────┼─────────────────────────┼────────────┼────────────┤');

  for (const activity of data) {
    const email = activity.email.substring(0, 28).padEnd(28);
    const slug = activity.lead_magnet_slug.substring(0, 23).padEnd(23);
    const source = (activity.utm_source || 'N/A').padEnd(10);
    const status = activity.status.padEnd(10);

    const statusColor = status.trim() === 'completed' ? 'green' :
                       status.trim() === 'abandoned' ? 'red' : 'yellow';

    console.log(`│ ${email} │ ${slug} │ ${source} │ ${colors[statusColor]}${status}${colors.reset} │`);
  }

  console.log('└──────────────────────────────┴─────────────────────────┴────────────┴────────────┘');
}

/**
 * Test conversion funnel
 */
async function testConversionFunnel() {
  section('📈 CONVERSION FUNNEL');

  for (const slug of leadMagnets) {
    const { data, error } = await supabase
      .rpc('get_lead_funnel', {
        p_lead_magnet_slug: slug,
        p_days_back: 30
      });

    if (error) {
      log(`❌ Failed to get funnel for ${slug}: ${error.message}`, 'red');
      continue;
    }

    if (!data || data.length === 0) {
      log(`No data for ${slug}`, 'yellow');
      continue;
    }

    log(`\n${slug}:`, 'cyan');
    for (const step of data) {
      const percentage = step.percentage ? `${step.percentage}%` : 'N/A';
      log(`  ${step.step.padEnd(20)} ${step.count.toString().padStart(4)} users (${percentage})`, 'white');
    }
  }
}

/**
 * Query UTM attribution
 */
async function queryUtmAttribution() {
  section('🎯 UTM ATTRIBUTION');

  // Query by source
  const { data: sourceData, error: sourceError } = await supabase
    .from('lead_captures')
    .select('utm_source')
    .not('utm_source', 'is', null);

  if (sourceError) {
    log(`❌ Failed to query sources: ${sourceError.message}`, 'red');
    return;
  }

  if (!sourceData || sourceData.length === 0) {
    log('No attribution data available', 'yellow');
    return;
  }

  // Count by source
  const sourceCounts = {};
  for (const row of sourceData) {
    sourceCounts[row.utm_source] = (sourceCounts[row.utm_source] || 0) + 1;
  }

  log('\nTop Sources:', 'cyan');
  const sortedSources = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  for (const [source, count] of sortedSources) {
    const bar = '█'.repeat(Math.min(20, count));
    log(`  ${source.padEnd(12)} ${bar} ${count}`, 'green');
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
  section('🧹 CLEANUP');

  log('Removing test data...', 'cyan');

  // Delete test lead accesses
  const { error: accessError } = await supabase
    .from('lead_accesses')
    .delete()
    .like('email', 'test-user-%@example.com');

  if (accessError) {
    log(`⚠️  Failed to delete test accesses: ${accessError.message}`, 'yellow');
  } else {
    log('✅ Deleted test lead accesses', 'green');
  }

  // Delete test lead captures
  const { error: captureError } = await supabase
    .from('lead_captures')
    .delete()
    .like('email', 'test-user-%@example.com');

  if (captureError) {
    log(`⚠️  Failed to delete test captures: ${captureError.message}`, 'yellow');
  } else {
    log('✅ Deleted test lead captures', 'green');
  }
}

/**
 * Main execution
 */
async function main() {
  console.clear();
  section('🧪 LEAD MAGNET TRACKING TEST');

  try {
    // Create sample leads
    await createSampleLeads(20);

    // Wait for views to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Query analytics
    await queryLeadMagnetStats();
    await queryRecentActivity();
    await testConversionFunnel();
    await queryUtmAttribution();

    // Ask if user wants to cleanup
    log('\nTest complete! Test data has been created.', 'green');
    log('\nRun with --cleanup flag to remove test data:', 'cyan');
    log('  node scripts/test-lead-magnet-tracking.js --cleanup', 'cyan');

    // Check for cleanup flag
    if (process.argv.includes('--cleanup')) {
      await cleanupTestData();
    }

    section('✅ TEST COMPLETE');

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run cleanup if --cleanup-only flag is provided
if (process.argv.includes('--cleanup-only')) {
  section('🧹 CLEANUP ONLY');
  cleanupTestData().then(() => {
    log('\n✅ Cleanup complete', 'green');
    process.exit(0);
  });
} else {
  main();
}
