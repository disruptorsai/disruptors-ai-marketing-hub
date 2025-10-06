/**
 * GraveyardArchive Page
 *
 * Hidden page accessible at /graveyard-archive
 * Displays all archived/deleted sections from the site in chronological order.
 *
 * Theme: Dark, muted "graveyard" aesthetic with tombstone-style cards.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getArchivedSections,
  getArchiveStats,
  restoreSection,
  deleteArchivedSection
} from '@/lib/graveyard-archive';

export default function GraveyardArchive() {
  const [archivedSections, setArchivedSections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filter, setFilter] = useState({ page: 'all', type: 'all' });

  // Load archived sections on mount
  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    setLoading(true);
    try {
      const [archives, archiveStats] = await Promise.all([
        getArchivedSections({ limit: 500 }),
        getArchiveStats()
      ]);

      setArchivedSections(archives);
      setStats(archiveStats);
    } catch (error) {
      console.error('Failed to load archives:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter archived sections
  const filteredSections = archivedSections.filter(section => {
    const pageMatch = filter.page === 'all' || section.removed_from_page === filter.page;
    const typeMatch = filter.type === 'all' || section.section_type === filter.type;
    return pageMatch && typeMatch;
  });

  // Get unique pages and types for filters
  const uniquePages = [...new Set(archivedSections.map(s => s.removed_from_page))];
  const uniqueTypes = [...new Set(archivedSections.map(s => s.section_type))];

  const handleRestore = async (id) => {
    const restored = await restoreSection(id);
    if (restored) {
      alert(`Section restored! Check console for content.\n\nOriginal Page: ${restored.metadata.originalPage}\nType: ${restored.metadata.sectionType}`);
      console.log('Restored Section Content:', restored.content);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Permanently delete this archive? This cannot be undone.')) {
      const success = await deleteArchivedSection(id);
      if (success) {
        setArchivedSections(prev => prev.filter(s => s.id !== id));
        alert('Archive permanently deleted.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-300">
      {/* Header */}
      <header className="relative border-b border-gray-700 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-gray-100 mb-4 font-serif tracking-tight">
              ⚰️ The Graveyard Archive
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A resting place for deleted sections. Here lie the remnants of past designs,
              waiting in digital slumber for potential resurrection.
            </p>

            {/* Stats */}
            {stats && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-100">{stats.totalArchived}</div>
                  <div className="text-sm text-gray-500">Total Archived</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-100">{Object.keys(stats.byPage).length}</div>
                  <div className="text-sm text-gray-500">Affected Pages</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-100">{Object.keys(stats.byType).length}</div>
                  <div className="text-sm text-gray-500">Section Types</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Page Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Filter by Page
              </label>
              <select
                value={filter.page}
                onChange={(e) => setFilter(prev => ({ ...prev, page: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-gray-500"
              >
                <option value="all">All Pages</option>
                {uniquePages.map(page => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Filter by Type
              </label>
              <select
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-gray-500"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredSections.length} of {archivedSections.length} archived sections
          </div>
        </div>
      </div>

      {/* Archive Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Exhuming archives...</p>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🪦</div>
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">The graveyard is empty</h3>
            <p className="text-gray-600">No sections have been archived yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredSections.map((section, index) => (
                <ArchiveTombstone
                  key={section.id}
                  section={section}
                  index={index}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                  onView={() => setSelectedSection(section)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Section Detail Modal */}
      <AnimatePresence>
        {selectedSection && (
          <SectionDetailModal
            section={selectedSection}
            onClose={() => setSelectedSection(null)}
            onRestore={handleRestore}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual tombstone card component
 */
function ArchiveTombstone({ section, index, onRestore, onDelete, onView }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all duration-300 group"
    >
      {/* Tombstone Top Curve */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gray-700 rounded-b-full"></div>

      <div className="pt-12 px-6 pb-6">
        {/* Section Name/Type */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-100 mb-1 font-serif">
            {section.section_name || section.section_type}
          </h3>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {section.section_type}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-gray-600">📍</span>
            <span>{section.removed_from_page}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-gray-600">⏰</span>
            <span>{formatDate(section.removed_at)}</span>
          </div>
        </div>

        {/* Content Preview */}
        {section.section_content && (
          <div className="bg-black/30 border border-gray-700 rounded p-3 mb-4">
            <pre className="text-xs text-gray-500 font-mono overflow-hidden max-h-20 line-clamp-4">
              {JSON.stringify(section.section_content, null, 2).slice(0, 150)}...
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-3 py-2 rounded transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onRestore(section.id)}
            className="flex-1 bg-green-900/30 hover:bg-green-900/50 border border-green-700 text-green-400 text-sm px-3 py-2 rounded transition-colors"
          >
            Restore
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-400 text-sm px-3 py-2 rounded transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
    </motion.div>
  );
}

/**
 * Section detail modal component
 */
function SectionDetailModal({ section, onClose, onRestore, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border-2 border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 font-serif">
              {section.section_name || section.section_type}
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              Archived from {section.removed_from_page} on {formatDate(section.removed_at)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6">
          {/* Section Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Section Content</h3>
            <div className="bg-black/50 border border-gray-700 rounded-lg p-4">
              <pre className="text-sm text-gray-400 font-mono whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(section.section_content, null, 2)}
              </pre>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Metadata</h3>
            <div className="bg-black/50 border border-gray-700 rounded-lg p-4">
              <pre className="text-sm text-gray-400 font-mono whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(section.metadata, null, 2)}
              </pre>
            </div>
          </div>

          {/* Archive Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Archive Information</h3>
            <div className="bg-black/50 border border-gray-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Archive ID:</span>
                <span className="text-gray-400 font-mono">{section.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Section Type:</span>
                <span className="text-gray-400">{section.section_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Removed From:</span>
                <span className="text-gray-400">{section.removed_from_page}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Removed At:</span>
                <span className="text-gray-400">{formatDate(section.removed_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={() => {
              onRestore(section.id);
              onClose();
            }}
            className="flex-1 bg-green-900/30 hover:bg-green-900/50 border border-green-700 text-green-400 px-4 py-2 rounded transition-colors"
          >
            Restore Section
          </button>
          <button
            onClick={() => {
              onDelete(section.id);
              onClose();
            }}
            className="flex-1 bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-400 px-4 py-2 rounded transition-colors"
          >
            Delete Permanently
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
