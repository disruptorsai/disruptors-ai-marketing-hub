# Graveyard Archive System

The Graveyard Archive System is an automatic archiving solution that captures and stores deleted or removed sections from the Disruptors AI Marketing Hub. This system ensures that no content is permanently lost and provides an easy restoration pathway for previously removed sections.

## Overview

The system consists of four main components:

1. **Database Layer**: Supabase table (`archived_sections`) for persistent storage
2. **Utility Library**: Functions to archive, retrieve, and restore sections
3. **React Hook**: Automatic detection of removed sections
4. **Archive Page**: Hidden UI to view and manage archived content

## Architecture

### Database Schema

**Table**: `archived_sections`

```sql
CREATE TABLE archived_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_content JSONB NOT NULL,           -- Full section content as JSON
  removed_from_page TEXT NOT NULL,          -- Page where section was removed (e.g., '/home')
  section_type TEXT,                        -- Type of section (e.g., 'hero', 'alternating-layout')
  section_name TEXT,                        -- Friendly name for the section
  metadata JSONB DEFAULT '{}'::jsonb,       -- Additional metadata
  removed_at TIMESTAMPTZ DEFAULT now(),     -- When section was archived
  removed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- User who removed it
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes**:
- `idx_archived_sections_removed_from_page` - Fast filtering by page
- `idx_archived_sections_removed_at` - Chronological ordering
- `idx_archived_sections_section_type` - Fast filtering by type

**Row Level Security (RLS)**:
- ✅ **Public read** - Anyone can view archived sections
- ✅ **Authenticated insert** - Logged-in users can archive sections
- ✅ **User update** - Users can update their own archives
- ✅ **Service role delete** - Only admin/service role can permanently delete

### Migration File

**Location**: `C:\Users\Will\OneDrive\Documents\Projects\dm4\disruptors-ai-marketing-hub\supabase\migrations\20251006000000_create_archived_sections_table.sql`

**Apply Migration**:
```bash
# If using local Supabase
supabase db reset

# If using remote Supabase
supabase db push
```

## Core Library

### Location
`C:\Users\Will\OneDrive\Documents\Projects\dm4\disruptors-ai-marketing-hub\src\lib\graveyard-archive.js`

### Functions

#### `archiveSection(params)`
Archive a deleted section to the graveyard.

```javascript
import { archiveSection } from '@/lib/graveyard-archive';

await archiveSection({
  sectionContent: {
    kicker: "INNOVATION",
    headline: "Old Headline",
    body: "Old body text...",
    video: "https://example.com/video.mp4"
  },
  removedFromPage: '/home',
  sectionType: 'alternating-layout',
  sectionName: 'Innovation Section',
  metadata: {
    position: 2,
    reason: 'Updated with new messaging',
    dependencies: ['video-asset-xyz']
  }
});
```

**Parameters**:
- `sectionContent` (Object, required) - Full content of the section as JSON
- `removedFromPage` (String, required) - Page route (e.g., '/home', '/about')
- `sectionType` (String) - Type of section (default: 'unknown')
- `sectionName` (String) - Friendly name (default: null)
- `metadata` (Object) - Additional context (default: {})

**Returns**: Promise<Object> - The archived section record

---

#### `getArchivedSections(params)`
Retrieve archived sections with optional filtering.

```javascript
import { getArchivedSections } from '@/lib/graveyard-archive';

// Get all archived sections from home page
const homeArchives = await getArchivedSections({
  removedFromPage: '/home'
});

// Get all hero sections
const heroArchives = await getArchivedSections({
  sectionType: 'hero'
});

// Get latest 10 archived sections
const recentArchives = await getArchivedSections({
  limit: 10
});
```

**Parameters**:
- `removedFromPage` (String) - Filter by page (optional)
- `sectionType` (String) - Filter by type (optional)
- `limit` (Number) - Max records to return (default: 100)
- `orderBy` (String) - Order field (default: '-removed_at')

**Returns**: Promise<Array> - Array of archived sections

---

#### `getArchivedSection(id)`
Get a single archived section by ID.

```javascript
import { getArchivedSection } from '@/lib/graveyard-archive';

const archive = await getArchivedSection('123e4567-e89b-12d3-a456-426614174000');
```

**Returns**: Promise<Object|null> - The archived section or null

---

#### `restoreSection(id)`
Restore an archived section (returns content for manual restoration).

```javascript
import { restoreSection } from '@/lib/graveyard-archive';

