# AI Wizard Auto-Population Strategy
**Intelligent Field Population for Admin Nexus**

## 🎯 Overview

The **AI Wizard** is an intelligent auto-fill system that uses OpenAI GPT to automatically populate form fields throughout the Admin Nexus with contextually relevant, high-quality content. When a user clicks the "✨ AI Wizard" button, the system analyzes existing content, brand voice (from Business Brain), and best practices to generate appropriate values for empty or incomplete fields.

---

## 🏗️ System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Wizard System                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Frontend   │  │   Backend    │  │   OpenAI     │    │
│  │   Button     │──│   Function   │──│     API      │    │
│  │   Component  │  │   Handler    │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         ▼                  ▼                  ▼            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Context    │  │   Business   │  │   Response   │    │
│  │  Gathering   │  │    Brain     │  │   Parser     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User clicks "✨ AI Wizard"** in any Admin Nexus module
2. **Frontend gathers context**: Existing field values, module type, user intent
3. **Fetch Business Brain data**: Brand voice, tone, key facts
4. **Call Netlify Function**: `/api/ai-wizard-populate`
5. **OpenAI generates content**: Using GPT-4o or GPT-4o-mini
6. **Parse and validate response**: Ensure fields match expected format
7. **Populate form fields**: Update UI with generated content
8. **User reviews and edits**: AI suggestions are editable

---

## 📝 Module-Specific Implementations

### 1. **Lead Magnet Manager** (Priority: HIGH)

**Auto-Populated Fields:**

| Field | AI Generation Strategy | Example Prompt |
|-------|------------------------|----------------|
| `title` | Generate catchy, benefit-focused title | "Create a compelling lead magnet title for a resource about {topic}. Make it specific, benefit-driven, and under 60 characters." |
| `subtitle` | Expand on title with value prop | "Write a 1-sentence subtitle that expands on '{title}' and clearly states the value users will get." |
| `description` | Full paragraph description | "Write a 2-3 paragraph description for a lead magnet titled '{title}'. Explain what it is, who it's for, and why they need it. Use persuasive copy." |
| `tags[]` | Extract relevant keywords | "Generate 5-8 relevant tags for a lead magnet about {title}. Return as comma-separated list." |
| `category` | Classify resource type | "Classify this lead magnet into ONE category: automation, content, seo, analytics, or strategy. Resource: {title}" |
| `whats_inside` | List of bullet points | "Create 5-7 bullet points describing what's inside '{title}'. Each bullet should highlight a specific deliverable or benefit." |
| `seo_title` | SEO-optimized title | "Create an SEO-optimized title (50-60 chars) for '{title}' that includes keywords like {extracted_keywords}" |
| `seo_description` | Meta description | "Write a meta description (150-160 chars) for '{title}' that's compelling and includes relevant keywords." |
| `seo_keywords[]` | Keyword array | "Generate 10 SEO keywords for '{title}'. Mix short-tail and long-tail keywords." |

**Example API Call:**

```javascript
const generateLeadMagnetContent = async (userInput) => {
  const businessBrain = await fetchBusinessBrain()
  
  const prompt = `
You are a marketing expert helping create a lead magnet resource.

Brand Context:
- Business: ${businessBrain.company_name}
- Industry: ${businessBrain.industry}
- Tone: ${businessBrain.brand_voice}

User Input:
- Topic/Idea: ${userInput.topic}
- Resource Type: ${userInput.file_type || 'PDF guide'}

Generate the following in JSON format:
{
  "title": "Catchy title (max 60 chars)",
  "subtitle": "One-sentence value prop",
  "description": "2-3 paragraph description",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "automation|content|seo|analytics|strategy",
  "whats_inside": ["Bullet 1", "Bullet 2", ...],
  "seo_title": "SEO title (50-60 chars)",
  "seo_description": "Meta description (150-160 chars)",
  "seo_keywords": ["keyword1", "keyword2", ...]
}

