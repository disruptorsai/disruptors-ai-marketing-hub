import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'Social Media Marketing',
  h2: 'Content That Connects and Converts.',
  descriptivePhrase: 'Social Media Content - Smarter With AI',
  overview: 'We help businesses create systems to consistently share their message in the places it matters most through short-form and long-form video, newsletters, carousels, written content, and more. Our team handles the strategy, creation, and distribution so your voice shows up consistently across every platform. The result is content that does not just get seen, but builds trust, momentum, and growth.',
  image: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/phone.png',
  heroImage: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/so_0/q_auto:good/v1/dmsite/services/social-media-marketing.jpg',
  heroVideo: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/social-media-marketing.mp4',
  cardVideo: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/social-media-marketing.mp4',
  outcomes: [
    {
      title: 'Consistent Brand Presence',
      description: 'Show up every day across all platforms with high-quality content that reinforces your brand identity.'
    },
    {
      title: 'Engaged Community',
      description: 'Build authentic relationships with your audience through content that sparks conversation and drives action.'
    },
    {
      title: 'Streamlined Production',
      description: 'Leverage AI-powered systems to create more content faster without sacrificing quality or authenticity.'
    }
  ],
  process: [
    {
      title: 'Brand Strategy',
      description: 'We define your unique voice, visual identity, and content pillars that align with your business objectives.'
    },
    {
      title: 'Content Creation',
      description: 'Our team produces high-quality video, graphics, copy, and multimedia content optimized for each platform.'
    },
    {
      title: 'Strategic Distribution',
      description: 'We publish and schedule content across all channels, ensuring consistent presence and maximum reach.'
    },
    {
      title: 'Engage & Optimize',
      description: 'We monitor performance, engage with your community, and continuously refine strategy based on data.'
    }
  ],
  features: [
    {
      title: 'Short-Form Video Production',
      description: 'TikTok, Instagram Reels, YouTube Shorts optimized for virality'
    },
    {
      title: 'Long-Form Video Content',
      description: 'YouTube videos, interviews, and educational content'
    },
    {
      title: 'Graphic Design & Carousels',
      description: 'Eye-catching visuals and infographics for all platforms'
    },
    {
      title: 'Copywriting & Captions',
      description: 'Compelling copy that drives engagement and action'
    },
    {
      title: 'Content Calendar Management',
      description: 'Strategic planning and scheduling across all channels'
    },
    {
      title: 'Community Management',
      description: 'Active engagement with your audience and reputation monitoring'
    },
    {
      title: 'AI-Powered Content Systems',
      description: 'Leverage AI to scale content production without losing quality'
    },
    {
      title: 'Performance Analytics',
      description: 'Monthly reporting with actionable insights and recommendations'
    }
  ],
  faqs: [
    {
      question: 'Which social media platforms do you manage?',
      answer: 'We manage all major platforms including Instagram, Facebook, LinkedIn, TikTok, YouTube, X (Twitter), and emerging platforms. We recommend focusing on 2-3 platforms where your ideal customers are most active rather than spreading thin across all channels.'
    },
    {
      question: 'Do I need to be on camera or create content myself?',
      answer: 'Not necessarily. While authentic personal content often performs best, we can create high-performing content using stock footage, motion graphics, text-based content, and AI-generated assets. We tailor the approach to your comfort level and brand strategy.'
    },
    {
      question: 'How much content will you create per month?',
      answer: 'Typical packages range from 12-30 posts per month per platform, plus Stories, Reels, and other ephemeral content. The exact volume depends on your goals, budget, and platform strategy. Quality and consistency matter more than raw quantity.'
    },
    {
      question: 'How do you measure social media success?',
      answer: 'We track engagement rate, reach, follower growth, website traffic, and conversion metrics tied to your business objectives. Social media success is not just vanity metrics - we focus on outcomes that impact revenue, brand awareness, and customer relationships.'
    },
    {
      question: 'How long until I see results from social media?',
      answer: 'You will see engagement and reach improvements within 30-60 days. Building meaningful audience growth and consistent lead generation typically takes 3-6 months. Social media is a long-term investment that compounds over time as your content library and audience grow.'
    }
  ],
  testimonials: [
    {
      name: 'Jason Painter',
      company: 'Healthcare Professional',
      quote: 'I have been so impressed — they\'ve gotten me millions of views on my social media, and I\'ve seen a large uptick in new patients in my office. The strategy and support they\'ve given is significantly better than the 5 or so other marketing companies I\'ve worked with.'
    },
    {
      name: 'Mitchell Halvorsen',
      company: 'Google Review',
      quote: 'I can\'t say enough good things about Disruptors Media. Their team is professional, creative, and truly understands how to capture attention in today\'s fast-paced digital world. They made the process smooth from start to finish.'
    }
  ],
  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session'
};

export default function SocialMedia() {
  return <SolutionPageLayout service={service} />;
}