# Blog Content Standards - Quick Reference

## 🚀 Quick Start (3 Steps)

### 1. Audit Existing Blogs
```bash
node scripts/audit-blog-content-standards.js
```

### 2. Preview Batch Regeneration
```bash
node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run
```

### 3. Regenerate Non-Compliant Blogs
```bash
node scripts/batch-regenerate-blogs.js --score-threshold 60
```

---

## 📊 Audit Script

**Run:**
```bash
node scripts/audit-blog-content-standards.js
```

**Output:**
- Summary statistics (compliant %, average score)
- Detailed per-post analysis with scores (0-100)
- Issues and warnings for each post
- Recommendations for action

**Scoring:**
- **≥90**: Excellent
- **80-89**: Compliant
- **60-79**: Needs manual editing
- **<60**: Needs regeneration

---

## 🔄 Batch Regeneration Script

### Common Commands

```bash
# Regenerate blogs with low scores
node scripts/batch-regenerate-blogs.js --score-threshold 60

# Regenerate specific blogs by slug
node scripts/batch-regenerate-blogs.js --slugs "blog-1,blog-2,blog-3"

# Regenerate all blogs (use with caution!)
node scripts/batch-regenerate-blogs.js --all

# Preview before regenerating (always recommended)
node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run

# Slower regeneration for large batches
node scripts/batch-regenerate-blogs.js --all --delay 5000
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--slugs <list>` | Specific blogs by slug | `--slugs "blog-1,blog-2"` |
| `--ids <list>` | Specific blogs by ID | `--ids "uuid-1,uuid-2"` |
| `--score-threshold <N>` | Blogs with score < N | `--score-threshold 60` |
| `--all` | ALL published blogs | `--all` |
| `--dry-run` | Preview only, no changes | `--dry-run` |
| `--delay <ms>` | Delay between regenerations | `--delay 5000` |
| `--skip-backup` | Skip content backups | `--skip-backup` |

---

## ✅ Content Standards Checklist

