import { supabaseAdmin } from '../src/lib/supabase-client.js';

async function verifyConnectPollTable() {
  console.log('🔍 Verifying connect_poll_responses table...\n');

  try {
    // 1. Check if table exists by querying it
    console.log('1️⃣ Checking table existence...');
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Table query error:', tableError);
      return;
    }
    console.log('✅ Table exists and is queryable\n');

    // 2. Skip schema introspection (not critical for this verification)
    console.log('2️⃣ Skipping schema introspection (table exists is sufficient)\n');

    // 3. Test SELECT with service role
    console.log('3️⃣ Testing SELECT with service role (should work)...');
    const { data: testData, error: testError, count } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('*', { count: 'exact' });

    if (testError) {
      console.error('❌ Query error:', testError);
    } else {
      console.log(`✅ Query successful! Found ${count} records`);
      if (testData && testData.length > 0) {
        console.log('\nSample record:');
        console.log(JSON.stringify(testData[0], null, 2));
      }
    }

    // 4. Check if event exists
    console.log('\n4️⃣ Checking if event exists...');
    const { data: events, error: eventError } = await supabaseAdmin
      .from('connect_events')
      .select('id, name, slug')
      .eq('slug', 'connect-2025-10');

    if (eventError) {
      console.error('❌ Event query error:', eventError);
    } else if (!events || events.length === 0) {
      console.error('❌ No event found with slug "connect-2025-10"');
      console.log('Creating test event...');

      const { data: newEvent, error: createError } = await supabaseAdmin
        .from('connect_events')
        .insert({
          name: 'Disruptors Connect - North Salt Lake',
          slug: 'connect-2025-10',
          starts_at: '2025-10-30 18:00:00-06',
          venue: 'North Salt Lake Event Hall',
          wifi_ssid: 'DisruptorsEventHall',
          wifi_password: 'Disrupt2025',
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create event:', createError);
      } else {
        console.log('✅ Event created:', newEvent);
      }
    } else {
      console.log('✅ Event exists:');
      console.log(JSON.stringify(events[0], null, 2));
    }

    // 5. Test actual poll-results function logic
    console.log('\n5️⃣ Simulating poll-results function query...');
    const eventId = 'connect-2025-10';

    // First get event ID from slug
    const { data: eventData, error: eventIdError } = await supabaseAdmin
      .from('connect_events')
      .select('id')
      .eq('slug', eventId)
      .single();

    if (eventIdError || !eventData) {
      console.error('❌ Could not find event by slug:', eventId);
    } else {
      const actualEventId = eventData.id;
      console.log(`Event ID: ${actualEventId}`);

      const { data: responses, error: responseError } = await supabaseAdmin
        .from('connect_poll_responses')
        .select('*')
        .eq('event_id', actualEventId)
        .order('created_at', { ascending: false });

      if (responseError) {
        console.error('❌ Poll responses query error:', responseError);
      } else {
        console.log(`✅ Found ${responses.length} poll responses`);
        if (responses.length > 0) {
          console.log('\nSample response:');
          console.log(JSON.stringify(responses[0], null, 2));
        }
      }
    }

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyConnectPollTable();
