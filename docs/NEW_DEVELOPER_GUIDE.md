# New Developer Guide

> **Welcome to the Disruptors AI Marketing Hub codebase!**
> This guide will help you get up to speed quickly.

---

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/disruptorsai/disruptors-ai-marketing-hub.git
cd disruptors-ai-marketing-hub
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in required values:

```bash
cp .env.example .env
```

**Required for basic development:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

**Required for AI features:**
- `VITE_ANTHROPIC_API_KEY` - Claude Sonnet (content generation)
- `VITE_OPENAI_API_KEY` - GPT-image-1 (image generation)
- `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` - Keyword research

### 3. Run Development Server

```bash
# Frontend only (most common)
npm run dev

# Frontend + Netlify functions (needed for AI features)
npm run dev:netlify
```

Site runs at `http://localhost:5173`

---

## Project Structure

```
disruptors-ai-marketing-hub/
├── src/
│   ├── pages/              # All page components (70+ pages)
│   │   ├── index.jsx       # ROUTER - all routes defined here
│   │   ├── Layout.jsx      # Main layout wrapper
│   │   ├── Home.jsx        # Homepage
│   │   └── ...
│   ├── components/
│   │   ├── ui/             # Radix UI components (shadcn/ui style)
│   │   ├── shared/         # Reusable business components
│   │   ├── admin/          # Admin panel components
│   │   └── connect/        # Event kiosk components
│   ├── lib/
│   │   ├── supabase-client.js  # ALWAYS import Supabase from here
│   │   └── custom-sdk.js       # Data layer (Base44 compatible)
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── modules/            # Self-contained feature modules
├── netlify/
│   └── functions/          # Serverless API endpoints
├── scripts/
│   ├── active/             # Currently used scripts
│   └── archived/           # Old/one-time scripts
├── docs/                   # Documentation
└── public/                 # Static assets
```

---

## Key Concepts

### 1. Routing System

All routes are defined in `src/pages/index.jsx`. This is a custom lazy-loading system:

```jsx
// Pages are lazy-loaded with retry logic
const MyPage = lazyWithRetry(() => import('./my-page.jsx'));

// Then added to PAGES object and Routes
```

**Important:** Always use `lazyWithRetry()` from `@/utils/lazyWithRetry` instead of `React.lazy()`. This handles chunk load errors during deployments.

### 2. Data Layer

**ALWAYS import Supabase from the centralized client:**

```jsx
// CORRECT
import { supabase } from '@/lib/supabase-client';

// WRONG - creates multiple instances
import { createClient } from '@supabase/supabase-js';
```

For data operations, use the custom SDK which provides Base44-compatible API:

```jsx
import { customSDK } from '@/lib/custom-sdk';

// CRUD operations
await customSDK.from('table').select('*');
await customSDK.from('table').insert({ data });
```

### 3. UI Components

Components in `src/components/ui/` follow shadcn/ui patterns built on Radix UI:

```jsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
```

### 4. Animation

- **Framer Motion** - Page transitions, UI interactions
- **GSAP** - Scroll animations, complex timelines
- **Spline** - 3D interactive content

```jsx
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Spline from '@splinetool/react-spline';
```

---

## Common Tasks

### Adding a New Page

1. Create the page component in `src/pages/`:

```jsx
// src/pages/my-new-page.jsx
export default function MyNewPage() {
  return <div>My New Page</div>;
}
```

2. Add to `src/pages/index.jsx`:

```jsx
// Add lazy import
const MyNewPage = lazyWithRetry(() => import('./my-new-page.jsx'));

// Add to PAGES object
const PAGES = {
  // ...existing pages
  "my-new-page": MyNewPage,
};

// Add route in PagesContent
<Route path="/my-new-page" element={<MyNewPage />} />
```

### Adding a Protected Page

Wrap with `ProtectedRoute` for authentication:

```jsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

<Route path="/app/my-feature" element={
  <ProtectedRoute>
    <MyFeaturePage />
  </ProtectedRoute>
} />
```

### Creating a Netlify Function

1. Create function in `netlify/functions/`:

```jsx
// netlify/functions/my-function.js
export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const data = JSON.parse(event.body);

  // Your logic here

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
}
```

2. Call from frontend:

```jsx
const response = await fetch('/.netlify/functions/my-function', {
  method: 'POST',
  body: JSON.stringify({ data }),
});
```

---

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run dev:netlify` | Start with Netlify functions |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

### Deployment

```bash
# Deploy to dev site (auto on push)
git push origin v6

# Manual dev deploy
npm run deploy:dev

# Production deploy (MANUAL ONLY)
npm run deploy:prod
```

**Important:** Production deploys require testing on dev site first.

---

## Important Files

| File | Purpose |
|------|---------|
| `src/pages/index.jsx` | All routes defined here |
| `src/lib/supabase-client.js` | Single Supabase client instance |
| `src/lib/custom-sdk.js` | Data layer with Base44 compatibility |
| `CLAUDE.md` | AI assistant instructions |
| `netlify.toml` | Netlify configuration |
| `vite.config.js` | Vite build configuration |

---

## Architecture Decisions

### Why modulePreload is disabled

In `vite.config.js`, `modulePreload: false` prevents React initialization errors. Parallel chunk loading caused vendor chunks to execute before React was available.

### Why lazy loading with retry

The `lazyWithRetry()` utility handles "ChunkLoadError" when users have stale cached bundles after deployments.

### Why centralized Supabase client

Multiple `createClient()` calls cause "Multiple GoTrueClient instances" warnings and auth state issues.

---

## Getting Help

1. **Check CLAUDE.md** - Contains project-specific instructions
2. **Check docs/** - Architecture and system documentation
3. **Check docs/CODEBASE_AUDIT_2026.md** - Recent cleanup and what was removed

---

## Quick Reference

### Path Aliases

`@/` resolves to `src/` directory:

```jsx
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase-client';
```

### Admin Access

- URL: `/admin/secret`
- Trigger: 5 logo clicks in 3 seconds OR Ctrl+Shift+D
- Uses session-based auth (separate from user accounts)

### AI Services

| Service | Model | Used For |
|---------|-------|----------|
| Anthropic | Claude Sonnet 4.5 | Content generation, AutoBlog |
| OpenAI | gpt-image-1 | Image generation |
| Google | Gemini 2.5 Flash | Fast image generation |
| Replicate | Various | Alternative image models |

---

*Last updated: 2026-01-26*
