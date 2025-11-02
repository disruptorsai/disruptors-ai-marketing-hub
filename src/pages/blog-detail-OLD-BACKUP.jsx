
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
        <>
            {/* Meta tags for SEO */}
            <title>{post.title} | Disruptors Media Blog</title>
            <meta name="description" content={post.excerpt || post.title} />
            <meta property="og:title" content={post.title} />
            <meta property="og:description" content={post.excerpt || post.title} />
            <meta property="og:image" content={post.featured_image || "https://dm4.wjwelsh.com/og-image.jpg"} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={post.title} />
            <meta name="twitter:description" content={post.excerpt || post.title} />
            <meta name="twitter:image" content={post.featured_image || "https://dm4.wjwelsh.com/og-image.jpg"} />

            <div className="text-white">
                {/* Schema.org JSON-LD for SEO */}
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>

                {/* Reading Progress Bar */}
                <ReadingProgress />

            {/* Breadcrumbs - Refined */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6" aria-label="Breadcrumb">
                <ol className="flex items-center gap-3 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <a
                            href="/"
                            className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-1"
                            itemProp="item"
                        >
                            <span itemProp="name">Home</span>
                        </a>
                        <meta itemProp="position" content="1" />
                    </li>
                    <li className="text-gray-600" aria-hidden="true">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </li>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <a
                            href="/blog"
                            className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-1"
                            itemProp="item"
                        >
                            <span itemProp="name">Blog</span>
                        </a>
                        <meta itemProp="position" content="2" />
                    </li>
                    <li className="text-gray-600" aria-hidden="true">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </li>
                    <li className="text-gray-300 truncate max-w-[300px] sm:max-w-[500px] font-medium" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" aria-current="page">
                        <span itemProp="name">{post.title}</span>
                        <meta itemProp="position" content="3" />
                    </li>
                </ol>
            </nav>

            {/* Featured Image Hero - Luxury Design */}
            <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    {/* Featured Image */}
                    {post.featured_image && (
                        <div className="relative w-full aspect-[16/9] max-h-[500px] group">
                            <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                                loading="eager"
                                width="1200"
                                height="675"
                                fetchpriority="high"
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
                        <span className="font-semibold text-black">
                            {post.author_id ? `User ${post.author_id.substring(0, 8)}` : 'Disruptors Team'}
                        </span>
                    </span>
                    <span className="text-black">•</span>
                    <span className="flex items-center gap-2.5 text-sm">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-black">
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
                            <span className="text-black">•</span>
                            <span className="text-sm text-black font-medium">
                                {wordCount.toLocaleString()} words
                            </span>
                        </>
                    )}
                </motion.div>
            </header>

            {/* Main Content */}
            <main className="py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12 xl:gap-16">
                        {/* Table of Contents - Desktop Sidebar */}
                        <aside className="hidden lg:block" role="complementary" aria-label="Table of contents">
                            <TableOfContents content={post.content} wordCount={wordCount} />
                        </aside>

                        {/* Main Content Column */}
                        <div>
                            {/* Mobile TOC */}
                            <div className="lg:hidden mb-8">
                                <TableOfContents content={post.content} wordCount={wordCount} />
                            </div>

                            <article className="bg-white/98 backdrop-blur-md text-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16 xl:p-20 shadow-2xl ring-1 ring-gray-200/50" itemScope itemType="https://schema.org/BlogPosting">
                                <meta itemProp="headline" content={post.title} />
                                <meta itemProp="image" content={post.featured_image || "https://dm4.wjwelsh.com/og-image.jpg"} />
                                <meta itemProp="datePublished" content={post.published_at || post.created_at} />
                                <meta itemProp="dateModified" content={post.updated_at || post.published_at || post.created_at} />
                                <meta itemProp="author" content="Disruptors Media" />
                                {/* Tags - Premium Design */}
                                {post.tags && post.tags.length > 0 && (
                                    <motion.div
                                        className="flex flex-wrap gap-3 mb-20 pb-12 border-b-2 border-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
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

                                {/* Post Body with Premium Typography - EXTRA GENEROUS SPACING */}
                                <div
                                    className="blog-content prose prose-xl max-w-none
                                        antialiased

                                        /* Headings - Clear Visual Hierarchy WITH MASSIVE SPACING */
                                        prose-headings:text-gray-900 prose-headings:font-bold prose-headings:scroll-mt-24 prose-headings:tracking-tight

                                        /* H1 - Main Title (rarely used in content) */
                                        prose-h1:text-5xl prose-h1:mb-14 prose-h1:mt-0 prose-h1:leading-[1.2] prose-h1:font-extrabold prose-h1:text-gray-900

                                        /* H2 - Major Sections (HUGE spacing before/after) */
                                        prose-h2:text-4xl prose-h2:mt-32 prose-h2:mb-12 prose-h2:leading-[1.25] prose-h2:border-b-2 prose-h2:border-gray-200 prose-h2:pb-6 prose-h2:text-gray-900 prose-h2:font-extrabold

                                        /* H3 - Subsections (BIG spacing) */
                                        prose-h3:text-3xl prose-h3:mt-24 prose-h3:mb-10 prose-h3:leading-[1.3] prose-h3:text-gray-800 prose-h3:font-bold

                                        /* H4 - Minor Sections (GOOD spacing) */
                                        prose-h4:text-2xl prose-h4:mt-16 prose-h4:mb-8 prose-h4:leading-[1.35] prose-h4:text-gray-800 prose-h4:font-bold

                                        /* H5 - Smallest Headings */
                                        prose-h5:text-xl prose-h5:mt-12 prose-h5:mb-6 prose-h5:leading-[1.4] prose-h5:text-gray-700 prose-h5:font-semibold

                                        /* Paragraphs - GENEROUS spacing between paragraphs */
                                        prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-10 prose-p:text-[20px]
                                        prose-p:first-of-type:text-[22px] prose-p:first-of-type:leading-[1.75] prose-p:first-of-type:font-normal prose-p:first-of-type:text-gray-800

                                        /* Links - Accessible & Clear */
                                        prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline prose-a:decoration-2 prose-a:underline-offset-2 hover:prose-a:underline hover:prose-a:text-blue-700 prose-a:transition-colors

                                        /* Inline Elements */
                                        prose-strong:text-gray-900 prose-strong:font-bold
                                        prose-em:text-gray-700 prose-em:italic

                                        /* Blockquotes - Clean & Elegant */
                                        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-blockquote:pl-8 prose-blockquote:pr-6 prose-blockquote:py-8 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-16 prose-blockquote:rounded-r-lg prose-blockquote:text-[20px] prose-blockquote:font-normal prose-blockquote:leading-[1.75]

                                        /* Code - Inline */
                                        prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[18px] prose-code:font-mono prose-code:font-normal prose-code:border prose-code:border-gray-200

                                        /* Code Blocks */
                                        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-0 prose-pre:rounded-lg prose-pre:overflow-hidden prose-pre:shadow-lg prose-pre:my-16 prose-pre:border prose-pre:border-gray-700

                                        /* Lists - Clear & Readable WITH SPACING */
                                        prose-ul:list-disc prose-ul:ml-8 prose-ul:mb-10 prose-ul:space-y-4
                                        prose-ol:list-decimal prose-ol:ml-8 prose-ol:mb-10 prose-ol:space-y-4
                                        prose-li:text-gray-700 prose-li:leading-[1.8] prose-li:text-[20px] prose-li:marker:text-blue-600
                                        prose-li>p:my-4

                                        /* Images - Professional Presentation */
                                        prose-img:rounded-lg prose-img:shadow-lg prose-img:my-20 prose-img:border prose-img:border-gray-200

                                        /* Tables - Clean Data Display */
                                        prose-table:border-collapse prose-table:w-full prose-table:my-16 prose-table:shadow-md prose-table:rounded-lg prose-table:overflow-hidden prose-table:border prose-table:border-gray-300
                                        prose-thead:bg-gray-100
                                        prose-th:p-5 prose-th:text-left prose-th:font-bold prose-th:text-gray-900 prose-th:border-b prose-th:border-gray-300 prose-th:text-lg prose-th:tracking-normal
                                        prose-td:border prose-td:border-gray-200 prose-td:p-5 prose-td:text-gray-700 prose-td:text-lg
                                        prose-tr:border-b prose-tr:border-gray-200 hover:prose-tr:bg-gray-50 prose-tr:transition-colors

                                        /* Horizontal Rules - Section Dividers */
                                        prose-hr:my-24 prose-hr:border-0 prose-hr:h-px prose-hr:bg-gray-300"
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
            </main>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
                <section className="py-12 sm:py-16 bg-gray-900/50" aria-label="Related articles">
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
        </>
    );
}
