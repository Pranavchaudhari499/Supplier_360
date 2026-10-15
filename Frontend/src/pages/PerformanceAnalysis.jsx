import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ComposedChart 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Clock, ShieldCheck, CheckCircle, 
  AlertTriangle, BarChart3, Award 
} from 'lucide-react';
import { KPICard } from '../components/ui';
import { getPerformanceBySupplier } from '../services';

export default function PerformanceAnalysis() {
  const { supplier } = useOutletContext();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getPerformanceBySupplier(supplier.id);
        if (res.status === 'success') {
          setPerformance(res.data);
        }
      } catch (error) {
        console.error("Failed to load performance data:", error);
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

  if (!performance) {
    return (
      <div className="empty-state card">
        <BarChart3 size={48} className="empty-state-icon" />
        <div className="empty-state-title">No Performance Data</div>
        <div className="empty-state-description">
          Performance metrics are not available for this supplier yet.
        </div>
      </div>
    );
  }

  const trendData = performance.monthlyTrend || performance.trends || [];
  const onTimeVal = performance.onTimeRate ?? performance.onTimeDelivery ?? 0;
  const defectVal = performance.defectRate ?? performance.returnRate ?? 0;
  const avgDelayVal = performance.averageDelayDays ?? 0;
  const totalOrdersVal = performance.totalOrders ?? 0;
  const lateDeliveriesVal = performance.lateDeliveries ?? 0;
  const qualityComplaintsVal = performance.qualityComplaints ?? 0;
  const totalUnitsVal = performance.totalUnitsReceived ?? 0;
  const returnsVal = performance.returns ?? 0;
  const leadTimeVal = performance.averageLeadTimeDays ?? 14;
  const fulfillmentVal = performance.fulfillmentRate ?? 98.5;
  const cancellationVal = performance.cancellationRate ?? 0.0;

  return (
    <div className="animate-fade-in">
      <div className="grid-2 mb-8">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Delivery Performance</h2>
            <div className={`trend-badge ${performance.deliveryTrend || 'stable'}`}>
              {performance.deliveryTrend === 'improving' ? 'Improving' : performance.deliveryTrend === 'declining' ? 'Declining' : 'Stable'}
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">On-Time Rate</div>
                <div className={`text-3xl font-bold mt-1 ${onTimeVal >= 90 ? 'text-success-600' : 'text-warning-600'}`}>
                  {onTimeVal}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Avg Delay</div>
                <div className="text-3xl font-bold mt-1 text-gray-800">
                  {avgDelayVal} <span className="text-base font-normal text-gray-500">days</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Total Orders</div>
                <div className="text-xl font-bold mt-1 text-gray-800">{totalOrdersVal}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Late Deliveries</div>
                <div className="text-xl font-bold mt-1 text-gray-800">{lateDeliveriesVal}</div>
              </div>
            </div>
            
            <div className="chart-container sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Line type="monotone" dataKey="onTimeRate" name="On-Time %" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quality Acceptance</h2>
            <div className={`trend-badge ${performance.qualityTrend || 'stable'}`}>
              {performance.qualityTrend === 'improving' ? 'Improving' : performance.qualityTrend === 'declining' ? 'Declining' : 'Stable'}
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Defect Rate</div>
                <div className={`text-3xl font-bold mt-1 ${defectVal < 2.0 ? 'text-success-600' : 'text-error-600'}`}>
                  {defectVal}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Quality Complaints</div>
                <div className="text-3xl font-bold mt-1 text-gray-800">
                  {qualityComplaintsVal}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Units Received</div>
                <div className="text-xl font-bold mt-1 text-gray-800">{totalUnitsVal.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Returns</div>
                <div className="text-xl font-bold mt-1 text-gray-800">{returnsVal}</div>
              </div>
            </div>
            
            <div className="chart-container sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Line type="monotone" dataKey="defectRate" name="Defect Rate %" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Reliability & Order Fulfillment</h2>
        </div>
        <div className="card-body">
          <div className="grid-3 mb-8">
            <KPICard 
              title="Average Lead Time" 
              value={`${leadTimeVal} days`}
              icon={Clock}
              type="info"
            />
            <KPICard 
              title="Order Fulfillment" 
              value={`${fulfillmentVal}%`}
              icon={CheckCircle}
              type="success"
            />
            <KPICard 
              title="Cancellation Rate" 
              value={`${cancellationVal}%`}
              icon={ShieldCheck}
              type={cancellationVal > 2 ? 'error' : 'primary'}
            />
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} orientation="left" />
                <YAxis yAxisId="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} orientation="right" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="ordersPlaced" name="Orders Placed" fill="#E0E7FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="avgLeadTime" name="Avg Lead Time (days)" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
