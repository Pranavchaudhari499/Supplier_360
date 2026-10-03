// ============================================================
// ASSISTANT SERVICE
// Future: POST /api/assistant/query
// ============================================================

import { simulateDelay } from './client';
import { mockAssistantResponses } from '../../data/mockData';

export async function sendAssistantMessage(supplierId, message) {
  // Future: POST /api/assistant/query { supplier_id, message }
  await simulateDelay(1500); // Simulate AI thinking

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
