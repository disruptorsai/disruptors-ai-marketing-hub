import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ClientLogoMarquee from '../../components/shared/ClientLogoMarquee';
import ReviewsCarousel from '../../components/shared/ReviewsCarousel';
import {
  ArrowRight, Play, CheckCircle2, Star, Zap, Target,
  TrendingUp, Shield, Clock, Users, Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BestOfAllDemo() {
  const [timeLeft, setTimeLeft] = useState(3600);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const benefits = [
    {
      icon: Zap,
      title: "AI Automation",
      description: "Systems that work 24/7 while you focus on growth",
      stat: "10x faster",
      color: "bg-[#FFD700]"
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Reach your ideal customers with AI-powered segmentation",
      stat: "85% accuracy",
      color: "bg-[#FFD700]"
    },
    {
      icon: TrendingUp,
      title: "Predictable Growth",
      description: "Scale operations without scaling your team",
      stat: "300% ROI",
      color: "bg-[#FFD700]"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance",
      stat: "99.99% uptime",
      color: "bg-[#FFD700]"
    }
  ];

  const caseStudies = [
    {
      company: "TradeWorx USA",
      result: "300% lead increase",
      quote: "Disruptors AI transformed our entire marketing operation.",
      metric: "300%"
    },
    {
      company: "The Wellness Way",
      result: "500+ new patients",
      quote: "Focus on patient care while marketing runs itself.",
      metric: "500+"
    },
    {
      company: "SegPro Solutions",
      result: "$2M in contracts",
      quote: "Never had this level of consistency in our pipeline.",
      metric: "$2M+"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Parallax animations
    gsap.utils.toArray('.parallax-section').forEach((section) => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Interactive cards
    gsap.utils.toArray('.interactive-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'back.out(1.7)'
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white" ref={containerRef}>
      {/* Urgency Bar (from Conversion) */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="font-bold">Exclusive Offer Expires: {formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>23 spots left</span>
          </div>
        </div>
      </div>

      {/* Hero Section (from Hero-First) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0E0E0E] text-white">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
            src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758645813/Website_Demo_Reel_edited_udorcp.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
        </div>

        <motion.div
          className="relative z-10 text-center px-4 max-w-6xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          <motion.img
            src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png"
            alt="Disruptors AI"
            className="h-28 sm:h-36 mx-auto mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          />

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform Your Business with
            <br />
            <span className="text-[#FFD700]">AI-Powered Marketing</span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-[#EAEAEA] mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join 500+ companies generating predictable, scalable growth with intelligent automation
          </motion.p>

          {/* Dual CTA */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button className="group bg-[#FFD700] hover:bg-[#E0B200] text-black px-12 py-5 rounded-full text-xl font-bold transition-all hover:scale-105 shadow-2xl hover:shadow-[#FFD700]/50 flex items-center gap-3">
              Start Your Transformation
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="flex items-center gap-2 text-[#EAEAEA] hover:text-white transition-colors">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {[
              { value: "500+", label: "Clients" },
              { value: "300%", label: "Avg Growth" },
              { value: "$50M+", label: "Revenue" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-[#FFD700] mb-2">{stat.value}</div>
                <div className="text-[#C7C7C7]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-[#FFD700] rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-[#FFD700] rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Client Logos (from Social Proof) */}
      <section className="bg-[#0E0E0E] py-12 overflow-hidden">
        <div className="mb-6 text-center">
          <p className="text-[#C7C7C7] text-sm font-semibold tracking-wide uppercase">
            Trusted by Industry Leaders
          </p>
        </div>
        <ClientLogoMarquee />
      </section>

      {/* Problem/Solution (from Benefits-Driven) */}
      <section className="parallax-section py-24 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Stop Wasting Time on Manual Marketing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You're burning hours on repetitive tasks while your competitors use AI to dominate.
              It's time for a change.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white border-4 border-[#2A2A2A] rounded-3xl p-8">
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-2 bg-[#FFD700] text-white rounded-full font-bold mb-4">
                  The Old Way
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  "40+ hours/week on manual tasks",
                  "Generic campaigns that don't convert",
                  "No clear ROI tracking",
                  "Inconsistent results"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#FFD700] text-2xl">✗</span>
                    <span className="text-gray-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="bg-gradient-to-br from-[#FFD700] to-[#E0B200] text-white rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-2 bg-white text-[#FFD700] rounded-full font-bold mb-4">
                  The Disruptors Way
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  "Automated workflows running 24/7",
                  "Personalized campaigns at scale",
                  "Real-time ROI dashboards",
                  "Predictable, consistent growth"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid (from Benefits-Driven) */}
      <section className="parallax-section py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Disruptors AI?
            </h2>
            <p className="text-xl text-gray-600">
              Real benefits that transform your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="interactive-card group bg-gray-50 rounded-2xl p-6 hover:shadow-2xl transition-all cursor-pointer"
                >
                  <div className={`w-14 h-14 ${benefit.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm font-bold text-yellow-600 mb-2">
                    {benefit.stat}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Case Studies (from Interactive + Social Proof) */}
      <section className="parallax-section py-24 bg-[#0E0E0E] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Real Results from Real Companies
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#FFD700] mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
            <p className="text-xl text-[#C7C7C7]">
              4.9/5 rating from 500+ reviews
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {caseStudies.map((study, i) => (
              <motion.div
                key={i}
                className="interactive-card bg-[#1A1A1A] rounded-2xl p-8 hover:bg-gray-750 transition-all"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="text-5xl font-bold text-[#FFD700] mb-4">
                  {study.metric}
                </div>
                <h3 className="text-2xl font-bold mb-2">{study.company}</h3>
                <div className="text-lg text-[#FFD700] mb-4">{study.result}</div>
                <p className="text-[#C7C7C7] italic">"{study.quote}"</p>
              </motion.div>
            ))}
          </div>

          {/* Reviews Carousel */}
          <ReviewsCarousel />
        </div>
      </section>

      {/* Value Stack (from Conversion) */}
      <section className="parallax-section py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Dominate
            </h2>
            <p className="text-xl text-gray-600">
              Complete AI marketing system delivered in 14 days
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "AI Lead Gen System",
                value: "$15,000",
                features: ["24/7 automated targeting", "Smart lead scoring", "CRM integration"]
              },
              {
                title: "Done-For-You Setup",
                value: "$5,000",
                features: ["White-glove onboarding", "Custom workflows", "Team training"]
              },
              {
                title: "Ongoing Optimization",
                value: "$3,000/mo",
                features: ["Weekly reviews", "A/B testing", "Performance tracking"]
              }
            ].map((item, i) => (
              <div key={i} className="interactive-card bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                <div className="text-yellow-600 font-bold mb-2">{item.value} value</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <ul className="space-y-3">
                  {item.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-[#FFD700] to-orange-500 text-black px-12 py-6 rounded-2xl shadow-2xl">
              <div className="text-sm font-semibold mb-2">Total Value: $23,000+</div>
              <div className="text-4xl font-bold">Your Investment: $4,997</div>
              <div className="text-sm mt-2 opacity-90">90-Day Money-Back Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-2xl text-[#EAEAEA] mb-12">
              Join 500+ companies already dominating their markets with AI
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <button className="bg-[#FFD700] hover:bg-[#E0B200] text-black px-16 py-6 rounded-full text-2xl font-bold transition-all hover:scale-105 shadow-2xl">
                Start Your Free Strategy Session
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 text-[#C7C7C7] text-sm">
              <span>💳 No credit card required</span>
              <span>•</span>
              <span>🔒 100% secure</span>
              <span>•</span>
              <span>⏰ {formatTime(timeLeft)} left</span>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex items-center justify-center gap-12">
              <div className="text-center">
                <Shield className="w-12 h-12 text-[#FFD700] mx-auto mb-2" />
                <div className="text-sm">Money-Back Guarantee</div>
              </div>
              <div className="text-center">
                <Star className="w-12 h-12 text-[#FFD700] mx-auto mb-2" />
                <div className="text-sm">4.9/5 Rating</div>
              </div>
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-[#FFD700] mx-auto mb-2" />
                <div className="text-sm">AI-Powered</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
