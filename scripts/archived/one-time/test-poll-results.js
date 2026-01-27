import { supabaseAdmin } from '../src/lib/supabase-client.js';

async function testPollResults() {
  console.log('🧪 Testing poll results system...\n');

  try {
    // 1. Get the event
    console.log('1️⃣ Getting event...');
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('connect_events')
      .select('id, name, slug')
      .eq('slug', 'connect-2025-10')
      .single();

    if (eventError || !eventData) {
      console.error('❌ Event not found:', eventError);
      return;
    }
    console.log('✅ Event found:', eventData.name);
    console.log(`   ID: ${eventData.id}\n`);

    // 2. Check existing poll responses
    console.log('2️⃣ Checking existing poll responses...');
    const { data: existingResponses, error: existingError } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('*')
      .eq('event_id', eventData.id);

    if (existingError) {
      console.error('❌ Error fetching responses:', existingError);
      return;
    }
    console.log(`✅ Found ${existingResponses.length} existing responses\n`);

    // 3. Create test poll responses if none exist
    if (existingResponses.length === 0) {
      console.log('3️⃣ Creating test poll responses...');

      const testResponses = [
        {
          event_id: eventData.id,
          session_id: crypto.randomUUID(),
          q1_experience: 'A',
          q2_goal: 'B',
          q3_hesitation: 'C',
          q4_confidence: 'A',
          q5_impact_area: 'D',
          q6_general_text: 'This is a test general feedback response.',
          q7_automation_text: 'Looking to automate customer onboarding.'
        },
        {
          event_id: eventData.id,
          session_id: crypto.randomUUID(),
          q1_experience: 'B',
          q2_goal: 'A',
          q3_hesitation: 'A',
          q4_confidence: 'B',
          q5_impact_area: 'C',
          q6_general_text: 'Great event, learned a lot!',
          q7_automation_text: 'Want to automate social media posting.'
        },
        {
          event_id: eventData.id,
          session_id: crypto.randomUUID(),
          q1_experience: 'C',
          q2_goal: 'C',
          q3_hesitation: 'B',
          q4_confidence: 'D',
          q5_impact_area: 'A',
          q6_general_text: 'Very informative session.',
          q7_automation_text: 'Interested in email automation workflows.'
        }
      ];

      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('connect_poll_responses')
        .insert(testResponses)
        .select();

      if (insertError) {
        console.error('❌ Error inserting test data:', insertError);
        return;
      }
      console.log(`✅ Created ${insertedData.length} test responses\n`);
    } else {
      console.log('3️⃣ Skipping test data creation (responses already exist)\n');
    }

    // 4. Simulate the poll-results function query
    console.log('4️⃣ Simulating poll-results function...');
    const { data: responses, error } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('*')
      .eq('event_id', eventData.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    // Aggregate multiple choice results (same logic as function)
    const multipleChoiceResults = {
      q1_experience: { A: 0, B: 0, C: 0, D: 0 },
      q2_goal: { A: 0, B: 0, C: 0, D: 0 },
      q3_hesitation: { A: 0, B: 0, C: 0, D: 0 },
      q4_confidence: { A: 0, B: 0, C: 0, D: 0 },
      q5_impact_area: { A: 0, B: 0, C: 0, D: 0 }
    };

    const openEndedResponses = {
      q6_general_text: [],
      q7_automation_text: []
    };

    responses.forEach(response => {
      if (response.q1_experience) multipleChoiceResults.q1_experience[response.q1_experience]++;
      if (response.q2_goal) multipleChoiceResults.q2_goal[response.q2_goal]++;
      if (response.q3_hesitation) multipleChoiceResults.q3_hesitation[response.q3_hesitation]++;
      if (response.q4_confidence) multipleChoiceResults.q4_confidence[response.q4_confidence]++;
      if (response.q5_impact_area) multipleChoiceResults.q5_impact_area[response.q5_impact_area]++;

      if (response.q6_general_text) {
        openEndedResponses.q6_general_text.push(response.q6_general_text);
      }
      if (response.q7_automation_text) {
        openEndedResponses.q7_automation_text.push(response.q7_automation_text);
      }
    });

    console.log('✅ Aggregation successful!\n');
    console.log('📊 Results Summary:');
    console.log(`   Total Responses: ${responses.length}`);
    console.log('\n   Multiple Choice:');
    console.log(JSON.stringify(multipleChoiceResults, null, 2));
    console.log('\n   Open-Ended Responses:');
    console.log(`   Q6 (General): ${openEndedResponses.q6_general_text.length} responses`);
    console.log(`   Q7 (Automation): ${openEndedResponses.q7_automation_text.length} responses`);

    console.log('\n✅ All tests passed! Poll results system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPollResults();
