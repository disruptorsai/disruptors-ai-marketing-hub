import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, FileText, BarChart3, Target, Lightbulb } from 'lucide-react';

const UPCOMING_TOOLS = [
  {
    id: 1,
    icon: MessageSquare,
    name: "AI Agent Chat",
    description: "Chat with specialized AI agents trained on your business data",
    status: "Beta Testing",
    color: "from-blue-500 to-cyan-500",
    glowColor: "shadow-cyan-500/50"
  },
  {
    id: 2,
    icon: FileText,
    name: "AI Content Writer",
    description: "Generate blog posts, social media, and emails in your brand voice",
    status: "Coming Q2 2025",
    color: "from-purple-500 to-pink-500",
    glowColor: "shadow-purple-500/50"
  },
  {
    id: 3,
    icon: BarChart3,
    name: "Growth Audit AI",
    description: "Comprehensive analysis of your digital presence with actionable insights",
    status: "Live Now!",
    color: "from-green-500 to-emerald-500",
    glowColor: "shadow-green-500/50",
    isLive: true
  },
  {
    id: 4,
    icon: Target,
    name: "Keyword Research Tool",
    description: "Find high-converting keywords with AI-powered competitor analysis",
    status: "Live Now!",
    color: "from-orange-500 to-red-500",
    glowColor: "shadow-orange-500/50",
    isLive: true
  },
  {
    id: 5,
    icon: Lightbulb,
    name: "Marketing Audit",
    description: "Score your marketing strategy and get personalized recommendations",
    status: "Coming Soon",
    color: "from-yellow-500 to-amber-500",
    glowColor: "shadow-yellow-500/50"
  }
];

export default function ComingSoon() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-400/30 rounded-2xl p-6 md:p-8 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full border border-purple-400/30 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span className="text-white font-semibold">Exclusive Preview</span>
        </div>
        <h3 className="text-3xl font-bold text-white">
          AI Tools Coming Your Way
        </h3>
        <p className="text-gray-400 text-lg">
          Get early access to these game-changing tools
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4">
        {UPCOMING_TOOLS.map((tool, index) => {
          const IconComponent = tool.icon;

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              className={`
                relative bg-gray-900/50 border rounded-xl p-5 overflow-hidden group
                ${tool.isLive
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20'
                  : 'border-gray-700 hover:border-purple-400/50'
                }
              `}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 shadow-lg ${tool.glowColor}`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-white font-bold text-lg">
                      {tool.name}
                    </h4>
                    <span className={`
                      text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap
                      ${tool.isLive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      }
                    `}>
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Live Pulse Effect */}
              {tool.isLive && (
                <motion.div
                  className="absolute top-5 right-5 w-3 h-3 rounded-full bg-green-500"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-4 border-t border-gray-700"
      >
        <p className="text-gray-400 mb-3">
          Want early access to these tools?
        </p>
        <a
          href="https://www.disruptorsmedia.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          Request Early Access
        </a>
      </motion.div>
    </motion.div>
  );
}
