# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- **Development server**: `npm run dev` - Starts Vite development server (frontend only)
- **Dev with functions**: `npm run dev:netlify` or `npm run dev:functions` - Starts Netlify dev server (frontend + serverless functions)
- **Auto-commit dev**: `npm run dev:auto` - Development with intelligent auto-commit system
- **Safe development**: `npm run dev:safe` - Development without automation
- **Build**: `npm run build` - Creates production build using Vite
- **Lint**: `npm run lint` - Runs ESLint on the codebase
- **Preview**: `npm run preview` - Preview production build locally

**Note**: Use `npm run dev:netlify` when working with Growth Audit, Business Brain, or any features that require Netlify functions. Regular `npm run dev` only serves the frontend and will result in 404 errors for function endpoints.

### AI Image Generation
- **Generate service images**: `npm run generate:service-images` - Generate AI service images
- **Test image setup**: `npm run test:image-setup` - Test image generation setup
- **Integration examples**: `npm run integrate:service-images` - Integration examples

### MCP Server Management
- **Start orchestrator**: `npm run mcp:start` - Start MCP orchestrator
- **Check status**: `npm run mcp:status` - Check MCP server status
- **Health check**: `npm run mcp:health` - Run health checks on all MCP servers
- **Monitor**: `npm run mcp:monitor` - Start continuous monitoring
- **Optimize**: `npm run mcp:optimize` - Optimize MCP configuration
- **Analyze**: `npm run mcp:analyze` - Analyze MCP usage patterns
- **Security audit**: `npm run mcp:security` - Run security audit
- **Performance**: `npm run mcp:performance` - Performance analysis

### Changelog Management
- **Add entry**: `npm run changelog:add` - Add changelog entry
- **Flush**: `npm run changelog:flush` - Flush pending entries
- **Release**: `npm run changelog:release` - Create release from changelog
- **Status**: `npm run changelog:status` - Check changelog status

### Deployment Management
- **Deploy status**: `npm run deploy:status` - Show deployment status and history
- **Deploy Supabase**: `npm run deploy:supabase` - Deploy database migrations
- **Deploy Netlify**: `npm run deploy:netlify` - Deploy to Netlify (preview)
- **Deploy production**: `npm run deploy:prod` - Full-stack production deployment
- **Rollback**: `npm run deploy:rollback <id>` - Rollback to previous deployment
- **Watch mode**: `npm run deploy:watch` - Auto-deploy on changes
- **Sync env**: `npm run deploy:sync-env` - Sync environment variables to Netlify

### Database & Migration Management
- **Setup database**: `npm run db:setup` - Initialize database schema and configuration
- **Apply Business Brain migration**: `node scripts/apply-business-brain-migration.js` - Apply Business Brain infrastructure
- **Verify Business Brain tables**: `node scripts/verify-business-brain-tables.cjs` - Verify migration success

## Project Architecture

This is a React SPA built with Vite serving as a marketing website for Disruptors AI. It features a sophisticated architecture combining custom routing, comprehensive UI systems, dual API integration, and advanced AI generation capabilities.

### Unique Custom Routing System

The application implements a distinctive routing architecture managed in `src/pages/index.jsx`:

- **39 page components** centrally imported and mapped in a `PAGES` object
- **URL-to-component mapping** handled by `_getCurrentPage()` function
- **Layout wrapper system** where `Layout.jsx` wraps all pages and receives `currentPageName` prop
- **Dual routing definition** with both custom mapping and React Router `<Routes>`
- **Page patterns**: Work case studies (`work-[client-name].jsx`), Solutions (`solutions-[service].jsx`)
- **Lazy loading strategy**: All pages except Home are lazy-loaded using React.lazy() with Suspense
- **Demo pages** (3D/animation heavy) are lazy-loaded to defer ~2MB physics bundle until needed

### Component Architecture (49 UI + 15 Shared + Domain-Specific)

- **UI Components** (`src/components/ui/`): 49 Radix UI-based design system components following shadcn/ui patterns
- **Shared Components** (`src/components/shared/`): Reusable business components including:
  - Hero, ServiceScroller, AIMediaGenerator for content
  - AlternatingLayout, VideoScrollScrub for layouts
  - SplineViewer, SplineScrollAnimation for 3D integration
