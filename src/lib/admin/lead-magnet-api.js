/**
 * Admin API for Lead Magnet Resources Management
 * Requires admin authentication and uses service role for full access
 */

import { supabaseAdmin } from '@/lib/supabase-client'

/**
 * Get all resources (admin view with all fields including inactive)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getAllResources() {
  try {
    const { data, error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching all resources:', error)
    return { data: null, error }
  }
}

/**
 * Get resource by ID
 * @param {string} id - Resource UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getResourceById(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching resource by ID:', error)
    return { data: null, error }
  }
}

/**
 * Create new resource
 * @param {Object} resourceData - Resource data object
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createResource(resourceData) {
  try {
    // Get current user ID
    const { data: { user } } = await supabaseAdmin.auth.getUser()

    const { data, error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .insert({
        ...resourceData,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Log telemetry event
    await supabaseAdmin.from('telemetry_events').insert({
      area: 'admin',
      name: 'lead_magnet_created',
      payload: {
        resource_id: data.id,
        slug: data.slug,
        category: data.category,
      }
    })

    return { data, error: null }
  } catch (error) {
    console.error('Error creating resource:', error)
    return { data: null, error }
  }
}

/**
 * Update existing resource
 * @param {string} id - Resource UUID
 * @param {Object} updates - Partial resource data to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateResource(id, updates) {
  try {
    const { data, error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log telemetry event
    await supabaseAdmin.from('telemetry_events').insert({
      area: 'admin',
      name: 'lead_magnet_updated',
      payload: {
        resource_id: data.id,
        slug: data.slug,
        updated_fields: Object.keys(updates),
      }
    })

    return { data, error: null }
  } catch (error) {
    console.error('Error updating resource:', error)
    return { data: null, error }
  }
}

/**
 * Delete resource (soft delete by setting is_active to false)
 * @param {string} id - Resource UUID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteResource(id) {
  try {
    const { error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    // Log telemetry event
    await supabaseAdmin.from('telemetry_events').insert({
      area: 'admin',
      name: 'lead_magnet_deleted',
      payload: { resource_id: id }
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting resource:', error)
    return { success: false, error }
  }
}

/**
 * Hard delete resource (permanent removal)
 * @param {string} id - Resource UUID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function hardDeleteResource(id) {
  try {
    const { error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Log telemetry event
    await supabaseAdmin.from('telemetry_events').insert({
      area: 'admin',
      name: 'lead_magnet_hard_deleted',
      payload: { resource_id: id }
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Error hard deleting resource:', error)
    return { success: false, error }
  }
}

/**
 * Get analytics for a specific resource
 * @param {string} id - Resource UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getResourceAnalytics(id) {
  try {
    // Get resource data
    const { data: resource, error: resourceError } = await supabaseAdmin
      .from('lead_magnet_resources')
      .select('*')
      .eq('id', id)
      .single()

    if (resourceError) throw resourceError

    // Get lead captures for this resource
    const { data: captures, error: capturesError } = await supabaseAdmin
      .from('lead_captures')
      .select('*')
      .eq('magnet_slug', resource.slug)
      .order('created_at', { ascending: false })

    if (capturesError) throw capturesError

    // Get lead accesses for this resource
    const { data: accesses, error: accessesError } = await supabaseAdmin
      .from('lead_accesses')
      .select('*')
      .eq('magnet_slug', resource.slug)
      .order('accessed_at', { ascending: false })

    if (accessesError) throw accessesError

    // Calculate analytics
    const analytics = {
      resource,
      total_captures: captures.length,
      total_accesses: accesses.length,
      conversion_rate: captures.length > 0 ? (accesses.length / captures.length * 100).toFixed(2) : 0,
      recent_captures: captures.slice(0, 10),
      recent_accesses: accesses.slice(0, 10),
      views: resource.view_count || 0,
      downloads: resource.download_count || 0,
    }

    return { data: analytics, error: null }
  } catch (error) {
    console.error('Error fetching resource analytics:', error)
    return { data: null, error }
  }
}

/**
 * Get dashboard overview statistics
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getDashboardStats() {
  try {
    // Get total resources
    const { data: resources, error: resourcesError } = await supabaseAdmin
      .from('lead_magnet_resources')
      .select('*')

    if (resourcesError) throw resourcesError

    // Get resource stats view
    const { data: categoryStats, error: statsError } = await supabaseAdmin
      .from('resource_stats')
      .select('*')

    if (statsError) throw statsError

    // Calculate totals
    const totalResources = resources.length
    const activeResources = resources.filter(r => r.is_active).length
    const featuredResources = resources.filter(r => r.is_featured).length
    const totalDownloads = resources.reduce((sum, r) => sum + (r.download_count || 0), 0)
    const totalViews = resources.reduce((sum, r) => sum + (r.view_count || 0), 0)

    // Get top performers
    const topDownloads = [...resources]
      .filter(r => r.is_active)
      .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
      .slice(0, 5)

    const stats = {
      overview: {
        total: totalResources,
        active: activeResources,
        featured: featuredResources,
        inactive: totalResources - activeResources,
        totalDownloads,
        totalViews,
        avgDownloadsPerResource: totalResources > 0 ? (totalDownloads / totalResources).toFixed(1) : 0,
      },
      byCategory: categoryStats,
      topPerformers: topDownloads,
      recentResources: resources
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5),
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { data: null, error }
  }
}

/**
 * Increment download count for a resource
 * @param {string} id - Resource UUID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function incrementDownloadCount(id) {
  try {
    const { error } = await supabaseAdmin
      .rpc('increment_resource_downloads', { resource_id: id })

    // If RPC doesn't exist, fallback to manual increment
    if (error && error.message.includes('function')) {
      const { data: resource } = await supabaseAdmin
        .from('lead_magnet_resources')
        .select('download_count')
        .eq('id', id)
        .single()

      const { error: updateError } = await supabaseAdmin
        .from('lead_magnet_resources')
        .update({
          download_count: (resource?.download_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError
    } else if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error incrementing download count:', error)
    return { success: false, error }
  }
}

/**
 * Increment view count for a resource
 * @param {string} id - Resource UUID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function incrementViewCount(id) {
  try {
    const { error } = await supabaseAdmin
      .rpc('increment_resource_views', { resource_id: id })

    // If RPC doesn't exist, fallback to manual increment
    if (error && error.message.includes('function')) {
      const { data: resource } = await supabaseAdmin
        .from('lead_magnet_resources')
        .select('view_count')
        .eq('id', id)
        .single()

      const { error: updateError } = await supabaseAdmin
        .from('lead_magnet_resources')
        .update({
          view_count: (resource?.view_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError
    } else if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return { success: false, error }
  }
}

/**
 * Bulk update resources (feature/unfeature, activate/deactivate)
 * @param {Array<string>} ids - Array of resource UUIDs
 * @param {Object} updates - Updates to apply to all resources
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function bulkUpdateResources(ids, updates) {
  try {
    const { error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)

    if (error) throw error

    // Log telemetry event
    await supabaseAdmin.from('telemetry_events').insert({
      area: 'admin',
      name: 'lead_magnet_bulk_update',
      payload: {
        count: ids.length,
        updates: Object.keys(updates),
      }
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Error bulk updating resources:', error)
    return { success: false, error }
  }
}

/**
 * Get all unique categories
 * @returns {Promise<{data: Array<string>|null, error: Error|null}>}
 */
export async function getCategories() {
  try {
    const { data, error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .select('category')

    if (error) throw error

    const uniqueCategories = [...new Set(data.map(r => r.category))].filter(Boolean)
    return { data: uniqueCategories, error: null }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error }
  }
}

/**
 * Get all unique tags
 * @returns {Promise<{data: Array<string>|null, error: Error|null}>}
 */
export async function getTags() {
  try {
    const { data, error } = await supabaseAdmin
      .from('lead_magnet_resources')
      .select('tags')

    if (error) throw error

    const allTags = data.flatMap(r => r.tags || [])
    const uniqueTags = [...new Set(allTags)].filter(Boolean)
    return { data: uniqueTags, error: null }
  } catch (error) {
    console.error('Error fetching tags:', error)
    return { data: null, error }
  }
}
