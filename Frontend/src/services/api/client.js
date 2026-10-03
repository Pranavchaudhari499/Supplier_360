// ============================================================
// API CLIENT — Base configuration
// In the future, replace mock implementations with real fetch calls
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Simulates API latency for realistic UX during prototyping
 */
const simulateDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Base API client — will be replaced with real HTTP calls later
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise<import('../types/index.js').APIResponse>}
 */
export async function apiClient(endpoint, options = {}) {
  // Future implementation:
  // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  //   headers: { 'Content-Type': 'application/json', ...options.headers },
  //   ...options,
  // });
  // return response.json();

  // For now, this is unused — individual services return mock data directly
  console.log(`[API] ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
  await simulateDelay();
  return { status: 'success', data: null };
}

export { API_BASE_URL, simulateDelay };
