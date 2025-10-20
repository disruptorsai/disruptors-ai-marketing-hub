/**
 * Free Resources Page
 *
 * Public-facing page displaying all available lead magnet resources
 * with search, filtering, and categorization capabilities.
 *
 * URL: /free-resources
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Eye,
  Star,
  TrendingUp,
  Sparkles,
  Zap,
  FileText,
  Workflow,
  Brain,
  Target,
  ArrowRight,
} from 'lucide-react'
import * as leadMagnetAPI from '@/lib/lead-magnet-api'
import { toast } from 'sonner'

// Icon mapping for dynamic icons
const ICON_MAP = {
  Workflow: Workflow,
  Sparkles: Sparkles,
  Zap: Zap,
  FileText: FileText,
  Brain: Brain,
  Target: Target,
  Download: Download,
  Star: Star,
}

export default function FreeResources() {
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [filteredResources, setFilteredResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    filterAndSortResources()
  }, [resources, searchQuery, selectedCategory, sortBy])

  const loadResources = async () => {
    try {
      setLoading(true)
      const { data, error } = await leadMagnetAPI.getActiveResources()

      if (error) throw error

      setResources(data || [])

      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(r => r.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Failed to load resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortResources = () => {
    let filtered = [...resources]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (resource) =>
          resource.title?.toLowerCase().includes(query) ||
          resource.subtitle?.toLowerCase().includes(query) ||
          resource.description?.toLowerCase().includes(query) ||
          resource.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((resource) => resource.category === selectedCategory)
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'az':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    setFilteredResources(filtered)
  }

  const handleResourceClick = async (resource) => {
    // Track view
    await leadMagnetAPI.trackResourceView(resource.slug)

    // Navigate to lead magnet landing page
    navigate(`/l/${resource.slug}`)
  }

  const getIconComponent = (iconName) => {
    return ICON_MAP[iconName] || FileText
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50 animate-pulse">Loading resources...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
              <Star size={16} />
              <span>Free Resources</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Marketing Resources
              <br />
              That Actually Work
            </h1>

            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Download proven templates, workflows, and guides to accelerate your marketing—no fluff, just results.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-12"
          >
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                All Resources
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/30" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500/50 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="az">A-Z</option>
              </select>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="text-white/50 text-sm mb-6">
            Showing {filteredResources.length} of {resources.length} resources
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-white/30 mb-4">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">No resources found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  index={index}
                  onClick={() => handleResourceClick(resource)}
                  getIconComponent={getIconComponent}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold mb-4">Want More?</h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              These resources are just the beginning. Get access to our full AI-powered marketing platform and automate your entire content workflow.
            </p>
            <button
              onClick={() => navigate('/app')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all inline-flex items-center gap-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// Resource Card Component
function ResourceCard({ resource, index, onClick, getIconComponent }) {
  const IconComponent = getIconComponent(resource.icon_name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      onClick={onClick}
      className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${resource.icon_color} p-3 bg-white/5 rounded-lg group-hover:scale-110 transition-transform`}>
          <IconComponent size={24} />
        </div>

        <div className="flex items-center gap-3 text-white/30 text-sm">
          {resource.is_featured && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={14} fill="currentColor" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <Download size={14} />
            <span>{resource.download_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {resource.title}
      </h3>

      <p className="text-white/70 text-sm mb-4 line-clamp-2">
        {resource.subtitle}
      </p>

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/5 text-white/50 text-xs rounded-full">
              +{resource.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* What's Inside Preview */}
      {resource.whats_inside && resource.whats_inside.length > 0 && (
        <div className="mb-4 space-y-1">
          {resource.whats_inside.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-white/50 text-sm">
              <span className="text-blue-400 mt-1">•</span>
              <span className="line-clamp-1">{item}</span>
            </div>
          ))}
          {resource.whats_inside.length > 2 && (
            <div className="text-white/30 text-xs">
              +{resource.whats_inside.length - 2} more
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <span className="capitalize">{resource.file_type}</span>
          {resource.file_size && (
            <>
              <span>•</span>
              <span>{resource.file_size}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
          <span>Download</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  )
}
