// Apply schema to NEW Supabase project via direct PostgreSQL connection
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NEW_PROJECT = {
  ref: 'ulfnzcniivkjtfaoxfmi',
  password: 'Disruptors77$'
};

// Supabase connection string format
const connectionString = `postgresql://postgres.${NEW_PROJECT.ref}:${encodeURIComponent(NEW_PROJECT.password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function main() {
  console.log('Connecting to NEW Supabase project...');
  console.log(`Project: ${NEW_PROJECT.ref}`);

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read the migration SQL
    const sqlPath = join(__dirname, 'COMPLETE_MIGRATION.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('Applying schema migration...');
    console.log('This may take a moment...\n');

    // Execute the SQL
    await client.query(sql);

    console.log('✅ Schema migration applied successfully!');

    // Verify by checking tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`\nCreated ${result.rows.length} tables:`);
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('password')) {
      console.log('\nThe password might be incorrect. Please check and try again.');
    }
  } finally {
    await client.end();
  }
}

main();
