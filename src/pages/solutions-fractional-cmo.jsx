import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// Fractional CMO on the locked Hybrid template (ServicePagePro).
// Framing: outcome-led — C-level marketing leadership without the full-time salary. Positioning:
// a modern CMO who brings AI systems and execution, not just strategy decks — an extension of the
// fractional Chief AI Officer offering. SEO/GEO: "A fractional CMO" leads the subhead's first
// sentence; Utah long-tail woven naturally; FAQs are self-contained, liftable answers.
const service = {
  title: 'Fractional CMO',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Executive marketing leadership. Without the executive salary.',
  headlineAccent: 'Without',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/images/v1/dmsite/services/fractional-cmo.jpg',
  stats: [
    { value: 200, prefix: '$', suffix: 'K+', label: 'Salary you skip' },
    { display: '10 – 20', suffix: ' hrs', label: 'Senior time / week' },
    { display: '2 – 4', suffix: ' wks', label: 'To a live roadmap' },
    { value: 1, suffix: ' leader', label: 'Owns the whole plan' },
  ],
  subhead:
    'A fractional CMO gives you seasoned, C-level marketing leadership on a part-time basis — the strategy, the team alignment, and the AI-forward direction of a full-time chief marketing officer, without the six-figure salary or equity. We plug into your leadership team, own the plan, and drive it to numbers.',

  chips: ['Strategy', 'Positioning', 'Team Alignment', 'AI Systems', 'Budget & ROI', 'Reporting'],

  platform: {
    label: 'The Operator',
    title: 'A CMO who ships, not just presents.',
    body: "Most fractional CMOs hand you a deck and disappear. We bring the strategy and the systems that execute it — AI workflows, clear priorities, and a team that's finally pulling in one direction. You get leadership that lives in the numbers.",
    features: [
      { num: '01', title: 'Roadmap in weeks', desc: 'We audit your marketing, competitors, and pipeline, then hand you a prioritized plan with real timelines — not a quarter-long discovery phase.', viz: 'terminal' },
      { num: '02', title: 'One aligned team', desc: 'We route strategy, in-house staff, and outside vendors toward the same goals, so effort stops scattering and every initiative maps to revenue.', viz: 'routing' },
    ],
    mini: [
      { icon: 'revenue', title: 'Revenue Focus', desc: 'Every play tied to pipeline.' },
      { icon: 'aiforward', title: 'AI-Forward', desc: 'Modern systems, not just decks.' },
      { icon: 'align', title: 'Team Alignment', desc: 'Staff + vendors, one plan.' },
      { icon: 'execreport', title: 'Exec Reporting', desc: 'Clear numbers, every month.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'tiedrevenue', title: 'Marketing that ties to revenue', desc: 'Senior leadership makes the calls that move pipeline — so spend, channels, and messaging finally connect to the numbers that matter.' },
    { icon: 'direction', title: 'A team pulling one direction', desc: 'Your people, agencies, and freelancers stop working in silos. One cohesive plan aligns every initiative behind shared goals.' },
    { icon: 'engine', title: 'An AI-forward marketing engine', desc: 'You get a CMO who installs modern AI systems and automation into how you market — not a strategy deck that sits in a drawer.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we lead it.',
  process: [
    { title: 'Strategic Assessment', description: 'We audit your current marketing, competitive landscape, and growth opportunities to find the real levers.' },
    { title: 'Roadmap & Priorities', description: 'We build a clear marketing plan with priorities, timelines, and measurable objectives everyone can rally behind.' },
    { title: 'Lead & Execute', description: 'We guide your team, vendors, and AI systems day to day — hands-on leadership, not just advice from the sidelines.' },
    { title: 'Measure & Optimize', description: 'We report against objectives every month and refine the plan so results compound instead of resetting each quarter.' },
  ],

  // successStory intentionally omitted — pending a real fractional-CMO client story (do not reuse another page's review).

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What is a fractional CMO?',
      answer: 'A fractional CMO is a senior marketing executive who leads your marketing part-time as a member of your leadership team. Instead of paying a six-figure salary for a full-time chief marketing officer, you get their strategy, decision-making, team leadership, and accountability for results on a fraction of the hours — and cost. They own the marketing plan and are measured on the same outcomes a full-time CMO would be.',
    },
    {
      question: 'How is this different from hiring a full-time CMO or an agency?',
      answer: 'A full-time CMO costs $200K+ in salary plus equity and benefits, and takes months to hire. An agency rents you services but keeps the strategy and systems, so you stay dependent on them. A fractional CMO sits inside your leadership team, owns the plan, and builds AI systems and processes you keep — executive-level leadership without the full-time payroll or the agency lock-in.',
    },
    {
      question: 'What makes your Fractional CMO service AI-forward?',
      answer: 'We lead marketing the way a modern chief marketing officer should — pairing strategy with the AI systems and automation that actually execute it. That means intelligent lead routing, automated reporting, content pipelines, and workflows built into your stack. As part of our fractional Chief AI Officer positioning, you get a leader who installs technology into how you market, not just a strategist who hands over slides.',
    },
    {
      question: 'How much time and commitment is involved?',
      answer: 'Most engagements run 10-20 hours per week, covering strategic planning, team and vendor management, and executive reporting. Engagements typically last 6-12 months to implement meaningful change, and many clients keep us on indefinitely as their ongoing marketing leader. The commitment scales up or down as your needs and growth stage shift.',
    },
    {
      question: 'What kind of companies benefit most, and do you work with Utah businesses?',
      answer: 'Companies roughly in the $2M-$50M revenue range benefit most: you need real marketing leadership but cannot yet justify a full-time CMO. We work with founders and executive teams across the country and are based in Utah, so Salt Lake City and Utah-based businesses also get local, in-market leadership. Startups preparing to scale and established companies looking to level up both see strong value.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function FractionalCmo() {
  return <ServicePagePro service={service} />;
}
