import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

async function populateServices() {
  console.log('Populating services table...\n');

  const { data, error } = await supabase
    .from('services')
    .insert(services)
    .select();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`✓ Successfully inserted ${data.length} services\n`);

  data.forEach((service, i) => {
    console.log(`  ${i + 1}. ${service.title} (order: ${service.display_order})`);
  });
}

populateServices().catch(console.error);
