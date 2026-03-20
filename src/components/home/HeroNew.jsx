import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HeroNew() {
  return (
    <section className="relative bg-transparent pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <img
          src="https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/ui/backgrounds/main-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 z-[5] bg-black/70"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
          AI-Powered Marketing Agency
        </h1>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to={createPageUrl('book-strategy-session')}>Book a Free Strategy Session</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}