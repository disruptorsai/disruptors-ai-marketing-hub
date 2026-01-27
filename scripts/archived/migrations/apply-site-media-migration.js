#!/usr/bin/env node

/**
 * Apply site_media table migration to Supabase
 *
 * This script executes the site_media table migration using Supabase Management API
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ubqxflzuvxowigbjmqfb';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_ACCESS_TOKEN && !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_ACCESS_TOKEN or VITE_SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

async function applyMigration() {
  try {
    console.log('Reading migration file...');

    const migrationPath = path.resolve(__dirname, '../supabase/migrations/20250930000000_create_site_media_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Migration file loaded successfully');
    console.log('Applying migration to Supabase project:', SUPABASE_PROJECT_REF);

    // Use Supabase Management API to execute SQL
    const url = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);

      // Try alternative method: execute via service role key
      console.log('\nTrying alternative method via direct SQL execution...');
      await executeViaServiceRole(migrationSQL);
      return;
    }

    const result = await response.json();
    console.log('\nMigration applied successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));

    // Verify table creation
    await verifyTable();

  } catch (error) {
    console.error('Error applying migration:', error.message);

    // Try alternative method
    console.log('\nTrying alternative method via direct SQL execution...');
    const migrationPath = path.resolve(__dirname, '../supabase/migrations/20250930000000_create_site_media_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await executeViaServiceRole(migrationSQL);
  }
}

async function executeViaServiceRole(sql) {
  try {
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`\nExecuting ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        const response = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            query: statement + ';'
          })
        });

        if (response.ok) {
          console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
        } else {
          const error = await response.text();
          if (!error.includes('already exists')) {
            console.log(`✗ Statement ${i + 1}/${statements.length} failed: ${error}`);
          } else {
            console.log(`✓ Statement ${i + 1}/${statements.length} skipped (already exists)`);
          }
        }
      } catch (err) {
        console.log(`✗ Statement ${i + 1}/${statements.length} error: ${err.message}`);
      }
    }

    console.log('\nDirect execution completed. Verifying table...');
    await verifyTable();

  } catch (error) {
    console.error('Direct execution error:', error.message);
    console.log('\n⚠️  Manual migration may be required.');
    console.log('Please run the SQL file manually in the Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF + '/sql');
  }
}

async function verifyTable() {
  try {
    const response = await fetch(
      `https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/site_media?select=*&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (response.ok) {
      console.log('\n✓ Table site_media verified successfully!');
      console.log('Table is ready to use.');

      // Get table info
      const infoResponse = await fetch(
        `https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (infoResponse.ok) {
        const info = await infoResponse.json();
        const siteMediaInfo = info.definitions?.site_media;
        if (siteMediaInfo) {
          console.log('\nTable structure:');
          console.log('Columns:', Object.keys(siteMediaInfo.properties || {}).join(', '));
        }
      }
    } else {
      const error = await response.text();
      console.error('✗ Table verification failed:', error);
      console.log('\n⚠️  Please verify the table manually in Supabase Dashboard:');
      console.log('https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF + '/editor');
    }
  } catch (error) {
    console.error('Verification error:', error.message);
  }
}

// Run the migration
applyMigration();
