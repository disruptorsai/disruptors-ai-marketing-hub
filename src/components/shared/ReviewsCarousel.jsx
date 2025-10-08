import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

const placeholderReviews = [
  {
    name: "Jason Painter",
    role: "Local Guide",
    company: "Healthcare Practice",
    quote: "I have been so impressed — they've gotten me millions of views on my social media, and I've seen a large uptick in new patients in my office. The strategy and support they've given is significantly better than the 5 or so other marketing companies I've worked with.",
    rating: 5,
    source: "Google"
  },
  {
    name: "Alde Nguyen",
    role: "Business Owner",
    company: "",
    quote: "Disruptors are a brilliant full-suite marketing and product agency. They handled entire operations for our rollouts and campaigns, producing phenomenal creative assets and positioning our brand competitively. They optimized our go-to-market strategy, overdelivering beyond forecasts by large margins.",
    rating: 5,
    source: "Google"
  },
  {
    name: "Mitchell Halvorsen",
    role: "Client",
    company: "",
    quote: "I can't say enough good things about Disruptors Media. Their team is professional, creative, and truly understands how to capture attention in today's fast-paced digital world. They made the process smooth from start to finish.",
    rating: 5,
    source: "Google"
  },
  {
    name: "Gabriel Costa e Silva",
    role: "Client",
    company: "",
    quote: "All I can say is that this place is run by some awesome people of integrity. They genuinely have the best interest of their customers and go above and beyond for those they serve.",
    rating: 5,
    source: "Google"
  },
  {
    name: "Korina Flint",
    role: "Podcast Guest",
    company: "Health & Wellness",
    quote: "I am thoroughly impressed with Disruptors Media. They are super talented and knowledgeable, but what impressed me even more is their dedication to their mission. They truly want to help others spread the message of health and wellness. My experience shooting a podcast with them was amazing.",
    rating: 5,
    source: "Google"
  },
  {
    name: "Chris",
    role: "Local Guide",
    company: "",
    quote: "Professional, well organized, and knowledgeable. If you're looking for a company that can drive revenue and expand your business success, this is the right place for you.",
    rating: 5,
    source: "Google"
  }
];

export default function ReviewsCarousel({
  reviews = placeholderReviews
}) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Triple the reviews array for seamless infinite scroll
  const infiniteReviews = [...reviews, ...reviews, ...reviews];

  return (
    <>
      {/* Compact Infinite Scrolling Carousel */}
      <section className="relative py-4 overflow-hidden bg-gray-100">
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="flex gap-4"
            animate={{
              x: [0, -100 * reviews.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: isHovered ? 120 : 60, // Slow down on hover (60s → 120s)
                ease: "linear",
              },
            }}
          >
            {infiniteReviews.map((review, index) => (
              <motion.div
                key={index}
                onClick={() => setSelectedReview(review)}
                className="flex-shrink-0 w-80 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.rating ? 'text-[#C9A53B] fill-[#C9A53B]' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>

                  {/* Quote - Truncated */}
                  <p className="font-sans text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
                    "{review.quote}"
                  </p>

                  {/* Author info - Compact */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-xs">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-semibold text-xs text-gray-900 truncate">{review.name}</div>
                      <div className="font-sans text-xs text-gray-500 truncate">{review.role}</div>
                    </div>
                    <div className="text-xs text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded">
                      {review.source}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enlarged Review Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white rounded-2xl p-8 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedReview(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < selectedReview.rating ? 'text-[#C9A53B] fill-[#C9A53B]' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              {/* Full Quote */}
              <blockquote className="font-sans text-xl text-gray-800 leading-relaxed mb-6">
                "{selectedReview.quote}"
              </blockquote>

              {/* Author info - Full */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xl">
                  {selectedReview.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-sans font-semibold text-lg text-gray-900">{selectedReview.name}</div>
                  <div className="font-sans text-sm text-gray-600">{selectedReview.role}</div>
                  {selectedReview.company && (
                    <div className="font-sans text-sm text-gray-500">{selectedReview.company}</div>
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium px-4 py-2 bg-gray-100 rounded-lg">
                  {selectedReview.source}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
