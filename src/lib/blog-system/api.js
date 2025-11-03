/**
 * BLOG SYSTEM API LAYER
 *
 * Provides a comprehensive API for interacting with the Next-Gen Blog System.
 * Handles Universal Content Mode, content planning, QA pipeline, and publishing.
 */

import { supabase, supabaseAdmin } from '@/lib/supabase-client';

// ============================================================================
// UNIVERSAL CONTENT MODE - INTERNAL KNOWLEDGE
// ============================================================================

export const InternalKnowledge = {
  /**
   * Get internal knowledge relevant to a topic using semantic search
   */
  async getForTopic(topic, options = {}) {
    const {
      maxResults = 10,
      minConfidence = 0.7,
      categories = null,
      status = 'active'
    } = options;

    // Generate embedding for topic
    const embedding = await generateEmbedding(topic);

    let query = supabaseAdmin
      .from('internal_knowledge')
      .select('*')
      .eq('status', status)
      .gte('confidence_score', minConfidence)
      .order('embedding', { ascending: true, nullsFirst: false })
      .limit(maxResults);

    if (categories && categories.length > 0) {
      query = query.in('category', categories);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch internal knowledge: ${error.message}`);

    return data;
  },

  /**
   * Add new internal knowledge entry
   */
  async create(entry) {
    const {
      category,
      title,
      content,
      tags = [],
      source_type = 'manual',
      source_reference = null,
      confidence_score = 1.0,
      metadata = {}
    } = entry;

    // Generate embedding
    const embedding = await generateEmbedding(`${title} ${content}`);

    const { data, error } = await supabaseAdmin
      .from('internal_knowledge')
      .insert({
        category,
        title,
        content,
        tags,
        source_type,
        source_reference,
        confidence_score,
        embedding,
        metadata,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create internal knowledge: ${error.message}`);

    return data;
  },

  /**
   * Search internal knowledge by text (full-text search + semantic)
   */
  async search(searchText, options = {}) {
    const { limit = 20 } = options;

    // Combine full-text and semantic search
    const embedding = await generateEmbedding(searchText);

    const { data, error } = await supabaseAdmin.rpc(
      'search_internal_knowledge',
      {
        search_text: searchText,
        search_embedding: embedding,
        result_limit: limit
      }
    );

    if (error) throw new Error(`Search failed: ${error.message}`);

    return data;
  }
};

// ============================================================================
// CASE STUDIES
// ============================================================================

export const CaseStudies = {
  /**
   * Get publishable case studies relevant to a topic
   */
  async getRelevant(topic, options = {}) {
    const { limit = 5, publishableOnly = true } = options;

    const embedding = await generateEmbedding(topic);

    let query = supabaseAdmin
      .from('case_studies')
      .select('*')
      .order('embedding', { ascending: true })
      .limit(limit);

    if (publishableOnly) {
      query = query.eq('publishable', true);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch case studies: ${error.message}`);

    return data;
  },

  /**
   * Create new case study
   */
  async create(caseStudy) {
    const {
      client_name,
      industry,
      challenge,
      solution,
      results,
      tools_used = [],
      methodology = null,
      timeline_months = null,
      publishable = false,
      anonymized = false,
      anonymized_name = null
    } = caseStudy;

    // Generate embedding from all text content
    const textContent = `${industry} ${challenge} ${solution} ${JSON.stringify(results)}`;
    const embedding = await generateEmbedding(textContent);

    const { data, error } = await supabaseAdmin
      .from('case_studies')
      .insert({
        client_name,
        industry,
        challenge,
        solution,
        results,
        tools_used,
        methodology,
        timeline_months,
        publishable,
        anonymized,
        anonymized_name,
        embedding
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create case study: ${error.message}`);

    return data;
  }
};

// ============================================================================
// METHODOLOGIES
// ============================================================================

