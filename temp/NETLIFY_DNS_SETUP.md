# Netlify DNS Setup for disruptorsmedia.com

**Date**: 2025-10-13
**Purpose**: Configure DNS for Google Workspace + GoHighLevel/Mailgun sending

## Overview

This setup allows:
- ✅ User email on Google Workspace (root domain)
- ✅ GHL/Mailgun sending from subdomain (mg.disruptorsmedia.com)
- ✅ No MX record conflicts
- ✅ Proper SPF, DKIM, DMARC configuration

---

## Part A: Root Domain (disruptorsmedia.com) - Google Workspace

### 1. MX Record (Google Workspace)
```
Type: MX
Host: @
Value: smtp.google.com
Priority: 1
TTL: 3600 (or Auto)
```

**Note**: Google Workspace now uses a single MX record (smtp.google.com) instead of the old multi-MX setup.

### 2. SPF Record (Combined)
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.google.com include:mailgun.org ~all
TTL: 3600
```

**Important**: This single SPF record authorizes both:
- Google Workspace to send from your domain
- Mailgun (GHL) to send on behalf of your domain

### 3. DKIM Record (Google)
```
Type: TXT
Host: google._domainkey
Value: [GET FROM GOOGLE ADMIN CONSOLE]
TTL: 3600
```

**To get the DKIM key**:
1. Go to Google Admin Console: https://admin.google.com
2. Navigate to: Apps → Google Workspace → Gmail → Authenticate email
3. Click "Generate new record"
4. Copy the TXT record value (starts with "v=DKIM1; k=rsa; p=...")

### 4. DMARC Record
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@disruptorsmedia.com; fo=1; pct=100
TTL: 3600
```

