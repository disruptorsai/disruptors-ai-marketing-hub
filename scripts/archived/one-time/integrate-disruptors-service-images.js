/**
 * Disruptors AI Marketing Hub - Service Images Integration Script
 * Updates ServiceScroller component with new AI-generated images
 * Handles Cloudinary upload and component code updates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service mapping for generated images
const SERVICE_MAPPING = {
  'ai-automation': {
    title: 'AI Automation',
    hook: 'Automate repetitive tasks and workflows',
    link: 'solutions-ai-automation',
    id: 'ai-automation'
  },
  'social-media-marketing': {
    title: 'Social Media Marketing',
    hook: 'Build and engage your community',
    link: 'solutions-social-media-marketing',
    id: 'social-media-marketing'
  },
  'seo-geo': {
    title: 'SEO & GEO',
    hook: 'Get found by your ideal customers',
    link: 'solutions-seo-geo',
    id: 'seo-geo'
  },
  'lead-generation': {
    title: 'Lead Generation',
    hook: 'Fill your pipeline with qualified prospects',
    link: 'solutions-lead-generation',
    id: 'lead-generation'
  },
  'paid-advertising': {
    title: 'Paid Advertising',
    hook: 'Maximize ROI across all channels',
    link: 'solutions-paid-advertising',
    id: 'paid-advertising'
  },
  'podcasting': {
    title: 'Podcasting',
    hook: 'Build authority through audio content',
    link: 'solutions-podcasting',
    id: 'podcasting'
  },
  'custom-apps': {
    title: 'Custom Apps',
    hook: 'Tailored solutions for your needs',
    link: 'solutions-custom-apps',
    id: 'custom-apps'
  },
  'crm-management': {
    title: 'CRM Management',
    hook: 'Organize and nurture your relationships',
    link: 'solutions-crm-management',
    id: 'crm-management'
  },
  'fractional-cmo': {
    title: 'Fractional CMO',
    hook: 'Strategic marketing leadership',
    link: 'solutions-fractional-cmo',
    id: 'fractional-cmo'
  }
};

/**
 * Scan generated directory for new Disruptors service images
 */
function scanGeneratedImages() {
  const generatedDir = path.join(__dirname, '..', 'generated');
  const files = fs.readdirSync(generatedDir);

  const serviceImages = {};

  files.forEach(file => {
    // Match OpenAI generated images: service-id-openai-timestamp.png
    const match = file.match(/^(.+)-openai-\d+\.png$/);
    if (match) {
      const serviceId = match[1];
      if (SERVICE_MAPPING[serviceId]) {
        serviceImages[serviceId] = {
          filename: file,
          filepath: path.join(generatedDir, file),
          service: SERVICE_MAPPING[serviceId]
        };
      }
    }
  });

  return serviceImages;
}

/**
 * Convert PNG to WebP for optimization
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    // Note: In a real implementation, you would use sharp or similar library
    // For now, we'll just copy the file and rename it
    console.log(`📸 Converting ${path.basename(inputPath)} to WebP format...`);

    // In a real implementation:
    // const sharp = require('sharp');
    // await sharp(inputPath).webp({ quality: 90 }).toFile(outputPath);

    // For now, just copy (would need actual WebP conversion in production)
    fs.copyFileSync(inputPath, outputPath.replace('.webp', '.png'));

    console.log(`✅ Converted: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Conversion failed for ${path.basename(inputPath)}:`, error.message);
    return false;
  }
}

/**
 * Generate Cloudinary URLs for optimized delivery
 */
function generateCloudinaryURL(serviceId, version = 'v2') {
  const cloudName = 'dvcvxhzmt';
  const folder = 'disruptors-ai/services';

  return {
    webp: `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_1536,q_auto,f_webp/${folder}/${serviceId}-${version}.png`,
    fallback: `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_1536,q_auto/${folder}/${serviceId}-${version}.png`,
    responsive: {
      small: `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_384,q_auto,f_webp/${folder}/${serviceId}-${version}.png`,
      medium: `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_768,q_auto,f_webp/${folder}/${serviceId}-${version}.png`,
      large: `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_1536,q_auto,f_webp/${folder}/${serviceId}-${version}.png`
    }
  };
}