- **Admin Components** (`src/components/admin/`): Secure admin interface with MatrixLogin and secret access patterns
- **Domain Components**: Organized by feature (`home/`, `work/`, `solutions/`)
- **Animation Utilities** (`src/utils/splineAnimations.js`): GSAP + Spline integration helpers
- **Performance Hooks** (`src/hooks/useSplinePerformance.js`): 3D performance monitoring

### Dual API Integration Architecture

**Custom SDK System** (`src/lib/custom-sdk.js`):
- Base44-compatible wrapper around Supabase with automatic entity-to-table mapping
- Dynamic CRUD operations with field mapping between Base44 and Supabase formats
- Service role vs. regular client selection based on entity patterns
- Development mode with auto-user creation, OAuth for production
- Graceful handling of missing tables for legacy compatibility

**Supabase Integration** (`src/lib/supabase-client.js`):
- Environment-aware configuration with automatic fallback to local instance
- Dual client setup: service role for admin operations, regular for user operations
- MCP Server Integration: Direct database operations through Supabase MCP server for enhanced development workflow

### AI Generation Orchestrator

**Multi-Provider System** (`src/lib/ai-orchestrator.js`):
- **OpenAI**: gpt-image-1 ONLY (natively multimodal, streaming, C2PA metadata, input fidelity control)
- **Google**: gemini-2.5-flash-image-preview (Nano Banana) with editing, composition, SynthID watermarking
- **Replicate**: Flux 1.1 Pro, SDXL models for specialized use cases
- **🚫 CRITICAL**: DALL-E is ABSOLUTELY FORBIDDEN - runtime validation blocks all DALL-E models
- **Model Validation**: All image generation validates against hard-pinned approved model list
- **Intelligent Model Selection**: Context-aware selection based on quality, budget, specialization
- **Brand Consistency**: Automatic enforcement of brand guidelines across generations

**AutoBlog System** (`src/lib/anthropic-blog-writer.js`):
- **AI-Powered Content**: Claude Sonnet 4.5 generates full SEO-optimized blog articles
- **System Prompt Engineering**: 1,200+ word articles with Answer Boxes, FAQs, and schema hints
- **Brand Voice**: Disruptors & Co tone - bold, contrarian, no-fluff content for skilled trades
- **Keyword Optimization**: Primary/secondary keyword targeting with AIO & GEO optimization
- **Batch Processing**: Generate multiple articles with rate limiting and progress tracking
- **Blog Management UI**: "Write Articles" button in admin Content Management module
- **Smart Filtering**: Only generates for posts without existing content (<200 chars)
- **See**: `docs/AUTOBLOG_SYSTEM.md` for complete documentation

**Keyword Research System** (`src/lib/dataforseo-client.js`, `src/components/admin/`):
- **DataForSEO Integration**: Real keyword data (volume, difficulty, CPC, trends)
- **Smart Scoring**: Opportunity score algorithm balancing volume vs. competition
- **Multi-Select UI**: Visual keyword selection with stats dashboard
- **Individual Post Generation**: Generate/edit single posts with keyword targeting
- **BlogManagementDashboard**: Unified interface with 4 tabs (Research, Generate, Manage, Edit)
- **Database Schema**: Extended `posts` table with keyword fields (primary_keyword, secondary_keywords, keyword_data)
- **Workflow**: Research → Select → Generate → Edit → Publish
- **See**: `docs/KEYWORD_RESEARCH_SYSTEM.md` for complete documentation

**Growth Audit System** (`src/lib/growth-audit/`, `netlify/functions/`):
- **AI-Powered Website Analysis**: Instant growth audits using Claude Sonnet 4.5
- **Multi-Source Data Collection**: Firecrawl (web crawling), Playwright (metadata), Brandfetch (brand detection), PageSpeed Insights (performance)
- **Business Profile Generation**: Automated extraction of brand identity, offerings, ICP, tech stack, competitors
- **Opportunity Detection**: 8-15 prioritized growth opportunities across 10 categories (SEO, Content, Performance, CRO, Local, Social, Paid, EmailCRM, DataTracking, AI)
- **Service Package Mapping**: AI maps opportunities to Starter/Core/Scale service packages with 30/60/90 day execution plans
- **Sales Copy Generation**: Automated email templates and custom copy generation
- **Netlify Functions**:
  - `growth-audit-ingest.js` - Data collection orchestration with job queueing
  - `growth-audit-stream.js` - Polling-based results delivery via Server-Sent Events
  - `shared/job-storage.js` - In-memory job state management
