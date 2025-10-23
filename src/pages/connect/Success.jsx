import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnectStore } from '@/lib/connect/store';
import confetti from 'canvas-confetti';
import AITrivia from '@/components/connect/AITrivia';
import AINews from '@/components/connect/AINews';
import ComingSoon from '@/components/connect/ComingSoon';
import WebsiteCTA from '@/components/connect/WebsiteCTA';

export default function ConnectSuccess() {
  const navigate = useNavigate();
  const { contact, sessionId, reset } = useConnectStore();
  const [matchSuggestions, setMatchSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4FF0E8', '#F738A5', '#FFFFFF']
    });

    // Fetch AI match suggestions
    if (contact?.contactId) {
      fetch('/.netlify/functions/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.contactId,
          eventId: 'connect-2025-10'
        })
      })
        .then(res => res.json())
        .then(data => {
          setMatchSuggestions(data.suggestions || []);
        })
        .catch(err => {
          console.error('Match suggestions failed:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Auto-return to welcome after 30 seconds
    const timeout = setTimeout(() => {
      reset();
      navigate('/connectqr1');
    }, 30000);

    return () => clearTimeout(timeout);
  }, [contact, navigate, reset]);

  const handleDone = () => {
    reset();
    navigate('/connectqr1');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center p-8 relative overflow-hidden font-montreal">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-3xl mx-auto text-center space-y-8"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
          className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mb-8"
        >
          <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-6xl font-bold text-white"
        >
          You're In!
        </motion.h1>

        {/* Honorary Disruptor Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', duration: 0.8 }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] opacity-20 blur-2xl rounded-full animate-pulse" />
          <div className="relative bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] text-[#0B0B0F] px-8 py-4 rounded-2xl shadow-2xl border-2 border-yellow-300 animate-gradient-xy">
            <p className="text-2xl md:text-3xl font-bold tracking-wide">
              🏆 You're Now an Honorary Disruptor! 🏆
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-300"
        >
          Welcome to Disruptors Connect
        </motion.p>

        {/* Badge Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
        >
          <p className="text-green-400 font-semibold text-lg">
            ✓ Check-in complete
          </p>
          <p className="text-gray-400 mt-2">
            Your badge is being prepared at the front desk
          </p>
        </motion.div>

        {/* Match Suggestions */}
        {!loading && matchSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              People You Should Meet Tonight
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {matchSuggestions.map((match, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + (index * 0.1) }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-cyan-400/20 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg mb-1">
                        {match.name}
                      </h4>
                      <p className="text-gray-400 text-sm mb-2">
                        {match.company}
                      </p>
                      <p className="text-cyan-400 text-sm leading-relaxed">
                        {match.reason}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-6"
        >
          <p className="text-white text-lg leading-relaxed">
            Grab food, say hi to some new people, and make connections —
            <br />
            <span className="text-cyan-400 font-semibold">
              your best idea is one conversation away.
            </span>
          </p>
        </motion.div>

        {/* Website CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <WebsiteCTA />
        </motion.div>

        {/* AI Trivia Game */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <AITrivia />
        </motion.div>

        {/* AI News */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <AINews />
        </motion.div>

        {/* Coming Soon Tools */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
        >
          <ComingSoon />
        </motion.div>

        {/* Return to Welcome */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6 }}
        >
          <Button
            onClick={handleDone}
            className="px-12 py-6 text-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white"
          >
            <Home className="mr-2 h-5 w-5" />
            Return to Welcome Screen
          </Button>
        </motion.div>

        <p className="text-gray-500 text-sm">
          This screen will automatically return in 30 seconds
        </p>
      </motion.div>
    </div>
  );
}