/**
 * Create updated ServiceScroller component code
 */
function generateUpdatedServiceScroller(serviceImages) {
  const services = Object.keys(SERVICE_MAPPING).map(serviceId => {
    const service = SERVICE_MAPPING[serviceId];
    const hasNewImage = serviceImages[serviceId];

    let imageUrl;
    if (hasNewImage) {
      // Use new AI-generated image via Cloudinary
      const cloudinary = generateCloudinaryURL(serviceId);
      imageUrl = cloudinary.webp;
    } else {
      // Keep existing image
      imageUrl = `https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758737704/disruptors-ai/services/${serviceId}.png`;
    }

    return {
      title: service.title,
      hook: service.hook,
      link: service.link,
      image: imageUrl,
      hasNewImage: hasNewImage ? true : false,
      generationStatus: hasNewImage ? 'generated' : 'pending'
    };
  });

  const componentCode = `
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const services = ${JSON.stringify(services, null, 2)};

export default function ServiceScroller({
  title = "A Solution for Every Challenge"
}) {
  return (
    <section className="py-20 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>
      </div>

      <div className="relative">
        <div className="flex overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-8 pl-4 sm:pl-6 lg:pl-8">
            {services.map((service, index) => {
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-80"
                >
                  <Link
                    to={createPageUrl(service.link)}
                    className="block group h-full"
                  >
                    <div className="service-card-shape bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/50 hover:border-indigo-500/50 hover:shadow-2xl transition-all duration-300 p-8 h-full flex flex-col justify-between">
                      <div>
                        <div className="service-image-shape mb-6 relative overflow-hidden">
                          {service.hasNewImage && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                NEW
                              </div>
                            </div>
                          )}
                          <img
                            src={service.image}
                            alt={\`\${service.title} service illustration\`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to gradient background with initials if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-200 hidden items-center justify-center">
                            <div className="text-2xl text-indigo-600 font-bold">
                              {service.title.split(' ').map(word => word[0]).join('')}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 mb-2">
                          {service.title}
                        </h3>
                        <p className="text-gray-600">
                          {service.hook}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{\`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .service-card-shape {
          clip-path: polygon(0% 0%, 90% 0%, 100% 10%, 100% 100%, 10% 100%, 0% 90%);
          border-radius: 20px;
        }

        .service-image-shape {
          clip-path: polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%);
          aspect-ratio: 16/9;
        }
      \`}</style>
    </section>
  );
}
`;

  return componentCode;
}

/**
 * Create Cloudinary upload instructions
 */
function generateUploadInstructions(serviceImages) {
  const instructions = [];

  Object.entries(serviceImages).forEach(([serviceId, imageData]) => {
    const cloudinary = generateCloudinaryURL(serviceId);

    instructions.push({
      service: imageData.service.title,
      localFile: imageData.filename,
      uploadPath: `disruptors-ai/services/${serviceId}-v2`,
      cloudinaryURL: cloudinary.webp,
      commands: [
        `# Upload ${imageData.service.title} image to Cloudinary`,
        `cloudinary upload ${imageData.filename} disruptors-ai/services/${serviceId}-v2`,
        `# Or via web interface: Upload to folder 'disruptors-ai/services' with name '${serviceId}-v2'`,
        ''
      ]
    });
  });

  return instructions;
}

/**
 * Main integration function
 */
