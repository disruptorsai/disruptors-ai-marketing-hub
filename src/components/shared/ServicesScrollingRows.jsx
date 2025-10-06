import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={createPageUrl(service.slug)}
      className="relative block flex-shrink-0 w-[500px] sm:w-[650px] lg:w-[800px] h-[450px] sm:h-[550px] lg:h-[650px] rounded-2xl overflow-hidden mx-4 sm:mx-6"
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
 * ScrollingRow component with drag-to-scroll and infinite loop
 */
function ScrollingRow({ services, direction = 'left', speed = 80 }) {
  const containerRef = useRef(null);
  const rowRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const [cardWidth, setCardWidth] = useState(0);

  // Spring physics for smooth momentum
  const springX = useSpring(x, {
    damping: 50,
    stiffness: 400,
    mass: 3
  });

  // Duplicate services for seamless infinite loop (4x for smooth dragging)
  const duplicatedServices = [
    ...services,
    ...services,
    ...services,
    ...services
  ];

  // Calculate card width on mount
  useEffect(() => {
    if (!rowRef.current) return;
    const firstCard = rowRef.current.querySelector('.service-card');
    if (firstCard) {
      // Get actual card width including margins
      const rect = firstCard.getBoundingClientRect();
      const styles = window.getComputedStyle(firstCard);
      const marginLeft = parseFloat(styles.marginLeft);
      const marginRight = parseFloat(styles.marginRight);
      setCardWidth(rect.width + marginLeft + marginRight);
    }
  }, []);

  // Auto-scroll animation when not dragging
  useEffect(() => {
    if (!cardWidth || isDragging) return;

    const totalWidth = cardWidth * services.length;
    const currentX = x.get();
    const startX = currentX;

    // Calculate animation duration based on current position
    const pixelsToScroll = direction === 'left' ? totalWidth : -totalWidth;
    const duration = (Math.abs(pixelsToScroll) / cardWidth) * (speed / services.length);

    const controls = animate(x, startX + pixelsToScroll, {
      duration,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
      onUpdate: (latest) => {
        // Wrap around for infinite loop
        const totalWidth = cardWidth * services.length;
        if (direction === 'left' && latest <= -totalWidth) {
          x.set(latest + totalWidth);
        } else if (direction === 'right' && latest >= 0) {
          x.set(latest - totalWidth);
        }
      }
    });

    return () => controls.stop();
  }, [x, cardWidth, services.length, isDragging, direction, speed]);

  // Handle drag constraints and wrapping
  const handleDrag = (event, info) => {
    if (!cardWidth) return;

    const totalWidth = cardWidth * services.length;
    const currentX = x.get();

    // Wrap around during drag
    if (currentX <= -totalWidth * 2) {
      x.set(currentX + totalWidth);
    } else if (currentX >= -totalWidth) {
      x.set(currentX - totalWidth);
    }
  };

  return (
    <div ref={containerRef} className="overflow-hidden py-8 cursor-grab active:cursor-grabbing">
      <motion.div
        ref={rowRef}
        className="flex"
        style={{
          x: springX,
          willChange: 'transform'
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        dragTransition={{
          power: 0.2,
          timeConstant: 200,
          modifyTarget: (target) => {
            // Snap to nearest card
            if (!cardWidth) return target;
            return Math.round(target / cardWidth) * cardWidth;
          }
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onDrag={handleDrag}
      >
        {duplicatedServices.map((service, index) => (
          <div
            key={`${service.slug}-${index}`}
            className="service-card"
            onMouseDown={(e) => {
              // Prevent drag on link elements to allow clicking
              if (e.target.closest('a')) {
                e.stopPropagation();
              }
            }}
          >
            <ServiceCard service={service} />
          </div>
        ))}
      </motion.div>
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
    <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
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
