# Technology Stack

## Core Framework

### React 18
- **Version**: `^18.2.0`
- **Purpose**: UI library
- **Features**: Hooks, Suspense, Concurrent rendering
- **Documentation**: https://react.dev

### Vite
- **Version**: `^6.1.0`
- **Purpose**: Build tool and dev server
- **Features**: Fast HMR, ESM-based, optimized builds
- **Documentation**: https://vite.dev

### React Router DOM
- **Version**: `^7.2.0`
- **Purpose**: Client-side routing
- **Features**: Nested routes, lazy loading, navigation
- **Documentation**: https://reactrouter.com

## Styling

### Tailwind CSS
- **Version**: `^3.4.17`
- **Purpose**: Utility-first CSS framework
- **Features**: Custom design tokens, responsive utilities, JIT compilation
- **Configuration**: `tailwind.config.cjs`
- **Documentation**: https://tailwindcss.com

### Radix UI
- **Version**: 20+ packages (`^1.x`)
- **Purpose**: Headless UI components
- **Components**: Dialog, Dropdown, Select, Toast, etc.
- **Pattern**: shadcn/ui implementation
- **Documentation**: https://radix-ui.com

## Animation

### Framer Motion
- **Version**: `^12.4.7`
- **Purpose**: Declarative animations for React
- **Use Cases**: Page transitions, UI interactions, gesture animations
- **Documentation**: https://framer.com/motion

### GSAP
- **Version**: `^3.13.0`
- **Purpose**: Professional-grade animation library
- **Use Cases**: Scroll animations, timelines, complex sequences
- **Plugins**: ScrollTrigger, ScrollSmoother
- **Documentation**: https://gsap.com

### Spline 3D
- **Packages**: `@splinetool/react-spline@^4.1.0`, `@splinetool/runtime@^1.10.71`
- **Purpose**: 3D scene integration
- **Use Cases**: Interactive 3D content, product showcases
- **Documentation**: https://spline.design

## Database

### Supabase
- **Version**: `@supabase/supabase-js@^2.57.4`
- **Purpose**: Backend-as-a-Service
- **Features**:
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication (OAuth + email/password)
  - File storage
- **Custom SDK**: `src/lib/custom-sdk.js` (Base44-compatible wrapper)
- **Documentation**: https://supabase.com/docs

### Base44 SDK
- **Version**: `@base44/sdk@^0.1.2`
- **Purpose**: Legacy compatibility
- **Features**: Entity-to-table mapping, CRUD operations
- **Status**: Wrapped by custom SDK

## AI Services

### Anthropic (Claude)
- **Package**: `@anthropic-ai/sdk@^0.65.0`
- **Models**: Claude Sonnet 4.5, Claude Opus 4.1
- **Use Cases**:
  - AutoBlog system (SEO-optimized articles)
  - Business Brain enhancement
  - Growth Audit analysis
  - Content generation
- **Documentation**: https://docs.anthropic.com

### OpenAI
- **Package**: `openai@^5.23.0`
- **Models**: gpt-image-1 ONLY (DALL-E FORBIDDEN)
- **Use Cases**: Image generation
- **Features**: Multimodal, streaming, C2PA metadata
- **Documentation**: https://platform.openai.com/docs

### Google Gemini
- **Package**: `@google/generative-ai@^0.24.1`
- **Models**: gemini-2.5-flash-image-preview (Nano Banana)
- **Use Cases**: Image generation, image editing
- **Features**: Fast generation, SynthID watermarking
- **Documentation**: https://ai.google.dev

### Replicate
- **Package**: `replicate@^1.2.0`
- **Models**: Flux 1.1 Pro, SDXL
- **Use Cases**: Specialized image generation
- **Documentation**: https://replicate.com/docs

### ElevenLabs
- **Purpose**: Voice synthesis (optional)
- **Use Cases**: Audio content generation

## Web Automation

### Firecrawl
- **Package**: `@mendable/firecrawl-js`
- **Purpose**: Web scraping and content extraction
- **Use Cases**:
  - Growth Audit data collection
  - Business Brain auto-initialization
  - Website content analysis
- **Documentation**: https://firecrawl.dev

### Playwright
- **Packages**: `playwright`, `playwright-core`, `chromium-bidi`
- **Purpose**: Browser automation
- **Use Cases**:
  - Screenshot capture
  - Metadata extraction
  - Headless browser operations
- **Documentation**: https://playwright.dev

## Cloud Services

### Netlify
- **Purpose**: Hosting and serverless functions
- **Features**:
  - Automatic Git deployment
  - Serverless functions (11 total)
  - Environment variables
  - CDN
  - SSL certificates
- **MCP Integration**: `@netlify/mcp@latest`
- **Documentation**: https://docs.netlify.com

### Cloudinary
- **Purpose**: Media optimization and delivery
- **Use Cases**:
  - Image optimization
  - Format conversion
  - Lazy loading
- **Documentation**: https://cloudinary.com/documentation

## Development Tools

### ESLint
- **Purpose**: Code linting and quality
- **Configuration**: `.eslintrc.cjs`
- **Rules**: React, accessibility, best practices
- **Plugins**: eslint-plugin-react, eslint-plugin-jsx-a11y

