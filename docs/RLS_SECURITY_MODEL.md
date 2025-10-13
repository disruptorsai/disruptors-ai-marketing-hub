# Row Level Security (RLS) Model - Visual Guide

This document provides a visual understanding of how Row Level Security works in the Disruptors AI Marketing Hub.

---

## Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                        │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Browser   │  │  Netlify    │  │   Admin Operations     │ │
│  │   (React)   │  │  Functions  │  │   (Service Role)       │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │                │
└─────────┼────────────────┼──────────────────────┼────────────────┘
          │                │                      │
          │ Anon Key       │ Anon Key             │ Service Role Key
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE POSTGRESQL                         │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Public    │  │  User with  │  │   Full Access          │ │
│  │   Content   │  │  Auth Token │  │   (Bypasses RLS)       │ │
│  │   Only      │  │  (RLS Check)│  │                        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                   │
│  RLS Policies:                                                   │
│  ✓ Users can only SELECT/UPDATE their own profile              │
│  ✓ Users can only access their own Business Brains             │
│  ✓ Published posts are public, drafts are private              │
│  ✓ Module runs are private to each user                        │
│  ✓ Service role bypasses ALL policies                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow with RLS

### 1. User Login Flow
```
User enters credentials
         │
         ▼
Supabase Auth validates
         │
         ▼
JWT token generated (contains user ID)
         │
         ▼
Token stored in browser
         │
         ▼
All API calls include token
         │
         ▼
RLS policies check: auth.uid() = user_id
         │
         ├─ Match? → Allow access
         └─ No match? → Deny access
```

### 2. Service Role Flow (Admin Operations)
```
Netlify Function executes
         │
         ▼
Uses service role key
         │
         ▼
RLS policies automatically BYPASSED
         │
         ▼
Full database access granted
         │
         ▼
Operation completes
```

---

## RLS Policy Examples

### Example 1: Users Table

**Without RLS (CURRENT - INSECURE):**
```sql
-- Any authenticated user can read ANY user's data
SELECT * FROM users;  -- Returns ALL users 🚨

-- Any authenticated user can modify ANY user's data
UPDATE users SET role = 'admin' WHERE email = 'victim@example.com';  -- Works! 🚨
```

**With RLS (AFTER FIX - SECURE):**
```sql
-- User can only see their own profile
SELECT * FROM users;  -- Returns only current user's row ✅

-- User can only modify their own profile
UPDATE users SET role = 'admin' WHERE email = 'victim@example.com';  -- Blocked! ✅
UPDATE users SET full_name = 'New Name' WHERE id = auth.uid();  -- Allowed ✅
```

**Policy Implementation:**
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

### Example 2: Business Brains Table

**Security Model:**
```
User A (ID: abc-123)
  └─ Can access business_brains WHERE organization_id = 'abc-123'
  └─ CANNOT access business_brains WHERE organization_id = 'xyz-789'

User B (ID: xyz-789)
  └─ Can access business_brains WHERE organization_id = 'xyz-789'
  └─ CANNOT access business_brains WHERE organization_id = 'abc-123'

Service Role
  └─ Can access ALL business_brains (bypasses RLS)
```

**Policy Implementation:**
```sql
-- Enable RLS
ALTER TABLE business_brains ENABLE ROW LEVEL SECURITY;

-- Users can view own business brains
CREATE POLICY "Users can view own business brains"
  ON business_brains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.id = business_brains.organization_id
    )
  );
```

---

### Example 3: Posts Table (Mixed Public/Private)

**Security Model:**
```
Published Posts
  └─ Readable by EVERYONE (authenticated + anonymous)
  └─ Editable only by author

Draft Posts
  └─ Readable only by author
  └─ Editable only by author
  └─ NOT visible to public
```

**Policy Implementation:**
```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- Authors can view own draft posts
CREATE POLICY "Users can view own draft posts"
  ON posts FOR SELECT
  USING (
    status = 'draft'
    AND created_by = auth.uid()
  );

-- Authors can update own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
```

---

## Data Access Matrix

### Before RLS (CURRENT STATE)

| Table | Anonymous | Authenticated User | Service Role |
|-------|-----------|-------------------|--------------|
| `users` | ❌ No access | 🚨 **ALL users** | ✅ All users |
| `business_brains` | ❌ No access | 🚨 **ALL brains** | ✅ All brains |
| `brain_assets` | ❌ No access | 🚨 **ALL assets** | ✅ All assets |
| `posts` | ❌ No access | 🚨 **ALL posts** | ✅ All posts |
| `module_runs` | ❌ No access | 🚨 **ALL runs** | ✅ All runs |

🚨 = **SECURITY VULNERABILITY**

### After RLS (SECURE STATE)

| Table | Anonymous | Authenticated User | Service Role |
|-------|-----------|-------------------|--------------|
| `users` | ❌ No access | ✅ Own profile only | ✅ All users |
| `business_brains` | ❌ No access | ✅ Own brains only | ✅ All brains |
| `brain_assets` | ❌ No access | ✅ Own assets only | ✅ All assets |
| `posts` | ✅ Published only | ✅ Published + own drafts | ✅ All posts |
| `module_runs` | ⚠️ Public modules only | ✅ Own runs only | ✅ All runs |
| `services` | ✅ Active only | ✅ All services | ✅ All services |
| `team_members` | ✅ All | ✅ All | ✅ All |
| `site_media` | ✅ All | ✅ All | ✅ All |

