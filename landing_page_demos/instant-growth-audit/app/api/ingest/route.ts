import { NextRequest, NextResponse } from 'next/server';
import { validateUrl } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// In-memory job storage (in production, use Redis or database)
const jobs = new Map<string, { url: string; status: string; result?: any }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteUrl } = body;

    if (!websiteUrl) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    const urlValidation = validateUrl(websiteUrl);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    // Create job
    const jobId = uuidv4();
    jobs.set(jobId, {
      url: urlValidation.normalized!,
      status: 'queued',
    });

    // Return job ID immediately
    return NextResponse.json({ jobId, url: urlValidation.normalized });
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export { jobs };
