import { GrowthAuditOrchestrator } from '../../src/lib/growth-audit/orchestrator.js';
import {
  getJob,
  updateJobStatus,
  setJobResult,
  setJobError,
} from '../shared/job-storage-universal.js';

/**
 * Vercel API route for streaming growth audit progress
 * Note: Currently returns chunked response since full SSE streaming requires Edge Functions
 * @param {Request} request - Vercel request object
 * @param {Response} response - Vercel response object
 * @returns {Promise<void>}
 */
export default async function handler(request, response) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({
      error: 'Method not allowed',
      allowed: ['GET']
    });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return response.status(400).json({
      error: 'Job ID required'
    });
  }

  const job = await getJob(jobId);
  if (!job) {
    return response.status(404).json({
      error: 'Job not found'
    });
  }

  // If job already completed, return the result directly
  if (job.status === 'completed' && job.result) {
    return response.status(200).json({
      status: 'completed',
      result: job.result,
    });
  }

  // If job already running or failed, return status
  if (job.status === 'running' || job.status === 'failed') {
    return response.status(409).json({
      error: `Job is ${job.status}`,
      status: job.status,
    });
  }

  // For SSE streaming, we need to use Edge Functions
  // For now, we'll return chunked responses similar to Netlify

  try {
    // Update job status (now async with Vercel KV)
    await updateJobStatus(jobId, 'running');

    // Collect all events
    const events = [];

    const sendEvent = (data) => {
      events.push(data);
    };

    // Run the audit
    const orchestrator = new GrowthAuditOrchestrator();

    const result = await orchestrator.runAudit(job.url, sendEvent);

    // Store result (now async with Vercel KV)
    await setJobResult(jobId, result, events);

    // Return complete result with all events
    return response.status(200).json({
      status: 'completed',
      result,
      events,
    });
  } catch (error) {
    console.error('Stream error:', error);

    await setJobError(jobId, error.message);

    return response.status(500).json({
      status: 'failed',
      error: error.message,
    });
  }
}
