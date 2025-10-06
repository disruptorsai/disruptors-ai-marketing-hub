
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DualCTABlock from '../components/shared/DualCTABlock';
import PageTitle from '../components/shared/PageTitle';

const clients = [
  { name: "TradeWorx USA", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167812/case-studies/case-studies/tradeworxusa_logo.svg", path: "work-tradeworx-usa" },
  { name: "Timber View Financial", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167811/case-studies/case-studies/timberviewfinancial_logo.webp", path: "work-timber-view-financial" },
  { name: "The Wellness Way", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167810/case-studies/case-studies/thewellnessway_logo.webp", path: "work-the-wellness-way" },
  { name: "Sound Corrections", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167809/case-studies/case-studies/soundcorrections_logo.svg", path: "work-sound-corrections" },
  { name: "SegPro", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167808/case-studies/case-studies/segpro_logo.png", path: "work-segpro" },
  { name: "Neuro Mastery", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167807/case-studies/case-studies/neuromastery_logo.webp", path: "work-neuro-mastery" },
  { name: "Muscle Works", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167806/case-studies/case-studies/muscleworks_logo.png", path: "work-muscle-works" },
  { name: "Granite Paving", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167806/case-studies/case-studies/granitepaving_logo.png", path: "work-granite-paving" },
  { name: "Auto Trim Utah", logo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167805/case-studies/case-studies/autotrimutah_logo.png", path: "work-auto-trim-utah" }
];

export default function Work() {
  return (
    <div>
      {/* Page Title */}
      <PageTitle title="WORK" />

      {/* Header Section */}
      <section className="py-8 sm:py-12 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Real Clients. Real Results.
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6">
              Growth Systems That Speak for Themselves
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We don't just create campaigns—we build growth infrastructure that delivers measurable results. Here's how we've helped real businesses simplify, scale, and succeed using the power of strategy + automation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Study Grid */}
      <section className="py-8 sm:py-12 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {clients.map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link
                  to={createPageUrl(client.path)}
                  className="block"
                >
                  <div className="relative h-48 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-110">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-h-32 max-w-full w-auto object-contain"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini CTA Block */}
      <section className="py-8 sm:py-12 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Wondering What This Could Look Like for Your Business?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's audit your systems and uncover the untapped growth potential in your pipeline, marketing, and operations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to={createPageUrl("book-strategy-session")}>Book a Free Strategy Session</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link to={createPageUrl("free-business-audit")}>Get a Free Business Audit</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Block */}
      <section className="bg-gray-900 text-white">
        <DualCTABlock />
      </section>
    </div>
  );
}
