import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { optimizeSupabaseImage } from '@/utils/supabase-media-optimizer';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

// Service data with first frames from uploaded videos
const SERVICES = [
  {
    title: "AI Automation",
    description: "Transform your business operations with cutting-edge AI automation. We build intelligent systems that handle repetitive tasks, streamline workflows, and free your team to focus on high-value work. From chatbots to process automation, we deploy AI that works 24/7.",
    slug: "solutions-ai-automation",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/ai-automation.jpg"
  },
  {
    title: "Social Media Marketing",
    description: "Build a thriving online community that drives real business results. We create scroll-stopping content, engage your audience authentically, and turn followers into loyal customers. From strategy to execution, we handle it all across every major platform.",
    slug: "solutions-social-media",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/social-media-marketing.jpg"
  },
  {
    title: "SEO & GEO",
    description: "Dominate search results and get found by customers actively looking for your services. Our SEO strategies combine technical excellence with compelling content, while our GEO (AI-optimized search) tactics position you for the future of search. More visibility means more revenue.",
    slug: "solutions-seo-geo",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/seo-geo.jpg"
  },
  {
    title: "Lead Generation",
    description: "Fill your pipeline with high-quality prospects ready to buy. We deploy multi-channel lead generation systems that attract, capture, and nurture your ideal customers. From landing pages to email sequences, we build conversion machines that deliver consistent, predictable growth.",
    slug: "solutions-lead-generation",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/lead-generation.jpg"
  },
  {
    title: "Paid Advertising",
    description: "Turn ad spend into profit with data-driven campaigns across Google, Facebook, Instagram, and beyond. We optimize every dollar for maximum ROI, using advanced targeting and creative testing to reach your perfect customer. Scale what works, kill what doesn't.",
    slug: "solutions-paid-advertising",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/paid-advertising.jpg"
  },
  {
    title: "Podcasting",
    description: "Establish yourself as the go-to authority in your industry with a professional podcast. We handle everything from strategy and production to distribution and promotion. Build trust at scale, reach new audiences, and create content that works for you long after you hit publish.",
    slug: "solutions-podcasting",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/podcasting.jpg"
  },
  {
    title: "Custom Apps",
    description: "Get software built specifically for your business needs. Whether it's a customer portal, internal tool, or unique business application, we design and develop custom solutions that give you a competitive edge. Your business is unique—your software should be too.",
    slug: "solutions-custom-apps",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/custom-apps.jpg"
  },
  {
    title: "CRM Management",
    description: "Turn chaotic customer data into organized, actionable insights. We set up and optimize CRM systems that track every interaction, automate follow-ups, and ensure no lead falls through the cracks. Better relationships mean better retention and more referrals.",
    slug: "solutions-crm-management",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/crm-management.jpg"
  },
  {
    title: "Fractional CMO",
    description: "Get C-level marketing strategy without the C-level salary. Our fractional CMOs bring years of experience to guide your marketing vision, optimize your spend, and drive measurable growth. Strategic leadership when you need it, flexibility when you don't.",
    slug: "solutions-fractional-cmo",
    image: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/images/v1/dmsite/services/fractional-cmo.jpg"
  }
];

// Split services into two rows
const ROW_1 = SERVICES.slice(0, 4); // First 4 services
const ROW_2 = SERVICES.slice(4, 9); // Last 5 services

/**
 * ServiceCard component with hover animation
 */
