# AI Change Request Analyzer - Quick Start Card

## 🚀 5-Minute Setup

### 1. Apply Database Migration (2 min)
```bash
# Open Supabase Dashboard → SQL Editor
# Copy/paste: supabase/migrations/20250131_change_requests_ai_analysis.sql
# Click "Run"
```

### 2. Verify Environment (30 sec)
```bash
# Ensure .env has:
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

### 3. Deploy (2 min)
```bash
git add .
git commit -m "feat: Add AI Change Request Analyzer"
git push  # Auto-deploys to Netlify
```

### 4. Test (30 sec)
1. Go to `/admin/secret` → Change Requests
2. Click "AI Analyzer" (purple button)
3. Paste: "Fix homepage button, update contact form"
4. Click "Analyze & Create Requests"
5. ✅ Done!

---

## 📋 Quick Reference

### Access
**Location**: Admin Panel → Change Requests → AI Analyzer button

### Input Methods
| Method | File Types | Max Size | Best For |
|--------|------------|----------|----------|
| **Text** | Plain text | N/A | Bullet lists, paragraphs |
| **Image** | JPEG, PNG, WebP | 10MB | Screenshots, mockups |
| **PDF** | Text-based PDF | 10MB | Documents, reports |

### Priority Keywords
- **Urgent**: URGENT, ASAP, critical, emergency
- **High**: important, priority, soon
- **Low**: minor, eventually, optional

### Categories
- Bug Fix, Feature, Content Change, Design Change
- Performance, Security, Other

---

## 💡 Usage Tips

### Good Input ✅
```
- Fix broken contact form validation
- Update hero section with new tagline
- Add testimonial from Acme Corp
- URGENT: Optimize mobile performance
```

### Poor Input ❌
```
Make the website better
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Migration failed" | Apply manually via Supabase SQL Editor |
| "OpenAI error" | Check API key, credits, rate limits |
| "PDF parsing failed" | Use "Upload Image" for scanned PDFs |
| "No requests found" | Use bullet points, be more specific |

---

## 📊 What Gets Created

For each analysis:
- **1 analysis record** in `change_request_ai_analyses`
- **Multiple change requests** in `change_requests` table
- **Linked via batch_id** for grouping
- **Task items** as JSONB array
- **Source tracking** (manual vs ai_text/image/pdf)

---

## 📚 Full Documentation

- Feature Guide: `docs/AI_CHANGE_REQUEST_ANALYZER.md`
- Setup Guide: `docs/SETUP_AI_CHANGE_ANALYZER.md`
- Implementation Summary: `temp/AI_CHANGE_ANALYZER_IMPLEMENTATION_SUMMARY.md`

---

## ⚡ Example Output

**Input**: "Fix homepage button, update contact form"

**Output**: 2 change requests created
1. Fix homepage button alignment → bug_fix, medium priority, 4 tasks
2. Update contact form validation → feature, medium priority, 3 tasks

---

**Questions?** Check docs or contact dev team.
