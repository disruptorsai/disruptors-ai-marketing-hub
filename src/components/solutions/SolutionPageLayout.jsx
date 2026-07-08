
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FastVideo from '@/components/shared/FastVideo';
import PlaceholderAnimation from '../shared/PlaceholderAnimation';
import DualCTABlock from '../shared/DualCTABlock';
import { CheckCircle, Quote, ArrowRight, HelpCircle, ChevronDown } from 'lucide-react';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';

/**
 * Shared service-page template (the single "templated service page" from the rebuild plan).
 *
 * Design system: branded dark — solid charcoal base (#14161a) with gold accents (#BF953F).
 * The page owns its background (it no longer relies on Layout's full-page background image),
 * which is why the root carries a solid bg + decorative gold glows for visual depth.
 *
 * Section order (FAQ kept at the bottom, just above the final CTA, per the rebuild plan):
 *   Hero → What is → Outcomes → How It Works → What You Get → Success Stories → FAQ → CTA
 *
 * Every section is driven by the `service` config object — do not hard-code copy here so the
 * 9 service pages stay intentional-per-page while sharing one template.
 */

const CHARCOAL = '#14161a';
const GOLD = '#BF953F';

// Subtle radial gold glow used to add depth so sections never read as empty charcoal.
function SectionGlow({ position = 'top-right' }) {
    const positions = {
        'top-right': 'top-0 right-0 translate-x-1/3 -translate-y-1/3',
        'top-left': 'top-0 left-0 -translate-x-1/3 -translate-y-1/3',
        'bottom-right': 'bottom-0 right-0 translate-x-1/3 translate-y-1/3',
        'bottom-left': 'bottom-0 left-0 -translate-x-1/3 translate-y-1/3',
    };
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute ${positions[position]} h-[34rem] w-[34rem] rounded-full blur-3xl`}
            style={{ background: `radial-gradient(circle, ${GOLD}1f 0%, transparent 70%)` }}
        />
    );
}

// Thin gold divider for rhythm between sections.
function GoldDivider() {
    return (
        <div className="mx-auto h-px w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#BF953F]/40 to-transparent" />
        </div>
    );
}

export default function SolutionPageLayout({ service }) {
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    // Per-route SEO/GEO metadata + Service schema, derived from the service config.
    const metaPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const metaDescription = service
        ? `${service.descriptivePhrase ? service.descriptivePhrase + '. ' : ''}${service.overview || ''}`
            .replace(/\s+/g, ' ').trim().slice(0, 155)
        : '';
    const solutionJsonLd = service ? [
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.title,
            description: metaDescription,
            provider: { '@type': 'Organization', name: 'Disruptors Media' },
            areaServed: { '@type': 'Country', name: 'United States' },
            url: `https://disruptorsmedia.com${metaPath}`,
        },
        breadcrumb(service.title, metaPath),
    ] : [];
    // FAQPage schema mirrors the rendered FAQ accordion verbatim (Google requires parity).
    if (service?.faqs?.length) {
        solutionJsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: service.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
        });
    }
    usePageMeta(service ? {
        title: `${service.title} | Disruptors Media`,
        description: metaDescription,
        path: metaPath,
        jsonLd: solutionJsonLd,
    } : {});

    if (!service) {
        return <div>Loading service details...</div>;
    }

    const {
        title,
        h2,
        descriptivePhrase,
        overview,
        heroImage,
        heroVideo,
        outcomes = [],
        process = [],
        features = [],
        featuresTitle,
        faqs = [],
        testimonials = [],
        successStoriesTitle = 'Client Success Stories',
        cta_label = 'Book a Strategy Session',
        cta_link = 'book-strategy-session'
    } = service;

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const panelClass =
        'rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-xl';

    return (
        <div className="relative overflow-hidden text-white" style={{ backgroundColor: CHARCOAL }}>
            {/* Hero Section */}
            <section className="relative py-24 sm:py-32">
                <SectionGlow position="top-right" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {descriptivePhrase && (
                                <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold-shine mb-5">
                                    {descriptivePhrase}
                                </p>
                            )}
                            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-white">{title}</h1>
                            {h2 && <p className="text-2xl text-gray-300 leading-relaxed">{h2}</p>}
                            <div className="mt-8">
                                <Button asChild size="lg" className="bg-[#BF953F] text-black hover:bg-[#AA771C] font-semibold">
                                    <Link to={createPageUrl(cta_link)}>
                                        {cta_label}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                        >
                            {heroVideo ? (
                                <FastVideo
                                    src={heroVideo}
                                    preset="hero"
                                    autoplay={true}
                                    loop={true}
                                    muted={true}
                                    playsInline={true}
                                    preload="metadata"
                                    fetchpriority="high"
                                    lazy={false}
                                    className="w-full h-auto object-cover"
                                    poster={heroImage}
                                    aria-label={`${title} overview video`}
                                />
                            ) : heroImage ? (
                                <img
                                    src={heroImage}
                                    alt={`${title} — Disruptors Media`}
                                    className="w-full h-auto object-cover"
                                />
                            ) : (
                                <div className="flex gap-4 justify-center p-8">
                                    <PlaceholderAnimation type="funnel" />
                                    <PlaceholderAnimation type="fingers" />
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            <GoldDivider />

            {/* Overview — answer-first framing (GEO-liftable) */}
            <section className="relative py-20 sm:py-24">
                <SectionGlow position="bottom-left" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className={`${panelClass} p-8 sm:p-12 text-center`}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">What is {title}?</h2>
                        <p className="text-lg text-gray-300 leading-relaxed mb-8">{overview}</p>
                        <Button asChild size="lg" className="bg-[#BF953F] text-black hover:bg-[#AA771C] font-semibold">
                            <Link to={createPageUrl(cta_link)}>{cta_label}</Link>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Outcomes */}
            {outcomes.length > 0 && (
                <section className="relative py-16 sm:py-24">
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-white">Expected Outcomes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {outcomes.map((outcome, i) => (
                                <motion.div
                                    key={i}
                                    className={`${panelClass} p-8`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <CheckCircle className="w-8 h-8 icon-gold-shine mx-auto mb-4" />
                                    <h3 className="font-bold text-lg mb-2 text-white">{outcome.title}</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">{outcome.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Process / How It Works */}
            {process.length > 0 && (
                <section className="relative py-16 sm:py-24">
                    <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
                    <SectionGlow position="top-left" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">How It Works</h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Our proven process for delivering results
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {process.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="relative"
                                >
                                    <div className={`${panelClass} p-8 h-full`}>
                                        <div className="w-12 h-12 bg-[#BF953F] text-black rounded-full flex items-center justify-center font-bold text-xl mb-4">
                                            {index + 1}
                                        </div>
                                        <h3 className="font-bold text-xl mb-3 text-white">{step.title}</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                                    </div>
                                    {index < process.length - 1 && (
                                        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                            <ArrowRight className="w-8 h-8 icon-gold-shine" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features / Deliverables */}
            {features.length > 0 && (
                <section className="relative py-16 sm:py-24">
                    <SectionGlow position="bottom-right" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                                {featuresTitle || 'What You Get'}
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Comprehensive solutions tailored to your needs
                            </p>
                        </motion.div>

                        <div className={`grid grid-cols-1 gap-6 ${features.length === 4 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02 }}
                                    className={`${panelClass} p-6 flex items-start gap-4 transition-colors duration-300 hover:border-[#BF953F]/50 group`}
                                >
                                    <CheckCircle className="w-6 h-6 text-[#BF953F] flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-white mb-1 transition-colors duration-300 group-hover:text-[#BF953F]">{feature.title}</h3>
                                        {feature.description && (
                                            <p className="text-gray-400 text-sm transition-colors duration-300 group-hover:text-gray-200">{feature.description}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Success Stories (Kyle's per-service proof drops in via `testimonials`) */}
            {testimonials.length > 0 && (
                <section className="relative py-16 sm:py-24">
                    <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">{successStoriesTitle}</h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                See the real-world impact of our solutions.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className={`${panelClass} p-8`}
                                >
                                    <Quote className="w-10 h-10 text-[#BF953F]/40 mb-4" />
                                    <blockquote className="text-gray-200 leading-relaxed mb-6">
                                        &ldquo;{testimonial.quote}&rdquo;
                                    </blockquote>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FCF6BA] via-[#BF953F] to-[#AA771C] flex items-center justify-center text-black font-bold text-xl">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{testimonial.name}</h3>
                                            {testimonial.company && <p className="text-sm text-gray-400">{testimonial.company}</p>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ Section — kept at the bottom of the page, just above the CTA */}
            {faqs.length > 0 && (
                <section className="relative py-16 sm:py-24">
                    <SectionGlow position="top-right" />
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
                            <p className="text-xl text-gray-300">
                                Everything you need to know about {title}
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => {
                                const isOpen = openFaqIndex === index;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            aria-expanded={isOpen}
                                            className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-white/[0.06] transition-colors"
                                        >
                                            <div className="flex items-start gap-4 flex-1">
                                                <HelpCircle className="w-6 h-6 text-[#BF953F] flex-shrink-0 mt-1" />
                                                <h3 className="font-bold text-lg text-white">{faq.question}</h3>
                                            </div>
                                            <ChevronDown
                                                className={`w-6 h-6 text-[#BF953F] flex-shrink-0 transition-transform duration-300 ${
                                                    isOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-6 pl-16">
                                                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="relative py-20" style={{ backgroundColor: '#1d2127' }}>
                <DualCTABlock
                    title="Ready to implement this solution?"
                    cta1_text={cta_label}
                    cta1_link={cta_link}
                    cta2_text="See Other Solutions"
                    cta2_link="solutions"
                />
            </section>
        </div>
    );
}
