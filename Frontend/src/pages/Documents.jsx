import { Upload, FileText } from 'lucide-react';

export default function Documents() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Document Intelligence</h1>
        <p className="page-subtitle">Upload and manage contracts, agreements, and procurement documents</p>
      </div>

      <div className="card mb-8">
        <div className="card-body">
          <div className="upload-area">
            <Upload size={48} className="upload-area-icon mx-auto" />
            <div className="upload-area-text font-medium mt-4">Click to upload or drag and drop</div>
            <div className="upload-area-hint">PDF, DOCX, XLSX (Max 10MB)</div>
          </div>
          <div className="mt-4 text-sm text-gray-500 bg-blue-50 p-4 rounded-md border border-blue-100 flex gap-3">
            <FileText className="text-blue-500 flex-shrink-0" size={20} />
            <p><strong>Note:</strong> Uploaded documents will be automatically processed by the document intelligence pipeline (Parsed → Chunked → Embedded) and made available for AI Analysis and RAG retrieval across the application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
