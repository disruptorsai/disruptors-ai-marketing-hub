import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import DualCTABlock from '@/components/shared/DualCTABlock';
import { ArrowRight, CheckCircle, Code, Smartphone, Bot, Calculator, Plug, Database, Palette, Wrench, HelpCircle, ChevronDown, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const featureIcons = [Code, Smartphone, Bot, Calculator, Plug, Database, Palette, Wrench];

const service = {
  title: 'Custom Apps',
  h2: 'Turn Your Ideas Into Tools.',
  descriptivePhrase: 'Create Custom Software & Applications',
  overview: 'With AI, turning ideas into tools has never been faster-we can take a concept, workflow, or software idea and bring it to life quickly and effectively. From custom calculators to AI-powered content machines, and even fully functional games, we have already built tools that solve real problems. Whatever your business needs, we can create a custom app or system that makes your work easier, smarter, and more scalable.',
  heroVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/gallery-bg.mp4',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/ui/backgrounds/renaissance-fresco-pyramids.png',
  outcomes: [
    { title: 'Faster Development', description: 'Build custom solutions in weeks instead of months using AI-accelerated development workflows.' },
    { title: 'Tailored Solutions', description: 'Get exactly what your business needs-no forcing your workflow into off-the-shelf software.' },
    { title: 'Competitive Advantage', description: 'Gain unique tools and systems that differentiate you from competitors stuck with generic solutions.' }
  ],
  process: [
    { title: 'Discovery & Requirements', description: 'Deep dive into your business process, pain points, and desired outcomes to define the perfect solution.' },
    { title: 'Design & Prototyping', description: 'Create wireframes, user flows, and interactive prototypes to validate the concept before full development.' },
    { title: 'Development & Testing', description: 'Build your custom application with modern tech stack, rigorous testing, and quality assurance.' },
    { title: 'Launch & Support', description: 'Deploy your application, train your team, and provide ongoing maintenance and feature enhancements.' }
  ],
  features: [
    { title: 'Web Application Development', description: 'Full-stack web apps built with modern frameworks like React and Node.js. Fast, responsive, and built to handle real business workloads from day one.' },
    { title: 'Mobile App Development', description: 'iOS and Android apps — native or cross-platform — that give your customers a polished, professional experience right from their pocket.' },
    { title: 'AI-Powered Tools', description: 'Embed AI directly into your workflow. From intelligent content generators to automated analysis engines, we build tools that think so your team doesn\'t have to.' },
    { title: 'Custom Calculators & Tools', description: 'Interactive lead-gen tools — ROI calculators, quote builders, assessment tools — that capture prospects and demonstrate your value before a single call.' },
    { title: 'API Development & Integration', description: 'Connect your app to the platforms you already use. CRMs, payment processors, data feeds — we make everything talk to each other seamlessly.' },
    { title: 'Database Design & Management', description: 'Structured, scalable data architecture that keeps your app fast and reliable as your user base grows. No bottlenecks, no data chaos.' },
    { title: 'User Interface & Experience Design', description: 'Clean, intuitive interfaces that feel easy to use — because software your team actually enjoys using gets used, and software that doesn\'t gets ignored.' },
    { title: 'Maintenance & Updates', description: 'Your app grows with your business. We provide ongoing support, feature additions, and performance improvements long after launch day.' }
  ],
  faqs: [
    { question: 'How long does custom app development take?', answer: 'Simple applications take 4-8 weeks. More complex systems with integrations, AI features, and advanced functionality take 12-16 weeks. We provide detailed timelines during discovery and break projects into phases for faster time-to-value.' },
    { question: 'What technologies do you use?', answer: 'We build with modern, proven technology stacks including React, Node.js, Python, PostgreSQL, and cloud infrastructure like AWS or Google Cloud. Technology choices are driven by your specific needs, not our preferences. We recommend the best tools for your use case.' },
    { question: 'Can you integrate with our existing systems?', answer: 'Yes. We integrate with virtually any system via APIs, webhooks, or custom connectors. Common integrations include CRMs (HubSpot, Salesforce), payment processors (Stripe), email systems (SendGrid), and databases. We ensure seamless data flow between your new app and existing tools.' },
    { question: 'Do you provide hosting and maintenance?', answer: 'Yes. We offer managed hosting and ongoing maintenance packages that include server management, security updates, bug fixes, and feature enhancements. You own the code and can host anywhere, but many clients prefer our managed service for peace of mind.' },
    { question: 'What if my idea changes during development?', answer: 'We embrace iteration and flexibility. Projects are structured in phases with regular check-ins and demos. While major scope changes affect timeline and budget, minor adjustments and improvements are expected. We use agile methodology to adapt to evolving requirements.' },
    { question: 'How much does a custom app cost with AI vs. traditional development?', answer: 'Traditional software development typically runs $50,000–$250,000+ and takes 6–18 months — before you factor in ongoing developer salaries or agency retainers. That\'s the old way. With AI-accelerated development (what some call "vibe coding"), we can build the same quality tools in a fraction of the time at a fraction of the cost. Most of our custom apps come in well under what a single month of a traditional dev agency would charge — and they\'re ready in weeks, not quarters. The result is the same powerful, tailored software — just smarter, faster, and more affordable.' }
  ],
  testimonials: [
    { name: 'Mitchell Halvorsen', company: 'Google Review', quote: "I can't say enough good things about Disruptors Media. Their team is professional, creative, and truly understands how to capture attention in today's fast-paced digital world. They made the process smooth from start to finish." },
    { name: 'Chris', company: 'Google Review', quote: "Professional, well organized, and knowledgeable. If you're looking for a company that can drive revenue and expand your business success, this is the right place for you." },
    { name: 'Sarah M.', company: 'Business Owner', quote: "They built us a custom quoting tool that our sales team uses every single day. What would have taken months with a traditional developer was live in a few weeks. It's already paid for itself." }
  ]
};

export default function CustomApps() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="text-white">
      {/* Full-Screen Hero — Podcast Style */}
      <section className="relative h-screen overflow-hidden flex items-center bg-[#0E0E0E]">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            src={service.heroVideo}
            autoPlay
            loop
            muted
            playsInline
            poster={service.heroImage}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 20%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>

        {/* Hero Content — Left Aligned */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-4">
                <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">AI-Powered Development</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-white">
                {service.h2.replace('.', '')}
                <br />
                <span className="text-gold-shine">Custom Apps & Software.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-200 mb-8 leading-relaxed">
                From concept to launch, we build custom applications that solve real problems and give your business a competitive edge.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={createPageUrl('book-strategy-session')}
                  className="group relative inline-flex items-center justify-center h-16 px-10 text-lg font-bold text-black uppercase bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] hover:shadow-[0_0_25px_rgba(191,149,63,0.5)] transition-all duration-300"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                    boxShadow: '0 0 20px rgba(191, 149, 63, 0.4)'
                  }}
                >
                  <span>Book a Strategy Session</span>
                  <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <Button variant="outline" size="lg" className="border-white/60 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm h-16 px-8 text-lg">
                    See How It Works
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0d0d0d] to-black" />
        {/* Subtle gold glow behind heading */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-5">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">What We Do</span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {service.descriptivePhrase.split('&')[0]}
              <span className="text-gold-shine">& Applications</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              {service.overview}
            </p>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10"
          >
            {[
              { value: '4–8 Weeks', label: 'Average Delivery Time' },
              { value: '10×', label: 'Faster Than Traditional Dev' },
              { value: '100%', label: 'Custom to Your Business' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0d0d0d] px-8 py-8 text-center hover:bg-white/5 transition-colors">
                <div className="text-3xl sm:text-4xl font-bold text-gold-shine mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="relative bg-black py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Results</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Expected Outcomes</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {service.outcomes.map((outcome, i) => (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <CheckCircle className="w-8 h-8 icon-gold-shine mb-4" />
                <h3 className="font-bold text-xl mb-2 text-white group-hover:text-yellow-500 transition-colors">{outcome.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{outcome.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works / Process */}
      <section id="how-it-works" className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Our Process</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              This is our proven process to create powerful tools that fit your workflow, serve your customers, and scale with your business.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-all duration-300 h-full group">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black rounded-full flex items-center justify-center font-bold text-xl mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-white group-hover:text-yellow-500 transition-colors">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
                {index < service.process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 icon-gold-shine" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / What You Get */}
      <section className="relative bg-black py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Capabilities</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">What You Get</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Comprehensive solutions tailored to your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.features.map((feature, index) => {
              const Icon = featureIcons[index] || CheckCircle;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                    <Icon className="w-6 h-6 icon-gold-shine" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white group-hover:text-yellow-500 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">FAQ</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-400">
              Everything you need to know about Custom Apps
            </p>
          </motion.div>

          <div className="space-y-4">
            {service.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <HelpCircle className="w-6 h-6 icon-gold-shine flex-shrink-0 mt-1" />
                      <h3 className="font-bold text-lg text-white">{faq.question}</h3>
                    </div>
                    <ChevronDown
                      className={`w-6 h-6 icon-gold-shine flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pl-16">
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials — Carousel */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-[#080c18]">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Client Stories</span>
            </div>
          </div>

          {/* Card */}
          <div className="relative bg-white/5 border border-white/10 rounded-3xl px-8 py-12 sm:px-16 sm:py-16 text-center">
            {/* Decorative quote mark */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[120px] leading-none text-[#BF953F]/10 font-serif select-none pointer-events-none">"</div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="relative z-10"
              >
                <p className="text-lg sm:text-xl lg:text-2xl font-light leading-relaxed text-white mb-10">
                  "{service.testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-px bg-[#BF953F]/50 mb-4" />
                  <span className="font-bold text-white text-lg">{service.testimonials[activeTestimonial].name}</span>
                  {service.testimonials[activeTestimonial].company && (
                    <span className="text-sm text-[#BF953F]">{service.testimonials[activeTestimonial].company}</span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next arrows */}
            <button
              onClick={() => setActiveTestimonial((activeTestimonial - 1 + service.testimonials.length) % service.testimonials.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-[#BF953F]/60 hover:text-[#BF953F] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTestimonial((activeTestimonial + 1) % service.testimonials.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-[#BF953F]/60 hover:text-[#BF953F] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {service.testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeTestimonial ? 'w-8 h-2 bg-[#BF953F]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-gold-shine text-sm font-bold tracking-wider uppercase">Get Started</span>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Ready to Build Your Custom App?</h2>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Let's turn your idea into a powerful tool that drives real business results
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={createPageUrl('book-strategy-session')}
                className="group relative inline-flex items-center justify-center h-16 px-10 text-lg font-bold text-black uppercase bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] hover:shadow-[0_0_25px_rgba(191,149,63,0.5)] transition-all duration-300"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                  boxShadow: '0 0 20px rgba(191, 149, 63, 0.4)'
                }}
              >
                <span>Book a Strategy Session</span>
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to={createPageUrl('solutions')}>
                <Button variant="outline" size="lg" className="border-white/60 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm h-16 px-8 text-lg">
                  See Other Solutions
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
