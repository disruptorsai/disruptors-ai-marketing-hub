import { GrowthAuditOrchestrator } from '../../src/lib/growth-audit/orchestrator.js';
import {
  getJob,
  updateJobStatus,
  setJobResult,
  setJobError,
} from './shared/job-storage.js';

/**
 * Netlify function for streaming growth audit progress via Server-Sent Events
 * @param {Object} event - Netlify function event
 * @returns {Promise<Object>} Response object with SSE stream
 */
export async function handler(event) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET',
      },
    };
  }

  const { jobId } = event.queryStringParameters || {};

  if (!jobId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Job ID required' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const job = getJob(jobId);
  if (!job) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Job not found' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // If job already completed, return the result directly
  if (job.status === 'completed' && job.result) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'completed',
        result: job.result,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // If job already running or failed, return status
  if (job.status === 'running' || job.status === 'failed') {
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: `Job is ${job.status}`,
        status: job.status,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // For SSE streaming, we need to use a different approach in Netlify Functions
  // Since Netlify Functions don't support true streaming yet, we'll return chunked responses
  // The client will need to poll or we can use a webhook pattern

  try {
    // Update job status
    updateJobStatus(jobId, 'running');

    // Collect all events
    const events = [];

    const sendEvent = (data) => {
      events.push(data);
    };

    // Run the audit
    const orchestrator = new GrowthAuditOrchestrator();

    const result = await orchestrator.runAudit(job.url, sendEvent);

    // Store result
    setJobResult(jobId, result, events);

    // Return complete result with all events
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'completed',
        result,
        events,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Stream error:', error);

    setJobError(jobId, error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'failed',
        error: error.message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}
