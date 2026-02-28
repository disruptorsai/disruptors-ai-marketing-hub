import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PageTitle from '../components/shared/PageTitle';

const PricingTier = ({ tier, index, isPopular }) => {
  const delayBase = index * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delayBase }}
      viewport={{ once: true }}
      className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 ${
        isPopular
          ? 'border-yellow-500 shadow-yellow-500/20'
          : 'border-white/20'
      } hover:scale-105 transition-all duration-300 flex flex-col h-full`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold text-sm uppercase flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-white mb-2">{tier.name}</h3>
        <div className="mb-4">
          <span className="text-5xl font-bold text-white">{tier.price}</span>
          {tier.priceNote && (
            <span className="text-white/70 text-lg ml-2">{tier.priceNote}</span>
          )}
        </div>
        <p className="text-white/80 text-base italic">{tier.tagline}</p>
      </div>

      <div className="flex-grow mb-6">
        <ul className="space-y-3">
          {tier.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: delayBase + (idx * 0.05) }}
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <Check className={`w-5 h-5 flex-shrink-0 mt-1 ${
                isPopular ? 'text-gold-shine' : 'text-white'
              }`} />
              <span className="text-white/90 text-sm leading-relaxed">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {tier.description && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/70 text-sm leading-relaxed">{tier.description}</p>
        </div>
      )}

      <Link
        to={createPageUrl('book-strategy-session')}
        className={`block w-full py-4 px-6 text-center font-bold uppercase transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 ${
          isPopular
            ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
            : 'bg-white/20 hover:bg-white/30 text-white border-2 border-white/30'
        }`}
      >
        Get Started
      </Link>
    </motion.div>
  );
};

export default function Pricing() {
  const pricingTiers = [
    {
      name: 'Agency Plan',
      price: '$850',
      priceNote: '/ month',
      tagline: 'Ideal for early-stage companies or established teams needing tactical execution.',
      features: [
        'Channel-Specific Campaign Management',
        'SEO & SEM Execution (Google + Local)',
        'Paid Social Campaigns + Content Scheduling',
        'Landing Page Optimization',
        'Monthly AI Performance Snapshots',
        'Retargeting Campaign Setup',
        'Creative & Messaging Support'
      ],
      description: 'For businesses seeking hands-on campaign execution with measurable ROI.'
    },
    {
      name: 'Growth Plan',
      price: '$1,500',
      priceNote: '/ month',
      tagline: 'Integrated strategy and automation across multiple channels for scalable growth.',
      features: [
        'Cross-Channel Marketing Strategy & Execution',
        'Funnel Mapping + Customer Journey Design',
        'Light Funnel Strategy + KPI Mapping',
        'Oversight of In-House/External Teams',
        'Weekly Leadership Sync Meetings'
      ],
      description: 'For teams ready to connect their marketing systems and grow with intelligent automation.'
    },
    {
      name: 'Executive Plan',
      price: '$3,500',
      priceNote: '/ month',
      tagline: 'Hands-on marketing and systems leadership integrated directly with your team.',
      features: [
        'Full-Funnel Growth Strategy & Revenue Tracking',
        'AI System Implementation + Optimization',
        'Channel & Budget Allocation Planning',
        'Custom Software/Dashboard Development (GHL, HubSpot, GA4)',
        'Strategic Consultations with Disruptors Team',
        'Chief Revenue Officer-Style KPI Tracking & Strategy'
      ],
      description: 'For companies seeking executive-level leadership that combines marketing strategy with technical precision.',
      isPopular: true
    },
    {
      name: 'Enterprise Plan',
      price: '$5,000+',
      priceNote: '/ month',
      tagline: 'Fully embedded CMO partnership with end-to-end marketing and automation oversight.',
      features: [
        'Full Omni-Channel Strategy & Management',
        'AI Workflow Engineering + Custom Automation on-demand',
        'Strategic Ops (RevOps, Sales Enablement, Tech Stack)',
        'Cross-Functional Team Leadership',
        'Custom Reporting + Forecast Modeling',
        'Content & Campaign Oversight (Video, Podcast, Social)',
        'Real-Time Access for Ongoing Collaboration',
        'Software Development for Streamlining Processes through Custom AI Employees'
      ],
      description: 'For organizations ready for full-scale integration, 24/7 optimization, and limitless growth potential.'
    }
  ];

  return (
    <div>
      <PageTitle title="PRICING" />

      {/* Hero Section */}
      <section className="relative bg-black py-20 overflow-hidden">
        <div className="absolute inset-0">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759269831/social_u4455988764_a_michealangelo_painting_of_the_roman_army_in_a_w_c2966bc6-6ae4-4a6c-a3a0-10417b7e23ee_0_vnc9jx.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/85" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Flexible Pricing</span>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Choose Your Growth Path
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              From tactical execution to full CMO partnership, we have the right solution for your business stage and growth goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Tiers Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {pricingTiers.map((tier, index) => (
              <PricingTier
                key={tier.name}
                tier={tier}
                index={index}
                isPopular={tier.isPopular}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose Disruptors Media?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              We're not just another marketing agency. We're your strategic partner in growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-gold-shine" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Efficiency</h3>
              <p className="text-white/70 leading-relaxed">
                Leverage cutting-edge AI automation to scale your marketing without scaling your costs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                <ArrowRight className="w-8 h-8 text-gold-shine" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Proven Track Record</h3>
              <p className="text-white/70 leading-relaxed">
                Our strategies have helped dozens of companies achieve 300%+ ROI and sustainable growth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-gold-shine" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Flexible & Transparent</h3>
              <p className="text-white/70 leading-relaxed">
                No hidden fees, no long-term contracts. Just clear pricing and measurable results.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-500 to-yellow-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Ready to Accelerate Your Growth?
            </h2>
            <p className="text-xl text-black/80 mb-8 leading-relaxed">
              Book a free strategy session and discover how we can transform your marketing with AI-powered solutions.
            </p>
            <Link
              to={createPageUrl('book-strategy-session')}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-black hover:bg-gray-900 text-white text-lg font-bold uppercase transition-all duration-300 shadow-2xl hover:scale-105"
            >
              <span>Book Your Free Session</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
