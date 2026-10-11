import { useState, useEffect } from 'react';
import { getSuppliers } from '../services';
import { StatusBadge } from '../components/ui';

export default function SupplierComparison() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getSuppliers();
        if (res.status === 'success') {
          // just taking the first 4 for comparison mock
          setSuppliers(res.data.slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="loading-container py-20"><div className="loading-spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Supplier Comparison</h1>
        <p className="page-subtitle">Compare performance, pricing, and contract terms side-by-side</p>
      </div>

      <div className="overflow-x-auto">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature / Metric</th>
              {suppliers.map(s => <th key={s.id}>{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium text-gray-700">Category</td>
              {suppliers.map(s => <td key={s.id}>{s.category}</td>)}
            </tr>
            <tr>
              <td className="font-medium text-gray-700">Status</td>
              {suppliers.map(s => <td key={s.id}><StatusBadge status={s.status} /></td>)}
            </tr>
            <tr>
              <td className="font-medium text-gray-700">Relationship</td>
              {suppliers.map(s => <td key={s.id}>{s.relationshipYears} Years</td>)}
            </tr>
            <tr>
              <td className="font-medium text-gray-700">Risk Score</td>
              {suppliers.map(s => (
                <td key={s.id} className={s.riskScore < 30 ? 'best' : s.riskScore > 60 ? 'worst' : ''}>
                  {s.riskScore}/100
                </td>
              ))}
            </tr>
            <tr>
              <td className="font-medium text-gray-700">Next Renewal</td>
              {suppliers.map(s => <td key={s.id}>{new Date(s.renewalDate).toLocaleDateString()}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
