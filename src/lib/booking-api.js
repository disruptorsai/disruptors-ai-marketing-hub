export function getBookingEndpoint() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');

  if (!supabaseUrl || supabaseUrl.includes('placeholder.supabase.co')) {
    throw new Error('Supabase is not configured for this deployment');
  }

  return `${supabaseUrl}/functions/v1/ghl-calendar-booking`;
}
