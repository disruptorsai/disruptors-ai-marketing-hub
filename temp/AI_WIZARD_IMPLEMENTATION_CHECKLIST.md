# AI Wizard Implementation Checklist

## ✅ Completed This Session

1. ✅ **Lead Magnet System Integration**
   - All files copied and routes updated
   - Database migration SQL ready
   - Pending: Apply migration in Supabase

2. ✅ **AI Wizard Strategy & Design**
   - Comprehensive documentation created
   - Module-by-module field mapping
   - Cost analysis and optimization strategy
   - UI/UX patterns defined (blue/cyan, no purple!)

3. ✅ **Session Documentation**
   - `docs/AI_WIZARD_AUTO_POPULATION_STRATEGY.md`
   - `temp/SESSION_SUMMARY_2025-01-19.md`

---

## 📋 Next Implementation Steps

### Phase 1: Core Infrastructure (Next Session)

**Files to Create:**

1. **`src/components/admin/AIWizardButton.jsx`**
   - Main wizard button component
   - Loading overlay with progress bar
   - Error handling with toast notifications
   - Props: moduleType, currentFields, onPopulate, businessBrainId

2. **`netlify/functions/ai-wizard-populate.js`**
   - OpenAI API integration
   - Business Brain context fetching
   - Module-specific prompt generation
   - JSON response formatting
   - Cost tracking and logging

3. **`src/lib/ai-wizard-prompts.js`**
   - Centralized prompt templates
   - Module-specific prompt functions
   - Brand voice integration
   - Field-specific generation logic

**Integration Points:**

1. **LeadMagnetManager.jsx**
   ```jsx
   import { AIWizardButton } from '@/components/admin/AIWizardButton'
   
   // In form header:
   <AIWizardButton
     moduleType="lead_magnet"
     currentFields={formData}
     onPopulate={(fields) => setFormData({...formData, ...fields})}
   />
   ```

2. **Environment Variables** (add to .env if missing):
   ```bash
   VITE_OPENAI_API_KEY=sk-...
   ```

3. **Database** (for cost tracking):
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

---

## 🎯 Testing Checklist

### Lead Magnet System Testing:
- [ ] Apply database migration in Supabase SQL Editor
- [ ] Run seed script: `node scripts/seed-lead-magnet-resources.js`
- [ ] Test public page: `/free-resources`
  - [ ] Search functionality
  - [ ] Category filtering
  - [ ] Sort options (popular, newest, A-Z)
  - [ ] Resource click tracking
- [ ] Test admin module: `/admin/secret/lead-magnets`
  - [ ] Create new resource
  - [ ] Edit existing resource
  - [ ] Delete resource
  - [ ] View analytics
  - [ ] Toggle featured status

### AI Wizard Testing:
- [ ] Create `AIWizardButton` component
- [ ] Build Netlify function
- [ ] Test with Lead Magnet form
  - [ ] Generate all fields from topic input
  - [ ] Verify Business Brain context is used
  - [ ] Check generated content quality
  - [ ] Confirm fields are editable
- [ ] Monitor costs in OpenAI dashboard
- [ ] Test error scenarios:
  - [ ] No Business Brain set
  - [ ] API rate limit
  - [ ] Invalid response format
  - [ ] Network timeout

---

## 💰 Budget & Resources

**OpenAI API Costs (Estimated):**
- Development/Testing: ~$5-10
- Monthly Production (100 generations): ~$1-5
- Model: gpt-4o-mini ($0.15/$0.60 per 1M tokens)

**Development Time:**
- Phase 1 (Core Infrastructure): 4-6 hours
- Phase 2 (Lead Magnet Integration): 2-3 hours
- Phase 3 (Blog Management): 3-4 hours
- Testing & Refinement: 2-3 hours
- **Total: ~12-16 hours**

---

## 📊 Success Metrics to Track

1. **Adoption Rate**: % of admins using AI Wizard
2. **Field Population Rate**: % of fields correctly populated
3. **Edit Rate**: % of generated content requiring edits
4. **Time Savings**: Before/after form completion time
5. **Cost Efficiency**: Average cost per generation
6. **User Satisfaction**: In-app feedback rating

---

## 🔧 Technical Requirements

**Dependencies** (already installed):
- ✅ openai@^5.23.0
- ✅ @supabase/supabase-js
- ✅ sonner (toast notifications)
- ✅ lucide-react (icons)
- ✅ framer-motion (animations)

**Environment Setup:**
- ✅ Netlify dev server running (http://localhost:8888)
- ✅ Business Brain system operational
- ⏳ OpenAI API key configured
- ⏳ Database migration applied

---

## 📝 Code Templates

### AI Wizard Button Usage:

```jsx
// In any admin form
import { AIWizardButton } from '@/components/admin/AIWizardButton'

function MyAdminForm() {
  const [formData, setFormData] = useState({})

  return (
    <form>
      <div className="flex justify-between mb-6">
        <h2>Create Resource</h2>
        <AIWizardButton
          moduleType="lead_magnet"
          currentFields={formData}
          onPopulate={(generated) => setFormData({...formData, ...generated})}
        />
      </div>
      {/* Form fields */}
    </form>
  )
}
```

### Netlify Function Template:

```javascript
// netlify/functions/ai-wizard-populate.js
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY })
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)

export async function handler(event) {
  const { moduleType, currentFields, businessBrainId } = JSON.parse(event.body)
  
  // Fetch Business Brain
  const { data: brain } = await supabase
    .from('business_brains')
    .select('*')
    .eq('id', businessBrainId)
    .single()

  // Generate content
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: generatePrompt(moduleType, currentFields, brain) }],
    response_format: { type: 'json_object' },
  })

  return {
    statusCode: 200,
    body: JSON.stringify({
      fields: JSON.parse(response.choices[0].message.content),
      tokensUsed: response.usage.total_tokens,
    }),
  }
}
```

---

## 🚀 Quick Start Guide

**To implement AI Wizard in next session:**

1. Create `AIWizardButton.jsx` component (copy from strategy doc)
2. Create `ai-wizard-populate.js` Netlify function
3. Add to `LeadMagnetManager.jsx` form
4. Test with sample data
5. Refine prompts based on output quality
6. Deploy and monitor costs

---

**Status**: Design Phase Complete ✅  
**Next**: Implementation Phase 1  
**Priority**: HIGH (blocks full Lead Magnet UX)

