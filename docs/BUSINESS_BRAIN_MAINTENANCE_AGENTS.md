# Business Brain Maintenance Agents

This document defines specialized AI agents responsible for maintaining and optimizing the Business Brain infrastructure.

---

## 1. business-brain-database-agent

**Purpose**: Maintain database health, optimize performance, and ensure data integrity for Business Brain tables.

**Responsibilities**:
- Monitor database performance metrics (query times, index efficiency)
- Optimize slow queries on `brain_facts`, `business_brains` tables
- Maintain vector search indexes (HNSW) for embedding similarity
- Clean up deprecated brain facts (old versions)
- Verify RLS policies are functioning correctly
- Run database migrations and schema updates
- Monitor table sizes and recommend partitioning if needed
- Ensure triggers are functioning (brain stats updates, fact usage tracking)

**Trigger Conditions**:
- Scheduled daily health checks
- Query performance degradation detected
- Table size exceeds thresholds
- Migration files added to `supabase/migrations/`
- User reports slow brain fact searches

**Key Files**:
- `supabase/migrations/20250107_business_brain_infrastructure.sql`
- Database functions: `search_brain_facts`, `search_brain_facts_vector`, `calculate_brain_confidence`

**Agent Actions**:
- Analyze slow query logs
- Add missing indexes
- Update database statistics
- Vacuum tables
- Archive old brain fact versions
- Verify embedding vector integrity

---

## 2. business-brain-sync-agent

**Purpose**: Synchronize Business Brain data with external integrations and keep knowledge sources up-to-date.

**Responsibilities**:
- Sync data from connected integrations (Google Analytics, HubSpot, etc.)
- Monitor `knowledge_sources` table for sync schedules
- Execute scheduled syncs (hourly, daily, weekly)
- Extract facts from integration data
- Handle OAuth token refresh for integrations
- Retry failed syncs with exponential backoff
- Alert on integration disconnections
- Track sync history and success rates

**Trigger Conditions**:
- Scheduled sync times reached
- Integration marked as `sync_status: 'error'`
- New integration connected
- Manual sync request from user
- OAuth token expiring within 7 days

**Key Files**:
- `netlify/functions/brain-enhance.ts` (integration_sync enhancement type)
- Database: `knowledge_sources` table

**Agent Actions**:
- Query integration APIs for new data
- Extract facts using Claude
- Update `last_sync_at` timestamps
- Increment `sync_count` and `facts_created` counters
- Refresh OAuth tokens
- Set `sync_status` appropriately

---

## 3. business-brain-content-quality-agent

**Purpose**: Monitor and improve the quality of generated content using Business Brain context.

**Responsibilities**:
- Analyze generated content for brand consistency
- Verify fact usage in generated content
- Monitor confidence scores of facts used
- Detect when low-quality facts are being used frequently
- Suggest brain enhancements based on content gaps
- Track content performance (if analytics connected)
- Identify missing knowledge areas
- Recommend new facts to extract

**Trigger Conditions**:
- New content generated via `brain-content-generate`
- Content published with low brain confidence
- Fact usage patterns show gaps in knowledge
- User reports content inaccuracy
- Scheduled weekly quality audits

**Key Files**:
- `netlify/functions/brain-content-generate.ts`
- Database: `posts_brain_facts`, `brain_facts`

**Agent Actions**:
- Analyze `posts_brain_facts` to identify most/least used facts
- Flag low-confidence facts used in published content
- Suggest new onboarding questions to fill knowledge gaps
- Generate reports on brain health by content type
- Recommend facts to verify or update

---

## 4. business-brain-intelligence-agent

**Purpose**: Continuously enhance Business Brain intelligence through automated learning and fact extraction.

**Responsibilities**:
- Auto-extract facts from new website pages (periodic re-scraping)
- Monitor business website for content changes
- Extract facts from user interactions (chat logs, feedback)
- Identify emerging keywords and topics
- Detect industry trends relevant to business
- Suggest new content pillars based on search trends
- Auto-categorize uncategorized facts
- Generate embeddings for facts missing vectors

**Trigger Conditions**:
- Scheduled monthly website re-scraping
- New files uploaded to brain
- Onboarding session completed
- Brain confidence below 0.5 for 30+ days
- New industry trends detected (via DataForSEO or similar)

**Key Files**:
- `netlify/functions/brain-auto-initialize.ts` (scraping logic)
- `netlify/functions/brain-enhance.ts` (fact extraction)

