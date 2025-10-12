# Migration Plan: disruptorsmedia.com to Netlify
## Safe DNS & Hosting Migration Without Breaking Email

**Date**: 2025-10-12
**Current Hosting**: DigitalOcean
**Domain Registrar**: GoDaddy
**Target**: Netlify
**Current Netlify Site**: cheerful-custard-2e6fc5 (dm4.wjwelsh.com)

---

## 🎯 Goal
Migrate disruptorsmedia.com from DigitalOcean to Netlify **WITHOUT** breaking:
- ✅ Email services (tyler@disruptorsmedia.com, will@disruptorsmedia.com)
- ✅ Any other domain-dependent services
- ✅ Current site uptime during migration

---

## 📊 Current Setup Analysis

### What We Know
- **Domain**: disruptorsmedia.com (registered with GoDaddy)
- **Current Host**: DigitalOcean
- **Email**: tyler@disruptorsmedia.com, will@disruptorsmedia.com (likely hosted)
- **New Site**: Ready to deploy (currently at dm4.wjwelsh.com)
- **Netlify Account**: techintegrationlabs@gmail.com
- **Netlify Site ID**: cheerful-custard-2e6fc5

---

## ⚠️ Critical Pre-Migration Checks

### Step 1: Document Current DNS Records
**Before changing anything, we need to know what's currently configured:**

1. **Login to GoDaddy** (domain registrar)
   - Go to: https://dcc.godaddy.com/
   - Navigate to: My Products → Domains → disruptorsmedia.com → DNS

2. **Document ALL Current DNS Records**
   ```
   CRITICAL RECORDS TO SAVE:

   MX Records (Email - DO NOT DELETE):
   ┌─────────────────────────────────────────────────┐
   │ Type: MX                                        │
   │ Priority: [   ]                                 │
   │ Points to: [                                  ] │
   └─────────────────────────────────────────────────┘

   A Records (Website):
   ┌─────────────────────────────────────────────────┐
   │ Type: A                                         │
   │ Host: @                                         │
   │ Points to: [DigitalOcean IP - will change]     │
   └─────────────────────────────────────────────────┘

   CNAME Records:
   ┌─────────────────────────────────────────────────┐
   │ Type: CNAME                                     │
   │ Host: www                                       │
   │ Points to: [                                  ] │
   └─────────────────────────────────────────────────┘

   TXT Records (SPF, DKIM, etc.):
   ┌─────────────────────────────────────────────────┐
   │ Type: TXT                                       │
   │ Host: [     ]                                   │
   │ Value: [                                      ] │
   └─────────────────────────────────────────────────┘
   ```

3. **Take Screenshots** of all DNS settings
   - Save to: `/Users/disruptors/Documents/DM4/disruptorsmedia-dns-backup-[date].png`

---

## 🔐 Step 2: Identify Email Provider

**Check where your email is hosted:**

### Option A: Email with GoDaddy
- Go to: GoDaddy → My Products → Email
- MX records will point to: `smtp.secureserver.net` or similar

### Option B: Email with Google Workspace (G Suite)
- MX records will point to: `aspmx.l.google.com`
- Also check for: Google SPF, DKIM records

### Option C: Email with Microsoft 365
- MX records will point to: `*.mail.protection.outlook.com`

### Option D: Email with DigitalOcean
- MX records might point to DigitalOcean IPs
- **IMPORTANT**: May need to migrate email service separately

---

## 🚀 Migration Strategy (Zero-Downtime Approach)

### Phase 1: Prepare Netlify (NO DNS CHANGES YET)

**Duration**: 10-15 minutes
**Risk Level**: 🟢 Safe (no impact on live site or email)

#### 1.1 - Add Custom Domain to Netlify

```bash
# In your terminal:
cd /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub

# Add domain to Netlify (doesn't activate yet)
npx netlify domains:add disruptorsmedia.com

# Add www subdomain
npx netlify domains:add www.disruptorsmedia.com
```

**Or via Netlify Dashboard:**
1. Go to: https://app.netlify.com/projects/cheerful-custard-2e6fc5
2. Click: Domain Settings
3. Click: Add custom domain
4. Enter: `disruptorsmedia.com`
5. Click: Verify
6. Repeat for: `www.disruptorsmedia.com`

Netlify will show you DNS instructions - **DON'T APPLY THEM YET**

#### 1.2 - Enable HTTPS/SSL
- Netlify will auto-provision Let's Encrypt SSL
- This happens automatically when DNS is updated

---

### Phase 2: DNS Migration (The Critical Part)

**Duration**: 5-10 minutes (DNS propagation: 1-48 hours)
**Risk Level**: 🟡 Medium (requires careful execution)

