import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, TrendingUp, Shield, Clock, Users, BarChart3, Sparkles, Check, X, ChevronDown, ChevronUp, Play, DollarSign, Calendar } from 'lucide-react';

export default function BenefitsDrivenDemo() {
  const [openFaq, setOpenFaq] = useState(null);
  const [roiInputs, setRoiInputs] = useState({
    currentLeads: 100,
    conversionRate: 2,
    avgDealValue: 5000
  });

  const benefits = [
    {
      icon: Target,
      title: "Expert Digital Marketing",
      description: "Proven strategies across SEO, social media, paid ads, and content to drive qualified traffic",
      stat: "Multi-channel",
      service: "Marketing"
    },
    {
      icon: Zap,
      title: "AI Automation",
      description: "Deploy intelligent systems that work 24/7, processing tasks in milliseconds instead of hours",
      stat: "10x faster",
      service: "AI"
    },
    {
      icon: TrendingUp,
      title: "Conversion Optimization",
      description: "Data-driven campaigns designed to turn visitors into customers and maximize ROI",
      stat: "300% ROI",
      service: "Marketing"
    },
    {
      icon: Users,
      title: "Predictive Analytics",
      description: "AI-powered insights that predict customer behavior and optimize your marketing spend",
      stat: "Smart insights",
      service: "AI"
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Real-time dashboards showing exactly what's working and what needs adjustment",
      stat: "Live data",
      service: "Marketing"
    },
    {
      icon: Sparkles,
      title: "Content at Scale",
      description: "AI generates high-quality marketing content that converts, from ads to blog posts",
      stat: "100+ pieces/day",
      service: "AI"
    },
    {
      icon: Shield,
      title: "Lead Generation",
      description: "Systematic approach to filling your pipeline with qualified prospects ready to buy",
      stat: "Qualified leads",
      service: "Marketing"
    },
    {
      icon: Clock,
      title: "Marketing Automation",
      description: "AI handles repetitive tasks, freeing your team to focus on strategy and relationships",
      stat: "20+ hrs saved",
      service: "AI"
    }
  ];

  const beforeAfter = {
    before: [
      "Spending 40+ hours/week on manual tasks",
      "Generic marketing that doesn't convert",
      "Difficulty tracking ROI and metrics",
      "Limited reach and inconsistent results"
    ],
    after: [
      "Automated workflows running 24/7",
      "Personalized campaigns for every segment",
      "Real-time dashboards showing clear ROI",
      "10x reach with predictable growth"
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-[#FFD700]/20 border border-[#FFD700] rounded-full text-gold-shine text-sm font-semibold mb-6">
              DIGITAL MARKETING × AI SOLUTIONS
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Marketing Strategies That Work.
              <br />
              <span className="text-gold-shine">AI That Scales Them.</span>
            </h1>
            <p className="text-xl text-[#EAEAEA] max-w-3xl mx-auto mb-8">
              We combine expert digital marketing with intelligent automation to deliver measurable, scalable results
            </p>
            <button className="bg-[#FFD700] hover:bg-[#E0B200] text-black px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105">
              Get Digital Marketing + AI
            </button>
          </motion.div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-red-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            The Problem with Traditional Marketing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You're burning time and money on marketing tactics that don't scale.
            Manual processes, guesswork strategies, and generic campaigns are holding you back.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Disruptors AI?
            </h2>
            <p className="text-xl text-gray-600">
              Real benefits that transform your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-shadow relative"
                >
                  <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full bg-[#FFD700] text-black">
                    {benefit.service}
                  </div>
                  <div className="w-12 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <div className="text-sm font-bold text-yellow-600 mb-2">
                    {benefit.stat}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How We Compare
            </h2>
            <p className="text-xl text-gray-600">
              See why leading companies choose Disruptors AI over traditional agencies
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              <thead className="bg-[#0E0E0E] text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Feature</th>
                  <th className="px-6 py-4 text-center bg-[#FFD700] text-black">
                    <div className="font-bold text-lg">Disruptors AI</div>
                    <div className="text-sm font-normal opacity-80">AI-Powered</div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="font-bold">Traditional Agency</div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="font-bold">In-House Team</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: '24/7 Automation', us: true, agency: false, inhouse: false },
                  { feature: 'AI Lead Scoring', us: true, agency: false, inhouse: false },
                  { feature: 'Real-Time Analytics', us: true, agency: true, inhouse: true },
                  { feature: 'Dedicated Support', us: true, agency: true, inhouse: false },
                  { feature: 'Custom Workflows', us: true, agency: false, inhouse: true },
                  { feature: 'Scalable Pricing', us: true, agency: false, inhouse: false },
                  { feature: 'Multi-Channel Integration', us: true, agency: true, inhouse: false },
                  { feature: 'Content Generation', us: true, agency: false, inhouse: false },
                ].map((row, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center bg-yellow-50">
                      {row.us ? <Check className="w-6 h-6 text-gold-shine mx-auto" /> : <X className="w-6 h-6 text-[#EAEAEA] mx-auto" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.agency ? <Check className="w-6 h-6 text-gold-shine mx-auto" /> : <X className="w-6 h-6 text-[#EAEAEA] mx-auto" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.inhouse ? <Check className="w-6 h-6 text-gold-shine mx-auto" /> : <X className="w-6 h-6 text-[#EAEAEA] mx-auto" />}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <button className="bg-[#FFD700] hover:bg-[#E0B200] text-black px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105">
              See Full Comparison
            </button>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Calculate Your ROI
            </h2>
            <p className="text-xl text-gray-600">
              See how much you could save with AI automation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calculator Inputs */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Current Metrics</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Leads
                  </label>
                  <input
                    type="number"
                    value={roiInputs.currentLeads}
                    onChange={(e) => setRoiInputs({...roiInputs, currentLeads: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FFD700] focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Conversion Rate (%)
                  </label>
                  <input
                    type="number"
                    value={roiInputs.conversionRate}
                    onChange={(e) => setRoiInputs({...roiInputs, conversionRate: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FFD700] focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Average Deal Value ($)
                  </label>
                  <input
                    type="number"
                    value={roiInputs.avgDealValue}
                    onChange={(e) => setRoiInputs({...roiInputs, avgDealValue: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FFD700] focus:outline-none text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* ROI Results */}
            <div className="bg-gradient-to-br from-[#FFD700] to-yellow-600 text-black rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">With Disruptors AI</h3>
              <div className="space-y-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm font-semibold mb-1">Additional Monthly Leads</div>
                  <div className="text-4xl font-bold">+{Math.round(roiInputs.currentLeads * 3)}</div>
                  <div className="text-sm opacity-80">300% increase</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm font-semibold mb-1">New Monthly Revenue</div>
                  <div className="text-4xl font-bold">
                    ${((roiInputs.currentLeads * 3) * (roiInputs.conversionRate / 100) * roiInputs.avgDealValue).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-80">From AI automation alone</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm font-semibold mb-1">Annual Revenue Impact</div>
                  <div className="text-4xl font-bold">
                    ${((roiInputs.currentLeads * 3) * (roiInputs.conversionRate / 100) * roiInputs.avgDealValue * 12).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-80">Projected 12-month value</div>
                </div>
              </div>
              <button className="w-full mt-6 bg-[#0E0E0E] hover:bg-[#0E0E0E] text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105">
                Get Your Custom ROI Report
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-24 bg-[#0E0E0E] text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-[#C7C7C7]">
              Watch how Disruptors AI transforms marketing operations in 90 seconds
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-gradient-to-br from-[#FFD700]/20 to-[#E0B200]/20"
          >
            <video
              className="w-full h-full object-cover"
              poster="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759268594/disruptors-ai/backgrounds/disruptors-ai/backgrounds/geometric-minimalist.jpg"
              controls
              src="/site-videos/dmsite/home/website-demo-reel.mp4"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#FFD700] rounded-full p-6 shadow-2xl">
                <Play className="w-12 h-12 text-black" />
              </div>
            </div>
          </motion.div>

          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gold-shine mb-2">90 sec</div>
              <div className="text-[#C7C7C7]">Quick overview</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gold-shine mb-2">Real</div>
              <div className="text-[#C7C7C7]">Actual client results</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gold-shine mb-2">Live</div>
              <div className="text-[#C7C7C7]">Platform walkthrough</div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get Results in 14 Days
            </h2>
            <p className="text-xl text-gray-600">
              Our proven implementation process gets you up and running fast
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FFD700] to-green-500"></div>

            {/* Timeline items */}
            {[
              {
                day: 'Day 1-3',
                title: 'Discovery & Strategy',
                description: 'We analyze your current marketing stack and identify quick wins',
                icon: Target
              },
              {
                day: 'Day 4-7',
                title: 'Setup & Integration',
                description: 'Connect your tools and configure AI automation workflows',
                icon: Zap
              },
              {
                day: 'Day 8-10',
                title: 'Training & Optimization',
                description: 'Train your team and fine-tune AI models for your business',
                icon: Users
              },
              {
                day: 'Day 11-14',
                title: 'Launch & Scale',
                description: 'Go live and start seeing 3x lead generation results',
                icon: TrendingUp
              }
            ].map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative flex items-center mb-16 last:mb-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${isEven ? 'md:pr-16' : 'md:pl-16'} ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-gray-50 rounded-2xl p-6 inline-block max-w-md">
                      <div className="text-yellow-600 font-bold text-sm mb-2">{step.day}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center shadow-xl z-10">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <div className="flex-1"></div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <button className="bg-[#FFD700] hover:bg-[#E0B200] text-black px-12 py-5 rounded-full text-xl font-bold transition-all hover:scale-105 shadow-xl">
              Start Your 14-Day Transformation
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Disruptors AI
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How quickly can I see results?',
                a: 'Most clients see a measurable increase in lead generation within the first 14 days. By 90 days, our average client experiences 3x growth in qualified leads.'
              },
              {
                q: 'Do I need technical expertise?',
                a: 'Not at all. Our team handles all technical setup and integration. We provide comprehensive training and ongoing support to ensure your team can leverage the platform effectively.'
              },
              {
                q: 'What if AI automation doesn\'t work for my industry?',
                a: 'We\'ve successfully deployed AI marketing systems across 50+ industries including construction, healthcare, finance, and more. Our AI adapts to your specific industry requirements and compliance needs.'
              },
              {
                q: 'How is this different from hiring a traditional agency?',
                a: 'Traditional agencies rely on manual processes and charge based on time. Our AI systems work 24/7, scale infinitely, and you only pay for results. Plus, you own all the data and workflows.'
              },
              {
                q: 'What kind of support do you provide?',
                a: 'Every client gets a dedicated AI strategist, 24/7 technical support, weekly optimization sessions, and access to our knowledge base with 500+ resources.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. We offer month-to-month contracts with no long-term commitments. If you\'re not seeing results, you can cancel with 30 days notice. We also offer a 90-day money-back guarantee.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-[#C7C7C7] flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6 text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-24 bg-[#0E0E0E] text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Before & After Disruptors AI
            </h2>
            <p className="text-xl text-[#C7C7C7]">
              See the transformation our clients experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-red-900/20 border-2 border-[#FFD700] rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 bg-[#FFD700] text-white rounded-full font-bold mb-4">
                  Before
                </div>
                <h3 className="text-2xl font-bold">The Old Way</h3>
              </div>
              <ul className="space-y-4">
                {beforeAfter.before.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gold-shine text-xl mt-1">✗</span>
                    <span className="text-[#EAEAEA]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="bg-green-900/20 border-2 border-[#FFD700] rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 bg-[#FFD700] text-white rounded-full font-bold mb-4">
                  After
                </div>
                <h3 className="text-2xl font-bold">The Disruptors Way</h3>
              </div>
              <ul className="space-y-4">
                {beforeAfter.after.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gold-shine text-xl mt-1">✓</span>
                    <span className="text-[#EAEAEA]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Results-Focused Testimonial */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <img
              src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png"
              alt="Client"
              className="h-16 mx-auto mb-6 opacity-60"
            />
          </div>
          <blockquote className="text-2xl sm:text-3xl font-medium text-gray-900 mb-6">
            "We went from spending 50 hours a week on marketing to just 10 hours,
            while <span className="text-yellow-600 font-bold">tripling our lead generation</span>.
            This isn't just automation—it's transformation."
          </blockquote>
          <div className="text-gray-600">
            <div className="font-bold text-lg">Sarah Johnson</div>
            <div>CEO, TradeWorx USA</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-[#FFD700] to-yellow-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-black/80 mb-8">
            Join 500+ companies already growing with Disruptors AI
          </p>
          <button className="bg-[#0E0E0E] hover:bg-[#0E0E0E] text-white px-12 py-5 rounded-full text-xl font-bold transition-all hover:scale-105 shadow-2xl">
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}
