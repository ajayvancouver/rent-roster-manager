
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthProvider";

import SidebarLayout from "@/components/layout/SidebarLayout";
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

// Tenant pages
import TenantDashboard from "@/pages/tenant/TenantDashboard";
import TenantProperty from "@/pages/tenant/TenantProperty";
import TenantPayments from "@/pages/tenant/TenantPayments";
import TenantMaintenance from "@/pages/tenant/TenantMaintenance";
import TenantDocuments from "@/pages/tenant/TenantDocuments";
import TenantAccount from "@/pages/tenant/TenantAccount";

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Index />} />
          
          {/* Property Manager Routes */}
          <Route element={<ProtectedRoute allowedUserTypes={["manager"]} />}>
            <Route element={<SidebarLayout><Outlet /></SidebarLayout>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/tenants/:id" element={<TenantDetailView />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetailView />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/:id" element={<PaymentDetail />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Route>
          
          {/* Tenant Routes */}
          <Route element={<ProtectedRoute allowedUserTypes={["tenant"]} />}>
            <Route element={<SidebarLayout><Outlet /></SidebarLayout>}>
              <Route path="/tenant" element={<TenantDashboard />} />
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
