import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * WCAG 2.1 Color Contrast Analyzer
 * Analyzes all pages for text contrast issues
 */

// Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Parse RGB color
function parseRgb(rgbString) {
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  }
  return null;
}

// Get all pages to check
const pages = [
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
  { name: 'Work', url: '/work' },
  { name: 'Solutions', url: '/solutions' },
  { name: 'Contact', url: '/contact' },
  { name: 'AI Automation Solution', url: '/solutions-ai-automation' },
  { name: 'Social Media Solution', url: '/solutions-social-media-marketing' },
  { name: 'SEO & GEO Solution', url: '/solutions-seo-geo' },
  { name: 'Lead Generation Solution', url: '/solutions-lead-generation' },
  { name: 'Paid Advertising Solution', url: '/solutions-paid-advertising' },
  { name: 'CRM Management Solution', url: '/solutions-crm-management' },
  { name: 'Custom Apps Solution', url: '/solutions-custom-apps' },
  { name: 'Fractional CMO Solution', url: '/solutions-fractional-cmo' },
  { name: 'Podcasting Solution', url: '/solutions-podcasting' },
];

async function analyzeContrast() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const results = [];
  const baseUrl = 'http://localhost:5173';

  for (const pageInfo of pages) {
    console.log(`\n🔍 Analyzing: ${pageInfo.name} (${pageInfo.url})`);

    try {
      await page.goto(`${baseUrl}${pageInfo.url}`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000); // Wait for animations

      // Analyze all text elements
      const contrastIssues = await page.evaluate(() => {
        const issues = [];
        const minContrast = 4.5; // WCAG AA for normal text
        const minContrastLarge = 3.0; // WCAG AA for large text (18pt+ or 14pt bold)

        function getLuminance(r, g, b) {
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }

        function getContrastRatio(rgb1, rgb2) {
          const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
          const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          return (lighter + 0.05) / (darker + 0.05);
        }

        function parseRgb(rgbString) {
          const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
          }
          return null;
        }

        function getBackgroundColor(element) {
          let el = element;
          let bgColor = window.getComputedStyle(el).backgroundColor;

          // Walk up the DOM to find first non-transparent background
          while (el && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
            el = el.parentElement;
            if (el) {
              bgColor = window.getComputedStyle(el).backgroundColor;
            }
          }

          return bgColor || 'rgb(255, 255, 255)';
        }

        function isLargeText(element) {
          const styles = window.getComputedStyle(element);
          const fontSize = parseFloat(styles.fontSize);
          const fontWeight = parseInt(styles.fontWeight) || 400;

          // 18pt = 24px, 14pt = 18.67px
          return (fontSize >= 24) || (fontSize >= 18.67 && fontWeight >= 700);
        }

        function getSelector(element) {
          if (element.id) return `#${element.id}`;
          if (element.className && typeof element.className === 'string') {
            const classes = element.className.trim().split(/\s+/).slice(0, 2).join('.');
            return `.${classes}`;
          }
          return element.tagName.toLowerCase();
        }

        // Get all text-containing elements
        const textElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent?.trim();
          const hasOwnText = text && el.children.length === 0;
          return hasOwnText && window.getComputedStyle(el).display !== 'none';
        });

        textElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          const color = styles.color;
          const bgColor = getBackgroundColor(element);

          const colorRgb = parseRgb(color);
          const bgRgb = parseRgb(bgColor);

          if (colorRgb && bgRgb) {
            const ratio = getContrastRatio(colorRgb, bgRgb);
            const isLarge = isLargeText(element);
            const threshold = isLarge ? minContrastLarge : minContrast;

            if (ratio < threshold) {
              const rect = element.getBoundingClientRect();
              issues.push({
                selector: getSelector(element),
                text: element.textContent.trim().substring(0, 50),
                color: color,
                backgroundColor: bgColor,
                contrastRatio: ratio.toFixed(2),
                required: threshold.toFixed(1),
                isLargeText: isLarge,
                position: {
                  top: Math.round(rect.top),
                  left: Math.round(rect.left)
                },
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight
              });
            }
          }
        });

        return issues;
      });

      if (contrastIssues.length > 0) {
        results.push({
          page: pageInfo.name,
          url: pageInfo.url,
          issues: contrastIssues
        });
        console.log(`  ⚠️  Found ${contrastIssues.length} contrast issues`);
      } else {
        console.log(`  ✅ No contrast issues found`);
      }

    } catch (error) {
      console.error(`  ❌ Error analyzing ${pageInfo.name}: ${error.message}`);
    }
  }

  await browser.close();

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: pages.length,
      pagesWithIssues: results.length,
      totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0)
    },
    results: results
  };

  // Save JSON report
  const reportPath = path.join(process.cwd(), 'CONTRAST_ANALYSIS_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate human-readable report
  let markdown = `# Color Contrast Analysis Report\n\n`;
  markdown += `**Generated**: ${new Date().toLocaleString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Pages Analyzed**: ${report.summary.totalPages}\n`;
  markdown += `- **Pages with Issues**: ${report.summary.pagesWithIssues}\n`;
  markdown += `- **Total Contrast Issues**: ${report.summary.totalIssues}\n\n`;

  if (results.length > 0) {
    markdown += `## Issues by Page\n\n`;

    results.forEach(pageResult => {
      markdown += `### ${pageResult.page} (${pageResult.url})\n\n`;
      markdown += `**${pageResult.issues.length} contrast issues found**\n\n`;

      pageResult.issues.forEach((issue, idx) => {
        markdown += `#### Issue ${idx + 1}\n\n`;
        markdown += `- **Element**: \`${issue.selector}\`\n`;
        markdown += `- **Text**: "${issue.text}..."\n`;
        markdown += `- **Text Color**: \`${issue.color}\`\n`;
        markdown += `- **Background**: \`${issue.backgroundColor}\`\n`;
        markdown += `- **Contrast Ratio**: ${issue.contrastRatio}:1 (requires ${issue.required}:1)\n`;
        markdown += `- **Font Size**: ${issue.fontSize} (${issue.fontWeight})\n`;
        markdown += `- **Position**: Top ${issue.position.top}px, Left ${issue.position.left}px\n`;
        markdown += `- **Type**: ${issue.isLargeText ? 'Large text' : 'Normal text'}\n\n`;
      });
    });

    markdown += `## Recommendations\n\n`;
    markdown += `1. **Increase text darkness** on light backgrounds or add text shadows\n`;
    markdown += `2. **Darken/add opacity to overlays** on background images\n`;
    markdown += `3. **Use higher contrast colors** from your palette\n`;
    markdown += `4. **Add text shadows** for text over images: \`text-shadow: 0 2px 4px rgba(0,0,0,0.5)\`\n`;
    markdown += `5. **Consider background overlays**: Semi-transparent dark layers behind text\n\n`;
  } else {
    markdown += `## ✅ All pages pass WCAG AA contrast requirements!\n\n`;
  }

  const mdPath = path.join(process.cwd(), 'CONTRAST_ANALYSIS_REPORT.md');
  fs.writeFileSync(mdPath, markdown);

  console.log(`\n📊 Reports generated:`);
  console.log(`   - ${reportPath}`);
  console.log(`   - ${mdPath}`);
  console.log(`\n📈 Summary: ${report.summary.totalIssues} issues across ${report.summary.pagesWithIssues} pages`);

  return report;
}

// Run analysis
analyzeContrast().catch(console.error);
