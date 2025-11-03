/**
 * Categorize Kyle's Change Requests by Implementation Feasibility
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function categorizeRequests() {
  console.log('🔍 Fetching Kyle\'s change requests...\n');

  const { data: requests, error } = await supabase
    .from('change_requests')
    .select('*')
    .eq('requester_name', 'Kyle')
    .eq('status', 'pending')
    .order('priority', { ascending: false });

  if (error) {
    console.error('❌ Error fetching requests:', error.message);
    process.exit(1);
  }

  console.log(`📊 Found ${requests.length} pending requests from Kyle\n`);

  // Categorize by feasibility
  const canImplement = [];
  const needsMedia = [];
  const needsContent = [];

  requests.forEach(req => {
    const desc = req.change_description.toLowerCase();

    // Can implement: text changes, CSS fixes, removing elements, reducing items
    if (
      desc.includes('change page title') ||
      desc.includes('change title') ||
      desc.includes('update button text') ||
      desc.includes('remove redundant') ||
      desc.includes('remove duplicate') ||
      desc.includes('reduce') ||
      desc.includes('fix left-side fade') ||
      desc.includes('adjust') && desc.includes('position') ||
      desc.includes('make all') && desc.includes('icons white') ||
      desc.includes('remove progress percentage bubble') ||
      desc.includes('remove white blank bar') ||
      desc.includes('fix text visibility') ||
      desc.includes('keep') && !desc.includes('case study')
    ) {
      canImplement.push(req);
    }
    // Needs media: videos, images, photos
    else if (
      desc.includes('replace') && (desc.includes('video') || desc.includes('image') || desc.includes('photo')) ||
      desc.includes('add hero banner') ||
      desc.includes('add case study') ||
      desc.includes('source') && desc.includes('images')
    ) {
      needsMedia.push(req);
    }
    // Needs content or complex implementation
    else {
      needsContent.push(req);
    }
  });

  console.log('✅ CAN IMPLEMENT NOW (' + canImplement.length + ' requests):');
  console.log('=' .repeat(60));
  canImplement.forEach((req, idx) => {
    console.log(`${idx + 1}. [${req.priority.toUpperCase()}] ${req.change_description}`);
  });

  console.log('\n🎨 NEEDS MEDIA ASSETS (' + needsMedia.length + ' requests):');
  console.log('=' .repeat(60));
  needsMedia.forEach((req, idx) => {
    console.log(`${idx + 1}. [${req.priority.toUpperCase()}] ${req.change_description}`);
  });

  console.log('\n📝 NEEDS CONTENT/COMPLEX WORK (' + needsContent.length + ' requests):');
  console.log('=' .repeat(60));
  needsContent.forEach((req, idx) => {
    console.log(`${idx + 1}. [${req.priority.toUpperCase()}] ${req.change_description}`);
  });

  console.log('\n📊 SUMMARY:');
  console.log(`   Can implement now: ${canImplement.length}`);
  console.log(`   Needs media: ${needsMedia.length}`);
  console.log(`   Needs content/complex: ${needsContent.length}`);
  console.log(`   Total: ${requests.length}`);

  // Export list for implementation
  return canImplement;
}

categorizeRequests();
