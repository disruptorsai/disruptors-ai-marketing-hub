import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { caseStudies } from '@/data/caseStudies';

/**
 * SIMPLIFIED Work Page for debugging
 * Removes DynamicBackground, BlurSection, and other complex wrappers
 * DIAGNOSTIC VERSION: Forces opacity and logs mount status
 */
export default function WorkSimple() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    console.log('🎨 [WORK-SIMPLE] Component mounted in DOM');
    setMounted(true);
  }, []);

  console.log('🎨 [WORK-SIMPLE] Rendering with', caseStudies.length, 'case studies');
  console.log('🎨 [WORK-SIMPLE] Mounted state:', mounted);

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{
        opacity: 1,
        visibility: 'visible',
        position: 'relative',
        zIndex: 1
      }}>
      {/* Simple Header */}
      <div className="py-20 text-center bg-gradient-to-b from-yellow-500/20 to-transparent">
        <h1 className="text-6xl font-bold mb-4">
          OUR <span className="text-yellow-500">WORK</span>
        </h1>
        <p className="text-2xl text-gray-300">
          {caseStudies.length} case studies loaded
        </p>
      </div>

      {/* Simple Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study) => (
            <div
              key={study.name}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors"
            >
              <img
                src={study.logo}
                alt={study.client}
                className="h-12 mb-4 object-contain"
              />
              <h3 className="text-2xl font-bold mb-2">{study.client}</h3>
              <p className="text-gray-400 mb-4">{study.industry}</p>
              <Link
                to={createPageUrl(study.path)}
                className="text-yellow-500 hover:text-yellow-400 font-semibold"
              >
                View Case Study →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 text-center bg-gradient-to-t from-yellow-500/20 to-transparent">
        <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
        <Link to={createPageUrl('book-strategy-session')}>
          <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black text-xl px-8 py-6">
            Book a Strategy Session
          </Button>
        </Link>
      </div>
    </div>
  );
}
