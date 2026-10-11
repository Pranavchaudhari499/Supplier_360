// ============================================================
// PURCHASES SERVICE
// Connected to FastAPI: GET /api/purchases/suppliers/{id}/purchases
// ============================================================

import { apiGet, simulateDelay } from './client';
import { mockPurchases, mockPurchaseSummaries } from '../../data/mockData';

export async function getPurchasesBySupplier(supplierId, filters = {}) {
  const res = await apiGet(`/purchases/suppliers/${supplierId}/purchases`, filters);
  if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }

  await simulateDelay(200);
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
  const res = await apiGet(`/purchases/suppliers/${supplierId}/purchases/summary`);
  if (res && res.status === 'success' && res.data) {
    return res;
  }

  await simulateDelay(200);
  const summary = mockPurchaseSummaries[supplierId] || [];
  return { status: 'success', data: summary };
}
