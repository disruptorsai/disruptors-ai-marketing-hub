
import React, { useState, useEffect } from 'react';
import { customClient } from '@/lib/custom-sdk';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Tag } from 'lucide-react';
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

    return (
        <div className="text-white">
            {/* Reading Progress Bar */}
            <ReadingProgress />

            {/* Hero */}
            <section className="relative py-20 sm:py-32">
                {post.featured_image && (
                    <div className="absolute inset-0">
                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-gray-900/30 to-transparent" />
                    </div>
                )}
                <div className="relative max-w-[680px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-black/30 backdrop-blur-md rounded-3xl p-8">
                        <p className="text-indigo-400 font-semibold mb-2">{post.category || 'Article'}</p>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{post.title}</h1>
                        <p className="mt-4 text-lg text-gray-300">{post.excerpt}</p>

                        {/* Enhanced Read Time Display */}
                        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-300">
                            <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {post.author_id ? `User ${post.author_id.substring(0, 8)}` : 'Disruptors Team'}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.published_at || post.created_at).toLocaleDateString()}
                            </span>
                            {post.read_time && (
                                <span className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1 rounded-full font-medium">
                                    <Clock className="w-4 h-4" /> {post.read_time}
                                </span>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <div className="py-16 sm:py-24">
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

                            <article className="bg-white/95 backdrop-blur-md text-gray-900 rounded-3xl p-6 sm:p-10 lg:p-16 shadow-2xl">
                                {/* Tags */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-12 pb-8 border-b-2 border-gray-200">
                                        {post.tags.map((tag, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-200 shadow-sm">
                                                <Tag className="w-4 h-4" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Post Body with Magazine-Quality Typography */}
                                <div
                                    className="blog-content prose prose-xl prose-indigo max-w-none
                                        prose-headings:text-gray-900 prose-headings:font-extrabold prose-headings:scroll-mt-24 prose-headings:tracking-tight
                                        prose-h1:text-5xl prose-h1:mb-8 prose-h1:leading-[1.1] prose-h1:bg-gradient-to-r prose-h1:from-indigo-600 prose-h1:to-purple-600 prose-h1:bg-clip-text prose-h1:text-transparent
                                        prose-h2:text-4xl prose-h2:mt-20 prose-h2:mb-8 prose-h2:leading-[1.2] prose-h2:border-b-4 prose-h2:border-gradient-to-r prose-h2:from-indigo-500 prose-h2:to-purple-500 prose-h2:pb-6
                                        prose-h3:text-3xl prose-h3:mt-16 prose-h3:mb-6 prose-h3:leading-[1.3] prose-h3:text-indigo-900
                                        prose-h4:text-2xl prose-h4:mt-12 prose-h4:mb-5 prose-h4:text-gray-800
                                        prose-h5:text-xl prose-h5:mt-8 prose-h5:mb-4 prose-h5:text-gray-700
                                        prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-[18px]
                                        prose-p:first-of-type:text-[20px] prose-p:first-of-type:leading-[1.9] prose-p:first-of-type:font-medium prose-p:first-of-type:text-gray-800
                                        prose-a:text-indigo-600 prose-a:font-semibold prose-a:no-underline prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:underline hover:prose-a:text-indigo-700 prose-a:transition-all
                                        prose-strong:text-gray-900 prose-strong:font-bold prose-strong:bg-yellow-100/50 prose-strong:px-1
                                        prose-em:text-gray-700 prose-em:italic
                                        prose-blockquote:border-l-[6px] prose-blockquote:border-indigo-500 prose-blockquote:bg-gradient-to-br prose-blockquote:from-indigo-50 prose-blockquote:to-purple-50 prose-blockquote:pl-8 prose-blockquote:pr-6 prose-blockquote:py-6 prose-blockquote:italic prose-blockquote:text-gray-800 prose-blockquote:my-12 prose-blockquote:rounded-r-2xl prose-blockquote:shadow-xl prose-blockquote:text-lg
                                        prose-code:bg-indigo-50 prose-code:text-indigo-700 prose-code:px-2.5 prose-code:py-1 prose-code:rounded-md prose-code:text-[16px] prose-code:font-mono prose-code:font-semibold prose-code:border prose-code:border-indigo-200
                                        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-0 prose-pre:rounded-xl prose-pre:overflow-hidden prose-pre:shadow-2xl prose-pre:my-12 prose-pre:border prose-pre:border-gray-700
                                        prose-ul:list-none prose-ul:ml-0 prose-ul:mb-8 prose-ul:space-y-4
                                        prose-ol:ml-0 prose-ol:mb-8 prose-ol:space-y-4 prose-ol:counter-reset-[item]
                                        prose-li:text-gray-700 prose-li:leading-[1.8] prose-li:pl-8 prose-li:relative prose-li:text-[18px]
                                        prose-ul>li:before:content-['▸'] prose-ul>li:before:absolute prose-ul>li:before:left-0 prose-ul>li:before:text-indigo-600 prose-ul>li:before:font-bold prose-ul>li:before:text-xl
                                        prose-ol>li:before:content-[counter(item)'.'] prose-ol>li:before:counter-increment-[item] prose-ol>li:before:absolute prose-ol>li:before:left-0 prose-ol>li:before:text-indigo-600 prose-ol>li:before:font-bold prose-ol>li:before:text-lg
                                        prose-li>p:my-2
                                        prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-16 prose-img:border-4 prose-img:border-white prose-img:ring-2 prose-img:ring-gray-200
                                        prose-table:border-collapse prose-table:w-full prose-table:my-12 prose-table:shadow-xl prose-table:rounded-xl prose-table:overflow-hidden prose-table:border prose-table:border-gray-300
                                        prose-thead:bg-gradient-to-r prose-thead:from-indigo-600 prose-thead:to-purple-600
                                        prose-th:p-5 prose-th:text-left prose-th:font-bold prose-th:text-white prose-th:border-b-2 prose-th:border-white/20 prose-th:text-base
                                        prose-td:border prose-td:border-gray-200 prose-td:p-5 prose-td:text-gray-700 prose-td:text-base
                                        prose-tr:border-b prose-tr:border-gray-200 hover:prose-tr:bg-indigo-50/30 prose-tr:transition-colors
                                        prose-hr:my-20 prose-hr:border-0 prose-hr:h-1 prose-hr:bg-gradient-to-r prose-hr:from-transparent prose-hr:via-indigo-300 prose-hr:to-transparent"
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
                                                        className={isFAQ ? 'text-indigo-600' : ''}
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

            <DualCTABlock />
        </div>
    );
}
