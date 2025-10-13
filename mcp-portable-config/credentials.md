# MCP Server Credentials Guide

Where to get API keys and tokens for all 22 MCP servers.

## Core Services (No credentials needed)

### memory
No configuration required. Persistent memory across sessions.

### sequential-thinking
No configuration required. Enhanced reasoning mode.

## Development Tools

### github
**What you need:** Personal Access Token
**Get it from:** https://github.com/settings/tokens
**Permissions:** `repo`, `workflow`, `read:org`
**Environment variable:** `GITHUB_PERSONAL_ACCESS_TOKEN`

**Steps:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy token and add to `.env`

### netlify
**What you need:** Personal Access Token
**Get it from:** https://app.netlify.com/user/applications
**Environment variable:** `NETLIFY_AUTH_TOKEN`

**Steps:**
1. Go to Netlify → User Settings → Applications
2. Create new access token
3. Copy and add to `.env`

### vercel
**What you need:** Access Token
**Get it from:** https://vercel.com/account/tokens
**Environment variable:** `VERCEL_TOKEN`

**Steps:**
1. Go to Vercel → Settings → Tokens
2. Create token with appropriate scope
3. Copy and add to `.env`

### digitalocean
**What you need:** API Token
**Get it from:** https://cloud.digitalocean.com/account/api/tokens
**Environment variable:** `DIGITALOCEAN_API_TOKEN`

**Steps:**
1. Go to API → Tokens/Keys
2. Generate New Token
3. Select Read/Write scopes
4. Copy and add to `.env`

### railway
**What you need:** API Token
**Get it from:** https://railway.app/account/tokens
**Environment variable:** `RAILWAY_API_TOKEN`

**Steps:**
1. Go to Account Settings → Tokens
2. Create new token
3. Copy and add to `.env`

### filesystem
**What you need:** Directory path
**Configuration:** Update path in `mcp.json`
**Default:** `/Users/YOUR_USERNAME/Documents/Projects`

**Steps:**
1. Choose your projects directory
2. Update `filesystem` args in `~/.cursor/mcp.json`

## Design Tools

### figma-developer
**What you need:** Personal Access Token
**Get it from:** https://www.figma.com/developers/api#access-tokens
**Environment variable:** `FIGMA_API_KEY`

**Steps:**
1. Go to Figma Settings → Personal access tokens
2. Generate new token
3. Copy and add to `.env`

### cursor-talk-to-figma
**What you need:** Same as figma-developer
**Uses:** `FIGMA_API_KEY` from above

## Web Automation

### firecrawl
**What you need:** API Key
**Get it from:** https://www.firecrawl.dev/app/api-keys
**Environment variable:** `FIRECRAWL_API_KEY`

**Steps:**
1. Sign up at firecrawl.dev
2. Go to API Keys section
3. Generate new key
4. Copy and add to `.env`

### puppeteer
No credentials required. Browser automation runs locally.

### apify-modern
**What you need:** API Token (optional for public features)
**Get it from:** https://console.apify.com/account/integrations
**URL endpoint:** `https://mcp.apify.com`

Using public endpoint, no credentials needed for basic features.

### fetch
No credentials required. Basic web fetching.

## AI Services

### nano-banana
**What you need:** Google Gemini API Key
**Get it from:** https://aistudio.google.com/app/apikey
**Environment variable:** `GEMINI_API_KEY`

**Steps:**
1. Go to Google AI Studio
2. Create API key
3. Copy and add to `.env`

### replicate
**What you need:** API Token
**Get it from:** https://replicate.com/account/api-tokens
**Environment variable:** `REPLICATE_API_TOKEN`

**Steps:**
1. Sign up at replicate.com
2. Go to Account → API tokens
3. Generate token
4. Copy and add to `.env`

## Media Management

