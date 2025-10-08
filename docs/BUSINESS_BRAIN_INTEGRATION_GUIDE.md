# Business Brain Integration Guide

Complete guide for integrating the Business Brain system into your application and ensuring Supabase + Netlify compatibility.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Netlify Functions Configuration](#netlify-functions-configuration)
4. [Environment Variables](#environment-variables)
5. [Testing the Infrastructure](#testing-the-infrastructure)
6. [Frontend Integration](#frontend-integration)
7. [Troubleshooting](#troubleshooting)
8. [Performance Optimization](#performance-optimization)

---

## Prerequisites

### Required Services

- **Supabase Project**: PostgreSQL database with pgvector extension
- **Netlify Account**: For serverless functions
- **OpenAI API Key**: For text embeddings (text-embedding-3-small)
- **Anthropic API Key**: For content generation (Claude Sonnet 4.5)
- **Firecrawl API Key**: For web scraping (initialization)
- **Brandfetch API Key**: Optional, for brand color extraction

### Required Node Packages

Add these dependencies to your `package.json`:

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk
```

### Supabase Extensions

Ensure these extensions are enabled in your Supabase project:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

## Database Setup

### Step 1: Apply Migration

Run the Business Brain infrastructure migration:

```bash
# Option A: Using Supabase CLI (recommended)
supabase db push

# Option B: Manual application via Supabase Dashboard
# 1. Go to https://app.supabase.com/project/YOUR_PROJECT/editor
# 2. Open SQL Editor
# 3. Copy contents of supabase/migrations/20250107_business_brain_infrastructure.sql
# 4. Execute the migration
```

### Step 2: Verify Tables Created

Check that these tables exist:

- `business_brains`
- `brain_facts`
- `brand_rules`
- `brand_assets`
- `onboarding_sessions`
- `knowledge_sources`
- `posts_brain_facts`

```sql
-- Verify tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'business_brains',
    'brain_facts',
    'brand_rules',
    'brand_assets',
    'onboarding_sessions',
    'knowledge_sources',
    'posts_brain_facts'
  );
```

### Step 3: Verify RLS Policies

Confirm Row Level Security is enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%brain%';
```

All should show `rowsecurity = true`.

### Step 4: Test Database Functions

Test the search functions:

```sql
-- Test full-text search (should not error)
SELECT * FROM search_brain_facts(
  'some-brain-id'::uuid,
  'test query',
  10
);

-- Test confidence calculation (should not error)
SELECT calculate_brain_confidence('some-brain-id'::uuid);
```

---

## Netlify Functions Configuration

### Step 1: Verify Netlify Configuration

Ensure `netlify.toml` includes:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Install Function Dependencies

Netlify will auto-install dependencies from your `package.json`, but verify these are present:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "@anthropic-ai/sdk": "^0.65.0",
    "openai": "^5.23.0"
  }
}
```

### Step 3: Deploy Functions

Deploy to Netlify:

```bash
# Option A: Deploy via Git push
git add .
git commit -m "Add Business Brain infrastructure"
git push origin master

# Option B: Manual deploy via Netlify CLI
netlify deploy --prod

# Option C: Drag & drop to Netlify dashboard
```

### Step 4: Verify Functions Deployed

Check function endpoints are live:

```bash
# Check Netlify functions
netlify functions:list

# Should show:
# - brain-auto-initialize
# - brain-enhance
# - brain-content-generate
```

Test function availability:

```bash
curl -X OPTIONS https://YOUR_SITE.netlify.app/.netlify/functions/brain-auto-initialize
# Should return 200 OK
```

---

## Environment Variables

### Supabase Dashboard Setup

1. Go to your Supabase project → Settings → API
2. Copy the following values:

- **Project URL**: `https://YOUR_PROJECT.supabase.co`
- **Anon Key**: `eyJhbG...` (public, safe for client)
- **Service Role Key**: `eyJhbG...` (secret, server-only)

### Netlify Dashboard Setup

1. Go to your Netlify site → Site settings → Environment variables
2. Add the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Services
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
VITE_OPENAI_API_KEY=your_openai_key_here

# Web Scraping & Brand Detection
VITE_FIRECRAWL_API_KEY=your_firecrawl_key_here
VITE_BRANDFETCH_API_KEY=your_brandfetch_key_here  # Optional
```

### Local Development (.env file)

Create `.env` in your project root:

```bash
# Copy from .env.example
cp .env.example .env

# Edit .env with your actual keys
nano .env
```

**IMPORTANT**: Never commit `.env` to Git. Verify `.gitignore` includes:

```
.env
.env.local
.env.production
```

---

## Testing the Infrastructure

### Test 1: Database Connection

Test Supabase connection from your app:

```javascript
// test/test-supabase-connection.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from('business_brains')
  .select('count');

if (error) {
  console.error('❌ Connection failed:', error);
} else {
  console.log('✅ Connected! Brain count:', data);
}
```

Run:
```bash
node test/test-supabase-connection.js
```

### Test 2: Auto-Initialization Function

Test brain auto-initialization:

```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/brain-auto-initialize \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "websiteUrl": "https://example.com",
    "businessName": "Test Business"
  }'
```

Expected response:
```json
{
  "brainId": "uuid-here",
  "slug": "test-business",
  "brainLevel": "starter",
  "confidenceScore": 0.35,
  "totalFacts": 15,
  "message": "Brain initialized successfully"
}
```

### Test 3: Content Generation Function

Test content generation with a brain:

```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/brain-content-generate \
  -H "Content-Type: application/json" \
  -d '{
    "brainId": "YOUR_BRAIN_ID",
    "contentType": "blog_title",
    "topic": "Benefits of Digital Marketing",
    "primaryKeyword": "digital marketing",
    "titleCount": 5
  }'
```

Expected response:
```json
{
  "success": true,
  "titles": [
    "5 Digital Marketing Strategies That Drive Real Results",
    "Why Digital Marketing Is Essential for Small Businesses in 2025",
    ...
  ]
}
```

### Test 4: Brain Enhancement (Onboarding)

Test AI-powered onboarding:

```bash
curl -X POST https://YOUR_SITE.netlify.app/.netlify/functions/brain-enhance \
  -H "Content-Type: application/json" \
  -d '{
    "brainId": "YOUR_BRAIN_ID",
    "enhancementType": "onboarding",
    "conversationHistory": [
      {"role": "assistant", "question": "What does your business do?"},
      {"role": "user", "content": "We provide digital marketing services for local businesses."}
    ],
    "currentQuestion": 1
  }'
