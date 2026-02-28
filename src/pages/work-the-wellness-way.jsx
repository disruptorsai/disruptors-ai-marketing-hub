
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const caseData = {
  title: "The Wellness Way Digital Health Platform",
  client: "The Wellness Way",
  meta: { industry: "Healthcare & Wellness", services: "Content Production, Digital Transformation" },
  overview: "Created a comprehensive wellness platform that connects practitioners with patients through innovative AI-powered health assessments and content delivery.",
  challenge: "Fragmented patient communication, inconsistent health information delivery, and limited scalability of personalized wellness programs.",
  approach: "Developed an integrated platform featuring AI health assessments, personalized wellness plans, and a robust content management system for practitioners.",
  results: [
    // Stats removed as per request
  ],
  services: [
    { icon: Globe, name: "Health Platform" },
    { icon: Zap, name: "AI Assessments" },
    { icon: Target, name: "Content Systems" }
  ],
  testimonial: "I have been so impressed — they've gotten me millions of views on my social media, and I've seen a large uptick in new patients in my office. The strategy and support they've given is significantly better than the 5 or so other marketing companies I've worked with.",
  testimonialAuthor: "Jason Painter, Healthcare Practice",
  clientLogo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167810/case-studies/case-studies/thewellnessway_logo.webp",
  heroImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2070&auto=format&fit=crop"
};

export default function WorkTheWellnessWay() {
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
                <div key={service.name} className="flex flex-col items-center text-center p-6 bg-[#E0E0E0] border border-[#C7C7C7] rounded-xl hover:border-[#FFD700]/30 transition-colors">
                  <div className="w-12 h-12 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-gold-shine" />
                  </div>
                  <p className="font-semibold text-gray-800">{service.name}</p>
                </div>
              ))}
            </div>
          </Section>
          
          {/* Visual Mockup */}
          <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} transition={{duration:0.8}} viewport={{once:true}}>
            <div className="aspect-[16/9] bg-[#E0E0E0] p-4 rounded-2xl border border-[#C7C7C7]">
               <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=2070&auto=format&fit=crop" alt="Project Mockup" className="rounded-xl w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Testimonial */}
          <div className="bg-[#E0E0E0] border border-[#C7C7C7] rounded-2xl p-8 sm:p-12 text-center">
            <p className="text-xl sm:text-2xl italic text-gray-800 mb-4">"{caseData.testimonial}"</p>
            <p className="text-[#6B7280]">- {caseData.testimonialAuthor || caseData.client}</p>
          </div>

          {/* CTA */}
          <div className="text-center pt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Ready for similar results?</h3>
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
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    {content && <p className="text-[#6B7280] leading-relaxed">{content}</p>}
    {children}
  </motion.div>
);