**Agent Actions**:
- Re-scrape primary website
- Compare new scraped data with existing facts
- Extract new facts, mark outdated facts as deprecated
- Generate embeddings for new facts
- Update brain confidence scores
- Auto-upgrade brain level if thresholds met

---

## 5. business-brain-health-monitor-agent

**Purpose**: Monitor overall Business Brain health and alert on issues requiring attention.

**Responsibilities**:
- Track brain confidence score trends
- Monitor fact count growth
- Detect stale brains (not updated in 60+ days)
- Alert on brains stuck at "starter" level
- Monitor embedding generation failures
- Track API usage and rate limits (OpenAI, Anthropic)
- Monitor Netlify function performance
- Alert on function timeouts or errors
- Generate health reports for admins

**Trigger Conditions**:
- Scheduled daily health checks
- Brain confidence drops by >0.1
- Netlify function error rate exceeds threshold
- API rate limit warnings
- User reports brain not working properly

**Key Files**:
- All Netlify functions in `netlify/functions/brain-*.ts`
- Database: `business_brains`, `brain_facts`, `onboarding_sessions`

**Agent Actions**:
- Calculate health scores for all brains
- Generate health reports with recommendations
- Send alerts for critical issues
- Log health metrics to telemetry system
- Auto-trigger enhancement for unhealthy brains

---

## 6. business-brain-migration-agent

**Purpose**: Handle database migrations, schema updates, and data backups for Business Brain infrastructure.

**Responsibilities**:
- Apply new database migrations safely
- Create backups before migrations
- Test migrations on staging environment
- Roll back failed migrations
- Migrate data between schema versions
- Archive old brain fact versions
- Export brain data for backup/portability
- Import brain data from backups

**Trigger Conditions**:
- New migration file detected in `supabase/migrations/`
- Manual migration request from admin
- Scheduled weekly backups
- Brain export request from user
- Schema version mismatch detected

**Key Files**:
- All files in `supabase/migrations/`
- Backup scripts (to be created)

**Agent Actions**:
- Validate migration SQL syntax
- Create database backup
- Apply migration to staging
- Test critical queries post-migration
- Apply migration to production
- Update schema version tracking
- Alert on migration failures

---

## 7. business-brain-embedding-optimization-agent

**Purpose**: Optimize vector embeddings for brain facts to improve search quality and reduce costs.

**Responsibilities**:
- Monitor embedding API costs (OpenAI text-embedding-3-small)
- Batch embedding generation for efficiency
- Detect and fix corrupted embeddings
- Re-generate embeddings when model updates available
- Optimize embedding dimensions if smaller models released
- Monitor vector search quality metrics
- A/B test different embedding models
- Cache embeddings to avoid redundant API calls

**Trigger Conditions**:
- Scheduled monthly embedding audits
- Vector search quality degradation detected
- OpenAI releases new embedding model
- Embedding generation errors
- API costs exceed budget threshold

**Key Files**:
- `netlify/functions/brain-auto-initialize.ts` (embedding generation)
- `netlify/functions/brain-enhance.ts` (embedding generation)
- Database: `brain_facts.embedding` column

**Agent Actions**:
- Audit all facts for missing/corrupted embeddings
- Batch re-generate embeddings
- Test new embedding models on sample data
- Update embedding generation code if model changes
- Monitor embedding API costs and usage

---

## 8. business-brain-fact-verification-agent

**Purpose**: Verify accuracy and relevance of brain facts, especially user-submitted or auto-extracted facts.

**Responsibilities**:
- Auto-verify facts against source URLs
- Detect outdated facts (e.g., old pricing, discontinued services)
- Flag facts with low confidence for manual review
- Suggest merging duplicate facts
- Verify fact categorization accuracy
- Cross-reference facts with current website content
- Mark deprecated facts when source content changes
- Suggest fact confidence score adjustments

**Trigger Conditions**:
- Scheduled monthly fact verification
- Brain confidence score stagnant or declining
- User reports inaccurate content
- Website re-scrape detects content changes
- Fact marked as `verified: false` for 30+ days

**Key Files**:
- Database: `brain_facts` table
- Web scraping utilities from `brain-auto-initialize.ts`

**Agent Actions**:
- Re-scrape fact source URLs
- Compare current content with stored facts
- Mark outdated facts as deprecated
- Suggest fact updates to users
- Auto-merge highly similar facts
- Adjust confidence scores based on verification

---

## Integration Instructions

### Adding a Maintenance Agent to Claude Code

