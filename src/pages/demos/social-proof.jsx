import React from 'react';
import { motion } from 'framer-motion';
import ClientLogoMarquee from '../../components/shared/ClientLogoMarquee';
import ReviewsCarousel from '../../components/shared/ReviewsCarousel';
import { Star, Award, Shield, CheckCircle2 } from 'lucide-react';

export default function SocialProofDemo() {
  const caseStudies = [
    {
      company: "TradeWorx USA",
      industry: "Manufacturing",
      result: "300% increase in qualified leads",
      metric1: { label: "Lead Growth", value: "300%" },
      metric2: { label: "Time Saved", value: "35 hrs/wk" },
      metric3: { label: "ROI", value: "450%" },
      quote: "Disruptors AI transformed our entire marketing operation. We're generating more leads than ever with half the effort.",
      author: "John Smith, CEO",
      image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop&q=80"
    },
    {
      company: "The Wellness Way",
      industry: "Healthcare",
      result: "500+ new patients in 6 months",
      metric1: { label: "New Patients", value: "500+" },
      metric2: { label: "Cost Reduction", value: "60%" },
      metric3: { label: "Conversion Rate", value: "8.2%" },
      quote: "The AI automation has allowed us to focus on patient care while our marketing runs itself.",
      author: "Dr. Sarah Williams",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&q=80"
    },
    {
      company: "SegPro Solutions",
      industry: "Industrial Safety",
      result: "$2M in new contracts secured",
      metric1: { label: "Revenue", value: "$2M+" },
      metric2: { label: "Lead Quality", value: "92%" },
      metric3: { label: "Close Rate", value: "45%" },
      quote: "We've never had this level of consistency in our pipeline. The AI knows our ideal customer better than we do.",
      author: "Mike Johnson, Owner",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&q=80"
    }
  ];

  const trustBadges = [
    { icon: Shield, label: "SOC 2 Certified", desc: "Enterprise Security" },
    { icon: Award, label: "Inc. 5000", desc: "Fastest Growing" },
    { icon: Star, label: "4.9/5 Rating", desc: "500+ Reviews" },
    { icon: CheckCircle2, label: "99.9% Uptime", desc: "Always Available" }
  ];

  const testimonials = [
    {
      text: "Working with Disruptors AI completely transformed our lead generation. We went from chasing cold leads to having qualified prospects reach out to us daily. The AI automation handles everything while we focus on closing deals.",
      author: "John Smith",
      company: "TradeWorx USA",
      rating: 5
    },
    {
      text: "Before Disruptors AI, we were spending 35+ hours a week on marketing tasks. Now it runs itself. We've added 500+ new patients in 6 months and our cost per acquisition dropped by 60%. This is the future of healthcare marketing.",
      author: "Dr. Sarah Williams",
      company: "The Wellness Way",
      rating: 5
    },
    {
      text: "We secured $2M in new contracts in the first 6 months. The AI knows our ideal customer better than we do - 92% of our leads are now qualified, and our close rate jumped to 45%. Best investment we've ever made.",
      author: "Mike Johnson",
      company: "SegPro Solutions",
      rating: 5
    },
    {
      text: "The level of personalization in our campaigns is incredible. Every piece of content speaks directly to our customers' pain points. Our engagement rates tripled and revenue is up 250%. This isn't just marketing - it's a growth engine.",
      author: "Jennifer Martinez",
      company: "Granite Paving",
      rating: 5
    },
    {
      text: "I was skeptical about AI marketing, but the results speak for themselves. Our pipeline is consistently full of qualified leads, our conversion rates doubled, and we're scaling faster than ever. The ROI is undeniable.",
      author: "David Chen",
      company: "Auto Trim Utah",
      rating: 5
    },
    {
      text: "What impressed me most is how the Disruptors team understands our industry. They built a system that captures our unique voice while automating all the tedious work. We're seeing 10x the results with half the effort.",
      author: "Lisa Thompson",
      company: "Sound Corrections",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Logo Trust Bar */}
      <section className="bg-gradient-to-br from-gray-900 to-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-[#FFD700]/20 border border-[#FFD700] rounded-full text-[#FFD700] text-sm font-semibold mb-6">
              DIGITAL MARKETING × AI SOLUTIONS
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Proven Results from
              <br />
              <span className="text-[#FFD700]">Marketing + AI</span>
            </h1>
            <p className="text-xl text-[#EAEAEA] max-w-3xl mx-auto mb-12">
              See how we combine digital marketing expertise with AI automation to transform businesses like yours
            </p>
          </motion.div>
        </div>
      </section>

      {/* Client Logo Marquee */}
      <section className="bg-[#0E0E0E] py-12 overflow-hidden">
        <div className="mb-8 text-center">
          <p className="text-[#C7C7C7] text-sm font-semibold tracking-wide uppercase">
            Trusted by Industry Leaders
          </p>
        </div>
        <ClientLogoMarquee />
      </section>

      {/* Reviews Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#FFD700] mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
            <p className="text-gray-600">4.9/5 average rating from 500+ reviews</p>
          </div>
          <ReviewsCarousel />
        </div>
      </section>

      {/* Case Study Highlights */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Real Results. Real Companies.
            </h2>
            <p className="text-xl text-gray-600">
              Success stories from businesses just like yours
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-[#0E0E0E] rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-12">
                    <div className="text-[#FFD700] text-sm font-bold mb-2">
                      {study.industry.toUpperCase()}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {study.company}
                    </h3>
                    <div className="text-2xl font-bold text-[#FFD700] mb-6">
                      {study.result}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          {study.metric1.value}
                        </div>
                        <div className="text-sm text-[#C7C7C7]">
                          {study.metric1.label}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          {study.metric2.value}
                        </div>
                        <div className="text-sm text-[#C7C7C7]">
                          {study.metric2.label}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          {study.metric3.value}
                        </div>
                        <div className="text-sm text-[#C7C7C7]">
                          {study.metric3.label}
                        </div>
                      </div>
                    </div>

                    <blockquote className="text-lg text-[#EAEAEA] italic mb-4 border-l-4 border-[#FFD700] pl-4">
                      "{study.quote}"
                    </blockquote>
                    <div className="text-[#C7C7C7]">
                      — {study.author}
                    </div>
                  </div>

                  <div className="relative h-64 md:h-auto">
                    <img
                      src={study.image}
                      alt={study.company}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              500+ Five-Star Reviews
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#FFD700] fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <div className="font-bold text-xl text-gray-900 mb-1">
                    {badge.label}
                  </div>
                  <div className="text-gray-600">
                    {badge.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Join 500+ Successful Companies
          </h2>
          <p className="text-xl text-[#EAEAEA] mb-8">
            See why industry leaders choose Disruptors AI
          </p>
          <button className="bg-[#FFD700] hover:bg-[#E0B200] text-black px-12 py-5 rounded-full text-xl font-bold transition-all hover:scale-105 shadow-2xl">
            Get Digital Marketing + AI Solutions
          </button>
          <p className="text-[#C7C7C7] mt-6 text-sm">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
