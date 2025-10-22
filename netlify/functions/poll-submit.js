import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { eventId, sessionId, answers, requestId } = JSON.parse(event.body);

  try {
    // Check idempotency
    const { data: existing } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: existing.id, cached: true })
      };
    }

    // Insert poll response (ANONYMOUS — no link to contact)
    const { data: poll, error } = await supabaseAdmin
      .from('connect_poll_responses')
      .insert({
        event_id: eventId,
        session_id: sessionId,
        q1_experience: answers.q1,
        q2_goal: answers.q2,
        q3_hesitation: answers.q3,
        q4_confidence: answers.q4,
        q5_impact_area: answers.q5,
        q6_general_text: answers.q6 || null,
        q7_automation_text: answers.q7 || null
      })
      .select()
      .single();

    if (error) {
      console.error('Poll submit error:', error);
      throw error;
    }

    // Log audit (type: 'poll', no PII)
    await supabaseAdmin.from('connect_audit_logs').insert({
      event_id: eventId,
      type: 'poll',
      payload: { requestId, pollId: poll.id }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId: poll.id })
    };
  } catch (error) {
    console.error('Poll submit error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
