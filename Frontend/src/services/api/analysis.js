// ============================================================
// AI ANALYSIS SERVICE
// Future: POST /api/analysis/{type}
// ============================================================

import { simulateDelay } from './client';
import { mockAIAnalysis } from '../../data/mockData';

export async function runAnalysis(supplierId, analysisType) {
  // Future: POST /api/analysis/{analysisType} { supplier_id }
  await simulateDelay(2000); // Simulate AI processing time

  const supplierAnalysis = mockAIAnalysis[supplierId];
  if (!supplierAnalysis || !supplierAnalysis[analysisType]) {
    // For suppliers without mock analysis, generate a generic response
    return {
      status: 'success',
      data: {
        supplierId,
        analysisType,
        summary: `Analysis of type "${analysisType}" has been completed. The supplier's overall status is within expected parameters. Please review the individual sections for details.`,
        contractFindings: [
          { severity: 'info', message: 'Contract details reviewed — no major issues found' },
        ],
        performanceFindings: [
          { severity: 'info', message: 'Performance metrics are within acceptable ranges' },
        ],
        pricingFindings: [
          { severity: 'info', message: 'Pricing is consistent with recent orders' },
        ],
        discussionPoints: [
          'Review current contract terms for the upcoming period',
          'Discuss any upcoming changes in requirements or volumes',
        ],
        evidence: [],
        generatedAt: new Date().toISOString(),
      },
    };
  }

  return { status: 'success', data: supplierAnalysis[analysisType] };
}
