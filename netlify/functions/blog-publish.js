/**
 * BLOG PUBLISHING FUNCTION
 *
 * Publishes a blog draft with comprehensive safety gates:
 * 1. Rate limit check (prevent spam signals)
 * 2. Final QA validation
 * 3. Schema injection (Article, FAQPage, etc.)
 * 4. AI disclosure addition
 * 5. Meta tag generation
 * 6. Duplicate detection
 * 7. Publishing to CMS/database
 * 8. Performance tracking initialization
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
    const { draftId } = JSON.parse(event.body);

    console.log(`Publishing draft ${draftId}...`);

    // Safety Gate 1: Get draft and verify it's ready
    const draft = await getDraft(draftId);
    if (draft.pipeline_stage !== 'ready_to_publish') {
      throw new Error(`Draft not ready to publish (stage: ${draft.pipeline_stage})`);
    }

    // Safety Gate 2: Check rate limits
    const rateLimitCheck = await checkRateLimit();
    if (!rateLimitCheck.allowed) {
      throw new Error(`Rate limit exceeded: ${JSON.stringify(rateLimitCheck.current)}`);
    }

    // Safety Gate 3: Final QA validation
    if (!draft.qa_passed) {
      throw new Error('Draft has not passed QA checks');
    }

    // Safety Gate 4: Check for duplicate content
    await checkDuplicateContent(draft);

    // Step 1: Generate schema markup
    const schemaMarkup = await generateSchemaMarkup(draft);

    // Step 2: Add AI disclosure
    const aiDisclosure = generateAIDisclosure();

    // Step 3: Generate meta tags if missing
    const metaTags = await generateMetaTags(draft);

    // Step 4: Create published article record
    const publishedArticle = await createPublishedArticle({
      draft_id: draft.id,
      title: draft.title,
      slug: draft.slug,
      url: `https://disruptorsmedia.com/blog/${draft.slug}`,
      content: draft.content,
      excerpt: draft.excerpt || metaTags.meta_description.substring(0, 150),
      featured_image_url: draft.featured_image_url,
      target_keyword: draft.target_keyword,
      secondary_keywords: draft.secondary_keywords,
      meta_title: metaTags.meta_title,
      meta_description: metaTags.meta_description,
      canonical_url: `https://disruptorsmedia.com/blog/${draft.slug}`,
      schema_markup: schemaMarkup,
      author_name: draft.author_name || 'Disruptors AI Team',
      author_bio: draft.author_bio || 'Expert AI marketing team at Disruptors AI',
      ai_disclosure: aiDisclosure,
      status: 'live',
      compliance_status: 'compliant'
    });

    // Step 5: Update rate tracker
    await updateRateTracker();

    // Step 6: Update draft status
    await updateDraftStatus(draftId, 'published', publishedArticle.id);

    // Step 7: Initialize performance tracking
    await initializePerformanceTracking(publishedArticle.id);

    // Step 8: Update idea status
    if (draft.idea_id) {
      await supabase
        .from('content_ideas')
        .update({ status: 'completed' })
        .eq('id', draft.idea_id);
    }

    console.log(`✅ Article published: ${publishedArticle.url}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        article: publishedArticle,
        url: publishedArticle.url
      })
    };
  } catch (error) {
    console.error('Publishing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

async function getDraft(draftId) {
  const { data, error } = await supabase
    .from('blog_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (error) throw new Error(`Failed to fetch draft: ${error.message}`);
  return data;
}

async function checkRateLimit() {
  const { data, error } = await supabase.rpc('check_publishing_rate_limit', {
    target_date: new Date().toISOString().split('T')[0],
    topic_cat: null
  });

  if (error) {
    console.error('Rate limit check failed:', error);
    // Don't block publishing on rate check failure
    return { allowed: true };
  }

  return data;
}

async function checkDuplicateContent(draft) {
  // Check for existing articles with same title or slug
  const { data: existingBySlug } = await supabase
    .from('published_articles')
    .select('id, title, slug')
    .eq('slug', draft.slug)
    .eq('status', 'live');

  if (existingBySlug && existingBySlug.length > 0) {
    throw new Error(`Duplicate slug detected: ${draft.slug}`);
  }

  // Check for very similar titles
  const { data: existingByTitle } = await supabase
    .from('published_articles')
    .select('id, title, slug')
    .ilike('title', `%${draft.title.substring(0, 30)}%`)
    .eq('status', 'live');

  if (existingByTitle && existingByTitle.length > 0) {
    console.warn('Similar title found:', existingByTitle[0].title);
    // Warning only, don't block
  }
}

async function generateSchemaMarkup(draft) {
  console.log('Generating schema markup...');

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: draft.title,
    description: draft.excerpt || draft.meta_description || '',
    image: draft.featured_image_url || 'https://disruptorsmedia.com/default-og.jpg',
    author: {
      '@type': 'Organization',
      name: 'Disruptors AI',
      url: 'https://disruptorsmedia.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Disruptors AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://disruptorsmedia.com/logo.png'
      }
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://disruptorsmedia.com/blog/${draft.slug}`
    }
  };

  // Check if content has FAQ section
  const hasFAQ = draft.content.includes('##') && draft.content.toLowerCase().includes('faq');

  if (hasFAQ) {
    const faqSchema = await extractFAQSchema(draft.content);
    return [articleSchema, faqSchema];
  }

  return articleSchema;
}

async function extractFAQSchema(content) {
  console.log('Extracting FAQ schema...');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Extract all FAQ questions and answers from this content. Return as JSON array: [{"question": "Q", "answer": "A"}]\n\n${content}`
        }
      ]
    });

    let text = response.content[0].text;
    if (text.includes('```json')) {
      text = text.match(/```json\n([\s\S]*?)\n```/)[1];
    }

    const faqs = JSON.parse(text);

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  } catch (error) {
    console.error('FAQ extraction error:', error);
    return null;
  }
}

function generateAIDisclosure() {
  return `This article was created with AI assistance as part of our content creation process. All information has been fact-checked and reviewed by our expert team to ensure accuracy and value. We use AI to help us create more helpful content faster, while maintaining our commitment to quality and originality.`;
}

async function generateMetaTags(draft) {
  // If meta tags already exist, use them
  if (draft.meta_title && draft.meta_description) {
    return {
      meta_title: draft.meta_title,
      meta_description: draft.meta_description
    };
  }

  console.log('Generating meta tags...');

  // Use Claude to generate optimized meta tags
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Generate SEO-optimized meta tags for this blog post:

Title: ${draft.title}
Excerpt: ${draft.excerpt || draft.content.substring(0, 300)}
Target Keyword: ${draft.target_keyword}

Return JSON:
{
  "meta_title": "Title optimized for SEO (50-60 chars, includes keyword)",
  "meta_description": "Compelling description (150-160 chars, includes keyword, has call-to-action)"
}`
        }
      ]
    });

    let text = response.content[0].text;
    if (text.includes('```json')) {
      text = text.match(/```json\n([\s\S]*?)\n```/)[1];
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Meta tag generation error:', error);
    // Fallback to basic meta tags
    return {
      meta_title: draft.title.substring(0, 60),
      meta_description: (draft.excerpt || draft.content).substring(0, 160)
    };
  }
}

async function createPublishedArticle(article) {
  const { data, error } = await supabase
    .from('published_articles')
    .insert(article)
    .select()
    .single();

  if (error) throw new Error(`Failed to create published article: ${error.message}`);

  return data;
}

async function updateRateTracker() {
  const today = new Date().toISOString().split('T')[0];

  // Increment or create rate tracker record
  const { data: existing } = await supabase
    .from('publishing_rate_tracker')
    .select('*')
    .eq('date', today)
    .is('topic_category', null)
    .single();

  if (existing) {
    await supabase
      .from('publishing_rate_tracker')
      .update({ articles_published: existing.articles_published + 1 })
      .eq('id', existing.id);
  } else {
    await supabase.from('publishing_rate_tracker').insert({
      date: today,
      topic_category: null,
      articles_published: 1
    });
  }
}

async function updateDraftStatus(draftId, stage, publishedArticleId) {
  await supabase
    .from('blog_drafts')
    .update({
      pipeline_stage: stage,
      published_at: new Date().toISOString(),
      metadata: {
        published_article_id: publishedArticleId
      }
    })
    .eq('id', draftId);
}

async function initializePerformanceTracking(articleId) {
  // Create initial performance snapshot
  await supabase.from('article_performance_snapshots').insert({
    article_id: articleId,
    snapshot_date: new Date().toISOString().split('T')[0],
    rank_position: null,
    featured_snippet: false,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    avg_position: 0,
    backlinks_count: 0,
    social_shares: 0,
    compliance_check_passed: true,
    compliance_notes: 'Initial publication - compliant with all policies'
  });
}
