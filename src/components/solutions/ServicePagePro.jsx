import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FastVideo from '@/components/shared/FastVideo';
import { optimizeSupabaseImage } from '@/utils/supabase-media-optimizer';
import {
    Cpu, Zap, ShieldCheck, Clock, FileText, Layers, TrendingUp,
} from 'lucide-react';
import { usePageMeta, breadcrumb, truncateDescription } from '@/hooks/usePageMeta';

/**
 * ServicePagePro — Hybrid service-page template (locked direction).
 *
 * Deep charcoal glass aesthetic + structured feature grid, gold (#BF953F) accents,
 * Neue Montreal (font-sans) headings + PP Supply Mono (font-mono) labels — matching the
 * main site. Outcome-led, config-driven, mobile-first. No self CTA/footer: the site Layout
 * renders the real Footer ("Let's Talk"). SEO/GEO: single H1, semantic sections, answer-first
 * subhead, FAQ mirrored by FAQPage JSON-LD + Service + breadcrumb schema.
 */

const GOLD = '#BF953F';
const GOLD_DEEP = '#8a6a1f'; // higher-contrast gold for the white/paper sections
const ICONS = { zap: Zap, shield: ShieldCheck, clock: Clock, file: FileText, layers: Layers, trending: TrendingUp, cpu: Cpu };

const reveal = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
};

function Eyebrow({ children, light = false, className = '' }) {
    return <span className={`font-mono text-xs uppercase tracking-[0.2em] ${className}`} style={{ color: light ? GOLD_DEEP : GOLD }}>{children}</span>;
}

function Headline({ text, accent }) {
    const cls = 'mt-4 max-w-[16ch] text-[clamp(34px,6.6vw,72px)] font-bold leading-[1.05] tracking-tight text-[#fafafa]';
    if (!accent || !text.includes(accent)) return <h1 className={cls}>{text}</h1>;
    const [before, after] = text.split(accent);
    return (
        <h1 className={cls}>
            {before}<em className="text-gold-shine italic font-normal inline-block pr-[0.08em] -mr-[0.08em]">{accent}</em>{after}
        </h1>
    );
}

