/**
 * Entity API Wrappers
 * High-level functions for working with business entities
 */

import { api } from './client'
import { supabase } from './auth'
import { base44 } from './base44Client'

/**
 * Brain Facts API
 */
export const BrainFacts = {
  search: (brainId: string, q: string) =>
    api(`brain_search?brainId=${encodeURIComponent(brainId)}&q=${encodeURIComponent(q)}`),

  add: (payload: { brainId: string; key: string; value: any; source?: string; confidence?: number }) =>
    api('brain_add_fact', { method: 'POST', body: payload }),

  // Direct Supabase access for CRUD
  async list(brainId: string, limit = 100) {
    const { data, error } = await supabase
      .from('brain_facts')
      .select('*')
      .eq('brain_id', brainId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('brain_facts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('brain_facts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

/**
 * Agents API
 */
export const Agents = {
  invoke: (payload: { agentId: string; brainId: string; messages: any[]; options?: any }) =>
    api('ai_invoke', { method: 'POST', body: payload }),

  train: (agentId: string, background = true) =>
    api(background ? 'agent_train-background' : 'agent_train', { method: 'POST', body: { agentId } }),

  runStatus: (runId: string) =>
    api(`agent_run_status?runId=${encodeURIComponent(runId)}`),

  feedback: (payload: { agentId: string; conversationId?: string; messageId: string; rating: number; comment?: string }) =>
    api('feedback_submit', { method: 'POST', body: payload }),

  async list() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(agent: any) {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

/**
 * Ingest API
 */
export const Ingest = {
  dispatch: (payload: { brainId: string; sourceId: string }) =>
    api('ingest_dispatch-background', { method: 'POST', body: payload }),

  status: (jobId: string) =>
    api(`ingest_status?jobId=${encodeURIComponent(jobId)}`),

  async listJobs(brainId: string, limit = 50) {
    const { data, error } = await supabase
      .from('ingest_jobs')
      .select('*')
      .eq('brain_id', brainId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}

/**
 * Knowledge Sources API
 */
export const KnowledgeSources = {
  async list(brainId: string) {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('brain_id', brainId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(source: any) {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert(source)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('knowledge_sources')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

/**
 * Business Brains API
 */
export const BusinessBrains = {
  async list() {
    const { data, error } = await supabase
      .from('business_brains')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('business_brains')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getHealth(brainId: string) {
    const { data, error } = await supabase
      .rpc('get_brain_health', { brain_id: brainId })

    if (error) throw error
    return data
  }
}

/**
 * Conversations API
 */
export const Conversations = {
  async list(agentId?: string, limit = 50) {
    let query = supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }
}

/**
 * Workflows API
 */
export const Workflows = {
  run: (workflowId: string) =>
    api('workflows_run-background', { method: 'POST', body: { workflowId } }),

  status: (runId: string) =>
    api(`workflow_status?runId=${encodeURIComponent(runId)}`),

  async list() {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

/**
 * Brand Rules API
 */
export const BrandRuleAPI = {
  async list() {
    const { data, error } = await supabase
      .from('brand_rules')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      // Handle missing table gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('brand_rules table does not exist, returning empty array')
        return []
      }
      throw error
    }
    return data || []
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('brand_rules')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('brand_rules table does not exist')
        return null
      }
      throw error
    }
    return data
  },

  async create(rule: any) {
    const { data, error } = await supabase
      .from('brand_rules')
      .insert(rule)
      .select()
      .single()

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        throw new Error('brand_rules table does not exist. Please run migrations.')
      }
      throw error
    }
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('brand_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        throw new Error('brand_rules table does not exist. Please run migrations.')
      }
      throw error
    }
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('brand_rules')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        throw new Error('brand_rules table does not exist. Please run migrations.')
      }
      throw error
    }
  }
}

/**
 * Base44 entity wrappers — consolidated from the former src/api/entities.js so this file is
 * the single `@/api/entities` source. Restores the public-site entities (TeamMember, etc.)
 * that the About page and other pages import, alongside the Brain APIs above.
 */
export const Testimonial = base44.entities.Testimonial
export const Service = base44.entities.Service
export const CaseStudy = base44.entities.CaseStudy
export const TeamMember = base44.entities.TeamMember
export const Resource = base44.entities.Resource

// auth sdk
export const User = base44.auth
