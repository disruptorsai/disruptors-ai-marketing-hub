import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Topic-specific Unsplash images (high-quality, relevant to each post)
const imageUpdates = [
  {
    id: '9ca62af2-b1aa-4470-b823-7096d1d15978',
    title: 'SDK Test Post',
    featured_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop' // Code/development
  },
  {
    id: '39ef7791-d339-4cf1-805e-a3868c51f9c4',
    title: 'The Hidden ROI of Content Creation Services',
    featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop' // Analytics dashboard/ROI
  },
  {
    id: 'f1807d67-2e3c-4242-b787-e144b75680fb',
    title: 'Podcasting & SEO Agency',
    featured_image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2340&auto=format&fit=crop' // Podcast microphone
  },
  {
    id: '30a0f672-aa53-4809-873a-37b60ecd04ac',
    title: '360 Marketing Agency Revenue Streams',
    featured_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2274&auto=format&fit=crop' // Team collaboration/strategy
  },
  {
    id: 'af436dc2-bbba-43d7-b1be-6eec64054b2e',
    title: 'Systems & Automations for Creatives',
    featured_image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2340&auto=format&fit=crop' // Automation/workflow
  },
  {
    id: '58bd774d-eac7-47eb-b50c-e155c776899b',
    title: 'Content Creation Services',
    featured_image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2340&auto=format&fit=crop' // Creative team brainstorming
  },
  {
    id: '63b47b6f-75f4-4af8-a7b5-c29265daf6a6',
    title: 'Creative Branding & Strategy',
    featured_image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2364&auto=format&fit=crop' // Design/branding tools
  },
  {
    id: '5ace8497-5fd8-4c1e-a61c-5956e90dbb7d',
    title: 'Error Post (to be fixed)',
    featured_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2340&auto=format&fit=crop' // Tech/digital
  }
];

async function updateBlogImages() {
  console.log('🖼️  Updating blog post feature images...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const post of imageUpdates) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({ featured_image: post.featured_image })
        .eq('id', post.id)
        .select();

      if (error) {
        console.error(`❌ Error updating "${post.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Updated: "${post.title}"`);
        console.log(`   Image: ${post.featured_image}\n`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception updating "${post.title}":`, err.message);
      errorCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Successfully updated: ${successCount} posts`);
  console.log(`❌ Failed: ${errorCount} posts`);
  console.log(`📊 Total processed: ${imageUpdates.length} posts`);
}

updateBlogImages().catch(console.error);
