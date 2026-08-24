import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import AlternatingLayout from '../components/shared/AlternatingLayout';
import PageTitle from '../components/shared/PageTitle';

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const webhookUrl = import.meta.env.VITE_GHL_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("GHL webhook URL not configured");
      setIsSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          message: formData.message,
          source: "website_contact_form",
        }),
      });

      if (!response.ok) throw new Error("Failed to send");
      setIsSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactHeroData = [
    {
      kicker: "GET IN TOUCH",
      headline: "Let's Start Your Transformation",
      body: "Have a question or a project in mind? We'd love to hear from you. Whether you're looking to automate your marketing, implement AI solutions, or scale your business, our team is here to help you succeed.",
      image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2374&q=80",
      imageAlt: "Contact and communication",
      backgroundColor: "bg-white",
      textColor: "text-black"
    }
  ];

  return (
    <div>
      {/* Page Title */}
      <PageTitle title="CONTACT" />

      {/* Enhanced Hero Section */}
      <AlternatingLayout sections={contactHeroData} />

      <div className="bg-white py-6 sm:py-10 md:py-12">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            {isSubmitted ? (
              <div className="text-center py-8 sm:py-12 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px]">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Thank you!</h3>
                <p className="text-sm sm:text-base text-black px-4">Your message has been sent. We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="name" className="font-semibold text-black text-sm sm:text-base">Full Name</Label>
                  <Input id="name" type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-2 h-11 sm:h-12 text-base touch-manipulation" placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="email" className="font-semibold text-black text-sm sm:text-base">Email Address</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-2 h-11 sm:h-12 text-base touch-manipulation" placeholder="you@company.com" />
                </div>
                <div>
                  <Label htmlFor="message" className="font-semibold text-black text-sm sm:text-base">Message</Label>
                  <Textarea id="message" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="mt-2 text-base touch-manipulation min-h-[120px] sm:min-h-[140px]" placeholder="How can we help?" rows={5}/>
                </div>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <div className="pt-2 sm:pt-4">
                  <Button type="submit" disabled={isSubmitting} className="w-full text-base sm:text-lg py-5 sm:py-6 h-auto touch-manipulation">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}