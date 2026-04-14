import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        image: '/images/resource-icons/ai-content-writer.webp',
        route: '/app/content-writer',
        isLive: true,
      },
      {
        title: 'AI Image Generator',
        description: 'Create stunning visuals and graphics using advanced AI image generation technology tailored to your brand.',
        category: 'AI Tools',
        icon: Image,
        image: '/images/resource-icons/ai-image-generator.webp',
      },
      {
        title: 'AI Chatbot Builder',
        description: 'Build intelligent customer service chatbots that understand context and provide personalized responses.',
        category: 'AI Tools',
        icon: MessageSquare,
        image: '/images/resource-icons/chatbot-builder.webp',
      },
      {
        title: 'AI Video Generator',
        description: 'Transform scripts into professional videos with AI-generated visuals, voiceovers, and editing.',
        category: 'AI Tools',
        icon: Video,
        image: '/images/resource-icons/video-generator.webp',
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
        image: '/images/resource-icons/growth-audit-tool.webp',
        route: '/demos/growth-audit',
        isLive: true,
      },
      {
        title: 'SEO Optimizer',
        description: 'Optimize your content for search engines with keyword research, on-page SEO, and competitive analysis.',
        category: 'Marketing',
        icon: Search,
        image: '/images/resource-icons/seo-optimizer.webp',
      },
      {
        title: 'Social Media Manager',
        description: 'Schedule, publish, and analyze social media content across all major platforms from one dashboard.',
        category: 'Marketing',
        icon: Share2,
        image: '/images/resource-icons/social-media-manager.webp',
      },
      {
        title: 'Email Campaign Builder',
        description: 'Design, automate, and track email marketing campaigns with advanced segmentation and analytics.',
        category: 'Marketing',
        icon: Mail,
        image: '/images/resource-icons/email-campaign-builder.webp',
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
        image: '/images/resource-icons/analytics-dashboard.webp',
      },
      {
        title: 'Conversion Tracker',
        description: 'Track conversions, attribution, and customer journeys with pixel-perfect accuracy and AI insights.',
        category: 'Analytics',
        icon: Target,
        image: '/images/resource-icons/conversion-tracker.webp',
      },
      {
        title: 'Performance Monitor',
        description: 'Monitor website performance, uptime, and user experience with real-time alerts and recommendations.',
        category: 'Analytics',
        icon: Gauge,
        image: '/images/resource-icons/performance-monitor.webp',
      },
      {
        title: 'Audience Intelligence',
        description: 'Deep insights into your audience demographics, behaviors, interests, and purchase patterns.',
        category: 'Analytics',
        icon: Users,
        image: '/images/resource-icons/audience-intelligence.webp',
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
        image: '/images/resource-icons/workflow-automation.webp',
      },
      {
        title: 'Lead Scoring Engine',
        description: 'Automatically score and prioritize leads based on behavior, engagement, and conversion probability.',
        category: 'Automation',
        icon: Brain,
        image: '/images/resource-icons/lead-scoring-engine.webp',
      },
      {
        title: 'Content Calendar',
        description: 'Plan, schedule, and manage all your content across channels with AI-powered optimization suggestions.',
        category: 'Automation',
        icon: Calendar,
        image: '/images/resource-icons/content-calendar.webp',
      },
      {
        title: 'Integration Hub',
        description: 'Connect all your tools and platforms with pre-built integrations and custom API connections.',
        category: 'Automation',
        icon: Settings,
        image: '/images/resource-icons/integration-hub.webp',
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
        image: '/images/resource-icons/podcast-studio.webp',
      },
      {
        title: 'Report Generator',
        description: 'Generate professional reports and presentations with data visualization and custom branding.',
        category: 'Content',
        icon: FileText,
        image: '/images/resource-icons/report-generator.webp',
      },
      {
        title: 'Brand Asset Library',
        description: 'Centralized library for all brand assets with AI-powered tagging, search, and version control.',
        category: 'Content',
        icon: Database,
        image: '/images/resource-icons/brand-asset-library.webp',
      },
    ]
  }
];

export default function ResourcesDev() {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToolClick = (tool) => {
    // If tool has a route and is live, navigate to it
    if (tool.isLive && tool.route) {
      navigate(tool.route);
      return;
    }

    // Otherwise show waitlist modal
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTool(null), 300);
  };

  // Flatten all tools into single array
  const allTools = TOOL_CATEGORIES.flatMap(category => category.tools);

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
        {/* Black overlay with 80% opacity (20% transparency) */}
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="text-white py-16 sm:py-20 lg:py-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
                AI Marketing Tools
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Everything you need to grow your business with AI-powered tools, analytics, and automation
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bento Grid - All Apps */}
        <div className="max-w-7xl mx-auto px-4 pb-20 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12 md:gap-16"
          >
            {allTools.map((tool, toolIndex) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: toolIndex * 0.03 }}
              >
                <ResourceCard
                  {...tool}
                  onClick={() => handleToolClick(tool)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
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