✅ = Properly secured

---

## Testing RLS Policies

### Manual Testing Steps

**1. Test as Authenticated User**
```javascript
// Login as user
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
})

// Try to access own data (should work)
const { data: ownBrain } = await supabase
  .from('business_brains')
  .select('*')
  .eq('organization_id', user.id)
// ✅ Returns own brain

// Try to access another user's data (should fail)
const { data: otherBrain } = await supabase
  .from('business_brains')
  .select('*')
  .eq('organization_id', 'some-other-user-id')
// ✅ Returns empty array (policy blocks access)
```

**2. Test as Anonymous User**
```javascript
// No authentication
const { data: posts } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
// ✅ Returns published posts only

const { data: users } = await supabase
  .from('users')
  .select('*')
// ✅ Returns empty array (no access)
```

**3. Test Service Role (Admin)**
```javascript
// Using service role client
const { data: allBrains } = await supabaseAdmin
  .from('business_brains')
  .select('*')
// ✅ Returns ALL brains (bypasses RLS)
```

---

## Common RLS Patterns

### Pattern 1: Own Records Only
```sql
-- User can only access records where user_id matches their ID
CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  USING (user_id = auth.uid());
```

### Pattern 2: Own Records via Foreign Key
```sql
-- User can only access records through relationship
CREATE POLICY "policy_name"
  ON child_table FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_table
      WHERE parent_table.id = child_table.parent_id
      AND parent_table.user_id = auth.uid()
    )
  );
```

### Pattern 3: Public Read, Own Write
```sql
-- Anyone can read, only owner can modify
CREATE POLICY "public_read"
  ON table_name FOR SELECT
  USING (TRUE);

CREATE POLICY "owner_write"
  ON table_name FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Pattern 4: Conditional Access
```sql
-- Different access based on status
CREATE POLICY "published_public"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "draft_owner_only"
  ON posts FOR SELECT
  USING (
    status = 'draft'
    AND created_by = auth.uid()
  );
```

---

## Debugging RLS Issues

### Check if RLS is Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'your_table_name';
```

### List All Policies for a Table
```sql
SELECT *
FROM pg_policies
WHERE tablename = 'your_table_name';
```

### Test Policy Logic
```sql
-- Set role to authenticated user
SET ROLE authenticated;
SET request.jwt.claim.sub TO 'user-id-here';

-- Run query (should respect RLS)
SELECT * FROM business_brains;

-- Reset role
RESET ROLE;
```

### Temporarily Disable RLS (Testing Only)
```sql
-- Disable (use with caution!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## Best Practices

### DO ✅
- Always enable RLS on user data tables
- Test policies with multiple user accounts
- Use service role only in backend functions
- Verify auth.uid() returns expected value
- Create separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- Use descriptive policy names

### DON'T ❌
- Never expose service role key client-side
- Don't create overly permissive policies (USING TRUE for sensitive data)
- Don't forget to test edge cases
- Don't disable RLS in production
- Don't create policies that allow users to escalate privileges

---

## Performance Considerations

### Efficient Policy Design
```sql
-- GOOD: Uses index
CREATE POLICY "efficient_policy"
  ON table_name FOR SELECT
  USING (user_id = auth.uid());  -- user_id is indexed

-- BAD: Complex subquery on every row
CREATE POLICY "slow_policy"
  ON table_name FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM complex_view WHERE expensive_calculation = true
    )
  );
```

### Index Requirements
```sql
-- Always index columns used in RLS policies
CREATE INDEX idx_table_user_id ON table_name(user_id);
CREATE INDEX idx_table_status ON table_name(status);  -- If filtering by status
```

---

## Migration Strategy

### Current State → Secure State

**Phase 1: Apply RLS (5 minutes)**
```bash
# Apply comprehensive RLS script
# Via Supabase Dashboard > SQL Editor
# Copy/paste: scripts/enable-rls-policies.sql
```

**Phase 2: Verify (1 minute)**
```bash
# Run health check
npm run db:health

# Expected:
# - RLS Enabled: 10/10 ✅
# - Overall Health: GOOD ✅
```

**Phase 3: Test (10 minutes)**
1. Create test user account
2. Verify can access own data
3. Verify CANNOT access other user's data
4. Test public content accessible
5. Test service role operations still work

**Phase 4: Monitor (Ongoing)**
- Watch for permission errors in app
- Monitor query performance
- Review RLS policy effectiveness

---

## Support & Troubleshooting

### Common Issues

**Issue: "permission denied for table"**
- Cause: Policy too restrictive or missing
- Fix: Review policy logic, ensure auth.uid() is set

**Issue: Slow queries after enabling RLS**
- Cause: Missing indexes on policy columns
- Fix: Run provided index creation (in RLS script)

**Issue: Service role operations failing**
- Cause: Using wrong client (supabase vs supabaseAdmin)
- Fix: Use supabaseAdmin for admin operations

**Issue: Users can't access their own data**
- Cause: organization_id vs user_id mismatch
- Fix: Verify foreign key relationships in policies

---

## References

- **Official Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL RLS Docs:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Implementation Script:** `/scripts/enable-rls-policies.sql`
- **Health Check:** `npm run db:health`

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Status:** Ready for implementation
