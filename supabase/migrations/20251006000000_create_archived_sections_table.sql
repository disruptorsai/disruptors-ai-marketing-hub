-- Create archived_sections table for graveyard archive system
-- This table stores all deleted/removed sections from the site

CREATE TABLE IF NOT EXISTS archived_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_content JSONB NOT NULL,
  removed_from_page TEXT NOT NULL,
  section_type TEXT,
  section_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  removed_at TIMESTAMPTZ DEFAULT now(),
  removed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_archived_sections_removed_from_page ON archived_sections(removed_from_page);
CREATE INDEX IF NOT EXISTS idx_archived_sections_removed_at ON archived_sections(removed_at DESC);
CREATE INDEX IF NOT EXISTS idx_archived_sections_section_type ON archived_sections(section_type);

-- Enable Row Level Security
ALTER TABLE archived_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view archived sections (public read)
CREATE POLICY "Allow public read access to archived_sections"
  ON archived_sections
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert archived sections
CREATE POLICY "Allow authenticated users to insert archived_sections"
  ON archived_sections
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only the user who archived a section can update it
CREATE POLICY "Allow users to update their own archived_sections"
  ON archived_sections
  FOR UPDATE
  USING (auth.uid() = removed_by);

-- Policy: Only service role can delete archived sections (admin only)
CREATE POLICY "Allow service role to delete archived_sections"
  ON archived_sections
  FOR DELETE
  USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_archived_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_archived_sections_updated_at
  BEFORE UPDATE ON archived_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_archived_sections_updated_at();

-- Add helpful comment
COMMENT ON TABLE archived_sections IS 'Stores deleted/removed sections from the website for historical reference and potential restoration';