- **Demo Pages**: `/demos/growth-audit` (landing) and `/demos/growth-audit/:jobId` (results)
- **Architecture**: Serverless job queue → Data collection → AI analysis → SSE streaming → Results page
- **See**: `docs/GROWTH_AUDIT_INTEGRATION_REPORT.md`, `docs/GROWTH_AUDIT_QUICK_REFERENCE.md` for complete documentation

**Business Brain System** (`src/admin/modules/BusinessBrainBuilder.jsx`, Netlify functions):
- **AI-Powered Knowledge Base**: Central intelligence layer for all AI-generated content
- **Multi-Source Knowledge Ingestion**: Web scraping (Firecrawl), AI onboarding (Claude), manual entry, file uploads
- **Three-Tier Brain Levels**:
  - Level 1 Starter (auto-generated, confidence 0.3-0.5)
  - Level 2 Enhanced (AI onboarding, confidence 0.6-0.8)
  - Level 3 Expert (full brand guidelines, confidence 0.9-1.0)
- **Brand Identity Storage**: Colors, typography, logo, brand rules, voice/tone guidelines
- **Fact Management**: Categorized facts with FTS + vector search, confidence scoring, evidence URLs
- **Content Personalization**: All AI content uses brain context for brand-consistent generation
- **Netlify Functions**:
  - `brain-auto-initialize.ts` - Auto-scrape and create starter brain
  - `brain-enhance.ts` - AI onboarding conversation engine
  - `brain-content-generate.ts` - Brain-aware content generation
- **Database Schema**: 7 new tables (business_brains, brain_facts, brand_rules, brand_assets, onboarding_sessions, knowledge_sources, posts_brain_facts)
- **See**: `docs/BUSINESS_BRAIN_COMPLETE_SYSTEM.md`, `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md` for complete documentation

**Brain Theming System** (`src/hooks/useBrainTheming.js`, `src/components/layout/BrainThemedLayout.jsx`):
- **Dynamic White-Label Interface**: App interfaces automatically inherit user's brand identity
- **Brand Data Integration**: Colors, typography, and logos from Business Brain applied to UI
- **CSS Custom Properties**: 8 variables injected globally (--brand-primary, --brand-secondary, --brand-accent, --brand-neutral, --font-heading, --font-body, --font-accent, --brand-logo-url)
- **BrainThemedLayout Wrapper**: Automatic brain loading, theme injection, loading/error states, optional brain info header
- **Branded Components**: 11 reusable components (BrandedStatCard, BrandedProgressBar, BrandedBadge, BrandedGradientText, etc.)
- **Fallback Theme**: Disruptors & Co default theme when no brain exists or user not authenticated
- **Zero Re-renders**: Theme variables injected once on mount, cleanup on unmount
- **App Integration**: AI Content Writer and Business Brain Manager use BrainThemedLayout
- **Testing Script**: `node scripts/test-brain-theming.js` validates schema, files, and integration
- **See**: `docs/BRAIN_THEMING_SYSTEM.md`, `EXAMPLE_BRAIN_THEMING_INTEGRATION.md` for complete documentation

### MCP (Model Context Protocol) Ecosystem

Extensive integration with 23+ MCP servers across:
- **Development**: GitHub, filesystem, memory, sequential thinking
- **Database**: Supabase MCP server for direct database operations, project management, and enhanced development tools
- **Animation**: GSAP Master MCP server for AI-powered animation generation with surgical precision
- **3D Graphics**: Spline MCP server for programmatic control of 3D scenes, objects, materials, and animations
- **Web Automation**: Firecrawl, Playwright, Puppeteer
- **Cloud Services**: Vercel, Netlify, DigitalOcean, Railway, Cloudinary
- **AI & Content**: Replicate, Nano Banana (Gemini), Figma workflow

**MCP Orchestration** (`scripts/mcp-orchestrator.js`):
- Centralized management of all MCP server connections
- Health monitoring and automatic recovery
- Performance optimization and usage analytics
- Security auditing and configuration validation

### User Authentication & App Integration System

**Complete Authentication System**:
- **Glassmorphism login modal** with animated gradient background (`src/components/auth/LoginModal.jsx`)
- **Dual authentication**: Google OAuth and email/password via Supabase
- **Protected routes**: All `/app/*` routes require authentication
- **Session persistence**: Automatic session management with localStorage
- **6-step onboarding flow**: Welcome → Brain intro → Value prop → Business info → Brand DNA → Complete

