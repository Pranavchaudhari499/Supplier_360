// ============================================================
// MOCK DATA — SUPPLIERS
// ============================================================

export const mockSuppliers = [
  {
    id: 'SUP-001',
    name: 'ABC Components',
    category: 'Industrial Motors',
    location: 'Pune, Maharashtra',
    status: 'active',
    relationshipYears: 3,
    lastOrderDate: '2026-09-12',
    renewalDate: '2026-11-15',
    contactPerson: 'Rajesh Sharma',
    contactEmail: 'rajesh.sharma@abccomponents.in',
    contactPhone: '+91-9876543210',
    riskScore: 62,
  },
  {
    id: 'SUP-002',
    name: 'XYZ Industrial Supplies',
    category: 'Bearings & Fasteners',
    location: 'Chennai, Tamil Nadu',
    status: 'active',
    relationshipYears: 5,
    lastOrderDate: '2026-09-28',
    renewalDate: '2027-03-01',
    contactPerson: 'Priya Natarajan',
    contactEmail: 'priya@xyzindustrial.in',
    contactPhone: '+91-9123456780',
    riskScore: 25,
  },
  {
    id: 'SUP-003',
    name: 'PQR Engineering',
    category: 'Precision Components',
    location: 'Ahmedabad, Gujarat',
    status: 'under_review',
    relationshipYears: 2,
    lastOrderDate: '2026-08-20',
    renewalDate: '2026-10-31',
    contactPerson: 'Amit Patel',
    contactEmail: 'amit.patel@pqreng.in',
    contactPhone: '+91-9988776655',
    riskScore: 78,
  },
  {
    id: 'SUP-004',
    name: 'Nova Parts',
    category: 'Electronic Components',
    location: 'Bengaluru, Karnataka',
    status: 'active',
    relationshipYears: 4,
    lastOrderDate: '2026-09-25',
    renewalDate: '2027-06-15',
    contactPerson: 'Deepa Rao',
    contactEmail: 'deepa.rao@novaparts.in',
    contactPhone: '+91-8877665544',
    riskScore: 18,
  },
  {
    id: 'SUP-005',
    name: 'Vertex Manufacturing',
    category: 'Sheet Metal & Fabrication',
    location: 'Coimbatore, Tamil Nadu',
    status: 'active',
    relationshipYears: 6,
    lastOrderDate: '2026-09-30',
    renewalDate: '2027-01-31',
    contactPerson: 'Karthik Sundaram',
    contactEmail: 'karthik@vertexmfg.in',
    contactPhone: '+91-7766554433',
    riskScore: 35,
  },
  {
    id: 'SUP-006',
    name: 'Delta Hydraulics',
    category: 'Hydraulic Systems',
    location: 'Jamshedpur, Jharkhand',
    status: 'inactive',
    relationshipYears: 1,
    lastOrderDate: '2026-04-15',
    renewalDate: '2026-09-30',
    contactPerson: 'Sanjay Gupta',
    contactEmail: 'sanjay@deltahydraulics.in',
    contactPhone: '+91-6655443322',
    riskScore: 85,
  },
  {
    id: 'SUP-007',
    name: 'Omega Electricals',
    category: 'Electrical Components',
    location: 'Noida, Uttar Pradesh',
    status: 'active',
    relationshipYears: 3,
    lastOrderDate: '2026-09-18',
    renewalDate: '2027-02-28',
    contactPerson: 'Neha Singh',
    contactEmail: 'neha.singh@omegaelec.in',
    contactPhone: '+91-9900112233',
    riskScore: 40,
  },
];

// ============================================================
// MOCK DATA — CONTRACTS
// ============================================================

export const mockContracts = [
  {
    id: 'CON-001',
    supplierId: 'SUP-001',
    status: 'active',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    unitPrice: 850,
    paymentTerms: '30 days',
    leadTimeDays: 15,
    minimumOrderQuantity: 500,
    warrantyMonths: '12 months',
    penaltyForDelay: '2% per week',
    documents: [
      { id: 'DOC-001', name: 'Annual_Contract_2026.pdf', type: 'contract', uploadDate: '2025-12-20' },
      { id: 'DOC-002', name: 'Revised_Quotation_March.pdf', type: 'quotation', uploadDate: '2026-03-10' },
      { id: 'DOC-003', name: 'Quality_Agreement.pdf', type: 'quality_agreement', uploadDate: '2025-12-20' },
      { id: 'DOC-004', name: 'Warranty_Terms.pdf', type: 'warranty', uploadDate: '2025-12-20' },
    ],
  },
  {
    id: 'CON-002',
    supplierId: 'SUP-002',
    status: 'active',
    startDate: '2026-03-01',
    expiryDate: '2027-02-28',
    unitPrice: 320,
    paymentTerms: '45 days',
    leadTimeDays: 10,
    minimumOrderQuantity: 1000,
    warrantyMonths: '6 months',
    penaltyForDelay: '1.5% per week',
    documents: [
      { id: 'DOC-005', name: 'Supply_Agreement_2026.pdf', type: 'contract', uploadDate: '2026-02-15' },
      { id: 'DOC-006', name: 'Price_Schedule_2026.pdf', type: 'quotation', uploadDate: '2026-02-20' },
    ],
  },
  {
    id: 'CON-003',
    supplierId: 'SUP-003',
    status: 'pending_renewal',
    startDate: '2025-11-01',
    expiryDate: '2026-10-31',
    unitPrice: 1450,
    paymentTerms: '30 days',
    leadTimeDays: 20,
    minimumOrderQuantity: 200,
    warrantyMonths: '18 months',
    penaltyForDelay: '3% per week',
    documents: [
      { id: 'DOC-007', name: 'Master_Agreement_2025.pdf', type: 'contract', uploadDate: '2025-10-20' },
      { id: 'DOC-008', name: 'Amendment_Feb_2026.pdf', type: 'amendment', uploadDate: '2026-02-05' },
      { id: 'DOC-009', name: 'Quality_Standards.pdf', type: 'quality_agreement', uploadDate: '2025-10-20' },
    ],
  },
  {
    id: 'CON-004',
    supplierId: 'SUP-004',
    status: 'active',
    startDate: '2026-06-15',
    expiryDate: '2027-06-14',
    unitPrice: 185,
    paymentTerms: '30 days',
    leadTimeDays: 7,
    minimumOrderQuantity: 2000,
    warrantyMonths: '12 months',
    penaltyForDelay: '1% per week',
    documents: [
      { id: 'DOC-010', name: 'Framework_Agreement.pdf', type: 'contract', uploadDate: '2026-06-10' },
      { id: 'DOC-011', name: 'Component_Specifications.pdf', type: 'other', uploadDate: '2026-06-10' },
    ],
  },
  {
    id: 'CON-005',
    supplierId: 'SUP-005',
    status: 'active',
    startDate: '2026-02-01',
    expiryDate: '2027-01-31',
    unitPrice: 2200,
    paymentTerms: '60 days',
    leadTimeDays: 25,
    minimumOrderQuantity: 100,
    warrantyMonths: '24 months',
    penaltyForDelay: '2.5% per week',
    documents: [
      { id: 'DOC-012', name: 'Fabrication_Contract_2026.pdf', type: 'contract', uploadDate: '2026-01-20' },
      { id: 'DOC-013', name: 'Delivery_Terms.pdf', type: 'delivery_terms', uploadDate: '2026-01-20' },
      { id: 'DOC-014', name: 'Material_Specs.pdf', type: 'other', uploadDate: '2026-01-25' },
    ],
  },
  {
    id: 'CON-006',
    supplierId: 'SUP-006',
    status: 'expired',
    startDate: '2025-10-01',
    expiryDate: '2026-09-30',
    unitPrice: 4500,
    paymentTerms: '30 days',
    leadTimeDays: 30,
    minimumOrderQuantity: 50,
    warrantyMonths: '12 months',
    penaltyForDelay: '2% per week',
    documents: [
      { id: 'DOC-015', name: 'Hydraulic_Supply_Agreement.pdf', type: 'contract', uploadDate: '2025-09-15' },
    ],
  },
  {
    id: 'CON-007',
    supplierId: 'SUP-007',
    status: 'active',
    startDate: '2026-03-01',
    expiryDate: '2027-02-28',
    unitPrice: 560,
    paymentTerms: '30 days',
    leadTimeDays: 12,
    minimumOrderQuantity: 300,
    warrantyMonths: '12 months',
    penaltyForDelay: '1.5% per week',
    documents: [
      { id: 'DOC-016', name: 'Electrical_Supply_Contract.pdf', type: 'contract', uploadDate: '2026-02-25' },
      { id: 'DOC-017', name: 'Safety_Compliance.pdf', type: 'quality_agreement', uploadDate: '2026-02-25' },
    ],
  },
];

