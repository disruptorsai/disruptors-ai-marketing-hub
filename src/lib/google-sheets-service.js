/**
 * Google Sheets Integration Service with Adaptive Column Mapping
 * Handles pull/push operations between the blog management system and Google Sheets
 */

import {
  autoDetectColumnMapping,
  convertSheetsRowToBlogPost,
  convertBlogPostToSheetsRow,
  generateMappingSuggestions,
  validateColumnMapping,
  DEFAULT_COLUMN_MAPPING
} from './column-mapping-adapter.js';

import {
  fetchGoogleDocContent,
  isGoogleDocsUrl
} from './google-docs-service.js';

const GOOGLE_SHEETS_ID = '1KWGeHUOjKtYINSqeneEF8U9hKjEs3U1UTUPaff6OWpA';
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
// Try multiple common sheet names, starting with the known one
const POSSIBLE_SHEET_NAMES = ['content', 'Sheet1', 'Blog Posts', 'Posts', 'Data', 'Main'];

// Store the current column mapping (will be auto-detected)
let currentColumnMapping = { ...DEFAULT_COLUMN_MAPPING };
let lastDetectedHeaders = [];

/**
 * Get Google Sheets data using the Sheets API with auto-detection of sheet name
 * @param {string} range - The range to fetch (e.g., 'A:K')
 * @returns {Promise<Array>} Array of rows
 */
export async function fetchGoogleSheetsData(range = 'A:Z') {
  if (!API_KEY) {
    throw new Error('Google Sheets API key not configured. Please set VITE_GOOGLE_SHEETS_API_KEY in your environment variables.');
  }

  // Try different sheet names until one works
  for (const sheetName of POSSIBLE_SHEET_NAMES) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${sheetName}!${range}?key=${API_KEY}`;
      console.log(`Trying to fetch from sheet: "${sheetName}"`);

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully connected to sheet: "${sheetName}"`);
        return data.values || [];
      } else {
        console.log(`Sheet "${sheetName}" not found or accessible (${response.status})`);
      }
    } catch (error) {
      console.log(`Failed to access sheet "${sheetName}":`, error.message);
    }
  }

  // If no sheet names worked, try without a sheet name (first sheet)
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${range}?key=${API_KEY}`;
    console.log('Trying to fetch from default/first sheet');

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      console.log('Successfully connected to default sheet');
      return data.values || [];
    } else if (response.status === 400) {
      // More detailed error for 400 status
      const errorData = await response.json().catch(() => null);
      throw new Error(`Google Sheets API error: ${response.status}. Please ensure:
