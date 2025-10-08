# Database Schema Inspection Report

**Generated:** 2025-10-08
**Database:** https://ubqxflzuvxowigbjmqfb.supabase.co
**Project:** Disruptors AI Marketing Hub

---

## Executive Summary

The production database has a **partial Business Brain migration** applied. Core tables exist but with simplified schemas compared to the full migration specification. This indicates an earlier, minimal version was deployed rather than the complete infrastructure migration.

### Key Findings

✅ **Working Systems:**
- Core blog/content system (posts table) - fully functional
- Keyword Research System - columns exist (primary_keyword, secondary_keywords)
- Basic Business Brain structure - tables exist with simplified schemas

⚠️ **Partial Implementation:**
- Business Brain tables exist but with ~25% of expected columns
- Simplified key-value schema instead of full structured schema
- Missing advanced features: vector embeddings, versioning, detailed categorization

❌ **Missing Components:**
- `posts_brain_facts` junction table (completely absent)
- `keyword_data` column in posts table
- Advanced Business Brain columns (40+ fields missing per table)

---

## Database Tables Overview

### Tables Found: 8

1. ✅ **users** - 0 rows (empty table)
2. ✅ **posts** - 7 rows (active with content)
3. ✅ **business_brains** - 1 row (simplified schema)
4. ✅ **brain_facts** - 8 rows (key-value pairs)
5. ✅ **brand_rules** - 1 row (basic content)
6. ✅ **brand_assets** - 0 rows (empty)
7. ✅ **onboarding_sessions** - 0 rows (empty)
8. ✅ **knowledge_sources** - 0 rows (empty)

### Tables Missing: 1

❌ **posts_brain_facts** - Junction table for tracking fact usage in posts

---

## Detailed Table Analysis

### 1. business_brains Table

**Status:** ⚠️ Simplified Schema (12 columns vs. 49 expected)

**Actual Columns (12):**
```
id, slug, name, description, created_by, created_at, updated_at,
brain_level, confidence_score, onboarding_completed, brand_colors,
business_description
```

**Missing Columns (38):**
- **Business Profile:** organization_id, business_name, tagline, industry, founded_year, company_size
- **Contact/Location:** primary_website, primary_email, primary_phone, headquarters_city, headquarters_state, headquarters_country, service_areas
- **Business Intelligence:** ideal_customer_profile, core_offerings, unique_value_propositions, key_differentiators, pain_points_solved, target_keywords, competitor_urls
- **Brand Visual:** typography, logo_urls, design_style
- **Brand Voice:** brand_voice, tone_attributes, writing_style, vocabulary_level
- **Content Strategy:** content_pillars, content_formats, publishing_frequency, seasonal_campaigns
- **Metrics:** total_facts, last_trained_at, last_enhanced_at
- **Status Flags:** auto_initialized, web_scrape_completed, brand_colors_extracted, integrations_connected

**Current Data:**
- 1 brain: "Disruptors AI Brain"
- Level: starter
- Confidence: 0.3
- Created: 2025-10-01

**Schema Match:** 25% (12 of 49 expected columns)

---

### 2. brain_facts Table

**Status:** ⚠️ Simplified Key-Value Schema (10 columns vs. 26 expected)

**Actual Columns (10):**
```
id, brain_id, key, value, source, confidence,
last_verified_at, created_at, updated_at, fts
```

**Current Schema Type:** Simple key-value pairs (e.g., "Company Name" → "Disruptors & Co")

**Expected Schema Type:** Structured facts with:
- fact_text, fact_type, category, subcategory
- source_type, source_url, source_file_id, source_integration_id
- embedding (vector), keywords
- importance, verified, verified_by, verified_at
- usage_count, last_used_at
- version, previous_version_id, is_current, deprecated_at

**Missing Features:**
- ❌ Vector embeddings for semantic search
- ❌ Fact categorization (type, category, subcategory)
- ❌ Source tracking (type, URL, file, integration)
- ❌ Importance levels (low/medium/high/critical)
- ❌ Verification workflow
- ❌ Usage analytics
- ❌ Version control

**Current Data:**
- 8 facts stored as key-value pairs
- Examples: "Company Name", "Primary Service", "Target Audience"
- All linked to brain: dff1217a-a42d-49f6-8496-272d40c34934

**Schema Match:** 38% (10 of 26 expected columns, but different structure)

---

### 3. brand_rules Table

**Status:** ⚠️ Simplified Schema (6 columns vs. 11 expected)

**Actual Columns (6):**
```
id, brain_id, rule_type, content, created_at, updated_at
```

**Missing Columns (6):**
- rule_name, rule_content (has "content" instead), examples,
  priority, applies_to, created_by

**Current Data:**
- 1 rule stored
- Linked to Disruptors AI Brain

**Schema Match:** 45% (5 of 11 expected columns match, plus 1 variation)

---

