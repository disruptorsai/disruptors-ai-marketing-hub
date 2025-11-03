-- Add Automation Feasibility Analysis to Change Requests
-- Determines which requests can be completed by AI coding assistants (Claude Code/Cursor)

ALTER TABLE change_requests
ADD COLUMN IF NOT EXISTS automation_feasibility TEXT CHECK (automation_feasibility IN ('not_analyzed', 'fully_automatable', 'partially_automatable', 'manual_required', 'external_required')),
ADD COLUMN IF NOT EXISTS automation_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS automation_confidence NUMERIC(3,2) CHECK (automation_confidence >= 0 AND automation_confidence <= 1),
ADD COLUMN IF NOT EXISTS automation_blockers TEXT[],
ADD COLUMN IF NOT EXISTS automation_recommendations TEXT,
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;

-- Set default for existing records
UPDATE change_requests
SET automation_feasibility = 'not_analyzed'
WHERE automation_feasibility IS NULL;

-- Add index for filtering by automation feasibility
CREATE INDEX IF NOT EXISTS idx_change_requests_automation_feasibility
ON change_requests(automation_feasibility);

-- Add comments
COMMENT ON COLUMN change_requests.automation_feasibility IS 'Whether request can be automated: not_analyzed, fully_automatable, partially_automatable, manual_required, external_required';
COMMENT ON COLUMN change_requests.automation_analysis IS 'Detailed AI analysis of automation potential including tool recommendations';
COMMENT ON COLUMN change_requests.automation_confidence IS 'Confidence score (0-1) in automation feasibility assessment';
COMMENT ON COLUMN change_requests.automation_blockers IS 'Array of specific blockers preventing full automation';
COMMENT ON COLUMN change_requests.automation_recommendations IS 'Recommendations for completing the request (tools, approach, steps)';
COMMENT ON COLUMN change_requests.analyzed_at IS 'When automation feasibility was analyzed';