// ============================================================
// MOCK DATA — PERFORMANCE
// ============================================================

export const mockPerformance = [
  {
    supplierId: 'SUP-001',
    onTimeRate: 82,
    averageDelayDays: 3.2,
    totalOrders: 120,
    onTimeDeliveries: 98,
    lateDeliveries: 22,
    defectRate: 1.5,
    totalUnitsReceived: 50000,
    defectiveUnits: 750,
    returns: 8,
    qualityComplaints: 5,
    averageLeadTimeDays: 16.2,
    fulfillmentRate: 96,
    cancellationRate: 1.2,
    deliveryTrend: 'declining',
    qualityTrend: 'stable',
    priceTrend: 'increasing',
    monthlyTrend: [
      { month: 'Jan', onTimeRate: 90, defectRate: 1.0, ordersPlaced: 14, avgLeadTime: 14 },
      { month: 'Feb', onTimeRate: 88, defectRate: 1.2, ordersPlaced: 12, avgLeadTime: 14.5 },
      { month: 'Mar', onTimeRate: 87, defectRate: 1.1, ordersPlaced: 15, avgLeadTime: 15 },
      { month: 'Apr', onTimeRate: 85, defectRate: 1.3, ordersPlaced: 13, avgLeadTime: 15.5 },
      { month: 'May', onTimeRate: 84, defectRate: 1.4, ordersPlaced: 14, avgLeadTime: 16 },
      { month: 'Jun', onTimeRate: 83, defectRate: 1.5, ordersPlaced: 12, avgLeadTime: 16 },
      { month: 'Jul', onTimeRate: 80, defectRate: 1.6, ordersPlaced: 15, avgLeadTime: 17 },
      { month: 'Aug', onTimeRate: 79, defectRate: 1.8, ordersPlaced: 13, avgLeadTime: 17.5 },
      { month: 'Sep', onTimeRate: 78, defectRate: 1.5, ordersPlaced: 12, avgLeadTime: 18 },
    ],
  },
  {
    supplierId: 'SUP-002',
    onTimeRate: 94,
    averageDelayDays: 1.1,
    totalOrders: 200,
    onTimeDeliveries: 188,
    lateDeliveries: 12,
    defectRate: 0.8,
    totalUnitsReceived: 150000,
    defectiveUnits: 1200,
    returns: 3,
    qualityComplaints: 2,
    averageLeadTimeDays: 9.5,
    fulfillmentRate: 99,
    cancellationRate: 0.3,
    deliveryTrend: 'stable',
    qualityTrend: 'improving',
    priceTrend: 'stable',
    monthlyTrend: [
      { month: 'Jan', onTimeRate: 93, defectRate: 1.0, ordersPlaced: 22, avgLeadTime: 10 },
      { month: 'Feb', onTimeRate: 94, defectRate: 0.9, ordersPlaced: 20, avgLeadTime: 9.8 },
      { month: 'Mar', onTimeRate: 93, defectRate: 0.9, ordersPlaced: 24, avgLeadTime: 9.5 },
      { month: 'Apr', onTimeRate: 95, defectRate: 0.8, ordersPlaced: 21, avgLeadTime: 9.5 },
      { month: 'May', onTimeRate: 94, defectRate: 0.7, ordersPlaced: 23, avgLeadTime: 9.3 },
      { month: 'Jun', onTimeRate: 95, defectRate: 0.8, ordersPlaced: 22, avgLeadTime: 9.5 },
      { month: 'Jul', onTimeRate: 94, defectRate: 0.7, ordersPlaced: 24, avgLeadTime: 9.4 },
      { month: 'Aug', onTimeRate: 95, defectRate: 0.8, ordersPlaced: 22, avgLeadTime: 9.5 },
      { month: 'Sep', onTimeRate: 94, defectRate: 0.8, ordersPlaced: 22, avgLeadTime: 9.5 },
    ],
  },
  {
    supplierId: 'SUP-003',
    onTimeRate: 76,
    averageDelayDays: 5.4,
    totalOrders: 85,
    onTimeDeliveries: 65,
    lateDeliveries: 20,
    defectRate: 2.1,
    totalUnitsReceived: 18000,
    defectiveUnits: 378,
    returns: 12,
    qualityComplaints: 9,
    averageLeadTimeDays: 23.5,
    fulfillmentRate: 90,
    cancellationRate: 3.2,
    deliveryTrend: 'declining',
    qualityTrend: 'declining',
    priceTrend: 'increasing',
    monthlyTrend: [
      { month: 'Jan', onTimeRate: 84, defectRate: 1.4, ordersPlaced: 10, avgLeadTime: 20 },
      { month: 'Feb', onTimeRate: 82, defectRate: 1.6, ordersPlaced: 11, avgLeadTime: 21 },
      { month: 'Mar', onTimeRate: 80, defectRate: 1.8, ordersPlaced: 9, avgLeadTime: 22 },
      { month: 'Apr', onTimeRate: 78, defectRate: 2.0, ordersPlaced: 10, avgLeadTime: 22.5 },
      { month: 'May', onTimeRate: 77, defectRate: 2.1, ordersPlaced: 10, avgLeadTime: 23 },
      { month: 'Jun', onTimeRate: 75, defectRate: 2.2, ordersPlaced: 9, avgLeadTime: 24 },
      { month: 'Jul', onTimeRate: 73, defectRate: 2.4, ordersPlaced: 10, avgLeadTime: 24.5 },
      { month: 'Aug', onTimeRate: 72, defectRate: 2.5, ordersPlaced: 8, avgLeadTime: 25 },
    ],
  },
  {
    supplierId: 'SUP-004',
    onTimeRate: 96,
    averageDelayDays: 0.5,
    totalOrders: 160,
    onTimeDeliveries: 154,
    lateDeliveries: 6,
    defectRate: 0.3,
    totalUnitsReceived: 320000,
    defectiveUnits: 960,
    returns: 1,
    qualityComplaints: 1,
    averageLeadTimeDays: 6.8,
    fulfillmentRate: 99.5,
    cancellationRate: 0.1,
    deliveryTrend: 'improving',
    qualityTrend: 'improving',
    priceTrend: 'stable',
    monthlyTrend: [
      { month: 'Jan', onTimeRate: 94, defectRate: 0.5, ordersPlaced: 18, avgLeadTime: 7.2 },
      { month: 'Feb', onTimeRate: 95, defectRate: 0.4, ordersPlaced: 17, avgLeadTime: 7.0 },
      { month: 'Mar', onTimeRate: 95, defectRate: 0.4, ordersPlaced: 19, avgLeadTime: 6.9 },
      { month: 'Apr', onTimeRate: 96, defectRate: 0.3, ordersPlaced: 18, avgLeadTime: 6.8 },
      { month: 'May', onTimeRate: 96, defectRate: 0.3, ordersPlaced: 18, avgLeadTime: 6.8 },
      { month: 'Jun', onTimeRate: 97, defectRate: 0.3, ordersPlaced: 17, avgLeadTime: 6.7 },
      { month: 'Jul', onTimeRate: 97, defectRate: 0.2, ordersPlaced: 19, avgLeadTime: 6.7 },
      { month: 'Aug', onTimeRate: 97, defectRate: 0.3, ordersPlaced: 18, avgLeadTime: 6.8 },
      { month: 'Sep', onTimeRate: 96, defectRate: 0.3, ordersPlaced: 16, avgLeadTime: 6.8 },
    ],
  },
  {
    supplierId: 'SUP-005',
    onTimeRate: 88,
    averageDelayDays: 2.0,
    totalOrders: 75,
    onTimeDeliveries: 66,
    lateDeliveries: 9,
    defectRate: 0.9,
    totalUnitsReceived: 8500,
    defectiveUnits: 77,
    returns: 2,
    qualityComplaints: 3,
    averageLeadTimeDays: 26,
    fulfillmentRate: 97,
    cancellationRate: 0.8,
    deliveryTrend: 'stable',
    qualityTrend: 'stable',
    priceTrend: 'increasing',
    monthlyTrend: [
      { month: 'Jan', onTimeRate: 87, defectRate: 1.0, ordersPlaced: 8, avgLeadTime: 26 },
      { month: 'Feb', onTimeRate: 88, defectRate: 0.9, ordersPlaced: 9, avgLeadTime: 26 },
      { month: 'Mar', onTimeRate: 89, defectRate: 0.9, ordersPlaced: 8, avgLeadTime: 25.5 },
      { month: 'Apr', onTimeRate: 88, defectRate: 1.0, ordersPlaced: 9, avgLeadTime: 26 },
      { month: 'May', onTimeRate: 87, defectRate: 0.8, ordersPlaced: 8, avgLeadTime: 26.5 },
      { month: 'Jun', onTimeRate: 89, defectRate: 0.9, ordersPlaced: 9, avgLeadTime: 26 },
      { month: 'Jul', onTimeRate: 88, defectRate: 0.9, ordersPlaced: 8, avgLeadTime: 26 },
      { month: 'Aug', onTimeRate: 88, defectRate: 0.8, ordersPlaced: 8, avgLeadTime: 26 },
      { month: 'Sep', onTimeRate: 89, defectRate: 0.9, ordersPlaced: 8, avgLeadTime: 25.5 },
    ],
  },
  {
    supplierId: 'SUP-006',
    onTimeRate: 65,
    averageDelayDays: 7.8,
    totalOrders: 30,
    onTimeDeliveries: 20,
    lateDeliveries: 10,
    defectRate: 3.5,
    totalUnitsReceived: 1500,
    defectiveUnits: 53,
    returns: 6,
    qualityComplaints: 8,
    averageLeadTimeDays: 38,
    fulfillmentRate: 82,
    cancellationRate: 5.0,
    deliveryTrend: 'declining',
    qualityTrend: 'declining',
    priceTrend: 'increasing',
    monthlyTrend: [
      { month: 'Jan', onTimeRate: 72, defectRate: 2.5, ordersPlaced: 5, avgLeadTime: 32 },
      { month: 'Feb', onTimeRate: 70, defectRate: 2.8, ordersPlaced: 5, avgLeadTime: 34 },
      { month: 'Mar', onTimeRate: 68, defectRate: 3.2, ordersPlaced: 5, avgLeadTime: 36 },
      { month: 'Apr', onTimeRate: 60, defectRate: 3.8, ordersPlaced: 5, avgLeadTime: 40 },
    ],
  },
  {
    supplierId: 'SUP-007',
    onTimeRate: 91,
    averageDelayDays: 1.5,
    totalOrders: 110,
    onTimeDeliveries: 100,
    lateDeliveries: 10,
    defectRate: 0.6,
    totalUnitsReceived: 45000,
    defectiveUnits: 270,
    returns: 2,
    qualityComplaints: 2,
    averageLeadTimeDays: 11.5,
    fulfillmentRate: 98,
    cancellationRate: 0.5,
    deliveryTrend: 'improving',
    qualityTrend: 'stable',
    priceTrend: 'stable',
    monthlyTrend: [
      { month: 'Jan', onTimeRate: 89, defectRate: 0.8, ordersPlaced: 12, avgLeadTime: 12 },
      { month: 'Feb', onTimeRate: 90, defectRate: 0.7, ordersPlaced: 12, avgLeadTime: 11.8 },
      { month: 'Mar', onTimeRate: 90, defectRate: 0.6, ordersPlaced: 13, avgLeadTime: 11.5 },
      { month: 'Apr', onTimeRate: 91, defectRate: 0.6, ordersPlaced: 12, avgLeadTime: 11.5 },
      { month: 'May', onTimeRate: 91, defectRate: 0.5, ordersPlaced: 12, avgLeadTime: 11.3 },
      { month: 'Jun', onTimeRate: 92, defectRate: 0.6, ordersPlaced: 13, avgLeadTime: 11.5 },
      { month: 'Jul', onTimeRate: 91, defectRate: 0.6, ordersPlaced: 12, avgLeadTime: 11.5 },
      { month: 'Aug', onTimeRate: 92, defectRate: 0.6, ordersPlaced: 12, avgLeadTime: 11.4 },
      { month: 'Sep', onTimeRate: 91, defectRate: 0.6, ordersPlaced: 12, avgLeadTime: 11.5 },
    ],
  },
];

