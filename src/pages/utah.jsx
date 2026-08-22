import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';
import FastVideo from '@/components/shared/FastVideo';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';

/**
 * Utah / Salt Lake City location page.
 *
 * One comprehensive local page rather than several near-duplicate ones (fractional cmo
 * utah, seo agency salt lake city, marketing agency salt lake city, ai automation agency
 * salt lake city, marketing automation agency utah, lead generation salt lake city — all
 * the same business/team serving the same metro, so splitting them would just be thin,
 * cannibalizing content). Real NAP throughout — same address/phone as the footer and the
 * site-wide ProfessionalService schema in index.html.
 */

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-gold-shine">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#BF953F]" /> {children}
    </span>
  );
}

const LOCAL_SERVICES = [
  { title: 'Fractional CMO', desc: 'Executive marketing leadership for Utah businesses, without the full-time salary.', slug: 'solutions-fractional-cmo' },
  { title: 'AI Agents & Automation', desc: 'Agentic systems that qualify leads, follow up, and run your ops 24/7.', slug: 'solutions-ai-agents' },
  { title: 'SEO & GEO', desc: 'Rank on Google and get cited inside AI answers like ChatGPT and AI Overviews.', slug: 'solutions-seo-geo' },
  { title: 'Lead Generation', desc: 'Multi-channel systems that fill your pipeline with qualified prospects.', slug: 'solutions-lead-generation' },
  { title: 'Paid Advertising', desc: 'AI-optimized ad campaigns across Google, Meta, and beyond.', slug: 'solutions-paid-advertising' },
  { title: 'CRM Management', desc: 'CRM setup and automation so no lead falls through the cracks.', slug: 'solutions-crm-management' },
  { title: 'Social Media Marketing', desc: 'Content and community management across every major platform.', slug: 'solutions-social-media' },
  { title: 'Custom Apps', desc: 'Software built around the exact way your business works.', slug: 'solutions-custom-apps' },
  { title: 'Podcasting', desc: 'Professional podcast production out of our Utah studio.', slug: 'solutions-podcasting' },
];

const FAQS = [
  {
    question: 'Where is Disruptors Media located?',
    answer: 'Our studio and office are in North Salt Lake, Utah, at 650 N Main St, North Salt Lake, UT 84054. We work with clients throughout Salt Lake City, the greater Utah area, and nationwide.',
  },
  {
    question: 'Do you only work with Utah-based businesses?',
    answer: "No — most of our work is remote and we serve clients nationwide. Being based in Utah just means local businesses can meet with us in person, visit our podcast studio, or work with a team that's actually down the street.",
  },
  {
    question: 'What is a fractional CMO, and do I need one?',
    answer: 'A fractional CMO is a part-time, executive-level Chief Marketing Officer who sets strategy and directs your marketing without the cost of a full-time hire. It fits businesses that have outgrown ad-hoc marketing but aren’t ready for (or don’t want) a full-time CMO salary.',
  },
  {
    question: 'What is a fractional Chief AI Officer (CAIO), and how is it different from an agency?',
    answer: 'A fractional Chief AI Officer is a part-time, executive-level leader who decides where AI belongs in your business and builds it in — marketing, automation, SEO, and lead generation systems installed inside your business and owned by you. Unlike an agency you rent month to month, a CAIO leaves you owning everything we install. Being Utah-based just means faster in-person collaboration when you want it.',
  },
];

