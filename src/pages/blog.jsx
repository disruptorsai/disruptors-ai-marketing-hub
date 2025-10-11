import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Loader2 } from 'lucide-react';
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
    <motion.div
      className={`bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-lg group ${isFeatured ? 'col-span-1 md:col-span-2 lg:col-span-3 grid lg:grid-cols-2 gap-0' : 'flex flex-col'}`}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className={`relative ${isFeatured ? 'h-full' : 'h-48'}`}>
          <img
            src={post.image || post.cover_image_url || 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <div className="p-8 flex flex-col justify-between flex-grow">
          <div>
              <p className="text-sm font-semibold text-black mb-2">{post.category || 'Uncategorized'}</p>
              <h3 className={`font-bold text-black mb-4 ${isFeatured ? 'text-3xl' : 'text-xl'}`}>{post.title}</h3>
              <p className="text-black leading-relaxed mb-6 flex-grow">{post.excerpt}</p>
          </div>
          <div>
              <div className="flex items-center text-xs text-black mb-6">
                  <div className="flex items-center mr-4">
                    <User className="w-3 h-3 mr-1.5"/> {post.author || 'Disruptors Team'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1.5"/> {formatDate(post.publishDate || post.publish_date || post.date)}
                  </div>
              </div>
              <Link
                to={`/blog-detail?slug=${post.slug}`}
                className="font-semibold text-black flex items-center hover:text-gray-700"
              >
                  Read More <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
          </div>
      </div>
    </motion.div>
  );
};


export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

  return (
    <div>
      {/* Enhanced Hero Section */}
      <section className="bg-transparent py-16 sm:py-24">
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
      </section>

      {/* Blog Grid */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-600">Loading blog posts...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">No blog posts available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
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