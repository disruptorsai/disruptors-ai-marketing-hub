# Active Experiments Folder

## Purpose

This folder contains all currently active experiments that are in development, testing, deployed, or being monitored.

## Folder Structure

Each experiment gets its own subdirectory:

```
active/
└── [experiment-name]/
    ├── concept.md                 # Original concept (copied from submissions)
    ├── analysis-report.md         # Agent's feasibility analysis
    ├── specification.md           # Technical specification
    ├── implementation.md          # Implementation details and code
    ├── testing-report.md          # Test results
    ├── deployment-report.md       # Deployment details
    ├── metrics.json               # Current performance metrics
    ├── changelog.md               # History of all changes
    └── migrations/                # Database migrations (if needed)
        └── YYYYMMDD_[name].sql
```

## Experiment Lifecycle in Active

Experiments in this folder go through these stages:

1. **Analysis** → Analysis report generated
2. **Planning** → Technical specification created
3. **Development** → Code implementation
4. **Testing** → Test reports and validation
5. **Deployment** → Live in production
6. **Monitoring** → Collecting data
7. **Analysis** → Final evaluation

Once an experiment reaches a final decision (graduate, sunset, or archive), it moves to the `archived/` folder.

## Status Indicators

Each experiment directory includes a `status.json` file:

```json
{
  "name": "AI-Powered Headline Optimizer",
  "status": "monitoring",
  "created_at": "2025-10-12",
  "deployed_at": "2025-10-15",
  "stages_completed": [
    "submission",
    "analysis",
    "planning",
    "development",
    "testing",
    "deployment"
  ],
  "current_stage": "monitoring",
  "metrics": {
    "primary_metric": "conversion_rate",
    "current_value": 16.8,
    "target_value": 15.0,
    "baseline_value": 10.0
  }
}
```

## Working with Active Experiments

### As a Developer
- Review generated code in `implementation.md`
- Check database migrations in `migrations/`
- Run tests documented in `testing-report.md`

### As a Marketer
- Monitor metrics in admin panel (updated from `metrics.json`)
- Review daily/weekly reports
- Make decisions at key approval gates

### As an Admin
- Access experiment controls in admin panel
- Enable/disable experiments
- Adjust configurations
- Review alerts

## Agent Operations

The agent continuously:
- Updates `metrics.json` with latest data
- Appends to `changelog.md` for all changes
- Generates reports in respective files
- Monitors for anomalies and issues

## Do Not Manually Edit

Files in this directory are primarily managed by the agent. Manual edits may be overwritten. Use the admin panel to make changes.

**Exception**: You can edit `concept.md` to clarify requirements during planning phase.

## Moving Experiments

Experiments are automatically moved by the agent:
- **From `submissions/`** → When analysis begins
- **To `archived/`** → When graduated, paused, or sunset

Manual moves are not recommended.

---

**This folder is the active workspace for all experiments in progress.**
