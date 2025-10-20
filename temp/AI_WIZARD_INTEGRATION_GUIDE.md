# AI Wizard Integration Guide
**Step-by-Step Instructions for Adding AI Wizard to Admin Modules**

## ✅ Files Created (Phase 1 Complete!)

1. **`src/components/admin/AIWizardButton.jsx`** - Main wizard button component ✅
2. **`src/lib/ai-wizard-prompts.js`** - Centralized prompt templates ✅
3. **`netlify/functions/ai-wizard-populate.js`** - OpenAI integration function ✅

---

## 🚀 Quick Integration Example

### Add to LeadMagnetManager.jsx

**Step 1: Import the component**
```jsx
// At top of LeadMagnetManager.jsx
import { AIWizardButton } from '@/components/admin/AIWizardButton'
```

**Step 2: Add to form header**
```jsx
function LeadMagnetForm() {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    tags: [],
    category: '',
    // ... other fields
  })

  const handleAIPopulate = (generatedFields) => {
    setFormData(prev => ({
      ...prev,
      ...generatedFields,
    }))
  }

  return (
    <form>
      {/* Header with AI Wizard */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create Lead Magnet</h2>
        
        <AIWizardButton
          moduleType="lead_magnet"
          currentFields={formData}
          onPopulate={handleAIPopulate}
        />
      </div>

      {/* Your existing form fields */}
      <div className="space-y-4">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Resource Title"
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        />
        
        {/* More fields... */}
      </div>

      <button type="submit">Save Resource</button>
    </form>
  )
}
```

**That's it!** The AI Wizard is now integrated. 🎉

---

## 📋 Integration Checklist

### Prerequisites:
- [ ] OpenAI API key set in `.env`: `VITE_OPENAI_API_KEY=sk-...`
- [ ] Business Brain system operational
- [ ] Netlify dev server running with functions support
- [ ] User has created a Business Brain (stored in localStorage)

### For Each Module:

#### 1. **Lead Magnet Manager** (Priority: HIGH)
```jsx
<AIWizardButton
  moduleType="lead_magnet"
  currentFields={formData}
  onPopulate={(fields) => setFormData({...formData, ...fields})}
/>
```

**Fields Populated:**
- title, subtitle, description
- tags, category, whats_inside
- seo_title, seo_description, seo_keywords

---

#### 2. **Blog Management** (Priority: HIGH)
```jsx
<AIWizardButton
  moduleType="blog_post"
  currentFields={formData}
  onPopulate={(fields) => setFormData({...formData, ...fields})}
/>
```

**Fields Populated:**
- headline, excerpt, meta_description
- tags, primary_keyword, secondary_keywords
- seo_title, category

---

#### 3. **Content Management** (Priority: MEDIUM)
```jsx
<AIWizardButton
  moduleType="content_page"
  currentFields={formData}
  onPopulate={(fields) => setFormData({...formData, ...fields})}
/>
```

**Fields Populated:**
- page_title, meta_description
- og_title, og_description
- heading_suggestions, cta_text

---

#### 4. **Media Library** (Priority: LOW)
```jsx
<AIWizardButton
  moduleType="media"
  currentFields={{ file_name: 'image.jpg', context: 'hero section' }}
  onPopulate={(fields) => setFormData({...formData, ...fields})}
/>
```

**Fields Populated:**
- alt_text, caption
- tags, seo_filename

---

#### 5. **Team Management** (Priority: LOW)
```jsx
<AIWizardButton
  moduleType="team_bio"
  currentFields={{ name: 'John Doe', role: 'CEO' }}
  onPopulate={(fields) => setFormData({...formData, ...fields})}
/>
```

**Fields Populated:**
- bio, expertise_tags
- social_summary

---

## 🎨 UI/UX Best Practices

### Button Placement Options:

**Option 1: Form Header (Recommended)**
```jsx
<div className="flex justify-between items-center mb-6">
  <h2>Create Resource</h2>
  <AIWizardButton {...props} />
</div>
```

**Option 2: Next to Save Button**
```jsx
<div className="flex gap-3">
  <button type="submit">Save</button>
  <AIWizardButton {...props} />
</div>
```

**Option 3: Field-Level Icons**
```jsx
import { AIWizardIconButton } from '@/components/admin/AIWizardButton'

<div className="relative">
  <input {...inputProps} />
  <AIWizardIconButton
    fieldName="title"
    moduleType="lead_magnet"
    currentFields={formData}
    onPopulate={handlePopulate}
    className="absolute right-2 top-2"
  />
</div>
```

