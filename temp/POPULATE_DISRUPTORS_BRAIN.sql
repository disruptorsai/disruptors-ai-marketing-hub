-- =====================================================
-- Populate Disruptors Media Business Brain & Brand DNA
-- =====================================================
-- Run this SQL directly in Supabase SQL Editor
--
-- This will:
-- 1. Drop incompatible triggers from enhanced schema
-- 2. Clear existing Disruptors Media brain data
-- 3. Insert 38 brain facts
-- 4. Insert 20 brand rules
--
-- Time to execute: ~5 seconds
-- =====================================================

-- Drop triggers and functions that reference columns not in current schema
-- Using CASCADE to automatically drop dependent triggers
DROP FUNCTION IF EXISTS update_brain_stats() CASCADE;
DROP FUNCTION IF EXISTS calculate_brain_confidence(UUID) CASCADE;

-- Get the brain_id for disruptors-media
DO $$
DECLARE
  v_brain_id UUID;
BEGIN
  -- Get or create the business brain
  SELECT id INTO v_brain_id
  FROM business_brains
  WHERE slug = 'disruptors-media';

  IF v_brain_id IS NULL THEN
    INSERT INTO business_brains (slug, name, description)
    VALUES (
      'disruptors-media',
      'Disruptors Media Business Brain',
      'Comprehensive business intelligence for Disruptors Media - a Utah-based digital marketing agency specializing in AI-powered marketing solutions.'
    )
    RETURNING id INTO v_brain_id;
  ELSE
    UPDATE business_brains
    SET
      name = 'Disruptors Media Business Brain',
      description = 'Comprehensive business intelligence for Disruptors Media - a Utah-based digital marketing agency specializing in AI-powered marketing solutions.',
      updated_at = NOW()
    WHERE id = v_brain_id;
  END IF;

  -- Clear existing facts and rules for this brain
  DELETE FROM brain_facts WHERE brain_id = v_brain_id;
  DELETE FROM brand_rules WHERE brain_id = v_brain_id;

  -- Insert Brain Facts
  INSERT INTO brain_facts (brain_id, key, value, source, confidence) VALUES
  -- Company Info
  (v_brain_id, 'company_name', '"Disruptors Media"', 'Manual Entry', 1.0),
  (v_brain_id, 'company_tagline', '"Digital Marketing × AI Solutions"', 'Manual Entry', 1.0),
  (v_brain_id, 'company_mission', '"We drive growth with expert digital marketing, then multiply results with AI for business. We''re not here to replace you with AI—we''re here to empower you with it."', 'Manual Entry', 1.0),
  (v_brain_id, 'company_industry', '"Digital Marketing & AI Automation"', 'Manual Entry', 1.0),
  (v_brain_id, 'company_founded_year', '2020', 'Manual Entry', 1.0),
  (v_brain_id, 'company_size', '"2-10 employees"', 'Manual Entry', 1.0),
  (v_brain_id, 'company_location', '{"city":"Salt Lake City","state":"Utah","country":"USA","service_areas":["Utah (with in-person availability)","United States (nationwide)","Remote/Virtual worldwide"]}'::jsonb, 'Manual Entry', 1.0),
  (v_brain_id, 'company_website', '"https://disruptors.media"', 'Manual Entry', 1.0),
  (v_brain_id, 'company_email', '"hello@disruptors.media"', 'Manual Entry', 1.0),

  -- Services
  (v_brain_id, 'services_ai_automation', '["AI Content Generation","AI-Powered SEO","Workflow Automation","Lead Generation AI","ChatGPT Integration","AI Analytics"]'::jsonb, 'Manual Entry', 1.0),
  (v_brain_id, 'services_digital_marketing', '["SEO (Technical, on-page, link building)","PPC Advertising (Google, Facebook, LinkedIn)","Social Media Marketing","Content Marketing","Email Marketing","Conversion Rate Optimization"]'::jsonb, 'Manual Entry', 1.0),
  (v_brain_id, 'services_web_development', '["Custom Responsive Website Design","React/Vite Development","E-commerce (Shopify, WooCommerce)","Landing Pages","Website Maintenance"]'::jsonb, 'Manual Entry', 1.0),
  (v_brain_id, 'services_fractional_cmo', '["Marketing Strategy","Team Leadership","Budget Planning","Analytics & Reporting","Growth Planning"]'::jsonb, 'Manual Entry', 1.0),

  -- Pricing
  (v_brain_id, 'pricing_starter', '{"name":"Digital Kickstart","range":"$2,000-$5,000/month","ideal_for":"Small businesses starting digital journey"}'::jsonb, 'Manual Entry', 0.9),
  (v_brain_id, 'pricing_growth', '{"name":"AI-Powered Growth","range":"$5,000-$10,000/month","ideal_for":"Growing businesses ready to scale"}'::jsonb, 'Manual Entry', 0.9),
  (v_brain_id, 'pricing_enterprise', '{"name":"Fractional CMO + AI Infrastructure","range":"$10,000-$25,000+/month","ideal_for":"Established companies needing C-level leadership"}'::jsonb, 'Manual Entry', 0.9),
  (v_brain_id, 'pricing_philosophy', '"Transparent, Value-based, Flexible, Scalable, No long contracts (month-to-month after 3-month initial commitment)"', 'Manual Entry', 1.0),

  -- Ideal Customer Profiles
  (v_brain_id, 'icp_primary', '{"persona":"Growth-Minded Entrepreneur","role":"CEO/Founder/Owner","company_size":"5-50 employees","revenue":"$500K-$5M","industries":["B2B Services","SaaS","Professional Services","E-commerce"]}'::jsonb, 'Manual Entry', 0.95),
  (v_brain_id, 'icp_secondary', '{"persona":"Overextended Marketing Manager","role":"Marketing Manager/Director","company_size":"50-200 employees","revenue":"$5M-$25M","industries":["Manufacturing","Healthcare","Financial Services","Technology"]}'::jsonb, 'Manual Entry', 0.95),
  (v_brain_id, 'icp_tertiary', '{"persona":"Utah Local Business Owner","role":"Owner/GM","company_size":"1-20 employees","revenue":"$250K-$2M","industries":["Restaurants","Retail","Home Services","Health & Wellness"]}'::jsonb, 'Manual Entry', 0.95),

  -- Value Propositions
  (v_brain_id, 'differentiator_transparency', '"Transparency Over Black Boxes - We show exactly what we''re doing and why. No secret sauce. Clients own all assets and data. Monthly education sessions."', 'Manual Entry', 1.0),
  (v_brain_id, 'differentiator_ai_amplifier', '"AI as Amplifier, Not Replacement - AI multiplies marketing efforts without replacing human creativity. AI handles repetition, humans handle strategy. Brand voice stays authentic."', 'Manual Entry', 1.0),
  (v_brain_id, 'differentiator_fractional_cmo', '"Fractional CMO Expertise at Agency Pricing - C-level strategy without $200K+ salary. Direct access to experienced marketers, not junior account managers."', 'Manual Entry', 1.0),
  (v_brain_id, 'differentiator_utah_roots', '"Utah Roots, National Reach - In-person meetings for Utah clients. Deep Utah market understanding. Nationwide service with proven remote workflows."', 'Manual Entry', 1.0),
  (v_brain_id, 'differentiator_business_focused', '"Built for Business Owners, Not Just Marketers - Speak business language. Focus on revenue/profit, not vanity metrics. Understand P&L, CAC, LTV."', 'Manual Entry', 1.0),

  -- Positioning
  (v_brain_id, 'positioning_statement', '"For growth-minded business owners overwhelmed by marketing complexity and skeptical of AI hype, Disruptors Media is the marketing partner that combines expert digital marketing with practical AI automation—delivered with complete transparency so you stay in control."', 'Manual Entry', 1.0),
  (v_brain_id, 'value_prop_formula', '"Digital Marketing × AI Solutions = Predictable Growth"', 'Manual Entry', 1.0),

  -- Results
  (v_brain_id, 'average_results', '{"roi":"3x on marketing spend","time_savings":"40% reduction in content creation","retention":"85% client retention","traffic":"200% increase in organic traffic (6 months)"}'::jsonb, 'Manual Entry', 0.85),

  -- Brand Identity
  (v_brain_id, 'brand_colors', '{"primary":"#FFD700","primary_name":"Muted Gold","secondary":"#0E0E0E","secondary_name":"Deep Black","accent":"#C7C7C7","accent_name":"Soft Gray"}'::jsonb, 'Manual Entry', 1.0),
  (v_brain_id, 'brand_typography', '{"heading":"Raleway, sans-serif","body":"Inter, sans-serif","accent":"Playfair Display, serif"}'::jsonb, 'Manual Entry', 1.0),
  (v_brain_id, 'brand_voice', '["Professional & Direct","Innovative & Forward-Thinking","Empowering (not condescending)","Transparent & Honest"]'::jsonb, 'Manual Entry', 1.0),
  (v_brain_id, 'brand_tone', '["Confident but not arrogant","Educational without being preachy","Results-focused","Human-centric (AI is a tool)"]'::jsonb, 'Manual Entry', 1.0),

  -- Content Strategy
  (v_brain_id, 'content_pillars', '["AI for Business Owners","Digital Marketing Best Practices","Growth Strategies for SMBs","Utah Business Community"]'::jsonb, 'Manual Entry', 1.0),
  (v_brain_id, 'content_frequency', '{"blog":"2-3/week","linkedin":"3-5/week","email":"Weekly (Thu 9AM MST)","youtube":"1-2/month","social":"Daily"}'::jsonb, 'Manual Entry', 0.95),

  -- SEO
  (v_brain_id, 'primary_keywords', '["AI marketing automation","fractional CMO services","digital marketing agency Utah","Salt Lake City SEO","AI content generation","marketing automation for small business"]'::jsonb, 'Manual Entry', 1.0),

  -- Competitors
  (v_brain_id, 'main_competitors', '["WebFX (large, expensive)","Disruptive Advertising (Utah PPC, less AI)","Ignite Visibility (award-winning, expensive contracts)"]'::jsonb, 'Manual Entry', 0.9),

  -- Core Values
  (v_brain_id, 'core_values', '["Transparency First","Empower Don''t Replace","Results Over Activity","Utah Community","Continuous Learning"]'::jsonb, 'Manual Entry', 1.0),

  -- Technology
  (v_brain_id, 'tech_stack', '{"cms":"React+Vite","analytics":["Google Analytics 4","Plausible"],"crm":"HubSpot","ai":["OpenAI GPT-4","GPT-Image-1","Google Gemini","Claude Sonnet 4.5"]}'::jsonb, 'Manual Entry', 1.0);

  -- Insert Brand Rules
  -- Using proper schema: rule_type (must be: voice, tone, style, lexicon, taboos, examples)
  -- Content is JSONB containing rule details
  INSERT INTO brand_rules (brain_id, rule_type, content) VALUES

  -- Voice Rules (4 rules)
  (v_brain_id, 'voice', '{"title":"Professional & Direct","description":"Our brand voice is professional but never stuffy. We are direct and clear, avoiding corporate jargon. Think trusted advisor not corporate consultant.","example":"We will be honest: AI is not magic. It is a tool. Used right, it saves you 10 hours a week."}'::jsonb),
  (v_brain_id, 'voice', '{"title":"Empowering, Never Condescending","description":"We educate and empower, never talk down. Our clients are smart—just busy. We make complex topics accessible without being patronizing.","example":"If you are confused by AI, you are not alone. It is overhyped and under-explained. Let us fix that."}'::jsonb),
  (v_brain_id, 'voice', '{"title":"Confident But Humble","description":"We are confident in our expertise but humble about what we do not know. We admit when results take time or when something is not working.","example":"We have done this 100+ times, and here is what usually works. But every business is different, so we will test and adjust."}'::jsonb),
  (v_brain_id, 'voice', '{"title":"Results-Focused, Not Activity-Focused","description":"We talk about business outcomes (revenue, leads, growth) not marketing activities (posts published, emails sent). We are measured on impact, not effort.","example":"This campaign generated 47 qualified leads, 12 became customers, contributing $89K in revenue."}'::jsonb),

  -- Tone Rules (3 rules)
  (v_brain_id, 'tone', '{"title":"Conversational, Not Casual","description":"We use contractions, ask questions, write like we talk. But we maintain professionalism—no slang, no memes in business contexts.","example":"Here is the thing about SEO... We have seen this before, and here is what works."}'::jsonb),
  (v_brain_id, 'tone', '{"title":"Educational, Not Preachy","description":"We teach useful skills and share insights, but do not lecture. We share here is what works not here is what you should do.","example":"Most people overthink keyword research. Here is a simpler approach."}'::jsonb),
  (v_brain_id, 'tone', '{"title":"Optimistic But Realistic","description":"We are positive about possibilities but honest about effort, timelines, challenges. No false promises.","example":"Yes, AI can save you time. But it takes 2-3 months to set up properly. SEO works incredibly well—but takes 4-6 months to see major results."}'::jsonb),

  -- Style Rules (4 rules)
  (v_brain_id, 'style', '{"title":"Short Sentences, Short Paragraphs","description":"Favor readability. Short sentences (10-20 words average). Short paragraphs (2-4 sentences). Bullet points for lists. White space for breathing. This makes content scannable and digestible."}'::jsonb),
  (v_brain_id, 'style', '{"title":"Active Voice Over Passive Voice","description":"Use active voice whenever possible. It is clearer, more direct, more engaging.","good":"We generate leads (not Leads are generated by us). Our AI tools save you time (not Time is saved by our AI tools)."}'::jsonb),
  (v_brain_id, 'style', '{"title":"Specific Numbers Over Vague Claims","description":"Use precise numbers, dates, data points instead of vague claims. Specificity builds credibility.","good":"We increased organic traffic by 247% in 6 months (not massive traffic increase). Generated 89 qualified leads (not lots of leads)."}'::jsonb),
  (v_brain_id, 'style', '{"title":"Headers That Tell, Not Tease","description":"Headers should communicate the key point, not create mystery. Scannable content wins.","good":"AI Cannot Replace Strategic Thinking (And That is Good)","bad":"You Will Not Believe What Happened Next..."}'::jsonb),

  -- Lexicon Rules (3 rules)
  (v_brain_id, 'lexicon', '{"title":"Brand-Specific Terms","use_consistently":["Marketing partner (not vendor/agency)","AI automation (not machine learning)","Fractional CMO (not part-time marketing director)","Marketing system (not stack)","Results (not deliverables)","Transparency (core differentiator)","Empower (not enable/facilitate)"]}'::jsonb),
  (v_brain_id, 'lexicon', '{"title":"Plain English Over Jargon","simple_words":{"use":"not leverage/utilize","help":"not facilitate/enable","improve":"not optimize (unless technical context)","buy":"not purchase/procure","about":"not approximately/circa"}}'::jsonb),
  (v_brain_id, 'lexicon', '{"title":"Define Industry Terms","description":"When using industry terms, define them. Never assume everyone knows.","example":"SEO (search engine optimization)—basically, getting your website to show up on Google. We will improve your CTR (click-through rate)—that is the percentage of people who see your ad and actually click it."}'::jsonb),

  -- Taboos Rules (6 rules)
  (v_brain_id, 'taboos', '{"title":"No Hype or Hyperbole","description":"Avoid exaggerated claims, superlatives.","forbidden":["Revolutionary","Game-changing","Best in the world","Guaranteed results","Explosive growth","Cutting-edge (unless specifically new tech)","Never seen before","Secret formula"],"why":"We build trust through honesty, not excitement."}'::jsonb),
  (v_brain_id, 'taboos', '{"title":"No Trust Us Without Proof","description":"Never ask readers to trust us without backing it up with evidence, examples, logic.","forbidden":["Just trust us, we are the experts","Our proprietary system works—we cannot explain how","You would not understand the technical details"],"why":"Trust is earned through transparency, not demanded through authority."}'::jsonb),
  (v_brain_id, 'taboos', '{"title":"No Feature Dumping","description":"Do not list features without connecting them to benefits and outcomes. Nobody cares what your service includes—they care what it does for them.","good":"We keep your social media active (12 posts/month) so you do not have to.","bad":"Our service includes 12 social media posts per month."}'::jsonb),
  (v_brain_id, 'taboos', '{"title":"No Corporate Clichés","description":"Avoid overused business phrases.","forbidden":["Think outside the box","Low-hanging fruit","Move the needle","Circle back","Synergy","Best-in-class","Value-add","Next level","Take it offline","Leverage our core competencies"],"why":"These phrases are lazy and meaningless."}'::jsonb),
  (v_brain_id, 'taboos', '{"title":"No Negativity Toward Competitors","description":"We differentiate by highlighting what we do well, not by trashing competitors. Be confident, not petty.","good":"Here is our approach and why it works.","bad":"Unlike other agencies who scam you, we are honest."}'::jsonb),
  (v_brain_id, 'taboos', '{"title":"No Fake Urgency","description":"Do not manufacture urgency with countdown timers or false scarcity. If there is a real deadline, state it. Otherwise, do not manipulate.","good":"We are booking projects for Q2. Want to discuss?","bad":"Only 2 spots left this month! Act now!"}'::jsonb);

  RAISE NOTICE '✅ SUCCESS! Populated % brain facts and % brand rules for Disruptors Media',
    (SELECT COUNT(*) FROM brain_facts WHERE brain_id = v_brain_id),
    (SELECT COUNT(*) FROM brand_rules WHERE brain_id = v_brain_id);

END $$;

-- Verify the data
SELECT
  'Brain Facts' as table_name,
  COUNT(*) as row_count
FROM brain_facts
WHERE brain_id = (SELECT id FROM business_brains WHERE slug = 'disruptors-media')
UNION ALL
SELECT
  'Brand Rules' as table_name,
  COUNT(*) as row_count
FROM brand_rules
WHERE brain_id = (SELECT id FROM business_brains WHERE slug = 'disruptors-media');

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- This script dropped the following triggers/functions because they
-- reference columns (is_current, etc.) that don't exist in the current schema:
--   - update_brain_stats_trigger
--   - update_brain_stats()
--   - calculate_brain_confidence()
--
-- These will be recreated when you apply the full Business Brain
-- enhanced migration: supabase/migrations/20250107_business_brain_infrastructure.sql
--
-- For now, the Business Brain will work perfectly without these triggers.
-- They're only needed for advanced features like versioning and auto-stats.
-- =====================================================
