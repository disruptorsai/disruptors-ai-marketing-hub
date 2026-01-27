import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const SERVICES_DATA = [
  {
    title: "AI Automation",
    slug: "solutions-ai-automation",
    hook: "Automate repetitive tasks and workflows",
    image: "/generated/anachron-lite/ai-automation-icon-anachron-lite.png",
    display_order: 1
  },
  {
    title: "Social Media Marketing",
    slug: "solutions-social-media",
    hook: "Build and engage your community",
    image: "/generated/anachron-lite/social-media-marketing-icon-anachron-lite.png",
    display_order: 2
  },
  {
    title: "SEO & GEO",
    slug: "solutions-seo-geo",
    hook: "Get found by your ideal customers",
    image: "/generated/anachron-lite/seo-geo-icon-anachron-lite.png",
    display_order: 3
  },
  {
    title: "Lead Generation",
    slug: "solutions-lead-generation",
    hook: "Fill your pipeline with qualified prospects",
    image: "/generated/anachron-lite/lead-generation-icon-anachron-lite.png",
    display_order: 4
  },
  {
    title: "Paid Advertising",
    slug: "solutions-paid-advertising",
    hook: "Maximize ROI across all channels",
    image: "/generated/anachron-lite/paid-advertising-icon-anachron-lite.png",
    display_order: 5
  },
  {
    title: "Podcasting",
    slug: "solutions-podcasting",
    hook: "Build authority through audio content",
    image: "/generated/anachron-lite/podcasting-icon-anachron-lite.png",
    display_order: 6
  },
  {
    title: "Custom Apps",
    slug: "solutions-custom-apps",
    hook: "Tailored solutions for your needs",
    image: "/generated/anachron-lite/custom-apps-icon-anachron-lite.png",
    display_order: 7
  },
  {
    title: "CRM Management",
    slug: "solutions-crm-management",
    hook: "Organize and nurture your relationships",
    image: "/generated/anachron-lite/crm-management-icon-anachron-lite.png",
    display_order: 8
  },
  {
    title: "Fractional CMO",
    slug: "solutions-fractional-cmo",
    hook: "Strategic marketing leadership",
    image: "/generated/anachron-lite/fractional-cmo-icon-anachron-lite.png",
    display_order: 9
  }
];

