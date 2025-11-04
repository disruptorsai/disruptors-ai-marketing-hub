/**
 * UPDATE CRITICAL URLS SCRIPT
 *
 * Updates Cloudinary URLs with Supabase URLs in critical files:
 * - src/pages/Home.jsx
 * - src/data/caseStudies.js
 * - src/components/auth/OnboardingFlow.jsx
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Load migration report
 */
async function loadMigrationReport() {
  const reportPath = path.join(__dirname, '../temp/critical-assets-migration-report.json');
  try {
    const content = await fs.readFile(reportPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load migration report:', error.message);
    console.log('\nPlease run: node scripts/migrate-critical-assets.js first\n');
    process.exit(1);
  }
}

/**
 * Update URLs in a file
 */
async function updateFileUrls(filePath, urlMapping) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    const originalContent = content;
    let replacements = 0;
    const changes = [];

    for (const [cloudinaryUrl, supabaseUrl] of Object.entries(urlMapping)) {
      // Escape special regex characters
      const escapedUrl = cloudinaryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedUrl, 'g');

      const matches = content.match(regex);
      if (matches) {
        replacements += matches.length;
        changes.push({
          from: cloudinaryUrl,
          to: supabaseUrl,
          count: matches.length
        });
        content = content.replace(regex, supabaseUrl);
      }
    }

    if (replacements > 0) {
      if (!DRY_RUN) {
        await fs.writeFile(filePath, content, 'utf-8');
      }
      return { replacements, changes, modified: content !== originalContent };
    }

    return null;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 UPDATING CRITICAL URLS\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  // Load migration report
  console.log('📋 Loading migration report...');
  const report = await loadMigrationReport();
  console.log(`✓ Loaded ${Object.keys(report.urlMapping).length} URL mappings\n`);

  // Files to update
  const filesToUpdate = [
    path.join(__dirname, '../src/pages/Home.jsx'),
    path.join(__dirname, '../src/data/caseStudies.js'),
    path.join(__dirname, '../src/components/auth/OnboardingFlow.jsx')
  ];

  console.log('🔄 Updating files...\n');
  const results = [];

  for (const file of filesToUpdate) {
    const relativePath = path.relative(path.join(__dirname, '..'), file);
    console.log(`📄 ${relativePath}`);

    const result = await updateFileUrls(file, report.urlMapping);

    if (result) {
      results.push({ file: relativePath, ...result });
      console.log(`   ✅ ${result.replacements} URLs updated`);

      // Show details of changes
      result.changes.forEach(change => {
        const cloudinaryFilename = path.basename(change.from);
        const supabaseFilename = path.basename(change.to);
        console.log(`      ${change.count}x: ${cloudinaryFilename} → ${supabaseFilename}`);
      });
      console.log('');
    } else {
      console.log(`   ℹ️  No changes needed\n`);
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files Checked: ${filesToUpdate.length}`);
  console.log(`Files Modified: ${results.length}`);
  console.log(`Total Replacements: ${results.reduce((sum, r) => sum + r.replacements, 0)}`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN COMPLETE - No files were actually modified');
    console.log('Run without --dry-run to apply changes\n');
  } else {
    console.log('\n✅ URL updates complete!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Review changes: git diff');
    console.log('2. Test locally: npm run dev');
    console.log('   - Test Home page (hero videos, logo)');
    console.log('   - Test Work page (case study logos)');
    console.log('   - Test Onboarding flow');
    console.log('3. Deploy to dev: npm run deploy:dev');
    console.log('4. Test dev site: https://dev.disruptorsmedia.com\n');
  }

  // Show which files were updated
  if (results.length > 0) {
    console.log('📝 Files updated:');
    results.forEach(r => {
      console.log(`   - ${r.file} (${r.replacements} URLs)`);
    });
    console.log('');
  }
}

main().catch(console.error);
