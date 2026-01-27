const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'contrast-analysis', 'contrast-analysis-report.json');
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Get all low contrast issues and sort by ratio
const allIssues = [];
data.results.forEach(result => {
  if (result.issues) {
    result.issues.forEach(issue => {
      if (issue.issue === 'low-contrast') {
        allIssues.push({
          ...issue,
          pageUrl: result.url,
          pageTitle: result.pageTitle
        });
      }
    });
  }
});

allIssues.sort((a, b) => parseFloat(a.ratio) - parseFloat(b.ratio));

console.log('========================================');
console.log('TOP 30 WORST CONTRAST ISSUES');
console.log('========================================\n');

allIssues.slice(0, 30).forEach((issue, i) => {
  console.log(`${i + 1}. Contrast Ratio: ${issue.ratio}:1 (Required: ${issue.wcag.aaThreshold}:1)`);
  console.log(`   Page: ${issue.pageUrl}`);
  console.log(`   Element: ${issue.selector.substring(0, 100)}`);
  console.log(`   Text: "${issue.text.substring(0, 80)}..."`);
  console.log(`   Text Color: ${issue.color}`);
  console.log(`   Background: ${issue.backgroundColor}`);
  console.log(`   Font: ${issue.fontSize}px, Weight: ${issue.fontWeight}`);
  console.log('');
});

console.log('========================================');
console.log('SUMMARY BY COMMON PATTERNS');
console.log('========================================\n');

// Group by color combinations
const colorCombos = {};
allIssues.forEach(issue => {
  const key = `${issue.color} on ${issue.backgroundColor}`;
  if (!colorCombos[key]) {
    colorCombos[key] = {
      count: 0,
      minRatio: parseFloat(issue.ratio),
      examples: []
    };
  }
  colorCombos[key].count++;
  colorCombos[key].minRatio = Math.min(colorCombos[key].minRatio, parseFloat(issue.ratio));
  if (colorCombos[key].examples.length < 3) {
    colorCombos[key].examples.push({
      page: issue.pageUrl,
      selector: issue.selector.substring(0, 60)
    });
  }
});

const sortedCombos = Object.entries(colorCombos).sort((a, b) => b[1].count - a[1].count);

console.log('Most Common Problematic Color Combinations:\n');
sortedCombos.slice(0, 10).forEach(([combo, data], i) => {
  console.log(`${i + 1}. ${combo}`);
  console.log(`   Occurrences: ${data.count}`);
  console.log(`   Worst Ratio: ${data.minRatio.toFixed(2)}:1`);
  console.log(`   Example pages: ${[...new Set(data.examples.map(e => e.page))].join(', ')}`);
  console.log('');
});

console.log('========================================');
console.log('PAGES WITH MOST ISSUES');
console.log('========================================\n');

const pageIssues = data.results
  .map(r => ({
    url: r.url,
    title: r.pageTitle,
    issuesCount: r.issuesFound || 0
  }))
  .sort((a, b) => b.issuesCount - a.issuesCount);

pageIssues.slice(0, 10).forEach((page, i) => {
  console.log(`${i + 1}. ${page.url}`);
  console.log(`   Issues: ${page.issuesCount}`);
  console.log('');
});