export const Methodologies = {
  /**
   * Get all methodologies
   */
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from('methodologies')
      .select('*')
      .order('name');

    if (error) throw new Error(`Failed to fetch methodologies: ${error.message}`);

    return data;
  },

  /**
   * Get methodology by name
   */
  async getByName(name) {
    const { data, error } = await supabaseAdmin
      .from('methodologies')
      .select('*')
      .eq('name', name)
      .single();

    if (error) throw new Error(`Failed to fetch methodology: ${error.message}`);

    return data;
  },

  /**
   * Get relevant methodologies for a topic
   */
  async getRelevant(topic, limit = 3) {
    const embedding = await generateEmbedding(topic);

    const { data, error } = await supabaseAdmin
      .from('methodologies')
      .select('*')
      .order('embedding', { ascending: true })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch methodologies: ${error.message}`);

    return data;
  }
};

// ============================================================================
// AI MARKETING TOOLS
// ============================================================================

export const AITools = {
  /**
   * Get tools by category
   */
  async getByCategory(category, options = {}) {
    const { limit = 50, sortBy = 'our_rating' } = options;

    const { data, error } = await supabaseAdmin
      .from('ai_marketing_tools')
      .select('*')
      .eq('category', category)
      .order(sortBy, { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch tools: ${error.message}`);

    return data;
  },

  /**
   * Get trending tools
   */
  async getTrending(limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('ai_marketing_tools')
      .select('*')
      .order('trend_score', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch trending tools: ${error.message}`);

    return data;
  },

  /**
   * Search tools
   */
  async search(searchText, limit = 20) {
    const { data, error } = await supabaseAdmin
      .from('ai_marketing_tools')
      .select('*')
      .textSearch('search_vector', searchText)
      .limit(limit);

    if (error) throw new Error(`Tool search failed: ${error.message}`);

    return data;
  },

  /**
   * Add new tool
   */
  async create(tool) {
    const embedding = await generateEmbedding(`${tool.name} ${tool.description || ''}`);

    const { data, error } = await supabaseAdmin
      .from('ai_marketing_tools')
      .insert({ ...tool, embedding })
      .select()
      .single();

    if (error) throw new Error(`Failed to create tool: ${error.message}`);

    return data;
  }
};

// ============================================================================
// NEWS & TRENDING TOPICS
// ============================================================================

export const News = {
  /**
   * Get recent relevant news
   */
  async getRecent(options = {}) {
    const { limit = 20, minRelevance = 0.7, topics = null } = options;

    let query = supabaseAdmin
      .from('news_articles')
      .select('*')
      .gte('relevance_score', minRelevance)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (topics && topics.length > 0) {
      query = query.overlaps('topics', topics);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch news: ${error.message}`);

    return data;
  },

  /**
   * Get news relevant to a topic
   */
  async getForTopic(topic, limit = 10) {
    const embedding = await generateEmbedding(topic);

    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .select('*')
      .order('embedding', { ascending: true })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch topic news: ${error.message}`);

    return data;
  }
};

export const Trends = {
  /**
   * Get rising trending topics
   */
  async getRising(limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('trending_topics')
      .select('*')
      .eq('status', 'rising')
      .order('trend_velocity', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch trends: ${error.message}`);

    return data;
  },

  /**
   * Get trending topics by category
   */
  async getByCategory(category, limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('trending_topics')
      .select('*')
      .eq('category', category)
      .in('status', ['rising', 'peak'])
      .order('trend_velocity', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch category trends: ${error.message}`);

    return data;
  }
};

// ============================================================================
// CONTENT IDEAS
// ============================================================================

export const ContentIdeas = {
  /**
   * Generate new content ideas
   */
  async generate(count = 20) {
    // This will be implemented as a serverless function that:
    // 1. Pulls from internal knowledge
    // 2. Analyzes trending topics
    // 3. Discovers new tools
    // 4. Finds gaps in published content
    // 5. Combines sources into ranked ideas

    const { data, error } = await supabaseAdmin.functions.invoke(
      'blog-generate-ideas',
      { body: { count } }
    );

    if (error) throw new Error(`Failed to generate ideas: ${error.message}`);

    return data.ideas;
  },

  /**
   * Get pending ideas sorted by priority
   */
  async getPending(limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('content_ideas')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch ideas: ${error.message}`);

    return data;
  },

  /**
   * Approve an idea and move to drafting
   */
  async approve(ideaId) {
    const { data, error } = await supabaseAdmin
      .from('content_ideas')
      .update({ status: 'approved' })
      .eq('id', ideaId)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve idea: ${error.message}`);

    return data;
  }
};

// ============================================================================
// BLOG DRAFTS
// ============================================================================

export const BlogDrafts = {
  /**
   * Create new draft from content idea
   */
  async createFromIdea(ideaId, options = {}) {
    const { clientId = null, includeBusinessBrain = true } = options;

    // Invoke serverless function to generate draft
    const { data, error } = await supabaseAdmin.functions.invoke(
      'blog-create-draft',
      {
        body: {
          ideaId,
          clientId,
          includeBusinessBrain
        }
      }
    );

    if (error) throw new Error(`Failed to create draft: ${error.message}`);

    return data.draft;
  },

  /**
   * Get draft by ID
   */
  async get(draftId) {
    const { data, error } = await supabaseAdmin
      .from('blog_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (error) throw new Error(`Failed to fetch draft: ${error.message}`);

    return data;
  },

  /**
   * Get drafts by pipeline stage
   */
  async getByStage(stage, limit = 20) {
    const { data, error } = await supabaseAdmin
      .from('blog_drafts')
      .select('*')
      .eq('pipeline_stage', stage)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch drafts: ${error.message}`);

    return data;
  },

  /**
   * Update draft content
   */
  async update(draftId, updates) {
    const { data, error } = await supabaseAdmin
      .from('blog_drafts')
      .update(updates)
      .eq('id', draftId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update draft: ${error.message}`);

    return data;
  },

  /**
   * Run QA pipeline on draft
   */
  async runQA(draftId) {
    // Invoke serverless function to run all QA checks
    const { data, error } = await supabaseAdmin.functions.invoke(
      'blog-run-qa',
      { body: { draftId } }
    );

    if (error) throw new Error(`QA pipeline failed: ${error.message}`);

    return data;
  }
};

// ============================================================================
// PUBLISHING
// ============================================================================

export const Publishing = {
  /**
   * Check if publishing is allowed (rate limiting)
   */
  async checkRateLimit(topicCategory = null) {
    const { data, error } = await supabaseAdmin.rpc(
      'check_publishing_rate_limit',
      {
        target_date: new Date().toISOString().split('T')[0],
        topic_cat: topicCategory
      }
    );

    if (error) throw new Error(`Rate limit check failed: ${error.message}`);

    return data;
  },

  /**
   * Publish a draft (with all safety gates)
   */
  async publishDraft(draftId) {
    // Invoke serverless function that handles:
    // 1. Rate limit check
    // 2. Final QA validation
    // 3. Schema injection
    // 4. AI disclosure
    // 5. Publishing to CMS
    // 6. Tracking record creation

    const { data, error } = await supabaseAdmin.functions.invoke(
      'blog-publish',
      { body: { draftId } }
    );

    if (error) throw new Error(`Publishing failed: ${error.message}`);

    return data;
  },

  /**
   * Get recent published articles
   */
  async getRecent(limit = 20) {
    const { data, error } = await supabaseAdmin
      .from('published_articles')
      .select('*')
      .eq('status', 'live')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch published articles: ${error.message}`);

    return data;
  }
};

