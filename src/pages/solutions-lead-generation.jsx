import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// Lead Generation on the locked Hybrid template (ServicePagePro).
// Framing: outcome-led — a full pipeline of qualified, sales-ready conversations, not raw list
// volume. Positioning: fractional Chief AI Officer applying an AI lens to prospecting,
// qualification, and follow-up. SEO/GEO: "Lead generation" leads the subhead's first sentence;
// Utah long-tail woven naturally; FAQs are self-contained, liftable answers.
const service = {
  title: 'Lead Generation',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Fill your pipeline. Talk to buyers, not tire-kickers.',
  headlineAccent: 'buyers',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/lead-generation.jpg',
  heroVideo: '/site-assets/videos/dmsite/services/lead-generation.mp4',
  stats: [
    { display: '10 – 50', suffix: ' /mo', label: 'Qualified meetings' },
    { display: '40 – 60', suffix: '%', label: 'Email open rates' },
    { value: 5, suffix: ' days', label: 'To first conversations' },
    { value: 100, suffix: '%', label: 'Owned by you' },
  ],
  subhead:
    'Lead generation is how we put your offer in front of the right decision-makers and turn cold prospects into booked calls — using AI to research, personalize, and follow up at a scale no team could match by hand. We run it for Utah businesses and beyond, and you keep every list, sequence, and system we build.',

  chips: ['Cold Email', 'LinkedIn', 'ICP Targeting', 'Qualification', 'Follow-Up', 'Booked Calls'],

  platform: {
    label: 'The Engine',
    title: 'One system that never stops prospecting.',
    body: 'AI finds the right accounts, writes the first line that earns a reply, and keeps following up until a real conversation happens. One connected outbound engine — and you own the lists, copy, and infrastructure we build.',
    features: [
      { num: '01', title: 'Live in days', desc: 'Warmed domains and proven sequence templates mean campaigns start sending fast — from kickoff to first replies in a fraction of the usual time.', viz: 'terminal' },
      { num: '02', title: 'Smart Qualification', desc: 'Every reply is scored and routed by intent — hot buyers to your calendar, maybes to nurture, wrong-fit filtered out. Nothing slips.', viz: 'routing' },
    ],
    mini: [
      { icon: 'cpu', title: 'AI Personalization', desc: 'Researched, not templated.' },
      { icon: 'shield', title: 'You Own It', desc: 'Lists + systems you keep.' },
      { icon: 'clock', title: 'Always-On Outreach', desc: 'Pipeline while you sleep.' },
      { icon: 'file', title: 'Full Reporting', desc: 'Live outreach dashboards.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'trending', title: 'A predictable pipeline', desc: 'Know how many qualified conversations to expect each month instead of guessing where the next deal comes from.' },
    { icon: 'clock', title: 'Skip the slow build', desc: 'Start conversations with in-market buyers now — no waiting months for SEO or content to compound.' },
    { icon: 'layers', title: 'Sell more without hiring', desc: 'AI does the prospecting, qualifying, and chasing of an entire SDR team, so your closers only talk to people worth their time.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we install it.',
  process: [
    { title: 'ICP & List Building', description: 'We define your ideal buyer and build targeted lists of accounts that match your exact criteria.' },
    { title: 'Messaging & AI Setup', description: 'We write sequences and train AI to personalize each opener, then warm domains for deliverability.' },
    { title: 'Multi-Channel Launch', description: 'Coordinated email and LinkedIn outreach goes live, tested and optimized as replies come in.' },
    { title: 'Qualify & Hand Off', description: 'We manage follow-ups, qualify replies, and book meetings straight to your calendar — you keep the system.' },
  ],

  successStory: {
    metric: 'Drives revenue',
    quote: "Professional, well organized, and knowledgeable. If you're looking for a company that can drive revenue and expand your business success, this is the right place for you.",
    name: 'Chris',
    company: 'Google Review',
  },

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What is lead generation?',
      answer: 'Lead generation is the process of finding potential customers and starting conversations that turn them into sales opportunities. For B2B, that usually means identifying the right decision-makers, reaching out with a relevant message, and qualifying who is genuinely interested — so your sales team spends time closing instead of hunting. We use AI to handle the research, personalization, and follow-up at scale.',
    },
    {
      question: 'How is this different from a traditional agency?',
      answer: 'A traditional agency rents you outreach services and keeps the lists, copy, and infrastructure. We act as your fractional Chief AI Officer and build the outbound engine inside your business — you own every prospect list, sequence, and system we install. That means full-agency output and an AI-driven pipeline without the endless retainer or dependency.',
    },
    {
      question: 'How many qualified meetings can I expect per month?',
      answer: 'Results vary by industry, offer, and target market, but most campaigns book 10–50 qualified meetings per month. We optimize for quality over raw volume — getting you in front of decision-makers who actually need what you sell, not just filling your calendar with unqualified calls.',
    },
    {
      question: 'Is cold outreach still effective, and how do you stay out of spam?',
      answer: 'Yes. Targeted, personalized outreach still consistently earns 40–60% open rates and 5–15% reply rates. We protect deliverability with domain warming, SPF, DKIM, and DMARC configuration, multiple sending domains, and CAN-SPAM compliance — so messages land in inboxes, not spam folders.',
    },
    {
      question: 'Do you provide the leads or just the system?',
      answer: 'Both. We handle the complete process: prospect research, list building, messaging, AI personalization, deliverability infrastructure, campaign management, and qualified meetings booked on your calendar. You focus on closing deals — and because you own everything we build, the pipeline keeps working even after our engagement ends.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function LeadGeneration() {
  return <ServicePagePro service={service} />;
}