### 4. brand_assets Table

**Status:** ⚠️ Empty (Cannot Verify Schema)

**Expected Columns (18):**
```
id, brain_id, asset_type, asset_category, file_url, file_name,
file_size, mime_type, width, height, alt_text, description,
tags, usage_context, metadata, created_at, updated_at, created_by
```

**Current Data:** 0 rows

---

### 5. onboarding_sessions Table

**Status:** ⚠️ Empty (Cannot Verify Schema)

**Expected Columns (14):**
```
id, brain_id, session_type, status, current_step, total_steps,
conversation_history, extracted_data, completion_percentage,
started_at, completed_at, created_at, updated_at, created_by
```

**Current Data:** 0 rows

---

### 6. knowledge_sources Table

**Status:** ⚠️ Empty (Cannot Verify Schema)

**Expected Columns (16):**
```
id, brain_id, source_type, source_name, source_url,
integration_type, api_credentials, sync_frequency,
last_synced_at, next_sync_at, facts_imported, is_active,
sync_errors, created_at, updated_at, created_by
```

**Current Data:** 0 rows

---

### 7. posts_brain_facts Table

**Status:** ❌ **MISSING ENTIRELY**

**Expected Purpose:** Junction table to track which brain facts are used in which posts

**Expected Columns (6):**
```
id, post_id, brain_fact_id, usage_context,
confidence_at_use, created_at
```

**Impact:** Cannot track fact usage in generated content

---

### 8. posts Table

**Status:** ✅ Mostly Complete (37 columns)

**Actual Columns (37):**
```
id, title, slug, excerpt, content, content_type, featured_image,
gallery_images, author_id, category, tags, read_time_minutes,
is_featured, is_published, published_at, seo_title, seo_description,
seo_keywords, created_at, updated_at, status, brain_snapshot, seo,
author_member_id, agent_id, generation_metadata, scheduled_for,
word_count, reading_time_minutes, brain_id, meta_title,
meta_description, scheduled_date, ai_generated, editor_notes,
primary_keyword, secondary_keywords
```

**Missing Column (1):**
- ❌ `keyword_data` (JSONB column for DataForSEO metadata)

**Keyword Research Status:**
- ✅ `primary_keyword` exists
- ✅ `secondary_keywords` exists
- ❌ `keyword_data` missing (migration file exists but not applied)

**Current Data:**
- 7 posts in database
- Sample titles:
  - "Why Content Creation Services Are Your Business's Secret Weapon for Growth"
  - "How Creative Branding & Strategy Transforms Small Businesses Into Market Leaders"
  - "Why Smart Businesses Choose a Podcasting & SEO Agency to Dominate Their Market"
- All posts have: primary_keyword = NULL, secondary_keywords = NULL

**Schema Match:** 97% (37 of 38 expected columns)

---

### 9. users Table

**Status:** ⚠️ Empty (Cannot Verify Schema)

**Current Data:** 0 rows
**Note:** Auth is likely handled by Supabase Auth system (auth.users schema)

---

## Migration Analysis

### What Was Applied

The database appears to have had an **earlier, simplified version** of the Business Brain system applied, likely through manual table creation or a different migration file not in the current migrations folder.

Evidence:
- Tables use simplified schemas (key-value pairs vs. structured fields)
- Different column names (e.g., `content` vs. `rule_content` in brand_rules)
- Extra column not in spec: `business_description` in business_brains
- Missing advanced features: vector embeddings, versioning, detailed metadata

### What Needs to Be Applied

**Option 1: Full Migration (Recommended)**
- Apply `20250107_business_brain_infrastructure.sql`
- This will DROP existing tables and recreate with full schema
- **RISK:** Will lose existing data (1 brain, 8 facts, 1 rule)
- **MITIGATION:** Export data first, then re-import after migration

**Option 2: Incremental Migration**
- Create ALTER TABLE statements to add missing columns
- More complex, requires careful column-by-column addition
- **BENEFIT:** Preserves existing data
- **RISK:** Schema drift from documented migration

**Option 3: Hybrid Approach**
- Keep existing simplified tables for current Business Brain
- Create NEW tables with full schema for future brains
- Gradually migrate data over time

### Specific Migrations Needed

1. **Business Brain Infrastructure**
   - File: `supabase/migrations/20250107_business_brain_infrastructure.sql`
   - Creates 38 additional columns in business_brains
   - Adds 16 additional columns in brain_facts
   - Creates posts_brain_facts junction table
   - Adds vector extension and embedding columns
   - Adds versioning, verification, and analytics

2. **Keyword Data Column**
   - File: `supabase/migrations/20250131_add_keyword_fields_to_posts.sql`
   - Status: PARTIALLY APPLIED (primary_keyword and secondary_keywords exist)
   - Missing: `keyword_data`, `search_volume`, `keyword_difficulty` columns
   - Needs: Re-run migration or manual ALTER TABLE

