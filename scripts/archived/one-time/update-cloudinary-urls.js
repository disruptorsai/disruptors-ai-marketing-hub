/**
 * UPDATE CLOUDINARY URLS TO SUPABASE
 *
 * This script replaces all Cloudinary URLs in the codebase
 * with Supabase Storage URLs using the generated mapping file.
 *
 * Usage:
 * node scripts/update-cloudinary-urls.js [--dry-run]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Load the mapping file
 */
async function loadMapping() {
  const mappingPath = path.join(__dirname, '../temp/cloudinary-to-supabase-url-mapping.json');
  try {
    const content = await fs.readFile(mappingPath, 'utf-8');
    const data = JSON.parse(content);
    return data.urlMapping;
  } catch (error) {
    console.error('❌ Failed to load mapping file:', error.message);
    console.log('\nPlease run: node scripts/upload-to-supabase.js first\n');
    process.exit(1);
  }
}

/**
 * Replace URLs in a file
 */
async function replaceUrlsInFile(filePath, mapping) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let replacements = 0;
    const changes = [];

    for (const [cloudinaryUrl, supabaseUrl] of Object.entries(mapping)) {
      // Escape special regex characters in URL
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
      return { replacements, changes };
    }

    return null;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 UPDATING CLOUDINARY URLS TO SUPABASE\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  // Load mapping
  console.log('📋 Loading URL mapping...');
  const mapping = await loadMapping();
  console.log(`✓ Loaded ${Object.keys(mapping).length} URL mappings\n`);

  // Find all files to process
  console.log('🔍 Finding files to process...');
  const files = await glob('src/**/*.{js,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  console.log(`✓ Found ${files.length} files\n`);

  // Process files
  console.log('🔄 Processing files...\n');
  const results = [];

  for (const file of files) {
    const result = await replaceUrlsInFile(file, mapping);
    if (result) {
      results.push({ file, ...result });
      console.log(`✓ ${file}`);
      console.log(`  Replaced ${result.replacements} URL(s)`);
      result.changes.forEach(change => {
        console.log(`    ${change.count}x: ${change.from.substring(0, 60)}...`);
      });
      console.log('');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 REPLACEMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files Processed: ${files.length}`);
  console.log(`Files Modified: ${results.length}`);
  console.log(`Total Replacements: ${results.reduce((sum, r) => sum + r.replacements, 0)}`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN COMPLETE - No files were actually modified');
    console.log('Run without --dry-run to apply changes\n');
  } else {
    console.log('\n✅ URL replacement complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review the changes with: git diff');
    console.log('2. Test locally: npm run dev');
    console.log('3. Deploy to dev: npm run deploy:dev');
    console.log('4. Test dev site: https://dev.disruptorsmedia.com');
    console.log('5. Deploy to production: npm run deploy:prod\n');
  }
}

main().catch(console.error);
