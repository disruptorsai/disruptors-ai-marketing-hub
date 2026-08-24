import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check } from 'lucide-react';

/**
 * WaitlistModal - Modal for collecting waitlist signups and contact info
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.toolName - Name of the tool user is interested in
 */
export default function WaitlistModal({ isOpen, onClose, toolName }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Integrate with actual form submission/email service
    console.log('Waitlist submission:', { ...formData, toolName });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', message: '' });
    }, 2000);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#1a1a1a] border-2 border-[#FFD700]/20 rounded-3xl shadow-2xl shadow-[#FFD700]/10 max-w-lg w-full pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#2C6BAA] via-[#2C6BAA] to-[#1a5088] p-8 text-white border-b-2 border-[#FFD700]/30">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-2">
                  <h2 className="text-3xl font-black tracking-tight mb-2">GET EARLY ACCESS</h2>
                </div>
                <p className="text-gold-shine font-semibold text-lg">
                  {toolName}
                </p>
              </div>

              {/* Form */}
              <div className="p-8 bg-[#1a1a1a]">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-white/10 text-white placeholder-gray-500 focus:border-[#FFD700] focus:outline-none transition-all"
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-white/10 text-white placeholder-gray-500 focus:border-[#FFD700] focus:outline-none transition-all"
                        placeholder="john@company.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-white/10 text-white placeholder-gray-500 focus:border-[#FFD700] focus:outline-none transition-all"
                        placeholder="Acme Inc."
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
                        What would you use this tool for?
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="3"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-black/40 border-2 border-white/10 text-white placeholder-gray-500 focus:border-[#FFD700] focus:outline-none transition-all resize-none"
                        placeholder="Tell us about your use case..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#FFD700] text-black py-4 px-6 rounded-lg font-black text-lg uppercase tracking-wide hover:bg-[#ffd700]/90 hover:shadow-lg hover:shadow-[#FFD700]/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Get Early Access
                    </button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-[#FFD700]/20 border-2 border-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-10 h-10 text-gold-shine" strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">YOU'RE IN!</h3>
                    <p className="text-gray-400 text-lg">
                      We'll notify you when {toolName} is ready.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