function ServiceCard({ service, isDragging }) {
  const [isHovered, setIsHovered] = useState(false);

  // Guard against the drag gesture firing a navigation when the user was
  // scrubbing the carousel rather than intentionally tapping a card.
  const handleClick = (e) => {
    if (isDragging) {
      e.preventDefault();
    }
  };

  return (
    <Link
      to={createPageUrl(service.slug)}
      onClick={handleClick}
      draggable={false}
      aria-label={`${service.title} — learn more`}
      className="relative block flex-shrink-0 w-[300px] sm:w-[390px] lg:w-[480px] h-[300px] sm:h-[390px] lg:h-[480px] rounded-2xl overflow-hidden mx-3 sm:mx-4 shadow-xl hover:shadow-2xl transition-shadow duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={optimizeSupabaseImage(service.image, { width: 600, quality: 75 })}
          alt={service.title}
          width="600"
          height="600"
          decoding="async"
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
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end h-full p-5 pointer-events-none">
        {/* Title - bigger and bolder, responsive sizing */}
        <motion.div
          className="relative z-10"
          initial={{ y: 0 }}
          animate={{ y: isHovered ? -60 : 0 }}
          transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {service.title}
          </h3>
        </motion.div>

        {/* Description - only visible on hover */}
        <motion.div
          className="relative z-10 mt-2 overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0
          }}
          transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <p className="text-sm sm:text-base lg:text-lg text-white/95 leading-relaxed">
            {service.description}
          </p>
        </motion.div>
      </div>

      {/* Hover border effect */}
      <motion.div
        className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
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
  const [hasDragged, setHasDragged] = useState(false);
  const dragStartX = useRef(0);
  const x = useMotionValue(0);
  // Width of a single service set (one card * services.length), kept in a ref so the
  // animation loop reads the latest measurement without re-subscribing, plus a state
  // flag to (re)start the loop once we have a real measurement.
  const oneSetRef = useRef(0);
  const [measured, setMeasured] = useState(false);

  // Duplicate services for seamless infinite loop (6x for ultra-smooth infinite scrolling)
  const duplicatedServices = [
    ...services,
    ...services,
    ...services,
    ...services,
    ...services,
    ...services
  ];

  // Measure one set's rendered width on mount AND on resize. A stale/zero measurement
  // (taken before layout settles) made the wrap shift by the wrong amount, which is what
  // produced the visible "jump back" — so we re-measure whenever the layout can change.
  useEffect(() => {
    const measure = () => {
      if (!rowRef.current) return;
      const firstCard = rowRef.current.querySelector('.service-card');
      if (!firstCard) return;
      const rect = firstCard.getBoundingClientRect();
      const styles = window.getComputedStyle(firstCard);
      const cardWidth = rect.width + parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
      if (cardWidth > 0) {
        oneSetRef.current = cardWidth * services.length;
        setMeasured(true);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [services.length]);

  // Auto-scroll, driven by a persistent per-frame delta. Using the frame timestamp delta
  // (rather than startX + elapsed-since-effect-start) means a position wrap never resets
  // the clock or the baseline, so there is no jump when the row wraps.
  useEffect(() => {
    if (!measured || isDragging) return;

    const oneSet = oneSetRef.current;

    // Seed into the middle band on first run so we can wrap in either direction.
    if (x.get() === 0) {
      x.set(-oneSet * 2);
    }

    let animationId;
    let last = null;
    const dir = direction === 'left' ? -1 : 1;

    const animate = (now) => {
      if (last === null) last = now;
      const dt = (now - last) / 1000;
      last = now;

      let next = x.get() + dir * speed * dt;
      // Keep within the middle band [-3*oneSet, -oneSet]. Shifting by exactly one set is
      // pixel-identical because the strip is the same services repeated 6x.
      if (next <= -oneSet * 3) next += oneSet;
      else if (next >= -oneSet) next -= oneSet;
      x.set(next);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [x, measured, isDragging, direction, speed]);

  // Wrap the position during drag so the user can scrub infinitely in either direction.
  const handleDrag = (event, info) => {
    const oneSet = oneSetRef.current;
    if (!oneSet) return;

    // Track if user has actually dragged (moved more than 5px)
    const dragDistance = Math.abs(info.point.x - dragStartX.current);
    if (dragDistance > 5) {
      setHasDragged(true);
    }

    const currentX = x.get();
    // Seamless wrap during drag - keep in middle range
    if (currentX <= -oneSet * 3) {
      x.set(currentX + oneSet);
    } else if (currentX >= -oneSet) {
      x.set(currentX - oneSet);
    }
  };

  const handleDragStart = (event, info) => {
    setIsDragging(true);
    setHasDragged(false);
    dragStartX.current = info.point.x;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Keep hasDragged true for a moment to prevent click events
    setTimeout(() => setHasDragged(false), 100);
  };

  return (
    <div ref={containerRef} className="overflow-hidden py-8 cursor-grab active:cursor-grabbing select-none">
      <motion.div
        ref={rowRef}
        className="flex"
        style={{
          x,
          willChange: 'transform'
        }}
        drag="x"
        dragConstraints={false}
        dragElastic={0}
        dragMomentum={true}
        dragTransition={{
          power: 0.25,
          timeConstant: 200
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
      >
        {duplicatedServices.map((service, index) => (
          <div
            key={`${service.slug}-${index}`}
            className="service-card"
          >
            <ServiceCard service={service} isDragging={hasDragged} />
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link
              to={createPageUrl('solutions')}
              className="font-sans group inline-flex items-center justify-center h-12 px-8 text-base font-bold text-white uppercase bg-transparent border-2 border-white hover:bg-white hover:text-black touch-manipulation transition-all duration-300 rounded-lg"
            >
              <span>Our Services</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Row 1: Scrolling Right */}
        <ScrollingRow services={ROW_1} direction="right" speed={80} />

        {/* Row 2: Scrolling Left */}
        <ScrollingRow services={ROW_2} direction="left" speed={70} />
      </div>
    </section>
  );
}
