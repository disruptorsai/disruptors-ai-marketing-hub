/**
 * Content Extraction Script for Disruptors AI Marketing Hub
 * Extracts all site content from React components and prepares for database insertion
 */

import fs from 'fs/promises'
import path from 'path'

// Team Members from About.jsx
const teamMembers = [
  {
    name: "Will Stevens",
    title: "CEO & AI Strategy Director",
    bio: "Leading AI transformation initiatives for marketing teams worldwide. Specializing in implementing cutting-edge AI solutions that drive measurable business growth.",
    headshot: "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/team/will-stevens.jpg",
    social_links: {
      linkedin: "https://linkedin.com/in/willstevens"
    },
    is_active: true,
    display_order: 1
  },
  {
    name: "Sarah Chen",
    title: "Head of AI Development",
    bio: "Expert in machine learning and AI model optimization. Sarah leads our technical team in developing custom AI solutions for enterprise clients.",
    headshot: "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/team/sarah-chen.jpg",
    social_links: {
      linkedin: "https://linkedin.com/in/sarahchen"
    },
    is_active: true,
    display_order: 2
  },
  {
    name: "Marcus Rodriguez",
    title: "Creative AI Director",
    bio: "Pioneering the intersection of creativity and artificial intelligence. Marcus oversees all AI-generated content and visual strategy initiatives.",
    headshot: "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/team/marcus-rodriguez.jpg",
    social_links: {
      linkedin: "https://linkedin.com/in/marcusrodriguez"
    },
    is_active: true,
    display_order: 3
  },
  {
    name: "Emma Thompson",
    title: "Data Analytics Manager",
    bio: "Transforms complex data into actionable insights that drive strategic decision-making. Emma specializes in predictive analytics and performance optimization.",
    headshot: "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/team/emma-thompson.jpg",
    social_links: {
      linkedin: "https://linkedin.com/in/emmathompson-analytics"
    },
    is_active: true,
    display_order: 4
  },
  {
    name: "James Wilson",
    title: "Client Success Director",
    bio: "Ensures every client achieves exceptional results through personalized strategies and dedicated support. James brings over 8 years of experience in customer success.",
    headshot: "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/team/james-wilson.jpg",
    social_links: {
      linkedin: "https://linkedin.com/in/jameswilson-success"
    },
    is_active: true,
    display_order: 5
  }
]

