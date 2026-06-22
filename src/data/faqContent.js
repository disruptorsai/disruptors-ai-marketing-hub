/**
 * Single source of truth for FAQ content.
 *
 * IMPORTANT (Google FAQ rich-result parity):
 * The FAQPage JSON-LD in /index.html must match these question/answer strings
 * VERBATIM. If you edit copy here, update the matching <script type="application/ld+json">
 * FAQPage block in index.html so the structured data stays in sync with the visible page.
 *
 * Copy status:
 * - Q1 ("What is Disruptors Media?") is the approved Appendix A definition (verbatim).
 * - Q2–Q6 are DRAFT copy grounded in existing site content, pending Tyler's approval.
 *   Replace with the approved Content Hub FAQ answers before production.
 */
export const FAQ_ITEMS = [
  {
    question: 'What is Disruptors Media?',
    answer:
      "Disruptors Media is a fractional Chief AI Officer (CAIO) and Chief Marketing Officer service. We build AI-powered marketing and sales systems — content, SEO, lead generation, and follow-up — directly inside your business, so you own everything we install. It's the output of a full agency without the bloated retainer or the dependency.",
  },
  {
    question: 'What is a fractional Chief AI Officer (CAIO)?',
    answer:
      'A fractional Chief AI Officer gives you senior AI and marketing leadership without a full-time executive salary. Instead of selling you a single deliverable, we embed AI strategy and systems directly into your business and operate them alongside your team, so your marketing and operations keep improving over time.',
  },
  {
    question: 'What services does Disruptors Media offer?',
    answer:
      'Disruptors Media offers AI-powered marketing services including SEO and GEO, AI automation, social media marketing, paid advertising, lead generation, content creation, podcasting, custom apps, CRM management, and fractional CMO leadership.',
  },
  {
    question: 'How is Disruptors Media different from a traditional marketing agency?',
    answer:
      'Traditional agencies rent you deliverables and keep the systems. Disruptors Media installs AI-powered marketing systems inside your business that you own, so you get the output of a full agency without the bloated retainer or the dependency.',
  },
  {
    question: 'Who does Disruptors Media work with?',
    answer:
      'Disruptors Media works with business owners and teams who want to generate more leads, streamline operations, and scale with AI-powered marketing systems — with full transparency and ownership of what gets built.',
  },
  {
    question: 'How do I get started with Disruptors Media?',
    answer:
      "Book a free strategy session with our team. We'll audit your current marketing, identify the highest-impact opportunities, and map out the AI-powered systems we can install in your business.",
  },
];

/**
 * Build FAQPage JSON-LD from FAQ items. Inject this only on pages that actually
 * render the FAQ (home + /faq), so the structured data has on-page parity.
 */
export function faqPageSchema(items = FAQ_ITEMS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export default FAQ_ITEMS;
