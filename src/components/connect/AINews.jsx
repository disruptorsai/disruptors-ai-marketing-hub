import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Zap, ExternalLink } from 'lucide-react';

const NEWS_ITEMS = [
  {
    id: 1,
    icon: Zap,
    badge: "Just Launched",
    headline: "Claude 4.0 Sets New Benchmarks",
    description: "Anthropic's latest model shows 40% improvement in reasoning tasks and extended context windows.",
    date: "2 days ago",
    url: "https://www.anthropic.com",
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: 2,
    icon: TrendingUp,
    badge: "Industry Insight",
    headline: "AI Marketing Spend to Hit $107B by 2028",
    description: "Companies are investing heavily in AI-powered marketing automation and personalization.",
    date: "1 week ago",
    url: "https://www.gartner.com",
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    id: 3,
    icon: Newspaper,
    badge: "Breaking News",
    headline: "Google Gemini 2.5 Now Multimodal",
    description: "Process images, video, and audio simultaneously with improved understanding and faster responses.",
    date: "3 days ago",
    url: "https://deepmind.google",
    gradient: "from-purple-500 to-pink-500"
  }
];

export default function AINews() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <Newspaper className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Latest AI News</h3>
          <p className="text-gray-400 text-sm">Stay ahead of the curve</p>
        </div>
      </div>

      {/* News Cards */}
      <div className="space-y-4">
        {NEWS_ITEMS.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="block bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-cyan-400/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Badge */}
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 mb-2">
                    {item.badge}
                  </span>

                  {/* Headline */}
                  <h4 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                    {item.headline}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-2">
                    {item.description}
                  </p>

                  {/* Date */}
                  <p className="text-gray-500 text-xs">
                    {item.date}
                  </p>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* More News CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-4"
      >
        <a
          href="https://www.disruptorsmedia.com/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2 group"
        >
          Read More AI Insights
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </motion.div>
  );
}
