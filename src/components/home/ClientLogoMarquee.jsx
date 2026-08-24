import React from 'react';

export default function ClientLogoMarquee() {
  const logos = Array(12).fill(0).map((_, i) => `[PLACEHOLDER LOGO ${i + 1}]`);
  
  const marqueeContent = (
    <div className="flex space-x-16">
      {logos.map((label, index) => (
        <div key={index} className="flex-shrink-0 w-32 h-16 flex items-center justify-center">
           <p className="text-sm text-gray-400 font-mono">{label}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-12 bg-transparent overflow-hidden">
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap">
          {marqueeContent}
        </div>
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap">
          {marqueeContent}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 30s linear infinite;
        }
      `}</style>
    </div>
  );
}