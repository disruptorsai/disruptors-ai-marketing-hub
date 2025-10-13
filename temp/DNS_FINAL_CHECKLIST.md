# DNS Setup Checklist for disruptorsmedia.com

**Quick Link**: https://app.netlify.com/teams/techintegrationlabs/dns/disruptorsmedia.com

**Zone ID**: `68eafc246a5204254e17d3a3`
**Date**: 2025-10-13

---

## ✅ Already Configured

These records are already in place:
- ✅ Google Workspace MX: `smtp.google.com` (Priority 1)
- ✅ A Record: `162.159.140.166` (GHL)
- ✅ www CNAME: `sites.ludicrous.cloud` (GHL)

---

## 📝 Records to Add

### Section 1: Root Domain (disruptorsmedia.com)

#### 1. SPF Record
```
Type:  TXT
Host:  @ (or leave blank / disruptorsmedia.com)
Value: v=spf1 include:_spf.google.com include:mailgun.org ~all
TTL:   3600
```
⚠️ **IMPORTANT**: Check if any SPF record exists first. Only ONE SPF record allowed!

#### 2. DMARC Record
```
Type:  TXT
Host:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@disruptorsmedia.com; fo=1; pct=100
TTL:   3600
```

#### 3. Google DKIM
```
Type:  TXT
Host:  google._domainkey
Value: [GET FROM GOOGLE ADMIN CONSOLE - Instructions below]
TTL:   3600
```

**To get Google DKIM key:**
1. Go to: https://admin.google.com
2. Navigate to: **Apps → Google Workspace → Gmail → Authenticate email**
3. Click **"Generate new record"** for disruptorsmedia.com
4. Copy the TXT record value (starts with "v=DKIM1; k=rsa; p=...")
5. Paste it as the Value above

---

### Section 2: Mailgun Subdomain (mg.disruptorsmedia.com)

#### 4. Mailgun SPF
```
Type:  TXT
Host:  mg
Value: v=spf1 include:mailgun.org ~all
TTL:   3600
```

#### 5. Mailgun MX (Record A)
```
Type:     MX
Host:     mg
Value:    mxa.mailgun.org
Priority: 10
TTL:      3600
```

#### 6. Mailgun MX (Record B)
```
Type:     MX
Host:     mg
Value:    mxb.mailgun.org
Priority: 10
TTL:      3600
```

#### 7. Email Tracking CNAME
```
Type:  CNAME
Host:  email.mg
Value: mailgun.org
TTL:   3600
```

#### 8. Mailgun DKIM 1
```
Type:  CNAME
Host:  pdk1._domainkey.mg
Value: [GET FROM GOHIGHLEVEL - Instructions below]
TTL:   3600
```

#### 9. Mailgun DKIM 2
```
Type:  CNAME
Host:  pdk2._domainkey.mg
Value: [GET FROM GOHIGHLEVEL - Instructions below]
TTL:   3600
```

**To get Mailgun DKIM keys:**
1. Log into GoHighLevel: https://app.gohighlevel.com
2. Go to: **Settings → Email Services → Sending Domains**
3. Click **"Add Sending Domain"**
4. Enter: `mg.disruptorsmedia.com`
5. Copy the exact CNAME values shown for **pdk1** and **pdk2**
6. They'll look like: `pdk1._domainkey.ABC123.dkim1.mailgun.com`
7. Paste them as the Values above

---

## 🚀 Step-by-Step Adding Process

### Option 1: Web Dashboard (Recommended)

1. Go to: https://app.netlify.com/teams/techintegrationlabs/dns/disruptorsmedia.com
2. Click **"Add new record"**
3. Fill in:
   - **Record type**: Select from dropdown
   - **Name/Host**: Enter host (e.g., `@`, `_dmarc`, `mg`, etc.)
   - **Value**: Paste the value
   - **TTL**: Set to 3600 (or leave as Auto)
   - **Priority**: Only for MX records
