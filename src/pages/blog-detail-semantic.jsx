import React, { useState, useEffect } from 'react';
import { customClient } from '@/lib/custom-sdk';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  BlogHeader,
  KeyTakeaways,
  StickyTableOfContents,
  StickyCTASidebar,
  SocialShareButtons,
  BlogFooterCTA,
  RelatedPostsSection
} from '../components/blog/SemanticBlogTemplate';
import ReadingProgress from '../components/blog/ReadingProgress';

/**
 * Semantic Blog Detail Page - 2025 Standards
 *
 * Implements modern semantic HTML structure with:
 * - Proper <article>, <header>, <section>, <aside> elements
 * - Key Takeaways summary section
 * - Sticky Table of Contents navigation
 * - Strategic CTA placement (sidebar + footer)
 * - Full accessibility (WCAG 2.1 AA)
 * - Optimized performance (Lighthouse 95+ target)
 * - Schema.org microdata for rich snippets
 */

export default function BlogDetailSemantic() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');

      if (!slug) {
        setError("No post slug provided in URL.");
        setLoading(false);
        return;
      }

      try {
        const posts = await customClient.entities.Post.filter({
          slug: slug,
          is_published: true
        });

        if (posts && posts.length > 0) {
          const fetchedPost = posts[0];
          setPost(fetchedPost);

          // Calculate word count
          if (fetchedPost.content) {
            const words = fetchedPost.content.trim().split(/\s+/).length;
            setWordCount(words);
          }

          // Extract or use stored table of contents
          if (fetchedPost.table_of_contents && fetchedPost.table_of_contents.length > 0) {
            setHeadings(fetchedPost.table_of_contents);
          } else {
            // Auto-generate TOC from content
            const extractedHeadings = extractHeadings(fetchedPost.content);
            setHeadings(extractedHeadings);
          }

          // Fetch related posts
          try {
            const allPosts = await customClient.entities.Post.filter({
              is_published: true
            });
            const related = allPosts
              .filter(p =>
                p.id !== fetchedPost.id &&
                p.category === fetchedPost.category
              )
              .slice(0, 3);
            setRelatedPosts(related);
          } catch (relatedErr) {
            console.error('Failed to fetch related posts:', relatedErr);
          }
        } else {
          setError("Post not found.");
        }
      } catch (err) {
        setError("Failed to fetch post.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  // Track active heading for TOC highlighting
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // Extract headings from markdown content
  const extractHeadings = (content) => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const extracted = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      extracted.push({ level, text, id });
    }

    return extracted;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg mb-2">
            {error || "The post could not be loaded."}
          </p>
          <a href="/blog" className="text-blue-600 hover:underline">
            ← Return to blog
          </a>
        </div>
      </div>
    );
  }

  // Parse key takeaways
  const keyTakeaways = post.key_takeaways?.takeaways || [];

  // Parse CTA configuration
  const ctaConfig = post.cta_config || {
    sidebar: {
      enabled: true,
      title: "Ready to Transform Your Marketing?",
      description: "Get personalized AI recommendations for your business.",
      button_text: "Get Started Free",
      button_link: "/app/signup"
    },
    footer: {
      enabled: true,
      title: "Ready to Take the Next Step?",
      description: "Join 500+ businesses using AI to dominate their markets.",
      button_text: "Start Your Free Trial",
      button_link: "/app/signup"
    }
  };

  // Generate Schema.org JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "alternativeHeadline": post.subtitle,
    "description": post.excerpt || post.meta_description || post.title,
    "image": post.featured_image || "https://dm4.wjwelsh.com/og-image.jpg",
    "author": {
      "@type": "Person",
      "name": post.author_name || "Disruptors Team",
      "url": "https://dm4.wjwelsh.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Disruptors Media",
      "url": "https://dm4.wjwelsh.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dm4.wjwelsh.com/logo.png"
      }
    },
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at || post.published_at || post.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "keywords": [post.primary_keyword, ...(post.secondary_keywords || [])].join(", "),
    "articleSection": post.category || "Marketing",
    "wordCount": wordCount,
    "timeRequired": `PT${post.reading_time_minutes || Math.ceil(wordCount / 200)}M`
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{post.seo_title || post.title} | Disruptors Media Blog</title>
      <meta name="description" content={post.meta_description || post.excerpt || post.title} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt || post.title} />
      <meta property="og:image" content={post.featured_image || "https://dm4.wjwelsh.com/og-image.jpg"} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.excerpt || post.title} />
      <meta name="twitter:image" content={post.featured_image || "https://dm4.wjwelsh.com/og-image.jpg"} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      <div className="min-h-screen bg-gray-50">
        {/* Reading Progress Bar */}
        <ReadingProgress />

        {/* Skip to main content (accessibility) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Skip to main content
        </a>

        {/* Breadcrumbs */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <a
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                itemProp="item"
              >
                <span itemProp="name">Home</span>
              </a>
              <meta itemProp="position" content="1" />
            </li>
            <li className="text-gray-400" aria-hidden="true">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <a
                href="/blog"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                itemProp="item"
              >
                <span itemProp="name">Blog</span>
              </a>
              <meta itemProp="position" content="2" />
            </li>
            <li className="text-gray-400" aria-hidden="true">/</li>
            <li className="text-gray-900 truncate max-w-[300px] sm:max-w-[500px] font-medium" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" aria-current="page">
              <span itemProp="name">{post.title}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Featured Image Hero */}
        {post.featured_image && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto max-h-[500px] object-cover"
                loading="eager"
                fetchpriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_300px] gap-8 lg:gap-12">

            {/* Left Sidebar - Table of Contents (Desktop) */}
            <aside className="hidden lg:block" role="complementary">
              {wordCount > 1500 && headings.length > 0 && (
                <StickyTableOfContents headings={headings} activeId={activeHeadingId} />
              )}
            </aside>

            {/* Main Article Column */}
            <main id="main-content">
              <article
                className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 lg:p-16"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                {/* Article Header */}
                <BlogHeader post={post} wordCount={wordCount} />

                {/* Mobile TOC - Collapsible */}
                {wordCount > 1500 && headings.length > 0 && (
                  <details className="lg:hidden mb-12 bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <summary className="cursor-pointer font-bold text-gray-900 text-lg flex items-center justify-between hover:text-blue-600 transition-colors">
                      <span>Table of Contents</span>
                      <ChevronDown className="w-5 h-5" />
                    </summary>
                    <nav className="mt-6">
                      <ul className="space-y-3">
                        {headings.map((heading, index) => (
                          <li key={index}>
                            <a
                              href={`#${heading.id}`}
                              className="block text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50"
                              style={{
                                paddingLeft: heading.level === 3 ? '1.5rem' : '0.75rem'
                              }}
                            >
                              {heading.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </details>
                )}

                {/* Key Takeaways Section */}
                {keyTakeaways.length > 0 && (
                  <KeyTakeaways takeaways={keyTakeaways} />
                )}

                {/* Main Content with Prose Styling */}
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:scroll-mt-24
                    prose-h1:text-4xl prose-h1:mb-8 prose-h1:leading-tight
                    prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-b-2 prose-h2:border-gray-200 prose-h2:pb-4
                    prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                    prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-bold
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:italic
                    prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:my-8
                    prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6 prose-ul:space-y-2
                    prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6 prose-ol:space-y-2
                    prose-li:text-gray-700 prose-li:leading-relaxed prose-li:marker:text-blue-600
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:my-12 prose-img:border prose-img:border-gray-200
                    prose-table:border-collapse prose-table:w-full prose-table:my-10 prose-table:shadow-lg prose-table:rounded-lg prose-table:overflow-hidden
                    prose-th:bg-gray-100 prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:border-b prose-th:border-gray-300
                    prose-td:p-4 prose-td:border prose-td:border-gray-200
                    prose-hr:my-12 prose-hr:border-gray-300"
                  itemProp="articleBody"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h2: ({ node, children, ...props }) => {
                        const text = children?.[0] || '';
                        const id = typeof text === 'string'
                          ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                          : '';
                        return (
                          <motion.h2
                            id={id}
                            {...props}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                          >
                            {children}
                          </motion.h2>
                        );
                      },
                      h3: ({ node, children, ...props }) => {
                        const text = children?.[0] || '';
                        const id = typeof text === 'string'
                          ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                          : '';
                        return (
                          <motion.h3
                            id={id}
                            {...props}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                          >
                            {children}
                          </motion.h3>
                        );
                      },
                      img: ({ node, ...props }) => (
                        <motion.img
                          {...props}
                          loading="lazy"
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6 }}
                        />
                      )
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>

                {/* Social Share Buttons */}
                <SocialShareButtons title={post.title} url={window.location.href} />
              </article>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <RelatedPostsSection posts={relatedPosts} />
                </div>
              )}

              {/* Footer CTA */}
              {ctaConfig.footer?.enabled && (
                <BlogFooterCTA
                  title={ctaConfig.footer.title}
                  description={ctaConfig.footer.description}
                  buttonText={ctaConfig.footer.button_text}
                  buttonLink={ctaConfig.footer.button_link}
                />
              )}
            </main>

            {/* Right Sidebar - Sticky CTA (XL screens only) */}
            {ctaConfig.sidebar?.enabled && (
              <aside className="hidden xl:block" role="complementary">
                <StickyCTASidebar
                  title={ctaConfig.sidebar.title}
                  description={ctaConfig.sidebar.description}
                  buttonText={ctaConfig.sidebar.button_text}
                  buttonLink={ctaConfig.sidebar.button_link}
                />
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
