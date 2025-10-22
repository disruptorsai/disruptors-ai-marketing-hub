import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Camera, X, Zap, ZapOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isActive = true;

    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        const selectedDevice = videoInputDevices.find(d => d.label.toLowerCase().includes('back')) || videoInputDevices[0];

        const constraints = {
          video: {
            deviceId: selectedDevice?.deviceId,
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!isActive) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setScanning(true);

        codeReader.decodeFromVideoDevice(
          selectedDevice?.deviceId,
          videoRef.current,
          (result, err) => {
            if (result && isActive) {
              console.log('[QR Scanner] ✅ Scanned:', result.text);
              playBeep();
              onScan(result.text);
              stopScanning();
            }
            if (err && !(err instanceof NotFoundException)) {
              console.warn('[QR Scanner] Decode error:', err);
            }
          }
        );
      } catch (err) {
        console.error('[QR Scanner] Start error:', err);
        setError('Camera access denied. Please enable camera permissions.');
      }
    };

    const stopScanning = () => {
      isActive = false;
      setScanning(false);
      codeReader.reset();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    startScanning();

    return stopScanning;
  }, [onScan]);

  const toggleTorch = async () => {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (capabilities.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        });
        setTorchEnabled(!torchEnabled);
      } catch (err) {
        console.error('[QR Scanner] Torch error:', err);
      }
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (err) {
      console.warn('[QR Scanner] Audio not available:', err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col font-montreal"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h2 className="text-white text-2xl md:text-3xl font-bold">Scan QR Code</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10 h-12 w-12"
            >
              <X className="h-8 w-8" />
            </Button>
          </div>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          className="flex-1 object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Scanning indicator overlay */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Finder box with animated corners */}
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Animated scan line */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"
                animate={{
                  top: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#FFD700] rounded-tl-2xl shadow-lg shadow-[#FFD700]/50" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#FFD700] rounded-tr-2xl shadow-lg shadow-[#FFD700]/50" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#FFD700] rounded-bl-2xl shadow-lg shadow-[#FFD700]/50" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#FFD700] rounded-br-2xl shadow-lg shadow-[#FFD700]/50" />

              {/* Pulsing border */}
              <motion.div
                className="absolute inset-0 border-2 border-[#FFD700]/30 rounded-2xl"
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/90 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-6">
              {/* Torch toggle */}
              <Button
                onClick={toggleTorch}
                variant="outline"
                className="bg-white/10 border-[#FFD700]/30 text-white hover:bg-[#FFD700]/20 hover:border-[#FFD700] backdrop-blur-sm h-14 px-8 text-lg"
              >
                {torchEnabled ? (
                  <><Zap className="mr-2 h-6 w-6" /> Torch On</>
                ) : (
                  <><ZapOff className="mr-2 h-6 w-6" /> Torch Off</>
                )}
              </Button>

              {/* Cancel button */}
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-white/10 border-gray-600 text-white hover:bg-gray-700/50 backdrop-blur-sm h-14 px-8 text-lg"
              >
                Cancel
              </Button>
            </div>

            {/* Help text */}
            <p className="text-center text-gray-400 mt-6 text-lg">
              {scanning ? 'Point camera at QR code to scan' : 'Initializing camera...'}
            </p>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-center backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
