import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useParallax } from '@/hooks/useParallax';

export default function TwoColumnLayout({
  kicker,
  headline,
  body,
  leftContent,
  rightContent,
  reversed = false,
  className = "",
  cta
}) {
  const textRef = useParallax({ speed: 0.15, direction: 'up' });
  const mediaRef = useParallax({ speed: 0.25, direction: reversed ? 'left' : 'right' });

  return (
    <section className={`py-20 sm:py-28 overflow-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reversed ? 'lg:grid-flow-col-dense' : ''}`}>

          {/* Text Content with Parallax */}
          <motion.div
            ref={textRef}
            className={`${reversed ? 'lg:col-start-2' : ''}`}
            initial={{ opacity: 0, x: reversed ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            {kicker && <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-2">{kicker}</p>}
            {headline && <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">{headline}</h2>}
            {body && <div className="text-lg text-gray-600 leading-relaxed">{body}</div>}
            {cta && (
              <Button asChild className="mt-8" size="lg">
                <Link to={createPageUrl(cta.link)}>{cta.label}</Link>
              </Button>
            )}
          </motion.div>

          {/* Media Content with Parallax */}
          <motion.div
            ref={mediaRef}
            className={`relative ${reversed ? 'lg:col-start-1' : ''}`}
            initial={{ opacity: 0, x: reversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="image-shape-1 overflow-hidden shadow-2xl">
                {leftContent || rightContent}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      
      <style>{`
        .image-shape-1 {
          clip-path: polygon(0% 20%, 100% 0%, 100% 70%, 20% 100%, 0% 80%);
          border-radius: 20px;
          aspect-ratio: 4/3;
        }
        
        .image-shape-2 {
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
          border-radius: 20px;
          aspect-ratio: 4/3;
        }
        
        .image-shape-3 {
          clip-path: polygon(0% 0%, 80% 0%, 100% 25%, 100% 100%, 0% 80%);
          border-radius: 20px;
          aspect-ratio: 4/3;
        }
      `}</style>
    </section>
  );
}