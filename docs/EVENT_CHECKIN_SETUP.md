# Event Check-in System Setup Guide

Complete event check-in and survey system for tracking event attendees.

## ✅ What's Been Built

1. **Database Migration** - `supabase/migrations/20250126_event_checkins.sql`
   - `event_checkins` table with survey responses in JSONB format
   - Proper indexes and RLS policies
   - Public insert access for check-in form

2. **Public Check-in Page** - `/event-checkin`
   - Beautiful branded check-in form
   - Survey questions with multiple-choice and text responses
   - Success confirmation screen
   - Accessible at: http://localhost:5173/event-checkin

3. **Admin Dashboard** - `/admin/secret` → Submissions tab
   - New "Event Check-ins" tab (first tab, default view)
   - View all attendee information
   - Export to CSV
   - Detailed survey responses
   - Real-time stats

4. **Migration Script** - `scripts/apply-event-checkins-migration.js`

## 🚀 Setup Instructions

### Step 1: Apply Database Migration

The migration must be applied manually via Supabase SQL Editor:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/20250126_event_checkins.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: ✅ Success. No rows returned

### Step 2: Verify Migration

Run this query in the SQL Editor to verify:

\`\`\`sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'event_checkins'
ORDER BY ordinal_position;
\`\`\`

You should see columns:
- id (uuid)
- full_name (text)
- email (text)
- company (text)
- phone (text)
- job_title (text)
- event_name (text)
- checked_in_at (timestamptz)
- survey_responses (jsonb)
- referral_source (text)
- notes (text)
- created_at (timestamptz)
- updated_at (timestamptz)

### Step 3: Test the System

1. **Test Check-in Form**:
   - Visit http://localhost:5173/event-checkin
   - Fill out the form with test data
   - Complete the survey questions
   - Click "Complete Check-in"
   - Should see success message

2. **View in Admin Panel**:
   - Visit http://localhost:5173/admin/secret
   - Login with admin credentials
   - Click "Submissions" tab
   - Should see "Event Check-ins" tab (default view)
   - Your test check-in should appear in the table

3. **Export Test**:
   - Click "Export CSV" button
   - Should download CSV with all check-in data

## 📊 Database Schema

### event_checkins Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| full_name | TEXT | Attendee name (required) |
| email | TEXT | Attendee email (required) |
| company | TEXT | Company name |
| phone | TEXT | Phone number |
| job_title | TEXT | Job title |
| event_name | TEXT | Event name (default: 'Disruptors Event') |
| checked_in_at | TIMESTAMPTZ | Check-in timestamp |
| survey_responses | JSONB | Survey answers (flexible structure) |
| referral_source | TEXT | How they heard about event |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### Survey Responses Structure (JSONB)

\`\`\`json
{
  "primary_interest": "Looking to improve our marketing",
  "current_challenges": "Lead generation and brand visibility",
  "services_interested": [
    "AI-Powered Marketing",
    "SEO & Content Strategy"
  ],
  "follow_up_interest": "yes",
  "additional_comments": "Would love to discuss automation"
}
\`\`\`

## 🎯 Features

### Check-in Form Features
- ✅ Required fields (name, email)
- ✅ Optional fields (company, phone, job title)
- ✅ Referral source tracking
- ✅ Multi-question survey
- ✅ Multiple-choice services
- ✅ Follow-up interest toggle
- ✅ Additional comments
- ✅ Success confirmation
- ✅ Check-in another person option

### Admin Dashboard Features
- ✅ View all check-ins with full details
- ✅ Search by any field
- ✅ Export to CSV
- ✅ Stats dashboard (total attendees)
- ✅ Detailed survey responses view
- ✅ Follow-up interest indicators
- ✅ Services interested badges
- ✅ Referral source tracking

## 🔒 Security (RLS Policies)

1. **Service Role** (admin panel): Full access to all data
2. **Anonymous Users** (public form): INSERT only
3. **Authenticated Users**: Can view their own check-ins

## 📱 Usage

### For Event Staff
1. Share the check-in URL: https://yourdomain.com/event-checkin
2. Display QR code at event entrance
3. Monitor check-ins in real-time via admin panel
4. Export attendee list for follow-up

### For Marketing Team
1. Review survey responses in admin panel
2. Identify services of interest
3. Export data for CRM import
4. Filter by follow-up interest
5. Track referral sources

## 🎨 Customization

### Change Event Name
Edit `src/pages/event-checkin.jsx` line 66:
\`\`\`javascript
event_name: 'Your Custom Event Name'
\`\`\`

### Customize Survey Questions
Edit `src/pages/event-checkin.jsx` starting at line 287 (Services array) and the survey section.

### Modify Services List
Edit the `services` array in `event-checkin.jsx`:
\`\`\`javascript
const services = [
  'Your Service 1',
  'Your Service 2',
  // Add more services
];
\`\`\`

## 🚀 Next Steps

After migration is applied:

1. Test the check-in flow end-to-end
2. Customize survey questions for your event
3. Generate QR code for check-in URL
4. Set up email notifications (optional)
5. Configure CRM integration (optional)

## 📞 Support

If you encounter any issues:
1. Check Supabase SQL Editor for error details
2. Verify RLS policies are enabled
3. Check browser console for errors
4. Verify environment variables are set

## 🎉 You're Ready!

Your event check-in system is now complete. Visit:
- **Public Form**: http://localhost:5173/event-checkin
- **Admin View**: http://localhost:5173/admin/secret → Submissions tab

Enjoy your event! 🎊