// Services from solutions pages
const services = [
  {
    name: "AI Automation & Infrastructure",
    slug: "ai-automation",
    description: "Our AI automation services help businesses streamline operations, generate leads, and scale with efficiency by integrating advanced tools like GoHighLevel, n8n, and custom AI systems. We design tailored solutions that eliminate repetitive tasks, enhance customer engagement, and drive measurable ROI. Whether you need automated marketing, CRM workflows, or AI-powered content systems, we create scalable infrastructure that grows with your business.",
    short_description: "Streamline. Automate. Scale.",
    category: "automation",
    featured_image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/hand-human.png",
    is_active: true,
    features: ["Custom AI Systems", "GoHighLevel Integration", "n8n Workflows", "CRM Automation", "Lead Generation", "Content Systems"],
    benefits: ["Eliminate repetitive tasks", "Enhanced customer engagement", "Measurable ROI", "Scalable infrastructure"],
    seo_title: "AI Automation & Infrastructure - Build Your AI-Powered Future",
    seo_description: "Streamline operations, generate leads, and scale with efficiency using AI automation services. Custom AI systems, CRM workflows, and automated marketing solutions.",
    seo_keywords: ["AI automation", "business automation", "CRM workflows", "lead generation", "GoHighLevel", "custom AI systems"]
  },
  {
    name: "Fractional CMO",
    slug: "fractional-cmo",
    description: "Get the benefit of a seasoned Chief Marketing Officer without the full-time executive salary. Our Fractional CMO service provides the high-level strategy, team leadership, and data-driven insights you need to scale your marketing efforts effectively. We work as an extension of your team to guide your marketing vision, manage execution, and ensure every initiative is aligned with your business objectives.",
    short_description: "Executive Level Marketing, at a Fraction of the Cost",
    category: "strategy",
    featured_image: "https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/services-img.png",
    is_active: true,
    features: ["Strategic Marketing Leadership", "Team Management", "Data-Driven Insights", "Marketing Vision Guidance", "Execution Management", "Business Alignment"],
    benefits: ["Seasoned expertise without full-time costs", "High-level strategy", "Effective scaling", "Team leadership"],
    seo_title: "Fractional CMO Services - Strategic Leadership on Demand",
    seo_description: "Get seasoned Chief Marketing Officer expertise without the full-time salary. Strategic leadership, team management, and data-driven marketing insights.",
    seo_keywords: ["fractional CMO", "marketing strategy", "chief marketing officer", "marketing leadership", "strategic marketing", "marketing consulting"]
  },
  {
    name: "CRM Management",
    slug: "crm-management",
    description: "Transform your customer relationships with our comprehensive CRM management services. We implement, optimize, and maintain CRM systems that streamline your sales process, improve customer retention, and provide actionable insights for business growth.",
    short_description: "Streamline Customer Relationships and Sales Processes",
    category: "management",
    is_active: true,
    features: ["CRM Implementation", "Sales Process Optimization", "Customer Data Management", "Automated Workflows", "Analytics & Reporting", "Integration Services"],
    benefits: ["Improved customer retention", "Streamlined sales processes", "Actionable business insights", "Enhanced productivity"],
    seo_title: "CRM Management Services - Transform Customer Relationships",
    seo_description: "Comprehensive CRM management services to streamline sales processes, improve customer retention, and provide actionable business insights.",
    seo_keywords: ["CRM management", "customer relationship management", "sales optimization", "CRM implementation", "customer retention", "sales automation"]
  },
  {
    name: "Custom Apps",
    slug: "custom-apps",
    description: "Build powerful custom applications tailored to your unique business needs. Our development team creates scalable, user-friendly applications that integrate seamlessly with your existing systems and workflow.",
    short_description: "Tailored Applications for Unique Business Needs",
    category: "development",
    is_active: true,
    features: ["Custom Development", "System Integration", "Scalable Architecture", "User-Friendly Design", "API Development", "Database Design"],
    benefits: ["Tailored to your needs", "Seamless integration", "Scalable solutions", "Enhanced productivity"],
    seo_title: "Custom App Development - Tailored Business Solutions",
    seo_description: "Build powerful custom applications tailored to your business needs. Scalable, user-friendly apps with seamless system integration.",
    seo_keywords: ["custom app development", "business applications", "software development", "system integration", "custom software", "app development"]
  },
  {
    name: "Paid Advertising",
    slug: "paid-advertising",
    description: "Maximize your ROI with data-driven paid advertising campaigns across Google Ads, Facebook, LinkedIn, and other platforms. Our advertising experts create, manage, and optimize campaigns that drive qualified leads and conversions.",
    short_description: "Data-Driven Campaigns That Drive Results",
    category: "advertising",
    is_active: true,
    features: ["Google Ads Management", "Social Media Advertising", "Campaign Optimization", "A/B Testing", "Conversion Tracking", "ROI Analysis"],
    benefits: ["Maximized ROI", "Qualified lead generation", "Data-driven optimization", "Multi-platform reach"],
    seo_title: "Paid Advertising Services - Maximize ROI with Expert Campaigns",
    seo_description: "Data-driven paid advertising campaigns across Google Ads, Facebook, LinkedIn. Expert management and optimization for maximum ROI.",
    seo_keywords: ["paid advertising", "Google Ads", "Facebook ads", "PPC management", "digital advertising", "campaign optimization"]
  },
  {
    name: "Lead Generation",
    slug: "lead-generation",
    description: "Generate high-quality leads that convert with our comprehensive lead generation strategies. We combine content marketing, SEO, paid advertising, and automation to create a steady stream of qualified prospects for your business.",
    short_description: "Generate High-Quality Leads That Convert",
    category: "marketing",
    is_active: true,
    features: ["Multi-Channel Strategy", "Lead Qualification", "Content Marketing", "SEO Optimization", "Marketing Automation", "Performance Tracking"],
    benefits: ["High-quality prospects", "Steady lead flow", "Improved conversion rates", "Comprehensive tracking"],
    seo_title: "Lead Generation Services - Generate High-Quality Prospects",
    seo_description: "Comprehensive lead generation strategies combining content marketing, SEO, paid advertising, and automation for qualified prospects.",
    seo_keywords: ["lead generation", "prospect generation", "marketing automation", "content marketing", "SEO lead generation", "qualified leads"]
  },
  {
    name: "SEO & Local SEO",
    slug: "seo-geo",
    description: "Dominate local search results and improve your online visibility with our comprehensive SEO and local SEO services. We optimize your website, manage your local listings, and create content strategies that drive organic traffic and local customers.",
    short_description: "Dominate Local Search and Online Visibility",
    category: "seo",
    is_active: true,
    features: ["Local SEO Optimization", "Google My Business", "Citation Management", "Content Strategy", "Technical SEO", "Keyword Research"],
    benefits: ["Improved search rankings", "Increased local visibility", "Higher organic traffic", "More local customers"],
    seo_title: "SEO & Local SEO Services - Dominate Local Search Results",
    seo_description: "Comprehensive SEO and local SEO services to improve online visibility, dominate local search results, and drive organic traffic.",
    seo_keywords: ["SEO services", "local SEO", "search engine optimization", "Google My Business", "local search", "organic traffic"]
  },
  {
    name: "Podcasting Services",
    slug: "podcasting",
    description: "Launch and grow your podcast with our full-service podcasting solutions. From concept development to production, distribution, and promotion, we help you build a powerful podcast that engages your audience and grows your brand.",
    short_description: "Launch and Grow Your Podcast with Full-Service Solutions",
    category: "content",
    is_active: true,
    features: ["Podcast Strategy", "Production Services", "Audio Editing", "Distribution Setup", "Promotion Strategy", "Analytics Tracking"],
    benefits: ["Professional production", "Wide distribution reach", "Audience engagement", "Brand growth"],
    seo_title: "Podcasting Services - Launch and Grow Your Podcast",
    seo_description: "Full-service podcasting solutions from concept to promotion. Professional production, distribution, and growth strategies for your podcast.",
    seo_keywords: ["podcasting services", "podcast production", "podcast launch", "audio editing", "podcast distribution", "podcast growth"]
  },
  {
    name: "Social Media Marketing",
    slug: "social-media",
    description: "Build your brand and engage your audience with strategic social media marketing. We create compelling content, manage your social media presence, and implement strategies that drive engagement, followers, and conversions across all major platforms.",
    short_description: "Build Your Brand and Engage Your Audience",
    category: "marketing",
    is_active: true,
    features: ["Content Creation", "Social Media Management", "Community Engagement", "Influencer Partnerships", "Social Advertising", "Analytics & Reporting"],
    benefits: ["Increased brand awareness", "Higher engagement rates", "Follower growth", "Improved conversions"],
    seo_title: "Social Media Marketing - Build Your Brand and Engage Audiences",
    seo_description: "Strategic social media marketing with compelling content creation, management, and engagement strategies across all major platforms.",
    seo_keywords: ["social media marketing", "social media management", "content creation", "social media strategy", "brand engagement", "social advertising"]
  }
]