```

Expected response:
```json
{
  "success": true,
  "factsAdded": 3,
  "brainLevel": "enhanced",
  "confidenceScore": 0.62,
  "totalFacts": 18,
  "nextQuestion": "What makes your business different from competitors?",
  "sessionComplete": false
}
```

---

## Frontend Integration

### Step 1: Create API Client

Create `src/lib/brain-api.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class BrainAPI {
  // Initialize brain
  static async initializeBrain(userId, websiteUrl, businessName) {
    const response = await fetch('/.netlify/functions/brain-auto-initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, websiteUrl, businessName }),
    });
    return response.json();
  }

  // Get brain by user
  static async getBrainByUser(userId) {
    const { data, error } = await supabase
      .from('business_brains')
      .select('*')
      .eq('created_by', userId)
      .single();
    return { data, error };
  }

  // Enhance brain
  static async enhanceBrain(brainId, enhancementType, payload) {
    const response = await fetch('/.netlify/functions/brain-enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brainId, enhancementType, ...payload }),
    });
    return response.json();
  }

  // Generate content
  static async generateContent(brainId, contentType, options) {
    const response = await fetch('/.netlify/functions/brain-content-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brainId, contentType, ...options }),
    });
    return response.json();
  }

  // Search brain facts
  static async searchFacts(brainId, query, limit = 15) {
    const { data, error } = await supabase.rpc('search_brain_facts', {
      brain_id: brainId,
      q: query,
      limit_count: limit,
    });
    return { data, error };
  }
}
```

### Step 2: Use in React Components

Example: Auto-initialize on signup

```javascript
// src/components/SignupForm.jsx
import { useState } from 'react';
import { BrainAPI } from '@/lib/brain-api';

