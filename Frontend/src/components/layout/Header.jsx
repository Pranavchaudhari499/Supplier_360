import { Link, useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', to: '/' }];

    if (parts[0] === 'suppliers') {
      crumbs.push({ label: 'Suppliers', to: '/suppliers' });
      if (parts[1]) {
        crumbs.push({ label: parts[1], to: `/suppliers/${parts[1]}` });
        if (parts[2]) {
          const label = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
          crumbs.push({ label, to: location.pathname });
        }
      }
    } else if (parts[0] === 'comparison') {
      crumbs.push({ label: 'Supplier Comparison', to: '/comparison' });
    } else if (parts[0] === 'documents') {
      crumbs.push({ label: 'Documents', to: '/documents' });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="header">
      <div className="header-left">
        <nav className="header-breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.to}>
              {i > 0 && <span className="separator">/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span className="current"> {crumb.label}</span>
              ) : (
                <Link to={crumb.to}> {crumb.label}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="header-right">
        <button className="header-action" title="Search">
          <Search size={18} />
        </button>
        <button className="header-action" title="Notifications">
          <Bell size={18} />
          <span className="badge"></span>
        </button>
        <div className="header-user">
          <div className="header-user-avatar">PM</div>
          <div className="header-user-info">
            <span className="header-user-name">Pranav M.</span>
            <span className="header-user-role">Procurement Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
