# SEO Modules Implementation Plan
## Advanced Keyword Research + Longtail Landing Page Generator

**Created:** 2025-10-16
**Status:** Planning Phase
**Systems:** Admin Nexus Backend Modules

---

## Executive Summary

This plan outlines the implementation of two sophisticated, interconnected SEO modules within the Admin Nexus backend:

1. **Advanced Keyword Research Module** - Enterprise-grade DataForSEO integration
2. **Longtail Landing Page Generator** - Automated, SEO-optimized page creation at scale

Both modules will be full-featured applications within the Admin Nexus backend, complete with comprehensive UI/UX, monitoring dashboards, and deep integration with existing systems (Business Brain, blog post generation, modules architecture).

---

## Critical Questions for User

Before proceeding with implementation, I need your input on these key decisions:

### 1. Module Strategy

**Question:** Should we **expand the existing Keyword Research module** OR create an entirely **new Advanced Keyword Research module**?

**Option A: Expand Existing** (Recommended)
- ✅ Preserve existing functionality
- ✅ Single unified keyword research experience
- ✅ Less code duplication
- ⚠️ More complex codebase

**Option B: Create New Module**
- ✅ Clean slate, no legacy code
- ✅ Can run both side-by-side during transition
- ⚠️ Code duplication
- ⚠️ User confusion (two keyword tools)

**My Recommendation:** Option A (expand existing)

---

### 2. Database Migration Timing

**Question:** When should we apply the pending migrations?

**Current State:**
- ❌ Modules infrastructure NOT applied (modules, module_runs, module_access, module_configs)
- ⚠️ Business Brain partially applied (simplified schema)
- ✅ Posts table has keyword columns (primary_keyword, secondary_keywords)

**Options:**
1. **Apply all migrations now** - Full functionality immediately
2. **Apply incrementally** - Modules first, then others
3. **Custom migration** - Create new schema optimized for these modules

**My Recommendation:** Apply modules infrastructure immediately, this is foundational.

---

### 3. Landing Page Storage Strategy

**Question:** Where should generated landing pages be stored?

**Option A: Posts Table** (Extend existing)
- Store landing pages as posts with `content_type = 'landing_page'`
- ✅ Reuses existing infrastructure (publishing, SEO, media)
- ✅ Unified content management
- ⚠️ Posts table gets very large

**Option B: Dedicated Table** (New `landing_pages` table)
- Separate table specifically for landing pages
- ✅ Cleaner separation of concerns
- ✅ Landing-page-specific fields
- ⚠️ Need to recreate publishing workflow

**Option C: Hybrid** (Pages reference keywords, store metadata separately)
- Landing pages in posts table
- Additional `landing_page_metadata` table for SEO-specific data
- ✅ Best of both worlds
- ⚠️ More complex queries

**My Recommendation:** Option C (hybrid approach)

---

### 4. Content Generation Strategy

**Question:** How should landing pages be generated?

**Option A: Claude Sonnet 4.5** (AI Generation)
- Use existing AI Content Writer patterns
- ✅ High-quality, unique content
- ✅ Brand voice integration
- ⚠️ Higher cost per page ($0.15-0.30)
- ⚠️ Slower generation

**Option B: DataForSEO Content API** (API-Based)
- Use DataForSEO's content generation endpoints
- ✅ Faster generation
- ✅ Lower cost per page
- ⚠️ Less brand-customized

**Option C: Template System** (Fill-in-the-blank)
- Pre-built templates with variable substitution
- ✅ Fastest, cheapest
- ✅ Consistent structure
- ⚠️ Less unique, potential doorway page issues

**Option D: Hybrid** (Templates + AI enhancement)
- Generate structure from templates
- Use AI to enhance uniqueness and quality
- ✅ Balance of speed, cost, quality
- ⚠️ More complex implementation

**My Recommendation:** Option D (hybrid approach) with AI quality gates

---

### 5. Admin UI Placement

**Question:** How should these modules appear in Admin Nexus?

**Option A: Two Separate Modules**
- "SEO Keyword Research" and "Landing Page Generator" as distinct modules
- ✅ Clear separation
- ⚠️ Context switching between modules

**Option B: Single "SEO Suite" Module**
- Unified module with tabs: Research | Landing Pages | Monitoring
- ✅ Single context
- ✅ Easier keyword → page workflow
- ⚠️ More complex single module

**Option C: Three Modules**
- "Keyword Research" | "Landing Page Generator" | "SEO Analytics"
- ✅ Full separation of concerns
- ⚠️ Most complex navigation

**My Recommendation:** Option B (single SEO Suite) with internal navigation

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN NEXUS BACKEND                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │               SEO SUITE MODULE                             │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │   Keyword    │  │   Landing    │  │       SEO       │ │ │
│  │  │   Research   │──│     Page     │──│    Analytics    │ │ │
│  │  │              │  │   Generator  │  │   & Monitoring  │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │ │
│  │         │                 │                    │          │ │
│  └─────────┼─────────────────┼────────────────────┼──────────┘ │
│            │                 │                    │            │
└────────────┼─────────────────┼────────────────────┼────────────┘
             │                 │                    │
             ▼                 ▼                    ▼
    ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  DataForSEO    │  │   Claude API    │  │   Supabase DB   │
    │   (15+ APIs)   │  │  (Sonnet 4.5)   │  │  (PostgreSQL)   │
    └────────────────┘  └─────────────────┘  └─────────────────┘
             │                 │                    │
             └─────────────────┴────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Business Brain     │
                    │  (Brand Context)     │
                    └──────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  Blog Post           │      │  Public Landing      │
    │  Generator           │      │  Pages (Live Site)   │
    └──────────────────────┘      └──────────────────────┘
