import manifest from './manifest.json';
import { inputSchema, outputSchema, configSchema } from './schema.js';
import GrowthAuditUI from './GrowthAuditUI.jsx';
import { validateUrl } from '@/lib/growth-audit/utils';

/**
 * Growth Audit Module
 *
 * AI-powered website growth audit with instant analysis.
 * Returns job_id immediately, actual results are streamed via SSE.
 *
 * Three-Level Access:
 * - Internal: Unlimited audits, all features, no email required
 * - Client: 10 audits/day, full features, email optional
 * - Public: 5 audits/day, email required, upgrade CTA
 *
 * Workflow:
 * 1. Submit URL → Get job_id
 * 2. Poll /.netlify/functions/growth-audit-stream?jobId={jobId}
 * 3. Display real-time results as they arrive
 */

export const moduleConfig = {
  manifest,
  component: GrowthAuditUI,

  /**
   * Execute growth audit
   *
   * NOTE: This is an async module. The execute() function returns a job_id
   * immediately. The UI component handles polling for results.
   *
   * @param {Object} params - Execution parameters
   * @param {Object} params.input - User input (website_url, business_name, industry, email, create_brain)
   * @param {Object} params.user - Current user object
   * @param {Object} params.brain - Business Brain context (optional)
   * @param {string} params.audience - Access level (internal/client/public)
   * @param {Object} params.config - User configuration
   * @returns {Promise<Object>} Job information { job_id, status: 'queued' }
   */
  async execute({ input, user, brain, audience, config }) {
    // Validate URL format
    const validation = validateUrl(input.website_url);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid URL');
    }

    // Merge config defaults
    const mergedConfig = {
      include_brand_detection: config?.include_brand_detection !== false,
      include_pagespeed: config?.include_pagespeed !== false,
      max_opportunities: config?.max_opportunities || 15,
      priority_categories: config?.priority_categories || []
    };

    // Build request payload
    const requestBody = {
      websiteUrl: validation.normalized,
      businessName: input.business_name || null,
      industry: input.industry || null,
      email: input.email || null,
      userId: user?.id || null,
      brainId: brain?.id || null,
      createBrain: input.create_brain && user ? true : false,
      audience: audience,
      config: mergedConfig
    };

    // Call growth-audit-ingest function (wrapper for module execution)
    const response = await fetch('/.netlify/functions/growth-audit-ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Audit failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.jobId) {
      throw new Error('Failed to start audit - no job ID returned');
    }

    // Return job info immediately
    // UI component will handle polling for results
    return {
      job_id: data.jobId,
      status: 'queued',
      progress: 0,
      message: 'Audit started successfully'
    };
  },

  /**
   * Validate input before execution
   *
   * @param {Object} input - Raw input from user
   * @returns {Object} Validated input
   * @throws {Error} If validation fails
   */
  validateInput(input) {
    // Validate with Zod schema
    const validated = inputSchema.parse(input);

    // Additional URL validation
    const urlValidation = validateUrl(validated.website_url);
    if (!urlValidation.valid) {
      throw new Error(urlValidation.error || 'Invalid URL format');
    }

    return validated;
  },

  /**
   * Transform input with Business Brain context
   *
   * @param {Object} input - Validated input
   * @param {Object} brain - Business Brain object
   * @returns {Object} Transformed input with brain context
   */
  transformInput(input, brain) {
    // Pre-fill business name and industry from brain if available
    const transformed = { ...input };

    if (brain) {
      if (!transformed.business_name && brain.business_name) {
        transformed.business_name = brain.business_name;
      }
      if (!transformed.industry && brain.industry) {
        transformed.industry = brain.industry;
      }
    }

    return transformed;
  },

  /**
   * Get audit results by job ID
   *
   * This is a helper method for polling results.
   * The UI component can call this via the module registry.
   *
   * @param {string} jobId - The job ID to check
   * @returns {Promise<Object>} Current job status and results
   */
  async getResults(jobId) {
    const response = await fetch(
      `/.netlify/functions/growth-audit-stream?jobId=${jobId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Audit not found');
      }
      throw new Error('Failed to fetch results');
    }

    return response.json();
  },

  /**
   * Create Business Brain from audit results
   *
   * Helper method to create a brain from completed audit.
   *
   * @param {string} jobId - The completed job ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Created brain object
   */
  async createBrainFromAudit(jobId, user) {
    if (!user) {
      throw new Error('User must be authenticated to create Business Brain');
    }

    // Get audit results
    const auditResults = await this.getResults(jobId);

    if (auditResults.status !== 'completed') {
      throw new Error('Audit must be completed before creating brain');
    }

    const profile = auditResults.result;

    // Extract brain data from audit results
    const brainData = {
      user_id: user.id,
      business_name: profile.brand?.name || profile.site?.primaryDomain || 'Unknown Business',
      primary_website: profile.site?.primaryDomain || '',
      industry: 'Unknown', // Would need to be detected or provided
      business_description: profile.brand?.tagline || '',
      brand_colors: {
        primary: profile.brand?.palette?.primary || null,
        secondary: profile.brand?.palette?.secondary || null,
        neutrals: profile.brand?.palette?.neutrals || []
      },
      logo_urls: profile.brand?.logos?.map(logo => logo.url) || [],
      brain_level: 'starter',
      confidence_score: 0.3,
      auto_initialized: true,
      web_scrape_completed: true
    };

    // Call brain creation API
    const response = await fetch('/.netlify/functions/brain-auto-initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user.id,
        websiteUrl: brainData.primary_website,
        businessName: brainData.business_name,
        auditData: profile
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create Business Brain');
    }

    return response.json();
  }
};

export default moduleConfig;
