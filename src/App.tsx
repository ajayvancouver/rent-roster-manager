
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SidebarLayout from "./components/layout/SidebarLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import TenantDetail from "./pages/TenantDetail";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Payments from "./pages/Payments";
import PaymentDetail from "./pages/PaymentDetail";
import Maintenance from "./pages/Maintenance";
import MaintenanceDetail from "./pages/MaintenanceDetail";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Root route - redirects based on auth status and user type */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Protected Manager Routes */}
            <Route element={<ProtectedRoute requiredUserType="manager" />}>
              <Route
                path="/dashboard"
                element={
                  <SidebarLayout>
                    <Dashboard />
                  </SidebarLayout>
                }
              />
              <Route
                path="/tenants"
                element={
                  <SidebarLayout>
                    <Tenants />
                  </SidebarLayout>
                }
              />
              <Route
                path="/tenants/:id"
                element={
                  <SidebarLayout>
                    <TenantDetail />
                  </SidebarLayout>
                }
              />
              <Route
                path="/properties"
                element={
                  <SidebarLayout>
                    <Properties />
                  </SidebarLayout>
                }
              />
              <Route
                path="/properties/:id"
                element={
                  <SidebarLayout>
                    <PropertyDetail />
                  </SidebarLayout>
                }
              />
              <Route
                path="/payments"
                element={
                  <SidebarLayout>
                    <Payments />
                  </SidebarLayout>
                }
              />
              <Route
                path="/payments/:id"
                element={
                  <SidebarLayout>
                    <PaymentDetail />
                  </SidebarLayout>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <SidebarLayout>
                    <Maintenance />
                  </SidebarLayout>
                }
              />
              <Route
                path="/maintenance/:id"
                element={
                  <SidebarLayout>
                    <MaintenanceDetail />
                  </SidebarLayout>
                }
              />
              <Route
                path="/documents"
                element={
                  <SidebarLayout>
                    <Documents />
                  </SidebarLayout>
                }
              />
              <Route
                path="/documents/:id"
                element={
                  <SidebarLayout>
                    <DocumentDetail />
                  </SidebarLayout>
                }
              />
            </Route>
            
            {/* Protected Tenant Routes */}
            <Route element={<ProtectedRoute requiredUserType="tenant" />}>
              <Route
                path="/tenant"
                element={<TenantDashboard />}
              />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Root redirect component
const RootRedirect = () => {
  const { user, userType, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (userType === "manager") {
    return <Navigate to="/dashboard" />;
  } else if (userType === "tenant") {
    return <Navigate to="/tenant" />;
  } else {
    return <Navigate to="/auth" />;
  }
};

export default App;
