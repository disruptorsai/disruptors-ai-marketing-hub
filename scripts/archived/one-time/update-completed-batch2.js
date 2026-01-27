/**
 * Mark Second Batch of Completed Change Requests in Admin Nexus
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const completedDescriptions = [
  '[Work Page] Remove duplicate CTA - Keep only ONE CTA section at bottom',
  '[About Page] Remove redundant CTA button in "Work with the Disruptors" section - Keep yellow button only ("BOOK A FREE STRATEGY SESSION")',
  '[About Page] Update button text to "RSVP for Live Events" or just "Live Events"',
  '[Blog Page] Remove progress percentage bubble - Keep progress bar but remove percentage indicator (blocks "Let\'s Talk" button)',
  '[Blog Page] Fix text visibility in blog posts - Text above/below featured images needs to be black (currently not visible)'
];

async function markCompleted() {
  console.log('🔄 Updating batch 2 completed change requests...\n');

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
        console.log(`✅ ${description.substring(0, 80)}...`);
      } else {
        console.log(`⚠️  Not found: ${description.substring(0, 80)}...`);
      }
    }

    console.log('\n📊 Batch 2 Summary: ${completedDescriptions.length} requests marked completed');
    console.log('✨ Total completed so far: 10/51 (19.6%)');
    console.log('\n🎯 View at /admin/secret → Change Requests tab\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

markCompleted();
