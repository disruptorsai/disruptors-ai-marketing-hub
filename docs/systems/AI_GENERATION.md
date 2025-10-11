# AI Generation Orchestrator

## Overview

Multi-provider AI generation system with intelligent model selection, brand consistency enforcement, and runtime validation against approved models.

## Critical Policy

### DALL-E is ABSOLUTELY FORBIDDEN

**🚫 DALL-E MODELS ARE BANNED:**
- Runtime validation blocks ALL DALL-E models
- Attempts to use DALL-E will throw errors
- Only approved models listed below are permitted
- This policy is enforced at the code level

## Approved Models

### OpenAI

**gpt-image-1 ONLY** (NOT DALL-E):
- Natively multimodal image generation
- Streaming support
- C2PA metadata for authenticity
- Input fidelity control
- Superior quality and consistency

### Google Gemini

**gemini-2.5-flash-image-preview** (Nano Banana):
- Fast image generation
- Image editing capabilities
- Composition and layout control
- SynthID watermarking
- Cost-effective option

### Replicate

**Flux 1.1 Pro**:
- Professional-grade output
- Specialized use cases
- High-quality renders
- Custom model fine-tuning

**SDXL Models**:
- Open-source flexibility
- Community models
- Specialized styles

### Anthropic

**Claude Sonnet 4.5**:
- Text content generation (AutoBlog)
- Writing assistance
- Brand-aware content
- SEO optimization

**Claude Opus 4.1**:
- Advanced reasoning
- Complex content
- Strategic planning

## AI Orchestrator

### File: `src/lib/ai-orchestrator.js`

Centralized AI generation system with intelligent provider selection.

### Features

- **Model Validation** - Hard-pinned approved model list
- **Intelligent Selection** - Context-aware model selection based on:
  - Quality requirements
  - Budget constraints
  - Specialization needs
  - Performance requirements
- **Brand Consistency** - Automatic brand guideline enforcement
- **Error Handling** - Graceful fallback mechanisms
- **Rate Limiting** - Prevents API quota exhaustion
- **Caching** - Reduces redundant API calls

### Model Selection Logic

```javascript
// Context-aware selection
function selectModel(context) {
  if (context.requiresQuality) {
    return 'gpt-image-1' // OpenAI for highest quality
  }

  if (context.requiresSpeed) {
    return 'gemini-2.5-flash-image-preview' // Gemini for speed
  }

  if (context.requiresSpecialization) {
    return 'flux-1.1-pro' // Replicate for specialized needs
  }

  // Default to balanced option
  return 'gpt-image-1'
}
```

### Brand Consistency

```javascript
// Automatic brand guideline enforcement
async function generateWithBrand(prompt, brainId) {
  // Load Business Brain
  const brain = await BrainAPI.getBrainById(brainId)

  // Inject brand context
  const enhancedPrompt = `
    Brand Colors: ${brain.brand_colors.primary}, ${brain.brand_colors.secondary}
    Brand Voice: ${brain.brand_voice}
    Style: ${brain.design_style}

    ${prompt}
  `

  // Generate with brand context
  return await generateImage(enhancedPrompt, selectedModel)
}
```

## AutoBlog System

### File: `src/lib/anthropic-blog-writer.js`

AI-powered content generation using Claude Sonnet 4.5.

### Features

- **SEO-Optimized Articles** - 1,200+ word articles
- **System Prompt Engineering** - Answer Boxes, FAQs, schema hints
- **Brand Voice** - Disruptors & Co tone: bold, contrarian, no-fluff
- **Keyword Optimization** - Primary/secondary keyword targeting
- **Batch Processing** - Multiple articles with rate limiting
- **Smart Filtering** - Only generates for posts without content (<200 chars)

### Usage

```javascript
import { generateBlogPost } from '@/lib/anthropic-blog-writer'

const article = await generateBlogPost({
  title: 'How AI is Transforming Skilled Trades',
  primary_keyword: 'AI for contractors',
  secondary_keywords: ['automation', 'efficiency', 'ROI'],
  tone: 'professional',
  word_count: 1500
})

// Returns:
{
  content: '# How AI is Transforming...',
  meta_description: '...',
  schema_hints: { ... },
  word_count: 1523
}
```

See `docs/AUTOBLOG_SYSTEM.md` for complete documentation.

## Image Generation

### File: `src/lib/ai-orchestrator.js`

Multi-provider image generation with model validation.

### Approved Models Only

```javascript
const APPROVED_MODELS = {
  openai: ['gpt-image-1'],
  google: ['gemini-2.5-flash-image-preview'],
  replicate: ['flux-1.1-pro', 'stable-diffusion-xl']
}

// Runtime validation
function validateModel(provider, model) {
  if (!APPROVED_MODELS[provider].includes(model)) {
    throw new Error(`Model ${model} is not approved. Use only approved models.`)
  }
}
```

