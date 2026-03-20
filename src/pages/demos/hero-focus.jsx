import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroFocusDemo() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white">
      {/* Full-Screen Hero with Video Background */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/website-demo-reel.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Logo */}
            <motion.img
              src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png"
              alt="Disruptors AI"
              className="h-24 sm:h-32 lg:h-40 mx-auto mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-6 tracking-tight">
              Digital Marketing
              <br />
              <span className="text-gold-shine">× AI Solutions</span>
            </h1>

            <p className="text-xl sm:text-2xl lg:text-3xl text-[#EAEAEA] mb-4 max-w-3xl mx-auto font-light">
              Proven marketing strategies powered by intelligent automation
            </p>
            <p className="text-lg sm:text-xl text-[#C7C7C7] mb-12 max-w-2xl mx-auto">
              We drive growth with expert digital marketing, then multiply results with AI for business
            </p>

            {/* Single Prominent CTA */}
            <motion.button
              className="group relative inline-flex items-center gap-3 bg-[#FFD700] hover:bg-[#E0B200] text-black px-12 py-6 rounded-full text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-[#FFD700]/50 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Digital Marketing + AI
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </motion.button>

            {/* Secondary Action */}
            <div className="mt-8">
              <button className="inline-flex items-center gap-2 text-[#C7C7C7] hover:text-white transition-colors">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof Ticker */}
      <section className="bg-[#0E0E0E] py-8 border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[#C7C7C7] text-sm">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-gold-shine mb-2">500+</div>
              <div className="text-xs sm:text-sm">Clients Transformed</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-gold-shine mb-2">300%</div>
              <div className="text-xs sm:text-sm">Average Growth</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-gold-shine mb-2">24/7</div>
              <div className="text-xs sm:text-sm">AI-Powered Support</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-gold-shine mb-2">$50M+</div>
              <div className="text-xs sm:text-sm">Revenue Generated</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-24 bg-[#0E0E0E]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Two Services. One Mission: Your Growth.
            </h2>
            <p className="text-xl text-[#C7C7C7] max-w-3xl mx-auto">
              We combine proven digital marketing with cutting-edge AI to transform how you attract, convert, and scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Digital Marketing */}
            <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-[#2A2A2A]">
              <div className="text-gold-shine text-sm font-bold mb-3">SERVICE 1</div>
              <h3 className="text-3xl font-bold mb-4">Digital Marketing</h3>
              <p className="text-[#EAEAEA] text-lg mb-6">
                Expert strategies that drive traffic, generate leads, and convert customers through proven channels
              </p>
              <ul className="space-y-3 text-[#C7C7C7]">
                <li className="flex items-start gap-2">
                  <span className="text-gold-shine mt-1">✓</span>
                  <span>SEO & Content Marketing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-shine mt-1">✓</span>
                  <span>Social Media Management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-shine mt-1">✓</span>
                  <span>Paid Advertising (Google, Meta, LinkedIn)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-shine mt-1">✓</span>
                  <span>Email & SMS Campaigns</span>
                </li>
              </ul>
            </div>

            {/* AI Solutions */}
            <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-[#2A2A2A]">
              <div className="text-gold-shine text-sm font-bold mb-3">SERVICE 2</div>
              <h3 className="text-3xl font-bold mb-4">AI for Business</h3>
              <p className="text-[#EAEAEA] text-lg mb-6">
                Intelligent automation that scales your operations, personalizes experiences, and multiplies your results
              </p>
              <ul className="space-y-3 text-[#C7C7C7]">
                <li className="flex items-start gap-2">
                  <span className="text-gold-shine mt-1">✓</span>
                  <span>AI-Powered Lead Generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-shine mt-1">✓</span>
                  <span>Marketing Automation Systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-shine mt-1">✓</span>
                  <span>Predictive Analytics & Insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-shine mt-1">✓</span>
                  <span>Custom AI Solutions</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button className="inline-flex items-center gap-2 border-2 border-[#FFD700] text-gold-shine hover:bg-[#FFD700] hover:text-black px-8 py-4 rounded-full font-semibold transition-all">
              See How They Work Together
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
