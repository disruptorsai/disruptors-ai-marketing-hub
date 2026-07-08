import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// Paid Advertising on the locked Hybrid template (ServicePagePro).
// Positioning: reframe "paid ads" with an AI lens — paid advertising automations / AI-optimized
// ad systems, not a generic ad agency. Disruptors acts as a fractional Chief AI Officer that
// builds the ad-buying machine into your business. Outcome-led: profitable customer acquisition,
// not clicks. SEO/GEO: "Paid advertising" leads the subhead's first sentence; Utah long-tail
// woven naturally; FAQs are self-contained, liftable answers.
const service = {
  title: 'Paid Advertising Automations',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Turn ad spend into predictable pipeline.',
  headlineAccent: 'predictable',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/paid-advertising.jpg',
  heroVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/dmsite/services/paid-advertising.mp4',
  stats: [
    { display: '100s', suffix: '', label: 'Ad variations tested' },
    { display: '7 – 14', suffix: ' days', label: 'To first signal' },
    { display: '30 – 60', suffix: ' days', label: 'To profitable scale' },
    { value: 24, suffix: '/7', label: 'AI optimization' },
  ],
  subhead:
    'Paid advertising works when the system behind it never stops learning — and that is what we build. We stand up an AI-optimized ad engine across Google and social that tests, cuts losers, and scales winners on its own. Built into your business, owned by you, tuned for revenue.',

  chips: ['Google Ads', 'Meta', 'LinkedIn', 'YouTube', 'Retargeting', 'Attribution'],

  platform: {
    label: 'The Ad Engine',
    title: 'An AI ad system, not a media buyer.',
    body: "Most agencies hand-tweak a few campaigns and hope. We build an ad engine that runs continuous experiments, routes budget to what converts, and reports on the metrics that matter. You keep every account, pixel, and asset we build.",
    features: [
      { num: '01', title: 'Launch in weeks', desc: 'Proven account structures and creative frameworks get campaigns live fast — from kickoff to spending in a fraction of the usual time.', viz: 'terminal' },
      { num: '02', title: 'Budget That Routes Itself', desc: 'AI shifts spend toward the audiences, placements, and creative that convert — in real time — so no dollar sits on a losing ad.', viz: 'routing' },
    ],
    mini: [
      { icon: 'zap', title: 'Rapid Testing', desc: 'Hundreds of variations, fast.' },
      { icon: 'trending', title: 'ROAS Focused', desc: 'Optimized to revenue, not clicks.' },
      { icon: 'layers', title: 'Full Funnel', desc: 'Cold to retargeting, covered.' },
      { icon: 'shield', title: 'You Own It', desc: 'Accounts, pixels, and data.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'trending', title: 'Lower cost per customer', desc: 'Continuous AI testing finds the creative and audiences that convert, so you pay less for every lead and sale over time.' },
    { icon: 'zap', title: 'Find winners faster', desc: 'Test hundreds of variations in the time competitors test a handful — and pour budget into what works before they even notice.' },
    { icon: 'layers', title: 'Scale without guessing', desc: 'Once the system proves what converts, we scale spend profitably toward your revenue goals instead of hoping it holds.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we install it.',
  process: [
    { title: 'Audit & Competitive Recon', description: "We study the ads winning in your market and audit your accounts, tracking, and past spend for fast wins." },
    { title: 'Campaign Architecture', description: 'We build the account structure, conversion tracking, and audience segmentation your AI engine runs on.' },
    { title: 'Creative & Launch', description: 'We produce the ads and launch a testing matrix across Google and social — messaging, visuals, and targeting at once.' },
    { title: 'Scale & Optimize', description: 'AI cuts losers and scales winners daily; you get plain-English reporting on cost per lead, ROAS, and revenue.' },
  ],

  successStory: {
    metric: 'Attention that converts',
    quote: "I can't say enough good things about Disruptors Media. Their team is professional, creative, and truly understands how to capture attention in today's fast-paced digital world. They made the process smooth from start to finish.",
    name: 'Mitchell Halvorsen',
    company: 'Google Review',
  },

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What is paid advertising, and how does AI improve it?',
      answer: 'Paid advertising is buying placement on platforms like Google, Meta, LinkedIn, and YouTube to put your offer in front of people actively searching or a well-matched audience. AI improves it by running far more experiments than a human can — testing hundreds of creative and audience variations, then automatically shifting budget toward what converts and cutting what does not. The result is a system that gets cheaper and more profitable the longer it runs.',
    },
    {
      question: 'How is this different from a traditional ad agency?',
      answer: 'A traditional agency rents you a media buyer, keeps the accounts and systems, and bills a retainer whether or not it performs. We act as your fractional Chief AI Officer and build an AI-optimized ad engine inside your business — you own the ad accounts, pixels, creative, and data. That means agency-level output plus a compounding system you keep, instead of a dependency you rent.',
    },
    {
      question: 'How much should I budget for paid advertising?',
      answer: 'For meaningful testing we recommend a minimum of $3,000 to $5,000 per month in ad spend, separate from management fees, so the AI has enough data to find winners. From there, budget scales with your goals, industry competition, and customer lifetime value. We give you specific numbers during the strategy session before you commit anything.',
    },
    {
      question: 'How long before I see results, and which platforms do you run?',
      answer: 'You will see initial signal within 7 to 14 days and profitable, optimized campaigns typically emerge within 30 to 60 days. We run Google, Facebook, Instagram, LinkedIn, YouTube, and TikTok, and usually start with the one or two platforms your buyers actually use before expanding as campaigns prove out.',
    },
    {
      question: 'Do you handle the ad creative, and can you work with Utah businesses?',
      answer: 'Yes on both. We produce everything the engine needs — copywriting, design, video, and AI-generated variations — and welcome any assets you already have. We work with local Utah businesses and national brands alike, and can tune campaigns for Utah geo-targeting or nationwide reach depending on where your customers are.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function PaidAdvertising() {
  return <ServicePagePro service={service} />;
}
