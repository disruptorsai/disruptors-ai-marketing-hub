import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import AlternatingLayout from '../components/shared/AlternatingLayout';
import ClientLogoMarquee from '../components/shared/ClientLogoMarquee';
import ThreePillars from '../components/shared/ThreePillars';
import ReviewsCarousel from '../components/shared/ReviewsCarousel';
import ServicesScrollingRows from '../components/shared/ServicesScrollingRows';
import DualCTABlock from '../components/shared/DualCTABlock';

export default function Home() {
  const alternatingData = [
    {
      kicker: "REVOLUTION",
      headline: "Transform Your Business with AI",
      body: "We combine deep marketing expertise with cutting-edge AI systems to create flexible growth strategies that scale your business beyond current limitations.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/c_fill,ar_4:3,g_auto/v1759259177/social_u4455988764_Innovation_Section_Cutting-Edge_AI_Solutions_An_a_f5059a4a-a4d2-493b-a4ce-f16bce3d9987_0_1_vza370.mp4",
      imageAlt: "AI Technology Transformation",
      backgroundColor: "bg-transparent backdrop-blur-md",
      textColor: "text-black",
      cta: {
        label: "Start Your Transformation",
        link: "book-strategy-session"
      }
    },
    {
      kicker: "PARTNERSHIP",
      headline: "More Than an Agency. Your Growth Partner.",
      body: "We help companies generate leads, streamline operations, and scale using AI-powered systems—all with complete transparency so you stay in control of your growth journey.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/c_fill,ar_4:3,g_auto/v1759259179/social_u4455988764_httpss.mj.runEsrFEq0BgZA_make_the_hands_coming_to_2f5e7702-c919-4da3-812d-ebd2789c493e_0_bpisoz.mp4",
      imageAlt: "Growth Partnership Visualization",
      backgroundColor: "bg-transparent backdrop-blur-sm",
      textColor: "text-black"
    },
    {
      kicker: "INNOVATION",
      headline: "Cutting-Edge AI Solutions",
      body: "From automated lead generation to intelligent customer insights, we deploy the latest AI technologies to give your business a competitive edge in the digital marketplace.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259181/social_u4455988764_Inside_a_grand_marble_hall_scholars_tend_to_cryst_b343eebf-1f3d-4deb-a5be-912076e91fe1_0_soeuwu.mp4",
      imageAlt: "AI Innovation Technology",
      backgroundColor: "bg-gray-900",
      textColor: "text-white"
    },
    {
      kicker: "RESULTS",
      headline: "Proven Success Stories",
      body: "Our clients see average growth increases of 300% within the first 6 months. We don't just promise results—we deliver measurable outcomes that transform businesses.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759116522/full-animation_online-video-cutter.com_zzpok1.mp4",
      imageAlt: "Business Growth Analytics",
      backgroundColor: "bg-transparent",
      textColor: "text-black"
    },
    {
      kicker: "MISSION",
      headline: "Your Partner in AI Excellence",
      body: "Technology should free you from repetitive tasks. We leverage AI to eliminate monotony so you can focus on what only you can do: connect with the people you serve and grow your impact.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759259174/social_u4455988764_httpss.mj.runf65BhPN_EZo_make_the_clouds_slowly_s_3321fb69-fe0e-43bf-91c7-01e7551a7e85_0_f4rib5.mp4",
      imageAlt: "Human-AI Partnership",
      backgroundColor: "bg-gray-900",
      textColor: "text-white",
      cta: {
        label: "Partner With Us",
        link: "book-strategy-session"
      }
    }
  ];

  return (
    <div className="text-gray-800">
      {/* Full-Screen Hero with Video Background */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center bg-[#0E0E0E] text-white">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758645813/Website_Demo_Reel_edited_udorcp.mp4"
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
              src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png"
              alt="Disruptors AI"
              className="h-24 sm:h-32 lg:h-40 mx-auto mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-6 tracking-tight">
              Digital Marketing
              <br />
              <span className="text-[#FFD700]">× AI Solutions</span>
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

      {/* Client Logos Marquee */}
      <div className="py-2 sm:py-3 bg-gray-900 overflow-hidden">
        <ClientLogoMarquee />
      </div>

      {/* Reviews - Modern Horizontal Auto-Scroll Carousel */}
      <ReviewsCarousel />

      {/* Modern Alternating Layout Sections */}
      <AlternatingLayout sections={alternatingData} />

      {/* Our Approach (3 Pillars) */}
      <section className="bg-gray-900 text-white py-8 sm:py-12">
        <ThreePillars />
      </section>

      {/* Services / Solutions */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759258610/gallery-bg_lrxadn.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/50"></div>
        <div className="relative z-10">
          <ServicesScrollingRows />
        </div>
      </section>

      {/* CTA Block */}
       <section className="bg-gray-900 text-white">
         <DualCTABlock />
       </section>
    </div>
  );
}