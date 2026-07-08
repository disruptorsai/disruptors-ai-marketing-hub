import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// CRM Management on the locked Hybrid template (ServicePagePro).
// Framing: outcome-led — set up and optimize the CRM so the pipeline runs itself; automate
// data entry, follow-ups, and reporting so nothing slips. Positioning: fractional Chief AI
// Officer applying an AI lens to your existing stack, systems built in + owned by the client.
// SEO/GEO: "CRM management" leads the subhead's first sentence; Utah long-tail woven naturally;
// FAQs are self-contained, liftable answers.
const service = {
  title: 'CRM Management',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Your pipeline, finally running itself.',
  headlineAccent: 'itself',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/crm-management.jpg',
  heroVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/dmsite/services/crm-management.mp4',
  stats: [
    { value: 100, suffix: '%', label: 'Follow-ups logged' },
    { display: '8 – 15', suffix: ' hrs', label: 'Reclaimed / week' },
    { display: '2 – 6', suffix: ' wks', label: 'To fully dialed in' },
    { value: 1, suffix: ' hub', label: 'Single source of truth' },
  ],
  subhead:
    'CRM management is the work of setting up your CRM properly and keeping it clean — so every lead is captured, every follow-up happens on time, and your pipeline reflects reality. We tune the system, automate the busywork, and run it as your fractional Chief AI Officer, right here in Utah or wherever your team sits.',

  chips: ['HubSpot', 'GoHighLevel', 'Salesforce', 'Pipeline Hygiene', 'Automation', 'Reporting'],

  platform: {
    label: 'The System',
    title: 'A CRM that keeps itself clean.',
    body: 'Most CRMs rot because nobody has time to update them. We fix that — automating data entry, follow-ups, and pipeline hygiene so the system stays accurate on its own, and you keep everything we build.',
    features: [
      { num: '01', title: 'Set up right', desc: 'Pipelines, custom fields, and stages mapped to how you actually sell — configured and validated fast, not left to guesswork.', viz: 'terminal' },
      { num: '02', title: 'Smart Lead Routing', desc: 'Every inbound lead lands with the right rep, tagged and prioritized by intent — with follow-up sequences that fire automatically. Nothing slips.', viz: 'routing' },
    ],
    mini: [
      { icon: 'zap', title: 'Auto Data Entry', desc: 'Contacts logged for you.' },
      { icon: 'clock', title: 'Timed Follow-ups', desc: 'No lead goes cold.' },
      { icon: 'trending', title: 'Live Pipeline', desc: 'Reporting you can trust.' },
      { icon: 'shield', title: 'You Own It', desc: 'Your CRM, your data.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'file', title: 'Stop losing leads', desc: 'Every inquiry is captured and worked. Automated follow-ups mean deals stop falling through the cracks between busy weeks.' },
    { icon: 'clock', title: 'Kill the busywork', desc: 'Automate the logging, updating, and chasing that eats your reps’ day — reclaim 8–15 hours a week for actual selling.' },
    { icon: 'trending', title: 'See the truth', desc: 'A clean pipeline gives you accurate forecasts and reporting, so you make decisions on real numbers instead of gut feel.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we install it.',
  process: [
    { title: 'Discovery & Audit', description: 'We map your sales process, current CRM, and where leads and time are leaking today.' },
    { title: 'Strategy & Architecture', description: 'We design pipelines, fields, and automations around the way your team actually works.' },
    { title: 'Build & Migration', description: 'We configure it, migrate and clean your data, and connect email, calendar, and marketing tools.' },
    { title: 'Optimize & Hand Off', description: 'We train your team, tune it on real usage, and hand it over documented — it keeps running without us.' },
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
      question: 'What does CRM management include?',
      answer: 'CRM management covers setting up your CRM correctly, keeping the data clean, and automating the work that keeps it that way. In practice that means designing pipelines and stages around your sales process, automating data entry and follow-up sequences, routing leads to the right rep, migrating and de-duplicating existing records, and building reporting you can actually trust. Then we keep it running and optimized as your needs change.',
    },
    {
      question: 'Which CRM platform should we use?',
      answer: 'It depends on how you sell. HubSpot suits marketing-driven teams, GoHighLevel fits agencies and service businesses, Salesforce covers complex enterprise needs, and Pipedrive works well for lean sales teams. We assess your size, workflow, and budget, then recommend and configure the platform that fits — or optimize the one you already have instead of forcing a migration.',
    },
    {
      question: 'Can you clean up and migrate our existing data?',
      answer: 'Yes. We migrate from spreadsheets, legacy CRMs, and disconnected tools, and the process includes de-duplication, validation, and mapping into a clean structure. The goal is zero data loss and a database you can finally trust, with minimal disruption to your team while the switch happens.',
    },
    {
      question: 'How does AI actually improve CRM management?',
      answer: 'We apply an AI lens to the parts people hate doing. AI enriches new contacts, drafts and times follow-ups, flags deals going stale, catches duplicate or incomplete records before they pollute your pipeline, and summarizes account activity so reps walk into every call prepared. It handles the hygiene automatically so your data stays accurate without anyone babysitting it.',
    },
    {
      question: 'How is this different from a traditional agency?',
      answer: 'A traditional agency rents you services and keeps the systems. We act as your fractional Chief AI Officer and build the CRM infrastructure inside your business — you own the platform, the data, and every automation we install. You get full-agency capability without the permanent retainer or the vendor lock-in.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function CrmManagement() {
  return <ServicePagePro service={service} />;
}
