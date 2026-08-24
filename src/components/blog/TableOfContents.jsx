import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * TableOfContents Component
 *
 * Automatically generates a table of contents from H2 and H3 headings
 * in the blog post content.
 *
 * Features:
 * - Auto-generates from markdown headings
 * - Smooth scroll to sections
 * - Active section highlighting
 * - Collapsible on mobile
 * - Sticky positioning on desktop
 * - Nested H3 subsections
 *
 * @param {string} content - Raw markdown content
 * @param {number} wordCount - Total word count (optional, for showing TOC only on long posts)
 */
export default function TableOfContents({ content, wordCount = 0 }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Only show TOC for posts longer than 1500 words
  const shouldShowTOC = wordCount >= 1500;

  useEffect(() => {
    // Extract headings from markdown content
    const extractHeadings = () => {
      const headingRegex = /^(#{2,3})\s+(.+)$/gm;
      const matches = [];
      let match;

      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length; // 2 for H2, 3 for H3
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        matches.push({
          id,
          text,
          level
        });
      }

      setHeadings(matches);
    };

    if (content && shouldShowTOC) {
      extractHeadings();
    }
  }, [content, shouldShowTOC]);

  useEffect(() => {
    // Track active section on scroll
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      // Find all heading elements
      const headingElements = headings.map(h => {
        const element = document.getElementById(h.id);
        return { id: h.id, top: element?.offsetTop || 0 };
      });

      // Find the current section
      const current = headingElements
        .filter(h => h.top <= scrollPosition)
        .pop();

      if (current) {
        setActiveId(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (!shouldShowTOC || headings.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="lg:sticky lg:top-24 mb-8 lg:mb-0"
    >
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between bg-indigo-50 text-indigo-900 px-4 py-3 rounded-lg mb-2 font-medium hover:bg-indigo-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <List className="w-5 h-5" />
          Table of Contents
        </span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Desktop Title */}
      <div className="hidden lg:flex items-center gap-2 text-gray-900 font-bold text-lg mb-4">
        <List className="w-5 h-5 text-indigo-600" />
        Table of Contents
      </div>

      {/* Headings List */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="space-y-2">
              {headings.map((heading, index) => (
                <li
                  key={index}
                  className={heading.level === 3 ? 'ml-4' : ''}
                >
                  <button
                    onClick={() => scrollToSection(heading.id)}
                    className={`text-left w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeId === heading.id
                        ? 'bg-indigo-100 text-indigo-900 font-semibold border-l-4 border-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
                    } ${
                      heading.level === 2
                        ? 'text-base font-medium'
                        : 'text-sm'
                    }`}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
