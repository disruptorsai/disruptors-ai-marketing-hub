import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useConnectStore } from '@/lib/connect/store';
import { useIdleTimer } from '@/hooks/connect/useIdleTimer';

export default function ConnectIntake() {
  const navigate = useNavigate();
  const { sessionId, eventId, kioskId, setContact } = useConnectStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    role: '',
    consentFeedback: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-return to welcome after 20s of inactivity
  useIdleTimer(20000);

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Basic phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Basic email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Call check-in API
      const response = await fetch('/.netlify/functions/checkin-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventId || 'connect-2025-10',
          sessionId,
          kioskId: kioskId || 'kiosk-001',
          contactPayload: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            company: formData.company,
            role: formData.role
          },
          consent: {
            feedback: formData.consentFeedback,
            sms: formData.consentFeedback
          },
          source: 'kiosk',
          requestId: crypto.randomUUID()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setContact(data);
        navigate('/eventqr/poll');
      } else {
        setErrors({ submit: data.error || 'Check-in failed. Please try again.' });
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setErrors({ submit: 'Network error. Please check your connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col font-montreal">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/40 border-b border-[#FFD700]/20 p-6 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate('/eventqr')}
            variant="ghost"
            className="text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10 h-12 px-6 text-lg"
          >
            <ArrowLeft className="mr-2 h-6 w-6" />
            Back to Welcome
          </Button>

          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#FFD700]" />
            <span className="text-[#FFD700] text-lg font-semibold">Check-In</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl"
        >
          {/* Title */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] mb-4"
            >
              Welcome to Disruptors Connect
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-400 font-medium"
            >
              Let's get you checked in
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="firstName" className="text-white text-xl mb-3 block">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="h-20 text-xl bg-black/60 border-2 border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700] rounded-xl backdrop-blur-sm"
                  placeholder="John"
                  autoFocus
                />
                {errors.firstName && (
                  <p className="text-red-400 text-base mt-2">{errors.firstName}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Label htmlFor="lastName" className="text-white text-xl mb-3 block">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="h-20 text-xl bg-black/60 border-2 border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700] rounded-xl backdrop-blur-sm"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-base mt-2">{errors.lastName}</p>
                )}
              </motion.div>
            </div>

            {/* Contact Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Label htmlFor="phone" className="text-white text-xl mb-3 block">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="h-20 text-xl bg-black/60 border-2 border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700] rounded-xl backdrop-blur-sm"
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-red-400 text-base mt-2">{errors.phone}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Label htmlFor="email" className="text-white text-xl mb-3 block">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="h-20 text-xl bg-black/60 border-2 border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700] rounded-xl backdrop-blur-sm"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-base mt-2">{errors.email}</p>
                )}
              </motion.div>
            </div>

            {/* Company & Role */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Label htmlFor="company" className="text-white text-xl mb-3 block">
                  Company (Optional)
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="h-20 text-xl bg-black/60 border-2 border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700] rounded-xl backdrop-blur-sm"
                  placeholder="Acme Inc."
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Label htmlFor="role" className="text-white text-xl mb-3 block">
                  Role (Optional)
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="h-20 text-xl bg-black/60 border-2 border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700] rounded-xl backdrop-blur-sm"
                  placeholder="Founder, Developer, etc."
                />
              </motion.div>
            </div>

            {/* Consent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-black/60 border-2 border-[#FFD700]/30 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-start gap-6">
                <Checkbox
                  id="consent"
                  checked={formData.consentFeedback}
                  onCheckedChange={(checked) => handleChange('consentFeedback', checked)}
                  className="mt-2 w-8 h-8 border-2 border-[#FFD700]/50 data-[state=checked]:bg-[#FFD700] data-[state=checked]:text-black"
                />
                <Label htmlFor="consent" className="text-white text-lg leading-relaxed cursor-pointer flex-1">
                  <span className="font-semibold text-[#FFD700]">Would you be open to giving us your honest feedback after the event?</span>
                  <span className="block text-gray-400 text-base mt-3">
                    By checking Yes, you agree to receive event reminders and a short feedback survey.
                    Msg & data rates may apply. Reply STOP to opt out.
                  </span>
                </Label>
              </div>
            </motion.div>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-900/20 border-2 border-red-500/50 rounded-2xl p-6 text-red-400 text-center text-lg backdrop-blur-sm"
              >
                {errors.submit}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-24 text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-yellow-600 hover:from-yellow-600 hover:to-[#FFD700] text-black shadow-2xl shadow-[#FFD700]/40 rounded-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {isSubmitting ? (
                    <>
                      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      Continue to Poll
                      <ArrowRight className="h-10 w-10" />
                    </>
                  )}
                </span>
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
