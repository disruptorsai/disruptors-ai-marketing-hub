/**
 * BLOG DRAFT CREATION FUNCTION
 *
 * Creates a blog draft from a content idea:
 * 1. Assembles Universal Context (knowledge, case studies, tools, news)
 * 2. Optionally includes Business Brain context for client-specific branding
 * 3. Uses Claude Sonnet 4.5 to generate comprehensive draft
 * 4. Extracts citations and metadata
 * 5. Generates outline and excerpt
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { ideaId, clientId = null, includeBusinessBrain = true } = JSON.parse(
      event.body
    );

    console.log(`Creating draft for idea ${ideaId}...`);

    // Step 1: Get the content idea
    const idea = await getContentIdea(ideaId);

    // Step 2: Assemble Universal Context
    const context = await assembleContext(idea, clientId, includeBusinessBrain);

    // Step 3: Generate draft with Claude
    const draft = await generateDraftWithClaude(idea, context);

    // Step 4: Generate slug
    const slug = generateSlug(draft.title);

    // Step 5: Create draft record
    const draftRecord = await createDraftRecord({
      idea_id: ideaId,
      title: draft.title,
      slug,
      content: draft.content,
      excerpt: draft.excerpt,
      target_keyword: draft.target_keyword,
      secondary_keywords: draft.secondary_keywords,
      outline: draft.outline,
      business_brain_context: context.businessBrain || {},
      internal_knowledge_refs: context.internalKnowledgeRefs || [],
      case_study_refs: context.caseStudyRefs || [],
      methodology_refs: context.methodologyRefs || [],
      tool_refs: context.toolRefs || [],
      news_refs: context.newsRefs || [],
      author_name: 'Disruptors AI Team',
      citations: draft.citations || [],
      generation_model: 'claude-sonnet-4-20250514',
      generation_params: {
        temperature: 0.7,
        max_tokens: 8000
      },
      pipeline_stage: 'drafting'
    });

    // Step 6: Update idea status
    await supabase
      .from('content_ideas')
      .update({ status: 'in_progress' })
      .eq('id', ideaId);

    console.log(`✅ Draft created: ${draftRecord.id}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        draft: draftRecord
      })
    };
  } catch (error) {
    console.error('Draft creation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

async function getContentIdea(ideaId) {
  const { data, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('id', ideaId)
    .single();

  if (error) throw new Error(`Failed to fetch idea: ${error.message}`);
  return data;
}

async function assembleContext(idea, clientId, includeBusinessBrain) {
  console.log('Assembling Universal Context...');

  const topicText = `${idea.title} ${idea.description}`;
  const embedding = await generateEmbedding(topicText);

  const [
    internalKnowledge,
    caseStudies,
    methodologies,
    tools,
    news,
    businessBrain
  ] = await Promise.all([
    // Internal knowledge
    supabase
      .from('internal_knowledge')
      .select('*')
      .eq('status', 'active')
      .gte('confidence_score', 0.7)
      .order('embedding', { ascending: true })
      .limit(10)
      .then(({ data }) => data || []),

    // Case studies
    supabase
      .from('case_studies')
      .select('*')
      .eq('publishable', true)
      .limit(3)
      .then(({ data }) => data || []),

    // Methodologies
    supabase
      .from('methodologies')
      .select('*')
      .limit(2)
      .then(({ data }) => data || []),

    // Tools
    supabase
      .from('ai_marketing_tools')
      .select('*')
      .order('embedding', { ascending: true })
      .limit(5)
      .then(({ data }) => data || []),

    // News
    supabase
      .from('news_articles')
      .select('*')
      .gte('relevance_score', 0.7)
      .order('published_at', { ascending: false })
      .limit(5)
      .then(({ data }) => data || []),

    // Business Brain (if enabled)
    includeBusinessBrain && clientId
      ? supabase
          .from('business_brain_facts')
          .select('*')
          .eq('client_id', clientId)
          .eq('blog_context_enabled', true)
          .gte('confidence_score', 0.7)
          .limit(10)
          .then(({ data }) => data || [])
      : null
  ]);

  return {
    internalKnowledge,
    internalKnowledgeRefs: internalKnowledge.map(k => k.id),
    caseStudies,
    caseStudyRefs: caseStudies.map(c => c.id),
    methodologies,
    methodologyRefs: methodologies.map(m => m.id),
    tools,
    toolRefs: tools.map(t => t.id),
    news,
    newsRefs: news.map(n => n.id),
    businessBrain
  };
}

async function generateDraftWithClaude(idea, context) {
  console.log('Generating draft with Claude Sonnet 4.5...');

  const contextText = buildContextText(context);

  const prompt = `You are writing a comprehensive, valuable blog post for Disruptors AI's marketing platform. Your goal is to create content that genuinely helps business owners and marketers succeed with AI marketing.

**Article Requirements:**
- Title: ${idea.title}
- Description: ${idea.description}
- Content Type: ${idea.content_type}
- Target Audience: ${idea.target_audience}

**Context & Sources:**
${contextText}

**Google Compliance Requirements:**
1. PEOPLE-FIRST: Write for humans, not search engines
2. ORIGINAL: Provide unique insights, not regurgitated facts
3. VALUABLE: Give actionable advice and real examples
4. CITED: Reference all factual claims with sources
5. EXPERT: Demonstrate experience and expertise
6. TRANSPARENT: We will add AI disclosure automatically

**Content Guidelines:**
- Length: 2000-3000 words (comprehensive, not shallow)
- Structure: Clear headings, short paragraphs, scannable
- Tone: Professional but conversational, helpful not salesy
- Examples: Real use cases from our work (anonymized if needed)
- Citations: Include [source: URL] after factual claims
- Original angle: Unique perspective based on our expertise

**Output Format:**
Return JSON with:
{
  "title": "SEO-optimized title (55-60 chars)",
  "excerpt": "Compelling 150-char summary",
  "target_keyword": "Primary keyword",
  "secondary_keywords": ["keyword1", "keyword2", "keyword3"],
  "outline": [
    {"heading": "H2 heading", "subheadings": ["H3", "H3"]},
    ...
  ],
  "content": "Full article in markdown with H2/H3 headings",
  "citations": [
    {"text": "fact cited", "url": "source URL", "source_name": "Source Name"}
  ]
}

Write the complete article now:`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = response.content[0].text;

  // Extract JSON
  let jsonText = content;
  if (content.includes('```json')) {
    jsonText = content.match(/```json\n([\s\S]*?)\n```/)[1];
  } else if (content.includes('```')) {
    jsonText = content.match(/```\n([\s\S]*?)\n```/)[1];
  }

  const draft = JSON.parse(jsonText);

  console.log(`✅ Generated ${draft.content.length} character draft`);

  return draft;
}

function buildContextText(context) {
  let text = '';

  if (context.internalKnowledge?.length > 0) {
    text += '\n**INTERNAL KNOWLEDGE (Our Expertise):**\n';
    context.internalKnowledge.forEach(k => {
      text += `- [${k.category}] ${k.title}: ${k.content.substring(0, 200)}...\n`;
    });
  }

  if (context.caseStudies?.length > 0) {
    text += '\n**CASE STUDIES (Real Results):**\n';
    context.caseStudies.forEach(c => {
      text += `- ${c.industry}: ${c.challenge}\n  Solution: ${c.solution}\n  Results: ${JSON.stringify(c.results)}\n`;
    });
  }

  if (context.methodologies?.length > 0) {
    text += '\n**METHODOLOGIES (Our Frameworks):**\n';
    context.methodologies.forEach(m => {
      text += `- ${m.name}: ${m.short_description || m.full_description.substring(0, 200)}...\n`;
    });
  }

  if (context.tools?.length > 0) {
    text += '\n**RELEVANT TOOLS:**\n';
    context.tools.forEach(t => {
      text += `- ${t.name} (${t.category}): ${t.description?.substring(0, 150) || 'AI marketing tool'}\n`;
    });
  }

  if (context.news?.length > 0) {
    text += '\n**RECENT NEWS & TRENDS:**\n';
    context.news.forEach(n => {
      text += `- ${n.title} (${new Date(n.published_at).toLocaleDateString()})\n  ${n.summary?.substring(0, 200) || ''}\n`;
    });
  }

  if (context.businessBrain?.length > 0) {
    text += '\n**CLIENT BRAND DNA (Business Brain):**\n';
    context.businessBrain.forEach(f => {
      text += `- ${f.fact_type}: ${f.fact_text}\n`;
    });
  }

  return text;
}

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });

  return response.data[0].embedding;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

async function createDraftRecord(draft) {
  const { data, error } = await supabase
    .from('blog_drafts')
    .insert(draft)
    .select()
    .single();

  if (error) throw new Error(`Failed to create draft: ${error.message}`);

  return data;
}
