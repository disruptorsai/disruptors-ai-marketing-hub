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
        image: null, // TODO: Add custom image
      },
      {
        title: 'AI Image Generator',
        description: 'Create stunning visuals and graphics using advanced AI image generation technology tailored to your brand.',
        category: 'AI Tools',
        icon: Image,
        image: null,
      },
      {
        title: 'AI Chatbot Builder',
        description: 'Build intelligent customer service chatbots that understand context and provide personalized responses.',
        category: 'AI Tools',
        icon: MessageSquare,
        image: null,
      },
      {
        title: 'AI Video Generator',
        description: 'Transform scripts into professional videos with AI-generated visuals, voiceovers, and editing.',
        category: 'AI Tools',
        icon: Video,
        image: null,
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
        image: null,
      },
      {
        title: 'SEO Optimizer',
        description: 'Optimize your content for search engines with keyword research, on-page SEO, and competitive analysis.',
        category: 'Marketing',
        icon: Search,
        image: null,
      },
      {
        title: 'Social Media Manager',
        description: 'Schedule, publish, and analyze social media content across all major platforms from one dashboard.',
        category: 'Marketing',
        icon: Share2,
        image: null,
      },
      {
        title: 'Email Campaign Builder',
        description: 'Design, automate, and track email marketing campaigns with advanced segmentation and analytics.',
        category: 'Marketing',
        icon: Mail,
        image: null,
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
        image: null,
      },
      {
        title: 'Conversion Tracker',
        description: 'Track conversions, attribution, and customer journeys with pixel-perfect accuracy and AI insights.',
        category: 'Analytics',
        icon: Target,
        image: null,
      },
      {
        title: 'Performance Monitor',
        description: 'Monitor website performance, uptime, and user experience with real-time alerts and recommendations.',
        category: 'Analytics',
        icon: Gauge,
        image: null,
      },
      {
        title: 'Audience Intelligence',
        description: 'Deep insights into your audience demographics, behaviors, interests, and purchase patterns.',
        category: 'Analytics',
        icon: Users,
        image: null,
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
        image: null,
      },
      {
        title: 'Lead Scoring Engine',
        description: 'Automatically score and prioritize leads based on behavior, engagement, and conversion probability.',
        category: 'Automation',
        icon: Brain,
        image: null,
      },
      {
        title: 'Content Calendar',
        description: 'Plan, schedule, and manage all your content across channels with AI-powered optimization suggestions.',
        category: 'Automation',
        icon: Calendar,
        image: null,
      },
      {
        title: 'Integration Hub',
        description: 'Connect all your tools and platforms with pre-built integrations and custom API connections.',
        category: 'Automation',
        icon: Settings,
        image: null,
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
        image: null,
      },
      {
        title: 'Report Generator',
        description: 'Generate professional reports and presentations with data visualization and custom branding.',
        category: 'Content',
        icon: FileText,
        image: null,
      },
      {
        title: 'Brand Asset Library',
        description: 'Centralized library for all brand assets with AI-powered tagging, search, and version control.',
        category: 'Content',
        icon: Database,
        image: null,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              AI Marketing Toolkit
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Everything you need to grow your business with AI-powered tools, analytics, and automation
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {TOOL_CATEGORIES.map((category, categoryIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            className="mb-16 last:mb-0"
          >
            {/* Category Header */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {category.name}
              </h2>
              <p className="text-lg text-gray-600">
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
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4 mb-16"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            More Tools Coming Soon
          </h3>
          <p className="text-lg text-blue-100 mb-6">
            We're constantly adding new AI-powered tools to help you grow. Join the waitlist to get early access.
          </p>
        </div>
      </motion.div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        toolName={selectedTool?.title || 'this tool'}
      />
    </div>
  );
}
