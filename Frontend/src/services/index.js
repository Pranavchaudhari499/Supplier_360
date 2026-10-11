// ============================================================
// SERVICES INDEX — Re-exports all API services
// ============================================================

export { getSuppliers, getSupplierById, getSupplierCategories, createSupplier } from './api/suppliers';
export { getContractBySupplier, getAllContracts } from './api/contracts';
export { getPerformanceBySupplier, getAllPerformance } from './api/performance';
export { getPurchasesBySupplier, getPurchaseSummaryBySupplier } from './api/purchases';
export { getEvidence, queryEvidence } from './api/evidence';
export { runAnalysis } from './api/analysis';
export { sendAssistantMessage } from './api/assistant';
export { generateReport } from './api/reports';
export { getDashboardMetrics, getDashboardCharts } from './api/dashboard';
export { uploadContractDocument, getDocuments } from './api/documents';