---

## Functionality Impact

### ✅ What Works Now

1. **Basic Blog System**
   - Post creation, editing, publishing ✅
   - SEO fields (title, description, keywords) ✅
   - Author assignment, categorization ✅
   - AI generation metadata tracking ✅

2. **Basic Business Brain**
   - Single brain storage ✅
   - Simple key-value fact storage ✅
   - Basic brand rules ✅
   - Brain level and confidence tracking ✅

3. **Keyword Research UI**
   - DataForSEO API integration ✅
   - Keyword selection interface ✅
   - Storage of primary/secondary keywords ✅

### ⚠️ What's Limited

1. **Business Brain Features**
   - No vector semantic search (missing embeddings)
   - No fact categorization or importance levels
   - No source tracking for facts
   - No version control for facts
   - No usage analytics (which posts use which facts)
   - No verification workflow
   - No brand asset management
   - No onboarding session tracking
   - No integration syncing

2. **Keyword Research**
   - Cannot store full DataForSEO metadata (keyword_data column missing)
   - Missing search volume and difficulty tracking
   - Limited historical keyword data

### ❌ What Doesn't Work

1. **Advanced Business Brain**
   - Multi-tier knowledge levels (starter/enhanced/expert) - partially supported
   - Semantic search across facts
   - Fact usage tracking in posts (no junction table)
   - Source attribution for facts
   - Brand asset management
   - AI onboarding conversations
   - Integration-based knowledge syncing

2. **Content Personalization**
   - Cannot reference specific facts in generated content
   - No evidence trail for which facts influenced which posts
   - Limited brand voice enforcement

---

## Recommendations

### Immediate Actions

1. **Export Existing Data**
   ```sql
   -- Save current brain
   SELECT * FROM business_brains;

   -- Save current facts
   SELECT * FROM brain_facts;

   -- Save current rules
   SELECT * FROM brand_rules;
   ```

2. **Choose Migration Path**
   - **If no production data exists yet:** Run full migration
   - **If production data is critical:** Use incremental approach

3. **Apply Missing Migrations**
   ```bash
   # Option A: Full migration (destructive)
   node scripts/apply-business-brain-migration.js

   # Option B: Keyword data only
   psql $DATABASE_URL -f supabase/migrations/20250131_add_keyword_fields_to_posts.sql
   ```

### Future Considerations

1. **Migration Strategy**
   - Implement migration version tracking
   - Use Supabase migration system consistently
   - Document all manual schema changes

2. **Data Preservation**
   - Regular backups before migrations
   - Test migrations on staging first
   - Keep rollback scripts ready

3. **Schema Evolution**
   - Consider using Supabase's automatic migration diffing
   - Keep migration files in sync with actual database
   - Document any manual alterations

---

## Migration Command Reference

### Check Current State
```bash
# Run schema inspection
node scripts/check-database-schema.js

# Detailed comparison
node scripts/compare-schemas.js

# Verify specific tables
node scripts/verify-business-brain-tables.cjs
```

### Apply Migrations

#### Full Business Brain Migration (Destructive)
```bash
# WARNING: This will DROP and recreate tables
node scripts/apply-business-brain-migration.js
```

#### Keyword Data Migration Only
```bash
# Add missing keyword columns to posts
psql $DATABASE_URL -f supabase/migrations/20250131_add_keyword_fields_to_posts.sql
```

#### Manual Incremental Migration
```bash
# Add missing columns without dropping tables
# (Custom script would need to be created)
```

### Verify After Migration
```bash
# Verify tables were created correctly
node scripts/verify-business-brain-tables.cjs

# Check column counts and data
node scripts/detailed-schema-check.js
```

---

## Database Connection Info

**Project URL:** https://ubqxflzuvxowigbjmqfb.supabase.co
**Project Ref:** ubqxflzuvxowigbjmqfb
**Region:** US East

**Environment Variables:**
- `VITE_SUPABASE_URL` - Set ✅
- `VITE_SUPABASE_ANON_KEY` - Set ✅
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Set ✅
- `SUPABASE_ACCESS_TOKEN` - Not set (needed for MCP server)

---

## Conclusion

The database is **functional but incomplete**. The core blog system and basic Business Brain features work, but advanced capabilities are unavailable due to simplified schemas.

**Migration Status:** 🟡 Partial (25-40% of expected schema implemented)

**Recommendation:** Apply full Business Brain migration after backing up existing data to unlock advanced features like vector search, fact usage tracking, and comprehensive brand intelligence.

**Risk Level:** 🟡 Medium - Current system works but limits AI capabilities

**Action Priority:** Medium - Can continue with current setup, but full migration recommended within 1-2 weeks to enable advanced features before significant data accumulation.

---

*Report generated automatically by database schema inspection tools.*
*Location: /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/DATABASE_SCHEMA_REPORT.md*
