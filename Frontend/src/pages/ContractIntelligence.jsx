import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FileText, Download, Clock, IndianRupee, Truck, ShieldCheck, AlertCircle, Upload } from 'lucide-react';
import { StatusBadge, EvidenceModal } from '../components/ui';
import { getContractBySupplier, getEvidence } from '../services';

export default function ContractIntelligence() {
  const { supplier } = useOutletContext();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Evidence modal state
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceData, setEvidenceData] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getContractBySupplier(supplier.id);
        if (res.status === 'success') {
          setContract(res.data);
        }
      } catch (error) {
        console.error("Failed to load contract:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [supplier.id]);

  const handleViewEvidence = async (field, title) => {
    setEvidenceTitle(`Evidence: ${title}`);
    setEvidenceModalOpen(true);
    setLoadingEvidence(true);
    setEvidenceData([]);
    
    try {
      const res = await getEvidence(supplier.id, field);
      if (res.status === 'success') {
        setEvidenceData(res.data);
      }
    } catch (error) {
      console.error("Failed to load evidence:", error);
    } finally {
      setLoadingEvidence(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="empty-state card">
        <FileText size={48} className="empty-state-icon" />
        <div className="empty-state-title">No Contract Found</div>
        <div className="empty-state-description">
          There are no active contracts found for {supplier.name} ({supplier.id}) in the system.
        </div>
        <Link to={`/documents?supplierId=${supplier.id}`} className="btn btn-primary mt-4 flex items-center gap-2">
          <Upload size={16} /> Upload Contract for {supplier.name}
        </Link>
      </div>
    );
  }

  const today = new Date();
  const expiry = new Date(contract.expiryDate);
  const diffTime = expiry - today;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="animate-fade-in">
      <EvidenceModal 
        isOpen={evidenceModalOpen} 
        onClose={() => setEvidenceModalOpen(false)}
        title={evidenceTitle}
        evidence={evidenceData}
      />

      <div className="card mb-8">
        <div className="card-header flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="card-title text-xl font-bold">Contract Overview</h2>
            <StatusBadge status={contract.status} />
          </div>
          <div className="flex items-center gap-3">
            {daysRemaining < 90 && (
              <div className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full flex items-center gap-2">
                <Clock size={14} /> Expiring in {daysRemaining} days
              </div>
            )}
            <Link to={`/documents?supplierId=${supplier.id}`} className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <Upload size={14} /> Upload New Version
            </Link>
          </div>
        </div>

        
        <div className="card-body">
          <div className="contract-detail-grid">
            <div className="contract-detail-item">
              <div className="contract-detail-label">Start Date</div>
              <div className="contract-detail-value">
                {new Date(contract.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            
            <div className="contract-detail-item">
              <div className="contract-detail-label">Expiry Date</div>
              <div className="contract-detail-value">
                {new Date(contract.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            
            <div className="contract-detail-item">
              <div className="contract-detail-label">Contract Price</div>
              <div className="contract-detail-value">
                <IndianRupee size={16} className="text-gray-400" />
                ₹{contract.unitPrice} / unit
                <button 
                  className="evidence-trigger"
                  onClick={() => handleViewEvidence('unitPrice', 'Contract Price')}
                >
                  View Evidence
                </button>
              </div>
            </div>
            
            <div className="contract-detail-item">
              <div className="contract-detail-label">Payment Terms</div>
              <div className="contract-detail-value">
                {contract.paymentTerms}
                <button 
                  className="evidence-trigger"
                  onClick={() => handleViewEvidence('paymentTerms', 'Payment Terms')}
                >
                  View Evidence
                </button>
              </div>
            </div>
            
            <div className="contract-detail-item">
              <div className="contract-detail-label">Lead Time</div>
              <div className="contract-detail-value">
                <Truck size={16} className="text-gray-400" />
                {contract.leadTimeDays} days
                <button 
                  className="evidence-trigger"
                  onClick={() => handleViewEvidence('leadTime', 'Lead Time Commitment')}
                >
                  View Evidence
                </button>
              </div>
            </div>
            
            <div className="contract-detail-item">
              <div className="contract-detail-label">Min. Order Quantity</div>
              <div className="contract-detail-value">
                {contract.minimumOrderQuantity} units
                <button 
                  className="evidence-trigger"
                  onClick={() => handleViewEvidence('moq', 'Minimum Order Quantity')}
                >
                  View Evidence
                </button>
              </div>
            </div>
            
            <div className="contract-detail-item">
              <div className="contract-detail-label">Warranty</div>
              <div className="contract-detail-value">
                <ShieldCheck size={16} className="text-gray-400" />
                {contract.warrantyMonths}
                <button 
                  className="evidence-trigger"
                  onClick={() => handleViewEvidence('warranty', 'Warranty Terms')}
                >
                  View Evidence
                </button>
              </div>
            </div>
            
            <div className="contract-detail-item">
              <div className="contract-detail-label">Penalty for Delay</div>
              <div className="contract-detail-value">
                <AlertCircle size={16} className="text-gray-400" />
                {contract.penaltyForDelay}
                <button 
                  className="evidence-trigger"
                  onClick={() => handleViewEvidence('penalty', 'Penalty Clause')}
                >
                  View Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Source Documents</h2>
        </div>
        <div className="card-body">
          <div className="document-list">
            {contract.documents && contract.documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-item-left">
                  <div className="document-item-icon">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="document-item-name">{doc.name}</div>
                    <div className="document-item-meta">
                      Type: <span className="capitalize">{doc.type.replace('_', ' ')}</span> • Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div>
                  <button className="btn btn-secondary btn-sm">
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
