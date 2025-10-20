# Lead Magnet Tracking System

## Overview

The Lead Magnet Tracking System provides comprehensive analytics for One-Click Google Signup lead magnets. It tracks the complete user journey from initial signup through content access, with full UTM attribution and conversion funnel analytics.

## Migration Applied

**Migration File**: `supabase/migrations/20250117_lead_magnet_tracking.sql`
**Applied**: 2025-10-17
**Status**: ✅ Verified and Operational

## Database Schema

### Tables

#### 1. `lead_captures`
Tracks initial signup when users click through from social media posts.

**Columns**:
- `id` (UUID, PK) - Unique identifier
- `email` (TEXT, NOT NULL) - User's email address
- `lead_magnet_slug` (TEXT, NOT NULL) - Lead magnet identifier (e.g., 'keyword-research-tool')
- `utm_source` (TEXT) - Traffic source (e.g., 'linkedin', 'twitter')
- `utm_medium` (TEXT) - Marketing medium (e.g., 'social', 'email')
- `utm_campaign` (TEXT) - Campaign identifier
- `utm_content` (TEXT) - Content variation identifier
- `utm_term` (TEXT) - Keyword term
- `signup_method` (TEXT) - How user signed up ('one_tap', 'oauth_button', 'email_password')
- `captured_at` (TIMESTAMPTZ) - When signup occurred
- `accessed` (BOOLEAN, DEFAULT false) - Whether user accessed content
- `accessed_at` (TIMESTAMPTZ) - When content was accessed
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW(), auto-updated via trigger)

**Indexes**:
- `idx_lead_captures_email` - Email lookups
- `idx_lead_captures_slug` - Lead magnet filtering
- `idx_lead_captures_captured_at` - Time-based queries
- `idx_lead_captures_utm_source` - Attribution reporting

**Triggers**:
- `lead_captures_updated_at` - Automatically updates `updated_at` on row changes

#### 2. `lead_accesses`
Tracks when users actually access or download lead magnet content.

**Columns**:
- `id` (UUID, PK) - Unique identifier
- `email` (TEXT, NOT NULL) - User's email address
- `user_id` (UUID, FK → auth.users) - Associated Supabase auth user
- `lead_magnet_slug` (TEXT, NOT NULL) - Lead magnet identifier
- `utm_source` (TEXT) - Traffic source
- `utm_medium` (TEXT) - Marketing medium
- `utm_campaign` (TEXT) - Campaign identifier
- `accessed_at` (TIMESTAMPTZ, DEFAULT NOW()) - Access timestamp
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Indexes**:
- `idx_lead_accesses_email` - Email lookups
- `idx_lead_accesses_user_id` - User-based queries
- `idx_lead_accesses_slug` - Lead magnet filtering
- `idx_lead_accesses_accessed_at` - Time-based queries

### Views

#### 1. `lead_magnet_stats`
Aggregated performance metrics for each lead magnet.

**Columns**:
- `lead_magnet_slug` (TEXT) - Lead magnet identifier
- `total_signups` (BIGINT) - Total unique signups
- `total_accessed` (BIGINT) - Total unique users who accessed content
- `access_rate_percent` (NUMERIC) - Conversion rate (accessed/signups * 100)
- `unique_sources` (BIGINT) - Number of unique UTM sources
- `unique_campaigns` (BIGINT) - Number of unique campaigns
- `first_signup` (TIMESTAMPTZ) - First signup timestamp
- `last_signup` (TIMESTAMPTZ) - Most recent signup timestamp

**Usage**:
```sql
SELECT * FROM lead_magnet_stats
WHERE lead_magnet_slug = 'keyword-research-tool';
```

#### 2. `recent_lead_activity`
Latest 100 lead magnet interactions with status classification.

**Columns**:
- `email` (TEXT) - User's email
- `lead_magnet_slug` (TEXT) - Lead magnet identifier
- `utm_source` (TEXT) - Traffic source
- `utm_campaign` (TEXT) - Campaign identifier
- `signup_method` (TEXT) - Signup method
- `captured_at` (TIMESTAMPTZ) - Signup timestamp
- `accessed` (BOOLEAN) - Access status
- `accessed_at` (TIMESTAMPTZ) - Access timestamp
- `status` (TEXT) - Calculated status:
  - `'completed'` - User accessed content
  - `'abandoned'` - No access after 24 hours
  - `'pending'` - Within 24 hours, not yet accessed

**Usage**:
```sql
SELECT * FROM recent_lead_activity
WHERE status = 'abandoned'
LIMIT 20;
```

