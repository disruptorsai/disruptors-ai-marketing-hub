

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/shared/LoadingScreen";
import MatrixLogin from "@/components/admin/MatrixLogin";
import DisruptorsAdmin from "@/components/admin/DisruptorsAdmin";
import GsapScrambleText from "@/components/shared/GsapScrambleText";
import UserProfileDropdown from "@/components/shared/UserProfileDropdown";
import Footer from "@/components/shared/Footer";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showLoading, setShowLoading] = React.useState(true);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [scrolled, setScrolled] = React.useState(false);

  // Secret admin access hook
  const {
    showMatrixLogin,
    isAdminAuthenticated,
    adminUser,
    handleLogoClick,
    handleLoginSuccess,
    handleLogout,
    handleCloseMatrix
  } = useSecretAccess();

  const navItems = [
    { name: "Work", path: "work" },
    { name: "Services", path: "solutions" },
    { name: "About", path: "about" },
    { name: "Podcasting", path: "podcast" },
    { name: "Blog", path: "blog" },
    { name: "Gallery", path: "gallery" }
  ];

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setInitialLoad(false);
  };
  
  React.useEffect(() => {
    setMobileMenuOpen(false);
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  }, [location]);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const hasLoadedBefore = sessionStorage.getItem('hasLoaded');
    if (hasLoadedBefore) {
      setShowLoading(false);
      setInitialLoad(false);
    } else {
      sessionStorage.setItem('hasLoaded', 'true');
      // Ensure loading completes after a short delay if stuck
      const timeout = setTimeout(() => {
        setShowLoading(false);
        setInitialLoad(false);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Conditionally apply header animation only on homepage
  const isHomePage = currentPageName === 'Home';

  return (
    <div className="min-h-screen relative">
        {/* Full-Screen Background Image */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/ui/backgrounds/main-bg.jpg)'
          }}
        />
        
        {/* Content Layer */}
        <div className="relative z-10 min-h-screen">
          {showLoading && initialLoad && (
            <LoadingScreen onComplete={handleLoadingComplete} />
          )}

          {/* Admin Interface - Show instead of normal content when authenticated */}
          {isAdminAuthenticated && (
            <DisruptorsAdmin username={adminUser} onLogout={handleLogout} />
          )}

          {/* Matrix Login Modal */}
          {showMatrixLogin && (
            <MatrixLogin onLogin={handleLoginSuccess} onClose={handleCloseMatrix} />
          )}

          {/* Only show normal site content if not in admin mode */}
          {!isAdminAuthenticated && (
            <>
              <header className="fixed top-0 left-0 right-0 z-50">
            <div className={`w-full text-white transition-all duration-500 ease-in-out ${
              scrolled ? 'bg-black/70 backdrop-blur-md' : isHomePage ? 'bg-black/30 backdrop-blur-sm' : 'bg-black/70 backdrop-blur-md'
            }`}>
            <div className="px-3 sm:px-4 md:px-6 lg:px-8">
              <div className={`flex justify-between items-center transition-all duration-500 ease-in-out ${
                scrolled ? 'h-16 sm:h-20' : 'h-20 sm:h-24 md:h-28 lg:h-32'
              }`}>
                <Link to={createPageUrl('')} className="flex-shrink-0">
                  <div
                    onClick={handleLogoClick}
                    className="relative cursor-pointer touch-manipulation"
                  >
                    <img
                      src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758752837/logo_a4toul.png"
                      alt="Disruptors Media Logo"
                      className={`object-contain h-auto transition-all duration-500 ease-in-out ${
                        scrolled ? 'w-24 sm:w-32' : 'w-48 sm:w-64'
                      }`}
                    />
                  </div>
                </Link>

                <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.path)}
                      className="font-supply text-base font-normal uppercase tracking-widest transition-colors hover:text-gray-300 py-2"
                    >
                      <GsapScrambleText
                        text={item.name}
                      />
                    </Link>
                  ))}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
                   {/* User Profile Dropdown */}
                   <UserProfileDropdown />

                   {/* CTA Button */}
                   <Link
                     to={createPageUrl('book-strategy-session')}
                     className="font-supply group relative inline-flex items-center justify-center h-12 px-6 xl:px-8 text-base font-bold text-[#FFD700] uppercase bg-transparent border-2 border-[#FFD700] hover:bg-[#FFD700]/10 touch-manipulation transition-all duration-300 whitespace-nowrap"
                     style={{
                       clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                       animation: 'goldPulse 3s ease-in-out infinite',
                       boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
                     }}
                   >
                      <GsapScrambleText
                        text="Let's Talk"
                        as="span"
                        className="whitespace-nowrap"
                      />
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                   </Link>
                </div>

                <div className="lg:hidden flex items-center gap-2">
                  {/* Mobile User Profile */}
                  <div className="block lg:hidden">
                    <UserProfileDropdown />
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    className="p-3 -m-1 text-white touch-manipulation"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileMenuOpen}
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden border-t border-gray-700"
                >
                  <div className="px-4 py-6 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={createPageUrl(item.path)}
                        className="font-supply block text-base font-normal text-white hover:text-gray-300 transition-colors py-3 px-2 -mx-2 rounded touch-manipulation min-h-[48px] flex items-center"
                      >
                        <GsapScrambleText
                          text={item.name}
                        />
                      </Link>
                    ))}
                     <Button asChild className="w-full mt-4 bg-white text-black hover:bg-gray-200 h-12 text-base touch-manipulation">
                        <Link to={createPageUrl('book-strategy-session')} className="whitespace-nowrap">
                          <GsapScrambleText
                            text="Let's Talk"
                            className="whitespace-nowrap"
                          />
                        </Link>
                     </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </header>
          
          <div className={`${!isHomePage && 'pt-20 sm:pt-26'}`}>
            <AnimatePresence mode="wait">
              <motion.main
                key={currentPageName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>

          <Footer />
            </>
          )}
        </div>
    </div>
  );
}

