// Test script to verify Supabase database connection and schema
import { createClient } from '@supabase/supabase-js'

// Use the actual project URL (you'll need to add your real API keys)
const supabaseUrl = 'https://ubqxflzuvxowigbjmqfb.supabase.co'
const supabaseKey = 'your_anon_key_here' // Replace with actual anon key

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🧪 Testing Supabase Database Connection...')

  try {
    // Test 1: Check connection
    console.log('\n1. Testing basic connection...')
    const { data: connection, error: connectionError } = await supabase
      .from('team_members')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message)
      return
    }
    console.log('✅ Database connection successful')

    // Test 2: Check tables exist
    console.log('\n2. Testing table structure...')
    const tables = [
      'team_members',
      'case_studies',
      'blog_posts',
      'resources',
      'services',
      'testimonials',
      'faqs',
      'generated_media',
      'generation_analytics',
      'admin_sessions',
      'contact_submissions',
      'assessment_responses',
      'strategy_session_bookings',
      'newsletter_subscriptions'
    ]

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.error(`❌ Table ${table} not accessible:`, error.message)
      } else {
        console.log(`✅ Table ${table} exists and accessible`)
      }
    }

    // Test 3: Check sample data
    console.log('\n3. Testing sample data...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('title, slug')
      .eq('is_active', true)

    if (servicesError) {
      console.error('❌ Error fetching services:', servicesError.message)
    } else {
      console.log(`✅ Found ${services.length} active services:`)
      services.forEach(service => console.log(`   - ${service.title} (${service.slug})`))
    }

    // Test 4: Check storage buckets
    console.log('\n4. Testing storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Error accessing storage:', bucketsError.message)
    } else {
      console.log(`✅ Found ${buckets.length} storage buckets:`)
      buckets.forEach(bucket => console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`))
    }

    console.log('\n🎉 Database setup verification complete!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testDatabase()