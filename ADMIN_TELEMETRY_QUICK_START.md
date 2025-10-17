# Admin Telemetry Dashboard - Quick Start Guide

## ✅ GOOD NEWS: You're Already Set Up!

Your telemetry system is **fully configured** and ready to use. Here's what I found:

### 📊 System Status

✅ **Database Tables** - All 4 telemetry tables exist and working
✅ **Dashboard UI** - Fully implemented at `/admin/secret`
✅ **Admin Users** - 2 admin accounts already configured
✅ **Automatic Tracking** - Module runs track automatically

### 👑 Your Admin Accounts

You have **2 admin users** ready to use:

1. **admin@disruptors.co** ✅ (Last login: Oct 1, 2025)
2. **dev@localhost.com** ⚪ (Never used)

Plus **7 regular users** who can be upgraded to admin if needed.

---

## 🚀 Access the Telemetry Dashboard (3 Ways)

### Method 1: Secret Pattern (Recommended)
1. Go to your website homepage
2. Click the Disruptors logo **5 times within 3 seconds**
3. Login with: `admin@disruptors.co`

### Method 2: Keyboard Shortcut
1. Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)
2. Login with: `admin@disruptors.co`

### Method 3: Direct URL
1. Navigate to: `https://dm4.wjwelsh.com/admin/secret`
2. Login with: `admin@disruptors.co`

### Emergency Exit
Press `Ctrl+Shift+Escape` to quickly exit admin mode

---

## 📈 What You'll See

### Real-Time Metrics Cards
- **Total Events** - All telemetry in selected time range
- **Error Rate** - % of failed operations
- **Agent Runs** - AI execution count
- **Avg Response Time** - Operation duration

### Event Volume Chart
- Line chart showing events per hour
- Auto-refreshes every 30 seconds
- Filter by time range: 1h, 24h, 7d, 30d

### Recent Events Stream
- Live feed with color-coded severity:
  - 🟢 Green = Success
  - 🔴 Red = Error
  - 🟡 Yellow = Warning
  - 🔵 Blue = Info

### Filters
- **Time Range**: 1h, 24h, 7d, 30d
- **Event Type**: all, admin, agent, workflow, ingest

---

## 🔄 Data Collection (Automatic)

These AI modules **already track** telemetry automatically:

1. **Keyword Research** - Every DataForSEO query
2. **AI Content Writer** - Every content generation
3. **Growth Audit** - Every audit execution

Just use any module and data appears in the dashboard immediately!

---

## 🧪 Generate Test Data (Optional)

Want to see the dashboard in action with sample data?

```bash
npm run telemetry:generate
```

This creates:
- 100 telemetry events
- 30 agent runs
- 20 workflow runs

All spread over the last 7 days for realistic charts.

---

## 👥 User Management Commands

### List All Users and Admin Status
```bash
npm run admin:list-users
```

Shows:
- All Supabase Auth users
- Current admin status
- Last sign-in dates

### Grant Admin Role to User
```bash
npm run admin:setup-role <email>
```

Examples:
```bash
# Make Kyle an admin
npm run admin:setup-role kyle@disruptorsmedia.com

# Make Will an admin
npm run admin:setup-role will@disruptorsmedia.com
```

---

## 🛠️ Useful Commands

### Telemetry Management
```bash
npm run telemetry:status      # Check current data and health
npm run telemetry:generate    # Create test data
```

### Admin Management
```bash
npm run admin:list-users      # List all users with roles
npm run admin:setup-role      # Grant admin access
```

---

## 📊 Current Data Status

Based on the database check:

- **Telemetry Events**: 2 records (from Oct 1-2, 2025)
- **Module Runs**: Empty (needs module usage)
- **Agent Runs**: Empty (needs agent training)
- **Workflow Runs**: Empty (needs workflow executions)

**To populate with real data:**
1. Use the Keyword Research tool at `/app/tools/keyword-research`
2. Use the AI Content Writer at `/app/tools/ai-content-writer`
3. Run a Growth Audit at `/app/tools/growth-audit`

All activity will automatically appear in the telemetry dashboard!

---

## 🎯 Quick Start Checklist

- [ ] Login to Admin Nexus at `/admin/secret`
- [ ] Navigate to "Telemetry Dashboard" in sidebar
- [ ] (Optional) Generate test data: `npm run telemetry:generate`
- [ ] Use AI modules to generate real telemetry
- [ ] Check filters and time ranges
- [ ] Toggle auto-refresh on/off

---

## 📚 Documentation

- **Full Setup Guide**: `docs/TELEMETRY_SETUP_GUIDE.md`
- **Admin Nexus Docs**: `docs/systems/ADMIN_NEXUS.md`
- **Modules System**: `docs/MODULES_SYSTEM.md`
- **Dashboard Code**: `src/admin/modules/TelemetryDashboard.jsx`

---

## 🔍 Advanced Analytics

Run these queries in Supabase SQL Editor for deeper insights:

### Daily Module Usage
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_runs,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(duration_ms) as avg_duration,
  SUM(cost_usd) as total_cost
FROM module_runs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Error Analysis
```sql
SELECT
  area,
  name,
  COUNT(*) as error_count
FROM telemetry_events
WHERE name LIKE '%error%' OR name LIKE '%fail%'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY area, name
ORDER BY error_count DESC
LIMIT 20;
```

---

## 🆘 Troubleshooting

### Can't login to admin panel
- Try: `admin@disruptors.co` or `dev@localhost.com`
- Check password (use your existing Supabase password)
- Run: `npm run admin:list-users` to verify admin status

### Dashboard shows no data
1. Check database connection
2. Generate test data: `npm run telemetry:generate`
3. Use AI modules to create real data
4. Verify tables exist: `npm run telemetry:status`

### Auto-refresh not working
- Check browser console for errors
- Toggle auto-refresh off/on in header
- Manually click "Refresh Now"

---

## 🎉 You're Ready!

Your telemetry system is production-ready. Just:

1. **Login** at `/admin/secret`
2. **Generate test data** (optional): `npm run telemetry:generate`
3. **Use AI modules** to create real telemetry
4. **Monitor** your KPIs in real-time!

---

## 💡 Pro Tips

- Auto-refresh updates every 30 seconds
- Toggle time ranges to see different periods
- Filter by event type to focus on specific areas
- Use the "Recent Events" stream for debugging
- Check error rate to identify issues quickly

---

**Questions?** Check `docs/TELEMETRY_SETUP_GUIDE.md` for comprehensive documentation.
