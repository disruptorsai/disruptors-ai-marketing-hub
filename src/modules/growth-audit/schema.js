import { z } from 'zod';

/**
 * Opportunity categories enum
 */
export const OpportunityCategory = {
  SEO: 'SEO',
  Content: 'Content',
  Performance: 'Performance',
  CRO: 'CRO',
  Local: 'Local',
  Social: 'Social',
  Paid: 'Paid',
  EmailCRM: 'EmailCRM',
  DataTracking: 'DataTracking',
  AI: 'AI'
};

/**
 * Service package types
 */
export const PackageType = {
  Starter: 'Starter',
  Core: 'Core',
  Scale: 'Scale'
};

/**
 * Job status enum
 */
export const JobStatus = {
  Queued: 'queued',
  Crawling: 'crawling',
  Enriching: 'enriching',
  Analyzing: 'analyzing',
  Ready: 'ready',
  Error: 'error'
};

/**
 * Input validation schema for Growth Audit module
 */
export const inputSchema = z.object({
  website_url: z.string()
    .min(1, 'Website URL is required')
    .max(500, 'URL too long')
    .url('Must be a valid URL'),
  business_name: z.string()
    .max(100, 'Business name too long')
    .optional(),
  industry: z.string()
    .max(100, 'Industry too long')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(200, 'Email too long')
    .optional()
    .or(z.literal('')),
  create_brain: z.boolean().default(false),
  business_type: z.enum(['B2B', 'B2C']).optional(),
  primary_goal: z.enum(['Leads', 'Sales', 'Bookings']).optional()
});

/**
 * Brand palette schema
 */
const brandPaletteSchema = z.object({
  primary: z.string().optional(),
  secondary: z.string().optional(),
  neutrals: z.array(z.string()).optional(),
  oklch: z.array(z.string()).optional()
});

/**
 * Social link schema
 */
const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
  followers: z.number().optional(),
  postingFrequency: z.string().optional()
});

/**
 * Evidence schema
 */
const evidenceSchema = z.object({
  url: z.string().url(),
  note: z.string()
});

/**
 * Opportunity/Quick Win schema
 */
const opportunitySchema = z.object({
  id: z.string(),
  category: z.enum([
    'SEO', 'Content', 'Performance', 'CRO', 'Local',
    'Social', 'Paid', 'EmailCRM', 'DataTracking', 'AI'
  ]),
  title: z.string(),
  whyItMatters: z.string(),
  impactBand: z.object({
    conservative: z.number().min(1).max(10),
    likely: z.number().min(1).max(10),
    aggressive: z.number().min(1).max(10)
  }),
  effort: z.enum(['low', 'med', 'high']),
  confidence: z.number().min(0).max(1),
  steps: z.array(z.string()).min(1).max(6),
  evidence: z.array(evidenceSchema).optional(),
  affectedUrls: z.array(z.string()).optional()
});

/**
 * Business profile schema
 */
const businessProfileSchema = z.object({
  brand: z.object({
    name: z.string().optional(),
    tagline: z.string().optional(),
    logoUrl: z.string().url().optional(),
    palette: brandPaletteSchema.optional(),
    fonts: z.array(z.string()).optional(),
    toneKeywords: z.array(z.string()).optional()
  }).optional(),
  site: z.object({
    primaryDomain: z.string(),
    topPages: z.array(z.object({
      url: z.string(),
      title: z.string().optional(),
      h1: z.string().optional(),
      og: z.record(z.string()).optional(),
      schemaTypes: z.array(z.string()).optional()
    })).optional(),
    sitemapFound: z.boolean().optional(),
    robots: z.string().nullable().optional()
  }).optional(),
  offerings: z.object({
    products: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    pricingNotes: z.array(z.string()).optional()
  }).optional(),
  icp: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  partners: z.array(z.string()).optional(),
  social: z.object({
    links: z.array(socialLinkSchema).optional(),
    summaries: z.record(z.string()).optional()
  }).optional(),
  seo: z.object({
    metaGaps: z.array(z.string()).optional(),
    ogPresent: z.boolean().optional(),
    jsonLdTypes: z.array(z.string()).optional(),
    pagespeed: z.object({
      mobileScore: z.number().optional(),
      desktopScore: z.number().optional()
    }).optional(),
    webVitals: z.object({
      lcp: z.number().optional(),
      inp: z.number().optional(),
      cls: z.number().optional()
    }).optional()
  }).optional(),
  tech: z.object({
    cms: z.string().optional(),
    framework: z.string().optional(),
    analytics: z.array(z.string()).optional(),
    hosting: z.string().optional()
  }).optional(),
  competitors: z.array(z.string()).optional(),
  quickWins: z.array(opportunitySchema).optional()
});

/**
 * Service package line item schema
 */
const lineItemSchema = z.object({
  title: z.string(),
  opIds: z.array(z.string()),
  deliverables: z.array(z.string())
});

/**
 * Service package schema
 */
const packageSchema = z.object({
  name: z.enum(['Starter', 'Core', 'Scale']),
  monthlyRangeUsd: z.tuple([z.number(), z.number()]),
  lineItems: z.array(lineItemSchema)
});

/**
 * Plan phase schema (30/60/90 day)
 */
const planPhaseSchema = z.object({
  day: z.string(),
  milestones: z.array(z.string()),
  risks: z.array(z.string()).optional(),
  requiredInputs: z.array(z.string())
});

