import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// Social Media Marketing on the locked Hybrid template (ServicePagePro).
// Framing: outcome-led — an AI-driven content engine that keeps the brand showing up daily and
// turns attention into pipeline. Positioning: fractional Chief AI Officer — we build the system,
// you own the momentum. Everything through an AI lens ("AI-driven social content", not generic
// "social media"). SEO/GEO: "AI-driven social content" leads the subhead; Utah long-tail woven in;
// FAQs are self-contained, liftable answers.
const service = {
  title: 'Social Media Marketing',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Show up daily. Turn attention into pipeline.',
  headlineAccent: 'attention',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/social-media-marketing.jpg',
  // heroVideo omitted — no social-media-marketing.mp4 exists (404 on Supabase); uses the poster image.
  stats: [
    { value: 4, suffix: 'x', label: 'More output, same team' },
    { display: '12 – 30', suffix: ' posts', label: 'Per platform / month' },
    { display: '30 – 60', suffix: ' days', label: 'To visible traction' },
    { value: 100, suffix: '%', label: 'Owned by you' },
  ],
  subhead:
    'AI-driven social content is a system that turns your expertise into a steady stream of video, carousels, and captions — then puts each piece where your buyers already scroll. We run the strategy, creation, and distribution for you, and hand you a machine you keep. Trusted by brands across Utah and beyond.',

  chips: ['Short-Form Video', 'Long-Form Video', 'Carousels', 'Copywriting', 'Community', 'Reporting'],

  platform: {
    label: 'The Engine',
    title: 'One content engine, every platform.',
    body: "Your voice, captured once and reshaped into dozens of native posts — Reels, Shorts, carousels, threads. AI handles the volume; our team guards the taste. You keep the system and the audience it builds.",
    features: [
      { num: '01', title: 'From idea to feed, fast', desc: 'A single filming day or voice note becomes weeks of platform-ready content — AI drafts, our editors polish, and it ships on schedule.', viz: 'terminal' },
      { num: '02', title: 'Right post, right platform', desc: 'Every asset is cut, captioned, and formatted for where it lands — TikTok, Reels, LinkedIn, YouTube — so nothing gets posted flat or ignored.', viz: 'routing' },
    ],
    mini: [
      { icon: 'production', title: 'AI-Assisted Production', desc: 'Scale output, keep the voice.' },
      { icon: 'formats', title: 'Every Format', desc: 'Video, carousels, captions.' },
      { icon: 'own', title: 'You Own It', desc: 'Audience and system stay yours.' },
      { icon: 'monthlyreport', title: 'Monthly Reporting', desc: 'What worked, what is next.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'broadcast', title: 'Never go quiet again', desc: 'A full calendar runs in the background, so your brand posts consistently even in your busiest weeks — no scrambling for content.' },
    { icon: 'compound', title: 'Attention that compounds', desc: 'Consistent, on-brand content grows reach and trust over time, turning passive scrollers into followers, leads, and customers.' },
    { icon: 'reach', title: 'More reach, no new hires', desc: 'AI-assisted production multiplies what one voice can create, so you cover every platform without building an in-house content team.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we install it.',
  process: [
    { title: 'Voice & Strategy', description: 'We define your positioning, content pillars, and the platforms where your buyers actually spend time.' },
    { title: 'Capture & Create', description: 'One efficient filming or recording session feeds an AI-assisted pipeline that produces video, graphics, and copy.' },
    { title: 'Distribute & Schedule', description: 'Every asset is formatted per platform and published on a calendar that keeps you consistently visible.' },
    { title: 'Engage & Optimize', description: 'We manage the comments, read the data, and double down on what performs — then hand you the playbook.' },
  ],

  successStory: {
    metric: 'Millions of views',
    quote: "They've gotten me millions of views on my social media, and I've seen a large uptick in new patients in my office. The strategy and support is significantly better than the 5 or so other marketing companies I've worked with.",
    name: 'Jason Painter',
    company: 'Healthcare Professional',
  },

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What is AI-driven social content?',
      answer: 'It is a content system that uses AI to turn your expertise into a high volume of platform-ready posts — short-form video, carousels, captions, and long-form clips — while a human team handles strategy, editing, and taste. The result is consistent, on-brand output across every channel without your team producing each piece by hand.',
    },
    {
      question: 'Do I need to be on camera or make content myself?',
      answer: 'Not much. The highest-performing content usually features a real person, so we make it painless: one short filming session or a few voice notes gives our AI-assisted pipeline enough raw material for weeks of posts. If on-camera is not for you, we build with motion graphics, screen recordings, and AI-generated visuals instead.',
    },
    {
      question: 'Which platforms do you cover, and how much do you post?',
      answer: 'Instagram, TikTok, YouTube, LinkedIn, Facebook, and X. We usually focus on the 2 to 3 platforms where your buyers are most active and produce 12 to 30 posts per platform each month, plus Stories and Reels. Consistency on the right channels beats spreading thin across all of them.',
    },
    {
      question: 'How is this different from a traditional agency?',
      answer: 'A traditional agency rents you deliverables and keeps the process. We act as your fractional Chief AI Officer and build the content engine inside your business — the systems, prompts, and workflows are yours to keep. You get full-agency output with AI-driven speed, and you are never locked into a retainer to keep the lights on.',
    },
    {
      question: 'How soon will I see results?',
      answer: 'You will see reach and engagement climb within 30 to 60 days as the calendar fills and the content library grows. Meaningful audience growth and steady lead flow typically take 3 to 6 months, because social compounds — every post keeps working long after it goes live.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function SocialMedia() {
  return <ServicePagePro service={service} />;
}