**What this does**:
- `p=none` - Monitor only (doesn't reject mail)
- `rua=mailto:dmarc@disruptorsmedia.com` - Send aggregate reports
- `fo=1` - Generate reports for all failures
- `pct=100` - Apply policy to 100% of messages

**Later**: Change `p=none` to `p=quarantine` or `p=reject` after monitoring

---

## Part B: Subdomain (mg.disruptorsmedia.com) - GHL/Mailgun

### 1. SPF Record (Subdomain)
```
Type: TXT
Host: mg
Value: v=spf1 include:mailgun.org ~all
TTL: 3600
```

**Note**: Optional but recommended by Mailgun

### 2. DKIM Records (Mailgun)
Mailgun uses TWO CNAME records for DKIM:

```
Type: CNAME
Host: pdk1._domainkey.mg
Value: pdk1._domainkey.[YOUR-HASH].dkim1.mailgun.com
TTL: 3600
```

```
Type: CNAME
Host: pdk2._domainkey.mg
Value: pdk2._domainkey.[YOUR-HASH].dkim1.mailgun.com
TTL: 3600
```

**To get your exact values**:
1. Log into GoHighLevel
2. Go to: Settings → Email Services → Sending Domains
3. Add domain: `mg.disruptorsmedia.com`
4. Copy the exact CNAME records shown

### 3. Tracking CNAME (Click/Open Tracking)
```
Type: CNAME
Host: email.mg
Value: mailgun.org
TTL: 3600
```

### 4. MX Records (Mailgun Subdomain)
```
Type: MX
Host: mg
Value: mxa.mailgun.org
Priority: 10
TTL: 3600
```

```
Type: MX
Host: mg
Value: mxb.mailgun.org
Priority: 10
TTL: 3600
```

**Note**: These MX records are for Mailgun verification/deliverability, NOT your inbox.

---

## Part C: Optional - GHL Funnel/Site Hosting

If you want to host GHL pages on a subdomain (e.g., go.disruptorsmedia.com):

### Option 1: CNAME (Recommended)
```
Type: CNAME
Host: go
Value: sites.ludicrous.cloud
TTL: 3600
```

### Option 2: A Record
```
Type: A
Host: go
Value: 162.159.140.166
TTL: 3600
```

**Then in GHL**:
1. Go to: Settings → Domains
2. Add custom domain: `go.disruptorsmedia.com`
3. Verify ownership

---

## How to Add Records in Netlify

### Step-by-Step:

1. **Log into Netlify**: https://app.netlify.com
2. **Navigate to DNS**:
   - Go to your site dashboard
   - Click "Domain management"
   - Click "DNS records"
3. **Add each record**:
   - Click "Add new record"
   - Select record type (MX, TXT, CNAME, A)
   - Enter Host/Name
   - Enter Value
   - Set Priority (for MX only)
   - Set TTL (or leave as Auto)
   - Click "Save"

### Important Notes:
- **@ symbol**: Netlify automatically converts `@` to your root domain
- **Trailing dots**: Netlify handles these automatically
- **TTL**: Can leave as "Auto" or set to 3600
- **Propagation**: DNS changes can take 1-48 hours (usually <1 hour)

---

## Complete DNS Record Checklist

Copy this checklist to track your progress:

### Root Domain (@)
- [ ] MX: smtp.google.com (Priority 1)
- [ ] TXT (SPF): v=spf1 include:_spf.google.com include:mailgun.org ~all
- [ ] TXT (DKIM): google._domainkey → [GOOGLE KEY]
- [ ] TXT (DMARC): _dmarc → v=DMARC1; p=none; rua=mailto:dmarc@disruptorsmedia.com; fo=1; pct=100

### Subdomain (mg)
- [ ] TXT (SPF): v=spf1 include:mailgun.org ~all
- [ ] CNAME (DKIM1): pdk1._domainkey.mg → [MAILGUN VALUE]
- [ ] CNAME (DKIM2): pdk2._domainkey.mg → [MAILGUN VALUE]
- [ ] CNAME (Tracking): email.mg → mailgun.org
- [ ] MX: mxa.mailgun.org (Priority 10)
- [ ] MX: mxb.mailgun.org (Priority 10)

### Optional (go)
- [ ] CNAME: go → sites.ludicrous.cloud
- [ ] OR A: go → 162.159.140.166

---

## Verification Steps

### 1. Check MX Records
```bash
nslookup -type=mx disruptorsmedia.com
# Expected: 1 smtp.google.com
```

### 2. Check SPF Record
```bash
nslookup -type=txt disruptorsmedia.com
# Expected: v=spf1 include:_spf.google.com include:mailgun.org ~all
```

### 3. Check Google DKIM
```bash
nslookup -type=txt google._domainkey.disruptorsmedia.com
# Expected: v=DKIM1; k=rsa; p=...
```

### 4. Check DMARC
```bash
nslookup -type=txt _dmarc.disruptorsmedia.com
# Expected: v=DMARC1; p=none; rua=...
```

### 5. Check Mailgun Subdomain
```bash
nslookup -type=mx mg.disruptorsmedia.com
# Expected: mxa.mailgun.org, mxb.mailgun.org

nslookup -type=cname pdk1._domainkey.mg.disruptorsmedia.com
# Expected: pdk1._domainkey.[hash].dkim1.mailgun.com
```

### 6. Verify in GHL
1. Go to: Settings → Email Services → Sending Domains
2. Check that `mg.disruptorsmedia.com` shows **✅ Verified**
3. All DKIM, SPF, tracking should be green

---

## Online Verification Tools

Use these tools to verify your setup:

1. **MXToolbox**: https://mxtoolbox.com/SuperTool.aspx
   - Check: MX, SPF, DMARC, DKIM
   - Enter: `disruptorsmedia.com`

2. **Google Admin Toolbox**: https://toolbox.googleapps.com/apps/checkmx/
   - Verify: MX records for Google Workspace

3. **DMARC Analyzer**: https://dmarcian.com/dmarc-inspector/
   - Check: DMARC policy

4. **Mailgun Domain Verification**:
   - In GHL/Mailgun dashboard
   - Wait for all checks to turn green

---

## Troubleshooting

### Issue: SPF record not found
- **Solution**: Make sure only ONE SPF TXT record exists at root (@)
- Delete any old SPF records before adding the new combined one

### Issue: Google MX not working
- **Solution**: Remove any old Google MX records (aspmx.l.google.com, etc.)
- Use only `smtp.google.com` with priority 1

### Issue: Mailgun not verifying
- **Solution**:
  - Check that subdomain records use `mg` prefix
  - Verify exact CNAME values from GHL dashboard
  - Wait 10-15 minutes for DNS propagation
  - Click "Verify" in GHL again

### Issue: DKIM not found
- **Solution**:
  - For Google: Ensure Host is `google._domainkey` (not `_domainkey`)
  - For Mailgun: Ensure Host is `pdk1._domainkey.mg` and `pdk2._domainkey.mg`

### Issue: DMARC reports not received
- **Solution**:
  - Verify email address in `rua=` exists and can receive mail
  - Reports are sent weekly by email providers
  - Use a DMARC analyzer service like dmarcian.com

---

## Timeline

- **Immediate**: Records added to Netlify DNS
- **15 minutes**: Most DNS changes propagate
- **1 hour**: Full propagation for most providers
- **24-48 hours**: Maximum propagation time globally

---

## Support Resources

- **Google Workspace MX Setup**: https://support.google.com/a/answer/174125
- **Mailgun DNS Documentation**: https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain
- **GoHighLevel Support**: https://help.gohighlevel.com/support/home
- **Netlify DNS Docs**: https://docs.netlify.com/domains-https/netlify-dns/

---

## Quick Reference Card

```
ROOT DOMAIN (@)
├── MX: smtp.google.com (1)
├── TXT: v=spf1 include:_spf.google.com include:mailgun.org ~all
├── TXT: google._domainkey → [GOOGLE DKIM KEY]
└── TXT: _dmarc → v=DMARC1; p=none; rua=mailto:dmarc@disruptorsmedia.com; fo=1; pct=100

SUBDOMAIN (mg)
├── TXT: v=spf1 include:mailgun.org ~all
├── CNAME: pdk1._domainkey.mg → [MAILGUN DKIM1]
├── CNAME: pdk2._domainkey.mg → [MAILGUN DKIM2]
├── CNAME: email.mg → mailgun.org
├── MX: mxa.mailgun.org (10)
└── MX: mxb.mailgun.org (10)

OPTIONAL (go)
└── CNAME: go → sites.ludicrous.cloud
```

---

**Last Updated**: 2025-10-13
**Status**: Ready for Implementation
