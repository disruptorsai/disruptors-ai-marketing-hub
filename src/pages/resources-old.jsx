import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Resources() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 sm:p-16 shadow-2xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center mb-8"
            >
              <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600" strokeWidth={1.5} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight mb-6"
            >
              Coming Soon
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl sm:text-2xl text-gray-600 leading-relaxed"
            >
              We're curating something extraordinary for you. AI resources, tools, and insights that will transform the way you work.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}