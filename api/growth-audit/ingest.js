import { v4 as uuidv4 } from 'uuid';
import { createJob } from '../shared/job-storage-universal.js';

/**
 * Validate and normalize URL
 * @param {string} url - URL to validate
 * @returns {{valid: boolean, normalized?: string, error?: string}} Validation result
 */
function validateUrl(url) {
  try {
    // Add protocol if missing
    const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
    const parsed = new URL(urlWithProtocol);

    if (!parsed.hostname) {
      return { valid: false, error: 'Invalid domain' };
    }

    return { valid: true, normalized: parsed.toString() };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Vercel API route to create a new growth audit job
 * @param {Request} request - Vercel request object
 * @param {Response} response - Vercel response object
 * @returns {Promise<void>}
 */
export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  try {
    const body = await request.json();
    const { websiteUrl } = body;

    if (!websiteUrl) {
      return response.status(400).json({
        error: 'Website URL is required'
      });
    }

    const urlValidation = validateUrl(websiteUrl);
    if (!urlValidation.valid) {
      return response.status(400).json({
        error: urlValidation.error
      });
    }

    // Create job (now async with Vercel KV)
    const jobId = uuidv4();
    const job = await createJob(jobId, urlValidation.normalized);

    // Return job ID immediately
    return response.status(200).json({
      jobId,
      url: job.url,
      status: job.status,
    });
  } catch (error) {
    console.error('Ingest error:', error);
    return response.status(500).json({
      error: 'Internal server error'
    });
  }
}