// ============================================================
// MOCK DATA — PURCHASES
// ============================================================

export const mockPurchases = [
  // SUP-001 - ABC Components
  { id: 'PO-001', supplierId: 'SUP-001', product: 'Motor A', category: 'Industrial Motors', quantity: 600, unitPrice: 850, totalAmount: 510000, orderDate: '2026-09-05', deliveryDate: '2026-09-20', status: 'delivered' },
  { id: 'PO-002', supplierId: 'SUP-001', product: 'Motor B', category: 'Industrial Motors', quantity: 300, unitPrice: 1270, totalAmount: 381000, orderDate: '2026-08-20', deliveryDate: '2026-09-05', status: 'delivered' },
  { id: 'PO-003', supplierId: 'SUP-001', product: 'Motor A', category: 'Industrial Motors', quantity: 500, unitPrice: 840, totalAmount: 420000, orderDate: '2026-07-15', deliveryDate: '2026-07-30', status: 'delivered' },
  { id: 'PO-004', supplierId: 'SUP-001', product: 'Motor C', category: 'Industrial Motors', quantity: 400, unitPrice: 650, totalAmount: 260000, orderDate: '2026-06-10', deliveryDate: '2026-06-28', status: 'delivered' },
  { id: 'PO-005', supplierId: 'SUP-001', product: 'Motor A', category: 'Industrial Motors', quantity: 700, unitPrice: 830, totalAmount: 581000, orderDate: '2026-05-01', deliveryDate: '2026-05-18', status: 'delivered' },
  { id: 'PO-006', supplierId: 'SUP-001', product: 'Motor B', category: 'Industrial Motors', quantity: 250, unitPrice: 1250, totalAmount: 312500, orderDate: '2026-04-12', deliveryDate: '2026-04-28', status: 'delivered' },
  { id: 'PO-007', supplierId: 'SUP-001', product: 'Motor C', category: 'Industrial Motors', quantity: 350, unitPrice: 640, totalAmount: 224000, orderDate: '2026-03-05', deliveryDate: '2026-03-22', status: 'delivered' },
  { id: 'PO-008', supplierId: 'SUP-001', product: 'Motor A', category: 'Industrial Motors', quantity: 600, unitPrice: 820, totalAmount: 492000, orderDate: '2026-02-10', deliveryDate: '2026-02-26', status: 'delivered' },
  { id: 'PO-009', supplierId: 'SUP-001', product: 'Motor A', category: 'Industrial Motors', quantity: 550, unitPrice: 810, totalAmount: 445500, orderDate: '2026-01-08', deliveryDate: '2026-01-24', status: 'delivered' },

  // SUP-002 - XYZ Industrial
  { id: 'PO-010', supplierId: 'SUP-002', product: 'Ball Bearing 6205', category: 'Bearings', quantity: 5000, unitPrice: 320, totalAmount: 1600000, orderDate: '2026-09-20', deliveryDate: '2026-09-28', status: 'delivered' },
  { id: 'PO-011', supplierId: 'SUP-002', product: 'Hex Bolt M10', category: 'Fasteners', quantity: 10000, unitPrice: 12, totalAmount: 120000, orderDate: '2026-09-01', deliveryDate: '2026-09-10', status: 'delivered' },
  { id: 'PO-012', supplierId: 'SUP-002', product: 'Ball Bearing 6205', category: 'Bearings', quantity: 4500, unitPrice: 315, totalAmount: 1417500, orderDate: '2026-07-15', deliveryDate: '2026-07-24', status: 'delivered' },
  { id: 'PO-013', supplierId: 'SUP-002', product: 'Taper Roller Bearing', category: 'Bearings', quantity: 2000, unitPrice: 480, totalAmount: 960000, orderDate: '2026-06-01', deliveryDate: '2026-06-10', status: 'delivered' },

  // SUP-003 - PQR Engineering
  { id: 'PO-014', supplierId: 'SUP-003', product: 'CNC Shaft', category: 'Precision Components', quantity: 200, unitPrice: 1450, totalAmount: 290000, orderDate: '2026-08-10', deliveryDate: '2026-09-02', status: 'delivered' },
  { id: 'PO-015', supplierId: 'SUP-003', product: 'Precision Gear', category: 'Precision Components', quantity: 150, unitPrice: 2100, totalAmount: 315000, orderDate: '2026-07-01', deliveryDate: '2026-07-25', status: 'delivered' },
  { id: 'PO-016', supplierId: 'SUP-003', product: 'CNC Shaft', category: 'Precision Components', quantity: 180, unitPrice: 1420, totalAmount: 255600, orderDate: '2026-05-15', deliveryDate: '2026-06-08', status: 'delivered' },

  // SUP-004 - Nova Parts
  { id: 'PO-017', supplierId: 'SUP-004', product: 'Capacitor 100μF', category: 'Electronic Components', quantity: 20000, unitPrice: 18, totalAmount: 360000, orderDate: '2026-09-22', deliveryDate: '2026-09-28', status: 'delivered' },
  { id: 'PO-018', supplierId: 'SUP-004', product: 'Resistor Pack', category: 'Electronic Components', quantity: 50000, unitPrice: 5, totalAmount: 250000, orderDate: '2026-09-10', deliveryDate: '2026-09-16', status: 'delivered' },
  { id: 'PO-019', supplierId: 'SUP-004', product: 'PCB Board Type-C', category: 'Electronic Components', quantity: 3000, unitPrice: 185, totalAmount: 555000, orderDate: '2026-08-20', deliveryDate: '2026-08-27', status: 'delivered' },
  { id: 'PO-020', supplierId: 'SUP-004', product: 'Capacitor 100μF', category: 'Electronic Components', quantity: 18000, unitPrice: 18, totalAmount: 324000, orderDate: '2026-07-05', deliveryDate: '2026-07-12', status: 'delivered' },

  // SUP-005 - Vertex Manufacturing
  { id: 'PO-021', supplierId: 'SUP-005', product: 'Steel Enclosure Box', category: 'Sheet Metal', quantity: 100, unitPrice: 2200, totalAmount: 220000, orderDate: '2026-09-25', deliveryDate: '2026-10-20', status: 'in_transit' },
  { id: 'PO-022', supplierId: 'SUP-005', product: 'Mounting Bracket', category: 'Fabrication', quantity: 500, unitPrice: 350, totalAmount: 175000, orderDate: '2026-08-15', deliveryDate: '2026-09-10', status: 'delivered' },
  { id: 'PO-023', supplierId: 'SUP-005', product: 'Steel Enclosure Box', category: 'Sheet Metal', quantity: 80, unitPrice: 2150, totalAmount: 172000, orderDate: '2026-06-20', deliveryDate: '2026-07-15', status: 'delivered' },

  // SUP-007 - Omega Electricals
  { id: 'PO-024', supplierId: 'SUP-007', product: 'Cable Harness', category: 'Electrical', quantity: 1000, unitPrice: 560, totalAmount: 560000, orderDate: '2026-09-15', deliveryDate: '2026-09-25', status: 'delivered' },
  { id: 'PO-025', supplierId: 'SUP-007', product: 'Terminal Block', category: 'Electrical', quantity: 2000, unitPrice: 85, totalAmount: 170000, orderDate: '2026-08-01', deliveryDate: '2026-08-12', status: 'delivered' },
  { id: 'PO-026', supplierId: 'SUP-007', product: 'Cable Harness', category: 'Electrical', quantity: 800, unitPrice: 550, totalAmount: 440000, orderDate: '2026-06-10', deliveryDate: '2026-06-22', status: 'delivered' },
];

