# Business Brain-Powered App Ecosystem

**Version**: 1.0.0
**Date**: January 2025
**Purpose**: Complete app architecture leveraging Business Brain for hyper-personalized AI experiences

---

## Executive Summary

The **Business Brain** serves as the central nervous system powering an entire ecosystem of AI tools. Every registered business gets their own brain, which is continuously learning and adapting to provide increasingly personalized outputs across all applications.

### Core Apps to Build

1. **AI Content Writer** - Blog/article generation (Base44 rebuild)
2. **Business Brain Manager** - Brain visualization, editing, training, integrations
3. **Social Media Generator** - Platform-specific post creation
4. **AI Image Studio** - Brand-consistent image generation
5. **Email Campaign Writer** - Personalized email sequences
6. **SEO Content Optimizer** - Real-time optimization suggestions
7. **Video Script Writer** - YouTube, TikTok, Instagram scripts
8. **Ad Copy Generator** - Google Ads, Facebook Ads, LinkedIn Ads
9. **Landing Page Builder** - AI-powered page generation
10. **Chatbot Configurator** - Custom AI chatbots for client websites

---

## Table of Contents

1. [AI Content Writer](#1-ai-content-writer)
2. [Business Brain Manager](#2-business-brain-manager)
3. [Social Media Generator](#3-social-media-generator)
4. [AI Image Studio](#4-ai-image-studio)
5. [Email Campaign Writer](#5-email-campaign-writer)
6. [SEO Content Optimizer](#6-seo-content-optimizer)
7. [Video Script Writer](#7-video-script-writer)
8. [Ad Copy Generator](#8-ad-copy-generator)
9. [Landing Page Builder](#9-landing-page-builder)
10. [Chatbot Configurator](#10-chatbot-configurator)
11. [Integration Framework](#integration-framework)
12. [Shared Components](#shared-components)
13. [Implementation Priority](#implementation-priority)

---

## 1. AI Content Writer

**Location**: `/tools/ai-content-writer`

**Purpose**: Generate SEO-optimized blog articles and long-form content with business-specific knowledge and brand voice.

### Features (Base44 Feature Parity + Enhancements)

#### Title Generation
- ✅ Generate 5 SEO-optimized titles per request
- ✅ Power words integration ("Ultimate Guide", "Complete", "Expert")
- ✅ Business Brain keyword integration
- ✅ Industry-specific title patterns
- **NEW**: A/B testing suggestions with predicted CTR

#### Article Generation
- ✅ 1500-1800 word minimum enforcement
- ✅ Mandatory 5 FAQ section
- ✅ Structured content (6-8 H2 sections)
- ✅ Real-time word count
- ✅ ReactQuill WYSIWYG editor
- **NEW**: Real-time SEO score (Yoast-style)
- **NEW**: Auto-internal linking to existing posts
- **NEW**: Competitor content gap analysis

#### Auto-Markdown Conversion
- ✅ Detects pasted markdown
- ✅ LLM-powered conversion to rich HTML
- ✅ Preserves formatting integrity

#### Publishing Workflow
- ✅ 5-status system: Draft → Needs Review → Approved → Scheduled → Published
- ✅ Calendar-based scheduling
- ✅ SEO metadata editor
- ✅ Editorial notes field
- **NEW**: Multi-platform publishing (WordPress, Medium, LinkedIn)

### Business Brain Integration

**Prompt Enhancement**:
```javascript
const systemPrompt = `
You are an expert SEO content writer for ${brain.business_name}.

BRAND IDENTITY:
- Industry: ${brain.industry}
- Target Audience: ${brain.ideal_customer_profile[0].persona_name}
- Value Proposition: ${brain.messaging_framework.value_proposition}

BRAND VOICE (from brain_facts + brand_rules):
${brandRules.filter(r => r.category === 'voice').map(r => r.rule_text).join('\n')}

SERVICES TO MENTION:
${brain_facts.filter(f => f.category === 'services').map(f => f.value.name).join(', ')}

COMPETITORS TO DIFFERENTIATE FROM:
${brain.competitors.map(c => c.name).join(', ')}

PRIMARY KEYWORDS (from Business Brain):
${brain.primary_keywords.join(', ')}

ACTUAL CUSTOMER TESTIMONIALS:
${brain_facts.filter(f => f.category === 'testimonials').map(f => f.value).join('\n')}
`
```

### UI Components

```
/tools/ai-content-writer
├── TitleGenerator.jsx          (5 AI-generated titles)
├── ArticleGenerator.jsx        (Full article with ReactQuill)
├── PostEditorModal.jsx         (Edit + SEO optimization)
├── PostLibrary.jsx             (Search/filter/sort posts)
├── ContentCalendar.jsx         (Schedule posts)
├── SEOScorePanel.jsx           (Real-time SEO analysis) [NEW]
└── PublishingModal.jsx         (Multi-platform publish) [NEW]
```

### Database Schema

**Reuses existing**:
- `posts` table (enhanced with Business Brain fields)
- `post_brain_facts` junction table
- `brain_facts` for knowledge injection

---

## 2. Business Brain Manager

**Location**: `/tools/business-brain-manager`

**Purpose**: Central hub for viewing, editing, training, and managing your Business Brain.

### Core Features

#### 1. Brain Dashboard
**Visual health overview**:
- Brain health score (0-100%)
- Total facts count
- Confidence level
- Last updated timestamp
- Verification status

**Metrics Display**:
```
┌─────────────────────────────────────────┐
│   Business Brain Health: 87%            │
├─────────────────────────────────────────┤
│  📊 Total Facts: 247                    │
│  ✅ Verified: 189 (76%)                 │
│  🎯 Confidence: 0.87                    │
│  🔄 Last Updated: 2 days ago            │
│  📈 Content Generated: 42 pieces        │
└─────────────────────────────────────────┘
```

#### 2. Fact Explorer & Editor
**Searchable fact database**:
- Full-text search across all facts
- Filter by category, confidence, source
- Inline editing with version history
- Bulk import/export (CSV, JSON)
- AI-suggested fact improvements

**UI Pattern**:
```
Category Tabs: [Company Info] [Services] [Pricing] [Team] [Testimonials] [FAQ]

Search: [🔍 Search facts...]  Filters: [Category ▼] [Confidence ▼] [Source ▼]

┌────────────────────────────────────────────────────────┐
│ 🏢 company_name                        Confidence: 95% │
│ Value: "Acme HVAC Solutions"                          │
│ Source: Website scrape (2025-01-10)                   │
│ Used in 12 content pieces                             │
│ [Edit] [Verify] [Delete]                              │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 💼 service_emergency_repair            Confidence: 89% │
│ Value: {"name": "24/7 Emergency Repair",               │
│         "available": true, "price": "$150 service call"}│
│ Source: AI conversation (2025-01-12)                   │
│ Needs verification ⚠️                                   │
│ [Edit] [Verify] [Delete]                              │
└────────────────────────────────────────────────────────┘
```

#### 3. Brand Voice Lab
**Test and refine brand voice**:
- Side-by-side comparison of different voice settings
- Live preview of content generation
- A/B test voice variations
- Import voice from competitor analysis

**Interactive Voice Builder**:
```
┌─────────────────────────────────────────────────┐
│ Brand Voice Configuration                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ Tone: [Professional] [Friendly] [Bold]         │
│       [Technical] [Casual] [Authoritative]     │
│                                                 │
│ Writing Style:                                  │
│ ○ Concise & Direct                             │
│ ● Detailed & Educational                       │
│ ○ Conversational & Story-driven                │
│                                                 │
│ Avoid:                                          │
│ ☑ Industry jargon                              │
│ ☑ Passive voice                                │
│ ☐ Contractions                                 │
│                                                 │
│ [Test Voice] [Save Changes]                    │
└─────────────────────────────────────────────────┘

Live Preview:
┌─────────────────────────────────────────────────┐
│ "When your HVAC system breaks down in the      │
│  middle of summer, you need reliable help fast.│
│  Our 24/7 emergency repair team is standing by │
│  to restore your comfort within hours, not days."│
└─────────────────────────────────────────────────┘
```

#### 4. Knowledge Ingestion Hub
**Multi-source data import**:

**Web Scraping**:
- Re-scan website on demand
- Schedule automatic re-scans (weekly/monthly)
- Select specific pages to scrape
- View scraping history and changes

**File Uploads**:
- Drag-and-drop brand guidelines (PDF, DOCX)
- OCR text extraction
- Auto-categorize uploaded facts
- Support for: contracts, proposals, case studies

**API Integrations** (See Integration Framework):
- Google Analytics (traffic data, top pages)
- HubSpot/Salesforce (CRM data, deal history)
- Mailchimp (email performance)
- Social media APIs (engagement metrics)
- Review platforms (Google, Yelp testimonials)

**Manual Entry**:
- Quick-add fact form
- Bulk CSV upload
- Voice-to-text fact capture (future)

#### 5. AI Training Playground
**Interactive training sessions**:
- Chat with your brain to teach it nuances
- Correct AI misunderstandings
- Add examples of good vs. bad content
- Rate AI-generated outputs to improve

**Training UI**:
```
┌─────────────────────────────────────────────────┐
│ Train Your Business Brain                       │
├─────────────────────────────────────────────────┤
│ Assistant: What services does your business     │
│            offer in the commercial sector?      │
│                                                 │
│ You: We do commercial HVAC installation and    │
│      maintenance contracts for office buildings,│
│      retail stores, and warehouses. We also    │
│      offer emergency 24/7 service.              │
│                                                 │
│ [✓ Fact extracted: commercial_services]        │
│ [✓ Fact extracted: emergency_availability]     │
│                                                 │
│ Assistant: Thanks! I've added those details.   │
│            Do you have minimum contract sizes?  │
└─────────────────────────────────────────────────┘
```

#### 6. Integrations Manager
**Connect third-party data sources**:

**Available Integrations**:
- 🔗 **Google Analytics** - Import traffic data, top pages
- 🔗 **Google My Business** - Import reviews, Q&A, photos
- 🔗 **HubSpot** - Sync CRM data, contact properties
- 🔗 **Salesforce** - Import deals, customer data
- 🔗 **Mailchimp** - Email campaign performance
- 🔗 **Facebook/Instagram** - Social media insights
- 🔗 **LinkedIn** - Company page analytics
- 🔗 **Yelp/Google Reviews** - Aggregate testimonials
- 🔗 **Shopify/WooCommerce** - Product catalog, sales data
- 🔗 **Stripe** - Revenue data, pricing tiers

**Integration Setup Flow**:
1. Select integration
2. OAuth authentication
3. Choose data to sync (checkboxes)
4. Set sync frequency (hourly, daily, weekly)
5. Map data fields to brain fact categories
6. Preview imported data
7. Activate sync

**Data Sync Dashboard**:
```
┌─────────────────────────────────────────────────┐
│ Active Integrations (4)                         │
├─────────────────────────────────────────────────┤
│ 🟢 Google Analytics    Last sync: 2 hours ago  │
│    → 127 facts updated                          │
│    [Configure] [Pause] [Disconnect]             │
├─────────────────────────────────────────────────┤
│ 🟢 Google Reviews      Last sync: 1 day ago    │
│    → 8 new testimonials                         │
│    [Configure] [Pause] [Disconnect]             │
├─────────────────────────────────────────────────┤
│ 🟡 HubSpot CRM         Sync pending...          │
│    → Waiting for authentication                 │
│    [Complete Setup]                             │
├─────────────────────────────────────────────────┤
│ 🔴 Mailchimp           Connection error         │
│    → OAuth token expired                        │
│    [Reconnect]                                  │
└─────────────────────────────────────────────────┘
```

#### 7. Visual Brand Assets
**Manage logo, colors, images**:
- Upload/manage multiple logo variations
- Extract brand colors from images (Vibrant)
- Define primary/secondary/accent colors
- Typography selection
- Pattern library
- Icon sets

**Brand Asset Gallery**:
```
Logos:
[Primary Logo] [Logo White] [Logo Mark] [+ Upload]

Color Palette:
Primary: #2C6BAA 🎨  Secondary: #C96F4C 🎨  Accent: #3C7A6A 🎨

Typography:
Heading: Montserrat Bold
Body: Open Sans Regular
[Change Fonts]

Recent Uploads:
[hero-image.jpg] [team-photo.jpg] [product-shot.png]
```

### Database Schema

**Uses**:
- `business_brains` (main brain record)
- `brain_facts` (all facts)
- `brand_rules` (voice/tone/style)
- `brand_assets` (visual assets)
- `knowledge_sources` (integrations)
- `onboarding_sessions` (training history)

---

## 3. Social Media Generator

**Location**: `/tools/social-media-generator`

**Purpose**: Generate platform-specific social media posts with brand voice and visual consistency.

### Features

**Multi-Platform Support**:
- LinkedIn (professional, B2B focus)
- Facebook (community, local focus)
- Instagram (visual, lifestyle)
- Twitter/X (concise, news-worthy)
- TikTok (video scripts)

**Post Types**:
- Promotional (product/service launch)
- Educational (tips, how-tos)
- Engagement (questions, polls)
- Behind-the-scenes
- User-generated content
- Testimonial/review shares

### Business Brain Integration

**Platform-Specific Prompts**:
```javascript
// LinkedIn Example
const linkedInPrompt = `
Generate a professional LinkedIn post for ${brain.business_name}.

AUDIENCE: ${brain.ideal_customer_profile.filter(icp => icp.role.includes('Business')).map(icp => icp.persona_name).join(', ')}

BRAND VOICE: ${brandRules.find(r => r.category === 'voice' && r.rule_type.includes('Professional')).rule_text}

RECENT ACHIEVEMENTS (from brain facts):
${brain_facts.filter(f => f.category === 'case_studies' && f.created_at > thirtyDaysAgo).map(f => f.value).join('\n')}

POST GOAL: ${postGoal} (e.g., thought leadership, lead generation, brand awareness)

REQUIREMENTS:
- 150-300 words
- Include 1-2 relevant hashtags from ${brain.primary_keywords}
- Add call-to-action
- Professional yet approachable tone
- Include question to drive engagement
`
```

**Auto-Image Pairing**:
- Suggest brand-consistent images from `brand_assets`
- Generate AI images using brand colors
- Recommend stock photos matching brand style

### UI Components

```
Platform Selector: [LinkedIn] [Facebook] [Instagram] [Twitter] [TikTok]

Post Type: [Promotional ▼]

Post Goal:
○ Brand Awareness
● Lead Generation
○ Engagement
○ Thought Leadership

Topic/Prompt: [Text area: "Share our new emergency service offering..."]

[Generate Post]

Generated Post:
┌─────────────────────────────────────────────────┐
│ 🚨 Emergency HVAC repairs shouldn't wait.      │
│                                                 │
│ We're thrilled to announce 24/7 emergency      │
│ service for all our commercial clients! When   │
│ your system fails at 2 AM, our certified techs │
│ are ready to respond within 2 hours.           │
│                                                 │
│ What's the worst time your HVAC has broken?    │
│                                                 │
│ #HVAC #EmergencyService #CommercialHVAC        │
│                                                 │
│ 📞 Call us anytime: (555) 123-4567             │
└─────────────────────────────────────────────────┘

Suggested Image: [brand-asset-emergency-truck.jpg]

[Regenerate] [Edit] [Schedule Post] [Copy to Clipboard]
```

### Calendar Integration

**Social Media Calendar**:
- Schedule posts across all platforms
- Visual monthly view
- Drag-and-drop rescheduling
- Content mix analysis (promotional vs. educational)
- Best time to post suggestions (from analytics)

---

## 4. AI Image Studio

**Location**: `/tools/ai-image-studio`

**Purpose**: Generate brand-consistent images using Business Brain color palette and style guidelines.

### Features

**Image Generation**:
- Product mockups
- Hero images
- Social media graphics
- Blog featured images
- Ad creatives
- Infographics

**Brand Consistency Enforcement**:
```javascript
const imagePrompt = `
${userPrompt}

BRAND VISUAL GUIDELINES:
- Primary color: ${brain.brand_colors.primary}
- Secondary color: ${brain.brand_colors.secondary}
- Color palette: ${brain.brand_colors.palette}
- Typography: ${brain.typography.heading_font}
- Style: Modern, professional, clean

STYLE MODIFIERS:
- Use ${brain.brand_colors.primary} as dominant color
- Match visual style of uploaded brand assets
- Maintain high contrast for readability
`
```

**Auto-Branding**:
- Overlay logo watermark
- Apply brand color filter
- Add text with brand typography
- Consistent aspect ratios

### UI Components

```
Image Type: [Hero Image ▼]

Prompt: [Text area: "HVAC technician working on commercial unit"]

Brand Colors: [Auto-apply ✓]  Logo Overlay: [Bottom-right ✓]

Style: ● Photo-realistic  ○ Illustration  ○ 3D Render

[Generate Image]

Generated Images (4):
[Preview 1] [Preview 2] [Preview 3] [Preview 4]

Selected Image:
[Large preview with brand colors visible]

[Download] [Save to Brand Assets] [Use in Content]
```

---

## 5. Email Campaign Writer

**Location**: `/tools/email-campaign-writer`

**Purpose**: Generate personalized email sequences with business-specific offers and voice.

### Features

**Email Types**:
- Welcome sequences
- Nurture campaigns
- Promotional blasts
- Re-engagement
- Event invitations
- Newsletter content

**Personalization Variables**:
- Business facts (services, pricing, locations)
- Customer segment targeting
- Dynamic content blocks
- A/B test variations

### Business Brain Integration

```javascript
const emailPrompt = `
Write a ${emailType} email for ${brain.business_name}.

TARGET SEGMENT: ${selectedSegment} (from brain.ideal_customer_profile)

BRAND VOICE (from brand_rules):
${brandRules.filter(r => r.category === 'voice').map(r => r.rule_text).join('\n')}

CURRENT OFFERS (from brain_facts):
${brain_facts.filter(f => f.category === 'pricing' && f.tags.includes('promotion')).map(f => f.value).join('\n')}

EMAIL REQUIREMENTS:
- Subject line (50 chars max)
- Preheader text (90 chars)
- 200-300 word body
- Clear CTA button
- P.S. line for urgency
`
```

### UI Components

```
Campaign Type: [Nurture Sequence ▼]

Sequence:
[Email 1: Welcome] [+ Add Email]
  Subject: "Welcome to ${brain.business_name}!"
  Send: Immediately after signup

  [Edit Email]

[Email 2: Value Demo]
  Subject: "Here's how we help businesses like yours"
  Send: 2 days after Email 1

  [Edit Email]

[+ Add Email]

[Generate Sequence] [Preview] [Save Draft]
```

---

## 6. SEO Content Optimizer

**Location**: `/tools/seo-optimizer`

**Purpose**: Real-time SEO analysis and optimization suggestions for any content.

### Features

**Real-Time Scoring**:
- Overall SEO score (0-100)
- Keyword density analysis
- Readability score (Flesch-Kincaid)
- Meta tag optimization
- Internal linking suggestions
- Image alt text checker

**Business Brain Integration**:
- Auto-suggest internal links from existing posts
- Recommend keywords from `brain.primary_keywords`
- Check brand voice consistency
- Fact-check claims against brain_facts

### UI Components

```
┌─────────────────────────────────────────────────┐
│ SEO Score: 78/100                    🟢 Good    │
├─────────────────────────────────────────────────┤
│ ✅ Title optimized (62 chars)                  │
│ ✅ Meta description (155 chars)                │
│ ⚠️  Keyword density: 0.8% (target: 1-2%)       │
│ ⚠️  Missing internal links (add 2-3)           │
│ ✅ Readability: Grade 8 (target audience)      │
│ ❌ Images missing alt text (3/5)               │
└─────────────────────────────────────────────────┘

Suggestions:
1. Add keyword "HVAC installation" 2 more times
2. Link to: [Your HVAC Services] [Emergency Repair Guide]
3. Add alt text to images: image-1.jpg, image-2.jpg, image-3.jpg

[Apply Suggestions] [Export Report]
```

---

## 7. Video Script Writer

**Location**: `/tools/video-script-writer`

**Purpose**: Generate video scripts for YouTube, TikTok, Instagram Reels with brand voice.

### Features

**Script Types**:
- Educational/Tutorial
- Product demonstration
- Customer testimonial framework
- Behind-the-scenes
- FAQ explainer
- Promotional/sales

**Platform-Specific**:
- YouTube (10-15 min long-form)
- TikTok (15-60 sec hooks)
- Instagram Reels (30-90 sec)
- LinkedIn Video (2-5 min professional)

### Business Brain Integration

```javascript
const scriptPrompt = `
Write a ${platform} video script for ${brain.business_name}.

VIDEO TYPE: ${videoType}
DURATION: ${duration} seconds/minutes

BRAND VOICE: ${brain.brand_voice}

KEY TALKING POINTS (from brain_facts):
${brain_facts.filter(f => f.category === videoCategory).map(f => f.value).join('\n')}

CALL-TO-ACTION: ${brain.messaging_framework.key_messages[0]}

FORMAT:
[HOOK] (first 3 seconds)
[INTRO] (introduce topic)
[MAIN CONTENT] (numbered points)
[CALL-TO-ACTION]
[OUTRO]
`
```

---

## 8. Ad Copy Generator

**Location**: `/tools/ad-copy-generator`

**Purpose**: Generate high-converting ad copy for Google Ads, Facebook Ads, LinkedIn Ads.

### Features

**Ad Platforms**:
- Google Search Ads
- Google Display Ads
- Facebook/Instagram Ads
- LinkedIn Sponsored Content
- Twitter Promoted Tweets

**Ad Formats**:
- Headlines (multiple variations)
- Descriptions
- Call-to-action buttons
- Display ad text overlays

### Business Brain Integration

**Competitor Differentiation**:
```javascript
const adPrompt = `
Write ${platform} ad copy for ${brain.business_name}.

TARGET KEYWORD: ${keyword}
AUDIENCE: ${brain.ideal_customer_profile[0].persona_name}

UNIQUE SELLING POINTS (from brain):
${brain.unique_value_propositions.join('\n')}

COMPETITORS (differentiate from):
${brain.competitors.map(c => `- ${c.name}: ${c.differentiation}`).join('\n')}

PROVEN MESSAGING (from high-performing content):
${brain_facts.filter(f => f.category === 'messaging' && f.confidence > 0.9).map(f => f.value).join('\n')}

REQUIREMENTS:
- Headline: ${platform === 'Google' ? '30 chars' : '40 chars'}
- Description: ${platform === 'Google' ? '90 chars' : '125 chars'}
- Include urgency/scarcity if applicable
- Use power words from brand lexicon
`
```

---

## 9. Landing Page Builder

**Location**: `/tools/landing-page-builder`

**Purpose**: Generate complete landing page copy and structure for campaigns.

### Features

**Page Types**:
- Service landing pages
- Lead magnet opt-ins
- Product launches
- Event registrations
- Webinar signups

**Sections Generated**:
- Hero (headline + subheadline + CTA)
- Features/Benefits (3-6 blocks)
- Social proof (testimonials, logos)
- FAQ
- Final CTA

### Business Brain Integration

```javascript
// Generates complete page structure
const pageStructure = {
  hero: {
    headline: generateHeadline(brain, service),
    subheadline: brain.messaging_framework.value_proposition,
    cta: generateCTA(brain, goal),
    background_image: selectBrandAsset(brain, 'hero_image')
  },
  features: brain_facts
    .filter(f => f.category === 'services' && f.key === serviceKey)
    .map(f => ({
      icon: '✓',
      title: f.value.benefit,
      description: f.value.description
    })),
  testimonials: brain_facts.filter(f => f.category === 'testimonials').slice(0, 3),
  faq: brain_facts.filter(f => f.category === 'faq' && f.tags.includes(serviceKey))
}
```

---

## 10. Chatbot Configurator

**Location**: `/tools/chatbot-configurator`

**Purpose**: Create custom AI chatbots for client websites powered by their Business Brain.

### Features

**Chatbot Types**:
- Customer support
- Lead qualification
- FAQ automation
- Product recommendations
- Appointment booking

**Brain-Powered Responses**:
- Answers from brain_facts
- Brand voice enforcement
- Context-aware conversations
- Escalation rules

### Implementation

```javascript
// Chatbot uses Business Brain for responses
async function getChatbotResponse(message, brainId) {
  const { data: brain } = await supabase
    .from('business_brains')
    .select('*')
    .eq('id', brainId)
    .single()

  // Search relevant facts
  const { data: facts } = await supabase.rpc('search_brain_facts', {
    brain_id: brainId,
    q: message,
    limit_count: 5
  })

  // Get brand rules
  const { data: brandRules } = await supabase
    .from('brand_rules')
    .select('*')
    .eq('brain_id', brainId)

  // Generate response with Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    system: buildChatbotSystemPrompt(brain, brandRules),
    messages: [{
      role: 'user',
      content: buildChatbotUserPrompt(message, facts)
    }]
  })

  return response.content[0].text
}
```

---

## Integration Framework

### Third-Party Data Sources

**Priority Integrations**:

#### 1. Google Analytics
**Data Imported**:
- Top pages (pageviews, avg time on page)
- Traffic sources
- Goal conversions
- User demographics

**Brain Facts Created**:
```json
{
  "category": "market_data",
  "key": "top_landing_pages",
  "value": [
    "/services/hvac-installation (1,247 views/month)",
    "/emergency-repair (892 views/month)"
  ],
  "source": "google_analytics",
  "confidence": 0.95
}
```

#### 2. Google My Business
**Data Imported**:
- Business reviews (text, rating, date)
- Photos
- Q&A
- Business hours
- Service areas

**Brain Facts Created**:
```json
{
  "category": "testimonials",
  "key": "google_review_23",
  "value": {
    "author": "John D.",
    "rating": 5,
    "text": "Amazing service! Fixed our AC in under 2 hours.",
    "date": "2025-01-10"
  },
  "source": "google_my_business",
  "confidence": 1.0
}
```

#### 3. HubSpot CRM
**Data Imported**:
- Contact properties
- Deal stages
- Email campaign performance
- Form submissions

**Brain Facts Created**:
```json
{
  "category": "company_info",
  "key": "avg_deal_size",
  "value": "$4,200",
  "source": "hubspot_crm",
  "confidence": 0.92
}
```

#### 4. Mailchimp
**Data Imported**:
- Email campaign stats
- Subscriber segments
- Top-performing subject lines

#### 5. Social Media APIs
**Platforms**: Facebook, Instagram, LinkedIn, Twitter
**Data Imported**:
- Post engagement metrics
- Follower demographics
- Top-performing content

### Integration Architecture

**Netlify Functions** (one per integration):
```
netlify/functions/
├── integration-google-analytics.ts
├── integration-google-my-business.ts
├── integration-hubspot.ts
├── integration-mailchimp.ts
├── integration-facebook.ts
└── integration-linkedin.ts
```

**Database Table**: `knowledge_sources`

```typescript
interface KnowledgeSource {
  id: string
  brain_id: string
  type: 'google_analytics' | 'google_my_business' | 'hubspot' | 'mailchimp' | 'facebook' | 'linkedin'
  config: {
    oauth_token: string  // Encrypted
    refresh_token: string
    account_id: string
    sync_frequency: 'hourly' | 'daily' | 'weekly'
    last_sync_at: Date
    enabled_fields: string[]  // Which data to sync
  }
  status: 'active' | 'paused' | 'error'
  error_message?: string
}
```

**Sync Job Scheduler** (Netlify scheduled function):
```typescript
// netlify/functions/integration-sync-scheduler.ts
export const handler = async (event) => {
  // Run every hour
  const { data: sources } = await supabase
    .from('knowledge_sources')
    .select('*')
    .eq('status', 'active')
    .lte('last_sync_at', oneHourAgo)

  for (const source of sources) {
    // Trigger specific integration function
    await triggerIntegrationSync(source)
  }
}
```

---

## Shared Components

### Reusable UI Components

**Brain Selector**:
```jsx
<BrainSelector
  organizationId={orgId}
  onSelect={(brain) => setSelectedBrain(brain)}
  showHealthScore={true}
/>
```

**Fact Injector**:
```jsx
<FactInjector
  brainId={brainId}
  category="services"
  onFactsLoaded={(facts) => enrichPrompt(facts)}
/>
```

**Brand Voice Preview**:
```jsx
<BrandVoicePreview
  brainId={brainId}
  sampleText="Your AI-generated content preview"
  showScore={true}
/>
```

**SEO Score Widget**:
```jsx
<SEOScoreWidget
  content={contentText}
  primaryKeyword={keyword}
  brainId={brainId}
  onSuggestionsClick={(suggestions) => applySuggestions(suggestions)}
/>
```

---

## Implementation Priority

### Phase 1: Foundation (Weeks 1-4)
1. **Business Brain Manager** (complete foundation)
   - Brain dashboard
   - Fact explorer
   - Manual fact entry
   - File uploads

2. **Database Schema** (all enhanced tables)
3. **Auto-initialization** (web scraping + brand detection)
4. **AI onboarding conversation**

### Phase 2: Core Apps (Weeks 5-8)
1. **AI Content Writer** (full Base44 parity)
2. **Social Media Generator**
3. **AI Image Studio**

### Phase 3: Integrations (Weeks 9-10)
1. Google Analytics integration
2. Google My Business integration
3. HubSpot/Mailchimp (one of them)

### Phase 4: Advanced Apps (Weeks 11-14)
1. **Email Campaign Writer**
2. **SEO Content Optimizer**
3. **Video Script Writer**

### Phase 5: Scale & Polish (Weeks 15-16)
1. **Ad Copy Generator**
2. **Landing Page Builder**
3. **Chatbot Configurator**

---

## Revenue Model

### Pricing Tiers

**Free Tier**:
- 1 Business Brain
- 10 content pieces/month
- Basic integrations (Google Analytics only)
- Community support

**Starter ($49/month)**:
- 1 Business Brain
- 50 content pieces/month
- 3 integrations
- Email support
- All apps unlocked

**Pro ($199/month)**:
- 3 Business Brains
- 200 content pieces/month
- Unlimited integrations
- Priority support
- White-label options
- API access

**Enterprise (Custom)**:
- Unlimited Business Brains
- Unlimited content
- Custom integrations
- Dedicated success manager
- SLA guarantees

---

## Success Metrics

**Brain Quality**:
- Average confidence score > 0.85
- Fact verification rate > 80%
- Integration sync success > 95%

**User Engagement**:
- Active daily users
- Content pieces generated per month
- Apps used per session
- Time saved (vs. manual content creation)

**Content Quality**:
- User satisfaction ratings
- Content publish rate (draft → published)
- SEO performance (ranking improvements)

---

**Document Version**: 1.0.0
**Last Updated**: January 2025
**Status**: ✅ Complete Ecosystem Architecture Ready
