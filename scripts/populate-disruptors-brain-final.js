/**
 * Populate Disruptors Media Business Brain and Brand DNA
 * (Final version matching actual database schema)
 *
 * Current Schema:
 * - brain_facts: id, brain_id, key, value, source, confidence, last_verified_at, created_at, updated_at, fts
 * - brand_rules: id, brain_id, rule_type, content, created_at, updated_at
 *
 * Usage: node scripts/populate-disruptors-brain-final.js
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
  description: 'Comprehensive business intelligence for Disruptors Media - a Utah-based digital marketing agency specializing in AI-powered marketing solutions. This brain contains all business knowledge, brand guidelines, services, pricing, ideal customers, and competitive positioning.'
};

// =====================================================
// BRAIN FACTS DATA (Current Schema: key/value pairs)
// =====================================================

const brainFacts = [
  // Company Info
  { key: 'company_name', value: 'Disruptors Media', source: 'Manual Entry', confidence: 1.0 },
  { key: 'company_tagline', value: 'Digital Marketing × AI Solutions', source: 'Manual Entry', confidence: 1.0 },
  { key: 'company_mission', value: 'We drive growth with expert digital marketing, then multiply results with AI for business. We\'re not here to replace you with AI—we\'re here to empower you with it.', source: 'Manual Entry', confidence: 1.0 },
  { key: 'company_industry', value: 'Digital Marketing & AI Automation', source: 'Manual Entry', confidence: 1.0 },
  { key: 'company_founded_year', value: 2020, source: 'Manual Entry', confidence: 1.0 },
  { key: 'company_size', value: '2-10 employees', source: 'Manual Entry', confidence: 1.0 },
  { key: 'company_location', value: JSON.stringify({ city: 'Salt Lake City', state: 'Utah', country: 'USA', service_areas: ['Utah (with in-person availability)', 'United States (nationwide)', 'Remote/Virtual worldwide'] }), source: 'Manual Entry', confidence: 1.0 },
  { key: 'company_website', value: 'https://disruptors.media', source: 'Manual Entry', confidence: 1.0 },
  { key: 'company_email', value: 'hello@disruptors.media', source: 'Manual Entry', confidence: 1.0 },

  // Services
  { key: 'services_ai_automation', value: JSON.stringify(['AI Content Generation', 'AI-Powered SEO', 'Workflow Automation', 'Lead Generation AI', 'ChatGPT Integration', 'AI Analytics']), source: 'Manual Entry', confidence: 1.0 },
  { key: 'services_digital_marketing', value: JSON.stringify(['SEO (Technical, on-page, link building)', 'PPC Advertising (Google, Facebook, LinkedIn)', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Conversion Rate Optimization']), source: 'Manual Entry', confidence: 1.0 },
  { key: 'services_web_development', value: JSON.stringify(['Custom Responsive Website Design', 'React/Vite Development', 'E-commerce (Shopify, WooCommerce)', 'Landing Pages', 'Website Maintenance']), source: 'Manual Entry', confidence: 1.0 },
  { key: 'services_fractional_cmo', value: JSON.stringify(['Marketing Strategy', 'Team Leadership', 'Budget Planning', 'Analytics & Reporting', 'Growth Planning']), source: 'Manual Entry', confidence: 1.0 },

  // Pricing
  { key: 'pricing_starter', value: JSON.stringify({ name: 'Digital Kickstart', range: '$2,000-$5,000/month', ideal_for: 'Small businesses starting digital journey' }), source: 'Manual Entry', confidence: 0.9 },
  { key: 'pricing_growth', value: JSON.stringify({ name: 'AI-Powered Growth', range: '$5,000-$10,000/month', ideal_for: 'Growing businesses ready to scale' }), source: 'Manual Entry', confidence: 0.9 },
  { key: 'pricing_enterprise', value: JSON.stringify({ name: 'Fractional CMO + AI Infrastructure', range: '$10,000-$25,000+/month', ideal_for: 'Established companies needing C-level leadership' }), source: 'Manual Entry', confidence: 0.9 },
  { key: 'pricing_philosophy', value: 'Transparent, Value-based, Flexible, Scalable, No long contracts (month-to-month after 3-month initial commitment)', source: 'Manual Entry', confidence: 1.0 },

  // Ideal Customer Profiles
  { key: 'icp_primary', value: JSON.stringify({ persona: 'Growth-Minded Entrepreneur', role: 'CEO/Founder/Owner', company_size: '5-50 employees', revenue: '$500K-$5M', industries: ['B2B Services', 'SaaS', 'Professional Services', 'E-commerce'] }), source: 'Manual Entry', confidence: 0.95 },
  { key: 'icp_secondary', value: JSON.stringify({ persona: 'Overextended Marketing Manager', role: 'Marketing Manager/Director', company_size: '50-200 employees', revenue: '$5M-$25M', industries: ['Manufacturing', 'Healthcare', 'Financial Services', 'Technology'] }), source: 'Manual Entry', confidence: 0.95 },
  { key: 'icp_tertiary', value: JSON.stringify({ persona: 'Utah Local Business Owner', role: 'Owner/GM', company_size: '1-20 employees', revenue: '$250K-$2M', industries: ['Restaurants', 'Retail', 'Home Services', 'Health & Wellness'] }), source: 'Manual Entry', confidence: 0.95 },

  // Value Propositions
  { key: 'differentiator_transparency', value: 'Transparency Over Black Boxes - We show exactly what we\'re doing and why. No secret sauce. Clients own all assets and data. Monthly education sessions.', source: 'Manual Entry', confidence: 1.0 },
  { key: 'differentiator_ai_amplifier', value: 'AI as Amplifier, Not Replacement - AI multiplies marketing efforts without replacing human creativity. AI handles repetition, humans handle strategy. Brand voice stays authentic.', source: 'Manual Entry', confidence: 1.0 },
  { key: 'differentiator_fractional_cmo', value: 'Fractional CMO Expertise at Agency Pricing - C-level strategy without $200K+ salary. Direct access to experienced marketers, not junior account managers.', source: 'Manual Entry', confidence: 1.0 },
  { key: 'differentiator_utah_roots', value: 'Utah Roots, National Reach - In-person meetings for Utah clients. Deep Utah market understanding. Nationwide service with proven remote workflows.', source: 'Manual Entry', confidence: 1.0 },
  { key: 'differentiator_business_focused', value: 'Built for Business Owners, Not Just Marketers - Speak business language. Focus on revenue/profit, not vanity metrics. Understand P&L, CAC, LTV.', source: 'Manual Entry', confidence: 1.0 },

  // Positioning
  { key: 'positioning_statement', value: 'For growth-minded business owners overwhelmed by marketing complexity and skeptical of AI hype, Disruptors Media is the marketing partner that combines expert digital marketing with practical AI automation—delivered with complete transparency so you stay in control.', source: 'Manual Entry', confidence: 1.0 },
  { key: 'value_prop_formula', value: 'Digital Marketing × AI Solutions = Predictable Growth', source: 'Manual Entry', confidence: 1.0 },

  // Results
  { key: 'average_results', value: JSON.stringify({ roi: '3x on marketing spend', time_savings: '40% reduction in content creation', retention: '85% client retention', traffic: '200% increase in organic traffic (6 months)' }), source: 'Manual Entry', confidence: 0.85 },

  // Brand Identity
  { key: 'brand_colors', value: JSON.stringify({ primary: '#FFD700', primary_name: 'Muted Gold', secondary: '#0E0E0E', secondary_name: 'Deep Black', accent: '#C7C7C7', accent_name: 'Soft Gray' }), source: 'Manual Entry', confidence: 1.0 },
  { key: 'brand_typography', value: JSON.stringify({ heading: 'Raleway, sans-serif', body: 'Inter, sans-serif', accent: 'Playfair Display, serif' }), source: 'Manual Entry', confidence: 1.0 },
  { key: 'brand_voice', value: JSON.stringify(['Professional & Direct', 'Innovative & Forward-Thinking', 'Empowering (not condescending)', 'Transparent & Honest']), source: 'Manual Entry', confidence: 1.0 },
  { key: 'brand_tone', value: JSON.stringify(['Confident but not arrogant', 'Educational without being preachy', 'Results-focused', 'Human-centric (AI is a tool)']), source: 'Manual Entry', confidence: 1.0 },

  // Content Strategy
  { key: 'content_pillars', value: JSON.stringify(['AI for Business Owners', 'Digital Marketing Best Practices', 'Growth Strategies for SMBs', 'Utah Business Community']), source: 'Manual Entry', confidence: 1.0 },
  { key: 'content_frequency', value: JSON.stringify({ blog: '2-3/week', linkedin: '3-5/week', email: 'Weekly (Thu 9AM MST)', youtube: '1-2/month', social: 'Daily' }), source: 'Manual Entry', confidence: 0.95 },

  // SEO
  { key: 'primary_keywords', value: JSON.stringify(['AI marketing automation', 'fractional CMO services', 'digital marketing agency Utah', 'Salt Lake City SEO', 'AI content generation', 'marketing automation for small business']), source: 'Manual Entry', confidence: 1.0 },

  // Competitors
  { key: 'main_competitors', value: JSON.stringify(['WebFX (large, expensive)', 'Disruptive Advertising (Utah PPC, less AI)', 'Ignite Visibility (award-winning, expensive contracts)']), source: 'Manual Entry', confidence: 0.9 },

  // Core Values
  { key: 'core_values', value: JSON.stringify(['Transparency First', 'Empower Don\'t Replace', 'Results Over Activity', 'Utah Community', 'Continuous Learning']), source: 'Manual Entry', confidence: 1.0 },

  // Technology
  { key: 'tech_stack', value: JSON.stringify({ cms: 'React+Vite', analytics: ['Google Analytics 4', 'Plausible'], crm: 'HubSpot', ai: ['OpenAI GPT-4', 'GPT-Image-1', 'Google Gemini', 'Claude Sonnet 4.5'] }), source: 'Manual Entry', confidence: 1.0 }
];

// =====================================================
// BRAND RULES DATA (Current Schema: rule_type, content)
// =====================================================

const brandRules = [
  // Voice Rules
  { rule_type: 'Voice: Professional & Direct', content: 'Our brand voice is professional but never stuffy. We\'re direct and clear, avoiding corporate jargon. Think "trusted advisor" not "corporate consultant." Example: "We\'ll be honest: AI isn\'t magic. It\'s a tool. Used right, it saves you 10 hours a week."' },
  { rule_type: 'Voice: Empowering, Never Condescending', content: 'We educate and empower, never talk down. Our clients are smart—just busy. We make complex topics accessible without being patronizing. Example: "If you\'re confused by AI, you\'re not alone. It\'s overhyped and under-explained. Let\'s fix that."' },
  { rule_type: 'Voice: Confident But Humble', content: 'We\'re confident in our expertise but humble about what we don\'t know. We admit when results take time or when something isn\'t working. Example: "We\'ve done this 100+ times, and here\'s what usually works. But every business is different, so we\'ll test and adjust."' },
  { rule_type: 'Voice: Results-Focused, Not Activity-Focused', content: 'We talk about business outcomes (revenue, leads, growth) not marketing activities (posts published, emails sent). We\'re measured on impact, not effort. Example: "This campaign generated 47 qualified leads, 12 became customers, contributing $89K in revenue."' },

  // Tone Rules
  { rule_type: 'Tone: Conversational, Not Casual', content: 'We use contractions, ask questions, write like we talk. But we maintain professionalism—no slang, no memes in business contexts. Example: "Here\'s the thing about SEO... We\'ve seen this before, and here\'s what works."' },
  { rule_type: 'Tone: Educational, Not Preachy', content: 'We teach useful skills and share insights, but don\'t lecture. We share "here\'s what works" not "here\'s what you should do." Example: "Most people overthink keyword research. Here\'s a simpler approach."' },
  { rule_type: 'Tone: Optimistic But Realistic', content: 'We\'re positive about possibilities but honest about effort, timelines, challenges. No false promises. Example: "Yes, AI can save you time. But it takes 2-3 months to set up properly. SEO works incredibly well—but takes 4-6 months to see major results."' },

  // Style Rules
  { rule_type: 'Style: Short Sentences, Short Paragraphs', content: 'Favor readability. Short sentences (10-20 words average). Short paragraphs (2-4 sentences). Bullet points for lists. White space for breathing. This makes content scannable and digestible.' },
  { rule_type: 'Style: Active Voice Over Passive Voice', content: 'Use active voice whenever possible. It\'s clearer, more direct, more engaging. Good: "We generate leads" (not "Leads are generated by us"). "Our AI tools save you time" (not "Time is saved by our AI tools").' },
  { rule_type: 'Style: Specific Numbers Over Vague Claims', content: 'Use precise numbers, dates, data points instead of vague claims. Specificity builds credibility. Good: "We increased organic traffic by 247% in 6 months" (not "massive traffic increase"). "Generated 89 qualified leads" (not "lots of leads").' },
  { rule_type: 'Style: Headers That Tell, Not Tease', content: 'Headers should communicate the key point, not create mystery. Scannable content wins. Good: "AI Can\'t Replace Strategic Thinking (And That\'s Good)". Bad: "You Won\'t Believe What Happened Next..."' },

  // Lexicon Rules
  { rule_type: 'Lexicon: Brand-Specific Terms', content: 'Use consistently: "Marketing partner" (not vendor/agency), "AI automation" (not machine learning), "Fractional CMO" (not part-time marketing director), "Marketing system" (not stack), "Results" (not deliverables), "Transparency" (core differentiator), "Empower" (not enable/facilitate).' },
  { rule_type: 'Lexicon: Plain English Over Jargon', content: 'Choose simple words: "Use" not "leverage/utilize", "Help" not "facilitate/enable", "Improve" not "optimize" (unless technical context), "Buy" not "purchase/procure", "About" not "approximately/circa".' },
  { rule_type: 'Lexicon: Define Industry Terms', content: 'When using industry terms, define them. Never assume everyone knows. Good: "SEO (search engine optimization)—basically, getting your website to show up on Google". "We\'ll improve your CTR (click-through rate)—that\'s the percentage of people who see your ad and actually click it".' },

  // Taboos Rules
  { rule_type: 'Taboo: No Hype or Hyperbole', content: 'Avoid exaggerated claims, superlatives. FORBIDDEN: Revolutionary, Game-changing, Best in the world, Guaranteed results, Explosive growth, Cutting-edge (unless specifically new tech), Never seen before, Secret formula. We build trust through honesty, not excitement.' },
  { rule_type: 'Taboo: No "Trust Us" Without Proof', content: 'Never ask readers to trust us without backing it up with evidence, examples, logic. FORBIDDEN: "Just trust us, we\'re the experts", "Our proprietary system works—we can\'t explain how", "You wouldn\'t understand the technical details". Trust is earned through transparency, not demanded through authority.' },
  { rule_type: 'Taboo: No Feature Dumping', content: 'Don\'t list features without connecting them to benefits and outcomes. Nobody cares what your service includes—they care what it does for them. Good: "We keep your social media active (12 posts/month) so you don\'t have to". Bad: "Our service includes 12 social media posts per month".' },
  { rule_type: 'Taboo: No Corporate Clichés', content: 'Avoid overused business phrases. FORBIDDEN: Think outside the box, Low-hanging fruit, Move the needle, Circle back, Synergy, Best-in-class, Value-add, Next level, Take it offline, Leverage our core competencies. These phrases are lazy and meaningless.' },
  { rule_type: 'Taboo: No Negativity Toward Competitors', content: 'We differentiate by highlighting what we do well, not by trashing competitors. Be confident, not petty. Good: "Here\'s our approach and why it works". Bad: "Unlike other agencies who scam you, we\'re honest".' },
  { rule_type: 'Taboo: No Fake Urgency', content: 'Don\'t manufacture urgency with countdown timers or false scarcity. If there\'s a real deadline, state it. Otherwise, don\'t manipulate. Good: "We\'re booking projects for Q2. Want to discuss?" Bad: "Only 2 spots left this month! Act now!"' }
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
    console.log('\n📖 Documentation created:');
    console.log('   • docs/DISRUPTORS_MEDIA_BUSINESS_BRAIN.md');
    console.log('   • docs/DISRUPTORS_MEDIA_BRAND_DNA.md');
    console.log('\n🎉 Access this data in Admin Nexus:');
    console.log('   • Business Brain Builder: /admin/secret → Business Brain Builder');
    console.log('   • Brand DNA Builder: /admin/secret → Brand DNA Builder');
    console.log('\n💡 Next Steps:');
    console.log('   • Review the populated data in Admin Nexus');
    console.log('   • Test AI content generation with the new brain context');
    console.log('   • Add more specific facts as needed for your use cases\n');

  } catch (error) {
    console.error('\n❌ ERROR during population:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
populateDisruptorsBrain();
