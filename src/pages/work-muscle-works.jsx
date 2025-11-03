
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const caseData = {
  title: "Muscle Works Fitness Management System",
  client: "Muscle Works",
  meta: { industry: "Health & Fitness", services: "Digital Transformation, AI Strategy, Content" },
  overview: "Created a comprehensive fitness management platform that revolutionized how Muscle Works tracks member progress and optimizes workout programs.",
  challenge: "Manual member tracking, inconsistent program delivery, and limited ability to scale personalized fitness coaching across multiple locations.",
  approach: "Developed an AI-powered fitness management system with automated progress tracking, personalized workout generation, and comprehensive member analytics.",
  results: [
    // Stats removed as per request
  ],
  services: [
    { icon: Globe, name: "Fitness Platform" },
    { icon: Zap, name: "AI Coaching" },
    { icon: Target, name: "Progress Analytics" }
  ],
  testimonial: "The platform has transformed our gym. Members love the personalized approach and we're seeing incredible results.",
  clientLogo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759862158/case-studies/case-studies/muscleworks_logo.png",
  heroImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
};

export default function WorkMuscleWorks() {
  return (
    <div className="bg-transparent text-black min-h-screen">
      {/* Hero */}
      <div className="relative bg-transparent py-24 sm:py-32 -mt-20">
        <img src={caseData.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center relative pt-20">
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.6 }}>
            <img src={caseData.clientLogo} alt={caseData.client} className="h-16 mx-auto mb-6 filter brightness-0 invert" />
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{caseData.title}</h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">{caseData.overview}</p>
          </motion.div>
        </div>
      </div>

      <div className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
          
          {/* Metrics section removed */}

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <Section title="The Challenge" content={caseData.challenge} />
            <Section title="Our Approach" content={caseData.approach} />
          </div>

          {/* Services Provided */}
          <Section title="Services Provided">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-6">
              {caseData.services.map(service => (
                <div key={service.name} className="flex flex-col items-center text-center p-6 bg-white/50 border border-gray-300 rounded-xl hover:border-[#FFD700]/30 transition-colors">
                  <div className="w-12 h-12 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-[#FFD700]" />
                  </div>
                  <p className="font-semibold text-black">{service.name}</p>
                </div>
              ))}
            </div>
          </Section>
          
          {/* Visual Mockup */}
          <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} transition={{duration:0.8}} viewport={{once:true}}>
            <div className="aspect-[16/9] bg-white/50 p-4 rounded-2xl border border-gray-300">
               <img src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=2131&auto=format&fit=crop" alt="Project Mockup" className="rounded-xl w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Testimonial */}
          <div className="bg-white/50 border border-gray-300 rounded-2xl p-8 sm:p-12 text-center">
            <p className="text-xl sm:text-2xl italic text-black mb-4">"{caseData.testimonial}"</p>
            <p className="text-black">- {caseData.client}</p>
          </div>

          {/* CTA */}
          <div className="text-center pt-8">
            <h3 className="text-2xl font-bold text-black mb-6">Ready for similar results?</h3>
            <Button asChild size="lg" className="bg-[#FFD700] text-black font-semibold hover:bg-[#E0B200] rounded-xl px-8 py-3">
              <Link to={createPageUrl("contact")}>Start Your Project <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, content, children }) => (
  <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{duration:0.6}} viewport={{once: true}}>
    <h2 className="text-2xl font-bold text-black mb-4">{title}</h2>
    {content && <p className="text-black leading-relaxed">{content}</p>}
    {children}
  </motion.div>
);