Add agent descriptions to `mcp.json` or `.claude/agents/` directory:

```json
{
  "name": "business-brain-database-agent",
  "description": "Maintain database health, optimize performance, and ensure data integrity for Business Brain tables. Triggers: daily health checks, query performance issues, migration files added, user reports slow searches.",
  "tools": ["*"],
  "files": ["supabase/migrations/**", "netlify/functions/brain-*.ts"]
}
```

### Agent Activation Patterns

Agents can be triggered:
1. **Automatically** via cron jobs or webhooks
2. **Reactively** when specific conditions detected
3. **Manually** by developers or admins
4. **Proactively** by Claude Code when relevant keywords detected

### Example Agent Invocation

```javascript
// Trigger database health check
claude.invoke("business-brain-database-agent", {
  action: "health-check",
  scope: "all-brains"
});

// Trigger integration sync
claude.invoke("business-brain-sync-agent", {
  action: "sync-integration",
  integrationId: "abc-123"
});

// Trigger content quality audit
claude.invoke("business-brain-content-quality-agent", {
  action: "audit-content",
  brainId: "brain-xyz",
  postIds: ["post-1", "post-2"]
});
```

---

## Monitoring Dashboard

### Recommended Metrics

Track these metrics for Business Brain health:

1. **Brain Health**:
   - Total active brains
   - Average confidence score
   - Brains by level (starter/enhanced/expert)
   - Brains requiring enhancement

2. **Fact Quality**:
   - Total facts across all brains
   - Average fact confidence
   - Facts verified vs. unverified
   - Most/least used facts

3. **Content Generation**:
   - Articles generated per day
   - Average brain facts used per article
   - Content quality scores
   - Failed generation attempts

4. **Integration Health**:
   - Active integrations count
   - Sync success rate
   - Facts created from integrations
   - Integration errors

5. **API Usage**:
   - OpenAI embedding API calls
   - Anthropic content generation tokens
   - API costs per brain
   - Rate limit incidents

---

## Maintenance Schedule

### Daily
- Database health check (business-brain-database-agent)
- Integration sync status check (business-brain-sync-agent)
- Health monitoring (business-brain-health-monitor-agent)

### Weekly
- Content quality audit (business-brain-content-quality-agent)
- Database backups (business-brain-migration-agent)

### Monthly
- Website re-scraping (business-brain-intelligence-agent)
- Fact verification (business-brain-fact-verification-agent)
- Embedding optimization audit (business-brain-embedding-optimization-agent)

### On-Demand
- Migration execution (business-brain-migration-agent)
- Emergency fixes (all agents)
- User-requested enhancements (business-brain-intelligence-agent)

---

## Emergency Procedures

### Brain Confidence Dropped Significantly
1. Activate `business-brain-fact-verification-agent` to check for outdated facts
2. Trigger `business-brain-intelligence-agent` to extract new facts
3. Run `calculate_brain_confidence()` database function

### Content Generation Failures
1. Check `business-brain-health-monitor-agent` for API rate limits
2. Verify brain has sufficient facts (min 20 recommended)
3. Test vector search with sample queries
4. Check Netlify function logs for errors

### Integration Sync Failures
1. Activate `business-brain-sync-agent` to diagnose issue
2. Check OAuth token expiration
3. Verify integration API endpoint availability
4. Test sample API calls manually

### Database Performance Issues
1. Trigger `business-brain-database-agent` for query analysis
2. Check index usage on `brain_facts` and `business_brains`
3. Run `VACUUM ANALYZE` on affected tables
4. Monitor Supabase dashboard for resource usage

---

## Future Enhancements

Planned agent improvements:

1. **Predictive Enhancement**: Predict when brains need enhancement before quality drops
2. **Automated A/B Testing**: Test different content generation strategies per brain
3. **Multi-Language Support**: Extract facts in multiple languages
4. **Competitive Intelligence**: Auto-monitor competitor websites for industry insights
5. **Social Listening**: Extract facts from social media mentions
6. **Voice Consistency Scoring**: Quantify brand voice adherence in generated content
7. **Fact Relationship Mapping**: Build knowledge graphs between related facts

---

## Contact

For questions about Business Brain maintenance agents:
- Documentation: `docs/BUSINESS_BRAIN_COMPLETE_SYSTEM.md`
- Infrastructure: `docs/BUSINESS_BRAIN_APP_ECOSYSTEM.md`
- Database Schema: `supabase/migrations/20250107_business_brain_infrastructure.sql`
