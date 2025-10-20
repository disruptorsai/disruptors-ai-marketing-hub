# One-Click Google Signup for Lead Magnets

Complete implementation guide for frictionless one-click signup using Google One Tap.

## 📋 Overview

**Goal**: Reduce signup friction for lead magnets from social media posts to literally ONE CLICK.

**User Flow**:
1. User clicks your X/LinkedIn link → lands on `/l/[slug]` (e.g., `/l/ai-email-swipes`)
2. Google One Tap appears automatically
3. One click → signed up → redirect to `/g/[slug]` with content
4. NO onboarding interruption (comes later when they use actual AI tools)
5. Email campaign follows up with irresistible Business Brain offer

**Key Features**:
- ✅ Google One Tap for zero-friction signup
- ✅ UTM parameter preservation across auth flow
- ✅ Separate lead magnet flow vs app flow
- ✅ Delayed onboarding (only when using apps)
- ✅ Subtle upgrade banner (dismissible)
- ✅ Lead capture tracking with Supabase
- ✅ Analytics integration ready

---

## 🚀 Quick Start (5 Steps)

### 1. Get Google OAuth Client ID

You need your Google OAuth Client ID that's already configured in Supabase:

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Providers** → **Google**
3. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### 2. Add Environment Variable

Add this to your `.env` file:

```bash
# Google One Tap Authentication
# Get this from: Supabase Dashboard > Authentication > Providers > Google
# Use the same Client ID that's configured for Google OAuth in Supabase
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE
```

### 3. Apply Database Migration

Run the migration to create lead tracking tables:

```bash
# Option A: Via Supabase Dashboard SQL Editor
# Copy contents of supabase/migrations/20250117_lead_magnet_tracking.sql
# Paste and execute in Supabase Dashboard > SQL Editor

# Option B: Via Supabase CLI (if you have it set up)
supabase db push
```

### 4. Add Routes to Routing System

Add these imports and routes to `src/pages/index.jsx`:

**Add imports after line 93** (after AuthCallback):

```javascript
// Lead magnet system - lazy loaded with retry
const LeadMagnetLanding = lazyWithRetry(() => import('./lead-magnet-landing.jsx'));
const LeadMagnetGated = lazyWithRetry(() => import('./lead-magnet-gated.jsx'));
const BrainSetup = lazyWithRetry(() => import('./brain-setup.jsx'));
```

**Add routes after line 358** (after AuthCallback route):

```javascript
{/* Lead Magnet System */}
<Route path="/l/:slug" element={<LeadMagnetLanding />} />
<Route path="/g/:slug" element={<LeadMagnetGated />} />
<Route path="/app/setup-brain" element={<BrainSetup />} />
```

### 5. Update ProtectedRoute Component

Update the `checkIfNewUser` function in `src/components/auth/ProtectedRoute.jsx` (around line 103):

```javascript
const checkIfNewUser = async (userId) => {
  try {
    console.log('🔒 [PROTECTED_ROUTE] Checking if user has brain for userId:', userId);

    // Check if user signed up via One Tap (lead magnet flow)
    // These users skip onboarding until they use an actual AI tool
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const signupSource = currentUser?.user_metadata?.signup_source;
    const onboardingCompleted = currentUser?.user_metadata?.onboarding_completed;

    console.log('🔒 [PROTECTED_ROUTE] User metadata:', {
      signupSource,
      onboardingCompleted
    });

    // If user signed up via One Tap and hasn't explicitly completed onboarding,
    // skip onboarding for now (they came for a lead magnet, not the app)
    if (signupSource === 'one_tap' && onboardingCompleted === false) {
      console.log('🔒 [PROTECTED_ROUTE] One Tap user - skipping onboarding');
      return false;
    }

    // Try to get user's business brain
    const brain = await BrainAPI.getBrainByUser(userId);
    console.log('🔒 [PROTECTED_ROUTE] Brain API response:', {
      hasBrain: !!brain,
      brainId: brain?.id,
      businessName: brain?.business_name
    });
    return brain === null; // null = new user needs onboarding
  } catch (error) {
    // Error fetching brain - assume new user needs onboarding
    console.error('🔒 [PROTECTED_ROUTE] Error checking user brain:', error);
    return true;
  }
};
```

---

## 📁 Files Created

### Components
- ✅ `src/components/auth/GoogleOneTap.jsx` - Google One Tap integration
- ✅ `src/pages/lead-magnet-landing.jsx` - Landing page `/l/:slug`
- ✅ `src/pages/lead-magnet-gated.jsx` - Gated content `/g/:slug`
- ✅ `src/pages/brain-setup.jsx` - Manual brain setup `/app/setup-brain`

### Serverless Functions
- ✅ `netlify/functions/lead-capture.js` - Track lead signups
- ✅ `netlify/functions/lead-access.js` - Track content access

### Database
- ✅ `supabase/migrations/20250117_lead_magnet_tracking.sql` - Lead tracking tables

---

## 🎯 How to Use

### Creating a Lead Magnet

