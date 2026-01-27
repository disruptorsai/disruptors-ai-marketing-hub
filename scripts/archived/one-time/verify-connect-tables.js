import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function verifyTables() {
  console.log('Verifying Disruptors Connect tables...\n');

  const tables = [
    'connect_events',
    'connect_kiosks',
    'connect_contacts',
    'connect_attendances',
    'connect_poll_responses',
    'connect_classifications',
    'connect_audit_logs'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`[ERROR] ${table}: ${error.message}`);
    } else {
      const cols = data && data[0] ? Object.keys(data[0]).length : 0;
      console.log(`[OK] ${table}: EXISTS (${cols} columns)`);
    }
  }

  // Check for seed data
  const { data: events, error: eventsError } = await supabase
    .from('connect_events')
    .select('id, name, slug, starts_at')
    .limit(5);

  if (eventsError) {
    console.log(`\n[ERROR] Could not fetch events: ${eventsError.message}`);
  } else {
    console.log(`\nEvents in database: ${events?.length || 0}`);
    if (events && events.length > 0) {
      events.forEach(e => {
        console.log(`  - ${e.name} (slug: ${e.slug})`);
      });
    } else {
      console.log('  No events found - you may need to create one');
    }
  }

  // Check for kiosks
  const { data: kiosks } = await supabase
    .from('connect_kiosks')
    .select('id, device_label, device_fingerprint')
    .limit(5);

  console.log(`\nKiosks in database: ${kiosks?.length || 0}`);
  if (kiosks && kiosks.length > 0) {
    kiosks.forEach(k => {
      console.log(`  - ${k.device_label} (fingerprint: ${k.device_fingerprint})`);
    });
  }

  console.log('\n=== Verification Complete ===');
}

verifyTables().catch(console.error);