**App Integration** (`/app/*` routes):
- **AI Content Writer** (`/app/content-writer`): AI-powered content generation with Business Brain context
- **Business Brain Manager** (`/app/business-brain`): Full brain management dashboard
- **Resources Page Integration**: Tools marked `isLive: true` show green "LIVE" badge and navigate to apps
- **Protected Route wrapper**: Automatically shows login modal if not authenticated
- **Business Brain auto-loading**: Apps automatically load user's brain on mount

**Authentication Components** (`src/components/auth/`):
- **LoginModal.jsx** (320 lines): Premium login UI with OAuth and email/password
- **OnboardingFlow.jsx** (540+ lines): 6-step wizard collecting business info and creating Business Brain
- **ProtectedRoute.jsx** (90 lines): Auth guard that wraps all app routes
- **auth-callback.jsx** (75 lines): OAuth redirect handler for Google authentication

**Business Brain Creation on Signup**:
```javascript
// Automatically created during onboarding
const brainData = {
  user_id: user.id,
  business_name: businessInfo.businessName,
  primary_website: businessInfo.website,
  industry: businessInfo.industry,
  business_description: businessInfo.description,
  slug: slug,
  onboarding_completed: true,
  brain_level: 'starter',
  confidence_score: 0.3,
  brand_colors: { primary, secondary }
};
const brain = await BrainAPI.createBrain(brainData);

// Optional: Trigger website scraping for auto-initialization
if (businessInfo.website) {
  await BrainAPI.autoInitializeBrain(brain.id, {
    website_url: businessInfo.website
  });
}
```

**Database Schema**:
- `business_brains` table: 51 columns including business intelligence, brand identity, and brain metrics
- **Core fields**: id, name, business_name, slug, created_by, primary_website, industry
- **Brand identity**: brand_colors, typography, logo_urls, design_style, brand_voice, tone_attributes
- **Business intelligence**: ideal_customer_profile, core_offerings, unique_value_propositions, competitor_urls
- **Brain metrics**: brain_level (starter/enhanced/expert), confidence_score (0.0-1.0), total_facts
- **Status flags**: onboarding_completed, auto_initialized, web_scrape_completed

**BrainAPI Methods** (`src/lib/brain-api.js`):
- `createBrain(brainData)`: Direct database insert for brain creation
- `autoInitializeBrain(brainId, options)`: Trigger website scraping
- `getBrainByUser(userId)`: Load user's brain
- `getBrainById(brainId)`: Load specific brain
- `initializeBrain(userId, websiteUrl, businessName, options)`: Full initialization flow

**Security**:
- Row Level Security (RLS) on business_brains table
- Users can only access their own brains
- Service role for admin operations
- JWT-based authentication via Supabase
- Session expiration and auto-refresh

**Testing**:
- Test user: `testuser1@example.com` / `TestPass123!`
- Create test users: `node scripts/create-test-user.js <email> <password> <business> <website> <industry>`
- Schema verification: `node scripts/check-brain-schema.js`

**Documentation**:
- Complete guide: `docs/AUTHENTICATION_SYSTEM.md`
- App integration: `docs/APP_INTEGRATION_GUIDE.md`
- User guide: `docs/BUSINESS_BRAIN_USER_GUIDE.md`
- Test credentials: `TEST_USER_CREDENTIALS.md`

### Admin Access System

**⚠️ IMPORTANT - System Isolation**:
Admin Nexus and Public User Accounts are currently **separate, isolated systems**:
- **Public users** (`/app/*`) use Supabase Auth (Google OAuth + email/password), each with their own Business Brain
- **Admin console** (`/admin/secret`) uses session-based auth, manages site content and team members (internal staff)
- **No integration** exists between systems - admins cannot view/manage registered user accounts or their brains
- **Team Management module** manages `team_members` table (site staff), NOT the `auth.users` table (registered users)
- **Future integration planned**: See `docs/USER_ACCOUNT_ADMIN_INTEGRATION_PLAN.md` for detailed integration roadmap

**Secret Access Pattern**:
- 5 logo clicks in 3 seconds OR Ctrl+Shift+D activates admin access
- Ctrl+Shift+Escape for emergency exit
- Matrix-style login interface with session-based authentication (24-hour expiry)
- Secure admin dashboard accessible only via secret patterns
- Admin route: `/admin/secret` with 11 modules
- Service role authentication for elevated admin operations

