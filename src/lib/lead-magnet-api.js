/**
 * Public API for Lead Magnet Resources
 * Uses standard Supabase client with RLS policies for public access
 */

import { supabase } from '@/lib/supabase-client'

/**
 * Get all active resources (public view)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getActiveResources() {
  try {
    const { data, error } = await supabase
      .from('lead_magnet_resources')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching active resources:', error)
    return { data: null, error }
  }
}

/**
 * Get featured resources for homepage
 * @param {number} limit - Number of resources to return (default 6)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getFeaturedResources(limit = 6) {
  try {
    const { data, error } = await supabase
      .from('featured_resources')
      .select('*')
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching featured resources:', error)
    return { data: null, error }
  }
}

/**
 * Get popular resources
 * @param {number} limit - Number of resources to return (default 10)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getPopularResources(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('popular_resources')
      .select('*')
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching popular resources:', error)
    return { data: null, error }
  }
}

/**
 * Get resource by slug
 * @param {string} slug - Resource slug
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getResourceBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('lead_magnet_resources')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching resource by slug:', error)
    return { data: null, error }
  }
}

/**
 * Search resources by query
 * @param {string} query - Search query
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function searchResources(query) {
  try {
    const { data, error } = await supabase
      .from('lead_magnet_resources')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,description.ilike.%${query}%`)
      .order('download_count', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching resources:', error)
    return { data: null, error }
  }
}

/**
 * Filter resources by category
 * @param {string} category - Category name
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getResourcesByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('lead_magnet_resources')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('download_count', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching resources by category:', error)
    return { data: null, error }
  }
}

/**
 * Filter resources by tags
 * @param {Array<string>} tags - Array of tag names
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getResourcesByTags(tags) {
  try {
    const { data, error } = await supabase
      .from('lead_magnet_resources')
      .select('*')
      .eq('is_active', true)
      .contains('tags', tags)
      .order('download_count', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching resources by tags:', error)
    return { data: null, error }
  }
}

/**
 * Track resource view (anonymous)
 * @param {string} slug - Resource slug
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function trackResourceView(slug) {
  try {
    // Get resource ID
    const { data: resource, error: resourceError } = await supabase
      .from('lead_magnet_resources')
      .select('id, view_count')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (resourceError) throw resourceError

    // Increment view count (this will work with RLS if we have a function)
    // For now, we'll log it as a telemetry event
    await supabase.from('telemetry_events').insert({
      area: 'public',
      name: 'resource_viewed',
      payload: {
        resource_id: resource.id,
        slug: slug,
      }
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Error tracking resource view:', error)
    return { success: false, error }
  }
}

/**
 * Track resource download (after lead capture)
 * @param {string} slug - Resource slug
 * @param {string} leadCaptureId - Lead capture ID (optional)
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function trackResourceDownload(slug, leadCaptureId = null) {
  try {
    // Get resource ID
    const { data: resource, error: resourceError } = await supabase
      .from('lead_magnet_resources')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (resourceError) throw resourceError

    // Log telemetry event
    await supabase.from('telemetry_events').insert({
      area: 'public',
      name: 'resource_downloaded',
      payload: {
        resource_id: resource.id,
        slug: slug,
        lead_capture_id: leadCaptureId,
      }
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Error tracking resource download:', error)
    return { success: false, error }
  }
}

/**
 * Get related resources by ID
 * @param {string} resourceId - Resource UUID
 * @param {number} limit - Number of resources to return (default 3)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getRelatedResources(resourceId, limit = 3) {
  try {
    // Get the resource with related IDs
    const { data: resource, error: resourceError } = await supabase
      .from('lead_magnet_resources')
      .select('related_resources, category, tags')
      .eq('id', resourceId)
      .single()

    if (resourceError) throw resourceError

    let relatedData = []

    // If related_resources is specified, fetch those
    if (resource.related_resources && resource.related_resources.length > 0) {
      const { data, error } = await supabase
        .from('lead_magnet_resources')
        .select('*')
        .eq('is_active', true)
        .in('id', resource.related_resources)
        .limit(limit)

      if (error) throw error
      relatedData = data
    } else {
      // Otherwise, find resources with same category or overlapping tags
      const { data, error } = await supabase
        .from('lead_magnet_resources')
        .select('*')
        .eq('is_active', true)
        .neq('id', resourceId)
        .or(`category.eq.${resource.category},tags.ov.{${resource.tags?.join(',') || ''}}`)
        .limit(limit)

      if (error) throw error
      relatedData = data
    }

    return { data: relatedData, error: null }
  } catch (error) {
    console.error('Error fetching related resources:', error)
    return { data: null, error }
  }
}

/**
 * Get all unique categories (public)
 * @returns {Promise<{data: Array<string>|null, error: Error|null}>}
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('lead_magnet_resources')
      .select('category')
      .eq('is_active', true)

    if (error) throw error

    const uniqueCategories = [...new Set(data.map(r => r.category))].filter(Boolean)
    return { data: uniqueCategories, error: null }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error }
  }
}

/**
 * Get resource statistics (public aggregate view)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getResourceStats() {
  try {
    const { data, error } = await supabase
      .from('resource_stats')
      .select('*')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching resource stats:', error)
    return { data: null, error }
  }
}
