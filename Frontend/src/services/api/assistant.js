// ============================================================
// ASSISTANT SERVICE
// Connected to FastAPI: POST /api/analysis/assistant/query
// ============================================================

import { apiPost, simulateDelay } from './client';
import { mockAssistantResponses } from '../../data/mockData';

export async function sendAssistantMessage(supplierId, message) {
  // Call AI Assistant agent endpoint
  const res = await apiPost('/analysis/assistant/query', {
    supplierId,
    message,
  });

  if (res && res.status === 'success' && res.data) {
    return res;
  }

  // Graceful fallback to rich mock data
  await simulateDelay(600);
  const lower = message.toLowerCase();

  let response;
  if (lower.includes('flag') || lower.includes('attention') || lower.includes('why')) {
    response = mockAssistantResponses['flagged'];
  } else if (lower.includes('meeting') || lower.includes('discuss') || lower.includes('tomorrow')) {
    response = mockAssistantResponses['meeting'];
  } else if (lower.includes('delivery') || lower.includes('performance') || lower.includes('on-time') || lower.includes('on time')) {
    response = mockAssistantResponses['delivery'];
  } else {
    response = mockAssistantResponses['default'];
  }

  return {
    status: 'success',
    data: {
      ...response,
      timestamp: new Date().toISOString(),
    },
  };
}