// ============================================================
// MOCK DATA — PURCHASE SUMMARIES (per supplier)
// ============================================================

export const mockPurchaseSummaries = {
  'SUP-001': [
    {
      product: 'Motor A', totalQuantity: 5200, averagePrice: 825, lastPrice: 850,
      priceTrend: [
        { month: 'Jan', price: 810, volume: 550 }, { month: 'Feb', price: 820, volume: 600 },
        { month: 'Mar', price: 820, volume: 0 }, { month: 'Apr', price: 825, volume: 0 },
        { month: 'May', price: 830, volume: 700 }, { month: 'Jun', price: 835, volume: 0 },
        { month: 'Jul', price: 840, volume: 500 }, { month: 'Aug', price: 845, volume: 0 },
        { month: 'Sep', price: 850, volume: 600 },
      ],
    },
    {
      product: 'Motor B', totalQuantity: 2800, averagePrice: 1240, lastPrice: 1270,
      priceTrend: [
        { month: 'Jan', price: 1220, volume: 0 }, { month: 'Feb', price: 1225, volume: 0 },
        { month: 'Mar', price: 1230, volume: 0 }, { month: 'Apr', price: 1250, volume: 250 },
        { month: 'May', price: 1250, volume: 0 }, { month: 'Jun', price: 1255, volume: 0 },
        { month: 'Jul', price: 1260, volume: 0 }, { month: 'Aug', price: 1270, volume: 300 },
        { month: 'Sep', price: 1270, volume: 0 },
      ],
    },
    {
      product: 'Motor C', totalQuantity: 1900, averagePrice: 640, lastPrice: 650,
      priceTrend: [
        { month: 'Jan', price: 630, volume: 0 }, { month: 'Feb', price: 630, volume: 0 },
        { month: 'Mar', price: 640, volume: 350 }, { month: 'Apr', price: 640, volume: 0 },
        { month: 'May', price: 640, volume: 0 }, { month: 'Jun', price: 650, volume: 400 },
        { month: 'Jul', price: 650, volume: 0 }, { month: 'Aug', price: 650, volume: 0 },
        { month: 'Sep', price: 650, volume: 0 },
      ],
    },
  ],
  'SUP-002': [
    {
      product: 'Ball Bearing 6205', totalQuantity: 42000, averagePrice: 315, lastPrice: 320,
      priceTrend: [
        { month: 'Jan', price: 310, volume: 4000 }, { month: 'Mar', price: 312, volume: 4500 },
        { month: 'May', price: 315, volume: 5000 }, { month: 'Jul', price: 315, volume: 4500 },
        { month: 'Sep', price: 320, volume: 5000 },
      ],
    },
    {
      product: 'Hex Bolt M10', totalQuantity: 80000, averagePrice: 11.5, lastPrice: 12,
      priceTrend: [
        { month: 'Jan', price: 11, volume: 10000 }, { month: 'Mar', price: 11, volume: 8000 },
        { month: 'May', price: 11.5, volume: 10000 }, { month: 'Jul', price: 11.5, volume: 12000 },
        { month: 'Sep', price: 12, volume: 10000 },
      ],
    },
  ],
};

