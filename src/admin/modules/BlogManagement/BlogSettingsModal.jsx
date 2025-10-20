/**
 * Blog Settings Modal
 * Configure blog automation settings including:
 * - Pause/resume automation
 * - System prompt editing
 * - Generation parameters
 * - Buffer configuration
 * - Schedule settings
 */

import React, { useState, useEffect } from 'react'
import { X, Play, Pause, Settings, Calendar, Brain, Sliders } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-client'

export default function BlogSettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('automation')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Automation settings
  const [automationEnabled, setAutomationEnabled] = useState(true)
  const [autoGenerationEnabled, setAutoGenerationEnabled] = useState(true)
  const [autoSchedulingEnabled, setAutoSchedulingEnabled] = useState(true)

  // System prompt
  const [systemPrompt, setSystemPrompt] = useState('')

  // Generation parameters
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [minWords, setMinWords] = useState(1200)

  // Buffer settings
  const [bufferMin, setBufferMin] = useState(3)
  const [bufferTarget, setBufferTarget] = useState(5)
  const [bufferMax, setBufferMax] = useState(10)

  // Schedule settings (Phase 1)
  const [phase1Days, setPhase1Days] = useState(['Monday', 'Wednesday', 'Friday'])
  const [phase1Time, setPhase1Time] = useState('09:00')
  const [phase1Duration, setPhase1Duration] = useState(90)

  // Schedule settings (Phase 2)
  const [phase2Days, setPhase2Days] = useState(['Tuesday', 'Thursday'])
  const [phase2Time, setPhase2Time] = useState('09:00')

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Load system settings from database
      const { data: settings, error } = await supabaseAdmin
        .from('system_settings')
        .select('*')
        .in('setting_key', [
          'blog_automation_enabled',
          'blog_auto_generation_enabled',
          'blog_auto_scheduling_enabled',
          'blog_system_prompt',
          'blog_generation_params',
          'blog_buffer_size',
          'blog_schedule_phase_1',
          'blog_schedule_phase_2'
        ])

      if (error) throw error

      // Parse settings
      settings?.forEach(setting => {
        switch (setting.setting_key) {
          case 'blog_automation_enabled':
            setAutomationEnabled(setting.setting_value)
            break
          case 'blog_auto_generation_enabled':
            setAutoGenerationEnabled(setting.setting_value)
            break
          case 'blog_auto_scheduling_enabled':
            setAutoSchedulingEnabled(setting.setting_value)
            break
          case 'blog_system_prompt':
            setSystemPrompt(setting.setting_value || getDefaultPrompt())
            break
          case 'blog_generation_params':
            const params = setting.setting_value || {}
            setModel(params.model || 'claude-sonnet-4-20250514')
            setTemperature(params.temperature || 0.7)
            setMaxTokens(params.max_tokens || 4096)
            setMinWords(params.min_words || 1200)
            break
          case 'blog_buffer_size':
            const buffer = setting.setting_value || {}
            setBufferMin(buffer.min || 3)
            setBufferTarget(buffer.target || 5)
            setBufferMax(buffer.max || 10)
            break
          case 'blog_schedule_phase_1':
            const p1 = setting.setting_value || {}
            setPhase1Days(p1.days || ['Monday', 'Wednesday', 'Friday'])
            setPhase1Time(p1.time || '09:00:00')
            setPhase1Duration(p1.duration_days || 90)
            break
          case 'blog_schedule_phase_2':
            const p2 = setting.setting_value || {}
            setPhase2Days(p2.days || ['Tuesday', 'Thursday'])
            setPhase2Time(p2.time || '09:00:00')
            break
        }
      })

      // If no prompt found, set default
      const promptSetting = settings?.find(s => s.setting_key === 'blog_system_prompt')
      if (!promptSetting) {
        setSystemPrompt(getDefaultPrompt())
      }

    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Prepare settings array
      const settings = [
        {
          setting_key: 'blog_automation_enabled',
          setting_value: automationEnabled,
          description: 'Master automation toggle'
        },
        {
          setting_key: 'blog_auto_generation_enabled',
          setting_value: autoGenerationEnabled,
          description: 'Auto-generate blogs when buffer is low'
        },
        {
          setting_key: 'blog_auto_scheduling_enabled',
          setting_value: autoSchedulingEnabled,
          description: 'Auto-schedule approved blogs'
        },
        {
          setting_key: 'blog_system_prompt',
          setting_value: systemPrompt,
          description: 'System prompt for blog generation'
        },
        {
          setting_key: 'blog_generation_params',
          setting_value: {
            model,
            temperature: parseFloat(temperature),
            max_tokens: parseInt(maxTokens),
            min_words: parseInt(minWords)
          },
          description: 'AI generation parameters'
        },
        {
          setting_key: 'blog_buffer_size',
          setting_value: {
            min: parseInt(bufferMin),
            target: parseInt(bufferTarget),
            max: parseInt(bufferMax)
          },
          description: 'Buffer size configuration'
        },
        {
          setting_key: 'blog_schedule_phase_1',
          setting_value: {
            days: phase1Days,
            time: phase1Time,
            timezone: 'America/New_York',
            duration_days: parseInt(phase1Duration)
          },
          description: 'First 90 days schedule'
        },
        {
          setting_key: 'blog_schedule_phase_2',
          setting_value: {
            days: phase2Days,
            time: phase2Time,
            timezone: 'America/New_York'
          },
          description: 'Ongoing schedule after 90 days'
        }
      ]

      // Upsert all settings
      for (const setting of settings) {
        const { error } = await supabaseAdmin
          .from('system_settings')
          .upsert(setting, { onConflict: 'setting_key' })

        if (error) throw error
      }

      alert('Settings saved successfully!')
      onClose()

    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getDefaultPrompt = () => {
    return `Role: You are a top-performing SEO strategist and educator. Write epic, original blog posts that are practical, easy to follow, and consistently optimized for search and generative engines.

Core Output Requirements:
- Write at least 1,200 words in narrative style with H1/H2/H3 formatting
- Optimize for {{PRIMARY_KEYWORD}} and support with {{SECONDARY_KEYWORD}}
- Include 5 FAQs driven by real user search intent
- Tone: Disruptors & Co — bold, attention-grabbing, no fluff, occasionally contrarian
- Audience: non-experts in skilled trades and service businesses

Content Structure:
1. Hook: Start with a bold statement or contrarian take
2. Problem: Define the pain point your reader is experiencing
3. Solution: Provide actionable steps and frameworks
4. Examples: Include real-world case studies or scenarios
5. FAQs: Answer 5 common questions related to the topic
6. CTA: End with a clear next step

SEO Requirements:
- Primary keyword in H1, first 100 words, at least 3 H2s
- Secondary keywords distributed naturally (2-3% density)
- Meta description under 160 characters
- 1-2 internal links to related content
- External links to authoritative sources

Writing Style:
- Short paragraphs (2-3 sentences max)
- Bullet points and numbered lists for scannability
- Active voice, second person ("you")
- No jargon unless explained
- Conversational but authoritative

Quality Standards:
- Original insights, not generic advice
- Data-driven when possible (cite sources)
- Actionable takeaways in every section
- Optimized for featured snippets (answer questions directly)
- Mobile-friendly formatting`
  }

  const togglePhase1Day = (day) => {
    setPhase1Days(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const togglePhase2Day = (day) => {
    setPhase2Days(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-green-500/30 shadow-2xl shadow-green-500/20 max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/20">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Blog Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-green-500/70 hover:text-green-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-6 border-b border-green-500/20 overflow-x-auto">
          {[
            { id: 'automation', label: 'Automation', icon: Play },
            { id: 'prompt', label: 'System Prompt', icon: Brain },
            { id: 'parameters', label: 'Generation', icon: Sliders },
            { id: 'schedule', label: 'Schedule', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                    : 'text-green-500/70 hover:text-green-500 hover:bg-green-500/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-green-500/70">Loading settings...</p>
            </div>
          ) : (
            <>
              {/* Automation Tab */}
              {activeTab === 'automation' && (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          {automationEnabled ? <Play className="w-5 h-5 text-green-500" /> : <Pause className="w-5 h-5 text-red-500" />}
                          Master Automation
                        </h3>
                        <p className="text-sm text-green-500/70 mt-1">
                          Controls all automated blog operations (generation, scheduling, publishing)
                        </p>
                      </div>
                      <button
                        onClick={() => setAutomationEnabled(!automationEnabled)}
                        className={`relative w-16 h-8 rounded-full transition-all ${
                          automationEnabled ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                          automationEnabled ? 'translate-x-8' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    {!automationEnabled && (
                      <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">
                          ⚠️ All automated processes are paused. Blogs will not be generated, scheduled, or published automatically.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Individual toggles */}
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Auto-Generation</h4>
                          <p className="text-sm text-green-500/70">Generate new blogs when buffer falls below minimum</p>
                        </div>
                        <button
                          onClick={() => setAutoGenerationEnabled(!autoGenerationEnabled)}
                          disabled={!automationEnabled}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            autoGenerationEnabled && automationEnabled ? 'bg-green-500' : 'bg-gray-600'
                          } ${!automationEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            autoGenerationEnabled && automationEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Auto-Scheduling</h4>
                          <p className="text-sm text-green-500/70">Automatically schedule approved blogs to next available slots</p>
                        </div>
                        <button
                          onClick={() => setAutoSchedulingEnabled(!autoSchedulingEnabled)}
                          disabled={!automationEnabled}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            autoSchedulingEnabled && automationEnabled ? 'bg-green-500' : 'bg-gray-600'
                          } ${!automationEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            autoSchedulingEnabled && automationEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Buffer Status */}
                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Buffer Configuration</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-green-500/70">Minimum</label>
                        <input
                          type="number"
                          value={bufferMin}
                          onChange={(e) => setBufferMin(e.target.value)}
                          min="1"
                          max="20"
                          className="w-full mt-1 px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-green-500/70">Target</label>
                        <input
                          type="number"
                          value={bufferTarget}
                          onChange={(e) => setBufferTarget(e.target.value)}
                          min="1"
                          max="20"
                          className="w-full mt-1 px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-green-500/70">Maximum</label>
                        <input
                          type="number"
                          value={bufferMax}
                          onChange={(e) => setBufferMax(e.target.value)}
                          min="1"
                          max="20"
                          className="w-full mt-1 px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-green-500/70 mt-2">
                      System will generate new blogs when count drops below minimum, up to target. Maximum prevents runaway generation.
                    </p>
                  </div>
                </div>
              )}

              {/* System Prompt Tab */}
              {activeTab === 'prompt' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">System Prompt</h3>
                      <p className="text-sm text-green-500/70">Instructions given to the AI for blog generation</p>
                    </div>
                    <button
                      onClick={() => setSystemPrompt(getDefaultPrompt())}
                      className="px-4 py-2 bg-slate-800 border border-green-500/30 hover:border-green-500/50 text-green-500 rounded-lg text-sm transition-all"
                    >
                      Reset to Default
                    </button>
                  </div>

                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 bg-slate-900 border border-green-500/30 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-green-500/50"
                    placeholder="Enter system prompt..."
                  />

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">Available Variables:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-400/70 font-mono">
                      <div>{'{{PRIMARY_KEYWORD}}'}</div>
                      <div>{'{{SECONDARY_KEYWORD}}'}</div>
                      <div>{'{{TARGET_URL}}'}</div>
                      <div>{'{{PRIMARY_LOCATION}}'}</div>
                      <div>{'{{BLOG_TITLE}}'}</div>
                      <div>{'{{EXCERPT}}'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generation Parameters Tab */}
              {activeTab === 'parameters' && (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
                    <label className="block text-sm font-medium text-white mb-2">AI Model</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                    >
                      <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Latest)</option>
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    </select>
                  </div>

                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Temperature: {temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-green-500/70 mt-2">
                      Lower = more focused and deterministic. Higher = more creative and varied.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
                    <label className="block text-sm font-medium text-white mb-2">Max Tokens</label>
                    <input
                      type="number"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(e.target.value)}
                      min="1000"
                      max="8192"
                      step="256"
                      className="w-full px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                    />
                    <p className="text-xs text-green-500/70 mt-2">
                      Maximum tokens in AI response (~750 words per 1000 tokens)
                    </p>
                  </div>

                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
                    <label className="block text-sm font-medium text-white mb-2">Minimum Words</label>
                    <input
                      type="number"
                      value={minWords}
                      onChange={(e) => setMinWords(e.target.value)}
                      min="500"
                      max="3000"
                      step="100"
                      className="w-full px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                    />
                    <p className="text-xs text-green-500/70 mt-2">
                      Minimum word count requirement for generated blogs
                    </p>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  {/* Phase 1 */}
                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Phase 1: High Frequency</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Duration (days)</label>
                        <input
                          type="number"
                          value={phase1Duration}
                          onChange={(e) => setPhase1Duration(e.target.value)}
                          min="1"
                          max="365"
                          className="w-full px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Publishing Days</label>
                        <div className="grid grid-cols-7 gap-2">
                          {weekDays.map(day => (
                            <button
                              key={day}
                              onClick={() => togglePhase1Day(day)}
                              className={`px-2 py-1 rounded text-xs transition-all ${
                                phase1Days.includes(day)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-slate-900 text-green-500/70 border border-green-500/30'
                              }`}
                            >
                              {day.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Publishing Time (EST)</label>
                        <input
                          type="time"
                          value={phase1Time}
                          onChange={(e) => setPhase1Time(e.target.value)}
                          className="px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-400">
                        Publishing {phase1Days.length} times per week at {phase1Time} EST for {phase1Duration} days
                      </p>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Phase 2: Ongoing Frequency</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Publishing Days</label>
                        <div className="grid grid-cols-7 gap-2">
                          {weekDays.map(day => (
                            <button
                              key={day}
                              onClick={() => togglePhase2Day(day)}
                              className={`px-2 py-1 rounded text-xs transition-all ${
                                phase2Days.includes(day)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-slate-900 text-green-500/70 border border-green-500/30'
                              }`}
                            >
                              {day.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Publishing Time (EST)</label>
                        <input
                          type="time"
                          value={phase2Time}
                          onChange={(e) => setPhase2Time(e.target.value)}
                          className="px-3 py-2 bg-slate-900 border border-green-500/30 rounded text-white"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-400">
                        Publishing {phase2Days.length} times per week at {phase2Time} EST after Phase 1 ends
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-green-500/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 border border-green-500/30 hover:border-green-500/50 text-white rounded-lg transition-all"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
