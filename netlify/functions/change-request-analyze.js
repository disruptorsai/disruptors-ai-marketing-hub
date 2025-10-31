/**
 * Change Request AI Analysis Function
 *
 * Analyzes uploaded documents or pasted text using OpenAI GPT-4 Vision
 * to extract structured change requests with tasks, priorities, and categories.
 *
 * Supports:
 * - Text input (direct paste)
 * - Image uploads (screenshots, mockups, wireframes)
 * - PDF documents (converted to images for analysis)
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.VITE_OPENAI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

/**
 * System prompt for extracting change requests from documents
 */
const SYSTEM_PROMPT = `You are an expert project manager analyzing change requests.

Extract all change requests from the provided content and format them as a JSON array.
For EACH distinct change request, create a separate object with:

{
  "change_description": "Brief but clear description of the change (1-2 sentences)",
  "priority": "low|medium|high|urgent",
  "category": "bug_fix|feature|content_change|design_change|performance|security|other",
  "task_items": [
    "Specific actionable task 1",
    "Specific actionable task 2",
    ...
  ]
}

IMPORTANT RULES:
1. Break down complex requests into multiple separate change requests if they cover different areas
2. Each task_item should be a specific, actionable step
3. Infer priority based on urgency language (ASAP, urgent, critical = urgent; minor, eventually = low; default = medium)
4. Choose the most accurate category based on the nature of the change
5. If multiple categories apply, choose the primary one
6. For design changes, be specific about what needs to change
7. For content changes, note what content and where
8. For bugs, describe the issue and expected behavior

Return ONLY valid JSON array, no other text.`;

/**
 * Parse PDF buffer to text
 */
async function parsePdfToText(pdfBuffer) {
  try {
    // Dynamic import for CommonJS module compatibility
    const pdf = (await import('pdf-parse')).default;
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF document');
  }
}

/**
 * Analyze content using OpenAI GPT-4 Vision
 */
async function analyzeContent(content, sourceType) {
  try {
    let messages;

    if (sourceType === 'text') {
      // Text analysis
      messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze these change requests:\n\n${content}` }
      ];
    } else if (sourceType === 'image') {
      // Image analysis (base64 or URL)
      messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze all change requests visible in this image:' },
            {
              type: 'image_url',
              image_url: {
                url: content.startsWith('http') ? content : `data:image/jpeg;base64,${content}`
              }
            }
          ]
        }
      ];
    } else {
      throw new Error('Unsupported source type');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4 Turbo with Vision
      messages,
      temperature: 0.3, // Lower temperature for more structured output
      max_tokens: 4000
    });

    const rawResponse = response.choices[0].message.content;

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = rawResponse.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsedRequests = JSON.parse(jsonText);

    if (!Array.isArray(parsedRequests)) {
      throw new Error('AI response is not an array');
    }

    return {
      rawResponse,
      parsedRequests
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Main handler
 */
export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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
    const {
      requesterName,
      requesterEmail,
      sourceType, // 'text', 'image', or 'pdf'
      content, // Text content, base64 image, or PDF base64
      documentUrl // Optional: URL to uploaded document
    } = JSON.parse(event.body);

    // Validation
    if (!requesterName || !sourceType || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: requesterName, sourceType, content'
        })
      };
    }

    // Create AI analysis record
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('change_request_ai_analyses')
      .insert({
        requester_name: requesterName,
        requester_email: requesterEmail,
        source_type: sourceType,
        source_content: sourceType === 'text' ? content : null,
        source_document_url: documentUrl,
        status: 'processing'
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Failed to create analysis record: ${analysisError.message}`);
    }

    const analysisId = analysisRecord.id;
    let processedContent = content;

    try {
      // Handle PDF conversion
      if (sourceType === 'pdf') {
        // Decode base64 PDF
        const pdfBuffer = Buffer.from(content, 'base64');
        processedContent = await parsePdfToText(pdfBuffer);

        // If PDF text extraction fails or is too short, return error
        if (!processedContent || processedContent.trim().length < 10) {
          throw new Error('PDF contains no readable text. Please use an image-based PDF or screenshot instead.');
        }
      }

      // Analyze content with OpenAI
      const { rawResponse, parsedRequests } = await analyzeContent(
        processedContent,
        sourceType === 'pdf' ? 'text' : sourceType
      );

      // Validate parsed requests
      if (!parsedRequests.length) {
        throw new Error('No change requests found in the provided content');
      }

      // Generate batch ID for grouping
      const batchId = crypto.randomUUID();

      // Create change requests from parsed data
      const changeRequests = parsedRequests.map(request => ({
        requester_name: requesterName,
        requester_email: requesterEmail,
        change_description: request.change_description,
        priority: request.priority || 'medium',
        category: request.category || 'other',
        task_items: request.task_items || [],
        source_type: `ai_${sourceType}`,
        source_document_url: documentUrl,
        ai_analysis_id: analysisId,
        batch_id: batchId,
        status: 'pending'
      }));

      // Insert change requests
      const { data: createdRequests, error: insertError } = await supabase
        .from('change_requests')
        .insert(changeRequests)
        .select();

      if (insertError) {
        throw new Error(`Failed to create change requests: ${insertError.message}`);
      }

      // Update analysis record with results
      await supabase
        .from('change_request_ai_analyses')
        .update({
          raw_ai_response: rawResponse,
          parsed_requests: parsedRequests,
          requests_created: createdRequests.length,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          analysisId,
          batchId,
          requestsCreated: createdRequests.length,
          requests: createdRequests,
          message: `Successfully created ${createdRequests.length} change request(s)`
        })
      };

    } catch (analysisError) {
      // Update analysis record with error
      await supabase
        .from('change_request_ai_analyses')
        .update({
          status: 'failed',
          error_message: analysisError.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      throw analysisError;
    }

  } catch (error) {
    console.error('Change request analysis error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}