### Functions

#### `get_lead_funnel(p_lead_magnet_slug TEXT, p_days_back INTEGER DEFAULT 30)`

Returns conversion funnel data for a specific lead magnet.

**Parameters**:
- `p_lead_magnet_slug` (TEXT) - Lead magnet identifier
- `p_days_back` (INTEGER) - Number of days to look back (default: 30)

**Returns**:
```sql
TABLE (
  step TEXT,           -- Funnel step name
  count BIGINT,        -- Number of users at this step
  percentage NUMERIC   -- Percentage of total signups
)
```

**Usage**:
```sql
SELECT * FROM get_lead_funnel('keyword-research-tool', 7);
```

**Example Output**:
```
step              | count | percentage
------------------+-------+-----------
Signed Up         | 150   | 100.00
Accessed Content  | 120   | 80.00
```

## Row Level Security (RLS)

### Security Model

RLS is **enabled** on both tables to ensure data privacy and proper access control.

### Policies

#### `lead_captures` Table

1. **Service Role Full Access**
   - Role: `service_role`
   - Operations: ALL (SELECT, INSERT, UPDATE, DELETE)
   - Purpose: Netlify functions and admin operations
   - Condition: Always true (bypasses RLS)

2. **Users View Own Captures**
   - Role: `authenticated`
   - Operations: SELECT
   - Condition: `email` matches authenticated user's email
   - Purpose: Users can view their own signup history

#### `lead_accesses` Table

1. **Service Role Full Access**
   - Role: `service_role`
   - Operations: ALL (SELECT, INSERT, UPDATE, DELETE)
   - Purpose: Netlify functions and admin operations
   - Condition: Always true (bypasses RLS)

2. **Users View Own Accesses**
   - Role: `authenticated`
   - Operations: SELECT
   - Condition: `user_id = auth.uid()` OR `email` matches authenticated user's email
   - Purpose: Users can view their own access history

### Grants

```sql
-- Views accessible to authenticated users
GRANT SELECT ON public.lead_magnet_stats TO authenticated;
GRANT SELECT ON public.recent_lead_activity TO authenticated;

-- Functions executable by authenticated users
GRANT EXECUTE ON FUNCTION public.get_lead_funnel TO authenticated;
```

## Integration Guide

### 1. Track Lead Capture (Signup)

When a user signs up via One-Click Google Signup:

```javascript
import { supabaseAdmin } from '@/lib/supabase-client';

async function trackLeadCapture({
  email,
  leadMagnetSlug,
  utmParams = {},
  signupMethod = 'one_tap'
}) {
  const { data, error } = await supabaseAdmin
    .from('lead_captures')
    .insert({
      email,
      lead_magnet_slug: leadMagnetSlug,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_content: utmParams.utm_content,
      utm_term: utmParams.utm_term,
      signup_method: signupMethod
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to track lead capture:', error);
    return null;
  }

  return data;
}
```

### 2. Track Content Access (Download/View)

When a user accesses the lead magnet content:

```javascript
import { supabaseAdmin } from '@/lib/supabase-client';

async function trackLeadAccess({
  email,
  userId,
  leadMagnetSlug,
  utmParams = {}
}) {
  // Insert access record
  const { data: accessData, error: accessError } = await supabaseAdmin
    .from('lead_accesses')
    .insert({
      email,
      user_id: userId,
      lead_magnet_slug: leadMagnetSlug,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign
    })
    .select()
    .single();

  if (accessError) {
    console.error('Failed to track lead access:', accessError);
    return null;
  }

  // Update lead_captures to mark as accessed
  const { error: updateError } = await supabaseAdmin
    .from('lead_captures')
    .update({
      accessed: true,
      accessed_at: new Date().toISOString()
    })
    .eq('email', email)
    .eq('lead_magnet_slug', leadMagnetSlug);

  if (updateError) {
    console.error('Failed to update lead capture:', updateError);
  }

  return accessData;
}
```

### 3. Extract UTM Parameters

Utility function to extract UTM parameters from URL:

```javascript
function extractUtmParams(url) {
  const searchParams = new URLSearchParams(url.split('?')[1] || '');

  return {
    utm_source: searchParams.get('utm_source') || null,
    utm_medium: searchParams.get('utm_medium') || null,
    utm_campaign: searchParams.get('utm_campaign') || null,
    utm_content: searchParams.get('utm_content') || null,
    utm_term: searchParams.get('utm_term') || null
  };
}

// Usage
const utmParams = extractUtmParams(window.location.href);
```

