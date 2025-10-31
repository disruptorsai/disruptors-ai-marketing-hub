/**
 * Mark Completed Change Requests in Admin Nexus
 *
 * Updates the status of change requests that have been successfully implemented
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Change requests that have been completed
const completedDescriptions = [
  '[Work Page] Change page title to "OUR WORK" instead of current title',
  '[About Page] Change page title to "ABOUT US" instead of just "ABOUT"',
  '[Home Page] Reduce "What We Bring to the Table" section to 5 service highlights: Expert Marketing Services, AI Automation Expertise, Content at Scale, Lead Generation, Live Performance Tracking',
  '[Home Page] Keep existing wording for the 5 service highlights - No text changes needed',
  '[Work Page] Keep "Ready to grow?" section with two buttons'
];

async function markCompleted() {
  console.log('🔄 Updating completed change requests in Admin Nexus...\n');

  try {
    for (const description of completedDescriptions) {
      const { data, error } = await supabase
        .from('change_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: 'Claude Code'
        })
        .eq('change_description', description)
        .eq('requester_name', 'Kyle')
        .select();

      if (error) {
        console.error(`❌ Error updating: ${description}`);
        console.error(error.message);
      } else if (data && data.length > 0) {
        console.log(`✅ Marked as completed: ${description.substring(0, 80)}...`);
      } else {
        console.log(`⚠️  Not found: ${description.substring(0, 80)}...`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total requests marked: ${completedDescriptions.length}`);
    console.log('\n🎯 Access Admin Nexus to view updates:');
    console.log('   Navigate to /admin/secret → Change Requests tab');
    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error updating change requests:', error.message);
    process.exit(1);
  }
}

markCompleted();
