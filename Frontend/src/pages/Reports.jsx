import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Download, Printer } from 'lucide-react';
import { generateReport } from '../services';

export default function Reports() {
  const { supplier } = useOutletContext();
  const [reportType, setReportType] = useState('performance');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-09-30');
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReport(null);
    try {
      const res = await generateReport(supplier.id, reportType, dateFrom, dateTo);
      if (res.status === 'success') {
        setReport(res.data);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="card sticky top-24">
          <div className="card-header">
            <h2 className="card-title">Generate Report</h2>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <div className="checkbox-group mt-2">
                <label className="checkbox-item">
                  <input type="radio" name="reportType" checked={reportType === 'performance'} onChange={() => setReportType('performance')} />
                  <span>Supplier Performance Report</span>
                </label>
                <label className="checkbox-item">
                  <input type="radio" name="reportType" checked={reportType === 'contract_summary'} onChange={() => setReportType('contract_summary')} />
                  <span>Contract Summary</span>
                </label>
                <label className="checkbox-item">
                  <input type="radio" name="reportType" checked={reportType === 'price_analysis'} onChange={() => setReportType('price_analysis')} />
                  <span>Price Analysis</span>
                </label>
                <label className="checkbox-item">
                  <input type="radio" name="reportType" checked={reportType === 'renewal_review'} onChange={() => setReportType('renewal_review')} />
                  <span>Renewal Review</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date" className="input text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <span className="text-gray-400">to</span>
                <input type="date" className="input text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            
            <button 
              className="btn btn-primary w-full mt-4" 
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        {loading ? (
          <div className="loading-container py-20 bg-white rounded-lg border border-gray-200">
            <div className="loading-spinner"></div>
            <div className="loading-text">Compiling data and generating report...</div>
          </div>
        ) : report ? (
          <div className="report-container mx-auto">
            <div className="report-header flex justify-between items-start">
              <div>
                <h1 className="report-title">{report.title}</h1>
                <div className="report-meta mt-2">
                  Generated on {new Date(report.generatedAt).toLocaleDateString()} | {supplier.name} | {dateFrom} to {dateTo}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm"><Printer size={16} /></button>
                <button className="btn btn-secondary btn-sm"><Download size={16} /> PDF</button>
              </div>
            </div>
            
            <div className="report-body">
              {report.sections.map((section, idx) => (
                <div key={idx} className="report-section">
                  <h3 className="report-section-title">{section.title}</h3>
                  <div className="report-section-content">
                    {section.type === 'text' && <p>{section.content}</p>}
                    
                    {section.type === 'list' && (
                      <ul>
                        {section.data.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    )}
                    
                    {section.type === 'kpi' && section.data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {Object.entries(section.data).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-3 rounded border border-gray-100">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="font-semibold mt-1">{value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state bg-white rounded-lg border border-gray-200 h-full min-h-[400px]">
            <FileText size={48} className="empty-state-icon" />
            <div className="empty-state-title">No Report Selected</div>
            <div className="empty-state-description">
              Select a report type and date range from the left panel to generate a professional supplier report.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
