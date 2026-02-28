import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BillboardModal({ isOpen, onClose, onYes, isReturning = false }) {
  const [viewState, setViewState] = useState('ask');

  useEffect(() => {
    if (viewState === 'reveal') {
      const timer = setTimeout(() => setViewState('followup'), 3000);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  useEffect(() => {
    if (isOpen) setViewState('ask');
  }, [isOpen]);

  const askHeading = isReturning ? "Still thinking about it?" : "Did you see our billboard?";
  const askSubtext = isReturning
    ? "We're not going anywhere. But your competitors might be getting ahead."
    : "We had a feeling you might be the curious type.";
  const yesLabel = isReturning ? "Okay, show me" : "Yes, I saw it";
  const noLabel = isReturning ? "Not yet" : "Nope, just browsing";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — no onClick */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-[#1a1a1a] rounded-2xl border border-[#BF953F]/30
                         shadow-2xl shadow-[#BF953F]/10 max-w-sm w-full
                         pointer-events-auto overflow-hidden"
            >
              {/* X close button */}
              <button onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40
                           hover:bg-black/60 text-gray-400 hover:text-white transition-colors z-10">
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {/* STATE 1: Ask */}
                {viewState === 'ask' && (
                  <motion.div
                    key="ask"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-1">{askHeading}</h3>
                    <p className="text-sm text-gray-400 mb-4">{askSubtext}</p>

                    {/* Billboard image */}
                    <img
                      src="/billboard.webp"
                      alt="Disruptors AI Billboard"
                      width={800}
                      height={225}
                      className="w-full rounded-xl border border-[#BF953F]/30 mb-5"
                    />

                    <div className="space-y-2.5">
                      <button
                        onClick={onYes}
                        className="w-full py-3 px-4 bg-[#BF953F] hover:bg-[#AA771C] text-black font-bold rounded-xl transition-colors"
                      >
                        {yesLabel}
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-3 px-4 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                      >
                        {noLabel}
                      </button>
                      {!isReturning && (
                        <button
                          onClick={() => setViewState('reveal')}
                          className="w-full py-2 text-gold-shine text-sm hover:underline transition-all"
                        >
                          What billboard?
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STATE 2: Reveal */}
                {viewState === 'reveal' && (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="p-6"
                  >
                    <h3 className="text-lg font-bold text-white mb-1">This one.</h3>
                    <p className="text-sm text-gray-400 mb-4">Ring any bells?</p>

                    {/* Billboard with zoom-in animation */}
                    <motion.img
                      src="/billboard.webp"
                      alt="Disruptors AI Billboard"
                      width={800}
                      height={225}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="w-full rounded-xl border border-[#BF953F]/30 mb-4"
                    />

                    {/* Pulsing indicator */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-[#BF953F] rounded-full animate-pulse" />
                      <span className="text-gray-500 text-xs font-mono">Hold tight...</span>
                    </div>
                  </motion.div>
                )}

                {/* STATE 3: Followup */}
                {viewState === 'followup' && (
                  <motion.div
                    key="followup"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="p-6"
                  >
                    <h3 className="text-lg font-bold text-white mb-1">Now you've seen it.</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Want to learn what we can actually do for your business?
                    </p>

                    {/* Smaller billboard image */}
                    <div className="flex justify-center mb-5">
                      <img
                        src="/billboard.webp"
                        alt="Disruptors AI Billboard"
                        className="max-w-[200px] rounded-lg border border-[#BF953F]/20"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <button
                        onClick={onYes}
                        className="w-full py-3 px-4 bg-[#BF953F] hover:bg-[#AA771C] text-black font-bold rounded-xl transition-colors"
                      >
                        Show me
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-3 px-4 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                      >
                        Not right now
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