async function setupServicesTable() {
  console.log('='.repeat(70));
  console.log('SERVICES TABLE SETUP & MIGRATION');
  console.log('='.repeat(70));

  // Step 1: Add missing columns
  console.log('\n[1/6] Adding missing columns to services table...');

  const alterTableSQL = `
    -- Add hook column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'hook'
      ) THEN
        ALTER TABLE services ADD COLUMN hook TEXT;
      END IF;
    END $$;

    -- Add image column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'image'
      ) THEN
        ALTER TABLE services ADD COLUMN image TEXT;
      END IF;
    END $$;

    -- Add display_order column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'display_order'
      ) THEN
        ALTER TABLE services ADD COLUMN display_order INTEGER;
      END IF;
    END $$;

    -- Add description column if it doesn't exist (maps to short_description conceptually)
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'description'
      ) THEN
        ALTER TABLE services ADD COLUMN description TEXT;
      END IF;
    END $$;

    -- Add icon column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'icon'
      ) THEN
        ALTER TABLE services ADD COLUMN icon TEXT;
      END IF;
    END $$;

    -- Add category column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'category'
      ) THEN
        ALTER TABLE services ADD COLUMN category TEXT;
      END IF;
    END $$;

    -- Add benefits column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'benefits'
      ) THEN
        ALTER TABLE services ADD COLUMN benefits TEXT[];
      END IF;
    END $$;

    -- Add pricing_model column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'pricing_model'
      ) THEN
        ALTER TABLE services ADD COLUMN pricing_model TEXT;
      END IF;
    END $$;

    -- Add base_price column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'base_price'
      ) THEN
        ALTER TABLE services ADD COLUMN base_price NUMERIC;
      END IF;
    END $$;

    -- Add currency column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'currency'
      ) THEN
        ALTER TABLE services ADD COLUMN currency TEXT DEFAULT 'USD';
      END IF;
    END $$;

    -- Add tags column if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'tags'
      ) THEN
        ALTER TABLE services ADD COLUMN tags TEXT[];
      END IF;
    END $$;

    -- Add SEO columns if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'seo_title'
      ) THEN
        ALTER TABLE services ADD COLUMN seo_title TEXT;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'seo_description'
      ) THEN
        ALTER TABLE services ADD COLUMN seo_description TEXT;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'seo_keywords'
      ) THEN
        ALTER TABLE services ADD COLUMN seo_keywords TEXT[];
      END IF;
    END $$;
  `;

  const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterTableSQL });

  if (alterError) {
    // Try direct execution if rpc doesn't work
    console.log('   RPC method not available, columns may already exist or need manual addition');
  } else {
    console.log('   ✓ Columns added successfully');
  }

  // Step 2: Check and setup RLS policies
  console.log('\n[2/6] Setting up RLS policies...');

  const rlsSQL = `
    -- Enable RLS on services table
    ALTER TABLE services ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access" ON services;
    DROP POLICY IF EXISTS "Allow authenticated read access" ON services;
    DROP POLICY IF EXISTS "Allow service role full access" ON services;

    -- Policy: Allow public read access to active services
    CREATE POLICY "Allow public read access"
      ON services
      FOR SELECT
      TO anon, authenticated
      USING (is_active = true);

    -- Policy: Allow authenticated users to read all services
    CREATE POLICY "Allow authenticated read access"
      ON services
      FOR SELECT
      TO authenticated
      USING (true);

    -- Note: Service role bypasses RLS by default, no policy needed
  `;

  const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });

  if (rlsError) {
    console.log('   RLS policies may need manual setup in Supabase dashboard');
    console.log('   Error:', rlsError.message);
  } else {
    console.log('   ✓ RLS policies configured');
  }

  // Step 3: Create updated_at trigger
  console.log('\n[3/6] Creating updated_at trigger...');

  const triggerSQL = `
    -- Create trigger function if it doesn't exist
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS update_services_updated_at ON services;

    -- Create trigger
    CREATE TRIGGER update_services_updated_at
      BEFORE UPDATE ON services
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `;

  const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL });

  if (triggerError) {
    console.log('   Trigger may need manual setup in Supabase dashboard');
  } else {
    console.log('   ✓ Trigger created successfully');
  }

  // Step 4: Delete old data and insert new services
  console.log('\n[4/6] Clearing existing data...');

  const { error: deleteError } = await supabase
    .from('services')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.log('   Error clearing data:', deleteError.message);
  } else {
    console.log('   ✓ Existing data cleared');
  }

  console.log('\n[5/6] Inserting new services data...');

  let successCount = 0;
  let errorCount = 0;

  for (const service of SERVICES_DATA) {
    const { error: insertError } = await supabase
      .from('services')
      .insert([{
        ...service,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.log(`   ✗ Failed to insert "${service.title}":`, insertError.message);
      errorCount++;
    } else {
      console.log(`   ✓ Inserted: ${service.title}`);
      successCount++;
    }
  }

  console.log(`\n   Summary: ${successCount} inserted, ${errorCount} failed`);

  // Step 5: Verify the data
  console.log('\n[6/6] Verifying inserted data...');

  const { data: verifyData, error: verifyError } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

  if (verifyError) {
    console.log('   Error verifying data:', verifyError.message);
  } else {
    console.log(`   ✓ Total records in table: ${verifyData?.length || 0}`);

    if (verifyData && verifyData.length > 0) {
      console.log('\n   Services in database:');
      verifyData.forEach((svc, idx) => {
        console.log(`   ${idx + 1}. ${svc.title} (order: ${svc.display_order})`);
        console.log(`      - Slug: ${svc.slug}`);
        console.log(`      - Hook: ${svc.hook || 'N/A'}`);
        console.log(`      - Image: ${svc.image || 'N/A'}`);
        console.log(`      - Active: ${svc.is_active}`);
      });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('SETUP COMPLETE');
  console.log('='.repeat(70));
  console.log('\nNext steps:');
  console.log('1. Verify the data in Supabase dashboard');
  console.log('2. If RLS/trigger setup failed, apply manually via SQL editor');
  console.log('3. Update your app to use the services table');
  console.log('='.repeat(70));
}

setupServicesTable().catch(console.error);