**Admin Modules** (`src/admin/modules/`):
- **Dashboard Overview**: Stats, activity monitoring, system health
- **Content Management**: AI-powered post editor with blog management
- **Team Management**: Role-based permissions, team member profiles
- **Media Library**: Asset catalog with AI image tracking
- **Business Brain Builder**: Knowledge base with fact extraction and onboarding
- **Agent Chat**: Interactive AI agent conversations
- **Agent Builder** (stub): AI agent creation and training interface
- **Brand DNA Builder** (stub): Brand voice and style configuration
- **Workflow Manager** (stub): Automation pipeline designer
- **Integrations Hub** (stub): Third-party service connections
- **Telemetry Dashboard** (stub): System monitoring and analytics

**Admin Architecture**:
- Zero-impact public site integration (single route guard in App.jsx)
- Lazy-loaded modules for optimal performance
- Dual authentication contexts (admin vs. public)
- TypeScript API layer (`src/admin/api/`) with JavaScript public API preserved
- Session-based auth with 24-hour expiry

### Technology Stack

- **Framework**: React 18 with Vite, React Router DOM v7.2.0
- **Styling**: Tailwind CSS with custom design tokens, Radix UI primitives
- **Animation**:
  - Framer Motion for interactions and page transitions
  - GSAP 3.13.0 for advanced scroll-based and timeline animations
  - Spline 3D (`@splinetool/react-spline`) for 3D interactive content
- **Database**: Supabase with custom SDK wrapper
- **AI Services**: OpenAI gpt-image-1, Google Gemini 2.5 Flash Image, Replicate, ElevenLabs, Anthropic Claude Sonnet 4.5 (AutoBlog system)
- **Deployment**: Netlify with SPA routing, CSP headers, optimized caching

### File Organization & Patterns

**Page Structure** (39 total pages):
- Core: Home, About, Contact, Work, Solutions, Blog system
- Case Studies: 9 work pages (`work-[client].jsx`)
- Solutions: 8 solution pages (`solutions-[service].jsx`)
- Utility: Assessment, Calculator, Gallery, Podcast, Privacy, Terms

**Component Patterns**:
- Functional components with hooks
- JSDoc documentation for public APIs
- Consistent Radix UI composition patterns
- Environment-aware service selection

### Path Aliases

- `@/` resolves to `src/` directory (configured in `vite.config.js`)

### Environment Configuration

#### Core Services
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Growth Audit System (Required for /demos/growth-audit)
VITE_FIRECRAWL_API_KEY=your_firecrawl_key      # Web crawling (required)
VITE_BRANDFETCH_API_KEY=your_brandfetch_key    # Brand detection (optional)
VITE_PAGESPEED_API_KEY=your_google_api_key     # PageSpeed Insights (optional)

# Keyword Research System (DataForSEO)
DATAFORSEO_LOGIN=your_dataforseo_email         # Real keyword data
DATAFORSEO_PASSWORD=your_dataforseo_password   # Volume, difficulty, CPC, trends

# AI Generation Services
VITE_OPENAI_API_KEY=your_openai_key          # gpt-image-1 ONLY (NOT DALL-E)
VITE_GEMINI_API_KEY=your_gemini_key          # gemini-2.5-flash-image-preview (Nano Banana)
VITE_REPLICATE_API_TOKEN=your_replicate_token
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key    # AutoBlog system (Claude Sonnet 4.5)

# CRITICAL: Only approved models - DALL-E usage will throw runtime errors
# - OpenAI: gpt-image-1 (image generation)
# - Google: gemini-2.5-flash-image-preview (Nano Banana)
# - Anthropic: Claude Sonnet 4.5 (AutoBlog article generation, writing assistance)
# - Anthropic: Claude Opus 4.1 (advanced reasoning, complex content)
```

#### MCP Integration
```bash
# Development Workflow
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
NETLIFY_AUTH_TOKEN=your_netlify_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Key Architectural Patterns

**Convention over Configuration**: Automatic entity-to-table mapping, dynamic component generation, environment-aware service selection

**Progressive Enhancement**: Graceful degradation for missing services, fallback mechanisms for AI generation, development mode accommodations

**Modular Architecture**: Component composition patterns, service layer abstraction, plugin-based MCP integration

### Development Workflow