// ============================================================
// MOCK DATA — EVIDENCE
// ============================================================

export const mockEvidence = {
  'SUP-001': {
    unitPrice: [
      { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 4, section: '3.2 — Pricing', text: '"The agreed unit price for Motor Type A shall be ₹850 (Eight Hundred and Fifty Rupees) per unit, effective from 01-Jan-2026 to 31-Dec-2026."' },
    ],
    paymentTerms: [
      { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 6, section: '5.1 — Payment', text: '"Payment shall be made within 30 (thirty) calendar days from the date of invoice, subject to satisfactory delivery and quality inspection."' },
    ],
    leadTime: [
      { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 5, section: '4.2 — Delivery', text: '"The Supplier shall deliver the ordered quantity within 15 (fifteen) working days from the date of confirmed purchase order."' },
    ],
    warranty: [
      { documentId: 'DOC-004', documentName: 'Warranty_Terms.pdf', page: 1, section: '1.1 — Warranty Period', text: '"All products supplied under this contract carry a warranty of 12 (twelve) months from the date of delivery against manufacturing defects."' },
    ],
    penalty: [
      { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 7, section: '6.3 — Penalties', text: '"In the event of delayed delivery beyond the agreed lead time, a penalty of 2% of the order value per week of delay shall apply, up to a maximum of 10%."' },
    ],
    moq: [
      { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 4, section: '3.4 — Minimum Order', text: '"The minimum order quantity per purchase order shall be 500 (Five Hundred) units."' },
    ],
    priceIncrease: [
      { documentId: 'DOC-002', documentName: 'Revised_Quotation_March.pdf', page: 2, section: '2.1 — Revised Pricing', text: '"Due to increased raw material costs, the revised unit price effective from 01-Apr-2026 shall be ₹850, representing an increase of approximately 8% from the previous contracted rate of ₹785."' },
    ],
  },
};