/**
 * Service plan schema
 */
const servicePlanSchema = z.object({
  packages: z.array(packageSchema),
  plan30_60_90: z.array(planPhaseSchema),
  notes: z.array(z.string()).optional()
});

/**
 * Sales copy schema
 */
const salesCopySchema = z.object({
  elevatorPitch: z.string(),
  benefitLines: z.array(z.string()),
  emailBody: z.string()
});

/**
 * Output validation schema for Growth Audit module
 */
export const outputSchema = z.object({
  job_id: z.string().uuid(),
  status: z.enum(['queued', 'crawling', 'enriching', 'analyzing', 'ready', 'error']),
  progress: z.number().min(0).max(100).optional(),
  business_profile: businessProfileSchema.optional(),
  opportunities: z.array(opportunitySchema)
    .min(8)
    .max(15)
    .optional(),
  service_packages: servicePlanSchema.optional(),
  execution_time_seconds: z.number().optional(),
  data_sources: z.array(
    z.enum(['firecrawl', 'playwright', 'brandfetch', 'vibrant', 'pagespeed', 'claude'])
  ).optional(),
  readiness_score: z.number().min(0).max(100).optional(),
  sales_copy: salesCopySchema.optional(),
  events: z.array(z.any()).optional(),
  error: z.string().optional()
});

/**
 * Configuration schema for Growth Audit module
 */
export const configSchema = z.object({
  include_pagespeed: z.boolean().default(true),
  include_brandfetch: z.boolean().default(true),
  max_opportunities: z.number().min(8).max(20).default(15),
  package_recommendations: z.boolean().default(true),
  generate_sales_copy: z.boolean().default(true),
  crawl_depth: z.number().min(1).max(10).default(3),
  timeout_seconds: z.number().min(30).max(120).default(60),
  enable_streaming: z.boolean().default(true),
  fallback_to_playwright: z.boolean().default(true),
  send_email_report: z.boolean().default(false)
});

/**
 * Helper function to validate opportunity category
 */
export function isValidCategory(category) {
  return Object.values(OpportunityCategory).includes(category);
}

/**
 * Helper function to validate package type
 */
export function isValidPackageType(packageType) {
  return Object.values(PackageType).includes(packageType);
}

/**
 * Helper function to validate job status
 */
export function isValidJobStatus(status) {
  return Object.values(JobStatus).includes(status);
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category) {
  const displayNames = {
    SEO: 'SEO',
    Content: 'Content',
    Performance: 'Performance',
    CRO: 'Conversion Rate Optimization',
    Local: 'Local SEO',
    Social: 'Social Media',
    Paid: 'Paid Advertising',
    EmailCRM: 'Email & CRM',
    DataTracking: 'Data & Tracking',
    AI: 'AI & Automation'
  };
  return displayNames[category] || category;
}

/**
 * Get category color (for UI badges)
 */
export function getCategoryColor(category) {
  const colors = {
    SEO: '#2C6BAA',           // Lapis Blue
    Content: '#C96F4C',       // Terracotta
    Performance: '#10B981',   // Green
    CRO: '#C9A53B',          // Muted Gold
    Local: '#3C7A6A',        // Verdigris
    Social: '#C96F4C',       // Terracotta
    Paid: '#2C6BAA',         // Lapis Blue
    EmailCRM: '#C9A53B',     // Muted Gold
    DataTracking: '#3C7A6A', // Verdigris
    AI: '#10B981'            // Green
  };
  return colors[category] || '#6B7280';
}

/**
 * Get effort level display
 */
export function getEffortDisplay(effort) {
  const displays = {
    low: { label: 'Low Effort', color: '#10B981' },
    med: { label: 'Medium Effort', color: '#F59E0B' },
    high: { label: 'High Effort', color: '#EF4444' }
  };
  return displays[effort] || { label: effort, color: '#6B7280' };
}

/**
 * Calculate opportunity priority score
 * Used for sorting opportunities by impact/effort ratio
 */
export function calculatePriorityScore(opportunity) {
  const effortWeights = { low: 1, med: 2, high: 3 };
  const effortWeight = effortWeights[opportunity.effort] || 2;
  const avgImpact = (
    opportunity.impactBand.conservative +
    opportunity.impactBand.likely +
    opportunity.impactBand.aggressive
  ) / 3;

  // Priority = (Impact × Confidence) / Effort
  return (avgImpact * opportunity.confidence) / effortWeight;
}

/**
 * Sort opportunities by priority
 */
export function sortOpportunitiesByPriority(opportunities) {
  return [...opportunities].sort((a, b) => {
    return calculatePriorityScore(b) - calculatePriorityScore(a);
  });
}

/**
 * Filter opportunities by category
 */
export function filterByCategory(opportunities, categories) {
  if (!categories || categories.length === 0) return opportunities;
  return opportunities.filter(opp => categories.includes(opp.category));
}

/**
 * Get package recommendation based on opportunities
 */
export function getRecommendedPackage(opportunities, budget = 'medium') {
  const totalOpportunities = opportunities.length;
  const highImpactCount = opportunities.filter(
    opp => opp.impactBand.likely >= 7
  ).length;

  if (budget === 'low' || totalOpportunities <= 5) {
    return PackageType.Starter;
  } else if (budget === 'high' || highImpactCount >= 5) {
    return PackageType.Scale;
  } else {
    return PackageType.Core;
  }
}
