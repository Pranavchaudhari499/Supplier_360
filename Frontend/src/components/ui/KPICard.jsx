import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, type = 'primary', change, changeType, subtitle }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${type}`}>
        <Icon size={24} />
      </div>
      <div className="kpi-content">
        <div className="kpi-label">{title}</div>
        <div className="kpi-value">{value}</div>
        
        {change && (
          <div className={`kpi-change ${changeType}`}>
            {changeType === 'positive' && <TrendingUp size={12} />}
            {changeType === 'negative' && <TrendingDown size={12} />}
            {changeType === 'neutral' && <Minus size={12} />}
            <span>{change}</span>
          </div>
        )}
        
        {subtitle && !change && (
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
