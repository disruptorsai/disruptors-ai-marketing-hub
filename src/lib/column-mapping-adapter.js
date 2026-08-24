/**
 * Column Mapping Adapter System
 * Handles flexible mapping between our blog management interface and Google Sheets
 */

// Our internal blog data structure (what the UI expects)
export const INTERNAL_FIELDS = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'author', label: 'Author', type: 'text', required: false },
  { key: 'category', label: 'Category', type: 'text', required: false },
  { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Published', 'Archived'], required: false },
  { key: 'publishDate', label: 'Publish Date', type: 'date', required: false },
  { key: 'excerpt', label: 'Excerpt', type: 'textarea', required: false },
  { key: 'tags', label: 'Tags', type: 'text', required: false },
  { key: 'slug', label: 'Slug', type: 'text', required: false },
  { key: 'image', label: 'Image URL', type: 'text', required: false },
  { key: 'metaDescription', label: 'Meta Description', type: 'textarea', required: false },
  { key: 'content', label: 'Content', type: 'textarea', required: false }
];

// Default column mapping - can be customized
// NOTE: Publish Date should map to column P in the Google Sheet
export const DEFAULT_COLUMN_MAPPING = {
  // Internal field -> Google Sheet column header (will be auto-detected)
  title: 'Title',
  author: 'Author',
  category: 'Category',
  status: 'Status',
  publishDate: 'P', // Column P for publish dates as specified
  excerpt: 'Excerpt',
  tags: 'Tags',
  slug: 'Slug',
  image: 'Image URL',
  metaDescription: 'Meta Description',
  content: 'Content'
};

/**
 * Auto-detect column mapping from Google Sheets headers
 * Uses fuzzy matching to find the best column matches
 */
export function autoDetectColumnMapping(sheetsHeaders) {
  const mapping = {};
  const usedColumns = new Set();

  // Helper function for fuzzy matching
  const fuzzyMatch = (internal, sheets) => {
    const internalLower = internal.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sheetsLower = sheets.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Exact match
    if (internalLower === sheetsLower) return 100;

    // Contains match
    if (sheetsLower.includes(internalLower) || internalLower.includes(sheetsLower)) return 80;

    // Similar words
    const internalWords = internalLower.split(/(?=[A-Z])/).map(w => w.toLowerCase());
    const sheetsWords = sheetsLower.split(/\s+|_|-/);

    let matchCount = 0;
    for (const iWord of internalWords) {
      for (const sWord of sheetsWords) {
        if (iWord === sWord || iWord.includes(sWord) || sWord.includes(iWord)) {
          matchCount++;
          break;
        }
      }
    }

    return (matchCount / Math.max(internalWords.length, sheetsWords.length)) * 60;
  };

  // Special mappings for common variations
  const specialMappings = {
    publishDate: ['date', 'published', 'publish', 'created', 'created_at', 'timestamp', 'p', 'column p'],
    metaDescription: ['meta', 'description', 'seo', 'meta_desc'],
    image: ['image', 'img', 'photo', 'picture', 'thumbnail'],
    excerpt: ['excerpt', 'summary', 'description', 'preview'],
    content: ['content', 'body', 'text', 'post', 'article', 'doc', 'document']
  };

  INTERNAL_FIELDS.forEach(field => {
    let bestMatch = { column: '', score: 0 };

    sheetsHeaders.forEach(header => {
      if (usedColumns.has(header)) return;

      let score = fuzzyMatch(field.label, header);

      // Check special mappings
      if (specialMappings[field.key]) {
        const specialScore = Math.max(
          ...specialMappings[field.key].map(special => fuzzyMatch(special, header))
        );
        score = Math.max(score, specialScore);
      }

      if (score > bestMatch.score && score >= 50) { // Minimum match threshold
        bestMatch = { column: header, score };
      }
    });

    if (bestMatch.column) {
      mapping[field.key] = bestMatch.column;
      usedColumns.add(bestMatch.column);
    }
  });

  return mapping;
}

/**
 * Convert Google Sheets row data to our internal format
 */
export function convertSheetsRowToBlogPost(row, headers, columnMapping, rowIndex) {
  const blogPost = { id: rowIndex + 1 };

  // Apply column mapping
  Object.entries(columnMapping).forEach(([internalField, sheetsColumn]) => {
    const columnIndex = headers.indexOf(sheetsColumn);
    if (columnIndex >= 0 && row[columnIndex] !== undefined) {
      blogPost[internalField] = row[columnIndex] || '';
    }
  });

  // Ensure required fields have defaults
  if (!blogPost.title) blogPost.title = 'Untitled';
  if (!blogPost.status) blogPost.status = 'Draft';
  if (!blogPost.author) blogPost.author = 'Unknown';
  if (!blogPost.publishDate) blogPost.publishDate = new Date().toISOString().split('T')[0];

  return blogPost;
}

/**
 * Convert blog post to Google Sheets row format
 */
export function convertBlogPostToSheetsRow(blogPost, headers, columnMapping) {
  const row = new Array(headers.length).fill('');

  Object.entries(columnMapping).forEach(([internalField, sheetsColumn]) => {
    const columnIndex = headers.indexOf(sheetsColumn);
    if (columnIndex >= 0) {
      row[columnIndex] = blogPost[internalField] || '';
    }
  });

  return row;
}

/**
 * Generate column mapping suggestions based on sheet analysis
 */
export function generateMappingSuggestions(sheetsHeaders) {
  const autoMapping = autoDetectColumnMapping(sheetsHeaders);
  const suggestions = [];

  INTERNAL_FIELDS.forEach(field => {
    const suggestion = {
      internalField: field.key,
      internalLabel: field.label,
      suggestedColumn: autoMapping[field.key] || '',
      confidence: autoMapping[field.key] ? 'High' : 'None',
      alternatives: sheetsHeaders.filter(header =>
        header !== autoMapping[field.key] &&
        header.toLowerCase().includes(field.key.toLowerCase().substring(0, 3))
      ).slice(0, 3)
    };
    suggestions.push(suggestion);
  });

  return suggestions;
}

/**
 * Validate column mapping
 */
export function validateColumnMapping(mapping, sheetsHeaders) {
  const errors = [];
  const warnings = [];

  // Check for duplicate mappings
  const usedColumns = new Set();
  Object.entries(mapping).forEach(([, column]) => {
    if (column && usedColumns.has(column)) {
      errors.push(`Column "${column}" is mapped to multiple fields`);
    }
    if (column) usedColumns.add(column);
  });

  // Check for missing required fields
  INTERNAL_FIELDS.filter(f => f.required).forEach(field => {
    if (!mapping[field.key]) {
      errors.push(`Required field "${field.label}" is not mapped`);
    }
  });

  // Check for invalid column references
  Object.entries(mapping).forEach(([, column]) => {
    if (column && !sheetsHeaders.includes(column)) {
      warnings.push(`Column "${column}" not found in sheet headers`);
    }
  });

  return { errors, warnings, isValid: errors.length === 0 };
}

export default {
  INTERNAL_FIELDS,
  DEFAULT_COLUMN_MAPPING,
  autoDetectColumnMapping,
  convertSheetsRowToBlogPost,
  convertBlogPostToSheetsRow,
  generateMappingSuggestions,
  validateColumnMapping
};