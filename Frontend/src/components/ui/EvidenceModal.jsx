import { X, FileText, ExternalLink } from 'lucide-react';

export default function EvidenceModal({ isOpen, onClose, title = 'Evidence', evidence = [] }) {
  if (!isOpen) return null;

  return (
    <div className="evidence-modal-overlay" onClick={onClose}>
      <div className="evidence-modal" onClick={e => e.stopPropagation()}>
        <div className="evidence-modal-header">
          <h3>{title}</h3>
          <button className="evidence-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="evidence-modal-body">
          {evidence.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} className="empty-state-icon" />
              <div className="empty-state-title">No Evidence Available</div>
              <div className="empty-state-description">
                There is no supporting evidence provided for this insight.
              </div>
            </div>
          ) : (
            <div className="document-list">
              {evidence.map((item, index) => (
                <div key={index} className="evidence-item">
                  <div className="evidence-item-doc">
                    <FileText size={16} className="text-primary-500" />
                    <span>{item.documentName}</span>
                    <ExternalLink size={14} className="text-gray-400 ml-auto cursor-pointer hover:text-primary-600" />
                  </div>
                  <div className="evidence-item-meta">
                    <span>Page {item.page}</span>
                    <span>•</span>
                    <span>Section: {item.section}</span>
                  </div>
                  <div className="evidence-item-text">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
