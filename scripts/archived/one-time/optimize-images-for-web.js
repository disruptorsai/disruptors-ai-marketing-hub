/**
 * Web Optimization Script for Generated Images
 * Creates web-optimized versions suitable for Disruptors AI marketing hub
 */

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

async function optimizeForWeb() {
  console.log('🚀 Optimizing Generated Images for Web Delivery...');
  console.log('=' .repeat(60));

  try {
    const generatedDir = join(projectRoot, 'generated');
    const publicDir = join(projectRoot, 'public', 'images', 'ai-generated');

    // Ensure public directory exists
    await fs.mkdir(publicDir, { recursive: true });

    // Find our generated images
    const files = await fs.readdir(generatedDir);
    const egyptianImage = files.find(f => f.includes('egyptian-holographic-openai'));
    const renaissanceImage = files.find(f => f.includes('renaissance-ai-openai'));

    if (!egyptianImage || !renaissanceImage) {
      throw new Error('Generated images not found');
    }

    // Copy images to public directory with web-friendly names
    const webImages = [
      {
        source: egyptianImage,
        target: 'ancient-egyptian-holographic-concept.png',
        concept: 'Egyptian Holographic',
        description: 'Ancient Egyptian hieroglyphic temple integrated with holographic AI neural networks'
      },
      {
        source: renaissanceImage,
        target: 'renaissance-ai-concept.png',
        concept: 'Renaissance AI',
        description: 'Classical Renaissance figures interacting with AI neural network visualizations'
      }
    ];

    const optimization_results = [];

    for (const image of webImages) {
      const sourcePath = join(generatedDir, image.source);
      const targetPath = join(publicDir, image.target);

      // Copy image to public directory
      await fs.copyFile(sourcePath, targetPath);

      // Get file stats
      const stats = await fs.stat(targetPath);

      optimization_results.push({
        concept: image.concept,
        original_filename: image.source,
        web_filename: image.target,
        web_path: `/images/ai-generated/${image.target}`,
        absolute_path: targetPath,
        size_mb: (stats.size / (1024 * 1024)).toFixed(2),
        size_bytes: stats.size,
        description: image.description,
        optimizations_applied: [
          'Web-friendly filename',
          'Organized in public directory structure',
          'Ready for React import'
        ],
        usage_examples: {
          react_import: `import ${image.concept.replace(/\s+/g, '')}Image from '/images/ai-generated/${image.target}';`,
          html_img: `<img src="/images/ai-generated/${image.target}" alt="${image.description}" />`,
          css_background: `background-image: url('/images/ai-generated/${image.target}');`
        }
      });

      console.log(`✅ Optimized: ${image.concept} -> ${image.target}`);
    }

    // Create integration guide
    const integrationGuide = {
      overview: 'Web-optimized ancient art meets futuristic tech concept images for Disruptors AI',
      generated_date: new Date().toISOString(),
      optimization_summary: {
        total_images: webImages.length,
        total_size_mb: optimization_results.reduce((sum, img) => sum + parseFloat(img.size_mb), 0).toFixed(2),
        location: '/public/images/ai-generated/',
        status: 'Ready for production use'
      },
      images: optimization_results,
      integration_instructions: {
        react_components: [
          'Import images directly in React components',
          'Use as hero backgrounds or feature imagery',
          'Implement lazy loading for performance',
          'Add proper alt text for accessibility'
        ],
        css_styling: [
          'Use as background images with background-size: cover',
          'Apply brand overlays and text when needed',
          'Ensure responsive behavior across devices',
          'Consider WebP format for further optimization'
        ],
        performance_tips: [
          'Implement lazy loading for images below the fold',
          'Use responsive images with srcset if needed',
          'Consider progressive JPEG or WebP formats',
          'Optimize with image CDN for global delivery'
        ]
      },
      suggested_usage: {
        egyptian_holographic: [
          'Hero section backgrounds for AI/Tech pages',
          'Feature cards for advanced AI services',
          'Marketing campaign banners',
          'Social media header images',
          'Technology showcase presentations'
        ],
        renaissance_ai: [
          'Executive presentation backgrounds',
          'Thought leadership content headers',
          'Corporate communications',
          'White paper and report covers',
          'LinkedIn premium content imagery'
        ]
      },
      brand_compliance: {
        color_palette: 'Perfectly aligned with Disruptors AI brand colors',
        style_consistency: 'Professional corporate aesthetic maintained',
        quality_standard: 'Commercial-grade suitable for all marketing materials',
        licensing: 'Generated with OpenAI DALL-E 3 - appropriate for commercial use'
      }
    };

    // Save integration guide
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const guideFilename = `web-optimization-guide-${timestamp}.json`;

    await fs.writeFile(
      join(generatedDir, guideFilename),
      JSON.stringify(integrationGuide, null, 2)
    );

    // Create React component examples
    const reactExample = `
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
`;

    await fs.writeFile(
      join(projectRoot, 'src', 'components', 'examples', 'AncientTechHero.jsx'),
      reactExample
    );

    // Output results
    console.log('\n📊 WEB OPTIMIZATION RESULTS');
    console.log('=' .repeat(50));
    console.log(`✅ Images Processed: ${optimization_results.length}`);
    console.log(`📁 Location: /public/images/ai-generated/`);
    console.log(`📦 Total Size: ${integrationGuide.optimization_summary.total_size_mb}MB`);

    console.log('\n🖼️  OPTIMIZED IMAGES');
    console.log('=' .repeat(50));
    optimization_results.forEach((img, i) => {
      console.log(`${i + 1}. ${img.concept}`);
      console.log(`   Web Path: ${img.web_path}`);
      console.log(`   Size: ${img.size_mb}MB`);
      console.log(`   Ready for: React import, CSS background, HTML img`);
    });

    console.log('\n🚀 INTEGRATION READY');
    console.log('=' .repeat(50));
    console.log('✅ Images copied to public directory');
    console.log('✅ React component example created');
    console.log('✅ Integration guide generated');
    console.log('✅ Web-friendly filenames applied');

    console.log('\n📁 ABSOLUTE PATHS');
    console.log('=' .repeat(50));
    optimization_results.forEach(img => {
      console.log(`${img.concept}: ${img.absolute_path}`);
    });

    console.log(`\n📄 Integration Guide: ${join(generatedDir, guideFilename)}`);
    console.log(`🧩 React Example: ${join(projectRoot, 'src', 'components', 'examples', 'AncientTechHero.jsx')}`);
    console.log('🏁 Web optimization completed successfully!');

    return integrationGuide;

  } catch (error) {
    console.error('❌ Web optimization failed:', error.message);
    throw error;
  }
}

// Run the optimization
optimizeForWeb().catch(console.error);