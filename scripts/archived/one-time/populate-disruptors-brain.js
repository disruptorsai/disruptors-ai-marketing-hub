/**
 * Populate Disruptors Media Business Brain and Brand DNA
 *
 * This script populates the database with comprehensive Business Brain data
 * and Brand DNA rules for Disruptors Media based on the documentation in:
 * - docs/DISRUPTORS_MEDIA_BUSINESS_BRAIN.md
 * - docs/DISRUPTORS_MEDIA_BRAND_DNA.md
 *
 * Usage: node scripts/populate-disruptors-brain.js
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
// BUSINESS BRAIN DATA
// =====================================================

const businessBrainData = {
  slug: 'disruptors-media',
  name: 'Disruptors Media Business Brain',
  business_name: 'Disruptors Media',
  tagline: 'Digital Marketing × AI Solutions',
  description: 'We drive growth with expert digital marketing, then multiply results with AI for business. We\'re not here to replace you with AI—we\'re here to empower you with it.',
  industry: 'Digital Marketing & AI Automation',
  founded_year: 2020,
  company_size: '2-10',

  // Contact & Location
  primary_website: 'https://disruptors.media',
  primary_email: 'hello@disruptors.media',
  headquarters_city: 'Salt Lake City',
  headquarters_state: 'Utah',
  headquarters_country: 'USA',
  service_areas: ['Utah (primary - in-person available)', 'United States (nationwide)', 'Remote/Virtual services worldwide'],

  // Business Intelligence
  ideal_customer_profile: [
    {
      persona_name: 'The Growth-Minded Entrepreneur',
      role: 'CEO, Founder, Business Owner',
      company_size: '5-50 employees',
      pain_points: ['Marketing feels like a black box', 'Overwhelmed by AI hype', 'Need marketing expertise but can\'t afford full-time CMO'],
      goals: ['Predictable, scalable lead generation', 'Understand what\'s working', 'Leverage AI without losing brand authenticity'],
      decision_factors: ['Transparency and education', 'Proven ROI', 'Flexibility to scale', 'Modern tools']
    },
    {
      persona_name: 'The Overextended Marketing Manager',
      role: 'Marketing Manager, Director of Marketing',
      company_size: '50-200 employees',
      pain_points: ['Team is stretched thin', 'Need specialized expertise', 'Pressure to show ROI'],
      goals: ['Extend team capabilities', 'Implement AI efficiently', 'Get executive buy-in'],
      decision_factors: ['Integrates with existing tools', 'Provides strategic guidance', 'Training included']
    }
  ],

  core_offerings: [
    {
      name: 'AI Automation Solutions',
      services: ['AI Content Generation', 'AI-Powered SEO', 'Workflow Automation', 'Lead Generation AI']
    },
    {
      name: 'Digital Marketing Services',
      services: ['SEO', 'PPC Advertising', 'Social Media Marketing', 'Content Marketing', 'Email Marketing']
    },
    {
      name: 'Web Development & Design',
      services: ['Website Design', 'Web Development', 'E-commerce Solutions', 'Landing Pages']
    },
    {
      name: 'Fractional CMO Services',
      services: ['Marketing Strategy', 'Team Leadership', 'Budget Planning', 'Growth Planning']
    }
  ],

  unique_value_propositions: [
    'Transparency Over Black Boxes',
    'AI as an Amplifier, Not a Replacement',
    'Fractional CMO Expertise at Agency Pricing',
    'Utah Roots, National Reach',
    'Built for Business Owners, Not Just Marketers'
  ],

  key_differentiators: [
    'Complete transparency - you own all assets and data',
    'AI-powered marketing without losing human touch',
    'C-level strategy at agency pricing',
    'In-person availability for Utah clients',
    'Focus on business outcomes, not vanity metrics'
  ],

  pain_points_solved: [
    'Marketing complexity and lack of transparency',
    'Uncertainty about AI implementation',
    'Need for strategic marketing leadership without CMO salary',
    'Inconsistent marketing execution',
    'Difficulty measuring true ROI'
  ],

  target_keywords: [
    'AI marketing automation',
    'fractional CMO services',
    'digital marketing agency Utah',
    'Salt Lake City SEO',
    'AI content generation',
    'marketing automation for small business'
  ],

  competitor_urls: [
    'https://www.webfx.com',
    'https://www.disruptiveadvertising.com',
    'https://ignitevisibility.com'
  ],

  // Brand Identity
  brand_colors: {
    primary: '#FFD700',
    primary_name: 'Muted Gold',
    secondary: '#0E0E0E',
    secondary_name: 'Deep Black',
    accent: '#C7C7C7',
    accent_name: 'Soft Gray',
    neutrals: ['#1A1A1A', '#2D2D2D', '#404040', '#666666', '#999999', '#C7C7C7', '#E5E5E5'],
    palette: {
      vibrant: '#FFD700',
      darkVibrant: '#B8941C',
      lightVibrant: '#FFE866',
      muted: '#C7C7C7',
      darkMuted: '#404040',
      lightMuted: '#E5E5E5'
    }
  },

  typography: {
    heading_font: 'Raleway, sans-serif',
    body_font: 'Inter, sans-serif',
    accent_font: 'Playfair Display, serif',
    font_urls: [
      'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&display=swap',
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap'
    ]
  },

  logo_urls: {
    primary: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png',
    icon: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/icon.png'
  },

  design_style: 'Modern, bold, tech-forward with cinematic aesthetics',

  // Brand Voice
  brand_voice: [
    'Professional & Direct',
    'Innovative & Forward-Thinking',
    'Empowering (not condescending)',
    'Transparent & Honest'
  ],

  tone_attributes: [
    'Confident but not arrogant',
    'Educational without being preachy',
    'Results-focused',
    'Human-centric (AI is a tool, not a replacement)'
  ],

  writing_style: 'Professional yet conversational',
  vocabulary_level: 'intermediate',

  // Content Strategy
  content_pillars: [
    'AI for Business Owners',
    'Digital Marketing Best Practices',
    'Growth Strategies for SMBs',
    'Utah Business Community'
  ],

  content_formats: [
    'Blog posts',
    'LinkedIn articles',
    'Video content',
    'Email newsletters',
    'Social media posts'
  ],

  publishing_frequency: 'Blog: 2-3 posts/week, LinkedIn: 3-5 posts/week, Email: Weekly',

  // Brain Health
  brain_level: 'expert',
  confidence_score: 0.95,
  total_facts: 0, // Will be updated after facts insertion
  auto_initialized: false,
  onboarding_completed: true,
  web_scrape_completed: false,
  brand_colors_extracted: true,
  integrations_connected: 0
};

// =====================================================
// BRAIN FACTS DATA
// =====================================================

const brainFacts = [
  // Company Info Facts
  {
    fact_text: 'Disruptors Media is a Utah-based digital marketing agency specializing in AI-powered marketing solutions.',
    fact_type: 'company_info',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['company', 'Utah', 'digital marketing', 'AI']
  },
  {
    fact_text: 'Company tagline: "Digital Marketing × AI Solutions" - We drive growth with expert digital marketing, then multiply results with AI.',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['tagline', 'value proposition', 'AI', 'digital marketing']
  },
  {
    fact_text: 'Mission: Empower businesses with AI without replacing the human touch. We position ourselves as a Fractional CMO + AI Infrastructure Team.',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['mission', 'AI', 'fractional CMO', 'empowerment']
  },
  {
    fact_text: 'Founded in 2020, Disruptors Media has 5+ years of experience in digital marketing and AI automation, serving 50+ clients across multiple industries.',
    fact_type: 'history',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 0.95,
    importance: 'high',
    verified: true,
    keywords: ['founded', 'experience', 'clients', 'history']
  },
  {
    fact_text: 'Company size: 2-10 employees (boutique agency model)',
    fact_type: 'company_info',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'medium',
    verified: true,
    keywords: ['team size', 'employees', 'boutique']
  },
  {
    fact_text: 'Headquarters: Salt Lake City, Utah. Service areas include Utah (with in-person availability), nationwide US, and remote/virtual services worldwide.',
    fact_type: 'location',
    category: 'locations',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'high',
    verified: true,
    keywords: ['location', 'Utah', 'Salt Lake City', 'service area']
  },
  {
    fact_text: 'Contact: Primary website https://disruptors.media, Email hello@disruptors.media',
    fact_type: 'company_info',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'high',
    verified: true,
    keywords: ['contact', 'website', 'email']
  },

  // Service Facts
  {
    fact_text: 'Service Category 1: AI Automation Solutions including AI Content Generation, AI-Powered SEO, Workflow Automation, Lead Generation AI, ChatGPT Integration, and AI Analytics.',
    fact_type: 'service',
    category: 'services',
    subcategory: 'AI Automation',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['services', 'AI', 'automation', 'content', 'SEO', 'ChatGPT']
  },
  {
    fact_text: 'Service Category 2: Digital Marketing Services including SEO (Technical SEO, on-page optimization, link building), PPC Advertising (Google Ads, Facebook Ads, LinkedIn Ads), Social Media Marketing, Content Marketing, Email Marketing, and Conversion Rate Optimization (CRO).',
    fact_type: 'service',
    category: 'services',
    subcategory: 'Digital Marketing',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['digital marketing', 'SEO', 'PPC', 'social media', 'content marketing', 'email']
  },
  {
    fact_text: 'Service Category 3: Web Development & Design including custom responsive website design, React/Vite development, e-commerce solutions (Shopify, WooCommerce), landing page development, and ongoing website maintenance.',
    fact_type: 'service',
    category: 'services',
    subcategory: 'Web Development',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'high',
    verified: true,
    keywords: ['web development', 'web design', 'React', 'ecommerce', 'Shopify']
  },
  {
    fact_text: 'Service Category 4: Fractional CMO Services including marketing strategy, team leadership, budget planning, analytics & reporting, and long-term growth planning.',
    fact_type: 'service',
    category: 'services',
    subcategory: 'Fractional CMO',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['fractional CMO', 'strategy', 'leadership', 'analytics', 'growth']
  },

  // Pricing Facts
  {
    fact_text: 'Starter Package "Digital Kickstart": $2,000-$5,000/month. Includes website audit, basic SEO, social media management (2 platforms), and monthly reporting. Ideal for small businesses starting their digital journey.',
    fact_type: 'pricing',
    category: 'pricing',
    source_type: 'manual_entry',
    confidence: 0.9,
    importance: 'high',
    verified: true,
    keywords: ['pricing', 'starter', 'package', 'small business']
  },
  {
    fact_text: 'Growth Package "AI-Powered Growth": $5,000-$10,000/month. Includes everything in Starter plus AI content generation (12-20 pieces/month), PPC campaign management, email marketing automation, and advanced analytics. Ideal for growing businesses ready to scale.',
    fact_type: 'pricing',
    category: 'pricing',
    source_type: 'manual_entry',
    confidence: 0.9,
    importance: 'high',
    verified: true,
    keywords: ['pricing', 'growth', 'AI', 'PPC', 'automation']
  },
  {
    fact_text: 'Enterprise Package "Fractional CMO + AI Infrastructure": $10,000-$25,000+/month. Includes everything in Growth plus dedicated Fractional CMO, custom AI tool development, multi-channel marketing orchestration, and weekly strategy sessions. Ideal for established companies needing C-level marketing leadership.',
    fact_type: 'pricing',
    category: 'pricing',
    source_type: 'manual_entry',
    confidence: 0.9,
    importance: 'high',
    verified: true,
    keywords: ['pricing', 'enterprise', 'fractional CMO', 'custom AI']
  },
  {
    fact_text: 'Pricing philosophy: Transparent (all pricing upfront, no hidden fees), Value-based (priced on results, not hours), Flexible (monthly, quarterly, or project options), Scalable (start small, grow as results show), No long contracts (month-to-month after initial 3-month commitment).',
    fact_type: 'pricing',
    category: 'pricing',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'high',
    verified: true,
    keywords: ['pricing philosophy', 'transparent', 'flexible', 'no contracts']
  },

  // ICP Facts
  {
    fact_text: 'Primary ICP: The Growth-Minded Entrepreneur - CEO/Founder/Business Owner of 5-50 employee companies with $500K-$5M annual revenue in B2B Services, SaaS, Professional Services, or E-commerce. Pain points: marketing feels like a black box, overwhelmed by AI hype, need CMO expertise but can\'t afford full-time. Goals: predictable lead generation, understand what\'s working, leverage AI authentically.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Ideal Customer Profile',
    source_type: 'manual_entry',
    confidence: 0.95,
    importance: 'critical',
    verified: true,
    keywords: ['ICP', 'target customer', 'entrepreneur', 'SMB', 'B2B']
  },
  {
    fact_text: 'Secondary ICP: The Overextended Marketing Manager - Marketing Manager/Director at 50-200 employee companies with $5M-$25M revenue in Manufacturing, Healthcare, Financial Services, or Technology. Pain points: team stretched thin, need specialized expertise, pressure to show ROI, boss wants AI but team lacks knowledge. Goals: extend team capabilities, implement AI efficiently, get executive buy-in with clear metrics.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Ideal Customer Profile',
    source_type: 'manual_entry',
    confidence: 0.95,
    importance: 'high',
    verified: true,
    keywords: ['ICP', 'marketing manager', 'director', 'mid-size company']
  },
  {
    fact_text: 'Tertiary ICP: The Utah Local Business Owner - Owner/GM of 1-20 employee local businesses with $250K-$2M revenue in Restaurants, Retail, Home Services (HVAC, Plumbing, Landscaping), or Health & Wellness. Pain points: no time for marketing, tried Google Ads with mediocre results, need local customers. Goals: more local bookings, dominate local search, work with someone who understands Utah market.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Ideal Customer Profile',
    source_type: 'manual_entry',
    confidence: 0.95,
    importance: 'high',
    verified: true,
    keywords: ['ICP', 'local business', 'Utah', 'home services', 'local SEO']
  },

  // Value Proposition Facts
  {
    fact_text: 'Unique Differentiator #1: Transparency Over Black Boxes - We show exactly what we\'re doing and why. No proprietary "secret sauce." Clients own all assets, accounts, and data. Monthly education sessions to empower client teams.',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['differentiator', 'transparency', 'education', 'ownership']
  },
  {
    fact_text: 'Unique Differentiator #2: AI as an Amplifier, Not a Replacement - We use AI to multiply marketing efforts, not replace human creativity. AI handles repetition, humans handle strategy. Brand voice stays authentic and human. Clients stay in control of growth.',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['AI', 'amplifier', 'human touch', 'authentic', 'control']
  },
  {
    fact_text: 'Unique Differentiator #3: Fractional CMO Expertise at Agency Pricing - Get C-level strategic guidance without $200K+ salary. Work directly with experienced marketers, not junior account managers. Strategic thinking + tactical execution in one package. Flexible engagement (monthly retainer, project-based, or hourly).',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['fractional CMO', 'expertise', 'strategy', 'flexible']
  },
  {
    fact_text: 'Unique Differentiator #4: Utah Roots, National Reach - Local Utah clients get in-person meetings and on-site collaboration. Deep understanding of Utah market dynamics. Serve clients nationwide with proven remote workflows. Timezone-friendly for US-based businesses.',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'high',
    verified: true,
    keywords: ['Utah', 'local', 'in-person', 'nationwide', 'remote']
  },
  {
    fact_text: 'Unique Differentiator #5: Built for Business Owners, Not Just Marketers - We speak business, not just marketing jargon. Focus on revenue and profit, not vanity metrics. Understand P&L impact, CAC, LTV. Partner in growth, not just a vendor.',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['business owners', 'ROI', 'revenue', 'partnership', 'results']
  },

  // Results/Proof Points
  {
    fact_text: 'Average client results: 3x ROI on digital marketing spend, 40% reduction in content creation time with AI, 85% client retention rate, 200% average increase in organic traffic within 6 months.',
    fact_type: 'testimonial',
    category: 'testimonials',
    source_type: 'manual_entry',
    confidence: 0.85,
    importance: 'high',
    verified: false,
    keywords: ['results', 'ROI', 'retention', 'traffic', 'proof']
  },
  {
    fact_text: 'Team expertise: Google Ads Certified, HubSpot Inbound Marketing Certified, technical expertise in modern JavaScript (React, Vite), AI APIs (OpenAI, Claude, Gemini), active contributors to open-source AI tools.',
    fact_type: 'team',
    category: 'team',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'medium',
    verified: true,
    keywords: ['certifications', 'expertise', 'technical', 'AI']
  },

  // Technology Stack
  {
    fact_text: 'Marketing technology stack: Custom React + Vite CMS, Google Analytics 4, Plausible Analytics, HubSpot CRM, HubSpot Marketing Automation, Mailchimp, Buffer for social media, Ahrefs and SEMrush for SEO, DataForSEO API integration.',
    fact_type: 'technical',
    category: 'technical',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'medium',
    verified: true,
    keywords: ['technology', 'tools', 'stack', 'CRM', 'analytics']
  },
  {
    fact_text: 'AI platforms utilized: OpenAI GPT-4 (content and chat), OpenAI GPT-Image-1 (image generation), Google Gemini 2.5 Flash (multimodal AI), Anthropic Claude Sonnet 4.5 (analysis), Replicate (custom AI models).',
    fact_type: 'technical',
    category: 'technical',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'medium',
    verified: true,
    keywords: ['AI', 'OpenAI', 'Gemini', 'Claude', 'GPT']
  },
  {
    fact_text: 'Development stack: React 18, Vite, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Netlify Functions (serverless), Netlify hosting with CDN, Cloudinary for media storage, Git + GitHub for version control.',
    fact_type: 'technical',
    category: 'technical',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'low',
    verified: true,
    keywords: ['development', 'React', 'Vite', 'Supabase', 'Netlify']
  },

  // Positioning & Messaging
  {
    fact_text: 'Positioning statement: "For growth-minded business owners who are overwhelmed by marketing complexity and skeptical of AI hype, Disruptors Media is the marketing partner that combines expert digital marketing with practical AI automation—delivered with complete transparency so you stay in control of your growth journey."',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['positioning', 'messaging', 'value proposition']
  },
  {
    fact_text: 'Core value proposition formula: Digital Marketing × AI Solutions = Predictable Growth',
    fact_type: 'value_proposition',
    category: 'company_info',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['value proposition', 'formula', 'growth']
  },

  // Content Strategy
  {
    fact_text: 'Content pillars: (1) AI for Business Owners, (2) Digital Marketing Best Practices, (3) Growth Strategies for SMBs, (4) Utah Business Community.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Content Strategy',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'medium',
    verified: true,
    keywords: ['content strategy', 'pillars', 'topics']
  },
  {
    fact_text: 'Publishing frequency: Blog posts 2-3 times per week, LinkedIn 3-5 posts per week, email newsletter weekly (Thursdays 9 AM MST), YouTube 1-2 videos per month, daily social media engagement.',
    fact_type: 'process',
    category: 'process',
    source_type: 'manual_entry',
    confidence: 0.95,
    importance: 'medium',
    verified: true,
    keywords: ['publishing', 'frequency', 'content calendar']
  },

  // SEO Keywords
  {
    fact_text: 'Primary SEO keywords (high priority): AI marketing automation, fractional CMO services, digital marketing agency Utah, Salt Lake City SEO, AI content generation, marketing automation for small business, PPC management Utah, social media marketing agency, AI-powered SEO, fractional chief marketing officer.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'SEO Strategy',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'high',
    verified: true,
    keywords: ['SEO', 'keywords', 'target keywords', 'search']
  },

  // Competitive Intelligence
  {
    fact_text: 'Main competitors: WebFX (large team, extensive case studies, but less personal and expensive), Disruptive Advertising (Utah-based PPC expertise but less AI focus), Ignite Visibility (award-winning but expensive with long contracts). Our differentiation: more transparent, more AI integration, more affordable, flexible contracts, local Utah accessibility.',
    fact_type: 'industry_insight',
    category: 'competitors',
    source_type: 'manual_entry',
    confidence: 0.9,
    importance: 'medium',
    verified: true,
    keywords: ['competitors', 'differentiation', 'competitive advantage']
  },

  // Core Values
  {
    fact_text: 'Core Value #1: Transparency First - We believe clients deserve to understand exactly what they\'re paying for and why it works.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Core Values',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['values', 'transparency', 'culture']
  },
  {
    fact_text: 'Core Value #2: Empower, Don\'t Replace - AI is a tool to amplify human creativity, not eliminate it. We teach, train, and transfer knowledge.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Core Values',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['values', 'empowerment', 'AI', 'education']
  },
  {
    fact_text: 'Core Value #3: Results Over Activity - We\'re measured on business impact, not the number of posts or reports we deliver.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Core Values',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'critical',
    verified: true,
    keywords: ['values', 'results', 'ROI', 'impact']
  },
  {
    fact_text: 'Core Value #4: Utah Community - We\'re proud to be part of the Utah business community and give back through mentorship and events.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Core Values',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'high',
    verified: true,
    keywords: ['values', 'community', 'Utah', 'giving back']
  },
  {
    fact_text: 'Core Value #5: Continuous Learning - Marketing and AI evolve rapidly. We stay ahead through constant learning and experimentation.',
    fact_type: 'custom',
    category: 'company_info',
    subcategory: 'Core Values',
    source_type: 'manual_entry',
    confidence: 1.0,
    importance: 'high',
    verified: true,
    keywords: ['values', 'learning', 'innovation', 'experimentation']
  }
];

// =====================================================
// BRAND RULES DATA
// =====================================================

const brandRules = [
  // Voice Rules
  {
    rule_category: 'voice',
    rule_type: 'Professional & Direct',
    rule_text: 'Our brand voice is professional but never stuffy. We\'re direct and clear, avoiding corporate jargon and unnecessary complexity. Think "trusted advisor" not "corporate consultant."',
    applies_to: ['blog', 'website', 'email', 'social', 'proposals'],
    priority: 10,
    good_examples: [
      'We\'ll be honest: AI isn\'t magic. It\'s a tool. Used right, it saves you 10 hours a week. Used wrong, it wastes your money.',
      'Here\'s what we actually do: We build marketing systems that work while you sleep.',
      'Most agencies hide behind reports. We show you the numbers that matter and explain what they mean.'
    ],
    bad_examples: [
      'We leverage cutting-edge synergies to optimize your digital transformation paradigm.',
      'Our proprietary methodology utilizes advanced algorithms to maximize ROI potential.'
    ],
    is_active: true
  },
  {
    rule_category: 'voice',
    rule_type: 'Empowering, Never Condescending',
    rule_text: 'We educate and empower, never talk down to our audience. Our clients are smart—they\'re just busy. We make complex marketing and AI concepts accessible without being patronizing.',
    applies_to: ['blog', 'website', 'email', 'social', 'educational'],
    priority: 10,
    good_examples: [
      'If you\'re confused by AI, you\'re not alone. It\'s overhyped and under-explained. Let\'s fix that.',
      'You don\'t need to become an SEO expert. You just need to understand enough to make smart decisions.',
      'Here\'s the thing nobody tells you about Facebook Ads: [insight that empowers]'
    ],
    bad_examples: [
      'Don\'t worry, we\'ll handle the complicated stuff—you wouldn\'t understand it anyway.',
      'Let the experts take care of this while you focus on what you\'re good at.',
      'It\'s too technical to explain, but trust us, it works.'
    ],
    is_active: true
  },
  {
    rule_category: 'voice',
    rule_type: 'Confident But Humble',
    rule_text: 'We\'re confident in our expertise but humble about what we don\'t know. We admit when we\'re wrong, when results take time, and when something isn\'t working.',
    applies_to: ['blog', 'website', 'proposals', 'case_studies'],
    priority: 9,
    good_examples: [
      'We\'ve done this 100+ times, and here\'s what usually works. But every business is different, so we\'ll test and adjust.',
      'This strategy failed for one of our clients last year. Here\'s what we learned and how we adapted.',
      'We\'re confident we can help, but we\'re not the right fit for everyone. Here\'s what to consider...'
    ],
    bad_examples: [
      'We guarantee 10x ROI in 30 days or your money back!',
      'We\'ve never had a campaign that didn\'t succeed.',
      'Our proprietary system is the best in the world.'
    ],
    is_active: true
  },
  {
    rule_category: 'voice',
    rule_type: 'Results-Focused, Not Activity-Focused',
    rule_text: 'We talk about business outcomes (revenue, leads, growth) not marketing activities (posts published, emails sent, reports delivered). We\'re measured on impact, not effort.',
    applies_to: ['blog', 'website', 'reports', 'case_studies', 'proposals'],
    priority: 10,
    good_examples: [
      'This campaign generated 47 qualified leads, 12 became customers, contributing $89K in revenue.',
      'Instead of 20 mediocre blog posts, we wrote 5 great ones that each brought 200+ visitors/month.',
      'We don\'t count "engagement." We count calls booked, demos scheduled, and deals closed.'
    ],
    bad_examples: [
      'We published 30 social media posts and sent 12 email campaigns this month!',
      'Our comprehensive 50-page report details all the tactics we implemented.',
      'We increased your follower count by 500!'
    ],
    is_active: true
  },

  // Tone Rules
  {
    rule_category: 'tone',
    rule_type: 'Conversational, Not Casual',
    rule_text: 'We use contractions, ask questions, and write like we talk. But we maintain professionalism—no slang, no memes in business contexts, no trying too hard to be "cool."',
    applies_to: ['blog', 'email', 'social'],
    priority: 8,
    good_examples: [
      'Here\'s the thing about SEO...',
      'We\'ve seen this before, and here\'s what works.',
      'Let\'s break this down step-by-step.'
    ],
    bad_examples: [
      'OMG, AI is literally the best thing ever! 🔥🔥🔥',
      'Yo fam, check out our sick marketing hacks!',
      'This one weird trick will blow your mind!'
    ],
    is_active: true
  },
  {
    rule_category: 'tone',
    rule_type: 'Educational, Not Preachy',
    rule_text: 'We teach useful skills and share insights, but we don\'t lecture or sound like a textbook. We share "here\'s what works" not "here\'s what you should do."',
    applies_to: ['blog', 'guides', 'tutorials', 'webinars'],
    priority: 9,
    good_examples: [
      'Three things we\'ve learned after running 500+ Facebook campaigns: [practical insights]',
      'Most people overthink keyword research. Here\'s a simpler approach.',
      'We tested 10 headline formulas. Here\'s what converted best.'
    ],
    bad_examples: [
      'You must follow these 47 steps in exactly this order or your marketing will fail.',
      'Anyone not using AI in 2025 is doomed to fail.',
      'If you\'re still doing [X], you\'re doing it wrong.'
    ],
    is_active: true
  },
  {
    rule_category: 'tone',
    rule_type: 'Optimistic But Realistic',
    rule_text: 'We\'re positive about possibilities but honest about effort, timelines, and challenges. No false promises or unrealistic expectations.',
    applies_to: ['blog', 'proposals', 'sales', 'website'],
    priority: 8,
    good_examples: [
      'Yes, AI can save you time. But it takes 2-3 months to set up properly.',
      'SEO works incredibly well—but it takes 4-6 months to see major results.',
      'This strategy has great potential, but here are the risks to consider...'
    ],
    bad_examples: [
      'Get rich quick with our secret marketing formula!',
      'Effortless growth with zero work required!',
      'Results guaranteed in 30 days or less!'
    ],
    is_active: true
  },

  // Style Rules
  {
    rule_category: 'style',
    rule_type: 'Short Sentences, Short Paragraphs',
    rule_text: 'We favor readability. Short sentences (10-20 words average). Short paragraphs (2-4 sentences). Bullet points for lists. White space for breathing.',
    applies_to: ['blog', 'website', 'email'],
    priority: 7,
    good_examples: [
      'AI content generation has a reputation problem. People think it\'s robotic, generic, and soulless.\n\nThey\'re not entirely wrong. Bad AI content is all of those things.\n\nBut here\'s what most people miss: AI is a tool. Like any tool, it\'s only as good as the person using it.'
    ],
    bad_examples: [
      'AI content generation has developed a somewhat undeserved reputation for producing output that many critics describe as robotic, generic, or lacking in authentic human voice, which, while not entirely without merit in certain contexts where the technology is misapplied or the prompts are poorly constructed, overlooks the fundamental reality that AI, much like any other tool in the marketer\'s arsenal, is ultimately only as effective as the expertise and thoughtfulness brought to bear by the human operator who crafts the prompts, reviews the output, and iterates toward quality results.'
    ],
    is_active: true
  },
  {
    rule_category: 'style',
    rule_type: 'Active Voice Over Passive Voice',
    rule_text: 'Use active voice whenever possible. It\'s clearer, more direct, and more engaging.',
    applies_to: ['blog', 'website', 'email', 'proposals'],
    priority: 7,
    good_examples: [
      'We generate leads (not "Leads are generated by us")',
      'Our AI tools save you time (not "Time is saved by our AI tools")',
      'We tested 10 headlines (not "10 headlines were tested")'
    ],
    bad_examples: [
      'Your marketing strategy will be analyzed by our team',
      'Results are delivered through our proprietary system',
      'Campaigns are managed by experienced professionals'
    ],
    is_active: true
  },
  {
    rule_category: 'style',
    rule_type: 'Specific Numbers Over Vague Claims',
    rule_text: 'Use precise numbers, dates, and data points instead of vague claims. Specificity builds credibility.',
    applies_to: ['blog', 'case_studies', 'reports', 'testimonials'],
    priority: 9,
    good_examples: [
      'We increased organic traffic by 247% in 6 months (not "massive traffic increase")',
      'Generated 89 qualified leads (not "lots of leads")',
      'Response rate improved from 1.2% to 4.7% (not "much better results")'
    ],
    bad_examples: [
      'Dramatic improvement in just a few months',
      'Significant increase in engagement',
      'Substantial ROI for our clients'
    ],
    is_active: true
  },
  {
    rule_category: 'style',
    rule_type: 'Headers That Tell, Not Tease',
    rule_text: 'Headers should communicate the key point, not create mystery. Scannable content wins.',
    applies_to: ['blog', 'website', 'email'],
    priority: 8,
    good_examples: [
      'AI Can\'t Replace Strategic Thinking (And That\'s Good)',
      'Why Most Facebook Ads Fail (And How to Fix It)',
      '3 SEO Mistakes That Cost You Rankings'
    ],
    bad_examples: [
      'You Won\'t Believe What Happened Next...',
      'The Secret to Marketing Success',
      'One Weird Trick for Better Results'
    ],
    is_active: true
  },

  // Lexicon Rules
  {
    rule_category: 'lexicon',
    rule_type: 'Brand-Specific Terms',
    rule_text: 'Use these terms consistently: "Marketing partner" (not vendor/agency), "AI automation" (not machine learning), "Fractional CMO" (not part-time marketing director), "Marketing system" (not stack), "Results" (not deliverables), "Growth journey" (not customer lifecycle), "Transparency" (core differentiator), "Empower" (not enable/facilitate).',
    applies_to: ['blog', 'website', 'email', 'proposals', 'social'],
    priority: 7,
    good_examples: [],
    bad_examples: [],
    is_active: true
  },
  {
    rule_category: 'lexicon',
    rule_type: 'Plain English Over Jargon',
    rule_text: 'When there\'s a simple word and a jargon word, choose the simple one. Use "use" instead of "leverage/utilize", "help" instead of "facilitate/enable", "improve" instead of "optimize/enhance" (unless technical), "buy" instead of "purchase/procure", "about" instead of "approximately/circa".',
    applies_to: ['blog', 'website', 'email', 'proposals', 'social'],
    priority: 9,
    good_examples: [
      'Use our platform to help your business improve',
      'Buy our services to help you grow'
    ],
    bad_examples: [
      'Leverage our synergies to optimize deliverables',
      'Utilize our platform to facilitate transformation',
      'Procure our services to enable digital maturity'
    ],
    is_active: true
  },
  {
    rule_category: 'lexicon',
    rule_type: 'Define Industry Terms',
    rule_text: 'When using industry terms, define them or provide context. Never assume everyone knows what they mean.',
    applies_to: ['blog', 'website', 'email', 'educational'],
    priority: 6,
    good_examples: [
      'SEO (search engine optimization)—basically, getting your website to show up on Google',
      'We\'ll improve your CTR (click-through rate)—that\'s the percentage of people who see your ad and actually click it',
      'ROI, or return on investment, measures how much revenue you get back for every dollar you spend on marketing'
    ],
    bad_examples: [
      'We\'ll optimize your CTR, CPC, and ROAS through advanced SEM tactics',
      'Our proprietary ML algorithms enhance your CRO via sophisticated AB testing protocols'
    ],
    is_active: true
  },

  // Taboos Rules
  {
    rule_category: 'taboos',
    rule_type: 'No Hype or Hyperbole',
    rule_text: 'Avoid exaggerated claims, superlatives, and hype. Forbidden phrases: Revolutionary, Game-changing, Best in the world, Guaranteed results, Explosive growth, Cutting-edge (unless specifically about new tech), Never seen before, Secret formula. We build trust through honesty, not excitement.',
    applies_to: ['blog', 'website', 'email', 'proposals', 'social'],
    priority: 10,
    good_examples: [],
    bad_examples: [
      'Revolutionary game-changing solution',
      'Best in the world with guaranteed results',
      'Explosive growth with our secret formula'
    ],
    is_active: true
  },
  {
    rule_category: 'taboos',
    rule_type: 'No "Trust Us" Without Proof',
    rule_text: 'Never ask readers to trust us without backing it up with evidence, examples, or logic. Forbidden: "Just trust us, we\'re the experts", "Our proprietary system works—we can\'t explain how", "You wouldn\'t understand the technical details", "All our clients see amazing results" (without specifics). Trust is earned through transparency, not demanded through authority.',
    applies_to: ['blog', 'website', 'email', 'proposals'],
    priority: 10,
    good_examples: [],
    bad_examples: [],
    is_active: true
  },
  {
    rule_category: 'taboos',
    rule_type: 'No Feature Dumping',
    rule_text: 'Don\'t list features without connecting them to benefits and outcomes. Nobody cares about what your service includes—they care about what it does for them. Always lead with the client\'s perspective: benefits, not features.',
    applies_to: ['website', 'proposals', 'sales'],
    priority: 8,
    good_examples: [
      'We keep your social media active (12 posts/month) so you don\'t have to',
      'We write 2 SEO blog posts per month that bring new visitors to your site',
      'You get clear monthly reports showing what\'s working and what\'s not'
    ],
    bad_examples: [
      'Our service includes: 12 social media posts per month, 2 blog articles, Monthly analytics report, Dedicated account manager'
    ],
    is_active: true
  },
  {
    rule_category: 'taboos',
    rule_type: 'No Corporate Clichés',
    rule_text: 'Avoid overused business phrases that mean nothing. Forbidden: Think outside the box, Low-hanging fruit, Move the needle, Circle back, Synergy, Best-in-class, Value-add, Next level, Take it offline, Leverage our core competencies. These phrases are lazy and meaningless.',
    applies_to: ['blog', 'website', 'email', 'proposals', 'social'],
    priority: 9,
    good_examples: [],
    bad_examples: [],
    is_active: true
  },
  {
    rule_category: 'taboos',
    rule_type: 'No Negativity Toward Competitors',
    rule_text: 'We differentiate by highlighting what we do well, not by trashing competitors. Be confident, not petty. Clients respect confidence, not mudslinging.',
    applies_to: ['website', 'proposals', 'sales', 'blog'],
    priority: 7,
    good_examples: [
      'Here\'s our approach: [specific methodology]. Not every agency works this way, but we\'ve found it delivers better results.',
      'We know you\'ve probably tried other agencies. Here\'s what we do differently: [specific differentiators]',
      'Some agencies focus on reports. We focus on results.'
    ],
    bad_examples: [
      'Unlike other agencies who scam you, we\'re honest',
      'Those other guys have no idea what they\'re doing',
      'We\'re the only agency that actually cares'
    ],
    is_active: true
  },
  {
    rule_category: 'taboos',
    rule_type: 'No Fake Urgency',
    rule_text: 'Don\'t manufacture urgency with countdown timers, "limited spots available," or false scarcity. If there\'s a real deadline, state it. Otherwise, don\'t manipulate. We build long-term relationships, not pressure sales.',
    applies_to: ['website', 'proposals', 'sales', 'email'],
    priority: 8,
    good_examples: [
      'We\'re booking projects for Q2. Want to discuss your needs?',
      'Our calendar fills up 6-8 weeks in advance. Let\'s chat about your timeline.',
      'If you want to launch by [specific date], we\'d need to start by [specific date].'
    ],
    bad_examples: [
      'Only 2 spots left this month! Act now!',
      'This offer expires in 3 hours!',
      'Limited time only—don\'t miss out!'
    ],
    is_active: true
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

    // Step 2: Clear existing facts (optional - comment out if you want to preserve)
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

    // Step 4: Clear existing brand rules (optional)
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

    // Step 6: Update brain stats
    console.log('📊 Step 6: Updating brain statistics...');

    const { error: updateStatsError } = await supabase
      .from('business_brains')
      .update({
        total_facts: insertedFacts.length,
        last_trained_at: new Date().toISOString(),
        last_enhanced_at: new Date().toISOString()
      })
      .eq('id', brainId);

    if (updateStatsError) throw updateStatsError;

    console.log('   ✅ Brain statistics updated\n');

    // Final Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ SUCCESS! Disruptors Media Business Brain & Brand DNA populated');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`📋 Summary:`);
    console.log(`   • Brain ID: ${brainId}`);
    console.log(`   • Brain Slug: ${businessBrainData.slug}`);
    console.log(`   • Brain Level: ${businessBrainData.brain_level}`);
    console.log(`   • Confidence Score: ${businessBrainData.confidence_score}`);
    console.log(`   • Total Facts: ${insertedFacts.length}`);
    console.log(`   • Brand Rules: ${insertedRules.length}`);
    console.log(`   • Fact Categories: ${[...new Set(brainFacts.map(f => f.category))].join(', ')}`);
    console.log(`   • Rule Categories: ${[...new Set(brandRules.map(r => r.rule_category))].join(', ')}`);
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
