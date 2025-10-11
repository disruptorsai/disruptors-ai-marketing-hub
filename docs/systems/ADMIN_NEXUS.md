# Admin Nexus System

## Overview

Admin Nexus is a comprehensive admin console for managing site content, team members, and AI operations. It's designed for internal staff only and is completely separate from the public user accounts system.

## Critical Information

### System Isolation

**Admin Nexus and Public User Accounts are SEPARATE, ISOLATED SYSTEMS:**

- **Public users** (`/app/*`) - Use Supabase Auth (Google OAuth + email/password), each with own Business Brain
- **Admin console** (`/admin/secret`) - Uses session-based auth, manages site content and team members (internal staff)
- **No integration** exists between systems - admins cannot view/manage registered user accounts or their brains
- **Team Management module** manages `team_members` table (site staff), NOT `auth.users` table (registered users)
- **Future integration planned** - See `docs/USER_ACCOUNT_ADMIN_INTEGRATION_PLAN.md`

## Secret Access Pattern

Admin access is activated through secret patterns to prevent unauthorized discovery:

### Access Methods

1. **Logo Click Pattern** - Click logo 5 times within 3 seconds
2. **Keyboard Shortcut** - Press `Ctrl+Shift+D`
3. **Emergency Exit** - Press `Ctrl+Shift+Escape` to quickly exit admin mode

### Login Interface

- **Matrix-style login** - Visually distinctive admin interface
- **Session-based authentication** - 24-hour expiry
- **No registration** - Admin accounts created manually by database admin
- **Secure route** - `/admin/secret` route only accessible after authentication

## Admin Modules

### Implemented Modules (6)

#### 1. Dashboard Overview
- **Purpose**: System stats, activity monitoring, health checks
- **Features**:
  - Real-time statistics
  - Recent activity feed
  - System health indicators
  - Quick actions
- **File**: `src/admin/modules/DashboardOverview.jsx`

#### 2. Content Management
- **Purpose**: AI-powered post editor with blog management
- **Features**:
  - Blog post CRUD operations
  - AI content generation (AutoBlog)
  - Keyword research integration
  - Publish/draft management
- **File**: `src/admin/modules/ContentManagement.jsx`

#### 3. Team Management
- **Purpose**: Role-based permissions, team member profiles
- **Features**:
  - Manage `team_members` table (internal staff)
  - Role assignment
  - Profile management
  - Activity tracking
- **File**: `src/admin/modules/TeamManagement.jsx`
- **Note**: Does NOT manage public user accounts

#### 4. Media Library
- **Purpose**: Asset catalog with AI image tracking
- **Features**:
  - Image upload and management
  - AI-generated image tracking
  - Asset organization
  - Usage analytics
- **File**: `src/admin/modules/MediaLibrary.jsx`

#### 5. Business Brain Builder
- **Purpose**: Knowledge base with fact extraction and onboarding
- **Features**:
  - Business Brain creation/editing
  - Fact management
  - AI onboarding conversations
  - Brand asset management
- **File**: `src/admin/modules/BusinessBrainBuilder.jsx`

#### 6. Agent Chat
- **Purpose**: Interactive AI agent conversations
- **Features**:
  - Chat with AI agents
  - Agent training
  - Conversation history
  - Context management
- **File**: `src/admin/modules/AgentChat.jsx`

### Stub Modules (5)

Placeholder modules for future development:

#### 7. Agent Builder
- **Purpose**: AI agent creation and training interface
- **Status**: Stub placeholder
- **Future**: Full agent configuration and training

#### 8. Brand DNA Builder
- **Purpose**: Brand voice and style configuration
- **Status**: Stub placeholder
- **Future**: Complete brand identity management

#### 9. Workflow Manager
- **Purpose**: Automation pipeline designer
- **Status**: Stub placeholder
- **Future**: Visual workflow builder

#### 10. Integrations Hub
- **Purpose**: Third-party service connections
- **Status**: Stub placeholder
- **Future**: API key management, webhook configuration

