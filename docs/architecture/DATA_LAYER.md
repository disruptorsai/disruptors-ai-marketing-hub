# Data Layer Architecture

## Overview

The application uses a dual API integration approach with a custom SDK wrapper over Supabase, providing Base44 compatibility while leveraging Supabase's powerful features.

## Critical Rules (MUST FOLLOW)

### Use Custom SDK for ALL Data Operations

**Always use `src/lib/custom-sdk.js` for data operations** - provides Base44-compatible API over Supabase.

```javascript
import sdk from '@/lib/custom-sdk'

// Create
const post = await sdk.create('posts', { title: 'New Post', ... })

// Read
const posts = await sdk.getAll('posts')
const post = await sdk.getById('posts', postId)

// Update
await sdk.update('posts', postId, { title: 'Updated Title' })

// Delete
await sdk.delete('posts', postId)
```

### Centralized Supabase Clients

**ALL imports MUST use `src/lib/supabase-client.js`:**

```javascript
import { supabase, supabaseAdmin } from '@/lib/supabase-client'
```

**DO NOT create new Supabase clients** - this causes "Multiple GoTrueClient instances" warnings.

### Client Types

1. **`supabase` / `supabaseClient`** - Main client for user operations (anon key)
   - Used for public data access
   - Respects Row Level Security (RLS)
   - User authentication and session management

2. **`supabaseAdmin`** - Service role client for admin operations
   - Bypasses RLS policies
   - Used in Netlify functions
   - Never expose to client-side code

## Custom SDK System

### File: `src/lib/custom-sdk.js`

Base44-compatible wrapper around Supabase with automatic entity-to-table mapping.

### Features

- **Automatic entity-to-table mapping** - `posts` → `posts` table
- **Dynamic CRUD operations** - Standard create/read/update/delete
- **Field mapping** - Base44 ↔ Supabase format conversion
- **Service role selection** - Automatically uses admin client when needed
- **Development mode** - Auto-user creation for testing
- **Graceful degradation** - Handles missing tables for legacy compatibility

### Entity-to-Table Mapping

```javascript
const ENTITY_TABLE_MAP = {
  posts: 'posts',
  team_members: 'team_members',
  site_media: 'site_media',
  business_brains: 'business_brains',
  brain_facts: 'brain_facts',
  modules: 'modules',
  module_runs: 'module_runs',
  // etc.
}
```

### Example Usage

```javascript
// Create a blog post
const newPost = await sdk.create('posts', {
  title: 'How AI is Transforming Construction',
  content: 'Lorem ipsum...',
  author_id: userId,
  published: true
})

// Get all posts
const allPosts = await sdk.getAll('posts')

// Get post by ID
const post = await sdk.getById('posts', postId)

// Update post
await sdk.update('posts', postId, {
  title: 'Updated Title',
  content: 'Updated content...'
})

// Delete post
await sdk.delete('posts', postId)

// Query with filters
const publishedPosts = await sdk.query('posts', {
  filter: { published: true },
  orderBy: { created_at: 'desc' },
  limit: 10
})
```

## Supabase Integration

### File: `src/lib/supabase-client.js`

Environment-aware configuration with automatic fallback to local instance.

### Configuration

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Main client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'disruptors-ai-auth',
    autoRefreshToken: true,
    persistSession: true
  }
})

// Service role client (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

### MCP Server Integration

Direct database operations through Supabase MCP server for enhanced development workflow:

- Real-time database queries
- Schema introspection
- Migration management
- Performance monitoring

See `docs/mcp-servers/supabase-mcp-server.md` for details.

## Authentication Integration

### User Operations

```javascript
import { supabase } from '@/lib/supabase-client'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()
```

### Session Management

```javascript
// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user)
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  }
})
```

## Row Level Security (RLS)

All tables have RLS policies defined in Supabase:

```sql
-- Example: Users can only access their own business brains
CREATE POLICY "Users can view their own brains"
  ON business_brains FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Example: Public can view published posts
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  USING (published = true);
```

## Environment Variables

```bash
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Best Practices

1. **Always use Custom SDK** - Don't bypass with direct Supabase calls
2. **Import from supabase-client.js** - Never create new clients
3. **Use admin client carefully** - Only in server-side functions
4. **Respect RLS** - Don't bypass security unless necessary
5. **Handle errors gracefully** - Check for errors in responses
6. **Use storage key consistently** - `disruptors-ai-auth` everywhere

## Common Pitfalls

❌ **Don't do this:**
```javascript
// Creating new Supabase client (causes warnings)
import { createClient } from '@supabase/supabase-js'
const myClient = createClient(url, key)

// Bypassing custom SDK
await supabase.from('posts').select('*')
```

✅ **Do this instead:**
```javascript
// Use centralized clients
import { supabase } from '@/lib/supabase-client'

// Use custom SDK
import sdk from '@/lib/custom-sdk'
const posts = await sdk.getAll('posts')
```

## Related Files

- `src/lib/custom-sdk.js` - Custom SDK wrapper (Base44 compatibility)
- `src/lib/supabase-client.js` - Centralized Supabase client configuration
- `src/lib/brain-api.js` - Business Brain API layer
- `netlify/functions/` - Server-side functions using admin client
