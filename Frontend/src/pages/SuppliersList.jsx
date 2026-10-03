import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../components/ui';
import { getSuppliers, getSupplierCategories } from '../services';

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [suppRes, catRes] = await Promise.all([
          getSuppliers({ search: searchTerm, status: statusFilter, category: categoryFilter }),
          getSupplierCategories()
        ]);
        
        if (suppRes.status === 'success') setSuppliers(suppRes.data);
        if (catRes.status === 'success') setCategories(catRes.data);
      } catch (error) {
        console.error("Failed to load suppliers:", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Debounce search slightly
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter]);

  return (
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage and monitor your supplier network</p>
        </div>
        <button className="btn btn-primary">Add Supplier</button>
      </div>

      <div className="card mb-6">
        <div className="card-body p-4">
          <div className="filter-bar mb-0">
            <div className="input-with-icon">
              <Search className="input-icon" size={18} />
              <input 
                type="text" 
                className="input" 
                placeholder="Search suppliers by name, category, or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <select 
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="under_review">Under Review</option>
              </select>

              <select 
                className="select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container py-20">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading suppliers...</div>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="empty-state card">
          <Search size={48} className="empty-state-icon" />
          <div className="empty-state-title">No suppliers found</div>
          <div className="empty-state-description">
            Try adjusting your search or filters to find what you're looking for.
          </div>
          <button 
            className="btn btn-secondary mt-4"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCategoryFilter('');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="supplier-card-grid">
          {suppliers.map(supplier => (
            <Link to={`/suppliers/${supplier.id}/overview`} key={supplier.id} className="supplier-card">
              <div className="supplier-card-header">
                <div>
                  <div className="supplier-card-name flex items-center gap-2">
                    {supplier.name}
                    {supplier.riskScore > 60 && (
                      <AlertTriangle size={16} className="text-amber-500" title="High Risk / Attention Required" />
                    )}
                  </div>
                  <div className="supplier-card-category">{supplier.category} • {supplier.location}</div>
                </div>
                <StatusBadge status={supplier.status} />
              </div>
              
              <div className="text-sm text-gray-500 mt-2 mb-4">
                Primary Contact: {supplier.contactPerson}
              </div>
              
              <div className="supplier-card-metrics">
                <div className="supplier-metric">
                  <span className="supplier-metric-label">Relationship</span>
                  <span className="supplier-metric-value">{supplier.relationshipYears} Years</span>
                </div>
                <div className="supplier-metric">
                  <span className="supplier-metric-label">Next Renewal</span>
                  <span className="supplier-metric-value">
                    {new Date(supplier.renewalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="supplier-metric">
                  <span className="supplier-metric-label">Risk Score</span>
                  <span className={`supplier-metric-value ${
                    supplier.riskScore > 70 ? 'bad' : supplier.riskScore > 40 ? 'warning' : 'good'
                  }`}>
                    {supplier.riskScore}/100
                  </span>
                </div>
                <div className="supplier-metric">
                  <span className="supplier-metric-label">Last Order</span>
                  <span className="supplier-metric-value">
                    {new Date(supplier.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
