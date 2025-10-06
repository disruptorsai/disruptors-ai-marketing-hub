# Graveyard Archive System - Quick Start

## What is it?

An automatic "graveyard" system that captures and stores deleted/removed sections from your website. Think of it as version control for your content - nothing is ever truly lost.

## Quick Access

**View Archives**: Navigate to `/graveyard-archive` in your browser
- Development: `http://localhost:5173/graveyard-archive`
- Production: `https://dm4.wjwelsh.com/graveyard-archive`

## Files Created

### 1. Database Migration
**Location**: `supabase/migrations/20251006000000_create_archived_sections_table.sql`

Creates the `archived_sections` table with proper schema and RLS policies.

**Apply Migration**:
```bash
# Local Supabase
supabase db reset

# Remote Supabase
supabase db push
```

### 2. Core Library
**Location**: `src/lib/graveyard-archive.js`

Provides functions to:
- `archiveSection()` - Archive a deleted section
- `getArchivedSections()` - Retrieve archived sections with filters
- `getArchivedSection()` - Get single archive by ID
- `restoreSection()` - Restore archived content
- `deleteArchivedSection()` - Permanently delete an archive
- `getArchiveStats()` - Get archive statistics
- `batchArchiveSections()` - Archive multiple sections at once

### 3. React Hook
**Location**: `src/hooks/useArchiveWatcher.js`

Automatic detection hook that monitors state changes and archives removed sections.

### 4. Archive Page
**Location**: `src/pages/GraveyardArchive.jsx`

Visual interface with:
- Tombstone-style cards for each archive
- Filtering by page and section type
- Detail modal with full content view
- Restore and delete actions
- Dark "graveyard" theme

### 5. Route Registration
**Location**: `src/pages/index.jsx`

Route added at `/graveyard-archive` (lines 85, 187, 315)

## Usage Examples

### Manual Archiving

```javascript
import { archiveSection } from '@/lib/graveyard-archive';

await archiveSection({
  sectionContent: { headline: "Old Section", body: "..." },
  removedFromPage: '/home',
  sectionType: 'hero',
  sectionName: 'Old Hero Section',
  metadata: { reason: 'Redesign' }
});
```

### Automatic Archiving (Recommended)

```javascript
import { useState } from 'react';
import useArchiveWatcher from '@/hooks/useArchiveWatcher';

function MyPage() {
  const [sections, setSections] = useState([...]);

  // Enable automatic archiving
  useArchiveWatcher({
    data: sections,
    pageName: '/my-page',
    enabled: true // or: import.meta.env.MODE === 'development'
  });

  // Simply remove from state - hook handles archiving!
  const removeSection = (id) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  return <div>...</div>;
}
```

### View Archives

Navigate to `/graveyard-archive` to:
- See all archived sections
- Filter by page or type
- View full JSON content
- Restore sections (copy content from console)
- Permanently delete old archives

## Database Schema

```sql
CREATE TABLE archived_sections (
  id UUID PRIMARY KEY,
  section_content JSONB NOT NULL,      -- Full section as JSON
  removed_from_page TEXT NOT NULL,     -- Page route (e.g., '/home')
  section_type TEXT,                   -- Type (e.g., 'hero', 'features')
  section_name TEXT,                   -- Friendly name
  metadata JSONB DEFAULT '{}',         -- Additional context
  removed_at TIMESTAMPTZ DEFAULT now(),
  removed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## How It Works

### Automatic Detection (useArchiveWatcher hook)

1. **State Tracking**: Stores previous state in a ref
2. **Change Detection**: Compares current vs. previous state on every update
3. **Automatic Archiving**: When sections are removed, automatically archives them
4. **Zero Configuration**: Works with any array-based state

### Manual Archiving

Call `archiveSection()` directly before removing content from your page.

### Restoration

1. Navigate to `/graveyard-archive`
2. Find the archived section
3. Click "View" to see full content
4. Click "Restore" to get content in console
5. Manually copy content back to your page

**Note**: Restore does NOT automatically re-add content to page - this is intentional to ensure proper integration.

## Security

### Row Level Security (RLS)
- **Read**: Public (anyone can view archives)
- **Insert**: Authenticated users only
- **Update**: Archive creator only
- **Delete**: Service role/admin only

### Optional Admin Lock
Add admin check to GraveyardArchive.jsx to restrict access:

```javascript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customClient } from '@/lib/custom-sdk';

export default function GraveyardArchive() {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await customClient.auth.me();
      if (user.role !== 'admin') navigate('/');
    } catch {
      navigate('/');
    }
  };

  // ... rest of component
}
```

## Best Practices

✅ **Enable in Dev Mode Only**: `enabled: import.meta.env.MODE === 'development'`
✅ **Use Unique IDs**: Give sections unique IDs, not just array indices
✅ **Descriptive Names**: Use meaningful section names for easy identification
✅ **Rich Metadata**: Include context like reason, position, dependencies
✅ **Periodic Cleanup**: Review and delete old archives that are no longer needed

## Testing

### Test Automatic Archiving

1. Start dev server: `npm run dev`
2. Navigate to any page with the hook enabled
3. Remove a section from state
4. Check console for "✅ Section archived" message
5. Navigate to `/graveyard-archive` to verify

### Test Manual Archiving

```javascript
import { archiveSection } from '@/lib/graveyard-archive';

const testArchive = async () => {
  await archiveSection({
    sectionContent: { test: "data" },
    removedFromPage: '/test',
    sectionType: 'test-section',
    sectionName: 'Test Archive'
  });
  console.log('Test archive created!');
};

testArchive();
```

### Test Restore

1. Navigate to `/graveyard-archive`
2. Click "Restore" on any archive
3. Check console for restored content
4. Verify alert shows original page and type

## Troubleshooting

### "Table archived_sections does not exist"
- Run migration: `supabase db push` or `supabase db reset`

### Hook not detecting changes
- Ensure `data` is an array
- Verify state updates properly remove items
- Check `enabled` prop is `true`
- Use unique keys for sections

### Archives not appearing on page
- Check console for errors
- Verify Supabase connection
- Check RLS policies are enabled
- Ensure section data is valid JSON

## Documentation

📄 **Full Documentation**: `docs/GRAVEYARD_ARCHIVE_SYSTEM.md`
📄 **Integration Example**: `docs/examples/graveyard-archive-integration-example.jsx`

## Support

For issues or questions:
1. Check full documentation in `docs/GRAVEYARD_ARCHIVE_SYSTEM.md`
2. Review example integration in `docs/examples/`
3. Check console logs for error messages
4. Verify database migration was applied

---

**Created**: 2025-10-06
**Version**: 1.0.0
**Status**: ✅ Ready to Use (Migration Required)