1. Your Google Sheet is shared as "Anyone with the link can view"
2. The sheet ID is correct: ${GOOGLE_SHEETS_ID}
3. Your API key has proper permissions
${errorData ? `API Response: ${JSON.stringify(errorData)}` : ''}`);
    } else {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

/**
 * Analyze sheet structure and auto-detect column mapping
 * @param {Array} headers - Sheet headers from first row
 * @returns {Object} Detection results with mapping and suggestions
 */
export function analyzeSheetStructure(headers) {
  lastDetectedHeaders = [...headers];
  const autoMapping = autoDetectColumnMapping(headers);
  const suggestions = generateMappingSuggestions(headers);
  const validation = validateColumnMapping(autoMapping, headers);

  // Update current mapping with auto-detected values
  currentColumnMapping = { ...autoMapping };

  return {
    detectedHeaders: headers,
    autoMapping,
    suggestions,
    validation,
    mappingConfidence: Object.keys(autoMapping).length / 11 // 11 is total internal fields
  };
}

/**
 * Convert Google Sheets rows to our blog post format using adaptive mapping
 * @param {Array} rows - Raw rows from Google Sheets
 * @returns {Array} Array of blog post objects
 */
export function convertSheetsDataToBlogPosts(rows) {
  if (!rows || rows.length === 0) return [];

  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Auto-detect mapping if headers have changed
  if (JSON.stringify(headers) !== JSON.stringify(lastDetectedHeaders)) {
    analyzeSheetStructure(headers);
  }

  return dataRows.map((row, index) =>
    convertSheetsRowToBlogPost(row, headers, currentColumnMapping, index)
  );
}

/**
 * Convert blog posts to Google Sheets format using current mapping
 * @param {Array} blogPosts - Array of blog post objects
 * @returns {Array} Array of rows for Google Sheets
 */
export function convertBlogPostsToSheetsData(blogPosts) {
  if (!blogPosts || blogPosts.length === 0) return [];

  // Use existing headers from the sheet, or create new ones
  const headers = lastDetectedHeaders.length > 0 ? lastDetectedHeaders : Object.values(currentColumnMapping);
  const rows = [headers];

  blogPosts.forEach(post => {
    const row = convertBlogPostToSheetsRow(post, headers, currentColumnMapping);
    rows.push(row);
  });

  return rows;
}

/**
 * Pull blog data from Google Sheets with automatic Google Docs content fetching
 * @param {boolean} fetchDocsContent - Whether to auto-fetch content from Google Docs URLs (default: true)
 * @returns {Promise<Array>} Array of blog post objects
 */
export async function pullBlogDataFromSheets(fetchDocsContent = true) {
  try {
    const rows = await fetchGoogleSheetsData();
    const blogPosts = convertSheetsDataToBlogPosts(rows);

    console.log(`Successfully pulled ${blogPosts.length} blog posts from Google Sheets`);

    // Auto-fetch Google Docs content if enabled
    if (fetchDocsContent) {
      console.log('Checking for Google Docs URLs in content fields...');

      const postsWithDocs = [];
      for (let i = 0; i < blogPosts.length; i++) {
        const post = blogPosts[i];

        // Check if content field contains a Google Docs URL
        if (post.content && isGoogleDocsUrl(post.content)) {
          postsWithDocs.push({ index: i, post, docUrl: post.content });
        }
      }

      if (postsWithDocs.length > 0) {
        console.log(`Found ${postsWithDocs.length} posts with Google Docs URLs. Fetching content...`);

        for (const { index, post, docUrl } of postsWithDocs) {
          try {
            console.log(`Fetching content for "${post.title || 'Untitled'}"...`);
            const docData = await fetchGoogleDocContent(docUrl);

            // Update the post with fetched content
            blogPosts[index].content = docData.content;

            // Update read time if not already set
            if (!blogPosts[index].readTime || blogPosts[index].readTime === '') {
              blogPosts[index].readTime = docData.metadata.readTime;
            }

            console.log(`✓ Successfully fetched content for "${post.title || 'Untitled'}" (${docData.metadata.wordCount} words)`);
          } catch (error) {
            console.error(`✗ Failed to fetch content for "${post.title || 'Untitled'}":`, error.message);
            // Keep the URL as content if fetch fails
            blogPosts[index].content = `<p><em>Content could not be loaded from: ${docUrl}</em></p><p>Error: ${error.message}</p>`;
          }
        }

        console.log(`Completed fetching Google Docs content. ${postsWithDocs.length} documents processed.`);
      } else {
        console.log('No Google Docs URLs found in content fields.');
      }
    }

    return blogPosts;
  } catch (error) {
    console.error('Error pulling blog data from Google Sheets:', error);
    throw error;
  }
}

/**
 * Push blog data to Google Sheets
 * Note: This requires OAuth2 authentication and write permissions
 * For now, this is a placeholder that logs what would be sent
 * @param {Array} blogPosts - Array of blog post objects
 * @returns {Promise<boolean>} Success status
 */
export async function pushBlogDataToSheets(blogPosts) {
  try {
    const sheetsData = convertBlogPostsToSheetsData(blogPosts);

    console.log('Data that would be pushed to Google Sheets:', sheetsData);

    // TODO: Implement actual push functionality
    // This requires OAuth2 authentication and the Sheets API with write permissions
    // For now, we'll simulate success after logging the data

    console.log(`Would push ${blogPosts.length} blog posts to Google Sheets`);

    // For demonstration, you can copy the logged data manually to your Google Sheet
    const csvData = sheetsData.map(row =>
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    console.log('CSV format for manual import:');
    console.log(csvData);

    return true;
  } catch (error) {
    console.error('Error pushing blog data to Google Sheets:', error);
    throw error;
  }
}

/**
 * Initialize Google Sheets integration
 * Validates API key and connection
 * @returns {Promise<boolean>} Whether initialization was successful
 */
export async function initializeGoogleSheetsIntegration() {
  if (!API_KEY) {
    console.warn('Google Sheets API key not configured');
    return false;
  }

  try {
    // Test the connection by fetching just the first row
    await fetchGoogleSheetsData('A1:Z1');
    console.log('Google Sheets integration initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Google Sheets integration:', error);
    return false;
  }
}

/**
 * Get current column mapping
 * @returns {Object} Current column mapping
 */
export function getCurrentColumnMapping() {
  return { ...currentColumnMapping };
}

/**
 * Set custom column mapping
 * @param {Object} mapping - Custom column mapping
 */
export function setColumnMapping(mapping) {
  currentColumnMapping = { ...mapping };
}

/**
 * Get sheet analysis results
 * @returns {Promise<Object>} Analysis results with mapping suggestions
 */
export async function getSheetAnalysis() {
  try {
    const rows = await fetchGoogleSheetsData('A1:Z1'); // Get just the header row
    if (rows.length > 0) {
      return analyzeSheetStructure(rows[0]);
    }
    return null;
  } catch (error) {
    console.error('Error analyzing sheet structure:', error);
    throw error;
  }
}

export default {
  pullBlogDataFromSheets,
  pushBlogDataToSheets,
  initializeGoogleSheetsIntegration,
  fetchGoogleSheetsData,
  convertSheetsDataToBlogPosts,
  convertBlogPostsToSheetsData,
  analyzeSheetStructure,
  getCurrentColumnMapping,
  setColumnMapping,
  getSheetAnalysis
};