import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Wifi, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnectStore } from '@/lib/connect/store';
import { useWakeLock } from '@/hooks/connect/useWakeLock';

export default function ConnectWelcome() {
  const navigate = useNavigate();
  const { setEventContext, startSession } = useConnectStore();
  const { requestWakeLock } = useWakeLock();

  useEffect(() => {
    // Set event context (in production, fetch from API)
    setEventContext('connect-2025-10', 'kiosk-001');

    // Request wake lock to prevent screen sleep
    requestWakeLock();
  }, [setEventContext, requestWakeLock]);

  const handleTapToCheckIn = () => {
    startSession();
    navigate('/eventqr/checkin');
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 lg:p-16 relative overflow-hidden font-montreal">
      {/* Animated background - Gold glow effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjE1LDAsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-12 md:gap-16 xl:gap-24 items-center">

          {/* Left Column: Branding & Title */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center xl:text-left space-y-6 md:space-y-8"
          >
            {/* Golden Eye Banner Logo */}
            <div className="flex justify-center xl:justify-start">
              <motion.img
                src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png"
                alt="Disruptors AI"
                className="h-20 sm:h-24 md:h-32 lg:h-40 w-auto object-contain drop-shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </div>

            {/* Event Title */}
            <div className="space-y-3 md:space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative inline-block"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] leading-tight">
                  Disruptors<br/>Connect
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-400 font-medium"
              >
                North Salt Lake Event Hall
              </motion.p>

            </div>

            {/* Wi-Fi Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="inline-flex items-center gap-3 md:gap-4 bg-black/40 border border-[#FFD700]/20 rounded-2xl px-4 sm:px-6 py-3 md:py-4 backdrop-blur-sm"
            >
              <Wifi className="w-5 h-5 md:w-6 md:h-6 text-[#FFD700] flex-shrink-0" />
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Wi-Fi Network</div>
                <div className="text-base md:text-lg font-semibold text-white">DisruptorsEventHall</div>
                <div className="text-xs sm:text-sm text-gray-400">Password: <span className="text-[#FFD700]">Disrupt2025</span></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Action Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-5 md:space-y-6"
          >
            {/* Primary CTA: Tap to Check In */}
            <motion.div
              onClick={handleTapToCheckIn}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTapToCheckIn();
              }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full h-40 sm:h-44 md:h-56 lg:h-64 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-[#FFD700] to-yellow-600 hover:from-yellow-600 hover:to-[#FFD700] text-black shadow-2xl shadow-[#FFD700]/40 rounded-3xl border-4 border-[#FFD700]/30 relative overflow-hidden group cursor-pointer flex flex-col items-center justify-center touch-manipulation select-none"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              <div className="flex flex-col items-center gap-4 sm:gap-6 relative z-10 pointer-events-none">
                <span className="drop-shadow-lg px-4">Tap to Check In</span>
              </div>
            </motion.div>

            {/* Secondary: Mobile QR */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-black/60 border-2 border-[#FFD700]/30 rounded-2xl p-6 sm:p-8 md:p-10 backdrop-blur-sm hover:border-[#FFD700]/60 transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-5 md:gap-6">
                <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-[#FFD700]" />
                <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center">
                  Continue on<br/>Your Phone
                </p>
                <motion.img
                  src="/assets/connect-qr-code.png"
                  alt="Mobile Check-In QR Code"
                  className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] rounded-xl shadow-lg shadow-white/10 border-2 border-white/20"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                />
              </div>
            </motion.div>

            {/* View Itinerary Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={() => navigate('/eventqr/itinerary')}
                variant="outline"
                className="w-full h-16 md:h-20 text-lg md:text-xl font-semibold bg-black/40 border-2 border-[#FFD700]/40 hover:border-[#FFD700] hover:bg-[#FFD700]/10 text-white rounded-2xl backdrop-blur-sm flex items-center justify-center gap-3"
              >
                <Calendar className="w-6 h-6 md:w-7 md:h-7 text-[#FFD700]" />
                View Event Schedule
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Privacy link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 md:mt-16 text-center"
        >
          <a
            href="/privacy"
            className="text-sm text-gray-600 hover:text-[#FFD700] transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy & Data Policy
          </a>
        </motion.div>
      </div>
    </div>
  );
}