**Automation Scripts**:
- Auto-commit system with intelligent change detection
- Changelog management with semantic versioning
- Documentation synchronization engine
- Integration management for various services

**Code Quality Standards**:
- ESLint with React and accessibility rules
- Consistent component patterns using Radix UI
- TypeScript adoption for utilities (`src/utils/index.ts`)
- Performance optimization with lazy loading and efficient routing

### Netlify Serverless Functions

**10 Background Functions** (`netlify/functions/`):
- **Growth Audit System** (2 functions):
  - `growth-audit-ingest.js` - Website crawling, brand detection, PageSpeed analysis
  - `growth-audit-stream.js` - Server-Sent Events streaming for real-time results
- **Business Brain System** (3 functions):
  - `brain-auto-initialize.ts` - Auto-scrape website to create starter brain
  - `brain-enhance.ts` - AI onboarding conversation engine with Claude
  - `brain-content-generate.ts` - Brain-aware content generation
- **Admin Nexus System** (2 functions):
  - `ai_invoke.ts` - AI generation with streaming support
  - `agent_train-background.ts` - Background AI agent training
- **Content & SEO** (2 functions):
  - `dataforseo-keywords.js` - Keyword research with DataForSEO API
  - `ingest_dispatch-background.ts` - Content ingestion dispatcher
- **Utilities** (1 function):
  - `screenshot-capture.js` - Playwright-based screenshot capture

**Shared Utilities** (`netlify/functions/shared/`):
- `job-storage.js` - In-memory job queue and state management

**External Dependencies** (configured in `netlify.toml`):
- AI SDKs: `@ai-sdk/openai`, `@ai-sdk/anthropic`, `ai`
- Browser automation: `playwright`, `playwright-core`, `chromium-bidi`
- Scraping & analysis: `@mendable/firecrawl-js`, `node-vibrant`, `culori`

### Deployment Configuration

