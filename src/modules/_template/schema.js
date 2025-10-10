/**
 * Module Template - Schema Definitions
 *
 * Defines input, output, and config schemas using Zod for runtime validation.
 * These schemas should match the JSON schemas in manifest.json.
 *
 * @module ModuleTemplateSchema
 */

import { z } from 'zod';

/**
 * Input Schema
 * Validates user input before module execution
 */
export const inputSchema = z.object({
  input_text: z.string()
    .min(1, 'Input text is required')
    .max(10000, 'Input text must be less than 10,000 characters')
    .describe('Example input field')
});

/**
 * Output Schema
 * Validates module output after execution
 */
export const outputSchema = z.object({
  result: z.string().describe('Example output field'),
  brain_context_used: z.boolean().optional(),
  audience: z.enum(['internal', 'client', 'public']).optional(),
  timestamp: z.string().datetime().optional()
});

/**
 * Config Schema
 * Validates user-configurable settings
 */
export const configSchema = z.object({
  setting_example: z.boolean()
    .default(true)
    .describe('Example user-configurable setting')
});

/**
 * Brain Context Schema
 * Defines what brain fields this module uses
 */
export const brainContextSchema = z.object({
  business_name: z.string().optional(),
  industry: z.string().optional(),
  brand_voice: z.string().optional(),
  ideal_customer_profile: z.string().optional()
});

/**
 * Module Access Schema
 * Defines access control structure
 */
export const accessSchema = z.object({
  daily_limit: z.number().int().positive(),
  monthly_limit: z.number().int().positive(),
  daily_used: z.number().int().nonnegative(),
  monthly_used: z.number().int().nonnegative(),
  config: configSchema
});

/**
 * Helper function to validate and parse input
 *
 * @param {unknown} input
 * @returns {{ success: boolean, data?: Object, errors?: string[] }}
 */
export function validateInput(input) {
  const result = inputSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    };
  }
}

/**
 * Helper function to validate and parse output
 *
 * @param {unknown} output
 * @returns {{ success: boolean, data?: Object, errors?: string[] }}
 */
export function validateOutput(output) {
  const result = outputSchema.safeParse(output);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    };
  }
}

/**
 * Helper function to validate and parse config
 *
 * @param {unknown} config
 * @returns {{ success: boolean, data?: Object, errors?: string[] }}
 */
export function validateConfig(config) {
  const result = configSchema.safeParse(config);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    };
  }
}

/**
 * Type exports for TypeScript
 */
export type ModuleInput = z.infer<typeof inputSchema>;
export type ModuleOutput = z.infer<typeof outputSchema>;
export type ModuleConfig = z.infer<typeof configSchema>;
export type ModuleBrainContext = z.infer<typeof brainContextSchema>;
export type ModuleAccess = z.infer<typeof accessSchema>;
