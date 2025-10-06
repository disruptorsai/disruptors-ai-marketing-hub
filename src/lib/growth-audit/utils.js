import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge Tailwind classes with proper precedence
 * @param {...import('clsx').ClassValue} inputs - Class values to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validate and normalize a URL
 * @param {string} url - The URL to validate
 * @returns {{ valid: boolean, normalized?: string, error?: string }} Validation result
 */
export function validateUrl(url) {
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
 * Extract clean domain from URL
 * @param {string} url - The URL to extract from
 * @returns {string} Clean domain without www
 */
export function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Convert score to Tailwind color class
 * @param {number} score - Score between 0 and 1
 * @returns {string} Tailwind color class
 */
export function scoreToColor(score) {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Convert effort level to readable label
 * @param {'low' | 'med' | 'high'} effort - Effort level
 * @returns {string} Readable label
 */
export function effortToLabel(effort) {
  const labels = {
    low: 'Quick Win',
    med: 'Moderate',
    high: 'Complex',
  };
  return labels[effort];
}

/**
 * Convert impact level to readable label
 * @param {'low' | 'med' | 'high'} impact - Impact level
 * @returns {string} Readable label
 */
export function impactToLabel(impact) {
  const labels = {
    low: 'Minor',
    med: 'Significant',
    high: 'Major',
  };
  return labels[impact];
}

/**
 * Wait for a specified duration
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
