import React from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/shared/PageTitle';
import FAQAccordion from '../components/shared/FAQAccordion';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';
import { faqPageSchema } from '@/data/faqContent';

export default function FAQ() {
  usePageMeta({
    title: 'FAQ — Disruptors Media',
    description:
      'Frequently asked questions about Disruptors Media, our fractional CAIO/CMO service, the services we offer, and how we install AI-powered marketing systems inside your business.',
    path: '/faq',
    jsonLd: [breadcrumb('FAQ', '/faq'), faqPageSchema()],
  });

  return (
    <div>
      {/* Page Title (renders the single <h1> for this route) */}
      <PageTitle title="FAQ" />

      <section aria-labelledby="faq-heading" className="bg-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="sr-only">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 mb-8">
            Answers to common questions about Disruptors Media, our fractional CAIO/CMO
            service, and how we install AI-powered marketing systems inside your business.
          </p>

          <FAQAccordion />

          <div className="mt-12 text-center">
            <p className="text-gray-700 mb-4">Still have questions?</p>
            <Link
              to="/book-strategy-session"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Book a strategy session
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
