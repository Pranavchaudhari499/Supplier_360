// ============================================================
// DASHBOARD SERVICE
// Connected to FastAPI: GET /api/dashboard/metrics, GET /api/dashboard/charts
// Validates response shapes and provides clean fallbacks
// ============================================================

import { apiGet, simulateDelay } from './client';
import { mockDashboardMetrics, mockDashboardCharts } from '../../data/mockData';

export async function getDashboardMetrics() {
  const res = await apiGet('/dashboard/metrics');
  if (res && res.status === 'success' && res.data) {
    return {
      status: 'success',
      data: {
        ...mockDashboardMetrics,
        ...res.data,
      },
    };
  }

  await simulateDelay(200);
  return { status: 'success', data: mockDashboardMetrics };
}

export async function getDashboardCharts() {
  const res = await apiGet('/dashboard/charts');
  if (res && res.status === 'success' && res.data) {
    return {
      status: 'success',
      data: {
        ...mockDashboardCharts,
        ...res.data,
        attentionItems: Array.isArray(res.data.attentionItems)
          ? res.data.attentionItems
          : mockDashboardCharts.attentionItems,
        spendTrend: Array.isArray(res.data.spendTrend)
          ? res.data.spendTrend
          : mockDashboardCharts.spendTrend,
        supplierPerformance: Array.isArray(res.data.supplierPerformance)
          ? res.data.supplierPerformance
          : mockDashboardCharts.supplierPerformance,
      },
    };
  }

  await simulateDelay(200);
  return { status: 'success', data: mockDashboardCharts };
}
