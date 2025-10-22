# DISRUPTORS CONNECT — Check-In Kiosk System
## Complete Implementation Specification (Adapted for Existing Stack)

**Document Version:** 1.0
**Date:** 2025-10-22
**Status:** Ready for Implementation

---

## 📋 Executive Summary

This specification adapts the Disruptors Connect check-in kiosk PRD to the existing Disruptors AI Marketing Hub tech stack. Instead of Next.js, this implementation uses:

- **Vite 6.1.0** + React 18 (existing build system)
- **React Router DOM v7.2.0** (existing routing)
- **Supabase** (existing database)
- **Netlify Functions** (existing serverless)
- **Existing UI components** (shadcn/ui + Framer Motion)

The system will be accessible at `/connect` routes and integrate seamlessly with the existing admin architecture.

---

## 🎯 Core Requirements

### Outcomes (What "Done" Looks Like)

✅ **Speed**: RSVP'd guests check in in <15s; walk-ins <60s
✅ **Privacy**: Anonymous poll data, no PII linkage
✅ **AI-Powered**: Deduplication, persona classification, smart matchmaking
✅ **Offline-First**: Captures events locally, syncs automatically
✅ **Kiosk-Ready**: Full-screen PWA, wake lock, no sleep
✅ **Observable**: Error tracking, health monitoring, diagnostics

### Non-Goals

❌ Full CRM UI (capture & route only)
❌ Payment/ticket sales
❌ Multi-event management (single event focus)

---

## 🏗️ Technology Stack Mapping

### PRD Recommendation → Existing Stack

| PRD Component | Recommended | **Adapted Solution** |
|---------------|-------------|---------------------|
| Framework | Next.js App Router | **Vite 6.1.0 + React 18** |
| Routing | Next.js routing | **React Router DOM v7.2.0** |
| UI Library | TailwindCSS + shadcn/ui | **✅ Already exists** |
| Animation | Framer Motion + Lottie | **✅ Already exists (Framer Motion 12.4.7)** |
| Database | Supabase/Postgres | **✅ Already configured** |
| Serverless | Vercel Edge Functions | **Netlify Functions (Node.js 18)** |
| State | Zustand/Redux Toolkit | **Zustand** (add dependency) |
| PWA | next-pwa | **vite-plugin-pwa** (add dependency) |
| QR | @zxing/browser + qrcode | **✅ New dependencies** |
| Offline Storage | IndexedDB via idb | **idb** (add dependency) |
| AI | External LLM | **Existing @anthropic-ai/sdk** |
| SMS | Twilio | **✅ Already used in functions** |
| Email | Resend/Postmark | **Postmark** (add if needed) |
| Analytics | PostHog | **✅ Already integrated** |
| Errors | Sentry | **✅ Already integrated** |
| Wake Lock | Screen Wake Lock API | **Web API (feature detect)** |

### New Dependencies Required

```json
{
  "dependencies": {
    "zustand": "^5.0.3",
    "idb": "^8.0.0",
    "qrcode": "^1.5.4",
    "@zxing/browser": "^0.1.5",
    "workbox-window": "^7.3.0"
  },
  "devDependencies": {
    "vite-plugin-pwa": "^0.21.1"
  }
}
```

---

## 🗄️ Database Schema (Supabase)

### New Tables

#### 1. `connect_events`
```sql
CREATE TABLE connect_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  venue TEXT,
  wifi_ssid TEXT,
  wifi_password TEXT,
  is_active BOOLEAN DEFAULT true,
  theme JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_connect_events_active ON connect_events(is_active, starts_at);
CREATE INDEX idx_connect_events_slug ON connect_events(slug);

-- RLS Policies
ALTER TABLE connect_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active events"
  ON connect_events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage events"
  ON connect_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

#### 2. `connect_kiosks`
```sql
CREATE TABLE connect_kiosks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES connect_events(id) ON DELETE CASCADE,
  device_label TEXT NOT NULL, -- e.g., "Front Desk", "Main Entrance"
  device_fingerprint TEXT UNIQUE, -- browser fingerprint or MAC
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}', -- camera, printer settings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_connect_kiosks_event ON connect_kiosks(event_id);
CREATE INDEX idx_connect_kiosks_active ON connect_kiosks(is_active);

ALTER TABLE connect_kiosks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kiosks can update their own last_seen"
  ON connect_kiosks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view active kiosks"
  ON connect_kiosks FOR SELECT
  USING (is_active = true);
```

#### 3. `connect_contacts`
```sql
CREATE TABLE connect_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT, -- normalized E.164
  email TEXT,
  company TEXT,
  role TEXT,
  consent_feedback BOOLEAN DEFAULT false,
  consent_sms BOOLEAN DEFAULT false,
  consent_photo BOOLEAN DEFAULT false,
  selfie_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Deduplication constraints
  CONSTRAINT phone_or_email_required CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- Unique constraints for deduplication
CREATE UNIQUE INDEX idx_connect_contacts_phone ON connect_contacts(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX idx_connect_contacts_email ON connect_contacts(LOWER(email)) WHERE email IS NOT NULL;

-- Trigram index for fuzzy name matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_connect_contacts_name_trgm ON connect_contacts USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

-- Full-text search index
CREATE INDEX idx_connect_contacts_search ON connect_contacts USING gin(
  to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(company, ''))
);

ALTER TABLE connect_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contacts are private"
  ON connect_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

