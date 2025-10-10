/**
 * Module System - Type Definitions
 *
 * TypeScript types for the modules system.
 * These types map to the Supabase schema and module manifests.
 *
 * @module ModuleTypes
 */

import { z } from 'zod';

/**
 * Module Status
 */
export type ModuleStatus = 'testing' | 'review' | 'approved' | 'deprecated';

/**
 * Module Audience (three-level access)
 */
export type ModuleAudience = 'internal' | 'client' | 'public';

/**
 * Module Runtime Preference
 */
export type ModuleRuntime = 'serverless' | 'node-heavy';

/**
 * WordPress Embed Type
 */
export type WordPressEmbedType = 'iframe' | 'web-component' | 'rest-api';

/**
 * Module Category
 */
export type ModuleCategory =
  | 'content'
  | 'seo'
  | 'automation'
  | 'analytics'
  | 'media'
  | 'social'
  | 'crm'
  | 'email'
  | 'utility';

/**
 * Module Run Status
 */
export type ModuleRunStatus =
  | 'success'
  | 'fail'
  | 'timeout'
  | 'rate_limited'
  | 'quota_exceeded';

/**
 * Module Manifest (matches manifest.json structure)
 */
export interface ModuleManifest {
  id: string;
  slug: string;
  name: string;
  version: string;
  description?: string;
  category: ModuleCategory;
  status: ModuleStatus;
  audience: ModuleAudience[];
  requires_brain: boolean;
  requires_auth: boolean;
  runtime_preference: ModuleRuntime;
  entry_point: string;
  function_endpoint?: string;
  component_path: string;
  icon_url?: string;
  color?: string;
  tags?: string[];
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  config_schema?: Record<string, any>;
  wordpress_compatible: boolean;
  wordpress_shortcode?: string | null;
  wordpress_block?: string | null;
  wordpress_embed_type?: WordPressEmbedType;
  supports_batch: boolean;
  has_preview: boolean;
  is_experimental: boolean;
  default_daily_limit: number;
  default_monthly_limit: number;
  default_cost_per_run: number;
  documentation_url?: string;
  changelog?: string;
}

/**
 * Module (database record from Supabase)
 */
export interface Module extends ModuleManifest {
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_run_at?: string | null;
}

/**
 * Module Run (telemetry record from Supabase)
 */
export interface ModuleRun {
  id: string;
  module_id: string;
  user_id?: string | null;
  brain_id?: string | null;
  audience: ModuleAudience;
  run_context: Record<string, any>;
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  input_hash?: string;
  duration_ms?: number;
  tokens_used?: number;
  cost_usd?: number;
  status: ModuleRunStatus;
  error_message?: string | null;
  error_stack?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  referer?: string | null;
  session_id?: string | null;
  created_at: string;
  completed_at?: string | null;
}

/**
 * Module Access (quota and config from Supabase)
 */
export interface ModuleAccess {
  id: string;
  module_id: string;
  user_id: string;
  enabled: boolean;
  audience: ModuleAudience;
  daily_limit?: number;
  monthly_limit?: number;
  lifetime_limit?: number;
  daily_used: number;
  monthly_used: number;
  lifetime_used: number;
  config: Record<string, any>;
  preferences: Record<string, any>;
  daily_reset_at: string;
  monthly_reset_at: string;
  granted_by?: string | null;
  granted_reason?: string | null;
  created_at: string;
  updated_at: string;
  last_used_at?: string | null;
}

/**
 * Module Config (system-wide settings)
 */
export interface ModuleConfig {
  id: string;
  module_id: string;
  key: string;
  value: Record<string, any>;
  encrypted: boolean;
  description?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Module Access Check Result
 */
export interface ModuleAccessCheckResult {
  allowed: boolean;
  reason?: string;
  module_id?: string;
  access_id?: string;
  daily_limit?: number;
  monthly_limit?: number;
  daily_used?: number;
  monthly_used?: number;
  config?: Record<string, any>;
  quota_reset_at?: string;
}

/**
 * Module Execution Context
 */
export interface ModuleExecutionContext {
  input: Record<string, any>;
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
  brain?: {
    id: string;
    business_name?: string;
    industry?: string;
    brand_voice?: string;
    ideal_customer_profile?: string;
    [key: string]: any;
  };
  audience: ModuleAudience;
  config: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Module Execution Result
 */
export interface ModuleExecutionResult {
  success: boolean;
  data?: Record<string, any>;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  metadata?: {
    duration_ms?: number;
    tokens_used?: number;
    cost_usd?: number;
    [key: string]: any;
  };
}

/**
 * Module Component Props
 */
export interface ModuleComponentProps {
  brain?: Record<string, any>;
  audience: ModuleAudience;
  config: Record<string, any>;
  access: ModuleAccessCheckResult;
  onRun: (input: Record<string, any>) => Promise<void>;
  loading: boolean;
  result: Record<string, any> | null;
  error: Error | null;
}

/**
 * Module Config Interface
 * Defines the structure of a module's index.jsx export
 */
export interface ModuleConfigInterface {
  manifest: ModuleManifest;
  component: React.ComponentType<ModuleComponentProps>;
  execute: (context: ModuleExecutionContext) => Promise<Record<string, any>>;
  validateInput?: (input: Record<string, any>) => { valid: boolean; errors: string[] };
  transformInput?: (input: Record<string, any>, brain?: Record<string, any>) => Record<string, any>;
  transformOutput?: (output: Record<string, any>, brain?: Record<string, any>) => Record<string, any>;
}

/**
 * Zod Schemas for Runtime Validation
 */

export const moduleAudienceSchema = z.enum(['internal', 'client', 'public']);

export const moduleStatusSchema = z.enum(['testing', 'review', 'approved', 'deprecated']);

export const moduleRuntimeSchema = z.enum(['serverless', 'node-heavy']);

export const moduleCategorySchema = z.enum([
  'content',
  'seo',
  'automation',
  'analytics',
  'media',
  'social',
  'crm',
  'email',
  'utility'
]);

export const moduleManifestSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  category: moduleCategorySchema,
  status: moduleStatusSchema,
  audience: z.array(moduleAudienceSchema),
  requires_brain: z.boolean(),
  requires_auth: z.boolean(),
  runtime_preference: moduleRuntimeSchema,
  entry_point: z.string(),
  function_endpoint: z.string().optional(),
  component_path: z.string(),
  icon_url: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
  input_schema: z.record(z.any()).optional(),
  output_schema: z.record(z.any()).optional(),
  config_schema: z.record(z.any()).optional(),
  wordpress_compatible: z.boolean(),
  wordpress_shortcode: z.string().nullable().optional(),
  wordpress_block: z.string().nullable().optional(),
  wordpress_embed_type: z.enum(['iframe', 'web-component', 'rest-api']).optional(),
  supports_batch: z.boolean(),
  has_preview: z.boolean(),
  is_experimental: z.boolean(),
  default_daily_limit: z.number().int().positive(),
  default_monthly_limit: z.number().int().positive(),
  default_cost_per_run: z.number().nonnegative(),
  documentation_url: z.string().optional(),
  changelog: z.string().optional()
});

/**
 * Validate a module manifest
 */
export function validateModuleManifest(manifest: unknown): {
  success: boolean;
  data?: ModuleManifest;
  errors?: string[];
} {
  const result = moduleManifestSchema.safeParse(manifest);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    };
  }
}