const restoredContent = await restoreSection('123e4567-e89b-12d3-a456-426614174000');
if (restoredContent) {
  console.log('Section content:', restoredContent.content);
  console.log('Original page:', restoredContent.metadata.originalPage);
}
```

**Returns**: Promise<Object|null> - Restored section content and metadata

**Note**: This function returns the section content but does NOT automatically re-add it to the page. Manual restoration is required to ensure proper integration with current page structure.

---

#### `deleteArchivedSection(id)`
Permanently delete an archived section.

```javascript
import { deleteArchivedSection } from '@/lib/graveyard-archive';

const deleted = await deleteArchivedSection('123e4567-e89b-12d3-a456-426614174000');
```

**Returns**: Promise<boolean> - True if deletion was successful

**WARNING**: This permanently deletes the archive. Only use if you're certain the section will never be needed again.

---

#### `getArchiveStats()`
Get statistics about archived sections.

```javascript
import { getArchiveStats } from '@/lib/graveyard-archive';

const stats = await getArchiveStats();
// {
//   totalArchived: 42,
//   byPage: { '/home': 12, '/about': 8, ... },
//   byType: { 'hero': 5, 'alternating-layout': 15, ... },
//   mostRecentArchive: '2025-10-06T12:30:00Z'
// }
```

**Returns**: Promise<Object> - Archive statistics

---

#### `batchArchiveSections(sections)`
Archive multiple sections at once.

```javascript
import { batchArchiveSections } from '@/lib/graveyard-archive';

const archived = await batchArchiveSections([
  {
    sectionContent: { ... },
    removedFromPage: '/home',
    sectionType: 'hero',
    sectionName: 'Old Hero'
  },
  {
    sectionContent: { ... },
    removedFromPage: '/home',
    sectionType: 'features',
    sectionName: 'Old Features'
  }
]);
```

**Returns**: Promise<Array> - Array of archived records

## React Hook: useArchiveWatcher

### Location
`C:\Users\Will\OneDrive\Documents\Projects\dm4\disruptors-ai-marketing-hub\src\hooks\useArchiveWatcher.js`

### Usage

The `useArchiveWatcher` hook automatically detects when sections are removed from a page and archives them.

#### Basic Usage

```javascript
import { useState } from 'react';
import useArchiveWatcher from '@/hooks/useArchiveWatcher';

function HomePage() {
  const [sections, setSections] = useState([
    { id: 1, headline: "Section 1", body: "..." },
    { id: 2, headline: "Section 2", body: "..." },
  ]);

  // Enable automatic archiving for this page
  useArchiveWatcher({
    data: sections,
    pageName: '/home',
    enabled: true
  });

  const removeSection = (id) => {
    setSections(prev => prev.filter(s => s.id !== id));
    // Hook automatically detects and archives the removed section!
  };

  return <div>...</div>;
}
```

#### Advanced Usage

```javascript
import useArchiveWatcher from '@/hooks/useArchiveWatcher';

