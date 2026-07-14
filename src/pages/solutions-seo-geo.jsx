import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// SEO & GEO on the locked Hybrid template (ServicePagePro).
// Framing: outcome-led — get found where buyers actually search now, which is Google AND
// AI answers (ChatGPT, Perplexity, Gemini, Google AI Overviews). GEO — being the source AI
// cites — is the modern edge. Positioning: fractional Chief AI Officer applying an AI lens to
// search. SEO/GEO: "SEO and GEO" leads the subhead's first sentence; Utah long-tail woven in;
// FAQs are self-contained, liftable answers.
const service = {
  title: 'SEO & GEO',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Get found in Google and in AI answers.',
  headlineAccent: 'found',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/seo-geo.jpg',
  heroVideo: '/site-assets/videos/dmsite/services/seo-geo.mp4',
  stats: [
    { value: 3, suffix: '-4 mo', label: 'First traction' },
    { display: '6 – 12', suffix: ' mo', label: 'Compounding growth' },
    { value: 4, suffix: 'x', label: 'AI surfaces to win' },
    { value: 100, suffix: '%', label: 'Owned by you' },
  ],
  subhead:
    'SEO and GEO are how your business gets found now — ranking on Google and getting cited inside AI answers like ChatGPT, Perplexity, and Google AI Overviews. Buyers ask a question and pick from what shows up. We make sure that answer is you.',

  chips: ['Traditional SEO', 'Generative Engine Optimization', 'AI Overviews', 'Local & Utah Search', 'Content', 'Schema'],

  platform: {
    label: 'The Engine',
    title: 'Built to be the answer, not just a link.',
    body: "Ranking on Google still matters — but more people now ask an AI and take the first answer it gives. We optimize for both: pages that rank, and content structured so AI models quote you as the source and send that trust back to your brand.",
    features: [
      { num: '01', title: 'Cited by AI', desc: 'We structure your content the way AI models read it — clear claims, sources, and answer-first formatting — so ChatGPT, Perplexity, and AI Overviews quote you by name.', viz: 'terminal' },
      { num: '02', title: 'Intent Routing', desc: 'Every question maps to the right page — informational, local, or ready-to-buy — so searchers in Utah and beyond land where they convert. Nothing gets wasted.', viz: 'routing' },
    ],
    mini: [
      { icon: 'trending', title: 'Rank & Get Cited', desc: 'Google plus AI answers.' },
      { icon: 'file', title: 'Answer-First Content', desc: 'Written to be quoted.' },
      { icon: 'cpu', title: 'Schema & llms.txt', desc: 'Machine-readable trust.' },
      { icon: 'shield', title: 'You Own It', desc: 'Assets you keep.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'trending', title: 'Show up where buyers look', desc: 'Rank on Google and get named inside AI answers — so you win the click and the recommendation, not just one of them.' },
    { icon: 'zap', title: 'Attract intent, not noise', desc: 'Content built around real questions pulls in qualified leads who are ready to act, not casual traffic that never converts.' },
    { icon: 'layers', title: 'Authority that compounds', desc: 'Every ranked page and AI citation stacks on the last, building a search presence that keeps paying off long after the work.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we install it.',
  process: [
    { title: 'Audit & Research', description: 'We map where you show up today across Google and AI answers, size the gaps, and find the winnable, high-intent keywords.' },
    { title: 'Strategy & Roadmap', description: 'A single plan targeting traditional search and Generative Engine Optimization — built around how your buyers actually ask.' },
    { title: 'Build & Optimize', description: 'Technical fixes, schema, answer-first content, and local Utah signals — all structured so both Google and AI can trust it.' },
    { title: 'Track & Compound', description: 'We monitor rankings, citations, and conversions, then double down on what moves — and hand you the assets you keep.' },
  ],

  // successStory intentionally omitted — pending a real SEO/GEO-specific client story (do not reuse another page's review).

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What is GEO, and how is it different from SEO?',
      answer: 'GEO — Generative Engine Optimization — is the practice of getting your business referenced inside AI-generated answers from tools like ChatGPT, Perplexity, Google Gemini, and Google AI Overviews. SEO gets you ranked on a search results page; GEO gets you cited as the trusted source when an AI answers the question directly. Both matter now, because buyers split their time between clicking links on Google and taking the first answer an AI hands them.',
    },
    {
      question: 'Why should I care about being cited by AI search?',
      answer: 'More people now ask ChatGPT or Perplexity a question and act on the single answer they get back, without ever scrolling a results page. If your business is the source that AI quotes, you win the recommendation before a competitor is even seen. That is the modern edge — and most businesses have not optimized for it yet, so the window to get ahead is open right now.',
    },
    {
      question: 'How is this different from a traditional agency?',
      answer: 'A traditional agency rents you rankings and keeps the playbook. We act as your fractional Chief AI Officer — applying an AI lens to your search strategy and building the content, schema, and assets inside your business, which you own outright. You get full-agency SEO and GEO output without the endless retainer or the dependency, and everything we create stays yours.',
    },
    {
      question: 'Do you do local SEO for businesses in Utah?',
      answer: 'Yes. We optimize your Google Business Profile, local landing pages, and location signals so you dominate map results and "near me" searches across Utah — from Salt Lake City to Provo and beyond. We also structure that local content so AI answers surface you when someone asks an assistant to recommend a business in your area.',
    },
    {
      question: 'How long does it take to see results?',
      answer: 'Early traction usually shows within 3 to 4 months, with meaningful, compounding growth by 6 to 12 months. SEO and GEO are long-term plays: unlike paid ads that stop the moment you stop spending, ranked pages and AI citations keep working and building on each other for years after the work is done.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function SeoGeo() {
  return <ServicePagePro service={service} />;
}
