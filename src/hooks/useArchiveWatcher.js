/**
 * useArchiveWatcher Hook
 *
 * React hook that monitors for section deletions and automatically archives them.
 * Compares previous and current page state to detect removed sections.
 *
 * Usage:
 * ```jsx
 * import useArchiveWatcher from '@/hooks/useArchiveWatcher';
 *
 * function MyPage() {
 *   const [sections, setSections] = useState([...]);
 *
 *   // Enable automatic archiving for this page
 *   useArchiveWatcher({
 *     data: sections,
 *     pageName: '/my-page',
 *     enabled: true
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { archiveSection } from '@/lib/graveyard-archive';

/**
 * Hook to automatically detect and archive removed sections
 *
 * @param {Object} options - Configuration options
 * @param {Array|Object} options.data - Current page data (sections array or full page state)
 * @param {string} options.pageName - Name/route of the page (e.g., '/home', '/about')
 * @param {boolean} options.enabled - Whether archiving is enabled (default: true)
 * @param {Function} options.getKey - Function to extract unique key from section (default: uses index)
 * @param {Function} options.getSectionType - Function to determine section type (default: tries common patterns)
 * @param {Function} options.getSectionName - Function to get friendly section name (default: tries common patterns)
 * @param {Function} options.onArchive - Callback fired after archiving (receives archived section)
 */
export default function useArchiveWatcher({
  data,
  pageName,
  enabled = true,
  getKey = (section, index) => section?.id || section?.key || index,
  getSectionType = (section) => {
    // Try to auto-detect section type from common patterns
    if (section?.kicker && section?.headline) return 'alternating-layout';
    if (section?.title && section?.items) return 'features';
    if (section?.testimonial || section?.review) return 'testimonial';
    if (section?.video && section?.heading) return 'hero';
    if (section?.image && section?.content) return 'image-content';
    return 'unknown';
  },
  getSectionName = (section) => {
    // Try to auto-detect section name from common patterns
    return section?.sectionName || section?.name || section?.headline || section?.title || null;
  },
  onArchive = null
}) {
  // Store previous data in ref to compare with current data
  const previousDataRef = useRef(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // Skip on first render (no previous data to compare)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousDataRef.current = data;
      return;
    }

    // Skip if archiving is disabled
    if (!enabled) {
      previousDataRef.current = data;
      return;
    }

    // Skip if data is not an array (we can only monitor array-based sections)
    if (!Array.isArray(data)) {
      console.warn('useArchiveWatcher: data must be an array to detect removals');
      previousDataRef.current = data;
      return;
    }

    // Skip if no previous data
    if (!previousDataRef.current) {
      previousDataRef.current = data;
      return;
    }

    // Convert previous data to array if needed
    const previousData = Array.isArray(previousDataRef.current) ? previousDataRef.current : [];
    const currentData = data;

    // Detect removed sections by comparing keys
    const previousKeys = new Set(previousData.map((section, index) => getKey(section, index)));
    const currentKeys = new Set(currentData.map((section, index) => getKey(section, index)));

    // Find sections that were in previous but not in current (i.e., removed)
    const removedSections = previousData.filter((section, index) => {
      const key = getKey(section, index);
      return !currentKeys.has(key);
    });

    // Archive each removed section
    if (removedSections.length > 0) {
      console.log(`🗑️ Detected ${removedSections.length} removed section(s) from ${pageName}`);

      removedSections.forEach(async (section, index) => {
        try {
          const sectionType = getSectionType(section);
          const sectionName = getSectionName(section);

          const archived = await archiveSection({
            sectionContent: section,
            removedFromPage: pageName,
            sectionType,
            sectionName,
            metadata: {
              previousPosition: previousData.findIndex((s, i) => getKey(s, i) === getKey(section, index)),
              detectedBy: 'useArchiveWatcher',
              removedCount: removedSections.length
            }
          });

          console.log(`✅ Auto-archived: ${sectionName || sectionType} from ${pageName}`);

          // Fire callback if provided
          if (onArchive && typeof onArchive === 'function') {
            onArchive(archived);
          }
        } catch (error) {
          console.error('Failed to auto-archive section:', error);
        }
      });
    }

    // Update previous data ref
    previousDataRef.current = data;
  }, [data, enabled, pageName]); // Re-run when data, enabled, or pageName changes

  // Return utility functions for manual control
  return {
    /**
     * Manually trigger archiving of a specific section
     */
    manualArchive: async (section, sectionType = 'manual', sectionName = null) => {
      try {
        const archived = await archiveSection({
          sectionContent: section,
          removedFromPage: pageName,
          sectionType,
          sectionName,
          metadata: {
            manuallyTriggered: true
          }
        });

        if (onArchive && typeof onArchive === 'function') {
          onArchive(archived);
        }

        return archived;
      } catch (error) {
        console.error('Manual archive failed:', error);
        throw error;
      }
    },

    /**
     * Reset the watcher (useful after bulk updates)
     */
    reset: () => {
      previousDataRef.current = data;
      isFirstRenderRef.current = true;
    }
  };
}
