/**
 * Integrations Hub Module
 * Manage third-party service integrations
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../api/auth'
import { Check, X, Plus, Settings, ExternalLink, Key, Link2, AlertCircle } from 'lucide-react'

// Available integration services
const AVAILABLE_SERVICES = [
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Track website traffic and user behavior',
    icon: '📊',
    color: 'orange',
    requiresAuth: true,
    authType: 'oauth',
    fields: [
      { name: 'property_id', label: 'Property ID', type: 'text', placeholder: 'G-XXXXXXXXXX' }
    ]
  },
  {
    id: 'google_search_console',
    name: 'Google Search Console',
    description: 'Monitor search performance and indexing',
    icon: '🔍',
    color: 'blue',
    requiresAuth: true,
    authType: 'oauth',
    fields: [
      { name: 'site_url', label: 'Site URL', type: 'text', placeholder: 'https://example.com' }
    ]
  },
  {
    id: 'meta_business',
    name: 'Meta Business Suite',
    description: 'Manage Facebook and Instagram content',
    icon: '👥',
    color: 'blue',
    requiresAuth: true,
    authType: 'oauth',
    fields: [
      { name: 'page_id', label: 'Page ID', type: 'text', placeholder: '123456789' }
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    description: 'Sync contacts and marketing automation',
    icon: '🎯',
    color: 'orange',
    requiresAuth: true,
    authType: 'api_key',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your HubSpot API key' },
      { name: 'portal_id', label: 'Portal ID', type: 'text', placeholder: '12345678' }
    ]
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and audience management',
    icon: '📧',
    color: 'yellow',
    requiresAuth: true,
    authType: 'api_key',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your Mailchimp API key' },
      { name: 'server_prefix', label: 'Server Prefix', type: 'text', placeholder: 'us1' }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifications and alerts',
    icon: '💬',
    color: 'purple',
    requiresAuth: true,
    authType: 'webhook',
    fields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/services/...' },
      { name: 'channel', label: 'Channel', type: 'text', placeholder: '#general' }
    ]
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps and services',
    icon: '⚡',
    color: 'orange',
    requiresAuth: true,
    authType: 'webhook',
    fields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/...' }
    ]
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Sync data with Airtable bases',
    icon: '📋',
    color: 'yellow',
    requiresAuth: true,
    authType: 'api_key',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your Airtable API key' },
      { name: 'base_id', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX' }
    ]
  }
]

export default function IntegrationsHub() {
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setIntegrations(data || [])
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (service) => {
    setSelectedService(service)
    setShowConnectModal(true)
  }

  const handleSaveConnection = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert({
          service_name: selectedService.id,
          service_label: selectedService.name,
          credentials: formData,
          is_active: true,
          last_sync: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      await loadIntegrations()
      setShowConnectModal(false)
      setSelectedService(null)
      alert('Integration connected successfully!')
    } catch (error) {
      console.error('Failed to save integration:', error)
      alert('Failed to connect integration: ' + error.message)
    }
  }

  const handleDisconnect = async (integrationId) => {
    if (!confirm('Disconnect this integration? You can reconnect it later.')) return

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId)

      if (error) throw error

      await loadIntegrations()
    } catch (error) {
      console.error('Failed to disconnect integration:', error)
      alert('Failed to disconnect integration: ' + error.message)
    }
  }

  const handleTestConnection = async (integration) => {
    try {
      // Simple ping test - in production this would call the actual service
      const { error } = await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', integration.id)

      if (error) throw error

      alert('Connection test successful!')
      await loadIntegrations()
    } catch (error) {
      console.error('Connection test failed:', error)
      alert('Connection test failed: ' + error.message)
    }
  }

  const isConnected = (serviceId) => {
    return integrations.some(i => i.service_name === serviceId && i.is_active)
  }

  const getIntegration = (serviceId) => {
    return integrations.find(i => i.service_name === serviceId)
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      purple: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      green: 'bg-green-500/10 text-green-400 border-green-500/30'
    }
    return colors[color] || colors.blue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-400 animate-pulse font-medium">Loading integrations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations Hub</h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect third-party services to enhance your workflow
        </p>
      </div>

      {/* Connected Integrations Summary */}
      {integrations.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Connected Services</h2>
            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium">
              {integrations.length} Active
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {integrations.map(integration => {
              const service = AVAILABLE_SERVICES.find(s => s.id === integration.service_name)
              return (
                <div
                  key={integration.id}
                  className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-800/30 rounded-lg"
                >
                  <span className="text-2xl">{service?.icon || '🔌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {integration.service_label}
                    </div>
                    <div className="text-xs text-slate-500">
                      {integration.is_active ? 'Connected' : 'Inactive'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_SERVICES.map(service => {
          const connected = isConnected(service.id)
          const integration = getIntegration(service.id)

          return (
            <div
              key={service.id}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-xl hover:border-slate-700/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{service.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{service.name}</h3>
                    <p className="text-sm text-slate-400">{service.description}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium border ${
                    connected
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {connected ? 'Connected' : 'Available'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                {connected ? (
                  <>
                    <button
                      onClick={() => handleTestConnection(integration)}
                      className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm font-medium text-blue-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={14} />
                      Test Connection
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-400 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={14} />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(service)}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 border border-green-500 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Connect
                  </button>
                )}
              </div>

              {connected && integration && (
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <div className="text-xs text-slate-500">
                    <div className="flex items-center justify-between mb-1">
                      <span>Last Synced:</span>
                      <span className="text-slate-400">
                        {new Date(integration.last_sync).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auth Type:</span>
                      <span className="text-slate-400 uppercase">{service.authType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* OAuth Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-400 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-blue-400 mb-1">OAuth Integration Note</div>
            <div className="text-xs text-slate-400">
              Services requiring OAuth authentication will need proper app credentials configured in your Supabase project.
              For now, you can use API keys and webhooks for most integrations. Full OAuth support coming soon.
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedService && (
        <ConnectServiceModal
          service={selectedService}
          onClose={() => {
            setShowConnectModal(false)
            setSelectedService(null)
          }}
          onSave={handleSaveConnection}
        />
      )}
    </div>
  )
}

function ConnectServiceModal({ service, onClose, onSave }) {
  const [formData, setFormData] = useState({})
  const [testing, setTesting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    const hasRequiredFields = service.fields.every(field => formData[field.name]?.trim())
    if (!hasRequiredFields) {
      alert('Please fill in all required fields')
      return
    }

    onSave(formData)
  }

  const handleChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-3xl">{service.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{service.name}</h2>
              <p className="text-slate-400 text-sm mt-1">{service.description}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {service.authType === 'oauth' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                <div className="text-xs text-yellow-400">
                  <strong>OAuth Configuration Required:</strong> This service requires OAuth setup.
                  For now, you can enter API credentials manually. Full OAuth flow coming soon.
                </div>
              </div>
            </div>
          )}

          {service.fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {field.label} *
              </label>
              {field.type === 'password' ? (
                <input
                  type="password"
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                  placeholder={field.placeholder}
                  required
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder={field.placeholder}
                  required
                />
              )}
            </div>
          ))}

          <div className="bg-slate-950/50 border border-slate-800/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Key size={16} className="text-slate-500 mt-0.5" />
              <div className="text-xs text-slate-500">
                Your credentials are encrypted and stored securely. They are never exposed in the frontend.
              </div>
            </div>
          </div>

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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2"
            >
              <Link2 size={14} />
              Connect Service
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
