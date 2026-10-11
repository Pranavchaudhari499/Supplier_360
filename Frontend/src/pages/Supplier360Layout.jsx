import { useState, useEffect } from 'react';
import { Outlet, useParams, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, ShoppingCart, Brain, ClipboardList } from 'lucide-react';
import { StatusBadge } from '../components/ui';
import { getSupplierById } from '../services';

export default function Supplier360Layout() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupplier() {
      setLoading(true);
      try {
        const res = await getSupplierById(id);
        if (res.status === 'success') {
          setSupplier(res.data);
        }
      } catch (error) {
        console.error("Failed to load supplier:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      loadSupplier();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container py-20">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Supplier 360...</div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="error-state">
        <h2>Supplier not found</h2>
        <p>The supplier you are looking for does not exist or you don't have access.</p>
      </div>
    );
  }

  const tabs = [
    { to: 'overview', label: 'Overview', icon: LayoutDashboard },
    { to: 'contract', label: 'Contract', icon: FileText },
    { to: 'performance', label: 'Performance', icon: BarChart3 },
    { to: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { to: 'analysis', label: 'AI Analysis', icon: Brain },
    { to: 'reports', label: 'Reports', icon: ClipboardList },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
              <StatusBadge status={supplier.status} />
            </div>
            <p className="text-gray-500 text-lg">{supplier.category} • {supplier.location}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Supplier ID</div>
            <div className="font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded-md">{supplier.id}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            <tab.icon />
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Outlet renders the sub-pages based on the route */}
      <Outlet context={{ supplier }} />
    </div>
  );
}
