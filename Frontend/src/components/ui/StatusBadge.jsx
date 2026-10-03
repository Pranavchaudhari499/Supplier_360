export default function StatusBadge({ status }) {
  const normalizedStatus = (status || '').toLowerCase().replace(/\s+/g, '_');
  
  const label = {
    active: 'Active',
    inactive: 'Inactive',
    under_review: 'Under Review',
    suspended: 'Suspended',
    expired: 'Expired',
    pending_renewal: 'Pending Renewal',
    draft: 'Draft',
    delivered: 'Delivered',
    in_transit: 'In Transit',
    pending: 'Pending',
    cancelled: 'Cancelled'
  }[normalizedStatus] || status;

  return (
    <span className={`status-badge ${normalizedStatus}`}>
      {label}
    </span>
  );
}
