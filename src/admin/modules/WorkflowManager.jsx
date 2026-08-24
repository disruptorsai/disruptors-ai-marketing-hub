/**
 * Workflow Manager Module
 * Create and manage automation workflows
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../api/auth'
import { Workflows } from '../../api/entities.ts'
import { Play, Pause, Plus, Trash2, Clock, CheckCircle, AlertCircle, Calendar, Settings } from 'lucide-react'

export default function WorkflowManager() {
  const [workflows, setWorkflows] = useState([])
  const [workflowRuns, setWorkflowRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'history'

  useEffect(() => {
    loadWorkflows()
    loadHistory()
  }, [])

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      const data = await Workflows.list()
      setWorkflows(data || [])
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setWorkflowRuns(data || [])
    } catch (error) {
      console.error('Failed to load workflow history:', error)
    }
  }

  const handleCreateWorkflow = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          name: formData.name,
          description: formData.description,
          triggers: formData.triggers,
          actions: formData.actions,
          is_enabled: true
        })
        .select()
        .single()

      if (error) throw error

      await loadWorkflows()
      setShowCreateModal(false)
      alert('Workflow created successfully!')
    } catch (error) {
      console.error('Failed to create workflow:', error)
      alert('Failed to create workflow: ' + error.message)
    }
  }

  const handleExecuteWorkflow = async (workflowId) => {
    try {
      // Create manual execution run
      const { data, error } = await supabase
        .from('workflow_runs')
        .insert({
          workflow_id: workflowId,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      alert('Workflow execution started! Check history for results.')
      await loadHistory()
    } catch (error) {
      console.error('Failed to execute workflow:', error)
      alert('Failed to execute workflow: ' + error.message)
    }
  }

  const handleToggleWorkflow = async (workflowId, currentState) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ is_enabled: !currentState })
        .eq('id', workflowId)

      if (error) throw error

      await loadWorkflows()
    } catch (error) {
      console.error('Failed to toggle workflow:', error)
      alert('Failed to toggle workflow: ' + error.message)
    }
  }

  const handleDeleteWorkflow = async (workflowId) => {
    if (!confirm('Delete this workflow? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)

      if (error) throw error

      await loadWorkflows()
    } catch (error) {
      console.error('Failed to delete workflow:', error)
      alert('Failed to delete workflow: ' + error.message)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />
      case 'failed':
        return <AlertCircle size={16} className="text-red-400" />
      case 'running':
        return <Clock size={16} className="text-blue-400 animate-pulse" />
      default:
        return <Clock size={16} className="text-slate-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'running':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-400 animate-pulse font-medium">Loading workflows...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflow Manager</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and manage automation workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900/50 border border-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Workflows
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'history'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              History
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            New Workflow
          </button>
        </div>
      </div>

      {/* Workflows List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 gap-4">
          {workflows.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-12 rounded-xl text-center">
              <Settings size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Workflows Yet</h3>
              <p className="text-slate-400 text-sm mb-6">
                Create your first automation workflow to get started
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-all"
              >
                Create Workflow
              </button>
            </div>
          ) : (
            workflows.map(workflow => (
              <div
                key={workflow.id}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-xl hover:border-slate-700/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${
                          workflow.is_enabled
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {workflow.is_enabled ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{workflow.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExecuteWorkflow(workflow.id)}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 transition-all"
                      title="Execute Now"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleWorkflow(workflow.id, workflow.is_enabled)}
                      className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-slate-400 transition-all"
                      title={workflow.is_enabled ? 'Pause' : 'Resume'}
                    >
                      <Pause size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/50">
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-2">TRIGGERS</div>
                    <div className="space-y-1">
                      {workflow.triggers && typeof workflow.triggers === 'object' ? (
                        Object.entries(workflow.triggers).map(([key, value]) => (
                          <div key={key} className="text-sm text-slate-300">
                            <span className="text-slate-500">{key}:</span> {JSON.stringify(value)}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">No triggers configured</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-2">ACTIONS</div>
                    <div className="space-y-1">
                      {workflow.actions && Array.isArray(workflow.actions) ? (
                        workflow.actions.map((action, idx) => (
                          <div key={idx} className="text-sm text-slate-300">
                            {action.type || JSON.stringify(action)}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">No actions configured</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Created {new Date(workflow.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History View */}
      {viewMode === 'history' && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800/50">
            <h2 className="text-lg font-bold text-white">Execution History</h2>
          </div>
          <div className="divide-y divide-slate-800/30">
            {workflowRuns.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm">No execution history yet</p>
              </div>
            ) : (
              workflowRuns.map(run => {
                const workflow = workflows.find(w => w.id === run.workflow_id)
                return (
                  <div key={run.id} className="p-4 hover:bg-slate-950/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(run.status)}
                        <div>
                          <div className="text-sm font-medium text-white">
                            {workflow?.name || 'Unknown Workflow'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Started {new Date(run.started_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(run.status)}`}>
                          {run.status}
                        </span>
                        {run.completed_at && (
                          <div className="text-xs text-slate-500">
                            Duration: {Math.round((new Date(run.completed_at) - new Date(run.started_at)) / 1000)}s
                          </div>
                        )}
                      </div>
                    </div>
                    {run.error_message && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="text-xs text-red-400 font-mono">{run.error_message}</div>
                      </div>
                    )}
                    {run.result && (
                      <div className="mt-3 p-3 bg-slate-950/50 border border-slate-800/30 rounded-lg">
                        <div className="text-xs text-slate-400 font-mono">
                          {JSON.stringify(run.result, null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <WorkflowCreateModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateWorkflow}
        />
      )}
    </div>
  )
}

function WorkflowCreateModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggers: {
      type: 'manual',
      schedule: ''
    },
    actions: []
  })
  const [triggerType, setTriggerType] = useState('manual')
  const [actionInput, setActionInput] = useState('')

  const handleAddAction = () => {
    if (!actionInput.trim()) return

    try {
      const action = JSON.parse(actionInput)
      setFormData({
        ...formData,
        actions: [...formData.actions, action]
      })
      setActionInput('')
    } catch (error) {
      alert('Invalid JSON format for action')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Workflow name is required')
      return
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Create New Workflow</h2>
          <p className="text-slate-400 text-sm mt-1">
            Define triggers and actions for your automation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Workflow Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Daily Content Generation"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none h-20"
              placeholder="Describe what this workflow does..."
            />
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Trigger Type
            </label>
            <select
              value={triggerType}
              onChange={e => {
                setTriggerType(e.target.value)
                setFormData({
                  ...formData,
                  triggers: { type: e.target.value, schedule: '' }
                })
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="manual">Manual</option>
              <option value="schedule">Schedule (Cron)</option>
              <option value="event">Event-based</option>
            </select>
          </div>

          {triggerType === 'schedule' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cron Schedule
              </label>
              <input
                type="text"
                value={formData.triggers.schedule}
                onChange={e => setFormData({
                  ...formData,
                  triggers: { ...formData.triggers, schedule: e.target.value }
                })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
                placeholder="0 9 * * * (Daily at 9 AM)"
              />
              <div className="mt-2 text-xs text-slate-500">
                Examples: <code className="text-slate-400">0 9 * * *</code> = Daily at 9 AM,{' '}
                <code className="text-slate-400">0 * * * *</code> = Every hour
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Actions (JSON format)
            </label>
            <div className="space-y-2">
              {formData.actions.map((action, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <code className="text-xs text-slate-400 flex-1 truncate">
                    {JSON.stringify(action)}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        actions: formData.actions.filter((_, i) => i !== idx)
                      })
                    }}
                    className="ml-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={actionInput}
                  onChange={e => setActionInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  placeholder='{"type": "generate_content", "params": {...}}'
                />
                <button
                  type="button"
                  onClick={handleAddAction}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white"
                >
                  Add
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Example: <code className="text-slate-400">{"{"}"type": "generate_post", "agent_id": "xxx"{"}"}</code>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-all"
            >
              Create Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
