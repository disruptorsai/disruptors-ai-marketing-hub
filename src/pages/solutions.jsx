
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ServicesScrollingRows from '../components/shared/ServicesScrollingRows';
import DualCTABlock from '../components/shared/DualCTABlock';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageTitle from '../components/shared/PageTitle';
import FastVideo from '@/components/shared/FastVideo';
import { optimizeCloudinaryImage, optimizeCloudinaryVideo, getVideoThumbnail } from '@/utils/cloudinary-optimizer';
import { Cpu, Share2, Search, Filter, DollarSign, Mic, AppWindow, Users, Briefcase, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { title: "AI Automation", hook: "Automate repetitive tasks and workflows", link: "solutions-ai-automation", icon: "Cpu" },
  { title: "Social Media Marketing", hook: "Build and engage your community", link: "solutions-social-media", icon: "Share2" },
  { title: "SEO & GEO", hook: "Get found by your ideal customers", link: "solutions-seo-geo", icon: "Search" },
  { title: "Lead Generation", hook: "Fill your pipeline with qualified prospects", link: "solutions-lead-generation", icon: "Filter" },
  { title: "Paid Advertising", hook: "Maximize ROI across all channels", link: "solutions-paid-advertising", icon: "DollarSign" },
  { title: "Podcasting", hook: "Build authority through audio content", link: "solutions-podcasting", icon: "Mic" },
  { title: "Custom Apps", hook: "Tailored solutions for your needs", link: "solutions-custom-apps", icon: "AppWindow" },
  { title: "CRM Management", hook: "Organize and nurture your relationships", link: "solutions-crm-management", icon: "Users" },
  { title: "Fractional CMO", hook: "Strategic marketing leadership", link: "solutions-fractional-cmo", icon: "Briefcase" }
];

const iconMap = { Cpu, Share2, Search, Filter, DollarSign, Mic, AppWindow, Users, Briefcase };

