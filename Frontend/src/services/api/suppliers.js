// ============================================================
// SUPPLIERS SERVICE
// Future: GET /api/suppliers, GET /api/suppliers/{id}
// ============================================================

import { simulateDelay } from './client';
import { mockSuppliers } from '../../data/mockData';

export async function getSuppliers(filters = {}) {
  await simulateDelay(300);

  let suppliers = [...mockSuppliers];

  if (filters.status) {
    suppliers = suppliers.filter((s) => s.status === filters.status);
  }
  if (filters.category) {
    suppliers = suppliers.filter((s) => s.category === filters.category);
  }
  if (filters.search) {
    const query = filters.search.toLowerCase();
    suppliers = suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.location.toLowerCase().includes(query)
    );
  }

  return { status: 'success', data: suppliers };
}

export async function getSupplierById(supplierId) {
  await simulateDelay(200);

  const supplier = mockSuppliers.find((s) => s.id === supplierId);
  if (!supplier) {
    return { status: 'error', data: null, message: 'Supplier not found' };
  }
  return { status: 'success', data: supplier };
}

export async function getSupplierCategories() {
  await simulateDelay(100);
  const categories = [...new Set(mockSuppliers.map((s) => s.category))];
  return { status: 'success', data: categories };
}
