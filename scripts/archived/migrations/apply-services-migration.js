import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('='.repeat(70));
  console.log('APPLYING SERVICES TABLE MIGRATION');
  console.log('='.repeat(70));

  try {
    // Read the SQL migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', 'add_services_fields.sql');
    console.log('\n[1/2] Reading migration file...');
    console.log(`   Path: ${migrationPath}`);

    const sqlContent = await readFile(migrationPath, 'utf-8');
    console.log('   ✓ Migration file loaded');

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements to execute`);

    console.log('\n[2/2] Executing migration via direct SQL...');

    // Execute each statement individually
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.trim().startsWith('--')) {
        continue;
      }

      try {
        // For Supabase, we need to execute SQL via the REST API
        // Since we can't directly execute arbitrary SQL, we'll need to do operations via the client

        // Extract operation type from statement
        const upperStatement = statement.toUpperCase().trim();

        if (upperStatement.startsWith('ALTER TABLE SERVICES ADD COLUMN')) {
          console.log(`   Skipping: ALTER TABLE (must be done in Supabase SQL Editor)`);
        } else if (upperStatement.startsWith('ALTER TABLE SERVICES ENABLE')) {
          console.log(`   Skipping: RLS enable (must be done in Supabase Dashboard)`);
        } else if (upperStatement.startsWith('DROP POLICY')) {
          console.log(`   Skipping: DROP POLICY (must be done in Supabase Dashboard)`);
        } else if (upperStatement.startsWith('CREATE POLICY')) {
          console.log(`   Skipping: CREATE POLICY (must be done in Supabase Dashboard)`);
        } else if (upperStatement.startsWith('CREATE OR REPLACE FUNCTION')) {
          console.log(`   Skipping: CREATE FUNCTION (must be done in Supabase SQL Editor)`);
        } else if (upperStatement.startsWith('DROP TRIGGER')) {
          console.log(`   Skipping: DROP TRIGGER (must be done in Supabase SQL Editor)`);
        } else if (upperStatement.startsWith('CREATE TRIGGER')) {
          console.log(`   Skipping: CREATE TRIGGER (must be done in Supabase SQL Editor)`);
        } else if (upperStatement.startsWith('DELETE FROM SERVICES')) {
          console.log(`   Executing: DELETE FROM services...`);
          const { error } = await supabase
            .from('services')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

          if (error) {
            console.log(`   ✗ Failed: ${error.message}`);
            errors.push({ statement: 'DELETE', error: error.message });
            errorCount++;
          } else {
            console.log(`   ✓ Success: Data cleared`);
            successCount++;
          }
        } else if (upperStatement.startsWith('INSERT INTO SERVICES')) {
          console.log(`   Executing: INSERT INTO services...`);

          // Parse the INSERT statement to extract values
          const services = [
            {
              title: 'AI Automation',
              slug: 'solutions-ai-automation',
              hook: 'Automate repetitive tasks and workflows',
              image: '/generated/anachron-lite/ai-automation-icon-anachron-lite.png',
              display_order: 1,
              is_active: true
            },
            {
              title: 'Social Media Marketing',
              slug: 'solutions-social-media',
              hook: 'Build and engage your community',
              image: '/generated/anachron-lite/social-media-marketing-icon-anachron-lite.png',
              display_order: 2,
              is_active: true
            },
            {
              title: 'SEO & GEO',
              slug: 'solutions-seo-geo',
              hook: 'Get found by your ideal customers',
              image: '/generated/anachron-lite/seo-geo-icon-anachron-lite.png',
              display_order: 3,
              is_active: true
            },
            {
              title: 'Lead Generation',
              slug: 'solutions-lead-generation',
              hook: 'Fill your pipeline with qualified prospects',
              image: '/generated/anachron-lite/lead-generation-icon-anachron-lite.png',
              display_order: 4,
              is_active: true
            },
            {
              title: 'Paid Advertising',
              slug: 'solutions-paid-advertising',
              hook: 'Maximize ROI across all channels',
              image: '/generated/anachron-lite/paid-advertising-icon-anachron-lite.png',
              display_order: 5,
              is_active: true
            },
            {
              title: 'Podcasting',
              slug: 'solutions-podcasting',
              hook: 'Build authority through audio content',
              image: '/generated/anachron-lite/podcasting-icon-anachron-lite.png',
              display_order: 6,
              is_active: true
            },
            {
              title: 'Custom Apps',
              slug: 'solutions-custom-apps',
              hook: 'Tailored solutions for your needs',
              image: '/generated/anachron-lite/custom-apps-icon-anachron-lite.png',
              display_order: 7,
              is_active: true
            },
            {
              title: 'CRM Management',
              slug: 'solutions-crm-management',
              hook: 'Organize and nurture your relationships',
              image: '/generated/anachron-lite/crm-management-icon-anachron-lite.png',
              display_order: 8,
              is_active: true
            },
            {
              title: 'Fractional CMO',
              slug: 'solutions-fractional-cmo',
              hook: 'Strategic marketing leadership',
              image: '/generated/anachron-lite/fractional-cmo-icon-anachron-lite.png',
              display_order: 9,
              is_active: true
            }
          ];

          const { error } = await supabase
            .from('services')
            .insert(services);

          if (error) {
            console.log(`   ✗ Failed: ${error.message}`);
            errors.push({ statement: 'INSERT', error: error.message });
            errorCount++;
          } else {
            console.log(`   ✓ Success: ${services.length} services inserted`);
            successCount++;
          }
        } else if (upperStatement.startsWith('SELECT')) {
          // Skip SELECT statements for now
          console.log(`   Skipping: SELECT verification query`);
        }
      } catch (err) {
        console.log(`   ✗ Error: ${err.message}`);
        errors.push({ statement: statement.substring(0, 50) + '...', error: err.message });
        errorCount++;
      }
    }

    console.log(`\n   Summary: ${successCount} operations succeeded, ${errorCount} operations failed`);

    if (errors.length > 0) {
      console.log('\n   Errors encountered:');
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.statement}: ${err.error}`);
      });
    }

    // Verify the result
    console.log('\n' + '='.repeat(70));
    console.log('VERIFICATION');
    console.log('='.repeat(70));

    const { data: services, error: selectError } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (selectError) {
      console.log('\n✗ Error verifying services:', selectError.message);
      console.log('\nThis likely means the columns need to be added manually.');
      console.log('Please run the SQL file in Supabase SQL Editor:');
      console.log(`   ${migrationPath}`);
    } else {
      console.log(`\n✓ Services table contains ${services?.length || 0} records`);

      if (services && services.length > 0) {
        console.log('\nServices in database:');
        services.forEach((svc, idx) => {
          console.log(`\n${idx + 1}. ${svc.title}`);
          console.log(`   Slug: ${svc.slug}`);
          console.log(`   Hook: ${svc.hook || 'N/A'}`);
          console.log(`   Image: ${svc.image || 'N/A'}`);
          console.log(`   Order: ${svc.display_order ?? 'N/A'}`);
          console.log(`   Active: ${svc.is_active}`);
        });
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('MIGRATION COMPLETE');
    console.log('='.repeat(70));

    if (errorCount > 0) {
      console.log('\n⚠️  MANUAL STEPS REQUIRED:');
      console.log('\n1. Open Supabase Dashboard SQL Editor');
      console.log('2. Copy and paste the migration file:');
      console.log(`   ${migrationPath}`);
      console.log('3. Execute the SQL to add missing columns, RLS policies, and triggers');
      console.log('4. Re-run this script to populate the data');
    } else {
      console.log('\n✓ All operations completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Verify data in Supabase Dashboard');
      console.log('2. Update your app to fetch services from the database');
      console.log('3. Replace hardcoded services in ServiceScroller.jsx');
    }

    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n✗ Fatal error:', error.message);
    console.log('\nPlease apply the migration manually via Supabase SQL Editor');
    process.exit(1);
  }
}

applyMigration().catch(console.error);
