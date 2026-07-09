import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Mail, Phone, MapPin, Instagram, Linkedin } from 'lucide-react';
import { optimizeSupabaseImage } from '@/utils/supabase-media-optimizer';
import GsapScrambleText from '@/components/shared/GsapScrambleText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FastVideo from '@/components/shared/FastVideo';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const location = useLocation();

  // Animate footer separator lines with scroll-mapped GSAP
  React.useEffect(() => {
    // Store references to this footer's ScrollTriggers
    const scrollTriggers = [];

    const timer = setTimeout(() => {
      const footerContainer = document.getElementById('footer-lines-container');
      if (!footerContainer) {
        console.warn('Footer lines container not found');
        return;
      }

      const gaps = [98, 82, 65, 46, 24, 0];

      gaps.forEach((gap, index) => {
        const line = footerContainer.querySelector(`.sep-line-${index + 1}`);
        if (!line) {
          console.warn(`Footer line ${index + 1} not found`);
          return;
        }

        // Create the animation and store the ScrollTrigger reference
        const animation = gsap.fromTo(
          line,
          { y: 0, force3D: true },
          {
            y: -gap,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: footerContainer,
              start: "top 90%",
              end: "top 30%",
              scrub: 1,
              markers: false,
              id: `footer-line-${index + 1}`, // Add ID for debugging
            }
          }
        );

        // Store the ScrollTrigger for cleanup
        if (animation.scrollTrigger) {
          scrollTriggers.push(animation.scrollTrigger);
        }
      });

      // Refresh after all animations are created
      ScrollTrigger.refresh();
    }, 300); // Increased delay for lazy-loaded pages

    return () => {
      clearTimeout(timer);
      // Only kill THIS footer's ScrollTriggers, not all of them
      scrollTriggers.forEach(st => st.kill());
    };
  }, []);

  // Refresh ScrollTrigger when route changes (for navigation between pages)
  React.useEffect(() => {
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500); // Refresh after page transition completes

    return () => clearTimeout(refreshTimer);
  }, [location.pathname]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setSubscribeStatus('subscribing');

    // TODO: Integrate with your newsletter service
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 3000);
    }, 1000);
  };

  const solutions = [
    { name: 'AI Automation', path: 'solutions-ai-automation' },
    { name: 'Social Media', path: 'solutions-social-media' },
    { name: 'SEO & Local SEO', path: 'solutions-seo-geo' },
    { name: 'Lead Generation', path: 'solutions-lead-generation' },
    { name: 'Paid Advertising', path: 'solutions-paid-advertising' },
    { name: 'Podcasting', path: 'solutions-podcasting' },
    { name: 'Custom Apps', path: 'solutions-custom-apps' },
    { name: 'CRM Management', path: 'solutions-crm-management' },
    { name: 'Fractional CMO', path: 'solutions-fractional-cmo' },
  ];

  const company = [
    { name: 'About Us', path: 'about' },
    // { name: 'Our Work', path: 'work' }, // Temporarily disabled - loading issues
    { name: 'Blog', path: 'blog' },
    { name: 'Podcast', path: 'podcast' },
    // { name: 'AI Tools', path: 'ai-tools' }, // Temporarily disabled
    { name: 'FAQ', path: 'faq' },
    { name: 'Billboard', path: 'billboard' },
  ];

  const tools = [
    { name: 'AI Content Writer', path: '/app/content-writer' },
    { name: 'Keyword Research', path: '/app/keyword-research' },
    { name: 'Marketing Audit', path: 'marketing-audit' },
    { name: 'Business Brain', path: '/app/business-brain' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      icon: 'instagram',
      url: 'https://instagram.com/disruptorsmedia'
    },
    {
      name: 'LinkedIn',
      icon: 'linkedin',
      url: 'https://linkedin.com/company/disruptorsmedia'
    },
  ];

  const getSocialIcon = (iconName) => {
    const iconProps = { className: "w-5 h-5 text-white/80 group-hover:text-white transition-colors" };
    switch (iconName) {
      case 'instagram':
        return <Instagram {...iconProps} />;
      case 'linkedin':
        return <Linkedin {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <footer className="relative pt-12 sm:pt-16 md:pt-20 pb-0 overflow-hidden bg-gradient-to-b from-[#0E0E0E] to-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <FastVideo
          src="https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-videos/dmsite/home/roman-army-painting.mp4"
          preset="fullscreen"
          autoplay={true}
          loop={true}
          muted={true}
          playsInline={true}
          preload="metadata"
          fetchpriority="low"
          lazy={true}
          className="w-full h-full object-cover opacity-20"
          aria-label="Footer background video"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
      </div>

      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent z-20" />

      <div className="relative z-10 w-[90%] mx-auto">

        {/* Animated lines + Book a call CTA */}
        <div className="relative mb-16 sm:mb-20" id="footer-lines-container">
          {/* Animated horizontal lines */}
          <div className="relative h-[100px] sm:h-[110px] md:h-[120px] mb-0">
            <div className="sep-line sep-line-1" style={{ background: '#BF953F' }}></div>
            <div className="sep-line sep-line-2" style={{ background: '#FCF6BA' }}></div>
            <div className="sep-line sep-line-3" style={{ background: '#B38728' }}></div>
            <div className="sep-line sep-line-4" style={{ background: '#FBF5B7' }}></div>
            <div className="sep-line sep-line-5" style={{ background: '#BF953F' }}></div>
            <div className="sep-line sep-line-6" style={{ background: '#AA771C' }}></div>
          </div>

          {/* Book a call button */}
          <Link
            to={createPageUrl('book-strategy-session')}
            className="group flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 md:py-6 bg-white hover:bg-gray-100 transition-all duration-300 min-h-[60px] sm:min-h-[70px] md:min-h-[80px] touch-manipulation whitespace-nowrap"
            style={{
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
            }}
          >
            <span className="font-montreal text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight text-black">
              Let's Talk
            </span>
            <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-transform group-hover:translate-x-2 flex-shrink-0 ml-4 text-black" />
          </Link>
        </div>

        {/* Main Footer Content - Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 sm:mb-20">

          {/* Column 1: Brand & Newsletter - Spans 4 cols */}
          <div className="lg:col-span-4">
            <Link to={createPageUrl('')} className="inline-block mb-6">
              <img
                src={optimizeSupabaseImage(
                  'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png',
                  { width: 640, quality: 80, resize: 'contain' }
                )}
                alt="Disruptors Media"
                width="800"
                height="160"
                loading="lazy"
                className="h-16 w-auto"
              />
            </Link>
            <p className="font-montreal text-sm text-[#C7C7C7] mb-6 leading-relaxed">
              AI-first marketing agency disrupting the industry with data-driven strategies and cutting-edge automation.
            </p>

            {/* Newsletter Signup */}
            <div className="mb-8">
              <h3 className="font-supply text-xs font-semibold uppercase tracking-[0.2em] text-gold-shine mb-4">
                Stay Updated
              </h3>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={subscribeStatus === 'subscribing'}
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 text-sm focus:border-[#FFD700] focus:ring-[#FFD700]"
                />
                <Button
                  type="submit"
                  disabled={subscribeStatus === 'subscribing'}
                  className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black hover:shadow-[0_0_25px_rgba(191,149,63,0.5)] h-12 px-6 font-semibold transition-all duration-300"
                >
                  {subscribeStatus === 'subscribing' ? '...' : subscribeStatus === 'success' ? '✓' : 'Subscribe'}
                </Button>
              </form>
              {subscribeStatus === 'success' && (
                <p className="text-xs text-gold-shine mt-2">Thanks for subscribing!</p>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-[#FFD700]/20 border border-white/10 hover:border-[#FFD700] transition-all duration-300 rounded"
                  aria-label={social.name}
                >
                  {getSocialIcon(social.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Solutions - Spans 3 cols */}
          <div className="lg:col-span-3">
            <h3 className="font-supply text-xs font-semibold uppercase tracking-[0.2em] text-gold-shine mb-6">
              Solutions
            </h3>
            <ul className="space-y-3">
              {solutions.map((item) => (
                <li key={item.path}>
                  <Link
                    to={createPageUrl(item.path)}
                    className="font-montreal text-sm text-[#C7C7C7] hover:text-[#FFD700] transition-colors inline-block group"
                  >
                    <span className="relative">
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FFD700] group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company - Spans 2 cols */}
          <div className="lg:col-span-2">
            <h3 className="font-supply text-xs font-semibold uppercase tracking-[0.2em] text-gold-shine mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.path}>
                  <Link
                    to={createPageUrl(item.path)}
                    className="font-montreal text-sm text-[#C7C7C7] hover:text-[#FFD700] transition-colors inline-block group"
                  >
                    <span className="relative">
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FFD700] group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Tools - Spans 3 cols */}
          <div className="lg:col-span-3">
            <h3 className="font-supply text-xs font-semibold uppercase tracking-[0.2em] text-gold-shine mb-6">
              Get In Touch
            </h3>
            <ul className="space-y-4 mb-8">
              <li>
                <a
                  href="tel:+18019180223"
                  className="flex items-start gap-3 text-sm text-[#C7C7C7] hover:text-[#FFD700] transition-colors group"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform icon-gold-shine" />
                  <span>(801) 918-0223</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:tyler@disruptorsmedia.com"
                  className="flex items-start gap-3 text-sm text-[#C7C7C7] hover:text-[#FFD700] transition-colors group"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform icon-gold-shine" />
                  <span>tyler@disruptorsmedia.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-[#C7C7C7]">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 icon-gold-shine" />
                  <span>650 N Main St<br />North Salt Lake, UT 84054</span>
                </div>
              </li>
            </ul>

            {/* AI Tools section - Temporarily disabled
            <h3 className="font-supply text-xs font-semibold uppercase tracking-[0.2em] text-[#FFD700] mb-4">
              AI Tools
            </h3>
            <ul className="space-y-3">
              {tools.map((item) => (
                <li key={item.path}>
                  <Link
                    to={createPageUrl(item.path)}
                    className="font-montreal text-sm text-[#C7C7C7] hover:text-[#FFD700] transition-colors inline-block group"
                  >
                    <span className="relative">
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FFD700] group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-white/10 pt-8 pb-24">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Copyright */}
            <div className="text-center md:text-left order-2 md:order-1">
              <p className="font-montreal text-xs sm:text-sm text-[#C7C7C7]">
                © {new Date().getFullYear()} Disruptors Media Inc. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 order-1 md:order-2">
              <Link
                to={createPageUrl('privacy')}
                className="font-montreal text-xs sm:text-sm text-[#C7C7C7] hover:text-[#FFD700] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to={createPageUrl('terms')}
                className="font-montreal text-xs sm:text-sm text-[#C7C7C7] hover:text-[#FFD700] transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>

            {/* Coordinates */}
            <div className="hidden lg:block text-right order-3">
              <p className="font-supply text-xs text-gold-shine">
                40.853400, -111.911790
              </p>
              <p className="font-supply text-xs text-gold-shine mt-1">
                Load Address: 034526-01
              </p>
            </div>
          </div>
        </div>

        {/* Logo emboss watermark - positioned at bottom, half cut off */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-[400px] md:w-[500px] lg:w-[650px] xl:w-[800px] opacity-10 pointer-events-none z-0">
          <img
            src="/assets/footer/logo-emboss.png"
            alt=""
            width="800"
            height="400"
            className="w-full h-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>

      </div>
    </footer>
  );
}