```

---

## Database Schema Design

### New Tables Required

#### 1. `keywords` - Central Keyword Repository

```sql
CREATE TABLE keywords (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  keyword_hash TEXT UNIQUE, -- MD5(lowercase(keyword) + location)

  -- Source & Context
  source TEXT NOT NULL, -- 'manual' | 'dataforseo_suggestions' | 'dataforseo_ideas' | etc.
  brain_id UUID REFERENCES business_brains(id),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  discovered_by UUID, -- Admin user who found it

  -- Location & Language
  location_code INTEGER NOT NULL DEFAULT 2840, -- DataForSEO location code
  location_name TEXT,
  language_code TEXT DEFAULT 'en',

  -- DataForSEO Metrics (from Keyword Overview API)
  search_volume INTEGER,
  cpc NUMERIC(10, 2),
  competition NUMERIC(3, 2), -- 0.00 to 1.00
  competition_level TEXT CHECK (competition_level IN ('Low', 'Medium', 'High')),
  keyword_difficulty INTEGER, -- 0 to 100

  -- Trend Data (from Historical/Trends APIs)
  trend_direction TEXT CHECK (trend_direction IN ('rising', 'stable', 'declining')),
  trend_score NUMERIC(3, 2), -- -1.00 to 1.00
  seasonal BOOLEAN DEFAULT FALSE,
  monthly_volumes JSONB, -- { "2024-01": 1000, "2024-02": 1200, ... }

  -- Intent & Classification
  search_intent TEXT CHECK (search_intent IN (
    'informational', 'commercial', 'transactional', 'navigational'
  )),
  keyword_type TEXT CHECK (keyword_type IN (
    'head', 'body', 'longtail', 'question', 'local'
  )),

  -- Opportunity Scoring
  opportunity_score NUMERIC(5, 2), -- 0 to 100
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),

  -- SERP Features (from SERP API)
  has_featured_snippet BOOLEAN DEFAULT FALSE,
  has_people_also_ask BOOLEAN DEFAULT FALSE,
  has_local_pack BOOLEAN DEFAULT FALSE,
  has_ai_overview BOOLEAN DEFAULT FALSE,
  serp_features JSONB, -- Full SERP feature details

  -- Content Assignment
  assigned_to_landing_page_id UUID, -- Which landing page uses this keyword
  assigned_to_post_id UUID,
  assignment_status TEXT CHECK (assignment_status IN (
    'available', 'assigned', 'published', 'archived'
  )) DEFAULT 'available',

  -- Metadata
  tags TEXT[],
  notes TEXT,
  custom_data JSONB,

  -- DataForSEO Raw Data
  dataforseo_raw JSONB, -- Complete API response for reference

  -- Tracking
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keywords_keyword ON keywords(keyword);
CREATE INDEX idx_keywords_brain_id ON keywords(brain_id);
CREATE INDEX idx_keywords_opportunity_score ON keywords(opportunity_score DESC);
CREATE INDEX idx_keywords_assignment_status ON keywords(assignment_status);
CREATE INDEX idx_keywords_search_volume ON keywords(search_volume DESC);
CREATE INDEX idx_keywords_difficulty ON keywords(keyword_difficulty);
CREATE INDEX idx_keywords_type ON keywords(keyword_type);
CREATE INDEX idx_keywords_intent ON keywords(search_intent);
CREATE INDEX idx_keywords_priority ON keywords(priority);
```

**Purpose:** Central repository for all discovered keywords with complete DataForSEO metrics.

**Key Features:**
- Deduplication via `keyword_hash`
- Full DataForSEO metric storage
- Opportunity scoring algorithm
- Assignment tracking
- Historical trend data

---

#### 2. `keyword_research_runs` - Research Session Tracking

```sql
CREATE TABLE keyword_research_runs (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Context
  brain_id UUID REFERENCES business_brains(id),
  admin_user_id UUID,
  run_type TEXT CHECK (run_type IN (
    'suggestions', 'ideas', 'related', 'site_keywords', 
    'top_searches', 'trends', 'manual'
  )),
  
  -- Input Parameters
  seed_keywords TEXT[],
  location_code INTEGER,
  language_code TEXT,
  filters JSONB, -- User-specified filters
  
  -- Results
  keywords_discovered INTEGER DEFAULT 0,
  keywords_saved INTEGER DEFAULT 0,
  top_opportunities JSONB, -- Top 10 keywords by opportunity score
  
  -- DataForSEO Costs
  api_calls_made INTEGER DEFAULT 0,
  api_cost_usd NUMERIC(10, 4),
  
  -- Performance
  duration_ms INTEGER,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_research_runs_brain ON keyword_research_runs(brain_id);
CREATE INDEX idx_research_runs_created ON keyword_research_runs(created_at DESC);
```

**Purpose:** Track each keyword research session for analytics and cost management.

---

#### 3. `landing_pages_metadata` - Landing Page SEO Data

```sql
CREATE TABLE landing_pages_metadata (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL UNIQUE, -- References posts table
  
  -- Target Keyword
  target_keyword_id UUID REFERENCES keywords(id) NOT NULL,
  
  -- Secondary Keywords (up to 5 per page)
  secondary_keyword_ids UUID[],
  
  -- Page Generation
  generation_method TEXT CHECK (generation_method IN (
    'template', 'ai', 'hybrid', 'manual'
  )),
  generation_template TEXT, -- Which template was used
  ai_model TEXT, -- 'claude-sonnet-4.5-20250929' if AI used
  generation_cost_usd NUMERIC(10, 4),
  generation_duration_ms INTEGER,
  
  -- Content Quality Scores
  uniqueness_score NUMERIC(3, 2), -- 0.00 to 1.00 (vs existing content)
  readability_score INTEGER, -- Flesch reading ease
  keyword_density NUMERIC(3, 2), -- Primary keyword density percentage
  content_length_words INTEGER,
  
  -- SEO Elements
  h1_tag TEXT,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  schema_markup JSONB, -- FAQ, HowTo, Article schemas
  internal_links TEXT[], -- URLs of internal links added
  
  -- SERP Tracking
  target_serp_features TEXT[], -- Which SERP features to target
  current_position INTEGER, -- Current SERP position (1-100)
  best_position INTEGER, -- Best position ever achieved
  position_history JSONB, -- { "2025-01-15": 45, "2025-01-22": 38, ... }
  last_rank_check_at TIMESTAMPTZ,
  
  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5, 4), -- Click-through rate
  avg_position NUMERIC(5, 2),
  
  -- Page Status
  quality_gate_passed BOOLEAN DEFAULT FALSE,
  quality_issues TEXT[], -- Array of issues if quality gate failed
  published_status TEXT CHECK (published_status IN (
    'draft', 'review', 'published', 'archived', 'needs_refresh'
  )) DEFAULT 'draft',
  
  -- Iteration Tracking
  version INTEGER DEFAULT 1,
  last_refreshed_at TIMESTAMPTZ,
  refresh_reason TEXT, -- Why was page refreshed
  
  -- Metadata
  notes TEXT,
  custom_data JSONB,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_landing_meta_post ON landing_pages_metadata(post_id);
CREATE INDEX idx_landing_meta_keyword ON landing_pages_metadata(target_keyword_id);
CREATE INDEX idx_landing_meta_position ON landing_pages_metadata(current_position);
CREATE INDEX idx_landing_meta_status ON landing_pages_metadata(published_status);
CREATE INDEX idx_landing_meta_quality ON landing_pages_metadata(quality_gate_passed);
```

**Purpose:** Extended SEO metadata for landing pages beyond what posts table provides.

---

#### 4. `landing_page_templates` - Content Templates

```sql
CREATE TABLE landing_page_templates (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template Definition
  template_name TEXT NOT NULL,
  template_slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Template Type
  page_type TEXT CHECK (page_type IN (
    'how_to', 'service_location', 'product_category', 
    'comparison', 'listicle', 'guide', 'landing'
  )),
  
  -- Template Structure
  structure JSONB NOT NULL, -- Complete page structure
  /*
  Example structure:
  {
    "sections": [
      {
        "type": "hero",
        "template": "{{h1}} - {{business_name}}",
        "variables": ["h1", "business_name"]
      },
      {
        "type": "intro",
        "template": "If you're looking for {{keyword}}, you're in the right place...",
        "variables": ["keyword"]
      },
      {
        "type": "benefits",
        "count": 4,
        "template": "### {{benefit_title}}\n{{benefit_description}}"
      },
      {
        "type": "how_it_works",
        "steps": 5
      },
      {
        "type": "faq",
        "questions": 4
      },
      {
        "type": "cta"
      }
    ]
  }
  */
  
  -- Required Variables
  required_variables TEXT[], -- ['keyword', 'industry', 'location', ...]
  optional_variables TEXT[],
  
  -- AI Enhancement Rules
  ai_enhancement_enabled BOOLEAN DEFAULT TRUE,
  ai_enhancement_sections TEXT[], -- Which sections to enhance with AI
  ai_prompt_template TEXT, -- Prompt for AI enhancement
  
  -- SEO Configuration
  schema_types TEXT[], -- ['Article', 'FAQPage', 'HowTo']
  target_word_count_min INTEGER,
  target_word_count_max INTEGER,
  internal_link_count INTEGER DEFAULT 3,
  
  -- Quality Gates
  min_uniqueness_score NUMERIC(3, 2) DEFAULT 0.85,
  max_keyword_density NUMERIC(3, 2) DEFAULT 0.03,
  required_headings TEXT[], -- Must have h1, h2, h3, etc.
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_slug ON landing_page_templates(template_slug);
CREATE INDEX idx_templates_type ON landing_page_templates(page_type);
CREATE INDEX idx_templates_active ON landing_page_templates(is_active);
```

**Purpose:** Reusable templates for rapid landing page generation with AI enhancement.

---

#### 5. `keyword_clusters` - Keyword Grouping

```sql
CREATE TABLE keyword_clusters (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Cluster Definition
  cluster_name TEXT NOT NULL,
  cluster_slug TEXT UNIQUE NOT NULL,
  brain_id UUID REFERENCES business_brains(id),
  
  -- Cluster Analysis
  primary_topic TEXT,
  search_intent TEXT, -- Dominant intent of cluster
  total_search_volume INTEGER, -- Combined volume of all keywords
  avg_difficulty NUMERIC(5, 2),
  
  -- Content Strategy
  content_strategy TEXT, -- How to approach this cluster
  recommended_content_types TEXT[], -- ['blog', 'landing_page', 'guide', ...]
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  
  -- Keywords in Cluster
  keyword_ids UUID[], -- Array of keyword IDs
  keyword_count INTEGER DEFAULT 0,
  
  -- Assignments
  pillar_page_id UUID, -- Main hub page for this cluster
  cluster_pages UUID[], -- All pages targeting this cluster
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  custom_data JSONB,
  
  -- Tracking
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clusters_brain ON keyword_clusters(brain_id);
CREATE INDEX idx_clusters_priority ON keyword_clusters(priority);
```

**Purpose:** Group related keywords for topic cluster SEO strategy.

---

#### 6. `serp_tracking` - SERP Position History

```sql
CREATE TABLE serp_tracking (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What's being tracked
  keyword_id UUID REFERENCES keywords(id),
  page_id UUID, -- Post ID from posts table
  url TEXT, -- Actual URL being tracked
  
  -- SERP Data
  position INTEGER CHECK (position >= 1 AND position <= 100),
  serp_features TEXT[], -- Features on page: ['featured_snippet', 'people_also_ask', ...]
  has_our_featured_snippet BOOLEAN DEFAULT FALSE,
  has_our_paa BOOLEAN DEFAULT FALSE,
  
  -- Competition
  top_10_urls TEXT[], -- URLs ranking in top 10
  competitor_positions JSONB, -- { "competitor.com": 3, "other.com": 7 }
  
  -- Performance
  estimated_traffic INTEGER, -- Based on CTR curve and volume
  
  -- DataForSEO Raw
  serp_raw JSONB, -- Complete SERP API response
  
  -- Tracking
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_serp_keyword ON serp_tracking(keyword_id);
CREATE INDEX idx_serp_page ON serp_tracking(page_id);
CREATE INDEX idx_serp_checked ON serp_tracking(checked_at DESC);
CREATE INDEX idx_serp_position ON serp_tracking(position);
```

**Purpose:** Historical SERP position tracking for rank monitoring.

---

### Extended Posts Table Columns

Add to existing `posts` table (via migration):

```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'blog_post';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_landing_page BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS keyword_data JSONB; -- Full DataForSEO data
ALTER TABLE posts ADD COLUMN IF NOT EXISTS target_serp_features TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS internal_link_strategy JSONB;

-- Add check constraint for content_type
ALTER TABLE posts ADD CONSTRAINT check_content_type 
  CHECK (content_type IN ('blog_post', 'landing_page', 'guide', 'pillar', 'resource'));

-- Index for landing pages
CREATE INDEX idx_posts_landing_pages ON posts(is_landing_page) WHERE is_landing_page = TRUE;
CREATE INDEX idx_posts_content_type ON posts(content_type);
```

---

## DataForSEO Integration Layer

### API Endpoints to Integrate (15+ endpoints)

#### 1. Keyword Discovery APIs

**1.1 Keyword Suggestions**
```javascript
POST /v3/dataforseo_labs/google/keyword_suggestions/live
// Find question-based longtail keywords
// Supports filters: ["keyword", "like", "%how%"]
```

**1.2 Keyword Ideas**
```javascript
POST /v3/dataforseo_labs/google/keyword_ideas/live
// Broad keyword expansion from seed list (up to 200 seeds)
```

**1.3 Keywords For Site**
```javascript
POST /v3/dataforseo_labs/google/keywords_for_site/live
// Reverse-engineer keywords from competitor URLs
```

**1.4 Related Keywords**
```javascript
POST /v3/dataforseo_labs/google/related_keywords/live
// "Searches related to" graph expansion
// Support depth parameter for breadth
```

**1.5 Top Searches**
```javascript
POST /v3/dataforseo_labs/google/top_searches/live
// Popular searches in location
// Pagination via offset_token
```

---

#### 2. Metrics & Analysis APIs

**2.1 Keyword Overview**
```javascript
POST /v3/dataforseo_labs/google/keyword_overview/live
// Complete metrics: volume, CPC, competition, intent
```

**2.2 Historical Keyword Data**
```javascript
POST /v3/dataforseo_labs/google/historical_keyword_data/live
// Multi-year search volume history
// Identify seasonality and trends
```

**2.3 Keyword Difficulty**
```javascript
POST /v3/dataforseo_labs/google/bulk_keyword_difficulty/live
// Ranking difficulty score (0-100)
// Bulk processing up to hundreds of keywords
```

**2.4 Ranked Keywords**
```javascript
POST /v3/dataforseo_labs/google/ranked_keywords/live
// See what you/competitors rank for
// Filter by item_types for AI Overview tracking
```

---

#### 3. SERP Analysis APIs

**3.1 SERP Live Advanced**
```javascript
POST /v3/serp/google/organic/live/advanced
// Complete top-100 SERP results
// Featured snippets, PAA, local packs, AI overviews
```

---

#### 4. Trends APIs

**4.1 Trends Explore**
```javascript
POST /v3/dataforseo_trends/google/explore/live
// Time-series trend data
// Rising/declining keyword analysis
```

**4.2 Subregion Interests**
```javascript
POST /v3/dataforseo_trends/google/subregion_interests/live
// Geographic heat mapping
// Find regional keyword hotspots
```

---

#### 5. Content Generation APIs (Optional)

**5.1 Generate Text**
```javascript
POST /v3/content_generation/generate_text/live
// AI content generation via DataForSEO
```

**5.2 Generate Meta Tags**
```javascript
POST /v3/content_generation/generate_meta_tags/live
// Auto-generate SEO meta tags
```

**5.3 Generate Subtopics**
```javascript
POST /v3/content_generation/generate_sub_topics/live
// Content outline generation
```

---

### DataForSEO Integration Architecture

```javascript
// src/lib/dataforseo/client.js

export class DataForSEOClient {
  constructor() {
    this.login = process.env.DATAFORSEO_LOGIN;
    this.password = process.env.DATAFORSEO_PASSWORD;
    this.baseURL = 'https://api.dataforseo.com';
  }

  async request(endpoint, payload) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${this.login}:${this.password}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    return data;
  }

  // Keyword Discovery
  async keywordSuggestions(keyword, location = 2840, filters = null) {
    return this.request('/v3/dataforseo_labs/google/keyword_suggestions/live', [{
      keyword,
      location_code: location,
      language_name: 'English',
      filters: filters || ["keyword", "like", "%how%"],
      limit: 500
    }]);
  }

  async keywordIdeas(keywords, location = 2840) {
    return this.request('/v3/dataforseo_labs/google/keyword_ideas/live', [{
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      location_code: location,
      language_code: 'en',
      limit: 1000
    }]);
  }

  async keywordsForSite(domain, location = 2840) {
    return this.request('/v3/dataforseo_labs/google/keywords_for_site/live', [{
      target: domain,
      location_code: location,
      language_name: 'English'
    }]);
  }

  async relatedKeywords(keyword, depth = 1, location = 2840) {
    return this.request('/v3/dataforseo_labs/google/related_keywords/live', [{
      keyword,
      depth,
      location_code: location,
      language_code: 'en'
    }]);
  }

  // Metrics & Analysis
  async keywordOverview(keywords, location = 2840) {
    return this.request('/v3/dataforseo_labs/google/keyword_overview/live', [{
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      location_code: location,
      language_code: 'en'
    }]);
  }

  async historicalKeywordData(keywords, location = 2840) {
    return this.request('/v3/dataforseo_labs/google/historical_keyword_data/live', [{
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      location_code: location,
      language_code: 'en'
    }]);
  }

  async bulkKeywordDifficulty(keywords, location = 2840) {
    return this.request('/v3/dataforseo_labs/google/bulk_keyword_difficulty/live', [{
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      location_code: location,
      language_name: 'English'
    }]);
  }

  async rankedKeywords(target, location = 2840) {
    return this.request('/v3/dataforseo_labs/google/ranked_keywords/live', [{
      target,
      location_code: location,
      language_code: 'en'
    }]);
  }

  // SERP Analysis
  async serpLive(keyword, location = 2840) {
    return this.request('/v3/serp/google/organic/live/advanced', [{
      keyword,
      location_code: location,
      language_name: 'English'
    }]);
  }

  // Trends
  async trendsExplore(keywords, location = 2840) {
    return this.request('/v3/dataforseo_trends/google/explore/live', [{
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      location_code: location,
      language_code: 'en'
    }]);
  }

  async subregionInterests(keyword, location = 2840) {
    return this.request('/v3/dataforseo_trends/google/subregion_interests/live', [{
      keyword,
      location_code: location,
      language_code: 'en'
    }]);
  }

  // Content Generation (if using DataForSEO AI)
  async generateText(prompt, targetLength = 'medium') {
    return this.request('/v3/content_generation/generate_text/live', [{
      prompt,
      target_length: targetLength
    }]);
  }

  async generateMetaTags(content, keyword) {
    return this.request('/v3/content_generation/generate_meta_tags/live', [{
      content,
      keyword
    }]);
  }
}

export const dataForSEO = new DataForSEOClient();
```

---

## UI/UX Design - Admin Modules

### Module Structure: SEO Suite

**Location:** `src/admin/modules/SEOSuite.jsx`

**Navigation:**
```
Admin Nexus > SEO Suite
  ├── Research (Keyword Discovery & Analysis)
  ├── Landing Pages (Generator & Manager)
  └── Analytics (Monitoring & Performance)
```

---

### Tab 1: Research - Keyword Discovery & Analysis

#### UI Components

**1. Discovery Panel** (Left Side - 40% width)

```jsx
<DiscoveryPanel>
  {/* Seed Input */}
  <SeedInput
    placeholder="Enter seed keywords (comma-separated)"
    value={seeds}
    onChange={setSeeds}
  />
  
  {/* Discovery Method */}
  <MethodSelector>
    <RadioGroup>
      <Radio value="suggestions">Question Keywords (How/What/Why)</Radio>
      <Radio value="ideas">Broad Expansion (Category)</Radio>
      <Radio value="related">Related Searches (Depth)</Radio>
      <Radio value="competitors">Competitor Keywords (URL)</Radio>
      <Radio value="trends">Trending (Rising Searches)</Radio>
      <Radio value="site">Your Site (Current Rankings)</Radio>
    </RadioGroup>
  </MethodSelector>
  
  {/* Filters */}
  <FiltersPanel collapsible>
    <LocationSelector
      value={location}
      options={[
        { value: 2840, label: 'United States' },
        { value: 2826, label: 'United Kingdom' },
        { value: 2124, label: 'Canada' },
        { value: 2036, label: 'Australia' }
      ]}
    />
    
    <SearchVolumeRange
      min={0}
      max={1000000}
      value={volumeRange}
      onChange={setVolumeRange}
    />
    
    <DifficultyRange
      min={0}
      max={100}
      value={difficultyRange}
      onChange={setDifficultyRange}
    />
    
    <IntentFilter
      options={['informational', 'commercial', 'transactional', 'navigational']}
      selected={selectedIntents}
      onChange={setSelectedIntents}
    />
    
    <KeywordTypeFilter
      options={['longtail', 'question', 'local', 'head', 'body']}
      selected={selectedTypes}
      onChange={setSelectedTypes}
    />
    
    <SERPFeaturesFilter
      options={[
        { value: 'featured_snippet', label: 'Featured Snippet' },
        { value: 'people_also_ask', label: 'People Also Ask' },
        { value: 'local_pack', label: 'Local Pack' },
        { value: 'ai_overview', label: 'AI Overview' }
      ]}
      selected={selectedFeatures}
      onChange={setSelectedFeatures}
    />
  </FiltersPanel>
  
  {/* Action Buttons */}
  <ButtonGroup>
    <Button variant="primary" onClick={handleDiscover}>
      Discover Keywords
    </Button>
    <Button variant="secondary" onClick={handleSaveFilters}>
      Save Filter Preset
    </Button>
  </ButtonGroup>
  
  {/* Cost Estimate */}
  <CostEstimate>
    Estimated API Cost: ${estimatedCost.toFixed(2)}
    <Tooltip>
      Based on selected method and filters.
      Actual cost charged after execution.
    </Tooltip>
  </CostEstimate>
</DiscoveryPanel>
```

**2. Results Table** (Right Side - 60% width)

```jsx
<ResultsTable>
  {/* Header with Controls */}
  <TableHeader>
    <ResultsCount>{keywords.length} keywords found</ResultsCount>
    
    <SortDropdown
      options={[
        { value: 'opportunity', label: 'Opportunity Score' },
        { value: 'volume', label: 'Search Volume' },
        { value: 'difficulty', label: 'Difficulty (Low to High)' },
        { value: 'cpc', label: 'CPC (High to Low)' },
        { value: 'trend', label: 'Trend (Rising First)' }
      ]}
      value={sortBy}
      onChange={setSortBy}
    />
    
    <BulkActions>
      <Checkbox
        checked={allSelected}
        onChange={toggleSelectAll}
        label={`Select All (${selectedCount})`}
      />
      
      <Button onClick={handleSaveSelected} disabled={selectedCount === 0}>
        Save Selected ({selectedCount})
      </Button>
      
      <Button onClick={handleCreateLandingPages} disabled={selectedCount === 0}>
        Create Landing Pages ({selectedCount})
      </Button>
      
      <Button onClick={handleExportCSV}>
        Export to CSV
      </Button>
    </BulkActions>
  </TableHeader>
  
  {/* Table */}
  <DataTable>
    <thead>
      <tr>
        <th><Checkbox /></th>
        <th sortable>Keyword</th>
        <th sortable>Volume</th>
        <th sortable>Difficulty</th>
        <th sortable>CPC</th>
        <th sortable>Opportunity</th>
        <th sortable>Trend</th>
        <th>Intent</th>
        <th>SERP Features</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {keywords.map(keyword => (
        <KeywordRow
          key={keyword.id}
          keyword={keyword}
          selected={isSelected(keyword.id)}
          onSelect={toggleSelect}
        >
          <td><Checkbox checked={isSelected(keyword.id)} /></td>
          
          <td className="keyword-cell">
            <KeywordText>{keyword.keyword}</KeywordText>
            <KeywordBadges>
              {keyword.keyword_type === 'question' && <Badge color="blue">Question</Badge>}
              {keyword.keyword_type === 'local' && <Badge color="green">Local</Badge>}
              {keyword.keyword_type === 'longtail' && <Badge color="purple">Longtail</Badge>}
            </KeywordBadges>
          </td>
          
          <td className="volume-cell">
            <VolumeDisplay volume={keyword.search_volume} />
          </td>
          
          <td className="difficulty-cell">
            <DifficultyBar
              value={keyword.keyword_difficulty}
              color={getDifficultyColor(keyword.keyword_difficulty)}
            />
            <span>{keyword.keyword_difficulty}/100</span>
          </td>
          
          <td className="cpc-cell">
            ${keyword.cpc?.toFixed(2) || '0.00'}
          </td>
          
          <td className="opportunity-cell">
            <OpportunityScore score={keyword.opportunity_score} />
            {keyword.priority === 'critical' && (
              <Badge color="red">Critical</Badge>
            )}
          </td>
          
          <td className="trend-cell">
            <TrendIndicator
              direction={keyword.trend_direction}
              score={keyword.trend_score}
            />
          </td>
          
          <td className="intent-cell">
            <IntentBadge intent={keyword.search_intent} />
          </td>
          
          <td className="serp-cell">
            <SERPFeatureIcons>
              {keyword.has_featured_snippet && (
                <Icon name="star" tooltip="Featured Snippet" />
              )}
              {keyword.has_people_also_ask && (
                <Icon name="help-circle" tooltip="People Also Ask" />
              )}
              {keyword.has_local_pack && (
                <Icon name="map-pin" tooltip="Local Pack" />
              )}
              {keyword.has_ai_overview && (
                <Icon name="sparkles" tooltip="AI Overview" />
              )}
            </SERPFeatureIcons>
          </td>
          
          <td className="actions-cell">
            <DropdownMenu>
              <MenuItem onClick={() => handleViewDetails(keyword)}>
                View Full Details
              </MenuItem>
              <MenuItem onClick={() => handleViewSERP(keyword)}>
                View SERP
              </MenuItem>
              <MenuItem onClick={() => handleCreateLandingPage(keyword)}>
                Create Landing Page
              </MenuItem>
              <MenuItem onClick={() => handleAssignToBlogPost(keyword)}>
                Assign to Blog Post
              </MenuItem>
              <MenuItem onClick={() => handleAddToCluster(keyword)}>
                Add to Cluster
              </MenuItem>
              <MenuItem onClick={() => handleSaveKeyword(keyword)}>
                Save to Database
              </MenuItem>
            </DropdownMenu>
          </td>
        </KeywordRow>
      ))}
    </tbody>
  </DataTable>
</ResultsTable>
```

**3. Keyword Detail Drawer** (Slide-out panel)

```jsx
<KeywordDetailDrawer open={detailOpen} keyword={selectedKeyword}>
  <DrawerHeader>
    <h2>{selectedKeyword.keyword}</h2>
    <CloseButton onClick={closeDetail} />
  </DrawerHeader>
  
  <DrawerBody>
    {/* Overview Section */}
    <Section title="Overview">
      <MetricCard label="Search Volume" value={selectedKeyword.search_volume} />
      <MetricCard label="CPC" value={`$${selectedKeyword.cpc}`} />
      <MetricCard label="Competition" value={selectedKeyword.competition_level} />
      <MetricCard label="Difficulty" value={`${selectedKeyword.keyword_difficulty}/100`} />
      <MetricCard label="Opportunity Score" value={selectedKeyword.opportunity_score} />
    </Section>
    
    {/* Trend Chart */}
    <Section title="12-Month Trend">
      <LineChart
        data={selectedKeyword.monthly_volumes}
        xKey="month"
        yKey="volume"
        height={200}
      />
    </Section>
    
    {/* SERP Features */}
    <Section title="SERP Features">
      <FeatureList>
        {selectedKeyword.serp_features?.map(feature => (
          <FeatureItem key={feature.type}>
            <FeatureIcon type={feature.type} />
            <FeatureLabel>{feature.label}</FeatureLabel>
            <FeatureOwner>{feature.owned_by}</FeatureOwner>
          </FeatureItem>
        ))}
      </FeatureList>
    </Section>
    
    {/* Top 10 Competitors */}
    <Section title="Top 10 Ranking URLs">
      <CompetitorList>
        {selectedKeyword.top_10_urls?.map((url, index) => (
          <CompetitorItem key={url} position={index + 1}>
            <Position>#{index + 1}</Position>
            <URL href={url} target="_blank">{url}</URL>
          </CompetitorItem>
        ))}
      </CompetitorList>
    </Section>
    
    {/* Related Keywords */}
    <Section title="Related Keywords">
      <RelatedKeywordsList>
        {selectedKeyword.related?.map(related => (
          <RelatedKeyword
            key={related.keyword}
            keyword={related}
            onSelect={handleSelectRelated}
          />
        ))}
      </RelatedKeywordsList>
    </Section>
    
    {/* Actions */}
    <Section title="Actions">
      <ActionButtons>
        <Button variant="primary" onClick={() => handleCreateLandingPage(selectedKeyword)}>
          Create Landing Page
        </Button>
        <Button variant="secondary" onClick={() => handleAssignToBlogPost(selectedKeyword)}>
          Assign to Blog Post
        </Button>
        <Button variant="secondary" onClick={() => handleSaveKeyword(selectedKeyword)}>
          Save to Database
        </Button>
        <Button variant="outline" onClick={() => handleRefreshData(selectedKeyword)}>
          Refresh Data
        </Button>
      </ActionButtons>
    </Section>
  </DrawerBody>
</KeywordDetailDrawer>
```

**4. Saved Keywords Library** (Bottom Panel - Collapsible)

```jsx
<SavedKeywordsLibrary collapsible defaultCollapsed>
  <LibraryHeader>
    <h3>Saved Keywords Library ({savedKeywords.length})</h3>
    
    <LibraryFilters>
      <SearchBox
        placeholder="Search saved keywords..."
        value={librarySearch}
        onChange={setLibrarySearch}
      />
      
      <FilterDropdown
        label="Assignment Status"
        options={['all', 'available', 'assigned', 'published', 'archived']}
        value={assignmentFilter}
        onChange={setAssignmentFilter}
      />
      
      <FilterDropdown
        label="Priority"
        options={['all', 'critical', 'high', 'medium', 'low']}
        value={priorityFilter}
        onChange={setPriorityFilter}
      />
      
      <TagFilter
        tags={allTags}
        selected={selectedTags}
        onChange={setSelectedTags}
      />
    </LibraryFilters>
  </LibraryHeader>
  
  <LibraryGrid>
    {filteredSavedKeywords.map(keyword => (
      <KeywordCard
        key={keyword.id}
        keyword={keyword}
        onClick={() => handleSelectKeyword(keyword)}
      >
        <CardHeader>
          <KeywordText>{keyword.keyword}</KeywordText>
          <PriorityBadge priority={keyword.priority} />
        </CardHeader>
        
        <CardMetrics>
          <Metric label="Vol" value={formatNumber(keyword.search_volume)} />
          <Metric label="Diff" value={keyword.keyword_difficulty} />
          <Metric label="Opp" value={keyword.opportunity_score} />
        </CardMetrics>
        
        <CardStatus>
          {keyword.assignment_status === 'assigned' && (
            <AssignmentBadge>
              Assigned to: {keyword.assigned_to_type}
            </AssignmentBadge>
          )}
          {keyword.assignment_status === 'published' && (
            <PublishedBadge>
              Published: <Link to={keyword.published_url}>View Page</Link>
            </PublishedBadge>
          )}
        </CardStatus>
        
        <CardActions>
          <IconButton icon="edit" onClick={() => handleEditKeyword(keyword)} />
          <IconButton icon="trash" onClick={() => handleDeleteKeyword(keyword)} />
        </CardActions>
      </KeywordCard>
    ))}
  </LibraryGrid>
</SavedKeywordsLibrary>
```

---

### Tab 2: Landing Pages - Generator & Manager

#### UI Components

**1. Generator Panel** (Top Section)

```jsx
<GeneratorPanel>
  <PanelHeader>
    <h2>Landing Page Generator</h2>
    <HelpIcon tooltip="Create SEO-optimized landing pages from keywords" />
  </PanelHeader>
  
  {/* Step 1: Select Keywords */}
  <GeneratorStep number={1} title="Select Target Keyword(s)">
    <KeywordSelector
      source="saved" // or "search"
      value={selectedKeywords}
      onChange={setSelectedKeywords}
      maxSelection={isBulkMode ? 100 : 1}
    />
    
    <BulkModeToggle
      checked={isBulkMode}
      onChange={setIsBulkMode}
      label="Bulk Generation Mode (Create Multiple Pages)"
    />
    
    {isBulkMode && (
      <BulkOptions>
        <NumberInput
          label="Number of Pages to Generate"
          value={bulkCount}
          onChange={setBulkCount}
          min={1}
          max={100}
        />
        
        <Checkbox
          label="Auto-publish pages that pass quality gates"
          checked={autoPublish}
          onChange={setAutoPublish}
        />
      </BulkOptions>
    )}
  </GeneratorStep>
  
  {/* Step 2: Choose Template */}
  <GeneratorStep number={2} title="Choose Template">
    <TemplateGallery>
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          selected={selectedTemplate === template.id}
          onClick={() => setSelectedTemplate(template.id)}
        >
          <TemplateThumbnail src={template.preview} />
          <TemplateName>{template.name}</TemplateName>
          <TemplateDescription>{template.description}</TemplateDescription>
          <TemplateStats>
            <Stat label="Word Count" value={`${template.target_word_count_min}-${template.target_word_count_max}`} />
            <Stat label="Used" value={`${template.usage_count} times`} />
          </TemplateStats>
        </TemplateCard>
      ))}
    </TemplateGallery>
    
    <Button variant="outline" onClick={handleCreateTemplate}>
      + Create New Template
    </Button>
  </GeneratorStep>
  
  {/* Step 3: Generation Options */}
  <GeneratorStep number={3} title="Generation Options">
    <OptionGroup>
      <RadioGroup
        label="Generation Method"
        value={generationMethod}
        onChange={setGenerationMethod}
      >
        <Radio value="hybrid">Hybrid (Template + AI Enhancement) - Recommended</Radio>
        <Radio value="template">Template Only (Fastest, cheapest)</Radio>
        <Radio value="ai">Full AI Generation (Highest quality)</Radio>
      </RadioGroup>
      
      {generationMethod !== 'template' && (
        <>
          <SelectField
            label="AI Model"
            value={aiModel}
            onChange={setAiModel}
            options={[
              { value: 'claude-sonnet-4.5-20250929', label: 'Claude Sonnet 4.5 (Best Quality)' },
              { value: 'dataforseo', label: 'DataForSEO Content API (Faster)' }
            ]}
          />
          
          <SelectField
            label="Content Tone"
            value={tone}
            onChange={setTone}
            options={['professional', 'casual', 'technical', 'friendly', 'bold']}
          />
        </>
      )}
      
      <NumberInput
        label="Target Word Count"
        value={targetWordCount}
        onChange={setTargetWordCount}
        min={300}
        max={2500}
      />
      
      <Checkbox
        label="Include FAQ Section"
        checked={includeFAQ}
        onChange={setIncludeFAQ}
      />
      
      <Checkbox
        label="Include Schema Markup (Article, FAQPage, HowTo)"
        checked={includeSchema}
        onChange={setIncludeSchema}
      />
      
      <NumberInput
        label="Internal Links to Add"
        value={internalLinksCount}
        onChange={setInternalLinksCount}
        min={2}
        max={10}
      />
    </OptionGroup>
  </GeneratorStep>
  
  {/* Step 4: Quality Gates */}
  <GeneratorStep number={4} title="Quality Gates">
    <QualitySettings>
      <SliderInput
        label="Minimum Uniqueness Score"
        value={minUniqueness}
        onChange={setMinUniqueness}
        min={0.70}
        max={1.00}
        step={0.05}
        format={(v) => `${(v * 100).toFixed(0)}%`}
      />
      
      <SliderInput
        label="Maximum Keyword Density"
        value={maxKeywordDensity}
        onChange={setMaxKeywordDensity}
        min={0.01}
        max={0.05}
        step={0.005}
        format={(v) => `${(v * 100).toFixed(1)}%`}
      />
      
      <Checkbox
        label="Require all heading levels (h1, h2, h3)"
        checked={requireHeadings}
        onChange={setRequireHeadings}
      />
      
      <Checkbox
        label="Block publication if quality gates fail"
        checked={blockOnFailure}
        onChange={setBlockOnFailure}
      />
    </QualitySettings>
  </GeneratorStep>
  
  {/* Generation Summary & Action */}
  <GenerationSummary>
    <SummaryGrid>
      <SummaryItem label="Keywords Selected" value={selectedKeywords.length} />
      <SummaryItem label="Pages to Generate" value={isBulkMode ? bulkCount : 1} />
      <SummaryItem label="Estimated Cost" value={`$${estimatedCost.toFixed(2)}`} />
      <SummaryItem label="Estimated Time" value={`${estimatedTime} minutes`} />
    </SummaryGrid>
    
    <ButtonGroup>
      <Button
        variant="primary"
        size="large"
        onClick={handleGenerate}
        disabled={!canGenerate}
      >
        Generate Landing Page{isBulkMode ? 's' : ''}
      </Button>
      
      <Button variant="outline" onClick={handlePreview}>
        Preview First
      </Button>
    </ButtonGroup>
  </GenerationSummary>
