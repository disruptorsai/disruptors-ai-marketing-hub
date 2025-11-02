import React from 'react';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/**
 * Semantic Blog Template Component
 *
 * Implements modern semantic HTML structure based on best practices from
 * Riverside.fm and other leading content platforms. Provides proper
 * accessibility, SEO optimization, and visual hierarchy.
 *
 * Key Features:
 * - Semantic HTML5 elements (article, header, section, aside)
 * - Proper metadata display with time elements
 * - Key takeaways summary section
 * - Accessible navigation and structure
 * - Schema.org microdata integration
 */

export function BlogHeader({ post, wordCount }) {
  const publishDate = new Date(post.published_at || post.created_at);
  const readingTime = post.reading_time_minutes || Math.ceil(wordCount / 200);

  return (
    <header className="max-w-4xl mx-auto px-6 py-12">
      {/* Category Badge */}
      {post.category && (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-black uppercase tracking-wider rounded-full mb-6 shadow-lg">
          <span className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></span>
          {post.category}
        </span>
      )}

      {/* Main Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Subtitle/Tagline */}
      {post.subtitle && (
        <h2 className="text-xl md:text-2xl font-normal text-gray-600 mb-8 leading-relaxed">
          {post.subtitle}
        </h2>
      )}

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-b border-gray-200 pb-6">
        {/* Author */}
        <address className="flex items-center gap-2 not-italic">
          <User className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-gray-900">
            {post.author_name || 'Disruptors Team'}
          </span>
        </address>

        <span className="text-gray-400">•</span>

        {/* Publication Date */}
        <time
          dateTime={publishDate.toISOString()}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4 text-yellow-500" />
          <span>{publishDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}</span>
        </time>

        <span className="text-gray-400">•</span>

        {/* Reading Time */}
        <span className="flex items-center gap-2 font-semibold">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span>{readingTime} min read</span>
        </span>
      </div>
    </header>
  );
}

export function KeyTakeaways({ takeaways }) {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <aside
      className="max-w-4xl mx-auto px-6 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-600 shadow-lg my-12"
      role="complementary"
      aria-label="Key takeaways"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-lg">
          💡
        </span>
        Key Takeaways
      </h2>
      <ul className="space-y-4">
        {takeaways.map((takeaway, index) => (
          <motion.li
            key={index}
            className="flex items-start gap-3 text-gray-700 leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
              {index + 1}
            </span>
            <span className="text-base">{takeaway}</span>
          </motion.li>
        ))}
      </ul>
    </aside>
  );
}

export function BlogSection({ id, title, children }) {
  return (
    <section
      id={id}
      className="max-w-4xl mx-auto px-6 py-8 scroll-mt-24"
    >
      {title && (
        <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200">
          {title}
        </h2>
      )}
      <div className="prose prose-lg max-w-none">
        {children}
      </div>
    </section>
  );
}

export function BlogImage({ src, alt, caption }) {
  return (
    <figure className="my-12 max-w-4xl mx-auto px-6">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-lg shadow-xl border border-gray-200"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-4 text-center text-sm text-gray-600 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function CalloutBox({ type = 'info', title, children }) {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: '📘',
      titleColor: 'text-blue-900'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-500',
      icon: '⚠️',
      titleColor: 'text-amber-900'
    },
    tip: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: '💡',
      titleColor: 'text-green-900'
    },
    quote: {
      bg: 'bg-purple-50',
      border: 'border-purple-500',
      icon: '💬',
      titleColor: 'text-purple-900'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <aside
      className={`max-w-4xl mx-auto px-6 my-8 ${style.bg} rounded-xl border-l-4 ${style.border} p-6 shadow-md`}
      role="note"
    >
      {title && (
        <h3 className={`text-lg font-bold ${style.titleColor} mb-3 flex items-center gap-2`}>
          <span className="text-2xl">{style.icon}</span>
          {title}
        </h3>
      )}
      <div className="text-gray-700 prose prose-sm">
        {children}
      </div>
    </aside>
  );
}

export function StickyTableOfContents({ headings, activeId }) {
  return (
    <aside
      className="sticky top-24 hidden lg:block w-64 h-fit"
      role="navigation"
      aria-label="Table of contents"
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
          Table of Contents
        </h2>
        <nav>
          <ul className="space-y-2">
            {headings.map((heading, index) => (
              <li key={index}>
                <a
                  href={`#${heading.id}`}
                  className={`block text-sm py-2 px-3 rounded-lg transition-all ${
                    activeId === heading.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={{ paddingLeft: heading.level === 3 ? '1.5rem' : '0.75rem' }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export function StickyCTASidebar({ title, description, buttonText, buttonLink }) {
  return (
    <aside
      className="sticky top-96 hidden xl:block w-72 h-fit"
      role="complementary"
      aria-label="Call to action"
    >
      <motion.div
        className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-blue-100 mb-6 leading-relaxed">{description}</p>
        <a
          href={buttonLink}
          className="block w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-lg text-center hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          {buttonText}
        </a>
      </motion.div>
    </aside>
  );
}

export function RelatedPostsSection({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section
      className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-200 mt-16"
      aria-label="Related articles"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                <a href={`/blog-detail?slug=${post.slug}`} className="hover:text-blue-600 transition-colors">
                  {post.title}
                </a>
              </h3>
              {post.excerpt && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </time>
                <span>•</span>
                <span>{post.reading_time_minutes || 5} min read</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export function SocialShareButtons({ title, url }) {
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
  };

  return (
    <aside
      className="max-w-4xl mx-auto px-6 py-8 border-t border-gray-200 mt-12"
      role="complementary"
      aria-label="Share this article"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Share this article</h3>
      <div className="flex flex-wrap gap-3">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
          Twitter
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
          Facebook
        </a>
        <a
          href={shareLinks.email}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </a>
      </div>
    </aside>
  );
}

export function BlogFooterCTA({ title, description, buttonText, buttonLink }) {
  return (
    <section
      className="max-w-4xl mx-auto px-6 py-16 text-center"
      aria-label="Call to action"
    >
      <motion.div
        className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-3xl shadow-2xl p-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-800 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        <a
          href={buttonLink}
          className="inline-block bg-gray-900 text-white font-bold py-4 px-10 rounded-xl text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          {buttonText}
        </a>
      </motion.div>
    </section>
  );
}
