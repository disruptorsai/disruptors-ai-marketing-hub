/**
 * Google Docs API Integration Service
 * Fetches and converts Google Docs content to HTML for blog posts
 */

const GOOGLE_DOCS_API_KEY = import.meta.env.VITE_GOOGLE_DOCS_API_KEY || import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

/**
 * Extract Google Doc ID from various URL formats
 * @param {string} url - Google Docs URL
 * @returns {string|null} Document ID or null if invalid
 */
export function extractDocIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;

  // Handle various Google Docs URL formats
  const patterns = [
    /docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/,
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9-_]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's already just an ID
  if (/^[a-zA-Z0-9-_]{25,}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Check if a string looks like a Google Docs URL
 * @param {string} text - Text to check
 * @returns {boolean}
 */
export function isGoogleDocsUrl(text) {
  if (!text || typeof text !== 'string') return false;
  return /docs\.google\.com\/document|drive\.google\.com/.test(text);
}

/**
 * Fetch Google Doc content as HTML using export endpoint
 * This uses the public export API which works for publicly shared docs
 * @param {string} docId - Google Doc ID
 * @returns {Promise<string>} HTML content
 */
export async function fetchGoogleDocAsHtml(docId) {
  if (!docId) {
    throw new Error('Document ID is required');
  }

  // Use the public export endpoint (works for docs shared as "anyone with link can view")
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;

  try {
    const response = await fetch(exportUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}. Make sure the document is shared as "Anyone with the link can view".`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error fetching Google Doc:', error);
    throw error;
  }
}

/**
 * Clean and convert Google Docs HTML to blog-friendly HTML
 * Removes Google's styling and keeps semantic structure
 * @param {string} googleHtml - Raw HTML from Google Docs
 * @returns {string} Cleaned HTML suitable for blog content
 */
export function cleanGoogleDocsHtml(googleHtml) {
  if (!googleHtml) return '';

  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(googleHtml, 'text/html');

  // Remove unwanted elements
  const removeSelectors = [
    'style',
    'script',
    'meta',
    'link',
    'title',
    '.c0', // Google Docs style classes
    '.c1',
    '.c2',
    '.c3',
    '.c4',
    '.c5',
    '.c6',
    '.c7',
    '.c8',
    '.c9'
  ];

  removeSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Get the body content
  const body = doc.body;
  if (!body) return '';

  // Remove inline styles but keep structure
  body.querySelectorAll('[style]').forEach(el => {
    el.removeAttribute('style');
  });

  // Remove class attributes
  body.querySelectorAll('[class]').forEach(el => {
    el.removeAttribute('class');
  });

  // Clean up empty paragraphs
  body.querySelectorAll('p:empty, span:empty').forEach(el => {
    if (!el.textContent.trim()) el.remove();
  });

  // Convert Google Docs specific elements to semantic HTML
  body.querySelectorAll('span[style*="font-weight"]').forEach(el => {
    if (el.style.fontWeight === 'bold' || el.style.fontWeight >= 700) {
      const strong = doc.createElement('strong');
      strong.innerHTML = el.innerHTML;
      el.replaceWith(strong);
    }
  });

  body.querySelectorAll('span[style*="font-style"]').forEach(el => {
    if (el.style.fontStyle === 'italic') {
      const em = doc.createElement('em');
      em.innerHTML = el.innerHTML;
      el.replaceWith(em);
    }
  });

  // Ensure proper heading structure
  for (let i = 1; i <= 6; i++) {
    body.querySelectorAll(`h${i}`).forEach(heading => {
      heading.removeAttribute('id');
      heading.removeAttribute('class');
      heading.removeAttribute('style');
    });
  }

  // Clean up links
  body.querySelectorAll('a').forEach(link => {
    link.removeAttribute('style');
    link.removeAttribute('class');
    // Ensure external links open in new tab
    if (link.href && !link.href.startsWith(window.location.origin)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Handle lists properly
  body.querySelectorAll('ul, ol').forEach(list => {
    list.removeAttribute('style');
    list.removeAttribute('class');
  });

  // Handle images
  body.querySelectorAll('img').forEach(img => {
    img.removeAttribute('style');
    img.removeAttribute('class');
    // Add responsive image class (will be styled by prose)
    img.setAttribute('loading', 'lazy');
  });

  // Handle tables
  body.querySelectorAll('table').forEach(table => {
    table.removeAttribute('style');
    table.removeAttribute('class');
  });

  // Remove Google Docs artifacts
  body.querySelectorAll('[id^="cmnt"]').forEach(el => el.remove());
  body.querySelectorAll('[id^="ftnt"]').forEach(el => el.remove());

  // Get cleaned HTML
  let cleanedHtml = body.innerHTML;

  // Additional text-based cleaning
  cleanedHtml = cleanedHtml
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
    .replace(/<span>/g, '').replace(/<\/span>/g, '') // Remove empty spans
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .trim();

  return cleanedHtml;
}

/**
 * Fetch and process Google Doc content
 * Main function to get clean, blog-ready HTML from a Google Doc
 * @param {string} docUrlOrId - Google Docs URL or document ID
 * @returns {Promise<Object>} Object with content and metadata
 */
export async function fetchGoogleDocContent(docUrlOrId) {
  try {
    // Extract doc ID if URL provided
    const docId = extractDocIdFromUrl(docUrlOrId) || docUrlOrId;

    if (!docId) {
      throw new Error('Invalid Google Docs URL or ID');
    }

    console.log(`Fetching Google Doc content for ID: ${docId}`);

    // Fetch raw HTML
    const rawHtml = await fetchGoogleDocAsHtml(docId);

    // Clean and convert to blog-friendly HTML
    const cleanHtml = cleanGoogleDocsHtml(rawHtml);

    // Extract title from the document if available
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const title = doc.querySelector('title')?.textContent || '';

    // Calculate estimated read time (assuming 200 words per minute)
    const wordCount = cleanHtml.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    console.log(`Successfully fetched and cleaned document. Word count: ${wordCount}, Read time: ${readTime} min`);

    return {
      content: cleanHtml,
      metadata: {
        docId,
        title,
        wordCount,
        readTime: `${readTime} min read`,
        fetchedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching Google Doc content:', error);
    throw new Error(`Failed to fetch Google Doc: ${error.message}`);
  }
}

/**
 * Batch fetch multiple Google Docs
 * @param {Array<string>} docUrls - Array of Google Docs URLs or IDs
 * @returns {Promise<Array<Object>>} Array of results
 */
export async function batchFetchGoogleDocs(docUrls) {
  const results = await Promise.allSettled(
    docUrls.map(url => fetchGoogleDocContent(url))
  );

  return results.map((result, index) => ({
    url: docUrls[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
}

/**
 * Validate that a Google Doc is accessible
 * @param {string} docUrlOrId - Google Docs URL or ID
 * @returns {Promise<boolean>} True if accessible, false otherwise
 */
export async function validateDocAccess(docUrlOrId) {
  try {
    const docId = extractDocIdFromUrl(docUrlOrId) || docUrlOrId;
    if (!docId) return false;

    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;
    const response = await fetch(exportUrl, { method: 'HEAD' });

    return response.ok;
  } catch {
    return false;
  }
}

export default {
  extractDocIdFromUrl,
  isGoogleDocsUrl,
  fetchGoogleDocAsHtml,
  cleanGoogleDocsHtml,
  fetchGoogleDocContent,
  batchFetchGoogleDocs,
  validateDocAccess
};