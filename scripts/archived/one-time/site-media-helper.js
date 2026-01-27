#!/usr/bin/env node

/**
 * Site Media Helper - Utility functions for managing site_media table
 *
 * Usage:
 *   node scripts/site-media-helper.js list [page_slug]
 *   node scripts/site-media-helper.js add <media_key> <media_url> <media_type> [options]
 *   node scripts/site-media-helper.js update <media_key> [options]
 *   node scripts/site-media-helper.js delete <media_key>
 *   node scripts/site-media-helper.js stats
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
async function listMedia(pageSlug = null) {
  console.log('Fetching media records...\n');

  let query = supabase
    .from('site_media')
    .select('*')
    .order('page_slug', { ascending: true })
    .order('section_name', { ascending: true })
    .order('display_order', { ascending: true });

  if (pageSlug) {
    query = query.eq('page_slug', pageSlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No media records found.');
    return;
  }

  console.log(`Found ${data.length} media record(s):\n`);

  data.forEach(media => {
    console.log('─'.repeat(80));
    console.log(`Media Key: ${media.media_key}`);
    console.log(`Type:      ${media.media_type}`);
    console.log(`URL:       ${media.media_url}`);
    console.log(`Page:      ${media.page_slug || 'N/A'}`);
    console.log(`Section:   ${media.section_name || 'N/A'}`);
    console.log(`Purpose:   ${media.purpose || 'N/A'}`);
    console.log(`Active:    ${media.is_active ? 'Yes' : 'No'}`);
    console.log(`Featured:  ${media.is_featured ? 'Yes' : 'No'}`);
    if (media.alt_text) console.log(`Alt Text:  ${media.alt_text}`);
    if (media.tags && media.tags.length > 0) console.log(`Tags:      ${media.tags.join(', ')}`);
    console.log(`Created:   ${new Date(media.created_at).toLocaleString()}`);
  });

  console.log('─'.repeat(80));
}

async function addMedia(mediaKey, mediaUrl, mediaType, options = {}) {
  console.log(`Adding media: ${mediaKey}...\n`);

  const record = {
    media_key: mediaKey,
    media_url: mediaUrl,
    media_type: mediaType,
    ...options
  };

  const { data, error } = await supabase
    .from('site_media')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('✓ Media added successfully!');
  console.log('ID:', data.id);
  console.log('Media Key:', data.media_key);
}

async function updateMedia(mediaKey, updates) {
  console.log(`Updating media: ${mediaKey}...\n`);

  const { data, error } = await supabase
    .from('site_media')
    .update(updates)
    .eq('media_key', mediaKey)
    .select()
    .single();

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('✓ Media updated successfully!');
  console.log('Updated fields:', Object.keys(updates).join(', '));
}

async function deleteMedia(mediaKey) {
  console.log(`Deleting media: ${mediaKey}...\n`);

  const { error } = await supabase
    .from('site_media')
    .delete()
    .eq('media_key', mediaKey);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('✓ Media deleted successfully!');
}

async function getStats() {
  console.log('Fetching site_media statistics...\n');

  // Total count
  const { count: totalCount, error: countError } = await supabase
    .from('site_media')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error:', countError.message);
    return;
  }

  // Active count
  const { count: activeCount } = await supabase
    .from('site_media')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // By type
  const { data: byType } = await supabase
    .from('site_media')
    .select('media_type')
    .eq('is_active', true);

  const typeStats = {};
  byType?.forEach(item => {
    typeStats[item.media_type] = (typeStats[item.media_type] || 0) + 1;
  });

  // By page
  const { data: byPage } = await supabase
    .from('site_media')
    .select('page_slug')
    .eq('is_active', true);

  const pageStats = {};
  byPage?.forEach(item => {
    const page = item.page_slug || 'unassigned';
    pageStats[page] = (pageStats[page] || 0) + 1;
  });

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('SITE MEDIA STATISTICS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total Records:   ${totalCount}`);
  console.log(`Active Records:  ${activeCount}`);
  console.log(`Inactive:        ${totalCount - activeCount}`);
  console.log();
  console.log('By Media Type:');
  Object.entries(typeStats).forEach(([type, count]) => {
    console.log(`  ${type.padEnd(10)}: ${count}`);
  });
  console.log();
  console.log('By Page (top 10):');
  Object.entries(pageStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([page, count]) => {
      console.log(`  ${page.padEnd(30)}: ${count}`);
    });
  console.log('═══════════════════════════════════════════════════════════════');
}

// CLI interface
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'list':
    listMedia(args[0]);
    break;

  case 'add':
    if (args.length < 3) {
      console.error('Usage: node site-media-helper.js add <media_key> <media_url> <media_type>');
      process.exit(1);
    }
    addMedia(args[0], args[1], args[2]);
    break;

  case 'update':
    if (args.length < 2) {
      console.error('Usage: node site-media-helper.js update <media_key> <field=value> [field=value...]');
      process.exit(1);
    }
    const updates = {};
    args.slice(1).forEach(arg => {
      const [key, value] = arg.split('=');
      updates[key] = value;
    });
    updateMedia(args[0], updates);
    break;

  case 'delete':
    if (args.length < 1) {
      console.error('Usage: node site-media-helper.js delete <media_key>');
      process.exit(1);
    }
    deleteMedia(args[0]);
    break;

  case 'stats':
    getStats();
    break;

  default:
    console.log('Site Media Helper - Utility for managing site_media table');
    console.log();
    console.log('Usage:');
    console.log('  node scripts/site-media-helper.js list [page_slug]');
    console.log('  node scripts/site-media-helper.js add <media_key> <media_url> <media_type>');
    console.log('  node scripts/site-media-helper.js update <media_key> <field=value> [...]');
    console.log('  node scripts/site-media-helper.js delete <media_key>');
    console.log('  node scripts/site-media-helper.js stats');
    console.log();
    console.log('Examples:');
    console.log('  node scripts/site-media-helper.js list home');
    console.log('  node scripts/site-media-helper.js add hero-home-bg https://... image');
    console.log('  node scripts/site-media-helper.js update hero-home-bg alt_text="Hero background"');
    console.log('  node scripts/site-media-helper.js stats');
}
