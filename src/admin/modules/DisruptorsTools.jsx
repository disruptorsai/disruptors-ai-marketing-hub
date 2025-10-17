/**
 * Disruptors Tools Module
 * Internal tools and utilities for Disruptors AI team
 */

import React from 'react'
import {
  Wrench,
  Presentation,
  ExternalLink
} from 'lucide-react'

export default function DisruptorsTools() {
  const tools = [
    {
      id: 'ai-pitch-deck',
      name: 'AI Pitch Deck',
      description: 'AI-powered pitch deck generator',
      icon: Presentation,
      link: 'https://pitch.disruptorsmedia.com',
      color: 'blue',
      size: 'large' // Bento grid size
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-500/50',
      purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/50',
      yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-500/50',
      green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-500/50',
      red: 'from-red-500/20 to-orange-500/20 border-red-500/30 hover:border-red-500/50',
      cyan: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 hover:border-cyan-500/50'
    }
    return colors[color] || colors.blue
  }

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      yellow: 'text-yellow-400',
      green: 'text-green-400',
      red: 'text-red-400',
      cyan: 'text-cyan-400'
    }
    return colors[color] || 'text-blue-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Wrench className="text-blue-400" size={28} />
            Disruptors Tools
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Internal utilities and external tools for the Disruptors AI team
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
        {tools.map((tool) => {
          const Icon = tool.icon
          const sizeClasses = tool.size === 'large'
            ? 'md:col-span-2 md:row-span-2'
            : tool.size === 'wide'
            ? 'md:col-span-2'
            : tool.size === 'tall'
            ? 'md:row-span-2'
            : ''

          return (
            <a
              key={tool.id}
              href={tool.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl transition-all hover:shadow-xl hover:shadow-blue-500/10 ${sizeClasses} overflow-hidden`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(tool.color)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative h-full p-6 flex flex-col justify-between">
                {/* Icon and Title */}
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses(tool.color)} border border-slate-700/50 w-fit`}>
                    <Icon size={32} className={getIconColor(tool.color)} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2 group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* External link indicator */}
                <div className="flex items-center gap-2 text-slate-500 text-xs group-hover:text-blue-400 transition-colors">
                  <ExternalLink size={14} />
                  <span>Open in new tab</span>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          )
        })}
      </div>

      {/* Info Footer */}
      <div className="bg-slate-900/30 border border-slate-800/30 p-4 rounded-xl">
        <p className="text-slate-400 text-xs">
          <strong className="text-slate-300">Note:</strong> These tools are for internal use only.
          External links will open in a new tab.
        </p>
      </div>
    </div>
  )
}
