-- Create change_requests table with ACTUAL schema from OLD project
-- Run this in NEW Supabase project SQL Editor

CREATE TABLE IF NOT EXISTS change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT,
  requester_email TEXT,
  change_description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  notes TEXT,
  approved_by TEXT,
  completed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  source_type TEXT,
  source_document_url TEXT,
  ai_analysis_id UUID,
  batch_id UUID,
  task_items JSONB,
  automation_feasibility TEXT,
  automation_analysis JSONB,
  automation_confidence NUMERIC,
  automation_blockers JSONB,
  automation_recommendations JSONB,
  analyzed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all for authenticated users"
  ON change_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for service role"
  ON change_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify table created
SELECT 'change_requests table created successfully' AS status;
