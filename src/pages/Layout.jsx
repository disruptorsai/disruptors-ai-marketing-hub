

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, ArrowRight, Twitter, Youtube, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/shared/LoadingScreen";
import MatrixLogin from "@/components/admin/MatrixLogin";
import DisruptorsAdmin from "@/components/admin/DisruptorsAdmin";
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
    handleCloseMatrix,
    clickCount,
    isTimerActive,
    REQUIRED_CLICKS
  } = useSecretAccess();

  const navItems = [
    { name: "Work", path: "work" },
    { name: "Services", path: "solutions" },
    { name: "About", path: "about" },
    { name: "Podcasting", path: "podcast" },
    { name: "Blog", path: "blog" },
    { name: "Resources", path: "resources" },
    { name: "Gallery", path: "gallery" }
  ];

  const footerLinks = [
      ...navItems,
      { name: "FAQ", path: "faq" },
      { name: "Contact", path: "contact" },
      { name: "Privacy Policy", path: "privacy"},
      { name: "Terms and Conditions", path: "terms" }
  ]

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
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate footer separator lines with scroll-mapped GSAP
  React.useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const footerContainer = document.getElementById('footer-lines-container');
      if (!footerContainer) {
        console.warn('Footer lines container not found');
        return;
      }

      // Line heights and spacing
      const gaps = [98, 82, 65, 46, 24, 0]; // Spacing from bottom

      // Animate all lines from stacked position to spread positions
      gaps.forEach((gap, index) => {
        const line = footerContainer.querySelector(`.sep-line-${index + 1}`);
        if (!line) {
          console.warn(`Line ${index + 1} not found`);
          return;
        }

        // Individual ScrollTrigger for each line
        gsap.fromTo(
          line,
          {
            y: 0,
            force3D: true
          },
          {
            y: -gap,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: footerContainer,
              start: "top 90%", // Start when footer top hits 90% down the viewport
              end: "top 30%", // End when footer top hits 30% down the viewport
              scrub: 1,
              markers: false, // Debug mode off
            }
          }
        );
      });

      // Refresh ScrollTrigger
      ScrollTrigger.refresh();
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [location]);

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
              <header className="fixed top-0 left-0 right-0 z-50 pt-4 sm:pt-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={`text-white ${
            isHomePage
              ? `transition-all duration-500 ease-in-out ${scrolled ? 'bg-black/70 backdrop-blur-md' : 'bg-black/30 backdrop-blur-sm'}`
              : 'bg-black/70 backdrop-blur-md'
          }`}>
            <div className="px-3 sm:px-4 md:px-6 lg:px-8">
              <div className={`flex justify-between items-center ${
                isHomePage
                  ? `transition-all duration-500 ease-in-out ${scrolled ? 'h-16 sm:h-20' : 'h-20 sm:h-24 md:h-28 lg:h-32'}`
                  : 'h-16 sm:h-20'
              }`}>
                <Link to={createPageUrl('')} className="flex-shrink-0">
                  <div
                    onClick={handleLogoClick}
                    className="relative cursor-pointer touch-manipulation"
                  >
                    <img
                      src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758752837/logo_a4toul.png"
                      alt="Disruptors Media Logo"
                      className={`object-contain w-auto transition-all duration-500 ease-in-out ${
                        isHomePage
                          ? `${scrolled ? 'h-8 sm:h-10' : 'h-10 sm:h-12'}`
                          : 'h-8 sm:h-10'
                      } ${isTimerActive ? 'animate-pulse' : ''}`}
                    />

                    {/* Secret Access Progress Indicator */}
                    {isTimerActive && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-600 rounded">
                        <div
                          className="h-full bg-green-400 rounded transition-all duration-200"
                          style={{ width: `${(clickCount / REQUIRED_CLICKS) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Link>

                <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.path)}
                      className="text-xs font-semibold uppercase tracking-widest transition-colors hover:text-gray-300 py-2"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="hidden lg:flex items-center">
                   <Link to={createPageUrl('book-strategy-session')} className="group relative inline-flex items-center justify-center h-10 px-4 xl:px-6 text-xs font-bold text-white uppercase bg-transparent border border-white touch-manipulation" style={{clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)'}}>
                      <span>Book a Call</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                   </Link>
                </div>

                <button
                  className="lg:hidden p-3 -m-1 text-white touch-manipulation"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
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
                        className="block text-base font-medium text-white hover:text-gray-300 transition-colors py-3 px-2 -mx-2 rounded touch-manipulation min-h-[48px] flex items-center"
                      >
                        {item.name}
                      </Link>
                    ))}
                     <Button asChild className="w-full mt-4 bg-white text-black hover:bg-gray-200 h-12 text-base touch-manipulation">
                        <Link to={createPageUrl('book-strategy-session')}>Book a Call</Link>
                     </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
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
                {!showLoading && children}
              </motion.main>
            </AnimatePresence>
          </div>

          <footer className="relative pt-12 sm:pt-16 md:pt-20 pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="w-[90%] mx-auto relative">

              {/* Animated lines + Book a call CTA */}
              <div className="relative mb-12 sm:mb-16" id="footer-lines-container">
                {/* Animated horizontal lines */}
                <div className="relative h-[100px] sm:h-[110px] md:h-[120px] mb-0">
                  <div className="sep-line sep-line-1"></div>
                  <div className="sep-line sep-line-2"></div>
                  <div className="sep-line sep-line-3"></div>
                  <div className="sep-line sep-line-4"></div>
                  <div className="sep-line sep-line-5"></div>
                  <div className="sep-line sep-line-6"></div>
                </div>

                {/* Book a call button */}
                <Link
                  to={createPageUrl('book-strategy-session')}
                  className="group flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 md:py-6 bg-[#2b2b2b] text-[#f1ede9] hover:bg-black transition-colors min-h-[60px] sm:min-h-[70px] md:min-h-[80px] touch-manipulation"
                >
                  <span className="font-supply text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight">
                    Book a call
                  </span>
                  <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-transform group-hover:translate-x-2 flex-shrink-0 ml-4" />
                </Link>
              </div>

              {/* Footer navigation */}
              <nav className="relative flex flex-wrap justify-center gap-x-6 sm:gap-x-8 gap-y-3 mb-12 sm:mb-16">
                {footerLinks.map(link => (
                  <Link
                    key={link.name}
                    to={createPageUrl(link.path)}
                    className="font-supply text-xs sm:text-sm font-normal uppercase tracking-widest text-[#2b2b2b] hover:opacity-60 transition-opacity min-h-[44px] flex items-center touch-manipulation leading-[28px]"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Bottom section with social icons and info */}
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 pb-8 sm:pb-10 mb-20">
                {/* Left: Copyright & address */}
                <div className="font-supply text-center md:text-left order-2 md:order-1">
                  <p className="text-xs sm:text-sm uppercase text-[#2b2b2b]">
                    ©{new Date().getFullYear()} Disruptors Media inc.
                  </p>
                  <p className="text-xs sm:text-sm uppercase text-[#2b2b2b] mt-2">
                    650 N Main St, North Salt Lake, UT 84054
                  </p>
                </div>

                {/* Center: Social icons */}
                <div className="flex items-center gap-6 sm:gap-8 order-1 md:order-2">
                  <a href="#" className="hover:opacity-60 transition-opacity touch-manipulation" aria-label="Twitter">
                    <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-[#2b2b2b]" />
                  </a>
                  <a href="#" className="hover:opacity-60 transition-opacity touch-manipulation" aria-label="TikTok">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#2b2b2b]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                  <a href="#" className="hover:opacity-60 transition-opacity touch-manipulation" aria-label="YouTube">
                    <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-[#2b2b2b]" />
                  </a>
                  <a href="#" className="hover:opacity-60 transition-opacity touch-manipulation" aria-label="Instagram">
                    <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-[#2b2b2b]" />
                  </a>
                </div>

                {/* Right: Coordinates & load address */}
                <div className="font-supply text-center md:text-right order-3 hidden sm:block">
                  <p className="text-xs sm:text-sm uppercase text-[#2b2b2b]">
                    40.853400, -111.911790
                  </p>
                  <p className="text-xs sm:text-sm uppercase text-[#2b2b2b] mt-2">
                    Load Address: 034526-01, IScxx compressed
                  </p>
                </div>
              </div>

              {/* Logo emboss watermark - positioned at bottom, half cut off */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-[400px] md:w-[500px] lg:w-[650px] xl:w-[800px] opacity-100 pointer-events-none z-0">
                <img src="/assets/footer/logo-emboss.png" alt="" className="w-full h-auto" />
              </div>

            </div>
          </footer>
            </>
          )}
        </div>
    </div>
  );
}