### Generation Workflow

```javascript
import { generateImage } from '@/lib/ai-orchestrator'

const image = await generateImage({
  prompt: 'Simple flat vector icon: wrench, 2px black stroke',
  model: 'gpt-image-1', // OpenAI
  size: '1024x1024',
  quality: 'high',
  brand_context: brainId // Optional: inject brand colors/style
})

// Returns:
{
  url: 'https://...',
  width: 1024,
  height: 1024,
  format: 'png',
  metadata: { ... }
}
```

## Provider Configuration

### OpenAI

```javascript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})

// Image generation (gpt-image-1 ONLY)
const response = await openai.images.generate({
  model: 'gpt-image-1',
  prompt: prompt,
  size: '1024x1024',
  quality: 'high'
})
```

### Google Gemini

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
)

// Image generation (Nano Banana)
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-image-preview'
})

const result = await model.generateContent(prompt)
```

### Replicate

```javascript
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_TOKEN
})

// Flux 1.1 Pro
const output = await replicate.run(
  'black-forest-labs/flux-1.1-pro',
  { input: { prompt } }
)
```

### Anthropic

```javascript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY
})

// Text generation (Claude Sonnet 4.5)
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4.5-20250929',
  max_tokens: 4096,
  messages: [{ role: 'user', content: prompt }]
})
```

## Environment Variables

```bash
# Required
VITE_ANTHROPIC_API_KEY=your_anthropic_key    # Claude (AutoBlog, Brain)
VITE_OPENAI_API_KEY=your_openai_key          # gpt-image-1 ONLY
VITE_GEMINI_API_KEY=your_gemini_key          # Gemini image generation

# Optional
VITE_REPLICATE_API_TOKEN=your_replicate_token
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
```

## Usage Examples

### Blog Post Generation

```javascript
import { generateBlogPost } from '@/lib/anthropic-blog-writer'

const post = await generateBlogPost({
  title: 'Top 10 HVAC Maintenance Tips',
  primary_keyword: 'HVAC maintenance',
  secondary_keywords: ['air conditioning', 'furnace', 'filter'],
  brain_id: userBrainId, // Brand-aware content
  word_count: 1500
})
```

### Service Icon Generation

```javascript
import { generateImage } from '@/lib/ai-orchestrator'

const icon = await generateImage({
  prompt: 'Simple flat vector icon: hammer and wrench crossed, 2px black stroke, minimal geometric design, #2C6BAA accent color, white background',
  model: 'flux-1.1-pro',
  size: '1024x1024',
  style: 'ANACHRON_LITE' // Applies ANACHRON Lite style guide
})
```

### Brand-Aware Content

```javascript
import { generateWithBrand } from '@/lib/ai-orchestrator'

const content = await generateWithBrand({
  content_type: 'social_post',
  topic: 'Summer HVAC special offer',
  brain_id: userBrainId,
  platform: 'instagram'
})

// Automatically applies:
// - Brand colors
// - Brand voice
// - Design style
// - Tone attributes
```

## Rate Limiting

```javascript
// Automatic rate limiting
const RATE_LIMITS = {
  'gpt-image-1': { requests: 50, per: 'minute' },
  'gemini-2.5-flash-image-preview': { requests: 100, per: 'minute' },
  'claude-sonnet-4.5': { requests: 50, per: 'minute' }
}

// Queue requests if limit reached
if (isRateLimited(model)) {
  await queueRequest(model, request)
}
```

## Error Handling

```javascript
try {
  const result = await generateImage(prompt, model)
  return result
} catch (error) {
  // Log error
  console.error('AI Generation Error:', error)

  // Attempt fallback
  if (canFallback(model)) {
    return await generateImage(prompt, getFallbackModel(model))
  }

  // Return error
  throw new Error('AI generation failed: ' + error.message)
}
```

## Best Practices

1. **Always validate models** - Use only approved models
2. **Include brand context** - Pass brain_id when available
3. **Handle errors gracefully** - Implement fallback mechanisms
4. **Respect rate limits** - Queue requests when needed
5. **Cache results** - Avoid redundant API calls
6. **Monitor costs** - Track token usage and API calls
7. **Test locally first** - Verify prompts before production

## Related Documentation

- `docs/AUTOBLOG_SYSTEM.md` - AutoBlog system details
- `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md` - Brand consistency
- `docs/systems/ANACHRON_LITE.md` - Icon generation system
- `docs/AI_GENERATION_SETUP_GUIDE.md` - Setup and configuration
- `docs/NO_DALLE3_POLICY.md` - DALL-E prohibition policy
