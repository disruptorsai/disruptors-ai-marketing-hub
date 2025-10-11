# MCP (Model Context Protocol) Ecosystem

## Overview

Extensive integration with 23+ MCP servers providing enhanced development capabilities across database operations, animation, 3D graphics, web automation, cloud services, and AI content generation.

## MCP Server Categories

### Development Tools
- **GitHub** - Repository management, issues, pull requests
- **Filesystem** - File operations and navigation
- **Memory** - Persistent context across sessions
- **Sequential Thinking** - Multi-step problem solving

### Database & Backend
- **Supabase MCP** - Direct database operations, project management, enhanced development tools
  - Real-time database queries
  - Schema introspection
  - Migration management
  - Performance monitoring
  - See `docs/mcp-servers/supabase-mcp-server.md`

### Animation & Graphics
- **GSAP Master MCP** - AI-powered animation generation with surgical precision
  - Natural language animation creation
  - Complete GSAP documentation
  - Performance optimization (60fps)
  - Production patterns
  - See `docs/GSAP_MASTER_SETUP_GUIDE.md`

- **Spline MCP** - Programmatic control of 3D scenes
  - 100+ tools for objects, materials, scenes
  - Runtime integration (React, Next.js, vanilla JS)
  - Animation control
  - Scene export (GLB, GLTF, FBX, OBJ)
  - GSAP integration
  - See `docs/mcp-servers/spline-mcp-server.md`

### Web Automation
- **Firecrawl** - Web scraping and content extraction
- **Playwright** - Browser automation and testing
- **Puppeteer** - Headless browser control

### Cloud Services
- **Vercel** - Deployment and hosting
- **Netlify** - Serverless functions and deployment
- **DigitalOcean** - Cloud infrastructure
- **Railway** - Application hosting
- **Cloudinary** - Media optimization and delivery

### AI & Content
- **Replicate** - AI model hosting and execution
- **Nano Banana (Gemini)** - Google Gemini integration
- **Figma** - Design workflow integration

## MCP Orchestration

### File: `scripts/mcp-orchestrator.js`

Centralized management of all MCP server connections.

### Features

- **Health Monitoring** - Continuous health checks on all servers
- **Automatic Recovery** - Auto-restart failed connections
- **Performance Optimization** - Configuration tuning
- **Usage Analytics** - Track server utilization
- **Security Auditing** - Validate configurations
- **Configuration Validation** - Ensure proper setup

### Commands

```bash
# Start orchestrator
npm run mcp:start

# Check status
npm run mcp:status

# Health check
npm run mcp:health

# Monitor continuously
npm run mcp:monitor

# Optimize configuration
npm run mcp:optimize

# Analyze usage patterns
npm run mcp:analyze

# Security audit
npm run mcp:security

# Performance analysis
npm run mcp:performance
```

## Key MCP Servers

### Supabase MCP Server

Direct database operations through MCP:

```javascript
// Example: Query database via MCP
const { data } = await mcp.supabase.query('posts', {
  filter: { published: true },
  orderBy: { created_at: 'desc' },
  limit: 10
})
```

**Capabilities:**
- Database CRUD operations
- Real-time subscriptions
- Schema introspection
- Migration execution
- Performance monitoring

### GSAP Master MCP Server

AI-powered animation generation:

```javascript
// Example: Generate animation from natural language
const animation = await mcp.gsap.create({
  description: 'Fade in hero section on scroll, stagger children',
  target: '.hero',
  trigger: 'scroll'
})
```

**Capabilities:**
- Natural language animation creation
- Complete GSAP API documentation
- Performance optimization
- Debug and troubleshooting
- Production patterns

### Spline MCP Server

3D scene control:

```javascript
// Example: Control Spline scene programmatically
await mcp.spline.setObjectPosition('cube', { x: 0, y: 10, z: 0 })
await mcp.spline.playAnimation('rotation-animation')
```

**Capabilities:**
- Object manipulation
- Material editing
- Animation control
- Scene export
- Performance monitoring

### Netlify MCP Server

Deployment and environment management:

```javascript
// Example: Deploy with full context
await mcp.netlify.deploy({
  branch: 'main',
  buildCommand: 'npm run build',
  environmentVariables: { ... }
})
```

**Capabilities:**
- Deploy with context
- Manage environment variables
- Configure extensions
- Access deploy logs
- Domain configuration

## Configuration

### mcp.json

