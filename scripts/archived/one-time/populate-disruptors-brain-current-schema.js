/**
 * Populate Disruptors Media Business Brain and Brand DNA
 * (Adapted for CURRENT database schema)
 *
 * Usage: node scripts/populate-disruptors-brain-current-schema.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// BUSINESS BRAIN DATA (Current Schema Format)
// =====================================================

const businessBrainData = {
  slug: 'disruptors-media',
  name: 'Disruptors Media Business Brain',
  description: 'Comprehensive business intelligence for Disruptors Media - a Utah-based digital marketing agency specializing in AI-powered marketing solutions.',
  created_by: null // Will be set by RLS
};

// =====================================================
// BRAIN FACTS DATA (Current Schema: key/value pairs)
// =====================================================

const brainFacts = [
  // Company Info
  {
    key: 'company_name',
    value: { text: 'Disruptors Media' },
    source: 'https://disruptors.media',
    confidence: 1.0
  },
  {
    key: 'company_tagline',
    value: { text: 'Digital Marketing × AI Solutions' },
    source: 'https://disruptors.media',
    confidence: 1.0
  },
  {
    key: 'company_mission',
    value: { text: 'We drive growth with expert digital marketing, then multiply results with AI for business. We\'re not here to replace you with AI—we\'re here to empower you with it.' },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'company_industry',
    value: { text: 'Digital Marketing & AI Automation' },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'company_founded',
    value: { year: 2020 },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'company_size',
    value: { text: '2-10 employees' },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'company_location',
    value: {
      city: 'Salt Lake City',
      state: 'Utah',
      country: 'USA',
      service_areas: ['Utah (with in-person availability)', 'United States (nationwide)', 'Remote/Virtual services worldwide']
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'company_contact',
    value: {
      website: 'https://disruptors.media',
      email: 'hello@disruptors.media',
      linkedin: 'https://www.linkedin.com/company/disruptors-media'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Services
  {
    key: 'service_category_ai_automation',
    value: {
      name: 'AI Automation Solutions',
      services: [
        'AI Content Generation',
        'AI-Powered SEO',
        'Workflow Automation',
        'Lead Generation AI',
        'ChatGPT Integration',
        'AI Analytics'
      ]
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'service_category_digital_marketing',
    value: {
      name: 'Digital Marketing Services',
      services: [
        'SEO (Technical SEO, on-page optimization, link building)',
        'PPC Advertising (Google Ads, Facebook Ads, LinkedIn Ads)',
        'Social Media Marketing',
        'Content Marketing',
        'Email Marketing',
        'Conversion Rate Optimization (CRO)'
      ]
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'service_category_web_development',
    value: {
      name: 'Web Development & Design',
      services: [
        'Custom Responsive Website Design',
        'React/Vite Development',
        'E-commerce Solutions (Shopify, WooCommerce)',
        'Landing Page Development',
        'Website Maintenance'
      ]
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'service_category_fractional_cmo',
    value: {
      name: 'Fractional CMO Services',
      services: [
        'Marketing Strategy',
        'Team Leadership',
        'Budget Planning',
        'Analytics & Reporting',
        'Growth Planning'
      ]
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Pricing
  {
    key: 'pricing_starter_package',
    value: {
      name: 'Digital Kickstart',
      price_range: '$2,000-$5,000/month',
      includes: [
        'Website audit & optimization',
        'Basic SEO setup',
        'Social media management (2 platforms)',
        'Monthly reporting'
      ],
      ideal_for: 'Small businesses starting their digital journey'
    },
    source: 'Manual Entry',
    confidence: 0.9
  },
  {
    key: 'pricing_growth_package',
    value: {
      name: 'AI-Powered Growth',
      price_range: '$5,000-$10,000/month',
      includes: [
        'Everything in Starter',
        'AI content generation (12-20 pieces/month)',
        'PPC campaign management',
        'Email marketing automation',
        'Advanced analytics'
      ],
      ideal_for: 'Growing businesses ready to scale'
    },
    source: 'Manual Entry',
    confidence: 0.9
  },
  {
    key: 'pricing_enterprise_package',
    value: {
      name: 'Fractional CMO + AI Infrastructure',
      price_range: '$10,000-$25,000+/month',
      includes: [
        'Everything in Growth',
        'Dedicated Fractional CMO',
        'Custom AI tool development',
        'Multi-channel marketing orchestration',
        'Weekly strategy sessions'
      ],
      ideal_for: 'Established companies needing C-level marketing leadership'
    },
    source: 'Manual Entry',
    confidence: 0.9
  },
  {
    key: 'pricing_philosophy',
    value: {
      principles: [
        'Transparent (all pricing upfront, no hidden fees)',
        'Value-based (priced on results, not hours)',
        'Flexible (monthly, quarterly, or project options)',
        'Scalable (start small, grow as results show)',
        'No long contracts (month-to-month after initial 3-month commitment)'
      ]
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Ideal Customer Profiles
  {
    key: 'icp_primary_growth_minded_entrepreneur',
    value: {
      persona_name: 'The Growth-Minded Entrepreneur',
      role: 'CEO, Founder, Business Owner',
      company_size: '5-50 employees',
      annual_revenue: '$500K-$5M',
      industries: ['B2B Services', 'SaaS', 'Professional Services', 'E-commerce'],
      pain_points: [
        'Marketing feels like a black box—no transparency',
        'Overwhelmed by AI hype, unsure where to start',
        'Need marketing expertise but can\'t afford full-time CMO',
        'Current agency delivers reports, not results'
      ],
      goals: [
        'Predictable, scalable lead generation',
        'Understand what\'s working and why',
        'Leverage AI without losing brand authenticity',
        'Build marketing systems that work without constant oversight'
      ]
    },
    source: 'Manual Entry',
    confidence: 0.95
  },
  {
    key: 'icp_secondary_marketing_manager',
    value: {
      persona_name: 'The Overextended Marketing Manager',
      role: 'Marketing Manager, Director of Marketing',
      company_size: '50-200 employees',
      annual_revenue: '$5M-$25M',
      industries: ['Manufacturing', 'Healthcare', 'Financial Services', 'Technology'],
      pain_points: [
        'Team is stretched thin, can\'t keep up with demand',
        'Need specialized expertise but can\'t hire for each',
        'Pressure to show ROI and justify budget',
        'Boss wants to explore AI but team lacks knowledge'
      ],
      goals: [
        'Extend team capabilities without full-time hires',
        'Implement AI to improve efficiency',
        'Get executive buy-in with clear metrics',
        'Learn modern marketing approaches'
      ]
    },
    source: 'Manual Entry',
    confidence: 0.95
  },
  {
    key: 'icp_tertiary_utah_local_business',
    value: {
      persona_name: 'The Utah Local Business Owner',
      role: 'Owner, General Manager',
      company_size: '1-20 employees',
      annual_revenue: '$250K-$2M',
      industries: ['Restaurants', 'Retail', 'Home Services (HVAC, Plumbing, Landscaping)', 'Health & Wellness'],
      pain_points: [
        'No time to manage marketing—too busy running the business',
        'Tried Google Ads, got mediocre results',
        'Need more local customers, not just online presence',
        'Marketing is confusing and expensive'
      ],
      goals: [
        'More walk-ins, calls, and local bookings',
        'Dominate local search results (Google Maps, Yelp)',
        'Build loyal customer base',
        'Work with someone who understands Utah market'
      ]
    },
    source: 'Manual Entry',
    confidence: 0.95
  },

  // Value Propositions
  {
    key: 'differentiator_transparency',
    value: {
      name: 'Transparency Over Black Boxes',
      description: 'We show exactly what we\'re doing and why. No proprietary "secret sauce." Clients own all assets, accounts, and data. Monthly education sessions to empower client teams.'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'differentiator_ai_amplifier',
    value: {
      name: 'AI as an Amplifier, Not a Replacement',
      description: 'We use AI to multiply marketing efforts, not replace human creativity. AI handles repetition, humans handle strategy. Brand voice stays authentic and human. Clients stay in control of growth.'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'differentiator_fractional_cmo',
    value: {
      name: 'Fractional CMO Expertise at Agency Pricing',
      description: 'Get C-level strategic guidance without $200K+ salary. Work directly with experienced marketers, not junior account managers. Strategic thinking + tactical execution in one package. Flexible engagement models.'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'differentiator_utah_roots',
    value: {
      name: 'Utah Roots, National Reach',
      description: 'Local Utah clients get in-person meetings and on-site collaboration. Deep understanding of Utah market dynamics. Serve clients nationwide with proven remote workflows. Timezone-friendly for US-based businesses.'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'differentiator_business_focused',
    value: {
      name: 'Built for Business Owners, Not Just Marketers',
      description: 'We speak business, not just marketing jargon. Focus on revenue and profit, not vanity metrics. Understand P&L impact, CAC, LTV. Partner in growth, not just a vendor.'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Positioning
  {
    key: 'positioning_statement',
    value: {
      text: 'For growth-minded business owners who are overwhelmed by marketing complexity and skeptical of AI hype, Disruptors Media is the marketing partner that combines expert digital marketing with practical AI automation—delivered with complete transparency so you stay in control of your growth journey.'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'value_proposition_formula',
    value: {
      text: 'Digital Marketing × AI Solutions = Predictable Growth'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Results & Proof Points
  {
    key: 'average_client_results',
    value: {
      roi_multiplier: '3x ROI on digital marketing spend',
      time_savings: '40% reduction in content creation time with AI',
      retention: '85% client retention rate',
      traffic_growth: '200% average increase in organic traffic within 6 months'
    },
    source: 'Manual Entry',
    confidence: 0.85
  },
  {
    key: 'team_expertise',
    value: {
      certifications: ['Google Ads Certified', 'HubSpot Inbound Marketing Certified'],
      technical: ['React', 'Vite', 'Modern JavaScript', 'AI APIs'],
      ai_platforms: ['OpenAI', 'Claude', 'Gemini'],
      community: ['Active contributors to open-source AI tools']
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Brand Identity
  {
    key: 'brand_colors',
    value: {
      primary: '#FFD700',
      primary_name: 'Muted Gold',
      secondary: '#0E0E0E',
      secondary_name: 'Deep Black',
      accent: '#C7C7C7',
      accent_name: 'Soft Gray',
      neutrals: ['#1A1A1A', '#2D2D2D', '#404040', '#666666', '#999999', '#C7C7C7', '#E5E5E5']
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'brand_typography',
    value: {
      heading_font: 'Raleway, sans-serif',
      body_font: 'Inter, sans-serif',
      accent_font: 'Playfair Display, serif'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'brand_voice',
    value: {
      attributes: [
        'Professional & Direct',
        'Innovative & Forward-Thinking',
        'Empowering (not condescending)',
        'Transparent & Honest'
      ],
      tone: [
        'Confident but not arrogant',
        'Educational without being preachy',
        'Results-focused',
        'Human-centric (AI is a tool, not a replacement)'
      ],
      writing_style: 'Professional yet conversational',
      vocabulary_level: 'Intermediate - accessible to business owners without excessive jargon'
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Content Strategy
  {
    key: 'content_pillars',
    value: {
      pillars: [
        'AI for Business Owners',
        'Digital Marketing Best Practices',
        'Growth Strategies for SMBs',
        'Utah Business Community'
      ]
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'content_publishing_frequency',
    value: {
      blog: '2-3 posts per week',
      linkedin: '3-5 posts per week',
      email_newsletter: 'Weekly (Thursdays 9 AM MST)',
      youtube: '1-2 videos per month',
      social_media: 'Daily'
    },
    source: 'Manual Entry',
    confidence: 0.95
  },

  // SEO Keywords
  {
    key: 'primary_seo_keywords',
    value: {
      keywords: [
        'AI marketing automation',
        'fractional CMO services',
        'digital marketing agency Utah',
        'Salt Lake City SEO',
        'AI content generation',
        'marketing automation for small business',
        'PPC management Utah',
        'social media marketing agency',
        'AI-powered SEO',
        'fractional chief marketing officer'
      ]
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Competitive Intelligence
  {
    key: 'main_competitors',
    value: {
      competitors: [
        {
          name: 'WebFX',
          strengths: ['Large team', 'Extensive case studies'],
          weaknesses: ['Less personal', 'Expensive'],
          our_advantage: 'More transparent, flexible, affordable'
        },
        {
          name: 'Disruptive Advertising',
          strengths: ['Utah-based', 'PPC expertise'],
          weaknesses: ['Less AI focus', 'Larger agency feel'],
          our_advantage: 'Deeper AI integration, fractional CMO services'
        },
        {
          name: 'Ignite Visibility',
          strengths: ['Award-winning', 'Comprehensive services'],
          weaknesses: ['Expensive', 'Long contracts'],
          our_advantage: 'More affordable, flexible contracts, local accessibility'
        }
      ]
    },
    source: 'Manual Entry',
    confidence: 0.9
  },

  // Core Values
  {
    key: 'core_values',
    value: {
      values: [
        {
          name: 'Transparency First',
          description: 'We believe clients deserve to understand exactly what they\'re paying for and why it works.'
        },
        {
          name: 'Empower, Don\'t Replace',
          description: 'AI is a tool to amplify human creativity, not eliminate it. We teach, train, and transfer knowledge.'
        },
        {
          name: 'Results Over Activity',
          description: 'We\'re measured on business impact, not the number of posts or reports we deliver.'
        },
        {
          name: 'Utah Community',
          description: 'We\'re proud to be part of the Utah business community and give back through mentorship and events.'
        },
        {
          name: 'Continuous Learning',
          description: 'Marketing and AI evolve rapidly. We stay ahead through constant learning and experimentation.'
        }
      ]
    },
    source: 'Manual Entry',
    confidence: 1.0
  },

  // Technology Stack
  {
    key: 'marketing_technology_stack',
    value: {
      cms: 'React + Vite (custom)',
      analytics: ['Google Analytics 4', 'Plausible Analytics'],
      automation: ['HubSpot', 'Mailchimp'],
      crm: ['HubSpot CRM', 'Supabase'],
      social_media: ['Buffer', 'Meta Business Suite'],
      seo_tools: ['Ahrefs', 'SEMrush', 'Google Search Console', 'DataForSEO API'],
      ai_platforms: ['OpenAI GPT-4', 'OpenAI GPT-Image-1', 'Google Gemini 2.5 Flash', 'Anthropic Claude Sonnet 4.5', 'Replicate']
    },
    source: 'Manual Entry',
    confidence: 1.0
  },
  {
    key: 'development_stack',
    value: {
      frontend: 'React 18, Vite, TypeScript, Tailwind CSS',
      backend: 'Supabase (PostgreSQL, Auth, Storage)',
      serverless: 'Netlify Functions (Node.js 18)',
      hosting: 'Netlify with CDN',
      storage: 'Cloudinary',
      version_control: 'Git + GitHub'
    },
    source: 'Manual Entry',
    confidence: 1.0
  }
];

// =====================================================
// BRAND RULES DATA
// =====================================================

const brandRules = [
  // Voice Rules
  {
    category: 'voice',
    rule_type: 'Professional & Direct',
    rule_text: 'Our brand voice is professional but never stuffy. We\'re direct and clear, avoiding corporate jargon and unnecessary complexity. Think "trusted advisor" not "corporate consultant."',
    examples: [
      'We\'ll be honest: AI isn\'t magic. It\'s a tool. Used right, it saves you 10 hours a week.',
      'Here\'s what we actually do: We build marketing systems that work while you sleep.',
      'Most agencies hide behind reports. We show you the numbers that matter and explain what they mean.'
    ]
  },
  {
    category: 'voice',
    rule_type: 'Empowering, Never Condescending',
    rule_text: 'We educate and empower, never talk down to our audience. Our clients are smart—they\'re just busy. We make complex marketing and AI concepts accessible without being patronizing.',
    examples: [
      'If you\'re confused by AI, you\'re not alone. It\'s overhyped and under-explained. Let\'s fix that.',
      'You don\'t need to become an SEO expert. You just need to understand enough to make smart decisions.'
    ]
  },
  {
    category: 'voice',
    rule_type: 'Confident But Humble',
    rule_text: 'We\'re confident in our expertise but humble about what we don\'t know. We admit when we\'re wrong, when results take time, and when something isn\'t working.',
    examples: [
      'We\'ve done this 100+ times, and here\'s what usually works. But every business is different, so we\'ll test and adjust.',
      'This strategy failed for one of our clients last year. Here\'s what we learned and how we adapted.'
    ]
  },
  {
    category: 'voice',
    rule_type: 'Results-Focused, Not Activity-Focused',
    rule_text: 'We talk about business outcomes (revenue, leads, growth) not marketing activities (posts published, emails sent). We\'re measured on impact, not effort.',
    examples: [
      'This campaign generated 47 qualified leads, 12 became customers, contributing $89K in revenue.',
      'We don\'t count "engagement." We count calls booked, demos scheduled, and deals closed.'
    ]
  },

  // Tone Rules
  {
    category: 'tone',
    rule_type: 'Conversational, Not Casual',
    rule_text: 'We use contractions, ask questions, and write like we talk. But we maintain professionalism—no slang, no memes in business contexts.',
    examples: [
      'Here\'s the thing about SEO...',
      'We\'ve seen this before, and here\'s what works.',
      'Let\'s break this down step-by-step.'
    ]
  },
  {
    category: 'tone',
    rule_type: 'Educational, Not Preachy',
    rule_text: 'We teach useful skills and share insights, but we don\'t lecture or sound like a textbook. We share "here\'s what works" not "here\'s what you should do."',
    examples: [
      'Three things we\'ve learned after running 500+ Facebook campaigns: [practical insights]',
      'Most people overthink keyword research. Here\'s a simpler approach.'
    ]
  },
  {
    category: 'tone',
    rule_type: 'Optimistic But Realistic',
    rule_text: 'We\'re positive about possibilities but honest about effort, timelines, and challenges. No false promises or unrealistic expectations.',
    examples: [
      'Yes, AI can save you time. But it takes 2-3 months to set up properly.',
      'SEO works incredibly well—but it takes 4-6 months to see major results.'
    ]
  },

  // Style Rules
  {
    category: 'style',
    rule_type: 'Short Sentences, Short Paragraphs',
    rule_text: 'We favor readability. Short sentences (10-20 words average). Short paragraphs (2-4 sentences). Bullet points for lists. White space for breathing.',
    examples: []
  },
  {
    category: 'style',
    rule_type: 'Active Voice Over Passive Voice',
    rule_text: 'Use active voice whenever possible. It\'s clearer, more direct, and more engaging.',
    examples: [
      'We generate leads (not "Leads are generated by us")',
      'Our AI tools save you time (not "Time is saved by our AI tools")'
    ]
  },
  {
    category: 'style',
    rule_type: 'Specific Numbers Over Vague Claims',
    rule_text: 'Use precise numbers, dates, and data points instead of vague claims. Specificity builds credibility.',
    examples: [
      'We increased organic traffic by 247% in 6 months (not "massive traffic increase")',
      'Generated 89 qualified leads (not "lots of leads")'
    ]
  },
  {
    category: 'style',
    rule_type: 'Headers That Tell, Not Tease',
    rule_text: 'Headers should communicate the key point, not create mystery. Scannable content wins.',
    examples: [
      'AI Can\'t Replace Strategic Thinking (And That\'s Good)',
      'Why Most Facebook Ads Fail (And How to Fix It)'
    ]
  },

  // Lexicon Rules
  {
    category: 'lexicon',
    rule_type: 'Brand-Specific Terms',
    rule_text: 'Use these terms consistently: "Marketing partner" (not vendor/agency), "AI automation" (not machine learning), "Fractional CMO" (not part-time marketing director), "Marketing system" (not stack), "Results" (not deliverables), "Transparency" (core differentiator), "Empower" (not enable/facilitate).',
    examples: []
  },
  {
    category: 'lexicon',
    rule_type: 'Plain English Over Jargon',
    rule_text: 'When there\'s a simple word and a jargon word, choose the simple one. Use "use" instead of "leverage/utilize", "help" instead of "facilitate/enable", "improve" instead of "optimize" (unless technical context).',
    examples: []
  },

  // Taboos Rules
  {
    category: 'taboos',
    rule_type: 'No Hype or Hyperbole',
    rule_text: 'Avoid exaggerated claims and superlatives. Forbidden: Revolutionary, Game-changing, Best in the world, Guaranteed results, Explosive growth, Secret formula. We build trust through honesty, not excitement.',
    examples: []
  },
  {
    category: 'taboos',
    rule_type: 'No "Trust Us" Without Proof',
    rule_text: 'Never ask readers to trust us without backing it up with evidence, examples, or logic. Trust is earned through transparency, not demanded through authority.',
    examples: []
  },
  {
    category: 'taboos',
    rule_type: 'No Feature Dumping',
    rule_text: 'Don\'t list features without connecting them to benefits and outcomes. Nobody cares about what your service includes—they care about what it does for them. Always lead with the client\'s perspective.',
    examples: [
      'Good: "We keep your social media active (12 posts/month) so you don\'t have to"',
      'Bad: "Our service includes 12 social media posts per month"'
    ]
  },
  {
    category: 'taboos',
    rule_type: 'No Corporate Clichés',
    rule_text: 'Avoid overused business phrases. Forbidden: Think outside the box, Low-hanging fruit, Move the needle, Circle back, Synergy, Best-in-class, Value-add, Leverage our core competencies.',
    examples: []
  },
  {
    category: 'taboos',
    rule_type: 'No Negativity Toward Competitors',
    rule_text: 'We differentiate by highlighting what we do well, not by trashing competitors. Be confident, not petty.',
    examples: [
      'Good: "Here\'s our approach and why it works for our clients"',
      'Bad: "Unlike other agencies who scam you, we\'re honest"'
    ]
  },
  {
    category: 'taboos',
    rule_type: 'No Fake Urgency',
    rule_text: 'Don\'t manufacture urgency with countdown timers or false scarcity. If there\'s a real deadline, state it. Otherwise, don\'t manipulate. We build long-term relationships, not pressure sales.',
    examples: []
  }
];

// =====================================================
// MAIN POPULATION FUNCTION
// =====================================================

async function populateDisruptorsBrain() {
  console.log('🚀 Starting Disruptors Media Business Brain & Brand DNA population...\n');

  try {
    // Step 1: Create or update Business Brain
    console.log('📝 Step 1: Creating/updating Business Brain...');

    const { data: existingBrain, error: checkError } = await supabase
      .from('business_brains')
      .select('id')
      .eq('slug', businessBrainData.slug)
      .single();

    let brainId;

    if (existingBrain) {
      console.log(`   ✅ Brain exists (ID: ${existingBrain.id}). Updating...`);

      const { data: updatedBrain, error: updateError } = await supabase
        .from('business_brains')
        .update(businessBrainData)
        .eq('id', existingBrain.id)
        .select()
        .single();

      if (updateError) throw updateError;

      brainId = updatedBrain.id;
      console.log(`   ✅ Business Brain updated successfully\n`);
    } else {
      console.log('   Creating new Business Brain...');

      const { data: newBrain, error: insertError } = await supabase
        .from('business_brains')
        .insert(businessBrainData)
        .select()
        .single();

      if (insertError) throw insertError;

      brainId = newBrain.id;
      console.log(`   ✅ Business Brain created successfully (ID: ${brainId})\n`);
    }

    // Step 2: Clear existing facts
    console.log('🗑️  Step 2: Clearing existing brain facts...');
    const { error: deleteFactsError } = await supabase
      .from('brain_facts')
      .delete()
      .eq('brain_id', brainId);

    if (deleteFactsError) console.warn('   ⚠️  Warning: Could not delete old facts:', deleteFactsError.message);
    else console.log('   ✅ Existing facts cleared\n');

    // Step 3: Insert Brain Facts
    console.log(`📚 Step 3: Inserting ${brainFacts.length} brain facts...`);

    const factsWithBrainId = brainFacts.map(fact => ({
      ...fact,
      brain_id: brainId
    }));

    const { data: insertedFacts, error: factsError } = await supabase
      .from('brain_facts')
      .insert(factsWithBrainId)
      .select();

    if (factsError) throw factsError;

    console.log(`   ✅ Inserted ${insertedFacts.length} brain facts\n`);

    // Step 4: Clear existing brand rules
    console.log('🗑️  Step 4: Clearing existing brand rules...');
    const { error: deleteRulesError } = await supabase
      .from('brand_rules')
      .delete()
      .eq('brain_id', brainId);

    if (deleteRulesError) console.warn('   ⚠️  Warning: Could not delete old rules:', deleteRulesError.message);
    else console.log('   ✅ Existing brand rules cleared\n');

    // Step 5: Insert Brand Rules
    console.log(`🎨 Step 5: Inserting ${brandRules.length} brand rules...`);

    const rulesWithBrainId = brandRules.map(rule => ({
      ...rule,
      brain_id: brainId
    }));

    const { data: insertedRules, error: rulesError } = await supabase
      .from('brand_rules')
      .insert(rulesWithBrainId)
      .select();

    if (rulesError) throw rulesError;

    console.log(`   ✅ Inserted ${insertedRules.length} brand rules\n`);

    // Final Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ SUCCESS! Disruptors Media Business Brain & Brand DNA populated');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`📋 Summary:`);
    console.log(`   • Brain ID: ${brainId}`);
    console.log(`   • Brain Slug: ${businessBrainData.slug}`);
    console.log(`   • Total Facts: ${insertedFacts.length}`);
    console.log(`   • Brand Rules: ${insertedRules.length}`);
    console.log(`   • Rule Categories: ${[...new Set(brandRules.map(r => r.category))].join(', ')}`);
    console.log('\n🎉 You can now access this data in the Admin Nexus:');
    console.log('   • Business Brain Builder: /admin/secret → Business Brain Builder');
    console.log('   • Brand DNA Builder: /admin/secret → Brand DNA Builder\n');

  } catch (error) {
    console.error('\n❌ ERROR during population:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
populateDisruptorsBrain();
