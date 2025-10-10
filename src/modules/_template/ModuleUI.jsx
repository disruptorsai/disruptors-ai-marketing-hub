/**
 * Module Template UI Component
 *
 * This is a template for creating module UI components.
 * Replace with your actual module UI implementation.
 *
 * @module ModuleUI
 */

import React, { useState } from 'react';
import { Brain, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Module UI Component
 *
 * @param {Object} props
 * @param {Object} props.brain - Business Brain context
 * @param {string} props.audience - 'internal', 'client', or 'public'
 * @param {Object} props.config - User configuration from module_access
 * @param {Object} props.access - Access information (quotas, limits)
 * @param {Function} props.onRun - Function to execute the module
 * @param {boolean} props.loading - Loading state
 * @param {Object|null} props.result - Module execution result
 * @param {Error|null} props.error - Module execution error
 */
export default function ModuleUI({
  brain,
  audience = 'internal',
  config = {},
  access = {},
  onRun,
  loading = false,
  result = null,
  error = null
}) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!inputText.trim()) {
      alert('Please enter some text');
      return;
    }

    // Call the module execution function
    await onRun({
      input_text: inputText
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Module Template
          </h1>
          <p className="text-gray-600 mt-2">
            Template for creating new modules in the Disruptors AI system
          </p>
        </div>

        {/* Audience Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          audience === 'internal' ? 'bg-purple-100 text-purple-700' :
          audience === 'client' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {audience.toUpperCase()}
        </div>
      </div>

      {/* Business Brain Context (if available) */}
      {brain && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Business Brain Active</h3>
              <p className="text-sm text-blue-700 mt-1">
                {brain.business_name} • {brain.industry} • Level {brain.brain_level}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quota Display (for client/public) */}
      {audience !== 'internal' && access && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Usage Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {access.daily_used || 0} / {access.daily_limit || 10}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Monthly</p>
              <p className="text-2xl font-bold text-gray-900">
                {access.monthly_used || 0} / {access.monthly_limit || 100}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="input_text" className="block text-sm font-medium text-gray-700 mb-2">
            Input Text
          </label>
          <textarea
            id="input_text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your text here..."
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Run Module
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error.message || 'Something went wrong'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Success</h3>
              <div className="mt-3 bg-white rounded-lg p-4 border border-green-200">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Help Text (audience-specific) */}
      <div className="text-sm text-gray-500 text-center">
        {audience === 'internal' && (
          <p>Internal mode: No limits, full features, experimental capabilities</p>
        )}
        {audience === 'client' && (
          <p>Client mode: Brain-powered, quota-managed, production-ready</p>
        )}
        {audience === 'public' && (
          <p>
            Public demo: Limited usage. <a href="/contact" className="text-blue-600 hover:underline">Contact us</a> for full access.
          </p>
        )}
      </div>
    </div>
  );
}