All MCP servers configured in `mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp"],
      "env": {
        "SUPABASE_URL": "...",
        "SUPABASE_ACCESS_TOKEN": "..."
      }
    },
    "netlify": {
      "command": "npx",
      "args": ["-y", "@netlify/mcp@latest"],
      "env": {
        "NETLIFY_AUTH_TOKEN": "..."
      }
    }
  }
}
```

## Environment Variables

```bash
# Supabase MCP
SUPABASE_URL=your_supabase_url
SUPABASE_ACCESS_TOKEN=your_access_token

# Netlify MCP
NETLIFY_AUTH_TOKEN=your_netlify_token

# GitHub MCP
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token

# Cloudinary MCP
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Use Cases

### Database Operations

```javascript
// Direct database queries via Supabase MCP
const posts = await mcp.supabase.getAll('posts')
const post = await mcp.supabase.create('posts', { ... })
await mcp.supabase.update('posts', id, { ... })
```

### Animation Generation

```javascript
// Generate scroll animations via GSAP Master MCP
const scrollAnimation = await mcp.gsap.generateScrollTrigger({
  trigger: '.section',
  start: 'top center',
  end: 'bottom center',
  scrub: true,
  animation: {
    opacity: [0, 1],
    y: [100, 0]
  }
})
```

### 3D Scene Management

```javascript
// Control Spline scenes via Spline MCP
await mcp.spline.loadScene('hero-3d.spline')
await mcp.spline.setMaterial('object', { color: '#2C6BAA' })
await mcp.spline.animate('rotation', { duration: 2, loop: true })
```

### Web Scraping

```javascript
// Scrape websites via Firecrawl MCP
const content = await mcp.firecrawl.scrape({
  url: 'https://example.com',
  extractContent: true,
  extractMetadata: true
})
```

### Media Optimization

```javascript
// Optimize images via Cloudinary MCP
const optimized = await mcp.cloudinary.optimize({
  url: 'path/to/image.jpg',
  transformations: [
    { width: 800, height: 600, crop: 'fill' },
    { quality: 'auto', format: 'auto' }
  ]
})
```

## Health Monitoring

### Automated Health Checks

```javascript
// Run health check on all MCP servers
const health = await mcp.orchestrator.healthCheck()

// Returns:
{
  supabase: { status: 'healthy', latency: 45 },
  netlify: { status: 'healthy', latency: 120 },
  gsap: { status: 'healthy', latency: 30 },
  spline: { status: 'degraded', latency: 450 }
}
```

### Automatic Recovery

```javascript
// Orchestrator automatically restarts failed connections
if (server.status === 'failed') {
  await mcp.orchestrator.restart(server.name)
  await mcp.orchestrator.verify(server.name)
}
```

## Performance Optimization

### Connection Pooling

```javascript
// Reuse MCP connections
const pool = mcp.orchestrator.getConnectionPool()
const connection = await pool.acquire('supabase')
// ... use connection
await pool.release(connection)
```

### Caching

```javascript
// Cache frequently accessed data
const cachedData = await mcp.orchestrator.cache.get('posts')
if (!cachedData) {
  const data = await mcp.supabase.getAll('posts')
  await mcp.orchestrator.cache.set('posts', data, { ttl: 300 })
}
```

## Security

### Token Management

- All MCP tokens stored in environment variables
- Never commit tokens to version control
- Rotate tokens regularly
- Use scoped tokens with minimal permissions

### Audit Logging

```javascript
// All MCP operations logged
{
  timestamp: '2025-10-10T12:00:00Z',
  server: 'supabase',
  operation: 'query',
  resource: 'posts',
  user: 'admin',
  status: 'success'
}
```

## Best Practices

1. **Use orchestrator** - Central management for all servers
2. **Monitor health** - Regular health checks
3. **Handle errors gracefully** - Implement fallbacks
4. **Cache when possible** - Reduce redundant calls
5. **Secure tokens** - Environment variables only
6. **Log operations** - Audit trail for debugging
7. **Optimize connections** - Reuse connections via pooling

## Related Documentation

- `docs/mcp-servers/supabase-mcp-server.md` - Supabase MCP setup
- `docs/GSAP_MASTER_SETUP_GUIDE.md` - GSAP Master MCP setup
- `docs/mcp-servers/spline-mcp-server.md` - Spline MCP setup
- `docs/mcp-setup-guide.md` - General MCP setup guide
- `scripts/mcp-orchestrator.js` - Orchestrator implementation
