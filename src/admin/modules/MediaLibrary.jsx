/**
 * Media Library Module
 * Manages YOUR site_media with AI generation capabilities
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../api/auth'
import { Image, Video, File, Bot, Tag, Search, Upload } from 'lucide-react'

export default function MediaLibrary() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAI, setFilterAI] = useState('all')

  useEffect(() => {
    loadMedia()
  }, [filterType, filterAI])

  const loadMedia = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('site_media')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterType !== 'all') {
        query = query.eq('media_type', filterType)
      }

      if (filterAI === 'ai') {
        query = query.eq('ai_generated', true)
      } else if (filterAI === 'manual') {
        query = query.eq('ai_generated', false)
      }

      const { data, error } = await query

      if (error) throw error

      setMedia(data || [])
    } catch (error) {
      console.error('Failed to load media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery) {
      loadMedia()
      return
    }

    try {
      const { data, error } = await supabase
        .from('site_media')
        .select('*')
        .or(`alt_text.ilike.%${searchQuery}%,caption.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      setMedia(data || [])
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const getMediaIcon = (type) => {
    if (type?.includes('image')) return <Image size={16} />
    if (type?.includes('video')) return <Video size={16} />
    return <File size={16} />
  }

  const stats = {
    total: media.length,
    ai_generated: media.filter(m => m.ai_generated).length,
    images: media.filter(m => m.media_type?.includes('image')).length,
    videos: media.filter(m => m.media_type?.includes('video')).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-green-500 animate-pulse">LOADING_MEDIA...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-400">MEDIA_LIBRARY</h1>
          <p className="text-green-500/70 text-sm mt-1">
            Manage existing media and generate new assets with AI
          </p>
        </div>

        <button
          onClick={() => alert('AI media generation coming soon!')}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors"
        >
          <Bot size={16} />
          GENERATE_WITH_AI
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs mb-1">TOTAL_ASSETS</div>
          <div className="text-2xl text-green-400">{stats.total}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs mb-1">AI_GENERATED</div>
          <div className="text-2xl text-green-400">{stats.ai_generated}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs mb-1">IMAGES</div>
          <div className="text-2xl text-green-400">{stats.images}</div>
        </div>
        <div className="bg-gray-900 border border-green-500/30 p-4">
          <div className="text-green-500/70 text-xs mb-1">VIDEOS</div>
          <div className="text-2xl text-green-400">{stats.videos}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 border text-sm ${
              filterType === 'all'
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-gray-900 text-green-500 border-green-500/30'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-2 border text-sm ${
              filterType === 'image'
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-gray-900 text-green-500 border-green-500/30'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-2 border text-sm ${
              filterType === 'video'
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-gray-900 text-green-500 border-green-500/30'
            }`}
          >
            Videos
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterAI('all')}
            className={`px-3 py-2 border text-sm ${
              filterAI === 'all'
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-gray-900 text-green-500 border-green-500/30'
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setFilterAI('ai')}
            className={`px-3 py-2 border text-sm ${
              filterAI === 'ai'
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-gray-900 text-green-500 border-green-500/30'
            }`}
          >
            AI Generated
          </button>
          <button
            onClick={() => setFilterAI('manual')}
            className={`px-3 py-2 border text-sm ${
              filterAI === 'manual'
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-gray-900 text-green-500 border-green-500/30'
            }`}
          >
            Manual Upload
          </button>
        </div>

        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by alt text, caption, tags..."
            className="flex-1 bg-black border border-green-500/30 text-green-400 px-4 py-2 focus:border-green-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-500/10 border border-green-500/30 hover:bg-green-500 hover:text-black transition-colors"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-4 gap-4">
        {media.length === 0 ? (
          <div className="col-span-4 p-12 text-center text-green-500/50 bg-gray-900 border border-green-500/30">
            No media found. Upload or generate some assets!
          </div>
        ) : (
          media.map(item => (
            <div
              key={item.id}
              className="bg-gray-900 border border-green-500/30 hover:border-green-500 transition-colors overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-black relative overflow-hidden">
                {item.media_type?.includes('image') && item.media_url ? (
                  <img
                    src={item.media_url}
                    alt={item.alt_text || 'Media item'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-green-500/30">
                    {getMediaIcon(item.media_type)}
                  </div>
                )}

                {/* AI Badge */}
                {item.ai_generated && (
                  <div className="absolute top-2 right-2 bg-green-500 text-black px-2 py-1 text-xs flex items-center gap-1">
                    <Bot size={12} />
                    AI
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => window.open(item.media_url, '_blank')}
                    className="px-4 py-2 bg-green-500 text-black hover:bg-green-400 transition-colors"
                  >
                    VIEW
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="text-green-400 text-sm truncate">
                  {item.alt_text || item.caption || 'Untitled'}
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-green-500/70 bg-green-500/10 px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Generation info */}
                {item.agent_name && (
                  <div className="text-xs text-green-500/50 mt-2">
                    Generated by: {item.agent_name}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
