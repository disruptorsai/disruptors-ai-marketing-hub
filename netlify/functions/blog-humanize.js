/**
 * Blog Humanization Netlify Function
 *
 * Endpoint: /.netlify/functions/blog-humanize
 * Method: POST
 *
 * Humanizes blog post content using multi-provider fallback system.
 *
 * Request Body:
 * {
 *   "postId": "uuid",              // Post ID to humanize
 *   "content": "text...",          // Or provide content directly
 *   "provider": "auto",            // 'auto', 'edgeshop', 'undetectable', 'claude'
 *   "saveToDatabase": true         // Save humanized version to posts table
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "humanizedContent": "...",
 *   "provider": "undetectable",
 *   "aiScore": 0.15,
 *   "cost": 0.05,
 *   "savedToDatabase": true
 * }
 */

import { createClient } from '@supabase/supabase-js';
import { humanizeText, humanizeBlogPost } from './shared/humanize-text.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      postId,
      content,
      provider = 'auto',
      saveToDatabase = false
    } = body;

    // Validate input
    if (!postId && !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Either postId or content is required'
        })
      };
    }

    let blogContent = content;

    // If postId provided, fetch from database
    if (postId && !content) {
      const { data: post, error } = await supabase
        .from('posts')
        .select('content')
        .eq('id', postId)
        .single();

      if (error || !post) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            error: 'Post not found',
            details: error?.message
          })
        };
      }

      blogContent = post.content;
    }

    if (!blogContent || blogContent.length < 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Blog content is too short or empty'
        })
      };
    }

    console.log(`Humanizing blog post (${blogContent.length} chars) with provider: ${provider}`);

    // Humanize the blog post
    const result = await humanizeBlogPost(blogContent, { preferredProvider: provider });

    if (!result.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Humanization failed',
          details: result.error
        })
      };
    }

    // Save to database if requested
    let savedToDatabase = false;
    if (saveToDatabase && postId) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          content: result.humanizedContent,
          updated_at: new Date().toISOString(),
          // Store humanization metadata
          metadata: {
            humanized: true,
            humanized_at: new Date().toISOString(),
            humanization_cost: result.totalCost,
            sections_processed: result.sectionsProcessed
          }
        })
        .eq('id', postId);

      if (!updateError) {
        savedToDatabase = true;
        console.log(`✅ Humanized content saved to database for post ${postId}`);
      } else {
        console.error('Failed to save humanized content:', updateError);
      }
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        postId: postId || null,
        humanizedContent: result.humanizedContent,
        originalLength: result.originalContent.length,
        humanizedLength: result.humanizedContent.length,
        sectionsProcessed: result.sectionsProcessed,
        cost: result.totalCost,
        savedToDatabase: savedToDatabase
      })
    };

  } catch (error) {
    console.error('Blog humanization error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
