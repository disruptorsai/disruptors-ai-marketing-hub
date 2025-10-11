import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

export default function BookStrategySession() {
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    website: "",
    monthlyRevenue: "",
    notes: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Integrate with GHL webhook + Calendar
      // await functions.submitStrategySession(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12 bg-white/80 backdrop-blur-md rounded-3xl p-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-6">
              Book a Free Strategy Session
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Let's discuss how we can tailor an AI-powered growth strategy for your business. 
              This 45-minute session will give you actionable insights whether we work together or not.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 shadow-lg">
            {isSubmitted ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Thank you!</h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md">
                  Your request has been submitted. Our team will reach out within 24 hours to schedule your session.
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 max-w-md">
                  <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• We'll email you within 24 hours</li>
                    <li>• Schedule a 45-minute strategy call</li>
                    <li>• Receive a custom growth roadmap</li>
                  </ul>
                </div>
                
                {/* TODO: Embed calendar widget here */}
                <div className="mt-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                  <p className="text-xs font-mono text-gray-500">
                    [CALENDAR EMBED: GHL Integration]
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8" id="strategy-session-form">
                {/* Full Name & Business Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="font-semibold">
                      Full Name *
                    </Label>
                    <Input 
                      id="fullName" 
                      type="text" 
                      required 
                      value={formData.fullName} 
                      onChange={(e) => handleInputChange("fullName", e.target.value)} 
                      className="mt-2" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessName" className="font-semibold">
                      Business Name
                    </Label>
                    <Input 
                      id="businessName" 
                      type="text" 
                      value={formData.businessName} 
                      onChange={(e) => handleInputChange("businessName", e.target.value)} 
                      className="mt-2" 
                      placeholder="Your Company, Inc." 
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="font-semibold">
                      Email Address *
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={(e) => handleInputChange("email", e.target.value)} 
                      className="mt-2" 
                      placeholder="you@company.com" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="font-semibold">
                      Phone Number
                    </Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => handleInputChange("phone", e.target.value)} 
                      className="mt-2" 
                      placeholder="(555) 123-4567" 
                    />
                  </div>
                </div>

                {/* Website & Revenue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="website" className="font-semibold">
                      Business Website
                    </Label>
                    <Input 
                      id="website" 
                      type="url" 
                      value={formData.website} 
                      onChange={(e) => handleInputChange("website", e.target.value)} 
                      className="mt-2" 
                      placeholder="https://yourcompany.com" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyRevenue" className="font-semibold">
                      Monthly Revenue
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("monthlyRevenue", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select revenue range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-10k">$0 - $10,000</SelectItem>
                        <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                        <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                        <SelectItem value="500k+">$500,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="font-semibold">
                    Tell us about your biggest marketing challenge (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="mt-2 h-24"
                    placeholder="What's your biggest struggle with lead generation, operations, or growth?"
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full text-lg py-6"
                  >
                    {isSubmitting ? 'Submitting...' : 'Book My Free Strategy Session'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    By submitting, you consent to us contacting you to schedule your session. 
                    We respect your privacy and will never share your information.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Secondary CTA */}
          {!isSubmitted && (
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Looking for something else?</p>
              <Button asChild variant="outline">
                <Link to={createPageUrl('free-business-audit')}>Get a Free Marketing Assessment Instead</Link>
              </Button>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6">
                <h4 className="font-semibold mb-2">What happens during the strategy session?</h4>
                <p className="text-gray-600 text-sm">We'll audit your current marketing, identify opportunities, and create a custom roadmap for growth—whether you work with us or not.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6">
                <h4 className="font-semibold mb-2">Is this really free?</h4>
                <p className="text-gray-600 text-sm">Yes, completely free. We believe in providing value first. You'll get actionable insights regardless of whether we work together.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6">
                <h4 className="font-semibold mb-2">How long is the session?</h4>
                <p className="text-gray-600 text-sm">45 minutes. We'll dive deep into your challenges and provide a clear action plan you can implement immediately.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}