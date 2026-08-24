/**
 * Supabase Media Storage Integration
 * Handles storing and retrieving AI-generated media with full metadata
 * Client-side version using browser-compatible Cloudinary client
 */

import { supabase } from './supabase-client.js';
import { cloudinaryClient } from './cloudinary-client.js';

class SupabaseMediaStorage {
  constructor() {
    this.currentUser = null;
    this.sessionId = null;
  }

  /**
   * Set current admin user and session
   */
  setAdminContext(username, sessionId) {
    this.currentUser = username;
    this.sessionId = sessionId;
  }

  /**
   * Store generated media with full metadata tracking
   */
  async storeGeneratedMedia(mediaData, generationResult) {
    try {
      console.log('Storing generated media:', { mediaData, generationResult });

      // Upload to Cloudinary first
      const cloudinaryResult = await this.uploadToCloudinary(
        generationResult.url,
        mediaData.type,
        mediaData.prompt
      );

      // Prepare metadata for Supabase
      const mediaRecord = {
        type: mediaData.type,
        prompt: mediaData.prompt,
        url: cloudinaryResult.secure_url,
        cloudinary_public_id: cloudinaryResult.public_id,
        filename: this.generateFilename(mediaData.type, mediaData.prompt),
        file_size: cloudinaryResult.bytes || null,

        // Dimensions for images/videos
        dimensions: this.extractDimensions(cloudinaryResult),
        duration: cloudinaryResult.duration || null,

        // Generation details
        provider: generationResult.provider,
        model: generationResult.model,
        generation_params: mediaData.options || {},
        cost: generationResult.cost || 0,

        // Admin context
        admin_user: this.currentUser,
        session_id: this.sessionId,
        project_context: mediaData.context || 'manual_generation',
        tags: this.generateTags(mediaData.prompt, mediaData.type),

        // Quality metrics (initial estimates)
        quality_score: this.estimateQuality(generationResult),
        brand_consistency_score: this.estimateBrandConsistency(mediaData.prompt),
        performance_score: this.estimatePerformance(cloudinaryResult)
      };

      // Store in Supabase
      const { data, error } = await supabase
        .from('generated_media')
        .insert(mediaRecord)
        .select()
        .single();

      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }

      console.log('Media stored successfully:', data);

      // Update analytics
      await this.updateAnalytics(mediaData.type, generationResult.cost);

      return {
        ...data,
        cloudinary_url: cloudinaryResult.secure_url,
        cloudinary_public_id: cloudinaryResult.public_id
      };

    } catch (error) {
      console.error('Failed to store generated media:', error);
      throw new Error(`Media storage failed: ${error.message}`);
    }
  }

  /**
   * Upload media to Cloudinary via backend API
   */
  async uploadToCloudinary(sourceUrl, type, prompt) {
    try {
      const uploadOptions = {
        folder: 'disruptors-ai/generated',
        publicId: this.generatePublicId(type, prompt),
        type: type
      };

      console.log('Uploading to Cloudinary via API:', { sourceUrl, uploadOptions });

      // Upload through backend API to avoid exposing secrets
      const result = await cloudinaryClient.uploadFromUrl(sourceUrl, uploadOptions);

      console.log('Cloudinary upload successful:', result);
      return result;

    } catch (error) {
      console.error('Cloudinary upload failed:', error);

      // Fallback: store the original URL without Cloudinary
      return {
        secure_url: sourceUrl,
        public_id: this.generatePublicId(type, prompt),
        bytes: null,
        width: null,
        height: null,
        format: 'unknown'
      };
    }
  }

  /**
   * Retrieve media by various criteria
   */
  async getGeneratedMedia(filters = {}) {
    try {
      let query = supabase
        .from('generated_media')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.provider) {
        query = query.eq('provider', filters.provider);
      }
      if (filters.admin_user) {
        query = query.eq('admin_user', filters.admin_user);
      }
      if (filters.project_context) {
        query = query.eq('project_context', filters.project_context);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Failed to retrieve media:', error);
      throw error;
    }
  }

  /**
   * Create admin session in Supabase
   */
  async createAdminSession(username, ipAddress, userAgent) {
    try {
      const { data, error } = await supabase.rpc('create_admin_session', {
        p_username: username,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });

      if (error) throw error;

      // Set current context
      this.setAdminContext(username, data[0].session_id);

      return data[0];

    } catch (error) {
      console.error('Failed to create admin session:', error);
      throw error;
    }
  }

  /**
   * Validate admin session
   */
  async validateAdminSession(sessionToken) {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      // Update last activity
      await supabase
        .from('admin_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', data.id);

      // Set current context
      this.setAdminContext(data.username, data.id);

      return data;

    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(period = '7d') {
    try {
      let dateFilter;
      switch (period) {
        case '24h':
          dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case '7d':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const [mediaStats, analytics] = await Promise.all([
        // Media statistics
        supabase
          .from('generated_media')
          .select('type, provider, cost, quality_score, created_at')
          .gte('created_at', dateFilter)
          .eq('status', 'active'),

        // Analytics data
        supabase
          .from('generation_analytics')
          .select('*')
          .gte('date', dateFilter.split('T')[0])
          .order('date', { ascending: false })
      ]);

      return {
        media: mediaStats.data || [],
        analytics: analytics.data || [],
        summary: this.calculateAnalyticsSummary(mediaStats.data || [])
      };

    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */

  generateFilename(type, prompt) {
    const sanitized = prompt.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    return `${type}_${sanitized}_${timestamp}`;
  }

  generatePublicId(type, prompt) {
    const sanitized = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    return `${type}_${sanitized}_${timestamp}`;
  }

  extractDimensions(cloudinaryResult) {
    if (cloudinaryResult.width && cloudinaryResult.height) {
      return {
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      };
    }
    return null;
  }

  generateTags(prompt, type) {
    const words = prompt.toLowerCase().split(' ');
    const relevantWords = words.filter(word =>
      word.length > 3 &&
      !['the', 'and', 'with', 'for', 'this', 'that'].includes(word)
    );
    return [type, ...relevantWords.slice(0, 5)];
  }

  estimateQuality(generationResult) {
    // Basic quality estimation based on provider and cost
    let score = 0.7; // Default

    if (generationResult.provider === 'openai' && generationResult.model === 'gpt-image-1') {
      score = 0.95;
    } else if (generationResult.provider === 'google') {
      score = 0.9;
    } else if (generationResult.provider === 'replicate') {
      score = 0.85;
    }

    // Adjust based on cost (higher cost usually means better quality)
    if (generationResult.cost > 0.1) score = Math.min(0.98, score + 0.1);

    return score;
  }

  estimateBrandConsistency(prompt) {
    // Check for brand-related keywords
    const brandKeywords = [
      'professional', 'corporate', 'business', 'modern', 'tech', 'ai',
      'disruptors', 'blue', 'purple', 'gradient', 'clean', 'minimal'
    ];

    const promptLower = prompt.toLowerCase();
    const matches = brandKeywords.filter(keyword => promptLower.includes(keyword));

    return Math.min(0.98, 0.5 + (matches.length * 0.1));
  }

  estimatePerformance(cloudinaryResult) {
    // Estimate based on file size and format
    let score = 0.8; // Default

    if (cloudinaryResult.bytes) {
      // Smaller files generally perform better
      if (cloudinaryResult.bytes < 100000) score = 0.95; // < 100KB
      else if (cloudinaryResult.bytes < 500000) score = 0.85; // < 500KB
      else if (cloudinaryResult.bytes < 1000000) score = 0.75; // < 1MB
      else score = 0.6; // > 1MB
    }

    // Bonus for modern formats
    if (cloudinaryResult.format === 'webp' || cloudinaryResult.format === 'avif') {
      score = Math.min(0.98, score + 0.1);
    }

    return score;
  }

  async updateAnalytics(type, cost) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const hour = new Date().getHours();

      await supabase.rpc('update_generation_analytics', {
        p_date: today,
        p_hour: hour,
        p_type: type,
        p_cost: cost
      });

    } catch (error) {
      console.error('Failed to update analytics:', error);
      // Don't throw - analytics failure shouldn't break media storage
    }
  }

  calculateAnalyticsSummary(mediaData) {
    if (!mediaData.length) {
      return {
        total_generations: 0,
        total_cost: 0,
        avg_quality: 0,
        by_type: {},
        by_provider: {}
      };
    }

    const summary = {
      total_generations: mediaData.length,
      total_cost: mediaData.reduce((sum, item) => sum + (item.cost || 0), 0),
      avg_quality: mediaData.reduce((sum, item) => sum + (item.quality_score || 0), 0) / mediaData.length,
      by_type: {},
      by_provider: {}
    };

    // Group by type and provider
    mediaData.forEach(item => {
      // By type
      summary.by_type[item.type] = (summary.by_type[item.type] || 0) + 1;

      // By provider
      summary.by_provider[item.provider] = (summary.by_provider[item.provider] || 0) + 1;
    });

    return summary;
  }

  /**
   * Cleanup old sessions and expired data
   */
  async cleanup() {
    try {
      // Remove expired sessions
      await supabase
        .from('admin_sessions')
        .update({ status: 'expired' })
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'active');

      console.log('Cleanup completed successfully');

    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const supabaseMediaStorage = new SupabaseMediaStorage();
export default SupabaseMediaStorage;