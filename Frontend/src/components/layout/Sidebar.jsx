import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  ShoppingCart,
  Brain,
  ClipboardList,
  GitCompare,
  Upload,
  Layers,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/suppliers', icon: Users, label: 'Suppliers' },
  { to: '/comparison', icon: GitCompare, label: 'Supplier Comparison' },
  { to: '/documents', icon: Upload, label: 'Documents' },
];

export default function Sidebar() {
  const location = useLocation();

  // Check if we're on a supplier detail page
  const isSupplierDetail = location.pathname.startsWith('/suppliers/');

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Layers size={20} color="white" />
        </div>
        <div className="sidebar-brand-text">
          <h1>Supplier 360</h1>
          <span>Procurement Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Main</div>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isSupplierDetail && (
          <>
            <div className="sidebar-section">
              <div className="sidebar-section-label">Supplier 360</div>
            </div>
            <NavLink
              to={location.pathname.replace(/\/[^/]*$/, '/overview')}
              className={({ isActive }) =>
                `sidebar-link ${location.pathname.includes('/overview') || location.pathname.match(/\/suppliers\/[^/]+$/) ? 'active' : ''}`
              }
            >
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to={location.pathname.replace(/\/[^/]*$/, '/contract')}
              className={({ isActive }) =>
                `sidebar-link ${location.pathname.includes('/contract') ? 'active' : ''}`
              }
            >
              <FileText size={20} />
              <span>Contract</span>
            </NavLink>
            <NavLink
              to={location.pathname.replace(/\/[^/]*$/, '/performance')}
              className={({ isActive }) =>
                `sidebar-link ${location.pathname.includes('/performance') ? 'active' : ''}`
              }
            >
              <BarChart3 size={20} />
              <span>Performance</span>
            </NavLink>
            <NavLink
              to={location.pathname.replace(/\/[^/]*$/, '/purchases')}
              className={({ isActive }) =>
                `sidebar-link ${location.pathname.includes('/purchases') ? 'active' : ''}`
              }
            >
              <ShoppingCart size={20} />
              <span>Purchases</span>
            </NavLink>
            <NavLink
              to={location.pathname.replace(/\/[^/]*$/, '/analysis')}
              className={({ isActive }) =>
                `sidebar-link ${location.pathname.includes('/analysis') ? 'active' : ''}`
              }
            >
              <Brain size={20} />
              <span>AI Analysis</span>
            </NavLink>
            <NavLink
              to={location.pathname.replace(/\/[^/]*$/, '/reports')}
              className={({ isActive }) =>
                `sidebar-link ${location.pathname.includes('/reports') ? 'active' : ''}`
              }
            >
              <ClipboardList size={20} />
              <span>Reports</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
