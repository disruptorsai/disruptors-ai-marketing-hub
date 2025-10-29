/**
 * BLOG IDEA GENERATION FUNCTION
 *
 * Generates content ideas by combining multiple sources:
 * - Internal knowledge (current work, roadmap)
 * - Trending topics
 * - New tools discovered
 * - Recent news
 * - Case studies
 * - Content gaps in existing articles
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { count = 20 } = JSON.parse(event.body);

    console.log(`Generating ${count} content ideas...`);

    // Step 1: Gather source materials
    const sources = await gatherSources();

    // Step 2: Use Claude to generate ideas
    const ideas = await generateIdeasWithClaude(sources, count);

    // Step 3: Enrich ideas with SEO data
    const enrichedIdeas = await enrichIdeas(ideas);

    // Step 4: Insert into database
    const insertedIdeas = await bulkInsertIdeas(enrichedIdeas);

    console.log(`✅ Generated and saved ${insertedIdeas.length} content ideas`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        ideas: insertedIdeas,
        count: insertedIdeas.length
      })
    };
  } catch (error) {
    console.error('Idea generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

/**
 * Gather all source materials for idea generation
 */
async function gatherSources() {
  console.log('Gathering source materials...');

  const [
    internalKnowledge,
    trendingTopics,
    recentNews,
    newTools,
    caseStudies,
    existingArticles
  ] = await Promise.all([
    // Recent internal knowledge
    supabase
      .from('internal_knowledge')
      .select('category, title, content')
      .eq('status', 'active')
      .order('last_updated', { ascending: false })
      .limit(20)
      .then(({ data }) => data || []),

    // Trending topics
    supabase
      .from('trending_topics')
      .select('topic, category, trend_velocity')
      .in('status', ['rising', 'peak'])
      .order('trend_velocity', { ascending: false })
      .limit(10)
      .then(({ data }) => data || []),

    // Recent news
    supabase
      .from('news_articles')
      .select('title, summary, topics')
      .gte('relevance_score', 0.7)
      .order('published_at', { ascending: false })
      .limit(15)
      .then(({ data }) => data || []),

    // Recently discovered tools
    supabase
      .from('ai_marketing_tools')
      .select('name, category, description')
      .order('discovered_at', { ascending: false })
      .limit(10)
      .then(({ data }) => data || []),

    // Publishable case studies
    supabase
      .from('case_studies')
      .select('industry, challenge, solution')
      .eq('publishable', true)
      .limit(5)
      .then(({ data }) => data || []),

    // Existing published articles (to avoid duplicates)
    supabase
      .from('published_articles')
      .select('title, target_keyword, secondary_keywords')
      .eq('status', 'live')
      .order('published_at', { ascending: false })
      .limit(50)
      .then(({ data }) => data || [])
  ]);

  return {
    internalKnowledge,
    trendingTopics,
    recentNews,
    newTools,
    caseStudies,
    existingArticles
  };
}

/**
 * Use Claude to generate creative content ideas
 */
async function generateIdeasWithClaude(sources, count) {
  console.log('Generating ideas with Claude Sonnet 4.5...');

  const prompt = `You are a content strategist for Disruptors AI, an AI-powered marketing platform. Generate ${count} unique, valuable blog post ideas that:

1. Target business owners and marketers interested in AI marketing
2. Provide genuine value (how-to guides, tutorials, tool reviews, trend analysis)
3. Are based on our current work, expertise, and industry knowledge
4. Avoid duplicating existing content
5. Have strong SEO potential

**Available Source Materials:**

INTERNAL KNOWLEDGE (current work & expertise):
${sources.internalKnowledge.map(k => `- [${k.category}] ${k.title}`).join('\n')}

TRENDING TOPICS:
${sources.trendingTopics.map(t => `- ${t.topic} (${t.category}) - velocity: ${t.trend_velocity}`).join('\n')}

RECENT NEWS:
${sources.recentNews.map(n => `- ${n.title}`).join('\n')}

NEW TOOLS DISCOVERED:
${sources.newTools.map(t => `- ${t.name} (${t.category})`).join('\n')}

CASE STUDIES AVAILABLE:
${sources.caseStudies.map(c => `- ${c.industry}: ${c.challenge}`).join('\n')}

EXISTING ARTICLES (avoid duplicates):
${sources.existingArticles.map(a => `- ${a.title}`).join('\n')}

For each idea, provide:
1. Title (compelling, SEO-friendly, under 60 chars)
2. Description (2-3 sentences explaining value)
3. Content type (how-to | guide | news | opinion | case-study | tool-review | comparison | tutorial | trend-analysis)
4. Target audience (business-owner | marketing-manager | startup-founder | agency-owner | general)
5. Source type (internal_work | trending_topic | news_event | tool_discovery | case_study | methodology)
6. Source references (which specific sources from above)
7. Priority score (0-100, based on timeliness + value + SEO potential)
8. Target keyword (primary keyword to rank for)
9. Secondary keywords (2-3 related keywords)

Return as JSON array with these fields for each idea.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    temperature: 0.8, // Higher creativity for idea generation
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const content = response.content[0].text;

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = content;
  if (content.includes('```json')) {
    jsonText = content.match(/```json\n([\s\S]*?)\n```/)[1];
  } else if (content.includes('```')) {
    jsonText = content.match(/```\n([\s\S]*?)\n```/)[1];
  }

  const ideas = JSON.parse(jsonText);

  console.log(`✅ Generated ${ideas.length} ideas`);

  return ideas;
}

/**
 * Enrich ideas with SEO data (search volume, keyword difficulty)
 */
async function enrichIdeas(ideas) {
  console.log('Enriching ideas with SEO data...');

  // In production, this would call DataForSEO API for each keyword
  // For now, we'll simulate with reasonable estimates

  return ideas.map(idea => ({
    ...idea,
    estimated_traffic: Math.floor(Math.random() * 5000) + 100,
    keyword_difficulty: Math.floor(Math.random() * 100),
    search_volume: Math.floor(Math.random() * 10000) + 50
  }));
}

/**
 * Bulk insert ideas into database
 */
async function bulkInsertIdeas(ideas) {
  console.log('Inserting ideas into database...');

  const records = ideas.map(idea => ({
    title: idea.title,
    description: idea.description,
    target_audience: idea.target_audience || 'general',
    content_type: idea.content_type,
    source_type: idea.source_type,
    source_references: idea.source_references || [],
    priority: idea.priority || 50,
    estimated_traffic: idea.estimated_traffic || 0,
    keyword_difficulty: idea.keyword_difficulty || 50,
    search_volume: idea.search_volume || 0,
    status: 'pending',
    metadata: {
      target_keyword: idea.target_keyword,
      secondary_keywords: idea.secondary_keywords || [],
      generated_at: new Date().toISOString(),
      ai_model: 'claude-sonnet-4-20250514'
    }
  }));

  const { data, error } = await supabase
    .from('content_ideas')
    .insert(records)
    .select();

  if (error) {
    throw new Error(`Failed to insert ideas: ${error.message}`);
  }

  return data;
}
