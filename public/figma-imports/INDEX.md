# Figma MCP Extraction - File Index

**Last Updated**: October 5, 2025
**Status**: ✅ Ready for extraction

---

## 🚀 Quick Start

**New here?** Start with one of these:

1. **CLAUDE_CODE_USAGE.md** ⭐ - Copy-paste commands for Claude Code
2. **EXTRACTION_REPORT.md** - Technical details and architecture
3. **MCP_EXTRACTION_GUIDE.md** - Detailed usage instructions

---

## 📚 Documentation Files

### Primary Guides

| File | Purpose | Audience | When to Use |
|------|---------|----------|-------------|
| **CLAUDE_CODE_USAGE.md** | Ready-to-use commands for Claude Code | Developers | When extracting Figma data |
| **EXTRACTION_REPORT.md** | Technical architecture and limitations | Technical leads | Understanding how it works |
| **MCP_EXTRACTION_GUIDE.md** | Complete usage documentation | All users | Learning the system |
| **INDEX.md** | This file - navigation guide | All users | Finding the right document |

### Additional Resources

| File | Purpose | Notes |
|------|---------|-------|
| **README.md** | Quick overview | General introduction |
| **MCP_TOOLS_GUIDE.md** | MCP tool reference | Tool API documentation |
| **FINAL_REPORT.md** | Previous implementation | Historical reference |
| **IMPORT_SUMMARY.md** | Import workflow | General guidance |

### Example Files

| File | Purpose | Use |
|------|---------|-----|
| **selection-example-2025-10-05.json** | Sample extraction | See data structure |
| **react-integration-example.jsx** | Sample React code | See conversion pattern |
| **selection-template-*.json** | Data templates | Reference structure |

---

## 📁 Directory Structure

```
/public/figma-imports/
├── INDEX.md                              # ← You are here
├── CLAUDE_CODE_USAGE.md                  # ⭐ START HERE
├── EXTRACTION_REPORT.md                  # Technical details
├── MCP_EXTRACTION_GUIDE.md               # Complete guide
├── README.md                             # Quick intro
├── MCP_TOOLS_GUIDE.md                    # Tool reference
├── FINAL_REPORT.md                       # Historical
├── IMPORT_SUMMARY.md                     # General guidance
├── react-integration-example.jsx         # Sample code
├── selection-example-2025-10-05.json     # Sample data
├── selection-template-*.json             # Templates
├── assets/                               # Exported images (pending)
│   ├── icons/
│   ├── logos/
│   └── images/
├── component-templates/                  # React components (pending)
└── design-system/                        # Design tokens (pending)
```

---

## 🎯 Choose Your Path

### Path 1: "I want to extract something RIGHT NOW"

1. Open **CLAUDE_CODE_USAGE.md**
2. Find your use case (desktop selection, API file, images, etc.)
3. Copy the command
4. Paste to Claude Code
5. Done!

**Time**: < 5 minutes

---

### Path 2: "I want to understand how this works"

1. Read **EXTRACTION_REPORT.md** (Technical architecture)
2. Review **MCP_EXTRACTION_GUIDE.md** (Detailed instructions)
3. Check **MCP_TOOLS_GUIDE.md** (Available tools)
4. Try an extraction using **CLAUDE_CODE_USAGE.md**

**Time**: 20-30 minutes

---

### Path 3: "I want to build a complete design system"

1. Read **CLAUDE_CODE_USAGE.md** - Method 4 (Full design system extraction)
2. Get your Figma file key
3. Copy the complete extraction command
4. Review extracted design tokens
5. Generate Tailwind config
6. Build component library

**Time**: 1-2 hours (depending on design system size)

---

### Path 4: "Something's not working"

1. Check **EXTRACTION_REPORT.md** → Troubleshooting section
2. Verify MCP status: `npm run mcp:status`
3. Check both servers show "ready"
4. Review error message and match to troubleshooting guide
5. Try alternative extraction method if needed

**Time**: 5-15 minutes

---

## 🔍 Find Information Quickly

### How do I extract my current Figma selection?
→ **CLAUDE_CODE_USAGE.md** - Method 1

### How do I extract an entire Figma file?
→ **CLAUDE_CODE_USAGE.md** - Method 2

### How do I export images from Figma?
→ **CLAUDE_CODE_USAGE.md** - Method 3

### What MCP tools are available?
→ **MCP_TOOLS_GUIDE.md** or **EXTRACTION_REPORT.md** - Available MCP Tools

### What does extracted data look like?
→ **selection-example-2025-10-05.json** or **EXTRACTION_REPORT.md** - Data Structure

### How do I convert Figma to React?
→ **react-integration-example.jsx** or **EXTRACTION_REPORT.md** - React Component Mapping

### Why doesn't my Node.js script work?
→ **EXTRACTION_REPORT.md** - Why Direct Script Extraction Failed

### How do I check if MCP servers are running?
→ **EXTRACTION_REPORT.md** - Troubleshooting or run `npm run mcp:status`

### What's the difference between the two MCP servers?
→ **EXTRACTION_REPORT.md** - Configured Servers