### 4. Complete Integration Example

```javascript
// In your One-Click Google Signup success handler
async function handleGoogleSignupSuccess(response) {
  const { email, sub: userId } = parseJWT(response.credential);
  const utmParams = extractUtmParams(window.location.href);
  const leadMagnetSlug = 'keyword-research-tool'; // From page context

  // Track the signup
  await trackLeadCapture({
    email,
    leadMagnetSlug,
    utmParams,
    signupMethod: 'one_tap'
  });

  // Redirect to lead magnet page
  window.location.href = `/lead-magnets/${leadMagnetSlug}?email=${encodeURIComponent(email)}`;
}

// On the lead magnet content page
async function handleContentAccess() {
  const email = getUserEmail(); // From session or query param
  const userId = getUserId();   // From Supabase auth
  const utmParams = extractUtmParams(window.location.href);
  const leadMagnetSlug = 'keyword-research-tool';

  // Track the access
  await trackLeadAccess({
    email,
    userId,
    leadMagnetSlug,
    utmParams
  });

  // Show content
  displayLeadMagnetContent();
}
```

## Analytics Queries

### Performance Overview

```sql
-- Get stats for all lead magnets
SELECT * FROM lead_magnet_stats
ORDER BY total_signups DESC;
```

### Top Performing Sources

```sql
-- Top UTM sources by signup count
SELECT
  utm_source,
  COUNT(DISTINCT email) as signups,
  COUNT(DISTINCT CASE WHEN accessed THEN email END) as accessed,
  ROUND(
    COUNT(DISTINCT CASE WHEN accessed THEN email END)::NUMERIC /
    COUNT(DISTINCT email) * 100,
    2
  ) as conversion_rate
FROM lead_captures
WHERE captured_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source
ORDER BY signups DESC;
```

### Abandoned Leads (Email Follow-up List)

```sql
-- Users who signed up but haven't accessed content after 24 hours
SELECT
  email,
  lead_magnet_slug,
  utm_source,
  utm_campaign,
  captured_at
FROM lead_captures
WHERE accessed = false
  AND captured_at < NOW() - INTERVAL '24 hours'
  AND captured_at > NOW() - INTERVAL '7 days'
ORDER BY captured_at DESC;
```

### Campaign Performance

```sql
-- Performance by campaign
SELECT
  utm_campaign,
  COUNT(DISTINCT email) as signups,
  COUNT(DISTINCT CASE WHEN accessed THEN email END) as accessed,
  ROUND(
    COUNT(DISTINCT CASE WHEN accessed THEN email END)::NUMERIC /
    COUNT(DISTINCT email) * 100,
    2
  ) as conversion_rate
FROM lead_captures
WHERE utm_campaign IS NOT NULL
  AND captured_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_campaign
ORDER BY signups DESC;
```

### Conversion Funnel Analysis

```sql
-- 7-day funnel for specific lead magnet
SELECT * FROM get_lead_funnel('keyword-research-tool', 7);

-- 30-day funnel comparison across all lead magnets
SELECT
  lead_magnet_slug,
  step,
  count,
  percentage
FROM get_lead_funnel('keyword-research-tool', 30)
UNION ALL
SELECT
  lead_magnet_slug,
  step,
  count,
  percentage
FROM get_lead_funnel('ai-content-writer', 30)
ORDER BY lead_magnet_slug, step;
```

### Time-to-Access Analysis

```sql
-- Average time between signup and access
SELECT
  lead_magnet_slug,
  COUNT(*) as accessed_count,
  AVG(EXTRACT(EPOCH FROM (accessed_at - captured_at)) / 3600) as avg_hours_to_access,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (accessed_at - captured_at)) / 3600) as median_hours_to_access
FROM lead_captures
WHERE accessed = true
  AND accessed_at IS NOT NULL
GROUP BY lead_magnet_slug
ORDER BY accessed_count DESC;
```

### Daily Signup Trends

```sql
-- Daily signups for last 30 days
SELECT
  DATE(captured_at) as signup_date,
  COUNT(DISTINCT email) as signups,
  COUNT(DISTINCT CASE WHEN accessed THEN email END) as accessed,
  ROUND(
    COUNT(DISTINCT CASE WHEN accessed THEN email END)::NUMERIC /
    COUNT(DISTINCT email) * 100,
    2
  ) as conversion_rate
FROM lead_captures
WHERE captured_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(captured_at)
ORDER BY signup_date DESC;
```

