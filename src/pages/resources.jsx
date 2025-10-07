import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  MessageSquare,
  Users,
  TrendingUp,
  BarChart3,
  Zap,
  FileText,
  Image,
  Calendar,
  Mail,
  Target,
  Gauge,
  Search,
  Video,
  Mic,
  PenTool,
  Share2,
  Database,
  Settings,
  Sparkles
} from 'lucide-react';
import ResourceCard from '@/components/shared/ResourceCard';
import WaitlistModal from '@/components/shared/WaitlistModal';

// Tool categories and data
const TOOL_CATEGORIES = [
  {
    id: 'ai-tools',
    name: 'AI Tools',
    description: 'Intelligent automation and content generation',
    tools: [
      {
        title: 'AI Content Writer',
        description: 'Generate high-quality blog posts, articles, and marketing copy in seconds with AI-powered writing assistance.',
        category: 'AI Tools',
        icon: PenTool,
        image: '/images/resource-icons/ai-content-writer.png',
      },
      {
        title: 'AI Image Generator',
        description: 'Create stunning visuals and graphics using advanced AI image generation technology tailored to your brand.',
        category: 'AI Tools',
        icon: Image,
        image: '/images/resource-icons/ai-image-generator.png',
      },
      {
        title: 'AI Chatbot Builder',
        description: 'Build intelligent customer service chatbots that understand context and provide personalized responses.',
        category: 'AI Tools',
        icon: MessageSquare,
        image: '/images/resource-icons/chatbot-builder.png',
      },
      {
        title: 'AI Video Generator',
        description: 'Transform scripts into professional videos with AI-generated visuals, voiceovers, and editing.',
        category: 'AI Tools',
        icon: Video,
        image: '/images/resource-icons/video-generator.png',
      },
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    description: 'Tools to scale your marketing efforts',
    tools: [
      {
        title: 'Growth Audit Tool',
        description: 'Get instant AI-powered analysis of your website with actionable growth opportunities and competitor insights.',
        category: 'Marketing',
        icon: TrendingUp,
        image: '/images/resource-icons/growth-audit-tool.png',
      },
      {
        title: 'SEO Optimizer',
        description: 'Optimize your content for search engines with keyword research, on-page SEO, and competitive analysis.',
        category: 'Marketing',
        icon: Search,
        image: '/images/resource-icons/seo-optimizer.png',
      },
      {
        title: 'Social Media Manager',
        description: 'Schedule, publish, and analyze social media content across all major platforms from one dashboard.',
        category: 'Marketing',
        icon: Share2,
        image: '/images/resource-icons/social-media-manager.png',
      },
      {
        title: 'Email Campaign Builder',
        description: 'Design, automate, and track email marketing campaigns with advanced segmentation and analytics.',
        category: 'Marketing',
        icon: Mail,
        image: '/images/resource-icons/email-campaign-builder.png',
      },
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Insights',
    description: 'Data-driven decision making tools',
    tools: [
      {
        title: 'Analytics Dashboard',
        description: 'Unified dashboard showing real-time metrics across all your marketing channels and business operations.',
        category: 'Analytics',
        icon: BarChart3,
        image: '/images/resource-icons/analytics-dashboard.png',
      },
      {
        title: 'Conversion Tracker',
        description: 'Track conversions, attribution, and customer journeys with pixel-perfect accuracy and AI insights.',
        category: 'Analytics',
        icon: Target,
        image: '/images/resource-icons/conversion-tracker.png',
      },
      {
        title: 'Performance Monitor',
        description: 'Monitor website performance, uptime, and user experience with real-time alerts and recommendations.',
        category: 'Analytics',
        icon: Gauge,
        image: '/images/resource-icons/performance-monitor.png',
      },
      {
        title: 'Audience Intelligence',
        description: 'Deep insights into your audience demographics, behaviors, interests, and purchase patterns.',
        category: 'Analytics',
        icon: Users,
        image: '/images/resource-icons/audience-intelligence.png',
      },
    ]
  },
  {
    id: 'automation',
    name: 'Automation & Workflow',
    description: 'Streamline operations and save time',
    tools: [
      {
        title: 'Workflow Automation',
        description: 'Create custom workflows that automate repetitive tasks across your marketing stack and tools.',
        category: 'Automation',
        icon: Zap,
        image: '/images/resource-icons/workflow-automation.png',
      },
      {
        title: 'Lead Scoring Engine',
        description: 'Automatically score and prioritize leads based on behavior, engagement, and conversion probability.',
        category: 'Automation',
        icon: Brain,
        image: '/images/resource-icons/lead-scoring-engine.png',
      },
      {
        title: 'Content Calendar',
        description: 'Plan, schedule, and manage all your content across channels with AI-powered optimization suggestions.',
        category: 'Automation',
        icon: Calendar,
        image: '/images/resource-icons/content-calendar.png',
      },
      {
        title: 'Integration Hub',
        description: 'Connect all your tools and platforms with pre-built integrations and custom API connections.',
        category: 'Automation',
        icon: Settings,
        image: '/images/resource-icons/integration-hub.png',
      },
    ]
  },
  {
    id: 'content',
    name: 'Content Creation',
    description: 'Create compelling content at scale',
    tools: [
      {
        title: 'Podcast Studio',
        description: 'Record, edit, and publish podcasts with AI transcription, show notes, and audiogram generation.',
        category: 'Content',
        icon: Mic,
        image: '/images/resource-icons/podcast-studio.png',
      },
      {
        title: 'Report Generator',
        description: 'Generate professional reports and presentations with data visualization and custom branding.',
        category: 'Content',
        icon: FileText,
        image: '/images/resource-icons/report-generator.png',
      },
      {
        title: 'Brand Asset Library',
        description: 'Centralized library for all brand assets with AI-powered tagging, search, and version control.',
        category: 'Content',
        icon: Database,
        image: '/images/resource-icons/brand-asset-library.png',
      },
    ]
  }
];

export default function Resources() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTool(null), 300);
  };

  return (
    <div className="min-h-screen relative">
      {/* Full Screen Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759352555/airis_lk5i30.mp4"
        />
        {/* Black overlay with 95% opacity (5% transparency) */}
        <div className="absolute inset-0 bg-black/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="text-white py-20 sm:py-24 lg:py-32 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center mb-8">
                <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-[#FFD700]" strokeWidth={1.5} />
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight">
                AI Marketing Tools
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Everything you need to grow your business with AI-powered tools, analytics, and automation
              </p>
            </motion.div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-20 md:pb-32">
          {TOOL_CATEGORIES.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="mb-20 last:mb-0"
            >
              {/* Category Header */}
              <div className="mb-10 text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                  {category.name}
                </h2>
                <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              {/* Category Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.tools.map((tool, toolIndex) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: categoryIndex * 0.1 + toolIndex * 0.05 }}
                  >
                    <ResourceCard
                      {...tool}
                      onClick={() => handleToolClick(tool)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t-2 border-[#FFD700]/30 text-white py-16 px-4 mb-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
              More Tools Coming Soon
            </h3>
            <p className="text-lg md:text-xl text-gray-300 mb-8 font-light">
              We're constantly adding new AI-powered tools to help you grow. Join the waitlist to get early access.
            </p>
            <div className="inline-block px-6 py-3 border-2 border-[#FFD700] text-[#FFD700] font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-[#FFD700] hover:text-black transition-all duration-300 cursor-pointer">
              Join Waitlist
            </div>
          </div>
        </motion.div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        toolName={selectedTool?.title || 'this tool'}
      />
    </div>
  );
}
