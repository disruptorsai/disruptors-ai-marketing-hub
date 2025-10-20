// SEO Audit Tool - Website Scraper
// Uses Firecrawl to extract website content and metadata

import Firecrawl from '@mendable/firecrawl-js';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || process.env.VITE_FIRECRAWL_API_KEY;

/**
 * Scrape website and extract SEO-relevant data
 * @param {string} domain - Domain to scrape (e.g., "example.com")
 * @param {function} onProgress - Callback for progress updates
 * @returns {object} Website data including content, meta tags, structure
 */
export async function scrapeWebsite(domain, onProgress = null) {
  const firecrawl = new Firecrawl(FIRECRAWL_API_KEY);

  // Ensure domain has protocol
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  const cleanDomain = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    // Step 1: Scrape homepage
    if (onProgress) onProgress({ step: 'scraping_homepage', progress: 10 });

    const homepage = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: false, // We want ALL content including nav, footer for analysis
      waitFor: 2000 // Wait for JS to load
    });

    // Step 2: Extract metadata from HTML
    if (onProgress) onProgress({ step: 'extracting_metadata', progress: 20 });

    const metadata = extractMetadata(homepage.html || homepage.markdown);
    const headings = extractHeadings(homepage.html || homepage.markdown);
    const links = extractLinks(homepage.html || homepage.markdown);
    const schema = extractSchema(homepage.html || homepage.markdown);

    // Step 3: Try to get sitemap
    if (onProgress) onProgress({ step: 'checking_sitemap', progress: 30 });

    let sitemapPages = [];
    try {
      const sitemapUrl = `${url}/sitemap.xml`;
      const sitemapResponse = await fetch(sitemapUrl);
      if (sitemapResponse.ok) {
        const sitemapText = await sitemapResponse.text();
        sitemapPages = parseSitemap(sitemapText);
      }
    } catch (e) {
      console.log('No sitemap found or error parsing:', e.message);
    }

    // Step 4: Crawl key pages (limit to 10 for speed)
    if (onProgress) onProgress({ step: 'crawling_pages', progress: 40 });

    let additionalPages = [];
    try {
      const crawlResult = await firecrawl.crawlUrl(url, {
        limit: 10,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        },
        excludePaths: ['/admin', '/login', '/cart', '/checkout'],
        maxDepth: 2
      });

      additionalPages = crawlResult.data || [];
    } catch (e) {
      console.log('Crawl error (non-fatal):', e.message);
    }

    // Step 5: Analyze content
    if (onProgress) onProgress({ step: 'analyzing_content', progress: 50 });

    const contentStats = analyzeContent(homepage.markdown, additionalPages);

    return {
      domain: cleanDomain,
      url: url,
      scrapedAt: new Date().toISOString(),

      // Homepage data
      homepage: {
        title: metadata.title,
        markdown: homepage.markdown,
        html: homepage.html,
        wordCount: (homepage.markdown || '').split(/\s+/).length
      },

      // Metadata
      metaTags: metadata,
      headings: headings,
      internalLinks: links.internal,
      externalLinks: links.external,
      schema: schema,

      // Site structure
      sitemap: {
        found: sitemapPages.length > 0,
        pageCount: sitemapPages.length,
        pages: sitemapPages.slice(0, 50) // Limit to 50 URLs
      },

      // Additional pages
      crawledPages: additionalPages.map(page => ({
        url: page.url,
        title: page.metadata?.title || 'Unknown',
        wordCount: (page.markdown || '').split(/\s+/).length
      })),

      // Content analysis
      contentStats: contentStats,

      // Technical indicators
      technical: {
        hasRobotsMeta: homepage.html?.includes('robots') || false,
        hasCanonical: !!metadata.canonical,
        hasOGTags: !!metadata.ogTitle,
        hasSchema: schema.length > 0,
        headingStructure: validateHeadingHierarchy(headings),
        mobileViewport: homepage.html?.includes('viewport') || false
      }
    };

  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape ${domain}: ${error.message}`);
  }
}

/**
 * Extract meta tags from HTML
 */
function extractMetadata(html) {
  if (!html) return {};

  const metaTags = {
    // Title
    title: extractTag(html, /<title>(.*?)<\/title>/i),

    // Standard meta tags
    description: extractMetaContent(html, 'name="description"'),
    keywords: extractMetaContent(html, 'name="keywords"'),
    author: extractMetaContent(html, 'name="author"'),
    robots: extractMetaContent(html, 'name="robots"'),
    viewport: extractMetaContent(html, 'name="viewport"'),

    // Open Graph
    ogTitle: extractMetaContent(html, 'property="og:title"'),
    ogDescription: extractMetaContent(html, 'property="og:description"'),
    ogImage: extractMetaContent(html, 'property="og:image"'),
    ogUrl: extractMetaContent(html, 'property="og:url"'),
    ogType: extractMetaContent(html, 'property="og:type"'),

    // Twitter Card
    twitterCard: extractMetaContent(html, 'name="twitter:card"'),
    twitterTitle: extractMetaContent(html, 'name="twitter:title"'),
    twitterDescription: extractMetaContent(html, 'name="twitter:description"'),
    twitterImage: extractMetaContent(html, 'name="twitter:image"'),

    // Canonical
    canonical: extractTag(html, /<link rel="canonical" href="(.*?)"/i)
  };

  return metaTags;
}

/**
 * Extract headings hierarchy
 */
function extractHeadings(html) {
  if (!html) return { h1: [], h2: [], h3: [], h4: [] };

  return {
    h1: extractTagsArray(html, /<h1[^>]*>(.*?)<\/h1>/gi),
    h2: extractTagsArray(html, /<h2[^>]*>(.*?)<\/h2>/gi),
    h3: extractTagsArray(html, /<h3[^>]*>(.*?)<\/h3>/gi),
    h4: extractTagsArray(html, /<h4[^>]*>(.*?)<\/h4>/gi)
  };
}

/**
 * Extract internal and external links
 */
function extractLinks(html) {
  if (!html) return { internal: [], external: [] };

  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>/gi;
  const links = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }

  const domain = extractDomain(html);
  const internal = links.filter(link =>
    link.startsWith('/') ||
    link.startsWith('#') ||
    (domain && link.includes(domain))
  );
  const external = links.filter(link =>
    link.startsWith('http') &&
    (!domain || !link.includes(domain))
  );

  return {
    internal: [...new Set(internal)],
    external: [...new Set(external)]
  };
}

/**
 * Extract schema.org JSON-LD
 */
function extractSchema(html) {
  if (!html) return [];

  const schemaRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gis;
  const schemas = [];
  let match;

  while ((match = schemaRegex.exec(html)) !== null) {
    try {
      const schemaData = JSON.parse(match[1]);
      schemas.push(schemaData);
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  return schemas;
}

/**
 * Analyze content statistics
 */
function analyzeContent(homepageMarkdown, additionalPages) {
  const allContent = [
    homepageMarkdown,
    ...additionalPages.map(p => p.markdown || '')
  ].join(' ');

  const words = allContent.split(/\s+/).filter(Boolean);
  const sentences = allContent.split(/[.!?]+/).filter(Boolean);

  return {
    totalWords: words.length,
    totalSentences: sentences.length,
    averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
    uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
    readabilityScore: calculateReadability(words.length, sentences.length)
  };
}

/**
 * Validate heading hierarchy (should go h1 -> h2 -> h3, no skipping)
 */
function validateHeadingHierarchy(headings) {
  const hasH1 = headings.h1.length > 0;
  const multipleH1 = headings.h1.length > 1;
  const hasH2 = headings.h2.length > 0;
  const hasH3 = headings.h3.length > 0;

  return {
    valid: hasH1 && !multipleH1,
    hasH1: hasH1,
    h1Count: headings.h1.length,
    multipleH1Warning: multipleH1,
    h2Count: headings.h2.length,
    h3Count: headings.h3.length,
    h4Count: headings.h4.length
  };
}

/**
 * Calculate simple readability score (0-100, higher is easier to read)
 */
function calculateReadability(wordCount, sentenceCount) {
  if (sentenceCount === 0) return 50;

  const avgWordsPerSentence = wordCount / sentenceCount;

  // Flesch Reading Ease approximation (simplified)
  // 90-100: Very easy
  // 60-70: Standard
  // 0-30: Very difficult
  const score = 206.835 - (1.015 * avgWordsPerSentence);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Helper: Extract tag content
 */
function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Helper: Extract meta tag content
 */
function extractMetaContent(html, attribute) {
  const regex = new RegExp(`<meta\\s+${attribute}\\s+content="([^"]*)"`, 'i');
  return extractTag(html, regex);
}

/**
 * Helper: Extract multiple tags as array
 */
function extractTagsArray(html, regex) {
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) matches.push(text);
  }
  return matches;
}

/**
 * Helper: Extract domain from HTML (from canonical or og:url)
 */
function extractDomain(html) {
  const canonical = extractTag(html, /<link rel="canonical" href="(.*?)"/i);
  if (canonical) {
    try {
      return new URL(canonical).hostname;
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Parse XML sitemap
 */
function parseSitemap(xml) {
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  const urls = [];
  let match;

  while ((match = urlRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}