</GeneratorPanel>
```

**2. Landing Pages Manager** (Bottom Section)

```jsx
<LandingPagesManager>
  <ManagerHeader>
    <h2>Landing Pages ({landingPages.length})</h2>
    
    <FiltersBar>
      <SearchBox
        placeholder="Search landing pages..."
        value={search}
        onChange={setSearch}
      />
      
      <StatusFilter
        options={['all', 'draft', 'review', 'published', 'archived', 'needs_refresh']}
        value={statusFilter}
        onChange={setStatusFilter}
      />
      
      <QualityFilter
        options={['all', 'passed', 'failed']}
        value={qualityFilter}
        onChange={setQualityFilter}
      />
      
      <DateRangeFilter
        label="Created"
        value={dateRange}
        onChange={setDateRange}
      />
      
      <SortDropdown
        options={[
          { value: 'created_desc', label: 'Newest First' },
          { value: 'position_asc', label: 'Best Position First' },
          { value: 'traffic_desc', label: 'Most Traffic' },
          { value: 'quality_desc', label: 'Highest Quality Score' }
        ]}
        value={sortBy}
        onChange={setSortBy}
      />
    </FiltersBar>
  </ManagerHeader>
  
  <PagesTable>
    <thead>
      <tr>
        <th><Checkbox /></th>
        <th sortable>Page Title</th>
        <th sortable>Target Keyword</th>
        <th sortable>Status</th>
        <th sortable>Quality Score</th>
        <th sortable>SERP Position</th>
        <th sortable>Traffic</th>
        <th sortable>CTR</th>
        <th>Last Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {landingPages.map(page => (
        <PageRow key={page.id} page={page}>
          <td><Checkbox /></td>
          
          <td className="title-cell">
            <PageTitle href={page.url} target="_blank">
              {page.title}
            </PageTitle>
            {!page.quality_gate_passed && (
              <WarningBadge>Quality Issues</WarningBadge>
            )}
          </td>
          
          <td className="keyword-cell">
            <KeywordLink onClick={() => handleViewKeyword(page.target_keyword)}>
              {page.target_keyword.keyword}
            </KeywordLink>
            <KeywordMetrics>
              Vol: {formatNumber(page.target_keyword.search_volume)} | 
              Diff: {page.target_keyword.keyword_difficulty}
            </KeywordMetrics>
          </td>
          
          <td className="status-cell">
            <StatusBadge status={page.published_status} />
            {page.published_status === 'needs_refresh' && (
              <RefreshButton onClick={() => handleRefreshPage(page)}>
                Refresh
              </RefreshButton>
            )}
          </td>
          
          <td className="quality-cell">
            <QualityScoreDisplay
              uniqueness={page.uniqueness_score}
              readability={page.readability_score}
              keywordDensity={page.keyword_density}
              passed={page.quality_gate_passed}
            />
          </td>
          
          <td className="position-cell">
            <PositionDisplay
              current={page.current_position}
              best={page.best_position}
              trend={getPositionTrend(page)}
            />
          </td>
          
          <td className="traffic-cell">
            <TrafficDisplay
              impressions={page.impressions}
              clicks={page.clicks}
            />
          </td>
          
          <td className="ctr-cell">
            <CTRDisplay ctr={page.ctr} />
          </td>
          
          <td className="updated-cell">
            <TimeAgo date={page.updated_at} />
          </td>
          
          <td className="actions-cell">
            <ActionDropdown>
              <MenuItem onClick={() => handleEditPage(page)}>
                Edit Content
              </MenuItem>
              <MenuItem onClick={() => handleViewPage(page)}>
                View Live Page
              </MenuItem>
              <MenuItem onClick={() => handleViewSERP(page.target_keyword)}>
                View SERP
              </MenuItem>
              <MenuItem onClick={() => handleRefreshPage(page)}>
                Regenerate Content
              </MenuItem>
              <MenuItem onClick={() => handleDuplicatePage(page)}>
                Duplicate for New Keyword
              </MenuItem>
              {page.published_status === 'draft' && (
                <MenuItem onClick={() => handlePublishPage(page)}>
                  Publish Now
                </MenuItem>
              )}
              {page.published_status === 'published' && (
                <MenuItem onClick={() => handleUnpublishPage(page)}>
                  Unpublish
                </MenuItem>
              )}
              <MenuItem onClick={() => handleArchivePage(page)}>
                Archive
              </MenuItem>
            </ActionDropdown>
          </td>
        </PageRow>
      ))}
    </tbody>
  </PagesTable>
  
  <BulkActions>
    <Button onClick={handleBulkPublish} disabled={selectedCount === 0}>
      Publish Selected ({selectedCount})
    </Button>
    <Button onClick={handleBulkRefresh} disabled={selectedCount === 0}>
      Refresh Selected
    </Button>
    <Button onClick={handleBulkArchive} disabled={selectedCount === 0}>
      Archive Selected
    </Button>
  </BulkActions>
