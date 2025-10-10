import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const reviews = [
  {
    name: "Jason Painter",
    timeAgo: "6 months ago",
    quote: "I have been so impressed — they've gotten me millions of views on my social media, and I've seen a large uptick in new patients in my office. The strategy and support they've given is significantly better than the 5 or so other marketing companies I've worked with.",
    rating: 5,
  },
  {
    name: "Alde Nguyen",
    timeAgo: "8 months ago",
    quote: "Disruptors are a brilliant full-suite marketing and product agency. They handled entire operations for our rollouts and campaigns, producing phenomenal creative assets and positioning our brand competitively. They optimized our go-to-market strategy, overdelivering beyond forecasts by large margins.",
    rating: 5,
  },
  {
    name: "Mitchell Halvorsen",
    timeAgo: "1 year ago",
    quote: "I can't say enough good things about Disruptors Media. Their team is professional, creative, and truly understands how to capture attention in today's fast-paced digital world. They made the process smooth from start to finish.",
    rating: 5,
  },
  {
    name: "Gabriel Costa e Silva",
    timeAgo: "1 year ago",
    quote: "All I can say is that this place is run by some awesome people of integrity. They genuinely have the best interest of their customers and go above and beyond for those they serve.",
    rating: 5,
  },
  {
    name: "Korina Flint",
    timeAgo: "2 years ago",
    quote: "I am thoroughly impressed with Disruptors Media. They are super talented and knowledgeable, but what impressed me even more is their dedication to their mission. They truly want to help others spread the message of health and wellness. My experience shooting a podcast with them was amazing.",
    rating: 5,
  },
  {
    name: "Chris",
    timeAgo: "2 years ago",
    quote: "Professional, well organized, and knowledgeable. If you're looking for a company that can drive revenue and expand your business success, this is the right place for you.",
    rating: 5,
  },
];

export default function GoogleReviewsSection() {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate current index based on scroll position
    const cardWidth = 340 + 16; // card width + gap
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(newIndex);
  };

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
    setTimeout(checkScrollPosition, 300);
  };

  const scrollToIndex = (index) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 340 + 16; // card width + gap
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  };

  const scrollNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < reviews.length) {
      scrollToIndex(nextIndex);
    } else {
      scrollToIndex(0); // Loop back to start
    }
  };

  // Drag handlers for mouse drag support
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
    scrollContainerRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab';
        scrollContainerRef.current.style.userSelect = 'auto';
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPaused(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply by 2 for faster drag
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch handlers for mobile drag support
  const handleTouchStart = (e) => {
    if (!scrollContainerRef.current) return;
    setIsPaused(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  // Auto-scroll functionality - slower for better readability
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      scrollNext();
    }, 7000); // Auto-scroll every 7 seconds (slower for better UX)

    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  // Check scroll position on mount and window resize
  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, []);

  const averageRating = 5.0;

  return (
    <section className="relative py-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-5xl font-bold">
            <span className="text-gray-900">Google </span>
            <span className="text-gray-900">Reviews</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Summary Card */}
          <div className="flex-shrink-0 lg:w-[380px]">
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm h-full">
              {/* Logo */}
              <div className="mb-6">
                <img
                  src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png"
                  alt="Disruptors AI"
                  className="h-12 object-contain"
                />
              </div>

              {/* Rating Label */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">Excellent</span>
              </div>

              {/* Business Name */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Disruptors Media</h3>
              </div>

              {/* Star Rating */}
              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-gray-900">{averageRating}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 text-[#C9A53B] fill-[#C9A53B]"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <a
                  href="https://share.google/D1q2PMgFUnQJrfgn8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#C9A53B] hover:bg-[#a88a2f] text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  <span>See all reviews</span>
                </a>
                <a
                  href="https://share.google/D1q2PMgFUnQJrfgn8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-[#C9A53B] text-[#C9A53B] hover:bg-[#C9A53B] hover:text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  <span>review us on</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right - Scrolling Review Cards */}
          <div className="flex-1 relative min-w-0">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollPosition}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="overflow-x-auto scrollbar-hide scroll-smooth pb-4 cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 w-[340px]"
                  >
                    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                      {/* Google Logo */}
                      <div className="absolute top-4 right-4">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>

                      {/* Name */}
                      <h4 className="text-lg font-bold text-gray-900 mb-1 pr-8">
                        {review.name}
                      </h4>

                      {/* Time */}
                      <p className="text-sm text-gray-500 mb-3">
                        {review.timeAgo}
                      </p>

                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-[#C9A53B] fill-[#C9A53B]"
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.quote}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-[#C9A53B] w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar globally for this section */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
