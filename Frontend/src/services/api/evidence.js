// ============================================================
// EVIDENCE SERVICE
// Connected to FastAPI: GET /api/contracts/suppliers/{id}/evidence
// ============================================================

import { apiGet, simulateDelay } from './client';
import { mockEvidence } from '../../data/mockData';

export async function getEvidence(supplierId, field) {
  try {
    const res = await apiGet(`/contracts/suppliers/${supplierId}/evidence?field=${encodeURIComponent(field || '')}`);
    if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn('Live evidence retrieval fallback to mock data:', err);
  }

  await simulateDelay(300);
  const supplierEvidence = mockEvidence[supplierId];
  if (!supplierEvidence || !supplierEvidence[field]) {
    return { status: 'insufficient_evidence', data: [], message: 'No evidence available for this field' };
  }
  return { status: 'success', data: supplierEvidence[field] };
}

export async function queryEvidence(supplierId, query) {
  try {
    const res = await apiGet(`/contracts/suppliers/${supplierId}/evidence?query=${encodeURIComponent(query || '')}`);
    if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn('Live query evidence retrieval fallback to mock data:', err);
  }

  await simulateDelay(400);
  const supplierEvidence = mockEvidence[supplierId];
  if (!supplierEvidence) {
    return { status: 'insufficient_evidence', data: [], message: 'No evidence found' };
  }
  const allEvidence = Object.values(supplierEvidence).flat();
  return { status: 'success', data: allEvidence };
}

