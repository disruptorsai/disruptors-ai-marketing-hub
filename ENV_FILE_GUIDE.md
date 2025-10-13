# .env File Guide - Which One to Use?

## ✅ THE ONE YOU NEED

**Location:** `/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/.env`

**This is your MASTER .env file** that contains:
- ✅ Vite/React app configuration (VITE_ prefixed)
- ✅ All 22 MCP server credentials
- ✅ Supabase, GitHub, Netlify, Cloudinary, etc.
- ✅ AI services (OpenAI, Gemini, Replicate, Anthropic)
- ✅ Marketing tools (DataForSEO, n8n, GoHighLevel)
- ✅ Design tools (Figma)

**Size:** 74 lines, 3.2KB

---

## 🗂️ File Structure

```
disruptors-ai-marketing-hub/
├── .env                          ← USE THIS ONE (master)
├── .env.template                 ← Template for new computers
├── .env.backup                   ← Backup of your .env
├── mcp-portable-config/
│   └── .env                      ← OLD (ignore this)
```

---

## 📋 What's in Your Master .env

### React App (VITE_ prefixed)
```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_SERVICE_ROLE_KEY=...
VITE_OPENAI_API_KEY=...
VITE_GEMINI_API_KEY=...
VITE_REPLICATE_API_TOKEN=...
VITE_ANTHROPIC_API_KEY=...
VITE_FIRECRAWL_API_KEY=...
```

### MCP Servers (no VITE_ prefix)
```bash
GITHUB_PERSONAL_ACCESS_TOKEN=...
NETLIFY_AUTH_TOKEN=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FIRECRAWL_API_KEY=...
FIGMA_API_KEY=...
GEMINI_API_KEY=...               ← Same as VITE_GEMINI but no prefix
REPLICATE_API_TOKEN=...          ← Same as VITE_REPLICATE but no prefix
DATAFORSEO_USERNAME=...
DATAFORSEO_PASSWORD=...
N8N_API_URL=...
N8N_API_KEY=...
GHL_API_KEY=...
FILESYSTEM_PATH=...
```

### Optional Services
```bash
DIGITALOCEAN_API_TOKEN=         (empty - optional)
RAILWAY_API_TOKEN=              (empty - optional)
AIRTABLE_API_KEY=               (empty - optional)
VERCEL_TOKEN=                   (empty - optional)
```

---

## 🎯 How the Plugin Uses This File

When you install the plugin:

```bash
/plugin install disruptors-mcp-suite
```

The `.mcp.json` file reads from this `.env` using environment variable expansion:

```json
{
  "github": {
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  },
  "netlify": {
    "env": {
      "NETLIFY_AUTH_TOKEN": "${NETLIFY_AUTH_TOKEN}"
    }
  }
}
```

---

## 💻 On a Different Computer

### Step 1: Copy THIS .env file
```bash
# From this computer
cp /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/.env ~/Desktop/

# Store in password manager or transfer securely
# NEVER commit to git!
```

### Step 2: On new computer
```bash
# Clone repo
git clone https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub.git
cd disruptors-ai-marketing-hub

# Copy your .env from secure location
cp ~/Desktop/.env .env

# Or use template and fill in
cp .env.template .env
# Then edit with your credentials
```

### Step 3: Install plugin
```bash
/plugin add ./
```

### Step 4: Restart Claude Code

**Done!** All 22 MCP servers will work.

---

## 🔐 Security Checklist

- ✅ `.env` is in `.gitignore` (never committed)
- ✅ Backup stored in password manager
- ✅ Contains real API keys (keep secure!)
- ✅ Template (`.env.template`) has no secrets
- ✅ Transfer via secure methods only

---

## 🗑️ Can I Delete the Other .env?

**YES!** You can safely delete:

```bash
rm /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/mcp-portable-config/.env
```

It's a duplicate that was created during the portable config setup. Your master `.env` at the root has everything.

---

## 📝 Quick Reference

| File | Purpose | Use It? |
|------|---------|---------|
| `.env` (root) | Master config for app + MCP | ✅ YES - This one! |
| `.env.template` | Template for new computers | ✅ YES - For sharing |
| `.env.backup` | Backup of your .env | ✅ YES - For safety |
| `mcp-portable-config/.env` | OLD duplicate | ❌ NO - Can delete |

---

## 🎯 Summary

**You need exactly ONE .env file:**

```
/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/.env
```

This file has:
- ✅ 74 lines
- ✅ All React app config (VITE_ vars)
- ✅ All 22 MCP server credentials
- ✅ Ready for plugin installation
- ✅ Transfer this to other computers

**To use your plugin:**
1. Make sure this .env exists
2. Run: `/plugin add ./`
3. Restart Claude Code
4. All MCP servers load automatically

**That's it!** 🚀
