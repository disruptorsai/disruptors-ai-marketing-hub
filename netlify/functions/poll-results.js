import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const eventId = event.queryStringParameters?.eventId || 'connect-2025-10';

  try {
    // Fetch all anonymous poll responses for the event
    const { data: responses, error } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Poll results fetch error:', error);
      throw error;
    }

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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({
        totalResponses: responses.length,
        multipleChoice: multipleChoiceResults,
        openEnded: openEndedResponses,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Poll results error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