### cloudinary
**What you need:** Cloud Name, API Key, API Secret
**Get it from:** https://cloudinary.com/console/settings/security
**Environment variables:**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Steps:**
1. Go to Cloudinary Console → Settings
2. Find Account Details section
3. Copy Cloud Name
4. Go to Security tab
5. Copy API Key and API Secret
6. Add all three to `.env`

## Database

### airtable
**What you need:** Personal Access Token
**Get it from:** https://airtable.com/create/tokens
**Environment variable:** `AIRTABLE_API_KEY`

**Steps:**
1. Go to Account → Developer Hub
2. Create personal access token
3. Set scopes and bases
4. Copy and add to `.env`

## Automation & CRM

### n8n-mcp
**What you need:** API URL and API Key
**Get it from:** Your n8n instance settings
**Environment variables:**
- `N8N_API_URL` (e.g., https://your-instance.app.n8n.cloud/api/v1)
- `N8N_API_KEY`

**Steps:**
1. Go to n8n Settings → API
2. Generate API key
3. Note your instance URL
4. Add both to `.env`

### gohighlevel
**What you need:** API Key, Location ID
**Get it from:** https://marketplace.gohighlevel.com/
**Environment variables:**
- `GHL_API_KEY`
- `GHL_LOCATION_ID`

**Steps:**
1. Go to GoHighLevel Settings
2. Navigate to API section
3. Generate API key
4. Find Location ID in settings
5. Add both to `.env`

## SEO Tools

### dataforseo
**What you need:** Login (email) and Password
**Get it from:** https://app.dataforseo.com/
**Environment variables:**
- `DATAFORSEO_LOGIN`
- `DATAFORSEO_PASSWORD`

**Steps:**
1. Sign up at dataforseo.com
2. Go to API Dashboard
3. Note your login email
4. Generate API password (not account password)
5. Add to `.env`

## Infrastructure

### MCP_DOCKER
No credentials required. Uses local Docker daemon.

## Security Best Practices

1. **Never commit real credentials** to version control
2. **Use read-only tokens** where possible
3. **Rotate keys periodically** (every 90 days recommended)
4. **Use environment-specific keys** (dev/staging/prod)
5. **Store sensitive tokens** in password manager
6. **Enable 2FA** on all accounts
7. **Review token permissions** regularly
8. **Revoke unused tokens** immediately

## Credential Storage

### Recommended Tools
- **1Password** - Team password manager
- **LastPass** - Personal/business
- **Bitwarden** - Open source option
- **HashiCorp Vault** - Enterprise secrets management

### Backup Strategy
1. Store all tokens in password manager
2. Keep encrypted backup in secure location
3. Document recovery procedures
4. Share access with trusted team member

## Token Rotation Schedule

| Service | Rotation Frequency | Difficulty |
|---------|-------------------|------------|
| GitHub | 90 days | Easy |
| Netlify | 90 days | Easy |
| OpenAI | 90 days | Easy |
| Anthropic | 90 days | Easy |
| Cloudinary | 180 days | Medium |
| DataForSEO | 180 days | Medium |
| All others | 90 days | Easy |

## Quick Setup Checklist

- [ ] GitHub token (required for version control)
- [ ] Netlify token (if deploying to Netlify)
- [ ] Supabase credentials (if using database)
- [ ] Anthropic API key (if using Claude)
- [ ] OpenAI API key (if using gpt-image-1)
- [ ] Gemini API key (if using nano-banana)
- [ ] Firecrawl API key (if using web scraping)
- [ ] DataForSEO credentials (if using keyword research)
- [ ] Cloudinary credentials (if using media management)
- [ ] Figma token (if using design integration)

## Need Help?

- Can't find a token? Check service documentation
- Token not working? Verify permissions/scopes
- Lost access? Contact service support for recovery
- Security concern? Rotate all tokens immediately

## Related Documentation

- [.env.template](./env.template) - Template file
- [README.md](./README.md) - Main documentation
- [MCP Server Management](../docs/MCP_SERVER_MANAGEMENT.md) - Full guide
