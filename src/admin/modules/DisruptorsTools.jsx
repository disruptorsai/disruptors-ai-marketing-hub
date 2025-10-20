/**
 * Disruptors Tools Module
 * Internal tools and utilities for Disruptors AI team
 */

import React, { useState } from 'react'
import {
  Wrench,
  Presentation,
  ExternalLink,
  Download,
  Grid3x3
} from 'lucide-react'
import PresentationMode from '@/components/shared/PresentationMode'

export default function DisruptorsTools() {
  const [activeTab, setActiveTab] = useState('presenter')

  const tabs = [
    { id: 'presenter', label: 'Presenter', icon: Download },
    { id: 'tools', label: 'External Tools', icon: Grid3x3 }
  ]

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

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'presenter' && (
        <div className="space-y-6">
          {/* Presenter Info */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Download className="text-blue-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-white font-bold text-lg mb-2">
                  LG StandbyME Go Presentation Mode
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Optimize your site for the LG StandbyME Go 27LX5 briefcase presenter.
                  Download all content once for instant offline presentations with 4-5 hour battery life.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Instant loading (0.2s)
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Works 100% offline
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    4-5 hour battery life
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Presentation Mode Component */}
          <PresentationMode isOpen={true} onClose={() => {}} embedded={true} />

          {/* Quick Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-2">📱 Setup Guide</h3>
              <ul className="text-slate-400 text-xs space-y-1.5">
                <li>• Open browser on LG StandbyME Go</li>
                <li>• Visit dm4.wjwelsh.com</li>
                <li>• Click "Download All Content"</li>
                <li>• Wait 5 minutes (one time)</li>
                <li>• Present offline forever!</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-2">🔋 Battery Tips</h3>
              <ul className="text-slate-400 text-xs space-y-1.5">
                <li>• Disconnect WiFi when presenting</li>
                <li>• Set brightness to 70%</li>
                <li>• Enable eco mode</li>
                <li>• Close background apps</li>
                <li>• Get 4-5 hours battery!</li>
              </ul>
            </div>
          </div>

          {/* Documentation Link */}
          <div className="bg-slate-900/30 border border-slate-800/30 p-4 rounded-xl">
            <p className="text-slate-400 text-sm">
              <strong className="text-slate-300">Complete Guide:</strong> See{' '}
              <code className="text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded">
                docs/LG_STANDBYME_GO_OPTIMIZATION.md
              </code>{' '}
              for full setup, battery optimization, and troubleshooting.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <>
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
        </>
      )}
    </div>
  )
}
