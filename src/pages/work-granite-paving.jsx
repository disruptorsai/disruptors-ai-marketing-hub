import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, TrendingUp, Clock, Users, ArrowRight, Target, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const caseData = {
  title: "Granite Paving Digital Growth Platform",
  client: "Granite Paving",
  meta: { industry: "Construction & Landscaping", services: "Web Development, Digital Marketing, Content" },
  overview: "Built a comprehensive digital platform that transformed Granite Paving from a local contractor to a regional leader in paving and landscaping services.",
  challenge: "Limited online presence, manual project management, and difficulty showcasing completed work were restricting business growth and market reach.",
  approach: "Created a full digital ecosystem including a showcase website, project management tools, and automated lead generation system with portfolio integration.",
  results: [
    { icon: TrendingUp, value: "+380%", label: "Lead Generation" },
    { icon: Clock, value: "-65%", label: "Project Timeline" },
    { icon: Users, value: "+250%", label: "Service Area" },
    { icon: CheckCircle, value: "98%", label: "Client Satisfaction" }
  ],
  services: [
    { icon: Globe, name: "Showcase Website" },
    { icon: Zap, name: "Project Management" },
    { icon: Target, name: "Lead Generation" }
  ],
  testimonial: "Our business has grown exponentially since launching the new platform. The project showcases are incredible.",
  clientLogo: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167806/case-studies/case-studies/granitepaving_logo.png",
  heroImage: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop"
};

export default function WorkGranitePaving() {
  return (
    <div className="bg-transparent text-black min-h-screen">
      {/* Hero */}
      <div className="relative bg-transparent py-24 sm:py-32 -mt-20 overflow-hidden">
        <img src={caseData.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/70"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="mx-auto max-w-5xl px-6 lg:px-8 relative pt-20">
          <motion.div initial={{ opacity: 0, y:30 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.8 }} className="text-center">
            {/* Industry Tags */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="px-4 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-semibold">
                {caseData.meta.industry}
              </span>
              <span className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-gray-300 text-sm">
                Case Study
              </span>
            </div>

            {/* Logo */}
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              src={caseData.clientLogo}
              alt={caseData.client}
              className="h-20 mx-auto mb-8 filter brightness-0 invert drop-shadow-lg"
            />

            {/* Title */}
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6 leading-tight">
              {caseData.title}
            </h1>

            {/* Services */}
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              {caseData.meta.services.split(', ').map((service, i) => (
                <span key={i} className="text-gray-400 text-sm">
                  {service}{i < caseData.meta.services.split(', ').length - 1 && ' •'}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-xl leading-relaxed text-gray-200 max-w-3xl mx-auto font-light">
              {caseData.overview}
            </p>
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
               <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" alt="Project Mockup" className="rounded-xl w-full h-full object-cover" />
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