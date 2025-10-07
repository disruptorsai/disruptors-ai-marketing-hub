import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE = path.join(__dirname, '..', 'src', 'pages', 'resources.jsx');

const CORRECT_MAPPING = {
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

let content = fs.readFileSync(FILE, 'utf-8');

for (const [title, filename] of Object.entries(CORRECT_MAPPING)) {
  const regex = new RegExp(
    `(title:\s*'${title.replace(/[.*+?^${}()|[\]\]/g, '\$&')}'[\s\S]*?image:\s*)'/images/resource-icons/[^']+',`,
    'g'
  );
  content = content.replace(regex, `$1'/images/resource-icons/${filename}.png',`);
  console.log(`✅ Fixed: ${title}`);
}

fs.writeFileSync(FILE, content);
console.log('\n✨ All image paths corrected!');
