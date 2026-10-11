// ============================================================
// SUPPLIERS SERVICE
// Connected to FastAPI: GET /api/suppliers, GET /api/suppliers/{id}, POST /api/suppliers
// ============================================================

import { apiGet, apiPost, simulateDelay } from './client';
import { mockSuppliers } from '../../data/mockData';

export async function getSuppliers(filters = {}) {
  const res = await apiGet('/suppliers', filters);
  if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }

  // Fallback to local mock data
  await simulateDelay(200);
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

export async function createSupplier(supplierData) {
  const res = await apiPost('/suppliers', supplierData);
  if (res && res.status === 'success' && res.data) {
    return res;
  }

  await simulateDelay(200);
  const newId = `SUP-${String(mockSuppliers.length + 1).padStart(3, '0')}`;
  const newSupplier = {
    id: newId,
    name: supplierData.name,
    category: supplierData.category || 'General Supplies',
    location: supplierData.location || 'India',
    status: supplierData.status || 'active',
    relationshipYears: supplierData.relationshipYears || 1,
    lastOrderDate: new Date().toISOString().split('T')[0],
    renewalDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    contactPerson: supplierData.contactPerson || '',
    contactEmail: supplierData.contactEmail || '',
    contactPhone: supplierData.contactPhone || '',
    riskScore: supplierData.riskScore || 25,
  };
  mockSuppliers.unshift(newSupplier);
  return { status: 'success', data: newSupplier, message: 'Supplier created successfully' };
}

export async function getSupplierById(supplierId) {
  const res = await apiGet(`/suppliers/${supplierId}`);
  if (res && res.status === 'success' && res.data) {
    return res;
  }

  await simulateDelay(150);
  const supplier = mockSuppliers.find((s) => s.id === supplierId);
  if (!supplier) {
    return { status: 'error', data: null, message: 'Supplier not found' };
  }
  return { status: 'success', data: supplier };
}

export async function getSupplierCategories() {
  const res = await apiGet('/suppliers/categories');
  if (res && res.status === 'success' && Array.isArray(res.data)) {
    return res;
  }

  await simulateDelay(100);
  const categories = [...new Set(mockSuppliers.map((s) => s.category))];
  return { status: 'success', data: categories };
}
