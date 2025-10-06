import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'Podcast Production',
  h2: 'Build Authority With Audio.',
  descriptivePhrase: 'Broadcast-Quality Podcasts That Grow Your Brand',
  overview: 'From concept to distribution, we handle every aspect of podcast production. Our team creates professional, high-quality audio and video content that positions you as an industry leader, builds a loyal audience, and drives real business growth. We manage the strategy, recording, editing, and promotion, so you can focus on sharing your expertise.',
  image: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/content/podcast/podcast-new-lg-1.jpg',
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