function AdvancedPage() {
  const [sections, setSections] = useState([...]);

  const { manualArchive, reset } = useArchiveWatcher({
    data: sections,
    pageName: '/advanced',
    enabled: true,

    // Custom key extraction
    getKey: (section, index) => section.uniqueId || index,

    // Custom section type detection
    getSectionType: (section) => {
      if (section.component === 'Hero') return 'hero';
      if (section.component === 'Features') return 'features';
      return 'unknown';
    },

    // Custom section name extraction
    getSectionName: (section) => section.title || section.label,

    // Callback after archiving
    onArchive: (archived) => {
      console.log('Archived:', archived);
      // Show toast notification, update UI, etc.
    }
  });

  // Manual archiving (if needed)
  const handleManualArchive = async () => {
    const section = { headline: "Manual Section", body: "..." };
    await manualArchive(section, 'manual-type', 'Manual Section Name');
  };

  return <div>...</div>;
}
```

#### Hook Options

- **`data`** (Array|Object, required) - Current page data (sections array)
- **`pageName`** (String, required) - Page route (e.g., '/home')
- **`enabled`** (Boolean) - Enable/disable archiving (default: true)
- **`getKey`** (Function) - Extract unique key from section (default: uses index)
- **`getSectionType`** (Function) - Determine section type (default: auto-detect)
- **`getSectionName`** (Function) - Get friendly section name (default: auto-detect)
- **`onArchive`** (Function) - Callback fired after archiving

#### Return Values

The hook returns an object with utility functions:

- **`manualArchive(section, sectionType, sectionName)`** - Manually archive a section
- **`reset()`** - Reset the watcher (useful after bulk updates)

### How It Works

1. **State Tracking**: Stores previous data in a ref to compare with current data
2. **Change Detection**: On data change, compares keys between previous and current arrays
3. **Automatic Archiving**: Detects removed sections and automatically archives them
4. **Skip First Render**: Ignores initial render (no previous data to compare)

## Graveyard Archive Page

### Location
`C:\Users\Will\OneDrive\Documents\Projects\dm4\disruptors-ai-marketing-hub\src\pages\GraveyardArchive.jsx`

### Access
Navigate to: **`/graveyard-archive`**

This is a hidden page (not in main navigation) accessible only via direct URL.

### Features

#### 1. Archive Overview
- Total archived sections count
- Number of affected pages
- Number of section types
- Chronological listing of all archives

#### 2. Filtering
- **Filter by Page**: Show archives from specific page
- **Filter by Type**: Show archives of specific section type
- **Combined Filters**: Apply both filters simultaneously

#### 3. Tombstone Cards
Each archived section is displayed as a "tombstone" card with:
- Section name and type
- Page it was removed from
- Timestamp of removal
- JSON content preview
- Action buttons: View, Restore, Delete

#### 4. Detail Modal
Click "View" on any archive to see:
- Full section content (formatted JSON)
- Complete metadata
- Archive information (ID, type, page, timestamp)
- Restore and Delete actions

#### 5. Actions

**Restore**:
- Returns section content via console and alert
- Does NOT automatically add back to page
- Provides content for manual restoration

**Delete**:
- Permanently removes archive from database
- Requires confirmation
- Cannot be undone

### Theme

The page uses a dark "graveyard" aesthetic:
- Dark gradient background (gray-900 to black)
- Tombstone-shaped cards with rounded tops
- Muted gray and blue color scheme
- Hover effects with subtle glows
- Serif fonts for headings (tombstone feel)
- Monospace fonts for code/JSON

## Usage Examples

### Example 1: Manual Archiving

```javascript
import { archiveSection } from '@/lib/graveyard-archive';

// When manually removing a section from your page
const handleRemoveSection = async (section) => {
  // Archive first
  await archiveSection({
    sectionContent: section,
    removedFromPage: '/home',
    sectionType: 'hero',
    sectionName: section.headline,
    metadata: {
      reason: 'User requested removal',
      removedBy: currentUser.id
    }
  });

  // Then remove from state
  setSections(prev => prev.filter(s => s.id !== section.id));
};
```

### Example 2: Automatic Archiving with Hook

```javascript
import { useState } from 'react';
import useArchiveWatcher from '@/hooks/useArchiveWatcher';

function MyPage() {
  const [alternatingData, setAlternatingData] = useState([
    {
      kicker: "REVOLUTION",
      headline: "Transform Your Business",
      body: "We combine deep marketing expertise...",
      video: "https://..."
    },
    // ... more sections
  ]);

  // Automatically archive removed sections
  useArchiveWatcher({
    data: alternatingData,
    pageName: '/home',
    enabled: true,
    getSectionType: () => 'alternating-layout',
    getSectionName: (section) => section.headline
  });

  // Simply remove from array - hook handles archiving!
  const removeSection = (index) => {
    setAlternatingData(prev => prev.filter((_, i) => i !== index));
  };

  return <div>...</div>;
}
```

### Example 3: Viewing Archives

Navigate to `/graveyard-archive` in your browser to:
- View all archived sections
- Filter by page or type
- View full section content
- Restore sections (copy content from console)
- Permanently delete archives

### Example 4: Programmatic Archive Retrieval

```javascript
import { getArchivedSections } from '@/lib/graveyard-archive';

// Get all archives from home page
const homeArchives = await getArchivedSections({
  removedFromPage: '/home',
  limit: 50
});

// Display in custom UI
homeArchives.forEach(archive => {
  console.log(`${archive.section_name} (${archive.section_type})`);
  console.log(`Removed: ${archive.removed_at}`);
  console.log(`Content:`, archive.section_content);
});
```

### Example 5: Batch Archiving

```javascript
import { batchArchiveSections } from '@/lib/graveyard-archive';

