/**
 * Modules System - Main Export
 *
 * Exports all module system utilities, types, and helpers.
 *
 * @module Modules
 */

// Export types
export * from './types';

// Export registry
export { default as ModuleRegistry } from './module-registry';

// Export executor
export {
  executeModule,
  executeModuleFunction,
  getModuleRunHistory,
  getModuleUsageStats
} from './module-executor';

// Re-export for convenience
export { ModuleRegistry as Registry } from './module-registry';
