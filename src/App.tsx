
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/layout/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import Properties from "./pages/Properties";
import Payments from "./pages/Payments";
import Maintenance from "./pages/Maintenance";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
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
            path="/properties"
            element={
              <SidebarLayout>
                <Properties />
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
            path="/maintenance"
            element={
              <SidebarLayout>
                <Maintenance />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
