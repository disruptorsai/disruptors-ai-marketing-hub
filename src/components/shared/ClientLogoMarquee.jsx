import React from 'react';
import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';

const clientLogos = [
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167812/case-studies/case-studies/tradeworxusa_logo.svg", alt: "TradeWorx USA", slug: "work-tradeworx-usa" },
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167811/case-studies/case-studies/timberviewfinancial_logo.webp", alt: "Timberview Capital", slug: "work-timber-view-financial" },
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167810/case-studies/case-studies/thewellnessway_logo.webp", alt: "The Wellness Way", slug: "work-the-wellness-way" },
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167809/case-studies/case-studies/soundcorrections_logo.svg", alt: "Sound Corrections", slug: "work-sound-corrections" },
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167808/case-studies/case-studies/segpro_logo.png", alt: "SegPro Solutions", slug: "work-segpro" },
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167807/case-studies/case-studies/neuromastery_logo.webp", alt: "Neuro Mastery", slug: "work-neuro-mastery" },
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759862158/case-studies/case-studies/muscleworks_logo.png", alt: "Muscle Works", slug: "work-muscle-works" },
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167806/case-studies/case-studies/granitepaving_logo.png", alt: "Granite Paving", slug: "work-granite-paving" },
  { src: "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167805/case-studies/case-studies/autotrimutah_logo.png", alt: "Auto Trim Utah", slug: "work-auto-trim-utah" },
];

export default function ClientLogoMarquee({
  logos = clientLogos,
  title = "Trusted by Industry Leaders"
}) {
  return (
    <section className="py-8 md:py-2 overflow-hidden bg-[#191919]">
      {/* Mobile Heading */}
      <h2 className="block md:hidden text-center text-2xl font-bold text-white mb-6 px-4">
        Our Clients
      </h2>

      <Marquee
        speed={80}
        gradient={true}
        gradientColor="rgb(25, 25, 25)"
        gradientWidth={100}
        pauseOnHover={true}
        className="py-2"
      >
        {logos.map((logo, index) => (
          <div
            key={index}
            className="mx-12 md:mx-20 inline-block"
          >
            <div className="flex items-center justify-center h-36 w-48 md:h-48 md:w-64">
              {logo.src ? (
                <img
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  className="max-h-30 max-w-44 md:max-h-40 md:max-w-60 w-auto h-auto object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 drop-shadow-[0_0_24px_rgba(0,0,0,0.75)]"
                  style={logo.alt === "Sound Corrections" ? { transform: "scale(1.3)" } : {}}
                  draggable="false"
                />
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