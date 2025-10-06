import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;

// Extract project ref from URL: https://ubqxflzuvxowigbjmqfb.supabase.co
const projectRef = process.env.VITE_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('Could not extract project ref from VITE_SUPABASE_URL');
  process.exit(1);
}

// Supabase database password (from service role key or separate env var)
const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'YOUR_DB_PASSWORD';

// Construct connection string
const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase database...\n');
    await client.connect();
    console.log('✓ Connected\n');

    console.log('Reading migration file...\n');
    const migrationSQL = readFileSync('supabase/migrations/add_services_fields.sql', 'utf8');

    console.log('Executing migration...\n');
    const result = await client.query(migrationSQL);

    console.log('✓ Migration applied successfully!');
    console.log('\nResult:', result);

  } catch (error) {
    console.error('Error applying migration:');
    console.error(error.message);

    if (error.message.includes('password')) {
      console.error('\n⚠ Database password not set. Please provide SUPABASE_DB_PASSWORD env variable.');
      console.error('You can find your database password in Supabase Dashboard > Project Settings > Database.');
    }
  } finally {
    await client.end();
  }
}

applyMigration().catch(console.error);
