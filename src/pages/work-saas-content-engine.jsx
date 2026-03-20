
import React from 'react';

const caseData = {
  client: 'SaaS Content Engine',
  goal: 'Scaled content production by 300% and reduced cost-per-article by 70%.',
  heroMedia: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1737507200/saas-content-engine-dashboard.webp',
  // metrics property removed as per request ("Stats removed")
  challenge: <p>A B2B SaaS client struggled to produce high-quality, technical content at the volume needed to compete in organic search. Their small marketing team was bottlenecked by research, writing, and review cycles, leading to a sparse content calendar and slow growth.</p>,
  approach: <p>We designed and implemented a "Content Engine" powered by AI. This system used fine-tuned language models for initial drafting, automated research agents to gather data and sources, and a streamlined human-in-the-loop workflow for editing and approval. We integrated this with their existing CMS for one-click publishing.</p>,
  outcome: <p>Within 90 days, the client was publishing 3x the number of articles with the same team size. The AI-assisted process improved first-draft quality, freeing up subject matter experts to focus on high-level insights rather than basic writing. The increased volume of targeted content led to a significant, sustained increase in organic traffic and lead generation.</p>,
  testimonialQuote: 'Disruptors Media didn’t just give us content; they gave us a scalable system. Our content engine is now a core asset of our marketing program.',
  testimonialAuthor: 'CEO, SaaS Content Engine Client',
};

export default function WorkSaaSContentEngine() {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{caseData.client}</h1>
          <p className="text-xl sm:text-2xl text-indigo-600 font-semibold mb-8">{caseData.goal}</p>
          {caseData.heroMedia && (
            <div className="mt-10 overflow-hidden rounded-lg shadow-xl">
              <img
                src={caseData.heroMedia}
                alt="SaaS Content Engine Dashboard - Analytics and content management interface showing 300% increase in content production and 70% cost reduction"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </section>

      <div className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
          
          {/* Metrics section removed as per request */}

          {/* Challenge Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
            <div className="prose prose-lg text-gray-700">
              {caseData.challenge}
            </div>
          </section>

          {/* Approach Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Approach</h2>
            <div className="prose prose-lg text-gray-700">
              {caseData.approach}
            </div>
          </section>

          {/* Outcome Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Outcome</h2>
            <div className="prose prose-lg text-gray-700">
              {caseData.outcome}
            </div>
          </section>

          {/* Testimonial Section */}
          {caseData.testimonialQuote && (
            <section className="bg-indigo-50 p-8 rounded-lg shadow-inner">
              <blockquote className="text-xl sm:text-2xl font-medium text-indigo-800 italic leading-snug">
                &ldquo;{caseData.testimonialQuote}&rdquo;
              </blockquote>
              <p className="mt-4 text-lg font-semibold text-indigo-700">
                &mdash; {caseData.testimonialAuthor}
              </p>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
