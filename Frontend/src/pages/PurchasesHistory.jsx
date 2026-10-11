import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Search, Filter, IndianRupee } from 'lucide-react';
import { StatusBadge } from '../components/ui';
import { getPurchasesBySupplier, getPurchaseSummaryBySupplier } from '../services';

export default function PurchasesHistory() {
  const { supplier } = useOutletContext();
  const [purchases, setPurchases] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [purchRes, summRes] = await Promise.all([
          getPurchasesBySupplier(supplier.id),
          getPurchaseSummaryBySupplier(supplier.id)
        ]);
        
        if (purchRes.status === 'success') setPurchases(purchRes.data);
        if (summRes.status === 'success') setSummaries(summRes.data);
      } catch (error) {
        console.error("Failed to load purchases:", error);
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

  return (
    <div className="animate-fade-in">
      {summaries.length > 0 && (
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">Product Pricing Trends</h2>
          </div>
          <div className="card-body">
            <div className="grid-3 mb-6">
              {summaries.map(summary => {
                const priceDiff = summary.lastPrice - summary.averagePrice;
                const percentChange = ((priceDiff / summary.averagePrice) * 100).toFixed(1);
                const isIncrease = priceDiff > 0;
                
                return (
                  <div key={summary.product} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="font-semibold text-gray-800 mb-1">{summary.product}</div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Last Price</div>
                        <div className="text-xl font-bold">₹{summary.lastPrice}</div>
                      </div>
                      <div className={`text-sm font-medium ${isIncrease ? 'text-error-600' : 'text-success-600'}`}>
                        {isIncrease ? '↑' : '↓'} {Math.abs(percentChange)}% vs avg
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDuplicatedCategory={false} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend iconType="circle" />
                  
                  {summaries.map((summary, index) => {
                    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
                    return (
                      <Line 
                        key={summary.product}
                        data={summary.priceTrend} 
                        type="monotone" 
                        dataKey="price" 
                        name={summary.product}
                        stroke={colors[index % colors.length]} 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        activeDot={{ r: 5 }} 
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Purchase History</h2>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filter</button>
            <button className="btn btn-secondary btn-sm">Export CSV</button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Order Date</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td className="font-medium text-gray-800">{purchase.id}</td>
                    <td>{new Date(purchase.orderDate).toLocaleDateString('en-GB')}</td>
                    <td>{purchase.product}</td>
                    <td>{purchase.quantity.toLocaleString()}</td>
                    <td>₹{purchase.unitPrice.toLocaleString()}</td>
                    <td className="font-medium text-gray-800">₹{purchase.totalAmount.toLocaleString()}</td>
                    <td><StatusBadge status={purchase.status} /></td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">No purchase history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