</LandingPagesManager>
```

**3. Page Editor Drawer** (Slide-out)

```jsx
<PageEditorDrawer open={editorOpen} page={selectedPage}>
  <EditorHeader>
    <h2>Edit Landing Page</h2>
    <SaveButton onClick={handleSave}>Save Changes</SaveButton>
    <CloseButton onClick={closeEditor} />
  </EditorHeader>
  
  <EditorBody>
    {/* Meta Information */}
    <Section title="SEO Metadata">
      <TextField
        label="Meta Title"
        value={metaTitle}
        onChange={setMetaTitle}
        maxLength={60}
        hint={`${metaTitle.length}/60 characters`}
      />
      
      <TextArea
        label="Meta Description"
        value={metaDescription}
        onChange={setMetaDescription}
        maxLength={160}
        rows={3}
        hint={`${metaDescription.length}/160 characters`}
      />
      
      <TextField
        label="URL Slug"
        value={slug}
        onChange={setSlug}
        prefix="/landing/"
      />
      
      <TextField
        label="Canonical URL"
        value={canonicalURL}
        onChange={setCanonicalURL}
        placeholder="Leave empty to use page URL"
      />
    </Section>
    
    {/* Content Editor */}
    <Section title="Page Content">
      <RichTextEditor
        value={content}
        onChange={setContent}
        toolbar={['bold', 'italic', 'link', 'h2', 'h3', 'ul', 'ol']}
      />
      
      <WordCount>
        {wordCount} words | Target: {targetWordCount}
      </WordCount>
    </Section>
    
    {/* Schema Markup */}
    <Section title="Schema Markup" collapsible>
      <SchemaEditor
        schemas={schemas}
        onChange={setSchemas}
      />
    </Section>
    
    {/* Internal Links */}
    <Section title="Internal Links">
      <InternalLinkManager
        links={internalLinks}
        onChange={setInternalLinks}
        suggestions={suggestedLinks}
      />
    </Section>
    
    {/* Quality Check */}
    <Section title="Quality Check">
      <QualityCheckPanel>
        <QualityMetric
          label="Uniqueness"
          value={uniqueness}
          threshold={0.85}
          status={uniqueness >= 0.85 ? 'pass' : 'fail'}
        />
        <QualityMetric
          label="Readability"
          value={readability}
          threshold={60}
          status={readability >= 60 ? 'pass' : 'fail'}
        />
        <QualityMetric
          label="Keyword Density"
          value={keywordDensity}
          threshold={0.03}
          status={keywordDensity <= 0.03 ? 'pass' : 'fail'}
          inverted
        />
        
        <RunQualityCheck onClick={handleQualityCheck}>
          Re-run Quality Check
        </RunQualityCheck>
      </QualityCheckPanel>
    </Section>
    
    {/* Publishing Options */}
    <Section title="Publishing">
      <SelectField
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'draft', label: 'Draft (Not Visible)' },
          { value: 'review', label: 'Pending Review' },
          { value: 'published', label: 'Published (Live)' },
          { value: 'archived', label: 'Archived' }
        ]}
      />
      
      <DateTimePicker
        label="Scheduled Publish Date"
        value={scheduledDate}
        onChange={setScheduledDate}
        optional
      />
      
      <ButtonGroup>
        <Button variant="primary" onClick={handlePublish}>
          Publish Now
        </Button>
        <Button variant="secondary" onClick={handleSaveDraft}>
          Save as Draft
        </Button>
      </ButtonGroup>
    </Section>
  </EditorBody>
