// ============================================================
// REPORTS SERVICE
// Future: POST /api/reports/generate
// ============================================================

import { simulateDelay } from './client';
import { mockReports } from '../../data/mockData';

export async function generateReport(supplierId, reportType, dateFrom, dateTo) {
  // Future: POST /api/reports/generate { supplier_id, report_type, from, to }
  await simulateDelay(2500); // Simulate report generation

  const supplierReports = mockReports[supplierId];
  if (supplierReports && supplierReports[reportType]) {
    return { status: 'success', data: supplierReports[reportType] };
  }

  // Generate a generic report structure for any supplier/type combo
  return {
    status: 'success',
    data: {
      id: `RPT-${Date.now()}`,
      supplierId,
      title: `${reportType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Report`,
      reportType,
      dateFrom,
      dateTo,
      generatedAt: new Date().toISOString(),
      sections: [
        { title: 'Executive Summary', type: 'text', content: 'This report provides an analysis of the selected supplier metrics for the specified period. Key findings and recommendations are outlined below.' },
        { title: 'Key Metrics', type: 'text', content: 'All metrics are within acceptable ranges for the review period. No critical issues identified.' },
        { title: 'Recommendations', type: 'list', data: ['Continue monitoring supplier performance', 'Review terms during next contract renewal', 'Maintain current order volumes'] },
      ],
      evidence: [],
    },
  };
}
