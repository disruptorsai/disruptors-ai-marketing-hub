# Disruptors Connect - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Add the Golden Eye Logo
```bash
# Place your golden eye banner logo here:
public/logos/golden-eye-banner.png

# If the file doesn't exist, the Welcome screen will show a broken image
```

### Step 2: Apply the Database Migration
**Option A: Supabase Dashboard (Easiest)**
1. Go to your Supabase project → SQL Editor
2. Open `supabase/migrations/20251022_disruptors_connect.sql`
3. Copy all the SQL
4. Paste into SQL Editor
5. Click "Run"

**Option B: Supabase CLI**
```bash
supabase db push
```

### Step 3: Start the Dev Server
```bash
# Start with Netlify Functions enabled
npm run dev:netlify

# Open in browser
http://localhost:8888/connect
```

### Step 4: Test the Flow
1. **Welcome Screen**: Click "Tap to Check In"
2. **Intake Form**: Fill in your info (name, phone, email)
3. **Poll**: Answer 7 AI questions
4. **Success**: See your check-in confirmation + AI match suggestions

---

## 🔍 Troubleshooting

### Issue: "Supabase client not found" error
**Fix**: Make sure your `.env` has:
```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Issue: "Cannot read properties of undefined" in Zustand store
**Fix**: This happens if the store isn't initialized. Restart your dev server.

### Issue: Logo not showing on Welcome screen
**Fix**: Make sure the logo file exists at `/public/logos/golden-eye-banner.png`

### Issue: Netlify Functions return 404
**Fix**: Make sure you're using `npm run dev:netlify` (not just `npm run dev`)

### Issue: AI match suggestions don't show
**Fix**: This is normal if there are no other attendees yet. Check-in a few test users first.

---

## 📱 Mobile Testing

The mobile handoff feature works like this:
1. On kiosk, a QR code is displayed on the Welcome screen
2. User scans QR with their phone
3. Opens `/connect/checkin?source=mobile&kiosk=kiosk-001`
4. Same flow on their phone
5. Data syncs to the same database

To test:
1. Open kiosk on your computer: `http://localhost:8888/connect`
2. Scan the QR with your phone (or manually type the URL)
3. Complete check-in on your phone
4. See the data in Supabase dashboard

---

## 🗄️ Database Quick Reference

**Tables Created:**
- `connect_events` - Event metadata
- `connect_kiosks` - Kiosk tracking
- `connect_contacts` - Contact PII
- `connect_attendances` - Check-ins
- `connect_poll_responses` - Anonymous polls
- `connect_classifications` - AI personas
- `connect_audit_logs` - Audit trail

**View Data:**
```sql
-- See all check-ins for the event
SELECT
  c.first_name,
  c.last_name,
  c.phone,
  a.checked_in_at,
  a.source
FROM connect_attendances a
JOIN connect_contacts c ON c.id = a.contact_id
WHERE a.event_id = 'connect-2025-10'
ORDER BY a.checked_in_at DESC;

-- See poll results (anonymous)
SELECT
  q1_experience,
  COUNT(*)
FROM connect_poll_responses
GROUP BY q1_experience;
```

---

## 🚀 Deploy to Production

### Step 1: Build and Deploy
```bash
# Build the app
npm run build

# Deploy to Netlify (if auto-deploy enabled)
git push origin main

# Or manual deploy
npm run deploy:prod
```

### Step 2: Kiosk Setup (iPad/Android)
**iPad:**
1. Open Safari → Navigate to `https://yourdomain.com/connect`
2. Add to Home Screen
3. Open the app from home screen
4. Enable Guided Access: Settings → Accessibility → Guided Access
5. Triple-click home button → Start Guided Access

**Android:**
1. Open Chrome → Navigate to `https://yourdomain.com/connect`
2. Menu → Add to Home Screen
3. Open the app
4. Enable Screen Pinning: Settings → Security → Screen Pinning
5. Recent apps → Pin the app

---

## 📊 Viewing Real-Time Data

**Supabase Dashboard:**
1. Go to your project → Table Editor
2. Select `connect_attendances` to see check-ins
3. Select `connect_poll_responses` to see anonymous polls
4. Select `connect_contacts` to see attendee info

**Export Data:**
```sql
-- Export all attendees for the event
COPY (
  SELECT
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.company,
    a.checked_in_at
  FROM connect_attendances a
  JOIN connect_contacts c ON c.id = a.contact_id
  WHERE a.event_id = 'connect-2025-10'
) TO '/tmp/attendees.csv' WITH CSV HEADER;
```

---

## 🎨 Customization

### Change Event Details
Edit the welcome screen: `src/pages/connect/Welcome.jsx`
```jsx
// Line 69-71
<p className="text-xl text-gray-300">
  North Salt Lake Event Hall
</p>

// Change to:
<p className="text-xl text-gray-300">
  Your Venue Name Here
</p>
```

### Change Wi-Fi Credentials
```jsx
// Line 107-113
<span className="text-lg">
  Wi-Fi: <span className="text-white font-semibold">DisruptorsEventHall</span>
  {' / '}
  Password: <span className="text-white font-semibold">Disrupt2025</span>
</span>
```

### Change Poll Questions
Edit: `src/pages/connect/Poll.jsx` lines 8-47

---

## 📞 Need Help?

**Documentation:**
- Full Spec: `docs/DISRUPTORS_CONNECT_IMPLEMENTATION_SPEC.md`
- Build Summary: `docs/CONNECT_BUILD_SUMMARY.md`

**Common Issues:**
- Database errors → Check migration applied correctly
- Routing errors → Ensure routes added to `src/pages/index.jsx`
- API errors → Check Netlify Functions logs
- UI errors → Check browser console for details

---

**Ready to go!** Visit `http://localhost:8888/connect` to see your kiosk in action.
