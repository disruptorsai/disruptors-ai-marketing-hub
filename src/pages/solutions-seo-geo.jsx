import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'SEO & GEO',
  h2: 'Be Seen Where It Matters Most.',
  descriptivePhrase: 'Search Engine and Generative Engine Optimization',
  overview: 'The game of getting seen online has changed-AI is reshaping how people search, discover, and choose businesses. It is no longer just about ranking on Google, but about showing up in AI platforms and conversations that shape decisions. We build strategies that position your brand where attention is moving, making sure you are visible, trusted, and chosen in the new search era.',
  image: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/ui/backgrounds/renaissance-fresco-pyramids.png',
  heroVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/gallery-bg.mp4',
  cardVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/gallery-bg.mp4',
  outcomes: [
    {
      title: 'AI-Era Visibility',
      description: 'Rank not just on Google, but in ChatGPT, Perplexity, and other AI platforms where your customers are searching.'
    },
    {
      title: 'Organic Traffic Growth',
      description: 'Attract qualified leads through optimized content that answers real questions and solves real problems.'
    },
    {
      title: 'Long-Term Authority',
      description: 'Build sustainable search presence that compounds over time, reducing dependence on paid advertising.'
    }
  ],
  process: [
    {
      title: 'Audit & Research',
      description: 'Comprehensive analysis of your current search presence, competitor landscape, and keyword opportunities.'
    },
    {
      title: 'Strategy Development',
      description: 'Create a tailored SEO and GEO roadmap targeting both traditional search engines and AI platforms.'
    },
    {
      title: 'Implementation',
      description: 'Execute technical optimizations, create high-quality content, and build authoritative backlinks.'
    },
    {
      title: 'Monitor & Refine',
      description: 'Continuous tracking of rankings, traffic, and conversions with ongoing optimization for maximum impact.'
    }
  ],
  features: [
    {
      title: 'Traditional SEO Optimization',
      description: 'On-page, technical, and off-page SEO for Google rankings'
    },
    {
      title: 'Generative Engine Optimization (GEO)',
      description: 'Optimize for AI platforms like ChatGPT, Perplexity, and Gemini'
    },
    {
      title: 'Keyword Research & Strategy',
      description: 'Data-driven targeting of high-intent, winnable keywords'
    },
    {
      title: 'Content Creation & Optimization',
      description: 'SEO-optimized blog posts, landing pages, and service pages'
    },
    {
      title: 'Technical SEO Audits',
      description: 'Site speed, mobile optimization, schema markup, and crawlability'
    },
    {
      title: 'Link Building Campaigns',
      description: 'Authoritative backlinks from relevant, high-quality sources'
    },
    {
      title: 'Local SEO & Google Business Profile',
      description: 'Dominate local search and map results in your area'
    },
    {
      title: 'Performance Tracking & Reporting',
      description: 'Monthly reports showing rankings, traffic, and ROI metrics'
    }
  ],
  faqs: [
    {
      question: 'What is Generative Engine Optimization (GEO)?',
      answer: 'GEO is the practice of optimizing your content to appear in AI-generated responses from platforms like ChatGPT, Perplexity, Google Gemini, and Bing AI. As more people use AI for search and discovery, GEO ensures your brand is referenced, recommended, and trusted by these platforms.'
    },
    {
      question: 'How long does SEO take to show results?',
      answer: 'Initial improvements typically appear within 3-4 months, with significant traffic growth by 6-12 months. SEO is a long-term investment that compounds over time. Unlike paid ads that stop when you stop paying, SEO continues delivering value years after implementation.'
    },
    {
      question: 'Do you guarantee first page rankings?',
      answer: 'No reputable SEO agency can guarantee specific rankings because search algorithms change constantly and competition varies. We focus on driving measurable traffic, leads, and revenue growth through proven SEO strategies that have delivered results across industries.'
    },
    {
      question: 'What\'s the difference between SEO and paid advertising?',
      answer: 'Paid ads provide immediate visibility but require ongoing spend. SEO builds long-term organic presence that continues generating traffic without per-click costs. The best strategy often combines both: paid ads for immediate results while SEO builds sustainable long-term growth.'
    },
    {
      question: 'How do you measure SEO success?',
      answer: 'We track keyword rankings, organic traffic growth, click-through rates, conversion rates, and revenue attribution. Success is not just about rankings - it is about driving qualified traffic that converts into customers and generates measurable business outcomes.'
    }
  ],
  testimonials: [
    {
      name: 'Jason Painter',
      company: 'Healthcare Professional - Google Review',
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

export default function SeoGeo() {
  return <SolutionPageLayout service={service} />;
}
