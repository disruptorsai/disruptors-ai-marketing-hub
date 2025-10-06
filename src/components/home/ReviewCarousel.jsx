import React from 'react';
import { Star, Quote } from 'lucide-react';

const reviews = [
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
    name: "Chris",
    role: "Local Guide",
    company: "",
    quote: "Professional, well organized, and knowledgeable. If you're looking for a company that can drive revenue and expand your business success, this is the right place for you.",
    rating: 5,
    source: "Google"
  }
];

export default function ReviewCarousel() {
  return (
    <section className="py-16 sm:py-24 bg-gray-900 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-white">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 p-8 rounded-3xl hover:shadow-2xl transition-shadow duration-300">
              {/* Quote icon */}
              <div className="mb-6 flex items-start justify-between">
                <Quote className="w-10 h-10 text-white/30" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-white fill-white' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-gray-200 text-base leading-relaxed mb-6 min-h-[120px]">
                "{review.quote}"
              </blockquote>

              {/* Author info */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                  {review.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{review.name}</div>
                  <div className="text-sm text-gray-400">{review.role}</div>
                  {review.company && <div className="text-sm text-gray-500">{review.company}</div>}
                </div>
                <div className="text-xs text-gray-400 font-medium px-3 py-1 bg-gray-700/50 rounded-full">
                  {review.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}