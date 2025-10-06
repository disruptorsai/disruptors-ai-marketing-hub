import React from 'react';
import Hero from '../components/shared/Hero';
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
      <Hero />

      {/* Reviews - Modern Horizontal Auto-Scroll Carousel */}
      <ReviewsCarousel />

      {/* Modern Alternating Layout Sections */}
      <AlternatingLayout sections={alternatingData} />

      {/* Client Logos Marquee */}
      <div className="py-8 bg-gray-900 overflow-hidden">
        <ClientLogoMarquee />
      </div>

      {/* Our Approach (3 Pillars) */}
      <section className="bg-gray-900 text-white py-24 sm:py-32">
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
       <section className="bg-gray-900 text-white py-20">
         <DualCTABlock />
       </section>
    </div>
  );
}