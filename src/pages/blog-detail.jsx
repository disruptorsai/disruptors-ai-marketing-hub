
import React, { useState, useEffect } from 'react';
import { customClient } from '@/lib/custom-sdk';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Tag, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import DualCTABlock from '../components/shared/DualCTABlock';
import ReadingProgress from '../components/blog/ReadingProgress';
import TableOfContents from '../components/blog/TableOfContents';
import CollapsibleSection from '../components/blog/CollapsibleSection';
import HighlightBox from '../components/blog/HighlightBox';
import PullQuote from '../components/blog/PullQuote';
import CodeBlock from '../components/blog/CodeBlock';
import StatsHighlight from '../components/blog/StatsHighlight';
import SocialShare from '../components/blog/SocialShare';

export default function BlogDetail() {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wordCount, setWordCount] = useState(0);
    const [relatedPosts, setRelatedPosts] = useState([]);

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

                    // Calculate word count for TOC display logic
                    if (fetchedPost.content) {
                        const words = fetchedPost.content.trim().split(/\s+/).length;
                        setWordCount(words);
                    }

                    // Fetch related posts (same category, exclude current post)
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-white">Loading post...</p></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-red-400">{error}</p></div>;
    }

    if (!post) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">The post could not be loaded.</p></div>;
    }

    // Helper function to add IDs to headings for TOC navigation
    const addHeadingIds = (content) => {
        return content.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, text) => {
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
            return `${hashes} <span id="${id}">${text}</span>`;
        });
    };

    // Generate schema.org JSON-LD for rich snippets
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt || post.title,
        "image": post.featured_image || "https://dm4.wjwelsh.com/og-image.jpg",
        "author": {
            "@type": "Organization",
            "name": "Disruptors Media",
            "url": "https://dm4.wjwelsh.com"
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
        "keywords": post.tags ? post.tags.join(", ") : "",
        "articleSection": post.category || "Marketing",
        "wordCount": wordCount,
        "timeRequired": post.read_time || "8 min"
    };

    return (
        <div className="text-white">
            {/* Schema.org JSON-LD for SEO */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>

            {/* Reading Progress Bar */}
            <ReadingProgress />

            {/* Breadcrumbs - Refined */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                <ol className="flex items-center gap-3 text-sm">
                    <li>
                        <a
                            href="/"
                            className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 font-medium"
                        >
                            Home
                        </a>
                    </li>
                    <li className="text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </li>
                    <li>
                        <a
                            href="/blog"
                            className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 font-medium"
                        >
                            Blog
                        </a>
                    </li>
                    <li className="text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </li>
                    <li className="text-gray-300 truncate max-w-[300px] sm:max-w-[500px] font-medium">
                        {post.title}
                    </li>
                </ol>
            </nav>

            {/* Featured Image Hero - Luxury Design */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    {/* Featured Image */}
                    {post.featured_image && (
                        <div className="relative w-full aspect-[16/9] max-h-[500px] group">
                            <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                            />
                            {/* Sophisticated gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                            {/* Subtle vignette effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20" />

                            {/* Title overlay on bottom third */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-16">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-black uppercase tracking-wider rounded-full mb-5 shadow-lg shadow-yellow-500/30 border border-yellow-300">
                                        <span className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></span>
                                        {post.category || 'Article'}
                                    </span>
                                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-white drop-shadow-2xl leading-tight">
                                        {post.title}
                                    </h1>
                                </motion.div>
                            </div>

                            {/* Golden accent line at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                        </div>
                    )}

                    {/* Fallback if no featured image - Premium gradient */}
                    {!post.featured_image && (
                        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black p-12 sm:p-16 lg:p-20">
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.3),transparent_50%)]"></div>
                            </div>
                            <div className="relative">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-black uppercase tracking-wider rounded-full mb-5 shadow-lg shadow-yellow-500/30">
                                    <span className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></span>
                                    {post.category || 'Article'}
                                </span>
                                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-white">
                                    {post.title}
                                </h1>
                            </div>
                        </div>
                    )}
                </div>

                {/* Refined Metadata Row */}
                <motion.div
                    className="mt-8 flex flex-wrap items-center gap-5 sm:gap-7"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <span className="flex items-center gap-2.5 text-sm">
                        <User className="w-4 h-4 text-yellow-400" />
                        <span className="font-semibold text-gray-200">
                            {post.author_id ? `User ${post.author_id.substring(0, 8)}` : 'Disruptors Team'}
                        </span>
                    </span>
                    <span className="text-gray-700">•</span>
                    <span className="flex items-center gap-2.5 text-sm">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-gray-300">
                            {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </span>
                    {post.read_time && (
                        <>
                            <span className="text-gray-700">•</span>
                            <span className="flex items-center gap-2.5 px-4 py-1.5 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 rounded-full font-semibold text-sm border border-yellow-400/20 backdrop-blur-sm">
                                <Clock className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400">{post.read_time}</span>
                            </span>
                        </>
                    )}
                    {wordCount > 0 && (
                        <>
                            <span className="text-gray-700">•</span>
                            <span className="text-sm text-gray-400 font-medium">
                                {wordCount.toLocaleString()} words
                            </span>
                        </>
                    )}
                </motion.div>
            </section>

            {/* Main Content */}
            <div className="py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12 xl:gap-16">
                        {/* Table of Contents - Desktop Sidebar */}
                        <aside className="hidden lg:block">
                            <TableOfContents content={post.content} wordCount={wordCount} />
                        </aside>

                        {/* Main Content Column */}
                        <div>
                            {/* Mobile TOC */}
                            <div className="lg:hidden mb-8">
                                <TableOfContents content={post.content} wordCount={wordCount} />
                            </div>

                            <article className="bg-white/98 backdrop-blur-md text-gray-900 rounded-3xl p-8 sm:p-12 lg:p-20 shadow-2xl ring-1 ring-gray-200/50">
                                {/* Tags - Premium Design */}
                                {post.tags && post.tags.length > 0 && (
                                    <motion.div
                                        className="flex flex-wrap gap-3 mb-16 pb-10 border-b-2 border-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {post.tags.map((tag, i) => (
                                            <motion.span
                                                key={i}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-yellow-50 to-amber-50 text-amber-800 text-sm font-bold rounded-full border-2 border-yellow-400/40 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                                whileHover={{ y: -2 }}
                                            >
                                                <Tag className="w-3.5 h-3.5 text-yellow-600" />
                                                {tag}
                                            </motion.span>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Post Body with Luxury Magazine Typography */}
                                <div
                                    className="blog-content prose prose-xl max-w-none
                                        prose-headings:text-gray-900 prose-headings:font-black prose-headings:scroll-mt-24 prose-headings:tracking-tight
                                        prose-h1:text-5xl prose-h1:mb-10 prose-h1:leading-[1.1] prose-h1:bg-gradient-to-r prose-h1:from-yellow-600 prose-h1:via-amber-600 prose-h1:to-yellow-700 prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:drop-shadow-sm
                                        prose-h2:text-4xl prose-h2:mt-24 prose-h2:mb-10 prose-h2:leading-[1.2] prose-h2:border-b-4 prose-h2:border-yellow-400 prose-h2:pb-6 prose-h2:text-gray-900
                                        prose-h3:text-3xl prose-h3:mt-20 prose-h3:mb-8 prose-h3:leading-[1.3] prose-h3:text-gray-800
                                        prose-h4:text-2xl prose-h4:mt-12 prose-h4:mb-5 prose-h4:text-gray-800
                                        prose-h5:text-xl prose-h5:mt-8 prose-h5:mb-4 prose-h5:text-gray-700
                                        prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-[18px]
                                        prose-p:first-of-type:text-[20px] prose-p:first-of-type:leading-[1.9] prose-p:first-of-type:font-medium prose-p:first-of-type:text-gray-800
                                        prose-a:text-amber-700 prose-a:font-bold prose-a:no-underline prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:underline hover:prose-a:text-yellow-600 prose-a:transition-all
                                        prose-strong:text-gray-900 prose-strong:font-black prose-strong:bg-yellow-100/70 prose-strong:px-1.5 prose-strong:rounded-sm
                                        prose-em:text-gray-700 prose-em:italic
                                        prose-blockquote:border-l-[6px] prose-blockquote:border-yellow-500 prose-blockquote:bg-gradient-to-br prose-blockquote:from-yellow-50/80 prose-blockquote:to-amber-50/80 prose-blockquote:pl-8 prose-blockquote:pr-6 prose-blockquote:py-8 prose-blockquote:italic prose-blockquote:text-gray-800 prose-blockquote:my-14 prose-blockquote:rounded-r-2xl prose-blockquote:shadow-xl prose-blockquote:text-lg prose-blockquote:font-medium
                                        prose-code:bg-amber-50 prose-code:text-amber-800 prose-code:px-3 prose-code:py-1 prose-code:rounded-md prose-code:text-[16px] prose-code:font-mono prose-code:font-bold prose-code:border prose-code:border-yellow-300/50
                                        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-0 prose-pre:rounded-2xl prose-pre:overflow-hidden prose-pre:shadow-2xl prose-pre:my-14 prose-pre:border prose-pre:border-yellow-600/20 prose-pre:ring-2 prose-pre:ring-yellow-500/10
                                        prose-ul:list-none prose-ul:ml-0 prose-ul:mb-10 prose-ul:space-y-5
                                        prose-ol:ml-0 prose-ol:mb-10 prose-ol:space-y-5 prose-ol:counter-reset-[item]
                                        prose-li:text-gray-700 prose-li:leading-[1.8] prose-li:pl-8 prose-li:relative prose-li:text-[18px]
                                        prose-ul>li:before:content-['▸'] prose-ul>li:before:absolute prose-ul>li:before:left-0 prose-ul>li:before:text-yellow-600 prose-ul>li:before:font-black prose-ul>li:before:text-xl
                                        prose-ol>li:before:content-[counter(item)'.'] prose-ol>li:before:counter-increment-[item] prose-ol>li:before:absolute prose-ol>li:before:left-0 prose-ol>li:before:text-yellow-600 prose-ol>li:before:font-black prose-ol>li:before:text-lg
                                        prose-li>p:my-2
                                        prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-20 prose-img:border-4 prose-img:border-white prose-img:ring-4 prose-img:ring-yellow-400/20
                                        prose-table:border-collapse prose-table:w-full prose-table:my-14 prose-table:shadow-2xl prose-table:rounded-2xl prose-table:overflow-hidden prose-table:border prose-table:border-gray-300
                                        prose-thead:bg-gradient-to-r prose-thead:from-yellow-500 prose-thead:via-amber-600 prose-thead:to-yellow-600
                                        prose-th:p-5 prose-th:text-left prose-th:font-black prose-th:text-gray-900 prose-th:border-b-2 prose-th:border-yellow-400/30 prose-th:text-base prose-th:uppercase prose-th:tracking-wide
                                        prose-td:border prose-td:border-gray-200 prose-td:p-5 prose-td:text-gray-700 prose-td:text-base
                                        prose-tr:border-b prose-tr:border-gray-200 hover:prose-tr:bg-yellow-50/40 prose-tr:transition-colors
                                        prose-hr:my-24 prose-hr:border-0 prose-hr:h-1 prose-hr:bg-gradient-to-r prose-hr:from-transparent prose-hr:via-yellow-400 prose-hr:to-transparent prose-hr:rounded-full"
                                >
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            h1: ({ node, ...props }) => {
                                                const text = props.children?.[0] || '';
                                                const id = typeof text === 'string'
                                                    ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                                                    : '';
                                                return (
                                                    <motion.h1
                                                        id={id}
                                                        {...props}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.6 }}
                                                    />
                                                );
                                            },
                                            h2: ({ node, ...props }) => {
                                                const text = props.children?.[0] || '';
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
                                                    />
                                                );
                                            },
                                            h3: ({ node, ...props }) => {
                                                const text = props.children?.[0] || '';
                                                const id = typeof text === 'string'
                                                    ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                                                    : '';

                                                // Auto-detect FAQ sections
                                                const isFAQ = typeof text === 'string' &&
                                                    (text.toLowerCase().includes('faq') ||
                                                     text.toLowerCase().includes('frequently asked') ||
                                                     text.toLowerCase().includes('questions'));

                                                return (
                                                    <motion.h3
                                                        id={id}
                                                        {...props}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.5 }}
                                                        className={isFAQ ? 'text-amber-700 bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-4 rounded-xl border-l-4 border-yellow-500' : ''}
                                                    />
                                                );
                                            },
                                            p: ({ node, children, ...props }) => {
                                                const text = children?.toString() || '';

                                                // Check if paragraph starts with special markers
                                                if (text.startsWith('[TIP]') || text.startsWith('[KEY]')) {
                                                    const content = text.replace(/^\[(TIP|KEY)\]\s*/, '');
                                                    return <HighlightBox type="key">{content}</HighlightBox>;
                                                }
                                                if (text.startsWith('[WARNING]')) {
                                                    const content = text.replace(/^\[WARNING\]\s*/, '');
                                                    return <HighlightBox type="warning">{content}</HighlightBox>;
                                                }
                                                if (text.startsWith('[INFO]')) {
                                                    const content = text.replace(/^\[INFO\]\s*/, '');
                                                    return <HighlightBox type="info">{content}</HighlightBox>;
                                                }

                                                return <p {...props}>{children}</p>;
                                            },
                                            pre: ({ node, children, ...props }) => {
                                                // Extract code from pre > code structure
                                                const codeElement = children?.props;
                                                const className = codeElement?.className || '';
                                                const language = className.replace('language-', '') || 'plaintext';
                                                const code = codeElement?.children || children;

                                                return <CodeBlock language={language}>{code}</CodeBlock>;
                                            },
                                            blockquote: ({ node, children, ...props }) => {
                                                // Check if blockquote has author attribution
                                                const text = children?.toString() || '';
                                                const hasAuthor = text.includes('—');

                                                if (hasAuthor) {
                                                    const [quote, author] = text.split('—').map(s => s.trim());
                                                    return <PullQuote author={author}>{quote}</PullQuote>;
                                                }

                                                return <blockquote {...props}>{children}</blockquote>;
                                            }
                                        }}
                                    >
                                        {post.content}
                                    </ReactMarkdown>
                                </div>

                                {/* Social Share Section */}
                                <SocialShare title={post.title} url={window.location.href} />
                            </article>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
                <section className="py-12 sm:py-16 bg-gray-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">Related Articles</h2>
                            <a
                                href="/blog"
                                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                            >
                                View All <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedPosts.map((relatedPost) => (
                                <motion.a
                                    key={relatedPost.id}
                                    href={`/blog-detail?slug=${relatedPost.slug}`}
                                    className="group block bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-indigo-500/50"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -4 }}
                                >
                                    {relatedPost.featured_image && (
                                        <div className="aspect-[16/9] overflow-hidden">
                                            <img
                                                src={relatedPost.featured_image}
                                                alt={relatedPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        {relatedPost.category && (
                                            <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full mb-3">
                                                {relatedPost.category}
                                            </span>
                                        )}
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                            {relatedPost.title}
                                        </h3>
                                        {relatedPost.excerpt && (
                                            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                                {relatedPost.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(relatedPost.published_at || relatedPost.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            {relatedPost.read_time && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {relatedPost.read_time}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <DualCTABlock />
        </div>
    );
}
