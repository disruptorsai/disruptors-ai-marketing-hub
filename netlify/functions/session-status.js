import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const sessionId = event.queryStringParameters?.sessionId;
  const eventId = event.queryStringParameters?.eventId || 'connect-2025-10';

  if (!sessionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'sessionId is required' })
    };
  }

  try {
    // Check if session has checked in (attendance record)
    const { data: attendance, error: attendanceError } = await supabaseAdmin
      .from('connect_attendances')
      .select(`
        id,
        checked_in_at,
        contact:contact_id (
          id,
          first_name,
          last_name,
          company,
          role,
          email,
          phone
        )
      `)
      .eq('session_id', sessionId)
      .eq('event_id', eventId)
      .single();

    if (attendanceError && attendanceError.code !== 'PGRST116') {
      console.error('[Session Status] Attendance query error:', attendanceError);
    }

    // Check if session has taken poll
    const { data: pollResponse, error: pollError } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('id, created_at')
      .eq('session_id', sessionId)
      .eq('event_id', eventId)
      .single();

    if (pollError && pollError.code !== 'PGRST116') {
      console.error('[Session Status] Poll query error:', pollError);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        eventId,
        hasCheckedIn: !!attendance,
        hasTakenPoll: !!pollResponse,
        contact: attendance?.contact || null,
        checkedInAt: attendance?.checked_in_at || null,
        pollCompletedAt: pollResponse?.created_at || null
      })
    };
  } catch (error) {
    console.error('[Session Status] Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
