// ============================================================
// DATA CONTRACTS / TYPES
// These interfaces define the frontend data contract.
// The future FastAPI backend should return data matching these structures.
// ============================================================

/**
 * @typedef {Object} Supplier
 * @property {string} id - Unique supplier identifier (e.g., "SUP-001")
 * @property {string} name - Supplier company name
 * @property {string} category - Industry/product category
 * @property {string} location - City/region
 * @property {'active'|'inactive'|'under_review'|'suspended'} status
 * @property {number} relationshipYears - Years of business relationship
 * @property {string} lastOrderDate - ISO date string
 * @property {string} renewalDate - ISO date string
 * @property {string} contactPerson - Primary contact name
 * @property {string} contactEmail - Primary contact email
 * @property {string} contactPhone - Primary contact phone
 * @property {number} riskScore - 0-100, higher = more risk
 */

/**
 * @typedef {Object} Contract
 * @property {string} id - Unique contract identifier
 * @property {string} supplierId
 * @property {'active'|'expired'|'pending_renewal'|'draft'} status
 * @property {string} startDate - ISO date string
 * @property {string} expiryDate - ISO date string
 * @property {number} unitPrice - Price per unit in INR
 * @property {string} paymentTerms - e.g., "30 days"
 * @property {number} leadTimeDays
 * @property {number} minimumOrderQuantity
 * @property {string} warrantyMonths
 * @property {string} penaltyForDelay - e.g., "2%"
 * @property {ContractDocument[]} documents
 */

/**
 * @typedef {Object} ContractDocument
 * @property {string} id
 * @property {string} name
 * @property {string} type - 'contract'|'quotation'|'amendment'|'warranty'|'quality_agreement'|'delivery_terms'|'other'
 * @property {string} uploadDate
 */

/**
 * @typedef {Object} Performance
 * @property {string} supplierId
 * @property {number} onTimeRate - percentage 0-100
 * @property {number} averageDelayDays
 * @property {number} totalOrders
 * @property {number} onTimeDeliveries
 * @property {number} lateDeliveries
 * @property {number} defectRate - percentage
 * @property {number} totalUnitsReceived
 * @property {number} defectiveUnits
 * @property {number} returns
 * @property {number} qualityComplaints
 * @property {number} averageLeadTimeDays
 * @property {number} fulfillmentRate - percentage
 * @property {number} cancellationRate - percentage
 * @property {'improving'|'stable'|'declining'} deliveryTrend
 * @property {'improving'|'stable'|'declining'} qualityTrend
 * @property {'increasing'|'stable'|'decreasing'} priceTrend
 * @property {MonthlyPerformance[]} monthlyTrend
 */

/**
 * @typedef {Object} MonthlyPerformance
 * @property {string} month
 * @property {number} onTimeRate
 * @property {number} defectRate
 * @property {number} ordersPlaced
 * @property {number} avgLeadTime
 */

/**
 * @typedef {Object} Purchase
 * @property {string} id
 * @property {string} supplierId
 * @property {string} product
 * @property {string} category
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {number} totalAmount
 * @property {string} orderDate
 * @property {string} deliveryDate
 * @property {'delivered'|'in_transit'|'pending'|'cancelled'} status
 */

/**
 * @typedef {Object} PurchaseSummary
 * @property {string} product
 * @property {number} totalQuantity
 * @property {number} averagePrice
 * @property {number} lastPrice
 * @property {PriceTrendPoint[]} priceTrend
 */

/**
 * @typedef {Object} PriceTrendPoint
 * @property {string} month
 * @property {number} price
 * @property {number} volume
 */

/**
 * @typedef {Object} Evidence
 * @property {string} documentId
 * @property {string} documentName
 * @property {number} page
 * @property {string} section
 * @property {string} text - The supporting text from the document
 */

/**
 * @typedef {Object} AIAnalysisResult
 * @property {string} supplierId
 * @property {string} analysisType - 'renewal_review'|'contract_analysis'|'performance_review'|'pricing_analysis'
 * @property {string} summary
 * @property {AnalysisFinding[]} contractFindings
 * @property {AnalysisFinding[]} performanceFindings
 * @property {AnalysisFinding[]} pricingFindings
 * @property {string[]} discussionPoints
 * @property {Evidence[]} evidence
 * @property {string} generatedAt - ISO date string
 * @property {string} [requestId] - For future telemetry
 * @property {string} [traceId] - For future telemetry
 */

/**
 * @typedef {Object} AnalysisFinding
 * @property {'success'|'warning'|'info'|'error'} severity
 * @property {string} message
 * @property {Evidence[]} [evidence]
 */

/**
 * @typedef {Object} AssistantMessage
 * @property {'user'|'assistant'} role
 * @property {string} content
 * @property {string[]} [keyFindings]
 * @property {Evidence[]} [evidence]
 * @property {string[]} [suggestedActions]
 * @property {string} timestamp
 */

/**
 * @typedef {Object} Report
 * @property {string} id
 * @property {string} supplierId
 * @property {string} title
 * @property {string} reportType - 'performance'|'contract_summary'|'price_analysis'|'renewal_review'|'supplier_comparison'
 * @property {string} dateFrom
 * @property {string} dateTo
 * @property {string} generatedAt
 * @property {ReportSection[]} sections
 * @property {Evidence[]} evidence
 */

/**
 * @typedef {Object} ReportSection
 * @property {string} title
 * @property {string} content
 * @property {'text'|'table'|'chart'|'list'|'kpi'} type
 * @property {*} [data]
 */

/**
 * @typedef {Object} DashboardMetrics
 * @property {number} totalSuppliers
 * @property {number} activeSuppliers
 * @property {number} contractsExpiringSoon
 * @property {number} suppliersRequiringAttention
 * @property {number} avgOnTimeDelivery
 * @property {number} avgDefectRate
 * @property {number} totalSpendYTD
 * @property {number} activeContracts
 */

/**
 * @typedef {Object} APIResponse
 * @property {'success'|'error'|'requires_review'|'insufficient_evidence'} status
 * @property {*} data
 * @property {string} [message]
 * @property {string} [requestId]
 * @property {string} [traceId]
 */

export default {};
