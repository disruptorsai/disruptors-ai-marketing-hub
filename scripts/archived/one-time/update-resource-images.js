/**
 * Update Resources Page with Generated Image Paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESOURCES_PAGE = path.join(__dirname, '..', 'src', 'pages', 'resources.jsx');

// Mapping of tool titles to their image filenames
const IMAGE_MAP = {
  'AI Content Writer': 'ai-content-writer',
  'AI Image Generator': 'ai-image-generator',
  'AI Chatbot Builder': 'chatbot-builder',
  'AI Video Generator': 'video-generator',
  'Growth Audit Tool': 'growth-audit-tool',
  'SEO Optimizer': 'seo-optimizer',
  'Social Media Manager': 'social-media-manager',
  'Email Campaign Builder': 'email-campaign-builder',
  'Analytics Dashboard': 'analytics-dashboard',
  'Conversion Tracker': 'conversion-tracker',
  'Performance Monitor': 'performance-monitor',
  'Audience Intelligence': 'audience-intelligence',
  'Workflow Automation': 'workflow-automation',
  'Lead Scoring Engine': 'lead-scoring-engine',
  'Content Calendar': 'content-calendar',
  'Integration Hub': 'integration-hub',
  'Podcast Studio': 'podcast-studio',
  'Report Generator': 'report-generator',
  'Brand Asset Library': 'brand-asset-library',
};

console.log('🔄 Updating Resources Page with Generated Images...\n');

// Read the file
let content = fs.readFileSync(RESOURCES_PAGE, 'utf-8');

// Track updates
let updatedCount = 0;

// Update each tool's image path
for (const [title, filename] of Object.entries(IMAGE_MAP)) {
  const imagePath = `/images/resource-icons/${filename}.png`;

  // Pattern to find: title: 'Title', ... image: null,
  const regex = new RegExp(
    `(title:\\s*'${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?image:\\s*)null,`,
    'g'
  );

  if (regex.test(content)) {
    content = content.replace(regex, `$1'${imagePath}',`);
    console.log(`✅ ${title} → ${imagePath}`);
    updatedCount++;
  }
}

// Write back to file
fs.writeFileSync(RESOURCES_PAGE, content, 'utf-8');

console.log(`\n📊 Summary: Updated ${updatedCount}/${Object.keys(IMAGE_MAP).length} tool images`);
console.log(`✨ Resources page updated successfully!`);
