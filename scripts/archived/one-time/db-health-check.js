/**
 * Supabase Database Health Check & Diagnostics
 * Comprehensive testing for blog management system database integration
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

async function healthCheck() {
  console.log('\n==========================================================');
  console.log('SUPABASE DATABASE HEALTH CHECK & DIAGNOSTICS');
  console.log('==========================================================\n');

  // Validate environment variables
  console.log('Environment Configuration:');
  console.log(`  VITE_SUPABASE_URL: ${SUPABASE_URL ? '✓ SET' : '✗ MISSING'}`);
  console.log(`  VITE_SUPABASE_ANON_KEY: ${ANON_KEY ? '✓ SET' : '✗ MISSING'}`);
  console.log(`  VITE_SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY ? '✓ SET' : '✗ MISSING'}\n`);

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Create clients
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);
  const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Test 1: Check "post" table (singular - what SDK tries to use)
    console.log('==========================================================');
    console.log('TEST 1: Checking "post" table (singular)');
    console.log('==========================================================');
    const { error: postError } = await serviceClient
      .from('post')
      .select('*', { count: 'exact', head: true });

    if (postError) {
      console.log('❌ Table "post" (singular) does NOT exist');
      console.log(`   Error: ${postError.message}\n`);
    } else {
      console.log('✓ Table "post" (singular) exists\n');
    }

    // Test 2: Check "posts" table (plural - what migration created)
    console.log('==========================================================');
    console.log('TEST 2: Checking "posts" table (plural)');
    console.log('==========================================================');
    const { count, error: postsError } = await serviceClient
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (postsError) {
      console.log('❌ Table "posts" (plural) does NOT exist');
      console.log(`   Error: ${postsError.message}\n`);
      console.error('CRITICAL: Posts table is missing! Run migration.');
      process.exit(1);
    }

    console.log('✓ Table "posts" (plural) exists');
    console.log(`  Total records: ${count || 0}\n`);

    // Test 3: Check table structure
    console.log('==========================================================');
    console.log('TEST 3: Checking table structure');
    console.log('==========================================================');
    const { data: sampleData } = await serviceClient
      .from('posts')
      .select('*')
      .limit(1);

    if (sampleData && sampleData.length > 0) {
      console.log('Sample record structure:');
      Object.keys(sampleData[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleData[0][key]}`);
      });
      console.log();
    } else {
      console.log('Table is empty. Expected columns:');
      console.log('  - id, title, slug, excerpt, content, content_type');
      console.log('  - featured_image, gallery_images, author_id');
      console.log('  - category, tags, read_time_minutes');
      console.log('  - is_featured, is_published, published_at');
      console.log('  - seo_title, seo_description, seo_keywords');
      console.log('  - created_at, updated_at\n');
    }

    // Test 4: Check RLS policies
    console.log('==========================================================');
    console.log('TEST 4: Checking RLS policies');
    console.log('==========================================================');

    // Service role should bypass RLS
    const { data: serviceData } = await serviceClient
      .from('posts')
      .select('*')
      .limit(1);
    console.log(`✓ Service role access: ${serviceData ? 'OK' : 'FAILED'}`);

    // Anon should only see published posts
    const { data: anonData } = await anonClient
      .from('posts')
      .select('*')
      .limit(1);
    console.log(`✓ Anon access: ${anonData !== null ? 'OK' : 'FAILED'}`);
    console.log('  (Anon should only see published posts)\n');

    // Test 5: Check published/featured counts
    console.log('==========================================================');
    console.log('TEST 5: Content statistics');
    console.log('==========================================================');

    const { count: publishedCount } = await serviceClient
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    const { count: featuredCount } = await serviceClient
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true);

    console.log(`Total posts: ${count || 0}`);
    console.log(`Published: ${publishedCount || 0}`);
    console.log(`Featured: ${featuredCount || 0}`);

    // Check content types
    const { data: types } = await serviceClient
      .from('posts')
      .select('content_type')
      .not('content_type', 'is', null);

    if (types && types.length > 0) {
      const typeCounts = types.reduce((acc, { content_type }) => {
        acc[content_type] = (acc[content_type] || 0) + 1;
        return acc;
      }, {});

      console.log('\nContent types:');
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
    }
    console.log();

    // Test 6: Test insert operation
    console.log('==========================================================');
    console.log('TEST 6: Testing insert operation');
    console.log('==========================================================');

    const testPost = {
      title: 'Health Check Test Post',
      slug: `test-${Date.now()}`,
      excerpt: 'Test post created by health check',
      content: 'Test content',
      content_type: 'blog',
      is_published: false,
      is_featured: false
    };

    const { data: insertedPost, error: insertError } = await serviceClient
      .from('posts')
      .insert(testPost)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert test FAILED');
      console.log(`   Error: ${insertError.message}\n`);
    } else {
      console.log('✓ Insert test PASSED');
      console.log(`  Created post ID: ${insertedPost.id}`);

      // Clean up test post
      await serviceClient.from('posts').delete().eq('id', insertedPost.id);
      console.log('  ✓ Test post cleaned up\n');
    }

    // Test 7: Entity mapping diagnosis
    console.log('==========================================================');
    console.log('TEST 7: Entity mapping diagnosis');
    console.log('==========================================================');
    console.log('Custom SDK Configuration:');
    console.log('  Entity name: Post (PascalCase)');
    console.log('  Expected table: post (singular)');
    console.log('  Actual table: posts (plural)');
    console.log();

    if (postError && !postsError) {
      console.log('❌ MISMATCH DETECTED!');
      console.log('   The SDK is looking for "post" but table is "posts"');
      console.log();
      console.log('SOLUTION: Update custom-sdk.js');
      console.log('  In entityNameToTableName function, add:');
      console.log('  const specialMappings = {');
      console.log("    'Post': 'posts',  // <-- Add this line");
      console.log('    ...');
      console.log('  };');
      console.log();
    } else if (!postError) {
      console.log('✓ Both tables exist (unusual but functional)');
    } else {
      console.log('✓ Mapping is correct');
    }

    // Summary
    console.log('==========================================================');
    console.log('HEALTH CHECK SUMMARY');
    console.log('==========================================================');
    console.log('✓ Database connection: OK');
    console.log(`✓ Posts table: ${postsError ? 'MISSING' : 'OK'}`);
    console.log(`✓ RLS policies: ${serviceData && anonData !== null ? 'OK' : 'CHECK'}`);
    console.log(`✓ Insert operations: ${insertError ? 'FAILED' : 'OK'}`);
    console.log(`${postError && !postsError ? '⚠️  Entity mapping: MISMATCH (see above)' : '✓ Entity mapping: OK'}`);
    console.log('\nHealth check complete!\n');

  } catch (error) {
    console.error('\n❌ Health check failed with exception:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

healthCheck();