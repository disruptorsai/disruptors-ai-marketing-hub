-- Change Requests Table Migration
-- Tracks all website change requests with status, priority, and categorization

CREATE TABLE IF NOT EXISTS change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  change_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT DEFAULT 'other' CHECK (category IN ('bug_fix', 'feature', 'content_change', 'design_change', 'performance', 'security', 'other')),
  notes TEXT,
  approved_by TEXT,
  completed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_priority ON change_requests(priority);
CREATE INDEX IF NOT EXISTS idx_change_requests_category ON change_requests(category);
CREATE INDEX IF NOT EXISTS idx_change_requests_created_at ON change_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_requests_requester ON change_requests(requester_name);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_change_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER change_requests_updated_at
  BEFORE UPDATE ON change_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_change_requests_updated_at();

-- Add RLS policies (admin only)
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage change requests"
  ON change_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view (for potential future use)
CREATE POLICY "Authenticated users can view change requests"
  ON change_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE change_requests IS 'Tracks all website change requests from team members with full lifecycle management';
COMMENT ON COLUMN change_requests.requester_name IS 'Full name of person requesting the change';
COMMENT ON COLUMN change_requests.requester_email IS 'Email address of requester (optional)';
COMMENT ON COLUMN change_requests.change_description IS 'Detailed description of the requested change';
COMMENT ON COLUMN change_requests.status IS 'Current status: pending, approved, in_progress, completed, rejected';
COMMENT ON COLUMN change_requests.priority IS 'Priority level: low, medium, high, urgent';
COMMENT ON COLUMN change_requests.category IS 'Type of change: bug_fix, feature, content_change, design_change, performance, security, other';
COMMENT ON COLUMN change_requests.notes IS 'Admin notes or additional context';
COMMENT ON COLUMN change_requests.approved_by IS 'Name of person who approved the request';
COMMENT ON COLUMN change_requests.completed_by IS 'Name of person who completed the request';
