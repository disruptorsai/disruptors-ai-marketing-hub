/**
 * AI Wizard Prompt Templates
 *
 * Centralized prompt generation for different Admin Nexus modules.
 * Each module has specific field requirements and output formats.
 */

/**
 * Generate prompt for Lead Magnet Manager
 */
export function generateLeadMagnetPrompt(currentFields, businessBrain) {
  const topic = currentFields.topic || currentFields.title || 'marketing resource'

  return `You are a marketing expert creating a lead magnet resource for ${businessBrain.company_name || 'a business'}.

**Brand Context:**
- Industry: ${businessBrain.industry || 'general business'}
- Tone: ${businessBrain.brand_voice || 'professional and approachable'}
- Target Audience: ${businessBrain.target_audience || 'business owners and marketers'}

**Current Input:**
Topic/Idea: ${topic}
Resource Type: ${currentFields.file_type || 'PDF guide'}

**Task:** Generate compelling content for ALL empty fields in JSON format.

**Required JSON Structure:**
{
  "title": "Catchy, benefit-focused title (max 60 characters)",
  "subtitle": "One-sentence value proposition that expands on the title",
  "description": "2-3 persuasive paragraphs explaining what the resource is, who it's for, and why they need it",
  "tags": ["relevant", "keyword", "tags", "5-8 total"],
  "category": "ONE of: automation, content, seo, analytics, or strategy",
  "whats_inside": [
    "Specific deliverable or benefit 1",
    "Specific deliverable or benefit 2",
    "Specific deliverable or benefit 3",
    "Specific deliverable or benefit 4",
    "Specific deliverable or benefit 5"
  ],
  "seo_title": "SEO-optimized title with keywords (50-60 characters)",
  "seo_description": "Compelling meta description with keywords (150-160 characters)",
  "seo_keywords": ["primary keyword", "secondary keyword 1", "secondary keyword 2", "long-tail keyword 1", "long-tail keyword 2"]
}

**Guidelines:**
- Make it actionable and results-oriented
- Use the brand voice: ${businessBrain.brand_voice || 'professional'}
- Focus on benefits, not just features
- Include specific, measurable outcomes
- Make the title compelling enough to drive downloads
- Ensure SEO fields are optimized for search

Return ONLY valid JSON matching the exact structure above.`
}

/**
 * Generate prompt for Blog Management
 */
export function generateBlogPostPrompt(currentFields, businessBrain) {
  const topic = currentFields.topic || currentFields.headline || 'blog post'

  return `You are a content strategist creating blog post metadata for ${businessBrain.company_name || 'a business'}.

**Brand Context:**
- Industry: ${businessBrain.industry || 'general business'}
- Tone: ${businessBrain.brand_voice || 'professional'}
- Writing Style: ${businessBrain.writing_style || 'informative and engaging'}

**Current Input:**
Topic: ${topic}
${currentFields.primary_keyword ? `Target Keyword: ${currentFields.primary_keyword}` : ''}

**Required JSON Structure:**
{
  "headline": "SEO-optimized, compelling headline that drives clicks",
  "excerpt": "2-3 sentence summary that hooks the reader",
  "meta_description": "SEO meta description (150-160 characters)",
  "tags": ["relevant", "blog", "tags"],
  "primary_keyword": "main SEO keyword for this post",
  "secondary_keywords": ["supporting keyword 1", "supporting keyword 2", "supporting keyword 3"],
  "seo_title": "Title tag optimized for search (50-60 characters)",
  "category": "ONE of: news, tutorial, case-study, or thought-leadership"
}

**Guidelines:**
- Headlines should be specific and benefit-driven
- Include numbers or power words when appropriate
- Match the brand's tone: ${businessBrain.brand_voice || 'professional'}
- Optimize for both SEO and human readers
- Keywords should be relevant to ${businessBrain.industry || 'the industry'}

Return ONLY valid JSON.`
}

/**
 * Generate prompt for Content Management (pages/landing pages)
 */
