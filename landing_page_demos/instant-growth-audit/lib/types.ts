// Core data types for the Instant Growth Audit app

export type JobStatus = 'queued' | 'crawling' | 'enriching' | 'analyzing' | 'ready' | 'error';

export type OpportunityCategory =
  | 'SEO'
  | 'Content'
  | 'Performance'
  | 'CRO'
  | 'Local'
  | 'Social'
  | 'Paid'
  | 'EmailCRM'
  | 'DataTracking'
  | 'AI';

export type EffortLevel = 'low' | 'med' | 'high';
export type ImpactLevel = 'low' | 'med' | 'high';
export type PackageType = 'Starter' | 'Core' | 'Scale';

export interface IngestRequest {
  websiteUrl: string;
  userAgentHint?: string;
  businessType?: 'B2B' | 'B2C';
  primaryGoal?: 'Leads' | 'Sales' | 'Bookings';
}

export interface BrandPalette {
  primary: string;
  secondary?: string;
  neutrals?: string[];
  oklch?: string[];
}

export interface SocialLink {
  platform: 'linkedin' | 'x' | 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'other';
  url: string;
  followers?: number;
  postingFrequency?: string;
}

export interface PageSummary {
  url: string;
  title?: string;
  h1?: string;
  og?: Record<string, string>;
  schemaTypes?: string[];
}

export interface Evidence {
  url: string;
  note: string;
}

export interface QuickWin {
  id: string;
  category: OpportunityCategory;
  title: string;
  whyItMatters: string;
  impactBand: {
    conservative: number;
    likely: number;
    aggressive: number;
  };
  effort: EffortLevel;
  confidence: number;
  steps: string[];
  evidence: Evidence[];
  affectedUrls: string[];
}

export interface BusinessProfile {
  brand: {
    name?: string;
    tagline?: string;
    logoUrl?: string;
    palette?: BrandPalette;
    fonts?: string[];
    toneKeywords?: string[];
  };
  site: {
    primaryDomain: string;
    topPages: PageSummary[];
    sitemapFound: boolean;
    robots: string | null;
  };
  offerings: {
    products?: string[];
    services?: string[];
    pricingNotes?: string[];
  };
  icp: string[];
  locations?: string[];
  partners?: string[];
  social: {
    links: SocialLink[];
    summaries?: Record<string, string>;
  };
  seo: {
    metaGaps: string[];
    ogPresent: boolean;
    jsonLdTypes?: string[];
    pagespeed?: {
      mobileScore?: number;
      desktopScore?: number;
    };
    webVitals?: {
      lcp?: number;
      inp?: number;
      cls?: number;
    };
  };
  tech: {
    cms?: string;
    framework?: string;
    analytics?: string[];
    hosting?: string;
  };
  competitors?: string[];
  quickWins: QuickWin[];
}

export interface LineItem {
  title: string;
  opIds: string[];
  deliverables: string[];
}

export interface Package {
  name: PackageType;
  monthlyRangeUsd: [number, number];
  lineItems: LineItem[];
}

export interface PlanPhase {
  day: string;
  milestones: string[];
  risks?: string[];
  requiredInputs: string[];
}

export interface ServicePlan {
  packages: Package[];
  plan30_60_90: PlanPhase[];
  notes?: string[];
}

export interface StreamEvent {
  type: 'tile' | 'progress' | 'complete' | 'error';
  tileId: string;
  status: 'pending' | 'ready' | 'failed';
  payload?: any;
  confidence?: number;
  message?: string;
}
