import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Quote } from 'lucide-react';
import DualCTABlock from '../shared/DualCTABlock';

export default function CaseStudyPageLayout({
  client,
  title,
  industry,
  challenge,
  approach,
  outcome,
  metrics = [],
  hero_media,
  testimonial_quote,
  testimonial_author,
  tags = [],
  relatedCases = []
}) {
  return (
    <div className="bg-transparent text-white">
      {/* Hero */}
      <section className="relative py-20 sm:py-32 bg-gray-900 text-white">
        {hero_media && (
          <div className="absolute inset-0">
            <img src={hero_media} alt={title} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/20 text-white">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{title || client}</h1>
            <p className="text-xl text-gray-300 mb-6">{industry}</p>
            {metrics.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 text-center">
                {metrics.slice(0, 3).map((metric, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold text-indigo-400">{metric.value}</div>
                    <div className="text-sm text-gray-300">{metric.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Challenge / Approach / Outcome */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-red-500/10 backdrop-blur-sm border border-red-400/20 p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold mb-4 text-red-200">Challenge</h2>
              <p className="text-red-100 leading-relaxed">{challenge}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold mb-4 text-blue-200">Approach</h2>
              <p className="text-blue-100 leading-relaxed">{approach}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-green-500/10 backdrop-blur-sm border border-green-400/20 p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold mb-4 text-green-200">Outcome</h2>
              <p className="text-green-100 leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery / Video Section */}
      <section className="py-16 sm:py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Project Gallery
          </motion.h2>
          <div className="bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/20 rounded-2xl aspect-video flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs font-mono text-gray-300">[PROJECT GALLERY/VIDEO]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {testimonial_quote && (
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-white p-12 rounded-3xl text-center relative"
            >
              <Quote className="w-12 h-12 mx-auto mb-6 opacity-50" />
              <blockquote className="text-xl sm:text-2xl font-medium mb-6 leading-relaxed">
                "{testimonial_quote}"
              </blockquote>
              <cite className="text-indigo-200 font-semibold">— {testimonial_author}</cite>
            </motion.div>
          </div>
        </section>
      )}

      {/* Related Cases */}
      {relatedCases.length > 0 && (
        <section className="py-16 sm:py-24 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Related Case Studies
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedCases.slice(0, 3).map((relatedCase, index) => (
                <motion.div
                  key={relatedCase.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={createPageUrl(`work-${relatedCase.slug}`)}
                    className="block group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-video bg-white/5 border-b-2 border-dashed border-white/20 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-xs font-mono text-gray-300">[THUMBNAIL]</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold mb-2 text-white group-hover:text-indigo-300">{relatedCase.title}</h3>
                      <p className="text-sm text-gray-200">{relatedCase.outcome}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <DualCTABlock />
    </div>
  );
}