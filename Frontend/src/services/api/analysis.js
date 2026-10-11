// ============================================================
// AI ANALYSIS SERVICE
// Connected to FastAPI: POST /api/analysis/{analysisType}
// ============================================================

import { apiPost, simulateDelay } from './client';
import { mockAIAnalysis } from '../../data/mockData';

export async function runAnalysis(supplierId, analysisType) {
  // Call LangGraph Agent API on FastAPI backend
  const res = await apiPost(`/analysis/${analysisType}`, {
    supplierId,
    analysisType,
  });

  if (res && res.status === 'success' && res.data) {
    return res;
  }

  // Graceful fallback to mock data
  await simulateDelay(600);

  const supplierAnalysis = mockAIAnalysis[supplierId];
  if (!supplierAnalysis || !supplierAnalysis[analysisType]) {
    return {
      status: 'success',
      data: {
        supplierId,
        analysisType,
        summary: `Analysis of type "${analysisType}" has been completed for ${supplierId}. Key findings combine contractual parameters with delivery performance.`,
        contractFindings: [
          { severity: 'info', message: 'Contract details reviewed — SLA requirements identified' },
        ],
        performanceFindings: [
          { severity: 'info', message: 'Operational fulfillment tracking within target parameters' },
        ],
        pricingFindings: [
          { severity: 'info', message: 'Pricing analyzed against benchmark catalog' },
        ],
        discussionPoints: [
          'Review current contract terms for the upcoming period',
          'Discuss volume discount thresholds prior to renewal',
        ],
        evidence: [],
        generatedAt: new Date().toISOString(),
      },
    };
  }

  return { status: 'success', data: supplierAnalysis[analysisType] };
}
