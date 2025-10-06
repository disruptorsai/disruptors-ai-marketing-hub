/**
 * Graveyard Archive System
 *
 * Handles automatic archiving of deleted/removed sections from the website.
 * Provides utilities to store, retrieve, and restore archived content.
 */

import { customClient } from './custom-sdk.js';
import { supabase } from './supabase-client.js';

/**
 * Archive a deleted section to the graveyard
 *
 * @param {Object} params - Archive parameters
 * @param {Object} params.sectionContent - The full content of the section being archived (stored as JSON)
 * @param {string} params.removedFromPage - The page/route where the section was removed from (e.g., '/home', '/about')
 * @param {string} params.sectionType - Type of section (e.g., 'hero', 'features', 'testimonials', 'alternating-layout')
 * @param {string} params.sectionName - Optional friendly name for the section
 * @param {Object} params.metadata - Optional metadata (e.g., position, reason for removal, dependencies)
 * @returns {Promise<Object>} The archived section record
 *
 * @example
 * await archiveSection({
 *   sectionContent: {
 *     kicker: "INNOVATION",
 *     headline: "Old Headline",
 *     body: "Old body text...",
 *     video: "https://example.com/video.mp4"
 *   },
 *   removedFromPage: '/home',
 *   sectionType: 'alternating-layout',
 *   sectionName: 'Innovation Section',
 *   metadata: {
 *     position: 2,
 *     reason: 'Updated with new messaging',
 *     dependencies: ['video-asset-xyz']
 *   }
 * });
 */
export async function archiveSection({
  sectionContent,
  removedFromPage,
  sectionType = 'unknown',
  sectionName = null,
  metadata = {}
}) {
  try {
    // Validate required parameters
    if (!sectionContent || typeof sectionContent !== 'object') {
      throw new Error('sectionContent must be a valid object');
    }

    if (!removedFromPage || typeof removedFromPage !== 'string') {
      throw new Error('removedFromPage must be a valid string');
    }

    // Get current user if authenticated (optional)
    let currentUserId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      currentUserId = user?.id || null;
    } catch (error) {
      // User not authenticated - that's okay for archiving
      console.log('Archiving without user authentication');
    }

    // Enrich metadata with timestamp and environment info
    const enrichedMetadata = {
      ...metadata,
      archivedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      environment: import.meta.env.MODE || 'production'
    };

    // Create the archive record using custom SDK
    const archiveEntity = customClient.entities.ArchivedSection;
    const archivedRecord = await archiveEntity.create({
      section_content: sectionContent,
      removed_from_page: removedFromPage,
      section_type: sectionType,
      section_name: sectionName,
      metadata: enrichedMetadata,
      removed_by: currentUserId,
      removed_at: new Date().toISOString()
    });

    console.log(`✅ Section archived successfully: ${sectionName || sectionType} from ${removedFromPage}`);

    return archivedRecord;
  } catch (error) {
    console.error('❌ Failed to archive section:', error);
    throw new Error(`Archive failed: ${error.message}`);
  }
}

/**
 * Get all archived sections with optional filtering
 *
 * @param {Object} params - Query parameters
 * @param {string} params.removedFromPage - Filter by specific page (optional)
 * @param {string} params.sectionType - Filter by section type (optional)
 * @param {number} params.limit - Maximum number of records to return (default: 100)
 * @param {string} params.orderBy - Order by field (default: '-removed_at' for newest first)
 * @returns {Promise<Array>} Array of archived sections
 *
 * @example
 * // Get all archived sections from home page
 * const homeArchives = await getArchivedSections({ removedFromPage: '/home' });
 *
 * // Get all hero sections
 * const heroArchives = await getArchivedSections({ sectionType: 'hero' });
 *
 * // Get latest 10 archived sections
 * const recentArchives = await getArchivedSections({ limit: 10 });
 */
export async function getArchivedSections({
  removedFromPage = null,
  sectionType = null,
  limit = 100,
  orderBy = '-removed_at'
} = {}) {
  try {
    const archiveEntity = customClient.entities.ArchivedSection;

    // Build filter conditions
    const conditions = {};
    if (removedFromPage) {
      conditions.removed_from_page = removedFromPage;
    }
    if (sectionType) {
      conditions.section_type = sectionType;
    }

    // Get filtered or all archived sections
    let archivedSections;
    if (Object.keys(conditions).length > 0) {
      archivedSections = await archiveEntity.filter(conditions, orderBy, limit);
    } else {
      archivedSections = await archiveEntity.list(orderBy, limit);
    }

    return archivedSections;
  } catch (error) {
    console.error('❌ Failed to retrieve archived sections:', error);
    // Return empty array on error for graceful degradation
    return [];
  }
}

/**
 * Get a single archived section by ID
 *
 * @param {string} id - Archive record ID
 * @returns {Promise<Object|null>} The archived section or null if not found
 *
 * @example
 * const archive = await getArchivedSection('123e4567-e89b-12d3-a456-426614174000');
 */
