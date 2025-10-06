import { v4 as uuidv4 } from 'uuid';

// In-memory job storage (in production, consider using Redis or a database)
// Note: This will reset when the function cold-starts, but is fine for demo purposes
const jobs = new Map();

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
 * Netlify function to create a new growth audit job
 * @param {Object} event - Netlify function event
 * @returns {Promise<Object>} Response object
 */
export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST',
      },
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { websiteUrl } = body;

    if (!websiteUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Website URL is required' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const urlValidation = validateUrl(websiteUrl);
    if (!urlValidation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: urlValidation.error }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // Create job
    const jobId = uuidv4();
    jobs.set(jobId, {
      url: urlValidation.normalized,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });

    // Return job ID immediately
    return {
      statusCode: 200,
      body: JSON.stringify({
        jobId,
        url: urlValidation.normalized,
        status: 'queued',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Ingest error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}

// Export jobs Map so it can be accessed by the stream function
export { jobs };