// When removing multiple sections at once
const handleClearAll = async () => {
  const sectionsToArchive = sections.map(section => ({
    sectionContent: section,
    removedFromPage: '/home',
    sectionType: 'alternating-layout',
    sectionName: section.headline,
    metadata: { batchRemoval: true }
  }));

  await batchArchiveSections(sectionsToArchive);
  setSections([]);
};
```

## Integration with Existing Pages

### Recommended Integration

Add the archive watcher to pages with dynamic content:

**Home.jsx**:
```javascript
import useArchiveWatcher from '@/hooks/useArchiveWatcher';

export default function Home() {
  const [alternatingData, setAlternatingData] = useState([...]);

  // Enable archiving
  useArchiveWatcher({
    data: alternatingData,
    pageName: '/home',
    enabled: import.meta.env.MODE === 'development', // Only in dev mode
    getSectionType: () => 'alternating-layout',
    getSectionName: (section) => section.headline || section.kicker
  });

  return <div>...</div>;
}
```

**About.jsx**:
```javascript
useArchiveWatcher({
  data: teamMembers,
  pageName: '/about',
  enabled: true,
  getSectionType: () => 'team-member',
  getSectionName: (member) => member.name
});
```

### Best Practices

1. **Enable in Development Only**: Set `enabled: import.meta.env.MODE === 'development'` to avoid cluttering production database
2. **Descriptive Section Names**: Use meaningful section names for easy identification
3. **Rich Metadata**: Include context like reason for removal, position, dependencies
4. **Selective Archiving**: Only enable for content that might need restoration
5. **Periodic Cleanup**: Review and delete old archives that are no longer needed

## Security Considerations

### Row Level Security (RLS)
- **Read**: Public access (anyone can view archives)
- **Insert**: Requires authentication
- **Update**: Only archive creator can update
- **Delete**: Only service role/admin can delete

### Admin-Only Access
To restrict the graveyard page to admins only, add authentication check:

```javascript
// In GraveyardArchive.jsx
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
      if (user.role !== 'admin') {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  };

  // ... rest of component
}
```

## Troubleshooting

### Archive not appearing?
- Check console for errors
- Verify migration was applied: `supabase db push`
- Check RLS policies are enabled
- Ensure section data is valid JSON

### Hook not detecting removals?
- Verify `data` prop is an array
- Check `getKey` function returns unique keys
- Ensure state updates properly remove items
- Check `enabled` prop is true

### Restore not working?
- Check console for restored content
- Verify archive ID is correct
- Remember: restore returns content, doesn't auto-add to page

### Database errors?
- Verify Supabase connection
- Check environment variables
- Ensure service role key is set for admin operations

## Future Enhancements

Potential improvements for the system:

1. **Auto-Restore**: Click to automatically re-add section to page
2. **Version History**: Track multiple versions of same section
3. **Diff Viewer**: Compare archived version with current version
4. **Search**: Full-text search across archived content
5. **Tags**: Add custom tags to archives for better organization
6. **Expiration**: Auto-delete archives older than X days/months
7. **Export**: Download archives as JSON files
8. **Preview**: Visual preview of archived sections (not just JSON)
9. **Undo**: Immediate undo button after removal
10. **Notifications**: Email/Slack notifications when sections are archived

## Summary

The Graveyard Archive System provides:

✅ **Automatic archiving** of deleted sections via React hook
✅ **Persistent storage** in Supabase database
✅ **Visual interface** for viewing and managing archives
✅ **Restoration pathway** for bringing back old content
✅ **Metadata tracking** for context and debugging
✅ **Filtering and search** capabilities
✅ **Security controls** via RLS policies

This ensures that no content is ever truly lost and provides a safety net for content management decisions.

---

## File Locations Summary

- **Migration**: `supabase/migrations/20251006000000_create_archived_sections_table.sql`
- **Core Library**: `src/lib/graveyard-archive.js`
- **React Hook**: `src/hooks/useArchiveWatcher.js`
- **Archive Page**: `src/pages/GraveyardArchive.jsx`
- **Documentation**: `docs/GRAVEYARD_ARCHIVE_SYSTEM.md`
- **Route Registration**: `src/pages/index.jsx` (lines 85, 187, 315)

## Access Instructions

1. Navigate to: `http://localhost:5173/graveyard-archive` (development)
2. Or: `https://dm4.wjwelsh.com/graveyard-archive` (production)
3. No navigation link (hidden page, direct URL only)
4. Optional: Add admin authentication check for restricted access

---

**Last Updated**: 2025-10-06
**Version**: 1.0.0
**Maintained By**: Disruptors AI Development Team
