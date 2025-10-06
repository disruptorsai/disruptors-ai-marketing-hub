# Screenshot Capture System Documentation

## Overview

The Screenshot Capture System is an automated visual change tracking system for the Disruptors AI Marketing Hub. It captures full-page screenshots before and after changes, stores them in Cloudinary, and maintains metadata in Supabase for easy comparison and historical tracking.

## Architecture

### Core Components

1. **Screenshot Capture Library** (`src/lib/screenshot-capture.js`)
   - Handles screenshot capture operations
   - Manages Cloudinary uploads
   - Stores metadata in Supabase

2. **Pre-Change Hook** (`src/hooks/usePreChangeScreenshot.js`)
   - React hook for component-level screenshot capture
   - Automatically triggers before state changes
   - Non-blocking and development-friendly

3. **Screenshot Manager Page** (`src/pages/ScreenshotManager.jsx`)
   - Hidden admin page at `/screenshot-manager`
   - Gallery view, timeline view, and before/after comparisons
   - Filter by page, date, viewport
   - Batch download and management

4. **CLI Tool** (`scripts/capture-screenshot.js`)
   - Command-line screenshot capture using Playwright
   - Batch capture all pages
   - Before/after screenshot linking

5. **Netlify Function** (`netlify/functions/screenshot-capture.js`)
   - Serverless API endpoint for browser-based captures
   - Playwright integration in serverless environment

6. **GitHub Actions** (`.github/workflows/capture-screenshots.yml`)
   - Automated screenshot capture on PRs
   - Visual diff reporting in PR comments

7. **Database Schema** (`supabase/migrations/20250106000000_create_screenshots_table.sql`)
   - `page_screenshots` table with metadata
   - `screenshot_pairs` view for before/after comparisons
   - Helper functions for querying and cleanup

## Installation & Setup

### 1. Install Dependencies

The required dependencies are already included in `package.json`:

```bash
npm install
```

Key dependencies:
- `playwright` - Headless browser for screenshot capture
- `cloudinary` - Image storage and CDN
- `@supabase/supabase-js` - Database for metadata
- `uuid` - Unique ID generation

### 2. Install Playwright Browsers

```bash
npx playwright install chromium --with-deps
```

### 3. Environment Variables

Add to your `.env` file:

```bash
# Cloudinary (Required)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application URL (Optional - defaults to localhost)
VITE_APP_URL=https://dm4.wjwelsh.com
```

### 4. Run Database Migration

```bash
npm run db:setup
```

Or manually run the migration file:

```sql
-- See: supabase/migrations/20250106000000_create_screenshots_table.sql
```

## Usage

### Command-Line Usage

#### Capture Single Page

```bash
npm run screenshot:capture -- --page=/home --change="Update hero section layout"
```

Options:
- `--page=/path` - Page route to capture (required unless using --all)
- `--change="Description"` - Change description (required)
- `--viewports=desktop,mobile` - Comma-separated viewports (default: desktop)
- `--before` - Capture before change (default)
- `--after` - Capture after change
- `--change-id=ID` - Related change ID for linking before/after

#### Capture All Pages

```bash
npm run screenshot:all -- --change="Pre-deployment check"
```

#### Batch Capture with Multiple Viewports

```bash
npm run screenshot:batch -- --change="Responsive design update"
```

This captures all pages in desktop, tablet, and mobile viewports.

#### Before/After Workflow

```bash
# 1. Capture BEFORE screenshots
npm run screenshot:capture -- --page=/home --change="Full-width header redesign"
# Note the Change ID from output

# 2. Make your changes to the code

# 3. Capture AFTER screenshots
npm run screenshot:capture -- --after --change-id="change-1735000000000-abc123" --page=/home
```

### React Hook Usage

#### Basic Usage

```jsx
import { usePreChangeScreenshot } from '@/hooks/usePreChangeScreenshot';

function MyComponent() {
  const { smartCapture, captureAfterChange } = usePreChangeScreenshot({
    viewports: ['desktop', 'mobile']
  });

  const handleUpdate = async () => {
    // Capture before change (prompts for description)
    const changeId = await smartCapture();

    if (!changeId) return; // User cancelled

    // Make your changes
    await updateComponent();

    // Capture after change
    await captureAfterChange(changeId);
  };

  return <button onClick={handleUpdate}>Update Component</button>;
}
```