### TypeScript
- **Purpose**: Type safety for utilities
- **Files**: `src/lib/modules/types.ts`, `src/utils/index.ts`
- **Status**: Progressive adoption

### Git
- **Platform**: GitHub
- **Workflow**: Feature branches, pull requests
- **Main Branch**: `master`
- **Auto-commit**: Optional via `npm run dev:auto`

## MCP (Model Context Protocol)

### Active Servers (23+)

**Development**: GitHub, Filesystem, Memory, Sequential Thinking

**Database**: Supabase MCP

**Animation**: GSAP Master MCP

**3D Graphics**: Spline MCP

**Web Automation**: Firecrawl, Playwright, Puppeteer

**Cloud Services**: Vercel, Netlify, DigitalOcean, Railway, Cloudinary

**AI & Content**: Replicate, Nano Banana (Gemini), Figma

See `docs/integrations/MCP_ECOSYSTEM.md` for details.

## Utility Libraries

### UI Utilities
- **clsx** `^2.1.1` - Conditional className composition
- **tailwind-merge** `^2.6.0` - Merge Tailwind classes
- **class-variance-authority** - Component variants
- **lucide-react** `^0.469.0` - Icon library

### Data & Validation
- **zod** `^3.24.1` - Schema validation
- **date-fns** - Date formatting and manipulation
- **react-hook-form** - Form state management

### Animation Utilities
- **gsap/ScrollTrigger** - Scroll-based animations
- **gsap/ScrollSmoother** - Smooth scrolling
- **react-spring** - Physics-based animations (optional)

### Other
- **react-helmet-async** - Document head management
- **react-use** - React hooks library

## API Integrations

### DataForSEO
- **Purpose**: Keyword research
- **Module**: Keyword Research module
- **API**: Keywords Data API
- **Documentation**: https://dataforseo.com/apis/keywords-data-api

### Brandfetch
- **Purpose**: Brand detection
- **Use Case**: Growth Audit brand analysis
- **Documentation**: https://brandfetch.com/api

### PageSpeed Insights
- **Purpose**: Website performance analysis
- **Use Case**: Growth Audit performance metrics
- **API**: Google PageSpeed Insights API

## Package Management

### npm
- **Version**: 10+ recommended
- **Registry**: https://registry.npmjs.org
- **Scripts**: See `package.json`

### Dependencies
- **Total**: 80+ packages
- **Dev Dependencies**: 20+ packages
- **Peer Dependencies**: Managed automatically

## Build Tools

### esbuild
- **Purpose**: Fast bundling and minification
- **Used by**: Vite, Netlify Functions
- **Features**: ES6+ transpilation, tree shaking

### PostCSS
- **Purpose**: CSS processing
- **Plugins**: Tailwind CSS, Autoprefixer
- **Configuration**: `postcss.config.cjs`

## Testing

### Manual Testing
- **Approach**: Browser-based testing
- **Tools**: Chrome DevTools, React DevTools
- **Performance**: Lighthouse audits

No automated testing framework configured.

## Version Control

### GitHub
- **Repository**: Private
- **Branch Strategy**: Feature branches, main = master
- **CI/CD**: Netlify automatic deployment
- **MCP Integration**: GitHub MCP server

## Environment Management

### Environment Variables
- **Development**: `.env` file (not committed)
- **Production**: Netlify environment variables
- **Prefix**: `VITE_` for client-accessible variables
- **Server**: Netlify functions access all variables

## Security

### Authentication
- **Provider**: Supabase Auth
- **Methods**: Google OAuth, email/password
- **Session**: localStorage-based
- **Storage Key**: `disruptors-ai-auth`

### Authorization
- **Method**: Row Level Security (RLS) in Supabase
- **Policies**: User-based access control
- **Admin**: Service role bypasses RLS

### Headers
- **CSP**: Content Security Policy configured
- **CORS**: Configured for API access
- **XSS**: X-XSS-Protection enabled
- **Frame**: X-Frame-Options set

## Performance

### Metrics
- **Target Lighthouse**: > 90
- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **TBT**: < 200ms

### Optimization
- **Code Splitting**: Manual chunks in Vite
- **Lazy Loading**: React.lazy() for pages
- **Image Optimization**: WebP, lazy loading
- **Caching**: Immutable assets, CDN caching

## Documentation

### In-Repository
- **docs/**: 150+ markdown files
- **README.md**: Project overview
- **CLAUDE.md**: Development guidance
- **CHANGELOG.md**: Version history

### External
- **Component Storybook**: Not implemented
- **API Documentation**: In-code JSDoc
- **System Diagrams**: In markdown docs

## Future Considerations

### Potential Additions
- **Testing Framework**: Jest, React Testing Library
- **Component Library**: Storybook for documentation
- **Monitoring**: Sentry for error tracking
- **Analytics**: Google Analytics, PostHog

### Technology Upgrades
- **React 19**: When stable
- **Vite 7**: When released
- **TypeScript Migration**: Progressive conversion

## Related Documentation

- `docs/BUILD_OPTIMIZATION.md` - Build configuration
- `docs/DEPLOYMENT.md` - Deployment setup
- `docs/integrations/MCP_ECOSYSTEM.md` - MCP servers
- `docs/systems/AI_GENERATION.md` - AI services
- `docs/architecture/DATA_LAYER.md` - Database architecture
