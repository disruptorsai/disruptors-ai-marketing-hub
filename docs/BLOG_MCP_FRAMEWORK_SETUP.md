# Blog System MCP Framework Setup

**Date:** October 31, 2025
**Status:** ✅ Configured - Ready for Local Blog Generation
**Purpose:** MCP (Model Context Protocol) integration for high-quality blog writing

---

## Overview

The blog system now integrates with **Model Context Protocol (MCP) servers** to provide enhanced quality control and content refinement during blog generation in Claude Desktop/Code.

### What is MCP?

Model Context Protocol (MCP) is an open standard introduced by Anthropic that allows AI assistants to connect to external tools and data sources. Think of it as **"USB-C for AI"** - a standardized way for LLMs to access specialized capabilities.

### Why MCP for Blog Generation?

**Traditional Approach** (Without MCP):
- AI generates content → manual review → manual fact-checking → manual grammar check → publish

**MCP-Enhanced Approach**:
- AI generates content → **real-time humanization** → **automated grammar check** → **automated fact verification** → publish
- All quality checks happen **during generation** with MCP tools
- **Better quality**, **faster workflow**, **fewer manual edits**

---

## Installed MCP Servers

### 1. AI Humanizer MCP Server ✅

**Purpose**: Transforms AI-generated content to sound more natural and human-like

**Package**: `ai-humanizer-mcp-server`

**Capabilities**:
- **AI Detection**: Identifies AI-generated patterns
- **Natural Language Enhancement**: Removes robotic phrasing
- **Grammar Perfection**: Fixes grammatical errors
- **Readability Optimization**: Improves text flow
- **Length Control**: Adjusts content length while preserving meaning
- **Term Preservation**: Maintains specific terminology

**Usage in Claude**:
```
"Is this text AI-generated: [your text]"
"Humanize this blog paragraph: [text]"
"Make this sound more natural: [text]"
```

**Why This Matters**:
- Bypasses AI detection tools (GPTZero, Originality.ai, etc.)
- Produces content that reads like human writing
- Maintains brand voice while removing AI tells

---

### 2. Grammarly MCP Server ✅

**Purpose**: Professional grammar, style, and spelling checking

**Package**: `@procodersptyltd/grammarly-mcp`

**Capabilities**:
- Grammar error detection
- Spelling corrections
- Style improvements
- Tone adjustments
- Clarity enhancements

**Usage in Claude**:
```
"Check this paragraph for grammar: [text]"
"Review grammar and style: [text]"
"Fix grammar errors: [text]"
```

**Why This Matters**:
- Professional-quality grammar checking
- Catches errors Claude might miss
- Ensures polished, publication-ready content

**Note**: Requires Grammarly account. Free tier works, but premium provides better suggestions.

---

### 3. Fact-Check Tools MCP Server ✅

**Purpose**: Verifies factual claims using Google Fact Check API

**Package**: `@ag2-mcp/fact-check-tools`

**Capabilities**:
- Search fact-checking databases
- Verify claims against published fact-checks
- Identify misinformation
- Source credible references

**Usage in Claude**:
```
"Fact-check this claim: [claim]"
"Verify these statistics: [data]"
"Find fact-checks for: [topic]"
```

**Configuration Required**:
```bash
# Add to environment
GOOGLE_FACT_CHECK_API_KEY=your_google_api_key
```

**Why This Matters**:
- Ensures factual accuracy
- Prevents spreading misinformation
- Builds trust with readers

---

## Configuration Details

### Current Claude Desktop Config

Location: `~/Library/Application Support/Claude/config.json` (macOS)

```json
{
  "mcpServers": {
    "ai-humanizer": {
      "command": "npx",
      "args": ["-y", "ai-humanizer-mcp-server"]
    },
    "grammarly": {
      "command": "npx",
      "args": ["-y", "@procodersptyltd/grammarly-mcp"]
    },
    "fact-check-tools": {
      "command": "npx",
      "args": ["-y", "@ag2-mcp/fact-check-tools"],
      "env": {
        "GOOGLE_FACT_CHECK_API_KEY": ""
      }
    }
  }
}
```

