import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';

export default function ResourcesAiSuitcaseTermsDecoded() {
  usePageMeta({
    title: 'AI Suitcase Terms, Decoded — Agent, RAG, Autonomy | Disruptors Media',
    description: 'Agent, RAG, autonomy — terms that carry too many meanings. Here’s what leaders actually need to know about each one to make decisions.',
    path: '/resources-ai-suitcase-terms-decoded',
    jsonLd: [
      breadcrumb('AI Suitcase Terms, Decoded', '/resources-ai-suitcase-terms-decoded'),
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'AI suitcase terms, decoded',
        description: 'Agent, RAG, autonomy — terms that carry too many meanings. Here’s what leaders actually need to know to make decisions.',
        author: { '@type': 'Organization', name: 'Disruptors Media' },
        publisher: { '@type': 'Organization', name: 'Disruptors Media' },
      },
    ],
  });

  return (
    <div className="bg-[#1A1A1A] text-[#EAEAEA]">
      <div className="bg-[#0E0E0E] border-b border-[#2A2A2A] pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-gold-shine mb-2">AI Guides • 5 min read</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">AI suitcase terms, decoded</h1>
          <p className="mt-6 text-lg sm:text-xl text-[#C7C7C7]">Agent, RAG, autonomy—terms that carry too many meanings. Here’s what leaders actually need to know to make decisions.</p>
        </div>
      </div>

      <div className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-lg">
          <h2>The Problem with Suitcase Words</h2>
          <p>Some terms, like "agent," are so packed with different meanings they become useless without clarification. Let's unpack them.</p>

          <h3>Agents: What they are (and aren't)</h3>
          <p>In AI, an "agent" is a system that can perceive its environment, make decisions, and take actions to achieve a goal. But it's not a magical employee.</p>
          <ul>
            <li><strong>What it is:</strong> An automated workflow that can use tools (like search or a calculator) to complete a task you define.</li>
            <li><strong>What it isn't:</strong> A fully autonomous being that can improvise beyond its programming and goals. Human oversight is critical.</li>
          </ul>

          <h3>RAG (Retrieval-Augmented Generation)</h3>
          <p>RAG is a technique that helps language models answer questions based on a specific set of documents you provide, reducing hallucinations and improving accuracy.</p>
          <ul>
            <li><strong>When it helps:</strong> For building internal knowledge bases, customer support bots, or any application where answers must come from a trusted source.</li>
            <li><strong>When it doesn't:</strong> For purely creative tasks where external knowledge isn't required.</li>
          </ul>

          <div className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-2xl my-12 p-6 not-prose">
            <h4 className="text-xl font-bold text-white mb-3">Want the 90-day version?</h4>
            <p className="text-[#C7C7C7] mb-4">Turn theory into practice. Our assessment gives you a clear pilot plan.</p>
            <Button asChild className="bg-white text-[#0E0E0E] font-semibold hover:bg-[#EAEAEA] rounded-xl">
              <Link to={createPageUrl("assessment")}>Take the Assessment</Link>
            </Button>
          </div>

          <h3>Autonomy: Risks & Approvals</h3>
          <p>True autonomy is the final, most sensitive frontier. It implies a system can operate without human intervention. This requires robust governance.</p>
          <blockquote>
            Checklist: When to say 'no' to full autonomy. Is the task high-risk? Does it involve PII? Can failure cause significant financial or reputational damage? If yes, a human-in-the-loop is non-negotiable.
          </blockquote>
        </div>
      </div>
    </div>
  );
}