#### 4. `connect_attendances`
```sql
CREATE TABLE connect_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES connect_events(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES connect_contacts(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- links to poll_responses
  kiosk_id UUID REFERENCES connect_kiosks(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('kiosk', 'mobile', 'qr')),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}', -- user agent, IP, etc.

  -- One attendance per contact per event
  CONSTRAINT unique_attendance_per_event UNIQUE (event_id, contact_id)
);

CREATE INDEX idx_connect_attendances_event ON connect_attendances(event_id);
CREATE INDEX idx_connect_attendances_contact ON connect_attendances(contact_id);
CREATE INDEX idx_connect_attendances_session ON connect_attendances(session_id);
CREATE INDEX idx_connect_attendances_checkin ON connect_attendances(checked_in_at DESC);

ALTER TABLE connect_attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendances viewable by admins"
  ON connect_attendances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

#### 5. `connect_poll_responses` (ANONYMOUS)
```sql
CREATE TABLE connect_poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES connect_events(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- NO FOREIGN KEY to maintain anonymity

  -- Poll questions (matching PRD exactly)
  q1_experience TEXT CHECK (q1_experience IN ('A', 'B', 'C', 'D')),
  q2_goal TEXT CHECK (q2_goal IN ('A', 'B', 'C', 'D')),
  q3_hesitation TEXT CHECK (q3_hesitation IN ('A', 'B', 'C', 'D')),
  q4_confidence TEXT CHECK (q4_confidence IN ('A', 'B', 'C', 'D')),
  q5_impact_area TEXT CHECK (q5_impact_area IN ('A', 'B', 'C', 'D')),
  q6_general_text TEXT, -- "Unfiltered thoughts on AI"
  q7_automation_text TEXT, -- "Repetitive task to automate"

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One poll response per session
  CONSTRAINT unique_poll_per_session UNIQUE (session_id)
);

CREATE INDEX idx_connect_poll_event ON connect_poll_responses(event_id);
CREATE INDEX idx_connect_poll_created ON connect_poll_responses(created_at DESC);

-- No RLS needed — data is anonymous
ALTER TABLE connect_poll_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Poll responses are anonymous and public for aggregation"
  ON connect_poll_responses FOR SELECT
  USING (true);

-- Note: Session_id is intentionally NOT a foreign key to prevent joins with PII
```

#### 6. `connect_classifications`
```sql
CREATE TABLE connect_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES connect_contacts(id) ON DELETE CASCADE,
  persona_label TEXT, -- e.g., "Founder/Services", "Ops/SMB"
  vertical TEXT, -- e.g., "Professional Services", "Tech"
  maturity_tier TEXT CHECK (maturity_tier IN ('early', 'growth', 'mature')),
  topics JSONB DEFAULT '[]', -- array of hot topics
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  model_version TEXT, -- for tracking AI model changes
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_classification_per_contact UNIQUE (contact_id)
);

CREATE INDEX idx_connect_classifications_contact ON connect_classifications(contact_id);
CREATE INDEX idx_connect_classifications_persona ON connect_classifications(persona_label);

ALTER TABLE connect_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classifications viewable by admins"
  ON connect_classifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

