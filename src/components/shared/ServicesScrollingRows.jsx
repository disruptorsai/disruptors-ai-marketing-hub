import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { gsap } from 'gsap';

// Service data with new Cloudinary images
const SERVICES = [
  {
    title: "AI Automation",
    description: "Transform your business operations with cutting-edge AI automation. We build intelligent systems that handle repetitive tasks, streamline workflows, and free your team to focus on high-value work. From chatbots to process automation, we deploy AI that works 24/7.",
    slug: "solutions-ai-automation",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258611/AI_Girls_VR_Headsets_giiykw.jpg"
  },
  {
    title: "Social Media Marketing",
    description: "Build a thriving online community that drives real business results. We create scroll-stopping content, engage your audience authentically, and turn followers into loyal customers. From strategy to execution, we handle it all across every major platform.",
    slug: "solutions-social-media",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258611/AI_girl_hoverboards_nisxz4.jpg"
  },
  {
    title: "SEO & GEO",
    description: "Dominate search results and get found by customers actively looking for your services. Our SEO strategies combine technical excellence with compelling content, while our GEO (AI-optimized search) tactics position you for the future of search. More visibility means more revenue.",
    slug: "solutions-seo-geo",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258611/scope-of-work_hoqqrj.jpg"
  },
  {
    title: "Lead Generation",
    description: "Fill your pipeline with high-quality prospects ready to buy. We deploy multi-channel lead generation systems that attract, capture, and nurture your ideal customers. From landing pages to email sequences, we build conversion machines that deliver consistent, predictable growth.",
    slug: "solutions-lead-generation",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258610/AI_Blimp_tmy95m.jpg"
  },
  {
    title: "Paid Advertising",
    description: "Turn ad spend into profit with data-driven campaigns across Google, Facebook, Instagram, and beyond. We optimize every dollar for maximum ROI, using advanced targeting and creative testing to reach your perfect customer. Scale what works, kill what doesn't.",
    slug: "solutions-paid-advertising",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258610/discovery-call_sier9m.jpg"
  },
  {
    title: "Podcasting",
    description: "Establish yourself as the go-to authority in your industry with a professional podcast. We handle everything from strategy and production to distribution and promotion. Build trust at scale, reach new audiences, and create content that works for you long after you hit publish.",
    slug: "solutions-podcasting",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258610/Static_AI_Image_-_Copy_atjtoj.jpg"
  },
  {
    title: "Custom Apps",
    description: "Get software built specifically for your business needs. Whether it's a customer portal, internal tool, or unique business application, we design and develop custom solutions that give you a competitive edge. Your business is unique—your software should be too.",
    slug: "solutions-custom-apps",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258609/send-proposal_eptrcp.jpg"
  },
  {
    title: "CRM Management",
    description: "Turn chaotic customer data into organized, actionable insights. We set up and optimize CRM systems that track every interaction, automate follow-ups, and ensure no lead falls through the cracks. Better relationships mean better retention and more referrals.",
    slug: "solutions-crm-management",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258609/website-design-optimization_a0vafx.jpg"
  },
  {
    title: "Fractional CMO",
    description: "Get C-level marketing strategy without the C-level salary. Our fractional CMOs bring years of experience to guide your marketing vision, optimize your spend, and drive measurable growth. Strategic leadership when you need it, flexibility when you don't.",
    slug: "solutions-fractional-cmo",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759270223/u4455988764_Epic_Renaissance-style_painting_in_the_manner_of__3c22e647-38af-495f-8292-d023c0447081_3_wd6alm.png"
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

  const handleClick = (e) => {
    // Prevent navigation if currently dragging
    if (isDragging) {
      e.preventDefault();
    }
  };

  return (
    <Link
      to={createPageUrl(service.slug)}
      className="relative block flex-shrink-0 w-[300px] sm:w-[390px] lg:w-[480px] h-[270px] sm:h-[330px] lg:h-[390px] rounded-2xl overflow-hidden mx-3 sm:mx-4 shadow-xl hover:shadow-2xl transition-shadow duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
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
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end h-full p-5 pointer-events-none">
        {/* Title - bigger and bolder, responsive sizing */}
        <motion.div
          className="relative z-10"
          initial={{ y: 0 }}
          animate={{ y: isHovered ? -60 : 0 }}
          transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight">
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
  const [cardWidth, setCardWidth] = useState(0);

  // Lighter spring physics for smoother, more responsive feel
  const springX = useSpring(x, {
    damping: 30,
    stiffness: 300,
    mass: 0.5
  });

  // Duplicate services for seamless infinite loop (6x for ultra-smooth infinite scrolling)
  const duplicatedServices = [
    ...services,
    ...services,
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

  // Auto-scroll animation when not dragging - truly infinite
  useEffect(() => {
    if (!cardWidth || isDragging) return;

    const totalWidth = cardWidth * services.length;

    // Start from the middle set of duplicates to allow smooth wrapping in both directions
    if (x.get() === 0) {
      x.set(-totalWidth * 2);
    }

    let animationId;
    const startTime = Date.now();
    const startX = x.get();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const pixelsPerSecond = direction === 'left' ? -speed : speed;
      const newX = startX + (pixelsPerSecond * elapsed) / 1000;

      // Seamless wrapping - always keep within the middle range
      let wrappedX = newX;
      if (direction === 'left') {
        // Scrolling left (negative direction)
        while (wrappedX <= -totalWidth * 3) {
          wrappedX += totalWidth;
        }
      } else {
        // Scrolling right (positive direction)
        while (wrappedX >= -totalWidth) {
          wrappedX -= totalWidth;
        }
      }

      x.set(wrappedX);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [x, cardWidth, services.length, isDragging, direction, speed]);

  // Handle drag constraints and wrapping
  const handleDrag = (event, info) => {
    if (!cardWidth) return;

    // Track if user has actually dragged (moved more than 5px)
    const dragDistance = Math.abs(info.point.x - dragStartX.current);
    if (dragDistance > 5) {
      setHasDragged(true);
    }

    const totalWidth = cardWidth * services.length;
    let currentX = x.get();

    // Seamless wrap during drag - keep in middle range
    if (currentX <= -totalWidth * 3) {
      currentX = currentX + totalWidth;
      x.set(currentX);
    } else if (currentX >= -totalWidth) {
      currentX = currentX - totalWidth;
      x.set(currentX);
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
          x: isDragging ? x : springX,
          willChange: 'transform'
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        dragMomentum={true}
        dragTransition={{
          power: 0.3,
          timeConstant: 150,
          bounceStiffness: 200,
          bounceDamping: 20
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
