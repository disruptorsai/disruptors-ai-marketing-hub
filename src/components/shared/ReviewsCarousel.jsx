
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const placeholderReviews = [
  {
    name: "John Smith",
    role: "CEO",
    company: "TradeWorx USA",
    quote: "Working with Disruptors AI completely transformed our lead generation. We went from chasing cold leads to having qualified prospects reach out to us daily. The AI automation handles everything while we focus on closing deals.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Dr. Sarah Williams",
    role: "Practice Owner",
    company: "The Wellness Way",
    quote: "Before Disruptors AI, we were spending 35+ hours a week on marketing tasks. Now it runs itself. We've added 500+ new patients in 6 months and our cost per acquisition dropped by 60%. This is the future of healthcare marketing.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Mike Johnson",
    role: "Owner",
    company: "SegPro Construction",
    quote: "We secured $2M in new contracts in the first 6 months. The AI knows our ideal customer better than we do - 92% of our leads are now qualified, and our close rate jumped to 45%. Best investment we've ever made.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Jennifer Martinez",
    role: "Owner",
    company: "Granite Paving",
    quote: "The level of personalization in our campaigns is incredible. Every piece of content speaks directly to our customers' pain points. Our engagement rates tripled and revenue is up 250%. This isn't just marketing - it's a growth engine.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "David Chen",
    role: "President",
    company: "Auto Trim Utah",
    quote: "I was skeptical about AI marketing, but the results speak for themselves. Our pipeline is consistently full of qualified leads, our conversion rates doubled, and we're scaling faster than ever. The ROI is undeniable.",
    rating: 5,
    source: "Google",
    videoUrl: null
  },
  {
    name: "Lisa Thompson",
    role: "Founder",
    company: "Sound Corrections",
    quote: "What impressed me most is how the Disruptors team understands our industry. They built a system that captures our unique voice while automating all the tedious work. We're seeing 10x the results with half the effort.",
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
    <section className="relative py-20 sm:py-28 overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>

                {/* Quote icon */}
                <div className="mb-6 flex items-start justify-between">
                  <Quote className="w-10 h-10 text-white/40" />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-gray-100 text-lg leading-relaxed mb-6 relative z-10 min-h-[120px]">
                  "{review.quote}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{review.name}</div>
                    <div className="text-sm text-gray-300">{review.role}</div>
                    <div className="text-sm text-gray-400">{review.company}</div>
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
                  ? 'w-8 h-2 bg-blue-500'
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
