-- Change Requests AI Analysis Enhancement
-- Adds support for AI-powered document analysis and bulk change request creation

-- Add columns to track AI analysis metadata
ALTER TABLE change_requests
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('manual', 'ai_text', 'ai_image', 'ai_pdf')),
ADD COLUMN IF NOT EXISTS source_document_url TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis_id UUID,
ADD COLUMN IF NOT EXISTS batch_id UUID,
ADD COLUMN IF NOT EXISTS task_items JSONB DEFAULT '[]';

-- Create table to track AI analysis sessions
CREATE TABLE IF NOT EXISTS change_request_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('text', 'image', 'pdf')),
  source_content TEXT,
  source_document_url TEXT,
  raw_ai_response TEXT,
  parsed_requests JSONB,
  requests_created INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_change_requests_batch_id ON change_requests(batch_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_source_type ON change_requests(source_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_status ON change_request_ai_analyses(status);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON change_request_ai_analyses(created_at DESC);

-- Add RLS policies for AI analyses table
ALTER TABLE change_request_ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage AI analyses"
  ON change_request_ai_analyses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view AI analyses"
  ON change_request_ai_analyses
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comments
COMMENT ON TABLE change_request_ai_analyses IS 'Tracks AI-powered document analysis sessions for change request extraction';
COMMENT ON COLUMN change_requests.source_type IS 'How the request was created: manual, ai_text, ai_image, ai_pdf';
COMMENT ON COLUMN change_requests.source_document_url IS 'URL to uploaded document if applicable';
COMMENT ON COLUMN change_requests.ai_analysis_id IS 'Reference to AI analysis session';
COMMENT ON COLUMN change_requests.batch_id IS 'Groups multiple requests created from same analysis';
COMMENT ON COLUMN change_requests.task_items IS 'Detailed task breakdown for complex requests';
