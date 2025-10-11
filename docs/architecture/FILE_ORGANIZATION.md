# File Organization & Patterns

## Overview

The project follows a feature-based organization with clear separation of concerns and consistent naming patterns.

## Directory Structure

```
disruptors-ai-marketing-hub/
├── docs/                           # Documentation
│   ├── architecture/              # Architecture documentation
│   ├── systems/                   # System-specific docs
│   ├── integrations/              # Integration guides
│   ├── workflows/                 # Workflow documentation
│   ├── guides/                    # User guides
│   ├── reports/                   # Status reports
│   └── mcp-servers/               # MCP server documentation
│
├── netlify/
│   └── functions/                 # Serverless functions (11 total)
│       ├── growth-audit-ingest.js
│       ├── growth-audit-stream.js
│       ├── marketing-audit-analyze.js
│       ├── brain-auto-initialize.ts
│       ├── brain-enhance.ts
│       ├── brain-content-generate.ts
│       ├── ai_invoke.ts
│       ├── agent_train-background.ts
│       ├── dataforseo-keywords.js
│       ├── ingest_dispatch-background.ts
│       ├── screenshot-capture.js
│       └── shared/                # Shared utilities
│           └── job-storage.js
│
├── public/                         # Static assets
│   ├── images/                    # Images and media
│   ├── videos/                    # Video files
│   └── spline/                    # Spline 3D scenes
│
├── scripts/                        # Automation scripts
│   ├── mcp-orchestrator.js        # MCP server management
│   ├── apply-business-brain-migration.js
│   ├── apply-modules-migration.js
│   ├── seed-modules.js
│   └── [50+ utility scripts]
│
├── src/
│   ├── admin/                     # Admin Nexus system
│   │   ├── modules/               # 11 admin modules
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── ContentManagement.jsx
│   │   │   ├── TeamManagement.jsx
│   │   │   ├── MediaLibrary.jsx
│   │   │   ├── BusinessBrainBuilder.jsx
│   │   │   ├── AgentChat.jsx
│   │   │   └── [5 stub modules]
│   │   └── api/                   # TypeScript API layer
│   │
│   ├── components/
│   │   ├── admin/                 # Admin components
│   │   │   ├── MatrixLogin.jsx
│   │   │   └── [admin-specific components]
│   │   │
│   │   ├── auth/                  # Authentication components
│   │   │   ├── LoginModal.jsx     # Premium login UI
│   │   │   ├── OnboardingFlow.jsx # 6-step wizard
│   │   │   └── ProtectedRoute.jsx # Auth guard
│   │   │
│   │   ├── home/                  # Home page components
│   │   ├── work/                  # Work page components
│   │   ├── solutions/             # Solutions page components
│   │   │
│   │   ├── shared/                # 37 shared components
│   │   │   ├── Hero.jsx
│   │   │   ├── ServiceScroller.jsx
│   │   │   ├── AIMediaGenerator.jsx
│   │   │   ├── AlternatingLayout.jsx
│   │   │   ├── VideoScrollScrub.jsx
│   │   │   ├── SplineViewer.jsx
│   │   │   └── SplineScrollAnimation.jsx
│   │   │
│   │   └── ui/                    # 50 Radix UI components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       └── [47+ more components]
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useSplinePerformance.js
│   │   ├── useBrainTheming.js
│   │   └── [other hooks]
│   │
│   ├── lib/                       # Core libraries
│   │   ├── supabase-client.js     # Centralized Supabase clients
│   │   ├── custom-sdk.js          # Base44-compatible SDK
│   │   ├── brain-api.js           # Business Brain API
│   │   ├── ai-orchestrator.js     # Multi-provider AI
│   │   ├── anthropic-blog-writer.js # AutoBlog system
│   │   ├── dataforseo-client.js   # Keyword research
│   │   ├── growth-audit/          # Growth audit system
│   │   └── modules/               # Module system
│   │       ├── module-registry.ts
│   │       ├── module-executor.ts
│   │       └── types.ts
│   │
│   ├── modules/                   # AI-First modules
│   │   ├── _template/             # Template for new modules
│   │   ├── keyword-research/      # Production module
│   │   ├── ai-content-writer/     # Production module
│   │   └── growth-audit/          # Production module
│   │
│   ├── pages/                     # 70+ page components
│   │   ├── index.jsx              # Central routing
│   │   ├── home.jsx
│   │   ├── about.jsx
│   │   ├── contact.jsx
│   │   ├── work.jsx
│   │   ├── work-*.jsx             # Case studies
│   │   ├── solutions-*.jsx        # Solutions pages
│   │   ├── demos/                 # Demo pages
│   │   └── app/                   # App pages
│   │
│   ├── utils/                     # Utility functions
│   │   ├── splineAnimations.js    # GSAP + Spline helpers
│   │   └── index.ts               # TypeScript utilities
│   │
│   ├── App.jsx                    # Root component
│   └── main.jsx                   # Entry point
│
├── supabase/
│   └── migrations/                # Database migrations
│       ├── 20250107_business_brain_infrastructure.sql
│       └── 20251010_modules_infrastructure.sql
│
├── .env                           # Environment variables
├── CLAUDE.md                      # Claude Code guidance (THIS FILE)
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite configuration
├── tailwind.config.cjs            # Tailwind configuration
└── netlify.toml                   # Netlify configuration
```

