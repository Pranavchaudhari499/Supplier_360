// ============================================================
// DASHBOARD SERVICE
// Future: GET /api/dashboard
// ============================================================

import { simulateDelay } from './client';
import { mockDashboardMetrics, mockDashboardCharts } from '../../data/mockData';

export async function getDashboardMetrics() {
  await simulateDelay(300);
  return { status: 'success', data: mockDashboardMetrics };
}

export async function getDashboardCharts() {
  await simulateDelay(400);
  return { status: 'success', data: mockDashboardCharts };
}
