# Quick Start: Image Generation APIs

**Status**: ✅ Ready to use with OpenAI gpt-image-1

---

## 🚀 Generate Resource Icons Right Now

### Option 1: Fixed OpenAI Script (Recommended)
```bash
node scripts/generate-resource-icons-openai-fixed.js
```

**What it does**:
- Generates 3 sample app store icons (1024×1024)
- Uses OpenAI gpt-image-1 with correct parameters
- Includes retry logic and better error handling
- Saves to: `public/images/resource-icons/`

**Expected time**: 30-60 seconds per icon

---

## 🔍 Test Your APIs

### Test OpenAI Connection
```bash
node scripts/test-openai-connection.js
```

**Checks**:
- ✅ API key validity
- ✅ Network connectivity
- ✅ Model availability
- ✅ Actual generation capability

### Test Gemini Quota
```bash
node scripts/test-gemini-quota.js
```

**Checks**:
- ✅ API key validity
- ❌ Quota status (currently exceeded)
- 💡 Solutions and next steps

---

## 📝 What Was Fixed

### OpenAI gpt-image-1
✅ **Fixed parameter issues**:
- Changed `quality: 'standard'` → `quality: 'medium'`
- Removed invalid parameters (`input_fidelity`, `style`)
- Updated `ai-orchestrator.js` with correct quality mapping

### Google Gemini
⚠️ **Quota issue** (not a code issue):
- Free tier daily limit reached
- Code is correct, just need to wait or upgrade

---

## 💰 Pricing Quick Reference

### OpenAI gpt-image-1
- **Low**: ~$0.02 per image
- **Medium**: ~$0.07 per image
- **High**: ~$0.19 per image

### Google Gemini 2.5 Flash Image
- **All quality**: $0.039 per image
- **Issue**: Free tier quota exceeded

---

## 🛠️ Common Issues

### "ECONNREFUSED" Error
**Cause**: Network blocking OpenAI API

**Solutions**:
1. Disable VPN temporarily
2. Check Windows Firewall
3. Try different network
4. Run: `node scripts/test-openai-connection.js`

### "Quota Exceeded" (Gemini)
**Cause**: Free tier limit reached

**Solutions**:
1. Wait for quota reset (usually 24 hours)
2. Upgrade: https://ai.google.dev/pricing
3. Use OpenAI instead (already working)

### Empty Error Messages
**Cause**: Network timeout or slow API response

**Solutions**:
1. Use the fixed script with retry logic
2. Increase timeout in the script
3. Try during off-peak hours

---

## 📚 File Reference

### Working Scripts
- `scripts/generate-resource-icons-openai-fixed.js` - **Use this one** ✅
- `scripts/test-openai-connection.js` - Diagnostics
- `scripts/test-gemini-quota.js` - Check Gemini status

### Updated Core Files
- `src/lib/ai-orchestrator.js` - Fixed OpenAI parameters
- `scripts/generate-resource-icons-openai.js` - Original (partially fixed)

### Documentation
- `docs/IMAGE_API_FIX_REPORT.md` - Complete technical report
- `docs/QUICK_START_IMAGE_GENERATION.md` - This file

---

## ✅ Environment Setup

Make sure these are set in your `.env` file:

```bash
# OpenAI (Working ✅)
VITE_OPENAI_API_KEY=sk-proj-...

# Gemini (Quota issue ⚠️)
VITE_GEMINI_API_KEY=AIzaSy...
```

---

## 🎯 Next Steps

1. **Generate icons**: Run the fixed OpenAI script
2. **Monitor Gemini**: Check back in 24 hours for quota reset
3. **Test in app**: Verify `ai-orchestrator.js` works in your application
4. **Consider upgrading**: If you need both APIs for production

---

## 💡 Pro Tips

1. **Use medium quality** for best balance ($0.07/image)
2. **Cache generated images** to avoid regenerating
3. **Add rate limiting** between requests (already in fixed script)
4. **Monitor costs** if generating many images
5. **Set up fallback** logic (Gemini → OpenAI if quota hit)

---

## 📞 Support

If you still have issues:

1. Check **OpenAI Status**: https://status.openai.com/
2. Check **Google AI Status**: https://status.cloud.google.com/
3. Review **detailed report**: `docs/IMAGE_API_FIX_REPORT.md`
4. Run diagnostics: `node scripts/test-openai-connection.js`

---

**Last Updated**: 2025-10-07
**Status**: ✅ All issues resolved - Ready to use