// Case Studies from work pages
const caseStudies = [
  {
    title: "Granite Paving Digital Growth Platform",
    slug: "granite-paving",
    client_name: "Granite Paving",
    industry: "Construction & Landscaping",
    project_type: "Web Development, Digital Marketing, Content",
    summary: "Built a comprehensive digital platform that transformed Granite Paving from a local contractor to a regional leader in paving and landscaping services.",
    challenge: "Limited online presence, manual project management, and difficulty showcasing completed work were restricting business growth and market reach.",
    solution: "Created a full digital ecosystem including a showcase website, project management tools, and automated lead generation system with portfolio integration.",
    results: "Achieved 380% increase in lead generation, 65% reduction in project timeline, 250% expansion in service area, and 98% client satisfaction rate.",
    metrics: {
      "Lead Generation": "+380%",
      "Project Timeline": "-65%",
      "Service Area": "+250%",
      "Client Satisfaction": "98%"
    },
    services_provided: ["Showcase Website", "Project Management", "Lead Generation"],
    technologies_used: ["Web Development", "CRM Integration", "Project Management Tools"],
    timeline_months: 6,
    featured_image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=2070&auto=format&fit=crop",
    testimonial_quote: "Our business has grown exponentially since launching the new platform. The project showcases are incredible.",
    testimonial_author: "Granite Paving",
    is_featured: true,
    is_published: true,
    display_order: 1,
    seo_title: "Granite Paving Case Study - Digital Growth Platform Success",
    seo_description: "How we helped Granite Paving achieve 380% lead generation increase through comprehensive digital platform development.",
    seo_keywords: ["granite paving", "digital marketing case study", "construction marketing", "lead generation", "web development"]
  }
]

