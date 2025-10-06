import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { gsap } from 'gsap';

// Service data with new Cloudinary images
const SERVICES = [
  {
    title: "AI Automation",
    description: "Automate repetitive tasks and workflows",
    slug: "solutions-ai-automation",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697144/disruptors-media/services/graphics/what-we-do-bx.png"
  },
  {
    title: "Social Media Marketing",
    description: "Build and engage your community",
    slug: "solutions-social-media",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697142/disruptors-media/services/graphics/what-we-do-bx-3.png"
  },
  {
    title: "SEO & GEO",
    description: "Get found by your ideal customers",
    slug: "solutions-seo-geo",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697141/disruptors-media/services/graphics/what-we-do-bx-2.png"
  },
  {
    title: "Lead Generation",
    description: "Fill your pipeline with qualified prospects",
    slug: "solutions-lead-generation",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697139/disruptors-media/services/graphics/what-we-do-bx-1.png"
  },
  {
    title: "Paid Advertising",
    description: "Maximize ROI across all channels",
    slug: "solutions-paid-advertising",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697137/disruptors-media/services/graphics/what-we-do-abt.png"
  },
  {
    title: "Podcasting",
    description: "Build authority through audio content",
    slug: "solutions-podcasting",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697135/disruptors-media/services/graphics/what-we-do-abt-3.png"
  },
  {
    title: "Custom Apps",
    description: "Tailored solutions for your needs",
    slug: "solutions-custom-apps",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697132/disruptors-media/services/graphics/what-we-do-abt-2.png"
  },
  {
    title: "CRM Management",
    description: "Organize and nurture your relationships",
    slug: "solutions-crm-management",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697130/disruptors-media/services/graphics/what-we-do-abt-1.png"
  },
  {
    title: "Fractional CMO",
    description: "Strategic marketing leadership",
    slug: "solutions-fractional-cmo",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697144/disruptors-media/services/graphics/what-we-do-bx.png"
  }
];

// Split services into two rows
const ROW_1 = SERVICES.slice(0, 4); // First 4 services
const ROW_2 = SERVICES.slice(4, 9); // Last 5 services

/**
 * ServiceCard component with hover animation
 */
function ServiceCard({ service }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      to={createPageUrl(service.slug)}
      className="relative block flex-shrink-0 w-[280px] sm:w-[350px] lg:w-[400px] h-[380px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden mx-3 sm:mx-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform ease-out"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transitionDuration: '1500ms'
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end h-full p-8 pointer-events-none">
        {/* Title - bigger and bolder, responsive sizing */}
        <motion.div
          className="relative z-10"
          initial={{ y: 0 }}
          animate={{ y: isHovered ? -120 : 0 }}
          transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {service.title}
          </h3>
        </motion.div>

        {/* Description - only visible on hover */}
        <motion.div
          className="relative z-10 mt-4 overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0
          }}
          transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <p className="text-base sm:text-lg lg:text-xl text-white/95 leading-relaxed">
            {service.description}
          </p>
        </motion.div>
      </div>

      {/* Hover border effect */}
      <motion.div
        className="absolute inset-0 border-4 rounded-2xl pointer-events-none"
        initial={{ borderColor: 'rgba(255, 255, 255, 0)' }}
        animate={{ borderColor: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)' }}
        transition={{ duration: 1.2 }}
      />
    </Link>
  );
}

/**
 * ScrollingRow component with GSAP infinite scroll
 */
function ScrollingRow({ services, direction = 'left', speed = 60 }) {
  const rowRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!rowRef.current) return;

    const row = rowRef.current;
    const firstCard = row.querySelector('.service-card');

    if (!firstCard) return;

    // Calculate card width including margin
    const cardWidth = firstCard.offsetWidth + 32; // 400px + 32px (mx-4 on each side)
    const totalWidth = cardWidth * services.length;

    // Create seamless infinite scroll
    gsap.set(row, { x: 0 });

    animationRef.current = gsap.to(row, {
      x: direction === 'left' ? -totalWidth : totalWidth,
      duration: speed,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: (x) => {
          const value = parseFloat(x) % totalWidth;
          return `${value}px`;
        }
      }
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [services, direction, speed]);

  // Duplicate services for seamless infinite loop
  const duplicatedServices = [...services, ...services, ...services];

  return (
    <div className="overflow-hidden py-8">
      <div
        ref={rowRef}
        className="flex"
        style={{ willChange: 'transform' }}
      >
        {duplicatedServices.map((service, index) => (
          <div key={`${service.slug}-${index}`} className="service-card">
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main ServicesScrollingRows component
 */
export default function ServicesScrollingRows({
  title = "A Solution for Every Challenge"
}) {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="relative max-w-full">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="text-white text-sm sm:text-base font-bold uppercase tracking-wider">
              Comprehensive Solutions
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>

          <motion.p
            className="text-white text-lg sm:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Tailored strategies that scale with your business
          </motion.p>
        </div>

        {/* Row 1: Scrolling Right */}
        <ScrollingRow services={ROW_1} direction="right" speed={80} />

        {/* Row 2: Scrolling Left */}
        <ScrollingRow services={ROW_2} direction="left" speed={70} />
      </div>
    </section>
  );
}
