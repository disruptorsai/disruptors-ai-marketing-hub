import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Zap, TrendingUp, Users, Sparkles, Target, BarChart3, Clock, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function InteractiveDemo() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    // Story reveal animations
    const storyCards = gsap.utils.toArray('.story-card');
    storyCards.forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        },
        x: index % 2 === 0 ? -100 : 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Video parallax
    gsap.utils.toArray('.chapter-video').forEach((video) => {
      gsap.to(video, {
        scrollTrigger: {
          trigger: video,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: -50,
        ease: 'none'
      });
    });

    // Stats counter animation
    gsap.utils.toArray('.stat-number').forEach((stat) => {
      gsap.from(stat, {
        scrollTrigger: {
          trigger: stat,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        textContent: 0,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const chapters = [
    {
      number: 1,
      title: "The Daily Grind",
      subtitle: "CHAPTER 1: THE STRUGGLE",
      description: "You're working 60-hour weeks. Every morning brings the same chaos: manually posting to social media, responding to leads, creating content from scratch. You're doing everything yourself because you can't afford not to. But you're burning out, and growth has plateaued.",
      video: "https://videos.pexels.com/video-files/7640409/7640409-hd_1920_1080_30fps.mp4",
      gradient: "from-red-900/40 to-transparent",
      border: "border-[#FFD700]",
      align: "left",
      stats: [
        { value: "60+", label: "Hours/Week" },
        { value: "100+", label: "Manual Tasks" },
        { value: "0%", label: "Time for Strategy" }
      ]
    },
    {
      number: 2,
      title: "The Breaking Point",
      subtitle: "CHAPTER 2: THE REALIZATION",
      description: "Your competitors are pulling ahead. They're posting consistently, responding instantly, and their leads are better qualified. You know there's a better way, but you're trapped in the day-to-day operations. Something has to change, or you'll lose your competitive edge forever.",
      video: "https://videos.pexels.com/video-files/7709198/7709198-hd_1920_1080_25fps.mp4",
      gradient: "from-orange-900/40 to-transparent",
      border: "border-orange-500",
      align: "right"
    },
    {
      number: 3,
      title: "The Discovery",
      subtitle: "CHAPTER 3: THE BREAKTHROUGH",
      description: "Then you discover Disruptors AI. Not just another marketing agency, but a complete system that combines proven digital marketing strategies with intelligent automation. Imagine: AI handling your content creation, automated lead qualification, campaigns that optimize themselves. This isn't fantasy—it's what our clients experience every day.",
      video: "https://videos.pexels.com/video-files/3196409/3196409-hd_1920_1080_25fps.mp4",
      gradient: "from-blue-900/40 to-transparent",
      border: "border-blue-500",
      align: "left"
    },
    {
      number: 4,
      title: "The Two-Pillar System",
      subtitle: "CHAPTER 4: THE SOLUTION",
      description: "Here's how it works: First, we deploy expert digital marketing—SEO, paid ads, social media, content strategy—all the proven channels that drive real results. Then, we layer AI automation on top: intelligent lead scoring, automated content generation, predictive analytics, 24/7 optimization. Marketing expertise meets AI power.",
      video: "https://videos.pexels.com/video-files/7947456/7947456-hd_1920_1080_25fps.mp4",
      gradient: "from-purple-900/40 to-transparent",
      border: "border-purple-500",
      align: "right",
      features: [
        { icon: Target, title: "Digital Marketing", desc: "SEO, Paid Ads, Social Media, Content Strategy" },
        { icon: Zap, title: "AI Automation", desc: "Lead Scoring, Content Generation, Predictive Analytics" },
        { icon: TrendingUp, title: "Growth Strategy", desc: "Data-Driven Optimization & Scaling" },
        { icon: Users, title: "Lead Generation", desc: "Qualified Prospects, Automated Nurturing" }
      ]
    },
    {
      number: 5,
      title: "The Transformation",
      subtitle: "CHAPTER 5: THE IMPLEMENTATION",
      description: "Within 14 days, your entire marketing operation transforms. AI takes over the repetitive tasks. Your content calendar fills itself. Leads are qualified before they reach your inbox. You're finally working ON your business instead of IN it. The best part? It gets smarter every day, learning from your data to deliver better results.",
      video: "https://videos.pexels.com/video-files/7534552/7534552-hd_1920_1080_24fps.mp4",
      gradient: "from-green-900/40 to-transparent",
      border: "border-green-500",
      align: "left",
      timeline: [
        { day: "Day 1-3", task: "System Setup & Integration" },
        { day: "Day 4-7", task: "AI Training & Content Strategy" },
        { day: "Day 8-14", task: "Launch & Optimization" },
        { day: "Day 15+", task: "Autonomous Growth" }
      ]
    },
    {
      number: 6,
      title: "The Results",
      subtitle: "CHAPTER 6: THE PROOF",
      description: "Three months in, the results speak for themselves. Your lead volume has tripled, but they're higher quality. Your team has 20+ hours back each week. Revenue is up 300%, and you're scaling without adding overhead. This isn't luck—it's the predictable outcome when marketing expertise meets AI automation.",
      video: "https://videos.pexels.com/video-files/7580769/7580769-hd_1920_1080_30fps.mp4",
      gradient: "from-emerald-900/40 to-transparent",
      border: "border-emerald-500",
      align: "right",
      stats: [
        { value: "300%", label: "Revenue Growth" },
        { value: "500+", label: "Qualified Leads" },
        { value: "20+", label: "Hours Saved/Week" }
      ]
    },
    {
      number: 7,
      title: "The Future",
      subtitle: "CHAPTER 7: YOUR NEW REALITY",
      description: "This is your life now. You wake up to qualified leads in your inbox. Your marketing runs itself, getting smarter every day. Your team focuses on strategy and relationships while AI handles execution. You're not just competing—you're dominating your market. And this is just the beginning.",
      video: "https://videos.pexels.com/video-files/7640410/7640410-hd_1920_1080_30fps.mp4",
      gradient: "from-[#FFD700]/40 to-transparent",
      border: "border-[#FFD700]",
      align: "left"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white overflow-x-hidden" ref={containerRef}>
      {/* Hero with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
            src="/site-videos/dmsite/home/handshake-landscape.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
        </div>

        <motion.div
          className="relative z-10 text-center px-4"
          style={{ opacity }}
        >
          <motion.img
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png"
            alt="Disruptors AI"
            className="h-32 mx-auto mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.h1
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Your Marketing Journey
            <br />
            <span className="text-gold-shine">From Chaos to Success</span>
          </motion.h1>
          <motion.p
            className="text-xl sm:text-2xl text-[#EAEAEA] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Scroll to discover how Digital Marketing + AI transforms struggling businesses into market leaders
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-[#FFD700] rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-[#FFD700] rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Story Chapters */}
      {chapters.map((chapter, index) => (
        <section key={chapter.number} className={`py-24 relative bg-gradient-to-b ${chapter.gradient}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className={`grid lg:grid-cols-2 gap-12 items-center ${chapter.align === 'right' ? 'lg:flex-row-reverse' : ''}`}>

              {/* Video Column */}
              <div className={`${chapter.align === 'right' ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="story-card relative rounded-3xl overflow-hidden aspect-video">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="chapter-video w-full h-full object-cover"
                    src={chapter.video}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-gold-shine text-sm font-bold mb-2">{chapter.subtitle}</div>
                    <div className="text-2xl font-bold">Chapter {chapter.number}</div>
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div className={`story-card ${chapter.align === 'right' ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className={`bg-gradient-to-r ${chapter.gradient} border-l-4 ${chapter.border} p-8 sm:p-12 rounded-2xl`}>
                  <div className="text-gold-shine text-xs font-bold tracking-wider mb-4">{chapter.subtitle}</div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                    {chapter.title}
                  </h2>
                  <p className="text-lg sm:text-xl text-[#EAEAEA] leading-relaxed mb-8">
                    {chapter.description}
                  </p>

                  {/* Stats Grid */}
                  {chapter.stats && (
                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
                      {chapter.stats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="stat-number text-3xl sm:text-4xl font-bold text-gold-shine mb-1">
                            {stat.value}
                          </div>
                          <div className="text-sm text-[#C7C7C7]">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Features Grid */}
                  {chapter.features && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-8">
                      {chapter.features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 bg-black/30 p-4 rounded-xl">
                            <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-black" />
                            </div>
                            <div>
                              <div className="font-bold mb-1">{feature.title}</div>
                              <div className="text-sm text-[#C7C7C7]">{feature.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Timeline */}
                  {chapter.timeline && (
                    <div className="space-y-3 mt-8">
                      {chapter.timeline.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 bg-black/30 p-4 rounded-xl">
                          <div className="w-16 h-16 bg-[#FFD700] rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="text-black font-bold text-sm text-center leading-tight">
                              {item.day}
                            </div>
                          </div>
                          <div className="font-semibold">{item.task}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* Final CTA with Animation */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl sm:text-6xl font-bold mb-8">
              Ready to Start
              <br />
              <span className="text-gold-shine">Your Success Story?</span>
            </h2>
            <p className="text-xl text-[#C7C7C7] mb-12 max-w-2xl mx-auto">
              Join 500+ companies who've transformed their marketing with the power of Digital Marketing + AI
            </p>
            <motion.button
              className="bg-[#FFD700] hover:bg-[#E0B200] text-black px-16 py-6 rounded-full text-2xl font-bold shadow-2xl inline-flex items-center gap-3"
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255, 215, 0, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Begin Your Transformation
              <ArrowRight className="w-6 h-6" />
            </motion.button>
            <p className="text-[#C7C7C7] mt-8 text-sm">
              No credit card required • 14-day implementation • Results guaranteed
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