#### Manual Description

```jsx
const { captureBeforeChange, captureAfterChange } = usePreChangeScreenshot({
  promptForDescription: false
});

const handleCustomChange = async () => {
  const changeId = await captureBeforeChange('Convert header to full-width');
  // ... make changes ...
  await captureAfterChange(changeId);
};
```

#### Standalone Capture

```jsx
const { manualCapture } = usePreChangeScreenshot();

const captureCurrentState = async () => {
  await manualCapture('Current homepage state before redesign', {
    viewports: ['desktop', 'tablet', 'mobile']
  });
};
```

### Screenshot Manager UI

Access the Screenshot Manager at:

```
https://dm4.wjwelsh.com/screenshot-manager
```

Or locally:

```
http://localhost:5173/screenshot-manager
```

Features:
- **Gallery View**: Grid of all screenshots with metadata
- **Timeline View**: Chronological list of captures
- **Before/After Pairs**: Side-by-side comparisons
- **Filters**: By page, viewport, date range, search query
- **Actions**: Download, delete, open in new tab, compare

## Viewport Sizes

The system supports 4 standard viewport sizes:

| Viewport | Dimensions | Use Case |
|----------|------------|----------|
| desktop | 1920x1080 | Standard desktop display |
| tablet | 768x1024 | iPad and tablet devices |
| mobile | 375x667 | iPhone and mobile devices |
| large-desktop | 2560x1440 | Large desktop displays |

## Storage Organization

Screenshots are stored in Cloudinary with organized folder structure:

```
disruptors-media/screenshots/
  2025/
    01/
      06/
        home_full-width-header-redesign_20250106-143022_desktop.png
        about_team-section-update_20250106-150315_mobile.png
```

Filename format:
```
{page-slug}_{change-description-slug}_{YYYYMMDD-HHMMSS}_{viewport}.png
```

## Database Schema

### `page_screenshots` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| page_route | TEXT | Page URL path (e.g., /home) |
| change_description | TEXT | Description of the change |
| screenshot_url | TEXT | Cloudinary URL |
| viewport_size | TEXT | Viewport identifier |
| captured_at | TIMESTAMPTZ | Capture timestamp |
| captured_before_change | BOOLEAN | Before or after flag |
| related_change_id | TEXT | Links before/after pairs |
| metadata | JSONB | Additional metadata |

### Views and Functions

- `screenshot_pairs` - View joining before/after screenshots
- `get_latest_screenshots_by_page(page_path, limit)` - Get recent screenshots
- `get_screenshots_by_date_range(start_date, end_date, page)` - Date range query
- `cleanup_old_screenshots(days_old)` - Delete old screenshots

## GitHub Actions Integration

The system includes automated screenshot capture on pull requests:

### How It Works

1. When a PR is opened or updated, the workflow runs
2. Builds and captures screenshots of PR branch
3. Checks out base branch and captures comparison screenshots
4. Posts visual diff report as PR comment
5. Uploads screenshots as artifacts

### Configure GitHub Secrets

Add these secrets to your GitHub repository:

```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
VITE_SUPABASE_URL
VITE_SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_ANON_KEY
```

## API Reference

### ScreenshotCapture Class

```javascript
import { screenshotCapture } from '@/lib/screenshot-capture';

// Initialize with clients
await screenshotCapture.initialize(cloudinaryClient, supabaseClient);

// Capture screenshot (browser-safe via API)
const result = await screenshotCapture.captureScreenshot({
  pageRoute: '/home',
  changeDescription: 'Update hero section',
  viewport: 'desktop',
  capturedBeforeChange: true,
  relatedChangeId: 'change-123'
});

// Get screenshots by page
const screenshots = await screenshotCapture.getScreenshotsByPage('/home', {
  viewport: 'desktop',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31')
});

// Get before/after pair
const { before, after } = await screenshotCapture.getBeforeAfterPair('change-123');

// Delete old screenshots (older than 90 days)
const deletedCount = await screenshotCapture.deleteOldScreenshots(90);
```

