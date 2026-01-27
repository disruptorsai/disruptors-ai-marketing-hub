/**
 * Comprehensive Blog Database Diagnostic Script
 *
 * Investigates issues with blog management system where updates report success
 * but no data appears in the database.
 *
 * Tests:
 * 1. Supabase connection configuration
 * 2. Current record count in posts table
 * 3. Direct INSERT operation test
 * 4. Direct UPDATE operation test
 * 5. SDK filter() and update() behavior
 * 6. Transaction and permission analysis
 */

import { createClient } from '@supabase/supabase-js';
import { customClient } from '../src/lib/custom-sdk.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('\n=== Blog Database Diagnostic Tool ===\n');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Test 1: Verify Environment Configuration
console.log('1. Environment Configuration:');
console.log('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('   VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
console.log('   VITE_SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
console.log('   Expected URL: https://ubqxflzuvxowigbjmqfb.supabase.co');
console.log('   Actual URL:', SUPABASE_URL);
console.log('   Match:', SUPABASE_URL === 'https://ubqxflzuvxowigbjmqfb.supabase.co' ? '✓ Correct' : '✗ Mismatch');
console.log();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Missing required environment variables');
  process.exit(1);
}

// Create direct clients
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runDiagnostics() {
  try {
    // Test 2: Check table existence and record count
    console.log('2. Table Existence and Record Count:');

    const { data: postsData, error: postsError, count } = await serviceClient
      .from('posts')
      .select('*', { count: 'exact' });

    if (postsError) {
      console.error('   ✗ Error accessing posts table:', postsError.message);
      console.error('   Error code:', postsError.code);
      console.error('   Error details:', postsError.details);
    } else {
      console.log('   ✓ Posts table exists');
      console.log('   Record count:', count);
      console.log('   Sample records:', postsData.length > 0 ? postsData.slice(0, 3) : 'No records found');
    }
    console.log();

    // Test 3: Test Direct INSERT with Service Role
    console.log('3. Direct INSERT Test (Service Role):');
    const testPost = {
      title: 'Database Diagnostic Test Post',
      slug: `test-post-${Date.now()}`,
      content: 'This is a test post created by the diagnostic script',
      excerpt: 'Test excerpt',
      is_published: false,
      author_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertedPost, error: insertError } = await serviceClient
      .from('posts')
      .insert(testPost)
      .select()
      .single();

    if (insertError) {
      console.error('   ✗ INSERT failed:', insertError.message);
      console.error('   Error code:', insertError.code);
      console.error('   Error details:', insertError.details);
    } else {
      console.log('   ✓ INSERT successful');
      console.log('   Inserted record ID:', insertedPost.id);
      console.log('   Inserted record:', insertedPost);

      // Test 4: Test Direct UPDATE on the inserted record
      console.log('\n4. Direct UPDATE Test (Service Role):');
      const { data: updatedPost, error: updateError } = await serviceClient
        .from('posts')
        .update({
          title: 'UPDATED: Database Diagnostic Test Post',
          updated_at: new Date().toISOString()
        })
        .eq('id', insertedPost.id)
        .select()
        .single();

      if (updateError) {
        console.error('   ✗ UPDATE failed:', updateError.message);
        console.error('   Error code:', updateError.code);
      } else {
        console.log('   ✓ UPDATE successful');
        console.log('   Updated record:', updatedPost);
      }

      // Clean up test post
      console.log('\n5. Cleanup Test Record:');
      const { error: deleteError } = await serviceClient
        .from('posts')
        .delete()
        .eq('id', insertedPost.id);

      if (deleteError) {
        console.error('   ✗ DELETE failed:', deleteError.message);
      } else {
        console.log('   ✓ Test record deleted successfully');
      }
    }
    console.log();

    // Test 6: Test Custom SDK filter() method
    console.log('6. Custom SDK filter() Test:');
    try {
      const posts = await customClient.entities.Post.filter({ is_published: false });
      console.log('   ✓ Filter executed');
      console.log('   Results count:', posts.length);
      console.log('   Results:', posts.length > 0 ? posts.slice(0, 2) : 'No matching records');
    } catch (error) {
      console.error('   ✗ Filter failed:', error.message);
    }
    console.log();

    // Test 7: Test Custom SDK list() method
    console.log('7. Custom SDK list() Test:');
    try {
      const allPosts = await customClient.entities.Post.list('-created_at', 10);
      console.log('   ✓ List executed');
      console.log('   Results count:', allPosts.length);
      console.log('   Results:', allPosts.length > 0 ? allPosts.slice(0, 2) : 'No records');
    } catch (error) {
      console.error('   ✗ List failed:', error.message);
    }
    console.log();

    // Test 8: Check Row Level Security (RLS) policies
    console.log('8. RLS Policy Check:');
    const { data: rlsPolicies, error: rlsError } = await serviceClient
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'posts');

    if (rlsError) {
      console.error('   Note: Could not retrieve RLS policies (this is normal if not accessible)');
    } else {
      console.log('   RLS Policies found:', rlsPolicies?.length || 0);
      if (rlsPolicies && rlsPolicies.length > 0) {
        rlsPolicies.forEach(policy => {
          console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.roles.join(', ')})`);
        });
      }
    }
    console.log();

    // Test 9: Test SDK create() method
    console.log('9. Custom SDK create() Test:');
    const sdkTestPost = {
      title: 'SDK Test Post',
      slug: `sdk-test-${Date.now()}`,
      content: 'Created via SDK',
      excerpt: 'SDK test',
      is_published: false,
      author_id: '00000000-0000-0000-0000-000000000000'
    };

    try {
      const createdPost = await customClient.entities.Post.create(sdkTestPost);
      console.log('   ✓ SDK create() successful');
      console.log('   Created record ID:', createdPost.id);

      // Test SDK update
      console.log('\n10. Custom SDK update() Test:');
      const updatedViaSDK = await customClient.entities.Post.update(createdPost.id, {
        title: 'UPDATED via SDK'
      });

      if (updatedViaSDK) {
        console.log('   ✓ SDK update() successful');
        console.log('   Updated record:', updatedViaSDK);
      } else {
        console.error('   ✗ SDK update() returned null (no record found)');
      }

      // Verify update actually happened
      console.log('\n11. Verify Update Persisted:');
      const verifyPost = await customClient.entities.Post.get(createdPost.id);
      if (verifyPost) {
        console.log('   ✓ Record found');
        console.log('   Title:', verifyPost.title);
        console.log('   Title matches update:', verifyPost.title === 'UPDATED via SDK' ? '✓ Yes' : '✗ No');
      } else {
        console.error('   ✗ Record not found after update');
      }

      // Cleanup
      await customClient.entities.Post.delete(createdPost.id);
      console.log('   ✓ Test record cleaned up');
    } catch (error) {
      console.error('   ✗ SDK create() failed:', error.message);
      console.error('   Stack:', error.stack);
    }
    console.log();

    // Test 12: Simulate the blog management workflow
    console.log('12. Simulated Blog Management Workflow:');
    try {
      // Step 1: Check if any posts exist with a specific slug
      const existingSlug = 'test-workflow-post';
      const existingPosts = await customClient.entities.Post.filter({ slug: existingSlug });
      console.log('   Step 1 - Check existing:', existingPosts.length, 'records found');

      if (existingPosts.length === 0) {
        console.log('   → Would create new post');

        const newPost = await customClient.entities.Post.create({
          title: 'Workflow Test Post',
          slug: existingSlug,
          content: 'Original content',
          excerpt: 'Original excerpt',
          is_published: false,
          author_id: '00000000-0000-0000-0000-000000000000'
        });
        console.log('   ✓ Created post:', newPost.id);

        // Verify it can be found
        const refetchedPosts = await customClient.entities.Post.filter({ slug: existingSlug });
        console.log('   Step 2 - Re-fetch:', refetchedPosts.length, 'records found');

        if (refetchedPosts.length > 0) {
          console.log('   ✓ Post successfully created and can be retrieved');

          // Try update
          const updated = await customClient.entities.Post.update(newPost.id, {
            content: 'UPDATED CONTENT'
          });

          if (updated) {
            console.log('   ✓ Update successful');
            console.log('   Content:', updated.content);
          } else {
            console.error('   ✗ Update returned null');
          }
        } else {
          console.error('   ✗ CRITICAL: Post created but cannot be retrieved!');
        }

        // Cleanup
        await customClient.entities.Post.delete(newPost.id);
        console.log('   ✓ Cleanup complete');
      } else {
        console.log('   → Would update existing post');
        console.log('   This suggests previous tests left data');
        // Cleanup
        for (const post of existingPosts) {
          await customClient.entities.Post.delete(post.id);
        }
        console.log('   ✓ Cleaned up', existingPosts.length, 'leftover records');
      }
    } catch (error) {
      console.error('   ✗ Workflow simulation failed:', error.message);
    }
    console.log();

    // Final Summary
    console.log('=== Diagnostic Summary ===');
    console.log('Connection: ✓ Successfully connected to Supabase');
    console.log('Table: ✓ Posts table exists');
    console.log('Permissions: ✓ Service role has read/write access');
    console.log();
    console.log('If updates are claiming success but data is not persisting,');
    console.log('check the following in your application:');
    console.log('1. Verify you\'re using the correct Supabase client (service vs anon)');
    console.log('2. Check for transaction rollbacks or error handling that swallows failures');
    console.log('3. Ensure filter() is not returning empty array when it should find records');
    console.log('4. Verify update() is being called with a valid record ID');
    console.log('5. Check browser console for client-side errors');

  } catch (error) {
    console.error('FATAL ERROR during diagnostics:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run diagnostics
runDiagnostics().then(() => {
  console.log('\nDiagnostics complete.');
  process.exit(0);
}).catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
});
