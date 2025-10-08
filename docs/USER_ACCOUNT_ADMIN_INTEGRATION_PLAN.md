# User Account Management - Admin Nexus Integration Plan

**Status**: Planning Phase
**Last Updated**: 2025-10-08
**Priority**: Medium

---

## Executive Summary

This document outlines the plan to integrate registered user account management into the Admin Nexus console (`/admin/secret`). Currently, two separate authentication systems exist with no connection between public user accounts and the admin console. This integration will provide administrators visibility and control over all registered users and their associated Business Brains.

---

## Current State Analysis

### Two Isolated Systems

#### 1. Public User Accounts (`/app/*`)
- **Authentication**: Supabase Auth (Google OAuth + email/password)
- **User Table**: `auth.users` (Supabase managed)
- **Login UI**: `src/components/auth/LoginModal.jsx`
- **Onboarding**: `src/components/auth/OnboardingFlow.jsx`
- **Business Brain**: Each user gets their own brain (`business_brains.user_id`)
- **Access Pattern**: User-scoped (users only see their own data)

#### 2. Admin Nexus Console (`/admin/secret`)
- **Authentication**: Session-based with 24-hour expiry
- **Login UI**: `src/admin/MatrixLogin.jsx`
- **Admin Table**: Custom admin credentials (not in database yet)
- **Team Management**: Manages `team_members` table (internal staff)
- **Business Brain Builder**: Shows ALL brains without user filtering
- **Access Pattern**: Admin-scoped (sees all site content)

### Key Isolation Points

```
┌─────────────────────────────────────────────────────────────┐
│  PUBLIC USERS                                                │
│  - auth.users table (Supabase managed)                       │
│  - business_brains.user_id references auth.users.id          │
│  - User authentication via Supabase Auth                     │
│  - Protected routes: /app/*                                  │
└─────────────────────────────────────────────────────────────┘
                          ↕ NO CONNECTION
┌─────────────────────────────────────────────────────────────┐
│  ADMIN NEXUS                                                 │
│  - Session-based authentication (in-memory only)             │
│  - No visibility into auth.users                             │
│  - team_members table (different from registered users)      │
│  - Business Brain Builder shows all brains (unfiltered)      │
│  - Protected routes: /admin/secret/*                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Goals

### Primary Objectives

1. **User Account Visibility**: View all registered users in Admin Nexus
2. **Business Brain Management**: Link each user to their Business Brain
3. **User Analytics**: Track user activity, brain health, content generation
4. **Account Administration**: Enable/disable accounts, reset passwords, manage permissions
5. **Unified Dashboard**: Single pane of glass for all user and content management

### Secondary Objectives

1. **User Impersonation** (optional): Admin ability to view app as specific user
2. **Usage Analytics**: Track AI tool usage per user
3. **Billing Integration** (future): Connect to subscription/payment system
4. **Support Tools**: Quick access to user details for customer support

---

## Proposed Architecture

### Database Schema Extensions

#### New Tables

**`admin_users`** - Store admin credentials separately from public users
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- RLS: Only accessible via service role
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

**`user_activity_log`** - Track user actions for analytics
```sql
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'content_generated', 'brain_updated', etc.
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity_log(created_at DESC);
```

**`user_analytics_summary`** - Pre-aggregated user stats (materialized view or table)
```sql
CREATE TABLE user_analytics_summary (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  brain_id UUID REFERENCES business_brains(id) ON DELETE SET NULL,
  total_logins INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  content_generated_count INTEGER DEFAULT 0,
  last_content_generated_at TIMESTAMPTZ,
  brain_health_score NUMERIC(3,2), -- 0.00 to 1.00
  total_facts INTEGER DEFAULT 0,
  subscription_tier TEXT, -- future: 'free', 'starter', 'pro', 'enterprise'
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table Modifications

**Extend `business_brains`** - Add admin-visible flags
```sql
ALTER TABLE business_brains
  ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN admin_notes TEXT,
  ADD COLUMN flagged_for_review BOOLEAN DEFAULT FALSE,
  ADD COLUMN flagged_reason TEXT;
```

### Authentication Flow Update

#### Current Admin Auth (Session-Based)
```javascript
// src/admin/MatrixLogin.jsx
// Hardcoded credentials or in-memory validation
// No database backing
```

#### Proposed Admin Auth (Database-Backed)
```javascript
// New: src/admin/api/admin-auth.js
import { supabaseAdmin } from '@/lib/supabase-client'
import bcrypt from 'bcryptjs'

export async function authenticateAdmin(email, password) {
  // Query admin_users table using service role
  const { data: admin } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  if (!admin) return null

  const isValid = await bcrypt.compare(password, admin.password_hash)
  if (!isValid) return null

  // Update last login
  await supabaseAdmin
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', admin.id)

  // Generate session token (JWT or session ID)
  return createAdminSession(admin)
}
```

---

## UI/UX Design

### New Admin Module: "User Accounts"

**Location**: `src/admin/modules/UserAccounts.jsx`

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  USER ACCOUNTS                                              │
│  Manage registered users and their Business Brains         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Search users...]  [Filter: All ▼]  [Sort: Recent ▼]      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STATS DASHBOARD                                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │ 1,234   │ │ 45      │ │ 89      │ │ 98.2%   │   │   │
│  │  │ Users   │ │ Active  │ │ Brains  │ │ Healthy │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  USER TABLE                                         │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  Email           | Joined    | Brain | Activity    │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  john@example.com| 2d ago    | ✅ L2  | [View]     │   │
│  │  jane@company.com| 5d ago    | ✅ L3  | [View]     │   │
│  │  bob@startup.io  | 1w ago    | ⚠️ L1  | [View]     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### User Detail Modal

