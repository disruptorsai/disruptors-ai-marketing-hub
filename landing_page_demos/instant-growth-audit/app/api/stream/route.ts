import { NextRequest } from 'next/server';
import { GrowthAuditOrchestrator } from '@/lib/orchestrator';
import { jobs } from '../ingest/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return new Response('Job ID required', { status: 400 });
  }

  const job = jobs.get(jobId);
  if (!job) {
    return new Response('Job not found', { status: 404 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Update job status
        job.status = 'running';

        // Run the audit with streaming
        const orchestrator = new GrowthAuditOrchestrator();

        const result = await orchestrator.runAudit(job.url, (event) => {
          send(event);
        });

        // Store result
        job.status = 'completed';
        job.result = result;

        // Send final event
        send({ type: 'complete', payload: result });

        controller.close();
      } catch (error) {
        send({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
        job.status = 'failed';
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