</PageEditorDrawer>
```

---

### Tab 3: Analytics - Monitoring & Performance

#### UI Components

**1. Overview Dashboard** (Top Section)

```jsx
<AnalyticsDashboard>
  <DashboardHeader>
    <h2>SEO Performance Overview</h2>
    <DateRangeSelector
      value={dateRange}
      onChange={setDateRange}
      presets={['7d', '30d', '90d', '1y', 'all']}
    />
  </DashboardHeader>
  
  {/* Key Metrics */}
  <MetricsGrid cols={4}>
    <MetricCard
      label="Total Keywords Tracked"
      value={metrics.totalKeywords}
      change={metrics.keywordsChange}
      period="vs last period"
    />
    
    <MetricCard
      label="Landing Pages Published"
      value={metrics.publishedPages}
      change={metrics.pagesChange}
      period="vs last period"
    />
    
    <MetricCard
      label="Average SERP Position"
      value={metrics.avgPosition.toFixed(1)}
      change={metrics.positionChange}
      period="vs last period"
      inverted // Lower is better
    />
    
    <MetricCard
      label="Total Organic Traffic"
      value={formatNumber(metrics.totalClicks)}
      change={metrics.trafficChange}
      period="vs last period"
    />
  </MetricsGrid>
  
  {/* Performance Charts */}
  <ChartsGrid cols={2}>
    <ChartCard title="SERP Position Trends">
      <LineChart
        data={positionHistory}
        lines={[
          { key: 'avg_position', label: 'Average Position', color: 'blue' },
          { key: 'best_position', label: 'Best Position', color: 'green' }
        ]}
        yInverted
        height={300}
      />
    </ChartCard>
    
    <ChartCard title="Traffic Growth">
      <LineChart
        data={trafficHistory}
        lines={[
          { key: 'impressions', label: 'Impressions', color: 'purple' },
          { key: 'clicks', label: 'Clicks', color: 'blue' }
        ]}
        height={300}
      />
    </ChartCard>
  </ChartsGrid>
  
  {/* Top Performers */}
  <PerformanceGrid cols={2}>
    <TopPerformersCard title="Top Ranking Pages">
      <PerformerList>
        {topPages.map(page => (
          <PerformerItem key={page.id}>
            <PerformerRank>#{page.current_position}</PerformerRank>
            <PerformerInfo>
              <PerformerTitle>{page.title}</PerformerTitle>
              <PerformerKeyword>{page.target_keyword.keyword}</PerformerKeyword>
            </PerformerInfo>
            <PerformerMetrics>
              <Metric label="Clicks" value={page.clicks} />
              <Metric label="CTR" value={`${(page.ctr * 100).toFixed(1)}%`} />
            </PerformerMetrics>
          </PerformerItem>
        ))}
      </PerformerList>
    </TopPerformersCard>
    
    <TopPerformersCard title="Biggest Movers (Up)">
      <PerformerList>
        {biggestMovers.map(page => (
          <PerformerItem key={page.id}>
            <PerformerMovement direction="up">
              +{page.positionChange} positions
            </PerformerMovement>
            <PerformerInfo>
              <PerformerTitle>{page.title}</PerformerTitle>
              <PerformerPosition>
                {page.previous_position} → {page.current_position}
              </PerformerPosition>
            </PerformerInfo>
          </PerformerItem>
        ))}
      </PerformerList>
    </TopPerformersCard>
  </PerformanceGrid>
