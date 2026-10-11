import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  AlertTriangle,
  IndianRupee,
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { KPICard, StatusBadge, AttentionAlert } from '../components/ui';
import { getDashboardMetrics, getDashboardCharts } from '../services';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsRes, chartsRes] = await Promise.all([
          getDashboardMetrics(),
          getDashboardCharts()
        ]);

        if (metricsRes.status === 'success') setMetrics(metricsRes.data);
        if (chartsRes.status === 'success') setCharts(chartsRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container" style={{ height: '70vh' }}>
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading dashboard intelligence...</div>
      </div>
    );
  }

  if (!metrics || !charts) return <div className="error-state">Failed to load dashboard</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Procurement Intelligence Dashboard</h1>
        <p className="page-subtitle">High-level overview of your supplier ecosystem</p>
      </div>

      <div className="kpi-grid mb-8">
        <KPICard
          title="Total Active Suppliers"
          value={metrics.activeSuppliers}
          icon={Users}
          type="primary"
          subtitle={`Out of ${metrics.totalSuppliers} total registered`}
        />
        <KPICard
          title="Contracts Expiring (90d)"
          value={metrics.contractsExpiringSoon}
          icon={FileText}
          type="warning"
          subtitle={`${metrics.activeContracts} total active contracts`}
        />
        <KPICard
          title="Avg On-Time Delivery"
          value={`${metrics.avgOnTimeDelivery}%`}
          icon={Activity}
          type={metrics.avgOnTimeDelivery > 90 ? 'success' : 'warning'}
          change="-2.4%"
          changeType="negative"
        />
        <KPICard
          title="Avg Defect Rate"
          value={`${metrics.avgDefectRate}%`}
          icon={Award}
          type={metrics.avgDefectRate < 2 ? 'success' : 'error'}
          change="+0.1%"
          changeType="negative"
        />
      </div>

      <div className="grid-3 mb-8">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h2 className="card-title">YTD Spend Trend (INR)</h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.spendTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Spend']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, fill: '#4F46E5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Attention Required</h2>
          </div>
          <div className="card-body p-0">
            <div className="flex flex-col h-full">
              {charts.attentionItems.map((item, index) => (
                <Link
                  to={`/suppliers/${item.supplierId}/overview`}
                  key={index}
                  className="flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0"
                >
                  <div className={`mt-0.5 ${item.severity === 'error' ? 'text-red-500' :
                      item.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{item.supplier}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.issue}</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 ml-auto self-center" />
                </Link>
              ))}
              <div className="p-4 mt-auto border-t border-gray-100">
                <Link to="/suppliers" className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center justify-center gap-1">
                  View All Suppliers <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Top Suppliers Performance Overview</h2>
        </div>
        <div className="card-body">
          <div className="chart-container lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.supplierPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="delivery" name="On-Time Delivery %" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="quality" name="Quality Acceptance %" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
