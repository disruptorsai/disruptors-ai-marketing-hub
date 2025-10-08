/**
 * Ingest Dispatch Background Function
 * Production-ready web scraping and fact extraction
 */

import { getServiceClient } from '../lib/supabase'
import { fetchHTML, extractContent, parseSitemap, discoverURLs, extractSimpleFacts } from '../lib/scraper'
import { extractFactsWithLLM, deduplicateFacts, validateFact } from '../lib/fact-extractor'

export default async function handler(request: Request) {
  const supabase = getServiceClient()
  let jobId: string | null = null

  try {
    // Parse request
    const { brainId, sourceId } = await request.json()

    if (!brainId || !sourceId) {
      return new Response(
        JSON.stringify({
          error: { message: 'brainId and sourceId required' }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get source configuration
    const { data: source, error: sourceError } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('id', sourceId)
      .single()

    if (sourceError || !source) {
      return new Response(
        JSON.stringify({
          error: { message: 'Knowledge source not found' }
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create ingest job
    const { data: job, error: jobError } = await supabase
      .from('ingest_jobs')
      .insert({
        brain_id: brainId,
        source_id: sourceId,
        status: 'running',
        progress: 0,
        logs: 'Starting ingestion...'
      })
      .select()
      .single()

    if (jobError || !job) {
      throw new Error('Failed to create ingest job')
    }

    jobId = job.id

    const updateJob = async (updates: any) => {
      await supabase
        .from('ingest_jobs')
        .update(updates)
        .eq('id', jobId)
    }

    // Discover URLs based on source type
    await updateJob({ progress: 10, logs: 'Discovering URLs...' })

    let urls: string[] = []
    const config = source.config || {}

    switch (source.type) {
      case 'url':
        urls = [config.url]
        break

      case 'sitemap':
        const sitemapEntries = await parseSitemap(config.url)
        urls = sitemapEntries.map(e => e.url)
        await updateJob({
          progress: 20,
          logs: `Found ${urls.length} URLs in sitemap`
        })
        break

      case 'feed':
        // RSS/Atom feed parsing (simplified)
        urls = [config.url]
        break

      default:
        throw new Error(`Unsupported source type: ${source.type}`)
    }

    // Filter URLs by include/exclude patterns
    if (config.include && Array.isArray(config.include)) {
      urls = urls.filter(url =>
        config.include.some((pattern: string) => url.includes(pattern))
      )
    }

    if (config.exclude && Array.isArray(config.exclude)) {
      urls = urls.filter(url =>
        !config.exclude.some((pattern: string) => url.includes(pattern))
      )
    }

    // Limit URLs for this job
    urls = urls.slice(0, config.maxPages || 20)

    await updateJob({
      progress: 25,
      logs: `Processing ${urls.length} URLs`
    })

    // Scrape content from URLs
    const scrapedContents = []
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]

      try {
        await updateJob({
          progress: 25 + ((i / urls.length) * 30),
          logs: `Scraping ${i + 1}/${urls.length}: ${url}`
        })

        const html = await fetchHTML(url)
        const content = await extractContent(html, url)

        if (content) {
          scrapedContents.push(content)
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error: any) {
        console.error(`Failed to scrape ${url}:`, error.message)
      }
    }

    await updateJob({
      progress: 60,
      logs: `Scraped ${scrapedContents.length} pages, extracting facts...`
    })

    // Get existing facts for deduplication
    const { data: existingFacts } = await supabase
      .from('brain_facts')
      .select('key, value, confidence')
      .eq('brain_id', brainId)

    // Extract facts using LLM
    const allFacts = []
    for (let i = 0; i < scrapedContents.length; i++) {
      const content = scrapedContents[i]

      try {
        await updateJob({
          progress: 60 + ((i / scrapedContents.length) * 30),
          logs: `Extracting facts from ${i + 1}/${scrapedContents.length}`
        })

        // Try LLM extraction first
        const llmFacts = await extractFactsWithLLM(content)
        allFacts.push(...llmFacts)

        // Fallback to simple extraction
        if (llmFacts.length === 0) {
          const simpleFacts = extractSimpleFacts(content)
          allFacts.push(...simpleFacts.map(f => ({
            ...f,
            source: content.url,
            confidence: 0.6
          })))
        }

        // Rate limiting for LLM calls
        await new Promise(resolve => setTimeout(resolve, 1500))
      } catch (error: any) {
        console.error(`Failed to extract facts from ${content.url}:`, error.message)
      }
    }

    // Deduplicate and validate facts
    const validFacts = allFacts.filter(validateFact)
    const dedupedFacts = deduplicateFacts(validFacts, existingFacts || [])

    await updateJob({
      progress: 95,
      logs: `Saving ${dedupedFacts.length} facts to database...`
    })

    // Insert facts into database
    let factsAdded = 0
    let factsUpdated = 0

    for (const fact of dedupedFacts) {
      const { data: existing } = await supabase
        .from('brain_facts')
        .select('id, confidence')
        .eq('brain_id', brainId)
        .eq('key', fact.key)
        .single()

      if (existing) {
        if (fact.confidence > existing.confidence) {
          await supabase
            .from('brain_facts')
            .update({
              value: fact.value,
              source: fact.source,
              confidence: fact.confidence,
              last_verified_at: new Date().toISOString()
            })
            .eq('id', existing.id)
          factsUpdated++
        }
      } else {
        await supabase
          .from('brain_facts')
          .insert({
            brain_id: brainId,
            key: fact.key,
            value: fact.value,
            source: fact.source,
            confidence: fact.confidence,
            last_verified_at: new Date().toISOString()
          })
        factsAdded++
      }
    }

    // Update source last_ingested_at
    await supabase
      .from('knowledge_sources')
      .update({ last_ingested_at: new Date().toISOString() })
      .eq('id', sourceId)

    // Complete job
    await updateJob({
      status: 'success',
      progress: 100,
      facts_added: factsAdded,
      facts_updated: factsUpdated,
      logs: `Completed! Added ${factsAdded} facts, updated ${factsUpdated} facts.`,
      finished_at: new Date().toISOString()
    })

    // Log telemetry
    await supabase.from('telemetry_events').insert({
      area: 'ingest',
      name: 'job_completed',
      payload: {
        job_id: jobId,
        brain_id: brainId,
        source_id: sourceId,
        urls_processed: urls.length,
        facts_added: factsAdded,
        facts_updated: factsUpdated
      }
    })

    return new Response(
      JSON.stringify({
        jobId,
        status: 'completed',
        factsAdded,
        factsUpdated
      }),
      { status: 202, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Ingestion error:', error)

    // Mark job as failed
    if (jobId) {
      await supabase
        .from('ingest_jobs')
        .update({
          status: 'failed',
          logs: `Error: ${error.message}`,
          finished_at: new Date().toISOString()
        })
        .eq('id', jobId)
    }

    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Ingestion failed',
          code: 'INGEST_ERROR'
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
