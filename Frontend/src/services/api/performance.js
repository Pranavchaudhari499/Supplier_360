// ============================================================
// PERFORMANCE SERVICE
// Future: GET /api/suppliers/{id}/performance
// ============================================================

import { simulateDelay } from './client';
import { mockPerformance } from '../../data/mockData';

export async function getPerformanceBySupplier(supplierId) {
  await simulateDelay(300);
  const perf = mockPerformance.find((p) => p.supplierId === supplierId);
  if (!perf) {
    return { status: 'error', data: null, message: 'No performance data found' };
  }
  return { status: 'success', data: perf };
}

export async function getAllPerformance() {
  await simulateDelay(300);
  return { status: 'success', data: mockPerformance };
}