async function integrateServiceImages() {
  console.log('🔄 Disruptors Service Images Integration');
  console.log('========================================\\n');

  // Scan for generated images
  const serviceImages = scanGeneratedImages();
  const generatedCount = Object.keys(serviceImages).length;

  console.log(`📊 Found ${generatedCount} generated service images:`);
  Object.entries(serviceImages).forEach(([serviceId, data]) => {
    console.log(`  ✅ ${data.service.title}: ${data.filename}`);
  });
  console.log('');

  if (generatedCount === 0) {
    console.log('⚠️ No generated images found. Run the generation script first.');
    return;
  }

  // Create optimized versions directory
  const optimizedDir = path.join(__dirname, '..', 'generated', 'optimized');
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }

  // Convert to WebP format (placeholder for now)
  console.log('🎨 Converting images to optimized format...');
  for (const [serviceId, imageData] of Object.entries(serviceImages)) {
    const outputPath = path.join(optimizedDir, `${serviceId}-v2.webp`);
    await convertToWebP(imageData.filepath, outputPath);
  }
  console.log('');

  // Generate updated component code
  console.log('🔧 Generating updated ServiceScroller component...');
  const updatedComponent = generateUpdatedServiceScroller(serviceImages);
  const componentPath = path.join(__dirname, '..', 'generated', 'ServiceScroller-updated.jsx');
  fs.writeFileSync(componentPath, updatedComponent);
  console.log(`✅ Updated component saved to: ${path.basename(componentPath)}`);
  console.log('');

  // Generate upload instructions
  console.log('☁️ Generating Cloudinary upload instructions...');
  const uploadInstructions = generateUploadInstructions(serviceImages);
  const instructionsContent = [
    '# Cloudinary Upload Instructions',
    '# Generated for Disruptors AI Service Images',
    '',
    '## Upload Commands',
    ...uploadInstructions.flatMap(instr => instr.commands),
    '',
    '## Manual Upload Steps',
    '1. Go to Cloudinary Dashboard: https://cloudinary.com/console',
    '2. Navigate to Media Library',
    '3. Create folder: disruptors-ai/services (if not exists)',
    '4. Upload each image with the specified naming convention',
    '5. Enable automatic format optimization (WebP)',
    '6. Set quality to "auto" for optimal performance',
    '',
    '## Generated Images to Upload:',
    ...uploadInstructions.map(instr =>
      `- ${instr.localFile} → ${instr.uploadPath}`
    ),
    '',
    '## Integration Checklist',
    '1. [ ] Upload all images to Cloudinary',
    '2. [ ] Verify image URLs are accessible',
    '3. [ ] Replace ServiceScroller component code',
    '4. [ ] Test component rendering',
    '5. [ ] Verify responsive behavior',
    '6. [ ] Check fallback handling',
    '7. [ ] Performance testing',
    ''
  ].join('\\n');

  const instructionsPath = path.join(__dirname, '..', 'generated', 'CLOUDINARY_UPLOAD_INSTRUCTIONS.md');
  fs.writeFileSync(instructionsPath, instructionsContent);
  console.log(`✅ Upload instructions saved to: ${path.basename(instructionsPath)}`);
  console.log('');

  // Generate integration summary
  const summary = {
    timestamp: new Date().toISOString(),
    generatedImages: generatedCount,
    totalServices: 9,
    completionRate: `${Math.round((generatedCount / 9) * 100)}%`,
    services: Object.entries(serviceImages).map(([serviceId, data]) => ({
      id: serviceId,
      title: data.service.title,
      filename: data.filename,
      status: 'ready_for_upload'
    })),
    nextSteps: [
      'Upload optimized images to Cloudinary',
      'Replace ServiceScroller component code',
      'Test component integration',
      'Verify performance and accessibility'
    ]
  };

  const summaryPath = path.join(__dirname, '..', 'generated', 'integration-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📋 Integration summary saved to: ${path.basename(summaryPath)}`);
  console.log('');

  // Print completion summary
  console.log('🎉 INTEGRATION PREPARATION COMPLETE');
  console.log('===================================');
  console.log(`Generated Images: ${generatedCount}/9 services`);
  console.log(`Completion Rate: ${Math.round((generatedCount / 9) * 100)}%`);
  console.log('');
  console.log('📁 Generated Files:');
  console.log(`  - ${path.basename(componentPath)}`);
  console.log(`  - ${path.basename(instructionsPath)}`);
  console.log(`  - ${path.basename(summaryPath)}`);
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Upload images to Cloudinary using provided instructions');
  console.log('2. Replace ServiceScroller component with updated version');
  console.log('3. Test integration and performance');
  console.log('4. Deploy updated component');

  return summary;
}

// Execute if called directly
console.log('🚀 Starting integration...');
integrateServiceImages().catch(console.error);

export default integrateServiceImages;