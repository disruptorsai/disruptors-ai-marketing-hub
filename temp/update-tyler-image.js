import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTylerImage() {
  try {
    const newImageUrl = 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758490491/ChatGPT_Image_Sep_21_2025_03_33_57_PM_xrteo4.png';

    // Find Tyler's record
    const { data: tylerRecord, error: findError } = await supabase
      .from('team_members')
      .select('*')
      .ilike('name', '%tyler%')
      .single();

    if (findError) {
      console.error('Error finding Tyler:', findError);
      return;
    }

    console.log('Found Tyler:', tylerRecord);

    // Update Tyler's headshot
    const { data: updateData, error: updateError } = await supabase
      .from('team_members')
      .update({ headshot: newImageUrl })
      .eq('id', tylerRecord.id)
      .select();

    if (updateError) {
      console.error('Error updating Tyler\'s image:', updateError);
      return;
    }

    console.log('✅ Successfully updated Tyler\'s headshot!');
    console.log('Updated record:', updateData);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateTylerImage();
