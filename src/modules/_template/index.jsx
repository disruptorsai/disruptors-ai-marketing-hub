/**
 * Module Template - Entry Point
 *
 * This file exports the module's main orchestration logic.
 * It handles:
 * - Loading module manifest
 * - Coordinating between UI and backend
 * - Managing state and lifecycle
 *
 * @module ModuleTemplate
 */

import manifest from './manifest.json';
import ModuleUI from './ModuleUI.jsx';
import { executeModuleFunction } from '@/lib/modules/module-executor';

/**
 * Module configuration
 */
export const moduleConfig = {
  manifest,
  component: ModuleUI,

  /**
   * Execute the module's main function
   *
   * @param {Object} params
   * @param {Object} params.input - User input matching input_schema
   * @param {Object} params.user - Authenticated user object
   * @param {Object} params.brain - Business Brain context
   * @param {string} params.audience - 'internal', 'client', or 'public'
   * @param {Object} params.config - User configuration from module_access
   * @returns {Promise<Object>} Result matching output_schema
   */
  async execute({ input, user, brain, audience, config }) {
    // Validate input against schema
    // (In production, use Zod or similar for runtime validation)

    // For template, just return a mock result
    // In real modules, this would call Netlify functions, APIs, etc.
    const result = {
      result: `Processed: ${input.input_text}`,
      brain_context_used: !!brain,
      audience: audience,
      timestamp: new Date().toISOString()
    };

    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 1000));

    return result;
  },

  /**
   * Validate input before execution
   *
   * @param {Object} input
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validateInput(input) {
    const errors = [];

    if (!input.input_text || typeof input.input_text !== 'string') {
      errors.push('input_text is required and must be a string');
    }

    if (input.input_text && input.input_text.length > 10000) {
      errors.push('input_text must be less than 10,000 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Transform input before execution (optional)
   * Useful for adding brain context, normalizing data, etc.
   *
   * @param {Object} input
   * @param {Object} brain
   * @returns {Object} Transformed input
   */
  transformInput(input, brain) {
    return {
      ...input,
      // Add brain context if needed
      business_name: brain?.business_name,
      industry: brain?.industry
    };
  },

  /**
   * Transform output after execution (optional)
   * Useful for formatting, adding metadata, etc.
   *
   * @param {Object} output
   * @param {Object} brain
   * @returns {Object} Transformed output
   */
  transformOutput(output, brain) {
    return {
      ...output,
      personalized: !!brain
    };
  }
};

export default moduleConfig;
