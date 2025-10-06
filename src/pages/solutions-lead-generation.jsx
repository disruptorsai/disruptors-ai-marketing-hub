import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'Lead Generation',
  h2: 'Fill Your Pipeline, Fast.',
  descriptivePhrase: 'Cold Outbound Systems That Convert',
  overview: 'We send millions of cold emails and social media DMs every month, which means we have mastered the art of starting conversations that turn into opportunities. If you are in the B2B space, cold outbound is the fastest and most affordable way to fill your pipeline with qualified prospects. We handle everything-targeting, copywriting, and automation-so you can focus on closing deals while we keep the conversations flowing.',
  image: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/what-we-do-bx-1.png',
  heroImage: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/c_scale,w_1536,q_auto,f_webp/disruptors-ai/services/lead-generation-v2.png',
  outcomes: [
    {
      title: 'Qualified Prospects',
      description: 'Fill your calendar with decision-makers who match your ideal customer profile, not tire-kickers.'
    },
    {
      title: 'Predictable Pipeline',
      description: 'Know exactly how many leads you will generate each month with tested outbound systems.'
    },
    {
      title: 'Fast Market Entry',
      description: 'Start conversations with prospects immediately-no waiting months for SEO or content to work.'
    }
  ],
  process: [
    {
      title: 'ICP Definition & List Building',
      description: 'Identify your ideal customer profile and build targeted prospect lists matching your exact criteria.'
    },
    {
      title: 'Messaging & Campaign Creation',
      description: 'Develop compelling outreach sequences that open doors and start conversations with prospects.'
    },
    {
      title: 'Multi-Channel Outreach',
      description: 'Deploy coordinated campaigns across email, LinkedIn, and other channels for maximum reach.'
    },
    {
      title: 'Nurture & Book Meetings',
      description: 'Manage follow-ups, handle objections, and book qualified meetings directly on your calendar.'
    }
  ],
  features: [
    {
      title: 'Cold Email Campaigns',
      description: 'Deliverability-optimized email sequences that land in inboxes'
    },
    {
      title: 'LinkedIn Outreach & Automation',
      description: 'Targeted connection requests and messaging sequences'
    },
    {
      title: 'Multi-Channel Coordination',
      description: 'Combine email, LinkedIn, and other channels for better results'
    },
    {
      title: 'Prospect List Building & Research',
      description: 'Highly targeted lists matching your ideal customer profile'
    },
    {
      title: 'A/B Testing & Optimization',
      description: 'Continuous testing to improve open rates and reply rates'
    },
    {
      title: 'CRM Integration & Management',
      description: 'Seamless integration with your existing sales tools'
    },
    {
      title: 'Meeting Scheduling & Qualification',
      description: 'Automated booking and pre-qualification before meetings'
    },
    {
      title: 'Performance Reporting',
      description: 'Real-time dashboards tracking outreach performance and ROI'
    }
  ],
  faqs: [
    {
      question: 'Is cold outreach still effective in 2025?',
      answer: 'Absolutely. While inboxes are more competitive, targeted outreach with personalized messaging continues to work exceptionally well. We send millions of emails monthly and consistently achieve 40-60% open rates and 5-15% reply rates through strategic targeting and compelling copy.'
    },
    {
      question: 'How do you avoid spam filters?',
      answer: 'We use advanced deliverability infrastructure including custom domain warming, SPF/DKIM/DMARC configuration, multiple sending domains, and compliance with CAN-SPAM regulations. Our technical setup ensures your messages reach inboxes, not spam folders.'
    },
    {
      question: 'How many leads can I expect per month?',
      answer: 'Results vary by industry, ICP, and offer, but typical campaigns generate 10-50 qualified meetings per month. We focus on quality over quantity - getting you in front of decision-makers who actually need what you offer, not just filling your calendar with unqualified conversations.'
    },
    {
      question: 'What information do you need to get started?',
      answer: 'We need to understand your ideal customer profile, your offer/value proposition, current sales process, and what qualifies as a good lead. We will collaborate on messaging strategy and provide guidance on optimizing your offer for cold outreach success.'
    },
    {
      question: 'Do you provide the leads or just the system?',
      answer: 'We provide the complete solution: prospect research, list building, messaging, technical infrastructure, campaign management, and qualified meetings booked on your calendar. You focus on closing deals, we handle everything else in the lead generation process.'
    }
  ],
  testimonials: [
    {
      name: 'Robert Taylor',
      company: 'B2B SaaS Founder',
      quote: 'We went from zero outbound to 25 qualified demos per month in 60 days. The targeting was surgical and the messaging actually started conversations. Best ROI of any marketing channel we have tested.'
    },
    {
      name: 'Amanda Foster',
      company: 'Agency Owner',
      quote: 'Cold outbound seemed intimidating but the team made it simple. They handle everything from lists to messaging to booking. We now have a predictable pipeline that fills our calendar every month.'
    }
  ],
  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session'
};

export default function LeadGeneration() {
  return <SolutionPageLayout service={service} />;
}
