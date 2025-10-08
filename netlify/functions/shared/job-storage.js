/**
 * Shared in-memory job storage for Netlify Functions
 *
 * Note: This is a simple in-memory store that will reset on cold starts.
 * For production, consider using Redis, Supabase, or another persistent store.
 *
 * This shared module ensures both ingest and stream functions access the same jobs Map.
 */

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
 * In-memory job storage
 * @type {Map<string, Job>}
 */
export const jobs = new Map();

/**
 * Get a job by ID
 * @param {string} jobId - Job ID
 * @returns {Job | undefined} Job or undefined if not found
 */
export function getJob(jobId) {
  return jobs.get(jobId);
}

/**
 * Create a new job
 * @param {string} jobId - Job ID
 * @param {string} url - Website URL
 * @returns {Job} Created job
 */
export function createJob(jobId, url) {
  const job = {
    url,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
  jobs.set(jobId, job);
  return job;
}

/**
 * Update job status
 * @param {string} jobId - Job ID
 * @param {'queued' | 'running' | 'completed' | 'failed'} status - New status
 * @returns {Job | undefined} Updated job or undefined if not found
 */
export function updateJobStatus(jobId, status) {
  const job = jobs.get(jobId);
  if (!job) return undefined;

  job.status = status;
  jobs.set(jobId, job);
  return job;
}

/**
 * Set job result
 * @param {string} jobId - Job ID
 * @param {Object} result - Audit result
 * @param {Array} events - Stream events
 * @returns {Job | undefined} Updated job or undefined if not found
 */
export function setJobResult(jobId, result, events = []) {
  const job = jobs.get(jobId);
  if (!job) return undefined;

  job.status = 'completed';
  job.result = result;
  job.events = events;
  jobs.set(jobId, job);
  return job;
}

/**
 * Set job error
 * @param {string} jobId - Job ID
 * @param {string} error - Error message
 * @returns {Job | undefined} Updated job or undefined if not found
 */
export function setJobError(jobId, error) {
  const job = jobs.get(jobId);
  if (!job) return undefined;

  job.status = 'failed';
  job.error = error;
  jobs.set(jobId, job);
  return job;
}

/**
 * Delete old jobs (cleanup)
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 1 hour)
 * @returns {number} Number of jobs deleted
 */
export function cleanupOldJobs(maxAgeMs = 3600000) {
  const now = Date.now();
  let deleted = 0;

  for (const [jobId, job] of jobs.entries()) {
    const createdAt = new Date(job.createdAt).getTime();
    if (now - createdAt > maxAgeMs) {
      jobs.delete(jobId);
      deleted++;
    }
  }

  return deleted;
}