// ============================================================
// MOCK DATA — AI ANALYSIS
// ============================================================

export const mockAIAnalysis = {
  'SUP-001': {
    renewal_review: {
      supplierId: 'SUP-001',
      analysisType: 'renewal_review',
      summary: 'ABC Components contract is due for renewal in 45 days. While the supplier has maintained acceptable quality, there are concerns about declining delivery performance and a recent 8% price increase that should be addressed during negotiations.',
      contractFindings: [
        { severity: 'success', message: 'Current contracted price: ₹850 per unit', evidence: [{ documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 4, section: '3.2', text: 'Unit Price = ₹850 per unit' }] },
        { severity: 'warning', message: 'Contract expires on 15 Nov 2026 — 45 days remaining' },
        { severity: 'success', message: 'Payment terms: 30 days — standard for industry' },
        { severity: 'info', message: 'Minimum order quantity: 500 units' },
      ],
      performanceFindings: [
        { severity: 'warning', message: 'On-time delivery at 82% — below target of 90%' },
        { severity: 'warning', message: 'Delivery performance has declined from 90% to 78% over the last 9 months' },
        { severity: 'success', message: 'Defect rate at 1.5% — within acceptable range' },
        { severity: 'info', message: 'Average lead time has increased from 14 to 18 days' },
      ],
      pricingFindings: [
        { severity: 'warning', message: 'Price increased by 8% from ₹785 to ₹850 since contract start', evidence: [{ documentId: 'DOC-002', documentName: 'Revised_Quotation_March.pdf', page: 2, section: '2.1', text: 'Revised unit price: ₹850, increase of approximately 8%' }] },
        { severity: 'info', message: 'Historical average purchase price: ₹825 per unit' },
        { severity: 'info', message: 'Market reference price range: ₹810 — ₹870 per unit' },
      ],
      discussionPoints: [
        'Review the 8% price increase and negotiate a more competitive rate for the renewal period',
        'Address declining delivery performance — request a corrective action plan with specific targets',
        'Negotiate improvement in lead time commitment back to the original 15 days',
        'Confirm warranty terms and penalty clauses remain unchanged',
        'Discuss volume commitments in exchange for better pricing',
        'Request quarterly performance review meetings',
      ],
      evidence: [
        { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 4, section: '3.2', text: 'Unit Price = ₹850 per unit' },
        { documentId: 'DOC-002', documentName: 'Revised_Quotation_March.pdf', page: 2, section: '2.1', text: 'Revised pricing due to raw material cost increases' },
        { documentId: 'DOC-003', documentName: 'Quality_Agreement.pdf', page: 1, section: '1.1', text: 'Quality acceptance criteria and inspection procedures' },
      ],
      generatedAt: '2026-10-01T10:30:00Z',
    },
    contract_analysis: {
      supplierId: 'SUP-001',
      analysisType: 'contract_analysis',
      summary: 'The current contract with ABC Components is active and covers industrial motor supply. Key terms are within industry norms, though the recent price revision warrants attention.',
      contractFindings: [
        { severity: 'success', message: 'Contract is active and valid until 31 Dec 2026' },
        { severity: 'success', message: 'Payment terms of 30 days are standard' },
        { severity: 'info', message: 'Lead time commitment: 15 working days' },
        { severity: 'warning', message: 'A price revision was issued in March 2026, increasing the unit price by 8%' },
        { severity: 'success', message: '12-month warranty on all supplied products' },
        { severity: 'success', message: 'Penalty clause: 2% per week for delayed deliveries (max 10%)' },
      ],
      performanceFindings: [],
      pricingFindings: [
        { severity: 'info', message: 'Contract price: ₹850/unit (post-revision)' },
        { severity: 'info', message: 'Original contract price: ₹785/unit' },
      ],
      discussionPoints: [
        'Consider negotiating a price cap clause for future renewals',
        'Evaluate whether penalty clauses have been enforced for late deliveries',
        'Review quality agreement compliance',
      ],
      evidence: [
        { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 4, section: '3.2', text: 'Unit Price = ₹850 per unit' },
        { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 7, section: '6.3', text: 'Penalty of 2% per week for delayed delivery' },
      ],
      generatedAt: '2026-10-01T10:30:00Z',
    },
    performance_review: {
      supplierId: 'SUP-001',
      analysisType: 'performance_review',
      summary: 'ABC Components shows a clear declining trend in delivery performance over the past 9 months, dropping from 90% to 78% on-time delivery. Quality remains acceptable but should be monitored.',
      contractFindings: [],
      performanceFindings: [
        { severity: 'warning', message: 'On-time delivery has declined from 90% (Jan) to 78% (Sep) — a 12-point drop' },
        { severity: 'warning', message: 'Average delay has increased from 2 days to 3.2 days' },
        { severity: 'success', message: 'Defect rate remains stable around 1.5%' },
        { severity: 'warning', message: 'Average lead time increased from 14 to 18 days — exceeding the contracted 15 days' },
        { severity: 'info', message: '22 late deliveries out of 120 total orders' },
        { severity: 'success', message: 'Order fulfillment rate at 96%' },
      ],
      pricingFindings: [],
      discussionPoints: [
        'Request root cause analysis for declining delivery performance',
        'Set up a corrective action plan with specific milestones',
        'Consider imposing penalty clause if lead time continues to exceed contracted terms',
        'Schedule monthly performance review meetings',
      ],
      evidence: [],
      generatedAt: '2026-10-01T10:30:00Z',
    },
    pricing_analysis: {
      supplierId: 'SUP-001',
      analysisType: 'pricing_analysis',
      summary: 'Pricing for ABC Components has steadily increased over the year. The 8% price increase in March significantly impacts procurement cost. A comparison with market rates and historical data suggests room for negotiation.',
      contractFindings: [],
      performanceFindings: [],
      pricingFindings: [
        { severity: 'warning', message: 'Unit price increased from ₹785 to ₹850 — an 8.3% increase' },
        { severity: 'info', message: 'Motor A average purchase price: ₹825 (trending upward)' },
        { severity: 'info', message: 'Motor B average purchase price: ₹1,240 (trending upward)' },
        { severity: 'info', message: 'Motor C average purchase price: ₹640 (stable)' },
        { severity: 'info', message: 'Total spend with ABC Components YTD: ₹36.3 lakhs' },
        { severity: 'warning', message: 'Price increase outpaces inflation (8% vs. 5.2% industrial PPI)' },
      ],
      discussionPoints: [
        'Benchmark current prices against alternative suppliers',
        'Negotiate volume-based discounts for high-volume products (Motor A)',
        'Request price stability clause for the next contract period',
        'Explore alternative sourcing to create competitive pressure',
      ],
      evidence: [
        { documentId: 'DOC-002', documentName: 'Revised_Quotation_March.pdf', page: 2, section: '2.1', text: 'Revised unit price effective from 01-Apr-2026: ₹850' },
      ],
      generatedAt: '2026-10-01T10:30:00Z',
    },
  },
};

