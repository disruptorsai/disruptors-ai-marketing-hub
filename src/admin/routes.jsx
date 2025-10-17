/**
 * Admin Panel Internal Routes
 * React Router configuration for admin modules
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'

// Lazy-load admin modules for code splitting
const AdminShell = React.lazy(() => import('./AdminShell'))
const DashboardOverview = React.lazy(() => import('./modules/DashboardOverview'))
const ContentManagement = React.lazy(() => import('./modules/ContentManagement'))
const TeamManagement = React.lazy(() => import('./modules/TeamManagement'))
const MediaLibrary = React.lazy(() => import('./modules/MediaLibrary'))
const BusinessBrainBuilder = React.lazy(() => import('./modules/BusinessBrainBuilder'))
const BrandDNABuilder = React.lazy(() => import('./modules/BrandDNABuilder'))
const AgentBuilder = React.lazy(() => import('./modules/AgentBuilder'))
const AgentChat = React.lazy(() => import('./modules/AgentChat'))
const WorkflowManager = React.lazy(() => import('./modules/WorkflowManager'))
const IntegrationsHub = React.lazy(() => import('./modules/IntegrationsHub'))
const TelemetryDashboard = React.lazy(() => import('./modules/TelemetryDashboard'))
const SEOSuite = React.lazy(() => import('./modules/SEOSuite'))
const SEOAuditTool = React.lazy(() => import('./modules/SEOAuditTool'))

export default function AdminRoutes() {
  return (
    <ProtectedRoute>
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-green-500 font-mono animate-pulse">
              LOADING_ADMIN_SYSTEM...
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/admin/secret" element={<AdminShell />}>
            <Route index element={<Navigate to="/admin/secret/overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="business-brain" element={<BusinessBrainBuilder />} />
            <Route path="brand-dna" element={<BrandDNABuilder />} />
            <Route path="agents" element={<AgentBuilder />} />
            <Route path="agents/:agentId/chat" element={<AgentChat />} />
            <Route path="workflows" element={<WorkflowManager />} />
            <Route path="integrations" element={<IntegrationsHub />} />
            <Route path="telemetry" element={<TelemetryDashboard />} />
            <Route path="seo-suite" element={<SEOSuite />} />
            <Route path="seo-audit-tool" element={<SEOAuditTool />} />
          </Route>
        </Routes>
      </React.Suspense>
    </ProtectedRoute>
  )
}
