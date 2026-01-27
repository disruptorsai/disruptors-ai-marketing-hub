#!/usr/bin/env node

/**
 * Direct creation of site_media table using pg connection
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;

// Parse connection string from Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

// Construct connection string (you'll need to get this from Supabase dashboard)
// Go to: Settings > Database > Connection string (Direct connection)
const connectionString = `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log('This script requires direct PostgreSQL access.');
console.log('\nPlease run the migration manually:');
console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql');
console.log('2. Copy the contents of: supabase/migrations/20250930000000_create_site_media_table.sql');
console.log('3. Paste and execute in the SQL Editor');
console.log('\nOR');
console.log('\nUse the Supabase CLI:');
console.log('1. Install: npm install -g supabase');
console.log('2. Link project: supabase link --project-ref ' + projectRef);
console.log('3. Apply migration: supabase db push');