// ============================================================
// MOCK DATA — ASSISTANT RESPONSES
// ============================================================

export const mockAssistantResponses = {
  'default': {
    answer: "I can help you understand your supplier data. You can ask me about specific suppliers, their performance, contracts, pricing trends, or upcoming renewals. Try asking something like:\n\n• \"How has ABC's delivery performance changed recently?\"\n• \"What should I discuss in the next supplier meeting?\"\n• \"Compare pricing across my motor suppliers\"",
    keyFindings: [],
    evidence: [],
    suggestedActions: ['Review Supplier Dashboard', 'Check Contracts Expiring Soon'],
  },
  'flagged': {
    answer: "ABC Components has been flagged for attention due to three key concerns:\n\n1. **Declining Delivery Performance** — On-time delivery has dropped from 90% in January to 78% in September, which is below the 90% target.\n\n2. **Price Increase** — The unit price was increased by 8% in March 2026, from ₹785 to ₹850 per unit.\n\n3. **Contract Renewal** — The contract expires on 15 November 2026 (45 days away) and needs renewal review.\n\nThese issues together mean that ABC Components requires immediate procurement attention.",
    keyFindings: [
      'On-time delivery declined from 90% to 78%',
      'Price increased by 8% (₹785 → ₹850)',
      'Contract renewal due in 45 days',
    ],
    evidence: [
      { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 4, section: '3.2', text: 'Unit Price = ₹850 per unit' },
      { documentId: 'DOC-002', documentName: 'Revised_Quotation_March.pdf', page: 2, section: '2.1', text: 'Revised pricing: ₹850, increase of 8%' },
    ],
    suggestedActions: ['Run Renewal Review', 'Review Performance Details', 'Analyze Pricing Trends'],
  },
  'meeting': {
    answer: "For your upcoming supplier meeting with ABC Components, here are the key topics to cover:\n\n**Performance Issues:**\n• On-time delivery has declined steadily — currently at 78%, down from 90% earlier this year\n• Average lead time has increased to 18 days, exceeding the contracted 15-day commitment\n• 22 out of 120 orders were delivered late\n\n**Pricing:**\n• Discuss the 8% price increase implemented in March\n• Current price (₹850) vs historical average (₹825)\n• Request justification and explore volume-based discounts\n\n**Contract Renewal:**\n• Contract expires 15 November — outline expectations for the new term\n• Propose quarterly performance reviews as a contract condition\n• Negotiate a price stability clause\n\n**Quality:**\n• Defect rate at 1.5% is acceptable but monitor closely\n• Review quality agreement compliance",
    keyFindings: [
      'Delivery performance requires corrective action plan',
      'Price increase needs negotiation',
      'Contract renewal terms should include performance targets',
    ],
    evidence: [
      { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 4, section: '3.2', text: 'Unit Price = ₹850 per unit' },
      { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 5, section: '4.2', text: 'Lead time: 15 working days' },
    ],
    suggestedActions: ['Generate Renewal Review Report', 'View Full Performance Analysis', 'Compare With Alternative Suppliers'],
  },
  'delivery': {
    answer: "Here's a summary of ABC Components' delivery performance over the last 9 months:\n\n**Overall Trend: Declining** ⬇\n\n| Month | On-Time Rate | Lead Time |\n|-------|-------------|----------|\n| Jan | 90% | 14 days |\n| Mar | 87% | 15 days |\n| May | 84% | 16 days |\n| Jul | 80% | 17 days |\n| Sep | 78% | 18 days |\n\nThe on-time delivery rate has dropped by **12 percentage points**, and average lead time has increased from 14 to 18 days — exceeding the contracted commitment of 15 days.\n\nThis represents a consistent deterioration that should be addressed immediately, especially with contract renewal approaching.",
    keyFindings: [
      '12-point decline in on-time delivery (90% → 78%)',
      'Lead time now exceeds contracted 15 days',
      'Trend shows no sign of improvement',
    ],
    evidence: [],
    suggestedActions: ['Request Corrective Action Plan', 'Run Full Performance Review', 'Review Penalty Clause'],
  },
};

