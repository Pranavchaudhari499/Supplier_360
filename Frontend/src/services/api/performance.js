// ============================================================
// PERFORMANCE SERVICE
// Connected to FastAPI: GET /api/performance/suppliers/{id}/performance
// ============================================================

import { apiGet, simulateDelay } from './client';
import { mockPerformance } from '../../data/mockData';

export async function getPerformanceBySupplier(supplierId) {
  const res = await apiGet(`/performance/suppliers/${supplierId}/performance`);
  if (res && res.status === 'success' && res.data) {
    return res;
  }

  await simulateDelay(200);
  const perf = mockPerformance.find((p) => p.supplierId === supplierId);
  if (!perf) {
    return { status: 'error', data: null, message: 'No performance data found' };
  }
  return { status: 'success', data: perf };
}

export async function getAllPerformance() {
  const res = await apiGet('/performance');
  if (res && res.status === 'success' && Array.isArray(res.data)) {
    return res;
  }

  await simulateDelay(200);
  return { status: 'success', data: mockPerformance };
}
