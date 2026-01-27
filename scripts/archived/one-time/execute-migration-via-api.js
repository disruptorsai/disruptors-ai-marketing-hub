#!/usr/bin/env node

/**
 * Execute site_media migration via Supabase Management API v1
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ubqxflzuvxowigbjmqfb';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('Error: SUPABASE_ACCESS_TOKEN is required');
  console.error('Get it from: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

async function executeSQL(sql) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

  console.log('Executing SQL via Management API...');
  console.log('Project:', PROJECT_REF);
  console.log('SQL length:', sql.length, 'characters\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText);
      console.error('Body:', responseText);
      return false;
    }

    console.log('✓ SQL executed successfully!');

    try {
      const result = JSON.parse(responseText);
      if (result.length > 0) {
        console.log('Result:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.log('Response:', responseText);
    }

    return true;

  } catch (error) {
    console.error('Execution error:', error.message);
    return false;
  }
}

async function main() {
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/20250930000000_create_site_media_table.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file not found:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  const success = await executeSQL(sql);

  if (success) {
    // Wait a moment for schema cache to update
    console.log('\nWaiting for schema cache to update...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify
    console.log('Verifying table creation...');
    const verifySQL = "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'site_media' ORDER BY ordinal_position;";
    await executeSQL(verifySQL);

    console.log('\n✓ Migration complete!');
    console.log('\nView table in Supabase Dashboard:');
    console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/editor/site_media`);
  } else {
    console.log('\n✗ Migration failed');
    console.log('\nPlease execute manually in SQL Editor:');
    console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql`);
  }
}

main();
