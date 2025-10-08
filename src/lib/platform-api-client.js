/**
 * Platform-Agnostic API Client
 *
 * Automatically detects whether running on Netlify or Vercel
 * and routes API calls to the correct serverless function endpoints.
 *
 * Detection: Tries Vercel first (/api/*), falls back to Netlify (/.netlify/functions/*)
 */

const smartFetch = async (path, options = {}) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const vercelEndpoint = `${baseUrl}/api/${path}`;
  const netlifyEndpoint = `${baseUrl}/.netlify/functions/${path}`;

  // Try Vercel first, fall back to Netlify on 404
  try {
    const vercelResponse = await fetch(vercelEndpoint, options);
    if (vercelResponse.status === 404) {
      console.log(`Vercel endpoint not found, trying Netlify: ${path}`);
      return fetch(netlifyEndpoint, options);
    }
    return vercelResponse;
  } catch (error) {
    console.log(`Vercel endpoint failed, trying Netlify: ${path}`);
    return fetch(netlifyEndpoint, options);
  }
};

export const GrowthAuditAPI = {
  createJob: async (websiteUrl) => {
    const response = await smartFetch('growth-audit/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ websiteUrl }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  },

  streamResults: async (jobId) => {
    const response = await smartFetch(`growth-audit/stream?jobId=${jobId}`, { method: 'GET' });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  },
};

export const BrainAPI = {
  autoInitialize: async (brainId, options = {}) => {
    const response = await smartFetch('brain/auto-initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brainId, ...options }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  enhance: async (brainId, enhancementType, data = {}) => {
    const response = await smartFetch('brain/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brainId, enhancementType, ...data }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  generateContent: async (brainId, contentType, options = {}) => {
    const response = await smartFetch('brain/content-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brainId, contentType, ...options }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

export const AdminAPI = {
  invokeAI: async (agentId, brainId, messages, options = {}) => {
    const response = await smartFetch('admin/ai-invoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, brainId, messages, options }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  trainAgent: async (agentId) => {
    const response = await smartFetch('admin/agent-train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

export const ContentAPI = {
  researchKeywords: async (query, options = {}) => {
    const response = await smartFetch('content/dataforseo-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...options }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  ingestContent: async (brainId, sourceId) => {
    const response = await smartFetch('content/ingest-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brainId, sourceId }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

export const UtilityAPI = {
  captureScreenshot: async (url, options = {}) => {
    const response = await smartFetch('utilities/screenshot-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, ...options }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};
