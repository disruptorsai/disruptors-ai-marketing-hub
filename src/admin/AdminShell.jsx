/**
 * Admin Shell Component
 * Main container with navigation and layout for all admin modules
 */

import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../api/auth'
import {
  LayoutDashboard,
  FileText,
  Users,
  Image,
  Brain,
  Palette,
  Bot,
  Workflow,
  Plug,
  Activity,
  Wrench,
  LogOut,
  Menu,
  X,
  Target,
  BarChart3
} from 'lucide-react'

export default function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Overview', href: '/admin/secret/overview', icon: LayoutDashboard },
    { name: 'Content', href: '/admin/secret/content', icon: FileText },
    { name: 'SEO Suite', href: '/admin/secret/seo-suite', icon: Target },
    { name: 'SEO Audit Tool', href: '/admin/secret/seo-audit-tool', icon: BarChart3 },
    { name: 'Team', href: '/admin/secret/team', icon: Users },
    { name: 'Media', href: '/admin/secret/media', icon: Image },
    { name: 'Business Brain', href: '/admin/secret/business-brain', icon: Brain },
    { name: 'Brand DNA', href: '/admin/secret/brand-dna', icon: Palette },
    { name: 'Agents', href: '/admin/secret/agents', icon: Bot },
    { name: 'Workflows', href: '/admin/secret/workflows', icon: Workflow },
    { name: 'Integrations', href: '/admin/secret/integrations', icon: Plug },
    { name: 'Telemetry', href: '/admin/secret/telemetry', icon: Activity },
    { name: 'Disruptors Tools', href: '/admin/secret/tools', icon: Wrench },
  ]

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Nexus
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all rounded-lg text-red-400 text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 z-40 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ width: '260px' }}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50">
            <div className="text-xs text-slate-500 space-y-1">
              <div className="font-medium">v1.0.0</div>
              <div>Disruptors & Co</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 min-h-screen transition-all duration-300 ${
            sidebarOpen ? 'ml-[260px]' : 'ml-0'
          }`}
        >
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-blue-500/5 via-transparent to-cyan-500/5" />
    </div>
  )
}
