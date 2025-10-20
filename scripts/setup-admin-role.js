/**
 * Setup Admin Role for Existing User
 *
 * Adds 'admin' role to an existing Supabase Auth user's metadata
 * This allows them to access the Admin Nexus at /admin/secret
 *
 * Usage: node scripts/setup-admin-role.js <email>
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function setupAdminRole(email) {
  console.log('\n🔐 Admin Role Setup\n');
  console.log('='.repeat(60));

  if (!email) {
    console.error('❌ Error: Email address required\n');
    console.log('Usage: node scripts/setup-admin-role.js <email>\n');
    console.log('Example: node scripts/setup-admin-role.js kyle@disruptorsmedia.com\n');
    return;
  }

  // Find user by email
  console.log(`\n🔍 Looking for user: ${email}...`);

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error(`\n❌ User not found: ${email}`);
    console.log('\n📋 Available users:');
    users.slice(0, 10).forEach(u => {
      console.log(`   • ${u.email}`);
    });
    if (users.length > 10) {
      console.log(`   ... and ${users.length - 10} more`);
    }
    console.log('');
    return;
  }

  console.log(`✅ Found user: ${user.email}`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);

  // Check current role
  const currentRole = user.user_metadata?.role;
  if (currentRole === 'admin') {
    console.log('\n✅ User already has admin role!');
    console.log('\n💡 You can now login at /admin/secret with:');
    console.log(`   Email: ${user.email}`);
    console.log('   Password: (your existing password)\n');
    return;
  }

  console.log(`\n📝 Current role: ${currentRole || 'none'}`);
  console.log('🔧 Setting admin role...');

  // Update user metadata to add admin role
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        role: 'admin'
      }
    }
  );

  if (updateError) {
    console.error('\n❌ Error updating user:', updateError.message);
    return;
  }

  console.log('\n✅ Successfully added admin role!');
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Admin Access Granted\n');
  console.log('📋 Admin Credentials:');
  console.log(`   Email: ${updatedUser.user.email}`);
  console.log('   Password: (your existing password)');
  console.log(`   Role: admin`);

  console.log('\n🚀 Next Steps:');
  console.log('   1. Go to /admin/secret (or use Ctrl+Shift+D / 5 logo clicks)');
  console.log('   2. Login with the email and password above');
  console.log('   3. Access the Telemetry Dashboard');

  console.log('\n💡 Tips:');
  console.log('   • Emergency exit: Ctrl+Shift+Escape');
  console.log('   • Generate test data: npm run telemetry:generate');
  console.log('   • Check status: npm run telemetry:status\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const email = process.argv[2];
  setupAdminRole(email).catch(console.error);
}

export { setupAdminRole };
