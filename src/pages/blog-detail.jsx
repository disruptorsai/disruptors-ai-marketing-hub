import React, { useState, useEffect } from 'react';
import { customClient } from '@/lib/custom-sdk';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import usePageMeta from '@/hooks/usePageMeta';
import { useParams } from 'react-router-dom';

const ORG_ID = 'https://disruptorsmedia.com/#organization';

export default function BlogDetail() {
    const { slug: routeSlug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            // Prefer the clean path param (/blog/:slug); fall back to legacy ?slug= for old links.
            const slug = routeSlug || new URLSearchParams(window.location.search).get('slug');

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
                    setPost(posts[0]);
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
    }, [routeSlug]);

    // Per-post SEO/GEO metadata + BlogPosting JSON-LD. Called unconditionally (before the
    // loading/error early-returns) so hook order stays stable; emits nothing until `post` loads.
    const metaDescription = post
        ? (post.excerpt || post.meta_description ||
           String(post.content || '')
               .replace(/[#*_`>\[\]!~]/g, '')
               .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
               .replace(/\s+/g, ' ')
               .trim()
               .slice(0, 155))
        : '';
    // Canonical is always the clean path-based URL, regardless of how the page was reached.
    const postPath = post ? `/blog/${post.slug}` : '/blog';
    const postUrl = `https://disruptorsmedia.com${postPath}`;
    usePageMeta(post ? {
        title: `${post.title} | Disruptors Media`,
        description: metaDescription,
        path: postPath,
        ogImage: post.featured_image,
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            ...(metaDescription ? { description: metaDescription } : {}),
            ...(post.featured_image ? { image: post.featured_image } : {}),
            datePublished: post.published_at || post.created_at,
            dateModified: post.updated_at || post.published_at || post.created_at,
            author: post.author_name
                ? { '@type': 'Person', name: post.author_name }
                : { '@type': 'Organization', '@id': ORG_ID, name: 'Disruptors Media' },
            publisher: { '@id': ORG_ID },
            ...(post.category ? { articleSection: post.category } : {}),
            ...(Array.isArray(post.tags) && post.tags.length ? { keywords: post.tags.join(', ') } : {}),
            mainEntityOfPage: postUrl,
        },
    } : {});

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-red-600">{error || "Post not found"}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
                <div className="max-w-4xl mx-auto px-6 py-20">
                    {/* Back Button */}
                    <a
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </a>

                    {/* Category Badge */}
                    {post.category && (
                        <div className="mb-6">
                            <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                {post.category}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-300">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <span>{post.author_name || 'Disruptors Team'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>
                                {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        {post.read_time && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{post.read_time}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {post.featured_image && (
                <div className="max-w-5xl mx-auto -mt-20 px-6">
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                        <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            )}

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-6 py-20">
                <div className="prose prose-lg prose-gray max-w-none">
                    <style>{`
                        .prose {
                            color: #374151;
                        }

                        /* Headings */
                        .prose h1 {
                            font-size: 2.5rem;
                            font-weight: 800;
                            color: #111827;
                            margin-top: 3rem;
                            margin-bottom: 1.5rem;
                            line-height: 1.2;
                        }

                        .prose h2 {
                            font-size: 2rem;
                            font-weight: 700;
                            color: #111827;
                            margin-top: 4rem;
                            margin-bottom: 1.5rem;
                            line-height: 1.3;
                            padding-bottom: 0.5rem;
                            border-bottom: 2px solid #e5e7eb;
                        }

                        .prose h3 {
                            font-size: 1.5rem;
                            font-weight: 700;
                            color: #1f2937;
                            margin-top: 3rem;
                            margin-bottom: 1rem;
                            line-height: 1.4;
                        }

                        .prose h4 {
                            font-size: 1.25rem;
                            font-weight: 600;
                            color: #1f2937;
                            margin-top: 2rem;
                            margin-bottom: 1rem;
                        }

                        /* Paragraphs */
                        .prose p {
                            font-size: 1.125rem;
                            line-height: 1.9;
                            color: #374151;
                            margin-bottom: 2rem;
                        }

                        .prose p:first-of-type {
                            font-size: 1.25rem;
                            line-height: 1.8;
                        }

                        /* Links */
                        .prose a {
                            color: #2563eb;
                            text-decoration: none;
                            font-weight: 500;
                            border-bottom: 2px solid transparent;
                            transition: border-color 0.2s;
                        }

                        .prose a:hover {
                            border-bottom-color: #2563eb;
                        }

                        /* Lists */
                        .prose ul,
                        .prose ol {
                            margin: 2rem 0;
                            padding-left: 1.5rem;
                        }

                        .prose li {
                            font-size: 1.125rem;
                            line-height: 1.9;
                            margin: 1rem 0;
                            color: #374151;
                        }

                        .prose ul li {
                            list-style-type: disc;
                        }

                        .prose ol li {
                            list-style-type: decimal;
                        }

                        .prose li::marker {
                            color: #2563eb;
                            font-weight: 600;
                        }

                        /* Blockquotes */
                        .prose blockquote {
                            border-left: 4px solid #2563eb;
                            padding: 1.5rem 2rem;
                            margin: 3rem 0;
                            background: #f9fafb;
                            border-radius: 0 0.5rem 0.5rem 0;
                            font-style: italic;
                            color: #4b5563;
                            font-size: 1.125rem;
                        }

                        /* Code */
                        .prose code {
                            background: #f3f4f6;
                            padding: 0.2rem 0.5rem;
                            border-radius: 0.25rem;
                            font-family: 'Courier New', monospace;
                            font-size: 0.95em;
                            color: #be123c;
                        }

                        .prose pre {
                            background: #1f2937;
                            color: #f3f4f6;
                            padding: 1.5rem;
                            border-radius: 0.75rem;
                            overflow-x: auto;
                            margin: 2.5rem 0;
                            line-height: 1.7;
                        }

                        .prose pre code {
                            background: transparent;
                            padding: 0;
                            color: inherit;
                            font-size: 0.95rem;
                        }

                        /* Images */
                        .prose img {
                            border-radius: 0.75rem;
                            margin: 3rem 0;
                            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                        }

                        /* Strong and Em */
                        .prose strong {
                            color: #111827;
                            font-weight: 700;
                        }

                        .prose em {
                            font-style: italic;
                            color: #4b5563;
                        }

                        /* Tables */
                        .prose table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 2.5rem 0;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                            border-radius: 0.5rem;
                            overflow: hidden;
                        }

                        .prose th {
                            background: #f9fafb;
                            padding: 1rem;
                            text-align: left;
                            font-weight: 600;
                            color: #111827;
                            border-bottom: 2px solid #e5e7eb;
                        }

                        .prose td {
                            padding: 1rem;
                            border-bottom: 1px solid #e5e7eb;
                        }

                        .prose tr:last-child td {
                            border-bottom: none;
                        }

                        .prose tr:hover {
                            background: #f9fafb;
                        }

                        /* Horizontal Rule */
                        .prose hr {
                            border: none;
                            height: 1px;
                            background: linear-gradient(to right, transparent, #d1d5db, transparent);
                            margin: 4rem 0;
                        }
                    `}</style>

                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <div className="flex flex-wrap gap-3">
                            {post.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Share Buttons */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
                    <div className="flex gap-4">
                        <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                        >
                            Share on Twitter
                        </a>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                        >
                            Share on LinkedIn
                        </a>
                    </div>
                </div>
            </article>
        </div>
    );
}