### Required Elements
- [ ] ≥1,200 words
- [ ] Primary keyword in H1 and first 150 words
- [ ] Strong opening hook
- [ ] 2-4 sentence paragraphs (mostly)
- [ ] No em dashes (use commas/parentheses)
- [ ] Maximum 2 lists total
- [ ] Exactly 5 FAQ questions (### headings)
- [ ] Short CTA after FAQs
- [ ] No "Introduction"/"Conclusion" headings
- [ ] Natural, descriptive headings
- [ ] 1-2 internal links
- [ ] 1-2 external links
- [ ] Markdown only (no code fences)
- [ ] Self-contained, ready to publish

---

## 🎯 Recommended Workflow

### For Existing Blogs

**Step 1: Audit**
```bash
node scripts/audit-blog-content-standards.js
```

**Step 2: Test Regeneration**
```bash
# Pick 1-2 blogs to test first
node scripts/batch-regenerate-blogs.js --slugs "test-blog" --dry-run
node scripts/batch-regenerate-blogs.js --slugs "test-blog"
# Review result in admin panel
```

**Step 3: Batch Regenerate**
```bash
# Dry-run first
node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run

# Then regenerate
node scripts/batch-regenerate-blogs.js --score-threshold 60
```

**Step 4: Verify**
```bash
# Re-run audit to confirm improvements
node scripts/audit-blog-content-standards.js
```

---

### For New Blogs

**All new blog generation automatically enforces standards:**

**Blog Management UI:**
1. Go to `/blog-management`
2. Add post with title and keywords
3. Click "Write Articles"
4. Content generated with standards ✅

**AI Content Writer Module:**
1. Go to `/app` → AI Content Writer
2. Select "Blog Post" type
3. Fill in topic and keywords
4. Generate content ✅

**Admin Blog Generator API:**
```bash
curl -X POST /.netlify/functions/admin-blog-generator \
  -H "Content-Type: application/json" \
  -d '{"action": "generate_batch", "count": 3}'
```

---

## 🛡️ Safety Features

### Batch Regeneration Safety

1. **Dry-Run Mode**: Preview before making changes
   ```bash
   --dry-run
   ```

2. **Automatic Backups**: Original content saved before regeneration
   - Stored in `blog_content_backups` table
   - Includes content, title, excerpt, word count
   - Timestamped for rollback

3. **Confirmation Prompt**: Must confirm before proceeding
   ```
   Proceed with regenerating 5 blog(s)? (y/n):
   ```

4. **Rate Limiting**: Default 3-second delay between regenerations
   ```bash
   --delay 5000  # 5 seconds
   ```

5. **Error Handling**: Continues on failure, reports at end

---

## 📁 File Locations

### Documentation
- **Content Standards**: `docs/BLOG_CONTENT_STANDARDS.md`
- **AutoBlog System**: `docs/AUTOBLOG_SYSTEM.md`
- **Regeneration Guide**: `docs/BATCH_BLOG_REGENERATION_GUIDE.md`
- **Integration Summary**: `BLOG_STANDARDS_INTEGRATION_COMPLETE.md`

### Scripts
- **Audit**: `scripts/audit-blog-content-standards.js`
- **Batch Regeneration**: `scripts/batch-regenerate-blogs.js`

### Code
- **Client-side**: `src/lib/anthropic-blog-writer.js`
- **Server-side**: `netlify/functions/admin-blog-generator.js`
- **AI Module**: `netlify/functions/module-ai-content-writer.js`

### Database
- **Migration**: `supabase/migrations/20251021_blog_content_backups.sql`

---

## 🔧 Troubleshooting

### Issue: Script won't run

**Check:**
```bash
# Environment variables set?
echo $VITE_SUPABASE_URL
echo $VITE_ANTHROPIC_API_KEY

# Dependencies installed?
npm install
```

---

### Issue: Low audit scores after regeneration

**Solution:**
1. Check one blog manually to verify quality
2. Re-run audit: `node scripts/audit-blog-content-standards.js`
3. If still low, report specific blog for investigation

---

### Issue: API rate limiting (429 errors)

**Solution:**
```bash
# Increase delay to 5-10 seconds
node scripts/batch-regenerate-blogs.js --score-threshold 60 --delay 5000

# Or regenerate in smaller batches
node scripts/batch-regenerate-blogs.js --slugs "batch-1,batch-2,batch-3"
```

---

### Issue: Need to rollback changes

**Solution:**
Query backups and restore manually:

```sql
-- See backups
SELECT * FROM blog_content_backups
WHERE post_id = 'your-post-uuid'
ORDER BY backed_up_at DESC;

-- Restore original content
UPDATE posts
SET content = (
  SELECT original_content FROM blog_content_backups
  WHERE post_id = 'your-post-uuid'
  ORDER BY backed_up_at DESC LIMIT 1
)
WHERE id = 'your-post-uuid';
```

---

## 💡 Pro Tips

1. **Always dry-run first**: See what will happen before doing it
2. **Start small**: Test with 1-2 blogs before large batches
3. **Monitor progress**: Watch console output during regeneration
4. **Keep backups**: Don't use `--skip-backup` in production
5. **Verify results**: Re-run audit after regeneration
6. **Review manually**: Check high-value blogs personally

---

## 📞 Support

### Get Help

**Documentation:**
- Full guide: `docs/BATCH_BLOG_REGENERATION_GUIDE.md`
- Standards: `docs/BLOG_CONTENT_STANDARDS.md`
- Integration: `BLOG_STANDARDS_INTEGRATION_COMPLETE.md`

**Code References:**
- Client: `src/lib/anthropic-blog-writer.js:3-193`
- Server: `netlify/functions/admin-blog-generator.js:18-70`
- Module: `netlify/functions/module-ai-content-writer.js:342-516`

**Scripts:**
- Audit: `scripts/audit-blog-content-standards.js`
- Regenerate: `scripts/batch-regenerate-blogs.js`

---

## 🎉 Summary

**New blogs automatically follow standards:**
- Blog Management UI ✅
- AI Content Writer module ✅
- Admin Blog Generator API ✅

**Existing blogs need action:**
1. Run audit to identify issues
2. Regenerate low-scoring blogs (<60)
3. Manually edit medium-scoring blogs (60-79)
4. Re-audit to verify compliance

**Safety built-in:**
- Dry-run mode
- Automatic backups
- Confirmation prompts
- Rate limiting
- Error handling

---

**Quick Start Commands:**

```bash
# Complete workflow
node scripts/audit-blog-content-standards.js
node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run
node scripts/batch-regenerate-blogs.js --score-threshold 60
node scripts/audit-blog-content-standards.js
```

**Done!** 🚀
