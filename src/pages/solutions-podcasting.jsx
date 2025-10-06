import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'Podcast Production',
  h2: 'Build Authority With Audio.',
  descriptivePhrase: 'Broadcast-Quality Podcasts That Grow Your Brand',
  overview: 'From concept to distribution, we handle every aspect of podcast production. Our team creates professional, high-quality audio and video content that positions you as an industry leader, builds a loyal audience, and drives real business growth. We manage the strategy, recording, editing, and promotion, so you can focus on sharing your expertise.',
  image: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/content/podcast/podcast-new-lg-1.jpg',
  heroImage: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758737704/disruptors-ai/services/podcasting.png',
  outcomes: [
    {
      title: 'Industry Authority',
      description: 'Position yourself as a thought leader with consistent, high-quality content that showcases your expertise.'
    },
    {
      title: 'Engaged Audience',
      description: 'Build a loyal community of listeners who trust your insights and become advocates for your brand.'
    },
    {
      title: 'Repurposed Content',
      description: 'Turn every episode into blog posts, social clips, newsletters, and more-multiplying your content ROI.'
    }
  ],
  process: [
    {
      title: 'Strategy & Positioning',
      description: 'Define your podcast concept, target audience, content pillars, and competitive positioning in the market.'
    },
    {
      title: 'Production Setup',
      description: 'Professional studio recording, remote interview setup, and technical infrastructure for broadcast quality.'
    },
    {
      title: 'Editing & Post-Production',
      description: 'Audio engineering, video editing, show notes, timestamps, and optimization for all podcast platforms.'
    },
    {
      title: 'Distribution & Promotion',
      description: 'Multi-platform publishing, content repurposing, social promotion, and audience growth strategies.'
    }
  ],
  features: [
    {
      title: 'Full Audio & Video Production',
      description: 'Broadcast-quality recording and editing for audio and video formats'
    },
    {
      title: 'Professional Studio Recording',
      description: 'In-studio recording with cinematic lighting and multi-camera setup'
    },
    {
      title: 'Remote Interview Production',
      description: 'High-quality remote recording setup for guest interviews'
    },
    {
      title: 'Show Notes & Transcripts',
      description: 'SEO-optimized show notes, timestamps, and full transcripts'
    },
    {
      title: 'Multi-Platform Distribution',
      description: 'Publishing to Apple Podcasts, Spotify, YouTube, and all major platforms'
    },
    {
      title: 'Content Repurposing',
      description: 'Convert episodes into blog posts, social clips, audiograms, and graphics'
    },
    {
      title: 'Guest Outreach & Booking',
      description: 'Research and book ideal guests that attract your target audience'
    },
    {
      title: 'Analytics & Growth Strategy',
      description: 'Track performance and implement strategies to grow your listener base'
    }
  ],
  faqs: [
    {
      question: 'Do I need my own equipment to start a podcast?',
      answer: 'Not if you record in our studio. We provide professional recording equipment, lighting, cameras, and audio engineering. For remote recordings, we can provide guidance on basic equipment or ship you a portable recording kit. Investment ranges from $200 for basic remote setup to full in-studio production.'
    },
    {
      question: 'How long does it take to launch a podcast?',
      answer: 'From concept to launch typically takes 3-4 weeks. This includes strategy development, branding, recording your first episodes, editing, platform setup, and marketing preparation. We recommend launching with 3-5 episodes available to give new listeners content to binge.'
    },
    {
      question: 'How often should I publish new episodes?',
      answer: 'Consistency matters more than frequency. Weekly or bi-weekly publishing works well for most shows and is sustainable long-term. Starting with a bi-weekly schedule allows you to build momentum while maintaining quality. We help you establish a realistic production schedule that fits your business.'
    },
    {
      question: 'Can you help me find and book guests?',
      answer: 'Yes. We research potential guests who align with your audience and content strategy, handle outreach and booking, provide pre-interview briefs, and manage scheduling. Guest booking is included in our full-service podcast production packages.'
    },
    {
      question: 'How do podcasts generate business results?',
      answer: 'Podcasts build authority and trust that converts to business opportunities. Listeners become customers, clients, or partners. Episodes serve as evergreen content that attracts ideal prospects through SEO. Plus, repurposed content feeds your entire content marketing engine, multiplying ROI across channels.'
    }
  ],
  testimonials: [
    {
      name: 'Korina Flint',
      company: 'Health & Wellness Professional',
      quote: 'I am thoroughly impressed with Disruptors Media. They are super talented and knowledgeable, but what impressed me even more is their dedication to their mission. They truly want to help others spread the message of health and wellness. My experience shooting a podcast with them was amazing.'
    },
    {
      name: 'Nathan Unkefer',
      company: 'Content Creator',
      quote: 'The finished product was quickly and professionally edited and looks great. I\'d recommend this group to anyone!'
    }
  ],
  cta_label: 'Start Your Podcast',
  cta_link: 'podcast'
};

export default function PodcastingSolution() {
  return <SolutionPageLayout service={service} />;
}
