import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function verifyCleanSlate() {
  console.log('=== Verifying Clean Slate for Connect Event ===\n');

  // Check poll responses
  const { data: polls, count: pollCount } = await supabase
    .from('connect_poll_responses')
    .select('*', { count: 'exact' });

  console.log('📊 Poll Responses:', pollCount || 0, 'rows');
  if (pollCount > 0) {
    console.log('⚠️  WARNING: Poll responses still exist!');
  } else {
    console.log('✅ Clean - No poll responses');
  }

  // Check contacts
  const { data: contacts, count: contactCount } = await supabase
    .from('connect_contacts')
    .select('*', { count: 'exact' });

  console.log('👥 Contacts:', contactCount || 0, 'rows');
  if (contactCount > 0) {
    console.log('⚠️  WARNING: Contact records still exist!');
  } else {
    console.log('✅ Clean - No contacts');
  }

  // Check attendances
  const { data: attendances, count: attendanceCount } = await supabase
    .from('connect_attendances')
    .select('*', { count: 'exact' });

  console.log('📝 Attendances:', attendanceCount || 0, 'rows');
  if (attendanceCount > 0) {
    console.log('⚠️  WARNING: Attendance records still exist!');
  } else {
    console.log('✅ Clean - No attendances');
  }

  // Check audit logs
  const { data: logs, count: logCount } = await supabase
    .from('connect_audit_logs')
    .select('*', { count: 'exact' });

  console.log('📋 Audit Logs:', logCount || 0, 'rows');
  if (logCount > 0) {
    console.log('⚠️  WARNING: Audit log entries still exist!');
  } else {
    console.log('✅ Clean - No audit logs');
  }

  // Verify event and kiosks are preserved
  const { data: events } = await supabase
    .from('connect_events')
    .select('id, name, slug')
    .eq('slug', 'connect-2025-10')
    .single();

  console.log('\n=== Preserved Configuration ===');
  if (events) {
    console.log('✅ Event:', events.name);
    console.log('   Slug:', events.slug);
  } else {
    console.log('❌ ERROR: Event not found!');
  }

  const { data: kiosks, count: kioskCount } = await supabase
    .from('connect_kiosks')
    .select('*', { count: 'exact' });

  console.log('✅ Kiosks:', kioskCount || 0, 'devices configured');

  // Summary
  const totalRows = (pollCount || 0) + (contactCount || 0) + (attendanceCount || 0) + (logCount || 0);
  console.log('\n=== Summary ===');
  if (totalRows === 0) {
    console.log('🎉 VERIFIED: System is clean and ready for the event!');
  } else {
    console.log('⚠️  WARNING:', totalRows, 'test records still exist');
  }
}

verifyCleanSlate().catch(console.error);
