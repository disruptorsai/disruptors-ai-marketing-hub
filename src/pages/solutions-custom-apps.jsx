import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// Custom Apps on the locked Hybrid template (ServicePagePro).
// Framing: outcome-led — custom software, web + mobile apps, and AI-powered internal tools,
// built fast with AI-accelerated development. Positioning: fractional Chief AI Officer, software
// built inside + owned by the client. SEO/GEO: "Custom app development" leads the subhead's first
// sentence, Utah long-tail woven in; FAQs are self-contained, liftable answers.
const service = {
  title: 'Custom Apps',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Turn your idea into software. Ship it in weeks.',
  headlineAccent: 'weeks',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/custom-apps.jpg',
  heroVideo: '/site-assets/videos/dmsite/services/custom-apps.mp4',
  stats: [
    { display: '4 – 8', suffix: ' wks', label: 'Idea to launch' },
    { value: 10, suffix: '×', label: 'Faster than traditional dev' },
    { value: 100, suffix: '%', label: 'Custom to you' },
    { display: '1 – 2', suffix: ' wks', label: 'To a working prototype' },
  ],
  subhead:
    'Custom app development, accelerated by AI — web apps, mobile apps, and internal tools built around the exact way your business works. We build it inside your business, and you own everything we ship.',

  chips: ['Web Apps', 'Mobile Apps', 'AI Tools', 'Calculators', 'Integrations', 'Dashboards'],

  platform: {
    label: 'The Build',
    title: 'Software shaped to your business.',
    body: "Off-the-shelf tools force you into someone else's workflow. We build the opposite — apps and internal tools designed around how you already operate, powered by AI, and handed to you to keep.",
    features: [
      { num: '01', title: 'Working in weeks', desc: 'AI-accelerated development takes you from a concept to a live, working prototype in a fraction of the usual time — then we refine it with you in the loop.', viz: 'terminal' },
      { num: '02', title: 'Connected to Everything', desc: 'Your new app talks to the tools you already use — CRM, payments, data feeds — through clean APIs. Everything stays in sync, nothing lives on an island.', viz: 'routing' },
    ],
    mini: [
      { icon: 'cpu', title: 'AI Built In', desc: 'Intelligence in the workflow.' },
      { icon: 'shield', title: 'You Own It', desc: 'Your code, your app.' },
      { icon: 'layers', title: 'Built to Scale', desc: 'Grows with your users.' },
      { icon: 'file', title: 'Full Handoff', desc: 'Docs + training included.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'clock', title: 'Ship in weeks, not quarters', desc: 'AI-accelerated development turns a 6-month build into a few weeks — so your idea is solving real problems while competitors are still scoping theirs.' },
    { icon: 'zap', title: 'Software that fits exactly', desc: "Stop bending your process around generic tools. You get an app built for the way your team actually works — no workarounds, no compromises." },
    { icon: 'trending', title: 'A real competitive edge', desc: 'Custom calculators, AI tools, and internal systems your competitors simply do not have — assets that capture leads, save hours, and compound over time.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we build it.',
  process: [
    { title: 'Discovery & Requirements', description: 'We map your process, pain points, and the outcome you want — then define the smallest app that delivers it.' },
    { title: 'Design & Prototype', description: 'Wireframes and an interactive prototype so you can see and shape it before we build the full thing.' },
    { title: 'Build & Integrate', description: 'AI-accelerated development on a modern stack — connected to your existing tools and tested end to end.' },
    { title: 'Launch & Hand Off', description: 'Deployed, documented, and transferred. You own the code, and we support and extend it as you grow.' },
  ],

  successStory: {
    metric: 'Paid for itself',
    quote: 'They built us a custom quoting tool our sales team uses every single day. What would have taken months with a traditional developer was live in a few weeks.',
    name: 'Sarah M.',
    company: 'Business Owner',
  },

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What kinds of apps do you build?',
      answer: 'Web applications, iOS and Android mobile apps, AI-powered tools, interactive calculators and lead-gen tools, custom internal dashboards, and API integrations. From a simple ROI calculator that captures prospects to a full internal system that runs a core part of your operation, if it solves a real business problem, we can build it.',
    },
    {
      question: 'How is this different from hiring a dev shop?',
      answer: 'A traditional dev shop rents you a team by the hour and often keeps you dependent on them. We act as your fractional Chief AI Officer and build custom software inside your business using AI-accelerated development — which means the same quality in a fraction of the time and cost. You own all the code, and you are never locked in.',
    },
    {
      question: 'How long does it take, and what does it cost?',
      answer: 'A working prototype typically lands in 1–2 weeks and a full custom app in 4–8 weeks, depending on scope. Traditional software development often runs $50,000–$250,000+ over 6–18 months; with AI-accelerated development we deliver comparable, tailored software in a fraction of that time and cost. We give you a firm timeline and price during discovery.',
    },
    {
      question: 'Can you integrate with our existing systems?',
      answer: 'Yes. We connect your app to virtually any platform through APIs, webhooks, or custom connectors — CRMs like HubSpot and Salesforce, payment processors like Stripe, email systems, and your existing databases. Data flows automatically between your new app and the tools you already run, so nothing has to be re-entered by hand.',
    },
    {
      question: 'Do you provide hosting, support, and updates after launch?',
      answer: 'Yes. You own the code and can host it anywhere, but most clients choose our managed hosting and maintenance for peace of mind — that covers server management, security updates, bug fixes, and new features. Your app is meant to grow with your business, and we keep improving it long after launch day.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function CustomApps() {
  return <ServicePagePro service={service} />;
}
