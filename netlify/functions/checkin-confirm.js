import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const {
    eventId: eventSlug, // This is actually a slug like "connect-2025-10"
    sessionId,
    kioskId: kioskLabel, // This is actually a label like "kiosk-001"
    contactPayload,
    consent,
    source = 'kiosk',
    requestId // idempotency key
  } = JSON.parse(event.body);

  try {
    // Get or create event from slug
    let eventId;
    const { data: existingEvent } = await supabaseAdmin
      .from('connect_events')
      .select('id')
      .eq('slug', eventSlug)
      .maybeSingle();

    if (existingEvent) {
      eventId = existingEvent.id;
    } else {
      // Create event if it doesn't exist
      const { data: newEvent, error: eventError } = await supabaseAdmin
        .from('connect_events')
        .insert({
          name: 'Disruptors Connect 2025',
          slug: eventSlug,
          starts_at: new Date('2025-10-24T18:00:00-06:00'),
          venue: '650 N Main St, North Salt Lake, UT 84054',
          wifi_ssid: 'DisruptorsEventHall',
          wifi_password: 'Disrupt2025',
          is_active: true
        })
        .select('id')
        .single();

      if (eventError) {
        console.error('Event creation error:', eventError);
        throw eventError;
      }
      eventId = newEvent.id;
    }

    // Get or create kiosk from label
    let kioskId;
    const { data: existingKiosk } = await supabaseAdmin
      .from('connect_kiosks')
      .select('id')
      .eq('device_label', kioskLabel)
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingKiosk) {
      kioskId = existingKiosk.id;
      // Update last_seen_at
      await supabaseAdmin
        .from('connect_kiosks')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', kioskId);
    } else {
      // Create kiosk if it doesn't exist
      const { data: newKiosk, error: kioskError } = await supabaseAdmin
        .from('connect_kiosks')
        .insert({
          event_id: eventId,
          device_label: kioskLabel,
          is_active: true,
          last_seen_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (kioskError) {
        console.error('Kiosk creation error:', kioskError);
        throw kioskError;
      }
      kioskId = newKiosk.id;
    }

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
    const normalizedEmail = contactPayload.email?.toLowerCase();

    // Check for existing contact (manual deduplication since we have partial indexes)
    let contact = null;

    if (normalizedPhone) {
      const { data: existingByPhone } = await supabaseAdmin
        .from('connect_contacts')
        .select('*')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (existingByPhone) {
        contact = existingByPhone;
      }
    }

    if (!contact && normalizedEmail) {
      const { data: existingByEmail } = await supabaseAdmin
        .from('connect_contacts')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingByEmail) {
        contact = existingByEmail;
      }
    }

    // Update existing contact or create new one
    if (contact) {
      // Update existing contact
      const { data: updatedContact, error: updateError } = await supabaseAdmin
        .from('connect_contacts')
        .update({
          phone: normalizedPhone || contact.phone,
          email: normalizedEmail || contact.email,
          first_name: contactPayload.firstName,
          last_name: contactPayload.lastName,
          company: contactPayload.company,
          role: contactPayload.role,
          consent_feedback: consent.feedback,
          consent_sms: consent.sms || false,
          consent_photo: consent.photo || false
        })
        .eq('id', contact.id)
        .select()
        .single();

      if (updateError) {
        console.error('Contact update error:', updateError);
        throw updateError;
      }
      contact = updatedContact;
    } else {
      // Create new contact
      const { data: newContact, error: createError } = await supabaseAdmin
        .from('connect_contacts')
        .insert({
          phone: normalizedPhone,
          email: normalizedEmail,
          first_name: contactPayload.firstName,
          last_name: contactPayload.lastName,
          company: contactPayload.company,
          role: contactPayload.role,
          consent_feedback: consent.feedback,
          consent_sms: consent.sms || false,
          consent_photo: consent.photo || false
        })
        .select()
        .single();

      if (createError) {
        console.error('Contact creation error:', createError);
        throw createError;
      }
      contact = newContact;
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
