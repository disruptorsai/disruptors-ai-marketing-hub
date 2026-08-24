import { supabase } from './supabase-client.js';

/**
 * Simple error monitoring and logging system
 * Logs errors to console and optionally to Supabase for tracking
 */
class ErrorMonitor {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.enableDatabaseLogging = true;
  }

  /**
   * Log an error with context
   * @param {Error|string} error - The error to log
   * @param {Object} context - Additional context about the error
   * @param {string} level - Error level (error, warning, info)
   */
  async logError(error, context = {}, level = 'error') {
    const errorData = {
      message: typeof error === 'string' ? error : error.message,
      stack: error.stack || null,
      level: level,
      context: context,
      timestamp: new Date().toISOString(),
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : null,
      user_id: await this.getCurrentUserId()
    };

    // Always log to console
    if (level === 'error') {
      console.error('Error logged:', errorData);
    } else if (level === 'warning') {
      console.warn('Warning logged:', errorData);
    } else {
      console.info('Info logged:', errorData);
    }

    // Log to database in production or if explicitly enabled
    if (this.enableDatabaseLogging && (this.isProduction || context.forceDatabaseLog)) {
      try {
        await this.logToDatabase(errorData);
      } catch (dbError) {
        console.error('Failed to log error to database:', dbError);
      }
    }
  }

  /**
   * Log error to Supabase database
   * @param {Object} errorData - Error data to log
   */
  async logToDatabase(errorData) {
    try {
      // Create error logs table if it doesn't exist (should be in schema)
      const { error } = await supabase
        .from('error_logs')
        .insert({
          message: errorData.message,
          stack_trace: errorData.stack,
          level: errorData.level,
          context: errorData.context,
          user_agent: errorData.user_agent,
          url: errorData.url,
          user_id: errorData.user_id,
          created_at: errorData.timestamp
        });

      if (error) {
        // If table doesn't exist, create a minimal version
        if (error.code === 'PGRST205') {
          console.warn('Error logs table does not exist. Add it to your schema for error tracking.');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Database logging failed:', error);
    }
  }

  /**
   * Get current user ID for error context
   * @returns {Promise<string|null>} User ID or null
   */
  async getCurrentUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Track performance metrics
   * @param {string} operation - Name of the operation
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  async trackPerformance(operation, duration, metadata = {}) {
    const performanceData = {
      operation,
      duration,
      metadata,
      timestamp: new Date().toISOString(),
      user_id: await this.getCurrentUserId()
    };

    if (duration > 5000) { // Log slow operations (>5s)
      await this.logError(
        `Slow operation detected: ${operation} took ${duration}ms`,
        performanceData,
        'warning'
      );
    }

    // Log to analytics if available
    if (this.enableDatabaseLogging) {
      try {
        await supabase
          .from('analytics_events')
          .insert({
            event_name: `performance_${operation}`,
            event_type: 'performance',
            value: duration,
            properties: {
              ...metadata,
              duration_ms: duration
            },
            user_id: performanceData.user_id
          });
      } catch (error) {
        console.warn('Failed to log performance data:', error);
      }
    }
  }

  /**
   * Create a performance timer
   * @param {string} operation - Name of the operation to time
   * @returns {Function} End timer function
   */
  startTimer(operation) {
    const startTime = Date.now();
    
    return async (metadata = {}) => {
      const duration = Date.now() - startTime;
      await this.trackPerformance(operation, duration, metadata);
      return duration;
    };
  }

  /**
   * Wrap a function with error monitoring
   * @param {Function} fn - Function to wrap
   * @param {string} operationName - Name for monitoring
   * @returns {Function} Wrapped function
   */
  wrapFunction(fn, operationName) {
    return async (...args) => {
      const timer = this.startTimer(operationName);
      
      try {
        const result = await fn(...args);
        await timer({ success: true });
        return result;
      } catch (error) {
        await timer({ success: false, error: error.message });
        await this.logError(error, { 
          operation: operationName, 
          args: args.length 
        });
        throw error;
      }
    };
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError(event.reason, { 
          type: 'unhandled_promise_rejection',
          promise: event.promise 
        });
      });

      // Handle general errors
      window.addEventListener('error', (event) => {
        this.logError(event.error || event.message, {
          type: 'global_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
    }
  }
}

// Create singleton instance
const errorMonitor = new ErrorMonitor();

// Set up global handlers
errorMonitor.setupGlobalHandlers();

export default errorMonitor;

// Convenience exports
export const logError = (error, context, level) => errorMonitor.logError(error, context, level);
export const trackPerformance = (operation, duration, metadata) => errorMonitor.trackPerformance(operation, duration, metadata);
export const startTimer = (operation) => errorMonitor.startTimer(operation);
export const wrapFunction = (fn, operationName) => errorMonitor.wrapFunction(fn, operationName);