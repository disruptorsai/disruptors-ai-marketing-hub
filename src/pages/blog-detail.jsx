
import React, { useState, useEffect } from 'react';
import { customClient } from '@/lib/custom-sdk';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import DualCTABlock from '../components/shared/DualCTABlock';

export default function BlogDetail() {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="text-white">
            {/* Hero */}
            <section className="relative py-20 sm:py-32">
                {post.featured_image && (
                    <div className="absolute inset-0">
                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-gray-900/30 to-transparent" />
                    </div>
                )}
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-black/30 backdrop-blur-md rounded-3xl p-8">
                        <p className="text-indigo-400 font-semibold mb-2">{post.category || 'Article'}</p>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{post.title}</h1>
                        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{post.excerpt}</p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <div className="py-16 sm:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white/90 backdrop-blur-md text-gray-900 rounded-3xl p-8 sm:p-12">
                        {/* Metadata Bar */}
                        <div className="border-b border-gray-200 pb-4 mb-8 flex flex-wrap justify-center sm:justify-between items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center">
                                    <User className="w-4 h-4 mr-1.5" />
                                    {post.author_id ? `User ${post.author_id.substring(0, 8)}` : 'Disruptors Team'}
                                </span>
                                <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                                </span>
                                {post.read_time && (
                                    <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1.5" /> {post.read_time}
                                    </span>
                                )}
                            </div>
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    {post.tags.join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Post Body */}
                        <div
                            className="prose prose-lg prose-indigo max-w-none
                                prose-headings:text-gray-900 prose-headings:font-bold
                                prose-h1:text-4xl prose-h1:mb-6 prose-h1:leading-tight
                                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:leading-tight prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3
                                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-snug
                                prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
                                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-[17px]
                                prose-a:text-indigo-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-indigo-700
                                prose-strong:text-gray-900 prose-strong:font-bold
                                prose-em:text-gray-700 prose-em:italic
                                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-gray-800 prose-blockquote:my-6 prose-blockquote:rounded-r-lg
                                prose-code:bg-indigo-50 prose-code:text-indigo-700 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[15px] prose-code:font-mono prose-code:font-medium
                                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:shadow-lg prose-pre:my-8
                                prose-ul:list-disc prose-ul:ml-8 prose-ul:mb-6 prose-ul:space-y-2
                                prose-ol:list-decimal prose-ol:ml-8 prose-ol:mb-6 prose-ol:space-y-2
                                prose-li:text-gray-700 prose-li:leading-relaxed prose-li:pl-2
                                prose-li>p:my-2
                                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-gray-200
                                prose-table:border-collapse prose-table:w-full prose-table:my-8 prose-table:shadow-md prose-table:rounded-lg prose-table:overflow-hidden
                                prose-thead:bg-gray-100
                                prose-th:bg-gray-100 prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:text-gray-900 prose-th:border-b-2 prose-th:border-gray-300
                                prose-td:border prose-td:border-gray-200 prose-td:p-4 prose-td:text-gray-700
                                prose-tr:border-b prose-tr:border-gray-200 hover:prose-tr:bg-gray-50
                                prose-hr:my-12 prose-hr:border-gray-300"
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            <DualCTABlock />
        </div>
    );
}
