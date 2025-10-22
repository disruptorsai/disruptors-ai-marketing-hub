import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Smartphone, Wifi, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';
import { useConnectStore } from '@/lib/connect/store';
import { useWakeLock } from '@/hooks/connect/useWakeLock';

export default function ConnectWelcome() {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { setEventContext, startSession } = useConnectStore();
  const { requestWakeLock, isActive: wakeLockActive } = useWakeLock();

  useEffect(() => {
    // Set event context (in production, fetch from API)
    setEventContext('connect-2025-10', 'kiosk-001');

    // Request wake lock to prevent screen sleep
    requestWakeLock();

    // Generate QR code for mobile handoff
    const mobileUrl = `${window.location.origin}/eventqr/checkin?source=mobile&kiosk=kiosk-001`;
    QRCode.toDataURL(mobileUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#FFFFFF', // White
        light: '#0E0E0E' // Dark background
      }
    }).then(setQrCodeUrl);
  }, [setEventContext, requestWakeLock]);

  const handleTapToCheckIn = () => {
    startSession();
    navigate('/eventqr/checkin');
  };

  const handleScanQR = () => {
    navigate('/eventqr/scan');
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden font-montreal">
      {/* Animated background - Gold glow effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjE1LDAsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* Left Column: Branding & Title */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center xl:text-left space-y-8"
          >
            {/* Golden Eye Banner Logo */}
            <div className="flex justify-center xl:justify-start">
              <motion.img
                src="https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png"
                alt="Disruptors AI"
                className="h-24 md:h-32 lg:h-40 w-auto object-contain drop-shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </div>

            {/* Event Title with sparkle animation */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative inline-block"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] leading-tight">
                  Disruptors<br/>Connect
                </h1>
                <motion.div
                  className="absolute -top-6 -right-6"
                  animate={{
                    rotate: [0, 15, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Sparkles className="w-12 h-12 text-[#FFD700]" />
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-400 font-medium"
              >
                North Salt Lake Event Hall
              </motion.p>

            </div>

            {/* Wi-Fi Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="inline-flex items-center gap-4 bg-black/40 border border-[#FFD700]/20 rounded-2xl px-6 py-4 backdrop-blur-sm"
            >
              <Wifi className="w-6 h-6 text-[#FFD700]" />
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Wi-Fi Network</div>
                <div className="text-lg font-semibold text-white">DisruptorsEventHall</div>
                <div className="text-sm text-gray-400">Password: <span className="text-[#FFD700]">Disrupt2025</span></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Action Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-6"
          >
            {/* Primary CTA: Tap to Check In */}
            <motion.div
              onClick={handleTapToCheckIn}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full h-48 md:h-56 lg:h-64 text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-[#FFD700] to-yellow-600 hover:from-yellow-600 hover:to-[#FFD700] text-black shadow-2xl shadow-[#FFD700]/40 rounded-3xl border-4 border-[#FFD700]/30 relative overflow-hidden group cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="flex flex-col items-center gap-6 relative z-10">
                <span className="drop-shadow-lg">Tap to Check In</span>
              </div>
            </motion.div>

            {/* Secondary: Mobile QR */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="bg-black/60 border-2 border-[#FFD700]/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:border-[#FFD700]/60 transition-all duration-300 col-span-2 lg:col-span-1"
              >
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Smartphone className="w-10 h-10 md:w-12 md:h-12 text-[#FFD700]" />
                  <p className="text-white text-lg md:text-xl font-semibold text-center">
                    Continue on<br/>Your Phone
                  </p>
                  {qrCodeUrl && (
                    <motion.img
                      src={qrCodeUrl}
                      alt="Mobile Check-In QR Code"
                      className="w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-xl shadow-lg shadow-white/10 border-2 border-white/20"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    />
                  )}
                </div>
              </motion.div>

              {/* Already have QR? */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="col-span-2 lg:col-span-1"
              >
                <Button
                  onClick={handleScanQR}
                  variant="outline"
                  className="w-full h-full min-h-[12rem] md:min-h-[14rem] text-xl md:text-2xl font-semibold bg-black/40 border-2 border-gray-700 hover:border-[#FFD700] hover:bg-[#FFD700]/10 text-white rounded-2xl backdrop-blur-sm flex flex-col gap-4"
                >
                  <Camera className="w-12 h-12 md:w-16 md:h-16 text-[#FFD700]" />
                  <span>
                    Already<br/>Have a QR?
                  </span>
                  <span className="text-sm text-gray-400">Scan now</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Privacy link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 text-center"
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
