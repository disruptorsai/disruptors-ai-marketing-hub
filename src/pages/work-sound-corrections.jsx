import React from 'react';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, TrendingUp, Clock, Users, ArrowRight, Target, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const caseData = {
  title: "Sound Corrections Audio Innovation Platform",
  client: "Sound Corrections",
  meta: { industry: "Audio Technology", services: "Web Development, AI Integration, Studio" },
  overview: "Built a cutting-edge audio processing platform that leverages AI to deliver professional-grade sound correction and enhancement services.",
  challenge: "Manual audio processing workflows were time-intensive and inconsistent, limiting scalability and client satisfaction in the competitive audio market.",
  approach: "Developed an AI-powered audio processing platform with real-time correction capabilities, client portals, and automated workflow management.",
  results: [
    { icon: TrendingUp, value: "+400%", label: "Processing Speed" },
    { icon: Clock, value: "-90%", label: "Manual Work" },
    { icon: Users, value: "+180%", label: "Client Capacity" },
    { icon: CheckCircle, value: "99.9%", label: "Quality Score" }
  ],
  services: [
    { icon: Globe, name: "Audio Platform" },
    { icon: Zap, name: "AI Processing" },
    { icon: Target, name: "Studio Integration" }
  ],
  testimonial: "The AI platform has completely transformed our business. We can now serve 10x more clients with better quality.",
  clientLogo: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/case-studies/soundcorrections_logo.svg",
  heroImage: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2070&auto=format&fit=crop"
};

export default function WorkSoundCorrections() {
  usePageMeta({
    title: 'Sound Corrections Case Study | Disruptors Media',
    description: 'How Disruptors Media built an AI audio platform that boosted Sound Corrections’ processing speed by 400% while cutting manual work by 90%.',
    path: '/work-sound-corrections',
    jsonLd: [
      breadcrumb('Sound Corrections Case Study', '/work-sound-corrections'),
      {
        '@context': 'https://schema.org',
        '@type': 'Review',
        itemReviewed: { '@type': 'Organization', name: 'Disruptors Media' },
        author: { '@type': 'Organization', name: caseData.client },
        reviewBody: caseData.testimonial,
      },
    ],
  });

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
                    <service.icon className="w-6 h-6 text-gold-shine" />
                  </div>
                  <p className="font-semibold text-black">{service.name}</p>
                </div>
              ))}
            </div>
          </Section>
          
          {/* Visual Mockup */}
          <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} transition={{duration:0.8}} viewport={{once:true}}>
            <div className="aspect-[16/9] bg-white/50 p-4 rounded-2xl border border-gray-300">
               <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" alt="Project Mockup" className="rounded-xl w-full h-full object-cover" />
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
              <Link to={createPageUrl("book-strategy-session")}>Start Your Project <ArrowRight className="w-5 h-5 ml-2" /></Link>
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