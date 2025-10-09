
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { customClient } from '@/lib/custom-sdk';

// Fallback hardcoded services (used if database fetch fails)
// Now using Cloudinary-hosted images extracted from video first frames
const FALLBACK_SERVICES = [
  {
    title: "AI Automation",
    hook: "Transform your business operations by automating repetitive tasks, streamlining workflows, and eliminating manual bottlenecks. Our AI-powered solutions free your team to focus on high-value activities while machines handle the routine work with precision and speed.",
    slug: "solutions-ai-automation",
    image: "https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto:good,so_0/v1/dmsite/services/ai-automation.jpg?_a=BAMAK+eC0"
  },
  {
    title: "Social Media Marketing",
    hook: "Build authentic connections with your audience through strategic content that cuts through the noise. We create data-driven campaigns that engage your community, spark conversations, and turn followers into loyal customers who advocate for your brand.",
    slug: "solutions-social-media",
    image: "https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto:good,so_0/v1/dmsite/services/social-media-marketing.jpg?_a=BAMAK+eC0"
  },
  {
    title: "SEO & GEO",
    hook: "Dominate local and organic search results to ensure your ideal customers find you first. We combine technical SEO expertise with geo-targeted strategies to boost your visibility, drive qualified traffic, and establish your authority in your market.",
    slug: "solutions-seo-geo",
    image: "https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto:good,so_0/v1/dmsite/services/seo-geo.jpg?_a=BAMAK+eC0"
  },
  {
    title: "Lead Generation",
    hook: "Fill your sales pipeline with high-quality, ready-to-convert prospects through proven multi-channel strategies. We identify your ideal customers, craft compelling offers, and deploy targeted campaigns that consistently deliver qualified leads to fuel your growth.",
    slug: "solutions-lead-generation",
    image: "https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto:good,so_0/v1/dmsite/services/lead-generation.jpg?_a=BAMAK+eC0"
  },
  {
    title: "Paid Advertising",
    hook: "Maximize your advertising ROI across Google Ads, Meta, LinkedIn, and emerging platforms with data-driven campaigns. Our performance marketing experts continuously optimize your ad spend to reduce acquisition costs while scaling results that directly impact your bottom line.",
    slug: "solutions-paid-advertising",
    image: "https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto:good,so_0/v1/dmsite/services/paid-advertising.jpg?_a=BAMAK+eC0"
  },
  {
    title: "Podcasting",
    hook: "Establish thought leadership and build deep audience connections through strategic podcast production and promotion. We handle everything from concept development to editing, distribution, and amplification—turning your voice into a powerful brand asset that drives authority and trust.",
    slug: "solutions-podcasting",
    image: "https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto:good,so_0/v1/dmsite/services/podcasting.jpg?_a=BAMAK+eC0"
  },
  {
    title: "Custom Apps",
    hook: "Solve unique business challenges with tailor-made software solutions designed specifically for your workflows and goals. From internal tools to customer-facing platforms, we build scalable applications that give you a competitive edge and streamline your operations.",
    slug: "solutions-custom-apps",
    image: "https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto:good,so_0/v1/dmsite/services/custom-apps.jpg?_a=BAMAK+eC0"
  },
  {
    title: "CRM Management",
    hook: "Transform scattered customer data into a strategic asset with expertly configured and managed CRM systems. We optimize your customer relationship workflows, implement automation that nurtures leads at scale, and provide insights that help you close more deals faster.",
    slug: "solutions-crm-management",
    image: "https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto:good,so_0/v1/dmsite/services/crm-management.jpg?_a=BAMAK+eC0"
  },
  {
    title: "Fractional CMO",
    hook: "Access C-suite marketing leadership without the full-time executive cost. Our fractional CMOs bring decades of experience developing growth strategies, building high-performing teams, and driving measurable results—giving you the strategic guidance needed to scale.",
    slug: "solutions-fractional-cmo",
    image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto:good/v1/dmsite/services/fractional-cmo?_a=BAMAK+eC0"
  }
];

export default function ServiceScroller({
  title = "A Solution for Every Challenge"
}) {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [isLoading, setIsLoading] = useState(true);
  const [useDatabase, setUseDatabase] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      // Attempt to load services from database
      const dbServices = await customClient.entities.Service.list('display_order', 100);

      if (dbServices && dbServices.length > 0) {
        // Map database fields to component format
        const mappedServices = dbServices
          .filter(svc => svc.is_active !== false) // Only show active services
          .map(svc => ({
            title: svc.title,
            hook: svc.hook || svc.description || '',
            slug: svc.slug,
            image: svc.image || '/generated/anachron-lite/default-service-icon.png'
          }));

        setServices(mappedServices);
        setUseDatabase(true);
        console.log(`✓ Loaded ${mappedServices.length} services from database`);
      } else {
        console.log('⚠ No services found in database, using fallback data');
        setServices(FALLBACK_SERVICES);
      }
    } catch (error) {
      console.warn('⚠ Failed to load services from database:', error.message);
      console.log('Using fallback hardcoded services');
      setServices(FALLBACK_SERVICES);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="text-gray-900 text-sm sm:text-base font-bold uppercase tracking-wider">
              Comprehensive Solutions
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>

          <motion.p
            className="text-gray-900 text-lg sm:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Tailored strategies that scale with your business
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link
                to={createPageUrl(service.slug)}
                className="block h-full"
              >
                <div className="relative h-full bg-white rounded-xl p-5 border border-gray-200 shadow-md transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1">
                  {/* Icon */}
                  <div className="mb-4 relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <img
                      src={service.image}
                      alt={`${service.title} service illustration`}
                      className="relative w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                      style={{ imageRendering: 'crisp-edges' }}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl hidden items-center justify-center">
                      <div className="text-lg text-white font-black">
                        {service.title.split(' ').map(word => word[0]).join('')}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2 tracking-tight">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                      {service.hook}
                    </p>
                  </div>

                  {/* Hover arrow indicator */}
                  <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                    <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