// ============================================================================
// MONITORING
// ============================================================================

export const Monitoring = {
  /**
   * Get article performance
   */
  async getPerformance(articleId) {
    const { data, error } = await supabaseAdmin
      .from('article_performance_snapshots')
      .select('*')
      .eq('article_id', articleId)
      .order('snapshot_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch performance: ${error.message}`);

    return data;
  },

  /**
   * Run compliance check on article
   */
  async checkCompliance(articleId) {
    const { data, error } = await supabaseAdmin.functions.invoke(
      'blog-check-compliance',
      { body: { articleId } }
    );

    if (error) throw new Error(`Compliance check failed: ${error.message}`);

    return data;
  }
};

// ============================================================================
// UNIVERSAL CONTEXT ASSEMBLY
// ============================================================================

export const UniversalContext = {
  /**
   * Assemble all relevant context for a topic
   * This is the core function that powers Universal Content Mode
   */
  async assembleForTopic(topic, options = {}) {
    const {
      maxInternalKnowledge = 10,
      maxCaseStudies = 3,
      maxMethodologies = 2,
      maxTools = 5,
      maxNews = 5,
      includeBusinessBrain = false,
      clientId = null
    } = options;

    // Parallel fetch all context sources
    const [
      internalKnowledge,
      caseStudies,
      methodologies,
      tools,
      news,
      trends,
      businessBrainContext
    ] = await Promise.all([
      InternalKnowledge.getForTopic(topic, { maxResults: maxInternalKnowledge }),
      CaseStudies.getRelevant(topic, { limit: maxCaseStudies }),
      Methodologies.getRelevant(topic, maxMethodologies),
      getRelevantTools(topic, maxTools),
      News.getForTopic(topic, maxNews),
      Trends.getRising(5),
      includeBusinessBrain && clientId
        ? getBusinessBrainContext(clientId, topic)
        : null
    ]);

    return {
      topic,
      context: {
        internalKnowledge,
        caseStudies,
        methodologies,
        tools,
        news,
        trends,
        businessBrain: businessBrainContext
      },
      metadata: {
        totalSources: [
          internalKnowledge,
          caseStudies,
          methodologies,
          tools,
          news
        ]
          .flat()
          .filter(Boolean).length,
        hasBusinessBrain: !!businessBrainContext,
        timestamp: new Date().toISOString()
      }
    };
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text) {
  // This will use OpenAI ada-002 via serverless function
  const { data, error } = await supabaseAdmin.functions.invoke('generate-embedding', {
    body: { text }
  });

  if (error) throw new Error(`Embedding generation failed: ${error.message}`);

  return data.embedding;
}

/**
 * Get relevant tools for a topic
 */
async function getRelevantTools(topic, limit = 5) {
  const embedding = await generateEmbedding(topic);

  const { data, error } = await supabaseAdmin
    .from('ai_marketing_tools')
    .select('*')
    .order('embedding', { ascending: true })
    .limit(limit);

  if (error) return [];

  return data;
}

/**
 * Get Business Brain context for client
 */
async function getBusinessBrainContext(clientId, topic) {
  const embedding = await generateEmbedding(topic);

  const { data, error } = await supabaseAdmin
    .from('business_brain_facts')
    .select('*')
    .eq('client_id', clientId)
    .eq('blog_context_enabled', true)
    .gte('confidence_score', 0.7)
    .order('embedding', { ascending: true })
    .limit(10);

  if (error) return null;

  return data;
}

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export const SystemConfig = {
  /**
   * Get system configuration
   */
  async get(key) {
    const { data, error } = await supabaseAdmin
      .from('blog_system_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw new Error(`Config fetch failed: ${error.message}`);

    return data.value;
  },

  /**
   * Update system configuration
   */
  async update(key, value) {
    const { data, error } = await supabaseAdmin
      .from('blog_system_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw new Error(`Config update failed: ${error.message}`);

    return data;
  }
};