1. **Add lead magnet content** to `LEAD_MAGNETS` object in both:
   - `src/pages/lead-magnet-landing.jsx` (line 31)
   - `src/pages/lead-magnet-gated.jsx` (line 30)

Example:

```javascript
'my-new-guide': {
  title: 'Ultimate Marketing Guide',
  description: 'Everything you need to dominate your market',
  benefits: [
    '100+ marketing tactics',
    'Step-by-step implementation',
    'Real case studies',
    'Free templates included'
  ],
  icon: '📚',
  estimatedValue: '$497',
  // For gated page only:
  downloadUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID/view',
  embedUrl: 'https://docs.google.com/document/d/YOUR_DOC_ID/preview', // optional
  previewText: `Your detailed preview text here...`
}
```

2. **Share the link**: `https://dm4.wjwelsh.com/l/my-new-guide?utm_source=twitter&utm_campaign=q1-launch`

3. **User flow**:
   - Clicks link → lands on beautiful landing page
   - Google One Tap appears automatically
   - One click → signed up and redirected to content
   - Sees content + dismissible upgrade banner

### Lead Magnet URLs

Pattern: `/l/[slug]?utm_source=x&utm_campaign=post1`

Examples:
- `/l/ai-email-swipes?utm_source=twitter&utm_campaign=email-series`
- `/l/content-calendar?utm_source=linkedin&utm_campaign=q1-launch`
- `/l/lead-magnet-templates?utm_source=facebook&utm_campaign=ads`

---

## 🔍 Testing Locally

1. **Start dev server**:
```bash
npm run dev:netlify
```

2. **Test the flow**:
   - Visit: `http://localhost:8888/l/ai-email-swipes?utm_source=test&utm_campaign=local`
   - Google One Tap should appear (may not work on localhost - test on deployed site)
   - Click fallback "Continue with Google" button
   - Should redirect to `/g/ai-email-swipes` after auth
   - Content should show with upgrade banner

3. **Check tracking**:
   - Open browser console
   - Look for `✅ Lead captured successfully` logs
   - Check Supabase Dashboard → Table Editor → `lead_captures` table

---

## 📊 Analytics & Tracking

### Database Tables

**`lead_captures`** - Initial signups
- Columns: email, lead_magnet_slug, utm_*, signup_method, captured_at
- Query: `SELECT * FROM lead_captures ORDER BY captured_at DESC`

**`lead_accesses`** - Content access
- Columns: email, user_id, lead_magnet_slug, accessed_at
- Query: `SELECT * FROM lead_accesses ORDER BY accessed_at DESC`

### Analytics Views

**Performance Summary**:
```sql
SELECT * FROM lead_magnet_stats;
```

**Recent Activity**:
```sql
SELECT * FROM recent_lead_activity LIMIT 50;
```

**Conversion Funnel** (last 30 days):
```sql
SELECT * FROM get_lead_funnel('ai-email-swipes', 30);
```

### Google Analytics Events

The system fires these `dataLayer` events:

1. **`lead_magnet_accessed`** - When user accesses gated content
   ```javascript
   {
     event: 'lead_magnet_accessed',
     leadMagnetSlug: 'ai-email-swipes',
     userEmail: 'user@example.com',
     userId: 'uuid'
   }
   ```

2. **`lead_magnet_downloaded`** - When user clicks download button
   ```javascript
   {
     event: 'lead_magnet_downloaded',
     leadMagnetSlug: 'ai-email-swipes'
   }
   ```

3. **`upgrade_banner_dismissed`** - When user dismisses upgrade banner
   ```javascript
   {
     event: 'upgrade_banner_dismissed',
     leadMagnetSlug: 'ai-email-swipes'
   }
   ```

4. **`upgrade_banner_clicked`** - When user clicks upgrade CTA
   ```javascript
   {
     event: 'upgrade_banner_clicked',
     leadMagnetSlug: 'ai-email-swipes',
     source: 'lead_magnet_page'
   }
   ```

---

## 🎨 Customization

### Lead Magnet Landing Page

Edit `src/pages/lead-magnet-landing.jsx`:

- **Change copy**: Update title, description, benefits
- **Modify design**: Edit Tailwind classes
- **Add fields**: Collect extra data before signup
- **Remove One Tap**: Set `autoPrompt={false}` prop

### Gated Content Page

Edit `src/pages/lead-magnet-gated.jsx`:

- **Change layout**: Modify card design
- **Hide upgrade banner**: Set `setShowUpgradeBanner(false)`
- **Add content**: Show embedded docs, videos, downloads
- **Custom CTAs**: Add more action buttons

### Upgrade Banner

Edit banner in `lead-magnet-gated.jsx` (lines 162-198):

- **Change copy**: Update headline and description
- **Modify design**: Edit colors, icons, layout
- **Remove entirely**: Comment out the `<AnimatePresence>` block

---

## 🚨 Troubleshooting

### Google One Tap Not Appearing