// ============================================================
// MOCK DATA — DASHBOARD METRICS
// ============================================================

export const mockDashboardMetrics = {
  totalSuppliers: 7,
  activeSuppliers: 5,
  contractsExpiringSoon: 2,
  suppliersRequiringAttention: 3,
  avgOnTimeDelivery: 84.6,
  avgDefectRate: 1.4,
  totalSpendYTD: 9437100,
  activeContracts: 5,
};

export const mockDashboardCharts = {
  spendTrend: [
    { month: 'Jan', spend: 937500 }, { month: 'Feb', spend: 1012000 },
    { month: 'Mar', spend: 1155600 }, { month: 'Apr', spend: 893500 },
    { month: 'May', spend: 1081000 }, { month: 'Jun', spend: 1195000 },
    { month: 'Jul', spend: 1009500 }, { month: 'Aug', spend: 1089000 },
    { month: 'Sep', spend: 1064000 },
  ],
  supplierPerformance: [
    { name: 'ABC Components', delivery: 82, quality: 98.5, score: 78 },
    { name: 'XYZ Industrial', delivery: 94, quality: 99.2, score: 92 },
    { name: 'PQR Engineering', delivery: 76, quality: 97.9, score: 65 },
    { name: 'Nova Parts', delivery: 96, quality: 99.7, score: 96 },
    { name: 'Vertex Mfg.', delivery: 88, quality: 99.1, score: 85 },
    { name: 'Omega Electricals', delivery: 91, quality: 99.4, score: 89 },
  ],
  contractTimeline: [
    { supplier: 'PQR Engineering', daysRemaining: 30, status: 'pending_renewal' },
    { supplier: 'ABC Components', daysRemaining: 45, status: 'active' },
    { supplier: 'Vertex Mfg.', daysRemaining: 122, status: 'active' },
    { supplier: 'XYZ Industrial', daysRemaining: 151, status: 'active' },
    { supplier: 'Omega Electricals', daysRemaining: 150, status: 'active' },
    { supplier: 'Nova Parts', daysRemaining: 257, status: 'active' },
  ],
  attentionItems: [
    { supplier: 'ABC Components', supplierId: 'SUP-001', issue: 'Contract renewal in 45 days, delivery declining', severity: 'warning' },
    { supplier: 'PQR Engineering', supplierId: 'SUP-003', issue: 'Under review — quality and delivery concerns', severity: 'error' },
    { supplier: 'Delta Hydraulics', supplierId: 'SUP-006', issue: 'Contract expired, supplier inactive', severity: 'error' },
    { supplier: 'Vertex Mfg.', supplierId: 'SUP-005', issue: 'Price increase trend — monitor during renewal', severity: 'info' },
  ],
};

// ============================================================
// MOCK DATA — REPORTS
// ============================================================

export const mockReports = {
  'SUP-001': {
    performance: {
      id: 'RPT-001',
      supplierId: 'SUP-001',
      title: 'Supplier Performance Report — ABC Components',
      reportType: 'performance',
      dateFrom: '2026-01-01',
      dateTo: '2026-09-30',
      generatedAt: '2026-10-01T10:00:00Z',
      sections: [
        { title: 'Executive Summary', type: 'text', content: 'ABC Components has shown declining delivery performance over the review period (January–September 2026). On-time delivery dropped from 90% to 78%, while quality metrics remained within acceptable limits. Lead time has increased beyond contracted commitment. Immediate corrective action is recommended before contract renewal.' },
        { title: 'Delivery Performance', type: 'kpi', data: { onTimeRate: 82, targetRate: 90, totalOrders: 120, lateDeliveries: 22, avgDelay: 3.2 } },
        { title: 'Quality Performance', type: 'kpi', data: { defectRate: 1.5, targetRate: 2.0, totalUnits: 50000, defectiveUnits: 750, returns: 8 } },
        { title: 'Monthly Delivery Trend', type: 'text', content: 'On-time delivery has declined consistently: Jan 90% → Mar 87% → May 84% → Jul 80% → Sep 78%. This 12-point decline represents a significant deterioration in supplier reliability.' },
        { title: 'Lead Time Analysis', type: 'text', content: 'Average lead time has increased from 14 days to 18 days, exceeding the contracted commitment of 15 working days. This has impacted production planning on multiple occasions.' },
        { title: 'Issues Requiring Attention', type: 'list', data: ['On-time delivery below 90% target', 'Lead time exceeding contracted 15 days', 'Declining trend shows no improvement', '8% price increase compounds performance concerns'] },
        { title: 'Suggested Discussion Points', type: 'list', data: ['Request formal root cause analysis for delivery delays', 'Demand corrective action plan with specific milestones', 'Consider enforcing penalty clause (2% per week)', 'Set performance targets as condition for contract renewal', 'Schedule monthly review meetings'] },
      ],
      evidence: [
        { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 5, section: '4.2', text: 'Lead time: 15 working days' },
        { documentId: 'DOC-001', documentName: 'Annual_Contract_2026.pdf', page: 7, section: '6.3', text: 'Penalty: 2% per week for delayed delivery' },
      ],
    },
  },
};