## Admin Dashboard Queries

### Real-time Activity Feed

```sql
SELECT * FROM recent_lead_activity
LIMIT 50;
```

### Lead Magnet Comparison

```sql
SELECT
  lead_magnet_slug,
  total_signups,
  total_accessed,
  access_rate_percent,
  unique_sources,
  unique_campaigns,
  first_signup,
  last_signup,
  EXTRACT(DAY FROM NOW() - first_signup) as days_active
FROM lead_magnet_stats
ORDER BY total_signups DESC;
```

### User Journey Tracking

```sql
-- Complete journey for a specific email
SELECT
  'Signup' as event_type,
  lc.captured_at as event_time,
  lc.lead_magnet_slug,
  lc.utm_source,
  lc.utm_campaign,
  lc.signup_method as details
FROM lead_captures lc
WHERE lc.email = 'user@example.com'

UNION ALL

SELECT
  'Access' as event_type,
  la.accessed_at as event_time,
  la.lead_magnet_slug,
  la.utm_source,
  la.utm_campaign,
  NULL as details
FROM lead_accesses la
WHERE la.email = 'user@example.com'

ORDER BY event_time DESC;
```

## Verification Script

To verify the migration was applied correctly:

```bash
node scripts/apply-lead-magnet-tracking-migration.js
```

This script:
- ✅ Applies the migration SQL
- ✅ Verifies tables exist and are accessible
- ✅ Checks table schemas and indexes
- ✅ Verifies views are queryable
- ✅ Tests functions are callable
- ✅ Validates RLS policies work correctly
- ✅ Runs sample queries
- ✅ Generates comprehensive verification report

## Next Steps

### 1. Integration Tasks
- [ ] Add tracking calls to One-Click Google Signup flow
- [ ] Implement content access tracking on lead magnet pages
- [ ] Create UTM parameter extraction utility
- [ ] Add tracking to existing lead magnet landing pages

### 2. Analytics Dashboard
- [ ] Create admin dashboard for lead analytics
- [ ] Build real-time activity feed component
- [ ] Implement conversion funnel visualization
- [ ] Add campaign performance comparison charts
- [ ] Create abandoned lead follow-up interface

### 3. Marketing Automation
- [ ] Set up email nurture sequences for new leads
- [ ] Configure abandoned lead follow-up emails
- [ ] Create automated reporting for marketing team
- [ ] Implement A/B testing framework for campaigns

### 4. UTM Strategy
- [ ] Define UTM naming conventions
- [ ] Document campaign tracking for social posts
- [ ] Create UTM builder tool for marketing team
- [ ] Set up campaign performance alerts

### 5. Optimization
- [ ] Monitor database performance and query times
- [ ] Optimize indexes based on actual query patterns
- [ ] Implement data archival strategy for old records
- [ ] Set up automated backup for lead data

## Technical Notes

### Performance Considerations

1. **Indexes**: All common query patterns are indexed (email, slug, timestamps, utm_source)
2. **Views**: Pre-aggregated views reduce query complexity for dashboards
3. **RLS**: Policies use indexed columns for efficient filtering
4. **Timestamps**: All timestamps use `TIMESTAMPTZ` for timezone accuracy

### Security Considerations

1. **RLS Enabled**: Both tables have RLS enabled to prevent unauthorized access
2. **Service Role**: Netlify functions use service role to bypass RLS for system operations
3. **User Isolation**: Authenticated users can only view their own data
4. **Grants**: Views and functions are explicitly granted to authenticated users

### Data Retention

Consider implementing a data retention policy:

```sql
-- Archive leads older than 2 years
DELETE FROM lead_captures
WHERE captured_at < NOW() - INTERVAL '2 years';

DELETE FROM lead_accesses
WHERE accessed_at < NOW() - INTERVAL '2 years';
```

Or use Supabase's built-in archival features for compliance.

## Support

For issues or questions:
1. Check verification report: `node scripts/apply-lead-magnet-tracking-migration.js`
2. Review Supabase logs in dashboard
3. Check RLS policies in Supabase SQL editor
4. Verify environment variables are set correctly

## References

- **Migration File**: `supabase/migrations/20250117_lead_magnet_tracking.sql`
- **Verification Script**: `scripts/apply-lead-magnet-tracking-migration.js`
- **Supabase Project**: https://ubqxflzuvxowigbjmqfb.supabase.co
- **RLS Documentation**: https://supabase.com/docs/guides/auth/row-level-security