#### 11. Telemetry Dashboard
- **Purpose**: System monitoring and analytics
- **Status**: Stub placeholder
- **Future**: Real-time telemetry, performance metrics

## Architecture

### Zero-Impact Public Site Integration

- **Single route guard** in `App.jsx` - Only modification to public site
- **Lazy-loaded modules** - No impact on public site bundle size
- **Separate routing** - Admin routes completely isolated
- **No shared state** - Admin and public systems don't share data

### Dual Authentication Contexts

```javascript
// Public authentication (Supabase Auth)
import { supabase } from '@/lib/supabase-client'

// Admin authentication (session-based)
import { adminAuth } from '@/admin/auth'
```

### TypeScript API Layer

Admin system uses TypeScript for type safety:

- **API Layer**: `src/admin/api/` - TypeScript API methods
- **Public API**: `src/lib/` - JavaScript preserved for compatibility
- **Type Definitions**: Full type coverage for admin operations

### Session-Based Auth

```javascript
// 24-hour session expiry
const SESSION_DURATION = 24 * 60 * 60 * 1000

// Session stored in localStorage
localStorage.setItem('admin_session', JSON.stringify({
  token: sessionToken,
  expiresAt: Date.now() + SESSION_DURATION
}))
```

## Database Tables

### Admin-Specific Tables

Created by Admin Nexus system (not yet applied):

1. `admin_users` - Admin account information
2. `admin_sessions` - Session management
3. `admin_audit_log` - Admin action logging
4. `telemetry_events` - System monitoring data

### Shared Tables (Admin Manages)

1. `team_members` - Internal staff profiles (NOT public users)
2. `posts` - Blog posts and content
3. `site_media` - Media assets
4. `business_brains` - Business Brain instances (admin can view all)

## Service Role Authentication

Admin operations use service role for elevated permissions:

```javascript
import { supabaseAdmin } from '@/lib/supabase-client'

// Admin operations bypass RLS
const { data } = await supabaseAdmin
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
```

## Future Integration

### Planned Features

1. **User Account Management** - Admin view of public user accounts
2. **Brain Management** - Admin can view/edit all Business Brains
3. **Analytics Dashboard** - Comprehensive usage analytics
4. **Billing Integration** - Module usage and billing management
5. **Support Tools** - Help desk and support ticket system

See `docs/USER_ACCOUNT_ADMIN_INTEGRATION_PLAN.md` for detailed roadmap.

## Security

### Access Control

1. **Secret patterns** - Hidden from casual users
2. **Session expiry** - 24-hour automatic logout
3. **Emergency exit** - Quick escape route
4. **No public exposure** - Admin routes not discoverable

### Audit Logging

All admin actions logged to `admin_audit_log` table:

```javascript
{
  admin_id: "uuid",
  action: "update_post",
  resource_type: "posts",
  resource_id: "post-uuid",
  changes: { ... },
  ip_address: "...",
  timestamp: "2025-10-10T12:00:00Z"
}
```

### Row Level Security (RLS)

Admin operations bypass RLS using service role, but actions are logged.

## Development

### Adding New Admin Module

1. Create module component in `src/admin/modules/`
2. Add route in admin routing configuration
3. Add navigation link in admin sidebar
4. Implement API layer in `src/admin/api/`
5. Update documentation

### Testing Admin Access

1. Start dev server: `npm run dev:netlify`
2. Open browser to `http://localhost:8888`
3. Click logo 5 times in 3 seconds OR press `Ctrl+Shift+D`
4. Login with admin credentials
5. Test module functionality

## Related Documentation

- `docs/USER_ACCOUNT_ADMIN_INTEGRATION_PLAN.md` - Integration roadmap
- `docs/AUTHENTICATION_SYSTEM.md` - Public authentication system
- `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md` - Business Brain system
- `docs/admin-nexus/` - Detailed Admin Nexus documentation