4. Click **"Save"**
5. Repeat for each record

### Option 2: Via Netlify CLI

If you prefer command line, use the script I created:
```bash
chmod +x temp/add-dns-records.sh
./temp/add-dns-records.sh
```

---

## ✓ Progress Checklist

Track your progress as you add each record:

### Root Domain
- [ ] SPF (TXT)
- [ ] DMARC (TXT)
- [ ] Google DKIM (TXT at google._domainkey)

### Mailgun Subdomain (mg)
- [ ] SPF (TXT at mg)
- [ ] MX Record A (mxa.mailgun.org, priority 10)
- [ ] MX Record B (mxb.mailgun.org, priority 10)
- [ ] Tracking CNAME (email.mg → mailgun.org)
- [ ] DKIM 1 (CNAME at pdk1._domainkey.mg)
- [ ] DKIM 2 (CNAME at pdk2._domainkey.mg)

**Total**: 10 new records to add

---

## 🔍 Verification

### After adding all records:

**1. Wait for DNS propagation** (15-30 minutes)

**2. Run verification script:**
```bash
cd /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub
node temp/verify-dns-records.js
```

**3. Online verification tools:**
- MXToolbox: https://mxtoolbox.com/SuperTool.aspx
- DMARC Analyzer: https://dmarcian.com/dmarc-inspector/
- Mailgun verification in GHL dashboard

**4. GoHighLevel verification:**
1. Go to: Settings → Email Services → Sending Domains
2. Find: `mg.disruptorsmedia.com`
3. Click **"Verify"**
4. All checks should turn green ✅

**5. Test email sending:**
- Send a test email from GHL
- Check deliverability

---

## 📋 Quick Copy-Paste Values

For faster adding, here are the values ready to copy:

**SPF (Root):**
```
v=spf1 include:_spf.google.com include:mailgun.org ~all
```

**DMARC:**
```
v=DMARC1; p=none; rua=mailto:dmarc@disruptorsmedia.com; fo=1; pct=100
```

**Mailgun SPF:**
```
v=spf1 include:mailgun.org ~all
```

**Mailgun MX A:**
```
mxa.mailgun.org
```

**Mailgun MX B:**
```
mxb.mailgun.org
```

**Tracking:**
```
mailgun.org
```

---

## ⚠️ Important Notes

1. **SPF Record**: Only ONE SPF record per domain! Check if one exists before adding.

2. **DKIM Keys**: MUST be obtained from:
   - Google Admin Console (for google._domainkey)
   - GoHighLevel dashboard (for pdk1 and pdk2)

3. **DNS Propagation**: Changes can take 1-48 hours (usually <1 hour)

4. **TTL**: Can be set to 3600 or left as "Auto"

5. **Priority**: Only required for MX records (set to 10 for Mailgun)

6. **Hostname Format**:
   - Root domain: `@` or blank or `disruptorsmedia.com`
   - Subdomain: `mg`
   - DKIM: `google._domainkey` or `pdk1._domainkey.mg`

---

## 📞 Support Resources

- **Netlify DNS Dashboard**: https://app.netlify.com/teams/techintegrationlabs/dns/disruptorsmedia.com
- **Google Admin Console**: https://admin.google.com
- **GoHighLevel**: https://app.gohighlevel.com
- **Setup Guide**: `temp/NETLIFY_DNS_SETUP.md` (comprehensive)
- **Verification Script**: `temp/verify-dns-records.js`
- **DNS Records List**: `temp/dns-records-to-add.txt`

---

## 🎯 Timeline

- **Now**: Add records in Netlify dashboard (10-15 minutes)
- **+15 min**: DNS starts propagating
- **+30 min**: Most records should be live
- **+1 hour**: Run verification script
- **+24 hours**: Full global propagation guaranteed

---

**Status**: Ready to implement
**Last Updated**: 2025-10-13
