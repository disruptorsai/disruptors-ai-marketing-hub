/**
 * Core data types for the Instant Growth Audit integration
 */

/**
 * @typedef {'queued' | 'crawling' | 'enriching' | 'analyzing' | 'ready' | 'error'} JobStatus
 */

/**
 * @typedef {'SEO' | 'Content' | 'Performance' | 'CRO' | 'Local' | 'Social' | 'Paid' | 'EmailCRM' | 'DataTracking' | 'AI'} OpportunityCategory
 */

/**
 * @typedef {'low' | 'med' | 'high'} EffortLevel
 */

/**
 * @typedef {'low' | 'med' | 'high'} ImpactLevel
 */

/**
 * @typedef {'Starter' | 'Core' | 'Scale'} PackageType
 */

/**
 * @typedef {Object} IngestRequest
 * @property {string} websiteUrl
 * @property {string} [userAgentHint]
 * @property {'B2B' | 'B2C'} [businessType]
 * @property {'Leads' | 'Sales' | 'Bookings'} [primaryGoal]
 */

/**
 * @typedef {Object} BrandPalette
 * @property {string} primary
 * @property {string} [secondary]
 * @property {string[]} [neutrals]
 * @property {string[]} [oklch]
 */

/**
 * @typedef {Object} SocialLink
 * @property {'linkedin' | 'x' | 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'other'} platform
 * @property {string} url
 * @property {number} [followers]
 * @property {string} [postingFrequency]
 */

/**
 * @typedef {Object} PageSummary
 * @property {string} url
 * @property {string} [title]
 * @property {string} [h1]
 * @property {Record<string, string>} [og]
 * @property {string[]} [schemaTypes]
 */

/**
 * @typedef {Object} Evidence
 * @property {string} url
 * @property {string} note
 */

/**
 * @typedef {Object} QuickWin
 * @property {string} id
 * @property {OpportunityCategory} category
 * @property {string} title
 * @property {string} whyItMatters
 * @property {{ conservative: number, likely: number, aggressive: number }} impactBand
 * @property {EffortLevel} effort
 * @property {number} confidence
 * @property {string[]} steps
 * @property {Evidence[]} evidence
 * @property {string[]} affectedUrls
 */

/**
 * @typedef {Object} BusinessProfile
 * @property {{ name?: string, tagline?: string, logoUrl?: string, palette?: BrandPalette, fonts?: string[], toneKeywords?: string[] }} brand
 * @property {{ primaryDomain: string, topPages: PageSummary[], sitemapFound: boolean, robots: string | null }} site
 * @property {{ products?: string[], services?: string[], pricingNotes?: string[] }} offerings
 * @property {string[]} icp
 * @property {string[]} [locations]
 * @property {string[]} [partners]
 * @property {{ links: SocialLink[], summaries?: Record<string, string> }} social
 * @property {{ metaGaps: string[], ogPresent: boolean, jsonLdTypes?: string[], pagespeed?: { mobileScore?: number, desktopScore?: number }, webVitals?: { lcp?: number, inp?: number, cls?: number } }} seo
 * @property {{ cms?: string, framework?: string, analytics?: string[], hosting?: string }} tech
 * @property {string[]} [competitors]
 * @property {QuickWin[]} quickWins
 */

/**
 * @typedef {Object} LineItem
 * @property {string} title
 * @property {string[]} opIds
 * @property {string[]} deliverables
 */

/**
 * @typedef {Object} Package
 * @property {PackageType} name
 * @property {[number, number]} monthlyRangeUsd
 * @property {LineItem[]} lineItems
 */

/**
 * @typedef {Object} PlanPhase
 * @property {string} day
 * @property {string[]} milestones
 * @property {string[]} [risks]
 * @property {string[]} requiredInputs
 */

/**
 * @typedef {Object} ServicePlan
 * @property {Package[]} packages
 * @property {PlanPhase[]} plan30_60_90
 * @property {string[]} [notes]
 */

/**
 * @typedef {Object} StreamEvent
 * @property {'tile' | 'progress' | 'complete' | 'error'} type
 * @property {string} tileId
 * @property {'pending' | 'ready' | 'failed'} status
 * @property {any} [payload]
 * @property {number} [confidence]
 * @property {string} [message]
 */

export {};
