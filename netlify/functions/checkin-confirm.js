import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const {
    eventId,
    sessionId,
    kioskId,
    contactPayload,
    consent,
    source = 'kiosk',
    requestId // idempotency key
  } = JSON.parse(event.body);

  try {
    // Check idempotency
    const { data: existing } = await supabaseAdmin
      .from('connect_audit_logs')
      .select('id, payload')
      .eq('payload->>requestId', requestId)
      .single();

    if (existing) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceId: existing.payload.attendanceId, cached: true })
      };
    }

    // Normalize phone
    const normalizedPhone = contactPayload.phone?.replace(/[^0-9+]/g, '');

    // Create or update contact
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('connect_contacts')
      .upsert({
        phone: normalizedPhone,
        email: contactPayload.email?.toLowerCase(),
        first_name: contactPayload.firstName,
        last_name: contactPayload.lastName,
        company: contactPayload.company,
        role: contactPayload.role,
        consent_feedback: consent.feedback,
        consent_sms: consent.sms || false,
        consent_photo: consent.photo || false
      }, {
        onConflict: normalizedPhone ? 'phone' : 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (contactError) {
      console.error('Contact creation error:', contactError);
      throw contactError;
    }

    // Create attendance
    const { data: attendance, error: attendanceError } = await supabaseAdmin
      .from('connect_attendances')
      .insert({
        event_id: eventId,
        contact_id: contact.id,
        session_id: sessionId,
        kiosk_id: kioskId,
        source,
        metadata: {
          user_agent: event.headers['user-agent'],
          ip: event.headers['x-forwarded-for']
        }
      })
      .select()
      .single();

    if (attendanceError) {
      // Handle duplicate attendance (already checked in)
      if (attendanceError.code === '23505') {
        const { data: existingAttendance } = await supabaseAdmin
          .from('connect_attendances')
          .select('*')
          .eq('event_id', eventId)
          .eq('contact_id', contact.id)
          .single();

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attendanceId: existingAttendance.id,
            contactId: contact.id,
            alreadyCheckedIn: true
          })
        };
      }
      console.error('Attendance creation error:', attendanceError);
      throw attendanceError;
    }

    // Log action for idempotency
    await supabaseAdmin.from('connect_audit_logs').insert({
      event_id: eventId,
      kiosk_id: kioskId,
      type: 'checkin',
      payload: { requestId, attendanceId: attendance.id, contactId: contact.id }
    });

    // Trigger AI classification (non-blocking)
    if (process.env.ENABLE_AI_CLASSIFICATION === 'true') {
      fetch(`${process.env.URL}/.netlify/functions/ai-classify`, {
        method: 'POST',
        body: JSON.stringify({ contactId: contact.id, eventId }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.warn('AI classification failed:', err));
    }

    // Send welcome SMS (non-blocking)
    if (consent.sms && contact.phone) {
      fetch(`${process.env.URL}/.netlify/functions/notify-sms`, {
        method: 'POST',
        body: JSON.stringify({
          phone: contact.phone,
          templateId: 'welcome',
          data: [contact.first_name, 'Disruptors Connect', { ssid: 'DisruptorsEventHall', password: 'Disrupt2025' }]
        }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.warn('SMS send failed:', err));
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attendanceId: attendance.id,
        contactId: contact.id,
        sessionId
      })
    };
  } catch (error) {
    console.error('Checkin confirm error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