- **Platform**: Netlify with automatic Git deployment
- **Site ID**: `cheerful-custard-2e6fc5`
- **Primary Domain**: https://dm4.wjwelsh.com
- **Netlify Domain**: https://master--cheerful-custard-2e6fc5.netlify.app
- **Admin Dashboard**: https://app.netlify.com/projects/cheerful-custard-2e6fc5
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`
- **SPA Routing**: Handled by `_redirects` file
- **Security**: CSP headers for AI APIs (OpenAI, Anthropic, Gemini, Firecrawl, Brandfetch, PageSpeed), XSS protection, frame options
- **Environment**: Node.js 18, esbuild bundler, optimized caching
- **Function Timeout**: 26 seconds (Netlify free tier limit)
- **MCP Integration**: Netlify MCP server (`@netlify/mcp@latest`) configured in `mcp.json:114-123`
  - Deploy with full context (branch, logs, config)
  - Manage environment variables and secrets
  - Install/configure extensions (Supabase, Auth0, Cloudinary)
  - Access real-time deploy logs and diagnostics
  - Configure domains and access controls

### Key Dependencies

**Core Framework**: `react@^18.2.0`, `react-router-dom@^7.2.0`, `vite@^6.1.0`
**UI & Styling**: `tailwindcss@^3.4.17`, `@radix-ui/*` (20+ packages), `framer-motion@^12.4.7`
**Animation**: `gsap@^3.13.0`, `@splinetool/react-spline@^4.1.0`, `@splinetool/runtime@^1.10.71`
**Data & API**: `@supabase/supabase-js@^2.57.4`, `@base44/sdk@^0.1.2`
**AI Services**: `openai@^5.23.0`, `@google/generative-ai@^0.24.1`, `replicate@^1.2.0`, `@anthropic-ai/sdk@^0.65.0`

### Build Optimization & Performance

**Vite Configuration** (`vite.config.js:34-101`):
- **Manual chunk splitting** for optimal bundle distribution:
  - `vendor-react`: Core React/Router (reduces main bundle size)
  - `vendor-ui`: All 20+ Radix UI components grouped together
  - `vendor-animation`: Framer Motion + GSAP separated
  - `vendor-3d`: Spline libraries isolated (only loaded when needed)
  - `vendor-ai`: AI generation libraries (OpenAI, Gemini, Replicate)
  - `vendor-database`: Supabase + Base44 SDK
  - `vendor-utils`: Utility libraries (clsx, tailwind-merge, zod, etc.)
- **Experimental min chunk size**: 20KB to prevent excessive fragmentation
- **Chunk size warning limit**: 250KB (prevents bloated bundles)
- **Path alias**: `@/` resolves to `src/` directory
- **Global polyfills**: `global` → `globalThis`, `process.env` → `{}`

## Important Development Notes

### Business Brain Migration Status

**Database Migration**: The Business Brain infrastructure migration is **ready but not yet applied** to production database.

**Migration Files**:
- `supabase/migrations/20250107_business_brain_infrastructure.sql` - Complete schema with 7 new tables
- `scripts/apply-business-brain-migration.js` - Migration application script
- `scripts/verify-business-brain-tables.cjs` - Post-migration verification
- `APPLY_MIGRATION_NOW.md` - Step-by-step migration instructions

**What's Included**:
- 7 new tables: business_brains, brain_facts, brand_rules, brand_assets, onboarding_sessions, knowledge_sources, posts_brain_facts
- Full-text search (FTS) + vector embeddings for semantic fact search
- Row Level Security (RLS) policies on all tables
- Functions: search_brain_facts (FTS), calculate_brain_health (metrics)
- Views: brain_health_summary (aggregated metrics)

**Before Using Business Brain Features**:
1. Review migration SQL: `supabase/migrations/20250107_business_brain_infrastructure.sql`
2. Apply migration: `node scripts/apply-business-brain-migration.js`
3. Verify tables: `node scripts/verify-business-brain-tables.cjs`
4. See detailed instructions: `APPLY_MIGRATION_NOW.md` or `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md`

### Key Workflow Patterns

**Growth Audit Job Queue Flow**:
1. User submits URL on `/demos/growth-audit`
2. `growth-audit-ingest.js` creates job, starts background data collection
3. Orchestrator runs: Firecrawl → Playwright → Brandfetch → PageSpeed
4. AI analyzer generates business profile + 8-15 opportunities with Claude Sonnet 4.5
5. Service mapper creates Starter/Core/Scale packages with 30/60/90 day plans
6. Sales copy generator creates email templates
7. Client polls `growth-audit-stream.js` via Server-Sent Events
8. Results displayed on `/demos/growth-audit/:jobId`

**Business Brain Onboarding Flow**:
1. Admin creates brain via Business Brain Builder module
2. Auto-initialize function scrapes website with Firecrawl
3. AI extracts facts (20-50) with confidence scores (0.3-0.5 = Level 1 Starter)
4. Optional: AI onboarding conversation enhances brain to Level 2 (0.6-0.8)
5. Optional: Manual brand guidelines upload achieves Level 3 Expert (0.9-1.0)
6. Brain facts used as context in all AI content generation (blog posts, copy, etc.)

**Admin Access Flow**:
1. Public site: Click logo 5 times in 3 seconds OR press Ctrl+Shift+D
2. Matrix-style login appears (secret access pattern activated)
3. Authenticate with email/password (session-based, 24-hour expiry)
4. Redirect to `/admin/secret` with 11 modules
5. Lazy-load modules on demand (zero impact on public site)
6. Emergency exit: Ctrl+Shift+Escape clears session

### Testing and Quality Assurance
- **No test framework** is configured - verify functionality through manual browser testing
- **Linting**: Always run `npm run lint` before commits (ESLint with React rules)
- **Error Debugging**: Check browser console and network tab for client-side issues

### Data Layer Architecture
- **Use `src/lib/custom-sdk.js`** for ALL data operations - provides Base44-compatible API over Supabase
- **Centralized Supabase Clients**: ALL imports MUST use `src/lib/supabase-client.js`
  - `supabase` / `supabaseClient` - Main client for user operations (anon key)
  - `supabaseAdmin` - Service role client for admin operations (bypasses RLS)
  - **DO NOT create new clients** - Import from supabase-client.js to avoid "Multiple GoTrueClient instances" warning
- **Single storage key**: `disruptors-ai-auth` used by main client across entire app
- **Environment variables**: All client-accessible config uses `VITE_` prefix
- **Server-side operations**: Netlify functions use service role key for elevated permissions

### Automation and Workflow
- **Auto-commit system**: `npm run dev:auto` enables intelligent auto-commits during development
- **Scripts directory**: Contains automation for changelog management, deployment setup, and integration management
- **Deployment**: Netlify with `_redirects` file handling SPA routing, CSP headers configured

### Component Development Standards
- **Follow Radix UI patterns**: Reference `src/components/ui/` for consistent shadcn/ui implementation
- **File organization**: Domain-specific components in feature directories (`home/`, `work/`, `solutions/`)
- **Animation patterns**:
  - Use Framer Motion for page transitions and UI interactions
  - Use GSAP for scroll-triggered animations, timelines, and complex sequences
  - Use Spline for 3D interactive content with GSAP integration via `splineAnimations.js`
  - Monitor 3D performance with `useSplinePerformance` hook

### Git Workflow
- **Main branch**: `master` (not main)
- **Feature branches**: Use descriptive branch names (e.g., `update1`, `feature-name`)
- **Auto-commit**: Enabled via `npm run dev:auto` with intelligent change detection
- **Commit patterns**: Auto-commits track changes systematically with semantic messages

### GSAP Master MCP Server
The project includes the GSAP Master MCP Server for AI-powered animation generation:
- **AI Animation Creator**: Generate animations from natural language descriptions
- **API Expert**: Complete GSAP documentation and best practices
- **Setup Generator**: One-command setup for various frameworks
- **Debugger**: AI-powered animation troubleshooting
- **Performance Optimizer**: 60fps optimization for desktop and mobile
- **Production Patterns**: Battle-tested animation systems

See `docs/GSAP_MASTER_SETUP_GUIDE.md` for detailed usage instructions.

### Spline MCP Server
The project includes a comprehensive Spline MCP Server for 3D scene management:
- **100+ Tools**: Object, material, scene, event, action, lighting, camera tools
- **Runtime Integration**: Generate React, Next.js, and vanilla JS code
- **Animation Control**: Programmatic animations and scroll triggers
- **Scene Export**: GLB, GLTF, FBX, OBJ format support
- **Performance Monitoring**: Real-time stats and optimization tools
- **GSAP Integration**: Seamless coordination with GSAP animations

See `docs/mcp-servers/spline-mcp-server.md` for detailed usage instructions.

### Base44 AI Content Writer Analysis
The project includes a complete analysis of the Base44 AI Content Writer system for feature extraction and migration planning:
- **Complete Feature Inventory**: 170 source files, 20+ entities analyzed
- **Multitenant Architecture**: Client-based multitenancy with knowledge base management
- **AI Training System**: Client-specific AI training with file uploads
- **Content Workflow**: Ideation → Generation → Review → Scheduling → Publishing
- **Rich Text Editor**: ReactQuill WYSIWYG with auto-markdown-to-HTML conversion
- **Dual AI Providers**: Claude/OpenAI LLM abstraction layer
- **See**: `docs/BASE44_AI_CONTENT_WRITER_ANALYSIS.md` for complete analysis

### ANACHRON Lite Icon Generation System

**Style Guide for AI-Generated Service Icons**

ANACHRON Lite is a minimal vector icon system for service graphics. Use this system prompt when generating or regenerating service icons:

#### Core Requirements
- **Style**: Simple flat vector icons, extremely minimal
- **Stroke**: 2px black outline only
- **Geometry**: Basic geometric shapes (circles, triangles, squares, lines)
- **Accent**: Single accent color per icon from approved palette
- **Background**: White (will be converted to transparent via post-processing)
- **Format**: 1024×1024 PNG, centered composition

#### Approved Color Palette (Accents Only)
- **Lapis Blue** `#2C6BAA` - Technology, automation, data
- **Terracotta** `#C96F4C` - Communication, media, social
- **Verdigris Green** `#3C7A6A` - Growth, environment, discovery
- **Muted Gold** `#C9A53B` - Premium, strategy, leadership

#### Negative Constraints
Avoid: textures, patterns, gradients, shadows, 3D effects, shading, ornate details, complex compositions, realistic rendering, photographic elements

#### Generation Workflow
1. Generate icons using Replicate Flux 1.1 Pro with simple vector prompts
2. Post-process with `scripts/make-backgrounds-transparent.js` to convert white to transparent
3. Verify RGBA format and file size (target: 300-900KB)

#### Example Prompts
```
Simple flat vector icon: [single shape description], 2px black stroke, 
minimal geometric design, [color] accent color [hex], white background, 
extremely simple, clean lines, centered, icon style, no details, no texture
```

**Models**: Replicate Flux 1.1 Pro (approved)
**Scripts**: `scripts/generate-anachron-lite-replicate.js`, `scripts/make-backgrounds-transparent.js`
