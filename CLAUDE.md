# CLAUDE.md

This file provides essential guidance for Claude Code when working with code in this repository.

## Development Commands

### Core Development
- **Development server**: `npm run dev` - Starts Vite development server (frontend only)
- **Dev with functions**: `npm run dev:netlify` or `npm run dev:functions` - Starts Netlify dev server (frontend + serverless functions)
- **Auto-commit dev**: `npm run dev:auto` - Development with intelligent auto-commit system
- **Safe development**: `npm run dev:safe` - Development without automation
- **Build**: `npm run build` - Creates production build using Vite
- **Lint**: `npm run lint` - Runs ESLint on the codebase
- **Preview**: `npm run preview` - Preview production build locally

**Note**: Use `npm run dev:netlify` when working with Growth Audit, Marketing Audit, Business Brain, or any features that require Netlify functions.

### AI Image Generation
- **Generate service images**: `npm run generate:service-images`
- **Test image setup**: `npm run test:image-setup`
- **Integration examples**: `npm run integrate:service-images`

### MCP Server Management
- **Start orchestrator**: `npm run mcp:start`
- **Check status**: `npm run mcp:status`
- **Health check**: `npm run mcp:health`
- **Monitor**: `npm run mcp:monitor`
- **Optimize**: `npm run mcp:optimize`
- **Security audit**: `npm run mcp:security`

### Changelog Management
- **Add entry**: `npm run changelog:add`
- **Flush**: `npm run changelog:flush`
- **Release**: `npm run changelog:release`
- **Status**: `npm run changelog:status`

### Deployment Management
- **Deploy status**: `npm run deploy:status`
- **Deploy Supabase**: `npm run deploy:supabase`
- **Deploy Netlify**: `npm run deploy:netlify`
- **Deploy production**: `npm run deploy:prod`
- **Rollback**: `npm run deploy:rollback <id>`
- **Watch mode**: `npm run deploy:watch`
- **Sync env**: `npm run deploy:sync-env`

### Database & Migration Management
- **Setup database**: `npm run db:setup`
- **Apply Business Brain migration**: `node scripts/apply-business-brain-migration.js`
- **Verify Business Brain tables**: `node scripts/verify-business-brain-tables.cjs`
- **Apply Modules migration**: `node scripts/apply-modules-migration.js`
- **Verify Modules tables**: `node scripts/verify-modules-migration.js`
- **Seed Modules**: `node scripts/seed-modules.js`

## Project Overview

This is a React SPA built with Vite serving as a marketing website and AI-powered platform for Disruptors AI. It features a sophisticated architecture combining:

- **Custom Routing System**: 70+ pages with centralized mapping in `src/pages/index.jsx`
- **Dual API Integration**: Custom SDK wrapper over Supabase with Base44 compatibility
- **AI-First Modules System**: Self-contained micro-tools with three-level access (internal/client/public)
- **Multi-Provider AI Services**: OpenAI gpt-image-1, Google Gemini, Replicate, Claude Sonnet 4.5
- **Business Brain System**: AI-powered knowledge base for brand-consistent content generation
- **MCP Ecosystem**: 23+ MCP servers for development, database, animation, 3D, web automation, cloud services

**Key Systems**:
- **Authentication**: Supabase Auth with Google OAuth + email/password
- **Admin Console**: Secret-access admin panel at `/admin/secret` (internal staff only)
- **Modules**: Keyword Research, AI Content Writer, Growth Audit (all production-ready)
- **Serverless Functions**: 11 Netlify functions for AI processing, audits, and brain management

## Critical Architecture Patterns

### Data Layer (MUST FOLLOW)

**Use `src/lib/custom-sdk.js` for ALL data operations** - provides Base44-compatible API over Supabase.

**Centralized Supabase Clients** - ALL imports MUST use `src/lib/supabase-client.js`:
```javascript
import { supabase, supabaseAdmin } from '@/lib/supabase-client'
```

