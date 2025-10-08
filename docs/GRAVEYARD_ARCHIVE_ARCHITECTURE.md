# Graveyard Archive System - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   GRAVEYARD ARCHIVE SYSTEM                      │
│                  (Automatic Section Archiving)                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│   React Pages    │────────▶│  Archive Hook    │────────▶│  Archive Library │
│   (Home, About)  │         │  (Watcher)       │         │  (graveyard.js)  │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │                            │
        │                            │                            │
        │                            ▼                            ▼
        │                    ┌──────────────────┐       ┌──────────────────┐
        │                    │                  │       │                  │
        │                    │  State Change    │       │  Supabase DB     │
        │                    │  Detection       │       │  (archived_      │
        │                    │                  │       │   sections)      │
        │                    └──────────────────┘       └──────────────────┘
        │                                                        │
        ▼                                                        ▼
┌──────────────────┐                                    ┌──────────────────┐
│                  │                                    │                  │
│  Manual Archive  │───────────────────────────────────▶│  Archive Page    │
│  (Developer)     │                                    │  (/graveyard-    │
│                  │                                    │   archive)       │
└──────────────────┘                                    └──────────────────┘
```

## Data Flow

### 1. Automatic Archiving Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  USER REMOVES SECTION                                            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  setState(prev => prev.filter(s => s.id !== sectionId))          │
│  (Section removed from React state)                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  useArchiveWatcher Hook (useEffect)                              │
│  - Compares previousData vs. currentData                         │
│  - Detects missing sections                                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  archiveSection() called automatically                           │
│  - sectionContent: { full JSON data }                            │
│  - removedFromPage: '/home'                                      │
│  - sectionType: 'alternating-layout'                             │
│  - sectionName: 'Innovation Section'                             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Supabase Insert                                                 │
│  INSERT INTO archived_sections (...)                             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Console Log: "✅ Section archived"                              │
│  Archive complete, section safely stored                         │
└──────────────────────────────────────────────────────────────────┘
```

