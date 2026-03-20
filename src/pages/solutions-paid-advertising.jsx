import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'Paid Advertising',
  h2: 'Maximize Your Ad Spend ROI.',
  descriptivePhrase: 'Paid Campaigns that Convert on Search & Social',
  overview: 'Our team has managed millions in ad spend across search and social platforms, giving us the experience to know what works, and what does not. We study proven ads from successful competitors, elevate their ad creative to a higher level, then rapidly test countless variations until we uncover the winner. With the speed and efficiency of AI behind every step, we scale campaigns that book calls on your calendar and generate sales for your business.',
  image: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/ui/backgrounds/renaissance-fresco-pyramids.png',
  heroVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/gallery-bg.mp4',
  cardVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/gallery-bg.mp4',
  outcomes: [
    {
      title: 'Maximum ROI',
      description: 'Get more leads and sales for every dollar spent through continuous testing and optimization.'
    },
    {
      title: 'Rapid Testing',
      description: 'Leverage AI to test hundreds of variations in the time competitors test a handful, finding winners faster.'
    },
    {
      title: 'Scalable Growth',
      description: 'Once we find what works, scale your campaigns profitably to reach your revenue goals.'
    }
  ],
  process: [
    {
      title: 'Competitive Analysis',
      description: 'Research successful competitor ads and identify winning angles, messaging, and creative strategies.'
    },
    {
      title: 'Campaign Architecture',
      description: 'Build strategic account structure with proper tracking, audience segmentation, and funnel optimization.'
    },
    {
      title: 'Creative Testing',
      description: 'Launch multiple ad variations across platforms, testing messaging, visuals, and targeting simultaneously.'
    },
    {
      title: 'Scale & Optimize',
      description: 'Identify winning combinations and scale profitable campaigns while continuously optimizing for better performance.'
    }
  ],
  features: [
    {
      title: 'Google Search Ads',
      description: 'Capture high-intent searchers actively looking for your solution'
    },
    {
      title: 'Facebook & Instagram Ads',
      description: 'Reach your ideal audience with engaging visual and video content'
    },
    {
      title: 'LinkedIn Advertising',
      description: 'Target decision-makers and professionals in B2B campaigns'
    },
    {
      title: 'YouTube Advertising',
      description: 'Video ads that build awareness and drive conversions'
    },
    {
      title: 'AI-Powered Creative Testing',
      description: 'Rapidly test hundreds of ad variations to find winners'
    },
    {
      title: 'Landing Page Optimization',
      description: 'High-converting landing pages designed for your campaigns'
    },
    {
      title: 'Conversion Tracking & Attribution',
      description: 'Know exactly what is driving results and ROI'
    },
    {
      title: 'Retargeting Campaigns',
      description: 'Re-engage prospects who showed interest but did not convert'
    }
  ],
  faqs: [
    {
      question: 'How much should I budget for paid advertising?',
      answer: 'Minimum recommended ad spend is $3,000-$5,000 per month for meaningful testing and results. This excludes management fees and allows for sufficient data collection. Budgets scale based on your goals, industry competition, and customer lifetime value. We will provide recommendations during strategy sessions.'
    },
    {
      question: 'How long before I see results from paid ads?',
      answer: 'You will see initial data within 7-14 days. Optimized, profitable campaigns typically emerge within 30-60 days after sufficient testing. Unlike SEO, paid ads provide fast feedback, allowing us to iterate quickly and find what works for your specific business and offer.'
    },
    {
      question: 'What platforms do you advertise on?',
      answer: 'We manage campaigns across Google Ads, Facebook, Instagram, LinkedIn, YouTube, TikTok, and other platforms. Platform selection depends on your target audience, industry, and offer. We recommend starting with 1-2 platforms and expanding as campaigns prove profitable.'
    },
    {
      question: 'Do you create the ad creative or do I need to provide it?',
      answer: 'We handle all creative production including copywriting, graphic design, video editing, and AI-generated content. While we welcome any existing assets you have, our team creates everything needed to launch and optimize your campaigns from scratch.'
    },
    {
      question: 'How do you measure success beyond just clicks?',
      answer: 'We track the metrics that matter: cost per lead, cost per acquisition, return on ad spend (ROAS), customer lifetime value, and overall revenue attribution. Success is not about vanity metrics - it is about profitable customer acquisition that grows your business.'
    }
  ],
  testimonials: [
    {
      name: 'Mitchell Halvorsen',
      company: 'Google Review',
      quote: 'I can\'t say enough good things about Disruptors Media. Their team is professional, creative, and truly understands how to capture attention in today\'s fast-paced digital world. They made the process smooth from start to finish.'
    },
    {
      name: 'Gabriel Costa e Silva',
      company: 'Google Review',
      quote: 'All I can say is that this place is run by some awesome people of integrity. They genuinely have the best interest of their customers and go above and beyond for those they serve.'
    }
  ],
  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session'
};

export default function PaidAdvertising() {
  return <SolutionPageLayout service={service} />;
}
