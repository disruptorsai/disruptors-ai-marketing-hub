# Business Brain - Complete System Architecture & Implementation Plan

**Status**: Comprehensive Design Ready for Implementation
**Version**: 2.0.0
**Date**: January 2025
**Purpose**: Unified personalization layer for all AI-powered apps and content generation

---

## Executive Summary

The **Business Brain** is the central intelligence layer that powers all AI-generated content, media, and responses across the Disruptors AI Marketing Hub. It serves as the single source of truth for:

1. **Brand Identity** - Voice, tone, style, colors, design system
2. **Business Knowledge** - Services, pricing, team, locations, facts
3. **Content Strategy** - Keywords, messaging, competitor analysis
4. **Visual Assets** - Logos, images, color palettes, design guidelines

### Key Innovation

**Automated Multi-Source Knowledge Ingestion**:
- Web scraping & crawling (Firecrawl)
- Visual brand extraction (Brandfetch + Vibrant)
- AI-powered conversational onboarding
- Manual fact entry & file uploads
- Continuous learning & fact verification

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Knowledge Ingestion Pipeline](#knowledge-ingestion-pipeline)
4. [AI-Powered Onboarding](#ai-powered-onboarding)
5. [Visual Brand Extraction](#visual-brand-extraction)
6. [Content Integration](#content-integration)
7. [Implementation Roadmap](#implementation-roadmap)
8. [API Reference](#api-reference)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE SOURCES                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Web Scraping │  │ AI Onboarding│  │ File Uploads │         │
│  │ (Firecrawl)  │  │ (Claude)     │  │ (Cloudinary) │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               BUSINESS BRAIN (Knowledge Layer)                  │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │  Brain Facts  │  │  Brand Rules  │  │ Brand Assets  │      │
│  │   (FTS+Vector)│  │  (Voice/Tone) │  │ (Visual DNA)  │      │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘      │
│          │                  │                  │                │
│          └──────────────────┴──────────────────┘                │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AI APPLICATION LAYER                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Blog Writer  │  │ Social Media │  │Image Generator│         │
│  │ (Base44      │  │ Generator    │  │ (gpt-image-1) │         │
│  │ Integration) │  │              │  │               │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AI Chat      │  │ Content      │  │ Email Writer │         │
│  │ Agents       │  │ Calendar     │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Tier Business Brain Levels

```
Level 1: STARTER BRAIN
├─ Auto-generated from website scrape
├─ Basic brand colors (extracted from images)
├─ Services list (AI-extracted)
├─ Target audience inference
└─ Confidence: 0.3-0.5

Level 2: ENHANCED BRAIN
├─ AI onboarding conversation (10-15 questions)
├─ User-confirmed preferences
├─ Custom uploaded files (brand guide, etc.)
├─ Manual fact corrections
└─ Confidence: 0.6-0.8

Level 3: EXPERT BRAIN
├─ Full brand guidelines uploaded
├─ Visual assets library
├─ Competitor analysis
├─ Historical content analysis
├─ Continuous learning enabled
└─ Confidence: 0.9-1.0
```

---

## Database Schema

### Enhanced Schema (Extending Admin Nexus Data Model)

#### business_brains (Enhanced)

```typescript
interface BusinessBrain {
  // Existing fields
  id: string
  slug: string
  name: string
  description?: string
  created_by?: string
  created_at: Date
  updated_at: Date

  // NEW FIELDS for comprehensive business intelligence

  // Business Identity
  business_name: string
  tagline?: string
  elevator_pitch?: string  // 30-second pitch
  industry: string
  sub_industry?: string

  // Contact & Location
  primary_website: string
  primary_email?: string
  primary_phone?: string
  locations: BusinessLocation[]  // JSONB array
  service_areas: string[]  // Geographic service areas

  // Target Market
  ideal_customer_profile: ICP[]  // JSONB array
  target_industries: string[]
  business_model: 'B2B' | 'B2C' | 'B2B2C' | 'D2C'

  // Social & Online Presence
  social_links: SocialLinks  // JSONB
  tech_stack: TechStack  // JSONB
  competitors: Competitor[]  // JSONB array

  // Brain Health & Metrics
  total_facts: number
  verified_facts: number
  confidence_score: number  // 0.0-1.0 (overall brain quality)
  last_scraped_at?: Date
  last_trained_at?: Date
  onboarding_completed: boolean
  onboarding_step: number  // Current step in onboarding

  // Visual Brand Identity
  brand_colors: BrandColors  // JSONB
  typography: Typography  // JSONB
  logo_url?: string
  favicon_url?: string

  // Content Strategy
  primary_keywords: string[]
  secondary_keywords: string[]
  content_pillars: ContentPillar[]  // JSONB array
  messaging_framework: MessagingFramework  // JSONB
}

// Type Definitions
interface BusinessLocation {
  name: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  is_primary: boolean
  phone?: string
  email?: string
}

interface ICP {
  persona_name: string
  role: string
  company_size?: string
  pain_points: string[]
  goals: string[]
  decision_factors: string[]
}

interface SocialLinks {
  linkedin?: string
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  tiktok?: string
}

interface TechStack {
  cms?: string  // e.g., WordPress, Shopify
  analytics?: string[]  // e.g., Google Analytics, Plausible
  marketing?: string[]  // e.g., HubSpot, Mailchimp
  hosting?: string  // e.g., Netlify, Vercel
  framework?: string  // e.g., React, Next.js
}

interface Competitor {
  name: string
  website: string
  strengths: string[]
  weaknesses: string[]
  differentiation: string
}

interface BrandColors {
  primary: string  // Hex
  secondary?: string
  accent?: string
  neutrals: string[]  // Array of grays
  palette: ColorPalette
}

interface ColorPalette {
  vibrant?: string
  darkVibrant?: string
  lightVibrant?: string
  muted?: string
  darkMuted?: string
  lightMuted?: string
}

interface Typography {
  heading_font: string
  body_font: string
  mono_font?: string
  font_urls: string[]  // Google Fonts or CDN links
}

interface ContentPillar {
  name: string
  description: string
  keywords: string[]
  content_types: string[]  // blog, social, video, etc.
}

interface MessagingFramework {
  value_proposition: string
  positioning_statement: string
  key_messages: string[]
  proof_points: string[]
}
```

#### brain_facts (Enhanced)

```typescript
interface BrainFact {
  // Existing fields
  id: string
  brain_id: string
  key: string
  value: any  // JSONB
  source?: string
  confidence?: number
  last_verified_at?: Date
  created_at: Date
  updated_at: Date
  fts: TsVector

  // NEW FIELDS for advanced knowledge management

  // Categorization
  category: FactCategory
  subcategory?: string
  tags: string[]

  // Context & Evidence
  evidence_urls: string[]  // Source URLs where fact was found
  extraction_method: ExtractionMethod
  verified_by?: string  // user_id who verified

  // Relationships
  related_fact_ids: string[]  // Other facts this relates to

  // Vector Embeddings for Semantic Search
  embedding?: number[]  // OpenAI text-embedding-3-small (1536 dimensions)

  // Versioning
  version: number
  previous_value?: any  // JSONB - for audit trail

  // Usage Tracking
  times_used: number  // How many times used in content
  last_used_at?: Date
}

type FactCategory =
  | 'company_info'
  | 'services'
  | 'products'
  | 'pricing'
  | 'team'
  | 'locations'
  | 'process'
  | 'case_studies'
  | 'testimonials'
  | 'faq'
  | 'technical'
  | 'competitors'
  | 'market_data'

type ExtractionMethod =
  | 'web_scrape'
  | 'ai_conversation'
  | 'manual_entry'
  | 'file_upload'
  | 'api_integration'
  | 'brand_detection'
```

#### brand_assets (New Table)

```typescript
interface BrandAsset {
  id: string
  brain_id: string

  // Asset Details
  asset_type: AssetType
  name: string
  description?: string
  file_url: string
  cloudinary_id?: string

  // File Metadata
  file_size: number  // bytes
  mime_type: string
  width?: number  // for images
  height?: number

  // Visual Analysis (AI-extracted)
  dominant_colors?: string[]  // Hex colors
  extracted_text?: string  // OCR text
  tags: string[]

  // Usage Rights
  license?: string
  attribution?: string
  usage_restrictions?: string

  // Organization
  folder_path: string
  is_primary: boolean  // Primary logo, hero image, etc.

  created_at: Date
  updated_at: Date
}

type AssetType =
  | 'logo'
  | 'icon'
  | 'favicon'
  | 'hero_image'
  | 'product_image'
  | 'team_photo'
  | 'background'
  | 'pattern'
  | 'illustration'
  | 'document'
  | 'brand_guide'
```

#### onboarding_sessions (New Table)

```typescript
interface OnboardingSession {
  id: string
  brain_id: string
  user_id?: string

  // Session State
  status: 'in_progress' | 'completed' | 'abandoned'
  current_step: number
  total_steps: number

  // Conversation History
  messages: OnboardingMessage[]  // JSONB array

  // Collected Data
  collected_facts: CollectedFact[]  // JSONB array
  user_preferences: UserPreferences  // JSONB

  // Metadata
  started_at: Date
  completed_at?: Date
  abandoned_at?: Date
  time_spent_seconds: number
}

interface OnboardingMessage {
  role: 'assistant' | 'user'
  content: string
  timestamp: string
  step: number
}

interface CollectedFact {
  key: string
  value: any
  confidence: number
  needs_verification: boolean
}

interface UserPreferences {
  preferred_tone: string[]  // casual, professional, technical, etc.
  content_goals: string[]
  priority_services: string[]
  target_keywords: string[]
}
```

---

## Knowledge Ingestion Pipeline

### Auto-Initialization Flow

```
1. User registers / creates organization
   ↓
2. System creates Level 1 Starter Brain
   ↓
3. [AUTO] Web Scraping Job Triggered
   ├─ Firecrawl: Crawl primary website (up to 20 pages)
   ├─ Playwright: Extract meta tags, JSON-LD, images
   ├─ BrandDetector: Extract colors from logo/images
   └─ Claude AI: Analyze content, extract facts
   ↓
4. [AUTO] Business Profile Generation
   ├─ Detect industry & services
   ├─ Extract company info (name, tagline, contact)
   ├─ Identify target audience
   ├─ Extract social links & tech stack
   └─ Generate initial facts (confidence: 0.3-0.5)
   ↓
5. Save to business_brains + brain_facts
   ↓
6. [USER ACTION] Trigger AI Onboarding Conversation
   ↓
7. AI asks 10-15 confirmation/clarification questions
   ├─ Confirm extracted facts
   ├─ Fill in gaps
   ├─ Narrow down preferences
   └─ Upgrade confidence to 0.6-0.8
   ↓
8. [OPTIONAL] User uploads brand guidelines
   ↓
9. Brain Level 3: Expert Brain (confidence: 0.9-1.0)
```

### Implementation: Auto-Scraping Service

**Netlify Function**: `netlify/functions/brain-auto-initialize.ts`

```typescript
import { GrowthAuditOrchestrator } from '@/lib/growth-audit/orchestrator'
import { BrandDetector } from '@/lib/growth-audit/scrapers/brand-detect'
import { getServiceClient } from '../lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

export async function handler(event) {
  const { organizationId, websiteUrl } = JSON.parse(event.body)

  const supabase = getServiceClient()

  // 1. Create Starter Brain
  const { data: brain } = await supabase
    .from('business_brains')
    .insert({
      name: `${organizationId} Brain`,
      slug: `org-${organizationId}`,
      primary_website: websiteUrl,
      confidence_score: 0.0,
      onboarding_completed: false,
      onboarding_step: 0
    })
    .select()
    .single()

  // 2. Run Growth Audit (scraping + analysis)
  const orchestrator = new GrowthAuditOrchestrator()
  const profile = await orchestrator.runAudit(websiteUrl, (event) => {
    console.log('Scraping progress:', event)
  })

  // 3. Extract brand colors
  const brandDetector = new BrandDetector()
  const brandData = await brandDetector.detectFromDomain(websiteUrl)

  if (brandData) {
    await supabase
      .from('business_brains')
      .update({
        brand_colors: brandData.palette,
        logo_url: brandData.logo
      })
      .eq('id', brain.id)
  }

  // 4. Extract facts from profile
  const facts = extractFactsFromProfile(profile, brain.id)

  await supabase
    .from('brain_facts')
    .insert(facts)

  // 5. Update brain metrics
  await supabase
    .from('business_brains')
    .update({
      total_facts: facts.length,
      confidence_score: calculateConfidence(facts),
      last_scraped_at: new Date().toISOString(),
      industry: profile.industry,
      business_name: profile.brandIdentity.name,
      tagline: profile.brandIdentity.tagline,
      social_links: profile.socialMedia,
      tech_stack: profile.techStack
    })
    .eq('id', brain.id)

  return {
    statusCode: 200,
    body: JSON.stringify({
      brainId: brain.id,
      factsExtracted: facts.length,
      confidence: calculateConfidence(facts),
      nextStep: 'onboarding_conversation'
    })
  }
}

function extractFactsFromProfile(profile, brainId) {
  const facts = []

  // Company info facts
  if (profile.brandIdentity.name) {
    facts.push({
      brain_id: brainId,
      category: 'company_info',
      key: 'company_name',
      value: profile.brandIdentity.name,
      confidence: 0.9,
      source: profile.url,
      extraction_method: 'web_scrape',
      evidence_urls: [profile.url]
    })
  }

  // Services facts
  profile.offerings?.forEach((service, idx) => {
    facts.push({
      brain_id: brainId,
      category: 'services',
      key: `service_${idx + 1}`,
      value: {
        name: service.name,
        description: service.description
      },
      confidence: 0.7,
      source: profile.url,
      extraction_method: 'web_scrape',
      evidence_urls: service.evidenceUrls || [profile.url]
    })
  })

  // ICP facts
  profile.idealCustomer?.forEach((icp, idx) => {
    facts.push({
      brain_id: brainId,
      category: 'company_info',
      key: `icp_${idx + 1}`,
      value: icp,
      confidence: 0.6,
      source: profile.url,
      extraction_method: 'web_scrape',
      evidence_urls: [profile.url]
    })
  })

  // ... extract all other facts from profile

  return facts
}

function calculateConfidence(facts) {
  if (facts.length === 0) return 0
  const avgConfidence = facts.reduce((sum, f) => sum + (f.confidence || 0), 0) / facts.length
  return Math.min(0.5, avgConfidence)  // Cap at 0.5 for auto-scraped data
}
```

---

## AI-Powered Onboarding

### Conversational Onboarding Flow

**Goal**: Upgrade Level 1 Starter Brain → Level 2 Enhanced Brain through guided conversation

**Conversation Design**:
- **10-15 questions** total
- **Adaptive flow** based on previous answers
- **Confirmation + Clarification** pattern
- **Natural language** responses accepted
- **Real-time fact extraction** during conversation

**Example Conversation**:

```
Step 1: Welcome
AI: Hi! I've analyzed your website and learned a bit about your business.
    Let's confirm a few things and fill in some gaps to personalize your
    AI content generation. This will only take 5 minutes.

Step 2: Confirm Industry
AI: I detected that you're in the "HVAC & Plumbing" industry. Is that correct?
User: Yes, primarily HVAC
AI: [Updates fact: industry = "HVAC", confidence: 0.9]

Step 3: Confirm Target Audience
AI: I see you serve homeowners and property managers. Who is your
    PRIMARY target customer?
User: Residential homeowners, especially those with older HVAC systems
AI: [Creates fact: primary_icp = {persona: "homeowners", age_of_system: "older"}]

Step 4: Brand Voice
AI: How would you describe your brand's voice? (e.g., professional,
    friendly, technical, casual)
User: Professional but approachable, not too technical
AI: [Creates brand_rule: voice = "professional_approachable", taboos = "jargon"]

Step 5: Content Goals
AI: What are your main goals for AI-generated content?
    (Select all: SEO, Lead Generation, Education, Brand Awareness)
User: SEO and Lead Generation
AI: [Updates preferences: content_goals = ["seo", "lead_generation"]]

... 5-10 more questions ...

Step 12: Review & Upgrade
AI: Perfect! I've learned a lot about your business. Based on our
    conversation, I've upgraded your Business Brain to Level 2
    (Enhanced). Your AI content will now be much more personalized.

    Summary:
    - 47 facts confirmed/added
    - Brand voice: Professional & Approachable
    - Primary audience: Homeowners with older HVAC systems
    - Content goals: SEO + Lead Generation

    Ready to generate your first AI-powered blog post?
```

### Implementation: Onboarding Conversation Engine

**Component**: `src/admin/modules/BusinessBrainOnboarding.jsx`

```javascript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import Anthropic from '@anthropic-ai/sdk'

const ONBOARDING_STEPS = [
  {
    step: 1,
    category: 'welcome',
    prompt: (brain) => `Welcome! I've analyzed ${brain.primary_website}. Let's confirm what I found.`,
    extractFacts: false
  },
  {
    step: 2,
    category: 'industry_confirmation',
    prompt: (brain) => `I detected that you're in the "${brain.industry}" industry. Is that correct?`,
    extractFacts: true,
    factKey: 'industry',
    validResponses: ['yes', 'no', 'partially']
  },
  {
    step: 3,
    category: 'services_confirmation',
    prompt: (brain, facts) => {
      const services = facts.filter(f => f.category === 'services')
      return `I found these services:\n${services.map(s => `- ${s.value.name}`).join('\n')}\nAre these accurate?`
    },
    extractFacts: true
  },
  // ... 10 more steps
]

export default function BusinessBrainOnboarding({ brainId }) {
  const [session, setSession] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializeSession()
  }, [brainId])

  async function initializeSession() {
    // Load brain and existing facts
    const { data: brain } = await supabase
      .from('business_brains')
      .select('*')
      .eq('id', brainId)
      .single()

    const { data: facts } = await supabase
      .from('brain_facts')
      .select('*')
      .eq('brain_id', brainId)

    // Create onboarding session
    const { data: newSession } = await supabase
      .from('onboarding_sessions')
      .insert({
        brain_id: brainId,
        status: 'in_progress',
        current_step: 0,
        total_steps: ONBOARDING_STEPS.length,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    setSession(newSession)

    // Start conversation
    const firstMessage = ONBOARDING_STEPS[0].prompt(brain)
    setMessages([{ role: 'assistant', content: firstMessage, step: 0 }])
  }

  async function handleUserResponse() {
    if (!userInput.trim()) return

    setLoading(true)

    // Add user message
    const newMessages = [
      ...messages,
      { role: 'user', content: userInput, step: currentStep }
    ]
    setMessages(newMessages)

    // Extract facts from response using Claude
    const stepConfig = ONBOARDING_STEPS[currentStep]

    if (stepConfig.extractFacts) {
      const extractedFacts = await extractFactsFromResponse(
        userInput,
        stepConfig,
        brainId
      )

      // Save facts
      if (extractedFacts.length > 0) {
        await supabase.from('brain_facts').insert(extractedFacts)
      }
    }

    // Move to next step
    const nextStep = currentStep + 1
    if (nextStep < ONBOARDING_STEPS.length) {
      const nextPrompt = ONBOARDING_STEPS[nextStep].prompt(brain, facts)
      setMessages([
        ...newMessages,
        { role: 'assistant', content: nextPrompt, step: nextStep }
      ])
      setCurrentStep(nextStep)
    } else {
      // Onboarding complete
      await completeOnboarding()
    }

    setUserInput('')
    setLoading(false)
  }

  async function extractFactsFromResponse(response, stepConfig, brainId) {
    const anthropic = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY
    })

    const prompt = `
      Extract structured facts from this user response during business onboarding.

      Question asked: ${stepConfig.prompt}
      User response: "${response}"

      Extract any business facts mentioned and return as JSON array:
      [
        {
          "key": "snake_case_key",
          "value": "fact value or JSON object",
          "category": "company_info|services|pricing|team|etc",
          "confidence": 0.0-1.0
        }
      ]

      If user confirmed existing info, return confidence: 0.9
      If user provided new info, return confidence: 0.8
      If uncertain, return confidence: 0.5
    `

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const facts = JSON.parse(message.content[0].text)

    return facts.map(f => ({
      brain_id: brainId,
      ...f,
      source: 'onboarding_conversation',
      extraction_method: 'ai_conversation',
      evidence_urls: []
    }))
  }

  async function completeOnboarding() {
    // Update session
    await supabase
      .from('onboarding_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', session.id)

    // Update brain
    const { data: facts } = await supabase
      .from('brain_facts')
      .select('*')
      .eq('brain_id', brainId)

    const newConfidence = facts.reduce((sum, f) => sum + f.confidence, 0) / facts.length

    await supabase
      .from('business_brains')
      .update({
        onboarding_completed: true,
        confidence_score: newConfidence,
        total_facts: facts.length,
        verified_facts: facts.filter(f => f.confidence >= 0.8).length,
        last_trained_at: new Date().toISOString()
      })
      .eq('id', brainId)

    // Show completion message
    setMessages([
      ...messages,
      {
        role: 'assistant',
        content: `🎉 Onboarding complete! Your Business Brain is now Level 2 (Enhanced) with ${facts.length} facts and ${(newConfidence * 100).toFixed(0)}% confidence.`,
        step: currentStep + 1
      }
    ])
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
      </div>

      {currentStep < ONBOARDING_STEPS.length && (
        <div className="mt-6">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Type your response..."
            disabled={loading}
          />
          <button
            onClick={handleUserResponse}
            disabled={loading || !userInput.trim()}
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Step {currentStep + 1} of {ONBOARDING_STEPS.length}
      </div>
    </div>
  )
}

function ChatMessage({ message }) {
  return (
    <div className={`p-4 rounded-lg ${
      message.role === 'assistant'
        ? 'bg-blue-50 border-l-4 border-blue-500'
        : 'bg-gray-50 border-l-4 border-gray-300'
    }`}>
      <p className="text-gray-800">{message.content}</p>
    </div>
  )
}
```

---

## Visual Brand Extraction

### Brand Color Detection

**Already Implemented** in `src/lib/growth-audit/scrapers/brand-detect.js`

**Capabilities**:
- ✅ Brandfetch API integration
- ✅ Vibrant color extraction from images
- ✅ WCAG contrast validation
- ✅ Complementary palette generation

**Enhancement Needed**: Save to `business_brains.brand_colors`

```javascript
// Enhanced integration with Business Brain
async function extractAndSaveBrandColors(brainId, websiteUrl) {
  const brandDetector = new BrandDetector()

  // 1. Try Brandfetch first
  let brandData = await brandDetector.detectFromDomain(websiteUrl)

  // 2. Fallback: Extract from images
  if (!brandData) {
    const { data: assets } = await supabase
      .from('brand_assets')
      .select('file_url')
      .eq('brain_id', brainId)
      .in('asset_type', ['logo', 'hero_image'])
      .limit(3)

    if (assets && assets.length > 0) {
      brandData = await brandDetector.extractFromImages(
        assets.map(a => a.file_url)
      )
    }
  }

  // 3. Save to business brain
  if (brandData) {
    await supabase
      .from('business_brains')
      .update({
        brand_colors: brandData.palette,
        logo_url: brandData.logo
      })
      .eq('id', brainId)

    // 4. Create brand facts
    await supabase.from('brain_facts').insert([
      {
        brain_id: brainId,
        category: 'company_info',
        key: 'brand_primary_color',
        value: brandData.palette.primary,
        confidence: 0.9,
        source: websiteUrl,
        extraction_method: 'brand_detection',
        tags: ['visual', 'brand', 'color']
      },
      {
        brain_id: brainId,
        category: 'company_info',
        key: 'brand_color_palette',
        value: brandData.palette,
        confidence: 0.9,
        source: websiteUrl,
        extraction_method: 'brand_detection',
        tags: ['visual', 'brand', 'design']
      }
    ])
  }

  return brandData
}
```

### Typography Extraction

**New Feature**: Extract fonts from website

```javascript
async function extractTypography(websiteUrl) {
  // Use Playwright to detect fonts
  const playwright = await import('playwright')
  const browser = await playwright.chromium.launch()
  const page = await browser.newPage()

  await page.goto(websiteUrl)

  // Extract computed fonts
  const fonts = await page.evaluate(() => {
    const headingFont = window.getComputedStyle(document.querySelector('h1')).fontFamily
    const bodyFont = window.getComputedStyle(document.body).fontFamily

    // Find font URLs (Google Fonts, etc.)
    const fontLinks = Array.from(document.querySelectorAll('link[href*="fonts"]'))
      .map(link => link.href)

    return {
      heading_font: headingFont.split(',')[0].replace(/['"]/g, ''),
      body_font: bodyFont.split(',')[0].replace(/['"]/g, ''),
      font_urls: fontLinks
    }
  })

  await browser.close()

  return fonts
}
```

---

## Content Integration

### Using Business Brain in Content Generation

**Pattern**: All AI content generation functions receive brain context

**Example**: Enhanced Blog Writer (Base44 Integration)

```javascript
// Modified src/lib/anthropic-blog-writer.js
export async function generateBlogArticle({ title, primaryKeyword, secondaryKeywords, organizationId }) {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  // 1. Load organization's business brain
  const { data: brain } = await supabase
    .from('business_brains')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (!brain) {
    throw new Error('No business brain found for organization')
  }

  // 2. Search relevant brain facts
  const { data: facts } = await supabase
    .rpc('search_brain_facts', {
      brain_id: brain.id,
      q: `${title} ${primaryKeyword} ${secondaryKeywords.join(' ')}`,
      limit_count: 15
    })

  // 3. Get brand rules
  const { data: brandRules } = await supabase
    .from('brand_rules')
    .select('*')
    .eq('brain_id', brain.id)

  // 4. Build enhanced system prompt
  const systemPrompt = `
You are an expert SEO content writer for ${brain.business_name}.

BRAND IDENTITY:
- Name: ${brain.business_name}
- Tagline: ${brain.tagline}
- Industry: ${brain.industry}
- Target Audience: ${brain.ideal_customer_profile.map(icp => icp.persona_name).join(', ')}

BRAND VOICE & STYLE:
${brandRules.filter(r => r.category === 'voice').map(r => `- ${r.rule_type}: ${r.rule_text}`).join('\n')}

BRAND LEXICON (Use these terms):
${brandRules.filter(r => r.category === 'lexicon').map(r => `- ${r.rule_text}`).join('\n')}

TABOOS (Avoid these):
${brandRules.filter(r => r.category === 'taboos').map(r => `- ${r.rule_text}`).join('\n')}

BUSINESS KNOWLEDGE (Use these facts in the article):
${facts.map(f => `- ${f.key}: ${JSON.stringify(f.value)}`).join('\n')}

CONTENT REQUIREMENTS:
- Article title: "${title}"
- Primary keyword: ${primaryKeyword}
- Secondary keywords: ${secondaryKeywords.join(', ')}
- Minimum 1,500 words
- Include 5 FAQs
- Include call-to-action mentioning ${brain.business_name}
- Reference specific services: ${facts.filter(f => f.category === 'services').map(f => f.value.name).join(', ')}

Write in the exact brand voice defined above. Use natural keyword integration.
  `.trim()

  // 5. Generate content
  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY
  })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Write a comprehensive blog article about "${title}"`
    }]
  })

  const content = message.content[0].text

  // 6. Track fact usage
  for (const fact of facts) {
    await supabase
      .from('brain_facts')
      .update({
        times_used: (fact.times_used || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', fact.id)
  }

  return {
    content,
    wordCount: content.split(/\s+/).length,
    factsUsed: facts.length,
    brainConfidence: brain.confidence_score
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Database Schema**:
- [ ] Extend `business_brains` table with new fields
- [ ] Enhance `brain_facts` with categorization, embeddings, versioning
- [ ] Create `brand_assets` table
- [ ] Create `onboarding_sessions` table
- [ ] Write migration scripts

**Auto-Initialization**:
- [ ] Build `brain-auto-initialize` Netlify function
- [ ] Integrate Growth Audit orchestrator
- [ ] Implement fact extraction from Growth Audit profile
- [ ] Test with 3-5 real websites

### Phase 2: AI Onboarding (Weeks 3-4)

**Conversation Engine**:
- [ ] Design 10-15 onboarding questions
- [ ] Build `BusinessBrainOnboarding.jsx` component
- [ ] Implement Claude-powered fact extraction
- [ ] Create adaptive conversation flow
- [ ] Test with 10 users

**UI Components**:
- [ ] Onboarding progress indicator
- [ ] Chat interface with real-time responses
- [ ] Fact confirmation UI
- [ ] Onboarding completion dashboard

### Phase 3: Visual Brand Extraction (Week 5)

**Brand Detection**:
- [ ] Enhance `brand-detect.js` with Brain integration
- [ ] Add typography extraction
- [ ] Save brand assets to `brand_assets` table
- [ ] Generate design tokens from brand colors

**Asset Management**:
- [ ] Build brand asset uploader
- [ ] Integrate Cloudinary for file storage
- [ ] Create visual brand library UI
- [ ] Add OCR for uploaded brand guides

### Phase 4: Content Integration (Weeks 6-7)

**Blog Writer Enhancement**:
- [ ] Modify `anthropic-blog-writer.js` to use Business Brain
- [ ] Add fact retrieval via FTS + vector search
- [ ] Implement brand rule injection
- [ ] Track fact usage metrics

**Base44 Integration**:
- [ ] Modify Base44 components to accept `brainId` param
- [ ] Enhance prompts with brain context
- [ ] Add brain selector UI
- [ ] Test content quality improvements

### Phase 5: Advanced Features (Weeks 8-10)

**Continuous Learning**:
- [ ] Scheduled re-scraping (monthly)
- [ ] Fact verification workflows
- [ ] User feedback loop
- [ ] Confidence score recalculation

**Multi-Brain Support**:
- [ ] Support multiple brains per organization
- [ ] Brain cloning/templating
- [ ] Brain comparison tools
- [ ] Brain merging utilities

**API & Integrations**:
- [ ] RESTful Brain API
- [ ] Webhook notifications
- [ ] Export brain as JSON
- [ ] Import brain from competitors

---

## API Reference

### Business Brain API

#### Create Brain (Auto-Initialize)

```bash
POST /.netlify/functions/brain-auto-initialize

{
  "organizationId": "uuid",
  "websiteUrl": "https://example.com",
  "skipOnboarding": false
}

Response:
{
  "brainId": "uuid",
  "factsExtracted": 42,
  "confidence": 0.45,
  "nextStep": "onboarding_conversation"
}
```

#### Get Brain with Facts

```bash
GET /.netlify/functions/brain-get?brainId=uuid

Response:
{
  "brain": { /* business_brain record */ },
  "facts": [ /* brain_facts[] */ ],
  "brandRules": [ /* brand_rules[] */ ],
  "assets": [ /* brand_assets[] */ ],
  "metrics": {
    "totalFacts": 42,
    "verifiedFacts": 28,
    "confidence": 0.67,
    "lastUpdated": "2025-01-15T10:00:00Z"
  }
}
```

#### Search Brain Facts

```bash
POST /.netlify/functions/brain-search

{
  "brainId": "uuid",
  "query": "HVAC pricing and services",
  "limit": 15,
  "categories": ["services", "pricing"]
}

Response:
{
  "facts": [
    {
      "id": "uuid",
      "key": "service_hvac_installation",
      "value": { "name": "HVAC Installation", "price_range": "$3,000-$8,000" },
      "confidence": 0.9,
      "relevanceScore": 0.95
    },
    // ... more facts
  ],
  "total": 42
}
```

#### Update Brain Facts (Manual)

```bash
POST /.netlify/functions/brain-add-fact

{
  "brainId": "uuid",
  "category": "services",
  "key": "custom_service",
  "value": { "name": "Emergency Repair", "available_24_7": true },
  "confidence": 1.0
}
```

#### Start Onboarding Session

```bash
POST /.netlify/functions/brain-onboarding-start

{
  "brainId": "uuid",
  "userId": "uuid"
}

Response:
{
  "sessionId": "uuid",
  "firstMessage": "Hi! I've analyzed your website...",
  "totalSteps": 12
}
```

#### Continue Onboarding

```bash
POST /.netlify/functions/brain-onboarding-respond

{
  "sessionId": "uuid",
  "userResponse": "Yes, that's correct"
}

Response:
{
  "extractedFacts": [ /* facts[] */ ],
  "nextMessage": "Great! Next question...",
  "currentStep": 3,
  "totalSteps": 12,
  "completed": false
}
```

---

## Success Metrics

### Brain Health Score

```
Health Score = (
  (Verified Facts / Total Facts) * 0.4 +
  (Confidence Score) * 0.3 +
  (Onboarding Completed ? 1 : 0) * 0.2 +
  (Days Since Last Update < 30 ? 1 : 0) * 0.1
) * 100

Example:
- 28 verified / 42 total = 0.67
- Confidence: 0.75
- Onboarding: Completed (1)
- Last update: 10 days ago (1)

Health = (0.67 * 0.4 + 0.75 * 0.3 + 1 * 0.2 + 1 * 0.1) * 100
       = (0.268 + 0.225 + 0.2 + 0.1) * 100
       = 79.3%
```

### Content Quality Improvement

**Metrics to track**:
- Content relevance score (user feedback)
- Keyword integration naturalness
- Brand voice consistency
- Fact accuracy rate
- Time to generate (should decrease)

---

## Next Steps

1. **Review this plan** - Confirm architecture and schema design
2. **Prioritize features** - Which phase to start with?
3. **Database migration** - Create extended schema
4. **Begin Phase 1** - Auto-initialization + fact extraction

**Ready to build?** Let me know which phase you want to tackle first!

---

**Document Version**: 2.0.0
**Last Updated**: January 2025
**Status**: ✅ Complete Architecture Ready for Implementation