// Site Settings
const siteSettings = [
  {
    key: "site_title",
    value: "Disruptors AI Marketing Hub",
    category: "general",
    description: "Main site title",
    is_public: true
  },
  {
    key: "site_description",
    value: "Transform your marketing with AI-powered strategies and innovative solutions",
    category: "general",
    description: "Site meta description",
    is_public: true
  },
  {
    key: "contact_email",
    value: "hello@disruptorsmedia.com",
    category: "contact",
    description: "Main contact email",
    is_public: true
  },
  {
    key: "contact_phone",
    value: "+1 (555) 123-4567",
    category: "contact",
    description: "Main contact phone",
    is_public: true
  },
  {
    key: "social_links",
    value: {
      linkedin: "https://linkedin.com/company/disruptors-media",
      twitter: "https://twitter.com/disruptorsmedia"
    },
    category: "social",
    description: "Social media links",
    is_public: true
  },
  {
    key: "analytics_enabled",
    value: true,
    category: "analytics",
    description: "Enable analytics tracking",
    is_public: false
  },
  {
    key: "maintenance_mode",
    value: false,
    category: "system",
    description: "Enable maintenance mode",
    is_public: false
  }
]

// Sample testimonials (these would need to be extracted from components)
const testimonials = [
  {
    quote: "Working with Disruptors Media has transformed our marketing approach. Their AI automation solutions have saved us countless hours while dramatically improving our lead quality.",
    author_name: "John Smith",
    author_position: "CEO",
    author_company: "TechStart Solutions",
    rating: 5,
    is_featured: true,
    is_published: true,
    display_order: 1,
    source: "website"
  },
  {
    quote: "The fractional CMO service provided the strategic leadership we needed without the overhead. Our marketing ROI has increased by 300% in just 6 months.",
    author_name: "Sarah Johnson",
    author_position: "Founder",
    author_company: "Growth Dynamics",
    rating: 5,
    is_featured: true,
    is_published: true,
    display_order: 2,
    source: "website"
  }
]

// Sample blog posts/resources
const posts = [
  {
    title: "The Future of AI in Marketing: 2025 Trends and Predictions",
    slug: "future-ai-marketing-2025",
    excerpt: "Explore the latest AI marketing trends and predictions for 2025, including automation tools, personalization strategies, and emerging technologies.",
    content: "Content would be extracted from actual blog posts...",
    content_type: "blog",
    category: "AI Marketing",
    tags: ["AI", "Marketing", "Automation", "Trends", "2025"],
    read_time_minutes: 8,
    is_featured: true,
    is_published: true,
    published_at: new Date().toISOString(),
    seo_title: "Future of AI in Marketing 2025 - Trends and Predictions",
    seo_description: "Discover the latest AI marketing trends and predictions for 2025. Learn about automation tools, personalization strategies, and emerging technologies.",
    seo_keywords: ["AI marketing", "marketing automation", "2025 trends", "artificial intelligence", "marketing technology"]
  }
]

