/**
 * DNS Records Verification Script
 *
 * Verifies DNS configuration for disruptorsmedia.com
 * - Google Workspace MX
 * - SPF (combined Google + Mailgun)
 * - DKIM (Google and Mailgun)
 * - DMARC
 * - Mailgun subdomain (mg.disruptorsmedia.com)
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const DOMAIN = 'disruptorsmedia.com';
const MG_SUBDOMAIN = `mg.${DOMAIN}`;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(message, 'bold');
  log('='.repeat(60), 'cyan');
}

async function checkDNS(type, host, expected = null) {
  try {
    const { stdout } = await execPromise(`nslookup -type=${type} ${host}`);
    return { success: true, output: stdout, raw: stdout };
  } catch (error) {
    return { success: false, output: error.stderr || error.message, raw: '' };
  }
}

async function verifyMX() {
  header('1. MX Records (Google Workspace)');
  log(`Checking: ${DOMAIN}`, 'blue');

  const result = await checkDNS('mx', DOMAIN);

  if (result.success && result.output.includes('smtp.google.com')) {
    log('✅ PASS: Google Workspace MX found (smtp.google.com)', 'green');
    return true;
  } else if (result.success && result.output.includes('aspmx.l.google.com')) {
    log('⚠️  WARNING: Old Google MX records found', 'yellow');
    log('   Action needed: Update to new single MX: smtp.google.com', 'yellow');
    return false;
  } else {
    log('❌ FAIL: Google Workspace MX not found', 'red');
    log('   Expected: smtp.google.com (priority 1)', 'yellow');
    return false;
  }
}

async function verifySPF() {
  header('2. SPF Record (Root Domain)');
  log(`Checking: ${DOMAIN}`, 'blue');

  const result = await checkDNS('txt', DOMAIN);

  if (result.success) {
    const hasGoogleSPF = result.output.includes('include:_spf.google.com');
    const hasMailgunSPF = result.output.includes('include:mailgun.org');
    const hasSPF = result.output.includes('v=spf1');

    if (hasGoogleSPF && hasMailgunSPF) {
      log('✅ PASS: SPF includes both Google and Mailgun', 'green');
      return true;
    } else if (hasSPF && hasGoogleSPF) {
      log('⚠️  WARNING: SPF found but missing Mailgun', 'yellow');
      log('   Action needed: Add include:mailgun.org to SPF', 'yellow');
      return false;
    } else if (hasSPF) {
      log('⚠️  WARNING: SPF found but missing Google and/or Mailgun', 'yellow');
      return false;
    } else {
      log('❌ FAIL: No SPF record found', 'red');
      log('   Expected: v=spf1 include:_spf.google.com include:mailgun.org ~all', 'yellow');
      return false;
    }
  } else {
    log('❌ FAIL: Unable to query SPF record', 'red');
    return false;
  }
}

async function verifyGoogleDKIM() {
  header('3. Google DKIM Record');
  const host = `google._domainkey.${DOMAIN}`;
  log(`Checking: ${host}`, 'blue');

  const result = await checkDNS('txt', host);

  if (result.success && result.output.includes('v=DKIM1') && result.output.includes('p=')) {
    log('✅ PASS: Google DKIM record found', 'green');
    return true;
  } else {
    log('❌ FAIL: Google DKIM record not found', 'red');
    log('   Action needed: Add DKIM TXT record from Google Admin Console', 'yellow');
    return false;
  }
}

async function verifyDMARC() {
  header('4. DMARC Record');
  const host = `_dmarc.${DOMAIN}`;
  log(`Checking: ${host}`, 'blue');

  const result = await checkDNS('txt', host);

  if (result.success && result.output.includes('v=DMARC1')) {
    log('✅ PASS: DMARC record found', 'green');

    if (result.output.includes('p=none')) {
      log('   Policy: Monitor only (p=none)', 'cyan');
      log('   Tip: Consider upgrading to p=quarantine after monitoring', 'cyan');
    } else if (result.output.includes('p=quarantine')) {
      log('   Policy: Quarantine suspicious emails (p=quarantine)', 'cyan');
    } else if (result.output.includes('p=reject')) {
      log('   Policy: Reject unauthorized emails (p=reject)', 'cyan');
    }

    return true;
  } else {
    log('❌ FAIL: DMARC record not found', 'red');
    log('   Expected: v=DMARC1; p=none; rua=mailto:dmarc@disruptorsmedia.com; fo=1; pct=100', 'yellow');
    return false;
  }
}

async function verifyMailgunSubdomain() {
  header('5. Mailgun Subdomain (mg.disruptorsmedia.com)');

  // Check MX records
  log(`\nChecking MX: ${MG_SUBDOMAIN}`, 'blue');
  const mxResult = await checkDNS('mx', MG_SUBDOMAIN);

  const mxPass = mxResult.success &&
    mxResult.output.includes('mxa.mailgun.org') &&
    mxResult.output.includes('mxb.mailgun.org');

  if (mxPass) {
    log('✅ PASS: Mailgun MX records found', 'green');
  } else {
    log('❌ FAIL: Mailgun MX records not found', 'red');
    log('   Expected: mxa.mailgun.org, mxb.mailgun.org', 'yellow');
  }

  // Check DKIM CNAMEs
  log(`\nChecking DKIM: pdk1._domainkey.${MG_SUBDOMAIN}`, 'blue');
  const dkim1Result = await checkDNS('cname', `pdk1._domainkey.${MG_SUBDOMAIN}`);

  const dkim1Pass = dkim1Result.success && dkim1Result.output.includes('dkim1.mailgun.com');

  if (dkim1Pass) {
    log('✅ PASS: Mailgun DKIM1 CNAME found', 'green');
  } else {
    log('❌ FAIL: Mailgun DKIM1 CNAME not found', 'red');
    log('   Expected: pdk1._domainkey.[hash].dkim1.mailgun.com', 'yellow');
  }

  log(`\nChecking DKIM: pdk2._domainkey.${MG_SUBDOMAIN}`, 'blue');
  const dkim2Result = await checkDNS('cname', `pdk2._domainkey.${MG_SUBDOMAIN}`);

  const dkim2Pass = dkim2Result.success && dkim2Result.output.includes('dkim1.mailgun.com');

  if (dkim2Pass) {
    log('✅ PASS: Mailgun DKIM2 CNAME found', 'green');
  } else {
    log('❌ FAIL: Mailgun DKIM2 CNAME not found', 'red');
    log('   Expected: pdk2._domainkey.[hash].dkim1.mailgun.com', 'yellow');
  }

  // Check tracking CNAME
  log(`\nChecking tracking: email.${MG_SUBDOMAIN}`, 'blue');
  const trackResult = await checkDNS('cname', `email.${MG_SUBDOMAIN}`);

  const trackPass = trackResult.success && trackResult.output.includes('mailgun.org');

  if (trackPass) {
    log('✅ PASS: Mailgun tracking CNAME found', 'green');
  } else {
    log('❌ FAIL: Mailgun tracking CNAME not found', 'red');
    log('   Expected: mailgun.org', 'yellow');
  }

  return mxPass && dkim1Pass && dkim2Pass && trackPass;
}

async function runAllChecks() {
  log('\n' + '█'.repeat(60), 'cyan');
  log('  DNS VERIFICATION FOR DISRUPTORSMEDIA.COM', 'bold');
  log('█'.repeat(60) + '\n', 'cyan');

  const results = {
    mx: await verifyMX(),
    spf: await verifySPF(),
    googleDKIM: await verifyGoogleDKIM(),
    dmarc: await verifyDMARC(),
    mailgun: await verifyMailgunSubdomain()
  };

  // Summary
  header('VERIFICATION SUMMARY');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  log(`\nResults: ${passed}/${total} checks passed\n`, passed === total ? 'green' : 'yellow');

  log(`${results.mx ? '✅' : '❌'} Google Workspace MX`, results.mx ? 'green' : 'red');
  log(`${results.spf ? '✅' : '❌'} SPF Record (Google + Mailgun)`, results.spf ? 'green' : 'red');
  log(`${results.googleDKIM ? '✅' : '❌'} Google DKIM`, results.googleDKIM ? 'green' : 'red');
  log(`${results.dmarc ? '✅' : '❌'} DMARC Policy`, results.dmarc ? 'green' : 'red');
  log(`${results.mailgun ? '✅' : '❌'} Mailgun Subdomain (mg)`, results.mailgun ? 'green' : 'red');

  if (passed === total) {
    log('\n🎉 All DNS records configured correctly!', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Verify in GoHighLevel: Settings → Email Services → Sending Domains', 'cyan');
    log('2. Check that mg.disruptorsmedia.com shows "Verified" with green checks', 'cyan');
    log('3. Send test emails from GHL to verify deliverability', 'cyan');
  } else {
    log('\n⚠️  Some DNS records need attention', 'yellow');
    log('\nRefer to: temp/NETLIFY_DNS_SETUP.md for detailed setup instructions', 'cyan');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');
}

// Run all checks
runAllChecks().catch(error => {
  log(`\n❌ Error running verification: ${error.message}`, 'red');
  process.exit(1);
});
