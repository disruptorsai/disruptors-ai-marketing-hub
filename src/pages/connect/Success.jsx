import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useConnectStore } from '@/lib/connect/store';
import confetti from 'canvas-confetti';
import WebsiteCTA from '@/components/connect/WebsiteCTA';
import {
  Calendar,
  CheckCircle2,
  ArrowRight,
  BarChart3
} from 'lucide-react';

export default function ConnectSuccess() {
  const navigate = useNavigate();
  const { contact } = useConnectStore();

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4FF0E8', '#FFD700', '#FFFFFF']
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white font-montreal">
      {/* Success Header */}
      <section className="relative py-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Success Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-16 h-16 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            You're In!
          </motion.h1>

          {/* Honorary Disruptor Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', duration: 0.8 }}
            className="relative inline-block mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] opacity-20 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] text-[#0B0B0F] px-8 py-4 rounded-2xl shadow-2xl border-2 border-yellow-300">
              <p className="text-2xl md:text-3xl font-bold tracking-wide">
                You're Now an Honorary Disruptor!
              </p>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8"
          >
            Welcome to Disruptors Connect
          </motion.p>

          {/* Badge Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-md mx-auto"
          >
            <p className="text-green-400 font-semibold text-lg">
              Check-in complete
            </p>
            <p className="text-gray-400 mt-2">
              Your badge is being prepared at the front desk
            </p>
          </motion.div>
        </div>
      </section>

      {/* Event Itinerary - Primary CTA */}
      <section className="relative py-16 bg-gradient-to-b from-[#0B0B0F] to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400/10 border border-cyan-400/30 rounded-full mb-4">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">Tonight's Schedule</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Event Itinerary
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your roadmap for an amazing evening of networking, learning, and connection
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => navigate('/connectqr1/itinerary')}
              className="w-full max-w-2xl mx-auto block px-12 py-8 text-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-white font-bold shadow-2xl hover:shadow-cyan-500/50 transition-all"
            >
              <div className="flex items-center justify-center gap-3">
                <Calendar className="w-6 h-6" />
                <span>View Full Event Schedule</span>
                <ArrowRight className="w-6 h-6" />
              </div>
            </Button>
          </motion.div>

          {/* Encouragement Message */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-8 text-center max-w-3xl mx-auto"
          >
            <p className="text-white text-lg leading-relaxed">
              Grab food, say hi to some new people, and make connections —
              <br />
              <span className="text-cyan-400 font-semibold text-xl">
                your best idea is one conversation away.
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Poll Results - Secondary CTA */}
      <section className="relative py-16 bg-gradient-to-b from-gray-900 to-[#0B0B0F]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-magenta-400/10 border border-magenta-400/30 rounded-full mb-4">
              <BarChart3 className="w-5 h-5 text-magenta-400" />
              <span className="text-magenta-400 font-semibold">Live Results</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              See How Others Voted
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Check out the live poll results and see how your peers are thinking about AI
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => navigate('/connectqr1/results')}
              className="w-full max-w-2xl mx-auto block px-12 py-8 text-xl bg-gradient-to-r from-magenta-500 to-magenta-400 hover:from-magenta-600 hover:to-magenta-500 text-white font-bold shadow-2xl hover:shadow-magenta-500/50 transition-all"
            >
              <div className="flex items-center justify-center gap-3">
                <BarChart3 className="w-6 h-6" />
                <span>View Live Poll Results</span>
                <ArrowRight className="w-6 h-6" />
              </div>
            </Button>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-magenta-400/10 border border-magenta-400/30 rounded-xl p-8 text-center max-w-3xl mx-auto"
          >
            <p className="text-white text-lg leading-relaxed">
              See real-time results from tonight's attendees and discover what your community thinks about AI
            </p>
          </motion.div>
        </div>
      </section>

      {/* Website CTA */}
      <section className="relative py-16 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <WebsiteCTA />
        </div>
      </section>
    </div>
  );
}