Make it compelling, actionable, and aligned with the brand voice.
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  return JSON.parse(response.choices[0].message.content)
}
```

---

### 2. **Blog Management** (Priority: HIGH)

**Auto-Populated Fields:**

| Field | AI Generation Strategy |
|-------|------------------------|
| `headline` | SEO-optimized, click-worthy headline |
| `excerpt` | 2-3 sentence summary |
| `meta_description` | 150-160 char SEO description |
| `tags[]` | Topic-relevant tags |
| `primary_keyword` | Main SEO keyword |
| `secondary_keywords[]` | Supporting keywords |
| `seo_title` | Title tag optimized for search |
| `image_alt_text` | Descriptive alt text for featured image |
| `category` | Content categorization |

**Smart Features:**
- **Keyword research integration**: Pull from existing Keyword Research module data
- **Tone matching**: Analyze existing published posts to match writing style
- **Auto-scheduling**: Suggest optimal publish time based on past performance

---

### 3. **Content Management** (Priority: MEDIUM)

**Auto-Populated Fields:**

| Field | AI Generation Strategy |
|-------|------------------------|
| `page_title` | Clear, descriptive title |
| `meta_description` | SEO meta description |
| `og_title` | Social sharing title |
| `og_description` | Social sharing description |
| `heading_suggestions` | H2/H3 outline |
| `cta_text` | Call-to-action copy |

---

### 4. **Media Library** (Priority: LOW)

**Auto-Populated Fields:**

| Field | AI Generation Strategy |
|-------|------------------------|
| `alt_text` | Descriptive alt text from image analysis |
| `caption` | Contextual caption |
| `tags[]` | Visual content tags |
| `seo_filename` | SEO-friendly filename suggestion |

**Note**: Requires vision API for image analysis (GPT-4o with vision)

---

### 5. **Team Management** (Priority: LOW)

**Auto-Populated Fields:**

| Field | AI Generation Strategy |
|-------|------------------------|
| `bio` | Professional bio draft from name + role |
| `expertise_tags[]` | Skill/expertise tags |
| `social_summary` | LinkedIn-style summary |

---

## 🎨 UI/UX Design

### Button Design

```jsx
<button
  onClick={handleAIWizard}
  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-blue-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
>
  <Sparkles size={18} className="animate-pulse" />
  <span>AI Wizard</span>
  {isLoading && <Loader2 size={16} className="animate-spin" />}
