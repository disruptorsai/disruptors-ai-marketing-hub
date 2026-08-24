
// Example React Component Integration
import React from 'react';

// Import optimized images
import EgyptianHolographicImage from '/images/ai-generated/ancient-egyptian-holographic-concept.png';
import RenaissanceAIImage from '/images/ai-generated/renaissance-ai-concept.png';

export const AncientTechHero = ({ concept = 'egyptian' }) => {
  const images = {
    egyptian: {
      src: EgyptianHolographicImage,
      alt: 'Ancient Egyptian hieroglyphic temple integrated with holographic AI neural networks',
      title: 'Ancient Wisdom Meets AI Innovation'
    },
    renaissance: {
      src: RenaissanceAIImage,
      alt: 'Classical Renaissance figures interacting with AI neural network visualizations',
      title: 'Classical Intelligence Enhanced by AI'
    }
  };

  const selectedImage = images[concept];

  return (
    <div className="relative h-screen bg-gradient-to-br from-blue-900 to-cyan-600">
      <img
        src={selectedImage.src}
        alt={selectedImage.alt}
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
        loading="lazy"
      />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">{selectedImage.title}</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Disruptors AI combines ancient wisdom with cutting-edge artificial intelligence
            to deliver unprecedented business transformation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AncientTechHero;