const ServiceCard = ({ service, index }) => {
    const Icon = iconMap[service.icon];
    const gradients = [
        'from-blue-500/10 to-indigo-500/10',
        'from-purple-500/10 to-pink-500/10',
        'from-teal-500/10 to-cyan-500/10',
        'from-orange-500/10 to-red-500/10',
        'from-green-500/10 to-emerald-500/10',
        'from-violet-500/10 to-purple-500/10',
        'from-rose-500/10 to-pink-500/10',
        'from-sky-500/10 to-blue-500/10',
        'from-amber-500/10 to-yellow-500/10'
    ];
    const gradient = gradients[index % gradients.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            viewport={{ once: true }}
        >
            <Link to={createPageUrl(service.link)} className="block group h-full">
                <div className={`relative bg-gradient-to-br ${gradient} backdrop-blur-md rounded-3xl p-8 h-full border-2 border-white/40 hover:border-blue-500/60 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden group-hover:-translate-y-2`}>
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>

                    {/* Decorative corner element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500"></div>

                    <div className="relative z-10">
                        {/* Icon container with animated background */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 w-fit">
                                {Icon && <Icon className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">{service.title}</h3>
                        <p className="text-gray-700 text-lg mb-6 flex-grow leading-relaxed">{service.hook}</p>

                        {/* Enhanced CTA */}
                        <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-bold group-hover:text-blue-700 transition-colors duration-300">
                                Learn More
                            </span>
                            <div className="bg-blue-600 group-hover:bg-blue-700 text-white rounded-full p-2 transition-all duration-300 group-hover:scale-110">
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default function Solutions() {
  const handRef = useRef(null);
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Hide hand on screens smaller than 768px (tablet/mobile)
    };

    // Check on mount
    checkMobile();

    // Check on window resize
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // GSAP animation - only runs on desktop
  useEffect(() => {
    if (isMobile || !handRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Set fixed position at the pivot point (35% down, slightly right of center)
      // Moved towards center for better visibility
      gsap.set(handRef.current, {
        top: "35%",
        right: "-5%", // Brought closer to center (was -15%)
        transformOrigin: "100% 50%" // Pivot from right edge, middle of hand
      });

      // Rotate around the fixed pivot point - faster rotation
      gsap.to(handRef.current, {
        rotation: -40, // Rotate counter-clockwise by 40 degrees
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom", // Start when section enters viewport
          end: "bottom top", // End when section leaves viewport
          scrub: 0.5
        },
        ease: "none"
      });
    });

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <div>
      {/* Page Title */}
      <PageTitle title="Full Funnel Approach" />

      {/* Hero Image */}
      <section ref={sectionRef} className="w-full relative">
        {/* Desktop image */}
        <img
          src={optimizeCloudinaryImage(
            "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759862401/Our_approach_is_simple_yet_impactful._We_combine_strategic_thinking_with_creative_flair_to_enhance_your_digital_presence_and_drive_real_results._Whether_expanding_your_audience_or_boosting_your_on_bal2jf.png",
            {
              width: 1920,
              quality: 'auto:good',
              crop: 'scale'
            }
          )}
          srcSet={`
            ${optimizeCloudinaryImage("https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759862401/Our_approach_is_simple_yet_impactful._We_combine_strategic_thinking_with_creative_flair_to_enhance_your_digital_presence_and_drive_real_results._Whether_expanding_your_audience_or_boosting_your_on_bal2jf.png", { width: 1024 })} 1024w,
            ${optimizeCloudinaryImage("https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759862401/Our_approach_is_simple_yet_impactful._We_combine_strategic_thinking_with_creative_flair_to_enhance_your_digital_presence_and_drive_real_results._Whether_expanding_your_audience_or_boosting_your_on_bal2jf.png", { width: 1920 })} 1920w
          `}
          sizes="100vw"
          alt="Our approach is simple yet impactful"
          className="hidden md:block w-full h-auto"
          loading="eager"
          fetchpriority="high"
        />
        {/* Mobile: different image + text below */}
        <div className="md:hidden">
          <img
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/new%20images/funnel-approach-disruptors%20(1).webp"
            alt="Our full funnel approach"
            className="w-full h-auto"
            loading="eager"
          />
          <p className="px-6 py-8 text-white text-center text-base leading-relaxed font-medium bg-black">
            Our approach is simple yet impactful. We combine strategic thinking with creative flair to enhance your digital presence and drive real results. Whether expanding your audience or boosting your online profile, our process is designed to take your brand from ordinary to extraordinary, efficiently and effectively.
          </p>
        </div>
        {/* Scroll-Animated Hand - Hidden on mobile devices */}
        {!isMobile && (
          <img
            ref={handRef}
            src={optimizeCloudinaryImage(
              "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697014/disruptors-media/services/graphics/hand-srv.png",
              {
                width: 1200,
                quality: 'auto:good'
              }
            )}
            alt="Pointing hand"
            className="absolute"
            style={{
              width: '35vw', // Viewport-based sizing for responsive scaling
              height: 'auto', // Maintain aspect ratio
              maxWidth: '48rem', // Cap max size at original lg breakpoint
              minWidth: '24rem' // Prevent getting too small
            }}
            loading="lazy"
          />
        )}
      </section>

      {/* Golden Divider Line */}
      <div className="w-full flex justify-center py-0">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>

      {/* Services Horizontal Scrolling Carousel */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FastVideo
            src={optimizeCloudinaryVideo(
              "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759258610/gallery-bg_lrxadn.mp4",
              { width: 1920, quality: 'auto' }
            )}
            poster={getVideoThumbnail(
              "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759258610/gallery-bg_lrxadn.mp4",
              { width: 1920 }
            )}
            autoplay
            loop
            muted
            playsInline
            preload="metadata"
            lazy={true}
            preset="fullscreen"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/50"></div>
        <div className="relative z-10">
          <ServicesScrollingRows title="Choose Your Path to Growth" />
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-8 sm:py-12 bg-[#cac1b8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Introduction */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-24"
            >
              <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                WHAT WE DO
              </h2>
              <p className="text-xl text-gray-800 leading-relaxed font-mono mb-8">
                Call us traditional, but we believe in the old-fashioned way of connection. And no, we don't mean Myspace. You can have a killer product or service, but that's not what sets you apart. It's how people feel after each interaction.
              </p>
              <a
                href="https://audit.disruptorsmedia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black text-base font-bold uppercase transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Start Your Assessment</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>

            {/* Right Column - Accordion */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="item-1" className="border-b-2 border-gray-900">
                  <AccordionTrigger className="text-left hover:no-underline group py-6">
                    <div className="flex flex-col items-start w-full pr-4">
                      <span className="text-sm font-mono text-gray-600 mb-2">01</span>
                      <h3 className="text-3xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                        CREATIVE & STRATEGY
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-lg text-gray-800 leading-relaxed pb-6 font-mono">
                    We craft personalized, AI-driven strategies that bridge the gap between your goals and tangible results. We also captivate audiences with compelling content and design, fueled by the power of AI-assisted creativity.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-b-2 border-gray-900">
                  <AccordionTrigger className="text-left hover:no-underline group py-6">
                    <div className="flex flex-col items-start w-full pr-4">
                      <span className="text-sm font-mono text-gray-600 mb-2">02</span>
                      <h3 className="text-3xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                        DIGITAL MARKETING & PRESENCE
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-lg text-gray-800 leading-relaxed pb-6 font-mono">
                    Elevate your digital presence with our comprehensive strategies. We ensure your brand stands out, driving traffic and enhancing visibility. <Link to="/contact" className="text-yellow-600 underline hover:text-yellow-700">Contact us</Link> to disrupt your industry.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-b-2 border-gray-900">
                  <AccordionTrigger className="text-left hover:no-underline group py-6">
                    <div className="flex flex-col items-start w-full pr-4">
                      <span className="text-sm font-mono text-gray-600 mb-2">03</span>
                      <h3 className="text-3xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                        OPTIMIZATION & ANALYTICS
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-lg text-gray-800 leading-relaxed pb-6 font-mono">
                    Refine your strategy with our AI-powered tools and data insights for peak performance. We turn data into actionable intelligence. <Link to="/contact" className="text-yellow-600 underline hover:text-yellow-700">Contact us</Link> to optimize your marketing efforts.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Block */}
      <section className="relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <FastVideo
            src={optimizeCloudinaryVideo(
              "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259174/social_u4455988764_httpss.mj.runf65BhPN_EZo_make_the_clouds_slowly_s_3321fb69-fe0e-43bf-91c7-01e7551a7e85_0_f4rib5.mp4",
              { width: 1920, quality: 'auto' }
            )}
            poster={getVideoThumbnail(
              "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259174/social_u4455988764_httpss.mj.runf65BhPN_EZo_make_the_clouds_slowly_s_3321fb69-fe0e-43bf-91c7-01e7551a7e85_0_f4rib5.mp4",
              { width: 1920 }
            )}
            autoplay
            loop
            muted
            playsInline
            preload="metadata"
            lazy={true}
            preset="fullscreen"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 z-[1] bg-black/70"></div>
        <div className="relative z-10 text-white">
          <DualCTABlock />
        </div>
      </section>
    </div>
  );
}
