-- Event Check-ins and Survey Responses Migration
-- Tracks all event attendees and their survey responses

-- Event Check-ins Table
CREATE TABLE IF NOT EXISTS event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  job_title TEXT,
  event_name TEXT DEFAULT 'Disruptors Event',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Survey responses (flexible JSON structure)
  survey_responses JSONB DEFAULT '{}',

  -- Metadata
  referral_source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_event_checkins_email ON event_checkins(email);
CREATE INDEX IF NOT EXISTS idx_event_checkins_company ON event_checkins(company);
CREATE INDEX IF NOT EXISTS idx_event_checkins_event_name ON event_checkins(event_name);
CREATE INDEX IF NOT EXISTS idx_event_checkins_checked_in_at ON event_checkins(checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_checkins_created_at ON event_checkins(created_at DESC);

-- Add GIN index for survey_responses JSONB searches
CREATE INDEX IF NOT EXISTS idx_event_checkins_survey_responses ON event_checkins USING GIN (survey_responses);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_event_checkins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_checkins_updated_at
  BEFORE UPDATE ON event_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_event_checkins_updated_at();

-- Add RLS policies
ALTER TABLE event_checkins ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for admin access)
CREATE POLICY "Service role can manage event checkins"
  ON event_checkins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon users can insert (for public check-in form)
CREATE POLICY "Anyone can check in to events"
  ON event_checkins
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Optional: Authenticated users can view their own check-ins
CREATE POLICY "Users can view their own checkins"
  ON event_checkins
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Add comment
COMMENT ON TABLE event_checkins IS 'Tracks event attendees and their survey responses';
COMMENT ON COLUMN event_checkins.survey_responses IS 'Flexible JSONB field for storing survey question/answer pairs';