// Count-up stat; numeric `value` animates on scroll, `display` (ranges) stays static.
function StatCounter({ value, prefix = '', suffix = '', display, label }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const mv = useMotionValue(0);
    const text = useTransform(mv, (v) => Math.round(v).toString());
    useEffect(() => {
        if (inView && typeof value === 'number') {
            const controls = animate(mv, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
            return () => controls.stop();
        }
    }, [inView, value, mv]);
    return (
        <div ref={ref} className="text-center sm:text-left">
            <div className="text-[clamp(26px,3.8vw,42px)] font-bold leading-none tracking-tight tabular-nums" style={{ color: GOLD_DEEP }}>
                {display
                    ? <span>{display}{suffix}</span>
                    : <span>{prefix}<motion.span>{text}</motion.span>{suffix}</span>}
            </div>
            <div className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-black/50">{label}</div>
        </div>
    );
}

// Shimmering gold specular flare (corner of the glass panel)
function Flare({ className, style, delay = 0 }) {
    return (
        <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute ${className}`}
            style={style}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
        />
    );
}

// Typing-terminal visual (feature 01)
function Terminal() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let cancelled = false;
        const lines = [
            { p: '~', c: GOLD, text: 'deploy_workflow.sh', tc: 'rgba(255,255,255,.7)' },
            { p: '>', c: '#64748b', text: 'Connecting tools...', tc: '#64748b' },
            { p: '>', c: '#64748b', text: 'Live (0.3s)', tc: '#64748b', done: true },
        ];
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        async function run() {
            while (!cancelled) {
                el.innerHTML = '';
                for (const line of lines) {
                    if (cancelled) return;
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center';
                    el.appendChild(row);
                    const pr = document.createElement('span');
                    pr.style.cssText = `margin-right:8px;color:${line.c}`;
                    pr.textContent = line.p;
                    row.appendChild(pr);
                    const ct = document.createElement('span');
                    ct.style.color = line.tc;
                    row.appendChild(ct);
                    const cur = document.createElement('span');
                    cur.style.cssText = 'width:6px;height:12px;background:#BF953F;margin-left:4px;display:block';
                    row.appendChild(cur);
                    for (let i = 0; i < line.text.length; i++) {
                        if (cancelled) return;
                        ct.textContent += line.text[i];
                        await wait(30 + Math.random() * 40);
                    }
                    cur.remove();
                    if (line.done) row.innerHTML = '<span style="color:#64748b;margin-right:8px">&gt;</span><span style="color:#BF953F">Live</span> <span style="color:#64748b">(0.3s)</span>';
                    await wait(400);
                }
                await wait(2500);
            }
        }
        run();
        return () => { cancelled = true; };
    }, []);
    return (
        <div className="relative mb-[22px] h-[104px] w-full overflow-hidden rounded-lg border border-white/[0.06] bg-slate-900/40 p-3">
            <div className="mb-2 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500/50" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <span className="h-2 w-2 rounded-full bg-green-500/50" />
            </div>
            <div ref={ref} className="min-h-[56px] font-mono text-[10px] leading-relaxed text-slate-500" />
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-[#BF953F]/10 blur-[40px]" />
        </div>
    );
}

// Smart-routing node visual (feature 02)
function Routing() {
    const ref = useRef(null);
    useEffect(() => {
        const c = ref.current;
        if (!c) return;
        let cancelled = false;
        const src = c.querySelector('.rt-src');
        const glow = c.querySelector('.rt-glow');
        const srci = c.querySelector('.rt-srci');
        const targets = c.querySelectorAll('.rt');
        const paths = c.querySelectorAll('path');
        const pkt = c.querySelector('.rt-pkt');
        const pktA = c.querySelector('.rt-pktA');
        if (!src || !pktA) return;
        let idx = 0;
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        async function animate() {
            if (cancelled || !c.isConnected) return;
            src.style.borderColor = GOLD; src.style.boxShadow = '0 0 15px rgba(191,149,63,.2)'; srci.setAttribute('stroke', GOLD); glow.style.opacity = '1';
            await wait(600); if (cancelled) return;
            const ti = idx % targets.length; idx++;
            const path = paths[ti]; const target = targets[ti];
            paths.forEach((p) => (p.style.opacity = '.2'));
            path.style.opacity = '1'; path.setAttribute('stroke', GOLD); path.style.filter = 'drop-shadow(0 0 3px rgba(191,149,63,.5))';
            pkt.style.opacity = '1'; pktA.innerHTML = '';
            const mp = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
            mp.setAttribute('href', '#' + path.id);
            mp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + path.id);
            pktA.appendChild(mp);
            if (typeof pktA.beginElement === 'function') pktA.beginElement();
            await wait(600); if (cancelled) return;
            target.style.borderColor = GOLD; target.style.transform = 'scale(1.1)'; target.style.background = 'rgba(191,149,63,.1)'; target.style.boxShadow = '0 0 15px rgba(191,149,63,.2)';
            target.querySelector('svg').setAttribute('stroke', GOLD); pkt.style.opacity = '0';
            await wait(1200); if (cancelled) return;
            src.style.borderColor = 'rgba(255,255,255,.1)'; src.style.boxShadow = 'none'; srci.setAttribute('stroke', 'rgba(255,255,255,.7)'); glow.style.opacity = '0';
            path.setAttribute('stroke', 'rgba(255,255,255,.1)'); path.style.opacity = ''; path.style.filter = '';
            paths.forEach((p) => (p.style.opacity = ''));
            target.style.borderColor = 'rgba(255,255,255,.1)'; target.style.transform = ''; target.style.background = '#0E1216'; target.style.boxShadow = 'none';
            target.querySelector('svg').setAttribute('stroke', '#64748b');
            await wait(600); if (cancelled) return;
            requestAnimationFrame(animate);
        }
        const t = setTimeout(animate, 500);
        return () => { cancelled = true; clearTimeout(t); };
    }, []);
    const targetIcon = (i) => {
        if (i === 0) return <path d="M22 12h-4l-3 9L9 3l-3 9H2" />;
        if (i === 1) return (<><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></>);
        return (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>);
    };
    return (
        <div className="mb-[22px] flex h-[104px] items-center justify-center">
            <div ref={ref} className="relative flex h-24 w-full max-w-[320px] items-center justify-between px-4">
                <svg viewBox="0 0 320 96" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                    <path id="rp1" d="M 44 48 C 120 48, 180 16, 276 16" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" />
                    <path id="rp2" d="M 44 48 C 120 48, 180 48, 276 48" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" />
                    <path id="rp3" d="M 44 48 C 120 48, 180 80, 276 80" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" />
                    <circle className="rt-pkt" r="3" fill="#BF953F" style={{ opacity: 0, filter: 'drop-shadow(0 0 6px #BF953F)' }}>
                        <animateMotion className="rt-pktA" dur="0.6s" begin="indefinite" fill="freeze" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1">
                            <mpath xlinkHref="#rp1" />
                        </animateMotion>
                    </circle>
                </svg>
                <div className="rt-src relative z-10 flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-[#0E1216] transition-all duration-300">
                    <div className="rt-glow absolute inset-0 rounded-[10px] bg-[#BF953F]/25 opacity-0 blur-md transition-opacity duration-300" />
                    <svg className="rt-srci relative z-10" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" /></svg>
                </div>
                <div className="z-10 flex flex-col gap-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="rt flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-[#0E1216] transition-all duration-300">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{targetIcon(i)}</svg>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ServicePagePro({ service }) {
    const [openFaq, setOpenFaq] = useState(null);

    const metaPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const metaDescription = service ? truncateDescription(service.subhead || '') : '';
    const jsonLd = service ? [
        {
            '@context': 'https://schema.org', '@type': 'Service', name: service.title,
            description: metaDescription, provider: { '@type': 'Organization', name: 'Disruptors Media' },
            areaServed: { '@type': 'Country', name: 'United States' }, url: `https://disruptorsmedia.com${metaPath}`,
        },
        breadcrumb(service.title, metaPath),
    ] : [];
    if (service?.faqs?.length) {
        jsonLd.push({
            '@context': 'https://schema.org', '@type': 'FAQPage',
            mainEntity: service.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
        });
    }
    usePageMeta(service ? { title: `${service.title} | Disruptors Media`, description: metaDescription, path: metaPath, jsonLd } : {});

    if (!service) return <div>Loading service details...</div>;

    const {
        eyebrow, headline, headlineAccent, subhead, heroImage, heroVideo, stats = [], chips = [], platform = {},
        outcomesEyebrow = '02 · Outcomes', outcomesTitle = 'What it changes.', outcomes = [],
        processEyebrow = '03 · Process', processTitle = 'How we install it.', process = [],
        successStory, faqsEyebrow = '04 · Questions', faqsTitle = 'Frequently asked.', faqs = [],
        cta_label = 'Book a Strategy Session', cta_link = 'book-strategy-session',
    } = service;

    const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);
    const panelBg = {
        backgroundColor: '#0f0f14',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
    };
    // The site-wide white paint/plaster texture (same as Layout's main-bg) for the light sections.
    const paperBg = {
        backgroundColor: '#efece5',
        backgroundImage: `url(${optimizeSupabaseImage('https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-assets/images/disruptors-media/ui/backgrounds/main-bg.jpg', { width: 1600, height: 1600, quality: 70 })})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="overflow-hidden font-sans text-[#fafafa]" style={{ backgroundColor: '#080a0d' }}>
            {/* ===== HERO ===== */}
            <section className="relative overflow-hidden pt-[clamp(112px,14vw,152px)]">
                {(heroVideo || heroImage) && (
                    <div aria-hidden="true" className="absolute inset-0 z-0">
                        {heroVideo ? (
                            <FastVideo
                                src={heroVideo}
                                poster={optimizeSupabaseImage(heroImage, { width: 1200, height: 1200, quality: 70 })}
                                preset="fullscreen"
                                autoplay loop muted playsInline
                                preload="metadata"
                                lazy={false}
                                className="h-full w-full object-cover opacity-[0.78] grayscale-[.3] contrast-105"
                            />
                        ) : (
                            <img src={optimizeSupabaseImage(heroImage, { width: 1200, height: 1200, quality: 72 })} alt="" className="h-full w-full object-cover opacity-[0.78] grayscale-[.3] contrast-105" />
                        )}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,10,13,.24) 0%, rgba(8,10,13,.56) 55%, #080a0d 100%)' }} />
                    </div>
                )}
                <div className="relative z-10 mx-auto max-w-6xl px-[clamp(18px,5vw,24px)]">
                    <div aria-hidden="true" className="pointer-events-none absolute -left-12 -top-12 h-60 w-60 rounded-full bg-[#BF953F]/[0.12] blur-[60px]" />
                    <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-10">
                        <div className="max-w-[40rem]">
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
                                <Eyebrow>{eyebrow}</Eyebrow>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
                                <Headline text={headline} accent={headlineAccent} />
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.28 }}
                                className="mt-[18px] max-w-[32rem] text-[clamp(16px,2.2vw,18px)] leading-relaxed text-white/70"
                            >
                                {subhead}
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                            className="flex w-full flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-center md:w-auto"
                        >
                            <Link to={createPageUrl(cta_link)} className="rounded-[3px] bg-[#BF953F] px-7 py-3.5 text-center font-medium text-[#0b0b0c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#AA771C]">
                                {cta_label}
                            </Link>
                        </motion.div>
                    </div>
                    {chips.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} className="relative z-10 mt-7 flex flex-wrap gap-2">
                            {chips.map((chip) => (
                                <span key={chip} className="rounded-full border border-white/10 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#BF953F] hover:text-[#BF953F]">
                                    {chip}
                                </span>
                            ))}
                        </motion.div>
                    )}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }} className="mt-11 h-px w-full bg-gradient-to-r from-[#BF953F]/50 via-white/10 to-transparent" />
                </div>
            </section>

            {/* ===== STAT BAND ===== */}
            {stats.length > 0 && (
                <section className="border-y border-black/10 text-[#0b0b0c]" style={paperBg}>
                    <div className="mx-auto max-w-6xl px-[clamp(18px,5vw,24px)] py-10 sm:py-12">
                        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-black/10">
                            {stats.map((s, i) => (
                                <div key={i} className={i > 0 ? 'sm:pl-8' : 'sm:pr-8'}>
                                    <StatCounter {...s} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== PLATFORM (dark) — even top/bottom spacing ===== */}
            <section id="platform" className="py-[clamp(48px,8vw,90px)]">
              <div className="relative mx-auto max-w-6xl px-[clamp(18px,5vw,24px)]">
                <motion.div {...reveal} className="relative overflow-hidden rounded-[clamp(18px,3vw,28px)] border border-white/10 backdrop-blur-[6px]" style={panelBg}>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <Flare className="top-0 right-0 h-px w-[min(240px,60%)]" style={{ background: 'linear-gradient(to right,transparent,rgba(252,246,186,.8),rgba(191,149,63,.7))' }} />
                    <Flare className="bottom-0 left-0 h-px w-[min(240px,60%)]" style={{ background: 'linear-gradient(to left,transparent,rgba(252,246,186,.8),rgba(191,149,63,.7))' }} delay={1.2} />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12">
                        <div className="flex flex-col justify-center border-b border-white/10 p-[clamp(24px,5vw,32px)] md:col-span-4 md:border-b-0 md:border-r md:p-12">
                            <div className="mb-4 flex items-center gap-2">
                                <Cpu className="h-4 w-4" style={{ color: GOLD }} strokeWidth={2} />
                                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#BF953F]">{platform.label || 'The Engine'}</span>
                            </div>
                            <h2 className="mb-3.5 text-[clamp(24px,3.2vw,34px)] font-bold tracking-tight text-[#fafafa]">{platform.title}</h2>
                            <p className="text-sm leading-relaxed text-white/70">{platform.body}</p>
                        </div>
                        <div className="grid grid-cols-1 md:col-span-8 sm:grid-cols-2">
                            {(platform.features || []).map((f, i) => (
                                <div key={i} className={`group relative overflow-hidden border-b border-white/10 p-[clamp(24px,5vw,32px)] transition-colors hover:bg-white/[0.02] ${i === 0 ? 'sm:border-r' : ''}`}>
                                    <span className="absolute right-[22px] top-[22px] rounded-full border border-white/10 px-2.5 py-[3px] font-mono text-[11px] text-white/45">{f.num}</span>
                                    {f.viz === 'terminal' ? <Terminal /> : <Routing />}
                                    <h3 className="mb-2 text-base font-medium text-[#fafafa]">{f.title}</h3>
                                    <p className="text-[12.5px] leading-relaxed text-white/70">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(platform.mini || []).length > 0 && (
                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                            {platform.mini.map((m, i) => {
                                const Icon = ICONS[m.icon] || Zap;
                                return (
                                    <div key={i} className="group flex flex-col gap-3 border-b border-white/10 p-[22px] transition-colors hover:bg-white/[0.02] sm:border-r">
                                        <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#BF953F]" strokeWidth={2} />
                                        <div>
                                            <h4 className="text-sm font-medium text-[#fafafa]">{m.title}</h4>
                                            <p className="mt-[3px] font-mono text-[10.5px] text-white/45">{m.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
              </div>
            </section>

            {/* ===== OUTCOMES ===== */}
            {outcomes.length > 0 && (
                <section className="text-[#0b0b0c] py-[clamp(56px,9vw,110px)]" style={paperBg}>
                    <div className="mx-auto max-w-6xl px-[clamp(18px,5vw,24px)]">
                        <motion.div {...reveal} className="mb-3 max-w-[44rem]">
                            <Eyebrow light>{outcomesEyebrow}</Eyebrow>
                            <h2 className="mt-3.5 text-[clamp(28px,4.4vw,54px)] font-bold tracking-tight">{outcomesTitle}</h2>
                        </motion.div>
                        <div className="mt-11 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                            {outcomes.map((o, i) => {
                                const Icon = ICONS[o.icon] || TrendingUp;
                                return (
                                    <motion.div
                                        key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}
                                        whileHover={{ y: -6 }}
                                        className="group rounded-[20px] border border-black/10 bg-white/45 p-[clamp(22px,4vw,28px)] backdrop-blur-sm transition-colors hover:border-[#8a6a1f]/40 hover:bg-white/60"
                                    >
                                        <div className="mb-5 flex items-start justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#8a6a1f]/30 bg-[#8a6a1f]/[0.1] transition-transform duration-500 group-hover:scale-110">
                                                <Icon className="h-[22px] w-[22px]" style={{ color: GOLD_DEEP }} strokeWidth={1.6} />
                                            </div>
                                            <span className="rounded-full border border-black/15 px-2.5 py-1 font-mono text-xs text-black/50">0{i + 1}</span>
                                        </div>
                                        <h3 className="mb-2.5 text-xl font-bold tracking-tight">{o.title}</h3>
                                        <p className="text-sm leading-relaxed text-black/60">{o.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== PROCESS ===== */}
            {process.length > 0 && (
                <section id="how" className="py-[clamp(56px,9vw,110px)]">
                    <div className="mx-auto max-w-6xl px-[clamp(18px,5vw,24px)]">
                        <motion.div {...reveal} className="mb-3 max-w-[44rem]">
                            <Eyebrow>{processEyebrow}</Eyebrow>
                            <h2 className="mt-3.5 text-[clamp(28px,4.4vw,54px)] font-bold tracking-tight">{processTitle}</h2>
                        </motion.div>
                        <div className="mt-10 border-t border-white/10">
                            {process.map((step, i) => (
                                <motion.div
                                    key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }}
                                    className="grid grid-cols-12 items-baseline gap-x-4 gap-y-2 border-b border-white/10 py-6 transition-colors hover:bg-white/[0.015]"
                                >
                                    <div className="col-span-12 font-mono text-sm text-[#BF953F] sm:col-span-2">0{i + 1}</div>
                                    <h3 className="col-span-12 text-[clamp(19px,2.4vw,22px)] font-bold tracking-tight sm:col-span-4">{step.title}</h3>
                                    <p className="col-span-12 text-[15px] text-white/70 sm:col-span-6">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== PROOF ===== */}
            {successStory && (
                <section className="text-[#0b0b0c] py-[clamp(56px,9vw,110px)]" style={paperBg}>
                    <div className="mx-auto max-w-6xl px-[clamp(18px,5vw,24px)]">
                        <motion.div {...reveal} className="rounded-3xl border border-black/10 bg-white/40 p-[clamp(28px,5vw,44px)] backdrop-blur-sm">
                            {successStory.metric && <div className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: GOLD_DEEP }}>{successStory.metric}</div>}
                            <blockquote className="mt-5 max-w-[52rem] text-[clamp(21px,3vw,32px)] font-bold leading-tight tracking-tight text-[#0b0b0c]">
                                &ldquo;{successStory.quote}&rdquo;
                            </blockquote>
                            <div className="mt-[22px] font-mono text-xs uppercase tracking-[0.1em] text-black/45">
                                {successStory.name}{successStory.company ? ` — ${successStory.company}` : ''}
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ===== FAQ ===== */}
            {faqs.length > 0 && (
                <section id="faq" className="py-[clamp(56px,9vw,110px)]">
                    <div className="mx-auto max-w-6xl px-[clamp(18px,5vw,24px)]">
                        <motion.div {...reveal} className="mb-3 max-w-[44rem]">
                            <Eyebrow>{faqsEyebrow}</Eyebrow>
                            <h2 className="mt-3.5 text-[clamp(28px,4.4vw,54px)] font-bold tracking-tight">{faqsTitle}</h2>
                        </motion.div>
                        <motion.div {...reveal} className="mt-9 border-t border-white/10">
                            {faqs.map((faq, i) => {
                                const isOpen = openFaq === i;
                                return (
                                    <div key={i} className="border-b border-white/10">
                                        <button onClick={() => toggleFaq(i)} aria-expanded={isOpen} className="group flex w-full items-center justify-between gap-5 py-[22px] text-left">
                                            <h3 className="text-[clamp(16px,2.2vw,22px)] font-bold tracking-tight text-[#fafafa] transition-colors group-hover:text-[#BF953F]">{faq.question}</h3>
                                            <span className="flex-shrink-0 text-2xl leading-none text-[#BF953F] transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                                    <p className="max-w-[46rem] pb-6 text-[15px] leading-relaxed text-white/70">{faq.answer}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>
            )}

            <div className="h-6" />
        </div>
    );
}
