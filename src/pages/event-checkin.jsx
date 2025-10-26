import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Calendar, Building2, Mail, Phone, Briefcase, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-client';

const EventCheckin = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company: '',
    phone: '',
    job_title: '',
    referral_source: '',
    survey_responses: {
      primary_interest: '',
      current_challenges: '',
      services_interested: [],
      follow_up_interest: 'yes',
      additional_comments: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSurveyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      survey_responses: {
        ...prev.survey_responses,
        [field]: value
      }
    }));
  };

  const toggleService = (service) => {
    setFormData(prev => {
      const currentServices = prev.survey_responses.services_interested || [];
      const newServices = currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service];

      return {
        ...prev,
        survey_responses: {
          ...prev.survey_responses,
          services_interested: newServices
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.full_name || !formData.email) {
        throw new Error('Name and email are required');
      }

      // Submit to Supabase
      const { data, error: submitError } = await supabase
        .from('event_checkins')
        .insert([{
          full_name: formData.full_name,
          email: formData.email,
          company: formData.company || null,
          phone: formData.phone || null,
          job_title: formData.job_title || null,
          referral_source: formData.referral_source || null,
          survey_responses: formData.survey_responses,
          event_name: 'Disruptors Event'
        }])
        .select();

      if (submitError) throw submitError;

      setIsSuccess(true);
      console.log('✅ Check-in successful:', data);

    } catch (err) {
      console.error('❌ Check-in error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    'AI-Powered Marketing',
    'Custom Web Development',
    'SEO & Content Strategy',
    'Business Process Automation',
    'Brand Strategy & Design',
    'Marketing Audit'
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-slate-900/50 border-emerald-500/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <CardTitle className="text-2xl text-white">You're All Set!</CardTitle>
              <CardDescription className="text-white/60 text-base">
                Thank you for checking in. We're excited to have you at the event!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-white/70 mb-6">
                You'll receive a confirmation email shortly with event details.
              </p>
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({
                    full_name: '',
                    email: '',
                    company: '',
                    phone: '',
                    job_title: '',
                    referral_source: '',
                    survey_responses: {
                      primary_interest: '',
                      current_challenges: '',
                      services_interested: [],
                      follow_up_interest: 'yes',
                      additional_comments: ''
                    }
                  });
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Check In Another Person
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">
            <Calendar className="w-3 h-3 mr-1" />
            Event Check-In
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Disruptors Event</span>
          </h1>
          <p className="text-white/60 text-lg">
            Please fill out your information and complete a quick survey
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-emerald-400" />
                Your Information
              </CardTitle>
              <CardDescription className="text-white/60">
                Let us know who you are
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-white">
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@company.com"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-white">
                    Company
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Acme Inc."
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="job_title" className="text-white">
                    Job Title
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="job_title"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleInputChange}
                      placeholder="Marketing Director"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Referral Source */}
              <div className="space-y-2">
                <Label htmlFor="referral_source" className="text-white">
                  How did you hear about this event?
                </Label>
                <Input
                  id="referral_source"
                  name="referral_source"
                  value={formData.referral_source}
                  onChange={handleInputChange}
                  placeholder="LinkedIn, email, colleague, etc."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Survey Section */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                Quick Survey
              </CardTitle>
              <CardDescription className="text-white/60">
                Help us better understand your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Interest */}
              <div className="space-y-2">
                <Label htmlFor="primary_interest" className="text-white">
                  What brings you to this event?
                </Label>
                <Textarea
                  id="primary_interest"
                  value={formData.survey_responses.primary_interest}
                  onChange={(e) => handleSurveyChange('primary_interest', e.target.value)}
                  placeholder="Looking to improve our marketing, explore AI solutions, etc."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  rows={3}
                />
              </div>

              {/* Current Challenges */}
              <div className="space-y-2">
                <Label htmlFor="current_challenges" className="text-white">
                  What are your biggest business challenges right now?
                </Label>
                <Textarea
                  id="current_challenges"
                  value={formData.survey_responses.current_challenges}
                  onChange={(e) => handleSurveyChange('current_challenges', e.target.value)}
                  placeholder="Lead generation, brand visibility, website performance, etc."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  rows={3}
                />
              </div>

              {/* Services Interested */}
              <div className="space-y-3">
                <Label className="text-white">
                  Which services are you interested in learning more about?
                </Label>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge
                      key={service}
                      onClick={() => toggleService(service)}
                      className={`cursor-pointer transition-all ${
                        formData.survey_responses.services_interested.includes(service)
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Follow-up Interest */}
              <div className="space-y-3">
                <Label className="text-white">
                  Would you like a follow-up consultation?
                </Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => handleSurveyChange('follow_up_interest', 'yes')}
                    variant="outline"
                    className={`flex-1 ${
                      formData.survey_responses.follow_up_interest === 'yes'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    Yes, Please
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSurveyChange('follow_up_interest', 'no')}
                    variant="outline"
                    className={`flex-1 ${
                      formData.survey_responses.follow_up_interest === 'no'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    Not Right Now
                  </Button>
                </div>
              </div>

              {/* Additional Comments */}
              <div className="space-y-2">
                <Label htmlFor="additional_comments" className="text-white">
                  Any additional comments or questions?
                </Label>
                <Textarea
                  id="additional_comments"
                  value={formData.survey_responses.additional_comments}
                  onChange={(e) => handleSurveyChange('additional_comments', e.target.value)}
                  placeholder="Share any thoughts, questions, or topics you'd like to discuss..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg py-6"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Checking In...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Check-In
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default EventCheckin;
