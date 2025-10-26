# Change Requests System Setup Guide

## Overview

The Change Requests system is a comprehensive tracking tool for managing all website change requests. It provides a centralized location for team members to submit change requests and for admins to track their lifecycle from submission to completion.

## Features

### ✅ Submission Form
- Requester name (required)
- Requester email (optional)
- Detailed change description (required)
- Priority levels: Low, Medium, High, Urgent
- Categories: Bug Fix, Feature, Content Change, Design Change, Performance, Security, Other

### ✅ Request Management
- **Status tracking**: Pending, Approved, In Progress, Completed, Rejected
- **Real-time stats dashboard**: Total, Pending, Approved, In Progress, Completed, Rejected
- **Filtering**: By status, priority, and category
- **Search**: Search across all fields (name, email, description, notes)
- **CSV Export**: Download all requests for reporting

### ✅ Lifecycle Management
- Automatic timestamps (created_at, updated_at, approved_at, completed_at)
- Track who approved and completed requests
- Add notes to requests for additional context

## Installation

### Step 1: Apply Database Migration

#### Option A: Automatic (Recommended)

```bash
# Make sure your environment variables are set
export VITE_SUPABASE_URL=your_supabase_url
export VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the migration script
node scripts/apply-change-requests-migration.js
```

#### Option B: Manual (If automatic fails)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20250126_change_requests.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**

### Step 2: Verify Installation

```bash
node scripts/verify-change-requests-table.js
```

You should see:
```
✅ Table exists
✅ Table is accessible
✅ Current records: 0
🎉 Change Requests table is properly configured!
```

### Step 3: Access the System

1. Navigate to your admin panel: `/admin/secret`
2. Click on the **Change Requests** tab (clipboard icon)
3. You're ready to start tracking change requests!

## Usage

### Submitting a New Request

1. Click the **"New Request"** button (green button, top right)
2. Fill in the form:
   - **Your Name**: Required - enter your full name
   - **Your Email**: Optional - for follow-up
   - **Change Description**: Required - detailed description of the change
   - **Priority**: Select urgency level (Low, Medium, High, Urgent)
   - **Category**: Select change type (Bug Fix, Feature, Content Change, etc.)
3. Click **"Submit Request"**

### Managing Requests

#### Filter Requests
- Use the search bar to find specific requests
- Filter by **Status**: All, Pending, Approved, In Progress, Completed, Rejected
- Filter by **Priority**: All, Low, Medium, High, Urgent
- Filter by **Category**: All, Bug Fix, Feature, Content Change, etc.

#### Update Request Status
- Click the status dropdown in the **Actions** column
- Select new status: Pending → Approved → In Progress → Completed
- Or select **Rejected** to decline a request
- Timestamps are automatically updated

#### Export to CSV
- Click the **"Export CSV"** button (top right of table)
- Downloads all requests with full details
- Filename includes current date: `change_requests_YYYY-MM-DD.csv`

## Database Schema

```sql
change_requests (
  id UUID PRIMARY KEY,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  change_description TEXT NOT NULL,
  status TEXT (pending, approved, in_progress, completed, rejected),
  priority TEXT (low, medium, high, urgent),
  category TEXT (bug_fix, feature, content_change, design_change, performance, security, other),
  notes TEXT,
  approved_by TEXT,
  completed_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
```

### Indexes
- `idx_change_requests_status` - Fast status filtering
- `idx_change_requests_priority` - Fast priority filtering
- `idx_change_requests_category` - Fast category filtering
- `idx_change_requests_created_at` - Sorted by date
- `idx_change_requests_requester` - Search by requester name

### Row Level Security (RLS)
- Service role has full access
- Authenticated users can view (for potential future integration with public user accounts)

## Integration with Admin Panel

The Change Requests Manager is integrated into the Disruptors Admin panel as a new tab:

**Location**: `/admin/secret` → **Change Requests** tab

**File Structure**:
```
src/components/admin/
├── ChangeRequestsManager.jsx   # Main component
├── DisruptorsAdmin.jsx          # Updated with new tab

supabase/migrations/
└── 20250126_change_requests.sql # Database migration

scripts/
├── apply-change-requests-migration.js    # Auto-apply migration
└── verify-change-requests-table.js       # Verify installation
```

## Workflow Example

### Typical Change Request Lifecycle

1. **Submission** (Team Member)
   - Jane from marketing submits: "Update hero section copy to include new tagline"
   - Priority: Medium
   - Category: Content Change
   - Status: Pending

2. **Approval** (Admin)
   - Admin reviews request
   - Changes status to: Approved
   - System records: approved_at timestamp

3. **Development** (Developer)
   - Developer starts work
   - Changes status to: In Progress

4. **Completion** (Developer)
   - Change is deployed
   - Changes status to: Completed
   - System records: completed_at timestamp

5. **Tracking** (Admin)
   - Export CSV for monthly reporting
   - Filter by completed to see all finished requests
   - Track metrics via stats dashboard

## Troubleshooting

### Migration Fails

If automatic migration fails:
1. Use the manual migration steps (Option B above)
2. Check Supabase dashboard for error messages
3. Verify your service role key has proper permissions

### Table Not Accessible

If you see permission errors:
1. Verify RLS policies are applied
2. Check you're using the service role key (not anon key)
3. Run verification script: `node scripts/verify-change-requests-table.js`

### Component Not Showing

If the Change Requests tab doesn't appear:
1. Check browser console for errors
2. Verify import in `DisruptorsAdmin.jsx`:
   ```javascript
   import ChangeRequestsManager from './ChangeRequestsManager';
   ```
3. Clear browser cache and reload

## Future Enhancements

Potential features for future development:
- Email notifications when requests are approved/completed
- Comments/discussion threads on requests
- File attachments for mockups/screenshots
- Integration with public user accounts
- Webhook notifications to Slack/Discord
- Auto-assignment based on category
- Due dates and SLA tracking

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all steps in this guide were completed
3. Review browser console for error messages
4. Check Supabase dashboard logs

## Summary

The Change Requests system provides a professional, enterprise-grade solution for tracking website changes. It ensures:
- ✅ All changes are recorded and tracked
- ✅ Clear accountability with timestamps and assignees
- ✅ Easy filtering and searching
- ✅ Professional workflow management
- ✅ Data export for reporting

**Access**: `/admin/secret` → Change Requests tab

**Status**: Ready for production use after migration is applied.
