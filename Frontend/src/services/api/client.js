// ============================================================
// API CLIENT — Base configuration and HTTP client
// Communicates with FastAPI backend with graceful mock fallback
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Simulates API latency for realistic UX during prototyping / fallback
 */
const simulateDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Base HTTP API client
 * Attempts real fetch to FastAPI backend; gracefully falls back if unreachable.
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise<import('../../types/index.js').APIResponse>}
 */
export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  try {
    const headers = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.warn(`[API] HTTP ${response.status} from ${url}`);
      return { status: 'error', data: null, message: `Server error: ${response.statusText}` };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // Backend offline / network error — return offline status to trigger local fallback
    console.info(`[API Client] Backend at ${API_BASE_URL} not reachable (${err.message}). Using local fallback.`);
    return { status: 'offline', data: null, message: err.message };
  }
}

export async function apiGet(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.append(key, val);
    }
  });

  try {
    const res = await fetch(url.toString());
    if (res.ok) return await res.json();
  } catch (err) {
    // Offline
  }
  return { status: 'offline', data: null };
}

export async function apiPost(endpoint, body = {}) {
  return apiClient(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiUpload(endpoint, formData) {
  return apiClient(endpoint, {
    method: 'POST',
    body: formData,
  });
}

export { API_BASE_URL, simulateDelay };
