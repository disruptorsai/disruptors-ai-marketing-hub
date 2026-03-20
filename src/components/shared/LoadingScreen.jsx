
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const duration = 1200; // 1.2 seconds - faster loading
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: 'url(https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/ui/backgrounds/renaissance-fresco-pyramids.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Content */}
          <div className="relative z-10 w-full h-full flex">
            
            {/* Left Side - Disruptors Logo */}
            <div className="flex-1 flex items-center justify-center">
              <motion.img
                src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png"
                alt="Disruptors Media"
                className="h-16 brightness-0 invert opacity-90"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.9 }}
                transition={{ duration: 0.8 }}
              />
            </div>

            {/* Right Side - Progress and Text */}
            <div className="flex-1 flex flex-col items-center justify-center text-right pr-16">
              
              {/* Progress Percentage */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.span
                  className="text-8xl sm:text-9xl font-black text-white leading-none"
                  key={Math.floor(progress)}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {Math.floor(progress)}%
                </motion.span>
              </motion.div>

              {/* Loading Text */}
              <motion.div
                className="text-center max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
                  YOUR
                </h2>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
                  EXPERIENCE IS
                </h2>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wider">
                  <span className="border-b-4 border-white">LOADING</span>
                </h2>
              </motion.div>

            </div>
          </div>

          {/* Animated progress bar at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}