```
┌─────────────────────────────────────────────────────────────┐
│  USER DETAILS - john@example.com                     [X]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  JOHN DOE                                │
│  │  [Avatar]    │  Joined: Jan 5, 2025                     │
│  │              │  Last Login: 2 hours ago                 │
│  └──────────────┘  Status: ✅ Active                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BUSINESS BRAIN                                     │   │
│  │  Name: Acme Corporation                             │   │
│  │  Level: 2 (Enhanced)                                │   │
│  │  Health: 85% (127 facts, 92% verified)             │   │
│  │  [View Brain Details] [Manage Brain]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ACTIVITY SUMMARY                                   │   │
│  │  Total Logins: 47                                   │   │
│  │  Content Generated: 23 posts                        │   │
│  │  Last Activity: Blog post generated (2h ago)        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ADMIN ACTIONS                                      │   │
│  │  [Reset Password] [Disable Account] [View as User] │   │
│  │  [Send Email] [Add Admin Note]                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Modified Admin Modules

#### Business Brain Builder Enhancement

**Before**: Shows all brains without user context
```javascript
// Current: Loads first brain or 'default' brain
const brains = await BusinessBrains.list()
const defaultBrain = brains.find(b => b.slug === 'default') || brains[0]
```

**After**: Show brain with user context
```javascript
// Enhanced: Shows user info alongside brain
const brains = await BusinessBrains.listWithUsers()
// Returns: [{ brain, user: { email, name, last_login } }]

// New filter: View specific user's brain
const userBrain = await BusinessBrains.getByUserId(userId)
```

#### Dashboard Overview Enhancement

Add "User Accounts" stats card:
```javascript
<div className="bg-slate-900/50 p-5 rounded-xl">
  <div className="text-xs text-slate-500 mb-1">REGISTERED USERS</div>
  <div className="text-2xl font-bold text-white">{stats.total_users}</div>
  <div className="text-xs text-slate-500 mt-1">
    {stats.active_users} active today
  </div>
