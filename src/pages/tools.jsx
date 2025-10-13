import { Link } from 'react-router-dom';
import { Brain, FileText, Calculator, TrendingUp } from 'lucide-react';

/**
 * Tools Landing Page
 *
 * Central hub for all AI-powered tools and applications
 */
export default function Tools() {
  const tools = [
    {
      id: 'business-brain-manager',
      title: 'Business Brain Manager',
      description: 'View, edit, and train your AI business knowledge base. Manage facts, brand voice, and integrations.',
      icon: Brain,
      path: '/app/business-brain',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Dashboard & Health Metrics',
        'Knowledge Explorer',
        'Brand Voice Editor',
        'AI Onboarding',
        'Integrations Hub'
      ],
      status: 'live'
    },
    {
      id: 'ai-content-writer',
      title: 'AI Content Writer',
      description: 'Generate SEO-optimized blog articles and titles powered by your Business Brain.',
      icon: FileText,
      path: '/app/content-writer',
      color: 'from-purple-500 to-purple-600',
      features: [
        'AI Title Generator',
        'Article Generator',
        'ReactQuill Editor',
        'Auto-Markdown Conversion',
        'Content Library'
      ],
      status: 'live'
    },
    {
      id: 'calculator',
      title: 'ROI Calculator',
      description: 'Calculate the return on investment for your marketing initiatives.',
      icon: Calculator,
      path: '/calculator',
      color: 'from-green-500 to-green-600',
      features: [
        'Marketing ROI',
        'Custom Metrics',
        'Visual Reports'
      ],
      status: 'live'
    },
    {
      id: 'growth-audit',
      title: 'Growth Audit',
      description: 'Get AI-powered website analysis with actionable growth opportunities.',
      icon: TrendingUp,
      path: '/demos/growth-audit',
      color: 'from-orange-500 to-orange-600',
      features: [
        'Website Scraping',
        'SEO Analysis',
        'Opportunity Detection',
        'Brand Detection'
      ],
      status: 'live'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leverage cutting-edge AI to supercharge your marketing, content creation, and business intelligence.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${tool.color} h-32 flex items-center justify-center relative`}>
                  <Icon className="w-16 h-16 text-white opacity-90" />

                  {/* Status Badge */}
                  {tool.status === 'live' && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                      LIVE
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {tool.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                    Launch Tool
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-2xl transition-colors pointer-events-none" />
              </Link>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              'Social Media Generator',
              'Email Campaign Writer',
              'Video Script Writer',
              'Ad Copy Generator',
              'Landing Page Builder',
              'SEO Content Optimizer'
            ].map((tool) => (
              <div key={tool} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3" />
                <span className="text-gray-700">{tool}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 mt-6 text-sm">
            More AI-powered tools are in development. Check back soon for updates!
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Start using our AI tools to accelerate your business growth today.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
