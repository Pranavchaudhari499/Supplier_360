import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from './components/layout/AppLayout';
import Supplier360Layout from './pages/Supplier360Layout';

// Main Pages
import Dashboard from './pages/Dashboard';
import SuppliersList from './pages/SuppliersList';
import SupplierComparison from './pages/SupplierComparison';
import Documents from './pages/Documents';

// Supplier 360 Sub-pages
import SupplierOverview from './pages/SupplierOverview';
import ContractIntelligence from './pages/ContractIntelligence';
import PerformanceAnalysis from './pages/PerformanceAnalysis';
import PurchasesHistory from './pages/PurchasesHistory';
import AIAnalysis from './pages/AIAnalysis';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="suppliers" element={<SuppliersList />} />
          <Route path="comparison" element={<SupplierComparison />} />
          <Route path="documents" element={<Documents />} />
          
          <Route path="suppliers/:id" element={<Supplier360Layout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<SupplierOverview />} />
            <Route path="contract" element={<ContractIntelligence />} />
            <Route path="performance" element={<PerformanceAnalysis />} />
            <Route path="purchases" element={<PurchasesHistory />} />
            <Route path="analysis" element={<AIAnalysis />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
