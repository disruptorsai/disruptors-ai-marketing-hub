
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import InfiniteLogoWall from '../components/shared/InfiniteLogoWall';
import { caseStudies } from '@/data/caseStudies';

export default function Work() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Infinite Logo Wall - Fullscreen */}
      <InfiniteLogoWall items={caseStudies} />

      {/* Overlay Content */}
      <div className="relative z-10 pointer-events-none">
        {/* Page Title Overlay */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-black/70 backdrop-blur-md px-12 py-6 rounded-2xl"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight text-center uppercase">
              Our Clients
            </h1>
          </motion.div>
        </div>

        {/* Bottom CTA Section - Fixed at bottom */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-black/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
              Ready to Join Them?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-3 bg-yellow-400 text-black hover:bg-yellow-500">
                <Link to={createPageUrl("book-strategy-session")}>Book a Strategy Session</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-black">
                <Link to={createPageUrl("contact")}>Get in Touch</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
