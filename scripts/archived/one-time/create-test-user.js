/**
 * Create Test User with Business Brain
 *
 * Usage:
 *   node scripts/create-test-user.js <email> <password> <business_name> <website_url> [industry]
 *
 * Example:
 *   node scripts/create-test-user.js test@disruptorsmedia.com TestPass123! "Disruptors Media" https://disruptorsmedia.com "Marketing Agency"
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const [email, password, businessName, websiteUrl, industry = 'Other'] = process.argv.slice(2);

  if (!email || !password || !businessName || !websiteUrl) {
    console.error('❌ Missing required arguments!');
    console.error('Usage: node scripts/create-test-user.js <email> <password> <business_name> <website_url> [industry]');
    console.error('Example: node scripts/create-test-user.js test@example.com Pass123! "My Business" https://example.com "Retail"');
    process.exit(1);
  }

  console.log('🚀 Creating test user and Business Brain...\n');
  console.log('📧 Email:', email);
  console.log('🏢 Business:', businessName);
  console.log('🌐 Website:', websiteUrl);
  console.log('🏭 Industry:', industry);
  console.log('');

  try {
    // Step 1: Create auth user
    console.log('1️⃣  Creating Supabase auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('❌ Auth creation failed:', authError.message);
      process.exit(1);
    }

    const userId = authData.user.id;
    console.log('✅ User created:', userId);
    console.log('');

    // Step 2: Create Business Brain
    console.log('2️⃣  Creating Business Brain...');

    // Generate slug from business name
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data: brainData, error: brainError } = await supabase
      .from('business_brains')
      .insert({
        name: businessName,
        business_name: businessName,
        primary_website: websiteUrl,
        industry,
        slug,
        created_by: userId,
        brain_level: 'starter',
        confidence_score: 0.3,
        onboarding_completed: true,
        description: `Test business for ${businessName}`,
        business_description: `Test business for ${businessName}`,
        brand_colors: {},
      })
      .select()
      .single();

    if (brainError) {
      console.error('❌ Brain creation failed:', brainError.message);
      console.error('Details:', brainError);
      process.exit(1);
    }

    console.log('✅ Business Brain created:', brainData.id);
    console.log('');

    // Step 3: Summary
    console.log('🎉 Setup Complete!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 User Details:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   User ID:', userId);
    console.log('');
    console.log('🧠 Business Brain Details:');
    console.log('   Brain ID:', brainData.id);
    console.log('   Business:', businessName);
    console.log('   Website:', websiteUrl);
    console.log('   Slug:', slug);
    console.log('   Level:', brainData.brain_level);
    console.log('   Confidence:', brainData.confidence_score);
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('🔐 Login at: http://localhost:5174/app/business-brain');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Visit the app and login with the credentials above');
    console.log('   2. Test the Business Brain Manager');
    console.log('   3. Test the AI Content Writer');
    console.log('');
    console.log('🌐 To auto-initialize brain with website data:');
    console.log(`   POST http://localhost:8888/.netlify/functions/brain-auto-initialize`);
    console.log(`   Body: {"brainId": "${brainData.id}", "websiteUrl": "${websiteUrl}"}`);
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createTestUser();