### Can I automate Figma extraction?
→ **EXTRACTION_REPORT.md** - Automated Workflow (Future)

---

## 📊 File Purpose Matrix

| What You Need | File to Read | Section |
|---------------|--------------|---------|
| Extract something now | CLAUDE_CODE_USAGE.md | Choose your method |
| Understand architecture | EXTRACTION_REPORT.md | Technical Details |
| Learn all features | MCP_EXTRACTION_GUIDE.md | Complete guide |
| See sample data | selection-example-2025-10-05.json | Entire file |
| See React conversion | react-integration-example.jsx | Entire file |
| Troubleshoot issues | EXTRACTION_REPORT.md | Troubleshooting |
| Check what's available | MCP_TOOLS_GUIDE.md | Tool list |
| Quick overview | README.md | Entire file |

---

## 🎨 Workflow Checklist

Complete Figma-to-React workflow:

- [ ] **Setup** (One-time)
  - [x] MCP servers configured
  - [x] Environment variables set
  - [x] Documentation created
  - [x] Directory structure ready

- [ ] **Extraction** (Per design)
  - [ ] Open Figma and select layers OR get file key
  - [ ] Choose extraction method from CLAUDE_CODE_USAGE.md
  - [ ] Copy command to Claude Code
  - [ ] Review extracted JSON data
  - [ ] Export any required images

- [ ] **Conversion** (Per component)
  - [ ] Analyze Figma properties
  - [ ] Map to Tailwind classes
  - [ ] Generate React component
  - [ ] Add prop types and variants
  - [ ] Test component

- [ ] **Integration** (Per project)
  - [ ] Extract design tokens (colors, typography, spacing)
  - [ ] Update Tailwind config
  - [ ] Create component library
  - [ ] Document components
  - [ ] Setup Storybook

- [ ] **Maintenance** (Ongoing)
  - [ ] Re-extract when designs change
  - [ ] Update components to match
  - [ ] Keep design tokens in sync
  - [ ] Consider automation (webhooks, GitHub Actions)

---

## 🚦 Status Indicators

| Component | Status | Verification |
|-----------|--------|--------------|
| cursor-talk-to-figma | ✅ Ready | `npm run mcp:status` |
| figma-developer | ✅ Ready | `npm run mcp:status` |
| FIGMA_API_KEY | ✅ Configured | `grep FIGMA_API_KEY .env` |
| Documentation | ✅ Complete | This file |
| First Extraction | ⏳ Pending | Your action needed |
| Component Library | ⏳ Pending | After extraction |
| Automation | 📋 Planned | Future enhancement |

---

## 💡 Pro Tips

### For Developers
1. **Start small**: Extract one component before trying full design system
2. **Use desktop extraction**: Faster for iterative work
3. **Cache extractions**: Save JSON locally to avoid re-fetching
4. **Map systematically**: Create Figma → Tailwind conversion table

### For Designers
1. **Name things well**: Names become component/class names in code
2. **Use Auto Layout**: Maps directly to Flexbox in React
3. **Create components**: Not just frames - for reusability
4. **Define variants**: Become props in React components
5. **Use styles**: Color/text styles become design tokens

### For Teams
1. **Establish workflow**: Document Figma → React process
2. **Regular syncs**: Schedule design system extractions
3. **Version control**: Keep Figma and code in sync
4. **Automate checks**: Verify implementations match designs

---

## 🔗 Quick Links

### Project Files
- MCP Config: `/mcp.json`
- Environment: `/.env`
- Orchestrator: `/scripts/mcp-orchestrator.js`
- Complete setup: `/docs/FIGMA_MCP_SETUP_COMPLETE.md`

### Commands
- Check MCP status: `npm run mcp:status`
- Start orchestrator: `npm run mcp:start`
- Check Figma running: `npm run figma:status`

### External Resources
- [Figma API Docs](https://www.figma.com/developers/api)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [cursor-talk-to-figma GitHub](https://github.com/eonist/cursor-talk-to-figma-mcp)
- [figma-developer-mcp GitHub](https://github.com/felores/figma-developer-mcp)

---

## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-05 | 1.0.0 | Initial setup complete |
| 2025-10-05 | 1.1.0 | Documentation created |
| 2025-10-05 | 1.2.0 | Claude Code integration documented |
| 2025-10-05 | 1.3.0 | Comprehensive guides added |

---

## 🎯 Next Steps

1. **Choose your starting point** from "Choose Your Path" above
2. **Open the recommended file**
3. **Follow the instructions**
4. **Extract your first Figma selection**
5. **Come back here** if you need different information

---

## 📞 Need Help?

1. **Check troubleshooting**: EXTRACTION_REPORT.md → Troubleshooting
2. **Verify MCP status**: `npm run mcp:status`
3. **Review error logs**: Look at Claude Code output
4. **Try alternative method**: Desktop vs API extraction

---

**File Index Version**: 1.0.0
**Last Updated**: October 5, 2025
**Status**: ✅ Complete and ready for use
**Recommended Starting Point**: CLAUDE_CODE_USAGE.md ⭐
