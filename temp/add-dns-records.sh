#!/bin/bash

# DNS Records Setup Script for disruptorsmedia.com
# This script adds all required DNS records to Netlify DNS

ZONE_ID="68eafc246a5204254e17d3a3"
DOMAIN="disruptorsmedia.com"

echo "════════════════════════════════════════════════════════════"
echo "  Adding DNS Records to disruptorsmedia.com via Netlify CLI"
echo "════════════════════════════════════════════════════════════"
echo ""

# Function to add DNS record
add_record() {
  local hostname=$1
  local type=$2
  local value=$3
  local priority=$4
  local ttl=${5:-3600}

  echo "➜ Adding $type record: $hostname"

  if [ "$type" = "MX" ]; then
    npx netlify api createDnsRecord --data="{\"zone_id\": \"$ZONE_ID\", \"type\": \"$type\", \"hostname\": \"$hostname\", \"value\": \"$value\", \"priority\": $priority, \"ttl\": $ttl}" 2>&1
  else
    npx netlify api createDnsRecord --data="{\"zone_id\": \"$ZONE_ID\", \"type\": \"$type\", \"hostname\": \"$hostname\", \"value\": \"$value\", \"ttl\": $ttl}" 2>&1
  fi

  if [ $? -eq 0 ]; then
    echo "  ✅ Success"
  else
    echo "  ⚠️  May already exist or error occurred"
  fi
  echo ""
}

# ═══════════════════════════════════════════════════════════════
# SECTION 1: ROOT DOMAIN - SPF, DKIM, DMARC
# ═══════════════════════════════════════════════════════════════

echo "──────────────────────────────────────────────────────────"
echo "  Section 1: Root Domain Records"
echo "──────────────────────────────────────────────────────────"
echo ""

# SPF Record (Combined Google + Mailgun)
echo "⚠️  IMPORTANT: Check if an SPF record already exists first!"
echo "   Only ONE SPF record should exist per domain."
echo "   If an SPF record exists, you'll need to UPDATE it, not add a new one."
echo ""
read -p "Press Enter to add SPF record or Ctrl+C to skip..."
add_record "$DOMAIN" "TXT" "v=spf1 include:_spf.google.com include:mailgun.org ~all"

# DMARC Record
add_record "_dmarc.$DOMAIN" "TXT" "v=DMARC1; p=none; rua=mailto:dmarc@disruptorsmedia.com; fo=1; pct=100"

# Google DKIM - REQUIRES MANUAL INPUT
echo "──────────────────────────────────────────────────────────"
echo "  ⚠️  GOOGLE DKIM KEY REQUIRED"
echo "──────────────────────────────────────────────────────────"
echo ""
echo "To add the Google DKIM record, you need to:"
echo "1. Go to Google Admin Console: https://admin.google.com"
echo "2. Navigate to: Apps → Google Workspace → Gmail → Authenticate email"
echo "3. Click 'Generate new record' for disruptorsmedia.com"
echo "4. Copy the TXT record value (starts with 'v=DKIM1; k=rsa; p=...')"
echo ""
read -p "Paste the Google DKIM key here (or press Enter to skip): " GOOGLE_DKIM

if [ ! -z "$GOOGLE_DKIM" ]; then
  add_record "google._domainkey.$DOMAIN" "TXT" "$GOOGLE_DKIM"
else
  echo "⚠️  Skipped Google DKIM - You'll need to add this manually later"
  echo ""
fi

# ═══════════════════════════════════════════════════════════════
# SECTION 2: MAILGUN SUBDOMAIN (mg.disruptorsmedia.com)
# ═══════════════════════════════════════════════════════════════

echo "──────────────────────────────────────────────────────────"
echo "  Section 2: Mailgun Subdomain Records"
echo "──────────────────────────────────────────────────────────"
echo ""

# Mailgun SPF
add_record "mg.$DOMAIN" "TXT" "v=spf1 include:mailgun.org ~all"

# Mailgun MX Records
add_record "mg.$DOMAIN" "MX" "mxa.mailgun.org" 10
add_record "mg.$DOMAIN" "MX" "mxb.mailgun.org" 10

# Mailgun Tracking CNAME
add_record "email.mg.$DOMAIN" "CNAME" "mailgun.org"

# Mailgun DKIM - REQUIRES MANUAL INPUT FROM GHL
echo "──────────────────────────────────────────────────────────"
echo "  ⚠️  MAILGUN DKIM KEYS REQUIRED"
echo "──────────────────────────────────────────────────────────"
echo ""
echo "To get your Mailgun DKIM keys:"
echo "1. Log into GoHighLevel: https://app.gohighlevel.com"
echo "2. Go to: Settings → Email Services → Sending Domains"
echo "3. Add domain: mg.disruptorsmedia.com"
echo "4. Copy the CNAME values for pdk1 and pdk2"
echo "   They look like: pdk1._domainkey.ABC123.dkim1.mailgun.com"
echo ""

read -p "Paste DKIM1 CNAME value (or press Enter to skip): " DKIM1
if [ ! -z "$DKIM1" ]; then
  add_record "pdk1._domainkey.mg.$DOMAIN" "CNAME" "$DKIM1"
else
  echo "⚠️  Skipped DKIM1 - You'll need to add this manually later"
  echo ""
fi

read -p "Paste DKIM2 CNAME value (or press Enter to skip): " DKIM2
if [ ! -z "$DKIM2" ]; then
  add_record "pdk2._domainkey.mg.$DOMAIN" "CNAME" "$DKIM2"
else
  echo "⚠️  Skipped DKIM2 - You'll need to add this manually later"
  echo ""
fi

# ═══════════════════════════════════════════════════════════════
# COMPLETION
# ═══════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════"
echo "  DNS SETUP COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "✅ Added records to Netlify DNS"
echo ""
echo "Next steps:"
echo "1. Wait 15-30 minutes for DNS propagation"
echo "2. Run verification: node temp/verify-dns-records.js"
echo "3. Verify in GoHighLevel: Settings → Email Services → Sending Domains"
echo "4. Test email sending from GHL"
echo ""
echo "Notes:"
echo "- If you skipped Google DKIM or Mailgun DKIM keys, add them manually"
echo "- Use the Netlify dashboard for manual additions"
echo "- Check temp/NETLIFY_DNS_SETUP.md for detailed instructions"
echo ""
