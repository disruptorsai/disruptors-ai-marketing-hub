import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, Users, ArrowRight, Shield } from 'lucide-react';

export default function ConversionDemo() {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour countdown
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    revenue: '',
    challenge: ''
  });

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !showExitIntent) {
        setShowExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showExitIntent]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formStep < 3) {
      setFormStep(formStep + 1);
    } else {
      // Submit form
      console.log('Form submitted:', formData);
      alert('Thank you! We\'ll contact you within 24 hours.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Urgency Bar */}
      <div className="sticky top-0 z-50 bg-[#FFD700] text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <span className="font-bold">Limited Time Offer Expires In: {formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">23 spots remaining</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
        {/* Athena Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-15"
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/roman-army-painting.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-[#FFD700] text-black rounded-full text-sm font-bold mb-6">
                ⚡ DIGITAL MARKETING × AI SOLUTIONS
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Marketing + AI =
                <br />
                <span className="text-gold-shine">90 Days or Less</span>
              </h1>
              <p className="text-xl text-[#EAEAEA] mb-8">
                Join 500+ businesses using AI to generate predictable, scalable growth
              </p>

              {/* Value Proposition Stack */}
              <div className="space-y-4 mb-8">
                {[
                  "AI-powered lead generation systems",
                  "Done-for-you implementation in 14 days",
                  "Guaranteed ROI or your money back",
                  "24/7 support and optimization"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-gold-shine flex-shrink-0" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-6 border-t border-[#2A2A2A]">
                <div>
                  <div className="text-3xl font-bold">4.9/5</div>
                  <div className="text-sm text-[#C7C7C7]">500+ Reviews</div>
                </div>
                <div className="h-12 w-px bg-gray-700"></div>
                <div>
                  <div className="text-3xl font-bold">$50M+</div>
                  <div className="text-sm text-[#C7C7C7]">Client Revenue</div>
                </div>
                <div className="h-12 w-px bg-gray-700"></div>
                <div>
                  <div className="text-3xl font-bold">300%</div>
                  <div className="text-sm text-[#C7C7C7]">Avg Growth</div>
                </div>
              </div>
            </div>

            {/* Multi-Step Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formStep === 1 && "Step 1: Your Information"}
                    {formStep === 2 && "Step 2: Your Business"}
                    {formStep === 3 && "Step 3: Your Challenge"}
                  </h3>
                  <span className="text-sm text-gray-500">Step {formStep} of 3</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-2 flex-1 rounded-full ${
                        step <= formStep ? 'bg-[#FFD700]' : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleFormSubmit}>
                {formStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FFD700] focus:outline-none text-gray-900"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FFD700] focus:outline-none text-gray-900"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                )}

                {formStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FFD700] focus:outline-none text-gray-900"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        placeholder="Your Company Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Annual Revenue *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FFD700] focus:outline-none text-gray-900"
                        value={formData.revenue}
                        onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                      >
                        <option value="">Select revenue range</option>
                        <option value="0-500k">$0 - $500K</option>
                        <option value="500k-1m">$500K - $1M</option>
                        <option value="1m-5m">$1M - $5M</option>
                        <option value="5m+">$5M+</option>
                      </select>
                    </div>
                  </div>
                )}

                {formStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What's your biggest marketing challenge? *
                      </label>
                      <textarea
                        required
                        rows={5}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FFD700] focus:outline-none text-gray-900 resize-none"
                        value={formData.challenge}
                        onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                        placeholder="Tell us about your current situation..."
                      ></textarea>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-6 bg-[#FFD700] hover:bg-[#E0B200] text-black font-bold py-4 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  {formStep < 3 ? 'Continue' : 'Get My Free Strategy Session'}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Your information is 100% secure</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Scarcity Section */}
      <section className="py-12 bg-yellow-50 border-y-4 border-[#FFD700]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ⚠️ Only 23 Strategy Sessions Available This Month
            </h3>
            <p className="text-lg text-gray-700">
              Due to high demand, we're limiting new clients to ensure quality delivery.
              <br />
              <span className="font-bold text-gold-shine">Don't miss this opportunity.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits with Clear Hierarchy */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What You Get When You Join Today
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to dominate your market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Lead Generation System",
                value: "$15,000 value",
                features: ["Automated prospect targeting", "24/7 lead capture", "CRM integration"]
              },
              {
                title: "Done-For-You Setup",
                value: "$5,000 value",
                features: ["White-glove onboarding", "Custom workflows", "Team training"]
              },
              {
                title: "Ongoing Optimization",
                value: "$3,000/mo value",
                features: ["Weekly performance reviews", "A/B testing", "ROI tracking"]
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border-2 border-[#0E0E0E] shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="inline-block bg-[#FFD700] text-black font-bold text-sm px-3 py-1 rounded-full mb-3">{item.value}</div>
                <h3 className="text-2xl font-bold text-[#0E0E0E] mb-6">{item.title}</h3>
                <ul className="space-y-3">
                  {item.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-gold-shine flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-block bg-[#0E0E0E] text-white px-12 py-6 rounded-2xl border-4 border-[#FFD700] shadow-2xl">
              <div className="text-sm font-semibold mb-2 text-[#C7C7C7]">Total Value: $23,000+</div>
              <div className="text-4xl font-bold text-gold-shine">Your Investment: $4,997</div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            90-Day Money-Back Guarantee
          </h2>
          <p className="text-xl text-gray-700">
            If you don't see a measurable increase in qualified leads within 90 days,
            we'll refund 100% of your investment. No questions asked.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-[#EAEAEA] mb-8">
            Join 500+ companies generating predictable growth with AI
          </p>
          <button className="bg-[#FFD700] hover:bg-[#E0B200] text-black px-16 py-6 rounded-full text-2xl font-bold transition-all hover:scale-105 shadow-2xl">
            Claim Your Strategy Session
          </button>
          <p className="text-[#C7C7C7] mt-6 text-sm">
            💳 No credit card required • 🔒 100% secure • ⏰ Offer expires in {formatTime(timeLeft)}
          </p>
        </div>
      </section>

      {/* Exit Intent Popup */}
      <AnimatePresence>
        {showExitIntent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0E0E0E]/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowExitIntent(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowExitIntent(false)}
                className="absolute top-4 right-4 text-[#C7C7C7] hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Wait! Don't Miss This Opportunity
                </h3>
                <p className="text-xl text-gray-600 mb-6">
                  Get 50% off your first month when you schedule today
                </p>

                <div className="bg-yellow-50 border-2 border-[#FFD700] rounded-2xl p-6 mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    Save $2,498
                  </div>
                  <div className="text-gray-600">
                    This one-time offer expires when you close this window
                  </div>
                </div>

                <button className="w-full bg-[#FFD700] hover:bg-[#E0B200] text-black font-bold py-4 rounded-xl transition-all hover:scale-105 mb-4">
                  Claim 50% Discount Now
                </button>

                <button
                  onClick={() => setShowExitIntent(false)}
                  className="text-gray-500 text-sm hover:text-gray-700"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
