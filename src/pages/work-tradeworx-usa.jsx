import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, TrendingUp, Clock, Users, ArrowRight, Target, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const caseData = {
  title: "TradeWorx USA Digital Transformation",
  client: "TradeWorx USA",
  meta: { industry: "Construction & Trading", services: "Digital Transformation, Web Development" },
  overview: "A complete digital overhaul that modernized TradeWorx USA's operations and significantly improved their customer acquisition and retention rates.",
  challenge: "Outdated systems, manual processes, and limited online presence were hindering growth and efficiency in a competitive market.",
  approach: "Comprehensive digital transformation including modern web platform, automated workflows, and integrated CRM system with AI-powered lead scoring.",
  results: [
    { icon: TrendingUp, value: "+185%", label: "Lead Generation" },
    { icon: Clock, value: "-65%", label: "Process Time" },
    { icon: Users, value: "+120%", label: "Customer Retention" },
    { icon: CheckCircle, value: "98%", label: "System Uptime" }
  ],
  services: [
    { icon: Globe, name: "Web Development" },
    { icon: Zap, name: "Process Automation" },
    { icon: Target, name: "CRM Integration" }
  ],
  testimonial: "The team transformed our entire operation. We've never been more efficient or profitable.",
  clientLogo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167812/case-studies/case-studies/tradeworxusa_logo.svg",
  heroImage: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2070&auto=format&fit=crop"
};

export default function WorkTradeWorxUSA() {
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
          
          {/* Metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {caseData.results.map((item, i) => (
              <motion.div key={item.label} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{duration:0.5, delay: i * 0.1}} viewport={{once: true}}>
                <div className="w-16 h-16 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-[#FFD700]" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-black">{item.value}</p>
                <p className="text-sm text-black mt-1">{item.label}</p>
              </motion.div>
            ))}
          </section>

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
               <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" alt="Project Mockup" className="rounded-xl w-full h-full object-cover" />
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