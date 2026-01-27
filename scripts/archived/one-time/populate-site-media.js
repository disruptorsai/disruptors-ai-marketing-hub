import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function populateSiteMedia() {
  console.log('='.repeat(70));
  console.log('POPULATING SITE_MEDIA TABLE FROM AUDIT DATA');
  console.log('='.repeat(70));

  try {
    // Read the audit file
    const auditPath = join(__dirname, '..', 'MEDIA_ASSET_AUDIT.json');
    console.log('\n[1/3] Reading audit file...');
    console.log(`   Path: ${auditPath}`);

    const auditData = JSON.parse(await readFile(auditPath, 'utf-8'));
    const pageCount = Object.keys(auditData.by_page).length;
    console.log(`   ✓ Found ${pageCount} pages with ${auditData.total_assets} total assets`);

    // Transform audit data to site_media records
    console.log('\n[2/3] Transforming audit data...');
    const mediaRecords = [];
    let assetCount = 0;

    for (const [pageKey, pageData] of Object.entries(auditData.by_page)) {
      // Convert page key to slug (e.g., "Home.jsx" -> "home", "solutions-ai-automation.jsx" -> "solutions-ai-automation")
      const pageSlug = pageKey.replace('.jsx', '').toLowerCase();

      for (const asset of pageData.assets) {
        assetCount++;

        // Extract section name from purpose field
        let sectionName = null;
        if (asset.purpose) {
          // Look for common section patterns in purpose
          const purpose = asset.purpose.toLowerCase();

          if (purpose.includes('alternatinglayout section')) {
            sectionName = 'AlternatingLayout';
          } else if (purpose.includes('hero')) {
            sectionName = 'Hero';
          } else if (purpose.includes('service icon')) {
            sectionName = 'Service Icons';
          } else if (purpose.includes('client logo') || purpose.includes('clientlogomarquee')) {
            sectionName = 'Client Logos';
          } else if (purpose.includes('team member')) {
            sectionName = 'Team';
          } else if (purpose.includes('gallery')) {
            sectionName = 'Gallery';
          } else if (purpose.includes('case study') || purpose.includes('portfolio')) {
            sectionName = 'Case Study';
          } else if (purpose.includes('background')) {
            sectionName = 'Background';
          } else if (purpose.includes('header') || purpose.includes('navigation')) {
            sectionName = 'Header';
          } else if (purpose.includes('footer')) {
            sectionName = 'Footer';
          } else if (purpose.includes('blog')) {
            sectionName = 'Blog';
          } else {
            // Try to extract section from pattern "Section Name - Description"
            const dashMatch = asset.purpose.match(/^([^-]+)\s*-/);
            if (dashMatch) {
              sectionName = dashMatch[1].trim();
            }
          }
        }

        // Generate a unique media_key
        const sectionSlug = sectionName?.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'general';
        const purposeSlug = asset.purpose?.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 50) || 'unknown';
        const mediaKey = `${pageSlug}_${sectionSlug}_${asset.type}_${assetCount}`
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .substring(0, 255); // Limit length

        // Extract Cloudinary info if present
        let cloudinaryPublicId = null;
        let cloudinaryFolder = null;
        let cloudinaryVersion = null;
        let cloudinaryFormat = null;

        if (asset.source && typeof asset.source === 'string' && asset.source.includes('cloudinary.com')) {
          const urlMatch = asset.source.match(/\/v(\d+)\/(.+?)\.(\w+)$/);
          if (urlMatch) {
            cloudinaryVersion = urlMatch[1];
            const pathParts = urlMatch[2].split('/');
            cloudinaryFolder = pathParts.slice(0, -1).join('/');
            cloudinaryPublicId = pathParts[pathParts.length - 1];
            cloudinaryFormat = urlMatch[3];
          }
        }

        // Determine source type
        let sourceType = 'external';
        if (asset.source && typeof asset.source === 'string') {
          if (asset.source.includes('cloudinary.com')) {
            sourceType = 'cloudinary';
          } else if (asset.source.startsWith('/')) {
            sourceType = 'local';
          } else if (asset.source.includes('unsplash.com')) {
            sourceType = 'unsplash';
          }
        }

        const record = {
          media_key: mediaKey,
          media_type: asset.type === 'image' ? 'image' : 'video',
          media_url: asset.source,
          page_slug: pageSlug,
          section_name: sectionName,
          purpose: asset.purpose || null,
          alt_text: asset.alt_text || null,
          caption: null,
          cloudinary_public_id: cloudinaryPublicId,
          cloudinary_folder: cloudinaryFolder,
          cloudinary_version: cloudinaryVersion,
          cloudinary_format: cloudinaryFormat,
          display_order: assetCount,
          is_active: true,
          is_featured: asset.purpose?.toLowerCase().includes('hero') || asset.purpose?.toLowerCase().includes('featured'),
          lazy_load: asset.type === 'image' && !asset.purpose?.toLowerCase().includes('hero'),
          seo_optimized: sourceType === 'cloudinary',
          accessibility_checked: Boolean(asset.alt_text),
          tags: [pageSlug, sectionName, sourceType, asset.type].filter(Boolean),
          metadata: {
            original_purpose: asset.purpose,
            location_in_code: asset.location_in_code,
            is_dynamic: asset.is_dynamic,
            is_database_driven: asset.is_database_driven,
            source_type: sourceType,
            audit_timestamp: auditData.audit_date
          }
        };

        mediaRecords.push(record);
      }
    }

    console.log(`   ✓ Transformed ${mediaRecords.length} media records`);

    // Insert records using upsert to handle duplicates
    console.log('\n[3/3] Inserting records into site_media table...');

    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < mediaRecords.length; i += batchSize) {
      const batch = mediaRecords.slice(i, i + batchSize);

      try {
        const { data, error } = await supabase
          .from('site_media')
          .upsert(batch, {
            onConflict: 'media_key',
            ignoreDuplicates: false
          });

        if (error) {
          console.log(`   ✗ Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
          errors.push({ batch: Math.floor(i / batchSize) + 1, error: error.message });
          errorCount += batch.length;
        } else {
          console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
          successCount += batch.length;
        }
      } catch (err) {
        console.log(`   ✗ Batch ${Math.floor(i / batchSize) + 1} error: ${err.message}`);
        errors.push({ batch: Math.floor(i / batchSize) + 1, error: err.message });
        errorCount += batch.length;
      }
    }

    console.log(`\n   Summary: ${successCount} records inserted, ${errorCount} failed`);

    if (errors.length > 0) {
      console.log('\n   Errors encountered:');
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. Batch ${err.batch}: ${err.error}`);
      });
    }

    // Verify the result
    console.log('\n' + '='.repeat(70));
    console.log('VERIFICATION');
    console.log('='.repeat(70));

    const { data: mediaAssets, error: selectError, count } = await supabase
      .from('site_media')
      .select('*', { count: 'exact' })
      .order('page_slug', { ascending: true })
      .order('section_name', { ascending: true })
      .order('display_order', { ascending: true });

    if (selectError) {
      console.log('\n✗ Error verifying site_media:', selectError.message);
    } else {
      console.log(`\n✓ site_media table contains ${count} records`);

      // Group by page
      const byPage = {};
      mediaAssets?.forEach(asset => {
        if (!byPage[asset.page_slug]) {
          byPage[asset.page_slug] = [];
        }
        byPage[asset.page_slug].push(asset);
      });

      console.log('\nAssets by page:');
      Object.entries(byPage).forEach(([pageSlug, assets]) => {
        console.log(`   ${pageSlug}: ${assets.length} assets`);
      });

      // Statistics
      const imageCount = mediaAssets?.filter(a => a.media_type === 'image').length || 0;
      const videoCount = mediaAssets?.filter(a => a.media_type === 'video').length || 0;
      const cloudinaryCount = mediaAssets?.filter(a => a.cloudinary_public_id !== null).length || 0;
      const activeCount = mediaAssets?.filter(a => a.is_active).length || 0;

      console.log('\nStatistics:');
      console.log(`   Images: ${imageCount}`);
      console.log(`   Videos: ${videoCount}`);
      console.log(`   Cloudinary hosted: ${cloudinaryCount}`);
      console.log(`   Active: ${activeCount}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('POPULATION COMPLETE');
    console.log('='.repeat(70));

    if (errorCount === 0) {
      console.log('\n✓ All media records successfully inserted!');
      console.log('\nNext steps:');
      console.log('1. Open Data Manager in admin panel to view and edit media');
      console.log('2. Update page components to load media from database');
      console.log('3. Test media management and replacement workflow');
    } else {
      console.log('\n⚠️  Some records failed to insert');
      console.log('Review errors above and retry if needed');
    }

    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n✗ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

populateSiteMedia().catch(console.error);