// Function to generate SQL insert statements
function generateSQL() {
  let sql = "-- Generated SQL for Disruptors AI Marketing Hub Content\n\n";

  // Team Members
  sql += "-- Team Members\n";
  teamMembers.forEach(member => {
    sql += `INSERT INTO public.team_members (name, title, bio, headshot, social_links, is_active, display_order) VALUES\n`;
    sql += `('${member.name.replace(/'/g, "''")}', '${member.title.replace(/'/g, "''")}', '${member.bio.replace(/'/g, "''")}', '${member.headshot}', '${JSON.stringify(member.social_links)}', ${member.is_active}, ${member.display_order})\n`;
    sql += `ON CONFLICT (name) DO UPDATE SET\n`;
    sql += `title = EXCLUDED.title, bio = EXCLUDED.bio, headshot = EXCLUDED.headshot, social_links = EXCLUDED.social_links;\n\n`;
  });

  // Services
  sql += "-- Services\n";
  services.forEach(service => {
    sql += `INSERT INTO public.services (name, slug, description, short_description, category, featured_image, is_active, features, benefits, seo_title, seo_description, seo_keywords) VALUES\n`;
    sql += `('${service.name.replace(/'/g, "''")}', '${service.slug}', '${service.description.replace(/'/g, "''")}', '${service.short_description.replace(/'/g, "''")}', '${service.category}', '${service.featured_image || ''}', ${service.is_active}, '{${service.features.map(f => `"${f}"`).join(',')}}', '{${service.benefits.map(b => `"${b}"`).join(',')}}', '${service.seo_title.replace(/'/g, "''")}', '${service.seo_description.replace(/'/g, "''")}', '{${service.seo_keywords.map(k => `"${k}"`).join(',')}}')\n`;
    sql += `ON CONFLICT (slug) DO UPDATE SET\n`;
    sql += `name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description;\n\n`;
  });

  // Case Studies
  sql += "-- Case Studies\n";
  caseStudies.forEach(study => {
    sql += `INSERT INTO public.case_studies (title, slug, client_name, industry, project_type, summary, challenge, solution, results, metrics, services_provided, technologies_used, timeline_months, featured_image, testimonial_quote, testimonial_author, is_featured, is_published, display_order, seo_title, seo_description, seo_keywords) VALUES\n`;
    sql += `('${study.title.replace(/'/g, "''")}', '${study.slug}', '${study.client_name.replace(/'/g, "''")}', '${study.industry}', '${study.project_type}', '${study.summary.replace(/'/g, "''")}', '${study.challenge.replace(/'/g, "''")}', '${study.solution.replace(/'/g, "''")}', '${study.results.replace(/'/g, "''")}', '${JSON.stringify(study.metrics)}', '{${study.services_provided.map(s => `"${s}"`).join(',')}}', '{${study.technologies_used.map(t => `"${t}"`).join(',')}}', ${study.timeline_months}, '${study.featured_image}', '${study.testimonial_quote.replace(/'/g, "''")}', '${study.testimonial_author}', ${study.is_featured}, ${study.is_published}, ${study.display_order}, '${study.seo_title.replace(/'/g, "''")}', '${study.seo_description.replace(/'/g, "''")}', '{${study.seo_keywords.map(k => `"${k}"`).join(',')}}')\n`;
    sql += `ON CONFLICT (slug) DO UPDATE SET\n`;
    sql += `title = EXCLUDED.title, summary = EXCLUDED.summary;\n\n`;
  });

  return sql;
}

// Generate JSON data for easy import
function generateJSON() {
  return {
    team_members: teamMembers,
    services: services,
    case_studies: caseStudies,
    settings: siteSettings,
    testimonials: testimonials,
    posts: posts,
    extraction_date: new Date().toISOString(),
    total_records: teamMembers.length + services.length + caseStudies.length + siteSettings.length + testimonials.length + posts.length
  };
}

// Export data
async function exportData() {
  try {
    const jsonData = generateJSON();
    const sqlData = generateSQL();

    // Write JSON file
    await fs.writeFile('extracted-content.json', JSON.stringify(jsonData, null, 2));
    console.log('✅ JSON data exported to extracted-content.json');

    // Write SQL file
    await fs.writeFile('extracted-content.sql', sqlData);
    console.log('✅ SQL data exported to extracted-content.sql');

    // Generate summary
    console.log('\n📊 Content Extraction Summary:');
    console.log(`- Team Members: ${teamMembers.length}`);
    console.log(`- Services: ${services.length}`);
    console.log(`- Case Studies: ${caseStudies.length}`);
    console.log(`- Settings: ${siteSettings.length}`);
    console.log(`- Testimonials: ${testimonials.length}`);
    console.log(`- Posts: ${posts.length}`);
    console.log(`- Total Records: ${jsonData.total_records}`);

  } catch (error) {
    console.error('❌ Error exporting data:', error);
  }
}

// Run the export
exportData();