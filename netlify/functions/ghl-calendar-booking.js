/**
 * GoHighLevel Calendar Booking Integration
 *
 * Creates/updates contact in GHL and returns calendar booking link
 * Calendar ID: 0R4D9EJK9OSWn7bkeVzj (Meet with the Disruptors)
 */

const GHL_API_KEY = process.env.GHL_API_KEY || 'pit-3b7ddf94-4e92-4e76-b842-331f276b525c';
const GHL_BASE_URL = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '1DrJ590uuFroxuiy2iME';
const CALENDAR_ID = '0R4D9EJK9OSWn7bkeVzj'; // Meet with the Disruptors calendar

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const formData = JSON.parse(event.body);
    const { fullName, businessName, email, phone, website, monthlyRevenue, notes } = formData;

    // Validate required fields
    if (!fullName || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Full name and email are required' })
      };
    }

    console.log('📝 Processing booking request for:', email);

    // Step 1: Create or update contact in GHL
    const contactPayload = {
      firstName: fullName.split(' ')[0] || fullName,
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      name: fullName,
      email: email,
      locationId: GHL_LOCATION_ID,
      phone: phone || '',
      website: website || '',
      source: 'Website - Book Strategy Session',
      tags: ['strategy-session-request', 'website-lead'],
      customFields: []
    };

    // Add custom fields if available
    if (businessName) {
      contactPayload.companyName = businessName;
      contactPayload.customFields.push({
        key: 'business_name',
        field_value: businessName
      });
    }
    if (monthlyRevenue) {
      contactPayload.customFields.push({
        key: 'monthly_revenue',
        field_value: monthlyRevenue
      });
    }
    if (notes) {
      contactPayload.customFields.push({
        key: 'marketing_challenge',
        field_value: notes
      });
    }

    // Create/update contact
    const contactResponse = await fetch(`${GHL_BASE_URL}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactPayload)
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error('❌ GHL Contact creation failed:', contactResponse.status, errorText);

      // Try to find existing contact by email
      const searchResponse = await fetch(
        `${GHL_BASE_URL}/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Version': '2021-07-28'
          }
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.contact) {
          console.log('✅ Found existing contact:', searchData.contact.id);
          // Contact exists, continue with booking
        } else {
          throw new Error('Failed to create or find contact in GHL');
        }
      } else {
        throw new Error('Failed to create or find contact in GHL');
      }
    } else {
      const contactData = await contactResponse.json();
      console.log('✅ Contact created/updated:', contactData.contact?.id);
    }

    // Step 2: Generate calendar widget URL
    // The calendar widget slug is "meeting-with-the-disruptors"
    const calendarWidgetUrl = `https://${GHL_LOCATION_ID}.gohighlevel.com/widget/booking/meeting-with-the-disruptors`;

    // Alternatively, you can use the calendar ID directly
    const calendarBookingUrl = `https://api.leadconnectorhq.com/widget/booking/${CALENDAR_ID}`;

    // Step 3: Return success with calendar URL
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Contact created successfully',
        calendarUrl: calendarWidgetUrl,
        calendarId: CALENDAR_ID,
        // Provide pre-filled URL with contact info
        bookingUrl: `${calendarWidgetUrl}?email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}&phone=${encodeURIComponent(phone || '')}`
      })
    };

  } catch (error) {
    console.error('❌ Error processing booking:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process booking request',
        message: error.message
      })
    };
  }
};
