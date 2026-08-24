/**
 * Agent Builder Module
 * Create and manage AI agents with custom prompts
 */

import React, { useState, useEffect } from 'react'
import { Agents } from '@/api/entities.ts'
import { Loader2, Plus, Edit, Trash2, MessageSquare, Save, X } from 'lucide-react'

export default function AgentBuilder() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    try {
      setLoading(true)
      const data = await Agents.list()
      setAgents(data || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load agents:', err)
      setError('Failed to load agents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(formData) {
    try {
      await Agents.create(formData)
      await loadAgents()
      setIsCreating(false)
      setSelectedAgent(null)
    } catch (err) {
      console.error('Failed to create agent:', err)
      alert('Failed to create agent. Please try again.')
    }
  }

  async function handleUpdate(id, formData) {
    try {
      await Agents.update(id, formData)
      await loadAgents()
      setSelectedAgent(null)
    } catch (err) {
      console.error('Failed to update agent:', err)
      alert('Failed to update agent. Please try again.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this agent?')) return

    try {
      await Agents.delete(id)
      await loadAgents()
    } catch (err) {
      console.error('Failed to delete agent:', err)
      alert('Failed to delete agent. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Agent Builder</h1>
          <p className="text-gray-400">
            Create and manage AI agents with custom prompts and configurations
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onEdit={() => setSelectedAgent(agent)}
            onDelete={() => handleDelete(agent.id)}
          />
        ))}

        {agents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Agents Yet</h3>
            <p className="text-gray-400 mb-4">
              Create your first AI agent to get started
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
            >
              Create Agent
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || selectedAgent) && (
        <AgentForm
          agent={selectedAgent}
          onSave={selectedAgent ? handleUpdate : handleCreate}
          onClose={() => {
            setIsCreating(false)
            setSelectedAgent(null)
          }}
        />
      )}
    </div>
  )
}

function AgentCard({ agent, onEdit, onDelete }) {
  const model = agent.flags?.model || 'claude-sonnet-4.5'
  const temperature = agent.flags?.temperature || 0.7

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Edit agent"
          >
            <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Delete agent"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
        {agent.system_prompt || 'No system prompt configured'}
      </p>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Model:</span>
          <span className="text-gray-300">{model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Temperature:</span>
          <span className="text-gray-300">{temperature}</span>
        </div>
        {agent.flags?.max_tokens && (
          <div className="flex justify-between">
            <span className="text-gray-500">Max Tokens:</span>
            <span className="text-gray-300">{agent.flags.max_tokens}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function AgentForm({ agent, onSave, onClose }) {
  const [formData, setFormData] = useState(agent || {
    name: '',
    system_prompt: '',
    flags: {
      model: 'claude-sonnet-4.5',
      temperature: 0.7,
      max_tokens: 4000
    }
  })

  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (agent?.id) {
        await onSave(agent.id, formData)
      } else {
        await onSave(formData)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {agent ? 'Edit Agent' : 'Create New Agent'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Name */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
              placeholder="e.g., Content Writer, SEO Expert, Social Media Manager"
              required
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              System Prompt *
            </label>
            <textarea
              value={formData.system_prompt}
              onChange={e => setFormData({...formData, system_prompt: e.target.value})}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 h-40"
              placeholder="You are a professional content writer for Disruptors & Co..."
              required
            />
            <p className="text-gray-500 text-xs mt-1">
              Define the agent's role, expertise, tone, and behavior
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              AI Model *
            </label>
            <select
              value={formData.flags?.model}
              onChange={e => setFormData({
                ...formData,
                flags: {...formData.flags, model: e.target.value}
              })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="claude-sonnet-4.5">Claude Sonnet 4.5 (Recommended)</option>
              <option value="claude-opus-4.1">Claude Opus 4.1 (Advanced)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Temperature: {formData.flags?.temperature || 0.7}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.flags?.temperature || 0.7}
              onChange={e => setFormData({
                ...formData,
                flags: {...formData.flags, temperature: parseFloat(e.target.value)}
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Focused (0.0)</span>
              <span>Balanced (1.0)</span>
              <span>Creative (2.0)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              min="100"
              max="100000"
              step="100"
              value={formData.flags?.max_tokens || 4000}
              onChange={e => setFormData({
                ...formData,
                flags: {...formData.flags, max_tokens: parseInt(e.target.value)}
              })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
            <p className="text-gray-500 text-xs mt-1">
              Maximum length of generated responses (higher = longer responses)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {agent ? 'Update Agent' : 'Create Agent'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
