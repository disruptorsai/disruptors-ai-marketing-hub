/**
 * Business Brain API Client
 *
 * Provides a clean interface to interact with Business Brain Netlify functions
 * and Supabase database tables.
 *
 * @module BrainAPI
 */

import { supabase } from './supabase-client.js';

export class BrainAPI {
  /**
   * Initialize a new Business Brain for an organization or user
   *
   * @param {string} userId - User ID or organization ID
   * @param {string} websiteUrl - Website URL to scrape
   * @param {string} businessName - Business name
   * @param {Object} options - Additional options (industry, email, phone)
   * @returns {Promise<Object>} Initialization result with brainId, confidence, etc.
   */
  static async initializeBrain(userId, websiteUrl, businessName, options = {}) {
    try {
      const response = await fetch('/.netlify/functions/brain-auto-initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          websiteUrl,
          businessName,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[BrainAPI] Initialize error:', error);
      throw error;
    }
  }

  /**
   * Get Business Brain by user ID
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Brain data
   */
  static async getBrainByUser(userId) {
    const { data, error } = await supabase
      .from('business_brains')
      .select('*')
      .eq('created_by', userId)
      .single();

    if (error) {
      console.error('[BrainAPI] Get brain error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get Business Brain by ID
   *
   * @param {string} brainId - Brain ID
   * @returns {Promise<Object>} Brain data
   */
  static async getBrainById(brainId) {
    const { data, error } = await supabase
      .from('business_brains')
      .select('*')
      .eq('id', brainId)
      .single();

    if (error) {
      console.error('[BrainAPI] Get brain error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all brains for current user
   *
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of brains
   */
  static async getAllBrains(userId) {
    const { data, error } = await supabase
      .from('business_brains')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[BrainAPI] Get all brains error:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Enhance brain with various methods
   *
   * @param {string} brainId - Brain ID
   * @param {string} enhancementType - Type: 'onboarding', 'file_upload', 'manual_fact', 'integration_sync'
   * @param {Object} payload - Enhancement-specific data
   * @returns {Promise<Object>} Enhancement result
   */
  static async enhanceBrain(brainId, enhancementType, payload) {
    try {
      const response = await fetch('/.netlify/functions/brain-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brainId,
          enhancementType,
          ...payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[BrainAPI] Enhance error:', error);
      throw error;
    }
  }

  /**
   * Generate content using Business Brain
   *
   * @param {string} brainId - Brain ID
   * @param {string} contentType - Type: 'blog_article', 'blog_title', 'social_post', 'custom'
   * @param {Object} options - Content generation options
   * @returns {Promise<Object>} Generated content
   */
  static async generateContent(brainId, contentType, options) {
    try {
      const response = await fetch('/.netlify/functions/brain-content-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brainId,
          contentType,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[BrainAPI] Generate content error:', error);
      throw error;
    }
  }

  /**
   * Search brain facts using full-text search
   *
   * @param {string} brainId - Brain ID
   * @param {string} query - Search query
   * @param {number} limit - Max results (default: 15)
   * @returns {Promise<Array>} Matching facts
   */
  static async searchFacts(brainId, query, limit = 15) {
    const { data, error } = await supabase.rpc('search_brain_facts', {
      brain_id: brainId,
      q: query,
      limit_count: limit,
    });

    if (error) {
      console.error('[BrainAPI] Search facts error:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get all facts for a brain
   *
   * @param {string} brainId - Brain ID
   * @param {Object} filters - Optional filters (category, confidence, etc.)
   * @returns {Promise<Array>} Array of facts
   */
  static async getFacts(brainId, filters = {}) {
    let query = supabase
      .from('brain_facts')
      .select('*')
      .eq('brain_id', brainId)
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.minConfidence) {
      query = query.gte('confidence', filters.minConfidence);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[BrainAPI] Get facts error:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Add a manual fact to brain
   *
   * @param {string} brainId - Brain ID
   * @param {Object} fact - Fact data
   * @returns {Promise<Object>} Created fact
   */
  static async addFact(brainId, fact) {
    const { data, error } = await supabase
      .from('brain_facts')
      .insert({
        brain_id: brainId,
        ...fact,
        extraction_method: fact.extraction_method || 'manual_entry',
        source: fact.source || 'user_input',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[BrainAPI] Add fact error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing fact
   *
   * @param {string} factId - Fact ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} Updated fact
   */
  static async updateFact(factId, updates) {
    const { data, error } = await supabase
      .from('brain_facts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', factId)
      .select()
      .single();

    if (error) {
      console.error('[BrainAPI] Update fact error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a fact
   *
   * @param {string} factId - Fact ID
   * @returns {Promise<void>}
   */
  static async deleteFact(factId) {
    const { error } = await supabase
      .from('brain_facts')
      .delete()
      .eq('id', factId);

    if (error) {
      console.error('[BrainAPI] Delete fact error:', error);
      throw error;
    }
  }

  /**
   * Get brand rules for a brain
   *
   * @param {string} brainId - Brain ID
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} Brand rules
   */
  static async getBrandRules(brainId, category = null) {
    let query = supabase
      .from('brand_rules')
      .select('*')
      .eq('brain_id', brainId)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[BrainAPI] Get brand rules error:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get brand assets for a brain
   *
   * @param {string} brainId - Brain ID
   * @param {string} assetType - Optional type filter
   * @returns {Promise<Array>} Brand assets
   */
  static async getBrandAssets(brainId, assetType = null) {
    let query = supabase
      .from('brand_assets')
      .select('*')
      .eq('brain_id', brainId)
      .order('created_at', { ascending: false });

    if (assetType) {
      query = query.eq('asset_type', assetType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[BrainAPI] Get brand assets error:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get onboarding session for a brain
   *
   * @param {string} brainId - Brain ID
   * @returns {Promise<Object>} Active onboarding session or null
   */
  static async getOnboardingSession(brainId) {
    const { data, error } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('brain_id', brainId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[BrainAPI] Get onboarding session error:', error);
      throw error;
    }

    return data || null;
  }

  /**
   * Get brain health metrics
   *
   * @param {string} brainId - Brain ID
   * @returns {Promise<Object>} Health metrics
   */
  static async getBrainHealth(brainId) {
    const brain = await this.getBrainById(brainId);
    const facts = await this.getFacts(brainId);
    const verifiedFacts = facts.filter(f => (f.confidence || 0) >= 0.8);

    return {
      brainLevel: brain.brain_level || 'starter',
      confidenceScore: brain.confidence_score || 0,
      totalFacts: facts.length,
      verifiedFacts: verifiedFacts.length,
      verificationRate: facts.length > 0 ? verifiedFacts.length / facts.length : 0,
      onboardingCompleted: brain.onboarding_completed || false,
      lastUpdated: brain.updated_at,
      healthScore: this._calculateHealthScore(brain, facts, verifiedFacts),
    };
  }

  /**
   * Calculate health score (0-100)
   * @private
   */
  static _calculateHealthScore(brain, facts, verifiedFacts) {
    const factScore = Math.min(facts.length / 50, 1) * 30; // Max 30 points for 50+ facts
    const confidenceScore = (brain.confidence_score || 0) * 25; // Max 25 points
    const verificationScore = (verifiedFacts.length / Math.max(facts.length, 1)) * 20; // Max 20 points
    const onboardingScore = brain.onboarding_completed ? 15 : 0; // 15 points
    const freshnessScore = this._getFreshnessScore(brain.updated_at) * 10; // Max 10 points

    return Math.round(factScore + confidenceScore + verificationScore + onboardingScore + freshnessScore);
  }

  /**
   * Calculate freshness score based on last update
   * @private
   */
  static _getFreshnessScore(updatedAt) {
    if (!updatedAt) return 0;
    const daysSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) return 1;
    if (daysSinceUpdate < 30) return 0.7;
    if (daysSinceUpdate < 90) return 0.4;
    return 0.1;
  }
}

export default BrainAPI;
