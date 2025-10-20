import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock, Sparkles } from 'lucide-react';

const EventPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup today
    const popupLastShown = localStorage.getItem('disruptorsConnectPopupShown');
    const today = new Date().toDateString();

    if (popupLastShown !== today) {
      // Show popup after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Remember that user closed it today
    localStorage.setItem('disruptorsConnectPopupShown', new Date().toDateString());
  };

  const handleRSVP = () => {
    // Mark as shown before redirecting
    localStorage.setItem('disruptorsConnectPopupShown', new Date().toDateString());
    window.open('https://lp1.disruptorsmedia.com/', '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 z-50"
            style={{ backdropFilter: 'blur(12px)' }}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.6 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative max-w-lg w-full">
              {/* Glow effect behind popup */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 blur-3xl rounded-3xl"
              />

              {/* Main card */}
              <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden">
                {/* Animated gradient border */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                  style={{ backgroundSize: '200% 100%' }}
                />

                {/* Shimmer effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 2,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                  style={{ width: '50%' }}
                />

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 text-slate-400 hover:text-amber-400 transition-all duration-300 z-10 hover:rotate-90 hover:scale-110"
                  aria-label="Close popup"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Content */}
                <div className="p-10">
                  {/* Logo with float animation */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="flex justify-center mb-8"
                  >
                    <div className="relative">
                      {/* Glow behind logo */}
                      <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full scale-150" />
                      <img
                        src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758752837/logo_a4toul.png"
                        alt="Disruptors Media"
                        className="relative w-40 h-auto object-contain drop-shadow-2xl"
                      />
                    </div>
                  </motion.div>

                {/* Title with gradient */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-white text-center mb-2 tracking-tight">
                    DISRUPTORS CONNECT
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <p className="text-amber-400 text-center text-sm font-semibold tracking-wider uppercase">
                      AI Networking Event
                    </p>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                </motion.div>

                {/* Event Details with stagger animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-4 mb-8 bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 text-slate-300"
                  >
                    <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white text-lg">Friday, October 24, 2025</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 text-slate-300"
                  >
                    <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white text-lg">6:00 PM</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 text-slate-300"
                  >
                    <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white text-lg">650 N Main St</p>
                      <p className="text-sm text-slate-400">North Salt Lake, UT 84054</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-slate-300 text-center mb-8 leading-relaxed text-lg"
                >
                  Learn essential AI tools to scale your business. Network with local leaders and AI experts.
                  <span className="block mt-2 text-amber-400 font-bold text-xl">Free Admission!</span>
                </motion.p>

                {/* CTA Button with enhanced hover effect */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 40px rgba(251, 191, 36, 0.6)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRSVP}
                  className="relative w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold py-5 px-8 rounded-xl transition-all duration-300 shadow-2xl shadow-amber-500/30 overflow-hidden group"
                  style={{ backgroundSize: '200% 100%' }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    animate={{
                      x: ['-200%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                  <span className="relative text-lg tracking-wide uppercase">
                    RSVP NOW - Reserve Your Spot
                  </span>
                </motion.button>

                {/* Small Print */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-slate-500 text-xs text-center mt-4 flex items-center justify-center gap-2"
                >
                  <span className="inline-block w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
                  Limited spots available - Secure your seat now
                  <span className="inline-block w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
                </motion.p>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventPopup;