</AnalyticsDashboard>
```

**2. Rank Tracking Table** (Middle Section)

```jsx
<RankTrackingTable>
  <TableHeader>
    <h3>Rank Tracking ({trackedKeywords.length} keywords)</h3>
    
    <TableFilters>
      <SearchBox
        placeholder="Search keywords or pages..."
        value={search}
        onChange={setSearch}
      />
      
      <PositionRangeFilter
        value={positionRange}
        onChange={setPositionRange}
        ranges={[
          { label: 'Top 3', value: [1, 3] },
          { label: 'Top 10', value: [1, 10] },
          { label: 'Top 20', value: [1, 20] },
          { label: 'Page 2+', value: [11, 100] }
        ]}
      />
      
      <TrendFilter
        options={['all', 'improving', 'declining', 'stable']}
        value={trendFilter}
        onChange={setTrendFilter}
      />
      
      <RefreshButton onClick={handleRefreshRankings}>
        Refresh All Rankings
      </RefreshButton>
    </TableFilters>
  </TableHeader>
  
  <DataTable>
    <thead>
      <tr>
        <th sortable>Page / Keyword</th>
        <th sortable>Current Position</th>
        <th sortable>Best Position</th>
        <th sortable>Position Change (7d)</th>
        <th sortable>Impressions</th>
        <th sortable>Clicks</th>
        <th sortable>CTR</th>
        <th>Last Checked</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {trackedKeywords.map(item => (
        <RankRow key={item.id} item={item}>
          <td className="page-keyword-cell">
            <PageLink href={item.page_url} target="_blank">
              {item.page_title}
            </PageLink>
            <KeywordDisplay>{item.keyword}</KeywordDisplay>
          </td>
          
          <td className="position-cell">
            <PositionBadge position={item.current_position}>
              #{item.current_position}
            </PositionBadge>
            {item.serp_features?.length > 0 && (
              <SERPFeaturesIcons features={item.serp_features} />
            )}
          </td>
          
          <td className="best-position-cell">
            <BestPosition>
              #{item.best_position}
            </BestPosition>
          </td>
          
          <td className="change-cell">
            <PositionChange
              current={item.current_position}
              previous={item.position_7d_ago}
            />
          </td>
          
          <td className="impressions-cell">
            {formatNumber(item.impressions)}
          </td>
          
          <td className="clicks-cell">
            {formatNumber(item.clicks)}
          </td>
          
          <td className="ctr-cell">
            <CTRBadge ctr={item.ctr} />
          </td>
          
          <td className="checked-cell">
            <TimeAgo date={item.last_rank_check_at} />
          </td>
          
          <td className="actions-cell">
            <ActionDropdown>
              <MenuItem onClick={() => handleViewHistory(item)}>
                View Position History
              </MenuItem>
              <MenuItem onClick={() => handleViewSERP(item)}>
                View Current SERP
              </MenuItem>
              <MenuItem onClick={() => handleRefreshRank(item)}>
                Refresh Rank Now
              </MenuItem>
              <MenuItem onClick={() => handleOptimizePage(item)}>
                Optimize Page
              </MenuItem>
            </ActionDropdown>
          </td>
        </RankRow>
      ))}
    </tbody>
  </DataTable>