export async function getArchivedSection(id) {
  try {
    if (!id) {
      throw new Error('Archive ID is required');
    }

    const archiveEntity = customClient.entities.ArchivedSection;
    const archivedSection = await archiveEntity.get(id);

    return archivedSection;
  } catch (error) {
    console.error(`❌ Failed to retrieve archived section ${id}:`, error);
    return null;
  }
}

/**
 * Restore an archived section (returns the content for manual restoration)
 *
 * Note: This function returns the section content but does NOT automatically
 * re-add it to the page. Manual restoration is required to ensure proper
 * integration with current page structure.
 *
 * @param {string} id - Archive record ID
 * @returns {Promise<Object|null>} The section content ready for restoration
 *
 * @example
 * const restoredContent = await restoreSection('123e4567-e89b-12d3-a456-426614174000');
 * if (restoredContent) {
 *   // Manually add restoredContent back to your page data
 *   console.log('Section content:', restoredContent);
 * }
 */
export async function restoreSection(id) {
  try {
    const archivedSection = await getArchivedSection(id);

    if (!archivedSection) {
      console.warn(`Archive record ${id} not found`);
      return null;
    }

    console.log(`📦 Restored section from ${archivedSection.removed_from_page}:`, archivedSection.section_name || archivedSection.section_type);

    // Return the section content for manual restoration
    return {
      content: archivedSection.section_content,
      metadata: {
        originalPage: archivedSection.removed_from_page,
        sectionType: archivedSection.section_type,
        sectionName: archivedSection.section_name,
        removedAt: archivedSection.removed_at,
        archiveId: archivedSection.id
      }
    };
  } catch (error) {
    console.error(`❌ Failed to restore section ${id}:`, error);
    return null;
  }
}

/**
 * Delete an archived section permanently
 *
 * WARNING: This permanently deletes the archive. Only use if you're certain
 * the section will never be needed again.
 *
 * @param {string} id - Archive record ID
 * @returns {Promise<boolean>} True if deletion was successful
 *
 * @example
 * const deleted = await deleteArchivedSection('123e4567-e89b-12d3-a456-426614174000');
 */
export async function deleteArchivedSection(id) {
  try {
    if (!id) {
      throw new Error('Archive ID is required');
    }

    const archiveEntity = customClient.entities.ArchivedSection;
    await archiveEntity.delete(id);

    console.log(`🗑️ Permanently deleted archived section ${id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete archived section ${id}:`, error);
    return false;
  }
}

/**
 * Get statistics about archived sections
 *
 * @returns {Promise<Object>} Archive statistics
 *
 * @example
 * const stats = await getArchiveStats();
 * // {
 * //   totalArchived: 42,
 * //   byPage: { '/home': 12, '/about': 8, ... },
 * //   byType: { 'hero': 5, 'alternating-layout': 15, ... },
 * //   mostRecentArchive: '2025-10-06T12:30:00Z'
 * // }
 */
export async function getArchiveStats() {
  try {
    const allArchives = await getArchivedSections({ limit: 1000 });

    const stats = {
      totalArchived: allArchives.length,
      byPage: {},
      byType: {},
      mostRecentArchive: allArchives[0]?.removed_at || null
    };

    // Count by page
    allArchives.forEach(archive => {
      const page = archive.removed_from_page || 'unknown';
      stats.byPage[page] = (stats.byPage[page] || 0) + 1;
    });

    // Count by type
    allArchives.forEach(archive => {
      const type = archive.section_type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('❌ Failed to get archive stats:', error);
    return {
      totalArchived: 0,
      byPage: {},
      byType: {},
      mostRecentArchive: null
    };
  }
}

/**
 * Batch archive multiple sections at once
 *
 * Useful when removing multiple sections from a page simultaneously.
 *
 * @param {Array<Object>} sections - Array of section archive objects
 * @returns {Promise<Array>} Array of archived records
 *
 * @example
 * const archived = await batchArchiveSections([
 *   {
 *     sectionContent: { ... },
 *     removedFromPage: '/home',
 *     sectionType: 'hero',
 *     sectionName: 'Old Hero'
 *   },
 *   {
 *     sectionContent: { ... },
 *     removedFromPage: '/home',
 *     sectionType: 'features',
 *     sectionName: 'Old Features'
 *   }
 * ]);
 */
export async function batchArchiveSections(sections) {
  try {
    if (!Array.isArray(sections) || sections.length === 0) {
      throw new Error('sections must be a non-empty array');
    }

    console.log(`📦 Batch archiving ${sections.length} sections...`);

    const results = await Promise.all(
      sections.map(section => archiveSection(section))
    );

    console.log(`✅ Successfully archived ${results.length} sections`);
    return results;
  } catch (error) {
    console.error('❌ Batch archive failed:', error);
    throw error;
  }
}

// Export all functions as default object for convenience
export default {
  archiveSection,
  getArchivedSections,
  getArchivedSection,
  restoreSection,
  deleteArchivedSection,
  getArchiveStats,
  batchArchiveSections
};
