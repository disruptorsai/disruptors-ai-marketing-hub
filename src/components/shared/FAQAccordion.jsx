import React from 'react';
import { ChevronDown } from 'lucide-react';
import FAQ_ITEMS from '@/data/faqContent';

/**
 * Semantic, accessible FAQ accordion.
 *
 * Renders native <details>/<summary> (works without JS — important for prerender/GEO)
 * with each question as an <h3> and each answer as a <p>. The visible copy here must
 * stay in parity with the FAQPage JSON-LD in index.html (Google rich-result requirement).
 *
 * @param {Array<{question: string, answer: string}>} items - defaults to FAQ_ITEMS
 */
export default function FAQAccordion({ items = FAQ_ITEMS, className = '' }) {
  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {items.map((item, i) => (
        <details key={i} className="group py-5">
          <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {item.question}
            </h3>
            <ChevronDown
              aria-hidden="true"
              className="mt-1 h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="mt-3 text-base sm:text-lg text-gray-700 leading-relaxed">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