export default function Utah() {
  usePageMeta({
    title: 'Utah Fractional Chief AI Officer (CAIO) & CMO | Disruptors Media',
    description:
      'Utah-based fractional Chief AI Officer (CAIO) & CMO serving Salt Lake City and nationwide — AI marketing, SEO, and lead-generation systems installed inside your business.',
    path: '/utah',
    jsonLd: [
      breadcrumb('Utah', '/utah'),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Disruptors Media',
        image: 'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png',
        telephone: '+1-801-918-0223',
        email: 'tyler@disruptorsmedia.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '650 N Main St',
          addressLocality: 'North Salt Lake',
          addressRegion: 'UT',
          postalCode: '84054',
          addressCountry: 'US',
        },
        areaServed: [{ '@type': 'City', name: 'Salt Lake City' }, { '@type': 'State', name: 'Utah' }],
        url: 'https://disruptorsmedia.com/utah',
      },
    ],
  });

  return (
    <div className="bg-[#080a0d]">
      <h1 className="sr-only">Fractional Chief AI Officer (CAIO) &amp; CMO in Utah | Disruptors Media</h1>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[#080a0d] pt-[clamp(96px,16vw,150px)] pb-[clamp(48px,8vw,80px)]">
        <div aria-hidden="true" className="absolute inset-0 z-0">
          <FastVideo
            src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/web/home/handshake-landscape.mp4"
            preset="fullscreen"
            autoplay loop muted playsInline
            preload="metadata"
            lazy={false}
            className="h-full w-full object-cover opacity-[0.75] grayscale-[.3] contrast-105"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,10,13,.28) 0%, rgba(8,10,13,.62) 60%, #080a0d 100%)' }} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 top-10 z-[1] h-80 w-80 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(191,149,63,.14) 0%, transparent 70%)' }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <Eyebrow>Based in North Salt Lake, UT</Eyebrow>
            <h2 className="mt-6 text-[clamp(36px,6vw,68px)] font-bold leading-[0.98] tracking-tight text-[#fafafa]">
              Your fractional <span className="text-gold-shine inline-block pr-[0.08em] -mr-[0.08em]">Chief AI Officer</span> & CMO in Utah
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65 sm:text-xl">
              We install a fractional Chief AI Officer inside your business — the AI-powered marketing, automation, and lead-generation systems a modern company needs, built for Salt Lake City businesses and clients nationwide, and owned by you.
            </p>
            <div className="mt-9">
              <Link
                to={createPageUrl('book-strategy-session')}
                className="inline-flex rounded-[3px] bg-[#BF953F] px-7 py-3.5 text-center font-medium text-[#0b0b0c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#AA771C]"
              >
                Book a Strategy Session
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="bg-[#080a0d] py-[clamp(40px,7vw,80px)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <Eyebrow>What We Do Here</Eyebrow>
            <h2 className="mt-4 text-[clamp(26px,3.6vw,40px)] font-bold tracking-tight text-white">Serving Salt Lake City & Utah businesses</h2>
            <p className="mt-3 text-white/55">The same AI-powered marketing systems we build nationwide, from a team you can meet in person.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LOCAL_SERVICES.map((s) => (
              <Link
                key={s.slug}
                to={createPageUrl(s.slug)}
                className="group flex flex-col rounded-xl border border-white/10 bg-[#0f0f14] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#BF953F]/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-gold-shine">{s.title}</h3>
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-white/30 transition-colors group-hover:text-[#BF953F]" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LOCAL INFO ===== */}
      <section className="bg-[#080a0d] pb-[clamp(40px,7vw,80px)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-[#0f0f14] p-8 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-gold-shine">
                  <MapPin className="h-4 w-4" />
                  <span className="font-mono text-xs uppercase tracking-[0.14em]">Visit or call</span>
                </div>
                <p className="mt-3 text-lg text-white">650 N Main St, North Salt Lake, UT 84054</p>
                <p className="mt-1 text-white/55">
                  <a href="tel:+18019180223" className="hover:text-gold-shine transition-colors">(801) 918-0223</a>
                  {' · '}
                  <a href="mailto:tyler@disruptorsmedia.com" className="hover:text-gold-shine transition-colors">tyler@disruptorsmedia.com</a>
                </p>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=650+N+Main+St%2C+North+Salt+Lake%2C+UT+84054"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[3px] border border-[#BF953F] px-6 py-3 text-center font-medium text-gold-shine transition-all duration-300 hover:bg-[#BF953F]/10"
              >
                Get Directions <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-[#080a0d] pb-[clamp(56px,9vw,110px)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-4 text-[clamp(26px,3.6vw,40px)] font-bold tracking-tight text-white">Frequently asked.</h2>
          </div>
          <div className="border-t border-white/10">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-white/10 py-6">
                <h3 className="text-lg font-bold tracking-tight text-white">{faq.question}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/65">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
