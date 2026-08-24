import React from 'react';

/**
 * Error boundary to handle chunk loading failures.
 * This fixes the issue where users need to hard refresh after deployments.
 *
 * When a deployment happens:
 * 1. Old chunks are no longer available
 * 2. Users with cached HTML try to load old chunks
 * 3. This causes "Loading chunk failed" errors
 * 4. This component catches those errors and automatically reloads
 */
class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a chunk loading error
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Loading CSS chunk');

    return { hasError: true, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Error caught by ChunkErrorBoundary:', error, errorInfo);

    // If this is a chunk loading error, reload the page once
    if (this.state.isChunkError) {
      // Check if we've already tried reloading (prevent infinite loops)
      const hasReloaded = sessionStorage.getItem('chunk-error-reloaded');

      if (!hasReloaded) {
        console.log('Chunk loading error detected. Reloading page...');
        sessionStorage.setItem('chunk-error-reloaded', 'true');

        // Clear the flag after successful load
        setTimeout(() => {
          sessionStorage.removeItem('chunk-error-reloaded');
        }, 5000);

        // Reload the page to get fresh chunks
        window.location.reload();
      } else {
        // If we've already reloaded once and still have errors,
        // show error message instead of infinite reload loop
        console.error('Chunk loading error persisted after reload');
      }
    }
  }

  render() {
    if (this.state.hasError && !this.state.isChunkError) {
      // For non-chunk errors, show a user-friendly error message
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    if (this.state.hasError && this.state.isChunkError) {
      // Show loading state while we reload for chunk errors
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Updating to latest version...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
