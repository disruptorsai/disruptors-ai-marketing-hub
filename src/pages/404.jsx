
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Frown } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({ title: 'Page Not Found | Disruptors Media', noindex: true });

  return (
    <div className="bg-[#1A1A1A] text-white min-h-screen flex items-center justify-center text-center p-4">
      <div>
        <Frown className="w-20 h-20 text-gold-shine mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-[#C7C7C7] text-lg mb-8">We couldn’t find that page. Try one of these instead.</p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400 rounded-xl">
            <Link to={createPageUrl("")}>Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-yellow-500 text-gold-shine hover:bg-yellow-500/10 rounded-xl">
            <Link to={createPageUrl("Solutions")}>Solutions</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
