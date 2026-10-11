import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, AlertTriangle, Plus, X, CheckCircle, FileText, Upload } from 'lucide-react';
import { StatusBadge } from '../components/ui';
import { getSuppliers, getSupplierCategories, createSupplier } from '../services';

export default function SuppliersList() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add Supplier Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdSupplier, setCreatedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Raw Materials',
    location: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    status: 'active',
    relationshipYears: 1,
    riskScore: 25,
  });

  const loadData = async () => {
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
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      category: categories[0] || 'Raw Materials',
      location: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      status: 'active',
      relationshipYears: 1,
      riskScore: 25,
    });
    setCreatedSupplier(null);
    setSubmitError('');
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setCreatedSupplier(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSupplierSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setSubmitError('Supplier Name is required.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        location: formData.location.trim() || 'Domestic',
        contact_person: formData.contactPerson.trim() || 'Procurement Contact',
        contact_email: formData.contactEmail.trim() || 'contact@supplier.com',
        contact_phone: formData.contactPhone.trim() || '+91 90000 00000',
        status: formData.status,
        relationship_years: Number(formData.relationshipYears) || 1,
        risk_score: Number(formData.riskScore) || 25,
      };

      const res = await createSupplier(payload);
      if (res && res.status === 'success' && res.data) {
        setCreatedSupplier(res.data);
        loadData();
      } else {
        setSubmitError(res?.message || 'Failed to create supplier.');
      }
    } catch (err) {
      setSubmitError(err.message || 'Error occurred while creating supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage and monitor your supplier network</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} /> Add Supplier
        </button>
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

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="evidence-modal-overlay" onClick={handleCloseAddModal}>
          <div className="evidence-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="evidence-modal-header">
              <div className="flex items-center gap-2">
                <Plus size={20} className="text-primary-600" />
                <h3 className="font-bold text-gray-900 text-lg">
                  {createdSupplier ? 'Supplier Added Successfully!' : 'Add New Supplier Partner'}
                </h3>
              </div>
              <button className="evidence-modal-close" onClick={handleCloseAddModal}>
                <X size={18} />
              </button>
            </div>

            <div className="evidence-modal-body p-6">
              {createdSupplier ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={36} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {createdSupplier.name} ({createdSupplier.id})
                  </h4>
                  <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                    Supplier successfully registered in PostgreSQL database. You can now upload and index their specific contract document to run LLM contract intelligence and RAG queries!
                  </p>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left mb-6 max-w-md mx-auto space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Supplier ID:</span>
                      <span className="font-semibold text-gray-800">{createdSupplier.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-semibold text-gray-800">{createdSupplier.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-semibold text-gray-800">{createdSupplier.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Primary Contact:</span>
                      <span className="font-semibold text-gray-800">{createdSupplier.contactPerson}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      className="btn btn-primary flex items-center justify-center gap-2 px-5 py-2.5 shadow-md"
                      onClick={() => navigate(`/documents?supplierId=${createdSupplier.id}`)}
                    >
                      <Upload size={18} /> Upload Contract for this Supplier →
                    </button>
                    <button
                      className="btn btn-secondary flex items-center justify-center gap-2 px-5 py-2.5"
                      onClick={() => navigate(`/suppliers/${createdSupplier.id}/overview`)}
                    >
                      <FileText size={18} /> View Supplier 360
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddSupplierSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                      <AlertTriangle size={16} /> {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Supplier / Company Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="input w-full"
                        placeholder="e.g. Tata Advanced Systems, Precision Machining Corp"
                        value={formData.name}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        className="select w-full"
                        value={formData.category}
                        onChange={handleFormChange}
                      >
                        <option value="Raw Materials">Raw Materials</option>
                        <option value="Electronics & Semiconductors">Electronics & Semiconductors</option>
                        <option value="Precision Machining">Precision Machining</option>
                        <option value="Hydraulics & Fluid Power">Hydraulics & Fluid Power</option>
                        <option value="Packaging & Logistics">Packaging & Logistics</option>
                        <option value="Fasteners & Hardware">Fasteners & Hardware</option>
                        <option value="Other / General">Other / General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Location / Country
                      </label>
                      <input
                        type="text"
                        name="location"
                        className="input w-full"
                        placeholder="e.g. Pune, India / Berlin, Germany"
                        value={formData.location}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        className="input w-full"
                        placeholder="e.g. Vikram Sharma"
                        value={formData.contactPerson}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        className="input w-full"
                        placeholder="e.g. vikram@supplier.com"
                        value={formData.contactEmail}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        className="input w-full"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.contactPhone}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Initial Relationship Status
                      </label>
                      <select
                        name="status"
                        className="select w-full"
                        value={formData.status}
                        onChange={handleFormChange}
                      >
                        <option value="active">Active</option>
                        <option value="under_review">Under Review</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseAddModal}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || !formData.name.trim()}
                    >
                      {isSubmitting ? 'Creating Supplier...' : 'Create Supplier Partner'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

