# Keyword Research Module

AI-powered keyword research with real search volume, difficulty, and CPC data from DataForSEO.

## Overview

The Keyword Research module provides intelligent keyword discovery with opportunity scoring that balances high search volume against low competition. It integrates with the DataForSEO API to provide real-time data from Google Ads.

## Features

### Core Features
- **Real Data**: Live search volume, competition, and CPC from DataForSEO
- **Opportunity Scoring**: Smart algorithm balancing volume vs. difficulty
- **Multi-Location**: Support for US, UK, Canada, Australia, New Zealand
- **Trend Analysis**: Identify rising and falling keywords
- **Advanced Filtering**: Filter by volume, difficulty, and CPC

### Three-Level Access

#### Internal (Admin)
- ✅ Unlimited searches
- ✅ All 50 keywords per search
- ✅ All filters and sorting
- ✅ CSV export
- ✅ Save to content calendar
- ✅ No quota display

#### Client (Authenticated)
- ✅ 10 searches per day
- ✅ All 50 keywords per search
- ✅ All filters and sorting
- ✅ CSV export
- ✅ Save to content calendar
- ⚠️ Quota displayed

#### Public (Anonymous)
- ⚠️ 3 searches per day
- ⚠️ Limited to 10 keywords
- ❌ No advanced filters
- ❌ No CSV export
- ❌ No save functionality
- ✅ Upgrade CTA shown

## Files

- **manifest.json** - Module definition with all 43 fields
- **schema.js** - Zod schemas for validation
- **index.jsx** - Module orchestration and execution
- **KeywordResearchUI.jsx** - React UI component
- **README.md** - This file

## Usage

### As a Module (Recommended)

```javascript
import { executeModule } from '@/lib/modules';

const result = await executeModule('keyword-research',
  {
    seed_keyword: 'plumber near me',
    location: '2840', // US
    language: 'en'
  },
  {
    userId: user.id,
    brainId: brain.id,
    audience: 'client'
  }
);

console.log(result.keywords); // Array of keyword objects
```

### As a Component

```jsx
import KeywordResearchUI from '@/modules/keyword-research/KeywordResearchUI';
import { executeModule } from '@/lib/modules';

function MyPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (input) => {
    setLoading(true);
    const res = await executeModule('keyword-research', input, {
      userId: user.id,
      audience: 'client'
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <KeywordResearchUI
      brain={brain}
      audience="client"
      access={{ daily_limit: 10, daily_used: 3 }}
      onRun={handleRun}
      loading={loading}
      result={result}
    />
  );
}
```

### WordPress Shortcode

```
[disruptors_keyword_research seed="plumber" location="United States"]
```

## Input Schema

```typescript
{
  seed_keyword: string;      // Required: 1-100 characters
  location?: string;         // Optional: Location code (default: 2840 = US)
  language?: string;         // Optional: Language code (default: 'en')
  limit?: number;            // Optional: 10-100 (default: 50)
}
```

## Output Schema

```typescript
{
  keywords: Array<{
    keyword: string;
    search_volume: number;
    competition: number;        // 0.0 - 1.0
    competition_level: 'Low' | 'Medium' | 'High';
    cpc: number;               // Cost per click in USD
    difficulty: number;        // 0-100
    trend: number;             // -1.0 to 1.0
    opportunity_score: number; // 0-100
  }>;
  count: number;
  search_term: string;
  location: string;
  business_context?: {
    industry?: string;
    location?: string;
    core_offerings?: string[];
  };
}
```

## Configuration

Users can configure the following preferences:

```typescript
{
  default_location: string;      // Default location code
  default_language: string;      // Default language
  results_limit: number;         // Default results (10-100)
  auto_save_to_posts: boolean;  // Auto-save selected keywords
  show_trends: boolean;          // Display trend indicators
  min_search_volume: number;    // Filter minimum volume
}
```

## Business Brain Integration

The module uses Business Brain context to:
- Add industry context to results
- Personalize opportunity scoring
- Filter keywords by core offerings
- Prioritize location-specific keywords

Example:
```javascript
// If Business Brain has:
{
  industry: 'plumbing',
  primary_location: 'Denver, CO',
  core_offerings: ['emergency plumbing', 'drain cleaning']
}

// Results will include:
{
  business_context: {
    industry: 'plumbing',
    location: 'Denver, CO',
    core_offerings: ['emergency plumbing', 'drain cleaning']
  }
}
```

## Opportunity Scoring Algorithm

The opportunity score (0-100) balances:
1. **Search Volume** (higher is better)
2. **Competition** (lower is better)
3. **CPC** (moderate is better)

Formula:
```
volumeScore = min(100, (volume / 1000) * 10)
difficultyPenalty = difficulty
opportunityScore = max(0, min(100, volumeScore - (difficultyPenalty / 2)))
```

High scores (70+) = Great opportunity (high volume, low competition)
Medium scores (40-69) = Moderate opportunity
Low scores (<40) = Difficult keyword

## Testing

### Manual Testing Checklist

**Internal Access**:
- [ ] Can search without quota limits
- [ ] All 50 keywords returned
- [ ] All filters work
- [ ] CSV export works
- [ ] No quota display shown

**Client Access**:
- [ ] Quota display shows (X/10 used)
- [ ] Blocked after 10 searches
- [ ] All keywords shown
- [ ] Filters and export work
- [ ] Quota resets after 24 hours

**Public Access**:
- [ ] Limited to 3 searches/day
- [ ] Only 10 keywords shown
- [ ] No filters or export
- [ ] Upgrade CTA displays
- [ ] Clear value proposition

**Business Brain**:
- [ ] Industry context added to results
- [ ] Location personalization works
- [ ] Core offerings considered

**Error Handling**:
- [ ] Empty keyword handled
- [ ] API errors displayed
- [ ] Network errors graceful
- [ ] Invalid location handled

## API Integration

### DataForSEO API

The module calls the DataForSEO API via the Netlify function:

**Endpoint**: `/.netlify/functions/dataforseo-keywords`

**Request**:
```json
{
  "searchTerm": "plumber",
  "location": "2840",
  "language": "en"
}
```

**Response**:
```json
{
  "success": true,
  "keywords": [...],
  "count": 50
}
```

**Cost**: ~$0.05 per search (DataForSEO pricing)

## Performance

- **API Response Time**: 2-5 seconds typical
- **Results Caching**: None (real-time data)
- **Bundle Size**: ~15KB (UI component)
- **Dependencies**: DataForSEO API, Netlify function

## Troubleshooting

### "Module not found"
- Verify module is seeded: `node scripts/verify-modules-migration.js`
- Check slug matches: `keyword-research`

### "Quota exceeded"
- Check `module_access` table for user's daily_used
- Reset manually or wait for automatic daily reset

### "DataForSEO API error"
- Verify `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD` in .env
- Check DataForSEO account credits
- Review Netlify function logs

### No keywords returned
- Try broader keyword (e.g., "plumber" instead of "emergency plumber denver")
- Check location code is valid
- Verify API credentials

## Future Enhancements

- [ ] Save keyword sets for reuse
- [ ] Keyword tracking over time
- [ ] Competitor keyword analysis
- [ ] SERP feature detection
- [ ] Related questions integration
- [ ] Batch keyword research (upload CSV)
- [ ] Keyword grouping/clustering
- [ ] Integration with content calendar

## Support

- **Documentation**: https://docs.disruptorsmedia.com/modules/keyword-research
- **Changelog**: See manifest.json
- **Version**: 1.0.0

---

**Last Updated**: 2025-10-10
**Status**: ✅ Production Ready
**Access**: Internal + Client
