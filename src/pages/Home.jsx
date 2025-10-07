import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AlternatingLayout from '../components/shared/AlternatingLayout';
import ClientLogoMarquee from '../components/shared/ClientLogoMarquee';
import ReviewsCarousel from '../components/shared/ReviewsCarousel';
import ServicesScrollingRows from '../components/shared/ServicesScrollingRows';

export default function Home() {
  const alternatingData = [
    {
      kicker: "PARTNERSHIP",
      headline: "More Than an Agency. Your Growth Partner.",
      body: "We help companies generate leads, streamline operations, and scale using AI-powered systems—all with complete transparency so you stay in control of your growth journey.",
      video: "https://res.cloudinary.com/dvcvxhzmt/video/upload/c_fill,ar_4:3,g_auto/v1759259179/social_u4455988764_httpss.mj.runEsrFEq0BgZA_make_the_hands_coming_to_2f5e7702-c919-4da3-812d-ebd2789c493e_0_bpisoz.mp4",
      imageAlt: "Growth Partnership Visualization",
      backgroundColor: "bg-transparent backdrop-blur-sm",
      textColor: "text-black"
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

            <h1 className="font-sans text-4xl sm:text-6xl lg:text-8xl font-bold mb-6 tracking-tight">
              Digital Marketing
              <br />
              <span className="text-[#FFD700]">× AI Solutions</span>
            </h1>

            <p className="font-sans text-lg sm:text-xl text-[#C7C7C7] max-w-2xl mx-auto">
              We drive growth with expert digital marketing, then multiply results with AI for business
            </p>
          </motion.div>
        </div>
      </section>

      {/* Client Logos Marquee */}
      <div className="bg-gray-900 overflow-hidden">
        <ClientLogoMarquee />
      </div>

      {/* PARTNERSHIP Section */}
      <AlternatingLayout sections={alternatingData} />

      {/* Free Marketing Audit CTA */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6">
              Ready to Accelerate Your Growth?
            </h2>
            <p className="font-sans text-lg sm:text-xl text-black mb-10 max-w-2xl mx-auto">
              Get a free, comprehensive marketing audit and discover untapped opportunities in your business.
            </p>
            <Link
              to={createPageUrl('book-strategy-session')}
              className="font-sans group relative inline-flex items-center justify-center h-16 px-10 xl:px-12 text-lg font-bold text-[#FFD700] uppercase bg-black hover:bg-gray-900 border-2 border-[#FFD700] hover:bg-[#FFD700]/10 touch-manipulation transition-all duration-300"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                animation: 'goldPulse 3s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
              }}
            >
              <span>Free Marketing Audit</span>
              <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
              <style jsx>{`
                @keyframes goldPulse {
                  0%, 100% {
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2);
                  }
                  50% {
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3);
                  }
                }
              `}</style>
            </Link>
          </motion.div>
        </div>
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

      {/* Reviews - Modern Horizontal Auto-Scroll Carousel */}
      <ReviewsCarousel />
    </div>
  );
}