import { useState, useRef, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  FileText, BarChart3, IndianRupee, RefreshCw, MessageSquare, 
  Send, CheckCircle, AlertTriangle, Info, Bot, Upload, Sparkles
} from 'lucide-react';
import { EvidenceModal } from '../components/ui';
import { runAnalysis, sendAssistantMessage, getContractBySupplier } from '../services';

export default function AIAnalysis() {
  const { supplier } = useOutletContext();
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeContract, setActiveContract] = useState(null);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hello! I'm your AI Procurement Assistant. How can I help you analyze ${supplier.name}?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Evidence Modal State
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceData, setEvidenceData] = useState([]);
  const [evidenceTitle, setEvidenceTitle] = useState('');

  useEffect(() => {
    async function checkContract() {
      try {
        const res = await getContractBySupplier(supplier.id);
        if (res.status === 'success' && res.data) {
          setActiveContract(res.data);
        } else {
          setActiveContract(null);
        }
      } catch (err) {
        setActiveContract(null);
      }
    }
    checkContract();
  }, [supplier.id]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [messages, chatOpen, isTyping]);

  const handleRunAnalysis = async (type) => {
    setActiveAnalysis(type);
    setLoading(true);
    setAnalysisResult(null);
    
    try {
      const res = await runAnalysis(supplier.id, type);
      if (res.status === 'success') {
        setAnalysisResult(res.data);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString()
    }]);
    
    setIsTyping(true);
    
    try {
      const res = await sendAssistantMessage(supplier.id, userMsg);
      if (res.status === 'success') {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const openEvidence = (evidence, title = 'Supporting Evidence') => {
    if (!evidence || evidence.length === 0) return;
    setEvidenceTitle(title);
    setEvidenceData(evidence);
    setEvidenceModalOpen(true);
  };

  const renderFindingIcon = (severity) => {
    switch (severity) {
      case 'success': return <CheckCircle size={18} className="finding-icon success" />;
      case 'warning': return <AlertTriangle size={18} className="finding-icon warning" />;
      case 'error': return <AlertTriangle size={18} className="finding-icon error" />;
      default: return <Info size={18} className="finding-icon info" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <EvidenceModal 
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        title={evidenceTitle}
        evidence={evidenceData}
      />

      {/* Grounding Info Bar */}
      <div className="card mb-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-purple-50/70 border border-blue-200">
        <div className="card-body p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot size={22} />
            </div>
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <span>Agentic AI Grounding: {supplier.name}</span>
                <span className="badge badge-info">{supplier.id}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                <span>Contract Source:</span>
                {activeContract ? (
                  <span className="font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle size={12} /> {activeContract.contractTitle || activeContract.documents?.[0]?.name || 'Active Contract Document'}
                  </span>
                ) : (
                  <span className="font-medium text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <AlertTriangle size={12} /> No Contract Uploaded Yet (Using baseline profile)
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link
            to={`/documents?supplierId=${supplier.id}`}
            className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
          >
            <Upload size={14} /> {activeContract ? 'Upload New Contract Version' : 'Upload Contract for this Supplier'}
          </Link>
        </div>
      </div>

      {!activeAnalysis && !chatOpen ? (
        <div className="action-card-grid">
          <div className="action-card" onClick={() => handleRunAnalysis('contract_analysis')}>
            <div className="action-card-icon blue"><FileText size={28} /></div>
            <h3 className="action-card-title">Analyze Contract</h3>
            <p className="action-card-description">Review contract terms, obligations, and identify potential risks or missing clauses.</p>
          </div>
          
          <div className="action-card" onClick={() => handleRunAnalysis('performance_review')}>
            <div className="action-card-icon green"><BarChart3 size={28} /></div>
            <h3 className="action-card-title">Review Performance</h3>
            <p className="action-card-description">Analyze delivery trends, quality metrics, and operational reliability over time.</p>
          </div>
          
          <div className="action-card" onClick={() => handleRunAnalysis('pricing_analysis')}>
            <div className="action-card-icon orange"><IndianRupee size={28} /></div>
            <h3 className="action-card-title">Analyze Pricing</h3>
            <p className="action-card-description">Compare current pricing against historical data, market rates, and identify trends.</p>
          </div>
          
          <div className="action-card" onClick={() => handleRunAnalysis('renewal_review')}>
            <div className="action-card-icon purple"><RefreshCw size={28} /></div>
            <h3 className="action-card-title">Renewal Review</h3>
            <p className="action-card-description">Comprehensive synthesis of contract, performance, and pricing for upcoming renewals.</p>
          </div>
          
          <div className="action-card" onClick={() => setChatOpen(true)}>
            <div className="action-card-icon teal"><MessageSquare size={28} /></div>
            <h3 className="action-card-title">Ask Supplier Assistant</h3>
            <p className="action-card-description">Chat with our AI assistant to get specific answers about this supplier.</p>
          </div>
        </div>
      ) : activeAnalysis ? (
        <div className="card">
          <div className="card-header bg-gray-50 flex items-center justify-between">
            <h2 className="card-title text-xl font-bold capitalize">
              {activeAnalysis.replace('_', ' ')}
            </h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveAnalysis(null)}>
              Back to Actions
            </button>
          </div>
          
          <div className="card-body">
            {loading ? (
              <div className="loading-container py-20">
                <div className="loading-spinner"></div>
                <div className="loading-text">Agents are investigating...</div>
              </div>
            ) : analysisResult ? (
              <div className="animate-fade-in">
                <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <div className="flex gap-4">
                    <Bot size={24} className="text-primary-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                      <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {analysisResult.contractFindings?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contract Findings</h3>
                      <div className="flex flex-col gap-1">
                        {analysisResult.contractFindings.map((finding, idx) => (
                          <div key={idx} className="finding-item">
                            {renderFindingIcon(finding.severity)}
                            <div className="finding-content">
                              <div className="finding-message">{finding.message}</div>
                              {finding.evidence && (
                                <div className="finding-actions">
                                  <button 
                                    className="evidence-trigger"
                                    onClick={() => openEvidence(finding.evidence, 'Contract Evidence')}
                                  >
                                    View Evidence
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResult.performanceFindings?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Performance Findings</h3>
                      <div className="flex flex-col gap-1">
                        {analysisResult.performanceFindings.map((finding, idx) => (
                          <div key={idx} className="finding-item">
                            {renderFindingIcon(finding.severity)}
                            <div className="finding-content">
                              <div className="finding-message">{finding.message}</div>
                              {finding.evidence && (
                                <div className="finding-actions">
                                  <button 
                                    className="evidence-trigger"
                                    onClick={() => openEvidence(finding.evidence, 'Performance Evidence')}
                                  >
                                    View Evidence
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResult.pricingFindings?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Pricing Findings</h3>
                      <div className="flex flex-col gap-1">
                        {analysisResult.pricingFindings.map((finding, idx) => (
                          <div key={idx} className="finding-item">
                            {renderFindingIcon(finding.severity)}
                            <div className="finding-content">
                              <div className="finding-message">{finding.message}</div>
                              {finding.evidence && (
                                <div className="finding-actions">
                                  <button 
                                    className="evidence-trigger"
                                    onClick={() => openEvidence(finding.evidence, 'Pricing Evidence')}
                                  >
                                    View Evidence
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResult.discussionPoints?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Suggested Discussion Points</h3>
                      <ul className="list-disc pl-5 text-gray-700 space-y-2">
                        {analysisResult.discussionPoints.map((point, idx) => (
                          <li key={idx} className="pl-1">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {analysisResult.evidence?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => openEvidence(analysisResult.evidence, 'All Supporting Evidence')}
                    >
                      <FileText size={18} /> View All Associated Evidence
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-primary-600" />
              <h2 className="font-semibold text-gray-800">Supplier Assistant</h2>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setChatOpen(false)}>
              Close
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="chat-message-avatar">
                  {msg.role === 'assistant' ? <Bot size={16} /> : 'ME'}
                </div>
                <div>
                  <div className="chat-message-content" style={{ whiteSpace: 'pre-line' }}>
                    {msg.content}
                  </div>
                  
                  {msg.role === 'assistant' && (msg.keyFindings?.length > 0 || msg.evidence?.length > 0) && (
                    <div className="chat-message-findings mt-3 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      {msg.keyFindings?.length > 0 && (
                        <div className="mb-3">
                          <h4>Key Findings</h4>
                          <ul>
                            {msg.keyFindings.map((kf, i) => <li key={i}>{kf}</li>)}
                          </ul>
                        </div>
                      )}
                      
                      {msg.suggestedActions?.length > 0 && (
                        <div className="mb-3">
                          <h4>Suggested Actions</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.suggestedActions.map((action, i) => (
                              <button key={i} className="btn btn-secondary btn-sm bg-gray-50">{action}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {msg.evidence?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button 
                            className="evidence-trigger"
                            onClick={() => openEvidence(msg.evidence, 'Supporting Evidence')}
                          >
                            View Evidence Sources
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="chat-message-avatar"><Bot size={16} /></div>
                <div className="chat-message-content bg-gray-100 flex items-center gap-1 h-10">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="input" 
              placeholder="Ask a question about this supplier..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isTyping || !inputMessage.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
