
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const placeholderReviews = [
  {
    name: "Jason Painter",
    role: "Local Guide",
    company: "Healthcare Practice",
    quote: "I have been so impressed — they've gotten me millions of views on my social media, and I've seen a large uptick in new patients in my office. The strategy and support they've given is significantly better than the 5 or so other marketing companies I've worked with.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Alde Nguyen",
    role: "Business Owner",
    company: "",
    quote: "Disruptors are a brilliant full-suite marketing and product agency. They handled entire operations for our rollouts and campaigns, producing phenomenal creative assets and positioning our brand competitively. They optimized our go-to-market strategy, overdelivering beyond forecasts by large margins.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Mitchell Halvorsen",
    role: "Client",
    company: "",
    quote: "I can't say enough good things about Disruptors Media. Their team is professional, creative, and truly understands how to capture attention in today's fast-paced digital world. They made the process smooth from start to finish.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Gabriel Costa e Silva",
    role: "Client",
    company: "",
    quote: "All I can say is that this place is run by some awesome people of integrity. They genuinely have the best interest of their customers and go above and beyond for those they serve.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Korina Flint",
    role: "Podcast Guest",
    company: "Health & Wellness",
    quote: "I am thoroughly impressed with Disruptors Media. They are super talented and knowledgeable, but what impressed me even more is their dedication to their mission. They truly want to help others spread the message of health and wellness. My experience shooting a podcast with them was amazing.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Chris",
    role: "Local Guide",
    company: "",
    quote: "Professional, well organized, and knowledgeable. If you're looking for a company that can drive revenue and expand your business success, this is the right place for you.",
    rating: 5,
    source: "Google",
    videoUrl: null
  }
];

export default function ReviewsCarousel({
  reviews = placeholderReviews,
  title = "What Our Clients Say"
}) {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll functionality
  useEffect(() => {
    if (isPaused || !scrollContainerRef.current) return;

    const scrollInterval = setInterval(() => {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.testimonial-card')?.offsetWidth || 0;
      const gap = 24; // 1.5rem gap
      const scrollAmount = cardWidth + gap;

      const maxScroll = container.scrollWidth - container.clientWidth;
      const nextScroll = container.scrollLeft + scrollAmount;

      if (nextScroll >= maxScroll) {
        // Reset to start with smooth scroll
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setActiveIndex(prev => Math.min(prev + 1, reviews.length - 1));
      }
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(scrollInterval);
  }, [isPaused, reviews.length]);

  // Update active index on manual scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector('.testimonial-card')?.offsetWidth || 0;
    const gap = 24;
    const newIndex = Math.round(container.scrollLeft / (cardWidth + gap));
    setActiveIndex(newIndex);
  };

  const scrollToIndex = (index) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector('.testimonial-card')?.offsetWidth || 0;
    const gap = 24;
    container.scrollTo({
      left: index * (cardWidth + gap),
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  return (
    <section className="relative py-8 sm:py-12 overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-sans text-4xl sm:text-5xl font-extrabold text-black tracking-tight mb-4">
            {title}
          </h2>
          <p className="font-sans text-lg text-gray-200 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say about working with us.
          </p>
        </motion.div>

        {/* Horizontal scroll carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="testimonial-card flex-shrink-0 w-[85vw] sm:w-[450px] snap-center"
            >
              <div className="h-full bg-black/40 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-white/10 relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

                {/* Quote icon */}
                <div className="mb-6 flex items-start justify-between">
                  <Quote className="w-10 h-10 text-[#C9A53B]/60" />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-[#C9A53B] fill-[#C9A53B]' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="font-sans text-gray-100 text-lg leading-relaxed mb-6 relative z-10 min-h-[120px]">
                  "{review.quote}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-sans font-semibold text-white">{review.name}</div>
                    <div className="font-sans text-sm text-gray-300">{review.role}</div>
                    <div className="font-sans text-sm text-gray-400">{review.company}</div>
                  </div>
                  <div className="text-xs text-gray-300 font-medium px-3 py-1 bg-white/10 rounded-full">
                    {review.source}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