#### 2.1 - Login to GoDaddy DNS Manager
- Go to: https://dcc.godaddy.com/
- Navigate to: My Products → Domains → disruptorsmedia.com → DNS
- Click: Manage DNS

#### 2.2 - Update ONLY Website Records (Keep Email!)

**CRITICAL**: Only change A and CNAME records. **NEVER touch MX records!**

##### Change 1: A Record (Root Domain)
```
BEFORE:
┌─────────────────────────────────────────────────┐
│ Type: A                                         │
│ Name: @                                         │
│ Value: [DigitalOcean IP]                        │
│ TTL: 600                                        │
└─────────────────────────────────────────────────┘

AFTER (Netlify Load Balancer):
┌─────────────────────────────────────────────────┐
│ Type: A                                         │
│ Name: @                                         │
│ Value: 75.2.60.5                                │
│ TTL: 3600                                       │
└─────────────────────────────────────────────────┘
```

##### Change 2: CNAME Record (www subdomain)
```
BEFORE:
┌─────────────────────────────────────────────────┐
│ Type: CNAME                                     │
│ Name: www                                       │
│ Value: [DigitalOcean server or @]              │
│ TTL: 600                                        │
└─────────────────────────────────────────────────┘

AFTER (Points to Netlify):
┌─────────────────────────────────────────────────┐
│ Type: CNAME                                     │
│ Name: www                                       │
│ Value: cheerful-custard-2e6fc5.netlify.app     │
│ TTL: 3600                                       │
└─────────────────────────────────────────────────┘
```

#### 2.3 - PRESERVE These Records (DO NOT CHANGE)

**Keep exactly as-is:**
- ✅ **All MX records** (email routing)
- ✅ **TXT records with SPF** (e.g., `v=spf1 ...`)
- ✅ **TXT records with DKIM** (e.g., `k=rsa; p=...`)
- ✅ **CNAME for email subdomains** (e.g., `mail.disruptorsmedia.com`)
- ✅ **Any other service-specific records**

---

### Phase 3: Verification & Testing

**Duration**: 1-2 hours (DNS propagation)
**Risk Level**: 🟢 Safe (monitoring only)

#### 3.1 - Immediate Verification (5 minutes after DNS change)

```bash
# Check if DNS is propagating
dig disruptorsmedia.com

# Should eventually show:
# ANSWER SECTION:
# disruptorsmedia.com. 3600 IN A 75.2.60.5

# Check www subdomain
dig www.disruptorsmedia.com

# Should show:
# ANSWER SECTION:
# www.disruptorsmedia.com. 3600 IN CNAME cheerful-custard-2e6fc5.netlify.app
```

#### 3.2 - Test Site Accessibility

**Via Browser (Incognito Mode):**
- http://disruptorsmedia.com → Should redirect to HTTPS and load new site
- http://www.disruptorsmedia.com → Should redirect to HTTPS and load new site

**Via curl:**
```bash
# Test root domain
curl -I https://disruptorsmedia.com

# Should return:
# HTTP/2 200
# server: Netlify

# Test www subdomain
curl -I https://www.disruptorsmedia.com
```

#### 3.3 - CRITICAL: Test Email (DO THIS IMMEDIATELY)

**Send test email:**
1. Send email FROM: personal account
2. Send email TO: tyler@disruptorsmedia.com
3. **Wait 5 minutes** - check if it arrives
4. Repeat for: will@disruptorsmedia.com

