import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateUrl(url: string): { valid: boolean; normalized?: string; error?: string } {
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

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function scoreToColor(score: number): string {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

export function effortToLabel(effort: 'low' | 'med' | 'high'): string {
  const labels = {
    low: 'Quick Win',
    med: 'Moderate',
    high: 'Complex',
  };
  return labels[effort];
}

export function impactToLabel(impact: 'low' | 'med' | 'high'): string {
  const labels = {
    low: 'Minor',
    med: 'Significant',
    high: 'Major',
  };
  return labels[impact];
}

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
