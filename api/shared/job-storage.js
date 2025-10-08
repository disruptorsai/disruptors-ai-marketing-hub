/**
 * Persistent job storage for Vercel Functions using Vercel KV (Redis)
 *
 * This replaces the in-memory storage used in Netlify with persistent Redis storage
 * that survives cold starts and works across multiple function instances.
 *
 * Usage:
 * 1. Create Vercel KV database in Vercel dashboard
 * 2. Environment variables automatically set: KV_REST_API_URL, KV_REST_API_TOKEN
 * 3. Install: npm install @vercel/kv
 */

import { kv } from '@vercel/kv';

/**
 * @typedef {Object} Job
 * @property {string} url - Website URL being audited
 * @property {'queued' | 'running' | 'completed' | 'failed'} status - Job status
 * @property {string} createdAt - ISO timestamp of creation
 * @property {Object} [result] - Audit result (when completed)
 * @property {Array} [events] - Stream events (when completed)
 * @property {string} [error] - Error message (when failed)
 */

/**
 * Job key prefix for namespacing in Redis
 */
const JOB_PREFIX = 'job:';

/**
 * Default TTL for jobs (1 hour = 3600 seconds)
 */
const DEFAULT_TTL = 3600;

/**
 * Get full Redis key for a job
 * @param {string} jobId - Job ID
 * @returns {string} Full Redis key
 */
function getJobKey(jobId) {
  return `${JOB_PREFIX}${jobId}`;
}

/**
 * Get a job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Job | null>} Job or null if not found
 */
export async function getJob(jobId) {
  try {
    const job = await kv.get(getJobKey(jobId));
    return job;
  } catch (error) {
    console.error(`Error getting job ${jobId}:`, error);
    return null;
  }
}

/**
 * Create a new job
 * @param {string} jobId - Job ID
 * @param {string} url - Website URL
 * @param {number} ttl - TTL in seconds (default: 1 hour)
 * @returns {Promise<Job>} Created job
 */
export async function createJob(jobId, url, ttl = DEFAULT_TTL) {
  const job = {
    url,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };

  try {
    // Set job with TTL (auto-expires after 1 hour)
    await kv.set(getJobKey(jobId), job, { ex: ttl });
    return job;
  } catch (error) {
    console.error(`Error creating job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Update job status
 * @param {string} jobId - Job ID
 * @param {'queued' | 'running' | 'completed' | 'failed'} status - New status
 * @param {number} ttl - TTL in seconds (default: 1 hour)
 * @returns {Promise<Job | null>} Updated job or null if not found
 */
export async function updateJobStatus(jobId, status, ttl = DEFAULT_TTL) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;

    job.status = status;
    await kv.set(getJobKey(jobId), job, { ex: ttl });
    return job;
  } catch (error) {
    console.error(`Error updating job ${jobId} status:`, error);
    return null;
  }
}

/**
 * Set job result
 * @param {string} jobId - Job ID
 * @param {Object} result - Audit result
 * @param {Array} events - Stream events
 * @param {number} ttl - TTL in seconds (default: 1 hour)
 * @returns {Promise<Job | null>} Updated job or null if not found
 */
export async function setJobResult(jobId, result, events = [], ttl = DEFAULT_TTL) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;

    job.status = 'completed';
    job.result = result;
    job.events = events;
    await kv.set(getJobKey(jobId), job, { ex: ttl });
    return job;
  } catch (error) {
    console.error(`Error setting job ${jobId} result:`, error);
    return null;
  }
}

/**
 * Set job error
 * @param {string} jobId - Job ID
 * @param {string} error - Error message
 * @param {number} ttl - TTL in seconds (default: 1 hour)
 * @returns {Promise<Job | null>} Updated job or null if not found
 */
export async function setJobError(jobId, error, ttl = DEFAULT_TTL) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;

    job.status = 'failed';
    job.error = error;
    await kv.set(getJobKey(jobId), job, { ex: ttl });
    return job;
  } catch (error) {
    console.error(`Error setting job ${jobId} error:`, error);
    return null;
  }
}

/**
 * Delete a job
 * @param {string} jobId - Job ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
export async function deleteJob(jobId) {
  try {
    const deleted = await kv.del(getJobKey(jobId));
    return deleted > 0;
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error);
    return false;
  }
}

/**
 * Delete old jobs (cleanup)
 * Note: With Vercel KV, jobs auto-expire via TTL, so this is mostly for manual cleanup.
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 1 hour)
 * @returns {Promise<number>} Number of jobs deleted
 */
export async function cleanupOldJobs(maxAgeMs = 3600000) {
  try {
    // Get all job keys
    const keys = await kv.keys(`${JOB_PREFIX}*`);
    if (!keys || keys.length === 0) return 0;

    const now = Date.now();
    let deleted = 0;

    // Check each job and delete if too old
    for (const key of keys) {
      const job = await kv.get(key);
      if (!job || !job.createdAt) continue;

      const createdAt = new Date(job.createdAt).getTime();
      if (now - createdAt > maxAgeMs) {
        await kv.del(key);
        deleted++;
      }
    }

    return deleted;
  } catch (error) {
    console.error('Error cleaning up old jobs:', error);
    return 0;
  }
}

/**
 * Get all jobs (for debugging/admin purposes)
 * @returns {Promise<Array<{id: string, job: Job}>>} Array of jobs with IDs
 */
export async function getAllJobs() {
  try {
    const keys = await kv.keys(`${JOB_PREFIX}*`);
    if (!keys || keys.length === 0) return [];

    const jobs = [];
    for (const key of keys) {
      const job = await kv.get(key);
      if (job) {
        jobs.push({
          id: key.replace(JOB_PREFIX, ''),
          job,
        });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error getting all jobs:', error);
    return [];
  }
}
