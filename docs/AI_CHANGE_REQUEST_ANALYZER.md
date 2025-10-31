# AI-Powered Change Request Analyzer

## Overview

The AI Change Request Analyzer is an advanced feature in the Change Requests Manager that uses OpenAI GPT-4 Vision to automatically extract, categorize, and create structured change requests from various input sources.

**Location**: Admin Panel → Change Requests → "AI Analyzer" button

**Powered by**: OpenAI GPT-4 Turbo with Vision (`gpt-4o`)

## Features

### Input Methods

1. **Text Paste**
   - Paste plain text containing change requests
   - Supports lists, paragraphs, or structured text
   - AI extracts individual requests automatically

2. **Image Upload**
   - Upload screenshots, mockups, wireframes
   - Supports JPEG, PNG, WebP (max 10MB)
   - AI reads text from images using OCR
   - Perfect for annotated screenshots or design feedback

3. **PDF Upload**
   - Upload PDF documents with change requests
   - Supports text-based PDFs (max 10MB)
   - Text is extracted and analyzed
   - Note: Image-based PDFs should be uploaded as images instead

### Automatic Processing

The AI automatically:

- **Extracts individual change requests** - Separates multiple requests into distinct items
- **Categorizes requests** - Assigns category (bug_fix, feature, content_change, design_change, performance, security, other)
- **Prioritizes requests** - Determines priority (low, medium, high, urgent) based on urgency keywords
- **Creates task breakdowns** - Generates detailed, actionable task lists for complex requests
- **Groups related requests** - Links requests from the same analysis session via batch_id

## How to Use

### Step 1: Open AI Analyzer

1. Navigate to **Admin Panel** → **Change Requests**
2. Click the **"AI Analyzer"** button (purple button with sparkles icon)
3. The AI Analyzer form will expand

### Step 2: Enter Team Member Info

- **Team Member Name** (required): Person who submitted the change requests
- **Email** (optional): Contact email for the requester

### Step 3: Choose Input Method

Select one of three tabs:

#### Option A: Paste Text
```
Example input:

- Fix the contact form validation - email field accepts invalid emails
- Update hero section with new tagline: "AI-Powered Marketing Made Simple"
- Add testimonial slider to homepage with 5 client reviews
- URGENT: Homepage loads slowly on mobile, needs optimization
```

#### Option B: Upload Image
- Click "Choose File" or drag-and-drop
- Upload screenshot, mockup, or annotated design
- Preview will appear below
- AI will read all visible text and extract requests

#### Option C: Upload PDF
- Click "Choose File"
- Upload text-based PDF document
- File info will appear below
- AI extracts text and processes requests

### Step 4: Analyze & Create

1. Click **"Analyze & Create Requests"**
2. Wait for AI processing (usually 5-15 seconds)
3. Success message shows number of requests created
4. Requests automatically appear in the table below

## Example Outputs

### Input (Text):
```
- Contact form isn't validating emails properly
- Need to update the hero section copy
- Add a new testimonial from Acme Corp
- Homepage performance is slow on mobile devices
```

### Output (4 Change Requests Created):

1. **Fix contact form email validation**
   - Category: Bug Fix
   - Priority: High
   - Tasks:
     - Add email regex validation to form input
     - Display error message for invalid email format
     - Test with various email formats
     - Update form submission logic

2. **Update hero section copy**
   - Category: Content Change
   - Priority: Medium
   - Tasks:
     - Review new copy with marketing team
     - Update HeroSection.jsx component
     - Test copy on different screen sizes
     - Deploy changes to dev environment

3. **Add Acme Corp testimonial**
   - Category: Content Change
   - Priority: Medium
   - Tasks:
     - Collect testimonial text and company details
     - Add testimonial to testimonials database
     - Update testimonials component to display new entry
     - Verify testimonial appears on homepage

4. **Optimize mobile homepage performance**
   - Category: Performance
   - Priority: High
   - Tasks:
     - Run Lighthouse audit on mobile
     - Identify performance bottlenecks
     - Optimize images and lazy loading
     - Implement code splitting for mobile
     - Re-test and verify improvements

## Technical Details

### Database Schema

#### New Table: `change_request_ai_analyses`
Tracks AI analysis sessions:

```sql
- id (UUID)
- requester_name (TEXT)
- requester_email (TEXT)
- source_type (TEXT): 'text' | 'image' | 'pdf'
- source_content (TEXT): Original text content
- source_document_url (TEXT): URL to uploaded file
- raw_ai_response (TEXT): Raw GPT-4 output
- parsed_requests (JSONB): Structured request data
- requests_created (INTEGER): Count of created requests
- status (TEXT): 'processing' | 'completed' | 'failed'
- error_message (TEXT): Error details if failed
- created_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
```

#### Enhanced Table: `change_requests`
New columns added:

```sql
- source_type (TEXT): 'manual' | 'ai_text' | 'ai_image' | 'ai_pdf'
- source_document_url (TEXT): Reference to uploaded document
- ai_analysis_id (UUID): Links to analysis session
- batch_id (UUID): Groups requests from same analysis
- task_items (JSONB): Array of detailed tasks
```