---

## 🧪 Testing the Integration

### Test Locally:

1. **Start dev server with functions:**
   ```bash
   npm run dev:netlify
   # or: npm run dev:functions
   ```

2. **Navigate to module:**
   ```
   http://localhost:8888/admin/secret/lead-magnets
   ```

3. **Create new resource:**
   - Enter a topic (e.g., "SEO automation workflows")
   - Click "✨ AI Wizard"
   - Wait 2-5 seconds
   - Review generated content
   - Edit as needed
   - Save

### Expected Behavior:

✅ **Success:**
- Button shows loading state with spinner
- Modal overlay appears with progress bar
- Fields populate after 2-5 seconds
- Toast notification confirms success
- All generated content is editable

❌ **Error Scenarios:**
- No Business Brain → Error message with guidance
- API key invalid → Generic error message
- Rate limit → Retry suggestion
- Network timeout → Retry button

---

## 💰 Cost Monitoring

### Track Usage:

The function logs to console and optionally to database:
```javascript
console.log('AI Wizard Usage:', {
  moduleType: 'lead_magnet',
  tokensUsed: 850,
  costEstimate: '$0.0008',
  fieldsGenerated: 9
})
```

### Optional Database Tracking:

Create table for cost monitoring:
```sql
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_type TEXT NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_estimate DECIMAL(10,4) NOT NULL,
  fields_generated INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Query monthly costs:
```sql
SELECT 
  module_type,
  COUNT(*) as generations,
  SUM(tokens_used) as total_tokens,
  SUM(cost_estimate) as total_cost
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY module_type;
```

---

## 🐛 Troubleshooting

### Issue: "No Business Brain found"

**Solution:**
1. Create a Business Brain in `/admin/secret/business-brain`
2. It auto-saves to localStorage with key `businessBrainId`
3. Or pass explicitly: `<AIWizardButton businessBrainId="uuid" />`

### Issue: "AI Wizard request failed"

**Check:**
1. OpenAI API key is set: `echo $VITE_OPENAI_API_KEY`
2. Netlify functions are running (not just Vite)
3. Network tab shows 200 response from `/.netlify/functions/ai-wizard-populate`

### Issue: Generated content is low quality

**Solutions:**
1. Improve prompts in `src/lib/ai-wizard-prompts.js`
2. Add more Business Brain details (industry, tone, audience)
3. Provide more context in `currentFields` object
4. Try gpt-4o instead of gpt-4o-mini (better quality, higher cost)

### Issue: Slow generation (>10 seconds)

**Optimizations:**
1. Reduce `max_tokens` in function (currently 2000)
2. Simplify prompts (less context = faster)
3. Check OpenAI API status page
4. Consider caching common generations

---

## 📊 Success Metrics

Track these KPIs:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Adoption Rate** | 60%+ of admin users | Track button clicks vs. form submissions |
| **Field Accuracy** | 90%+ correct on first try | User doesn't edit generated content |
| **Time Savings** | 70% reduction | Before/after time to complete forms |
| **Cost Efficiency** | <$0.02 per generation | Monitor OpenAI API costs |
| **User Satisfaction** | 4.5/5 rating | In-app feedback survey |

---

## 🚀 Next Steps

1. **Test in Lead Magnet Manager** ✅
2. **Gather user feedback** on content quality
3. **Refine prompts** based on real usage
4. **Add to Blog Management** module
5. **Monitor costs** in OpenAI dashboard
6. **Optimize prompts** for cost and quality
7. **Add field-level AI icons** for granular control
8. **Implement A/B testing** of different prompts

---

## 📝 Code Reference

**Full implementation:**
- Component: `src/components/admin/AIWizardButton.jsx`
- Prompts: `src/lib/ai-wizard-prompts.js`
- Function: `netlify/functions/ai-wizard-populate.js`
- Strategy: `docs/AI_WIZARD_AUTO_POPULATION_STRATEGY.md`

**Dependencies (already installed):**
- ✅ openai@^5.23.0
- ✅ @supabase/supabase-js
- ✅ sonner (toast notifications)
- ✅ lucide-react (icons)

---

**Status**: Implementation Complete ✅  
**Ready for**: Testing & Integration  
**Est. Time to Integrate**: 15-30 minutes per module

