import React, { useState, useEffect } from 'react';
import Marquee from 'react-fast-marquee';
import { optimizeSupabaseImage } from '@/utils/supabase-media-optimizer';

const clientLogos = [
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/case-studies/tradeworxusa_logo.svg", alt: "TradeWorx USA", slug: "work-tradeworx-usa" },
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/logos/timberviewfinancial-logo.webp", alt: "Timberview Capital", slug: "work-timber-view-financial" },
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/logos/thewellnessway-logo.webp", alt: "The Wellness Way", slug: "work-the-wellness-way" },
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/case-studies/soundcorrections_logo.svg", alt: "Sound Corrections", slug: "work-sound-corrections" },
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/logos/segpro-logo.png", alt: "SegPro Solutions", slug: "work-segpro" },
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/logos/neuromastery-logo.webp", alt: "Neuro Mastery", slug: "work-neuro-mastery" },
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/logos/muscleworks-logo.png", alt: "Muscle Works", slug: "work-muscle-works" },
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/logos/granitepaving-logo.png", alt: "Granite Paving", slug: "work-granite-paving" },
  { src: "https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/case-studies/logos/autotrimutah-logo.png", alt: "Auto Trim Utah", slug: "work-auto-trim-utah" },
];

function SvgImage({ src, alt, className, style }) {
  const [dataUri, setDataUri] = useState(null);

  useEffect(() => {
    fetch(src)
      .then(res => res.text())
      .then(svgText => {
        const encoded = btoa(unescape(encodeURIComponent(svgText)));
        setDataUri(`data:image/svg+xml;base64,${encoded}`);
      })
      .catch(() => setDataUri(null));
  }, [src]);

  if (!dataUri) return null;
  return <img src={dataUri} alt={alt} className={className} style={style} draggable="false" />;
}

export default function ClientLogoMarquee({
  logos = clientLogos,
  title = "Trusted by Industry Leaders"
}) {
  return (
    <section className="py-8 md:py-2 overflow-hidden bg-[#191919]">
      <h2 className="block md:hidden text-center text-2xl font-bold text-white mb-6 px-4">
        Our Clients
      </h2>

      <Marquee
        speed={80}
        gradient={true}
        gradientColor="rgb(25, 25, 25)"
        gradientWidth={100}
        pauseOnHover={true}
        className="py-2 overflow-y-hidden"
        style={{ overflowY: 'hidden' }}
      >
        {logos.map((logo, index) => (
          <div
            key={index}
            className="mx-12 md:mx-20 inline-block"
          >
            <div className="flex items-center justify-center h-36 w-48 md:h-48 md:w-64">
              {logo.src ? (
                logo.src.endsWith('.svg') ? (
                  <SvgImage
                    src={logo.src}
                    alt={logo.alt}
                    className="max-h-[120px] max-w-[176px] md:max-h-[150px] md:max-w-[230px] w-auto h-auto object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 drop-shadow-[0_0_24px_rgba(0,0,0,0.75)]"
                    style={logo.alt === "Sound Corrections" ? { transform: "scale(1.1)" } : {}}
                  />
                ) : (
                  <img
                    src={optimizeSupabaseImage(logo.src, { width: 280, quality: 80, resize: 'contain' })}
                    alt={logo.alt}
                    loading="lazy"
                    className="max-h-[120px] max-w-[176px] md:max-h-[150px] md:max-w-[230px] w-auto h-auto object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 drop-shadow-[0_0_24px_rgba(0,0,0,0.75)]"
                    style={logo.alt === "Sound Corrections" ? { transform: "scale(1.1)" } : {}}
                    draggable="false"
                  />
                )
              ) : (
                <div className="text-xs font-mono text-gray-400 text-center px-2">
                  [{logo.alt}]
                </div>
              )}
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