- `supabase` / `supabaseClient` - Main client for user operations (anon key)
- `supabaseAdmin` - Service role client for admin operations (bypasses RLS)
- **DO NOT create new clients** - Import from `supabase-client.js` to avoid "Multiple GoTrueClient instances" warning
- **Single storage key**: `disruptors-ai-auth` used across entire app

### Routing System

Custom routing in `src/pages/index.jsx`:
- 70+ page components centrally imported and mapped in `PAGES` object
- URL-to-component mapping via `_getCurrentPage()` function
- Layout wrapper system where `Layout.jsx` wraps all pages
- Lazy loading: All pages except Home use React.lazy() with Suspense

See `docs/architecture/ROUTING_SYSTEM.md` for details.

### Component Patterns

- **UI Components**: `src/components/ui/` - 50 Radix UI-based components (shadcn/ui patterns)
- **Shared Components**: `src/components/shared/` - Reusable business components
- **Admin Components**: `src/components/admin/` - Secure admin interface
- **Path Alias**: `@/` resolves to `src/` directory

### Animation Standards

- **Framer Motion** - Page transitions and UI interactions
- **GSAP 3.13.0** - Scroll-triggered animations, timelines, complex sequences
- **Spline 3D** - 3D interactive content with GSAP integration via `splineAnimations.js`
- **Performance**: Monitor 3D with `useSplinePerformance` hook

## Environment Variables

### Required for Core Functionality
```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
VITE_ANTHROPIC_API_KEY=your_anthropic_key    # Claude Sonnet 4.5 (AutoBlog, Brain)
VITE_OPENAI_API_KEY=your_openai_key          # gpt-image-1 ONLY (NOT DALL-E)
VITE_GEMINI_API_KEY=your_gemini_key          # gemini-2.5-flash-image-preview

# Growth Audit System
VITE_FIRECRAWL_API_KEY=your_firecrawl_key    # Web crawling (required)

# Keyword Research
DATAFORSEO_LOGIN=your_dataforseo_email
DATAFORSEO_PASSWORD=your_dataforseo_password

# CRITICAL: DALL-E is FORBIDDEN - runtime validation blocks all DALL-E models
```

### Optional Services
```bash
VITE_REPLICATE_API_TOKEN=your_replicate_token
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_BRANDFETCH_API_KEY=your_brandfetch_key    # Brand detection
VITE_PAGESPEED_API_KEY=your_google_api_key     # PageSpeed Insights

# MCP Integration
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token
NETLIFY_AUTH_TOKEN=your_netlify_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
```

All client-accessible config uses `VITE_` prefix. Server-side Netlify functions use service role key.

## Important Development Notes

### Modules System (AI-First Website OS)

Disruptors AI uses a modular "Website OS" architecture:
- **Self-contained modules** with manifests, schemas, and quotas
- **Three-level access**: Internal (admin), Client (authenticated), Public (lead magnets)
- **Business Brain integration**: All modules receive brain context for personalization
- **Telemetry tracking**: Every execution tracked for analytics and billing

**Production Modules**:
1. **Keyword Research** - DataForSEO integration, 10/day client quota
2. **AI Content Writer** - Claude Sonnet 4.5, 5 content types, 20/day client quota
3. **Growth Audit** - Multi-API orchestration, SSE streaming, 5/month client quota

See `docs/MODULES_SYSTEM.md` for complete documentation.

### Admin vs Public User Systems

**IMPORTANT**: Admin Nexus and Public User Accounts are **separate, isolated systems**:
- **Public users** (`/app/*`) - Supabase Auth, each with own Business Brain
- **Admin console** (`/admin/secret`) - Session-based auth, manages site content (internal staff)
- **No integration** between systems currently
- **Admin access**: 5 logo clicks in 3 seconds OR Ctrl+Shift+D

See `docs/systems/ADMIN_NEXUS.md` and `docs/AUTHENTICATION_SYSTEM.md` for details.

### Business Brain Migration

**Migration Status**: Check with database admin for current status.

