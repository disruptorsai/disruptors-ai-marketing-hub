
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Play, Mic, Headphones, Video, ArrowRight } from 'lucide-react';
import PageTitle from '../components/shared/PageTitle';

const studioImages = [
  "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712352/disruptors-media/content/studio/gl3a0022.jpg",
  "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712357/disruptors-media/content/studio/gl3a0026.jpg",
  "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712362/disruptors-media/content/studio/gl3a0030.jpg",
  "https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712366/disruptors-media/content/studio/gl3a0042.jpg"
];

export default function Podcast() {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="text-white">
      {/* Page Title */}
      <PageTitle title="PODCAST" light />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            src="https://res.cloudinary.com/dvcvxhzmt/video/upload/f_auto,q_auto/disruptors-media/videos/main_banner_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl sm:text-6xl font-bold mb-6">
                Professional Podcast Production
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                From concept to distribution, we create podcast content that builds authority, engages audiences, and drives business growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold">
                  <Link to={createPageUrl('book-strategy-session')}>Start Your Podcast</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white bg-transparent hover:bg-white hover:text-black">
                  View Our Work
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/content/podcast/podcast-new-lg.jpg"
                alt="Podcast Studio"
                className="w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Studio Showcase */}
      <section className="bg-transparent py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              State-of-the-Art Podcast Studio
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our professional studio is equipped with industry-leading audio and video gear to ensure your content looks and sounds exceptional.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="aspect-video rounded-2xl overflow-hidden"
              >
                <img 
                  src={studioImages[activeImage]}
                  alt="Studio Setup"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              <div className="grid grid-cols-4 gap-3 mt-6">
                {studioImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === index ? 'border-yellow-400' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`Studio ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <Video className="w-8 h-8 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Multi-Camera Production</h3>
                  <p className="text-gray-300">Professional multi-camera setup with dynamic angles and seamless switching for engaging visual storytelling.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Headphones className="w-8 h-8 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Crystal Clear Audio</h3>
                  <p className="text-gray-300">Broadcast-quality audio recording with professional microphones and acoustic treatment for pristine sound.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Play className="w-8 h-8 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Full Production Service</h3>
                  <p className="text-gray-300">From pre-production planning to post-production editing and distribution across all major platforms.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-transparent py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Start Your Podcast?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's create a podcast that positions you as the authority in your industry and drives real business results.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold">
                <Link to={createPageUrl('book-strategy-session')}>
                  Book a Strategy Session
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                <Link to={createPageUrl('contact')}>Get More Info</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