export function generateContentPagePrompt(currentFields, businessBrain) {
  const pageName = currentFields.page_name || currentFields.title || 'page'

  return `You are creating SEO and social media metadata for a webpage.

**Brand Context:**
- Business: ${businessBrain.company_name || 'Company'}
- Industry: ${businessBrain.industry || 'general'}
- Tone: ${businessBrain.brand_voice || 'professional'}

**Current Input:**
Page Name: ${pageName}
${currentFields.page_type ? `Page Type: ${currentFields.page_type}` : ''}

**Required JSON Structure:**
{
  "page_title": "Clear, descriptive page title",
  "meta_description": "SEO meta description (150-160 characters)",
  "og_title": "Optimized title for social sharing (max 60 chars)",
  "og_description": "Social sharing description (max 200 chars)",
  "heading_suggestions": ["Main H2 heading", "Supporting H2 heading", "Another H2 heading"],
  "cta_text": "Compelling call-to-action button text"
}

**Guidelines:**
- Page titles should be clear and keyword-rich
- Social sharing content should be engaging
- CTAs should be action-oriented and benefit-focused
- Match brand voice: ${businessBrain.brand_voice || 'professional'}

Return ONLY valid JSON.`
}

/**
 * Generate prompt for Media Library (alt text and captions)
 */
export function generateMediaMetadataPrompt(currentFields, businessBrain) {
  const fileName = currentFields.file_name || 'image'
  const context = currentFields.context || 'website image'

  return `You are creating accessibility and SEO metadata for an image.

**Brand Context:**
- Business: ${businessBrain.company_name || 'Company'}
- Industry: ${businessBrain.industry || 'general'}

**Current Input:**
File Name: ${fileName}
Context: ${context}

**Required JSON Structure:**
{
  "alt_text": "Descriptive alt text for accessibility (describe what's in the image)",
  "caption": "Brief, engaging caption for the image",
  "tags": ["relevant", "image", "tags"],
  "seo_filename": "seo-friendly-filename-suggestion"
}

**Guidelines:**
- Alt text should be descriptive but concise
- Captions should add context or value
- SEO filename should use hyphens and be keyword-rich
- Tags should help with organization and discovery

Return ONLY valid JSON.`
}

/**
 * Generate prompt for Team Management (bios)
 */
export function generateTeamBioPrompt(currentFields, businessBrain) {
  const name = currentFields.name || 'Team Member'
  const role = currentFields.role || 'Team Member'

  return `You are creating professional bio content for a team member.

**Brand Context:**
- Business: ${businessBrain.company_name || 'Company'}
- Industry: ${businessBrain.industry || 'general'}
- Tone: ${businessBrain.brand_voice || 'professional'}

**Current Input:**
Name: ${name}
Role: ${role}
${currentFields.expertise ? `Expertise: ${currentFields.expertise}` : ''}

**Required JSON Structure:**
{
  "bio": "2-3 sentence professional bio highlighting expertise and value",
  "expertise_tags": ["skill 1", "skill 2", "skill 3", "skill 4"],
  "social_summary": "LinkedIn-style one-sentence summary"
}

**Guidelines:**
- Bio should be professional yet personable
- Highlight relevant expertise for ${businessBrain.industry || 'the industry'}
- Match brand tone: ${businessBrain.brand_voice || 'professional'}
- Focus on value and credentials

Return ONLY valid JSON.`
}

/**
 * Main prompt router - selects appropriate prompt based on module type
 */
export function generatePrompt(moduleType, currentFields, businessBrain) {
  const promptGenerators = {
    lead_magnet: generateLeadMagnetPrompt,
    blog_post: generateBlogPostPrompt,
    content_page: generateContentPagePrompt,
    media: generateMediaMetadataPrompt,
    team_bio: generateTeamBioPrompt,
  }

  const generator = promptGenerators[moduleType]

  if (!generator) {
    throw new Error(`Unknown module type: ${moduleType}`)
  }

  return generator(currentFields, businessBrain)
}

/**
 * Validate AI-generated response matches expected schema
 */
export function validateResponse(moduleType, response) {
  const schemas = {
    lead_magnet: ['title', 'subtitle', 'description', 'tags', 'category', 'whats_inside', 'seo_title', 'seo_description', 'seo_keywords'],
    blog_post: ['headline', 'excerpt', 'meta_description', 'tags', 'primary_keyword', 'secondary_keywords', 'seo_title', 'category'],
    content_page: ['page_title', 'meta_description', 'og_title', 'og_description', 'heading_suggestions', 'cta_text'],
    media: ['alt_text', 'caption', 'tags', 'seo_filename'],
    team_bio: ['bio', 'expertise_tags', 'social_summary'],
  }

  const requiredFields = schemas[moduleType]

  if (!requiredFields) {
    return { valid: true, missingFields: [] }
  }

  const missingFields = requiredFields.filter(field => !(field in response))

  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

export default {
  generatePrompt,
  validateResponse,
  generateLeadMagnetPrompt,
  generateBlogPostPrompt,
  generateContentPagePrompt,
  generateMediaMetadataPrompt,
  generateTeamBioPrompt,
}
