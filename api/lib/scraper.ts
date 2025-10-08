/**
 * Web Scraping Library
 * Content extraction and crawling utilities
 */

import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

export interface ScrapedContent {
  url: string
  title: string
  content: string
  textContent: string
  excerpt: string
  byline?: string
  siteName?: string
  publishedTime?: string
  images: string[]
  links: string[]
  metadata: Record<string, any>
}

export interface SitemapEntry {
  url: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

/**
 * Fetch and parse HTML content from URL
 */
export async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Disruptors-AI-Bot/1.0 (Admin Nexus Knowledge Ingestion)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    redirect: 'follow'
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    throw new Error(`Invalid content type: ${contentType}`)
  }

  return await response.text()
}

/**
 * Extract readable content using Readability
 */
export async function extractContent(html: string, url: string): Promise<ScrapedContent | null> {
  try {
    const dom = new JSDOM(html, { url })
    const doc = dom.window.document

    // Try Readability first
    const reader = new Readability(doc.cloneNode(true) as Document)
    const article = reader.parse()

    if (!article) {
      // Fallback to basic extraction
      return extractBasicContent(doc, url)
    }

    // Extract images
    const images: string[] = []
    doc.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src')
      if (src) {
        images.push(new URL(src, url).href)
      }
    })

    // Extract links
    const links: string[] = []
    doc.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href')
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        try {
          links.push(new URL(href, url).href)
        } catch {}
      }
    })

    // Extract metadata
    const metadata: Record<string, any> = {}
    doc.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property')
      const content = meta.getAttribute('content')
      if (name && content) {
        metadata[name] = content
      }
    })

    return {
      url,
      title: article.title,
      content: article.content,
      textContent: article.textContent,
      excerpt: article.excerpt,
      byline: article.byline || undefined,
      siteName: article.siteName || undefined,
      publishedTime: metadata['article:published_time'],
      images: images.slice(0, 20),
      links: links.slice(0, 100),
      metadata
    }
  } catch (error) {
    console.error('Content extraction error:', error)
    return null
  }
}

/**
 * Basic content extraction fallback
 */
function extractBasicContent(doc: Document, url: string): ScrapedContent {
  const title = doc.querySelector('title')?.textContent || ''

  // Get main content areas
  const main = doc.querySelector('main, article, [role="main"], .content, #content')
  const textContent = main?.textContent || doc.body?.textContent || ''

  const cleanText = textContent
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()

  return {
    url,
    title,
    content: main?.innerHTML || doc.body?.innerHTML || '',
    textContent: cleanText,
    excerpt: cleanText.slice(0, 200),
    images: [],
    links: [],
    metadata: {}
  }
}

/**
 * Parse XML sitemap
 */
export async function parseSitemap(sitemapUrl: string): Promise<SitemapEntry[]> {
  try {
    const response = await fetch(sitemapUrl)
    const xml = await response.text()

    const dom = new JSDOM(xml, { contentType: 'text/xml' })
    const doc = dom.window.document

    const entries: SitemapEntry[] = []

    // Parse sitemap URLs
    doc.querySelectorAll('url').forEach(urlNode => {
      const loc = urlNode.querySelector('loc')?.textContent
      if (loc) {
        entries.push({
          url: loc,
          lastmod: urlNode.querySelector('lastmod')?.textContent || undefined,
          changefreq: urlNode.querySelector('changefreq')?.textContent || undefined,
          priority: parseFloat(urlNode.querySelector('priority')?.textContent || '0.5')
        })
      }
    })

    // Check for sitemap index (nested sitemaps)
    const sitemaps = doc.querySelectorAll('sitemap loc')
    if (sitemaps.length > 0) {
      const nestedEntries: SitemapEntry[] = []
      for (const sitemapNode of Array.from(sitemaps)) {
        const nestedUrl = sitemapNode.textContent
        if (nestedUrl) {
          const nested = await parseSitemap(nestedUrl)
          nestedEntries.push(...nested)
        }
      }
      return nestedEntries
    }

    return entries
  } catch (error) {
    console.error('Sitemap parsing error:', error)
    return []
  }
}

/**
 * Discover URLs from a website
 */
export async function discoverURLs(baseUrl: string, maxDepth = 2): Promise<string[]> {
  const discovered = new Set<string>([baseUrl])
  const visited = new Set<string>()
  const queue: { url: string; depth: number }[] = [{ url: baseUrl, depth: 0 }]

  while (queue.length > 0 && visited.size < 100) {
    const { url, depth } = queue.shift()!

    if (visited.has(url) || depth > maxDepth) continue
    visited.add(url)

    try {
      const html = await fetchHTML(url)
      const content = await extractContent(html, url)

      if (content) {
        // Add same-domain links to queue
        const baseDomain = new URL(baseUrl).hostname
        content.links
          .filter(link => {
            try {
              const linkDomain = new URL(link).hostname
              return linkDomain === baseDomain
            } catch {
              return false
            }
          })
          .forEach(link => {
            if (!discovered.has(link)) {
              discovered.add(link)
              queue.push({ url: link, depth: depth + 1 })
            }
          })
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error)
    }
  }

  return Array.from(discovered)
}

/**
 * Extract key-value facts from text using simple heuristics
 */
export function extractSimpleFacts(content: ScrapedContent): Array<{ key: string; value: string }> {
  const facts: Array<{ key: string; value: string }> = []

  // Extract from metadata
  if (content.metadata['og:site_name']) {
    facts.push({ key: 'Site Name', value: content.metadata['og:site_name'] })
  }
  if (content.metadata['og:description'] || content.metadata['description']) {
    facts.push({
      key: 'Description',
      value: content.metadata['og:description'] || content.metadata['description']
    })
  }

  // Extract from title
  if (content.title) {
    facts.push({ key: 'Page Title', value: content.title })
  }

  // Extract structured data (simple patterns)
  const text = content.textContent

  // Email pattern
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  if (emailMatch) {
    facts.push({ key: 'Email', value: emailMatch[0] })
  }

  // Phone pattern
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  if (phoneMatch) {
    facts.push({ key: 'Phone', value: phoneMatch[0] })
  }

  return facts
}
