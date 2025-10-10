/**
 * Module Registry
 *
 * Central registry for loading and managing modules.
 * Provides utilities to:
 * - Load module manifests from files or Supabase
 * - Dynamically import module components
 * - Check module access and quotas
 * - Track module telemetry
 *
 * @module ModuleRegistry
 */

import { supabase, supabaseAdmin } from '@/lib/supabase-client';
import type {
  Module,
  ModuleManifest,
  ModuleAccess,
  ModuleAccessCheckResult,
  ModuleAudience,
  ModuleConfigInterface
} from './types';

/**
 * Module Registry Cache
 * Stores loaded modules in memory for performance
 */
class ModuleRegistryCache {
  private modules: Map<string, Module> = new Map();
  private manifests: Map<string, ModuleManifest> = new Map();
  private configs: Map<string, ModuleConfigInterface> = new Map();
  private lastFetch: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  clear() {
    this.modules.clear();
    this.manifests.clear();
    this.configs.clear();
    this.lastFetch = 0;
  }

  isStale(): boolean {
    return Date.now() - this.lastFetch > this.cacheDuration;
  }

  setModules(modules: Module[]) {
    this.modules.clear();
    modules.forEach(module => {
      this.modules.set(module.slug, module);
      this.manifests.set(module.slug, module as ModuleManifest);
    });
    this.lastFetch = Date.now();
  }

  getModule(slug: string): Module | undefined {
    return this.modules.get(slug);
  }

  getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  setConfig(slug: string, config: ModuleConfigInterface) {
    this.configs.set(slug, config);
  }

  getConfig(slug: string): ModuleConfigInterface | undefined {
    return this.configs.get(slug);
  }
}

const cache = new ModuleRegistryCache();

/**
 * Module Registry Class
 */
export class ModuleRegistry {
  /**
   * Load all modules from Supabase
   *
   * @param {Object} options
   * @param {boolean} options.forceRefresh - Force cache refresh
   * @param {ModuleAudience} options.audience - Filter by audience
   * @param {string} options.status - Filter by status
   * @returns {Promise<Module[]>}
   */
  static async loadModules({
    forceRefresh = false,
    audience,
    status = 'approved'
  }: {
    forceRefresh?: boolean;
    audience?: ModuleAudience;
    status?: string;
  } = {}): Promise<Module[]> {
    // Return cached modules if not stale and not forcing refresh
    if (!forceRefresh && !cache.isStale()) {
      let modules = cache.getAllModules();

      // Apply filters
      if (audience) {
        modules = modules.filter(m =>
          (m.audience as ModuleAudience[]).includes(audience)
        );
      }
      if (status) {
        modules = modules.filter(m => m.status === status);
      }

      return modules;
    }

    // Fetch from Supabase
    let query = supabase
      .from('modules')
      .select('*')
      .order('name', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ModuleRegistry] Error loading modules:', error);
      throw error;
    }

    const modules = (data || []) as Module[];

    // Update cache
    cache.setModules(modules);

    // Apply audience filter
    if (audience) {
      return modules.filter(m =>
        (m.audience as ModuleAudience[]).includes(audience)
      );
    }