**If email fails:**
1. Check MX records in GoDaddy DNS (verify they weren't changed)
2. Run: `dig MX disruptorsmedia.com`
3. Should show original email server, NOT Netlify

---

## 🛟 Rollback Plan (If Something Goes Wrong)

### Scenario 1: Website Doesn't Load

**Symptoms**: disruptorsmedia.com shows error or old site

**Fix**:
```bash
# Check Netlify domain directly
curl -I https://cheerful-custard-2e6fc5.netlify.app

# If Netlify works, it's a DNS issue
# Check DNS propagation:
dig disruptorsmedia.com

# If DNS hasn't propagated, wait 1 hour and re-check
```

**Emergency Rollback**:
1. Login to GoDaddy DNS
2. Change A record BACK to original DigitalOcean IP
3. Change CNAME record BACK to original value
4. Save changes
5. Wait 15-30 minutes for propagation

### Scenario 2: Email Stops Working

**Symptoms**: Emails bounce or aren't received

**IMMEDIATE ACTION**:
1. Login to GoDaddy DNS Manager
2. Check MX records - verify they match your backup screenshots
3. If changed, restore original MX records IMMEDIATELY
4. Check TXT records (SPF, DKIM) - restore if changed

**Prevention**: This should never happen if you follow the plan and don't touch MX records

---

## 📋 Pre-Migration Checklist

Before proceeding, verify:

- [ ] I have GoDaddy login credentials
- [ ] I have DigitalOcean login credentials
- [ ] I have Netlify login credentials (techintegrationlabs@gmail.com)
- [ ] I've documented ALL current DNS records with screenshots
- [ ] I know which email provider we're using (GoDaddy/Google/Microsoft/Other)
- [ ] I have a backup of all DNS records saved locally
- [ ] I've tested the new site on dm4.wjwelsh.com and it works perfectly
- [ ] I understand MX records must NOT be changed
- [ ] I'm prepared to monitor email for 24 hours after migration
- [ ] I have rollback instructions ready if needed

---

## 🎯 Step-by-Step Migration Execution

### Before You Start
- **Set aside 2 hours** for migration and monitoring
- **Have GoDaddy, DigitalOcean, and Netlify tabs open**
- **Keep this document open for reference**

### Execution Steps

1. **Document Current DNS** (30 minutes)
   - Screenshot all GoDaddy DNS records
   - Save screenshots to Documents folder
   - Write down all MX, TXT, CNAME, A records

2. **Add Domain to Netlify** (10 minutes)
   - Via CLI or dashboard (instructions above)
   - Do NOT change DNS yet

3. **Update GoDaddy DNS** (10 minutes)
   - Change A record to: 75.2.60.5
   - Change www CNAME to: cheerful-custard-2e6fc5.netlify.app
   - **DO NOT TOUCH** any other records

4. **Wait for DNS Propagation** (1-4 hours)
   - Check with: `dig disruptorsmedia.com`
   - Monitor in real-time: https://www.whatsmydns.net/#A/disruptorsmedia.com

5. **Test Everything** (30 minutes)
   - Browse to: https://disruptorsmedia.com
   - Test www subdomain
   - **Send test emails**
   - Check all major pages

6. **Monitor for 24 Hours**
   - Check email delivery
   - Monitor site uptime
   - Watch Netlify analytics

---

## 🔧 Alternative: Gradual Migration (Safest Option)

If you want to be extra cautious:

### Step 1: Deploy to Subdomain First
```bash
# Add a test subdomain to Netlify
npx netlify domains:add test.disruptorsmedia.com

# In GoDaddy DNS, add:
# Type: CNAME
# Name: test
# Value: cheerful-custard-2e6fc5.netlify.app
# TTL: 600

# Wait 15 minutes, then test:
https://test.disruptorsmedia.com
```

### Step 2: Test Thoroughly on Subdomain
- Share test.disruptorsmedia.com with team
- Test all pages, forms, functions
- Verify everything works perfectly

### Step 3: Switch Main Domain When Ready
- Once confident, update @ and www DNS records
- Much lower risk since you've already tested

---

## 📞 Support Resources

### If You Need Help

**Netlify Support**
- Dashboard: https://app.netlify.com/support
- Docs: https://docs.netlify.com/domains-https/custom-domains/

**GoDaddy Support**
- Phone: 1-480-505-8877
- Help: https://www.godaddy.com/help

**DigitalOcean Support** (in case you need to check current setup)
- Support: https://www.digitalocean.com/support

---

## ✅ Post-Migration Verification

Once migration is complete, verify:

- [ ] https://disruptorsmedia.com loads correctly (HTTPS)
- [ ] https://www.disruptorsmedia.com loads correctly (HTTPS)
- [ ] SSL certificate is valid (green padlock)
- [ ] All pages work (check major routes)
- [ ] Netlify Functions work (test Growth Audit, Keyword Research)
- [ ] Email delivery works (send/receive test emails)
- [ ] No console errors in browser
- [ ] Contact form submissions work
- [ ] Admin panel accessible (/admin/secret)

---

## 🎉 Expected Timeline

| Phase | Duration | DNS Propagation | Total |
|-------|----------|-----------------|-------|
| Prep & Documentation | 30 min | N/A | 30 min |
| Netlify Configuration | 15 min | N/A | 45 min |
| DNS Update | 10 min | N/A | 55 min |
| DNS Propagation Wait | 0 min | 1-4 hours | 1-5 hours |
| Testing & Verification | 30 min | N/A | 1.5-5.5 hours |
| Monitoring Period | N/A | N/A | 24 hours |

**Best Time to Migrate**: Low-traffic period (evening/weekend)

---

## 📝 Notes

- Netlify offers better performance than DigitalOcean for static sites
- Netlify's CDN serves content from 100+ global locations
- SSL is automatic and free with Netlify
- Serverless functions are included (no extra server management)
- This migration is **reversible** if needed (just change DNS back)

---

**Created**: 2025-10-12
**Author**: Claude Code Assistant
**Status**: Ready for Execution
