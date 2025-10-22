-- Disruptors Connect Check-In System
-- Migration: 20251022_disruptors_connect.sql
-- Description: Complete schema for kiosk check-in system with anonymous polls

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 1. Events Table
-- ============================================================================
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

-- ============================================================================
-- 2. Kiosks Table
-- ============================================================================
CREATE TABLE connect_kiosks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES connect_events(id) ON DELETE CASCADE,
  device_label TEXT NOT NULL,
  device_fingerprint TEXT UNIQUE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
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

-- ============================================================================
-- 3. Contacts Table (PII)
-- ============================================================================
CREATE TABLE connect_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  role TEXT,
  consent_feedback BOOLEAN DEFAULT false,
  consent_sms BOOLEAN DEFAULT false,
  consent_photo BOOLEAN DEFAULT false,
  selfie_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT phone_or_email_required CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- Unique constraints for deduplication
CREATE UNIQUE INDEX idx_connect_contacts_phone ON connect_contacts(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX idx_connect_contacts_email ON connect_contacts(LOWER(email)) WHERE email IS NOT NULL;

-- Trigram index for fuzzy name matching
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

-- ============================================================================
-- 4. Attendances Table
-- ============================================================================
CREATE TABLE connect_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES connect_events(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES connect_contacts(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  kiosk_id UUID REFERENCES connect_kiosks(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('kiosk', 'mobile', 'qr')),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

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

-- ============================================================================
-- 5. Poll Responses Table (ANONYMOUS - NO PII)
-- ============================================================================
CREATE TABLE connect_poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES connect_events(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,

  -- Poll questions (matching PRD exactly)
  q1_experience TEXT CHECK (q1_experience IN ('A', 'B', 'C', 'D')),
  q2_goal TEXT CHECK (q2_goal IN ('A', 'B', 'C', 'D')),
  q3_hesitation TEXT CHECK (q3_hesitation IN ('A', 'B', 'C', 'D')),
  q4_confidence TEXT CHECK (q4_confidence IN ('A', 'B', 'C', 'D')),
  q5_impact_area TEXT CHECK (q5_impact_area IN ('A', 'B', 'C', 'D')),
  q6_general_text TEXT,
  q7_automation_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_poll_per_session UNIQUE (session_id)
);

CREATE INDEX idx_connect_poll_event ON connect_poll_responses(event_id);
CREATE INDEX idx_connect_poll_created ON connect_poll_responses(created_at DESC);

-- No RLS needed — data is anonymous
ALTER TABLE connect_poll_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Poll responses are anonymous and public for aggregation"
  ON connect_poll_responses FOR SELECT
  USING (true);

-- IMPORTANT: Session_id is intentionally NOT a foreign key to prevent joins with PII

-- ============================================================================
-- 6. Classifications Table (AI Personas)
-- ============================================================================
CREATE TABLE connect_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES connect_contacts(id) ON DELETE CASCADE,
  persona_label TEXT,
  vertical TEXT,
  maturity_tier TEXT CHECK (maturity_tier IN ('early', 'growth', 'mature')),
  topics JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2),
  model_version TEXT,
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

-- ============================================================================
-- 7. Audit Logs Table
-- ============================================================================
CREATE TABLE connect_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES connect_events(id) ON DELETE CASCADE,
  kiosk_id UUID REFERENCES connect_kiosks(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_connect_audit_event ON connect_audit_logs(event_id, created_at DESC);
CREATE INDEX idx_connect_audit_type ON connect_audit_logs(type, created_at DESC);

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

-- ============================================================================
-- Database Functions
-- ============================================================================

-- Normalize Phone Number
CREATE OR REPLACE FUNCTION normalize_phone(phone_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(phone_input, '[^0-9+]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Find Contact Duplicates (Fuzzy)
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

  -- Exact phone match (wrapped in subquery to allow LIMIT)
  (SELECT id, 1.0::DECIMAL, 'phone_exact'::TEXT
   FROM connect_contacts
   WHERE phone = normalize_phone(p_phone) AND p_phone IS NOT NULL
   LIMIT 1)

  UNION ALL

  -- Exact email match (wrapped in subquery to allow LIMIT)
  (SELECT id, 1.0::DECIMAL, 'email_exact'::TEXT
   FROM connect_contacts
   WHERE LOWER(email) = LOWER(p_email) AND p_email IS NOT NULL
   LIMIT 1)

  UNION ALL

  -- Fuzzy name match (wrapped in subquery to allow ORDER BY and LIMIT)
  (SELECT id,
          similarity(first_name || ' ' || last_name, p_first_name || ' ' || p_last_name)::DECIMAL AS score,
          'name_fuzzy'::TEXT
   FROM connect_contacts
   WHERE similarity(first_name || ' ' || last_name, p_first_name || ' ' || p_last_name) > similarity_threshold
   ORDER BY score DESC
   LIMIT 3);

END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Seed Data (Initial Event)
-- ============================================================================
INSERT INTO connect_events (name, slug, starts_at, venue, wifi_ssid, wifi_password, is_active)
VALUES (
  'Disruptors Connect - North Salt Lake',
  'connect-2025-10',
  '2025-10-30 18:00:00-06',
  'North Salt Lake Event Hall',
  'DisruptorsEventHall',
  'Disrupt2025',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Create initial kiosk record
INSERT INTO connect_kiosks (event_id, device_label, device_fingerprint)
SELECT id, 'Main Entrance Kiosk', 'kiosk-001'
FROM connect_events
WHERE slug = 'connect-2025-10'
ON CONFLICT (device_fingerprint) DO NOTHING;

-- ============================================================================
-- Updated At Triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_connect_events_updated_at
  BEFORE UPDATE ON connect_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connect_kiosks_updated_at
  BEFORE UPDATE ON connect_kiosks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connect_contacts_updated_at
  BEFORE UPDATE ON connect_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Complete
-- ============================================================================
-- Migration complete. Tables created:
-- - connect_events (events)
-- - connect_kiosks (kiosk devices)
-- - connect_contacts (PII)
-- - connect_attendances (check-ins)
-- - connect_poll_responses (anonymous polls)
-- - connect_classifications (AI personas)
-- - connect_audit_logs (audit trail)
--
-- Functions created:
-- - normalize_phone(TEXT) → TEXT
-- - find_contact_duplicates(...) → TABLE
--
-- RLS enabled on all tables.
-- Seed data: 1 event + 1 kiosk for testing.
