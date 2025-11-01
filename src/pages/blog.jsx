import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Loader2, Search, Filter, X, Tag } from 'lucide-react';
import DualCTABlock from "@/components/shared/DualCTABlock";
import GeometricSeparator from "@/components/shared/WavySeparator";
import { customClient } from '@/lib/custom-sdk';

const PostCard = ({ post, isFeatured = false }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <motion.article
      className={`bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-lg group ${isFeatured ? 'col-span-1 md:col-span-2 lg:col-span-3 grid lg:grid-cols-2 gap-0' : 'flex flex-col'}`}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      aria-label={`Blog post: ${post.title}`}
    >
      <div className={`relative ${isFeatured ? 'h-full' : 'h-48'}`}>
          <img
            src={post.image || post.cover_image_url || 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
            width={isFeatured ? "800" : "400"}
            height={isFeatured ? "600" : "192"}
          />
          <div className="absolute inset-0 bg-black/30" aria-hidden="true"></div>
      </div>
      <div className="p-8 flex flex-col justify-between flex-grow">
          <div>
              {post.category && (
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                  {post.category}
                </span>
              )}
              <h2 className={`font-bold text-black mb-4 ${isFeatured ? 'text-3xl' : 'text-xl'}`}>{post.title}</h2>
              <p className="text-black leading-relaxed mb-6 flex-grow">{post.excerpt}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4" aria-label="Post tags">
                  {post.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      <Tag className="w-3 h-3" aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
          </div>
          <div>
              <div className="flex items-center text-xs text-black mb-6">
                  <div className="flex items-center mr-4">
                    <User className="w-3 h-3 mr-1.5" aria-hidden="true"/>
                    <span className="sr-only">Author: </span>
                    {post.author || 'Disruptors Team'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1.5" aria-hidden="true"/>
                    <time dateTime={post.publishDate || post.publish_date || post.date}>
                      {formatDate(post.publishDate || post.publish_date || post.date)}
                    </time>
                  </div>
              </div>
              <Link
                to={`/blog-detail?slug=${post.slug}`}
                className="font-semibold text-black flex items-center hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-lg px-2 py-1 -ml-2"
                aria-label={`Read full article: ${post.title}`}
              >
                  Read More <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
          </div>
      </div>
    </motion.article>
  );
};


export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        // Fetch all published posts from Supabase posts table
        const allPosts = await customClient.entities.Post.filter({
          is_published: true
        });

        // Sort by publish date (newest first)
        const sortedPosts = (allPosts || []).sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at || 0);
          const dateB = new Date(b.published_at || b.created_at || 0);
          return dateB - dateA;
        });

        // Map to expected format
        const mappedPosts = sortedPosts.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          category: post.category,
          author: post.author_id ? `User ${post.author_id.substring(0, 8)}` : 'Disruptors Team',
          publishDate: post.published_at || post.created_at,
          image: post.featured_image,
          content: post.content,
          tags: post.tags
        }));

        setPosts(mappedPosts);
        console.log(`✅ Loaded ${mappedPosts.length} published blog posts from Supabase`);
      } catch (err) {
        console.error('❌ Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();

    // Real-time subscription for instant updates when posts are published
    import('@/lib/supabase-client').then(({ supabase }) => {
      const subscription = supabase
        .channel('public_blog_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: 'is_published=eq.true'
        }, () => {
          console.log('🔄 Blog post updated, refreshing...');
          fetchBlogPosts();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    });
  }, []);

  // Extract unique categories and tags from posts
  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [posts]);

  const tags = useMemo(() => {
    const tagSet = new Set();
    posts.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return ['all', ...Array.from(tagSet)];
  }, [posts]);

  // Filtered posts based on search, category, and tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchQuery === '' ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' ||
        post.category === selectedCategory;

      const matchesTag = selectedTag === 'all' ||
        (post.tags && post.tags.includes(selectedTag));

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [posts, searchQuery, selectedCategory, selectedTag]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag('all');
  };

  return (
    <div>
      {/* Enhanced Hero Section */}
      <header className="bg-transparent py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium leading-tight tracking-tight text-black">
                The Disruptors Blog
              </h1>
              <p className="text-xl sm:text-2xl leading-relaxed text-black">
                Actionable insights, proven strategies, and a behind-the-scenes look at how we build AI-powered growth systems. Discover the latest trends, case studies, and expert advice to transform your business with AI.
              </p>
            </motion.div>

            {/* Video Content - Larger */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video">
                <video
                  src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759270235/social_u4455988764_a_michealangelo_painting_of_a_decorated_and_rugge_cdd91916-0689-4b4c-8aa1-419f07eed4f4_0_eo3dgk.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label="Content creation and blogging"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white/50 backdrop-blur-sm border-y border-gray-200" aria-label="Blog search and filters">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <label htmlFor="blog-search" className="sr-only">Search blog posts</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                id="blog-search"
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all text-gray-900 placeholder-gray-500"
                aria-label="Search blog posts by title or content"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
              <span className="text-sm font-semibold text-gray-700">Filter by:</span>

              {/* Category Filter */}
              <div>
                <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  aria-label="Filter posts by category"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label htmlFor="tag-filter" className="sr-only">Filter by tag</label>
                <select
                  id="tag-filter"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  aria-label="Filter posts by tag"
                >
                  {tags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag === 'all' ? 'All Tags' : tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedCategory !== 'all' || selectedTag !== 'all') && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                Clear Filters
              </motion.button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600" role="status" aria-live="polite">
            Showing <span className="font-bold text-gray-900">{filteredPosts.length}</span> of <span className="font-bold text-gray-900">{posts.length}</span> articles
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-24 sm:pb-32" aria-label="Blog posts">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center py-20" role="status" aria-live="polite">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" aria-hidden="true" />
                <span className="ml-3 text-gray-600">Loading blog posts...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20" role="alert">
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">
                  {posts.length === 0
                    ? 'No blog posts available yet. Check back soon!'
                    : 'No posts match your search criteria. Try adjusting your filters.'}
                </p>
                {posts.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <PostCard key={post.id || post.slug} post={post} isFeatured={index === 0} />
                ))}
              </div>
            )}
        </div>
      </section>

      {/* CTA Block */}
      <section className="relative bg-gray-800 text-white py-20">
         <GeometricSeparator type="top" className="text-white" />
         <DualCTABlock
            title="Get Insights Delivered"
            cta1_text="Subscribe to Newsletter"
            cta1_link="#"
            cta2_text="Book a Strategy Session"
            cta2_link="book-strategy-session"
         />
      </section>
    </div>
  );
}