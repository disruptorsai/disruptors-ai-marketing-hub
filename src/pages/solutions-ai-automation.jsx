import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// AI Automation on the locked Hybrid template (ServicePagePro).
// Framing: outcome-led — automate the busywork across the whole business (marketing, sales,
// ops, support); revenue is a downstream outcome, not the headline. Positioning: fractional
// Chief AI Officer, systems built in + owned by the client. SEO/GEO: "AI automation" leads the
// subhead's first sentence; FAQs are self-contained, liftable answers.
const service = {
  title: 'AI Automation & Infrastructure',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Automate the busywork. Focus on what matters.',
  headlineAccent: 'Focus',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/ai-automation.jpg',
  // heroVideo omitted — no ai-automation.mp4 exists (404 on Supabase); uses the poster image.
  stats: [
    { value: 24, suffix: '/7', label: 'Always-on operation' },
    { display: '10 – 30', suffix: ' hrs', label: 'Reclaimed / week' },
    { display: '4 – 8', suffix: ' wks', label: 'To full deployment' },
    { value: 100, suffix: '%', label: 'Owned by you' },
  ],
  subhead:
    'AI automation is simply software that handles your repetitive, manual work — across marketing, sales, operations, and support — so your team spends time on the things that actually move the business forward. We build it into your business, and you own it.',

  chips: ['Marketing', 'Sales', 'Operations', 'Customer Support', 'Content', 'Reporting'],

  platform: {
    label: 'The Engine',
    title: 'One system for the whole business.',
    body: "Whatever eats your team's time — follow-ups, data entry, content, reporting — we automate it. One connected system that scales with you, and you keep everything we build.",
    features: [
      { num: '01', title: 'Live in weeks', desc: 'Pre-built templates get your automations running fast — signup to working system in a fraction of the usual time.', viz: 'terminal' },
      { num: '02', title: 'Intelligent Routing', desc: 'Send anything to the right place — leads, tickets, tasks — based on intent, priority, and context. Nothing slips.', viz: 'routing' },
    ],
    mini: [
      { icon: 'zap', title: 'Real-time Sync', desc: 'Bi-directional CRM updates.' },
      { icon: 'shield', title: 'You Own It', desc: 'Infrastructure you keep.' },
      { icon: 'clock', title: '24/7 Operation', desc: 'Runs while you sleep.' },
      { icon: 'file', title: 'Full Handoff', desc: 'Docs + training included.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'clock', title: 'Get your time back', desc: 'Automate the repetitive work and reclaim 10–30 hours a week for the things only your team can do.' },
    { icon: 'layers', title: 'Scale without hiring', desc: 'Handle more volume with the same team. The system absorbs the work that would otherwise force you to add headcount.' },
    { icon: 'trending', title: 'Grow, measurably', desc: 'Faster response and consistent follow-up convert more of what you already have — and it compounds over time.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we install it.',
  process: [
    { title: 'Discovery & Audit', description: "We map where your team's time goes and where the biggest wins are." },
    { title: 'Strategy & Design', description: 'We design automation around your workflows and the tools you already use.' },
    { title: 'Build & Integration', description: 'Built into your stack — GoHighLevel, n8n, CRM, custom AI — validated end to end.' },
    { title: 'Optimize & Hand Off', description: 'Documented and transferred. It keeps working — and compounding — without us.' },
  ],

  successStory: {
    metric: 'Beyond forecast',
    quote: 'They optimized our go-to-market strategy, overdelivering beyond forecasts by large margins.',
    name: 'Alde Nguyen',
    company: 'Google Review',
  },

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What is AI automation, exactly?',
      answer: "It's intelligent software that runs repetitive business tasks — things like lead follow-up, data entry, content, scheduling, and reporting — without anyone doing them by hand. It works across marketing, sales, operations, and support, so your team can focus on the work that needs a human.",
    },
    {
      question: "I'm not sure what I'd even automate. Can you help?",
      answer: "That's exactly what the first call is for. We audit where your team's time goes, then show you the highest-impact things to automate first. You don't need to arrive with a plan — that's our job.",
    },
    {
      question: 'How is this different from hiring a marketing agency?',
      answer: 'A traditional agency rents you services and keeps the systems. We act as your fractional Chief AI Officer and build the infrastructure inside your business — you own everything we install. That means full-agency output without the ongoing retainer or dependency.',
    },
    {
      question: 'What tools do you work with, and how long does it take?',
      answer: 'GoHighLevel, n8n, Make, and Zapier, plus custom integrations and AI models. Simple workflows go live in 1–2 weeks; a full system typically takes 4–8 weeks depending on scope.',
    },
    {
      question: 'Do I need technical skills to run it?',
      answer: 'No. We build for non-technical teams and include full documentation and training. You own the system and are never locked in.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function AiAutomation() {
  return <ServicePagePro service={service} />;
}
