/**
 * GoHighLevel Calendar Booking Integration
 *
 * Sends contact data to GHL webhook and returns calendar booking link
 * Calendar ID: 0R4D9EJK9OSWn7bkeVzj (Meet with the Disruptors)
 */

const GHL_WEBHOOK_URL = process.env.GHL_BOOKING_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL;
const GHL_LOCATION_ID = '1DrJ590uuFroxuiy2iME';
const CALENDAR_ID = '0R4D9EJK9OSWn7bkeVzj';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

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

    if (!fullName || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Full name and email are required' })
      };
    }

    console.log('📝 Processing booking request for:', email);

    // Send contact data to GHL webhook
    if (GHL_WEBHOOK_URL) {
      const webhookResponse = await fetch(GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          business_name: businessName || '',
          email: email,
          phone: phone || '',
          website: website || '',
          monthly_revenue: monthlyRevenue || '',
          message: notes || '',
          source: 'website_strategy_session',
        }),
      });

      if (!webhookResponse.ok) {
        console.error('❌ GHL webhook failed:', webhookResponse.status);
      } else {
        console.log('✅ Contact sent to GHL webhook');
      }
    } else {
      console.warn('⚠️ GHL_WEBHOOK_URL not configured');
    }

    // Generate calendar booking URL pre-filled with contact info
    const calendarWidgetUrl = 'https://api.leadconnectorhq.com/widget/booking/0R4D9EJK9OSWn7bkeVzj';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Contact submitted successfully',
        calendarId: CALENDAR_ID,
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
