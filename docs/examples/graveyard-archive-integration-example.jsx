/**
 * Graveyard Archive Integration Example
 *
 * This file demonstrates how to integrate the Graveyard Archive system
 * into an existing page component (using Home.jsx as an example).
 *
 * USAGE:
 * 1. Import the useArchiveWatcher hook
 * 2. Add the hook to your component with appropriate configuration
 * 3. Sections will automatically be archived when removed from state
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AlternatingLayout from '@/components/shared/AlternatingLayout';
import useArchiveWatcher from '@/hooks/useArchiveWatcher';

export default function HomeWithArchiving() {
  const [alternatingData, setAlternatingData] = useState([
    {
      id: 'revolution-section',
      kicker: "REVOLUTION",
      headline: "Transform Your Business with AI",
      body: "We combine deep marketing expertise with cutting-edge AI systems to create flexible growth strategies that scale your business beyond current limitations.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/c_fill,ar_4:3,g_auto/v1759259177/...",
      imageAlt: "AI Technology Transformation",
      backgroundColor: "bg-transparent backdrop-blur-md",
      textColor: "text-black",
      cta: {
        label: "Start Your Transformation",
        link: "book-strategy-session"
      }
    },
    {
      id: 'partnership-section',
      kicker: "PARTNERSHIP",
      headline: "More Than an Agency. Your Growth Partner.",
      body: "We help companies generate leads, streamline operations, and scale using AI-powered systems—all with complete transparency so you stay in control of your growth journey.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/c_fill,ar_4:3,g_auto/v1759259179/...",
      imageAlt: "Growth Partnership Visualization",
      backgroundColor: "bg-transparent backdrop-blur-sm",
      textColor: "text-black"
    },
    {
      id: 'innovation-section',
      kicker: "INNOVATION",
      headline: "Cutting-Edge AI Solutions",
      body: "From automated lead generation to intelligent customer insights, we deploy the latest AI technologies to give your business a competitive edge in the digital marketplace.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259181/...",
      imageAlt: "AI Innovation Technology",
      backgroundColor: "bg-gray-900",
      textColor: "text-white"
    }
  ]);

  // ============================================================
  // GRAVEYARD ARCHIVE INTEGRATION
  // ============================================================

  // Enable automatic archiving for this page
  const { manualArchive, reset } = useArchiveWatcher({
    // Data to watch for changes
    data: alternatingData,

    // Page identifier (used in archive records)
    pageName: '/home',

    // Enable/disable archiving (recommended: dev mode only)
    enabled: import.meta.env.MODE === 'development',

    // Extract unique identifier from each section
    getKey: (section, index) => section.id || `section-${index}`,

    // Determine section type (for categorization)
    getSectionType: (section) => 'alternating-layout',

    // Extract friendly name for the section
    getSectionName: (section) => section.headline || section.kicker,

    // Callback after archiving (optional)
    onArchive: (archivedSection) => {
      console.log('✅ Section archived:', archivedSection.section_name);
      // You could show a toast notification here:
      // toast.success(`Archived: ${archivedSection.section_name}`);
    }
  });

  // ============================================================
  // SECTION MANAGEMENT FUNCTIONS
  // ============================================================

  /**
   * Remove a section by ID
   * The useArchiveWatcher hook will automatically detect and archive it
   */
  const removeSection = (sectionId) => {
    setAlternatingData(prev => prev.filter(section => section.id !== sectionId));
    console.log(`🗑️ Removed section: ${sectionId} (automatically archived)`);
  };

  /**
   * Remove a section by index
   */
  const removeSectionByIndex = (index) => {
    const section = alternatingData[index];
    setAlternatingData(prev => prev.filter((_, i) => i !== index));
    console.log(`🗑️ Removed section at index ${index}: ${section.headline}`);
  };

  /**
   * Manually archive a section without removing it
   * Useful for creating "snapshots" or backups
   */
  const createSectionBackup = async (sectionId) => {
    const section = alternatingData.find(s => s.id === sectionId);
    if (section) {
      await manualArchive(
        section,
        'alternating-layout',
        `Backup: ${section.headline}`
      );
      console.log(`💾 Created backup for: ${section.headline}`);
    }
  };

  /**
   * Clear all sections (batch removal)
   * Hook will automatically archive each removed section
   */
  const clearAllSections = () => {
    if (confirm('Remove all sections? They will be archived automatically.')) {
      setAlternatingData([]);
      console.log('🗑️ Cleared all sections (all archived)');
    }
  };

  /**
   * Add a new section
   */
  const addSection = (newSection) => {
    setAlternatingData(prev => [...prev, {
      id: `section-${Date.now()}`,
      ...newSection
    }]);
  };

  /**
   * Update an existing section
   * Note: Updates are not automatically archived
   * To track version history, manually archive before updating
   */
  const updateSection = async (sectionId, updates) => {
    // Optional: Create backup before updating
    await createSectionBackup(sectionId);

    // Update the section
    setAlternatingData(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, ...updates }
        : section
    ));
  };

  // ============================================================
  // COMPONENT RENDER
  // ============================================================

  return (
    <div className="text-gray-800">
      {/* Admin Controls (Development Only) */}
      {import.meta.env.MODE === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-2xl max-w-sm">
          <h3 className="font-bold mb-2">Archive Controls (Dev)</h3>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => removeSection('innovation-section')}
              className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
            >
              Remove Innovation Section
            </button>
            <button
              onClick={() => createSectionBackup('revolution-section')}
              className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded"
            >
              Backup Revolution Section
            </button>
            <button
              onClick={clearAllSections}
              className="w-full bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded"
            >
              Clear All Sections
            </button>
            <a
              href="/graveyard-archive"
              target="_blank"
              className="block w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-center"
            >
              View Archive
            </a>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Sections: {alternatingData.length}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center bg-[#0E0E0E] text-white">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758645813/Website_Demo_Reel_edited_udorcp.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Disruptors AI Marketing Hub
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Transform your business with AI-powered marketing
            </p>
          </motion.div>
        </div>
      </section>

      {/* Alternating Layout Sections (Monitored by Archive Watcher) */}
      <AlternatingLayout data={alternatingData} />

      {/* Additional page content */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Let's discuss how AI can revolutionize your business
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
            Book a Strategy Session
          </button>
        </div>
      </section>
    </div>
  );
}

/**
 * INTEGRATION NOTES:
 *
 * 1. The useArchiveWatcher hook monitors the `alternatingData` state array
 * 2. When sections are removed via setState, the hook detects the change
 * 3. Removed sections are automatically archived to the database
 * 4. Archives can be viewed at /graveyard-archive
 * 5. The hook provides `manualArchive` for explicit archiving
 * 6. The hook provides `reset` to reset the watcher after bulk operations
 *
 * BEST PRACTICES:
 *
 * ✅ Enable only in development mode to avoid production clutter
 * ✅ Use unique IDs for sections (not just array indices)
 * ✅ Provide descriptive section names for easy identification
 * ✅ Include rich metadata for context
 * ✅ Create backups before major updates
 * ✅ Periodically review and clean up old archives
 *
 * TESTING:
 *
 * 1. Start dev server: npm run dev
 * 2. Use admin controls panel to test removal
 * 3. Navigate to /graveyard-archive to view archived sections
 * 4. Test restore functionality from archive page
 * 5. Verify console logs for archive confirmations
 */
