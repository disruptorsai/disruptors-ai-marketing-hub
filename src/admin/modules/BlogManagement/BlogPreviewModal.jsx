/**
 * Blog Preview Modal
 * Shows full preview of blog content with SEO preview
 */

import React from 'react'
import { X, ExternalLink, Eye, FileText } from 'lucide-react'

export default function BlogPreviewModal({ blog, onClose }) {
  if (!blog) return null

  const renderContent = () => {
    if (!blog.content) return <div className="text-green-500/50 italic">No content generated yet</div>

    // Check if content is HTML or Markdown
    const isHtml = blog.content.includes('<') && blog.content.includes('>')

    if (isHtml) {
      return (
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      )
    } else {
      return (
        <pre className="whitespace-pre-wrap text-green-400 text-sm">
          {blog.content}
        </pre>
      )
    }
  }

  // Google SERP Preview
  const SERPPreview = () => (
    <div className="bg-gray-800 border border-green-500/20 p-6 rounded">
      <div className="text-green-500/50 text-xs mb-4 uppercase">Google SERP Preview</div>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="text-green-400 flex-1">
            <div className="text-xs text-green-500/50 mb-1">
              https://dm4.wjwelsh.com/blog/{blog.slug || 'blog-post'}
            </div>
            <div className="text-blue-400 text-lg hover:underline cursor-pointer">
              {blog.seo_title || blog.title}
            </div>
          </div>
        </div>
        <div className="text-green-500/70 text-sm">
          {blog.seo_description || blog.excerpt || 'No meta description set'}
        </div>
        {blog.keywords && blog.keywords.length > 0 && (
          <div className="flex gap-2 mt-3">
            {blog.keywords.slice(0, 3).map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs">
                {kw.keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-500/30 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-green-500/30 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-400 mb-1">BLOG_PREVIEW</h2>
            <p className="text-green-500/50 text-sm">{blog.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SEO Preview */}
          <SERPPreview />

          {/* Blog Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 border border-green-500/20 p-4">
              <div className="text-green-500/50 text-xs mb-1">Status</div>
              <div className="text-green-400 text-sm">{blog.approval_status?.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div className="bg-gray-800 border border-green-500/20 p-4">
              <div className="text-green-500/50 text-xs mb-1">Read Time</div>
              <div className="text-green-400 text-sm">{blog.read_time_minutes || 'N/A'} min</div>
            </div>
            <div className="bg-gray-800 border border-green-500/20 p-4">
              <div className="text-green-500/50 text-xs mb-1">Category</div>
              <div className="text-green-400 text-sm">{blog.category || 'Uncategorized'}</div>
            </div>
            <div className="bg-gray-800 border border-green-500/20 p-4">
              <div className="text-green-500/50 text-xs mb-1">Images</div>
              <div className="text-green-400 text-sm">{blog.image_count || 0}/3</div>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featured_image && (
            <div className="bg-gray-800 border border-green-500/20 p-4">
              <div className="text-green-500/50 text-xs mb-2">Featured Image</div>
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full max-h-96 object-cover border border-green-500/30"
              />
            </div>
          )}

          {/* Content */}
          <div className="bg-gray-800 border border-green-500/20 p-6">
            <div className="text-green-500/50 text-xs mb-4 uppercase flex items-center gap-2">
              <FileText size={14} />
              Blog Content
            </div>
            {renderContent()}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="bg-gray-800 border border-green-500/20 p-4">
              <div className="text-green-500/50 text-xs mb-2">Tags</div>
              <div className="flex gap-2 flex-wrap">
                {blog.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-green-500/30 flex justify-between">
          <a
            href={`/blog-detail?slug=${blog.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <ExternalLink size={16} />
            VIEW_LIVE
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}
