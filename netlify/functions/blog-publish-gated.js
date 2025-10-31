/**
 * BLOG PUBLISH FUNCTION - WITH QA GATE ENFORCEMENT
 *
 * Enforces quality control gate before publishing:
 * - Blocks publishing if QA checks have not passed
 * - Returns detailed error with specific issues
 * - Allows manual override with admin justification
 *
 * IMPLEMENTATION: Based on Executive Summary requirements
 * STATUS: Phase 1 - Pre-Publish Gate Complete
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { postId, overrideQA, overrideReason } = JSON.parse(event.body);

    if (!postId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Missing postId parameter'
        })
      };
    }

    console.log(`📤 Publishing blog post ${postId}...`);

    // GET POST AND QA RESULTS FROM DATABASE
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch post: ${fetchError.message}`);
    }

    // ========================
    // QUALITY GATE ENFORCEMENT
    // ========================

    const qaResults = post.qa_results;
    const qaPass = post.qa_passed;

    // Check if QA has been run
    if (!qaResults || !post.last_qa_run) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: 'QA_NOT_RUN',
          message: 'Cannot publish: Quality assurance checks have not been run on this post',
          requiredActions: [
            'Run QA pipeline on this post',
            'Fix any issues detected',
            'Re-run QA until all checks pass'
          ],
          nextStep: {
            action: 'Run QA',
            endpoint: '/api/blog-run-qa',
            method: 'POST',
            body: { draftId: postId }
          }
        })
      };
    }

    // Check if QA passed (unless manual override)
    if (!qaPass && !overrideQA) {
      const summary = qaResults.summary || {};
      const issues = qaResults.issues || [];

      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: 'QA_CHECKS_FAILED',
          message: 'Cannot publish: Quality checks have not passed',
          qaStatus: {
            lastRun: post.last_qa_run,
            passed: false,
            totalChecks: summary.total_checks || 0,
            passedChecks: summary.passed || 0,
            warningChecks: summary.warnings || 0,
            failedChecks: summary.failed || 0,
            criticalFailures: summary.critical_failures || 0
          },
          issues: issues.map(issue => ({
            type: issue.type || 'unknown',
            severity: issue.severity || 'medium',
            message: issue.message || issue.claim || JSON.stringify(issue),
            suggestion: issue.suggestion || issue.suggestions?.[0]
          })),
          requiredActions: [
            'Review and fix all high-severity issues',
            'Address grammar and spelling errors',
            'Verify all factual claims are accurate',
            'Ensure content passes toxicity checks',
            'Reduce plagiarism score if above threshold',
            'Re-run QA pipeline after fixes',
            'OR request manual override from admin with justification'
          ],
          qaDetails: qaResults.results || {},
          overrideOption: {
            description: 'Admin can override QA gate with valid justification',
            parameters: {
              overrideQA: true,
              overrideReason: 'Detailed justification for override (required)'
            }
          }
        })
      };
    }

    // If manual override, validate reason
    if (overrideQA && !overrideReason) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'MISSING_OVERRIDE_REASON',
          message: 'Manual QA override requires a detailed justification',
          requiredFields: {
            overrideReason: 'String - Detailed explanation for why QA gate is being overridden'
          }
        })
      };
    }

    // Log override if used
    if (overrideQA) {
      console.warn(`⚠️ QA GATE MANUALLY OVERRIDDEN for post ${postId}`);
      console.warn(`   Reason: ${overrideReason}`);

      // Store override in post metadata
      await supabase
        .from('posts')
        .update({
          generation_metadata: {
            ...post.generation_metadata,
            qa_override: {
              overridden_at: new Date().toISOString(),
              reason: overrideReason,
              qa_results_at_override: qaResults
            }
          }
        })
        .eq('id', postId);
    }

    // ========================
    // PROCEED WITH PUBLISH
    // ========================

    const publishedAt = new Date().toISOString();

    const { data: publishedPost, error: publishError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        is_published: true,
        published_at: publishedAt,
        updated_at: publishedAt,
        approval_status: 'approved'
      })
      .eq('id', postId)
      .select()
      .single();

    if (publishError) {
      throw new Error(`Failed to publish post: ${publishError.message}`);
    }

    console.log(`✅ Published post ${postId} successfully`);

    if (overrideQA) {
      console.log(`   ⚠️ Note: QA gate was manually overridden`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: overrideQA
          ? 'Post published successfully (QA gate manually overridden)'
          : 'Post published successfully - all quality checks passed',
        post: {
          id: publishedPost.id,
          title: publishedPost.title,
          slug: publishedPost.slug,
          published_at: publishedPost.published_at,
          url: `/blog/${publishedPost.slug}`
        },
        qaVerification: overrideQA
          ? {
              status: 'overridden',
              reason: overrideReason,
              originalQAResults: qaResults
            }
          : {
              status: 'passed',
              summary: qaResults.summary,
              lastRun: post.last_qa_run
            }
      })
    };

  } catch (error) {
    console.error('Publish error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    };
  }
};