#### 7. `connect_audit_logs`
```sql
CREATE TABLE connect_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES connect_events(id) ON DELETE CASCADE,
  kiosk_id UUID REFERENCES connect_kiosks(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'checkin', 'poll', 'error', 'admin_action'
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_connect_audit_event ON connect_audit_logs(event_id, created_at DESC);
CREATE INDEX idx_connect_audit_type ON connect_audit_logs(type, created_at DESC);

-- Partition by month for performance
CREATE TABLE connect_audit_logs_2025_10 PARTITION OF connect_audit_logs
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

ALTER TABLE connect_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable by admins"
  ON connect_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Database Functions

#### Normalize Phone Number
```sql
CREATE OR REPLACE FUNCTION normalize_phone(phone_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Strip non-digits
  RETURN regexp_replace(phone_input, '[^0-9+]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### Find Contact Duplicates (Fuzzy)
```sql
CREATE OR REPLACE FUNCTION find_contact_duplicates(
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  similarity_threshold DECIMAL DEFAULT 0.7
)
RETURNS TABLE (
  contact_id UUID,
  similarity_score DECIMAL,
  match_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Exact phone match
  SELECT id, 1.0::DECIMAL, 'phone_exact'::TEXT
  FROM connect_contacts
  WHERE phone = normalize_phone(p_phone)
  LIMIT 1

  UNION ALL

  -- Exact email match
  SELECT id, 1.0::DECIMAL, 'email_exact'::TEXT
  FROM connect_contacts
  WHERE LOWER(email) = LOWER(p_email)
  LIMIT 1

  UNION ALL

  -- Fuzzy name match
  SELECT id,
         similarity(first_name || ' ' || last_name, p_first_name || ' ' || p_last_name) AS score,
         'name_fuzzy'::TEXT
  FROM connect_contacts
  WHERE similarity(first_name || ' ' || last_name, p_first_name || ' ' || p_last_name) > similarity_threshold
  ORDER BY score DESC
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;
```

### Migration File

Save as: `supabase/migrations/20251022_disruptors_connect.sql`

```sql
-- Disruptors Connect Check-In System
-- Migration: 20251022_disruptors_connect.sql
-- Description: Complete schema for kiosk check-in system with anonymous polls

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- (Include all CREATE TABLE statements from above)

-- Seed initial event
INSERT INTO connect_events (name, slug, starts_at, venue, wifi_ssid, wifi_password, is_active)
VALUES (
  'Disruptors Connect - North Salt Lake',
  'connect-2025-10',
  '2025-10-30 18:00:00-06',
  'North Salt Lake Event Hall',
  'DisruptorsEventHall',
  'Disrupt2025',
  true
);

-- Create initial kiosk record
INSERT INTO connect_kiosks (event_id, device_label, device_fingerprint)
SELECT id, 'Main Entrance Kiosk', 'kiosk-001'
FROM connect_events
WHERE slug = 'connect-2025-10';
```

---

## 🧩 Component Architecture

### File Structure

```
src/
├── pages/
│   ├── connect/
│   │   ├── Welcome.jsx              # Attractor screen
│   │   ├── Intake.jsx               # PII collection
│   │   ├── Poll.jsx                 # Anonymous poll
│   │   ├── Success.jsx              # Post-checkin
│   │   ├── Dashboard.jsx            # Live results (projector)
│   │   └── Admin.jsx                # Diagnostics panel
│   └── index.jsx                    # Add Connect routes
├── components/
│   ├── connect/
│   │   ├── QRScanner.jsx            # Camera QR reader
│   │   ├── LookupSearch.jsx         # Phone/email search
│   │   ├── PollQuestion.jsx         # Single poll question
│   │   ├── MatchCard.jsx            # "Meet this person" card
│   │   ├── Confetti.jsx             # Success animation
│   │   └── AdminHealthTile.jsx      # Diagnostic tile
│   └── ui/                          # Existing shadcn/ui components
├── lib/
│   ├── connect/
│   │   ├── store.js                 # Zustand state
│   │   ├── offline-queue.js         # IndexedDB queue
│   │   ├── wake-lock.js             # Wake Lock API wrapper
│   │   └── qr-utils.js              # QR gen/scan helpers
│   └── supabase-client.js           # Existing client
├── hooks/
│   └── connect/
│       ├── useOfflineSync.js        # Background sync hook
│       ├── useWakeLock.js           # Wake lock hook
│       └── useKioskHealth.js        # Health monitoring
└── utils/
    └── connect/
        ├── phone-normalize.js       # E.164 normalization
        └── analytics.js             # PostHog events
```

### Routing Integration

**Edit:** `src/pages/index.jsx`

```jsx
// Add to imports
const ConnectWelcome = lazyWithRetry(() => import('./connect/Welcome.jsx'));
const ConnectIntake = lazyWithRetry(() => import('./connect/Intake.jsx'));
const ConnectPoll = lazyWithRetry(() => import('./connect/Poll.jsx'));
const ConnectSuccess = lazyWithRetry(() => import('./connect/Success.jsx'));
const ConnectDashboard = lazyWithRetry(() => import('./connect/Dashboard.jsx'));
const ConnectAdmin = lazyWithRetry(() => import('./connect/Admin.jsx'));

// Add to Routes (inside <Routes>)
<Route path="/connect" element={<Suspense fallback={<PageLoader />}><ConnectWelcome /></Suspense>} />
<Route path="/connect/checkin" element={<Suspense fallback={<PageLoader />}><ConnectIntake /></Suspense>} />
<Route path="/connect/poll" element={<Suspense fallback={<PageLoader />}><ConnectPoll /></Suspense>} />
<Route path="/connect/success" element={<Suspense fallback={<PageLoader />}><ConnectSuccess /></Suspense>} />
<Route path="/connect/dashboard" element={<Suspense fallback={<PageLoader />}><ConnectDashboard /></Suspense>} />
<Route path="/connect/admin" element={<Suspense fallback={<PageLoader />}><ConnectAdmin /></Suspense>} />
```

### State Management (Zustand)

**File:** `src/lib/connect/store.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useConnectStore = create(
  persist(
    (set, get) => ({
      // Event context
      eventId: null,
      kioskId: null,
      sessionId: null,

      // Check-in state
      contact: null,
      attendance: null,
      pollAnswers: {},

      // Offline queue
      pendingActions: [],
      syncStatus: 'idle', // idle | syncing | error

      // UI state
      currentStep: 'welcome', // welcome | intake | poll | success
      isOnline: navigator.onLine,
      wakeLockActive: false,

      // Actions
      setEventContext: (eventId, kioskId) => set({ eventId, kioskId }),
      startSession: () => set({ sessionId: crypto.randomUUID() }),
      setContact: (contact) => set({ contact }),
      updatePollAnswers: (answers) => set((state) => ({
        pollAnswers: { ...state.pollAnswers, ...answers }
      })),
      addPendingAction: (action) => set((state) => ({
        pendingActions: [...state.pendingActions, { ...action, id: crypto.randomUUID() }]
      })),
      removePendingAction: (id) => set((state) => ({
        pendingActions: state.pendingActions.filter((a) => a.id !== id)
      })),
      setSyncStatus: (status) => set({ syncStatus: status }),
      setOnlineStatus: (isOnline) => set({ isOnline }),
      setWakeLock: (active) => set({ wakeLockActive: active }),
      reset: () => set({
        contact: null,
        attendance: null,
        pollAnswers: {},
        sessionId: null,
        currentStep: 'welcome'
      })
    }),
    {
      name: 'disruptors-connect-storage',
      partialize: (state) => ({
        eventId: state.eventId,
        kioskId: state.kioskId,
        pendingActions: state.pendingActions
      })
    }
  )
);
```

---

## 🌐 API Layer (Netlify Functions)

### 1. `checkin-resolve.js`
Resolve contact by phone, email, or QR code.

```javascript
// netlify/functions/checkin-resolve.js
import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { phone, email, qrCode, eventId } = JSON.parse(event.body);

  try {
    // QR lookup
    if (qrCode) {
      const { data } = await supabaseAdmin
        .from('connect_attendances')
        .select('contact_id, connect_contacts(*)')
        .eq('event_id', eventId)
        .eq('metadata->>qr_code', qrCode)
        .single();

      if (data) {
        return {
          statusCode: 200,
          body: JSON.stringify({ contactId: data.contact_id, contact: data.connect_contacts })
        };
      }
    }

    // Phone/email lookup with fuzzy matching
    const normalized_phone = phone?.replace(/[^0-9+]/g, '');

    const { data: matches } = await supabaseAdmin.rpc('find_contact_duplicates', {
      p_first_name: '',
      p_last_name: '',
      p_phone: normalized_phone,
      p_email: email
    });

    if (matches && matches.length > 0) {
      const exactMatch = matches.find(m => m.match_type.includes('exact'));
      if (exactMatch) {
        const { data: contact } = await supabaseAdmin
          .from('connect_contacts')
          .select('*')
          .eq('id', exactMatch.contact_id)
          .single();

        return {
          statusCode: 200,
          body: JSON.stringify({ contactId: exactMatch.contact_id, contact, candidates: [] })
        };
      }

      // Return fuzzy matches
      const { data: candidates } = await supabaseAdmin
        .from('connect_contacts')
        .select('*')
        .in('id', matches.map(m => m.contact_id));

      return {
        statusCode: 200,
        body: JSON.stringify({ contactId: null, candidates })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ contactId: null, candidates: [] })
    };
  } catch (error) {
    console.error('Resolve error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### 2. `checkin-confirm.js`
Confirm check-in and create/update contact.

```javascript
// netlify/functions/checkin-confirm.js
import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const {
    eventId,
    sessionId,
    kioskId,
    contactPayload,
    consent,
    source = 'kiosk',
    requestId // idempotency key
  } = JSON.parse(event.body);

  try {
    // Check idempotency
    const { data: existing } = await supabaseAdmin
      .from('connect_audit_logs')
      .select('id, payload')
      .eq('payload->>requestId', requestId)
      .single();

    if (existing) {
      return {
        statusCode: 200,
        body: JSON.stringify({ attendanceId: existing.payload.attendanceId, cached: true })
      };
    }

    // Normalize phone
    const normalizedPhone = contactPayload.phone?.replace(/[^0-9+]/g, '');

    // Create or update contact
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('connect_contacts')
      .upsert({
        phone: normalizedPhone,
        email: contactPayload.email?.toLowerCase(),
        first_name: contactPayload.firstName,
        last_name: contactPayload.lastName,
        company: contactPayload.company,
        role: contactPayload.role,
        consent_feedback: consent.feedback,
        consent_sms: consent.sms || false,
        consent_photo: consent.photo || false
      }, {
        onConflict: normalizedPhone ? 'phone' : 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (contactError) throw contactError;

    // Create attendance
    const { data: attendance, error: attendanceError } = await supabaseAdmin
      .from('connect_attendances')
      .insert({
        event_id: eventId,
        contact_id: contact.id,
        session_id: sessionId,
        kiosk_id: kioskId,
        source,
        metadata: {
          user_agent: event.headers['user-agent'],
          ip: event.headers['x-forwarded-for']
        }
      })
      .select()
      .single();

    if (attendanceError) {
      // Handle duplicate attendance (already checked in)
      if (attendanceError.code === '23505') {
        const { data: existingAttendance } = await supabaseAdmin
          .from('connect_attendances')
          .select('*')
          .eq('event_id', eventId)
          .eq('contact_id', contact.id)
          .single();

        return {
          statusCode: 200,
          body: JSON.stringify({
            attendanceId: existingAttendance.id,
            contactId: contact.id,
            alreadyCheckedIn: true
          })
        };
      }
      throw attendanceError;
    }

    // Log action for idempotency
    await supabaseAdmin.from('connect_audit_logs').insert({
      event_id: eventId,
      kiosk_id: kioskId,
      type: 'checkin',
      payload: { requestId, attendanceId: attendance.id, contactId: contact.id }
    });

    // Trigger AI classification (non-blocking)
    if (process.env.ENABLE_AI_CLASSIFICATION === 'true') {
      fetch(`${process.env.URL}/.netlify/functions/ai-classify`, {
        method: 'POST',
        body: JSON.stringify({ contactId: contact.id, eventId }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.warn('AI classification failed:', err));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        attendanceId: attendance.id,
        contactId: contact.id,
        sessionId
      })
    };
  } catch (error) {
    console.error('Checkin confirm error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### 3. `poll-submit.js`
Submit anonymous poll responses.

```javascript
// netlify/functions/poll-submit.js
import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { eventId, sessionId, answers, requestId } = JSON.parse(event.body);

  try {
    // Check idempotency
    const { data: existing } = await supabaseAdmin
      .from('connect_poll_responses')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      return {
        statusCode: 200,
        body: JSON.stringify({ pollId: existing.id, cached: true })
      };
    }

    // Insert poll response (ANONYMOUS — no link to contact)
    const { data: poll, error } = await supabaseAdmin
      .from('connect_poll_responses')
      .insert({
        event_id: eventId,
        session_id: sessionId,
        q1_experience: answers.q1,
        q2_goal: answers.q2,
        q3_hesitation: answers.q3,
        q4_confidence: answers.q4,
        q5_impact_area: answers.q5,
        q6_general_text: answers.q6,
        q7_automation_text: answers.q7
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit (type: 'poll', no PII)
    await supabaseAdmin.from('connect_audit_logs').insert({
      event_id: eventId,
      type: 'poll',
      payload: { requestId, pollId: poll.id }
    });

    // Trigger real-time dashboard update via Supabase Realtime or webhook
    // (Implementation depends on dashboard architecture)

    return {
      statusCode: 200,
      body: JSON.stringify({ pollId: poll.id })
    };
  } catch (error) {
    console.error('Poll submit error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### 4. `ai-classify.js`
AI-powered persona classification.

```javascript
// netlify/functions/ai-classify.js
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '../../src/lib/supabase-client.js';

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { contactId, eventId, pollHints } = JSON.parse(event.body);

  try {
    // Fetch contact and poll data (if available)
    const { data: contact } = await supabaseAdmin
      .from('connect_contacts')
      .select('first_name, last_name, company, role')
      .eq('id', contactId)
      .single();

    const { data: attendance } = await supabaseAdmin
      .from('connect_attendances')
      .select('session_id')
      .eq('contact_id', contactId)
      .eq('event_id', eventId)
      .single();

    let pollData = null;
    if (attendance?.session_id) {
      const { data: poll } = await supabaseAdmin
        .from('connect_poll_responses')
        .select('q2_goal, q5_impact_area, q6_general_text, q7_automation_text')
        .eq('session_id', attendance.session_id)
        .single();
      pollData = poll;
    }

    // Build classification prompt
    const prompt = `Classify this business event attendee into a persona:

Name: ${contact.first_name} ${contact.last_name}
Company: ${contact.company || 'Unknown'}
Role: ${contact.role || 'Unknown'}
${pollData ? `
AI Goal: ${pollData.q2_goal === 'A' ? 'Save time' : pollData.q2_goal === 'B' ? 'Generate leads' : pollData.q2_goal === 'C' ? 'Improve communication' : 'New products'}
Impact Area: ${pollData.q5_impact_area === 'A' ? 'Marketing' : pollData.q5_impact_area === 'B' ? 'Operations' : pollData.q5_impact_area === 'C' ? 'Sales' : 'Analytics'}
Thoughts: ${pollData.q6_general_text || 'Not provided'}
Task to automate: ${pollData.q7_automation_text || 'Not provided'}
` : ''}

Respond with ONLY a JSON object:
{
  "persona_label": "string (e.g., 'Founder/Services', 'Ops/SMB')",
  "vertical": "string (e.g., 'Professional Services', 'Tech')",
  "maturity_tier": "early|growth|mature",
  "topics": ["array", "of", "hot", "topics"],
  "confidence_score": 0.85
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }]
    });

    const classification = JSON.parse(message.content[0].text);

    // Store classification
    const { data, error } = await supabaseAdmin
      .from('connect_classifications')
      .upsert({
        contact_id: contactId,
        persona_label: classification.persona_label,
        vertical: classification.vertical,
        maturity_tier: classification.maturity_tier,
        topics: classification.topics,
        confidence_score: classification.confidence_score,
        model_version: 'claude-sonnet-4-5'
      }, {
        onConflict: 'contact_id'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(classification)
    };
  } catch (error) {
    console.error('AI classify error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### 5. `ai-match.js`
Smart matchmaking suggestions.

```javascript
// netlify/functions/ai-match.js
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '../../src/lib/supabase-client.js';

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { contactId, eventId } = JSON.parse(event.body);

  try {
    // Get current contact + classification
    const { data: contact } = await supabaseAdmin
      .from('connect_contacts')
      .select('*, connect_classifications(*)')
      .eq('id', contactId)
      .single();

    // Get last 50 attendees with classifications
    const { data: recentAttendees } = await supabaseAdmin
      .from('connect_attendances')
      .select(`
        contact_id,
        connect_contacts(first_name, last_name, company, role),
        connect_classifications(persona_label, vertical, maturity_tier, topics)
      `)
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false })
      .limit(50);

    const attendeesList = recentAttendees
      .filter(a => a.contact_id !== contactId)
      .map(a => ({
        name: `${a.connect_contacts.first_name} ${a.connect_contacts.last_name}`,
        company: a.connect_contacts.company,
        role: a.connect_contacts.role,
        persona: a.connect_classifications?.persona_label
      }));

    // LLM prompt for matchmaking
    const prompt = `You are a networking matchmaker at a business event. Suggest the TOP 2 people this attendee should meet.

Current Attendee:
Name: ${contact.first_name} ${contact.last_name}
Company: ${contact.company}
Role: ${contact.role}
Persona: ${contact.connect_classifications?.persona_label || 'Unknown'}
Interests: ${contact.connect_classifications?.topics?.join(', ') || 'Unknown'}

Other Attendees (last 50):
${attendeesList.map((a, i) => `${i + 1}. ${a.name} - ${a.company} (${a.role}) [${a.persona}]`).join('\n')}

Respond with ONLY a JSON array of 2 suggestions:
[
  {
    "name": "Full Name",
    "company": "Company",
    "reason": "One sentence why they should meet"
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    const suggestions = JSON.parse(message.content[0].text);

    return {
      statusCode: 200,
      body: JSON.stringify({ suggestions })
    };
  } catch (error) {
    console.error('AI match error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, suggestions: [] })
    };
  }
}
```

### 6. `notify-sms.js`
Send SMS via Twilio.

```javascript
// netlify/functions/notify-sms.js
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TEMPLATES = {
  welcome: (name, eventName, wifi) =>
    `Hi ${name}! Welcome to ${eventName}. Wi-Fi: ${wifi.ssid} / ${wifi.password}. Reply STOP to opt out.`,
  feedback: (name, feedbackUrl) =>
    `Thanks for attending, ${name}! We'd love your feedback: ${feedbackUrl}. Reply STOP to opt out.`
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { phone, templateId, data } = JSON.parse(event.body);

  try {
    const message = TEMPLATES[templateId](...data);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sid: result.sid, status: result.status })
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### 7. `admin-health.js`
Kiosk health diagnostics.

```javascript
// netlify/functions/admin-health.js
import { supabaseAdmin } from '../../src/lib/supabase-client.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { kioskId } = event.queryStringParameters;

  try {
    // Update kiosk last_seen
    await supabaseAdmin
      .from('connect_kiosks')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', kioskId);

    // Check recent check-ins
    const { data: recentCheckins, error } = await supabaseAdmin
      .from('connect_attendances')
      .select('id, checked_in_at')
      .eq('kiosk_id', kioskId)
      .gte('checked_in_at', new Date(Date.now() - 3600000).toISOString())
      .order('checked_in_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Check pending sync actions (IndexedDB queue — client-side only)
    // This endpoint returns server health only

    return {
      statusCode: 200,
      body: JSON.stringify({
        kioskId,
        lastSeen: new Date().toISOString(),
        recentCheckinsCount: recentCheckins.length,
        serverHealthy: true
      })
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ serverHealthy: false, error: error.message })
    };
  }
}
```

---

## 📱 PWA Configuration

### Vite PWA Plugin Setup

**Edit:** `vite.config.js`

```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Disruptors Connect',
        short_name: 'Connect',
        description: 'Event check-in kiosk',
        theme_color: '#0B0B0F',
        background_color: '#0B0B0F',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/connect',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ubqxflzuvxowigbjmqfb\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.netlify\.app\/\.netlify\/functions\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'netlify-functions',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60
              }
            }
          }
        ],
        navigateFallback: '/connect',
        navigateFallbackAllowlist: [/^\/connect/]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
```

### Service Worker with Background Sync

**File:** `src/lib/connect/offline-queue.js`

```javascript
import { openDB } from 'idb';

const DB_NAME = 'disruptors-connect-queue';
const STORE_NAME = 'pending-actions';

// Initialize IndexedDB
export async function initOfflineQueue() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

// Add action to queue
export async function enqueueAction(action) {
  const db = await initOfflineQueue();
  const id = await db.add(STORE_NAME, {
    ...action,
    timestamp: Date.now(),
    retries: 0
  });
  console.log('[Offline Queue] Enqueued action:', id, action.type);
  return id;
}

// Get all pending actions
export async function getPendingActions() {
  const db = await initOfflineQueue();
  return db.getAll(STORE_NAME);
}

// Remove action from queue
export async function dequeueAction(id) {
  const db = await initOfflineQueue();
  await db.delete(STORE_NAME, id);
  console.log('[Offline Queue] Dequeued action:', id);
}

// Sync all pending actions
export async function syncPendingActions() {
  if (!navigator.onLine) {
    console.warn('[Offline Queue] Cannot sync: offline');
    return;
  }

  const actions = await getPendingActions();
  console.log(`[Offline Queue] Syncing ${actions.length} pending actions`);

  for (const action of actions) {
    try {
      const response = await fetch(action.url, {
        method: action.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...action.headers
        },
        body: JSON.stringify(action.payload)
      });

      if (response.ok) {
        await dequeueAction(action.id);
        console.log('[Offline Queue] Synced action:', action.id);
      } else {
        console.error('[Offline Queue] Sync failed:', action.id, response.status);

        // Update retry count
        const db = await initOfflineQueue();
        action.retries = (action.retries || 0) + 1;
        if (action.retries >= 5) {
          console.error('[Offline Queue] Max retries exceeded, removing:', action.id);
          await dequeueAction(action.id);
        } else {
          await db.put(STORE_NAME, action);
        }
      }
    } catch (error) {
      console.error('[Offline Queue] Sync error:', action.id, error);
    }
  }
}

// Listen for online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Offline Queue] Network restored, syncing...');
    syncPendingActions();
  });
}

// Background Sync registration
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in self.registration) {
    try {
      await self.registration.sync.register('sync-pending-actions');
      console.log('[Background Sync] Registered');
    } catch (error) {
      console.error('[Background Sync] Registration failed:', error);
    }
  }
}
```

### Wake Lock Hook

**File:** `src/hooks/connect/useWakeLock.js`

```javascript
import { useEffect, useState } from 'react';

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = async () => {
    if (!isSupported) {
      console.warn('[Wake Lock] Not supported');
      return false;
    }

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      setIsActive(true);
      console.log('[Wake Lock] Acquired');

      lock.addEventListener('release', () => {
        console.log('[Wake Lock] Released');
        setIsActive(false);
      });

      return true;
    } catch (error) {
      console.error('[Wake Lock] Request failed:', error);
      return false;
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsActive(false);
    }
  };

  // Re-acquire wake lock on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isActive && isSupported) {
        console.log('[Wake Lock] Re-acquiring after visibility change');
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isActive, isSupported]);

  return { requestWakeLock, releaseWakeLock, isActive, isSupported };
}
```

---

## 🎨 UI Components (Key Examples)

### QR Scanner Component

**File:** `src/components/connect/QRScanner.jsx`

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

export function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        const selectedDevice = videoInputDevices[0]?.deviceId;

        const constraints = {
          video: {
            deviceId: selectedDevice,
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        codeReader.decodeFromVideoDevice(
          selectedDevice,
          videoRef.current,
          (result, err) => {
            if (result) {
              console.log('[QR Scanner] Scanned:', result.text);
              playBeep();
              onScan(result.text);
              stopScanning();
            }
            if (err && !(err instanceof NotFoundException)) {
              console.error('[QR Scanner] Error:', err);
            }
          }
        );
      } catch (err) {
        console.error('[QR Scanner] Start error:', err);
        setError('Camera access denied. Please enable camera permissions.');
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan]);

  const toggleTorch = async () => {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (capabilities.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        });
        setTorchEnabled(!torchEnabled);
      } catch (err) {
        console.error('[QR Scanner] Torch error:', err);
      }
    }
  };

  const playBeep = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.frequency.value = 800;
    oscillator.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Scan QR Code</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="flex-1 object-cover"
        autoPlay
        playsInline
      />

      {/* Finder box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-4 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/50">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
        </div>
      </div>

      {/* Footer controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleTorch}
            variant="outline"
            className="bg-white/10 border-white/20 text-white"
          >
            <Camera className="mr-2 h-5 w-5" />
            {torchEnabled ? 'Torch Off' : 'Torch On'}
          </Button>
        </div>
        {error && (
          <p className="text-center text-red-400 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
```

### Poll Question Component

**File:** `src/components/connect/PollQuestion.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function PollQuestion({ question, options, value, onChange, className = '' }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-2xl font-bold text-white leading-tight">
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              w-full p-6 rounded-lg border-2 text-left transition-all
              flex items-start gap-4 group
              ${value === option.value
                ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-cyan-400/50 hover:bg-gray-800'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Checkbox */}
            <div className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${value === option.value
                ? 'border-cyan-400 bg-cyan-400'
                : 'border-gray-600 group-hover:border-cyan-400/50'
              }
            `}>
              {value === option.value && (
                <Check className="w-5 h-5 text-black" />
              )}
            </div>

            {/* Option text */}
            <div className="flex-1">
              <div className="text-lg font-medium text-white mb-1">
                {option.label}
              </div>
              <div className="text-sm text-gray-400">
                {option.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
```

### Match Card Component

**File:** `src/components/connect/MatchCard.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export function MatchCard({ name, company, reason, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-cyan-400/20 shadow-lg"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-cyan-400" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-1">
            {name}
          </h4>
          <p className="text-gray-400 text-sm mb-2">
            {company}
          </p>
          <p className="text-cyan-400 text-sm leading-relaxed">
            {reason}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal:** Database + basic routing + PWA shell

- [ ] Apply Supabase migration (`20251022_disruptors_connect.sql`)
- [ ] Install dependencies (zustand, idb, qrcode, @zxing/browser, vite-plugin-pwa)
- [ ] Add Connect routes to `src/pages/index.jsx`
- [ ] Create basic page stubs (Welcome, Intake, Poll, Success)
- [ ] Configure Vite PWA plugin
- [ ] Set up Zustand store
- [ ] Create offline queue (IndexedDB)

**Deliverables:** Working routes, PWA manifest, database ready

---

### Phase 2: Check-In Flow (Week 2)
**Goal:** Complete RSVP + walk-in flows

- [ ] Build Welcome screen with QR code generation
- [ ] Build QR Scanner component
- [ ] Build Intake form with validation
- [ ] Build Poll component with progress bar
- [ ] Build Success screen with confetti
- [ ] Implement phone/email normalization
- [ ] Create Netlify Functions: `checkin-resolve`, `checkin-confirm`, `poll-submit`
- [ ] Wire offline queue to sync on reconnect
- [ ] Implement wake lock hook

**Deliverables:** End-to-end check-in flow, offline support, wake lock

---

### Phase 3: AI Features (Week 3)
**Goal:** Deduplication + persona + matchmaking

- [ ] Create `ai-classify` Netlify Function
- [ ] Create `ai-match` Netlify Function
- [ ] Build MatchCard component
- [ ] Integrate deduplication in `checkin-confirm`
- [ ] Display match suggestions on Success screen
- [ ] Test AI failure modes (timeouts, errors)

**Deliverables:** Working AI classification and matchmaking

---

### Phase 4: Live Dashboard (Week 4)
**Goal:** Real-time poll visualization

- [ ] Build Dashboard page component
- [ ] Create poll aggregation queries
- [ ] Implement Supabase Realtime subscriptions
- [ ] Build charts (Recharts or Chart.js)
- [ ] Build word cloud for Q6/Q7
- [ ] Add projector-friendly fullscreen mode

**Deliverables:** Live updating dashboard

---

### Phase 5: Admin + SMS (Week 5)
**Goal:** Diagnostics + messaging

- [ ] Build Admin panel with health tiles
- [ ] Create `admin-health` Netlify Function
- [ ] Create `notify-sms` Netlify Function with Twilio
- [ ] Implement SMS welcome message trigger
- [ ] Implement post-event feedback SMS
- [ ] Add PIN gate to Admin panel

**Deliverables:** Admin diagnostics, SMS notifications

---

### Phase 6: Kiosk Hardening (Week 6)
**Goal:** Production-ready kiosk deployment

- [ ] Test Guided Access (iPad) / Screen Pinning (Android)
- [ ] Implement idle timeout (20s → reset)
- [ ] Add error boundary components
- [ ] Integrate Sentry for error tracking
- [ ] Implement PostHog analytics events
- [ ] Performance testing (TTI < 2.5s)
- [ ] Accessibility audit (WCAG AA)

**Deliverables:** Hardened kiosk ready for event

---

### Phase 7: Polish + Testing (Week 7)
**Goal:** QA + edge cases

- [ ] Test offline mode (flight mode test)
- [ ] Test deduplication (multiple scenarios)
- [ ] Test QR scanning (various codes)
- [ ] Test AI failures (graceful degradation)
- [ ] Test SMS delivery
- [ ] Test wake lock across devices
- [ ] Load testing (100+ concurrent check-ins)
- [ ] Final UI polish (animations, copy)

**Deliverables:** Production-ready system

---

## 🧪 Testing & Acceptance Criteria

### Happy Paths

✅ **RSVP QR scan** → Check-in in <5s
✅ **Phone/email lookup** → Check-in in <15s
✅ **Walk-in** → Submit → Badge print + SMS in <10s (online); queued (offline)
✅ **Wake Lock** remains active for 60+ minutes

### Edge Cases

✅ **Camera denied** → Fallback: manual code entry
✅ **No network** → Full offline capture queued; syncs on reconnect
✅ **Duplicate contact** → AI/entity resolution prompt
✅ **Printer missing** → No blocking; show "Badge desk printing"
✅ **AI timeout** → Degrades gracefully; no blocking

### Security

✅ **Admin panel** requires long-press + PIN
✅ **PII masked** on idle; auto-reset after 20s
✅ **Poll responses** have NO join to contacts table
✅ **RLS policies** enforced on all tables

---

## 📊 Analytics Events (PostHog)

```javascript
// Track these events:

// Kiosk lifecycle
'kiosk_visible'
'wake_lock_acquired'
'wake_lock_lost'

// Check-in flow
'qr_scanned'
'lookup_started'
'lookup_success'
'checkin_completed'
'walkin_started'
'walkin_submitted'

// Poll
'poll_started'
'poll_completed'
'consent_feedback_true'
'consent_feedback_false'

// AI
'ai_classify_success'
'ai_classify_error'
'match_suggested'

// Offline
'offline_enqueue'
'sync_success'
'sync_error'

// Printing
'badge_print_success'
'badge_print_error'
```

---

## 🔐 Security & Privacy

### PII Handling

- **Poll responses**: NEVER store with PII (session_id only)
- **Auto-clear**: Forms clear after 20s inactivity
- **RLS policies**: All tables require admin role for SELECT
- **Consent**: Respect opt-outs for SMS/email
- **Audit logs**: Track all admin actions

### API Security

- **Idempotency keys**: All POSTs accept `requestId`
- **Rate limiting**: Netlify Functions auto rate-limit
- **Input validation**: Normalize phone, sanitize inputs
- **CORS**: Restrict to event domain only

### GDPR/CCPA

- **Purpose notice**: Shown on Intake screen
- **Opt-out**: STOP keyword for SMS
- **Data deletion**: Email `privacy@disruptorsmedia.com` for deletion
- **Data retention**: 90 days post-event

---

## 📝 Content & Copy

### Welcome Screen
```
🎯 DISRUPTORS CONNECT
North Salt Lake Event Hall

[Large Button] Tap to Check In
[QR Code] Scan to continue on your phone

Already have a QR? [Camera icon]

Wi-Fi: DisruptorsEventHall / Disrupt2025
```

### Consent Copy
```
"Would you be open to giving us your honest feedback after the event?"

By checking Yes, you agree to receive event reminders and a short feedback survey.
Msg & data rates may apply. Reply STOP to opt out.
```

### Success Screen
```
🎉 You're In!

Your badge is printing...

✨ People You Should Meet Tonight:

[Match Card 1]
[Match Card 2]

Grab food, say hi, and make connections —
your best idea is one conversation away.
```

---

## 🎯 Success Metrics

### Speed
- Check-in time (RSVP): **<15s**
- Check-in time (walk-in): **<60s**
- TTI (Time to Interactive): **<2.5s**

### Reliability
- Offline success rate: **100%** (queued)
- Wake lock uptime: **>90%** per session
- AI success rate: **>80%** (non-blocking)

### Privacy
- Zero PII in poll responses: **100%**
- Consent respected: **100%**

---

## 🚢 Deployment Checklist

### Pre-Deploy

- [ ] Environment variables set (Supabase, Twilio, Anthropic)
- [ ] Database migration applied and verified
- [ ] PWA icons generated (192x192, 512x512)
- [ ] Netlify Functions tested locally
- [ ] Wake Lock tested on target device

### Kiosk Setup

- [ ] Install PWA (Add to Home Screen)
- [ ] Enable Guided Access (iPad) or Screen Pinning (Android)
- [ ] Confirm Wake Lock re-acquires on focus
- [ ] Camera test (QR scanning)
- [ ] Network test (offline → online sync)
- [ ] Admin PIN set and tested

### Go-Live

- [ ] Event created in `connect_events` table
- [ ] Kiosk record created with device fingerprint
- [ ] Welcome QR code printed (attractor signage)
- [ ] Dashboard open on projector (fullscreen)
- [ ] Staff briefed on Admin panel
- [ ] Emergency contact ready

---

## 📚 Reference Documentation

### External Resources

- **Screen Wake Lock API**: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
- **Background Sync**: https://developer.chrome.com/docs/workbox/modules/workbox-background-sync/
- **Guided Access (iPad)**: https://support.apple.com/guide/ipad/guided-access-ipad9f12683c/ipados
- **Screen Pinning (Android)**: https://support.google.com/android/answer/9455138
- **ZXing Browser**: https://github.com/zxing-js/browser
- **IndexedDB (idb)**: https://github.com/jakearchibald/idb
- **Vite PWA Plugin**: https://vite-pwa-org.netlify.app/

### Internal Docs (Create These)

- `docs/CONNECT_USER_GUIDE.md` - Staff guide for kiosk operation
- `docs/CONNECT_TROUBLESHOOTING.md` - Common issues and fixes
- `docs/CONNECT_API_REFERENCE.md` - Netlify Functions API specs
- `docs/CONNECT_PRIVACY_POLICY.md` - Privacy notice for attendees

---

## ✅ Final Master Build Prompt

```
BUILD: Disruptors Connect Check-In Kiosk System (Vite + React + Supabase)

STACK: Vite 6.1.0, React 18, React Router v7.2, Supabase, Netlify Functions,
       Tailwind CSS, shadcn/ui, Framer Motion, Zustand, IndexedDB (idb),
       @zxing/browser, qrcode, vite-plugin-pwa

ROUTES: /connect (Welcome), /connect/checkin (Intake), /connect/poll (Poll),
        /connect/success (Success), /connect/dashboard (Live Results),
        /connect/admin (Diagnostics)

DATABASE: Apply migration `supabase/migrations/20251022_disruptors_connect.sql`
          Tables: connect_events, connect_kiosks, connect_contacts,
                  connect_attendances, connect_poll_responses (anonymous),
                  connect_classifications, connect_audit_logs

FUNCTIONS: checkin-resolve, checkin-confirm, poll-submit, ai-classify,
           ai-match, notify-sms, admin-health

FEATURES:
1. RSVP check-in via QR scan or phone/email lookup (<15s)
2. Walk-in flow: Name, Phone, Feedback consent → Poll (7 questions) → Success
3. Anonymous poll: Q1-Q5 multiple choice, Q6-Q7 long text (NO PII linkage)
4. AI persona classification (Claude Sonnet 4.5, non-blocking)
5. Smart matchmaking: Suggest 2 people to meet with reasons
6. Offline-first: IndexedDB queue + Background Sync
7. Wake Lock: Keep screen on, re-acquire on visibility change
8. SMS notifications: Welcome message + post-event feedback (Twilio)
9. Live dashboard: Real-time poll results with charts (Supabase Realtime)
10. Admin panel: Health tiles, diagnostics, PIN-gated

KIOSK MODE: Full-screen PWA, Guided Access (iPad) / Screen Pinning (Android)

PRIVACY: Poll responses stored with session_id only (NO foreign key to contacts)
         Auto-clear forms after 20s idle, RLS on all tables

ACCEPTANCE:
- Check-in <15s (RSVP), <60s (walk-in)
- Works offline, syncs on reconnect
- Wake Lock active 60+ min
- AI fails soft (never blocks)
- Zero PII in poll table

BRAND: Deep charcoal (#0B0B0F), neon cyan (#4FF0E8), neon magenta (#F738A5)
       Inter font, Framer Motion animations, 60fps

DELIVERABLES: Complete system in 7 weeks (phased roadmap provided above)

SEE: docs/DISRUPTORS_CONNECT_IMPLEMENTATION_SPEC.md for full specification
```

---

**End of Specification**

**Next Steps:**
1. Review this spec with team
2. Provision environment variables (Supabase, Twilio, Anthropic)
3. Start Phase 1 (Foundation)
4. Schedule weekly check-ins

**Questions?** Contact implementation lead or see troubleshooting guide.