**Note**: MCP servers use `npx -y` for automatic installation on first use.

---

## Setup Instructions

### Step 1: Verify Configuration

```bash
# Check if config file exists
cat ~/Library/Application\ Support/Claude/config.json

# Verify MCP servers are listed
```

Expected output should show `ai-humanizer`, `grammarly`, and `fact-check-tools`.

### Step 2: Add Google Fact Check API Key (Optional)

If you want fact-checking capabilities:

1. Go to https://console.cloud.google.com/
2. Enable "Fact Check Tools API"
3. Create API key
4. Update config:

```json
"fact-check-tools": {
  "command": "npx",
  "args": ["-y", "@ag2-mcp/fact-check-tools"],
  "env": {
    "GOOGLE_FACT_CHECK_API_KEY": "your_actual_api_key_here"
  }
}
```

### Step 3: Restart Claude Desktop

MCP servers are loaded on startup. After config changes:

1. Quit Claude Desktop completely
2. Reopen Claude Desktop
3. MCP servers will auto-install on first use

### Step 4: Test MCP Integration

In Claude Desktop, try:

```
"Is this text AI-generated: Artificial intelligence has revolutionized the way businesses operate in today's digital landscape."
```

If MCP server is working, you'll see AI detection analysis.

---

## Using MCPs for Blog Generation

### Workflow: Generate Blog with MCP Enhancement

**Step 1: Generate Initial Draft**
```
"Write a 1,500-word blog post about AI-powered email marketing.
Follow BLOG_CONTENT_STANDARDS.md requirements."
```

**Step 2: Humanize Content**
```
"Use the ai-humanizer MCP to humanize this blog post.
Make it sound natural and bypass AI detection."
```

**Step 3: Grammar Check**
```
"Use grammarly MCP to review grammar and style in this blog."
```

**Step 4: Fact-Check Claims**
```
"Use fact-check-tools MCP to verify all statistics and claims in this blog."
```

**Step 5: Final Review**
```
"Review the blog against BLOG_CONTENT_STANDARDS.md checklist."
```

---

## Example: MCP-Enhanced Blog Generation

### Prompt Template

```markdown
I need to generate a high-quality blog post using MCP tools.

**Topic**: [Your Topic]
**Primary Keyword**: [Keyword]
**Target Length**: 1,500+ words

**Process**:
1. Generate initial draft following BLOG_CONTENT_STANDARDS.md
2. Use ai-humanizer MCP to make content natural
3. Use grammarly MCP for grammar/style review
4. Use fact-check-tools MCP to verify claims
5. Output final Markdown

**Requirements**:
- 1,500+ words
- Exactly 5 FAQ questions
- No em dashes
- Max 2 lists
- Primary keyword in H1 and first 150 words
- Professional, conversational tone
- Natural, human-like writing

Begin with Step 1.
```

### Expected Workflow

**Claude Response 1** (Initial Draft):
```markdown
# AI-Powered Email Marketing: The Complete Guide

Most businesses are leaving money on the table with their email campaigns...

[1,500+ word blog with all requirements]
```

**Claude Response 2** (After Humanization):
```markdown
I'm using the ai-humanizer MCP to enhance naturalness...

[Refined version with more human-like phrasing]

✅ AI detection score: 0.15 (Low - passes most detectors)
```

**Claude Response 3** (After Grammar Check):
```markdown
I've reviewed with grammarly MCP. Found 3 issues:

1. Line 45: Comma splice - fixed
2. Line 127: Passive voice - converted to active
3. Line 203: Wordiness - simplified

[Updated blog with corrections]
```

