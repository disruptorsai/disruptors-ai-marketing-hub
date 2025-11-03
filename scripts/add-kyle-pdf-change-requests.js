/**
 * Add Kyle's PDF Change Requests to Admin Nexus
 *
 * Processes the 48 itemized change requests from Kyle's PDF analysis
 * and adds them to the change_requests table in Admin Nexus
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Kyle's 48 change requests from PDF analysis
const changeRequests = [
  // HOME PAGE
  {
    page: 'Home',
    description: 'Replace initial hero video - Current video needs to be swapped out',
    priority: 'high',
    category: 'content_change'
  },
  {
    page: 'Home',
    description: 'Adjust shaking hands visual - Zoom out so hands are more clearly recognizable as hands',
    priority: 'medium',
    category: 'design_change'
  },
  {
    page: 'Home',
    description: 'Reduce "What We Bring to the Table" section to 5 service highlights: Expert Marketing Services, AI Automation Expertise, Content at Scale, Lead Generation, Live Performance Tracking',
    priority: 'high',
    category: 'content_change'
  },
  {
    page: 'Home',
    description: 'Keep existing wording for the 5 service highlights - No text changes needed',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'Home',
    description: 'Fix left-side fade issue - "Expert Digital Marketing" entry is cut off or fading on left side (sloppy appearance)',
    priority: 'high',
    category: 'bug_fix'
  },
  {
    page: 'Home',
    description: 'Remove redundant CTA - Consider removing "Discover Your Growth Potential" button (duplicate link with button below)',
    priority: 'medium',
    category: 'design_change'
  },

  // WORK PAGE
  {
    page: 'Work',
    description: 'Change page title to "OUR WORK" instead of current title',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add hero banner with text: "Using AI Helped Our Partners Experience An Average Increase Of +120% increase in monthly revenue"',
    priority: 'high',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add CTA button "SHOW ME HOW" (yellow button, same style as reference image)',
    priority: 'medium',
    category: 'feature'
  },
  {
    page: 'Work',
    description: 'Add case study for Commission Express',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add case study for Acumen',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add case study for Core Benefits',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add case study for GetEducated',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add case study for Financial Haus',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add case study for Pendari',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add case study for Exeo Advisors',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Add case study for Greene Design & Build',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Work',
    description: 'Create horizontal scroll carousel for Featured Case Studies - Left to right scrolling (not static boxes)',
    priority: 'high',
    category: 'design_change'
  },
  {
    page: 'Work',
    description: 'Match partner visual style for case studies - White lettering on dark background with yellow accents',
    priority: 'medium',
    category: 'design_change'
  },
  {
    page: 'Work',
    description: 'Use same design pattern as current partner showcase section for case studies',
    priority: 'medium',
    category: 'design_change'
  },
  {
    page: 'Work',
    description: 'Remove duplicate CTA - Keep only ONE CTA section at bottom',
    priority: 'medium',
    category: 'design_change'
  },
  {
    page: 'Work',
    description: 'Keep "Ready to grow?" section with two buttons',
    priority: 'low',
    category: 'content_change'
  },

  // SERVICES PAGE
  {
    page: 'Services',
    description: 'Adjust moving hand position - Currently placed too low on the page',
    priority: 'low',
    category: 'design_change'
  },

  // ABOUT PAGE
  {
    page: 'About',
    description: 'Change page title to "ABOUT US" instead of just "ABOUT"',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'About',
    description: 'Replace placeholder video - Current video needs updating',
    priority: 'high',
    category: 'content_change'
  },
  {
    page: 'About',
    description: 'Replace cartoonish hero image - Current image with AI/robot theme looks cartoonish',
    priority: 'high',
    category: 'design_change'
  },
  {
    page: 'About',
    description: 'Improve video animations - Current animations look silly, need professional execution',
    priority: 'high',
    category: 'design_change'
  },
  {
    page: 'About',
    description: 'Reduce "What We Bring to the Table" section to 5 highlights (same as home page)',
    priority: 'high',
    category: 'content_change'
  },
  {
    page: 'About',
    description: 'Fix left-side fade issue on About page - "Expert Digital Marketing" entry cut off/fading',
    priority: 'high',
    category: 'bug_fix'
  },
  {
    page: 'About',
    description: 'Replace Utah-Based location image - Current image looks too Roman/historical, doesn\'t fit brand dynamic',
    priority: 'medium',
    category: 'design_change'
  },
  {
    page: 'About',
    description: 'Update button text to "RSVP for Live Events" or just "Live Events"',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'About',
    description: 'Update button destination to link to events page',
    priority: 'medium',
    category: 'feature'
  },
  {
    page: 'About',
    description: 'Remove redundant CTA button in "Work with the Disruptors" section - Keep yellow button only ("BOOK A FREE STRATEGY SESSION")',
    priority: 'medium',
    category: 'design_change'
  },

  // PODCAST PAGE
  {
    page: 'Podcast',
    description: 'Replace Carson photo with studio cameras/equipment - Showcase production gear',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Podcast',
    description: 'Fix broken "View Our Work" button link - Currently goes nowhere',
    priority: 'high',
    category: 'bug_fix'
  },
  {
    page: 'Podcast',
    description: 'Add podcast show reel - Feature on this page or create redirect page',
    priority: 'high',
    category: 'feature'
  },
  {
    page: 'Podcast',
    description: 'Reduce features section to 4 items: Multi-Camera Setup, Crystal Clear Audio, Full Post-Production, Expert Producer Team',
    priority: 'medium',
    category: 'content_change'
  },
  {
    page: 'Podcast',
    description: 'Make all feature icons white - Consistent color scheme',
    priority: 'low',
    category: 'design_change'
  },
  {
    page: 'Podcast',
    description: 'Change section title from "Our Studio" to "Our Studios" (plural)',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'Podcast',
    description: 'Retitle first studio section: "Cozy-and-Intimate Podcast Studio Setup"',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'Podcast',
    description: 'Update first studio description: "4k Black Magic Cameras with ample lighting, acoustic perfection, and unique decor for one-of-a-kind conversations"',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'Podcast',
    description: 'Add corporate studio section - Duplicate the studio showcase format',
    priority: 'high',
    category: 'feature'
  },
  {
    page: 'Podcast',
    description: 'Title corporate studio: "State-of-the-Art Corporate Podcast Setup"',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'Podcast',
    description: 'Corporate studio description: "Complete with 3 LED TV\'s, polished podcast desk, and top-tier visual/audio quality for maximum authority and presence"',
    priority: 'low',
    category: 'content_change'
  },
  {
    page: 'Podcast',
    description: 'Source corporate studio images from Corporate Studio folder',
    priority: 'medium',
    category: 'content_change'
  },

  // BLOG PAGE
  {
    page: 'Blog',
    description: 'Remove white blank bar at bottom of blog listing page',
    priority: 'medium',
    category: 'bug_fix'
  },
  {
    page: 'Blog',
    description: 'Fix text visibility in blog posts - Text above/below featured images needs to be black (currently not visible)',
    priority: 'high',
    category: 'bug_fix'
  },
  {
    page: 'Blog',
    description: 'Redesign blog post layout - Current placement and text formatting looks "horrendous"',
    priority: 'urgent',
    category: 'design_change'
  },
  {
    page: 'Blog',
    description: 'Add proper spacing to blog posts - Text is currently an "impersonal, lifeless wall of text"',
    priority: 'high',
    category: 'design_change'
  },
  {
    page: 'Blog',
    description: 'Add interactive elements to blog posts - Include buttons/features similar to EVlogic and AcumenFL blog examples',
    priority: 'medium',
    category: 'feature'
  },
  {
    page: 'Blog',
    description: 'Remove progress percentage bubble - Keep progress bar but remove percentage indicator (blocks "Let\'s Talk" button)',
    priority: 'medium',
    category: 'design_change'
  }
];

async function addChangeRequests() {
  console.log('🚀 Adding Kyle\'s PDF Change Requests to Admin Nexus...\n');

  try {
    // Prepare all requests with Kyle's info
    const requests = changeRequests.map(req => ({
      requester_name: 'Kyle',
      requester_email: 'kyle@disruptorsmedia.com',
      change_description: `[${req.page} Page] ${req.description}`,
      priority: req.priority,
      category: req.category,
      status: 'pending'
    }));

    // Insert all requests in batch
    const { data, error } = await supabase
      .from('change_requests')
      .insert(requests)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully added ${data.length} change requests!`);
    console.log('\n📊 Breakdown by page:');

    const breakdown = changeRequests.reduce((acc, req) => {
      acc[req.page] = (acc[req.page] || 0) + 1;
      return acc;
    }, {});

    Object.entries(breakdown).forEach(([page, count]) => {
      console.log(`   • ${page}: ${count} requests`);
    });

    console.log('\n📊 Breakdown by category:');
    const categoryBreakdown = changeRequests.reduce((acc, req) => {
      acc[req.category] = (acc[req.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`   • ${category.replace('_', ' ')}: ${count} requests`);
    });

    console.log('\n📊 Breakdown by priority:');
    const priorityBreakdown = changeRequests.reduce((acc, req) => {
      acc[req.priority] = (acc[req.priority] || 0) + 1;
      return acc;
    }, {});

    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      console.log(`   • ${priority}: ${count} requests`);
    });

    console.log('\n🎯 All requests are now visible in Admin Nexus:');
    console.log('   Navigate to /admin/secret → Change Requests tab');
    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error adding change requests:', error.message);
    process.exit(1);
  }
}

addChangeRequests();
