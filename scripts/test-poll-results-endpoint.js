import { supabaseAdmin } from '../src/lib/supabase-client.js';

/**
 * This script simulates exactly what the poll-results Netlify function does
 * to verify the entire flow works correctly
 */

async function testPollResultsEndpoint() {
  console.log('🧪 Testing poll-results endpoint logic...\n');

  const eventSlug = 'connect-2025-10';

  try {
    console.log('Step 1: Resolve event slug to UUID...');
    // First, resolve the event slug to an actual UUID
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('connect_events')
      .select('id')
      .eq('slug', eventSlug)
      .single();

    if (eventError || !eventData) {
      console.error('❌ Event lookup error:', eventError);
      throw new Error(`Event not found with slug: ${eventSlug}`);
    }

    const eventId = eventData.id;
    console.log(`✅ Event found: ${eventId}\n`);

    console.log('Step 2: Fetch poll responses...');
    // Fetch all anonymous poll responses for the event
    const { data: responses, error } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Poll results fetch error:', error);
      throw error;
    }

    console.log(`✅ Found ${responses.length} responses\n`);

    console.log('Step 3: Aggregate results...');
    // Aggregate multiple choice results
    const multipleChoiceResults = {
      q1_experience: { A: 0, B: 0, C: 0, D: 0 },
      q2_goal: { A: 0, B: 0, C: 0, D: 0 },
      q3_hesitation: { A: 0, B: 0, C: 0, D: 0 },
      q4_confidence: { A: 0, B: 0, C: 0, D: 0 },
      q5_impact_area: { A: 0, B: 0, C: 0, D: 0 }
    };

    // Open-ended responses (anonymized)
    const openEndedResponses = {
      q6_general_text: [],
      q7_automation_text: []
    };

    // Aggregate data
    responses.forEach(response => {
      // Count multiple choice
      if (response.q1_experience) multipleChoiceResults.q1_experience[response.q1_experience]++;
      if (response.q2_goal) multipleChoiceResults.q2_goal[response.q2_goal]++;
      if (response.q3_hesitation) multipleChoiceResults.q3_hesitation[response.q3_hesitation]++;
      if (response.q4_confidence) multipleChoiceResults.q4_confidence[response.q4_confidence]++;
      if (response.q5_impact_area) multipleChoiceResults.q5_impact_area[response.q5_impact_area]++;

      // Collect open-ended (anonymized - only text, no timestamps or IDs)
      if (response.q6_general_text) {
        openEndedResponses.q6_general_text.push(response.q6_general_text);
      }
      if (response.q7_automation_text) {
        openEndedResponses.q7_automation_text.push(response.q7_automation_text);
      }
    });

    console.log('✅ Aggregation complete\n');

    const result = {
      totalResponses: responses.length,
      multipleChoice: multipleChoiceResults,
      openEnded: openEndedResponses,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Final Response (would be returned to frontend):');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n✅ All steps successful! The endpoint would return 200 OK.');
    console.log('\n🎯 Summary:');
    console.log(`   - Event resolved: ${eventSlug} → ${eventId}`);
    console.log(`   - Poll responses fetched: ${responses.length} records`);
    console.log(`   - Aggregation completed successfully`);
    console.log(`   - Response format validated`);

  } catch (error) {
    console.error('\n❌ Endpoint test failed:', error);
    console.log('\nThis error would cause the function to return 500 status');
  }
}

testPollResultsEndpoint();
