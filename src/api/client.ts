/**
 * API Client for Admin Nexus
 * Fetches data from Netlify Functions with auth token handling
 */

import { getSession } from './auth'

export interface APIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  auth?: boolean
}

/**
 * Base API client
 */
export async function api(path: string, options: APIOptions = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    auth = true
  } = options

  // Get auth token if needed
  let authHeaders = {}
  if (auth) {
    try {
      const session = await getSession()
      if (session?.access_token) {
        authHeaders = {
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    } catch (error) {
      console.warn('Failed to get auth session:', error)
    }
  }

  // Make request
  const res = await fetch(`/.netlify/functions/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => '')
    let errorMessage = `API ${path} failed: ${res.status}`

    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.error?.message || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }

    throw new Error(errorMessage)
  }

  return res.json()
}
