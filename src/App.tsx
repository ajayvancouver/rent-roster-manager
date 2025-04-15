
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

import SidebarLayout from "@/components/layout/SidebarLayout";
import TenantSidebarLayout from "@/components/layout/TenantSidebarLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Tenants from "@/pages/Tenants";
import TenantDetail from "@/pages/TenantDetail";
import TenantDetailView from "@/pages/TenantDetailView";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import PropertyDetailView from "@/pages/PropertyDetailView";
import Payments from "@/pages/Payments";
import PaymentDetail from "@/pages/PaymentDetail";
import Maintenance from "@/pages/Maintenance";
import MaintenanceDetail from "@/pages/MaintenanceDetail";
import Documents from "@/pages/Documents";
import DocumentDetail from "@/pages/DocumentDetail";
import Account from "@/pages/Account";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

import TenantDashboard from "@/pages/tenant/TenantDashboard";
import TenantProperty from "@/pages/tenant/TenantProperty";
import TenantPayments from "@/pages/tenant/TenantPayments";
import TenantMaintenance from "@/pages/tenant/TenantMaintenance";
import TenantDocuments from "@/pages/tenant/TenantDocuments";
import TenantAccount from "@/pages/tenant/TenantAccount";

import DatabaseTest from "./pages/DatabaseTest";

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route element={<ProtectedRoute allowedUserTypes={["manager"]} />}>
            <Route element={<SidebarLayout><Outlet /></SidebarLayout>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/tenants/:id" element={<TenantDetailView />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/:id" element={<PaymentDetail />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/account" element={<Account />} />
              <Route path="/database-test" element={<DatabaseTest />} />
            </Route>
          </Route>
          
          <Route element={<ProtectedRoute allowedUserTypes={["tenant"]} />}>
            <Route element={<TenantSidebarLayout><Outlet /></TenantSidebarLayout>}>
              <Route path="/tenant" element={<Navigate to="/tenant/dashboard" replace />} />
              <Route path="/tenant/dashboard" element={<TenantDashboard />} />
              <Route path="/tenant/property" element={<TenantProperty />} />
              <Route path="/tenant/payments" element={<TenantPayments />} />
              <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
              <Route path="/tenant/documents" element={<TenantDocuments />} />
              <Route path="/tenant/account" element={<TenantAccount />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </>
  );
}

export default App;