</RankTrackingTable>
```

**3. SERP Features Monitor** (Bottom Section)

```jsx
<SERPFeaturesMonitor>
  <MonitorHeader>
    <h3>SERP Features Tracking</h3>
    <HelpIcon tooltip="Track which SERP features your pages appear in" />
  </MonitorHeader>
  
  <FeaturesGrid>
    <FeatureCard
      feature="featured_snippet"
      label="Featured Snippets"
      count={serpFeatures.featured_snippet}
      total={trackedKeywords.length}
    >
      <FeaturePages>
        {serpFeatures.featured_snippet_pages.map(page => (
          <FeaturePage key={page.id}>
            <PageTitle>{page.title}</PageTitle>
            <Keyword>{page.keyword}</Keyword>
          </FeaturePage>
        ))}
      </FeaturePages>
    </FeatureCard>
    
    <FeatureCard
      feature="people_also_ask"
      label="People Also Ask"
      count={serpFeatures.people_also_ask}
      total={trackedKeywords.length}
    >
      {/* Similar structure */}
    </FeatureCard>
    
    <FeatureCard
      feature="ai_overview"
      label="AI Overviews"
      count={serpFeatures.ai_overview}
      total={trackedKeywords.length}
    >
      {/* Similar structure */}
    </FeatureCard>
    
    <FeatureCard
      feature="local_pack"
      label="Local Pack"
      count={serpFeatures.local_pack}
      total={trackedKeywords.length}
    >
      {/* Similar structure */}
    </FeatureCard>
  </FeaturesGrid>
</SERPFeaturesMonitor>
```

---

## Integration with Existing Systems

### 1. Business Brain Integration

**Context Injection:**

```javascript
// When generating landing pages
const brainContext = await fetchBusinessBrain(brainId);

const pageContent = await generateLandingPage({
  keyword: targetKeyword,
  template: selectedTemplate,
  brainContext: {
    business_name: brainContext.business_name,
    industry: brainContext.industry,
    unique_value_propositions: brainContext.unique_value_propositions,
    brand_voice: brainContext.brand_voice,
    tone_attributes: brainContext.tone_attributes,
    target_keywords: brainContext.target_keywords
  }
});
```

**Auto-Keyword Suggestions:**

```javascript
// Use Business Brain data to suggest relevant keywords
const suggestedSeeds = [
  brainContext.industry,
  ...brainContext.core_offerings,
  ...brainContext.target_keywords,
  ...brainContext.pain_points_solved.map(p => `how to ${p}`)
];

