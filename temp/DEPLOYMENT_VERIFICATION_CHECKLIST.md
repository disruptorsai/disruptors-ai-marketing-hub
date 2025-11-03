# AI Change Request Analyzer - Deployment Verification Checklist

**Feature**: AI-Powered Change Request Analyzer
**Status**: ✅ Code Pushed | ⏳ Deployment in Progress
**Date**: January 31, 2025

---

## ✅ Pre-Deployment (COMPLETE)

- [x] Database migration applied via Supabase SQL Editor
- [x] Code committed to git
- [x] Code pushed to origin/seoplus branch
- [x] Dependencies installed (pdf-parse)
- [x] Documentation written
- [x] CHANGELOG updated

---

## ⏳ Deployment Steps (AUTO)

Your git push should trigger automatic deployment. Monitor:

1. **GitHub Actions** (if configured)
   - Check: https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub/actions
   - Verify build completes successfully

2. **Netlify Deploy**
   - Check: https://app.netlify.com/projects/disruptorsmedia
   - Wait for "Published" status (usually 2-5 minutes)

---

## 🧪 Post-Deployment Testing

### 1. Verify Netlify Function Deployed

```bash
# Check if function is deployed
npx netlify functions:list

# Should show:
# change-request-analyze
```

### 2. Access Admin Panel

1. Navigate to: https://disruptorsmedia.com/admin/secret
   - OR: https://dm4.wjwelsh.com/admin/secret (production)
   - OR: https://dev.disruptorsmedia.com/admin/secret (dev)
2. Login with admin credentials
3. Click "Change Requests" in sidebar

### 3. Test AI Analyzer - Text Input

1. Click **"AI Analyzer"** button (purple with sparkles)
2. Enter team member info:
   - Name: "Test User"
   - Email: "test@example.com" (optional)
3. Select **"Paste Text"** tab
4. Paste this sample:
   ```
   - Fix homepage hero button alignment on mobile devices
   - Update contact form to include phone number field
   - URGENT: Shopping cart checkout is broken
   - Add testimonial section below services
   ```
