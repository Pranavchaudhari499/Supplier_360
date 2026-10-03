// ============================================================
// PURCHASES SERVICE
// Future: GET /api/suppliers/{id}/purchases
// ============================================================

import { simulateDelay } from './client';
import { mockPurchases, mockPurchaseSummaries } from '../../data/mockData';

export async function getPurchasesBySupplier(supplierId, filters = {}) {
  await simulateDelay(300);
  let purchases = mockPurchases.filter((p) => p.supplierId === supplierId);

  if (filters.product) {
    purchases = purchases.filter((p) => p.product === filters.product);
  }
  if (filters.category) {
    purchases = purchases.filter((p) => p.category === filters.category);
  }
  if (filters.dateFrom) {
    purchases = purchases.filter((p) => p.orderDate >= filters.dateFrom);
  }
  if (filters.dateTo) {
    purchases = purchases.filter((p) => p.orderDate <= filters.dateTo);
  }

  return { status: 'success', data: purchases };
}

export async function getPurchaseSummaryBySupplier(supplierId) {
  await simulateDelay(300);
  const summary = mockPurchaseSummaries[supplierId] || [];
  return { status: 'success', data: summary };
}
