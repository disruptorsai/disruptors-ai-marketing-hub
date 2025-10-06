import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'Fractional CMO',
  h2: 'Strategic Leadership on Demand.',
  descriptivePhrase: 'Executive Level Marketing, at a Fraction of the Cost',
  overview: 'Get the benefit of a seasoned Chief Marketing Officer without the full-time executive salary. Our Fractional CMO service provides the high-level strategy, team leadership, and data-driven insights you need to scale your marketing efforts effectively. We work as an extension of your team to guide your marketing vision, manage execution, and ensure every initiative is aligned with your business objectives.',
  image: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/services-img.png',
  heroImage: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758737704/disruptors-ai/services/fractional-cmo.png',
  outcomes: [
    {
      title: 'Strategic Direction',
      description: 'Get clear, actionable marketing strategy from someone who has built and scaled marketing departments.'
    },
    {
      title: 'Team Alignment',
      description: 'Unite your marketing efforts under cohesive leadership that keeps everyone moving toward the same goals.'
    },
    {
      title: 'Executive Experience',
      description: 'Access senior-level expertise and decision-making without the $200K+ salary and equity.'
    }
  ],
  process: [
    {
      title: 'Strategic Assessment',
      description: 'Comprehensive audit of your current marketing, competitive landscape, and growth opportunities.'
    },
    {
      title: 'Roadmap Development',
      description: 'Create a strategic marketing plan with clear priorities, timelines, and measurable objectives.'
    },
    {
      title: 'Implementation & Leadership',
      description: 'Guide your team, vendors, and initiatives while providing hands-on strategic leadership and decision-making.'
    },
    {
      title: 'Measurement & Optimization',
      description: 'Track performance against objectives, provide executive reporting, and continuously refine strategy.'
    }
  ],
  features: [
    {
      title: 'Marketing Strategy Development',
      description: 'Comprehensive marketing plans aligned with business objectives'
    },
    {
      title: 'Team Leadership & Management',
      description: 'Guide internal teams and external agencies toward unified goals'
    },
    {
      title: 'Budget Planning & Allocation',
      description: 'Optimize marketing spend across channels for maximum ROI'
    },
    {
      title: 'Channel Strategy & Optimization',
      description: 'Determine the right marketing mix for your business and audience'
    },
    {
      title: 'Brand Positioning & Messaging',
      description: 'Develop compelling brand narratives and differentiation strategies'
    },
    {
      title: 'Marketing Technology Stack',
      description: 'Select and implement the right tools and systems for growth'
    },
    {
      title: 'Executive Reporting & Insights',
      description: 'Regular strategic updates and data-driven recommendations'
    },
    {
      title: 'Vendor & Agency Management',
      description: 'Oversee external partners and ensure accountability and results'
    }
  ],
  faqs: [
    {
      question: 'What is a Fractional CMO and how is it different from a consultant?',
      answer: 'A Fractional CMO is a senior marketing executive who works part-time as a member of your leadership team. Unlike consultants who provide advice, Fractional CMOs provide strategic leadership, make decisions, manage teams, and are accountable for marketing results. You get executive-level expertise without the full-time cost.'
    },
    {
      question: 'How much time commitment is required?',
      answer: 'Typical engagements range from 10-20 hours per week depending on your needs and growth stage. This includes strategic planning, team meetings, vendor management, and executive reporting. The commitment is flexible and scales with your business requirements.'
    },
    {
      question: 'What size companies benefit from a Fractional CMO?',
      answer: 'Companies with $2M-$50M in revenue benefit most. At this stage, you need strategic marketing leadership but cannot justify or afford a $200K+ full-time CMO. Startups preparing for rapid growth and established companies looking to scale also see significant value.'
    },
    {
      question: 'Do you execute marketing or just provide strategy?',
      answer: 'We focus on strategy, leadership, and team management while your internal team or external partners handle execution. However, we can provide hands-on execution support or connect you with trusted execution partners if you lack internal resources.'
    },
    {
      question: 'How long do typical engagements last?',
      answer: 'Most engagements run 6-12 months minimum to implement meaningful strategic change. Many clients extend indefinitely as their ongoing strategic marketing leader. We provide flexibility to scale involvement up or down based on business needs and seasonal demands.'
    }
  ],
  testimonials: [
    {
      name: 'Christopher Moore',
      company: 'Tech Startup CEO',
      quote: 'Hiring a Fractional CMO was the best decision we made. We got experienced strategic leadership without the full-time cost. Our marketing transformed from scattered tactics to a cohesive growth engine. Revenue grew 200% in 10 months.'
    },
    {
      name: 'Victoria Nelson',
      company: 'Manufacturing Company President',
      quote: 'We needed someone who could develop strategy, manage our team, and hold agencies accountable. The Fractional CMO brought structure, accountability, and results. Our lead volume doubled and cost per lead dropped 35%.'
    }
  ],
  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session'
};

export default function FractionalCmo() {
  return <SolutionPageLayout service={service} />;
}