### 2. Manual Archiving Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  DEVELOPER CALLS archiveSection() DIRECTLY                       │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  archiveSection({                                                │
│    sectionContent: { ... },                                      │
│    removedFromPage: '/home',                                     │
│    sectionType: 'hero',                                          │
│    metadata: { reason: 'Redesign' }                              │
│  })                                                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Validate Parameters                                             │
│  - sectionContent must be object                                 │
│  - removedFromPage must be string                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Get Current User (if authenticated)                             │
│  supabase.auth.getUser()                                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Enrich Metadata                                                 │
│  - Add timestamp                                                 │
│  - Add userAgent                                                 │
│  - Add environment (dev/prod)                                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Insert to Database                                              │
│  customClient.entities.ArchivedSection.create()                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Return Archive Record                                           │
│  { id, section_content, removed_from_page, ... }                 │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Restoration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  USER NAVIGATES TO /graveyard-archive                            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  GraveyardArchive Component Loads                                │
│  - Fetches all archived sections                                 │
│  - Displays as tombstone cards                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  USER CLICKS "RESTORE" ON ARCHIVE                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  restoreSection(archiveId) called                                │
│  - Fetches archive by ID                                         │
│  - Returns section_content and metadata                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Alert Displayed                                                 │
│  "Section restored! Check console for content."                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Console Output                                                  │
│  console.log('Restored Section Content:', content)               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  DEVELOPER MANUALLY ADDS BACK TO PAGE                            │
│  - Copy JSON from console                                        │
│  - Add to page state/data                                        │
└──────────────────────────────────────────────────────────────────┘
```

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│   Home Page   │        │  About Page   │        │  Graveyard    │
│   (with hook) │        │  (with hook)  │        │  Archive Page │
└───────────────┘        └───────────────┘        └───────────────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        REACT LAYER                                  │
│                                                                     │
│  ┌──────────────────────────┐    ┌────────────────────────────┐   │
│  │  useArchiveWatcher Hook  │    │  Manual Archive Functions  │   │
│  │  - State comparison      │    │  - archiveSection()        │   │
│  │  - Auto-detection        │    │  - getArchivedSections()   │   │
│  │  - Callback triggers     │    │  - restoreSection()        │   │
│  └──────────────────────────┘    └────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  graveyard-archive.js                                        │ │
│  │  - archiveSection()      - restoreSection()                  │ │
│  │  - getArchivedSections() - deleteArchivedSection()           │ │
│  │  - getArchivedSection()  - getArchiveStats()                 │ │
│  │  - batchArchiveSections()                                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA ACCESS LAYER                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  custom-sdk.js (CustomEntity)                                │ │
│  │  - Supabase client wrapper                                   │ │
│  │  - CRUD operations                                            │ │
│  │  - Field mapping (Base44 ↔ Supabase)                         │ │
│  │  - Service role / Regular client selection                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Supabase PostgreSQL                                         │ │
│  │                                                               │ │
│  │  Table: archived_sections                                    │ │
│  │  - id (UUID, PK)                                             │ │
│  │  - section_content (JSONB) ← Full section data               │ │
│  │  - removed_from_page (TEXT)                                  │ │
│  │  - section_type (TEXT)                                       │ │
│  │  - section_name (TEXT)                                       │ │
│  │  - metadata (JSONB)                                          │ │
│  │  - removed_at (TIMESTAMPTZ)                                  │ │
│  │  - removed_by (UUID FK)                                      │ │
│  │  - created_at, updated_at (TIMESTAMPTZ)                      │ │
│  │                                                               │ │
│  │  Indexes:                                                     │ │
│  │  - idx_archived_sections_removed_from_page                   │ │
│  │  - idx_archived_sections_removed_at                          │ │
│  │  - idx_archived_sections_section_type                        │ │
│  │                                                               │ │
│  │  RLS Policies:                                                │ │
│  │  - Public SELECT                                             │ │
│  │  - Authenticated INSERT                                      │ │
│  │  - Owner UPDATE                                              │ │
│  │  - Service Role DELETE                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
                    ┌────────────────────┐
                    │  Initial Page Load │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  sections = [      │
                    │    section1,       │
                    │    section2,       │
                    │    section3        │
                    │  ]                 │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  useArchiveWatcher │
                    │  previousData: []  │
                    │  (first render)    │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  Store in ref:     │
                    │  previousData =    │
                    │    [s1, s2, s3]    │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  USER REMOVES s2   │
                    │  setSections(...)  │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  sections = [      │
                    │    section1,       │
                    │    section3        │
                    │  ]                 │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  useEffect runs:   │
                    │  Compare previous  │
                    │  vs current        │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  Detect missing:   │
                    │  section2          │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  Archive section2  │
                    │  to database       │
                    └────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  Update ref:       │
                    │  previousData =    │
                    │    [s1, s3]        │
                    └────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION LAYER                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Supabase Auth                                                │ │
│  │  - User authentication (optional for viewing)                 │ │
│  │  - Session management                                         │ │
│  │  - User ID tracking for removed_by field                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ROW LEVEL SECURITY (RLS)                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Policy: Allow public read access                            │ │
│  │  FOR SELECT USING (true)                                      │ │
│  │  → Anyone can view archives                                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Policy: Allow authenticated users to insert                 │ │
│  │  FOR INSERT WITH CHECK (auth.role() = 'authenticated')       │ │
│  │  → Must be logged in to archive                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Policy: Allow users to update their own archives            │ │
│  │  FOR UPDATE USING (auth.uid() = removed_by)                  │ │
│  │  → Can only update own archives                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Policy: Allow service role to delete                        │ │
│  │  FOR DELETE USING (auth.role() = 'service_role')             │ │
│  │  → Only admin/service role can permanently delete             │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       OPTIONAL UI ACCESS CONTROL                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  GraveyardArchive Page (Optional Admin Check)                │ │
│  │  - Can add role check for viewing                             │ │
│  │  - Redirect non-admins to homepage                            │ │
│  │  - Currently: Public access (hidden URL)                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
disruptors-ai-marketing-hub/
│
├── supabase/
│   └── migrations/
│       └── 20251006000000_create_archived_sections_table.sql
│           ├── CREATE TABLE archived_sections
│           ├── CREATE INDEX (3 indexes)
│           ├── CREATE POLICY (4 RLS policies)
│           └── CREATE TRIGGER (updated_at)
│
├── src/
│   ├── lib/
│   │   └── graveyard-archive.js
│   │       ├── archiveSection()
│   │       ├── getArchivedSections()
│   │       ├── getArchivedSection()
│   │       ├── restoreSection()
│   │       ├── deleteArchivedSection()
│   │       ├── getArchiveStats()
│   │       └── batchArchiveSections()
│   │
│   ├── hooks/
│   │   └── useArchiveWatcher.js
│   │       ├── State comparison logic
│   │       ├── Automatic detection
│   │       ├── manualArchive() return
│   │       └── reset() return
│   │
│   └── pages/
│       ├── GraveyardArchive.jsx
│       │   ├── Archive overview UI
│       │   ├── Tombstone cards
│       │   ├── Filter controls
│       │   ├── Detail modal
│       │   └── Restore/delete actions
│       │
│       └── index.jsx
│           ├── Import GraveyardArchive (lazy)
│           ├── Add to PAGES mapping
│           └── Add Route /graveyard-archive
│
└── docs/
    ├── GRAVEYARD_ARCHIVE_SYSTEM.md (Full documentation)
    ├── GRAVEYARD_ARCHIVE_ARCHITECTURE.md (This file)
    └── examples/
        └── graveyard-archive-integration-example.jsx
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend                                                           │
│  - React 18 (useState, useEffect, useRef)                           │
│  - Framer Motion (animations, modal)                                │
│  - React Router DOM v7.2.0 (routing)                                │
│  - Tailwind CSS (styling, dark theme)                               │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  State Management                                                   │
│  - React useState (section arrays)                                  │
│  - React useRef (previous state tracking)                           │
│  - React useEffect (change detection)                               │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend / Data                                                     │
│  - Supabase PostgreSQL (database)                                   │
│  - Supabase Auth (authentication)                                   │
│  - Custom SDK (data access layer)                                   │
│  - Row Level Security (authorization)                               │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Build / Deploy                                                     │
│  - Vite (bundler)                                                   │
│  - Netlify (hosting)                                                │
│  - Supabase CLI (migrations)                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Hook Performance
- **Ref-based comparison**: O(n) comparison on every state change
- **Minimal re-renders**: Uses `useRef` to avoid triggering extra renders
- **Lazy execution**: Only runs when `enabled` is true
- **Batching**: Supports batch archiving for bulk operations

### Database Performance
- **Indexed queries**: Fast filtering by page, type, and date
- **JSONB storage**: Efficient storage of variable section structures
- **Pagination**: Default limit of 100 records (configurable)
- **RLS overhead**: Minimal (simple policies)

### UI Performance
- **Lazy loading**: Page lazy-loaded to reduce initial bundle size
- **Framer Motion**: Hardware-accelerated animations
- **Conditional rendering**: Filters applied client-side after fetch
- **Memoization**: Could add useMemo for filter results (future)

---

**Last Updated**: 2025-10-06
**Version**: 1.0.0