</div>
```

---

## Implementation Phases

### Phase 1: Database Foundation (1-2 days)
- [ ] Create `admin_users` table with RLS policies
- [ ] Create `user_activity_log` table
- [ ] Create `user_analytics_summary` table/view
- [ ] Add admin columns to `business_brains`
- [ ] Write migration script: `supabase/migrations/20250108_admin_user_integration.sql`
- [ ] Create seed script for first admin user

### Phase 2: Admin Authentication Update (2-3 days)
- [ ] Create `src/admin/api/admin-auth.js` (database-backed auth)
- [ ] Update `src/admin/MatrixLogin.jsx` to use new auth system
- [ ] Implement admin session management (JWT or secure cookies)
- [ ] Add password hashing (bcryptjs)
- [ ] Create admin user setup script
- [ ] Migration path from current hardcoded auth

### Phase 3: User Accounts Module (3-4 days)
- [ ] Create `src/admin/modules/UserAccounts.jsx`
- [ ] User list view with search/filter/sort
- [ ] User detail modal
- [ ] User stats dashboard
- [ ] Link to Business Brain for each user
- [ ] Basic admin actions (view, disable, notes)

### Phase 4: Enhanced Business Brain Builder (1-2 days)
- [ ] Update `BusinessBrainBuilder.jsx` to show user context
- [ ] Add user filter dropdown
- [ ] Show user email/name alongside brain
- [ ] Link to user detail modal
- [ ] Add admin-only brain actions

### Phase 5: Analytics & Activity Tracking (2-3 days)
- [ ] Create activity logging utility
- [ ] Track user logins via Supabase auth hooks
- [ ] Track content generation events
- [ ] Track brain updates
- [ ] Create analytics aggregation job (cron or trigger)
- [ ] Build user analytics charts

### Phase 6: Admin Dashboard Enhancements (1 day)
- [ ] Add user stats to dashboard
- [ ] Create recent user activity feed
- [ ] Add quick links to user management

### Phase 7: Testing & Documentation (2 days)
- [ ] Test user account CRUD operations
- [ ] Test admin authentication flow
- [ ] Test user-brain linking
- [ ] Security audit (RLS policies, service role usage)
- [ ] Write admin user guide
- [ ] Update CLAUDE.md with new architecture

**Total Estimated Time**: 12-17 days

---

## Technical Specifications

### API Endpoints (Netlify Functions)

**Option A: Extend existing admin API**
```
src/admin/api/entities.ts
  - Add UserAccounts entity
  - Add enhanced BusinessBrains methods
```

**Option B: New admin-specific functions**
```
netlify/functions/admin/
  - user-accounts-list.ts
  - user-accounts-get.ts
  - user-accounts-update.ts
  - user-activity-log.ts
  - user-analytics.ts
```

### Data Access Patterns

#### Service Role Required
All admin user operations MUST use `supabaseAdmin` (service role client) to bypass RLS:
```javascript
import { supabaseAdmin } from '@/lib/supabase-client'

// ✅ Correct: Uses service role to access auth.users
const { data: users } = await supabaseAdmin.auth.admin.listUsers()

// ❌ Wrong: Regular client cannot access auth.users
const { data: users } = await supabase.auth.admin.listUsers() // Error
```

#### User List Query
```javascript
// Get all users with brain info
const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

const usersWithBrains = await Promise.all(
  users.map(async (user) => {
    const { data: brain } = await supabaseAdmin
      .from('business_brains')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: analytics } = await supabaseAdmin
      .from('user_analytics_summary')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return {
      user,
      brain,
      analytics
    }
  })
)
```

#### Activity Logging Pattern
```javascript
// Utility: src/lib/activity-logger.js
export async function logUserActivity(userId, activityType, metadata = {}) {
  await supabaseAdmin
    .from('user_activity_log')
    .insert({
      user_id: userId,
      activity_type: activityType,
      metadata
    })
}

// Usage in AI Content Writer
import { logUserActivity } from '@/lib/activity-logger'

async function generateContent(userId, prompt) {
  const result = await generateWithClaude(prompt)

  await logUserActivity(userId, 'content_generated', {
    tool: 'ai_content_writer',
    prompt_length: prompt.length,
    result_length: result.length
  })

  return result
}
```

---

## Security Considerations

### 1. Row Level Security (RLS)

**`admin_users` table**
- Only accessible via service role (no RLS policies for regular users)
- Admins cannot be queried by public users

**`user_activity_log` table**
- Users can view their own activity
- Admins can view all activity (via service role)

**`business_brains` table (existing)**
- Users can only access their own brain
- Admins can access all brains (via service role)

### 2. Admin Authentication

**Session Security**
- JWT tokens with short expiry (2 hours)
- HttpOnly cookies for token storage
- CSRF protection for admin routes
- Rate limiting on admin login endpoint

**Password Requirements**
- Minimum 12 characters
- Bcrypt hashing (cost factor 12)
- Password reset via secure email flow

### 3. Service Role Usage

**Critical Rules**
- Service role key NEVER exposed to client
- All admin operations through Netlify functions
- Environment variable protection (`VITE_` prefix forbidden for service role)

**Example: Secure admin function**
```javascript
// netlify/functions/admin/user-list.ts
import { createClient } from '@supabase/supabase-js'