**Claude Response 4** (After Fact-Check):
```markdown
I've verified claims using fact-check-tools MCP:

✅ "60% of marketers use AI daily" - Verified (HubSpot 2025)
✅ "$47.32B AI marketing market" - Verified (Market Research 2025)
⚠️ "90% email open rate increase" - No verification found, recommend citing source or removing

[Final blog with verified facts]
```

---

## MCP vs. Direct API Integration

### Why Use Both?

| Feature | MCP (Local) | API Integration (Production) |
|---------|-------------|------------------------------|
| **When** | Blog writing in Claude | Automated blog generation |
| **Who** | Manual content creation | Automated scripts |
| **Speed** | Interactive (real-time feedback) | Batch processing |
| **Cost** | Free (local) | API costs apply |
| **Quality** | Human-in-loop refinement | Automated validation |

**Use MCPs for**:
- Manual blog writing in Claude Desktop
- Quality refinement and editing
- Testing new content approaches
- Training and learning

**Use API Integration for**:
- Automated blog generation scripts
- Batch processing (20+ blogs)
- Production publishing pipeline
- Scalable content production

---

## Troubleshooting

### Issue: MCP Server Not Loading

**Symptoms**: MCP tools not available in Claude Desktop

**Solution**:
1. Check config file syntax (valid JSON)
2. Restart Claude Desktop completely
3. Check logs:
   ```bash
   # macOS
   ~/Library/Logs/Claude/
   ```

### Issue: "Command not found: npx"

**Symptoms**: MCP server fails to start

**Solution**: Install Node.js
```bash
# Check if Node.js installed
node --version
npm --version

# Install if missing
# macOS: brew install node
# Or download from https://nodejs.org
```

### Issue: AI Humanizer Not Responding

**Symptoms**: MCP tool doesn't respond to commands

**Solution**:
1. First use takes longer (npx downloads package)
2. Wait 10-15 seconds on first invocation
3. Try again - should work after initial download

### Issue: Grammarly MCP Requires Authentication

**Symptoms**: Grammarly MCP asks for login

**Solution**:
1. Create free Grammarly account at https://grammarly.com
2. MCP may prompt for authentication on first use
3. Premium account provides better suggestions (optional)

### Issue: Fact-Check MCP Returns No Results

**Symptoms**: Fact-check tool finds no verification

**Solution**: This is normal - not all claims have published fact-checks
- Only major claims are fact-checked
- Recent data may not be verified yet
- Original research won't have fact-checks
- **Action**: Cite original sources for unverified claims

---

## Cost Analysis

### Free Tier (Local Use)

| MCP Server | Cost | Limitations |
|------------|------|-------------|
| AI Humanizer | FREE | Powered by Text2Go |
| Grammarly | FREE | Basic suggestions (Premium = $12/mo for advanced) |
| Fact-Check Tools | FREE | Google Fact Check API is free |

**Total Monthly Cost**: **$0** (or $12/mo with Grammarly Premium)

**vs. API Integration Costs** (Production):
- LanguageTool: $5/month
- SerpAPI: $50-150/month
- **MCP Local Savings**: $55-155/month

---

## Best Practices

### 1. Use MCPs During Writing, Not After

**❌ Wrong Approach**:
```
1. Write entire 2,000-word blog
2. Run all MCP tools at end
3. Massive revisions needed
```

**✅ Right Approach**:
```
1. Write 200-word section
2. Humanize with MCP
3. Grammar check with MCP
4. Fact-check claims
5. Move to next section
```

**Why**: Easier to refine smaller chunks, maintains flow, fewer rewrites

### 2. Layer MCP Tools

**Order matters**:
1. **First**: Generate content
2. **Second**: Humanize (ai-humanizer) - removes AI patterns
3. **Third**: Grammar check (grammarly) - fixes errors introduced by humanization
4. **Fourth**: Fact-check (fact-check-tools) - verify claims
5. **Fifth**: Final review

