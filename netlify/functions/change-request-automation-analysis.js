/**
 * Change Request Automation Feasibility Analysis
 *
 * Analyzes change requests to determine if they can be completed automatically
 * by AI coding assistants (Claude Code, Cursor) or require manual/external work.
 *
 * Returns:
 * - Automation feasibility classification
 * - Confidence score
 * - Specific blockers
 * - Tool recommendations
 * - Implementation approach
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anthropicApiKey = process.env.VITE_ANTHROPIC_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const anthropic = new Anthropic({ apiKey: anthropicApiKey });

/**
 * System prompt for automation feasibility analysis
 */
const ANALYSIS_PROMPT = `You are an expert at analyzing software development tasks and determining if they can be automated using AI coding assistants like Claude Code or Cursor.

Analyze the provided change request and return a JSON object with the following structure:

{
  "feasibility": "fully_automatable" | "partially_automatable" | "manual_required" | "external_required",
  "confidence": 0.85,
  "reasoning": "Brief explanation of the classification",
  "recommended_tool": "Claude Code" | "Cursor" | "Manual" | "External Service",
  "blockers": [
    "Specific blocker 1",
    "Specific blocker 2"
  ],
  "automatable_parts": [
    "What can be automated"
  ],
  "manual_parts": [
    "What requires manual work"
  ],
  "implementation_approach": "Step-by-step approach for completing this request",
  "estimated_complexity": "low" | "medium" | "high" | "very_high",
  "estimated_time": "5 minutes" | "30 minutes" | "2 hours" | "1 day"
}

CLASSIFICATION CRITERIA:

**fully_automatable** (confidence 0.8-1.0):
- Pure code changes (bug fixes, refactoring, new features)
- Database schema changes with clear requirements
- Configuration updates
- Documentation updates
- Component creation/modification
- API integration with clear specs
- UI changes with detailed descriptions

**partially_automatable** (confidence 0.5-0.8):
- Tasks requiring some manual decisions
- UI/UX changes needing design judgment
- Performance optimizations requiring testing
- Security fixes needing validation
- Complex integrations with some unknowns

**manual_required** (confidence 0.3-0.5):
- Tasks requiring human creativity/judgment
- Design work without specifications
- Content creation requiring domain expertise
- User research or testing
- Complex architectural decisions

**external_required** (confidence 0.1-0.3):
- Third-party service setup (accounts, API keys)
- DNS/domain configuration
- Payment processing setup
- Legal/compliance work
- Physical infrastructure changes

IMPORTANT: Return ONLY valid JSON, no markdown formatting or explanations.`;

/**
 * Analyze automation feasibility using Claude
 */
async function analyzeAutomationFeasibility(changeRequest) {
  const { change_description, category, task_items, priority } = changeRequest;

  const userPrompt = `Analyze this change request for automation feasibility:

**Description**: ${change_description}

**Category**: ${category}

**Priority**: ${priority}

**Task Items**:
${task_items?.length ? task_items.map((task, i) => `${i + 1}. ${task}`).join('\n') : 'No specific tasks listed'}

Provide your analysis as JSON only.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        { role: 'user', content: `${ANALYSIS_PROMPT}\n\n${userPrompt}` }
      ]
    });

    const content = response.content[0].text;

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(jsonText);

    return {
      feasibility: analysis.feasibility,
      confidence: analysis.confidence,
      analysis: analysis,
      blockers: analysis.blockers || [],
      recommendations: `**Tool**: ${analysis.recommended_tool}\n**Complexity**: ${analysis.estimated_complexity}\n**Time**: ${analysis.estimated_time}\n\n${analysis.implementation_approach}`
    };
  } catch (error) {
    console.error('Automation analysis error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

/**
 * Main handler
 */
export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { requestId, requestIds } = JSON.parse(event.body);

    // Handle batch analysis
    if (requestIds && Array.isArray(requestIds)) {
      const results = [];

      for (const id of requestIds) {
        try {
          // Fetch request
          const { data: request, error: fetchError } = await supabase
            .from('change_requests')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;

          // Analyze
          const analysis = await analyzeAutomationFeasibility(request);

          // Update request
          const { error: updateError } = await supabase
            .from('change_requests')
            .update({
              automation_feasibility: analysis.feasibility,
              automation_analysis: analysis.analysis,
              automation_confidence: analysis.confidence,
              automation_blockers: analysis.blockers,
              automation_recommendations: analysis.recommendations,
              analyzed_at: new Date().toISOString()
            })
            .eq('id', id);

          if (updateError) throw updateError;

          results.push({ id, success: true, feasibility: analysis.feasibility });
        } catch (error) {
          console.error(`Error analyzing request ${id}:`, error);
          results.push({ id, success: false, error: error.message });
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          analyzed: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        })
      };
    }

    // Handle single analysis
    if (!requestId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'requestId or requestIds required' })
      };
    }

    // Fetch change request
    const { data: request, error: fetchError } = await supabase
      .from('change_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch request: ${fetchError.message}`);
    }

    // Analyze automation feasibility
    const analysis = await analyzeAutomationFeasibility(request);

    // Update change request with analysis
    const { error: updateError } = await supabase
      .from('change_requests')
      .update({
        automation_feasibility: analysis.feasibility,
        automation_analysis: analysis.analysis,
        automation_confidence: analysis.confidence,
        automation_blockers: analysis.blockers,
        automation_recommendations: analysis.recommendations,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      throw new Error(`Failed to update request: ${updateError.message}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        requestId,
        ...analysis
      })
    };

  } catch (error) {
    console.error('Automation analysis error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Internal server error'
      })
    };
  }
}
