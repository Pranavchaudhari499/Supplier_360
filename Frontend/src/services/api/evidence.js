// ============================================================
// EVIDENCE SERVICE
// Future: GET /api/evidence/{documentId}
// POST /api/rag/query (for evidence retrieval)
// ============================================================

import { simulateDelay } from './client';
import { mockEvidence } from '../../data/mockData';

export async function getEvidence(supplierId, field) {
  await simulateDelay(500);
  const supplierEvidence = mockEvidence[supplierId];
  if (!supplierEvidence || !supplierEvidence[field]) {
    return { status: 'insufficient_evidence', data: null, message: 'No evidence available for this field' };
  }
  return { status: 'success', data: supplierEvidence[field] };
}

export async function queryEvidence(supplierId, query) {
  await simulateDelay(800);
  // Future: POST /api/rag/query { supplier_id, query }
  const supplierEvidence = mockEvidence[supplierId];
  if (!supplierEvidence) {
    return { status: 'insufficient_evidence', data: null, message: 'No evidence found' };
  }
  // Return all evidence for mock
  const allEvidence = Object.values(supplierEvidence).flat();
  return { status: 'success', data: allEvidence };
}