**Possible Causes**:
1. **Missing Client ID** - Check `.env` file has `VITE_GOOGLE_CLIENT_ID`
2. **localhost restriction** - Google One Tap may not work on localhost
3. **Browser blocking** - ITP, ad blockers, privacy mode
4. **Already logged in** - One Tap only shows for logged out users

**Solutions**:
- Test on deployed site (not localhost)
- Try incognito mode
- Check browser console for errors
- Fallback button will always work

### Routes Not Found

**Error**: `404 Not Found` when visiting `/l/slug`

**Solution**:
- Make sure you added routes to `src/pages/index.jsx`
- Rebuild app: `npm run build`
- Clear browser cache
- Check React Router console logs

### Database Errors

**Error**: `relation "lead_captures" does not exist`

**Solution**:
- Apply database migration (see Step 3 above)
- Check Supabase Dashboard → SQL Editor
- Verify tables exist: `\dt lead_*` in Supabase SQL Editor

### Netlify Functions Not Working

**Error**: `Failed to fetch` when calling lead-capture function

**Solution**:
- Check Netlify functions are deployed: `netlify functions:list`
- Verify environment variables in Netlify Dashboard
- Check function logs: `netlify functions:log lead-capture`
- Test locally: `netlify dev`

---

## 🔄 Migration from Old System

If you have existing users:

1. **No breaking changes** - Old auth flows still work
2. **Gradual rollout** - Only new lead magnet signups use One Tap
3. **Backwards compatible** - All existing routes remain functional

---

## 📧 Email Follow-Up Strategy

Now that you have ONE-CLICK signups, set up email campaigns:

### Day 0 (Immediate)
- ✅ Send lead magnet content (backup delivery)
- ✅ Welcome email with quick wins

### Day 1
- 📧 "Did you download your [resource]?" (if they haven't accessed it)
- 📧 Quick tip email using content from the lead magnet

### Day 3
- 📧 **THE UPGRADE OFFER** - Business Brain pitch
  - "Want AI to write content in YOUR voice?"
  - Case study: How [business] scaled 10x with Business Brain
  - Special offer: Free setup + personalized demo

### Day 7
- 📧 Last chance to set up Business Brain
- 📧 Testimonials and social proof

### Day 14
- 📧 Re-engagement: "Here's what you're missing..."

---

## 🎯 Success Metrics

Track these KPIs:

1. **Signup Conversion Rate** - Visits to `/l/slug` → Signups
   - Target: >40% (one-click should be high)

2. **Access Rate** - Signups → Content Access
   - Target: >80% (most should access immediately)

3. **Upgrade Conversion** - Lead Magnet Users → Business Brain Setup
   - Target: 10-15% (from email campaigns)

4. **Time to Signup** - Landing page → Authenticated
   - Target: <10 seconds (one click + Google auth)

Query in Supabase:
```sql
-- Overall conversion funnel
SELECT
  lead_magnet_slug,
  total_signups,
  total_accessed,
  access_rate_percent
FROM lead_magnet_stats
ORDER BY total_signups DESC;
```

---

## 🔐 Security Notes

### Row Level Security (RLS)

All tables have RLS enabled:
- ✅ Users can only view their own data
- ✅ Service role (Netlify functions) has full access
- ✅ No public access without authentication

### API Keys

Netlify functions use `VITE_SUPABASE_SERVICE_ROLE_KEY` which:
- ✅ Bypasses RLS (needed for lead capture)
- ✅ Only accessible server-side
- ✅ Never exposed to client

### Google OAuth

- ✅ Uses existing Supabase Google OAuth config
- ✅ No separate Google API credentials needed
- ✅ Tokens managed by Supabase Auth

---

## 📚 Additional Resources

- [Google One Tap Docs](https://developers.google.com/identity/gsi/web/guides/overview)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Router v7 Docs](https://reactrouter.com/)

---

## ✅ Checklist

Before going live, verify:

- [ ] Google Client ID added to `.env`
- [ ] Database migration applied successfully
- [ ] Routes added to `src/pages/index.jsx`
- [ ] ProtectedRoute updated to skip onboarding for One Tap users
- [ ] At least one lead magnet configured in both pages
- [ ] Lead magnet content uploaded to Google Drive/Docs
- [ ] Tested signup flow end-to-end on deployed site
- [ ] Analytics events firing correctly
- [ ] Netlify functions deployed and working
- [ ] Email follow-up sequence configured
- [ ] Upgrade banner copy reviewed and approved

---

## 🎉 You're Done!

Your one-click signup system is ready! Now:

1. **Create your first lead magnet** (see "Creating a Lead Magnet" above)
2. **Test the complete flow** on your deployed site
3. **Share the link** on social media with UTM parameters
4. **Monitor conversions** via Supabase dashboard
5. **Follow up** with your email campaigns

**Pro Tip**: Start with one highly valuable lead magnet (like "50 AI Email Swipes") and promote it heavily. Once you see conversions, create more lead magnets targeting different pain points.

---

Need help? Check the troubleshooting section or review the code comments in the component files.
