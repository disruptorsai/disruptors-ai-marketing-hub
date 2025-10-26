import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Wifi } from 'lucide-react';
import { useConnectStore } from '@/lib/connect/store';
import { useWakeLock } from '@/hooks/connect/useWakeLock';

export default function ConnectWelcome() {
  const { setEventContext } = useConnectStore();
  const { requestWakeLock } = useWakeLock();

  useEffect(() => {
    // Set event context (in production, fetch from API)
    setEventContext('connect-2025-10', 'kiosk-001');

    // Request wake lock to prevent screen sleep
    requestWakeLock();
  }, [setEventContext, requestWakeLock]);

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
            className="text-center space-y-6 md:space-y-8"
          >
            {/* Golden Eye Banner Logo */}
            <div className="flex justify-center">
              <motion.img
                src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png"
                alt="Disruptors AI"
                className="h-24 sm:h-28 md:h-36 lg:h-48 w-auto object-contain drop-shadow-2xl"
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
              className="inline-flex items-center gap-4 md:gap-6 bg-black/40 border-2 border-[#FFD700]/30 rounded-2xl px-6 sm:px-8 py-5 md:py-7 backdrop-blur-sm"
            >
              <Wifi className="w-10 h-10 md:w-12 md:h-12 text-[#FFD700] flex-shrink-0" />
              <div className="text-left">
                <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider font-semibold">Wi-Fi Network</div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-1">DisruptorsEventHall</div>
                <div className="text-lg md:text-xl text-gray-300 mt-1">Password: <span className="text-[#FFD700] font-semibold">Disrupt2025</span></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: QR Code Display */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-center"
          >
            {/* Mobile QR Code */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-black/60 border-2 border-[#FFD700]/30 rounded-3xl p-8 sm:p-10 md:p-12 backdrop-blur-sm hover:border-[#FFD700]/60 transition-all duration-300 w-full max-w-2xl"
            >
              <div className="flex flex-col items-center justify-center gap-6 md:gap-8">
                <Smartphone className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#FFD700]" />
                <p className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center">
                  Scan to Check In
                </p>
                <motion.img
                  src="/assets/connect-qr-code.png"
                  alt="Mobile Check-In QR Code"
                  className="w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] rounded-2xl shadow-2xl shadow-white/20 border-4 border-white/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                />
                <p className="text-gray-400 text-base sm:text-lg md:text-xl text-center max-w-md">
                  Use your phone's camera to scan this QR code and complete your check-in
                </p>
              </div>
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
