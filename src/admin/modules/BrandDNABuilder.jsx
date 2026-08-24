/**
 * Brand DNA Builder Module
 * Define brand voice, style, tone, and guidelines
 */

import React, { useState, useEffect } from 'react'
import { BrandRuleAPI } from '@/api/entities.ts'
import { Loader2, Plus, Edit, Trash2, Save, X, Sparkles } from 'lucide-react'

const RULE_CATEGORIES = [
  { value: 'voice', label: 'Voice', icon: '🗣️', description: 'How the brand speaks' },
  { value: 'tone', label: 'Tone', icon: '🎵', description: 'Emotional quality' },
  { value: 'style', label: 'Style', icon: '✨', description: 'Writing conventions' },
  { value: 'lexicon', label: 'Lexicon', icon: '📚', description: 'Preferred terminology' },
  { value: 'taboos', label: 'Taboos', icon: '🚫', description: 'Things to avoid' },
  { value: 'examples', label: 'Examples', icon: '💡', description: 'Good examples' }
]

export default function BrandDNABuilder() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRule, setSelectedRule] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRules()
  }, [])

  async function loadRules() {
    try {
      setLoading(true)
      const data = await BrandRuleAPI.list()
      setRules(data || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load brand rules:', err)
      setError('Failed to load brand rules. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(formData) {
    try {
      await BrandRuleAPI.create(formData)
      await loadRules()
      setIsCreating(false)
    } catch (err) {
      console.error('Failed to create brand rule:', err)
      alert('Failed to create brand rule. Please try again.')
    }
  }

  async function handleUpdate(id, formData) {
    try {
      await BrandRuleAPI.update(id, formData)
      await loadRules()
      setSelectedRule(null)
    } catch (err) {
      console.error('Failed to update brand rule:', err)
      alert('Failed to update brand rule. Please try again.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this brand rule?')) return

    try {
      await BrandRuleAPI.delete(id)
      await loadRules()
    } catch (err) {
      console.error('Failed to delete brand rule:', err)
      alert('Failed to delete brand rule. Please try again.')
    }
  }

  const filteredRules = activeCategory === 'all'
    ? rules
    : rules.filter(rule => rule.category === activeCategory)

  const rulesByCategory = RULE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = rules.filter(r => r.category === cat.value)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Brand DNA Builder</h1>
          <p className="text-gray-400">
            Define your brand voice, style guidelines, and content rules
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Rules ({rules.length})
        </button>
        {RULE_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label} ({rulesByCategory[cat.value]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Category Cards View */}
      {activeCategory === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RULE_CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.value}
              category={cat}
              rules={rulesByCategory[cat.value] || []}
              onSelect={() => setActiveCategory(cat.value)}
            />
          ))}
        </div>
      ) : (
        /* Rules List View */
        <div className="space-y-4">
          {filteredRules.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-6xl mb-4">
                {RULE_CATEGORIES.find(c => c.value === activeCategory)?.icon || '📝'}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No {activeCategory} rules yet
              </h3>
              <p className="text-gray-400 mb-4">
                Create your first {activeCategory} rule to get started
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Create Rule
              </button>
            </div>
          ) : (
            filteredRules.map(rule => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={() => setSelectedRule(rule)}
                onDelete={() => handleDelete(rule.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || selectedRule) && (
        <RuleForm
          rule={selectedRule}
          defaultCategory={activeCategory !== 'all' ? activeCategory : undefined}
          onSave={selectedRule ? handleUpdate : handleCreate}
          onClose={() => {
            setIsCreating(false)
            setSelectedRule(null)
          }}
        />
      )}
    </div>
  )
}

function CategoryCard({ category, rules, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
    >
      <div className="text-4xl mb-3">{category.icon}</div>
      <h3 className="text-xl font-semibold text-white mb-1">{category.label}</h3>
      <p className="text-gray-400 text-sm mb-4">{category.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-500">{rules.length}</span>
        <span className="text-xs text-gray-500">
          {rules.length === 1 ? 'rule' : 'rules'}
        </span>
      </div>
    </div>
  )
}

function RuleCard({ rule, onEdit, onDelete }) {
  const category = RULE_CATEGORIES.find(c => c.value === rule.category)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{category?.icon || '📝'}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white">{rule.rule_type || 'Rule'}</h3>
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                {category?.label || rule.category}
              </span>
            </div>
            <p className="text-gray-400 text-sm whitespace-pre-wrap">{rule.rule_text}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Edit rule"
          >
            <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Delete rule"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {rule.examples && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Examples:</p>
          <div className="space-y-1">
            {rule.examples.map((example, idx) => (
              <p key={idx} className="text-sm text-gray-400 italic">
                "{example}"
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RuleForm({ rule, defaultCategory, onSave, onClose }) {
  const [formData, setFormData] = useState(rule || {
    category: defaultCategory || 'voice',
    rule_type: '',
    rule_text: '',
    examples: []
  })

  const [exampleInput, setExampleInput] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (rule?.id) {
        await onSave(rule.id, formData)
      } else {
        await onSave(formData)
      }
    } finally {
      setSaving(false)
    }
  }

  function addExample() {
    if (!exampleInput.trim()) return
    setFormData({
      ...formData,
      examples: [...(formData.examples || []), exampleInput.trim()]
    })
    setExampleInput('')
  }

  function removeExample(index) {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, idx) => idx !== index)
    })
  }

  const selectedCategory = RULE_CATEGORIES.find(c => c.value === formData.category)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{selectedCategory?.icon || '📝'}</span>
            {rule ? 'Edit Brand Rule' : 'Create Brand Rule'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RULE_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat.value})}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    formData.category === cat.value
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rule Type */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Rule Type *
            </label>
            <input
              type="text"
              value={formData.rule_type}
              onChange={e => setFormData({...formData, rule_type: e.target.value})}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Professional & Direct, Bold & Contrarian, SEO Best Practices"
              required
            />
          </div>

          {/* Rule Text */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Rule Description *
            </label>
            <textarea
              value={formData.rule_text}
              onChange={e => setFormData({...formData, rule_text: e.target.value})}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 h-32"
              placeholder="Describe this rule in detail..."
              required
            />
          </div>

          {/* Examples */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Examples (Optional)
            </label>
            <div className="space-y-2">
              {formData.examples?.map((example, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-900 rounded">
                  <p className="flex-1 text-gray-300 text-sm">{example}</p>
                  <button
                    type="button"
                    onClick={() => removeExample(idx)}
                    className="p-1 hover:bg-gray-800 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={exampleInput}
                onChange={e => setExampleInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addExample())}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Add an example..."
              />
              <button
                type="button"
                onClick={addExample}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              >
                Add
              </button>
            </div>
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
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors disabled:opacity-50"
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
                  {rule ? 'Update Rule' : 'Create Rule'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
