# Archived Experiments Folder

## Purpose

This folder contains experiments that have completed their lifecycle. Whether they succeeded (graduated to core features), failed (sunset with learnings), or were paused indefinitely, all experiments eventually end up here.

## Why Archive?

Archived experiments serve as:
1. **Knowledge Base** - Learn from past successes and failures
2. **Historical Record** - Track what we've tried and outcomes
3. **Reference Material** - Examples for future experiments
4. **Strategic Insights** - Patterns across multiple experiments
5. **ROI Documentation** - Business value created

## Folder Structure

```
archived/
└── [experiment-name]/
    ├── concept.md                 # Original concept
    ├── analysis-report.md         # Initial analysis
    ├── specification.md           # Technical spec
    ├── implementation.md          # Code and implementation
    ├── final-report.md            # Complete final analysis
    ├── learnings.md               # Key takeaways
    ├── status.json                # Final status and metrics
    └── metrics-history.json       # Complete metrics timeline
```

## Archive Categories

### 🏆 Graduated Experiments (Success)

Experiments that:
- Met or exceeded all success criteria
- Became permanent core features
- Delivered significant business value

**Example Directory**: `archived/ai-headline-optimizer/`

**Contents**:
- Final report showing success metrics
- ROI calculations and business impact
- User feedback and satisfaction data
- Implementation preserved for reference
- Success story summary

### 🌅 Sunset Experiments (Learnings)

Experiments that:
- Did not meet success criteria
- Failed to achieve expected results
- Were determined not viable

**Important**: These are NOT failures - they are valuable learnings!

**Example Directory**: `archived/dynamic-pricing-failed/`

**Contents**:
- Analysis of what didn't work
- Root cause analysis
- Key learnings extracted
- Recommendations for future attempts
- "Would we try again?" assessment

### ⏸️ Paused Experiments (Indefinite)

Experiments that:
- Were paused and never resumed
- Had dependencies that were never met
- Strategic priorities changed

**Example Directory**: `archived/social-gamification-paused/`

**Contents**:
- Reason for pause
- Current state when paused
- Conditions for potential resume
- Partial learnings if any

## File Conventions

### status.json
```json
{
  "name": "AI-Powered Headline Optimizer",
  "final_status": "graduated",
  "lifecycle": {
    "submitted": "2025-09-15",
    "deployed": "2025-09-22",
    "archived": "2025-10-30"
  },
  "duration_days": 45,
  "outcome": {
    "success": true,
    "primary_metric_achieved": true,
    "roi": 11554,
    "business_value": "Became core feature, $1.54M annual value"
  },
  "final_metrics": {
    "conversion_rate": {
      "baseline": 10.0,
      "achieved": 16.8,
      "target": 15.0,
      "improvement_percent": 68
    }
  }
}
```

### learnings.md Format
```markdown
# Key Learnings: [Experiment Name]

## What Worked
1. [Success factor 1]
2. [Success factor 2]

## What Didn't Work
1. [Challenge 1]
2. [Challenge 2]

## Unexpected Discoveries
- [Discovery 1]
- [Discovery 2]

## Would We Do This Again?
[Yes/No/Maybe - with explanation]

## Recommendations for Future
1. [Recommendation 1]
2. [Recommendation 2]

## Impact on Strategy
[How this changed our thinking]
```

## Using Archived Experiments

### For New Experiment Planning
1. Search archived experiments for similar concepts
2. Review what worked and what didn't
3. Learn from past technical implementations
4. Avoid repeating mistakes

### For Team Learning
1. Regular reviews of archived experiments
2. Extract patterns and best practices
3. Build institutional knowledge
4. Celebrate successes and learnings

### For Reporting
1. Aggregate ROI across experiments
2. Success rate calculations
3. Business value created
4. Innovation velocity metrics

## Search and Discovery

### By Status
```bash
# Find all graduated experiments
experiments/archived/*/status.json | grep "graduated"

# Find all sunset experiments
experiments/archived/*/status.json | grep "sunset"
```

### By Metric
```bash
# Find experiments that improved conversion rate
experiments/archived/*/final-report.md | grep "conversion_rate"
```

### By Timeframe
```bash
# Find experiments from 2025
experiments/archived/*/status.json | grep "2025"
```

## Archive Statistics

The agent maintains an index at `docs/experiments-index.md`:

- Total experiments run
- Success rate (graduated / total)
- Average ROI
- Total business value created
- Common success factors
- Common failure reasons
- Trends over time

## Archived vs Deleted

**Archived experiments are NEVER deleted.**

We keep everything because:
- Historical knowledge is valuable
- Failed experiments teach important lessons
- Future teams can learn from our experiences
- ROI and business value tracking
- Strategic pattern recognition

Storage is cheap. Knowledge is priceless.

## Contributing to Archive Quality

When archiving an experiment:

1. ✅ **Complete the final report** - Don't skip this
2. ✅ **Extract learnings** - What did we learn?
3. ✅ **Be honest** - Document what really happened
4. ✅ **Provide context** - Help future readers understand
5. ✅ **Update the index** - Keep the catalog current

## Archive Maintenance

The agent periodically:
- Validates all archived experiments have required files
- Generates aggregate statistics
- Updates the experiments index
- Identifies patterns across experiments
- Surfaces insights for future planning

## Privacy and Sensitivity

**Archived experiments may contain**:
- Business metrics (should be internal only)
- Strategic insights (confidential)
- User data (anonymized)
- Technical implementations (proprietary)

**Access Control**:
- Archived experiments inherit admin-only access
- Can be reviewed by authorized team members
- Not exposed publicly
- Shared selectively for learning

## Example Directory Listing

```
archived/
├── ai-headline-optimizer/           # 🏆 GRADUATED
│   ├── final-report.md              # Outstanding success
│   ├── learnings.md                 # Key insights
│   └── status.json                  # ROI: 11,554%
│
├── personalized-email-sequences/    # 🏆 GRADUATED
│   ├── final-report.md              # Strong performance
│   └── status.json                  # ROI: 847%
│
├── dynamic-pricing-engine/          # 🌅 SUNSET
│   ├── final-report.md              # Why it failed
│   ├── learnings.md                 # What we learned
│   └── status.json                  # Negative ROI
│
├── social-gamification/             # ⏸️ PAUSED
│   ├── pause-report.md              # Reason for pause
│   └── status.json                  # Incomplete
│
└── content-recommendation-v1/       # 🌅 SUNSET
    ├── final-report.md              # Replaced by v2
    ├── learnings.md                 # Led to better approach
    └── status.json                  # Evolved into v2
```

## Resurrection

Sometimes, a sunset or paused experiment deserves another chance:

1. Review archived experiment thoroughly
2. Understand why it failed or was paused
3. Determine what changed (tech, market, resources)
4. Submit as NEW experiment with learnings applied
5. Reference original in submission

**Example**: "Social Gamification v2" based on learnings from v1

## Learning Culture

Our archive reflects our learning culture:

- **We celebrate failures** that teach us valuable lessons
- **We document honestly** about what worked and what didn't
- **We share openly** so everyone can learn
- **We iterate constantly** applying past learnings
- **We measure everything** to understand true impact

**The archive is proof that we learn, adapt, and improve.**

---

**Browse the archive. Learn from the past. Build the future.** 🚀
