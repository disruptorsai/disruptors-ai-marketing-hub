/**
 * List Admin Users
 *
 * Shows all Supabase Auth users and their admin status
 *
 * Usage: node scripts/list-admin-users.js
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function listAdminUsers() {
  console.log('\n👥 Supabase Auth Users & Admin Status\n');
  console.log('='.repeat(60));

  // Get all users
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error listing users:', error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('\n⚪ No users found in database');
    console.log('\nYou may need to:');
    console.log('  1. Create a user account at /signup');
    console.log('  2. Or use Google OAuth to sign in\n');
    return;
  }

  console.log(`\n✅ Found ${users.length} user(s):\n`);

  // Separate admins and regular users
  const admins = users.filter(u => u.user_metadata?.role === 'admin');
  const regularUsers = users.filter(u => u.user_metadata?.role !== 'admin');

  // Show admins first
  if (admins.length > 0) {
    console.log('👑 ADMIN USERS:\n');
    admins.forEach(user => {
      const lastSignIn = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleDateString()
        : 'Never';
      console.log(`   ✅ ${user.email}`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Last Sign In: ${lastSignIn}`);
      console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });
  }

  // Show regular users
  if (regularUsers.length > 0) {
    console.log(`\n👤 REGULAR USERS (${regularUsers.length}):\n`);
    regularUsers.forEach(user => {
      const lastSignIn = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleDateString()
        : 'Never';
      const role = user.user_metadata?.role || 'user';
      console.log(`   • ${user.email} (${role})`);
      console.log(`     Last Sign In: ${lastSignIn}`);
      console.log('');
    });
  }

  console.log('='.repeat(60));

  // Show summary
  console.log('\n📊 SUMMARY:\n');
  console.log(`   Total Users: ${users.length}`);
  console.log(`   Admin Users: ${admins.length}`);
  console.log(`   Regular Users: ${regularUsers.length}`);

  if (admins.length === 0) {
    console.log('\n⚠️  No admin users found!');
    console.log('\n💡 To grant admin access to a user:');
    console.log('   node scripts/setup-admin-role.js <email>\n');
    console.log('Example:');
    if (users.length > 0) {
      console.log(`   node scripts/setup-admin-role.js ${users[0].email}\n`);
    }
  } else {
    console.log('\n✅ Admin access is configured!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Go to /admin/secret');
    console.log(`   2. Login with: ${admins[0].email}`);
    console.log('   3. Access the Telemetry Dashboard\n');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  listAdminUsers().catch(console.error);
}

export { listAdminUsers };
