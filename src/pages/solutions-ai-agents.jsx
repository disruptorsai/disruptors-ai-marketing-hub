import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// AI Agents / Agentic AI on the locked Hybrid template (ServicePagePro).
// New page (added per keyword research: "ai agents" ~60.5K/mo +15% YoY and "agentic ai"
// ~110K/mo +39% YoY are the two highest-volume on-trend terms in the site's validated
// keyword set, and previously had zero dedicated content — closest existing coverage was
// solutions-ai-automation, which is framed as "automation" rather than "agents").
// Framing: agents that take multi-step action inside real tools, not single-turn chatbots.
// No successStory — every real, verified testimonial on file is already assigned to another
// service page; omitting rather than reusing/fabricating one (successStory is optional in
// ServicePagePro — solutions-seo-geo and solutions-fractional-cmo already ship without one).
const service = {
  title: 'AI Agents & Agentic AI',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Agents that work your business, not just answer it.',
  headlineAccent: 'work',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/ai-automation.jpg',
  stats: [
    { value: 24, suffix: '/7', label: 'Always-on operation' },
    { display: '10 – 30', suffix: ' hrs', label: 'Reclaimed / week' },
    { display: '2 – 6', suffix: ' wks', label: 'To first agent live' },
    { value: 100, suffix: '%', label: 'Owned by you' },
  ],
  subhead:
    'AI agents are software that can reason, decide, and take multi-step action on their own — not just answer a single question. We design and deploy agentic systems that handle real workflows across your business: qualifying leads, following up, updating your CRM, and escalating to a person only when one is actually needed.',

  chips: ['Lead Qualification', 'Follow-Up', 'Scheduling', 'CRM Updates', 'Support Triage', 'Reporting'],

  platform: {
    label: 'The Agent Stack',
    title: 'Agents that act, not just chat.',
    body: "Most \"AI chatbots\" just answer questions. Our agents are connected to your actual tools — CRM, calendar, inbox — so they can qualify a lead, book the call, and update the record end to end, without a human relaying information between systems.",
    features: [
      { num: '01', title: 'Reasons through multi-step tasks', desc: 'Agents break a goal into steps, use tools to complete each one, and adapt when something changes — not a single-turn reply.', viz: 'terminal' },
      { num: '02', title: 'Routes to the right system', desc: 'Every event — a new lead, a support ticket, a booking — gets picked up and routed to the right tool or person automatically.', viz: 'routing' },
    ],
    mini: [
      { icon: 'tools', title: 'Tool-Connected', desc: 'Acts inside your real stack.' },
      { icon: 'own', title: 'You Own It', desc: 'Infrastructure you keep.' },
      { icon: 'alwayson', title: '24/7 Operation', desc: 'Works nights and weekends.' },
      { icon: 'handoff', title: 'Full Handoff', desc: 'Docs + training included.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'reliable', title: 'Nothing falls through', desc: 'An agent follows up on every lead and every task, every time — not just when someone remembers to.' },
    { icon: 'team', title: 'Scale without hiring', desc: 'One agent can carry the repetitive parts of several roles at once, freeing your team for the judgment calls.' },
    { icon: 'speed', title: 'Faster response, more revenue', desc: 'Agents respond in seconds instead of hours — consistently the single biggest lever on conversion.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we install it.',
  process: [
    { title: 'Map the workflow', description: 'We identify which real workflow — lead follow-up, intake, scheduling — is the best first agent to build.' },
    { title: 'Design the agent', description: 'We define exactly what it can decide on its own, and where it hands off to a person.' },
    { title: 'Connect your tools', description: 'The agent is wired into your CRM, calendar, and inbox so it can actually take action, not just chat.' },
    { title: 'Launch & monitor', description: "It goes live, we monitor its decisions closely at first, and hand off full documentation once it's proven out." },
  ],

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What is an AI agent, really?',
      answer: "An AI agent is software that can take a goal, break it into steps, use tools (like your CRM or calendar) to complete them, and adjust when something changes — instead of just replying to one message at a time. It's \"agentic\" because it can act, not just respond.",
    },
    {
      question: 'Is this different from a chatbot?',
      answer: 'Yes. A chatbot answers a question in a chat window. An agent is connected to your actual systems, so it can look up a record, update it, book a meeting, or escalate to a person — all as part of completing a task.',
    },
    {
      question: 'What can an agent do on its own, versus needing a human?',
      answer: 'That boundary is something we define with you up front. Common pattern: agents qualify and route leads, draft follow-ups, and handle scheduling on their own, while anything involving a judgment call, a price exception, or a sensitive situation gets escalated to your team.',
    },
    {
      question: 'How is this different from hiring a marketing agency?',
      answer: 'A traditional agency rents you services and keeps the systems. We act as your fractional Chief AI Officer and build the agent infrastructure inside your business — you own everything we install.',
    },
    {
      question: 'How long does it take to get an agent live?',
      answer: 'A single, well-scoped agent (like lead follow-up) is typically live in 2–4 weeks. A multi-agent system spanning several workflows takes 4–8 weeks depending on how many tools it needs to connect to.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function AiAgents() {
  return <ServicePagePro service={service} />;
}
