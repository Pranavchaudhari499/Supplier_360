import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Truck, 
  ShieldCheck, 
  IndianRupee, 
  AlertTriangle,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { KPICard, AttentionAlert } from '../components/ui';
import { getContractBySupplier, getPerformanceBySupplier, getPurchasesBySupplier } from '../services';

export default function SupplierOverview() {
  const { supplier } = useOutletContext();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [contRes, perfRes, purchRes] = await Promise.all([
          getContractBySupplier(supplier.id),
          getPerformanceBySupplier(supplier.id),
          getPurchasesBySupplier(supplier.id)
        ]);
        
        if (contRes?.status === 'success') setContract(contRes.data);
        if (perfRes?.status === 'success') setPerformance(perfRes.data);
        if (purchRes?.status === 'success') setPurchases(purchRes.data);
      } catch (error) {
        console.error("Failed to load overview data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [supplier.id]);

  if (loading) {
    return (
      <div className="loading-container py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Calculate days remaining for contract
  let daysRemaining = null;
  if (contract?.expiryDate) {
    const today = new Date();
    const expiry = new Date(contract.expiryDate);
    const diffTime = expiry - today;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const onTimeVal = performance?.onTimeRate ?? performance?.onTimeDelivery;
  const defectVal = performance?.defectRate ?? performance?.returnRate;

  // Dynamic Attention Required criteria
  const hasRenewalWarning = daysRemaining !== null && daysRemaining < 60;
  const hasDeliveryWarning = onTimeVal !== undefined && onTimeVal < 85;
  const hasQualityWarning = defectVal !== undefined && defectVal > 1.5;
  const hasPriceWarning = performance?.priceTrend === 'increasing';
  const hasRiskWarning = supplier?.riskScore > 60;

  const needsAttention = hasRenewalWarning || hasDeliveryWarning || hasQualityWarning || hasPriceWarning || hasRiskWarning;

  return (
    <div className="animate-fade-in">
      <div className="kpi-grid mb-8">
        <KPICard 
          title="Contract Status" 
          value={contract ? 'Active' : 'None'} 
          icon={FileText} 
          type="info"
          subtitle={contract ? (daysRemaining ? `Expires in ${daysRemaining} days` : 'Active contract') : 'No active contract'}
        />
        <KPICard 
          title="On-Time Delivery" 
          value={onTimeVal !== undefined && onTimeVal !== null ? `${onTimeVal}%` : 'N/A'} 
          icon={Truck} 
          type={onTimeVal >= 90 ? 'success' : 'warning'}
          change={performance ? (performance.deliveryTrend === 'improving' ? 'Improving' : performance.deliveryTrend === 'declining' ? 'Declining' : 'Stable') : null}
          changeType={performance ? (performance.deliveryTrend === 'improving' ? 'positive' : performance.deliveryTrend === 'declining' ? 'negative' : 'neutral') : null}
        />
        <KPICard 
          title="Defect Rate" 
          value={defectVal !== undefined && defectVal !== null ? `${defectVal}%` : 'N/A'} 
          icon={ShieldCheck} 
          type={defectVal < 2 ? 'success' : 'error'}
          change={performance ? (performance.qualityTrend === 'improving' ? 'Improving' : performance.qualityTrend === 'declining' ? 'Declining' : 'Stable') : null}
          changeType={performance ? (performance.qualityTrend === 'improving' ? 'positive' : performance.qualityTrend === 'declining' ? 'negative' : 'neutral') : null}
        />
        <KPICard 
          title="Pricing Trend" 
          value={performance ? (performance.priceTrend === 'increasing' ? 'Increasing' : performance.priceTrend === 'decreasing' ? 'Decreasing' : 'Stable') : 'N/A'} 
          icon={IndianRupee} 
          type={performance?.priceTrend === 'increasing' ? 'warning' : 'success'}
        />
      </div>

      <div className="grid-3 mb-8">
        <div className="col-span-2 flex flex-col gap-6" style={{ gridColumn: 'span 2' }}>
          
          {needsAttention && (
            <AttentionAlert 
              title="Attention Required" 
              type="warning"
            >
              <ul className="mb-4 space-y-1">
                {hasRenewalWarning && (
                  <li>Contract renewal approaching in {daysRemaining} days.</li>
                )}
                {hasDeliveryWarning && (
                  <li>Delivery performance ({onTimeVal}%) has dropped below the 85% acceptable threshold.</li>
                )}
                {hasQualityWarning && (
                  <li>Defect rate ({defectVal}%) exceeds the 1.5% quality tolerance limit.</li>
                )}
                {hasPriceWarning && (
                  <li>Supplier pricing shows an increasing trend.</li>
                )}
                {hasRiskWarning && (
                  <li>Supplier composite risk score is elevated ({supplier.riskScore}/100).</li>
                )}
              </ul>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/suppliers/${supplier.id}/analysis`)}
              >
                Run AI Renewal Review
              </button>
            </AttentionAlert>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="card-body">
              <div className="relative border-l border-gray-200 ml-3 py-2">
                {purchases && purchases.length > 0 ? (
                  purchases.slice(0, 3).map((po, idx) => {
                    const isDelivered = po.status === 'delivered';
                    const isFlagged = po.qualityInspection === 'flagged' || (po.delayedDays && po.delayedDays > 0);
                    const dotColor = isFlagged ? 'bg-amber-500' : (isDelivered ? 'bg-green-500' : 'bg-blue-500');
                    const title = `Purchase Order ${po.orderNumber || po.id} • ${po.product}`;
                    const formattedDate = po.orderDate ? new Date(po.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
                    const amountFormatted = po.totalAmount ? `₹${Number(po.totalAmount).toLocaleString('en-IN')}` : '';
                    
                    return (
                      <div key={po.id || idx} className="mb-6 ml-6 relative">
                        <span className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full ${dotColor} border-4 border-white`}></span>
                        <div className="text-sm font-medium text-gray-800">{title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formattedDate} {amountFormatted ? `• ${amountFormatted}` : ''} • Status: <span className="capitalize">{po.status}</span>
                          {isFlagged ? ` (${po.delayedDays} days delay)` : ''}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="mb-6 ml-6 relative">
                    <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-white"></span>
                    <div className="text-sm font-medium text-gray-800">Last Order Placed</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No recent orders'}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link to={`/suppliers/${supplier.id}/purchases`} className="text-sm text-primary-600 font-medium hover:text-primary-700">
                  View Full History
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="card h-fit">
          <div className="card-header">
            <h2 className="card-title">Supplier Details</h2>
          </div>
          <div className="card-body p-0">
            <div className="p-4 border-b border-gray-100 flex items-start gap-3">
              <User className="text-gray-400 mt-0.5" size={18} />
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Primary Contact</div>
                <div className="text-sm font-medium text-gray-800 mt-1">{supplier.contactPerson}</div>
              </div>
            </div>
            <div className="p-4 border-b border-gray-100 flex items-start gap-3">
              <Mail className="text-gray-400 mt-0.5" size={18} />
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</div>
                <div className="text-sm text-gray-800 mt-1">
                  <a href={`mailto:${supplier.contactEmail}`}>{supplier.contactEmail}</a>
                </div>
              </div>
            </div>
            <div className="p-4 border-b border-gray-100 flex items-start gap-3">
              <Phone className="text-gray-400 mt-0.5" size={18} />
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone</div>
                <div className="text-sm text-gray-800 mt-1">{supplier.contactPhone}</div>
              </div>
            </div>
            <div className="p-4 flex items-start gap-3">
              <Calendar className="text-gray-400 mt-0.5" size={18} />
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Relationship</div>
                <div className="text-sm text-gray-800 mt-1">{supplier.relationshipYears} Years</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