### Hook Configuration

```javascript
usePreChangeScreenshot({
  enabled: true,              // Enable/disable screenshot capture
  autoCapture: false,         // Auto-capture on route changes
  viewports: ['desktop'],     // Viewports to capture
  promptForDescription: true  // Prompt for change description
});
```

## Best Practices

### 1. Meaningful Descriptions

Use clear, descriptive change descriptions:

```bash
# Good
--change="Convert header from full-width to contained layout"

# Bad
--change="Update header"
```

### 2. Capture Before Making Changes

Always capture the "before" screenshot first:

```bash
# 1. Capture before
npm run screenshot:capture -- --page=/home --change="Hero redesign"

# 2. Make changes
# ... edit code ...

# 3. Capture after (optional)
npm run screenshot:capture -- --after --change-id="<from step 1>" --page=/home
```

### 3. Use Appropriate Viewports

Capture multiple viewports for responsive changes:

```bash
--viewports=desktop,tablet,mobile
```

### 4. Regular Cleanup

Schedule regular cleanup of old screenshots:

```sql
-- Delete screenshots older than 90 days
SELECT cleanup_old_screenshots(90);
```

### 5. Pre-Deployment Checks

Capture all pages before major deployments:

```bash
npm run screenshot:all -- --change="Pre-deployment: v2.2 release"
```

## Troubleshooting

### Playwright Installation Issues

If Playwright browsers fail to install:

```bash
# Install with dependencies
npx playwright install chromium --with-deps

# Or install system dependencies separately
npx playwright install-deps chromium
```

### Cloudinary Upload Failures

Check:
1. Cloudinary credentials in `.env`
2. Cloudinary account storage limits
3. Network connectivity

### Screenshot Too Large

For very long pages, consider:
1. Reducing quality in configuration
2. Capturing specific sections instead of full page
3. Using smaller viewports

### Hook Not Triggering

Ensure:
1. Hook is enabled (default: development mode only)
2. User isn't cancelling the prompt
3. Check browser console for errors

## Performance Considerations

### Screenshot Capture Time

- Single page: ~2-5 seconds
- All pages (39): ~2-4 minutes
- Multiple viewports: Linear increase

### Storage

- Average screenshot size: 300-900 KB
- Monthly storage (assuming 100 screenshots/month): ~30-90 MB
- Cloudinary free tier: 25 GB

### Database

- Metadata per screenshot: ~500 bytes
- 10,000 screenshots = ~5 MB database storage

## Advanced Features

### Custom Metadata

Add custom metadata to screenshots:

```javascript
await screenshotCapture.captureScreenshot({
  pageRoute: '/home',
  changeDescription: 'Update hero',
  viewport: 'desktop',
  metadata: {
    branch: 'feature/hero-redesign',
    author: 'developer@example.com',
    jiraTicket: 'DIS-1234'
  }
});
```

### Batch Operations

Query and process screenshots in batches:

```javascript
const screenshots = await screenshotCapture.getScreenshotsByPage('/home');

for (const screenshot of screenshots) {
  // Download, process, or analyze
  await downloadScreenshot(screenshot.screenshot_url);
}
```

### Integration with CI/CD

Integrate screenshot capture into your deployment pipeline:

```yaml
# Example: Netlify deploy with screenshots
deploy:
  - npm run screenshot:all -- --change="Pre-deployment: $COMMIT_SHA"
  - netlify deploy --prod
```

## Future Enhancements

Potential improvements for the screenshot system:

1. **Visual Regression Testing**: Integrate with Percy or Chromatic
2. **Diff Images**: Generate pixel-diff images showing changes
3. **Annotations**: Add annotations/highlights to screenshots
4. **Video Recording**: Capture interaction videos instead of static screenshots
5. **A/B Testing**: Track screenshots for different variants
6. **Performance Metrics**: Capture performance metrics alongside screenshots
7. **AI Analysis**: Use AI to detect significant visual changes

## Support

For issues or questions:

1. Check this documentation
2. Review browser console for errors
3. Check Supabase logs for database issues
4. Check Cloudinary dashboard for upload issues
5. Contact development team

## License

Part of the Disruptors AI Marketing Hub project.