export async function handler(event, context) {
  // Verify admin session
  const adminSession = verifyAdminToken(event.headers.authorization)
  if (!adminSession) return { statusCode: 401 }

  // Use service role (from Netlify env vars)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Server-side only
  )

  const { data: { users } } = await supabase.auth.admin.listUsers()

  return {
    statusCode: 200,
    body: JSON.stringify(users)
  }
}
```

### 4. Audit Logging

Track all admin actions:
```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL, -- 'user_disabled', 'brain_edited', 'password_reset'
  target_user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Future Enhancements

### Subscription & Billing Integration
- Link user accounts to Stripe/Paddle subscriptions
- Track usage limits per tier
- Automated tier enforcement
- Billing history in user detail view

### User Impersonation
- "View as User" feature for support
- Audit log of all impersonation sessions
- Restricted to super_admin role only

### Advanced Analytics
- User cohort analysis (retention, activation)
- Brain health trends over time
- AI tool usage patterns
- Content generation metrics

### Multi-Admin Roles
- **Super Admin**: Full access, can create other admins
- **Admin**: Manage users and content, cannot create admins
- **Moderator**: View-only access, cannot modify

### Email Communications
- Password reset emails
- Welcome emails
- Usage notifications
- Admin announcements

---

## Migration Strategy

### Existing Users
1. No migration needed - `auth.users` table already exists
2. `business_brains.user_id` already references `auth.users.id`
3. Create analytics summary for existing users (backfill)

### Admin Transition
1. Create first admin user via script
2. Migrate existing hardcoded admin credentials
3. Deprecate MatrixLogin hardcoded auth
4. Update admin session management

### Zero-Downtime Deployment
1. Deploy database migrations first
2. Deploy new admin auth alongside old (feature flag)
3. Test new admin auth
4. Switch feature flag to new system
5. Remove old auth code

---

## Success Metrics

### Functional Requirements
- [ ] Admin can view all registered users
- [ ] Admin can see each user's Business Brain
- [ ] Admin can track user activity
- [ ] Admin can disable/enable accounts
- [ ] User analytics dashboard shows real-time data
- [ ] Admin authentication is database-backed and secure

### Performance Requirements
- User list loads in < 2 seconds (up to 10,000 users)
- User detail modal loads in < 500ms
- Analytics aggregation runs nightly (off-peak)

### Security Requirements
- All admin operations use service role securely
- Admin authentication uses industry-standard practices
- Audit log captures all admin actions
- RLS policies prevent unauthorized access

---

## Open Questions

1. **Admin User Creation**: How should the first admin be created? (Script, CLI, manual database insert?)
2. **Password Reset**: Email-based or admin-initiated?
3. **User Deletion**: Hard delete or soft delete (mark inactive)?
4. **Activity Retention**: How long to keep activity logs? (30 days, 90 days, forever?)
5. **Real-time Updates**: Should admin dashboard update in real-time (websockets) or poll?
6. **Export Functionality**: Should admins be able to export user lists to CSV?

---

## References

### Related Documentation
- `docs/AUTHENTICATION_SYSTEM.md` - Public user authentication
- `docs/BUSINESS_BRAIN_COMPLETE_SYSTEM.md` - Business Brain architecture
- `docs/ADMIN_NEXUS_INTEGRATION_REPORT.md` - Admin console overview
- `CLAUDE.md` - Project architecture overview

### Related Code Files
- `src/components/auth/LoginModal.jsx` - Public user login
- `src/components/auth/OnboardingFlow.jsx` - User registration flow
- `src/admin/MatrixLogin.jsx` - Current admin login
- `src/admin/modules/BusinessBrainBuilder.jsx` - Brain management
- `src/admin/modules/TeamManagement.jsx` - Team member management
- `src/lib/supabase-client.js` - Database clients

### Database Schema
- `supabase/migrations/20250107_business_brain_infrastructure.sql` - Brain tables
- `auth.users` - Supabase managed auth table

---

**Document Version**: 1.0
**Next Review**: Before Phase 1 implementation begins
**Owner**: Development Team