### 3. Don't Over-Humanize

**Problem**: Running humanizer multiple times can make text awkward

**Solution**: Run humanizer once per section, then grammar check

### 4. Verify Fact-Check Results

**Important**: Fact-check MCP returns existing fact-checks, not truth verification

- ✅ Use it to find published fact-checks
- ❌ Don't treat "no results" as "false claim"
- Always cite original sources for statistics

---

## Limitations & Known Issues

### 1. AI Humanizer Limitations

- **Knowledge cutoff**: May not recognize latest AI patterns
- **Context window**: Works best on paragraphs, not full blogs
- **Subjective**: "Human-like" varies by style

**Workaround**: Humanize section-by-section

### 2. Grammarly MCP Limitations

- **Authentication**: May require Grammarly account
- **Rate limits**: Free tier has usage limits
- **Style preferences**: May suggest changes you disagree with

**Workaround**: Review suggestions critically, don't auto-accept all

### 3. Fact-Check MCP Limitations

- **Coverage**: Only finds published fact-checks
- **Recency**: New data won't have fact-checks yet
- **Accuracy**: Depends on fact-checking organizations

**Workaround**: Use for major claims only, cite sources directly

---

## Future Enhancements

### Phase 2: Additional MCP Servers

**Planned Additions**:
1. **Plagiarism Checker MCP** (if available)
2. **SEO Optimizer MCP** (keyword density, readability)
3. **Citation Generator MCP** (auto-generate citations)
4. **Image Suggestion MCP** (suggest relevant images)

### Phase 3: Custom MCP Servers

**Build Custom MCPs for**:
1. Business Brain integration (brand voice)
2. Keyword research (DataForSEO)
3. Competitor analysis
4. Content gap analysis

**Benefits**:
- Integrated workflow in Claude Desktop
- No switching between tools
- Real-time feedback during writing

---

## Documentation References

### Official MCP Documentation
- **MCP Specification**: https://modelcontextprotocol.io/specification/2025-06-18
- **MCP GitHub**: https://github.com/modelcontextprotocol
- **Claude MCP Docs**: https://docs.anthropic.com/en/docs/build-with-claude/mcp

### MCP Server Registries
- **Glama.ai**: https://glama.ai/mcp/servers (10,000+ servers, security ratings)
- **MCPdb.org**: https://mcpdb.org/ (largest directory)
- **MCP Servers GitHub**: https://github.com/modelcontextprotocol/servers

### Individual MCP Servers
- **AI Humanizer**: https://github.com/Text2Go/ai-humanizer-mcp-server
- **Grammarly MCP**: https://github.com/ProCodersPtyLtd/grammarly-mcp
- **Fact-Check Tools**: https://mcpmarket.com/server/fact-check-tools

---

## Summary

### ✅ What's Configured

- **AI Humanizer MCP**: Transforms AI content to human-like writing
- **Grammarly MCP**: Professional grammar and style checking
- **Fact-Check Tools MCP**: Verifies claims via Google Fact Check API

### 📝 Usage

**For Manual Blog Writing** (Claude Desktop):
1. Generate draft
2. Use MCPs for real-time enhancement
3. Export to Markdown
4. Publish

**For Automated Production** (Scripts):
- Use API integrations in `netlify/functions/blog-run-qa.js`
- MCPs are complementary, not replacement

### 💰 Cost

- **MCP Local Use**: FREE (or $12/mo with Grammarly Premium)
- **API Production**: $55-155/month
- **Best of Both**: Use MCPs for manual writing, APIs for automation

### 🚀 Next Steps

1. Restart Claude Desktop to activate MCPs
2. Test with sample blog paragraph
3. Write your next blog using MCP-enhanced workflow
4. Compare quality: with vs. without MCPs

---

**Last Updated**: October 31, 2025
**Maintainer**: Disruptors AI Development Team
**Status**: ✅ Production-Ready for Local Use