The Business Brain infrastructure migration is ready but application status needs verification:
- Migration file: `supabase/migrations/20250107_business_brain_infrastructure.sql`
- Verification: Run `node scripts/verify-business-brain-tables.cjs`
- Application: Run `node scripts/apply-business-brain-migration.js`

See `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md` for complete guide.

### Code Quality Standards

- **ESLint**: Always run `npm run lint` before commits
- **No test framework**: Verify functionality through manual browser testing
- **Component patterns**: Follow Radix UI patterns from `src/components/ui/`
- **TypeScript adoption**: Use for utilities (`src/utils/index.ts`)
- **Performance**: Lazy loading and efficient routing

### Git Workflow

- **Main branch**: `master` (not main)
- **Auto-commit**: Enabled via `npm run dev:auto`
- **Commit patterns**: Semantic messages with intelligent change detection

## Technology Stack

- **Framework**: React 18, Vite, React Router DOM v7.2.0
- **Styling**: Tailwind CSS, Radix UI primitives (20+ packages)
- **Animation**: Framer Motion, GSAP 3.13.0, Spline 3D
- **Database**: Supabase with custom SDK wrapper
- **AI Services**: Claude Sonnet 4.5, OpenAI gpt-image-1, Gemini 2.5 Flash, Replicate
- **Deployment**: Netlify with SPA routing, CSP headers, Node.js 18

See `docs/TECHNOLOGY_STACK.md` for complete stack details.

## Documentation Index

### Architecture
- `docs/architecture/ROUTING_SYSTEM.md` - Custom routing implementation
- `docs/architecture/COMPONENTS.md` - Component organization and patterns
- `docs/architecture/DATA_LAYER.md` - Dual API integration (Custom SDK + Supabase)
- `docs/architecture/FILE_ORGANIZATION.md` - File structure and patterns
- `docs/architecture/NETLIFY_FUNCTIONS.md` - Serverless functions overview

### Systems
- `docs/MODULES_SYSTEM.md` - AI-First modules architecture
- `docs/BUSINESS_BRAIN_COMPLETE_SYSTEM.md` - Knowledge base system
- `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md` - Integration and migration guide
- `docs/AUTHENTICATION_SYSTEM.md` - User authentication and onboarding
- `docs/systems/ADMIN_NEXUS.md` - Admin console system
- `docs/systems/AI_GENERATION.md` - Multi-provider AI orchestrator
- `docs/AUTOBLOG_SYSTEM.md` - Automated blog generation
- `docs/KEYWORD_RESEARCH_SYSTEM.md` - DataForSEO integration
- `docs/GROWTH_AUDIT_INTEGRATION_REPORT.md` - Growth audit system
- `docs/BRAIN_THEMING_SYSTEM.md` - Dynamic white-label theming
- `docs/systems/ANACHRON_LITE.md` - Icon generation system

### Integrations
- `docs/integrations/MCP_ECOSYSTEM.md` - Model Context Protocol servers
- `docs/GSAP_MASTER_SETUP_GUIDE.md` - GSAP Master MCP server
- `docs/mcp-servers/spline-mcp-server.md` - Spline MCP server
- `docs/mcp-servers/supabase-mcp-server.md` - Supabase MCP server

### Workflows
- `docs/workflows/DEVELOPMENT.md` - Development workflow and automation
- `docs/workflows/TESTING.md` - Testing and quality assurance
- `docs/workflows/GIT.md` - Git workflow and commit patterns

### Deployment & Build
- `docs/DEPLOYMENT.md` - Netlify deployment configuration
- `docs/BUILD_OPTIMIZATION.md` - Vite configuration and performance
- `docs/TECHNOLOGY_STACK.md` - Complete tech stack reference

### Analysis & Planning
- `docs/BASE44_AI_CONTENT_WRITER_ANALYSIS.md` - Base44 feature analysis
- `docs/USER_ACCOUNT_ADMIN_INTEGRATION_PLAN.md` - Admin integration roadmap

For comprehensive documentation, browse the `/docs` directory or see `docs/README.md` for a complete index.
