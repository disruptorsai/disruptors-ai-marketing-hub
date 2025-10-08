/**
 * Universal Job Storage Wrapper
 *
 * Provides the same API as the original job-storage.js but works on both platforms.
 * This ensures backward compatibility while adding multi-platform support.
 */

import { JobStorage } from './universal-job-storage.js';

/**
 * @typedef {Object} Job
 * @property {string} url - Website URL being audited
 * @property {'queued' | 'running' | 'completed' | 'failed'} status - Job status
 * @property {string} createdAt - ISO timestamp of creation
 * @property {Object} [result] - Audit result (when completed)
 * @property {Array} [events] - Stream events (when completed)
 * @property {string} [error] - Error message (when failed)
 */

const JOB_PREFIX = 'job:';
const DEFAULT_TTL = 3600;

function getJobKey(jobId) {
  return `${JOB_PREFIX}${jobId}`;
}

export async function getJob(jobId) {
  try {
    return await JobStorage.get(getJobKey(jobId));
  } catch (error) {
    console.error(`Error getting job ${jobId}:`, error);
    return null;
  }
}

export async function createJob(jobId, url, ttl = DEFAULT_TTL) {
  const job = {
    url,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
  try {
    await JobStorage.set(getJobKey(jobId), job, ttl);
    return job;
  } catch (error) {
    console.error(`Error creating job ${jobId}:`, error);
    throw error;
  }
}

export async function updateJobStatus(jobId, status, ttl = DEFAULT_TTL) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;
    job.status = status;
    await JobStorage.set(getJobKey(jobId), job, ttl);
    return job;
  } catch (error) {
    console.error(`Error updating job ${jobId} status:`, error);
    return null;
  }
}

export async function setJobResult(jobId, result, events = [], ttl = DEFAULT_TTL) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;
    job.status = 'completed';
    job.result = result;
    job.events = events;
    await JobStorage.set(getJobKey(jobId), job, ttl);
    return job;
  } catch (error) {
    console.error(`Error setting job ${jobId} result:`, error);
    return null;
  }
}

export async function setJobError(jobId, error, ttl = DEFAULT_TTL) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;
    job.status = 'failed';
    job.error = error;
    await JobStorage.set(getJobKey(jobId), job, ttl);
    return job;
  } catch (error) {
    console.error(`Error setting job ${jobId} error:`, error);
    return null;
  }
}

export async function deleteJob(jobId) {
  try {
    await JobStorage.delete(getJobKey(jobId));
    return true;
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error);
    return false;
  }
}

export async function cleanupOldJobs(maxAgeMs = 3600000) {
  try {
    const keys = await JobStorage.keys(`${JOB_PREFIX}*`);
    if (!keys || keys.length === 0) return 0;
    const now = Date.now();
    let deleted = 0;
    for (const key of keys) {
      const job = await JobStorage.get(key);
      if (!job || !job.createdAt) continue;
      const createdAt = new Date(job.createdAt).getTime();
      if (now - createdAt > maxAgeMs) {
        await JobStorage.delete(key);
        deleted++;
      }
    }
    return deleted;
  } catch (error) {
    console.error('Error cleaning up old jobs:', error);
    return 0;
  }
}

export async function getAllJobs() {
  try {
    const keys = await JobStorage.keys(`${JOB_PREFIX}*`);
    if (!keys || keys.length === 0) return [];
    const jobs = [];
    for (const key of keys) {
      const job = await JobStorage.get(key);
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

export { JobStorage };
