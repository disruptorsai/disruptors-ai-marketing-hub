const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// WCAG 2.1 contrast ratio calculation
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function parseColor(color) {
  if (!color) return null;

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
  }

  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16)
    };
  }

  return null;
}

function passesWCAG(ratio, fontSize, fontWeight) {
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  return {
    passAA: ratio >= aaThreshold,
    passAAA: ratio >= aaaThreshold,
    aaThreshold,
    aaaThreshold,
    isLargeText
  };
}

async function analyzeContrast(page, url) {
  console.log(`\nAnalyzing: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for animations

    const pageTitle = await page.title();
    const screenshot = await page.screenshot({ fullPage: true });

    // Get all text elements
    const textElements = await page.evaluate(() => {
      const elements = [];
      const textNodes = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, span, div, li, label, input, textarea');

      textNodes.forEach((el, index) => {
        // Skip if element is hidden
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const style = window.getComputedStyle(el);
        const text = el.innerText?.trim();

        if (!text || text.length === 0) return;
        if (style.visibility === 'hidden' || style.display === 'none') return;

        // Get colors
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseInt(style.fontWeight) || 400;

        // Try to find actual background color by traversing parents
        let bgColor = backgroundColor;
        let parent = el.parentElement;
        while (parent && (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
          const parentStyle = window.getComputedStyle(parent);
          bgColor = parentStyle.backgroundColor;
          parent = parent.parentElement;
        }

        // If still transparent, check for background images
        let hasBackgroundImage = false;
        parent = el;
        while (parent && !hasBackgroundImage) {
          const parentStyle = window.getComputedStyle(parent);
          if (parentStyle.backgroundImage && parentStyle.backgroundImage !== 'none') {
            hasBackgroundImage = true;
          }
          parent = parent.parentElement;
        }

        elements.push({
          index,
          selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.className ? `.${el.className.split(' ').join('.')}` : ''),
          text: text.substring(0, 100),
          color,
          backgroundColor: bgColor || 'transparent',
          fontSize,
          fontWeight,
          hasBackgroundImage,
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        });
      });

      return elements;
    });

    // Analyze contrast for each element
    const contrastIssues = [];

    for (const element of textElements) {
      const textColor = parseColor(element.color);
      const bgColor = parseColor(element.backgroundColor);

      if (!textColor) continue;

      // If background is transparent or has background image, flag for manual review
      if (!bgColor || element.hasBackgroundImage) {
        contrastIssues.push({
          ...element,
          issue: 'manual-review',
          reason: element.hasBackgroundImage ? 'Text over background image' : 'Transparent background',
          ratio: null,
          wcag: null
        });
        continue;
      }

      const ratio = getContrastRatio(textColor, bgColor);
      const wcag = passesWCAG(ratio, element.fontSize, element.fontWeight);

      if (!wcag.passAA) {
        contrastIssues.push({
          ...element,
          issue: 'low-contrast',
          ratio: ratio.toFixed(2),
          wcag,
          textColor,
          bgColor
        });
      }
    }

    return {
      url,
      pageTitle,
      screenshot,
      totalElements: textElements.length,
      issuesFound: contrastIssues.length,
      issues: contrastIssues
    };
  } catch (error) {
    console.error(`Error analyzing ${url}:`, error.message);
    return {
      url,
      error: error.message,
      issues: []
    };
  }
}

async function main() {
  const baseUrl = 'http://localhost:5173';

  // Define all pages to check
  const pages = [
    '/',
    '/about',
    '/work',
    '/solutions',
    '/contact',
    '/blog',
    '/assessment',
    '/calculator',
    '/gallery',
    '/podcast',
    '/privacy',
    '/terms',
    // Work case studies
    '/work-advanced-wellness',
    '/work-america-trends',
    '/work-chiropractic',
    '/work-industrial-equipment',
    '/work-luxury-real-estate',
    '/work-manufacturing',
    '/work-pest-control',
    '/work-tech-startup',
    '/work-wellness',
    // Solutions pages
    '/solutions-ai-automation',
    '/solutions-crm-management',
    '/solutions-custom-apps',
    '/solutions-fractional-cmo',
    '/solutions-lead-generation',
    '/solutions-paid-advertising',
    '/solutions-podcasting',
    '/solutions-seo-geo',
    '/solutions-social-media-marketing'
  ];

  const outputDir = path.join(__dirname, '..', 'contrast-analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = [];
  let totalIssues = 0;

  console.log(`Starting contrast analysis of ${pages.length} pages...\n`);

  for (const pagePath of pages) {
    const result = await analyzeContrast(page, baseUrl + pagePath);
    results.push(result);

    if (result.screenshot) {
      const screenshotPath = path.join(outputDir, `screenshot-${pagePath.replace(/\//g, '-').substring(1) || 'home'}.png`);
      fs.writeFileSync(screenshotPath, result.screenshot);
      result.screenshotPath = screenshotPath;
      delete result.screenshot; // Remove binary data from JSON
    }

    totalIssues += result.issuesFound || 0;

    console.log(`  - Found ${result.issuesFound || 0} potential issues`);
  }

  await browser.close();

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: pages.length,
      pagesAnalyzed: results.filter(r => !r.error).length,
      totalIssues,
      issuesByType: {
        lowContrast: results.reduce((sum, r) => sum + (r.issues?.filter(i => i.issue === 'low-contrast').length || 0), 0),
        manualReview: results.reduce((sum, r) => sum + (r.issues?.filter(i => i.issue === 'manual-review').length || 0), 0)
      }
    },
    results
  };

  const reportPath = path.join(outputDir, 'contrast-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate human-readable markdown report
  let markdown = `# Contrast Analysis Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Pages:** ${report.summary.totalPages}\n`;
  markdown += `- **Pages Analyzed:** ${report.summary.pagesAnalyzed}\n`;
  markdown += `- **Total Issues:** ${report.summary.totalIssues}\n`;
  markdown += `  - Low Contrast: ${report.summary.issuesByType.lowContrast}\n`;
  markdown += `  - Manual Review Required: ${report.summary.issuesByType.manualReview}\n\n`;

  markdown += `## Issues by Page\n\n`;

  for (const result of results) {
    if (result.error) {
      markdown += `### ${result.url} - ERROR\n\n`;
      markdown += `Error: ${result.error}\n\n`;
      continue;
    }

    if (result.issuesFound === 0) {
      markdown += `### ${result.url} - ✅ No Issues\n\n`;
      continue;
    }

    markdown += `### ${result.url} - ${result.issuesFound} Issues Found\n\n`;
    markdown += `**Page Title:** ${result.pageTitle}\n\n`;

    // Group issues by type
    const lowContrast = result.issues.filter(i => i.issue === 'low-contrast');
    const manualReview = result.issues.filter(i => i.issue === 'manual-review');

    if (lowContrast.length > 0) {
      markdown += `#### Low Contrast Issues (${lowContrast.length})\n\n`;

      for (const issue of lowContrast.slice(0, 20)) { // Limit to first 20 per page
        markdown += `**Element:** \`${issue.selector}\`\n`;
        markdown += `- Text: "${issue.text}"\n`;
        markdown += `- Text Color: ${issue.color} (RGB: ${issue.textColor.r}, ${issue.textColor.g}, ${issue.textColor.b})\n`;
        markdown += `- Background Color: ${issue.backgroundColor} (RGB: ${issue.bgColor.r}, ${issue.bgColor.g}, ${issue.bgColor.b})\n`;
        markdown += `- Contrast Ratio: ${issue.ratio}:1 (Required: ${issue.wcag.aaThreshold}:1 for ${issue.wcag.isLargeText ? 'large' : 'normal'} text)\n`;
        markdown += `- Font Size: ${issue.fontSize}px, Weight: ${issue.fontWeight}\n`;
        markdown += `- WCAG AA: ❌ FAIL\n\n`;
      }

      if (lowContrast.length > 20) {
        markdown += `_...and ${lowContrast.length - 20} more low contrast issues_\n\n`;
      }
    }

    if (manualReview.length > 0) {
      markdown += `#### Manual Review Required (${manualReview.length})\n\n`;
      markdown += `These elements have text over background images or transparent backgrounds and require manual visual inspection:\n\n`;

      for (const issue of manualReview.slice(0, 10)) { // Limit to first 10 per page
        markdown += `**Element:** \`${issue.selector}\`\n`;
        markdown += `- Text: "${issue.text}"\n`;
        markdown += `- Reason: ${issue.reason}\n`;
        markdown += `- Font Size: ${issue.fontSize}px, Weight: ${issue.fontWeight}\n\n`;
      }

      if (manualReview.length > 10) {
        markdown += `_...and ${manualReview.length - 10} more elements requiring manual review_\n\n`;
      }
    }

    markdown += `---\n\n`;
  }

  markdown += `## Recommendations\n\n`;
  markdown += `1. **Low Contrast Issues:** Update text colors or background colors to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)\n`;
  markdown += `2. **Text on Images:** Add text shadows, overlays, or gradient overlays to ensure sufficient contrast\n`;
  markdown += `3. **Manual Review Items:** Visually inspect screenshots in the \`contrast-analysis\` directory\n`;
  markdown += `4. **Testing Tools:** Use browser DevTools accessibility features to verify fixes\n\n`;

  const mdPath = path.join(outputDir, 'CONTRAST_ANALYSIS_REPORT.md');
  fs.writeFileSync(mdPath, markdown);

  console.log(`\n✅ Analysis complete!`);
  console.log(`\nResults saved to:`);
  console.log(`  - JSON: ${reportPath}`);
  console.log(`  - Markdown: ${mdPath}`);
  console.log(`  - Screenshots: ${outputDir}`);
  console.log(`\n📊 Summary:`);
  console.log(`  - Total pages analyzed: ${report.summary.pagesAnalyzed}`);
  console.log(`  - Total issues found: ${report.summary.totalIssues}`);
  console.log(`  - Low contrast issues: ${report.summary.issuesByType.lowContrast}`);
  console.log(`  - Manual review required: ${report.summary.issuesByType.manualReview}`);
}

main().catch(console.error);