export default function SignupForm() {
  const [loading, setLoading] = useState(false);

  const handleSignup = async (formData) => {
    setLoading(true);

    try {
      // 1. Create user account (your existing logic)
      const user = await createUserAccount(formData);

      // 2. Auto-initialize Business Brain
      const brainResult = await BrainAPI.initializeBrain(
        user.id,
        formData.websiteUrl,
        formData.businessName
      );

      console.log('Brain initialized:', brainResult);

      // 3. Redirect to onboarding
      navigate(`/onboarding?brainId=${brainResult.brainId}`);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your signup form JSX
  );
}
```

Example: Generate content

```javascript
// src/components/ContentGenerator.jsx
import { useState } from 'react';
import { BrainAPI } from '@/lib/brain-api';

export default function ContentGenerator({ brainId }) {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateTitles = async () => {
    setLoading(true);

    const result = await BrainAPI.generateContent(brainId, 'blog_title', {
      topic: 'Benefits of SEO',
      primaryKeyword: 'SEO benefits',
      titleCount: 5,
    });

    setTitles(result.titles || []);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={generateTitles} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Titles'}
      </button>

      <ul>
        {titles.map((title, i) => (
          <li key={i}>{title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Troubleshooting

### Issue: "relation 'business_brains' does not exist"

**Cause**: Migration not applied.

**Solution**:
```bash
# Check if migration applied
supabase db remote commit --no-verify

# If missing, apply migration
supabase db push
```

### Issue: "pgvector extension not found"

**Cause**: Vector extension not enabled.

**Solution**:
```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: Netlify function timeout (10 seconds)

**Cause**: Web scraping or AI generation taking too long.

**Solution**:
- Upgrade to Netlify Pro for 26-second timeouts
- Use background jobs for long operations
- Cache scraping results

### Issue: "Row Level Security policy violation"

**Cause**: User doesn't have access to brain.

**Solution**:
```javascript
// Verify user owns brain or is org member
const { data: brain } = await supabase
  .from('business_brains')
  .select('*')
  .eq('id', brainId)
  .single();

if (!brain) {
  console.error('Access denied or brain not found');
}
```

### Issue: Vector search returns no results

**Cause**: Facts missing embeddings.

**Solution**:
```sql
-- Check for facts without embeddings
SELECT COUNT(*) FROM brain_facts WHERE embedding IS NULL;

-- Re-generate embeddings for affected facts
-- (trigger brain-enhance function with file upload)
```

### Issue: High OpenAI API costs

**Cause**: Generating too many embeddings.

**Solution**:
- Batch embedding generation
- Cache embeddings to avoid regeneration
- Use smaller embedding dimensions if accuracy allows

---

## Performance Optimization

### Database Indexing

Verify these indexes exist (should be created by migration):

```sql
-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('business_brains', 'brain_facts')
ORDER BY tablename, indexname;
```

Key indexes:
- `idx_brain_facts_embedding` (HNSW for vector search)
- `idx_brain_facts_fts` (GIN for full-text search)
- `idx_brain_facts_brain` (foreign key index)

### Caching Strategy

Implement caching for:

1. **Brain metadata**: Cache brain profiles in Redis/memory
2. **Frequently accessed facts**: Cache top 20 facts per brain
3. **Generated content**: Cache titles/snippets for 1 hour
4. **Embeddings**: Never re-generate for same text

Example Redis cache:

```javascript
// Pseudo-code
const cachedBrain = await redis.get(`brain:${brainId}`);
if (cachedBrain) return JSON.parse(cachedBrain);

const brain = await supabase.from('business_brains').select('*').eq('id', brainId).single();
await redis.setex(`brain:${brainId}`, 3600, JSON.stringify(brain.data));
```

### Netlify Function Optimization

1. **Bundle size**: Keep function bundles small (<5MB)
2. **Cold starts**: Pre-warm functions with scheduled pings
3. **Concurrent requests**: Handle rate limiting gracefully

Example rate limit handler:

```javascript
// In Netlify function
const MAX_REQUESTS_PER_MINUTE = 10;

if (requestCount > MAX_REQUESTS_PER_MINUTE) {
  return {
    statusCode: 429,
    body: JSON.stringify({ error: 'Rate limit exceeded' }),
  };
}
```

### Vector Search Optimization

For better performance:

```sql
-- Increase HNSW index work_mem for better build performance
SET work_mem = '256MB';

-- Tune HNSW parameters for accuracy vs. speed
CREATE INDEX idx_brain_facts_embedding_tuned
ON brain_facts
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## Next Steps

1. **Apply migration**: Run database migration on Supabase
2. **Configure environment**: Set all required environment variables in Netlify
3. **Deploy functions**: Push to Git or deploy via Netlify CLI
4. **Test endpoints**: Run test scripts to verify all functions work
5. **Integrate frontend**: Add BrainAPI client to your React app
6. **Monitor performance**: Set up logging and monitoring for functions

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Netlify Functions Docs**: https://docs.netlify.com/functions/overview/
- **OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings
- **Anthropic Claude**: https://docs.anthropic.com/claude/reference/messages_post

For project-specific questions, see:
- `docs/BUSINESS_BRAIN_COMPLETE_SYSTEM.md` - Complete architecture
- `docs/BUSINESS_BRAIN_MAINTENANCE_AGENTS.md` - Maintenance agents
- `supabase/migrations/20250107_business_brain_infrastructure.sql` - Database schema
