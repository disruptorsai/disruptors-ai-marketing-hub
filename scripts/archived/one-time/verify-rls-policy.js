import { supabase, supabaseAdmin } from '../src/lib/supabase-client.js';

async function verifyRLSPolicy() {
  console.log('🔒 Verifying RLS policy for connect_poll_responses...\n');

  try {
    // 1. Test with admin client (should work)
    console.log('1️⃣ Testing with service role client (should work)...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('*')
      .limit(5);

    if (adminError) {
      console.error('❌ Admin client error:', adminError);
    } else {
      console.log(`✅ Admin client works! Found ${adminData.length} responses\n`);
    }

    // 2. Test with anon client (should also work due to public SELECT policy)
    console.log('2️⃣ Testing with anonymous client (should work for SELECT)...');
    const { data: anonData, error: anonError } = await supabase
      .from('connect_poll_responses')
      .select('*')
      .limit(5);

    if (anonError) {
      console.error('❌ Anonymous client error:', anonError);
      console.log('\n⚠️  RLS policy may not be correctly configured!');
      console.log('Expected policy: "Poll responses are anonymous and public for aggregation"');
      console.log('Policy should allow: FOR SELECT USING (true)');
    } else {
      console.log(`✅ Anonymous client works! Found ${anonData.length} responses`);
      console.log('✅ RLS policy is correctly configured for public SELECT\n');
    }

    // 3. Test INSERT with anon client (should fail - no INSERT policy)
    console.log('3️⃣ Testing INSERT with anonymous client (should fail)...');
    const { data: insertData, error: insertError } = await supabase
      .from('connect_poll_responses')
      .insert({
        event_id: '716419af-8a0e-4db5-9869-a55fc5a4aa50',
        session_id: crypto.randomUUID(),
        q1_experience: 'A'
      })
      .select();

    if (insertError) {
      console.log('✅ INSERT correctly blocked (expected behavior)');
      console.log(`   Error: ${insertError.message}\n`);
    } else {
      console.error('❌ WARNING: Anonymous client can INSERT (unexpected!)');
      console.log('   This should be blocked unless explicitly intended.\n');
    }

    console.log('✅ RLS verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyRLSPolicy();
