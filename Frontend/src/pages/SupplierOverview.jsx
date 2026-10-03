import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Truck, 
  ShieldCheck, 
  IndianRupee,
  Calendar,
  Phone,
  Mail,
  User,
  ExternalLink
} from 'lucide-react';
import { KPICard, AttentionAlert } from '../components/ui';
import { getContractBySupplier, getPerformanceBySupplier } from '../services';

export default function SupplierOverview() {
  const { supplier } = useOutletContext();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [contRes, perfRes] = await Promise.all([
          getContractBySupplier(supplier.id),
          getPerformanceBySupplier(supplier.id)
        ]);
        
        if (contRes.status === 'success') setContract(contRes.data);
        if (perfRes.status === 'success') setPerformance(perfRes.data);
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
  if (contract) {
    const today = new Date();
    const expiry = new Date(contract.expiryDate);
    const diffTime = expiry - today;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const needsAttention = supplier.riskScore > 60 || (daysRemaining && daysRemaining < 60) || (performance && performance.onTimeRate < 85);

  return (
    <div className="animate-fade-in">
      <div className="kpi-grid mb-8">
        <KPICard 
          title="Contract Status" 
          value={contract ? 'Active' : 'None'} 
          icon={FileText} 
          type="info"
          subtitle={contract ? `Expires in ${daysRemaining} days` : 'No active contract'}
        />
        <KPICard 
          title="On-Time Delivery" 
          value={performance ? `${performance.onTimeRate}%` : 'N/A'} 
          icon={Truck} 
          type={performance?.onTimeRate >= 90 ? 'success' : 'warning'}
          change={performance ? (performance.deliveryTrend === 'improving' ? 'Improving' : performance.deliveryTrend === 'declining' ? 'Declining' : 'Stable') : null}
          changeType={performance ? (performance.deliveryTrend === 'improving' ? 'positive' : performance.deliveryTrend === 'declining' ? 'negative' : 'neutral') : null}
        />
        <KPICard 
          title="Defect Rate" 
          value={performance ? `${performance.defectRate}%` : 'N/A'} 
          icon={ShieldCheck} 
          type={performance?.defectRate < 2 ? 'success' : 'error'}
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
              <ul className="mb-4">
                {daysRemaining && daysRemaining < 60 && (
                  <li>Contract renewal approaching in {daysRemaining} days.</li>
                )}
                {performance && performance.onTimeRate < 85 && (
                  <li>Delivery performance has dropped below the 85% acceptable threshold.</li>
                )}
                {performance && performance.priceTrend === 'increasing' && (
                  <li>Supplier pricing shows an increasing trend.</li>
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
                <div className="mb-6 ml-6 relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-white"></span>
                  <div className="text-sm font-medium text-gray-800">Last Order Placed</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(supplier.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="mb-6 ml-6 relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-green-500 border-4 border-white"></span>
                  <div className="text-sm font-medium text-gray-800">Payment Processed</div>
                  <div className="text-xs text-gray-500 mt-1">
                    15 Sep 2026 • ₹4,25,000
                  </div>
                </div>
                <div className="mb-6 ml-6 relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-amber-500 border-4 border-white"></span>
                  <div className="text-sm font-medium text-gray-800">Quality Incident Logged</div>
                  <div className="text-xs text-gray-500 mt-1">
                    02 Sep 2026 • Minor packaging defect reported
                  </div>
                </div>
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
