import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '../../src/lib/supabase-client.js';

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { contactId, eventId } = JSON.parse(event.body);

  try {
    // Get current contact + classification
    const { data: contact } = await supabaseAdmin
      .from('connect_contacts')
      .select(`
        *,
        connect_classifications(*)
      `)
      .eq('id', contactId)
      .single();

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Get last 50 attendees with classifications
    const { data: recentAttendees } = await supabaseAdmin
      .from('connect_attendances')
      .select(`
        contact_id,
        connect_contacts!inner(first_name, last_name, company, role),
        connect_classifications(persona_label, vertical, maturity_tier, topics)
      `)
      .eq('event_id', eventId)
      .neq('contact_id', contactId)
      .order('checked_in_at', { ascending: false })
      .limit(50);

    if (!recentAttendees || recentAttendees.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: [] })
      };
    }

    const attendeesList = recentAttendees
      .filter(a => a.connect_contacts)
      .map(a => ({
        name: `${a.connect_contacts.first_name} ${a.connect_contacts.last_name}`,
        company: a.connect_contacts.company || 'Unknown',
        role: a.connect_contacts.role || 'Unknown',
        persona: a.connect_classifications?.[0]?.persona_label || 'Unknown'
      }));

    if (attendeesList.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: [] })
      };
    }

    // LLM prompt for matchmaking
    const prompt = `You are a networking matchmaker at a business event. Suggest the TOP 2 people this attendee should meet.

Current Attendee:
Name: ${contact.first_name} ${contact.last_name}
Company: ${contact.company || 'Unknown'}
Role: ${contact.role || 'Unknown'}
Persona: ${contact.connect_classifications?.[0]?.persona_label || 'Unknown'}

Other Attendees (last ${attendeesList.length}):
${attendeesList.map((a, i) => `${i + 1}. ${a.name} - ${a.company} (${a.role}) [${a.persona}]`).join('\n')}

Respond with ONLY a JSON array of 2 suggestions (or fewer if less data available):
[
  {
    "name": "Full Name",
    "company": "Company",
    "reason": "One sentence why they should meet"
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    const suggestions = JSON.parse(message.content[0].text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suggestions })
    };
  } catch (error) {
    console.error('AI match error:', error);
    return {
      statusCode: 200, // Don't fail, just return empty suggestions
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suggestions: [], error: error.message })
    };
  }
}
