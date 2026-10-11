import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

export default function AttentionAlert({ type = 'warning', title, children }) {
  const Icon = {
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
    success: CheckCircle
  }[type];

  return (
    <div className={`attention-alert ${type}`}>
      <div className="attention-alert-icon">
        <Icon size={20} />
      </div>
      <div>
        {title && <div className="attention-alert-title">{title}</div>}
        <div className="attention-alert-body">
          {children}
        </div>
      </div>
    </div>
  );
}
