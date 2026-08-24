/**
 * Admin Portal - Standalone Entry Point
 * Completely isolated from public site routing
 *
 * Usage Option A: Direct import in App.jsx (SAFEST)
 * ─────────────────────────────────────────────────
 * In your src/App.jsx, add at the very top:
 *
 * import AdminPortal from './admin-portal'
 *
 * function App() {
 *   // Check if accessing admin BEFORE any other routing
 *   if (window.location.pathname.startsWith('/admin/secret')) {
 *     return <AdminPortal />
 *   }
 *
 *   // Your existing app logic continues unchanged
 *   return (
 *     <YourExistingApp />
 *   )
 * }
 *
 * Usage Option B: Conditional import (ZERO changes to existing code)
 * ──────────────────────────────────────────────────────────────────
 * Create a new file src/index-wrapper.jsx:
 *
 * import React from 'react'
 * import ReactDOM from 'react-dom/client'
 *
 * // Check URL before loading anything else
 * if (window.location.pathname.startsWith('/admin/secret')) {
 *   import('./admin-portal').then(({ default: AdminPortal }) => {
 *     ReactDOM.createRoot(document.getElementById('root')).render(<AdminPortal />)
 *   })
 * } else {
 *   // Load your existing app
 *   import('./main').then(({ default: main }) => main())
 * }
 *
 * Then update vite.config.js to use index-wrapper.jsx as entry point
 *
 * BOTH OPTIONS: Zero risk to public site!
 */

import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AdminRoutes from './admin/routes'

export default function AdminPortal() {
  return (
    <BrowserRouter>
      <AdminRoutes />
    </BrowserRouter>
  )
}
