import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { eventId: eventSlugOrId, sessionId, answers, requestId } = JSON.parse(event.body);

  try {
    // Resolve event slug to UUID (handles both slugs like "connect-2025-10" and direct UUIDs)
    let eventId = eventSlugOrId;

    // Check if it's a slug (not a UUID format)
    if (!eventSlugOrId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data: eventData, error: eventError } = await supabaseAdmin
        .from('connect_events')
        .select('id')
        .eq('slug', eventSlugOrId)
        .single();

      if (eventError || !eventData) {
        console.error('Event lookup error:', eventError);
        throw new Error(`Event not found with slug: ${eventSlugOrId}`);
      }

      eventId = eventData.id;
    }

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
        q1_experience: answers.q1_experience,
        q2_goal: answers.q2_goal,
        q3_hesitation: answers.q3_hesitation,
        q4_confidence: answers.q4_confidence,
        q5_impact_area: answers.q5_impact_area,
        q6_general_text: answers.q6_general_text || answers.q6 || null,
        q7_automation_text: answers.q7_automation_text || answers.q7 || null
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