## Naming Conventions

### Files

- **Components**: PascalCase with `.jsx` extension
  - `Hero.jsx`, `ServiceScroller.jsx`, `AIMediaGenerator.jsx`

- **Pages**: lowercase with hyphens for multi-word names
  - `home.jsx`, `about.jsx`, `work-abc-plumbing.jsx`, `solutions-seo.jsx`

- **Libraries**: camelCase with `.js` or `.ts` extension
  - `custom-sdk.js`, `brain-api.js`, `ai-orchestrator.js`

- **Utilities**: camelCase with descriptive names
  - `splineAnimations.js`, `index.ts`

- **Netlify Functions**: kebab-case with descriptive names
  - `growth-audit-ingest.js`, `brain-auto-initialize.ts`

### Directories

- **Components**: PascalCase for component directories
- **Features**: lowercase for feature directories
- **Documentation**: SCREAMING_SNAKE_CASE for doc files
  - `ROUTING_SYSTEM.md`, `DATA_LAYER.md`

## Component Organization

### UI Components (`src/components/ui/`)

50 Radix UI-based design system components following shadcn/ui patterns:
- Button, Card, Dialog, Input, Select, etc.
- Consistent composition patterns
- Accessibility built-in

### Shared Components (`src/components/shared/`)

37 reusable business components:
- **Content**: Hero, ServiceScroller, AIMediaGenerator
- **Layouts**: AlternatingLayout, VideoScrollScrub
- **3D**: SplineViewer, SplineScrollAnimation
- **Navigation**: Navigation, Footer, MobileNav

### Domain Components

Organized by feature:
- `home/` - Home page specific components
- `work/` - Work portfolio components
- `solutions/` - Solutions page components

### Admin Components (`src/components/admin/`)

Secure admin interface components:
- MatrixLogin - Secret access pattern
- BlogManagementDashboard - Unified blog management
- KeywordResearchUI - Keyword research interface

## Module Structure

Each module follows consistent structure:

```
src/modules/[module-name]/
├── manifest.json          # Module definition (43 fields)
├── index.jsx              # Module orchestration
├── [ModuleName]UI.jsx     # React component
├── schema.js              # Zod validation schemas
└── README.md              # Documentation
```

## Netlify Function Structure

Serverless functions organized by system:

```
netlify/functions/
├── growth-audit-ingest.js     # Growth Audit: Data collection
├── growth-audit-stream.js     # Growth Audit: SSE streaming
├── marketing-audit-analyze.js # Marketing Audit: AI analysis
├── brain-auto-initialize.ts   # Business Brain: Auto-scraping
├── brain-enhance.ts           # Business Brain: AI onboarding
├── brain-content-generate.ts  # Business Brain: Content gen
├── ai_invoke.ts               # Admin Nexus: AI generation
├── agent_train-background.ts  # Admin Nexus: Agent training
├── dataforseo-keywords.js     # Keyword Research: DataForSEO
├── ingest_dispatch-background.ts # Content: Ingestion
├── screenshot-capture.js      # Utilities: Screenshots
└── shared/
    └── job-storage.js         # Job queue management
```

## Import Patterns

### Path Alias

`@/` resolves to `src/` directory:

```javascript
import Hero from '@/components/shared/Hero'
import sdk from '@/lib/custom-sdk'
import { supabase } from '@/lib/supabase-client'
```

### Component Imports

```javascript
// Named exports for UI components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Default exports for page/feature components
import Hero from '@/components/shared/Hero'
import ServiceScroller from '@/components/shared/ServiceScroller'
```

### Library Imports

```javascript
// Always import from centralized locations
import sdk from '@/lib/custom-sdk'
import { supabase, supabaseAdmin } from '@/lib/supabase-client'
import { executeModule } from '@/lib/modules'
```

## Best Practices

1. **Keep related files together** - Feature-based organization
2. **Use path alias** - `@/` for all internal imports
3. **Follow naming conventions** - Consistent across the project
4. **Centralize shared code** - Avoid duplication
5. **Document complex structures** - README in each major directory
6. **Separate concerns** - UI, logic, data, utilities
7. **TypeScript where beneficial** - Especially for utilities and types

## Related Documentation

- `docs/architecture/COMPONENTS.md` - Component architecture details
- `docs/architecture/ROUTING_SYSTEM.md` - Routing implementation
- `docs/architecture/DATA_LAYER.md` - Data layer patterns
- `docs/MODULES_SYSTEM.md` - Module system architecture
