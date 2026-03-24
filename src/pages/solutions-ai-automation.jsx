import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'AI Automation & Infrastructure',
  h2: 'Build Your AI-Powered Future.',
  descriptivePhrase: 'Streamline. Automate. Scale.',
  overview: 'Our AI automation services help businesses streamline operations, generate leads, and scale with efficiency by integrating advanced tools like GoHighLevel, n8n, and custom AI systems. We design tailored solutions that eliminate repetitive tasks, enhance customer engagement, and drive measurable ROI. Whether you need automated marketing, CRM workflows, or AI-powered content systems, we create scalable infrastructure that grows with your business.',
  image: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/hand-human.png',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/ai-automation.jpg',
  heroVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/dmsite/services/ai-automation.mp4',
  cardVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/dmsite/services/ai-automation.mp4',
  outcomes: [
    {
      title: 'Eliminate Repetitive Tasks',
      description: 'Automate workflows that drain time and resources, freeing your team to focus on high-value strategic work.'
    },
    {
      title: 'Scale Operations Efficiently',
      description: 'Handle increased volume without proportional cost increases through intelligent automation systems.'
    },
    {
      title: 'Measurable ROI',
      description: 'Track clear metrics showing time saved, costs reduced, and revenue generated through automation.'
    }
  ],
  process: [
    {
      title: 'Discovery & Audit',
      description: 'We analyze your current workflows to identify automation opportunities and inefficiencies costing you time and money.'
    },
    {
      title: 'Strategy & Design',
      description: 'Our team designs custom automation systems tailored to your business processes, tools, and growth objectives.'
    },
    {
      title: 'Build & Integration',
      description: 'We implement your automation infrastructure, integrating with existing tools and ensuring seamless operation.'
    },
    {
      title: 'Optimize & Scale',
      description: 'Continuous monitoring and refinement ensure your systems evolve with your business and maximize ROI.'
    }
  ],
  features: [
    {
      title: 'Marketing Automation',
      description: 'Automated email sequences, lead nurturing, and campaign management'
    },
    {
      title: 'CRM Workflow Automation',
      description: 'Automated data entry, follow-ups, and pipeline management'
    },
    {
      title: 'AI-Powered Content Systems',
      description: 'Content generation, distribution, and optimization with AI assistance'
    },
    {
      title: 'Lead Generation Automation',
      description: 'Automated outreach, qualification, and scheduling systems'
    },
    {
      title: 'Custom Integration Development',
      description: 'Connect disparate tools and create unified workflows'
    },
    {
      title: 'Process Documentation',
      description: 'Complete documentation and training for your team'
    },
    {
      title: 'Performance Monitoring',
      description: 'Real-time dashboards tracking automation performance and ROI'
    },
    {
      title: 'Ongoing Support & Optimization',
      description: 'Continuous refinement and expansion of your automation systems'
    }
  ],
  faqs: [
    {
      question: 'What tools and platforms do you work with?',
      answer: 'We work with leading automation platforms including GoHighLevel, n8n, Make (Integromat), Zapier, and custom API integrations. We also build proprietary automation systems tailored to your specific needs when off-the-shelf solutions fall short.'
    },
    {
      question: 'How long does it take to implement automation systems?',
      answer: 'Simple automation workflows can be implemented in 1-2 weeks, while comprehensive automation infrastructure typically takes 4-8 weeks. Timeline depends on complexity, number of integrations, and your current systems. We provide detailed timelines during discovery.'
    },
    {
      question: 'What kind of ROI can I expect from automation?',
      answer: 'Most clients see 5-10x ROI within the first year through time savings, increased efficiency, and reduced errors. Typical time savings range from 10-30 hours per week, equivalent to hiring 0.25-0.75 full-time employees. We track metrics throughout to ensure measurable impact.'
    },
    {
      question: 'Do I need technical expertise to maintain the automations?',
      answer: 'No. We build systems that are maintainable by non-technical teams and provide comprehensive documentation and training. For complex systems, we offer ongoing support and maintenance packages so you never have to worry about technical issues.'
    },
    {
      question: 'Can you automate processes in my specific industry?',
      answer: 'Yes. We have experience automating processes across manufacturing, professional services, healthcare, real estate, e-commerce, and more. Industry-specific compliance and regulations are factored into every automation system we build.'
    }
  ],
  testimonials: [
    {
      name: 'Alde Nguyen',
      company: 'Google Review',
      quote: 'Disruptors are a brilliant full-suite marketing and product agency. They handled entire operations for our rollouts and campaigns, producing phenomenal creative assets and positioning our brand competitively. They optimized our go-to-market strategy, overdelivering beyond forecasts by large margins.'
    },
    {
      name: 'Chris',
      company: 'Google Review',
      quote: 'Professional, well organized, and knowledgeable. If you\'re looking for a company that can drive revenue and expand your business success, this is the right place for you.'
    }
  ],
  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session'
};

export default function AiAutomation() {
  return <SolutionPageLayout service={service} />;
}