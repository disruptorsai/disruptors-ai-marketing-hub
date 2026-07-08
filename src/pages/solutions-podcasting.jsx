import React from 'react';
import ServicePagePro from '../components/solutions/ServicePagePro';

// Podcast Production on the locked Hybrid template (ServicePagePro).
// Framing: outcome-led — a professionally produced show builds authority, and AI turns every
// episode into weeks of short-form clips, show notes, and social content. Positioning:
// fractional Chief AI Officer applying an AI lens to repurposing, not just a recording studio.
// SEO/GEO: "Podcast production" leads the subhead's first sentence; Utah long-tail woven in;
// FAQs are self-contained, liftable answers.
const service = {
  title: 'Podcast Production',
  eyebrow: 'Fractional Chief AI Officer',
  headline: 'Record once. Show up everywhere.',
  headlineAccent: 'everywhere',
  heroImage: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/v1/dmsite/services/podcasting.jpg',
  heroVideo: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/videos/dmsite/services/podcasting.mp4',
  stats: [
    { value: 1, suffix: ' shoot', label: 'Weeks of content' },
    { display: '20 – 40', suffix: ' clips', label: 'Per recording day' },
    { display: '3 – 4', suffix: ' wks', label: 'Concept to launch' },
    { value: 100, suffix: '%', label: 'Owned by you' },
  ],
  subhead:
    'Podcast production is how you build real authority on camera — one professional recording session in our Utah studio, engineered end to end, and then repurposed by AI into the clips, show notes, and posts that keep your brand visible all month. You host the conversation; we run everything else.',

  chips: ['Strategy', 'Studio Recording', 'Video + Audio', 'AI Clips', 'Show Notes', 'Distribution'],

  platform: {
    label: 'The Engine',
    title: 'One recording, a month of content.',
    body: "A great episode is only the start. We capture broadcast-quality video and audio, then run every recording through an AI repurposing pipeline that spins out short-form clips, show notes, and social posts — so a single studio day feeds every channel you're on.",
    features: [
      { num: '01', title: 'AI Repurposing Pipeline', desc: 'Each episode is transcribed, cut, and captioned into dozens of vertical clips, quote graphics, and posts — the busywork that usually kills a podcast, handled automatically.', viz: 'terminal' },
      { num: '02', title: 'Multi-Platform Distribution', desc: 'Long-form to YouTube and Spotify, clips to Reels, Shorts, and TikTok, show notes to your blog — every asset routed to the right place on schedule.', viz: 'routing' },
    ],
    mini: [
      { icon: 'file', title: 'Show Notes', desc: 'Transcripts + timestamps.' },
      { icon: 'layers', title: 'Clip Library', desc: 'Weeks of short-form.' },
      { icon: 'shield', title: 'You Own It', desc: 'Every asset is yours.' },
      { icon: 'zap', title: 'Fast Turnaround', desc: 'Edited within days.' },
    ],
  },

  outcomesEyebrow: '02 · Outcomes',
  outcomesTitle: 'What it changes.',
  outcomes: [
    { icon: 'trending', title: 'Become the authority', desc: 'A consistent, well-produced show puts your expertise on record and makes you the name people already trust before the first sales call.' },
    { icon: 'layers', title: 'One shoot, everywhere', desc: 'AI repurposing turns a single recording day into weeks of clips, posts, and articles — so you stay visible without living inside the content grind.' },
    { icon: 'clock', title: 'Stay consistent, effortlessly', desc: 'We handle strategy, editing, and publishing so episodes actually ship on schedule instead of stalling after the first few.' },
  ],

  processEyebrow: '03 · Process',
  processTitle: 'How we produce it.',
  process: [
    { title: 'Strategy & Positioning', description: 'We define your show concept, audience, and content pillars so every episode builds toward real authority.' },
    { title: 'Studio Recording', description: 'Multi-camera video and broadcast-quality audio in our Utah studio — or a remote kit if you record from anywhere.' },
    { title: 'Edit & AI Repurposing', description: 'Full post-production, then AI cuts each episode into clips, show notes, and social content built for every platform.' },
    { title: 'Distribution & Growth', description: 'We publish across podcast apps, YouTube, and social, then track what lands so the show keeps compounding.' },
  ],

  successStory: {
    metric: 'Message that lands',
    quote: 'I am thoroughly impressed with Disruptors Media. They are super talented and knowledgeable, but what impressed me even more is their dedication to their mission. They truly want to help others spread the message of health and wellness. My experience shooting a podcast with them was amazing.',
    name: 'Korina Flint',
    company: 'Health & Wellness Professional',
  },

  faqsEyebrow: '04 · Questions',
  faqsTitle: 'Frequently asked.',
  faqs: [
    {
      question: 'What does podcast production include?',
      answer: 'End to end, it covers show strategy and positioning, multi-camera video and broadcast-quality audio recording in our studio, full editing and post-production, show notes with transcripts and timestamps, AI repurposing of each episode into short-form clips and social posts, and multi-platform distribution to podcast apps, YouTube, and social. You host the conversation; we handle everything around it.',
    },
    {
      question: 'How is this different from a traditional production studio?',
      answer: "A traditional studio hands you a finished episode and stops there. We act as your fractional Chief AI Officer and treat every recording as source material: an AI pipeline repurposes each episode into dozens of clips, show notes, and posts, and we distribute them for you. You walk away with a month of content and full ownership of every asset, not just one file.",
    },
    {
      question: 'Do I need my own equipment or experience to start?',
      answer: 'No. Record in our Utah studio and we provide the cameras, lighting, microphones, and audio engineering, plus coaching on messaging and delivery. If you record remotely, we can ship a portable kit and guide the setup. You only need to show up ready to talk about what you know.',
    },
    {
      question: 'How does AI repurposing of episodes actually work?',
      answer: 'After each recording, we transcribe the full episode and use AI to identify the strongest moments, then cut them into captioned vertical clips for Reels, Shorts, and TikTok. The same transcript becomes show notes, blog content, and social posts. A single recording day typically produces 20 to 40 short-form assets, so your team stops manually clipping footage.',
    },
    {
      question: 'How long until my podcast launches, and how often should we publish?',
      answer: 'From concept to launch is usually three to four weeks, including strategy, branding, first recordings, and platform setup. We recommend launching with three to five episodes so new listeners have content to binge. After that, a weekly or bi-weekly cadence is sustainable, and the AI repurposing keeps you visible between episodes.',
    },
  ],

  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session',
};

export default function Podcasting() {
  return <ServicePagePro service={service} />;
}
