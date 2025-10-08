# Multitenant AI Content Writer - Comprehensive Implementation Plan

**Status**: Architecture & Planning Phase
**Version**: 1.0.0
**Date**: January 2025
**Author**: Disruptors AI Development Team

---

## Executive Summary

This document outlines a comprehensive plan to build a **multitenant AI content generation system** that serves two primary use cases:

1. **Admin Nexus Module**: Replace the current blog writing system with an enhanced multitenant version
2. **Client-Facing SaaS Tool**: Standalone AI content writer for registered businesses on the Tools page

The system will leverage business brains/profiles, enforce tenant isolation, track usage/costs, and scale efficiently across multiple customers.

---

## Table of Contents

1. [Current System Analysis](#current-system-analysis)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema Design](#database-schema-design)
4. [Multitenant Features](#multitenant-features)
5. [Technology Stack](#technology-stack)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Security & Compliance](#security--compliance)
8. [Cost Management](#cost-management)
9. [Future Enhancements](#future-enhancements)

---

## Current System Analysis

### Existing Blog Writing System

**Location**: `src/lib/anthropic-blog-writer.js`, `src/components/admin/BlogManagementDashboard.jsx`

**Current Features**:
- ✅ Claude Sonnet 4.5 integration for 1,200+ word articles
- ✅ SEO optimization with primary/secondary keywords
- ✅ DataForSEO keyword research integration
- ✅ Batch article generation with progress tracking
- ✅ Rate limiting (2-second delays between requests)
- ✅ Brand voice customization (Disruptors & Co style)
- ✅ Answer Box format, FAQs, schema hints
- ✅ Local SEO support with location targeting
- ✅ Ahrefs-focused tool guidance

**Current Limitations**:
- ❌ **Single-tenant architecture** - Only works for Disruptors AI
- ❌ **No tenant isolation** - All data in shared posts table
- ❌ **No cost tracking** - Cannot attribute API costs to tenants
- ❌ **No usage limits** - No per-tenant rate limiting
- ❌ **No brand customization** - Hard-coded brand voice
- ❌ **Browser-based API calls** - Security risk (dangerouslyAllowBrowser)
- ❌ **No white-labeling** - Cannot customize UI per tenant

**Business Brain Integration**:
- ✅ Business Brain Builder exists (`src/admin/modules/BusinessBrainBuilder.jsx`)
- ✅ Supports brain facts, knowledge sources, health tracking
- ✅ Semantic search across business knowledge
- ❌ Not yet integrated with content generation

---

## Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                          │
├─────────────────────┬───────────────────────────────────────────┤
│  Admin Nexus Module │  Client-Facing SaaS Tool (/tools/ai-writer)│
│  (Internal Use)     │  (External Customers)                      │
└──────────┬──────────┴────────────────┬──────────────────────────┘
           │                           │
           └───────────┬───────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              MULTITENANT API LAYER (Netlify Functions)          │
├─────────────────────────────────────────────────────────────────┤
│  • Tenant Resolution & Authentication                            │
│  • Rate Limiting & Quota Management                              │
│  • Cost Tracking & Attribution                                   │
│  • Business Brain Integration                                    │
│  • AI Orchestration & Provider Selection                         │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ├──────────────┬─────────────┬──────────────┬──────────┐
           ▼              ▼             ▼              ▼          ▼
┌──────────────┐  ┌──────────────┐  ┌─────────┐  ┌────────┐  ┌──────┐
│  Anthropic   │  │  OpenAI      │  │ Gemini  │  │ Custom │  │ Rate │
│  Claude API  │  │  (Text)      │  │ (Text)  │  │  LLMs  │  │Limiter│
└──────────────┘  └──────────────┘  └─────────┘  └────────┘  └──────┘
           │              │             │              │          │
           └──────────────┴─────────────┴──────────────┴──────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                            │
├─────────────────────────────────────────────────────────────────┤
│  • Tenants & Organizations                                       │
│  • Business Brains & Knowledge                                   │
│  • Content Projects & Documents                                  │
│  • Usage Analytics & Cost Attribution                            │
│  • Templates & Brand Guidelines                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tenant Isolation Strategy

**Pattern**: **Shared Database with Row-Level Security (RLS)**

**Rationale**:
- ✅ **Cost-efficient**: Single Supabase project, lower infrastructure costs
- ✅ **Supabase RLS**: Built-in row-level security for tenant isolation
- ✅ **Simplified management**: Single schema, easier migrations
- ✅ **Query optimization**: Postgres can optimize across all tenants
- ✅ **Real-time features**: Supabase Realtime works across tenants
- ⚠️ **Scalability ceiling**: May need sharding at 10,000+ active tenants

**Implementation**:
- Every table includes `tenant_id` (references `tenants.id`)
- RLS policies filter all queries by `tenant_id`
- Service role bypasses RLS for admin operations
- JWT tokens include `tenant_id` claim for automatic filtering

---

## Database Schema Design

### Core Multitenant Tables

#### 1. Tenants & Organizations

```sql
-- Organizations (top-level entity)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,

  -- Subscription & limits
  plan_tier TEXT DEFAULT 'free', -- free, starter, pro, enterprise
  max_content_pieces INTEGER DEFAULT 10,
  max_words_per_month INTEGER DEFAULT 50000,
  max_api_cost_per_month NUMERIC(10,2) DEFAULT 50.00,

  -- Branding
  brand_name TEXT,
  brand_voice TEXT, -- JSON: {tone, style, guidelines}
  logo_url TEXT,
  color_scheme TEXT, -- JSON: {primary, secondary, accent}

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants (users within organizations)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- User info
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member', -- owner, admin, member, viewer

  -- Authentication
  auth_user_id UUID REFERENCES auth.users(id),

  -- Settings
  preferences JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view own data"
  ON tenants FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Org admins can view all tenant data"
  ON tenants FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM tenants
      WHERE auth_user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
```

#### 2. Business Brains (Enhanced from Admin Nexus)

```sql
-- Business Brains (one per organization)
CREATE TABLE business_brains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id), -- who created it

  -- Brain metadata
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Configuration
  industry TEXT,
  target_audience TEXT,
  unique_value_propositions TEXT[],
  competitor_analysis JSONB,

  -- Brand voice (extracted from organization + custom)
  tone_keywords TEXT[],
  avoid_keywords TEXT[],
  writing_style TEXT, -- casual, professional, bold, technical
  readability_level INTEGER DEFAULT 12, -- grade level

  -- Health metrics
  total_facts INTEGER DEFAULT 0,
  verified_percentage NUMERIC(5,2) DEFAULT 0,
  avg_confidence NUMERIC(5,2),
  last_trained_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, slug)
);

-- Brain Facts (knowledge base)
CREATE TABLE brain_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID REFERENCES business_brains(id) ON DELETE CASCADE,

  -- Fact data
  key TEXT NOT NULL, -- "company_name", "primary_service", "target_location"
  value JSONB NOT NULL,
  source TEXT, -- "manual", "website_scrape", "document_upload"

  -- Metadata
  category TEXT, -- "company_info", "products", "services", "team"
  confidence NUMERIC(3,2) DEFAULT 1.0,
  last_verified_at TIMESTAMPTZ,

  -- Vector embedding for semantic search
  embedding vector(1536), -- OpenAI text-embedding-3-small

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector index for semantic search
CREATE INDEX ON brain_facts USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS Policies
ALTER TABLE business_brains ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brains accessible to org members"
  ON business_brains FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM tenants WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Brain facts accessible via brain"
  ON brain_facts FOR SELECT
  USING (
    brain_id IN (
      SELECT id FROM business_brains
      WHERE organization_id IN (
        SELECT organization_id FROM tenants WHERE auth_user_id = auth.uid()
      )
    )
  );
```

#### 3. Content Generation System

```sql
-- Content Projects (containers for content pieces)
CREATE TABLE content_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  brain_id UUID REFERENCES business_brains(id),

  -- Project details
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT DEFAULT 'blog', -- blog, social, email, website, ads

  -- Target settings
  target_url TEXT,
  target_location TEXT, -- for local SEO

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Pieces (individual articles/posts)
CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  project_id UUID REFERENCES content_projects(id),
  brain_id UUID REFERENCES business_brains(id),

  -- Content metadata
  title TEXT NOT NULL,
  slug TEXT,
  content_type TEXT DEFAULT 'blog_post', -- blog_post, social_post, email, landing_page

  -- Content data
  content TEXT,
  excerpt TEXT,

  -- SEO & Keywords
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  keyword_data JSONB, -- from DataForSEO
  search_volume INTEGER,
  keyword_difficulty INTEGER,

  -- Publishing
  status TEXT DEFAULT 'draft', -- draft, generating, review, published, archived
  published_at TIMESTAMPTZ,
  featured_image_url TEXT,

  -- AI Generation metadata
  ai_model TEXT, -- claude-sonnet-4-20250514
  generation_prompt TEXT,
  generation_tokens_input INTEGER,
  generation_tokens_output INTEGER,
  generation_cost NUMERIC(10,4), -- cost in USD
  generation_duration_ms INTEGER,

  -- Word count & reading time
  word_count INTEGER,
  read_time_minutes INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Templates (reusable prompts/structures)
CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),

  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  content_type TEXT,

  -- Template content
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL, -- with {{PLACEHOLDERS}}

  -- Configuration
  default_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  max_tokens INTEGER DEFAULT 4096,
  temperature NUMERIC(3,2) DEFAULT 1.0,

  -- Sharing
  is_public BOOLEAN DEFAULT false, -- share with all org members
  is_global BOOLEAN DEFAULT false, -- Disruptors admin templates

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE content_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content accessible to org members"
  ON content_pieces FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM tenants WHERE auth_user_id = auth.uid()
    )
  );
```

#### 4. Usage Tracking & Cost Attribution

```sql
-- Usage tracking (detailed logs)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  content_piece_id UUID REFERENCES content_pieces(id),

  -- API Call details
  operation_type TEXT NOT NULL, -- 'content_generation', 'keyword_research', 'image_generation'
  provider TEXT NOT NULL, -- 'anthropic', 'openai', 'dataforseo', 'replicate'
  model TEXT, -- specific model used

  -- Usage metrics
  tokens_input INTEGER,
  tokens_output INTEGER,
  api_cost NUMERIC(10,4), -- cost in USD
  duration_ms INTEGER,

  -- Request/Response
  request_payload JSONB,
  response_metadata JSONB,

  -- Status
  status TEXT DEFAULT 'success', -- success, error, rate_limited
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage aggregates (monthly rollups for performance)
CREATE TABLE usage_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Usage totals
  total_content_pieces INTEGER DEFAULT 0,
  total_words_generated INTEGER DEFAULT 0,
  total_api_calls INTEGER DEFAULT 0,
  total_api_cost NUMERIC(10,2) DEFAULT 0,

  -- By provider
  anthropic_calls INTEGER DEFAULT 0,
  anthropic_cost NUMERIC(10,2) DEFAULT 0,
  openai_calls INTEGER DEFAULT 0,
  openai_cost NUMERIC(10,2) DEFAULT 0,
  dataforseo_calls INTEGER DEFAULT 0,
  dataforseo_cost NUMERIC(10,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, period_start)
);

-- Quota tracking (real-time limits)
CREATE TABLE quota_tracking (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

  -- Current month
  current_month DATE NOT NULL,

  -- Usage this month
  content_pieces_used INTEGER DEFAULT 0,
  words_generated INTEGER DEFAULT 0,
  api_cost_spent NUMERIC(10,2) DEFAULT 0,

  -- Limits (cached from organization)
  max_content_pieces INTEGER,
  max_words_per_month INTEGER,
  max_api_cost_per_month NUMERIC(10,2),

  -- Status
  is_over_quota BOOLEAN DEFAULT false,
  quota_exceeded_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_usage_logs_org_date ON usage_logs(organization_id, created_at DESC);
CREATE INDEX idx_usage_logs_tenant ON usage_logs(tenant_id);
CREATE INDEX idx_usage_aggregates_org_period ON usage_aggregates(organization_id, period_start);
```

---

## Multitenant Features

### 1. Tenant Resolution & Authentication

**JWT Token Structure**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "tenant_id": "tenant-uuid",
  "organization_id": "org-uuid",
  "role": "admin",
  "plan_tier": "pro"
}
```

**Implementation** (Netlify Function):
```javascript
// netlify/functions/ai-content-writer.js
import { createClient } from '@supabase/supabase-js';

export async function handler(event, context) {
  // 1. Extract JWT from Authorization header
  const token = event.headers.authorization?.replace('Bearer ', '');

  // 2. Verify JWT and extract claims
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // 3. Resolve tenant and organization
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*, organization:organizations(*)')
    .eq('auth_user_id', user.id)
    .single();

  if (!tenant) {
    return { statusCode: 403, body: JSON.stringify({ error: 'No tenant found' }) };
  }

  // 4. Check quota limits
  const quotaCheck = await checkQuota(tenant.organization_id);
  if (!quotaCheck.allowed) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Quota exceeded', details: quotaCheck }) };
  }

  // 5. Proceed with content generation
  // ... implementation continues
}
```

### 2. Rate Limiting & Quota Management

**Multi-Tier Rate Limits**:

| Plan Tier  | Content/Month | Words/Month | API Cost/Month | Concurrent Requests |
|------------|---------------|-------------|----------------|---------------------|
| Free       | 10            | 50,000      | $50            | 1                   |
| Starter    | 50            | 250,000     | $250           | 2                   |
| Pro        | 200           | 1,000,000   | $1,000         | 5                   |
| Enterprise | Unlimited     | Unlimited   | Custom         | 10                  |

**Implementation** (Token Bucket Algorithm):
```javascript
// lib/rate-limiter.js
import { createClient } from '@supabase/supabase-js';

export class MultiTenantRateLimiter {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async checkQuota(organizationId) {
    // 1. Get or create quota tracking record
    const { data: quota } = await this.supabase
      .from('quota_tracking')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    // 2. Check if current month
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    if (quota.current_month !== currentMonth) {
      // Reset quota for new month
      await this.resetQuota(organizationId, currentMonth);
      return { allowed: true, remaining: quota.max_content_pieces };
    }

    // 3. Check limits
    const checks = {
      contentPieces: quota.content_pieces_used < quota.max_content_pieces,
      words: quota.words_generated < quota.max_words_per_month,
      cost: quota.api_cost_spent < quota.max_api_cost_per_month
    };

    const allowed = Object.values(checks).every(Boolean);

    return {
      allowed,
      checks,
      remaining: {
        contentPieces: quota.max_content_pieces - quota.content_pieces_used,
        words: quota.max_words_per_month - quota.words_generated,
        cost: quota.max_api_cost_per_month - quota.api_cost_spent
      }
    };
  }

  async incrementUsage(organizationId, metrics) {
    // Update quota tracking atomically
    await this.supabase.rpc('increment_quota_usage', {
      p_organization_id: organizationId,
      p_content_pieces: metrics.contentPieces || 0,
      p_words: metrics.words || 0,
      p_cost: metrics.cost || 0
    });
  }
}

// Database function for atomic increments
-- SQL
CREATE OR REPLACE FUNCTION increment_quota_usage(
  p_organization_id UUID,
  p_content_pieces INTEGER,
  p_words INTEGER,
  p_cost NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE quota_tracking
  SET
    content_pieces_used = content_pieces_used + p_content_pieces,
    words_generated = words_generated + p_words,
    api_cost_spent = api_cost_spent + p_cost,
    is_over_quota = (
      content_pieces_used + p_content_pieces >= max_content_pieces OR
      words_generated + p_words >= max_words_per_month OR
      api_cost_spent + p_cost >= max_api_cost_per_month
    ),
    updated_at = NOW()
  WHERE organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql;
```

### 3. Business Brain Integration for Content Generation

**Enhanced System Prompt with Business Brain**:

```javascript
// lib/ai-content-generator.js
export async function generateContentWithBrain({
  organizationId,
  brainId,
  title,
  primaryKeyword,
  secondaryKeywords,
  additionalInstructions
}) {
  // 1. Load business brain and facts
  const { data: brain } = await supabase
    .from('business_brains')
    .select('*, organization:organizations(*)')
    .eq('id', brainId)
    .single();

  const { data: facts } = await supabase
    .from('brain_facts')
    .select('*')
    .eq('brain_id', brainId)
    .limit(50);

  // 2. Build enhanced system prompt
  const systemPrompt = `
You are a top-performing SEO strategist and content writer for ${brain.organization.brand_name}.

BRAND IDENTITY:
- Company: ${brain.organization.brand_name}
- Industry: ${brain.industry}
- Target Audience: ${brain.target_audience}
- Unique Value: ${brain.unique_value_propositions?.join(', ')}

BRAND VOICE:
- Tone: ${brain.writing_style}
- Keywords to emphasize: ${brain.tone_keywords?.join(', ')}
- Keywords to avoid: ${brain.avoid_keywords?.join(', ')}
- Reading level: ${brain.readability_level}th grade

COMPANY FACTS (use these to personalize content):
${facts.map(f => `- ${f.key}: ${JSON.stringify(f.value)}`).join('\n')}

CONTENT REQUIREMENTS:
- Write at least 1,200 words
- Optimize for primary keyword: {{PRIMARY_KEYWORD}}
- Support with secondary keywords: {{SECONDARY_KEYWORDS}}
- Include 5 FAQs based on search intent
- Add internal links to ${brain.organization.brand_name} services
- Add 1-2 external authoritative links
- Use Answer Box format (3-5 sentence direct answer)
- Include schema hints for structured data

TONE: ${brain.organization.brand_voice || 'Professional, engaging, helpful'}

${additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${additionalInstructions}` : ''}
`.trim();

  // 3. Generate content with Claude
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const startTime = Date.now();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt.replace('{{PRIMARY_KEYWORD}}', primaryKeyword)
                        .replace('{{SECONDARY_KEYWORDS}}', secondaryKeywords.join(', ')),
    messages: [{
      role: 'user',
      content: `Write a complete blog article titled: "${title}"\n\nPrimary keyword: ${primaryKeyword}\nSecondary keywords: ${secondaryKeywords.join(', ')}`
    }]
  });

  const content = message.content[0].text;
  const duration = Date.now() - startTime;

  // 4. Calculate cost (Claude Sonnet 4.5 pricing)
  const inputCost = (message.usage.input_tokens / 1000000) * 3; // $3 per 1M tokens
  const outputCost = (message.usage.output_tokens / 1000000) * 15; // $15 per 1M tokens
  const totalCost = inputCost + outputCost;

  // 5. Log usage
  await supabase.from('usage_logs').insert({
    organization_id: organizationId,
    operation_type: 'content_generation',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    tokens_input: message.usage.input_tokens,
    tokens_output: message.usage.output_tokens,
    api_cost: totalCost,
    duration_ms: duration,
    status: 'success'
  });

  // 6. Update quota
  const wordCount = content.split(/\s+/).length;
  await rateLimiter.incrementUsage(organizationId, {
    contentPieces: 1,
    words: wordCount,
    cost: totalCost
  });

  return {
    content,
    wordCount,
    usage: message.usage,
    cost: totalCost,
    duration
  };
}
```

### 4. White-Label UI Customization

**Organization-Specific Theming**:

```javascript
// components/content-writer/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function OrganizationThemeProvider({ organizationId, children }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    async function loadTheme() {
      const { data: org } = await supabase
        .from('organizations')
        .select('brand_name, logo_url, color_scheme')
        .eq('id', organizationId)
        .single();

      const colorScheme = typeof org.color_scheme === 'string'
        ? JSON.parse(org.color_scheme)
        : org.color_scheme;

      setTheme({
        brandName: org.brand_name,
        logoUrl: org.logo_url,
        colors: colorScheme || {
          primary: '#2C6BAA',
          secondary: '#C96F4C',
          accent: '#3C7A6A'
        }
      });
    }

    loadTheme();
  }, [organizationId]);

  if (!theme) return <div>Loading...</div>;

  return (
    <ThemeContext.Provider value={theme}>
      <style>{`
        :root {
          --color-primary: ${theme.colors.primary};
          --color-secondary: ${theme.colors.secondary};
          --color-accent: ${theme.colors.accent};
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export const useOrgTheme = () => useContext(ThemeContext);
```

---

## Technology Stack

### Backend Services (Netlify Functions)

```javascript
// Recommended packages
{
  // AI & LLM Orchestration
  "@anthropic-ai/sdk": "^0.65.0",           // Claude API
  "openai": "^5.23.0",                       // OpenAI API (text models)
  "@google/generative-ai": "^0.24.1",        // Gemini API
  "langchain": "^0.1.0",                     // LLM orchestration (optional)

  // Database & Authentication
  "@supabase/supabase-js": "^2.57.4",        // Supabase client

  // Rate Limiting & Caching
  "rate-limiter-flexible": "^3.0.0",         // Advanced rate limiting
  "ioredis": "^5.3.2",                       // Redis for distributed rate limiting (optional)

  // Content Processing
  "unified": "^11.0.0",                      // Markdown/HTML processing
  "rehype": "^13.0.0",                       // HTML processor
  "remark": "^15.0.0",                       // Markdown processor

  // Keyword Research
  "axios": "^1.6.0",                         // HTTP client for DataForSEO

  // Utilities
  "zod": "^3.22.0",                          // Schema validation
  "date-fns": "^3.0.0"                       // Date utilities
}
```

### Frontend Components (React)

```javascript
// Recommended packages
{
  // UI Components (already in use)
  "@radix-ui/*": "latest",                   // Radix UI primitives
  "lucide-react": "latest",                  // Icons

  // State Management
  "zustand": "^4.5.0",                       // Lightweight state management
  "swr": "^2.2.0",                           // Data fetching & caching

  // Forms & Validation
  "react-hook-form": "^7.50.0",              // Form management
  "zod": "^3.22.0",                          // Schema validation

  // Rich Text Editor
  "@tiptap/react": "^2.2.0",                 // Headless WYSIWYG editor
  "@tiptap/starter-kit": "^2.2.0",           // TipTap starter kit

  // Code Highlighting (for preview)
  "prismjs": "^1.29.0",                      // Syntax highlighting

  // Utilities
  "clsx": "^2.1.0",                          // Conditional classes
  "tailwind-merge": "^2.2.0"                 // Merge Tailwind classes
}
```

### Deployment & Infrastructure

- **Hosting**: Netlify (already in use)
- **Database**: Supabase PostgreSQL (already in use)
- **Authentication**: Supabase Auth with JWT
- **File Storage**: Cloudinary (already configured)
- **Serverless Functions**: Netlify Functions (Node.js 18)
- **CDN**: Netlify CDN + Cloudinary CDN
- **Monitoring**: Supabase Logs + Netlify Analytics

---

## Implementation Roadmap

### Phase 1: Foundation & Database (Weeks 1-2)

**Goals**: Set up multitenant database schema and authentication

**Tasks**:
- [ ] Create Supabase migration for all multitenant tables
- [ ] Implement RLS policies for tenant isolation
- [ ] Set up JWT authentication with tenant/organization claims
- [ ] Create seed data for testing (2-3 demo organizations)
- [ ] Write database tests for RLS policies

**Deliverables**:
- `supabase/migrations/YYYYMMDD_multitenant_content_system.sql`
- `docs/DATABASE_SCHEMA.md` - Complete schema documentation
- Seed data scripts

### Phase 2: API Layer & Business Brain Integration (Weeks 3-4)

**Goals**: Build backend API for content generation with business brain

**Tasks**:
- [ ] Create Netlify function: `ai-content-writer.js`
- [ ] Implement tenant resolution middleware
- [ ] Build business brain loader and fact retrieval
- [ ] Create enhanced system prompt generator
- [ ] Integrate Claude API with cost tracking
- [ ] Implement usage logging to `usage_logs` table

**Deliverables**:
- `netlify/functions/ai-content-writer.js`
- `lib/business-brain-loader.js`
- `lib/ai-content-generator.js`
- API documentation

### Phase 3: Rate Limiting & Quota Management (Week 5)

**Goals**: Implement per-tenant rate limiting and quota enforcement

**Tasks**:
- [ ] Build `MultiTenantRateLimiter` class
- [ ] Create `checkQuota()` and `incrementUsage()` methods
- [ ] Implement atomic quota updates (Postgres function)
- [ ] Add quota exceeded error handling
- [ ] Create quota reset cron job (monthly)
- [ ] Build usage dashboard for organizations

**Deliverables**:
- `lib/rate-limiter.js`
- `netlify/functions/quota-reset-cron.js`
- Admin dashboard showing quota usage

### Phase 4: Admin Nexus Module (Weeks 6-7)

**Goals**: Replace existing blog management with multitenant version

**Tasks**:
- [ ] Update `BlogManagementDashboard.jsx` for multitenant
- [ ] Add organization selector (for multi-org users)
- [ ] Add business brain selector
- [ ] Integrate new API endpoints
- [ ] Add usage/quota display
- [ ] Migrate existing posts to new schema
- [ ] Update content templates system

**Deliverables**:
- Updated `src/components/admin/BlogManagementDashboard.jsx`
- Migration script for existing posts
- Organization/brain management UI

### Phase 5: Client-Facing SaaS Tool (Weeks 8-10)

**Goals**: Build standalone AI content writer for /tools page

**Tasks**:
- [ ] Create `/tools/ai-content-writer` route
- [ ] Build registration/onboarding flow
- [ ] Create business brain setup wizard
- [ ] Build white-label theme system
- [ ] Create content project management UI
- [ ] Add keyword research integration
- [ ] Build content editor with preview
- [ ] Add export functionality (Markdown, HTML, DOCX)

**Deliverables**:
- `src/pages/tools/ai-content-writer.jsx`
- `src/components/content-writer/*` (10+ components)
- Onboarding flow
- White-label theming

### Phase 6: Templates & Advanced Features (Weeks 11-12)

**Goals**: Add content templates and advanced customization

**Tasks**:
- [ ] Build template management system
- [ ] Create 10+ default templates (blog, social, email, etc.)
- [ ] Add template marketplace (share/discover)
- [ ] Implement A/B testing for content variations
- [ ] Add content scheduling
- [ ] Build analytics dashboard
- [ ] Add webhook integrations (publish to WordPress, etc.)

**Deliverables**:
- Template library
- Template editor
- Analytics dashboard
- Webhook system

### Phase 7: Testing & Optimization (Weeks 13-14)

**Goals**: Comprehensive testing and performance optimization

**Tasks**:
- [ ] Write unit tests for all API functions
- [ ] Write integration tests for content generation flow
- [ ] Load testing (100+ concurrent tenants)
- [ ] Security audit (RLS policies, JWT validation)
- [ ] Performance optimization (query optimization, caching)
- [ ] Documentation (API docs, user guides)
- [ ] Beta testing with 3-5 real organizations

**Deliverables**:
- Test suite (80%+ coverage)
- Performance report
- Security audit report
- Complete documentation

### Phase 8: Launch & Monitoring (Week 15)

**Goals**: Production launch and monitoring setup

**Tasks**:
- [ ] Deploy to production
- [ ] Set up error monitoring (Sentry)
- [ ] Configure usage alerts
- [ ] Create admin dashboard for monitoring
- [ ] Set up billing integration (Stripe)
- [ ] Launch announcement and onboarding
- [ ] Monitor first 100 content generations

**Deliverables**:
- Production deployment
- Monitoring dashboards
- Billing system
- Launch materials

---

## Security & Compliance

### Row-Level Security (RLS) Policies

**Key Principles**:
1. **Default Deny**: All tables have RLS enabled with explicit allow policies
2. **Tenant Isolation**: Every query filtered by `organization_id` or `tenant_id`
3. **Service Role Bypass**: Admin operations use service role to bypass RLS
4. **JWT Claims**: Authentication tokens include `tenant_id` and `organization_id`

**Example Policy**:
```sql
-- Content pieces only visible to org members
CREATE POLICY "org_members_can_view_content"
  ON content_pieces FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM tenants
      WHERE auth_user_id = auth.uid()
    )
  );
```

### API Security

- **JWT Validation**: Verify signature and expiration on every request
- **Rate Limiting**: Per-tenant and per-IP rate limits
- **Input Sanitization**: Validate all user inputs with Zod schemas
- **SQL Injection**: Use parameterized queries (Supabase handles this)
- **XSS Protection**: Sanitize HTML content before rendering
- **CORS**: Restrict to known domains only

### Data Privacy

- **GDPR Compliance**:
  - Right to access (export all organization data)
  - Right to deletion (cascade delete organization)
  - Data portability (JSON export)
- **Encryption**:
  - Data at rest: Supabase encryption
  - Data in transit: HTTPS only
  - Sensitive fields: Consider pgcrypto for extra-sensitive data

### Audit Logging

```sql
-- Audit log for sensitive operations
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  tenant_id UUID REFERENCES tenants(id),

  -- Event details
  event_type TEXT NOT NULL, -- 'content_created', 'user_invited', 'quota_exceeded'
  entity_type TEXT, -- 'content_piece', 'tenant', 'organization'
  entity_id UUID,

  -- Changes
  old_values JSONB,
  new_values JSONB,

  -- Metadata
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Cost Management

### AI Provider Cost Tracking

**Claude Sonnet 4.5 Pricing** (as of Jan 2025):
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- Average 1,200-word article: ~$0.50-$1.00

**Cost Calculation**:
```javascript
function calculateAnthropicCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;
  return inputCost + outputCost;
}
```

### Budget Alerts

```javascript
// netlify/functions/quota-monitor.js
export async function handler(event, context) {
  // Run daily to check organizations approaching quota
  const { data: orgs } = await supabase
    .from('quota_tracking')
    .select('*, organization:organizations(*)')
    .gte('api_cost_spent', supabase.raw('max_api_cost_per_month * 0.8')) // 80% threshold
    .eq('is_over_quota', false);

  for (const org of orgs) {
    // Send warning email
    await sendEmail({
      to: org.organization.owner_email,
      subject: 'AI Content Writer: Approaching Quota Limit',
      body: `You've used ${org.api_cost_spent.toFixed(2)} of your ${org.max_api_cost_per_month} monthly budget.`
    });
  }
}
```

### Pricing Tiers Recommendations

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| **Price/month** | $0 | $49 | $199 | Custom |
| **Content pieces** | 10 | 50 | 200 | Unlimited |
| **Words/month** | 50K | 250K | 1M | Unlimited |
| **Business brains** | 1 | 3 | 10 | Unlimited |
| **Templates** | 5 public | 10 custom | 50 custom | Unlimited |
| **Team members** | 1 | 3 | 10 | Unlimited |
| **API access** | ❌ | ✅ | ✅ | ✅ |
| **White-label** | ❌ | ❌ | ✅ | ✅ |
| **Priority support** | ❌ | ❌ | ✅ | ✅ |

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

1. **Multi-Language Support**
   - Generate content in 50+ languages
   - Translation management
   - Localized SEO optimization

2. **AI Agent Workflows**
   - Research → Outline → Write → Edit → Publish
   - Auto-fact-checking with citations
   - Automated image generation for articles

3. **Advanced Analytics**
   - Content performance tracking
   - SEO ranking monitoring
   - ROI calculation per content piece

4. **Integrations**
   - WordPress auto-publishing
   - HubSpot CMS integration
   - Webflow CMS connector
   - Medium cross-posting
   - LinkedIn article publishing

5. **Collaboration Features**
   - Real-time collaborative editing
   - Comments and suggestions
   - Approval workflows
   - Version history

6. **Advanced Business Brain**
   - Automatic knowledge ingestion from website
   - Competitor monitoring and analysis
   - Industry trend detection
   - Voice/style cloning from existing content

---

## Appendix

### A. Database Migration Script

See: `supabase/migrations/YYYYMMDD_multitenant_content_system.sql` (to be created)

### B. API Endpoints Reference

```
POST   /api/content/generate          - Generate new content
GET    /api/content/:id               - Get content piece
PUT    /api/content/:id               - Update content
DELETE /api/content/:id               - Delete content
GET    /api/content/projects          - List projects
POST   /api/content/projects          - Create project

POST   /api/brains/facts              - Add brain fact
GET    /api/brains/:id/search         - Semantic search
POST   /api/brains/ingest             - Trigger knowledge ingestion

GET    /api/usage/current             - Current month usage
GET    /api/usage/history             - Historical usage
GET    /api/quota/status              - Quota status

GET    /api/templates                 - List templates
POST   /api/templates                 - Create template
```

### C. Environment Variables

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# AI Providers
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Keyword Research
DATAFORSEO_USERNAME=your_dataforseo_username
DATAFORSEO_PASSWORD=your_dataforseo_password

# Services
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Optional: Redis for distributed rate limiting
REDIS_URL=your_redis_url

# Optional: Email service
SENDGRID_API_KEY=your_sendgrid_key
```

---

## Next Steps

**To proceed with implementation**:

1. **Confirm base44 system reference**: Please provide the base44 AI content writing system repository/docs you want me to analyze for additional features
2. **Review this plan**: Approve architecture, database schema, and roadmap
3. **Prioritize features**: Which use case to build first (Admin Nexus module vs. client-facing tool)?
4. **Set timeline**: Confirm 15-week timeline or adjust based on resources

**Immediate action items**:
- [ ] Create database migration file
- [ ] Set up development environment
- [ ] Create project board with roadmap tasks
- [ ] Begin Phase 1 implementation

---

**Document Version**: 1.0.0
**Last Updated**: January 2025
**Status**: Awaiting approval and base44 system reference
