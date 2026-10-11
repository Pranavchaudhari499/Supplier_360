// ============================================================
// CONTRACTS SERVICE
// Connected to FastAPI: GET /api/contracts, GET /api/contracts/suppliers/{id}/contract
// ============================================================

import { apiGet, simulateDelay } from './client';
import { mockContracts } from '../../data/mockData';

export async function getContractBySupplier(supplierId) {
  const res = await apiGet(`/contracts/suppliers/${supplierId}/contract`);
  if (res && res.status === 'success' && res.data) {
    return res;
  }

  await simulateDelay(200);
  const contract = mockContracts.find((c) => c.supplierId === supplierId);
  if (!contract) {
    return { status: 'error', data: null, message: 'No contract found' };
  }
  return { status: 'success', data: contract };
}

export async function getAllContracts() {
  const res = await apiGet('/contracts');
  if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }

  await simulateDelay(200);
  return { status: 'success', data: mockContracts };
}