### API Endpoint

**Netlify Function**: `/.netlify/functions/change-request-analyze`

**Method**: POST

**Request Body**:
```json
{
  "requesterName": "John Doe",
  "requesterEmail": "john@example.com",
  "sourceType": "text|image|pdf",
  "content": "text content or base64 encoded file",
  "documentUrl": "optional URL to uploaded file"
}
```

**Response**:
```json
{
  "success": true,
  "analysisId": "uuid",
  "batchId": "uuid",
  "requestsCreated": 4,
  "requests": [...],
  "message": "Successfully created 4 change request(s)"
}
```

### AI Model Configuration

- **Model**: `gpt-4o` (GPT-4 Turbo with Vision)
- **Temperature**: 0.3 (lower for more structured output)
- **Max Tokens**: 4000
- **Vision Capability**: Enabled for image analysis

### System Prompt

The AI uses a specialized system prompt that instructs it to:

1. Extract all distinct change requests
2. Categorize each request accurately
3. Assign priority based on urgency keywords
4. Break down complex requests into actionable tasks
5. Return structured JSON output only

## Best Practices

### For Text Input
- Use bullet points or numbered lists for clarity
- Include urgency keywords (URGENT, ASAP, critical) for high-priority items
- Be specific about what needs to change
- Provide context when necessary

### For Image Input
- Use clear, readable text in images
- Annotate screenshots with notes/arrows
- Ensure good contrast and lighting
- Supported formats: JPEG, PNG, WebP

### For PDF Input
- Use text-based PDFs (not scanned images)
- Keep file size under 10MB
- Ensure text is selectable/copyable
- For scanned PDFs, convert to images first

### General Tips
- Review AI-generated requests before approval
- AI assigns "pending" status for manual review
- Edit priorities/categories if AI misclassified
- Use batch_id to track related requests
- Check task_items for detailed breakdowns

## Error Handling

### Common Issues

**"No change requests found"**
- Input may be too vague or ambiguous
- Try rephrasing with clearer language
- Break complex text into distinct bullet points

**"PDF contains no readable text"**
- PDF may be image-based (scanned document)
- Solution: Upload as image instead
- Or use OCR tool to create text-based PDF

**"File size must be less than 10MB"**
- Reduce image resolution
- Compress PDF file
- Split large documents into multiple uploads

**"Analysis failed"**
- Check network connection
- Verify OpenAI API key is configured
- Try again with simpler input
- Contact admin if persists

## Security & Privacy

- All AI analysis is performed via OpenAI API
- Document content is sent to OpenAI for processing
- Results are stored in Supabase database
- RLS policies restrict access to authenticated users
- Service role handles all data operations
- No permanent storage of uploaded files (processed in memory)

## Cost Considerations

### OpenAI API Costs

- **GPT-4o Pricing** (as of 2025):
  - Input: ~$2.50 per 1M tokens
  - Output: ~$10 per 1M tokens

- **Average Analysis Cost**: $0.01 - $0.05 per analysis
  - Text: ~500-1000 tokens input, ~500-2000 tokens output
  - Image: ~1000-2000 tokens (vision), ~500-2000 tokens output
  - PDF: Varies by document length

### Budget Management

- Monitor usage via OpenAI dashboard
- Set rate limits if needed
- Track analysis counts via `change_request_ai_analyses` table
- Consider batch processing for cost efficiency

## Future Enhancements

Potential improvements:

- [ ] Support for multiple file uploads in one analysis
- [ ] Integration with project management tools (Jira, Asana)
- [ ] Custom category definitions per organization
- [ ] AI learning from manual edits/corrections
- [ ] Voice memo upload and transcription
- [ ] Real-time collaborative analysis
- [ ] Analytics dashboard for AI accuracy metrics
- [ ] Automated email notifications for high-priority requests

## Migration Instructions

### Apply Database Migration

**Option 1: Via Supabase SQL Editor (Recommended)**
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/20250131_change_requests_ai_analysis.sql`
4. Paste and run the SQL

**Option 2: Via Migration Script**
```bash
node scripts/apply-change-requests-ai-migration.js
```

### Verify Migration

Check that new columns exist:
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'change_requests'
AND column_name IN ('source_type', 'batch_id', 'task_items');
```

Check that new table exists:
```sql
SELECT * FROM change_request_ai_analyses LIMIT 1;
```

## Support

For issues or questions:
- Check error messages in browser console
- Review Netlify function logs
- Verify OpenAI API key is valid
- Ensure database migration was applied
- Contact development team for assistance

## Related Documentation

- [Change Requests System](./systems/CHANGE_REQUESTS.md)
- [Admin Nexus](./systems/ADMIN_NEXUS.md)
- [AI Services Integration](./systems/AI_GENERATION.md)
- [Netlify Functions](./architecture/NETLIFY_FUNCTIONS.md)