5. Click **"Analyze & Create Requests"**
6. ✅ Expected: "Success! Created 4 change request(s)"
7. ✅ Verify: 4 new requests appear in the table below
8. ✅ Check: Each request has:
   - Proper category (bug_fix, feature, etc.)
   - Correct priority (urgent for #3, medium for others)
   - Task items populated (click to expand)
   - Same batch_id (grouped together)
   - source_type = 'ai_text'

### 4. Test AI Analyzer - Image Upload

1. Click **"AI Analyzer"** again
2. Enter team member name
3. Select **"Upload Image"** tab
4. Prepare a test image:
   - Create a screenshot with text
   - OR use any image with visible text/notes
5. Upload the image
6. ✅ Verify: Image preview appears
7. Click **"Analyze & Create Requests"**
8. ✅ Expected: AI extracts text and creates requests
9. ✅ Check: source_type = 'ai_image'

### 5. Test AI Analyzer - PDF Upload (Optional)

1. Click **"AI Analyzer"** again
2. Enter team member name
3. Select **"Upload PDF"** tab
4. Upload a text-based PDF with change requests
5. ✅ Verify: File info displays (name, size)
6. Click **"Analyze & Create Requests"**
7. ✅ Expected: AI extracts text and creates requests
8. ✅ Check: source_type = 'ai_pdf'

### 6. Verify Database Records

Open Supabase Dashboard → SQL Editor and run:

```sql
-- Check AI analyses table
SELECT
  id,
  requester_name,
  source_type,
  requests_created,
  status,
  created_at
FROM change_request_ai_analyses
ORDER BY created_at DESC
LIMIT 5;

-- Should show your test analyses with status = 'completed'
```

```sql
-- Check change requests with AI metadata
SELECT
  id,
  requester_name,
  change_description,
  source_type,
  batch_id,
  priority,
  category,
  task_items::text
FROM change_requests
WHERE source_type LIKE 'ai_%'
ORDER BY created_at DESC
LIMIT 10;

-- Should show all AI-created requests with populated fields
```

### 7. Test Error Handling

#### Test: Missing Team Member Name
1. Open AI Analyzer
2. Leave name field empty
3. Paste text or upload file
4. Click "Analyze"
5. ✅ Expected: Error alert "Please enter the team member name"

#### Test: Empty Text Input
1. Open AI Analyzer
2. Enter name
3. Select "Paste Text" tab
4. Leave textarea empty
5. Click "Analyze"
6. ✅ Expected: Error alert about missing content

#### Test: Oversized File
1. Open AI Analyzer
2. Enter name
3. Try uploading file > 10MB
4. ✅ Expected: Error about file size

#### Test: Invalid File Type
1. Open AI Analyzer
2. Enter name
3. Try uploading .exe, .zip, or other invalid type
4. ✅ Expected: Error about file type

### 8. Performance Check

1. Time the analysis process
2. ✅ Expected: 5-15 seconds for text/PDF
3. ✅ Expected: 10-20 seconds for images (vision processing)
4. ✅ UI should show loading indicator
5. ✅ UI should remain responsive (no freezing)

### 9. Integration Check

1. Verify AI-created requests:
   - ✅ Appear in main requests table
   - ✅ Can be filtered by status
   - ✅ Can be filtered by priority
   - ✅ Can be filtered by category
   - ✅ Can be filtered by source_type (if added to filters)
   - ✅ Status can be updated (pending → approved → in_progress → completed)
   - ✅ Export to CSV includes new fields

2. Verify batch grouping:
   - ✅ Multiple requests from same analysis share batch_id
   - ✅ Can be queried together via batch_id

3. Verify task items:
   - ✅ Display properly in UI (if task expansion added)
   - ✅ Stored as valid JSON array
   - ✅ Contains 2-5 specific tasks per request

---

## 🐛 Troubleshooting

### Issue: Function not found
**Solution:**
```bash
# Check Netlify deploy logs
npx netlify api listSiteDeploys --data='{"site_id":"3d44ed94-4fdc-475c-aea4-245615e62856"}' | head -20

# Redeploy if needed
npx netlify deploy --prod
```

### Issue: "OpenAI API error"
**Causes:**
- Invalid API key
- Insufficient credits
- Rate limit exceeded

**Solution:**
1. Check `.env` has `VITE_OPENAI_API_KEY`
2. Verify key at https://platform.openai.com/api-keys
3. Check usage at https://platform.openai.com/usage
4. Wait 1 minute and retry

### Issue: "No change requests found"
**Cause:** Input too vague

**Solution:**
- Use bullet points
- Be more specific
- Include clear action words (fix, add, update)

### Issue: PDF parsing error
**Cause:** Image-based PDF (scanned)

**Solution:**
- Upload as image instead (use "Upload Image" tab)
- OR convert PDF to text-based format first

### Issue: Analysis takes too long
**If > 30 seconds:**
1. Check Netlify function logs
2. Verify OpenAI API status
3. Try with simpler input
4. Check network connection

---

## 📊 Success Criteria

Feature is considered successfully deployed when:

- [x] Database migration applied
- [ ] Netlify function deployed and accessible
- [ ] AI Analyzer UI loads without errors
- [ ] Text input creates requests successfully
- [ ] Image upload creates requests successfully
- [ ] PDF upload creates requests successfully (optional)
- [ ] Requests have proper categorization
- [ ] Requests have proper prioritization
- [ ] Task items populated correctly
- [ ] Batch grouping works
- [ ] Error handling works
- [ ] Database records created correctly
- [ ] Integration with existing system works

---

## 📝 Test Results

### Test Session 1
- **Date/Time**: _____________
- **Tested By**: _____________
- **Text Input**: ✅ / ❌
- **Image Upload**: ✅ / ❌
- **PDF Upload**: ✅ / ❌
- **Error Handling**: ✅ / ❌
- **Performance**: ✅ / ❌
- **Integration**: ✅ / ❌
- **Notes**: _________________

### Test Session 2
- **Date/Time**: _____________
- **Tested By**: _____________
- **Results**: ________________
- **Notes**: _________________

---

## 🎉 Sign-Off

When all tests pass:

- [ ] Development team sign-off
- [ ] Admin/Manager testing complete
- [ ] Documentation reviewed
- [ ] Feature marked as "Production Ready"
- [ ] Team trained on usage
- [ ] Usage guidelines distributed

---

## 📚 Resources

- **Feature Guide**: `docs/AI_CHANGE_REQUEST_ANALYZER.md`
- **Setup Guide**: `docs/SETUP_AI_CHANGE_ANALYZER.md`
- **Quick Start**: `temp/AI_ANALYZER_QUICK_START.md`
- **Implementation Summary**: `temp/AI_CHANGE_ANALYZER_IMPLEMENTATION_SUMMARY.md`

- **Admin Panel**: https://disruptorsmedia.com/admin/secret
- **Netlify Dashboard**: https://app.netlify.com/projects/disruptorsmedia
- **Supabase Dashboard**: https://app.supabase.com
- **OpenAI Dashboard**: https://platform.openai.com

---

**Next Steps After Successful Testing:**
1. Train team members on feature usage
2. Document common use cases
3. Establish review process for AI-generated requests
4. Monitor OpenAI usage/costs
5. Gather feedback for improvements
