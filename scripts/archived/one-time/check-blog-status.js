#!/usr/bin/env node

/**
 * Supabase Blog Post Status Checker
 * Queries the posts table and provides comprehensive reporting
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env file manually
try {
  const envPath = join(__dirname, '..', '.env')
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
} catch (err) {
  console.error('Warning: Could not load .env file:', err.message)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing Supabase credentials')
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET')
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET')
  process.exit(1)
}

// Create Supabase client with service role for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkBlogStatus() {
  console.log('\n' + '='.repeat(80))
  console.log('SUPABASE BLOG POST STATUS REPORT')
  console.log('='.repeat(80))
  console.log(`Database: ${supabaseUrl}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log('='.repeat(80) + '\n')

  try {
    // 1. Check if posts table exists
    console.log('1. TABLE EXISTENCE CHECK')
    console.log('-'.repeat(80))

    const { data: tables, error: tablesError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)

    if (tablesError) {
      console.error('ERROR: posts table does not exist or is not accessible')
      console.error('Error details:', tablesError)
      return
    }

    console.log('✓ Table "posts" exists and is accessible\n')

    // 2. Get table structure (using raw SQL)
    console.log('2. TABLE STRUCTURE')
    console.log('-'.repeat(80))

    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'posts'
          ORDER BY ordinal_position;
        `
      })
      .single()

    if (!columnsError && columns) {
      console.log('Columns:')
      console.table(columns)
    } else {
      // Fallback: describe based on migration
      console.log('Schema (from migration):')
      console.log('  - id: UUID (PRIMARY KEY)')
      console.log('  - title: VARCHAR(255) NOT NULL')
      console.log('  - slug: VARCHAR(255) UNIQUE NOT NULL')
      console.log('  - excerpt: TEXT')
      console.log('  - content: TEXT')
      console.log('  - content_type: VARCHAR(50) (blog, resource, guide, case_study)')
      console.log('  - featured_image: TEXT')
      console.log('  - gallery_images: TEXT[]')
      console.log('  - author_id: UUID')
      console.log('  - category: VARCHAR(100)')
      console.log('  - tags: TEXT[]')
      console.log('  - read_time_minutes: INTEGER')
      console.log('  - is_featured: BOOLEAN (default: FALSE)')
      console.log('  - is_published: BOOLEAN (default: FALSE)')
      console.log('  - published_at: TIMESTAMPTZ')
      console.log('  - seo_title: VARCHAR(255)')
      console.log('  - seo_description: TEXT')
      console.log('  - seo_keywords: TEXT[]')
      console.log('  - created_at: TIMESTAMPTZ (default: NOW())')
      console.log('  - updated_at: TIMESTAMPTZ (default: NOW())')
    }
    console.log()

    // 3. Get total post count
    console.log('3. POST STATISTICS')
    console.log('-'.repeat(80))

    const { count: totalCount, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('ERROR getting post count:', countError)
    } else {
      console.log(`Total posts: ${totalCount || 0}`)
    }

    // Get published vs unpublished
    const { count: publishedCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    const { count: unpublishedCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false)

    console.log(`Published posts: ${publishedCount || 0}`)
    console.log(`Unpublished posts: ${unpublishedCount || 0}`)

    // Get featured posts
    const { count: featuredCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true)

    console.log(`Featured posts: ${featuredCount || 0}`)

    // Get posts by content type
    const { data: contentTypes } = await supabase
      .from('posts')
      .select('content_type')

    if (contentTypes) {
      const typeCounts = contentTypes.reduce((acc, post) => {
        acc[post.content_type || 'null'] = (acc[post.content_type || 'null'] || 0) + 1
        return acc
      }, {})
      console.log('\nPosts by content type:')
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`)
      })
    }

    console.log()

    // 4. Recent posts
    console.log('4. RECENT POSTS (Last 10)')
    console.log('-'.repeat(80))

    const { data: recentPosts, error: recentError } = await supabase
      .from('posts')
      .select('id, title, slug, content_type, is_published, is_featured, created_at, updated_at, published_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('ERROR getting recent posts:', recentError)
    } else if (recentPosts && recentPosts.length > 0) {
      recentPosts.forEach((post, idx) => {
        console.log(`\n[${idx + 1}] ${post.title}`)
        console.log(`    Slug: ${post.slug}`)
        console.log(`    Type: ${post.content_type || 'N/A'}`)
        console.log(`    Status: ${post.is_published ? 'PUBLISHED' : 'DRAFT'}${post.is_featured ? ' (FEATURED)' : ''}`)
        console.log(`    Created: ${new Date(post.created_at).toLocaleString()}`)
        console.log(`    Updated: ${new Date(post.updated_at).toLocaleString()}`)
        if (post.published_at) {
          console.log(`    Published: ${new Date(post.published_at).toLocaleString()}`)
        }
      })
    } else {
      console.log('No posts found in the database.')
    }

    console.log()

    // 5. Categories and tags
    console.log('5. CATEGORIES AND TAGS')
    console.log('-'.repeat(80))

    const { data: allPosts } = await supabase
      .from('posts')
      .select('category, tags')

    if (allPosts) {
      // Categories
      const categories = allPosts
        .map(p => p.category)
        .filter(Boolean)
        .reduce((acc, cat) => {
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {})

      if (Object.keys(categories).length > 0) {
        console.log('Categories:')
        Object.entries(categories).forEach(([cat, count]) => {
          console.log(`  - ${cat}: ${count} post${count > 1 ? 's' : ''}`)
        })
      } else {
        console.log('Categories: None assigned')
      }

      // Tags
      const allTags = allPosts
        .flatMap(p => p.tags || [])
        .reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1
          return acc
        }, {})

      if (Object.keys(allTags).length > 0) {
        console.log('\nTags (top 10):')
        Object.entries(allTags)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([tag, count]) => {
            console.log(`  - ${tag}: ${count} post${count > 1 ? 's' : ''}`)
          })
      } else {
        console.log('\nTags: None assigned')
      }
    }

    console.log()

    // 6. Timestamp analysis
    console.log('6. TIMESTAMP ANALYSIS')
    console.log('-'.repeat(80))

    const { data: timestampData } = await supabase
      .from('posts')
      .select('created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(1)

    const { data: oldestData } = await supabase
      .from('posts')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1)

    if (timestampData && timestampData.length > 0) {
      console.log(`Most recent post created: ${new Date(timestampData[0].created_at).toLocaleString()}`)
      console.log(`Most recent post updated: ${new Date(timestampData[0].updated_at).toLocaleString()}`)
    }

    if (oldestData && oldestData.length > 0) {
      console.log(`Oldest post created: ${new Date(oldestData[0].created_at).toLocaleString()}`)
    }

    if (!timestampData || timestampData.length === 0) {
      console.log('No posts in database - no timestamp data available')
    }

    console.log()

    // 7. Related tables check
    console.log('7. RELATED TABLES CHECK')
    console.log('-'.repeat(80))

    const relatedTableNames = ['post_categories', 'post_tags', 'authors', 'users']

    for (const tableName of relatedTableNames) {
      try {
        const { error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (tableError) {
          console.log(`✗ Table "${tableName}": Not found`)
        } else {
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          console.log(`✓ Table "${tableName}": Exists (${count || 0} rows)`)
        }
      } catch (err) {
        console.log(`✗ Table "${tableName}": Error checking - ${err.message}`)
      }
    }

    console.log()

    // 8. RLS Policies
    console.log('8. ROW LEVEL SECURITY STATUS')
    console.log('-'.repeat(80))
    console.log('RLS is ENABLED on posts table (as per migration)')
    console.log('Policies:')
    console.log('  ✓ Public can read published posts')
    console.log('  ✓ Authenticated users can read all posts')
    console.log('  ✓ Authenticated users can create posts')
    console.log('  ✓ Authenticated users can update posts')
    console.log('  ✓ Authenticated users can delete posts')

    console.log()
    console.log('='.repeat(80))
    console.log('REPORT COMPLETE')
    console.log('='.repeat(80) + '\n')

  } catch (error) {
    console.error('\nFATAL ERROR during analysis:')
    console.error(error)
    process.exit(1)
  }
}

// Run the check
checkBlogStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })