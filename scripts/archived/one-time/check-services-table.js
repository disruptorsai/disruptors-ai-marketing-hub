import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('Checking for services tables...\n');

  // Check for services table (plural)
  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .limit(1);

  // Check for service table (singular)
  const { data: serviceData, error: serviceError } = await supabase
    .from('service')
    .select('*')
    .limit(1);

  console.log('services (plural):', servicesError ? '✗ NOT FOUND' : '✓ EXISTS');
  if (!servicesError && servicesData) {
    console.log('  Record count:', servicesData.length);
  }

  console.log('service (singular):', serviceError ? '✗ NOT FOUND' : '✓ EXISTS');
  if (!serviceError && serviceData) {
    console.log('  Record count:', serviceData.length);
  }
}

checkTables().catch(console.error);