</button>
```

### Button Placement

1. **Top-right of forms**: Next to "Save" or "Publish" buttons
2. **Field-level**: Mini wizard icon next to specific fields
3. **Bulk action**: Checkbox + "AI Populate Selected" button

### Loading States

```jsx
{isGenerating && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-slate-900 p-8 rounded-xl border border-blue-500/30 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-blue-400 animate-pulse" size={24} />
        <h3 className="text-lg font-semibold text-white">AI Wizard Working...</h3>
      </div>
      <p className="text-slate-400 mb-4">
        Generating content based on your Business Brain and best practices...
      </p>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
      </div>
    </div>
  </div>
)}
```

---

## ⚙️ Technical Implementation

### Frontend Component

```jsx
// src/components/admin/AIWizardButton.jsx
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AIWizardButton({ 
  moduleType, 
  currentFields, 
  onPopulate 
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAIWizard = async () => {
    try {
      setIsLoading(true)
      
      // Call Netlify function
      const response = await fetch('/.netlify/functions/ai-wizard-populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleType,
          currentFields,
          businessBrainId: localStorage.getItem('businessBrainId'),
        }),
      })

      if (!response.ok) throw new Error('AI Wizard failed')

      const generated = await response.json()
      
      // Populate fields
      onPopulate(generated.fields)
      
      toast.success('✨ Content generated successfully!', {
        description: 'Review and edit the AI-generated content as needed.',
      })
    } catch (error) {
      console.error('AI Wizard error:', error)
      toast.error('AI Wizard failed', {
        description: error.message || 'Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAIWizard}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Sparkles size={18} className="animate-pulse" />
      )}
      <span>{isLoading ? 'Generating...' : 'AI Wizard'}</span>
    </button>
  )
}
```

### Backend Netlify Function

```javascript
// netlify/functions/ai-wizard-populate.js
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { moduleType, currentFields, businessBrainId } = JSON.parse(event.body)

    // Fetch Business Brain for context
    const { data: brain } = await supabase
      .from('business_brains')
      .select('*')
      .eq('id', businessBrainId)
      .single()

    // Generate module-specific prompt
    const prompt = generatePrompt(moduleType, currentFields, brain)

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective for structured output
      messages: [
        {
          role: 'system',
          content: 'You are a marketing expert helping generate high-quality content for a business admin panel. Always respond with valid JSON matching the requested structure.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const generated = JSON.parse(response.choices[0].message.content)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        fields: generated,
        tokensUsed: response.usage.total_tokens,
      }),
    }
  } catch (error) {
    console.error('AI Wizard error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

function generatePrompt(moduleType, currentFields, brain) {
  const prompts = {
    lead_magnet: `
You are creating a lead magnet resource for ${brain.company_name}.

Brand Context:
- Industry: ${brain.industry}
- Tone: ${brain.brand_voice || 'professional and approachable'}
- Target Audience: ${brain.target_audience || 'business owners'}

Current Data:
${JSON.stringify(currentFields, null, 2)}

Generate content for ALL empty fields. Return JSON with this structure:
{
  "title": "Compelling title (max 60 chars)",
  "subtitle": "One sentence value prop",
  "description": "2-3 paragraphs explaining the resource",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "automation|content|seo|analytics|strategy",
  "whats_inside": ["Specific deliverable 1", "Specific deliverable 2", ...],
  "seo_title": "SEO-optimized title (50-60 chars)",
  "seo_description": "Meta description (150-160 chars)",
  "seo_keywords": ["keyword1", "keyword2", ...]
}

Make it actionable and aligned with the brand voice.
`,

    blog_post: `
You are writing blog content for ${brain.company_name}.

Brand Context:
- Industry: ${brain.industry}
- Tone: ${brain.brand_voice || 'professional'}
- Writing Style: ${brain.writing_style || 'informative and engaging'}

Current Data:
${JSON.stringify(currentFields, null, 2)}

Generate content for empty fields. Return JSON:
{
  "headline": "SEO-optimized headline",
  "excerpt": "2-3 sentence summary",
  "meta_description": "SEO meta (150-160 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "primary_keyword": "main keyword",
  "secondary_keywords": ["keyword1", "keyword2"],
  "seo_title": "Title tag (50-60 chars)",
  "category": "news|tutorial|case-study|thought-leadership"
}
`,

    // Add more module types...
  }

  return prompts[moduleType] || prompts.lead_magnet
}
```

---

## 💰 Cost Optimization

### Model Selection Strategy

| Use Case | Model | Cost per 1M Tokens (Input/Output) | When to Use |
|----------|-------|-------------------------------------|-------------|
| **Lead Magnets, Blogs** | `gpt-4o-mini` | $0.15 / $0.60 | Structured content, predictable format |
| **Complex SEO Analysis** | `gpt-4o` | $2.50 / $10.00 | Requires deep analysis, research |
| **Image Alt Text** | `gpt-4o` (vision) | $2.50 / $10.00 | Image understanding needed |
| **Bulk Operations** | `gpt-3.5-turbo` | $0.50 / $1.50 | Cost-sensitive, simple tasks |

### Token Reduction Strategies

1. **Prompt Caching**: Reuse system prompts and brand context
2. **Minimal Context**: Only send necessary field data
3. **Batch Requests**: Process multiple fields in one API call
4. **Response Streaming**: Use streaming for real-time feedback
5. **Fallback to Smaller Models**: Start with gpt-4o-mini, escalate if needed

### Cost Tracking

```javascript
// Add to function
const costEstimate = {
  'gpt-4o-mini': (inputTokens * 0.00000015) + (outputTokens * 0.0000006),
  'gpt-4o': (inputTokens * 0.0000025) + (outputTokens * 0.00001),
}

// Store in telemetry
await supabase.from('ai_usage_logs').insert({
  module_type: moduleType,
  model_used: 'gpt-4o-mini',
  tokens_used: response.usage.total_tokens,
  cost_estimate: costEstimate['gpt-4o-mini'],
  created_at: new Date().toISOString(),
})
```

---

## 🎯 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- ✅ Create `AIWizardButton` component
- ✅ Build `ai-wizard-populate` Netlify function
- ✅ Implement Business Brain context fetching
- ✅ Add OpenAI API integration
- ✅ Set up error handling and loading states

### Phase 2: Lead Magnet Module (Week 1-2)
- ✅ Integrate AI Wizard into `LeadMagnetManager.jsx`
- ✅ Create lead magnet-specific prompts
- ✅ Test with various resource types
- ✅ Add validation and editing workflow

### Phase 3: Blog Module (Week 2-3)
- ✅ Add AI Wizard to `BlogManagement.jsx`
- ✅ Integrate with keyword research data
- ✅ Implement headline variants
- ✅ Add tone/style matching

### Phase 4: Additional Modules (Week 3-4)
- ✅ Content Management integration
- ✅ Media Library (image analysis)
- ✅ Team Management bios
- ✅ Cost tracking dashboard

### Phase 5: Optimization (Ongoing)
- ✅ Prompt refinement based on usage
- ✅ Model selection optimization
- ✅ A/B testing of generated content
- ✅ User feedback collection

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Field Population Rate** | 90%+ fields populated correctly | Track acceptance rate of AI suggestions |
| **Edit Rate** | <30% fields require editing | Measure how often users modify AI content |
| **Time Savings** | 70% reduction in form completion time | Before/after user testing |
| **User Satisfaction** | 4.5/5 rating | In-app feedback surveys |
| **Cost per Generation** | <$0.02 per request | Track OpenAI API costs |

---

## 🔒 Best Practices

### Prompt Engineering

1. **Be Specific**: Clearly define output format and constraints
2. **Use Examples**: Provide good/bad examples in prompts
3. **Context is King**: Always include brand voice and industry context
4. **Constrain Creativity**: Set character limits and format requirements
5. **Iterative Refinement**: Test prompts with real data, refine based on results

### User Experience

1. **Always Editable**: AI suggestions are starting points, not final
2. **Clear Attribution**: Mark AI-generated content clearly
3. **Undo/Redo**: Allow users to revert AI changes
4. **Batch Processing**: Offer "AI Wizard" for individual fields or entire forms
5. **Progressive Disclosure**: Start simple, offer advanced options

### Error Handling

1. **Graceful Degradation**: If API fails, show helpful error message
2. **Retry Logic**: Implement exponential backoff for transient errors
3. **Validation**: Ensure AI output matches expected schema
4. **Fallbacks**: Provide manual input option if AI fails
5. **Logging**: Track errors for debugging and improvement

---

## 🚀 Example Implementations

### Example 1: Lead Magnet Quick Fill

```jsx
// In LeadMagnetManager.jsx
import { AIWizardButton } from '@/components/admin/AIWizardButton'

function LeadMagnetForm() {
  const [formData, setFormData] = useState({})

  const handleAIPopulate = (generatedFields) => {
    setFormData(prev => ({
      ...prev,
      ...generatedFields,
    }))
  }

  return (
    <form>
      <div className="flex justify-between items-center mb-6">
        <h2>Create Lead Magnet</h2>
        <AIWizardButton
          moduleType="lead_magnet"
          currentFields={formData}
          onPopulate={handleAIPopulate}
        />
      </div>
      
      {/* Form fields... */}
    </form>
  )
}
```

### Example 2: Field-Level AI Assist

```jsx
<div className="relative">
  <label>Title</label>
  <input
    type="text"
    value={formData.title}
    onChange={(e) => setFormData({...formData, title: e.target.value})}
  />
  <button
    onClick={() => handleFieldAI('title')}
    className="absolute right-2 top-8 text-blue-500 hover:text-blue-600"
  >
    <Sparkles size={16} />
  </button>
</div>
```

---

## 📚 Additional Resources

- **OpenAI Prompt Engineering Guide**: https://platform.openai.com/docs/guides/prompt-engineering
- **GPT-4o Model Details**: https://platform.openai.com/docs/models/gpt-4o
- **JSON Mode Documentation**: https://platform.openai.com/docs/guides/structured-outputs

---

**Last Updated**: 2025-01-19  
**Author**: Claude Code  
**Status**: Design Phase - Ready for Implementation
