// ============================================================
// CONTRACTS SERVICE
// Future: GET /api/suppliers/{id}/contracts
// ============================================================

import { simulateDelay } from './client';
import { mockContracts } from '../../data/mockData';

export async function getContractBySupplier(supplierId) {
  await simulateDelay(300);
  const contract = mockContracts.find((c) => c.supplierId === supplierId);
  if (!contract) {
    return { status: 'error', data: null, message: 'No contract found' };
  }
  return { status: 'success', data: contract };
}

export async function getAllContracts() {
  await simulateDelay(300);
  return { status: 'success', data: mockContracts };
}
