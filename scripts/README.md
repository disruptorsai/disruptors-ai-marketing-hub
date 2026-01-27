# Scripts Directory

> **Last organized:** 2026-01-26
> **Active scripts:** 45
> **Archived scripts:** 200+ (in `archived/`)

---

## Directory Structure

```
scripts/
├── *.js                    # Active scripts (referenced in package.json)
├── *.sh                    # Shell scripts
├── archived/               # Old/one-time scripts (kept for reference)
│   ├── migrations/         # Database migration scripts
│   ├── analysis/           # Historical analysis scripts
│   └── one-time/           # One-time utilities
└── README.md               # This file
```

---

## Active Scripts by Category

### Development & Automation

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `auto-commit.js` | `npm run auto-commit` | Intelligent auto-commit during development |
| `watch-experiments.js` | `npm run experiments:watch` | Monitor marketing experiments |
| `orchestrator-integration.js` | `npm run orchestrator:*` | Integration orchestration |
| `integration-manager.js` | `npm run integration:*` | Integration lifecycle management |
| `changelog-manager.js` | `npm run changelog:*` | Release changelog management |

### Deployment

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `deployment-orchestrator.js` | `npm run deploy:*` | Two-tier deployment (dev → prod) |
| `git-push-deploy.sh` | `npm run push` | Git push with deployment |
| `setup-deployment.js` | `npm run setup:deployment` | Initial deployment setup |

### Database

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `database-health-check.js` | `npm run db:health` | Database health monitoring |
| `check-database-migrations.js` | `npm run db:migrations` | Check migration status |
| `auto-provision-database.js` | `npm run provision:db` | Auto-provision database |
| `apply-ai-content-writer-migration.js` | `npm run migrate:content-writer` | Content writer migration |
| `apply-lead-magnet-tracking-migration.js` | `npm run migrate:lead-magnets` | Lead magnet migration |

### MCP Management

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `mcp-orchestrator.js` | `npm run mcp:start` | Start MCP orchestrator |
| `mcp-manager.js` | `npm run mcp:*` | Enable/disable MCP servers |
| `mcp-health-monitor.js` | `npm run mcp:health` | MCP health monitoring |
| `mcp-optimizer.js` | `npm run mcp:optimize` | MCP optimization |
| `mcp-sync.js` | `npm run mcp:sync` | Cross-machine MCP sync |

### Performance & Screenshots

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `capture-screenshot.js` | `npm run screenshot:*` | Page screenshots |
| `lighthouse-audit.js` | `npm run perf:audit` | Lighthouse performance audit |
| `lighthouse-analyzer.js` | `npm run perf:analyze` | Analyze Lighthouse results |
| `lighthouse-monitor.js` | `npm run perf:monitor` | Continuous performance monitoring |

### Image Generation & Validation

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `generate-service-images.js` | `npm run generate:service-images` | Generate service page images |
| `convert-images-to-webp.js` | `npm run optimize:images` | Convert images to WebP |
| `test-image-generation-apis.js` | `npm run test:image-apis` | Test all image APIs |
| `validate-image-apis.js` | `npm run validate:image-apis` | Validate API configuration |
| `validate-model-usage.js` | `npm run validate:models` | Validate AI model usage |
| `verify-dalle3-simple.js` | `npm run verify:no-dalle3` | Verify DALL-E 3 is blocked |
| `test-gpt-image-1.js` | `npm run test:gpt-image-1` | Test GPT-image-1 |

### Admin & Telemetry

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `list-admin-users.js` | `npm run admin:list-users` | List all admin users |
| `setup-admin-role.js` | `npm run admin:setup-role` | Grant admin role |
| `check-telemetry-status.js` | `npm run telemetry:status` | Check telemetry status |
| `generate-test-telemetry.js` | `npm run telemetry:generate` | Generate test data |

### Claude Code Integration

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `claude-code-integration.js` | `npm run claude:setup` | Claude Code setup |
| `figma-mcp-extractor.js` | `npm run figma:extract` | Extract from Figma |

---

## Service Images Generator

The `generate-service-images.js` script creates professional service images for the ServiceScroller component using Replicate's FLUX model.

### Services Generated

1. **AI Automation** - Automation dashboards and workflow visualization
2. **Social Media Marketing** - Social media management interfaces
3. **SEO & GEO** - Analytics dashboards with location targeting
4. **Lead Generation** - Conversion funnels and pipeline visualization
5. **Paid Advertising** - PPC campaign dashboards and ROI metrics
6. **Podcasting** - Professional studio setups and audio waveforms
7. **Custom Apps** - Development environments and app prototypes
8. **CRM Management** - Customer relationship management interfaces
9. **Fractional CMO** - Strategic planning and executive dashboards

### Usage

```bash
npm run generate:service-images
```

### Output

- **Generated Images**: High-quality 640x360 images optimized for web
- **Cloudinary URLs**: Production-ready CDN URLs
- **Results File**: `generated/service-images-YYYY-MM-DD.json`

---

## Archived Scripts

The `archived/` directory contains scripts that were used once or are no longer needed:

### `archived/migrations/`

One-time database migration scripts (already applied):

- `apply-seo-*-migration.js` - SEO audit tables
- `apply-business-brain-migration.js` - Business Brain schema
- `apply-modules-migration.js` - Modules system

### `archived/analysis/`

Historical analysis scripts:

- `analyze-contrast-issues.js` - Accessibility analysis
- `analyze-old-site.js` - Old site comparison
- `analyze-scroll-animations.js` - Animation audit

### `archived/one-time/`

Utilities used once (kept for reference):

- `generate-*-images.js` - Various image generation
- `test-*` - Test utilities
- `verify-*` - Verification scripts

---

## Usage Notes

### Running Scripts

```bash
# Via npm (preferred)
npm run deploy:dev

# Directly
node scripts/deployment-orchestrator.js dev
```

### Adding New Scripts

1. Create in `scripts/` directory
2. Add npm command to `package.json`
3. Document in this README

### Archiving Scripts

1. Move to appropriate `archived/` subdirectory
2. Remove from `package.json`
3. Keep for reference

---

*Last updated: 2026-01-26*