    return modules;
  }

  /**
   * Load a single module by slug
   *
   * @param {string} slug - Module slug
   * @param {Object} options
   * @param {boolean} options.forceRefresh - Force cache refresh
   * @returns {Promise<Module | null>}
   */
  static async loadModule(
    slug: string,
    { forceRefresh = false }: { forceRefresh?: boolean } = {}
  ): Promise<Module | null> {
    // Check cache first
    if (!forceRefresh) {
      const cached = cache.getModule(slug);
      if (cached) return cached;
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`[ModuleRegistry] Error loading module ${slug}:`, error);
      return null;
    }

    if (!data) return null;

    const module = data as Module;

    // Update cache
    cache.setModules([module]);

    return module;
  }

  /**
   * Dynamically import a module's configuration
   *
   * @param {string} slug - Module slug
   * @returns {Promise<ModuleConfigInterface>}
   */
  static async importModuleConfig(slug: string): Promise<ModuleConfigInterface> {
    // Check cache
    const cached = cache.getConfig(slug);
    if (cached) return cached;

    // Get module metadata
    const module = await this.loadModule(slug);
    if (!module) {
      throw new Error(`Module not found: ${slug}`);
    }

    // Dynamic import based on entry_point
    // Convert path to relative module path
    const modulePath = module.entry_point.replace('src/', '@/');

    try {
      const moduleExport = await import(/* @vite-ignore */ modulePath);
      const config = moduleExport.default || moduleExport.moduleConfig;

      if (!config) {
        throw new Error(`Module ${slug} does not export a valid config`);
      }

      // Cache the config
      cache.setConfig(slug, config);

      return config;
    } catch (error) {
      console.error(`[ModuleRegistry] Error importing module ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Check if a user has access to a module
   *
   * @param {string} slug - Module slug
   * @param {string | null} userId - User ID (null for anonymous/public)
   * @param {ModuleAudience} audience - Requested audience level
   * @returns {Promise<ModuleAccessCheckResult>}
   */
  static async checkModuleAccess(
    slug: string,
    userId: string | null,
    audience: ModuleAudience
  ): Promise<ModuleAccessCheckResult> {
    // Call Supabase function (defined in migration)
    const { data, error } = await supabaseAdmin.rpc('check_module_access', {
      p_module_slug: slug,
      p_user_id: userId,
      p_audience: audience
    });

    if (error) {
      console.error('[ModuleRegistry] Error checking access:', error);
      return {
        allowed: false,
        reason: 'Error checking access: ' + error.message
      };
    }

    return data as ModuleAccessCheckResult;
  }

  /**
   * Get user's module access record
   *
   * @param {string} moduleId - Module ID
   * @param {string} userId - User ID
   * @returns {Promise<ModuleAccess | null>}
   */
  static async getModuleAccess(
    moduleId: string,
    userId: string
  ): Promise<ModuleAccess | null> {
    const { data, error } = await supabase
      .from('module_access')
      .select('*')
      .eq('module_id', moduleId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, access doesn't exist yet
        return null;
      }
      console.error('[ModuleRegistry] Error getting module access:', error);
      throw error;
    }

    return data as ModuleAccess;
  }

  /**
   * Create or update module access for a user
   *
   * @param {string} moduleId - Module ID
   * @param {string} userId - User ID
   * @param {Partial<ModuleAccess>} accessData - Access data to set
   * @returns {Promise<ModuleAccess>}
   */
  static async setModuleAccess(
    moduleId: string,
    userId: string,
    accessData: Partial<ModuleAccess>
  ): Promise<ModuleAccess> {
    // Use upsert
    const { data, error } = await supabaseAdmin
      .from('module_access')
      .upsert({
        module_id: moduleId,
        user_id: userId,
        ...accessData
      }, {
        onConflict: 'module_id,user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('[ModuleRegistry] Error setting module access:', error);
      throw error;
    }

    return data as ModuleAccess;
  }

  /**
   * Increment module usage counters
   *
   * @param {string} moduleId - Module ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async incrementModuleUsage(
    moduleId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabaseAdmin.rpc('increment_module_usage', {
      p_module_id: moduleId,
      p_user_id: userId
    });

    if (error) {
      console.error('[ModuleRegistry] Error incrementing usage:', error);
      throw error;
    }
  }

  /**
   * Search modules by text query
   *
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Module[]>}
   */
  static async searchModules(
    query: string,
    {
      audience,
      category,
      limit = 20
    }: {
      audience?: ModuleAudience;
      category?: string;
      limit?: number;
    } = {}
  ): Promise<Module[]> {
    let dbQuery = supabase
      .from('modules')
      .select('*')
      .textSearch('search_vector', query)
      .eq('status', 'approved')
      .limit(limit);

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('[ModuleRegistry] Error searching modules:', error);
      throw error;
    }

    let modules = (data || []) as Module[];

    // Filter by audience if specified
    if (audience) {
      modules = modules.filter(m =>
        (m.audience as ModuleAudience[]).includes(audience)
      );
    }

    return modules;
  }

  /**
   * Get modules by category
   *
   * @param {string} category - Module category
   * @param {ModuleAudience} audience - Filter by audience
   * @returns {Promise<Module[]>}
   */
  static async getModulesByCategory(
    category: string,
    audience?: ModuleAudience
  ): Promise<Module[]> {
    const modules = await this.loadModules({ audience });
    return modules.filter(m => m.category === category);
  }

  /**
   * Clear module cache
   */
  static clearCache(): void {
    cache.clear();
  }
}

// Export default instance
export default ModuleRegistry;
