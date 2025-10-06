# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- **Development server**: `npm run dev` - Starts Vite development server
- **Auto-commit dev**: `npm run dev:auto` - Development with intelligent auto-commit system
- **Safe development**: `npm run dev:safe` - Development without automation
- **Build**: `npm run build` - Creates production build using Vite
- **Lint**: `npm run lint` - Runs ESLint on the codebase
- **Preview**: `npm run preview` - Preview production build locally

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

### Database Setup
- **Setup database**: `npm run db:setup` - Initialize database schema and configuration

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
- **Blog Management UI**: "Write Articles" button in `/blog-management` interface
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

**Growth Audit System** (`src/lib/growth-audit/`):
- **AI-Powered Website Analysis**: Instant growth audits using Claude Sonnet 4.5
- **Multi-Source Data Collection**: Firecrawl (web crawling), Playwright (metadata), Brandfetch (brand detection), PageSpeed Insights (performance)
- **Business Profile Generation**: Automated extraction of brand identity, offerings, ICP, tech stack, competitors
- **Opportunity Detection**: 8-15 prioritized growth opportunities across 10 categories (SEO, Content, Performance, CRO, Local, Social, Paid, EmailCRM, DataTracking, AI)
- **Evidence-Based Recommendations**: Each opportunity includes impact scoring, effort estimation, actionable steps, and evidence URLs
- **Netlify Functions**: Serverless architecture with job queueing and polling-based results delivery
- **Demo Pages**: `/demos/growth-audit` (landing) and `/demos/growth-audit/:jobId` (results)
- **See**: `docs/GROWTH_AUDIT_INTEGRATION.md` for complete documentation

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

### Admin Access System

**Secret Access Pattern**:
- 5 logo clicks in 3 seconds OR Ctrl+Shift+D activates admin access
- Ctrl+Shift+Escape for emergency exit
- Matrix-style login interface with session-based authentication (24-hour expiry)
- Secure admin dashboard accessible only via secret patterns
- Admin blog management at `/blog-management` route
- Service role authentication for elevated admin operations

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

### Deployment Configuration

- **Platform**: Netlify with automatic Git deployment
- **Site ID**: `cheerful-custard-2e6fc5`
- **Primary Domain**: https://dm4.wjwelsh.com
- **Netlify Domain**: https://master--cheerful-custard-2e6fc5.netlify.app
- **Admin Dashboard**: https://app.netlify.com/projects/cheerful-custard-2e6fc5
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **SPA Routing**: Handled by `_redirects` file
- **Security**: CSP headers, XSS protection, frame options
- **Environment**: Node.js 18, optimized caching
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

### Testing and Quality Assurance
- **No test framework** is configured - verify functionality through manual browser testing
- **Linting**: Always run `npm run lint` before commits (ESLint with React rules)
- **Error Debugging**: Check browser console and network tab for client-side issues

### Data Layer Architecture
- **Use `src/lib/custom-sdk.js`** for ALL data operations - provides Base44-compatible API over Supabase
- **Dual client setup**: Service role for admin operations, regular for user operations
- **Environment variables**: All client-accessible config uses `VITE_` prefix

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