const keywords = await dataForSEO.keywordIdeas(suggestedSeeds);
```

---

### 2. Blog Post Generator Integration

**Feed Keywords to AutoBlog:**

```javascript
// From keyword research → blog post creation
async function createBlogPostFromKeyword(keywordId) {
  const keyword = await getKeyword(keywordId);
  
  // Pass keyword to AI Content Writer module
  const blogPost = await modules.execute('ai-content-writer', {
    content_type: 'blog_post',
    topic: keyword.keyword,
    primary_keyword: keyword.keyword,
    secondary_keywords: keyword.related_keywords,
    tone: 'professional',
    length: 'long', // ~1500 words
    include_seo: true
  });
  
  // Save post with keyword reference
  await createPost({
    ...blogPost,
    primary_keyword: keyword.keyword,
    secondary_keywords: keyword.related_keywords,
    keyword_data: keyword.dataforseo_raw
  });
}
```

**Suggest Keywords for Existing Posts:**

```javascript
// Analyze existing post, suggest optimization keywords
async function suggestKeywordsForPost(postId) {
  const post = await getPost(postId);
  
  // Extract topic from post content
  const topicKeywords = extractKeywords(post.content);
  
  // Find related keywords with opportunity
  const suggestions = await dataForSEO.keywordIdeas(topicKeywords);
  
  // Filter for high-opportunity, low-competition
  const opportunities = suggestions.filter(kw => 
    kw.opportunity_score > 70 &&
    kw.keyword_difficulty < 40
  );
  
  return opportunities;
}
```

---

### 3. Modules System Integration

**Register SEO Suite as Module:**

```json
// src/admin/modules/SEOSuite/manifest.json
{
  "id": "seo-suite",
  "slug": "seo-suite",
  "name": "SEO Suite",
  "description": "Complete SEO toolkit: keyword research, landing page generation, and rank tracking",
  "category": "seo",
  "status": "approved",
  "version": "1.0.0",
  
  "audience": ["internal"], // Admin-only
  "requires_brain": true,
  "requires_auth": true,
  
  "icon_url": "/icons/seo-suite.svg",
  "color": "#2C6BAA",
  
  "sub_modules": [
    "keyword-research-advanced",
    "landing-page-generator",
    "seo-analytics"
  ]
}
```

**Track Usage in Telemetry:**

```javascript
// Every keyword research run
await trackModuleRun('seo-suite', {
  sub_module: 'keyword-research',
  action: 'discover_keywords',
  input: { seeds, method, filters },
  output: { keywords_found: results.length },
  cost_usd: apiCost,
  duration_ms: duration
});

// Every landing page generation
await trackModuleRun('seo-suite', {
  sub_module: 'landing-page-generator',
  action: 'generate_page',
  input: { keyword_id, template_id, method },
  output: { page_id, quality_passed },
  cost_usd: generationCost,
  duration_ms: duration
});
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Week 1:**
- [ ] Create database migration file with all tables
- [ ] Apply migration to production database
- [ ] Build DataForSEO integration layer (15+ API endpoints)
- [ ] Create keyword discovery service
- [ ] Build opportunity scoring algorithm

**Week 2:**
- [ ] Design and implement Admin UI shell (SEO Suite module structure)
- [ ] Build Research tab UI (discovery panel + results table)
- [ ] Implement keyword detail drawer
- [ ] Create saved keywords library
- [ ] Build keyword CRUD operations

**Deliverables:**
- ✅ Complete database schema
- ✅ DataForSEO integration working
- ✅ Keyword research UI functional
- ✅ Keywords saved to database

---

### Phase 2: Landing Page Generator (Week 3-4)

**Week 3:**
- [ ] Create landing page template system
- [ ] Build 5-10 default templates (how-to, service+location, comparison, etc.)
- [ ] Implement template variable parsing
- [ ] Build hybrid generation system (template + AI)
- [ ] Create quality gate engine (uniqueness, readability, keyword density)

**Week 4:**
- [ ] Build Landing Pages tab UI (generator panel + manager)
- [ ] Implement page editor drawer
- [ ] Create publishing workflow (draft → review → publish)
- [ ] Build bulk generation system
- [ ] Implement content iteration/refresh system

**Deliverables:**
- ✅ Template system operational
- ✅ Landing pages generating correctly
- ✅ Quality gates preventing doorway pages
- ✅ Publishing workflow complete

---

### Phase 3: Analytics & Monitoring (Week 5-6)

**Week 5:**
- [ ] Build SERP tracking system
- [ ] Implement rank checking automation (daily/weekly)
- [ ] Create position history tracking
- [ ] Build SERP features detection
- [ ] Implement competitor tracking

**Week 6:**
- [ ] Build Analytics tab UI (dashboard + rank tracking table)
- [ ] Create performance charts (position trends, traffic growth)
- [ ] Build SERP features monitor
- [ ] Implement automated alerts (position drops, traffic changes)
- [ ] Create reporting system

**Deliverables:**
- ✅ Rank tracking operational
- ✅ Analytics dashboard functional
- ✅ Historical data collecting
- ✅ Automated monitoring active

---

### Phase 4: Integration & Polish (Week 7-8)

**Week 7:**
- [ ] Integrate with Business Brain (context injection)
- [ ] Connect to AI Content Writer (keyword suggestions)
- [ ] Build keyword clustering system
- [ ] Implement internal linking automation
- [ ] Create SEO recommendations engine

**Week 8:**
- [ ] End-to-end testing (keyword → page → publish → track)
- [ ] Performance optimization
- [ ] Documentation writing (user guide, API docs)
- [ ] Training videos/tutorials
- [ ] Launch preparation

**Deliverables:**
- ✅ Complete system integration
- ✅ Performance optimized
- ✅ Documentation complete
- ✅ Ready for production use

---

## Cost Analysis

### DataForSEO API Costs

**Research Phase (per run):**
- Keyword Suggestions: $0.01 per task (500 keywords)
- Keyword Ideas: $0.02 per task (1000 keywords)
- Keyword Overview: $0.10 per 100 keywords
- Historical Data: $0.10 per 100 keywords
- Keyword Difficulty: $0.05 per 100 keywords
- SERP Live: $0.03 per keyword
- Trends Explore: $0.01 per keyword

**Estimated cost per research session:** $0.50 - $5.00 (depending on depth)

**Rank Tracking:**
- SERP check: $0.03 per keyword
- Daily tracking for 100 keywords: $3.00/day = $90/month

**Content Generation (if using DataForSEO):**
- Generate Text: $0.05 per 1000 words
- Generate Meta Tags: $0.01 per page

---

### AI Generation Costs

**Claude Sonnet 4.5:**
- ~1500 word landing page: $0.15 - $0.30 per page
- Meta tag generation: $0.01 per page

**Hybrid Method (Recommended):**
- Template + AI enhancement: $0.05 - $0.10 per page

**Bulk Generation Cost (100 pages):**
- Hybrid method: $5 - $10
- Full AI: $15 - $30
- Template only: $0 (just server costs)

---

## Success Metrics

### Keyword Research Module

**Primary Metrics:**
- Number of keywords discovered per session
- Percentage of high-opportunity keywords (score > 70)
- Time from research to content creation
- API cost per keyword discovered

**Secondary Metrics:**
- Keywords saved to database
- Keywords assigned to content
- Keywords ranking within 30 days
- User satisfaction with keyword quality

---

### Landing Page Generator

**Primary Metrics:**
- Pages generated per week
- Quality gate pass rate
- Average time to first publish
- Pages ranking in top 10 within 90 days

**Secondary Metrics:**
- Average page uniqueness score
- Template usage distribution
- Cost per page generated
- Time saved vs manual creation

---

### SEO Performance

**Primary Metrics:**
- Average SERP position across all pages
- Percentage of pages in top 10
- Total organic traffic from landing pages
- Conversion rate from landing pages

**Secondary Metrics:**
- Featured snippet captures
- People Also Ask appearances
- AI Overview mentions
- Competitor displacement (# of positions taken)

---

## Security & Permissions

### Admin-Only Access

This entire system is **internal use only** (Disruptors staff):

```javascript
// Admin Nexus permission check
if (!isAdminUser(user) || !hasPermission(user, 'seo_suite')) {
  throw new UnauthorizedError('SEO Suite is admin-only');
}
```

### Rate Limiting

**DataForSEO API:**
- Max 10 concurrent requests
- Exponential backoff on 429 errors
- Daily spending cap: $50 (configurable)

**Database:**
- Max 100 keywords saved per research session
- Max 100 landing pages generated per day
- Prevent duplicate keyword entries (via keyword_hash)

---

## Maintenance & Monitoring

### Automated Tasks

**Daily:**
- Refresh SERP positions for all tracked keywords
- Check quality gates for new landing pages
- Update opportunity scores based on fresh data
- Clean up failed generation attempts

**Weekly:**
- Refresh keyword metrics (volume, difficulty, trends)
- Identify pages needing content refresh
- Generate performance reports
- Check for SERP feature opportunities

**Monthly:**
- Deep keyword research for new opportunities
- Archive underperforming landing pages
- Analyze template performance
- Update opportunity scoring algorithm

---

## Next Steps

To proceed with implementation, I need your confirmation on:

1. **Database Migration** - Ready to apply the comprehensive migration?
2. **Budget Approval** - DataForSEO costs outlined above acceptable?
3. **Timeline** - 8-week implementation roadmap realistic for your team?
4. **Priorities** - Should I start with any specific phase/component first?

Once confirmed, I'll:
1. Create the complete database migration file
2. Build the DataForSEO integration layer
3. Implement the Admin UI components
4. Set up the generation and monitoring systems
5. Integrate with existing modules

Ready to begin implementation?
