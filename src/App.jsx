import { useEffect } from 'react'
import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import AdminPortal from './admin-portal'
import { startVersionCheck } from '@/utils/versionCheck'

function App() {
  // Start version checking on mount
  useEffect(() => {
    // Check for new versions every 5 minutes
    startVersionCheck(5 * 60 * 1000);
  }, []);

  // Check for admin route BEFORE any other routing
  // This ensures admin panel is completely isolated from public site
  if (window.location.pathname.startsWith('/admin/secret')) {
    return <AdminPortal />
  }

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 