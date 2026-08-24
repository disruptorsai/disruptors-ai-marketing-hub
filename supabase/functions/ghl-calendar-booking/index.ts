const CALENDAR_ID = '0R4D9EJK9OSWn7bkeVzj';
const CALENDAR_WIDGET_URL = `https://api.leadconnectorhq.com/widget/booking/${CALENDAR_ID}`;

const allowedOrigins = new Set([
  'https://disruptorsmedia.com',
  'https://www.disruptorsmedia.com',
  'https://disruptors-ai-marketing-hub.kyle-924.workers.dev',
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get('Origin') || '';

  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin)
      ? origin
      : 'https://disruptorsmedia.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
}

function json(request: Request, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(request),
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== 'POST') {
    return json(request, 405, { error: 'Method not allowed' });
  }

  const origin = request.headers.get('Origin');
  if (origin && !allowedOrigins.has(origin)) {
    return json(request, 403, { error: 'Origin not allowed' });
  }

  try {
    const formData = await request.json();
    const {
      fullName,
      businessName,
      email,
      phone,
      website,
      monthlyRevenue,
      notes,
    } = formData;

    if (typeof fullName !== 'string' || !fullName.trim() ||
        typeof email !== 'string' || !email.trim()) {
      return json(request, 400, { error: 'Full name and email are required' });
    }

    const webhookUrl = Deno.env.get('GHL_BOOKING_WEBHOOK_URL') || Deno.env.get('GHL_WEBHOOK_URL');
    if (!webhookUrl) {
      console.error('GHL booking webhook secret is not configured');
      return json(request, 500, { error: 'Booking service is not configured' });
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName.trim(),
        business_name: typeof businessName === 'string' ? businessName.trim() : '',
        email: email.trim(),
        phone: typeof phone === 'string' ? phone.trim() : '',
        website: typeof website === 'string' ? website.trim() : '',
        monthly_revenue: typeof monthlyRevenue === 'string' ? monthlyRevenue : '',
        message: typeof notes === 'string' ? notes.trim() : '',
        source: 'website_strategy_session',
      }),
    });

    if (!webhookResponse.ok) {
      console.error('GHL booking webhook failed:', webhookResponse.status);
      return json(request, 502, { error: 'Unable to submit booking request' });
    }

    const bookingUrl = new URL(CALENDAR_WIDGET_URL);
    bookingUrl.searchParams.set('email', email.trim());
    bookingUrl.searchParams.set('name', fullName.trim());
    bookingUrl.searchParams.set('phone', typeof phone === 'string' ? phone.trim() : '');

    return json(request, 200, {
      success: true,
      message: 'Contact submitted successfully',
      calendarId: CALENDAR_ID,
      bookingUrl: bookingUrl.toString(),
    });
  } catch (error) {
    console.error('Error processing booking:', error);
    return json(request, 500, { error: 'Failed to process booking request' });
  }
});
